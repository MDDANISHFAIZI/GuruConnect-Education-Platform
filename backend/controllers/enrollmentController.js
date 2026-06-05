import Enrollment from '../models/Enrollment.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Fee from '../models/Fee.js';
import TeacherStudentConnection from '../models/TeacherStudentConnection.js';
import { createNotification } from '../utils/notificationHelper.js';

// @desc    Get all student enrollments (cohorts) for active teacher
// @route   GET /api/enrollments
// @access  Private (Teacher)
export const getEnrollments = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const enrollments = await Enrollment.find({ teacher: teacher._id })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email phone profilePhoto profileImage' }
      })
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error retrieving student rosters', hi: 'छात्र सूची प्राप्त करने में सर्वर त्रुटि' } });
  }
};

// @desc    Manually add offline student directly as active
// @route   POST /api/enrollments/manual
// @access  Private (Teacher)
export const manuallyAddStudent = async (req, res) => {
  try {
    const { name, class: studentClass, parentPhone, studentPhone, subject, fees, joiningDate, notes, status } = req.body;

    if (!name || !studentClass || !subject || fees === undefined) {
      return res.status(400).json({
        message: {
          en: 'Name, Class, Subject, and Fees are required fields.',
          hi: 'नाम, कक्षा, विषय और फीस आवश्यक फ़ील्ड हैं।'
        }
      });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const enrollmentStatus = status === 'pending' ? 'pending' : 'active';

    // Create Manual Enrollment
    const enrollment = await Enrollment.create({
      teacher: teacher._id,
      name,
      class: studentClass,
      subject,
      fees: Number(fees),
      parentPhone: parentPhone || '',
      studentPhone: studentPhone || '',
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      status: enrollmentStatus,
      type: 'manual',
      notes: notes || ''
    });

    // Automatically create initial paid month record under ledger if active
    if (enrollmentStatus === 'active') {
      const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); // e.g. "May 2026"
      await Fee.create({
        teacher: teacher._id,
        studentEnrollment: enrollment._id,
        student: null,
        studentName: name,
        class: enrollment.class,
        amount: Number(fees),
        month: currentMonth,
        status: 'paid',
        paidDate: new Date(),
        dueDate: new Date(),
        dueAmount: 0
      });
    }

    res.status(201).json({
      success: true,
      message: {
        en: 'Offline manual student enrolled successfully as active attendee.',
        hi: 'ऑफलाइन छात्र को सक्रिय छात्र के रूप में सफलतापूर्वक नामांकित किया गया।'
      },
      enrollment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error registering manual student', hi: 'मैन्युअल छात्र को पंजीकृत करने में सर्वर त्रुटि' } });
  }
};

// @desc    Approve/Confirm pending student by marking fees as paid
// @route   PUT /api/enrollments/:id/mark-paid
// @access  Private (Teacher)
export const markRequestPaid = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate({
      path: 'student',
      populate: { path: 'user' }
    });
    if (!enrollment) {
      return res.status(404).json({ message: { en: 'Enrollment registry not found.', hi: 'नामांकन रजिस्ट्री नहीं मिली।' } });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || enrollment.teacher.toString() !== teacher._id.toString()) {
      return res.status(401).json({ message: { en: 'Not authorized to manage this student', hi: 'इस छात्र को प्रबंधित करने के लिए अधिकृत नहीं हैं' } });
    }

    // Update status to active
    enrollment.status = 'active';
    await enrollment.save();

    // Log the fee as paid in the Monthly Ledger
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    await Fee.create({
      teacher: teacher._id,
      studentEnrollment: enrollment._id,
      student: enrollment.student || null,
      studentName: enrollment.name,
      class: enrollment.class,
      amount: enrollment.fees,
      month: currentMonth,
      status: 'paid',
      paidDate: new Date(),
      dueDate: new Date(),
      dueAmount: 0
    });

    if (enrollment.student && enrollment.student.user) {
      await createNotification({
        userId: enrollment.student.user._id.toString(),
        title: 'Enrollment Confirmed',
        message: `Your enrollment in ${req.user.name}'s ${enrollment.subject} class has been confirmed. You are now an active student.`,
        type: 'MESSAGE',
        link: '/student?tab=classroom'
      });
    }

    res.json({
      success: true,
      message: {
        en: 'Student marked as active. Roster payment registered successfully.',
        hi: 'छात्र को सक्रिय के रूप में चिह्नित किया गया। रोस्टर भुगतान सफलतापूर्वक पंजीकृत किया गया।'
      },
      enrollment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error confirming student payment', hi: 'छात्र भुगतान की पुष्टि करने में सर्वर त्रुटि' } });
  }
};

// @desc    Toggle student status or remove
// @route   PUT /api/enrollments/:id/status
// @access  Private (Teacher)
export const changeEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'inactive'
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: { en: 'Invalid status parameter.', hi: 'अमान्य स्थिति पैरामीटर।' } });
    }

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: { en: 'Enrollment registry not found.', hi: 'नामांकन रजिस्ट्री नहीं मिली।' } });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || enrollment.teacher.toString() !== teacher._id.toString()) {
      return res.status(401).json({ message: { en: 'Not authorized to manage this student', hi: 'इस छात्र को प्रबंधित करने के लिए अधिकृत नहीं हैं' } });
    }

    enrollment.status = status;
    await enrollment.save();

    res.json({
      success: true,
      message: {
        en: `Student cohort marked as ${status} successfully.`,
        hi: `छात्र को सफलतापूर्वक ${status === 'active' ? 'सक्रिय' : 'निष्क्रिय'} चिह्नित किया गया।`
      },
      enrollment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error updating cohort status', hi: 'कोहोर्ट स्थिति अपडेट करने में सर्वर त्रुटि' } });
  }
};

