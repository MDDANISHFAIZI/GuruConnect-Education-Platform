import express from 'express';
import {
  getStats,
  getAllUsers,
  deleteUser,
  getAllReviews,
  deleteReviewAdmin
} from '../controllers/adminController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReviewAdmin);

export default router;
