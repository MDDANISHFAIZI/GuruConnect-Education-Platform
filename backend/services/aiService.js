import axios from 'axios';

const getAiServiceUrl = () => process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

class AIServiceBridge {
  /**
   * Ingest a study note/document into FAISS vector store
   */
  static async ingestDocument({ materialId, teacherId, teacherName, className, title, fileUrl, fileType, rawContent, subject }) {
    try {
      const url = `${getAiServiceUrl()}/api/documents/ingest`;
      const res = await axios.post(url, {
        materialId: String(materialId),
        teacherId: String(teacherId),
        teacherName: teacherName || 'Teacher',
        class: className,
        title,
        fileUrl: fileUrl || '',
        fileType: fileType || 'pdf',
        rawContent: rawContent || '',
        subject: subject || ''
      }, { timeout: 30000 });
      return res.data;
    } catch (error) {
      console.warn(`[AI SERVICE INGEST WARNING]: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete document chunks from FAISS vector store
   */
  static async deleteDocument(materialId) {
    try {
      const url = `${getAiServiceUrl()}/api/documents/${materialId}`;
      const res = await axios.delete(url, { timeout: 10000 });
      return res.data;
    } catch (error) {
      console.warn(`[AI SERVICE DELETE WARNING]: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform Access-Controlled RAG Chat
   */
  static async chat({
    message,
    conversationHistory,
    authorizedTeacherIds,
    authorizedClasses,
    materialId,
    subject,
    studentClass,
    curriculum,
    preferredLanguage,
    mode
  }) {
    try {
      const url = `${getAiServiceUrl()}/api/chat`;
      const res = await axios.post(url, {
        message,
        conversationHistory,
        authorizedTeacherIds: (authorizedTeacherIds || []).map(String),
        authorizedClasses: authorizedClasses || [],
        materialId,
        subject,
        studentClass,
        curriculum,
        preferredLanguage,
        mode
      }, { timeout: 45000 });
      return res.data;
    } catch (error) {
      console.error(`[AI SERVICE CHAT ERROR]: ${error.message}`);
      return {
        error: "Unable to reach the GuruAI engine. Please ensure the Python GuruAI service is running on port 8000.",
        answer: "GuruAI is currently unable to reach the AI engine. Please ensure the Python GuruAI service is running on port 8000.",
        sources: [],
        has_context: false
      };
    }
  }

  /**
   * Generate structured AI Quiz
   */
  static async generateQuiz({ topic, subject, className, numQuestions, difficulty, authorizedTeacherIds, authorizedClasses }) {
    try {
      const url = `${getAiServiceUrl()}/api/quiz`;
      const res = await axios.post(url, {
        topic,
        subject,
        className,
        numQuestions: numQuestions || 5,
        difficulty: difficulty || 'Medium',
        authorizedTeacherIds: authorizedTeacherIds.map(String),
        authorizedClasses
      }, { timeout: 45000 });
      return res.data;
    } catch (error) {
      console.error(`[AI SERVICE QUIZ ERROR]: ${error.message}`);
      return {
        error: "Unable to reach the GuruAI engine. Please ensure the Python GuruAI service is running on port 8000.",
        topic,
        subject: subject || 'General',
        difficulty: difficulty || 'Medium',
        questions: [],
        sources: []
      };
    }
  }

  /**
   * Explain a topic in specified pedagogical mode
   */
  static async explainTopic({ topic, mode, subject, className, authorizedTeacherIds, authorizedClasses }) {
    try {
      const url = `${getAiServiceUrl()}/api/explain`;
      const res = await axios.post(url, {
        topic,
        mode: mode || 'simple',
        subject,
        className,
        authorizedTeacherIds: authorizedTeacherIds.map(String),
        authorizedClasses
      }, { timeout: 45000 });
      return res.data;
    } catch (error) {
      console.error(`[AI SERVICE EXPLAIN ERROR]: ${error.message}`);
      return {
        error: "Unable to reach the GuruAI engine. Please ensure the Python GuruAI service is running on port 8000.",
        topic,
        mode,
        explanation: "",
        sources: [],
        has_context: false
      };
    }
  }

  /**
   * Run LangGraph Agent
   */
  static async runAgent({ query, conversationHistory, authorizedTeacherIds, authorizedClasses, subject }) {
    try {
      const url = `${getAiServiceUrl()}/api/agent`;
      const res = await axios.post(url, {
        query,
        conversationHistory,
        authorizedTeacherIds: authorizedTeacherIds.map(String),
        authorizedClasses,
        subject
      }, { timeout: 45000 });
      return res.data;
    } catch (error) {
      console.error(`[AI SERVICE AGENT ERROR]: ${error.message}`);
      return {
        error: "Unable to reach the GuruAI engine. Please ensure the Python GuruAI service is running on port 8000.",
        response: "",
        intent: "error",
        selectedTool: null,
        sources: [],
        validationStatus: "error",
        executionSteps: [],
        toolOutput: null
      };
    }
  }
}

export default AIServiceBridge;
