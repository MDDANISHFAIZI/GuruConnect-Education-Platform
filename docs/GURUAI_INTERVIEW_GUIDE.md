# GuruConnect — GuruAI Technical Architecture & Interview Guide

This guide contains precise, implementation-accurate answers to the technical questions regarding the Generative AI, Retrieval-Augmented Generation (RAG), and Agentic AI subsystems built for **GuruConnect**.

---

## 1. What is GenAI?
Generative Artificial Intelligence (GenAI) refers to deep learning models trained on vast corpora of text, code, or multimodal data capable of generating novel, context-aware unstructured or structured content (such as text explanations, JSON practice quizzes, and code) rather than merely performing classification or regression. In GuruConnect, GenAI is utilized through Large Language Models (LLMs) to formulate pedagogical explanations, synthesize assessments, and power interactive conversational learning.

## 2. What is an LLM?
A Large Language Model (LLM) is an autoregressive transformer-based neural network trained on trillions of tokens using self-supervised masked or next-token prediction objectives. In GuruConnect, the LLM acts as the core reasoning engine (`Mistral-Small-Latest` / `GPT-4o-mini`), taking student prompts along with retrieved study context to produce grounded educational outputs.

## 3. What is RAG?
Retrieval-Augmented Generation (RAG) is an architectural pattern that enhances LLM generation by dynamically retrieving relevant, authoritative external documents from a vector database before invoking the language model. Instead of relying solely on the parametric knowledge embedded in the LLM's weights during training, RAG injects localized external domain knowledge into the prompt context at inference time.

## 4. Why did you use RAG?
In an educational platform like GuruConnect, teacher lecture notes, exam guidelines, and syllabus materials are specific, localized, and constantly updated. LLMs cannot know a private tutor's handwritten PDF or local school notes. Using RAG provides three key advantages:
1. **Curriculum Alignment**: Answers directly quote and follow the student's enrolled teacher's specific syllabus.
2. **Hallucination Reduction**: The model is strictly instructed to ground its answer in retrieved text chunks.
3. **Traceability**: Every answer cites exact document names and page numbers for student verification.

## 5. What are embeddings?
Embeddings are dense numerical vector representations (e.g., a 384-dimensional float array from `all-MiniLM-L6-v2`) where high-dimensional semantic meaning is mapped into continuous vector space. Semantically similar sentences (e.g., *"CPU scheduling"* and *"process burst allocation"*) are located close to each other in Euclidean or cosine vector space, enabling semantic search rather than brittle keyword matching.

## 6. Why FAISS?
Facebook AI Similarity Search (FAISS) is an open-source, highly optimized C++ library with Python bindings for efficient nearest-neighbor search over dense vectors.
- **Why selected**: It provides lightning-fast local vector search, minimal deployment overhead, zero external database subscription cost, and straightforward disk persistence (`faiss_index.bin` + `metadata.json`).
- **Production path**: Because the vector store is abstracted behind a clean interface (`FAISSVectorStoreManager`), it can be swapped to Chroma, Pinecone, or Qdrant with zero changes to the core RAG or agent pipeline.

## 7. How does similarity search work?
When a student asks a question:
1. The question is converted into a 384-dimensional dense vector $\vec{q}$ using the embedding model and $L_2$-normalized.
2. FAISS performs an Inner Product (cosine similarity) dot product $\vec{q} \cdot \vec{d}_i$ against all stored document chunk vectors.
3. Chunks with the highest similarity score (above `SIMILARITY_THRESHOLD = 0.35`) are retrieved, filtered by the student's authorized metadata, and sorted to form Top-$K$ candidate documents.

## 8. What is chunking?
Chunking is the process of breaking long documents (such as multi-page lecture notes or PDFs) into smaller, coherent text segments before embedding and vector storage.

## 9. How did you choose chunk size?
In `GuruAI`, we selected:
- **Chunk Size: 800 characters (~150–200 words)**: Matches the typical length of a complete pedagogical concept, theorem, or algorithm definition.
- **Chunk Overlap: 150 characters (~30 words)**: Ensures that concepts spanning chunk boundaries are not truncated, maintaining semantic continuity.
- **Splitter**: `RecursiveCharacterTextSplitter` splitting primarily along paragraph boundaries (`\n\n`), sentences (`. `), and word spaces.

## 10. What is LangChain?
LangChain is a modular framework designed to orchestrate LLM workflows, offering standardized abstractions for document loaders, text splitters, prompt templates, output parsers, and retrieval chains. We used LangChain conventions for document ingestion, recursive text splitting, and tool abstraction.

## 11. What is LangGraph?
LangGraph is a library for building stateful, multi-actor, cyclic and acyclic agentic workflows using explicit state machines (`StateGraph`). Unlike rigid linear chains, LangGraph allows conditional branching, iterative reasoning, tool-calling loops, and explicit state tracking (`GuruAIState`).

## 12. What is Agentic AI?
Agentic AI refers to systems where an AI model is not merely a passive single-turn text generator, but an autonomous entity that can understand user intent, decompose complex goals into discrete steps, invoke external tools (APIs, databases, search), inspect intermediate results, and self-correct or validate before producing the final response.

