import logging
from typing import List, Dict, Any, Optional
from app.rag.retriever import StudyMaterialRetriever
from app.agent.tools import ExplainTopicTool

logger = logging.getLogger("guruai.explain")

class ExplainService:
    @staticmethod
    async def explain_topic(
        topic: str,
        mode: str = "simple",
        subject: Optional[str] = None,
        class_name: Optional[str] = None,
        authorized_teacher_ids: Optional[List[str]] = None,
        authorized_classes: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Explains a topic in requested mode grounded in the student's authorized study materials.
        Adapts complexity according to class_name (Nursery to Class 10).
        """
        search_query = f"{subject} {topic}" if subject else topic
        retrieval_res = StudyMaterialRetriever.retrieve_context(
            query=search_query,
            authorized_teacher_ids=authorized_teacher_ids,
            authorized_classes=authorized_classes,
            top_k=4
        )

        context = retrieval_res["context"]
        sources = retrieval_res["sources"]

        explanation_text = await ExplainTopicTool.run(
            topic=topic,
            context=context,
            mode=mode,
            class_name=class_name
        )

        return {
            "topic": topic,
            "mode": mode,
            "class": class_name or "",
            "explanation": explanation_text,
            "sources": sources,
            "has_context": retrieval_res["has_context"]
        }
