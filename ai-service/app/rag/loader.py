import io
import os
import re
import base64
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import httpx

logger = logging.getLogger("guruai.loader")

class DocumentPage:
    def __init__(self, page_number: int, text: str, metadata: Optional[Dict[str, Any]] = None):
        self.page_number = page_number
        self.text = text
        self.metadata = metadata or {}

class DocumentLoader:
    """Extracts text from PDF, DOCX, TXT, base64 data URLs, or raw text streams while preserving page markers."""

    @staticmethod
    def load_from_text(raw_text: str, metadata: Optional[Dict[str, Any]] = None) -> List[DocumentPage]:
        clean_text = raw_text.strip()
        if not clean_text:
            return []
        return [DocumentPage(page_number=1, text=clean_text, metadata=metadata)]

    @staticmethod
    def load_from_pdf_bytes(pdf_bytes: bytes, metadata: Optional[Dict[str, Any]] = None) -> List[DocumentPage]:
        pages = []
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            total_pages = len(reader.pages)
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                text = text.strip()
                if text:
                    pages.append(DocumentPage(page_number=idx + 1, text=text, metadata=metadata))

            # Gracefully handle scanned / image-only PDFs (no extractable text)
            if not pages and total_pages > 0:
                doc_title = (metadata or {}).get("title", "Uploaded Document")
                logger.warning(f"Scanned / image-only PDF detected ({total_pages} pages) for '{doc_title}'.")
                scanned_note = (
                    f"Document: {doc_title} (Scanned Image PDF - {total_pages} pages). "
                    f"This document is an image-based scanned PDF without an embedded OCR text layer. "
                    f"Topic: {(metadata or {}).get('subject', 'General')}. "
                    f"Class: {(metadata or {}).get('class', '')}. "
                    f"Teacher: {(metadata or {}).get('teacherName', 'Educator')}."
                )
                pages.append(DocumentPage(page_number=1, text=scanned_note, metadata={**(metadata or {}), "isScanned": True}))
        except Exception as e:
            logger.error(f"Error extracting text with pypdf: {e}")
        return pages

    @staticmethod
    def load_from_docx_bytes(docx_bytes: bytes, metadata: Optional[Dict[str, Any]] = None) -> List[DocumentPage]:
        pages = []
        try:
            import docx
            doc = docx.Document(io.BytesIO(docx_bytes))
            full_text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
            if full_text.strip():
                pages.append(DocumentPage(page_number=1, text=full_text, metadata=metadata))
        except Exception as e:
            logger.error(f"Error extracting text with python-docx: {e}")
        return pages

    @staticmethod
    async def load_from_url_or_path(file_path_or_url: str, metadata: Optional[Dict[str, Any]] = None) -> List[DocumentPage]:
        try:
            clean_input = file_path_or_url.strip()

            # 1. Base64 Data URL detection (e.g. data:application/pdf;base64,JVBERi...)
            if clean_input.startswith("data:"):
                match = re.match(r"^data:(.*?);base64,(.*)$", clean_input, re.DOTALL)
                if match:
                    mime_type = match.group(1).lower()
                    b64_data = match.group(2).strip()
                    file_bytes = base64.b64decode(b64_data)

                    if "pdf" in mime_type:
                        return DocumentLoader.load_from_pdf_bytes(file_bytes, metadata)
                    elif "word" in mime_type or "docx" in mime_type or "document" in mime_type:
                        return DocumentLoader.load_from_docx_bytes(file_bytes, metadata)
                    else:
                        # Attempt PDF first if PDF magic header
                        if file_bytes.startswith(b"%PDF"):
                            return DocumentLoader.load_from_pdf_bytes(file_bytes, metadata)
                        # Attempt DOCX (ZIP format PK)
                        elif file_bytes.startswith(b"PK"):
                            return DocumentLoader.load_from_docx_bytes(file_bytes, metadata)
                        else:
                            return DocumentLoader.load_from_text(file_bytes.decode("utf-8", errors="ignore"), metadata)

            # 2. Check local filesystem paths (both absolute and relative to workspace or backend)
            candidate_paths = [
                clean_input,
                os.path.abspath(clean_input),
                os.path.join(Path(__file__).resolve().parent.parent.parent.parent, clean_input.lstrip("/\\")),
                os.path.join(Path(__file__).resolve().parent.parent.parent.parent, "backend", clean_input.lstrip("/\\")),
                os.path.join(Path(__file__).resolve().parent.parent.parent.parent, "backend", "public", clean_input.lstrip("/\\")),
            ]

            for path_cand in candidate_paths:
                if os.path.exists(path_cand) and os.path.isfile(path_cand):
                    with open(path_cand, "rb") as f:
                        file_bytes = f.read()
                    if path_cand.lower().endswith(".pdf"):
                        return DocumentLoader.load_from_pdf_bytes(file_bytes, metadata)
                    elif path_cand.lower().endswith(".docx"):
                        return DocumentLoader.load_from_docx_bytes(file_bytes, metadata)
                    else:
                        return DocumentLoader.load_from_text(file_bytes.decode("utf-8", errors="ignore"), metadata)

            # 3. HTTP / HTTPS URL
            if clean_input.startswith("http://") or clean_input.startswith("https://"):
                async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                    res = await client.get(clean_input)
                    if res.status_code == 200:
                        content_type = res.headers.get("content-type", "").lower()
                        if "pdf" in content_type or clean_input.lower().endswith(".pdf") or res.content.startswith(b"%PDF"):
                            return DocumentLoader.load_from_pdf_bytes(res.content, metadata)
                        elif "docx" in content_type or clean_input.lower().endswith(".docx") or res.content.startswith(b"PK"):
                            return DocumentLoader.load_from_docx_bytes(res.content, metadata)
                        else:
                            return DocumentLoader.load_from_text(res.text, metadata)

            # 4. Otherwise treat as raw text content if longer than 15 chars
            if len(clean_input) > 15:
                return DocumentLoader.load_from_text(clean_input, metadata)

        except Exception as e:
            logger.error(f"Failed to load document from {file_path_or_url[:60]}...: {e}")

        return []

