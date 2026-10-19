from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict

class GuruAIState(TypedDict):
    """
    Explicit State definition for LangGraph Agentic Study Assistant.
    """
    user_query: str
    conversation_history: List[Dict[str, str]]
    authorized_teacher_ids: List[str]
    authorized_classes: List[str]
    subject: Optional[str]
    
    # Reasoning & routing
    intent: Optional[str]               # 'rag_qa' | 'generate_quiz' | 'explain_topic' | 'general'
    selected_tool: Optional[str]
    
    # Tool outputs
    retrieved_context: str
    sources: List[Dict[str, Any]]
    has_retrieved_docs: bool
    tool_output: Any
    
    # Final generated response & validation
    final_response: str
    validation_status: str              # 'grounded' | 'fallback' | 'validated'
    execution_steps: List[str]
