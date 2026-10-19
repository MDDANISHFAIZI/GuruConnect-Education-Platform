import logging
from typing import List, Dict, Any, Optional, AsyncGenerator
from app.rag.retriever import StudyMaterialRetriever
from app.llm.model import get_llm_client

logger = logging.getLogger("guruai.chat")


class ChatService:
    @staticmethod
    async def answer_question(
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        authorized_teacher_ids: Optional[List[str]] = None,
        authorized_classes: Optional[List[str]] = None,
        material_id: Optional[str] = None,
        subject: Optional[str] = None,
        student_class: Optional[str] = None,
        curriculum: Optional[str] = None,
        preferred_language: Optional[str] = None,
        mode: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieval-Augmented Generation (RAG) question answering.
        Applies student personalization (Class, Curriculum, Language, Mode),
        citations, and conversation memory window.
        """
        # 1. Retrieve authorized study material chunks
        retrieval_res = StudyMaterialRetriever.retrieve_context(
            query=query,
            authorized_teacher_ids=authorized_teacher_ids,
            authorized_classes=authorized_classes,
            material_id=material_id,
            top_k=4
        )

        context = retrieval_res["context"]
        sources = retrieval_res["sources"]

        # 2. Build conversational history summary (keep last 4 messages)
        recent_history_text = ""
        if conversation_history:
            trimmed = conversation_history[-4:]
            formatted_history = []
            for msg in trimmed:
                role = "Student" if msg.get("role") == "user" else "GuruAI"
                formatted_history.append(f"{role}: {msg.get('content')}")
            recent_history_text = "\n".join(formatted_history)

        system_prompt, user_prompt, effective_mode = ChatService._build_prompts(
            query=query,
            context=context,
            recent_history_text=recent_history_text,
            subject=subject,
            student_class=student_class,
            curriculum=curriculum,
            preferred_language=preferred_language,
            mode=mode
        )

        llm = get_llm_client()
        answer = await llm.generate_response(user_prompt, system_prompt)

        # If quiz mode was active and LLM did not include JSON questions, dynamically append structured quiz
        if effective_mode == "quiz" and '"questions":' not in answer:
            try:
                import json
                from app.agent.tools import GenerateQuizTool
                quiz_payload = await GenerateQuizTool.run(
                    topic=query,
                    context=context,
                    num_questions=4,
                    difficulty="Easy" if any(g in (student_class or "").lower() for g in ["class 1", "class 2", "class 3", "class 4", "class 5"]) else "Medium"
                )
                if quiz_payload and "questions" in quiz_payload and len(quiz_payload["questions"]) > 0:
                    answer = f"{answer.strip()}\n\n```json\n{json.dumps(quiz_payload, indent=2)}\n```"
            except Exception as e:
                logger.warning(f"Fallback quiz generation error: {e}")

        return {
            "answer": answer,
            "sources": sources,
            "has_context": retrieval_res["has_context"]
        }

    @staticmethod
    async def answer_question_stream(
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        authorized_teacher_ids: Optional[List[str]] = None,
        authorized_classes: Optional[List[str]] = None,
        material_id: Optional[str] = None,
        subject: Optional[str] = None,
        student_class: Optional[str] = None,
        curriculum: Optional[str] = None,
        preferred_language: Optional[str] = None,
        mode: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        SSE streaming version of answer_question.
        """
        import json

        # 1. Retrieve context
        retrieval_res = StudyMaterialRetriever.retrieve_context(
            query=query,
            authorized_teacher_ids=authorized_teacher_ids,
            authorized_classes=authorized_classes,
            material_id=material_id,
            top_k=4
        )

        context = retrieval_res["context"]
        sources = retrieval_res["sources"]

        # 2. Build conversation history
        recent_history_text = ""
        if conversation_history:
            trimmed = conversation_history[-4:]
            formatted_history = []
            for msg in trimmed:
                role = "Student" if msg.get("role") == "user" else "GuruAI"
                formatted_history.append(f"{role}: {msg.get('content')}")
            recent_history_text = "\n".join(formatted_history)

        system_prompt, user_prompt, _ = ChatService._build_prompts(
            query=query,
            context=context,
            recent_history_text=recent_history_text,
            subject=subject,
            student_class=student_class,
            curriculum=curriculum,
            preferred_language=preferred_language,
            mode=mode
        )

        # 3. First yield sources metadata
        metadata_chunk = json.dumps({
            "__meta__": True,
            "sources": sources,
            "has_context": retrieval_res["has_context"]
        })
        yield f"data: {metadata_chunk}\n\n"

        # 4. Stream LLM tokens
        llm = get_llm_client()
        async for token in llm.generate_stream(user_prompt, system_prompt):
            if token:
                yield f"data: {json.dumps({'token': token})}\n\n"

        yield "data: [DONE]\n\n"

    @staticmethod
    def _build_prompts(
        query: str,
        context: str,
        recent_history_text: str,
        subject: Optional[str] = None,
        student_class: Optional[str] = None,
        curriculum: Optional[str] = None,
        preferred_language: Optional[str] = None,
        mode: Optional[str] = None
    ):
        """Builds the system and user prompts with full personalization parameters."""
        target_class = student_class or "School Student"
        target_curriculum = curriculum or "CBSE"
        target_language = preferred_language or "English"

        # Auto-detect intent if not explicitly set
        q_lower = query.lower()
        effective_mode = mode or "chat"
        if effective_mode == "chat":
            if any(k in q_lower for k in ["homework", "solve this", "step by step", "how to solve"]):
                effective_mode = "homework"
            elif any(k in q_lower for k in ["quiz", "mcq", "test me", "questions on"]):
                effective_mode = "quiz"
            elif any(k in q_lower for k in ["explain", "teach me", "what is", "learn"]):
                effective_mode = "explain"

        mode_instructions = ""
        if effective_mode == "homework":
            mode_instructions = (
                "MODE: HOMEWORK HELP & STEP-BY-STEP GUIDANCE\n"
                "- Do NOT merely state the final answer immediately.\n"
                "- Walk the student through the solution step-by-step.\n"
                "- 1. Identify what is given and what we need to find.\n"
                "- 2. State the key formula, law, or mathematical rule needed.\n"
                "- 3. Show step-by-step working clearly with explanations.\n"
                "- 4. Conclude with a quick tip or check so the student learns how to solve similar problems."
            )
        elif effective_mode == "explain":
            mode_instructions = (
                f"MODE: TOPIC EXPLANATION FOR {target_class.upper()}\n"
                f"- Explain in clear, friendly words suited to {target_class}.\n"
                "- Include:\n"
                "  1. 💡 Simple Core Concept (easy to grasp definition)\n"
                "  2. 🔍 Real-World Everyday Example\n"
                "  3. ⭐ Key Points to Remember for Exams\n"
                "  4. ✏️ Mini Self-Check Practice Question (with answer hint)"
            )
        elif effective_mode == "quiz":
            mode_instructions = (
                f"MODE: PRACTICE QUIZ FOR {target_class.upper()}\n"
                f"- Create 3 to 5 high-quality multiple choice practice questions tailored to {target_class} level in {subject or 'the subject'}.\n"
                "- Write a warm 1-sentence intro for the student.\n"
                "- Output the questions enclosed in a valid ```json ``` code block with this exact format:\n"
                "{\n"
                '  "questions": [\n'
                '    {\n'
                '      "question": "Question text suitable for student?",\n'
                '      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],\n'
                '      "correctAnswer": "A",\n'
                '      "explanation": "Clear explanation of why this is correct",\n'
                '      "source": {"document": "Study Material", "page": 1}\n'
                '    }\n'
                '  ]\n'
                "}"
            )
        else:
            mode_instructions = (
                f"MODE: GENERAL STUDY ASSISTANCE FOR {target_class.upper()}\n"
                "- Answer the student's question clearly, pedagogically, and encouragingly.\n"
                f"- Adapt complexity and vocabulary specifically to a {target_class} student."
            )

        lang_instruction = ""
        if target_language.lower() == "hindi":
            lang_instruction = "LANGUAGE: Respond in natural, easy-to-understand Hindi or Hinglish suitable for Indian school students."
        else:
            lang_instruction = "LANGUAGE: Respond in clear, simple, correct English."

        system_prompt = f"""You are GuruAI, the official personalized AI Study Buddy for school students on GuruConnect.
Student Profile:
- Class/Grade: {target_class}
- Curriculum/Board: {target_curriculum}
- Subject Focus: {subject or 'General Studies'}
- Preferred Language: {target_language}

CORE RULES:
1. Always adapt your explanations, vocabulary, and depth to {target_class} students. Do NOT use overly complex collegiate jargon for young grades, and do NOT oversimplify for high school students.
2. {lang_instruction}
3. If teacher study materials are provided below, ground your answer in those materials. If not found in the materials, state that it is not in the uploaded notes and provide an accurate syllabus explanation.
4. Do NOT invent fake citations or hallucinate page numbers.
5. Be warm, supportive, and motivating!

{mode_instructions}
"""

        user_prompt = f"""{f'Recent Conversation History:' + chr(10) + recent_history_text + chr(10) if recent_history_text else ''}Teacher Study Notes Context:
{context if context else 'No teacher notes uploaded for this specific query.'}

Student Question:
{query}

Please provide your helpful response:"""

        return system_prompt, user_prompt, effective_mode
