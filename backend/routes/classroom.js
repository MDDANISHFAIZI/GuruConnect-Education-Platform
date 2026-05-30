import express from 'express';
import {
  uploadNote,
  getTeacherNotes,
  getStudentNotes,
  deleteNote,
  askDoubt,
  replyToDoubt,
  getTeacherDoubts,
  getStudentDoubts,
  createHomework,
  getTeacherHomework,
  getStudentHomework,
  deleteHomework,
  createAnnouncement,
  getTeacherAnnouncements,
  getStudentAnnouncements,
  deleteAnnouncement,
  getStudentAttendanceMetrics
} from '../controllers/classroomController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

router.use(protect);

// ==========================================
// 1. NOTES SYSTEM ROUTES
// ==========================================
router.post('/notes', authorize('teacher'), uploadNote);
router.get('/notes/teacher', authorize('teacher'), getTeacherNotes);
router.get('/notes/student', authorize('student'), getStudentNotes);
router.delete('/notes/:id', authorize('teacher'), deleteNote);

// ==========================================
// 2. DOUBT SYSTEM ROUTES
// ==========================================
router.post('/doubts', authorize('student'), askDoubt);
router.get('/doubts/student', authorize('student'), getStudentDoubts);
router.get('/doubts/teacher', authorize('teacher'), getTeacherDoubts);
router.put('/doubts/reply/:id', authorize('teacher'), replyToDoubt);

// ==========================================
// 3. HOMEWORK SYSTEM ROUTES
// ==========================================
router.post('/homework', authorize('teacher'), createHomework);
router.get('/homework/teacher', authorize('teacher'), getTeacherHomework);
router.get('/homework/student', authorize('student'), getStudentHomework);
router.delete('/homework/:id', authorize('teacher'), deleteHomework);

// ==========================================
// 4. ANNOUNCEMENTS SYSTEM ROUTES
// ==========================================
router.post('/announcements', authorize('teacher'), createAnnouncement);
router.get('/announcements/teacher', authorize('teacher'), getTeacherAnnouncements);
router.get('/announcements/student', authorize('student'), getStudentAnnouncements);
router.delete('/announcements/:id', authorize('teacher'), deleteAnnouncement);

// ==========================================
// 5. ATTENDANCE METRICS ROUTES
// ==========================================
router.get('/attendance/student', authorize('student'), getStudentAttendanceMetrics);

export default router;
