import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Review from '../models/Review.js';
import AreaRequest from '../models/AreaRequest.js';

// @desc    Get dashboard analytics statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await Teacher.countDocuments();
    const activeTeachers = await Teacher.countDocuments({ status: 'active' });
    const totalReviews = await Review.countDocuments();
    
    // Sum request counts across all area requests
    const areaRequests = await AreaRequest.find();
    const totalAreaRequestsCount = areaRequests.reduce((acc, curr) => acc + curr.requestCount, 0);
    const uniqueAreaHotspots = areaRequests.length;

    res.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      activeTeachers,
      totalReviews,
      totalAreaRequestsCount,
      uniqueAreaHotspots,
      areaRequestsHotlist: areaRequests.sort((a, b) => b.requestCount - a.requestCount).slice(0, 5)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error retrieving analytics stats',
        hi: 'विश्लेषण आँकड़े प्राप्त करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error fetching user list',
        hi: 'उपयोगकर्ता सूची प्राप्त करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Moderate & Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({
        message: {
          en: 'User not found',
          hi: 'उपयोगकर्ता नहीं मिला'
        }
      });
    }

    const userId = userToDelete._id;

    if (userToDelete.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: userId });
      if (teacher) {
        // Delete review references
        await Review.deleteMany({ teacher: teacher._id });
        // Delete profile
        await Teacher.deleteOne({ _id: teacher._id });
      }
    } else if (userToDelete.role === 'student') {
      await Student.deleteOne({ user: userId });
      // Delete any review written by this student
      await Review.deleteMany({ student: userId });
    }

    // Delete base User record
    await User.deleteOne({ _id: userId });

    res.json({
      message: {
        en: 'User and all related profiles deleted',
        hi: 'उपयोगकर्ता और सभी संबंधित प्रोफाइल हटा दिए गए'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error deleting user',
        hi: 'उपयोगकर्ता को हटाने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Get all reviews for moderation
// @route   GET /api/admin/reviews
// @access  Private (Admin)
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({
        path: 'teacher',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error loading reviews list',
        hi: 'समीक्षाएं सूची लोड करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Moderate & delete single review (spam control)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
export const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        message: {
          en: 'Review not found',
          hi: 'समीक्षा नहीं मिली'
        }
      });
    }

    const teacherId = review.teacher;
    await Review.deleteOne({ _id: review._id });

    // Recalculate teacher profile ratings
    const teacher = await Teacher.findById(teacherId);
    if (teacher) {
      const remainingReviews = await Review.find({ teacher: teacherId });
      teacher.reviewCount = remainingReviews.length;
      teacher.rating = remainingReviews.length > 0 
        ? remainingReviews.reduce((acc, item) => item.rating + acc, 0) / remainingReviews.length 
        : 0;
      await teacher.save();
    }

    res.json({
      message: {
        en: 'Review moderated and removed',
        hi: 'समीक्षा को हटा दिया गया'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error deleting review',
        hi: 'समीक्षा को हटाने में सर्वर त्रुटि'
      }
    });
  }
};
