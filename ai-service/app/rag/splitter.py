import re
from typing import List, Dict, Any
from app.rag.loader import DocumentPage

class TextChunk:
    def __init__(self, text: str, metadata: Dict[str, Any]):
        self.text = text
        self.metadata = metadata

class RecursiveTextSplitter:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_pages(self, pages: List[DocumentPage], base_metadata: Dict[str, Any]) -> List[TextChunk]:
        chunks: List[TextChunk] = []
        chunk_idx = 0

        for page in pages:
            page_text = page.text
            if not page_text:
                continue

            # Split text using paragraphs, sentences, or word boundaries
            paragraphs = re.split(r'\n\s*\n', page_text)
            current_buffer = ""

            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue

                if len(current_buffer) + len(para) <= self.chunk_size:
                    current_buffer += ("\n\n" + para if current_buffer else para)
                else:
                    if current_buffer:
                        meta = {
                            **base_metadata,
                            "pageNumber": page.page_number,
                            "chunkIndex": chunk_idx,
                            "charLength": len(current_buffer)
                        }
                        chunks.append(TextChunk(text=current_buffer, metadata=meta))
                        chunk_idx += 1

                        # Keep overlap from the end of current buffer
                        overlap_start = max(0, len(current_buffer) - self.chunk_overlap)
                        current_buffer = current_buffer[overlap_start:].strip() + "\n\n" + para
                    else:
                        # Para itself is longer than chunk_size, chunk by character slice
                        for i in range(0, len(para), self.chunk_size - self.chunk_overlap):
                            slice_text = para[i:i + self.chunk_size]
                            meta = {
                                **base_metadata,
                                "pageNumber": page.page_number,
                                "chunkIndex": chunk_idx,
                                "charLength": len(slice_text)
                            }
                            chunks.append(TextChunk(text=slice_text, metadata=meta))
                            chunk_idx += 1
                        current_buffer = ""

            if current_buffer.strip():
                meta = {
                    **base_metadata,
                    "pageNumber": page.page_number,
                    "chunkIndex": chunk_idx,
                    "charLength": len(current_buffer)
                }
                chunks.append(TextChunk(text=current_buffer, metadata=meta))
                chunk_idx += 1

        return chunks
