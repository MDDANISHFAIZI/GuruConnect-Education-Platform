import os
import json
import logging
import numpy as np
from typing import List, Dict, Any, Optional
from app.config import settings
from app.rag.embeddings import get_embedding_model
from app.rag.splitter import TextChunk

logger = logging.getLogger("guruai.vectorstore")

class FAISSVectorStoreManager:
    def __init__(self, index_dir: str = settings.FAISS_INDEX_DIR):
        self.index_dir = index_dir
        self.index_file = os.path.join(index_dir, "faiss_index.bin")
        self.metadata_file = os.path.join(index_dir, "metadata.json")
        self.embedding_model = get_embedding_model()
        self.dimension = self.embedding_model.dimension
        self.index = None
        self.chunks: List[Dict[str, Any]] = []  # [{text: str, metadata: dict}]
        self._load_or_init_index()

    def _load_or_init_index(self):
        try:
            import faiss
            if os.path.exists(self.index_file) and os.path.exists(self.metadata_file):
                logger.info(f"Loading persistent FAISS index from {self.index_file}...")
                self.index = faiss.read_index(self.index_file)
                with open(self.metadata_file, "r", encoding="utf-8") as f:
                    self.chunks = json.load(f)
                logger.info(f"Loaded {len(self.chunks)} vector chunks into FAISS index.")
            else:
                logger.info(f"Initializing new FAISS IndexFlatIP (dim={self.dimension})...")
                self.index = faiss.IndexFlatIP(self.dimension)
                self.chunks = []
        except Exception as e:
            logger.error(f"Error loading FAISS ({e}). Creating in-memory index fallback.")
            try:
                import faiss
                self.index = faiss.IndexFlatIP(self.dimension)
            except Exception:
                self.index = None
            self.chunks = []

    def save(self):
        try:
            import faiss
            os.makedirs(self.index_dir, exist_ok=True)
            if self.index is not None:
                faiss.write_index(self.index, self.index_file)
            with open(self.metadata_file, "w", encoding="utf-8") as f:
                json.dump(self.chunks, f, ensure_ascii=False, indent=2)
            logger.info(f"Successfully saved {len(self.chunks)} chunks to FAISS disk storage.")
        except Exception as e:
            logger.error(f"Failed to save FAISS index: {e}")

    def add_chunks(self, new_chunks: List[TextChunk]):
        if not new_chunks:
            return

        texts = [c.text for c in new_chunks]
        embeddings = self.embedding_model.embed_documents(texts)
        emb_np = np.array(embeddings, dtype=np.float32)

        # Normalize for Inner Product (Cosine Similarity)
        faiss_norms = np.linalg.norm(emb_np, axis=1, keepdims=True)
        faiss_norms[faiss_norms == 0] = 1.0
        emb_np = emb_np / faiss_norms

        if self.index is not None:
            self.index.add(emb_np)

        for chunk in new_chunks:
            self.chunks.append({
                "text": chunk.text,
                "metadata": chunk.metadata
            })

        self.save()

    def delete_material(self, material_id: str):
        """Removes all chunks associated with a deleted material and rebuilds FAISS index."""
        retained = [c for c in self.chunks if str(c.get("metadata", {}).get("materialId")) != str(material_id)]
        if len(retained) == len(self.chunks):
            return

        logger.info(f"Rebuilding FAISS index after removing material {material_id}...")
        self.chunks = []
        try:
            import faiss
            self.index = faiss.IndexFlatIP(self.dimension)
        except Exception:
            self.index = None

        if retained:
            text_chunks = [TextChunk(text=c["text"], metadata=c["metadata"]) for c in retained]
            self.add_chunks(text_chunks)
        else:
            self.save()

    def search(
        self,
        query: str,
        top_k: int = settings.TOP_K,
        authorized_teacher_ids: Optional[List[str]] = None,
        authorized_classes: Optional[List[str]] = None,
        material_id: Optional[str] = None,
        threshold: float = settings.SIMILARITY_THRESHOLD
    ) -> List[Dict[str, Any]]:
        """
        Metadata-filtered similarity search.
        Strictly enforces RBAC so students only retrieve content from their teachers & classes.
        """
        if not self.chunks or self.index is None or self.index.ntotal == 0:
            return []

        query_emb = self.embedding_model.embed_query(query)
        q_np = np.array([query_emb], dtype=np.float32)
        q_norm = np.linalg.norm(q_np)
        if q_norm > 0:
            q_np = q_np / q_norm

        # Search top candidate vectors (overfetch to filter metadata)
        fetch_k = min(self.index.ntotal, max(top_k * 5, 20))
        scores, indices = self.index.search(q_np, fetch_k)

        results = []
        teacher_id_set = set(str(t) for t in (authorized_teacher_ids or []))
        class_set = set(str(c).lower().strip() for c in (authorized_classes or []))

        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue

            chunk_obj = self.chunks[idx]
            meta = chunk_obj.get("metadata", {})
            chunk_teacher = str(meta.get("teacherId", ""))
            chunk_class = str(meta.get("class", "")).lower().strip()
            chunk_mat_id = str(meta.get("materialId", ""))

            # Filter by specific materialId if requested
            if material_id and chunk_mat_id != str(material_id):
                continue

            # RBAC Enforcement
            if teacher_id_set and chunk_teacher not in teacher_id_set:
                continue

            if class_set and chunk_class and chunk_class not in class_set:
                continue

            # Similarity threshold filtering
            if float(score) >= threshold:
                results.append({
                    "text": chunk_obj["text"],
                    "metadata": meta,
                    "score": float(score)
                })

            if len(results) >= top_k:
                break

        return results

# Singleton vector store instance
vector_store = FAISSVectorStoreManager()