// @desc    Bulk save daily attendance register log
// @route   POST /api/enrollments/attendance
// @access  Private (Teacher)
export const saveDailyAttendance = async (req, res) => {
  try {
    const { date, records } = req.body; // date: "2026-05-28", records: [{ enrollmentId, status: "present"/"absent", notes: "" }]

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: { en: 'Date and records array are required.', hi: 'तिथि और रिकॉर्ड सरणी आवश्यक हैं।' } });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const savedRecords = [];

    for (const record of records) {
      const enrollment = await Enrollment.findById(record.enrollmentId).populate({
        path: 'student',
        populate: { path: 'user' }
      });
      if (!enrollment || enrollment.teacher.toString() !== teacher._id.toString()) {
        continue; // Skip unauthorized or non-existing records
      }

      // Check if duplicate record for student on same date exists, delete it first to reload
      await Attendance.deleteMany({
        teacher: teacher._id,
        studentEnrollment: enrollment._id,
        date: {
          $gte: new Date(attendanceDate).setHours(0,0,0,0),
          $lte: new Date(attendanceDate).setHours(23,59,59,999)
        }
      });

      const entry = await Attendance.create({
        teacher: teacher._id,
        studentEnrollment: enrollment._id,
        studentName: enrollment.name,
        class: enrollment.class,
        date: attendanceDate,
        status: record.status,
        notes: record.notes || ''
      });

      if (enrollment.student && enrollment.student.user) {
        await createNotification({
          userId: enrollment.student.user._id.toString(),
          title: 'Attendance Marked',
          message: `${req.user.name} marked you ${record.status} for class ${enrollment.class} on ${new Date(date).toLocaleDateString()}.`,
          type: 'ATTENDANCE_MARKED',
          link: '/student?tab=classroom'
        });
      }

      savedRecords.push(entry);
    }

    res.json({
      success: true,
      message: {
        en: `Daily attendance logs registered successfully for ${savedRecords.length} student(s).`,
        hi: `दैनिक उपस्थिति लॉग ${savedRecords.length} छात्रों के लिए सफलतापूर्वक पंजीकृत किया गया।`
      },
      recordsCount: savedRecords.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error saving attendance sheet', hi: 'उपस्थिति पत्र सहेजने में सर्वर त्रुटि' } });
  }
};