## 13. Where is the agent in your project?
The agent is implemented in `ai-service/app/agent/graph.py` via `GuruAIAgentGraph`. It orchestrates user requests across four sequential nodes in the StateGraph:
`START` $\rightarrow$ `understand_request` $\rightarrow$ `execute_tool` $\rightarrow$ `generate_response` $\rightarrow$ `validate_context` $\rightarrow$ `END`.

## 14. What tools does your agent have?
1. `search_study_material`: Performs RBAC-filtered FAISS semantic search across authorized teacher documents.
2. `generate_quiz`: Constructs structured multiple-choice questions validated via Pydantic/JSON schemas with answer keys and explanations.
3. `explain_topic`: Synthesizes pedagogical concept breakdowns across 4 distinct styles (*Simple*, *Detailed*, *Exam Prep*, *Interview Q&A*).

## 15. Why use an agent instead of a normal chatbot?
A normal chatbot blindly passes user prompts to an LLM without reasoning about user goals. In contrast, the GuruAI Agent:
- Understands intent (e.g., discerning when a student wants practice questions vs. conceptual explanations vs. direct document search).
- Dynamically selects and calls the right specialized tool.
- Validates the grounding of retrieved materials and triggers safe fallback notifications if no relevant teacher notes exist.

## 16. Which LLM did you use?
`Mistral-Small-Latest` (with pluggable support for `OpenAI GPT-4o-mini` and an internal fallback synthesizer for offline resilience).

## 17. Why that LLM?
Mistral was chosen because:
- **Cost-Efficiency & Latency**: Exceptional token throughput and low latency for interactive real-time educational chatting.
- **Strong Reasoning & Instruction Following**: Follows strict JSON schema generation and system constraints reliably.
- **Provider Abstraction**: Configured via `LLM_PROVIDER` and `LLM_MODEL` environment variables so models can be swapped effortlessly without codebase refactoring.

## 18. How did you handle hallucinations?
We engineered multiple defense layers:
1. **Grounded System Prompting**: Instructing the model to only answer using provided study context and state explicitly when facts are absent.
2. **Similarity Threshold Filtering (`SIMILARITY_THRESHOLD = 0.35`)**: Low-confidence or irrelevant vector matches are discarded before prompt construction.
3. **Top-$K$ Source Citations**: Document names and page numbers are dynamically returned to the student UI for cross-verification.
4. **Context-Only Answering Fallback**: If retrieval returns no authorized chunks, the agent returns an explicit "Not found in your teacher's study material" notice rather than hallucinating details.

## 19. How does the Node backend communicate with Python?
Through a clean REST API bridge (`backend/services/aiService.js`):
1. React frontend requests Express backend with student JWT credentials.
2. Node.js authenticates JWT, queries MongoDB for student enrollments, resolves authorized `teacherIds` and `classes`.
3. Node.js proxies the enriched payload to Python FastAPI (`http://127.0.0.1:8000/api/...`) via `axios` with configured timeouts.
4. Python FastAPI performs FAISS retrieval, LangGraph agent execution, and LLM synthesis.
5. Express persists user & assistant messages in MongoDB and returns the formatted response to React.

## 20. How do you protect private documents?
We implemented strict **Role-Based Access Control (RBAC)**:
- **No Global Vector Search**: Every search query must supply authorized `teacherIds` and `classes`.
- **Identity Derivation**: The student identity is derived exclusively from verified JWT server-side, never from client-provided query parameters.
- **Metadata Filtering**: When FAISS retrieves candidate vectors, chunks whose `teacherId` or `class` does not match the student's active enrollments are discarded.

## 21. What happens when retrieval finds nothing?
If similarity scores are below the threshold or the teacher has not uploaded material for that topic:
- `retriever.py` sets `has_context: false`.
- The system prompt instructs the LLM to notify the student that the topic is not covered in their teacher's current notes.
- In the Agent pipeline, `validate_context` marks `validation_status: fallback` and provides an honest general overview without fabricated citations.

## 22. How would you scale FAISS?
1. **Index Partitioning / HNSW**: Upgrade from `IndexFlatIP` to `IndexHNSW` or `IndexIVFFlat` for sub-millisecond approximate nearest neighbor search over millions of chunks.
2. **Multi-Tenancy Vector Partitioning**: Partition vector indices per teacher or academic subject to reduce search space.
3. **Cloud Migration**: Transition the vector store adapter to a distributed managed vector database like Qdrant, Pinecone, or Milvus cluster.

## 23. How would you improve retrieval?
1. **Hybrid Search (Dense + Sparse)**: Combine FAISS dense embeddings with BM25 keyword search to capture exact formula names and acronyms (e.g., "SRTF", "NP-Complete").
2. **Re-ranking**: Add a Cross-Encoder Re-ranker (e.g., `bge-reranker-large`) on top of candidate chunks before prompt construction.
3. **Query Expansion / HyDE**: Use hypothetical document embeddings or LLM-generated search rewrites for multi-turn student queries.

## 24. What happens when the LLM API goes down?
1. The Python service catches timeout/HTTP exceptions in `app/llm/model.py`.
2. Automatically falls back to the deterministic local educational generator (`FallbackLLMClient`).
3. The Node.js bridge safely catches connection errors and returns a graceful user-friendly error message, preventing crashes or 500 exceptions on the main platform.
