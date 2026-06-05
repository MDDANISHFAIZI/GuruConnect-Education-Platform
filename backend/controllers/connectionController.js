import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';
import TeacherConnectionCode from '../models/TeacherConnectionCode.js';
import TeacherStudentConnection from '../models/TeacherStudentConnection.js';
import Fee from '../models/Fee.js';
import JoinRequest from '../models/JoinRequest.js';
import { activateStudentEnrollment } from '../utils/enrollmentHelper.js';
import { createNotification } from '../utils/notificationHelper.js';

// @desc    Lookup teacher by connection code
// @route   GET /api/connections/lookup/:code
// @access  Private (Student)
export const lookupTeacherByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const connectionCode = await TeacherConnectionCode.findOne({ code: code.trim().toUpperCase() });
    
    if (!connectionCode) {
      return res.status(404).json({
        message: {
          en: 'No teacher found with this connection code.',
          hi: 'इस कनेक्शन कोड के साथ कोई शिक्षक नहीं मिला।'
        }
      });
    }

    const teacher = await Teacher.findById(connectionCode.teacher)
      .populate('user', 'name email phone profilePhoto profileImage');

    if (!teacher) {
      return res.status(404).json({
        message: {
          en: 'Teacher profile not found.',
          hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।'
        }
      });
    }

    const imagePath = teacher.user.profileImage || teacher.user.profilePhoto || teacher.profileImage || teacher.profilePhoto || '';
    
    console.log('[DEBUG LOOKUP] Teacher Lookup Response:', {
      id: teacher._id,
      name: teacher.user.name,
      profileImage: imagePath
    });

    res.json({
      id: teacher._id,
      teacherId: teacher._id,
      name: teacher.user.name,
      profilePhoto: imagePath,
      profileImage: imagePath,
      subjects: teacher.subjects,
      location: teacher.teachingArea || teacher.villageOrArea || 'Local Area',
      teachingArea: teacher.teachingArea || teacher.villageOrArea || 'Local Area'
    });
  } catch (error) {
    console.error('[LOOKUP TEACHER ERROR]', error);
    res.status(500).json({
      message: {
        en: 'Server error looking up teacher code',
        hi: 'शिक्षक कोड खोजने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Connect student using teacher code (with smart matching claims)
// @route   POST /api/connections/connect
// @access  Private (Student)
export const connectWithCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        message: {
          en: 'Teacher code is required',
          hi: 'शिक्षक कोड आवश्यक है'
        }
      });
    }

    const student = await Student.findOne({ user: req.user._id }).populate('user');
    if (!student) {
      return res.status(404).json({
        message: {
          en: 'Student profile not found.',
          hi: 'छात्र प्रोफ़ाइल नहीं मिली।'
        }
      });
    }

    const connectionCode = await TeacherConnectionCode.findOne({ code: code.trim().toUpperCase() });
    if (!connectionCode) {
      return res.status(404).json({
        message: {
          en: 'Invalid teacher connection code.',
          hi: 'अमान्य शिक्षक कनेक्शन कोड।'
        }
      });
    }

    const teacherId = connectionCode.teacher;

    // Check if already connected or requested
    const existing = await TeacherStudentConnection.findOne({
      teacher: teacherId,
      student: student._id
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({
          message: {
            en: 'You are already connected with this teacher.',
            hi: 'आप पहले से ही इस शिक्षक से जुड़े हुए हैं।'
          }
        });
      } else if (existing.status === 'pending') {
        return res.status(400).json({
          message: {
            en: 'Your connection request is already pending approval.',
            hi: 'आपका कनेक्शन अनुरोध पहले से ही स्वीकृति के लिए लंबित है।'
          }
        });
      }
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        message: {
          en: 'Teacher profile not found.',
          hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।'
        }
      });
    }

    // CHECK IF AN ENROLLMENT OR AN ACCEPTED JOIN REQUEST EXISTS BETWEEN THIS STUDENT AND TEACHER
    const existingEnrollment = await Enrollment.findOne({ teacher: teacherId, student: student._id });
    const acceptedJoinRequest = await JoinRequest.findOne({ teacher: teacherId, student: student._id, status: 'accepted' });

    if (existingEnrollment || acceptedJoinRequest) {
      const subject = acceptedJoinRequest?.subject || existingEnrollment?.subject || teacher.subjects[0] || 'General Cohort';
      const parentPhone = acceptedJoinRequest?.parentPhone || existingEnrollment?.parentPhone || student.user?.phone || '';

      await activateStudentEnrollment({
        teacherId,
        studentId: student._id,
        subject,
        parentPhone
      });

      return res.json({
        success: true,
        matchFound: false,
        message: {
          en: 'Teacher Connection Code verified! You are now connected and enrolled.',
          hi: 'शिक्षक कनेक्शन कोड सत्यापित! अब आप जुड़े हुए हैं और नामांकित हैं।'
        }
      });
    }


    // SMART MATCHING SYSTEM
    // Look for manual offline enrollment records created by this teacher
    // priority: 1. studentPhone, 2. parentPhone
    const studentPhone = student.user?.phone || '';
    
    let matchedEnrollment = null;

    if (studentPhone) {
      matchedEnrollment = await Enrollment.findOne({
        teacher: teacherId,
        type: 'manual',
        student: null, // not claimed yet
        $or: [
          { studentPhone: studentPhone },
          { parentPhone: studentPhone }
        ]
      });
    }

    if (matchedEnrollment) {
      return res.json({
        matchFound: true,
        message: {
          en: 'We found an existing tuition record under this teacher.',
          hi: 'हमें इस शिक्षक के अंतर्गत एक मौजूदा ट्यूशन रिकॉर्ड मिला है।'
        },
        enrollment: {
          _id: matchedEnrollment._id,
          name: matchedEnrollment.name,
          class: matchedEnrollment.class,
          subject: matchedEnrollment.subject
        },
        teacherId
      });
    }

    // If no match found, create a standard pending connection request
    const connection = await TeacherStudentConnection.create({
      teacher: teacherId,
      student: student._id,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      matchFound: false,
      message: {
        en: 'Connection request sent successfully! Waiting for teacher approval.',
        hi: 'कनेक्शन अनुरोध सफलतापूर्वक भेजा गया! शिक्षक की स्वीकृति की प्रतीक्षा है।'
      },
      connection
    });
  } catch (error) {
    console.error('[CONNECT WITH CODE ERROR]', error);
    res.status(500).json({
      message: {
        en: 'Server error connecting with teacher code',
        hi: 'शिक्षक कोड से जुड़ने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Claim offline manual enrollment record
// @route   POST /api/connections/claim
// @access  Private (Student)
export const claimOfflineRecord = async (req, res) => {
  try {
    const { enrollmentId, teacherId } = req.body;

    const student = await Student.findOne({ user: req.user._id }).populate('user');
    if (!student) {
      return res.status(404).json({
        message: {
          en: 'Student profile not found.',
          hi: 'छात्र प्रोफ़ाइल नहीं मिली।'
        }
      });
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment || enrollment.teacher.toString() !== teacherId) {
      return res.status(404).json({
        message: {
          en: 'Tuition record not found.',
          hi: 'ट्यूशन रिकॉर्ड नहीं मिला।'
        }
      });
    }

    if (enrollment.student) {
      return res.status(400).json({
        message: {
          en: 'This record has already been claimed.',
          hi: 'इस रिकॉर्ड पर पहले ही दावा किया जा चुका है।'
        }
      });
    }

    // Link the student profile
    enrollment.student = student._id;
    enrollment.type = 'online';
    enrollment.status = 'active'; // Claimed records become active instantly
    await enrollment.save();

    // Sync ownership of all historical fee receipts under this claimed enrollment
    await Fee.updateMany(
      { studentEnrollment: enrollmentId },
      { student: student._id }
    );

    // Create / Update connection as accepted
    await TeacherStudentConnection.findOneAndUpdate(
      { teacher: teacherId, student: student._id },
      { status: 'accepted', connectedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Sync arrays in Teacher/Student profiles
    const teacher = await Teacher.findById(teacherId);
    if (teacher && !teacher.joinedStudents.includes(student._id)) {
      teacher.joinedStudents.push(student._id);
      await teacher.save();
    }

    if (!student.joinedTeachers.includes(teacherId)) {
      student.joinedTeachers.push(teacherId);
      await student.save();
    }

    // Notify teacher
    if (teacher && teacher.user) {
      await createNotification({
        userId: teacher.user.toString(),
        title: 'Offline Record Claimed',
        message: `${student.user?.name || 'A student'} has claimed their offline tuition record for ${enrollment.class} ${enrollment.subject}.`,
        type: 'ENROLLMENT_ACCEPTED',
        link: '/teacher?tab=students'
      });
    }

    console.log("Location Request Accepted");
    console.log("Code Verified");
    console.log("Enrollment Created");
    console.log("Student Added To Active Students");

    res.json({
      success: true,
      message: {
        en: 'Successfully claimed tuition record and connected!',
        hi: 'ट्यूशन रिकॉर्ड पर सफलतापूर्वक दावा किया गया और कनेक्शन स्थापित हुआ!'
      }
    });
  } catch (error) {
    console.error('[CLAIM RECORD ERROR]', error);
    res.status(500).json({
      message: {
        en: 'Server error claiming manual record',
        hi: 'मैन्युअल रिकॉर्ड का दावा करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Get requests/connections list for logged-in teacher
// @route   GET /api/connections/teacher
// @access  Private (Teacher)
export const getTeacherConnections = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const connections = await TeacherStudentConnection.find({ teacher: teacher._id })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });

    res.json(connections);
  } catch (error) {
    console.error('[GET TEACHER CONNECTIONS ERROR]', error);
    res.status(500).json({ message: { en: 'Server error retrieving connections', hi: 'कनेक्शन पुनर्प्राप्त करने में सर्वर त्रुटि' } });
  }
};

// @desc    Accept/Reject pending connection request
// @route   PUT /api/connections/respond/:id
// @access  Private (Teacher)
export const respondToConnection = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const connection = await TeacherStudentConnection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: { en: 'Connection request not found.', hi: 'कनेक्शन अनुरोध नहीं मिला।' } });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || connection.teacher.toString() !== teacher._id.toString()) {
      return res.status(401).json({ message: { en: 'Not authorized.', hi: 'अधिकृत नहीं है।' } });
    }

    if (action === 'accept') {
      // Sync cohorts and active states via unified helper
      const student = await Student.findById(connection.student).populate('user');
      if (student) {
        await activateStudentEnrollment({
          teacherId: teacher._id,
          studentId: student._id,
          subject: teacher.subjects[0] || 'General Cohort',
          parentPhone: student.user?.phone || ''
        });
      }

      res.json({ success: true, message: { en: 'Connection request accepted successfully!', hi: 'कनेक्शन अनुरोध सफलतापूर्वक स्वीकार किया गया!' } });
    } else {
      connection.status = 'rejected';
      await connection.save();
      res.json({ success: true, message: { en: 'Connection request rejected politely.', hi: 'कनेक्शन अनुरोध विनम्रता से खारिज कर दिया गया।' } });
    }
  } catch (error) {
    console.error('[RESPOND TO CONNECTION ERROR]', error);
    res.status(500).json({ message: { en: 'Server error responding to connection', hi: 'कनेक्शन का जवाब देने में सर्वर त्रुटि' } });
  }
};
