import express from 'express';
import {
  getTeacherProfile,
  getMyProfile,
  updateTeacherProfile,
  getNearbyTeachers,
  addAreaRequest,
  addReview,
  getTeacherReviews,
  reverseGeocodeBackend,
  searchGeocodeBackend
} from '../controllers/teacherController.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/role.js';

const router = express.Router();

// Public routes
router.get('/profile/:id', getTeacherProfile);
router.post('/nearby', getNearbyTeachers);
router.post('/notify-area', addAreaRequest);
router.get('/reviews/:id', getTeacherReviews);
router.get('/geocode/reverse', reverseGeocodeBackend);
router.get('/geocode/search', searchGeocodeBackend);

// Protected routes (Teacher only)
router.get('/my-profile', protect, authorize('teacher'), getMyProfile);
router.put('/profile', protect, authorize('teacher'), updateTeacherProfile);

// Protected routes (Student only)
router.post('/review/:id', protect, authorize('student'), addReview);

export default router;
