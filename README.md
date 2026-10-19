# GuruConnect — AI-Powered Hyperlocal Education Platform

GuruConnect is a full-stack hyperlocal education platform connecting students with nearby verified tutors, enhanced with **GuruAI** — an intelligent GenAI + RAG + Agentic AI study assistant grounded in teacher-uploaded study materials.

---

## High-Level Architecture

```
                                    GURUCONNECT
                                         |
          +------------------------------+------------------------------+
          |                                                             |
   Existing Platform                                                  GuruAI
          |                                                             |
   React + Node/Express                                           Python/FastAPI
          |                                                             |
       MongoDB                                                 LangChain / LangGraph
                                                                        |
                                         +------------------------------+------------------------------+
                                         |                                                             |
                                    RAG Pipeline                                                   AI Agent
                                         |                                                             |
                                  Embedding Model                                                 Tool Calling
                                         |                                            +----------------+----------------+
                                       FAISS                                          |                |                |
                                         |                                           RAG              Quiz           Explain
                                         |                                           Tool             Tool             Tool
                                         |                                             \               |               /
                                         |                                              \              |              /
                                         +----------------------------------------------->            LLM
                                                                                                       |
                                                                                                       v
                                                                                                Student Response
```

---

## Core Capabilities

### 1. Existing Platform Features
- **Student & Teacher Portals**: Role-based access control (RBAC), secure JWT authentication.
- **Hyperlocal Tutor Discovery**: Leaflet.js interactive map search with distance filtering.
- **Tuition Classroom Hub**: Study notes sharing, homework taskboards, doubt resolution forum, and announcement feeds.
- **Attendance & Fee Ledger**: Digital attendance register and PDF fee receipt generator (jsPDF).
- **Offline & Online Onboarding**: Unique Teacher Connection Codes (e.g. `GC-TEACHER-XXXX`) for batch enrollment.

### 2. GuruAI Subsystem Features
- **RAG-Based Question Answering**: Grounded queries strictly referencing authorized teacher study materials.
- **Source Citations**: Inline citations highlighting document title, page numbers, and teacher attribution.
- **Hallucination Guardrails**: Top-$K$ retrieval, similarity threshold filtering, and explicit "Not found in notes" fallback notices.
- **AI Quiz Generator Studio**: Synthesizes structured multiple-choice quizzes with deterministic scoring and explanations.
- **Multi-Mode Topic Explainer**: Explain any concept in 4 pedagogical styles (*Simple/ELI5*, *Detailed Academic*, *Exam Prep Summary*, *Interview Q&A*).
- **LangGraph Autonomous Agent**: Multi-tool agent pipeline (`search_study_material`, `generate_quiz`, `explain_topic`) with execution step logging.
- **Conversational Memory**: Multi-turn chat persistence in MongoDB with a bounded memory window.
- **Teacher Ingestion Engine**: Automatically parses, splits, embeds, and indexes PDFs/DOCX notes into a persistent FAISS vector store.

---

## Technology Stack & Resume Keywords

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Axios, React Router, Lucide Icons, Leaflet.js |
| **Main Backend** | Node.js, Express.js (ES Modules), Mongoose, JWT Authentication, bcryptjs |
| **Database** | MongoDB (Users, Teachers, Students, Enrollments, Notes, Conversations, Messages) |
| **AI Microservice** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Generative AI & LLM** | Mistral AI (`mistral-small-latest`), OpenAI (`gpt-4o-mini`), Prompt Engineering |
| **Vector DB & Retrieval** | FAISS (`faiss-cpu`), SentenceTransformers (`all-MiniLM-L6-v2`), RAG Pipeline |
| **Agentic AI & Orchestration**| LangGraph (`StateGraph`), LangChain Core & Community |
| **Document Processing** | PyPDF, python-docx, Recursive Character Text Splitter |

---

## Project Structure

```
GuruConnect/
├── frontend/                     # React + Vite Web Client
│   ├── src/
│   │   ├── components/GuruAI/    # GuruAI Hub, Chat, Quiz, Explainer, Agent Views
│   │   ├── pages/                # Student & Teacher Dashboards, Nearby, Discovery
│   │   └── context/              # AuthContext (JWT)
│   └── package.json
│
├── backend/                      # Node.js Express REST API
│   ├── controllers/              # aiController, classroomController, authController
│   ├── models/                   # Conversation, Message, Note, User, Enrollment
│   ├── routes/                   # ai.js, classroom.js, auth.js, teachers.js
│   ├── services/                 # aiService.js (HTTP Bridge to Python)
│   └── server.js
│
├── ai-service/                   # Python FastAPI AI Microservice
│   ├── app/
│   │   ├── main.py               # FastAPI App & Routing
│   │   ├── config.py             # Settings & Environment Variables
│   │   ├── llm/model.py          # Mistral/OpenAI/Fallback LLM Abstraction
│   │   ├── rag/                  # Loader, Splitter, Embeddings, FAISS Vector Store, Retriever
│   │   ├── agent/                # LangGraph StateGraph, State, and Tools
│   │   └── services/             # Chat, Quiz, Explain, Document Ingestion Services
│   ├── storage/faiss_index/      # Persistent FAISS Index & Metadata
│   └── requirements.txt
│
└── docs/
    └── GURUAI_INTERVIEW_GUIDE.md # 24 Technical Interview Questions & Answers
```

