from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.document_service import DocumentService

router = APIRouter(prefix="/api/documents", tags=["Documents"])

class DocumentIngestRequest(BaseModel):
    materialId: str
    teacherId: str
    teacherName: str
    className: str = Field(..., alias="class")
    title: str
    fileUrl: str = ""
    fileType: str = "pdf"
    rawContent: Optional[str] = None
    subject: Optional[str] = None

    class Config:
        populate_by_name = True

@router.post("/ingest")
async def ingest_document(req: DocumentIngestRequest):
    try:
        res = await DocumentService.ingest_document(
            material_id=req.materialId,
            teacher_id=req.teacherId,
            teacher_name=req.teacherName,
            class_name=req.className,
            title=req.title,
            file_url=req.fileUrl,
            file_type=req.fileType,
            raw_content=req.rawContent,
            subject=req.subject
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{material_id}")
async def delete_document(material_id: str):
    return DocumentService.delete_document(material_id)

@router.get("/stats")
async def get_stats():
    return DocumentService.get_stats()
