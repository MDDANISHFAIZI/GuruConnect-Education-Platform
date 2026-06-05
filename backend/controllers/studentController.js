import Student from '../models/Student.js';
import Favorite from '../models/Favorite.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Fee from '../models/Fee.js';
import { uploadProfileImage } from '../utils/imageUpload.js';

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private (Student)
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'name email phone profilePhoto profileImage');
    if (!student) {
      return res.status(404).json({
        message: {
          en: 'Student profile not found',
          hi: 'छात्र प्रोफ़ाइल नहीं मिली'
        }
      });
    }

    // Dynamically query unique teachers from active enrollments
    const activeEnrollments = await Enrollment.find({ student: student._id, status: 'active' })
      .populate({
        path: 'teacher',
        populate: {
          path: 'user',
          select: 'name email phone profilePhoto profileImage'
        }
      });

    const seenTeachers = new Set();
    const dynamicTeachers = [];
    for (const enr of activeEnrollments) {
      if (enr.teacher && !seenTeachers.has(enr.teacher._id.toString())) {
        seenTeachers.add(enr.teacher._id.toString());
        dynamicTeachers.push(enr.teacher);
      }
    }

    const studentObj = student.toObject();
    studentObj.joinedTeachers = dynamicTeachers;
    res.json(studentObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error retrieving student details',
        hi: 'छात्र विवरण प्राप्त करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (Student)
export const updateStudentProfile = async (req, res) => {
  try {
    const { class: studentClass, school, address, coordinates, profilePhoto, profileImage } = req.body;
    
    let student = await Student.findOne({ user: req.user._id });
    if (!student) {
      student = new Student({ user: req.user._id });
    }

    if (studentClass !== undefined) student.class = studentClass;
    if (school !== undefined) student.school = school;
    if (address !== undefined) student.address = address;

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      student.location = {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])]
      };
    }

    // Process profile photo if uploaded
    const photoToProcess = profilePhoto !== undefined ? profilePhoto : profileImage;
    let processedPhoto = student.profilePhoto || '';
    let processedPublicId = student.profileImagePublicId || '';
    
    if (photoToProcess !== undefined) {
      const uploadResult = await uploadProfileImage(photoToProcess, student.profileImage, student.profileImagePublicId);
      processedPhoto = uploadResult.url;
      processedPublicId = uploadResult.publicId;
      student.profilePhoto = processedPhoto;
      student.profileImage = processedPhoto;
      student.profileImagePublicId = processedPublicId;
    }

    await student.save();

    console.log(`[DEBUG LOG] [STUDENT PROFILE UPDATE] Student ID: ${student._id} | Photo successfully saved: "${processedPhoto}"`);

    // Update name, phone, profilePhoto and profileImage in base User model too
    if (req.body.name || req.body.phone || photoToProcess !== undefined) {
      const user = await User.findById(req.user._id);
      if (user) {
        if (req.body.name) user.name = req.body.name;
        if (req.body.phone) user.phone = req.body.phone;
        if (photoToProcess !== undefined) {
          user.profilePhoto = processedPhoto;
          user.profileImage = processedPhoto;
          user.profileImagePublicId = processedPublicId;
        }
        await user.save();
        console.log(`[DEBUG LOG] [STUDENT USER UPDATE] User ID: ${user._id} | Photo successfully saved: "${processedPhoto}"`);
      }
    }

    const updatedStudent = await Student.findOne({ user: req.user._id })
      .populate('user', 'name email phone profilePhoto profileImage profileImagePublicId');

    // Dynamically query unique teachers from active enrollments
    const activeEnrollments = await Enrollment.find({ student: updatedStudent._id, status: 'active' })
      .populate({
        path: 'teacher',
        populate: {
          path: 'user',
          select: 'name email phone profilePhoto profileImage profileImagePublicId'
        }
      });

    const seenTeachers = new Set();
    const dynamicTeachers = [];
    for (const enr of activeEnrollments) {
      if (enr.teacher && !seenTeachers.has(enr.teacher._id.toString())) {
        seenTeachers.add(enr.teacher._id.toString());
        dynamicTeachers.push(enr.teacher);
      }
    }

    const studentObj = updatedStudent.toObject();
    studentObj.joinedTeachers = dynamicTeachers;
    res.json(studentObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error updating student profile',
        hi: 'छात्र प्रोफ़ाइल अपडेट करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Toggle favorite teacher bookmark
// @route   POST /api/students/favorite/:teacherId
// @access  Private (Student)
export const toggleFavorite = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const favoriteExists = await Favorite.findOne({
      student: req.user._id,
      teacher: teacherId
    });

    if (favoriteExists) {
      await Favorite.deleteOne({ _id: favoriteExists._id });
      return res.json({
        favorited: false,
        message: {
          en: 'Removed from favorites',
          hi: 'पसंदीदा सूची से हटाया गया'
        }
      });
    } else {
      await Favorite.create({
        student: req.user._id,
        teacher: teacherId
      });
      return res.json({
        favorited: true,
        message: {
          en: 'Added to favorites',
          hi: 'पसंदीदा सूची में जोड़ा गया'
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error toggling favorite bookmark',
        hi: 'पसंदीदा टॉगल करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Get all favorite teachers bookmarks
// @route   GET /api/students/favorites
// @access  Private (Student)
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ student: req.user._id }).populate({
      path: 'teacher',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    });
    
    // Extract teacher profiles
    const bookmarkedTeachers = favorites.map(f => f.teacher).filter(Boolean);
    res.json(bookmarkedTeachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error fetching favorites list',
        hi: 'पसंदीदा सूची प्राप्त करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Get fee receipt history for the logged-in student
// @route   GET /api/students/fees
// @access  Private (Student)
export const getStudentFees = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({
        message: {
          en: 'Student profile not found',
          hi: 'छात्र प्रोफ़ाइल नहीं मिली'
        }
      });
    }

    // Find all fee payments strictly owned by this authenticated student
    const fees = await Fee.find({ student: student._id })
      .populate({
        path: 'teacher',
        select: 'address villageOrArea locality city state',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .sort({ month: -1 });

    res.json(fees);
  } catch (error) {
    console.error('[STUDENT FEES GET ERROR]', error);
    res.status(500).json({
      message: {
        en: 'Server error retrieving fee receipt ledger',
        hi: 'फीस रसीद बहीखाता प्राप्त करने में सर्वर त्रुटि'
      }
    });
  }
};
