import express from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  toggleFavorite,
  getFavorites,
  getStudentFees
} from '../controllers/studentController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.post('/favorite/:teacherId', toggleFavorite);
router.get('/favorites', getFavorites);
router.get('/fees', getStudentFees);

export default router;