---

## Setup & Running Locally

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **MongoDB** (Local instance on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

---

### 2. Quick Start (Windows All-in-One)

You can launch all 3 services (AI microservice, Express backend, React frontend) with a single click:
```cmd
start_all_services.bat
```
Or start each service manually as documented below.

---

### 3. AI Service Setup (Python / FastAPI)

```bash
cd ai-service

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies (faiss-cpu, pypdf, python-docx, fastapi, uvicorn, langchain, etc.)
pip install -r requirements.txt

# Start the FastAPI service
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

AI Service environment (`ai-service/.env`):
```env
HOST=127.0.0.1
PORT=8000
ENVIRONMENT=development

# LLM Provider Configuration
# Supported: "mistral", "groq", "openai", "gemini", or "fallback"
LLM_PROVIDER=mistral
LLM_MODEL=mistral-small-latest

# API Keys (Provide at least one active key)
MISTRAL_API_KEY=your_mistral_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Embedding & Retrieval Settings
EMBEDDING_PROVIDER=sentence-transformers
EMBEDDING_MODEL=all-MiniLM-L6-v2
FAISS_INDEX_DIR=./storage/faiss_index
SIMILARITY_THRESHOLD=0.15
TOP_K=4
```

> **Note on Resilient Fallback:** If your external LLM provider encounters rate limits (e.g. HTTP 429) or is temporarily unreachable, GuruAI's dynamic fallback engine automatically steps in to synthesize context-grounded study answers and topic-relevant quizzes without crashing.

---

### 4. Backend Setup (Node.js / Express)

```bash
cd backend
npm install
npm run dev
```

Backend environment (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/guruconnect
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/guruconnect?retryWrites=true&w=majority

JWT_SECRET=your_jwt_secret_token_here
AI_SERVICE_URL=http://127.0.0.1:8000
```

---

### 5. Frontend Setup (React / Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend environment (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## GuruAI Architecture & Request Flow

```
1. Teacher Uploads Note (PDF/DOCX)
   Frontend (Teacher Dashboard) ──> Express Backend (/api/classroom/notes)
                                      ├── Saves file to /public/uploads/notes/
                                      └── Dispatches POST to Python AI Service (/api/ingest)
                                            ├── PyPDF / python-docx extracts raw text & pages
                                            ├── RecursiveCharacterTextSplitter (chunk_size=500, overlap=50)
                                            ├── Generates dense embeddings
                                            └── Stores vectors & metadata in FAISS index

2. Student Asks GuruAI a Question
   Frontend (GuruAI Tab) ───────> Express Backend (/api/ai/chat)
                                      ├── Enforces Student JWT Authentication
                                      ├── Queries MongoDB for Student's Enrolled Teachers & Classes
                                      └── Proxies enriched request to Python AI Service (/api/chat)
                                            ├── Generates query embedding
                                            ├── Searches FAISS vector index
                                            ├── Filters strictly by student's authorized teacher_id / class
                                            ├── Threshold similarity filter (cosine distance <= 0.15)
                                            ├── Builds grounded prompt with retrieved document context
                                            ├── Calls LLM (Mistral / Groq / OpenAI / Gemini)
                                            └── Returns grounded answer + inline document citations:
                                                [{ document, page, teacherName, materialId, score }]

3. Agentic Mode (LangGraph Multi-Tool Agent)
   Frontend (GuruAI Agent) ──────> Express Backend (/api/ai/agent)
                                      └── Python AI Service LangGraph StateGraph
                                            ├── Router Node: Evaluates user intent
                                            ├── Tool Selection:
                                            │     ├─ search_study_material (RAG lookup)
                                            │     ├─ explain_topic (Multi-style pedagogic explanation)
                                            │     └─ generate_quiz (Structured MCQ generator)
                                            └── Synthesizer Node: Compiles final result with step logs
```

---

## API Reference (AI Endpoints)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/ai/chat` | `POST` | Multi-turn RAG chat with conversation memory & citations |
| `/api/ai/explain` | `POST` | Concept explainer in 4 pedagogical styles |
| `/api/ai/quiz` | `POST` | Dynamic MCQ quiz generator with answers & explanations |
| `/api/ai/agent` | `POST` | Autonomous LangGraph tool-calling agent |
| `/api/ai/conversations` | `GET` | List student's stored GuruAI chat history |
| `/api/ai/conversations/:id` | `GET` | Retrieve messages for a specific conversation session |
| `/api/ai/conversations/:id` | `DELETE` | Delete a specific conversation session |
| `/api/ai/health` | `GET` | Health check for Python AI microservice |

---

## Interview & Architecture Documentation

For complete interview explanations covering RAG design, hallucination reduction, FAISS scaling, LangGraph workflows, and security models, refer to:
👉 [docs/GURUAI_INTERVIEW_GUIDE.md](docs/GURUAI_INTERVIEW_GUIDE.md)

---

## Creator

**Md Danish Faizi Ansari**  
Computer Science and Engineering  
Indian Institute of Technology Patna  
- Email: danish8809506870@gmail.com  
- LinkedIn: [md-danish-faizi-ansari](https://linkedin.com/in/md-danish-faizi-ansari)
