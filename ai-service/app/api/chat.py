from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[Dict[str, str]]] = None
    authorizedTeacherIds: Optional[List[str]] = None
    authorizedClasses: Optional[List[str]] = None
    materialId: Optional[str] = None
    subject: Optional[str] = None
    studentClass: Optional[str] = None
    curriculum: Optional[str] = None
    preferredLanguage: Optional[str] = None
    mode: Optional[str] = None


@router.post("")
async def chat(req: ChatRequest):
    """Standard (non-streaming) RAG chat endpoint."""
    try:
        res = await ChatService.answer_question(
            query=req.message,
            conversation_history=req.conversationHistory,
            authorized_teacher_ids=req.authorizedTeacherIds,
            authorized_classes=req.authorizedClasses,
            material_id=req.materialId,
            subject=req.subject,
            student_class=req.studentClass,
            curriculum=req.curriculum,
            preferred_language=req.preferredLanguage,
            mode=req.mode
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def chat_stream(req: ChatRequest):
    """
    Server-Sent Events (SSE) streaming chat endpoint.
    """
    try:
        generator = ChatService.answer_question_stream(
            query=req.message,
            conversation_history=req.conversationHistory,
            authorized_teacher_ids=req.authorizedTeacherIds,
            authorized_classes=req.authorizedClasses,
            material_id=req.materialId,
            subject=req.subject,
            student_class=req.studentClass,
            curriculum=req.curriculum,
            preferred_language=req.preferredLanguage,
            mode=req.mode
        )
        return StreamingResponse(
            generator,
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
