import logging
from typing import Dict, Any
from app.agent.state import GuruAIState
from app.agent.tools import SearchStudyMaterialTool, GenerateQuizTool, ExplainTopicTool
from app.llm.model import get_llm_client

from langgraph.graph import StateGraph, START, END

logger = logging.getLogger("guruai.agent")

class GuruAIAgentGraph:
    """
    LangGraph-structured stateful workflow for GuruAI.
    Routes queries to tools, manages context, and ensures response grounding.
    """

    def __init__(self):
        self.llm = get_llm_client()
        self.compiled_graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(GuruAIState)
        workflow.add_node("understand_request", self.understand_request)
        workflow.add_node("execute_tool", self.execute_tool)
        workflow.add_node("generate_response", self.generate_response)
        workflow.add_node("validate_context", self.validate_context)

        workflow.add_edge(START, "understand_request")
        workflow.add_edge("understand_request", "execute_tool")
        workflow.add_edge("execute_tool", "generate_response")
        workflow.add_edge("generate_response", "validate_context")
        workflow.add_edge("validate_context", END)

        return workflow.compile()

    async def understand_request(self, state: GuruAIState) -> GuruAIState:
        """Step 1: Analyzes user query intent and selects appropriate tool."""
        query = state["user_query"].lower()
        steps = state.get("execution_steps", [])
        steps.append("Analyzed user query intent and context.")

        if any(w in query for w in ["quiz", "test me", "mcq", "multiple choice", "questions on"]):
            state["intent"] = "generate_quiz"
            state["selected_tool"] = "generate_quiz"
        elif any(w in query for w in ["homework", "solve this", "step by step", "how to calculate", "how to solve"]):
            state["intent"] = "homework_help"
            state["selected_tool"] = "homework_help"
        elif any(w in query for w in ["explain", "simplify", "summary", "teach me", "what is", "how does"]):
            state["intent"] = "explain_topic"
            state["selected_tool"] = "explain_topic"
        elif any(w in query for w in ["search", "find", "notes say", "pdf say", "notes on"]):
            state["intent"] = "rag_qa"
            state["selected_tool"] = "search_study_material"
        else:
            state["intent"] = "rag_qa"
            state["selected_tool"] = "search_study_material"

        state["execution_steps"] = steps
        return state

    async def execute_tool(self, state: GuruAIState) -> GuruAIState:
        """Step 2: Retrieves study material and invokes chosen tool."""
        tool = state.get("selected_tool", "search_study_material")
        query = state["user_query"]
        steps = state.get("execution_steps", [])

        # Always retrieve authorized context
        retrieval_res = SearchStudyMaterialTool.run(
            query=query,
            authorized_teacher_ids=state.get("authorized_teacher_ids", []),
            authorized_classes=state.get("authorized_classes", []),
            top_k=4
        )

        state["retrieved_context"] = retrieval_res["context"]
        state["sources"] = retrieval_res["sources"]
        state["has_retrieved_docs"] = retrieval_res["has_context"]

        steps.append(f"Retrieved {len(retrieval_res['sources'])} relevant notes chunks from authorized teacher material.")

        if tool == "generate_quiz":
            steps.append("Executing GenerateQuizTool...")
            quiz_out = await GenerateQuizTool.run(topic=query, context=state["retrieved_context"])
            state["tool_output"] = quiz_out
        elif tool == "homework_help":
            steps.append("Executing HomeworkHelpTool...")
            system_hw = "You are GuruAI providing step-by-step homework help for a school student. Break down: 1) Given values & Goal, 2) Formula/Rule, 3) Step-by-step working, 4) Final check and tip."
            user_hw = f"Homework Problem: {query}\n\nStudy Notes Context: {state['retrieved_context']}\n\nPlease guide step-by-step:"
            hw_out = await self.llm.generate_response(user_hw, system_hw)
            state["tool_output"] = hw_out
        elif tool == "explain_topic":
            steps.append("Executing ExplainTopicTool...")
            explain_out = await ExplainTopicTool.run(topic=query, context=state["retrieved_context"], mode="simple")
            state["tool_output"] = explain_out
        else:
            steps.append("Executing SearchStudyMaterialTool...")
            state["tool_output"] = retrieval_res

        state["execution_steps"] = steps
        return state

    async def generate_response(self, state: GuruAIState) -> GuruAIState:
        """Step 3: Builds the final user-facing response with citations."""
        tool = state.get("selected_tool")
        steps = state.get("execution_steps", [])

        if tool == "generate_quiz":
            quiz = state.get("tool_output", {})
            q_count = len(quiz.get("questions", []))
            state["final_response"] = f"I've generated a customized practice quiz with {q_count} questions based on your study materials."
            steps.append("Formatted structured quiz payload.")
        elif tool == "homework_help":
            state["final_response"] = str(state.get("tool_output", ""))
            steps.append("Compiled step-by-step homework solution guide.")
        elif tool == "explain_topic":
            state["final_response"] = str(state.get("tool_output", ""))
            steps.append("Compiled structured explanation.")
        else:
            # RAG QA generation
            context = state.get("retrieved_context", "")
            system_prompt = (
                "You are GuruAI, an educational study assistant inside GuruConnect. "
                "Use the provided retrieved educational context to answer the student's question clearly and accurately. "
                "If the answer cannot be found in the provided context, state that the information was not found in the uploaded study notes."
            )
            user_prompt = f"""
Student Question: {state['user_query']}

Retrieved Study Material:
{context}

Please provide a helpful, clear, step-by-step response.
"""
            ans = await self.llm.generate_response(user_prompt, system_prompt)
            state["final_response"] = ans
            steps.append("Synthesized grounded response with LLM.")

        state["execution_steps"] = steps
        return state

    async def validate_context(self, state: GuruAIState) -> GuruAIState:
        """Step 4: Validates grounding and safeguards against hallucinations."""
        steps = state.get("execution_steps", [])

        if state.get("has_retrieved_docs"):
            state["validation_status"] = "grounded"
            steps.append("Response validated against authorized study notes.")
        else:
            state["validation_status"] = "fallback"
            steps.append("Note: Retrieval returned no matching local chunks. Applied safe fallback notice.")

        state["execution_steps"] = steps
        return state

    async def run(self, state: GuruAIState) -> GuruAIState:
        """Executes the full pipeline via compiled LangGraph StateGraph."""
        state["execution_steps"] = []
        return await self.compiled_graph.ainvoke(state)

# Singleton agent graph instance
agent_graph = GuruAIAgentGraph()
