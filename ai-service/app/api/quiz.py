from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.quiz_service import QuizService

router = APIRouter(prefix="/api/quiz", tags=["Quiz"])

class QuizRequest(BaseModel):
    topic: str
    subject: Optional[str] = None
    className: Optional[str] = None
    numQuestions: int = 5
    difficulty: str = "Medium"
    authorizedTeacherIds: Optional[List[str]] = None
    authorizedClasses: Optional[List[str]] = None

@router.post("")
async def generate_quiz(req: QuizRequest):
    try:
        res = await QuizService.generate_quiz(
            topic=req.topic,
            subject=req.subject,
            class_name=req.className,
            num_questions=req.numQuestions,
            difficulty=req.difficulty,
            authorized_teacher_ids=req.authorizedTeacherIds,
            authorized_classes=req.authorizedClasses
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
