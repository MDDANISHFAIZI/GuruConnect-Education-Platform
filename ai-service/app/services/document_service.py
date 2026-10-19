import logging
from typing import Dict, Any, Optional
from app.rag.loader import DocumentLoader
from app.rag.splitter import RecursiveTextSplitter
from app.rag.vector_store import vector_store
from app.config import settings

logger = logging.getLogger("guruai.documents")

class DocumentService:
    @staticmethod
    async def ingest_document(
        material_id: str,
        teacher_id: str,
        teacher_name: str,
        class_name: str,
        title: str,
        file_url: str,
        file_type: str = "pdf",
        raw_content: Optional[str] = None,
        subject: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Parses document, extracts pages, chunks text, attaches metadata, and updates FAISS index.
        """
        logger.info(f"Ingesting material {material_id} ('{title}') for teacher {teacher_name} ({teacher_id})...")

        # 1. Remove previous chunks for this material if updating
        vector_store.delete_material(material_id)

        base_metadata = {
            "materialId": str(material_id),
            "teacherId": str(teacher_id),
            "teacherName": teacher_name,
            "class": class_name,
            "title": title,
            "subject": subject or "",
            "fileType": file_type,
            "fileUrl": file_url
        }

        # 2. Extract pages
        pages = []
        if raw_content and len(raw_content.strip()) > 10:
            pages = DocumentLoader.load_from_text(raw_content, base_metadata)
        elif file_url:
            pages = await DocumentLoader.load_from_url_or_path(file_url, base_metadata)

        # Fallback if empty or failed download: create descriptive title placeholder chunk
        if not pages:
            logger.warning(f"Could not extract full text for '{title}'. Creating metadata summary chunk.")
            summary_text = f"Study Material Title: {title}. Class: {class_name}. Subject: {subject or 'General'}. Shared by Teacher {teacher_name} for student exam preparation."
            pages = DocumentLoader.load_from_text(summary_text, base_metadata)

        # 3. Chunk text
        splitter = RecursiveTextSplitter(chunk_size=settings.CHUNK_SIZE, chunk_overlap=settings.CHUNK_OVERLAP)
        chunks = splitter.split_pages(pages, base_metadata)

        # 4. Add to FAISS Vector Store
        vector_store.add_chunks(chunks)

        logger.info(f"Successfully indexed {len(chunks)} chunks for '{title}' (Material ID: {material_id}).")

        return {
            "success": True,
            "materialId": material_id,
            "chunkCount": len(chunks),
            "pageCount": len(pages),
            "totalIndexedChunks": len(vector_store.chunks)
        }

    @staticmethod
    def delete_document(material_id: str) -> Dict[str, Any]:
        vector_store.delete_material(material_id)
        return {"success": True, "materialId": material_id, "remainingChunks": len(vector_store.chunks)}

    @staticmethod
    def get_stats() -> Dict[str, Any]:
        return {
            "totalChunks": len(vector_store.chunks),
            "embeddingModel": settings.EMBEDDING_MODEL,
            "faissDimension": vector_store.dimension
        }
