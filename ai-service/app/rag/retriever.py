from typing import List, Dict, Any, Optional
from app.rag.vector_store import vector_store

class StudyMaterialRetriever:
    @staticmethod
    def retrieve_context(
        query: str,
        authorized_teacher_ids: Optional[List[str]] = None,
        authorized_classes: Optional[List[str]] = None,
        material_id: Optional[str] = None,
        top_k: int = 4
    ) -> Dict[str, Any]:
        """
        Retrieves matching chunks and builds a clean grounded context block + structured sources.
        """
        matched_chunks = vector_store.search(
            query=query,
            top_k=top_k,
            authorized_teacher_ids=authorized_teacher_ids,
            authorized_classes=authorized_classes,
            material_id=material_id
        )

        sources: List[Dict[str, Any]] = []
        context_parts: List[str] = []

        seen_sources = set()

        for chunk in matched_chunks:
            meta = chunk.get("metadata", {})
            doc_title = meta.get("title", meta.get("filename", "Study Material"))
            page_num = meta.get("pageNumber", 1)
            teacher_name = meta.get("teacherName", "Enrolled Teacher")
            source_key = f"{doc_title}__p{page_num}"

            if source_key not in seen_sources:
                sources.append({
                    "document": doc_title,
                    "page": page_num,
                    "teacherName": teacher_name,
                    "materialId": meta.get("materialId", ""),
                    "score": round(chunk.get("score", 0.0), 3)
                })
                seen_sources.add(source_key)

            context_parts.append(
                f"--- [Document: {doc_title} | Page: {page_num} | Teacher: {teacher_name}] ---\n"
                f"{chunk['text']}\n"
            )

        formatted_context = "\n".join(context_parts) if context_parts else "No matching teacher study notes found."

        return {
            "context": formatted_context,
            "sources": sources,
            "has_context": len(matched_chunks) > 0,
            "chunk_count": len(matched_chunks)
        }
