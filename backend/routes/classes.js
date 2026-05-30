import express from 'express';
import {
  markAttendance,
  getAttendanceHistory,
  recordFeePayment,
  getFeeLedger,
  deleteAttendance,
  deleteFee
} from '../controllers/classController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

router.use(protect);
router.use(authorize('teacher'));

router.post('/attendance', markAttendance);
router.get('/attendance', getAttendanceHistory);
router.delete('/attendance/:id', deleteAttendance);

router.post('/fees', recordFeePayment);
router.get('/fees', getFeeLedger);
router.delete('/fees/:id', deleteFee);

export default router;
