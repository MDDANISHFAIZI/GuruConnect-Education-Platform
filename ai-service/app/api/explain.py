from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.explain_service import ExplainService

router = APIRouter(prefix="/api/explain", tags=["Explain"])

class ExplainRequest(BaseModel):
    topic: str
    mode: str = "simple"
    subject: Optional[str] = None
    className: Optional[str] = None
    authorizedTeacherIds: Optional[List[str]] = None
    authorizedClasses: Optional[List[str]] = None

@router.post("")
async def explain_topic(req: ExplainRequest):
    try:
        res = await ExplainService.explain_topic(
            topic=req.topic,
            mode=req.mode,
            subject=req.subject,
            class_name=req.className,
            authorized_teacher_ids=req.authorizedTeacherIds,
            authorized_classes=req.authorizedClasses
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
