import express from 'express';
import {
  sendJoinRequest,
  getTeacherRequests,
  getStudentRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  getStudentProfileForTeacher
} from '../controllers/joinRequestController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

// Student-secured routes
router.post('/join', protect, authorize('student'), sendJoinRequest);
router.get('/student', protect, authorize('student'), getStudentRequests);

// Teacher-secured routes
router.get('/teacher', protect, authorize('teacher'), getTeacherRequests);
router.put('/:id/accept', protect, authorize('teacher'), acceptJoinRequest);
router.put('/:id/reject', protect, authorize('teacher'), rejectJoinRequest);
router.get('/student-profile/:id', protect, authorize('teacher'), getStudentProfileForTeacher);

export default router;
