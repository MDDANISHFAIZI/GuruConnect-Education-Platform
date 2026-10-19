import express from 'express';
import {
  getConversations,
  createConversation,
  getConversationById,
  deleteConversation,
  chatWithGuruAI,
  generateQuiz,
  explainTopic,
  runAgent,
  reindexTeacherNotes
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

// Require JWT authentication on all AI routes
router.use(protect);

// Conversation management
router.get('/conversations', authorize('student'), getConversations);
router.post('/conversations', authorize('student'), createConversation);
router.get('/conversations/:id', authorize('student'), getConversationById);
router.delete('/conversations/:id', authorize('student'), deleteConversation);

// Core AI features for students
router.post('/chat', authorize('student'), chatWithGuruAI);
router.post('/quiz', authorize('student'), generateQuiz);
router.post('/explain', authorize('student'), explainTopic);
router.post('/agent', authorize('student'), runAgent);

// Teacher study material indexing
router.post('/reindex-teacher-notes', authorize('teacher'), reindexTeacherNotes);

export default router;
