import express from 'express';
import {
  lookupTeacherByCode,
  connectWithCode,
  claimOfflineRecord,
  getTeacherConnections,
  respondToConnection
} from '../controllers/connectionController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

router.use(protect);

// Student endpoints
router.get('/lookup/:code', authorize('student'), lookupTeacherByCode);
router.post('/connect', authorize('student'), connectWithCode);
router.post('/claim', authorize('student'), claimOfflineRecord);

// Teacher endpoints
router.get('/teacher', authorize('teacher'), getTeacherConnections);
router.put('/respond/:id', authorize('teacher'), respondToConnection);

export default router;
