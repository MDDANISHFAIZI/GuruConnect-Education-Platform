import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Enrollment from '../models/Enrollment.js';
import Note from '../models/Note.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import AIServiceBridge from '../services/aiService.js';

/**
 * Helper: Resolve authorized teacher IDs and classes for the logged in student
 */
const getStudentAuthorizedScope = async (userId) => {
  const student = await Student.findOne({ user: userId });
  if (!student) {
    return { student: null, authorizedTeacherIds: [], authorizedClasses: [] };
  }

  // Find active enrollments
  const activeEnrollments = await Enrollment.find({
    student: student._id,
    status: 'active'
  });

  const teacherIds = new Set();
  const classes = new Set();

  if (student.class) {
    classes.add(student.class);
  }

  // Also include teachers in joinedTeachers list
  if (student.joinedTeachers && student.joinedTeachers.length > 0) {
    student.joinedTeachers.forEach(tId => teacherIds.add(String(tId)));
  }

  activeEnrollments.forEach(enrollment => {
    if (enrollment.teacher) teacherIds.add(String(enrollment.teacher));
    if (enrollment.class) classes.add(enrollment.class);
  });

  return {
    student,
    authorizedTeacherIds: Array.from(teacherIds),
    authorizedClasses: Array.from(classes)
  };
};

/**
 * GET /api/ai/conversations
 */
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(30);
    res.json(conversations);
  } catch (error) {
    console.error('[AI GET CONVERSATIONS ERROR]', error);
    res.status(500).json({ message: { en: 'Error loading conversations', hi: 'बातचीत लोड करने में त्रुटि' } });
  }
};

/**
 * POST /api/ai/conversations
 */
export const createConversation = async (req, res) => {
  try {
    const { title, subject, class: className, mode } = req.body;
    const conversation = await Conversation.create({
      user: req.user._id,
      title: title || 'New Study Session',
      subject: subject || 'General',
      class: className || '',
      mode: mode || 'chat'
    });
    res.status(201).json(conversation);
  } catch (error) {
    console.error('[AI CREATE CONVERSATION ERROR]', error);
    res.status(500).json({ message: { en: 'Error creating conversation', hi: 'बातचीत बनाने में त्रुटि' } });
  }
};

/**
 * GET /api/ai/conversations/:id
 */
export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!conversation) {
      return res.status(404).json({ message: { en: 'Conversation not found', hi: 'बातचीत नहीं मिली' } });
    }

    const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });
    res.json({ conversation, messages });
  } catch (error) {
    console.error('[AI GET CONVERSATION BY ID ERROR]', error);
    res.status(500).json({ message: { en: 'Error retrieving conversation history', hi: 'बातचीत इतिहास प्राप्त करने में त्रुटि' } });
  }
};

/**
 * DELETE /api/ai/conversations/:id
 */
export const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!conversation) {
      return res.status(404).json({ message: { en: 'Conversation not found', hi: 'बातचीत नहीं मिली' } });
    }
    await Message.deleteMany({ conversation: conversation._id });
    res.json({ success: true, message: { en: 'Conversation deleted', hi: 'बातचीत हटा दी गई' } });
  } catch (error) {
    console.error('[AI DELETE CONVERSATION ERROR]', error);
    res.status(500).json({ message: { en: 'Error deleting conversation', hi: 'बातचीत हटाने में त्रुटि' } });
  }
};

/**
 * POST /api/ai/chat
 */
export const chatWithGuruAI = async (req, res) => {
  try {
    const { message, conversationId, materialId, subject } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: { en: 'Message is required', hi: 'संदेश आवश्यक है' } });
    }

    // 1. Resolve student RBAC scope
    const { student, authorizedTeacherIds, authorizedClasses } = await getStudentAuthorizedScope(req.user._id);

    // 2. Resolve or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: req.user._id });
    }
    if (!conversation) {
      conversation = await Conversation.create({
        user: req.user._id,
        title: message.slice(0, 40) + (message.length > 40 ? '...' : ''),
        subject: subject || 'General',
        class: student?.class || '',
        mode: 'chat'
      });
    }

    // 3. Get recent conversation history from MongoDB
    const recentMessages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: -1 })
      .limit(6);
    const conversationHistory = recentMessages.reverse().map(m => ({
      role: m.role,
      content: m.content
    }));

    // 4. Save user message to database
    await Message.create({
      conversation: conversation._id,
      user: req.user._id,
      role: 'user',
      content: message
    });

    // 5. Call Python AI Service with full personalization context
    const studentClass = student?.class || req.body.studentClass || req.body.className || '';
    const curriculum = student?.curriculum || req.body.curriculum || 'CBSE';
    const preferredLanguage = student?.preferredLanguage || req.body.preferredLanguage || 'English';
    const mode = req.body.mode || 'chat';
    const resolvedSubject = subject || req.body.subject || (student?.subjects?.[0] || 'General');

    const aiResponse = await AIServiceBridge.chat({
      message,
      conversationHistory,
      authorizedTeacherIds,
      authorizedClasses,
      materialId,
      subject: resolvedSubject,
      studentClass,
      curriculum,
      preferredLanguage,
      mode
    });

    // 6. Save assistant message to database
    const assistantMessage = await Message.create({
      conversation: conversation._id,
      user: req.user._id,
      role: 'assistant',
      content: aiResponse.answer,
      sources: aiResponse.sources || []
    });

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({
      conversationId: conversation._id,
      message: assistantMessage,
      answer: aiResponse.answer,
      sources: aiResponse.sources || [],
      hasContext: aiResponse.has_context
    });
  } catch (error) {
    console.error('[AI CHAT CONTROLLER ERROR]', error);
    res.status(500).json({ message: { en: 'Failed to process AI chat request', hi: 'AI चैट अनुरोध संसाधित करने में विफल' } });
  }
};