// @desc    Log monthly payment invoices or ledger entries
// @route   POST /api/enrollments/fees
// @access  Private (Teacher)
export const logMonthlyFee = async (req, res) => {
  try {
    const { enrollmentId, amount, month, status, dueDate, dueAmount } = req.body;

    if (!enrollmentId || !amount || !month) {
      return res.status(400).json({ message: { en: 'Enrollment ID, amount, and billing month are required.', hi: 'नामांकन आईडी, राशि और बिलिंग महीना आवश्यक हैं।' } });
    }

    const enrollment = await Enrollment.findById(enrollmentId).populate({
      path: 'student',
      populate: { path: 'user' }
    });
    if (!enrollment) {
      return res.status(404).json({ message: { en: 'Enrollment registry not found.', hi: 'नामांकन रजिस्ट्री नहीं मिली।' } });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || enrollment.teacher.toString() !== teacher._id.toString()) {
      return res.status(401).json({ message: { en: 'Not authorized to manage this student', hi: 'इस छात्र को प्रबंधित करने के लिए अधिकृत नहीं हैं' } });
    }

    const entry = await Fee.findOneAndUpdate(
      {
        teacher: teacher._id,
        studentEnrollment: enrollment._id,
        month
      },
      {
        teacher: teacher._id,
        studentEnrollment: enrollment._id,
        student: enrollment.student || null,
        studentName: enrollment.name,
        class: enrollment.class,
        amount: Number(amount),
        month,
        status: status || 'unpaid',
        paidDate: status === 'paid' ? new Date() : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        dueAmount: dueAmount ? Number(dueAmount) : 0
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      message: { en: 'Billing invoice log logged successfully under student accounts.', hi: 'बिलिंग चालान लॉग छात्र खातों के तहत सफलतापूर्वक लॉग किया गया।' },
      entry
    });

    if (enrollment.student && enrollment.student.user) {
      if (status === 'paid') {
        await createNotification({
          userId: enrollment.student.user._id.toString(),
          title: 'Fee Payment Recorded',
          message: `Your fee payment of ₹${amount} for ${month} has been recorded by ${req.user.name}.`,
          type: 'MESSAGE',
          link: '/student?tab=classroom'
        });
      } else {
        await createNotification({
          userId: enrollment.student.user._id.toString(),
          title: 'Tuition Fees Due',
          message: `Fees of ₹${amount} for ${month} are due. Please pay to ${req.user.name} by the due date.`,
          type: 'FEE_DUE',
          link: '/student?tab=classroom'
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error posting billing entries', hi: 'बिलिंग प्रविष्टियाँ पोस्ट करने में सर्वर त्रुटि' } });
  }
};

// @desc    Delete manual enrollment or purge student cohort completely
// @route   DELETE /api/enrollments/:id
// @access  Private (Teacher)
export const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: { en: 'Enrollment registry not found.', hi: 'नामांकन रजिस्ट्री नहीं मिली।' } });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || enrollment.teacher.toString() !== teacher._id.toString()) {
      return res.status(401).json({ message: { en: 'Not authorized to delete this cohort record', hi: 'इस कोहोर्ट रिकॉर्ड को हटाने के लिए अधिकृत नहीं हैं' } });
    }

    const { student: studentId, teacher: teacherId } = enrollment;

    // Notify teacher
    await createNotification({
      userId: teacher.user.toString(),
      title: 'Student Left Classroom',
      message: `Student ${enrollment.name} has left or been removed from your ${enrollment.class} ${enrollment.subject} classroom.`,
      type: 'MESSAGE',
      link: '/teacher?tab=students'
    });

    // Notify student if they are online/registered
    if (enrollment.student) {
      const student = await Student.findById(enrollment.student).populate('user');
      if (student && student.user) {
        await createNotification({
          userId: student.user._id.toString(),
          title: 'Removed from Classroom',
          message: `You have been removed or unenrolled from ${req.user.name}'s ${enrollment.class} ${enrollment.subject} classroom.`,
          type: 'MESSAGE',
          link: '/student?tab=classroom'
        });
      }
    }

    // Delete cohort record
    await Enrollment.findByIdAndDelete(req.params.id);
    
    // Purge corresponding attendance sheets and invoice ledger sheets
    await Attendance.deleteMany({ studentEnrollment: req.params.id });
    await Fee.deleteMany({ studentEnrollment: req.params.id });

    // Clean up connections if there are no other enrollments left
    if (studentId) {
      const otherEnrollments = await Enrollment.findOne({ teacher: teacherId, student: studentId });
      if (!otherEnrollments) {
        // No other enrollments left, delete global connection and clean up profiles
        await TeacherStudentConnection.deleteOne({ teacher: teacherId, student: studentId });
        
        await Student.findByIdAndUpdate(studentId, {
          $pull: { joinedTeachers: teacherId }
        });
        
        await Teacher.findByIdAndUpdate(teacherId, {
          $pull: { joinedStudents: studentId }
        });
      }
    }

    res.json({
      success: true,
      message: {
        en: 'Student record and corresponding attendance/fee histories fully purged from local server.',
        hi: 'छात्र रिकॉर्ड और संबंधित उपस्थिति/फीस इतिहास को स्थानीय सर्वर से पूरी तरह से हटा दिया गया।'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error deleting student records', hi: 'छात्र रिकॉर्ड को हटाने में सर्वर त्रुटि' } });
  }
};

// @desc    Retrieve full historic reports (attendance details + ledger details + credentials details) for secure inspection
// @route   GET /api/enrollments/:id/history
// @access  Private (Teacher)
export const getStudentFullHistory = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email phone profilePhoto profileImage' }
      });

    if (!enrollment) {
      return res.status(404).json({ message: { en: 'Student enrollment folder not found.', hi: 'छात्र नामांकन फ़ोल्डर नहीं मिला।' } });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || enrollment.teacher.toString() !== teacher._id.toString()) {
      return res.status(401).json({ message: { en: 'Not authorized to evaluate this student data', hi: 'इस छात्र डेटा का मूल्यांकन करने के लिए अधिकृत नहीं हैं' } });
    }

    const attendance = await Attendance.find({ studentEnrollment: enrollment._id }).sort({ date: -1 });
    const fees = await Fee.find({ studentEnrollment: enrollment._id }).sort({ createdAt: -1 });

    res.json({
      enrollment,
      attendance,
      fees
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: { en: 'Server error retrieving evaluation files', hi: 'मूल्यांकन फ़ाइलें प्राप्त करने में सर्वर त्रुटि' } });
  }
};
