import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { uploadProfileImage } from '../utils/imageUpload.js';
import { sendVerificationEmail, sendForgotPasswordEmail } from '../utils/emailService.js';

// Helper: Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'guruconnect_secret_token_village_town_development_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register new user (Student, Teacher, Admin)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, profilePhoto, profileImage } = req.body;

    if (!name || !email || !password || !role || !phone) {
      return res.status(400).json({
        message: {
          en: 'Please enter all fields',
          hi: 'कृपया सभी फ़ील्ड भरें'
        }
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: {
          en: 'User already exists with this email',
          hi: 'इस ईमेल के साथ उपयोगकर्ता पहले से मौजूद है'
        }
      });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Save profile picture if uploaded
    const photoToProcess = profilePhoto || profileImage || '';
    const uploadResult = photoToProcess ? await uploadProfileImage(photoToProcess) : { url: '', publicId: '' };
    const processedPhoto = uploadResult.url;

    console.log(`[DEBUG LOG] [AUTH REGISTER] Received photo data length: ${photoToProcess ? photoToProcess.length : 0} | Processed URL: "${processedPhoto}"`);

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      profilePhoto: processedPhoto,
      profileImage: processedPhoto,
      profileImagePublicId: uploadResult.publicId,
      emailVerified: false,
      emailOTP: otp,
      emailOTPExpiry: otpExpiry
    });

    if (user) {
      // If student, create student profile with any initial preferences
      if (role === 'student') {
        const studentClass = req.body.class || req.body.studentClass || '';
        const subjects = Array.isArray(req.body.subjects) ? req.body.subjects : [];
        const curriculum = req.body.curriculum || 'CBSE';
        const preferredLanguage = req.body.preferredLanguage || 'English';

        await Student.create({
          user: user._id,
          class: studentClass,
          subjects,
          curriculum,
          preferredLanguage,
          profilePhoto: processedPhoto,
          profileImage: processedPhoto,
          profileImagePublicId: uploadResult.publicId
        });
      }
      
      // If teacher, create a skeletal teacher profile (they will populate it in dashboard)
      if (role === 'teacher') {
        await Teacher.create({
          user: user._id,
          profilePhoto: processedPhoto,
          profileImage: processedPhoto,
          profileImagePublicId: uploadResult.publicId,
          teachesFrom: 1,
          teachesTo: 12,
          subjects: ['Pending General Subjects'],
          classes: ['All'],
          fees: 500,
          timings: 'Flexible',
          qualification: 'Graduate',
          experience: 0,
          mode: 'offline',
          address: 'Update Address',
          location: {
            type: 'Point',
            coordinates: [77.2090, 28.6139] // Default coordinates: New Delhi
          }
        });
      }

      // Send OTP verification email via Resend
      try {
        await sendVerificationEmail(email, name, otp);
      } catch (mailError) {
        console.error('[MAIL ERROR] Failed to send signup verification email:', mailError);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        profileImage: user.profileImage,
        profileImagePublicId: user.profileImagePublicId,
        emailVerified: user.emailVerified,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(400).json({
        message: {
          en: 'Invalid user data',
          hi: 'अमान्य उपयोगकर्ता डेटा'
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error during registration',
        hi: 'पंजीकरण के दौरान सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password, role: expectedRole } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcryptjs.compare(password, user.password))) {
      // Validate role if specified
      if (expectedRole && user.role !== expectedRole) {
        console.log(`[DEBUG LOG] [AUTH LOGIN BLOCKED] Mismatch - Found Role: "${user.role}" | Expected Role: "${expectedRole}" for Email: "${email}"`);
        return res.status(401).json({
          message: {
            en: 'Invalid email or password',
            hi: 'अमान्य ईमेल या पासवर्ड'
          }
        });
      }

      // Update lastLogin
      user.lastLogin = new Date();
      await user.save();

      // If user is a teacher, automatically mark them as active again and update lastActive
      if (user.role === 'teacher') {
        const teacherProfile = await Teacher.findOne({ user: user._id });
        if (teacherProfile) {
          teacherProfile.status = 'active';
          teacherProfile.lastActive = new Date();
          await teacherProfile.save();
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        profileImage: user.profileImage,
        profileImagePublicId: user.profileImagePublicId,
        emailVerified: user.emailVerified,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({
        message: {
          en: 'Invalid email or password',
          hi: 'अमान्य ईमेल या पासवर्ड'
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error during login',
        hi: 'लॉगिन के दौरान सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error fetching user details',
        hi: 'उपयोगकर्ता विवरण प्राप्त करने में सर्ver त्रुटि'
      }
    });
  }
};

// @desc    Verify Email via OTP
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: { en: 'Email and OTP are required', hi: 'ईमेल और ओटीपी आवश्यक हैं' } });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: { en: 'User not found', hi: 'उपयोगकर्ता नहीं मिला' } });
    }

    if (user.emailOTP !== otp.trim()) {
      return res.status(400).json({ message: { en: 'Invalid verification code', hi: 'अमान्य सत्यापन कोड' } });
    }

    if (new Date() > user.emailOTPExpiry) {
      return res.status(400).json({ message: { en: 'OTP has expired. Please request a new one.', hi: 'ओटीपी की समय सीमा समाप्त हो गई है। कृपया एक नया अनुरोध करें।' } });
    }

    user.emailVerified = true;
    user.emailOTP = '';
    user.emailOTPExpiry = null;
    await user.save();

    res.json({ success: true, message: { en: 'Email verified successfully!', hi: 'ईमेल सफलतापूर्वक सत्यापित किया गया!' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error during email verification', hi: 'ईमेल सत्यापन के दौरान सर्वर त्रुटि' } });
  }
};

// @desc    Resend Email Verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: { en: 'Email is required', hi: 'ईमेल आवश्यक है' } });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: { en: 'User not found', hi: 'उपयोगकर्ता नहीं मिला' } });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.emailOTP = otp;
    user.emailOTPExpiry = otpExpiry;
    await user.save();

    try {
      await sendVerificationEmail(email, user.name, otp);
    } catch (mailError) {
      console.error('[MAIL ERROR] Failed to send resend verification email:', mailError);
    }

    res.json({ success: true, message: { en: 'Verification OTP sent to your email!', hi: 'सत्यापन ओटीपी आपके ईमेल पर भेजा गया!' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error during OTP resend', hi: 'ओटीपी पुनः भेजने के दौरान सर्वर त्रुटि' } });
  }
};

// @desc    Forgot Password Request (Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: { en: 'Email is required', hi: 'ईमेल आवश्यक है' } });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: { en: 'User not found with this email', hi: 'इस ईमेल के साथ उपयोगकर्ता नहीं मिला' } });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.forgotPasswordOTP = otp;
    user.forgotPasswordOTPExpiry = otpExpiry;
    await user.save();

    try {
      await sendForgotPasswordEmail(email, user.name, otp);
    } catch (mailError) {
      console.error('[MAIL ERROR] Failed to send forgot password email:', mailError);
    }

    res.json({ success: true, message: { en: 'Password reset OTP sent to your email!', hi: 'पासवर्ड रीसेट ओटीपी आपके ईमेल पर भेजा गया!' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error processing forgot password request', hi: 'भूल गए पासवर्ड अनुरोध को संसाधित करने में सर्वर त्रुटि' } });
  }
};

// @desc    Verify Forgot Password OTP
// @route   POST /api/auth/verify-forgot-otp
// @access  Public
export const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: { en: 'Email and OTP are required', hi: 'ईमेल और ओटीपी आवश्यक हैं' } });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: { en: 'User not found', hi: 'उपयोगकर्ता नहीं मिला' } });
    }

    if (user.forgotPasswordOTP !== otp.trim()) {
      return res.status(400).json({ message: { en: 'Invalid recovery code', hi: 'अमान्य पुनर्प्राप्ति कोड' } });
    }

    if (new Date() > user.forgotPasswordOTPExpiry) {
      return res.status(400).json({ message: { en: 'OTP has expired. Please request a new one.', hi: 'ओटीपी समाप्त हो गया है। कृपया एक नया अनुरोध करें।' } });
    }

    res.json({ success: true, message: { en: 'OTP verified successfully!', hi: 'ओटीपी सफलतापूर्वक सत्यापित किया गया!' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error verifying password reset OTP', hi: 'पासवर्ड रीसेट ओटीपी सत्यापित करने में सर्वर त्रुटि' } });
  }
};

// @desc    Reset Password via Recovery OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: { en: 'All fields are required', hi: 'सभी फ़ील्ड आवश्यक हैं' } });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: { en: 'User not found', hi: 'उपयोगकर्ता नहीं मिला' } });
    }

    if (user.forgotPasswordOTP !== otp.trim()) {
      return res.status(400).json({ message: { en: 'Invalid recovery code', hi: 'अमान्य पुनर्प्राप्ति कोड' } });
    }

    if (new Date() > user.forgotPasswordOTPExpiry) {
      return res.status(400).json({ message: { en: 'OTP has expired. Please request a new one.', hi: 'ओटीपी समाप्त हो गया है। कृपया एक नया अनुरोध करें।' } });
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    user.password = hashedPassword;
    user.forgotPasswordOTP = '';
    user.forgotPasswordOTPExpiry = null;
    await user.save();

    res.json({ success: true, message: { en: 'Password reset successfully! You can now log in.', hi: 'पासवर्ड सफलतापूर्वक रीसेट किया गया! अब आप लॉगिन कर सकते हैं।' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error resetting password', hi: 'पासवर्ड रीसेट करने में सर्वर त्रुटि' } });
  }
};
