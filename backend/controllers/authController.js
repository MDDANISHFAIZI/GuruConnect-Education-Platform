import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import { saveBase64Image } from '../utils/imageUpload.js';

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
    const processedPhoto = photoToProcess ? saveBase64Image(photoToProcess) : '';

    console.log(`[DEBUG LOG] [AUTH REGISTER] Received photo data length: ${photoToProcess ? photoToProcess.length : 0} | Processed URL: "${processedPhoto}"`);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      profilePhoto: processedPhoto,
      profileImage: processedPhoto
    });

    if (user) {
      // If student, create empty student profile
      if (role === 'student') {
        await Student.create({
          user: user._id
        });
      }
      
      // If teacher, create a skeletal teacher profile (they will populate it in dashboard)
      if (role === 'teacher') {
        await Teacher.create({
          user: user._id,
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

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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
