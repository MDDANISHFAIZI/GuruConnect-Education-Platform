import logging
from typing import List, Dict, Any, Optional
from app.rag.retriever import StudyMaterialRetriever
from app.agent.tools import GenerateQuizTool

logger = logging.getLogger("guruai.quiz")

class QuizService:
    @staticmethod
    async def generate_quiz(
        topic: str,
        subject: Optional[str] = None,
        class_name: Optional[str] = None,
        num_questions: int = 5,
        difficulty: str = "Medium",
        authorized_teacher_ids: Optional[List[str]] = None,
        authorized_classes: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Retrieves relevant course notes and synthesizes a structured MCQ quiz.
        """
        search_query = f"{subject} {topic}" if subject else topic
        retrieval_res = StudyMaterialRetriever.retrieve_context(
            query=search_query,
            authorized_teacher_ids=authorized_teacher_ids,
            authorized_classes=authorized_classes,
            top_k=5
        )

        context = retrieval_res["context"]
        sources = retrieval_res["sources"]

        quiz_payload = await GenerateQuizTool.run(
            topic=topic,
            context=context,
            num_questions=num_questions,
            difficulty=difficulty
        )

        return {
            "topic": topic,
            "subject": subject or "General",
            "difficulty": difficulty,
            "questions": quiz_payload.get("questions", []),
            "sources": sources
        }
