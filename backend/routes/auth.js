import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getMe,
  verifyEmail,
  resendOTP,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Email Verification
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);

// Password Recovery
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-otp', verifyForgotPasswordOTP);
router.post('/reset-password', resetPassword);

export default router;
