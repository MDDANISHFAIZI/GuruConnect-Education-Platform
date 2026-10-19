import json
import logging
from typing import List, Dict, Any, Optional
from app.rag.retriever import StudyMaterialRetriever
from app.llm.model import get_llm_client

logger = logging.getLogger("guruai.tools")

class SearchStudyMaterialTool:
    """Tool 1: Searches the authorized teacher study materials."""
    name: str = "search_study_material"
    description: str = "Search enrolled teacher study materials and notes for concepts, formulas, units, and syllabus questions."

    @staticmethod
    def run(
        query: str,
        authorized_teacher_ids: Optional[List[str]] = None,
        authorized_classes: Optional[List[str]] = None,
        authorizedClasses: Optional[List[str]] = None,
        top_k: int = 4
    ) -> Dict[str, Any]:
        classes = authorized_classes if authorized_classes is not None else (authorizedClasses or [])
        return StudyMaterialRetriever.retrieve_context(
            query=query,
            authorized_teacher_ids=authorized_teacher_ids or [],
            authorized_classes=classes,
            top_k=top_k
        )

class GenerateQuizTool:
    """Tool 2: Generates a structured multiple-choice quiz based on retrieved content."""
    name: str = "generate_quiz"
    description: str = "Creates a structured interactive MCQ quiz grounded in study notes."

    @staticmethod
    async def run(topic: str, context: str, num_questions: int = 4, difficulty: str = "Medium") -> Dict[str, Any]:
        llm = get_llm_client()
        system_prompt = (
            "You are an expert educational quiz creator for GuruConnect. "
            "Generate high-quality multiple choice questions suitable for a school student. "
            "Return valid JSON ONLY matching the required format. Do not add markdown code blocks or text outside JSON."
        )
        user_prompt = f"""
Create an educational quiz on the topic: "{topic}".
Difficulty: {difficulty}
Number of questions: {num_questions}

Study Notes Context:
{context}

Format:
{{
  "questions": [
    {{
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "Brief student-friendly explanation",
      "source": {{
        "document": "Study Material",
        "page": 1
      }}
    }}
  ]
}}
"""
        try:
            quiz_data = await llm.generate_json(user_prompt, system_prompt)
            if "questions" in quiz_data and isinstance(quiz_data["questions"], list):
                return quiz_data
        except Exception as e:
            logger.error(f"GenerateQuizTool failed: {e}")

        # Safe student-friendly fallback
        return {
            "questions": [
                {
                    "question": f"Key concept practice: What is the main idea of {topic}?",
                    "options": [
                        f"It helps us understand the fundamental principles of {topic}",
                        "It has no application in science or maths",
                        "It is only used in rocket science",
                        "None of the above"
                    ],
                    "correctAnswer": "A",
                    "explanation": f"Understanding {topic} helps build your core knowledge in this subject.",
                    "source": {"document": "Class Notes", "page": 1}
                }
            ]
        }

class ExplainTopicTool:
    """Tool 3: Generates a clear structured explanation adapted to student class level."""
    name: str = "explain_topic"
    description: str = "Creates clear, pedagogical topic explanations adapted for school students."

    @staticmethod
    async def run(topic: str, context: str, mode: str = "simple", class_name: Optional[str] = None) -> str:
        llm = get_llm_client()
        
        target_class = class_name or "Class 5"
        
        system_prompt = (
            "You are GuruAI, the friendly AI Study Buddy for school students on GuruConnect. "
            f"Explain concepts clearly and engagingly for a student in {target_class}.\n\n"
            "AGE-APPROPRIATE GUIDELINES:\n"
            "- Nursery to Class 2: Very simple vocabulary, short explanations, visual language, familiar everyday objects.\n"
            "- Class 3 to 5: Simple explanations, clear real-world examples, and a small practice question.\n"
            "- Class 6 to 8: Moderate detail, definitions, examples, key points, and practice.\n"
            "- Class 9 to 10: Detailed academic breakdown, exam-oriented points, important formulas, and summary."
        )

        user_prompt = f"""
Topic: {topic}
Target Student Level: {target_class}

Study Notes Context:
{context}

Please provide a well-structured response with:
1. 💡 Simple Explanation
2. 🔍 Real-Life Example
3. ⭐ Important Points to Remember
4. ✏️ Quick Practice Question (with answer hint)
"""
        return await llm.generate_response(user_prompt, system_prompt)
