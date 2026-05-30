import express from 'express';
import {
  getEnrollments,
  manuallyAddStudent,
  markRequestPaid,
  changeEnrollmentStatus,
  saveDailyAttendance,
  logMonthlyFee,
  deleteEnrollment,
  getStudentFullHistory
} from '../controllers/enrollmentController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

// All routes are private and restricted strictly to registered 'teacher' users
router.use(protect);
router.use(authorize('teacher'));

router.get('/', getEnrollments);
router.post('/manual', manuallyAddStudent);
router.put('/:id/mark-paid', markRequestPaid);
router.put('/:id/status', changeEnrollmentStatus);
router.post('/attendance', saveDailyAttendance);
router.post('/fees', logMonthlyFee);
router.delete('/:id', deleteEnrollment);
router.get('/:id/history', getStudentFullHistory);

export default router;
