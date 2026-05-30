import Attendance from '../models/Attendance.js';
import Fee from '../models/Fee.js';
import Teacher from '../models/Teacher.js';
import StudentEnrollment from '../models/StudentEnrollment.js';

// Helper: Get requesting user's Teacher ID
const getTeacherIdHelper = async (userId) => {
  const teacher = await Teacher.findOne({ user: userId });
  if (!teacher) {
    throw new Error('Teacher profile not found');
  }
  return teacher._id;
};

// @desc    Mark attendance for a student
// @route   POST /api/classes/attendance
// @access  Private (Teacher)
export const markAttendance = async (req, res) => {
  try {
    const { studentName, date, status, notes } = req.body;

    if (!studentName || !date || !status) {
      return res.status(400).json({
        message: {
          en: 'Please provide student name, date, and attendance status',
          hi: 'कृपया छात्र का नाम, तिथि और उपस्थिति स्थिति प्रदान करें'
        }
      });
    }

    const teacherId = await getTeacherIdHelper(req.user._id);

    const record = await Attendance.create({
      teacher: teacherId,
      studentName,
      date: new Date(date),
      status,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: {
        en: 'Attendance marked successfully',
        hi: 'उपस्थिति सफलतापूर्वक दर्ज की गई'
      },
      record
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: error.message || 'Server error marking attendance',
        hi: error.message || 'उपस्थिति दर्ज करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Get attendance history for a teacher
// @route   GET /api/classes/attendance
// @access  Private (Teacher)
export const getAttendanceHistory = async (req, res) => {
  try {
    const teacherId = await getTeacherIdHelper(req.user._id);
    const records = await Attendance.find({ teacher: teacherId }).sort({ date: -1, studentName: 1 });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error retrieving attendance logs',
        hi: 'उपस्थिति रिकॉर्ड प्राप्त करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Record/Update student fee log
// @route   POST /api/classes/fees
// @access  Private (Teacher)
export const recordFeePayment = async (req, res) => {
  try {
    const { studentName, amount, month, status, paidDate } = req.body;

    if (!studentName || !amount || !month || !status) {
      return res.status(400).json({
        message: {
          en: 'Please fill out student name, amount, month, and payment status',
          hi: 'कृपया छात्र का नाम, राशि, महीना और भुगतान की स्थिति भरें'
        }
      });
    }

    const teacherId = await getTeacherIdHelper(req.user._id);

    // Enforce strict roster checks: find StudentEnrollment registry for this student and teacher
    const enrollment = await StudentEnrollment.findOne({ teacher: teacherId, name: studentName });
    if (!enrollment) {
      return res.status(404).json({
        message: {
          en: 'No student enrollment record found under this name. Please add student to roster first.',
          hi: 'इस नाम के अंतर्गत कोई छात्र नामांकन रिकॉर्ड नहीं मिला। कृपया पहले छात्र को रोस्टर में जोड़ें।'
        }
      });
    }

    // Look for existing record for the same student and month to update or create
    let feeRecord = await Fee.findOne({
      teacher: teacherId,
      studentName,
      month
    });

    if (feeRecord) {
      feeRecord.amount = Number(amount);
      feeRecord.status = status;
      feeRecord.paidDate = status === 'paid' ? (paidDate ? new Date(paidDate) : new Date()) : undefined;
      feeRecord.studentEnrollment = enrollment._id;
      feeRecord.student = enrollment.student || null;
      await feeRecord.save();
    } else {
      feeRecord = await Fee.create({
        teacher: teacherId,
        studentEnrollment: enrollment._id,
        student: enrollment.student || null,
        studentName,
        amount: Number(amount),
        month,
        status,
        paidDate: status === 'paid' ? (paidDate ? new Date(paidDate) : new Date()) : undefined
      });
    }

    res.status(201).json({
      success: true,
      message: {
        en: 'Fee logged successfully',
        hi: 'फीस रिकॉर्ड सफलतापूर्वक सहेजा गया'
      },
      record: feeRecord
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error saving fee records',
        hi: 'फीस रिकॉर्ड सहेजने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Get fee ledger logs for a teacher
// @route   GET /api/classes/fees
// @access  Private (Teacher)
export const getFeeLedger = async (req, res) => {
  try {
    const teacherId = await getTeacherIdHelper(req.user._id);
    const records = await Fee.find({ teacher: teacherId }).sort({ month: -1, studentName: 1 });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error retrieving fee logs',
        hi: 'फीस रिकॉर्ड प्राप्त करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/classes/attendance/:id
// @access  Private (Teacher)
export const deleteAttendance = async (req, res) => {
  try {
    const teacherId = await getTeacherIdHelper(req.user._id);
    const record = await Attendance.findOneAndDelete({ _id: req.params.id, teacher: teacherId });
    if (!record) {
      return res.status(404).json({
        message: {
          en: 'Attendance log not found or unauthorized',
          hi: 'उपस्थिति लॉग नहीं मिला या आप अधिकृत नहीं हैं'
        }
      });
    }
    res.json({
      message: {
        en: 'Attendance record deleted',
        hi: 'उपस्थिति रिकॉर्ड हटा दिया गया'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error deleting attendance',
        hi: 'उपस्थिति हटाने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Delete fee record
// @route   DELETE /api/classes/fees/:id
// @access  Private (Teacher)
export const deleteFee = async (req, res) => {
  try {
    const teacherId = await getTeacherIdHelper(req.user._id);
    const record = await Fee.findOneAndDelete({ _id: req.params.id, teacher: teacherId });
    if (!record) {
      return res.status(404).json({
        message: {
          en: 'Fee record not found or unauthorized',
          hi: 'फीस रिकॉर्ड नहीं मिला या आप अधिकृत नहीं हैं'
        }
      });
    }
    res.json({
      message: {
        en: 'Fee record deleted',
        hi: 'फीस रिकॉर्ड हटा दिया गया'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error deleting fee',
        hi: 'फीस हटाने में सर्वर त्रुटि'
      }
    });
  }
};
