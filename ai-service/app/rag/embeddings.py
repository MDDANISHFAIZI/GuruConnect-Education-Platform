import logging
import hashlib
import numpy as np
from typing import List
from app.config import settings

logger = logging.getLogger("guruai.embeddings")

class BaseEmbeddingModel:
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError

    def embed_query(self, text: str) -> List[float]:
        raise NotImplementedError

    @property
    def dimension(self) -> int:
        raise NotImplementedError

class SentenceTransformerEmbeddings(BaseEmbeddingModel):
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None
        self._dim = 384

    def _load(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
                self._dim = self._model.get_sentence_embedding_dimension()
                logger.info(f"Loaded SentenceTransformer: {self.model_name} (dim={self._dim})")
            except Exception as e:
                logger.warning(f"Failed to load SentenceTransformer ({e}). Using deterministic hashing vectorizer.")
                self._model = False

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        self._load()
        if self._model and self._model is not False:
            embeddings = self._model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
            return embeddings.tolist()
        return [self._hash_vector(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        self._load()
        if self._model and self._model is not False:
            embedding = self._model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
            return embedding.tolist()
        return self._hash_vector(text)

    def _hash_vector(self, text: str) -> List[float]:
        """Deterministic educational vectorizer (dim=384) with stop-word filtering."""
        STOP_WORDS = {
            "is", "are", "was", "were", "what", "where", "when", "who", "why", "how",
            "does", "do", "did", "the", "a", "an", "and", "or", "in", "on", "at",
            "to", "for", "with", "by", "from", "of", "this", "that", "there", "these",
            "those", "please", "tell", "me", "explain", "about", "can", "you", "i"
        }
        vec = np.zeros(self._dim, dtype=np.float32)
        raw_tokens = [t.strip(".,?!:;\"'()[]{}") for t in text.lower().split()]
        filtered_tokens = [t for t in raw_tokens if t and t not in STOP_WORDS and len(t) > 1]
        tokens_to_use = filtered_tokens if filtered_tokens else [t for t in raw_tokens if t]

        if not tokens_to_use:
            return vec.tolist()

        for token in tokens_to_use:
            h = int(hashlib.md5(token.encode('utf-8')).hexdigest(), 16)
            idx = h % self._dim
            vec[idx] += 1.0

        # Also add character trigrams for robust subword/stem matching
        for token in tokens_to_use:
            if len(token) >= 4:
                for i in range(len(token) - 2):
                    trigram = token[i:i+3]
                    h_tri = int(hashlib.md5(trigram.encode('utf-8')).hexdigest(), 16)
                    vec[h_tri % self._dim] += 0.4

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    @property
    def dimension(self) -> int:
        return self._dim

def get_embedding_model() -> BaseEmbeddingModel:
    """Factory to get the configured embedding model."""
    return SentenceTransformerEmbeddings(model_name=settings.EMBEDDING_MODEL)