/**
 * POST /api/ai/quiz
 */
export const generateQuiz = async (req, res) => {
  try {
    const { topic, subject, className, numQuestions, difficulty } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: { en: 'Topic is required for quiz generation', hi: 'प्रश्नोत्तरी निर्माण के लिए विषय आवश्यक है' } });
    }

    const { student, authorizedTeacherIds, authorizedClasses } = await getStudentAuthorizedScope(req.user._id);

    const quizData = await AIServiceBridge.generateQuiz({
      topic,
      subject: subject || (student?.subjects?.[0] || 'General'),
      className: className || student?.class || '',
      numQuestions: Number(numQuestions) || 5,
      difficulty: difficulty || 'Medium',
      authorizedTeacherIds,
      authorizedClasses
    });

    if (quizData?.error || !quizData?.questions || quizData.questions.length === 0) {
      return res.status(503).json({
        message: {
          en: quizData?.error || 'GuruAI could not generate questions right now. Please ensure the Python GuruAI service is running on port 8000.',
          hi: 'GuruAI वर्तमान में प्रश्न उत्पन्न नहीं कर सका।'
        }
      });
    }

    res.json(quizData);
  } catch (error) {
    console.error('[AI QUIZ CONTROLLER ERROR]', error);
    res.status(500).json({ message: { en: 'Failed to generate quiz. Please ensure the AI engine is running.', hi: 'प्रश्नोत्तरी बनाने में विफल' } });
  }
};

/**
 * POST /api/ai/explain
 */
export const explainTopic = async (req, res) => {
  try {
    const { topic, mode, subject, className } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: { en: 'Topic is required', hi: 'विषय आवश्यक है' } });
    }

    const { student, authorizedTeacherIds, authorizedClasses } = await getStudentAuthorizedScope(req.user._id);

    const explanation = await AIServiceBridge.explainTopic({
      topic,
      mode: mode || 'simple',
      subject,
      className: className || student?.class || '',
      authorizedTeacherIds,
      authorizedClasses
    });

    if (explanation?.error || !explanation?.explanation) {
      return res.status(503).json({
        message: {
          en: explanation?.error || 'GuruAI could not prepare the lesson. Please ensure the Python GuruAI service is running on port 8000.',
          hi: 'GuruAI वर्तमान में पाठ तैयार नहीं कर सका।'
        }
      });
    }

    res.json(explanation);
  } catch (error) {
    console.error('[AI EXPLAIN CONTROLLER ERROR]', error);
    res.status(500).json({ message: { en: 'Failed to explain topic. Please ensure the AI engine is running.', hi: 'विषय समझाने में विफल' } });
  }
};

/**
 * POST /api/ai/agent
 */
export const runAgent = async (req, res) => {
  try {
    const { query, subject } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ message: { en: 'Query is required', hi: 'क्वेरी आवश्यक है' } });
    }

    const { authorizedTeacherIds, authorizedClasses } = await getStudentAuthorizedScope(req.user._id);

    const agentResult = await AIServiceBridge.runAgent({
      query,
      authorizedTeacherIds,
      authorizedClasses,
      subject
    });

    if (agentResult?.error || !agentResult?.response) {
      return res.status(503).json({
        message: {
          en: agentResult?.error || 'GuruAI engine is currently unreachable. Please ensure the Python GuruAI service is running on port 8000.',
          hi: 'GuruAI सेवा उपलब्ध नहीं है।'
        }
      });
    }

    res.json(agentResult);
  } catch (error) {
    console.error('[AI AGENT CONTROLLER ERROR]', error);
    res.status(500).json({ message: { en: 'Failed to run AI Agent. Please ensure the AI engine is running.', hi: 'AI एजेंट चलाने में विफल' } });
  }
};

/**
 * POST /api/ai/reindex-notes (Teacher endpoint to re-index all uploaded notes into FAISS)
 */
export const reindexTeacherNotes = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id }).populate('user', 'name');
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली' } });
    }

    const notes = await Note.find({ teacher: teacher._id });
    let indexedCount = 0;

    for (const note of notes) {
      const ingestRes = await AIServiceBridge.ingestDocument({
        materialId: note._id,
        teacherId: teacher._id,
        teacherName: teacher.user?.name || 'Teacher',
        className: note.class,
        title: note.title,
        fileUrl: note.fileUrl,
        fileType: note.fileType,
        rawContent: note.rawContent,
        subject: note.subject || ''
      });

      if (ingestRes.success) {
        note.isIndexed = true;
        note.indexedAt = new Date();
        note.chunkCount = ingestRes.chunkCount || 1;
        await note.save();
        indexedCount++;
      }
    }

    res.json({
      success: true,
      totalNotes: notes.length,
      indexedCount,
      message: { en: `Successfully indexed ${indexedCount} notes in GuruAI RAG database.`, hi: `गुरुएआई RAG डेटाबेस में ${indexedCount} नोट्स सफलतापूर्वक अनुक्रमित किए गए।` }
    });
  } catch (error) {
    console.error('[AI REINDEX NOTES ERROR]', error);
    res.status(500).json({ message: { en: 'Failed to reindex notes', hi: 'नोट्स को पुन: अनुक्रमित करने में विफल' } });
  }
};
