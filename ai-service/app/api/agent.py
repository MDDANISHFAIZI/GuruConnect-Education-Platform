from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from app.agent.graph import agent_graph
from app.agent.state import GuruAIState

router = APIRouter(prefix="/api/agent", tags=["Agent"])

class AgentRunRequest(BaseModel):
    query: str
    conversationHistory: Optional[List[Dict[str, str]]] = None
    authorizedTeacherIds: Optional[List[str]] = None
    authorizedClasses: Optional[List[str]] = None
    subject: Optional[str] = None

@router.post("")
async def run_agent(req: AgentRunRequest):
    try:
        initial_state: GuruAIState = {
            "user_query": req.query,
            "conversation_history": req.conversationHistory or [],
            "authorized_teacher_ids": req.authorizedTeacherIds or [],
            "authorized_classes": req.authorizedClasses or [],
            "subject": req.subject,
            "intent": None,
            "selected_tool": None,
            "retrieved_context": "",
            "sources": [],
            "has_retrieved_docs": False,
            "tool_output": None,
            "final_response": "",
            "validation_status": "pending",
            "execution_steps": []
        }

        final_state = await agent_graph.run(initial_state)

        return {
            "response": final_state["final_response"],
            "intent": final_state["intent"],
            "selectedTool": final_state["selected_tool"],
            "sources": final_state["sources"],
            "validationStatus": final_state["validation_status"],
            "executionSteps": final_state["execution_steps"],
            "toolOutput": final_state["tool_output"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
