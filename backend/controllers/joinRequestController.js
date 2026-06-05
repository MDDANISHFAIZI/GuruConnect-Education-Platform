import JoinRequest from '../models/JoinRequest.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';
import TeacherStudentConnection from '../models/TeacherStudentConnection.js';
import { createNotification } from '../utils/notificationHelper.js';

// @desc    Send a tuition join request to a teacher
// @route   POST /api/requests/join
// @access  Private (Student)
export const sendJoinRequest = async (req, res) => {
  try {
    const { teacherId, subject, parentPhone, message } = req.body;

    if (!teacherId || !subject) {
      return res.status(400).json({
        message: {
          en: 'Teacher ID and subject are required',
          hi: 'शिक्षक आईडी और विषय आवश्यक हैं'
        }
      });
    }

    // Find student profile
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({
        message: {
          en: 'Student profile not found. Please log in as a Student.',
          hi: 'छात्र प्रोफ़ाइल नहीं मिली। कृपया छात्र के रूप में लॉग इन करें।'
        }
      });
    }

    // Find teacher profile to verify
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        message: {
          en: 'Teacher profile not found.',
          hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।'
        }
      });
    }

    // Verify student's class is within the teacher's teachesFrom and teachesTo range
    const studentClassClean = student.class || '';
    const classNumMatch = studentClassClean.match(/\d+/);
    if (!classNumMatch) {
      return res.status(400).json({
        message: {
          en: 'Please select a valid class in your profile before requesting to join.',
          hi: 'शामिल होने का अनुरोध करने से पहले कृपया अपनी प्रोफ़ाइल में एक वैध कक्षा चुनें।'
        }
      });
    }
    const studentClassNum = parseInt(classNumMatch[0], 10);
    if (studentClassNum < teacher.teachesFrom || studentClassNum > teacher.teachesTo) {
      return res.status(400).json({
        message: {
          en: `This teacher does not tutor for your class (${studentClassClean}). They only teach Class ${teacher.teachesFrom} to Class ${teacher.teachesTo}.`,
          hi: `यह शिक्षक आपकी कक्षा (${studentClassClean}) के लिए ट्यूशन नहीं देते हैं। वे केवल कक्षा ${teacher.teachesFrom} से कक्षा ${teacher.teachesTo} तक पढ़ाते हैं।`
        }
      });
    }

    // Check if duplicate pending or accepted request already exists for the same subject
    const existingRequest = await JoinRequest.findOne({
      student: student._id,
      teacher: teacherId,
      subject,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        message: {
          en: 'You have already sent an active request for this subject to this teacher.',
          hi: 'आप पहले ही इस विषय के लिए इस शिक्षक को एक सक्रिय अनुरोध भेज चुके हैं।'
        }
      });
    }

    // Create join request
    const request = await JoinRequest.create({
      student: student._id,
      teacher: teacherId,
      subject,
      parentPhone: parentPhone || '',
      message: message || '',
      status: 'pending'
    });

    // Notify teacher
    await createNotification({
      userId: teacher.user.toString(),
      title: 'New Enrollment Request',
      message: `${student.user?.name || 'A student'} has requested to join your ${subject} batch (Class: ${student.class}).`,
      type: 'ENROLLMENT_REQUEST',
      link: '/teacher?tab=requests'
    });

    res.status(201).json({
      success: true,
      message: {
        en: 'Join request sent successfully!',
        hi: 'शामिल होने का अनुरोध सफलतापूर्वक भेजा गया!'
      },
      request
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error processing request',
        hi: 'अनुरोध संसाधित करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Get all requests received by a teacher
// @route   GET /api/requests/teacher
// @access  Private (Teacher)
export const getTeacherRequests = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        message: {
          en: 'Teacher profile not found.',
          hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।'
        }
      });
    }

    // Find requests, populate student profile + user details
    const requests = await JoinRequest.find({ teacher: teacher._id })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email phone profilePhoto profileImage' }
      })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error retrieving requests',
        hi: 'अनुरोध प्राप्त करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Get all requests sent by a student
// @route   GET /api/requests/student
// @access  Private (Student)
export const getStudentRequests = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({
        message: {
          en: 'Student profile not found.',
          hi: 'छात्र प्रोफ़ाइल नहीं मिली।'
        }
      });
    }

    // Find requests, populate teacher details + user name
    const requests = await JoinRequest.find({ student: student._id })
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name phone profilePhoto profileImage' }
      })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error retrieving requests',
        hi: 'अनुरोध प्राप्त करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Accept tuition join request
// @route   PUT /api/requests/:id/accept
// @access  Private (Teacher)
export const acceptJoinRequest = async (req, res) => {
  try {
    const request = await JoinRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        message: {
          en: 'Join request not found',
          hi: 'अनुरोध नहीं मिला'
        }
      });
    }

    // Verify teacher owns the request
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || request.teacher.toString() !== teacher._id.toString()) {
      return res.status(401).json({
        message: {
          en: 'Not authorized to manage this request',
          hi: 'इस अनुरोध को प्रबंधित करने के लिए अधिकृत नहीं हैं'
        }
      });
    }

    if (request.status === 'accepted') {
      return res.status(400).json({
        message: {
          en: 'Request is already accepted',
          hi: 'अनुरोध पहले से ही स्वीकृत है'
        }
      });
    }

    // Update status
    request.status = 'accepted';
    await request.save();

    // Add student to teacher cohort list
    if (!teacher.joinedStudents.includes(request.student)) {
      teacher.joinedStudents.push(request.student);
      await teacher.save();
    }

    // Add teacher to student cohort list
    const student = await Student.findById(request.student).populate('user');
    if (student) {
      if (!student.joinedTeachers.includes(teacher._id)) {
        student.joinedTeachers.push(teacher._id);
        await student.save();
      }

      // Create a student enrollment registry as pending
      // Check if enrollment already exists to prevent duplicate
      const className = student.class || 'Class 10';
      let enrollment = await Enrollment.findOne({
        teacher: teacher._id,
        student: student._id,
        class: className,
        subject: request.subject
      });

      if (!enrollment) {
        enrollment = await Enrollment.create({
          teacher: teacher._id,
          student: student._id,
          name: student.user?.name || 'Online Student',
          class: className,
          subject: request.subject,
          fees: teacher.fees || 500,
          parentPhone: request.parentPhone || student.user?.phone || '',
          status: 'pending',
          type: 'online'
        });
      }

      // Create / Update connection as pending only if not already connected/accepted
      const existingConn = await TeacherStudentConnection.findOne({ teacher: teacher._id, student: student._id });
      if (!existingConn) {
        await TeacherStudentConnection.create({
          teacher: teacher._id,
          student: student._id,
          status: 'pending'
        });
      }
      // Notify student
      await createNotification({
        userId: student.user._id.toString(),
        title: 'Enrollment Request Accepted',
        message: `Your request to join ${req.user.name}'s ${request.subject} class has been accepted.`,
        type: 'ENROLLMENT_ACCEPTED',
        link: '/student?tab=classroom'
      });

      // Notify teacher (Student Joined Classroom)
      await createNotification({
        userId: teacher.user.toString(),
        title: 'Student Joined Classroom',
        message: `${student.user?.name || 'Online Student'} has joined your Classroom for ${className} ${request.subject}.`,
        type: 'MESSAGE',
        link: '/teacher?tab=students'
      });
    }

    res.json({
      success: true,
      message: {
        en: 'Request accepted successfully! Student is pending initial tuition fee confirmation.',
        hi: 'अनुरोध सफलतापूर्वक स्वीकार किया गया! छात्र प्रारंभिक शुल्क पुष्टि के लिए लंबित है।'
      },
      request
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error accepting request',
        hi: 'अनुरोध स्वीकार करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Reject tuition join request
// @route   PUT /api/requests/:id/reject
// @access  Private (Teacher)
export const rejectJoinRequest = async (req, res) => {
  try {
    const request = await JoinRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        message: {
          en: 'Join request not found',
          hi: 'अनुरोध नहीं मिला'
        }
      });
    }

    // Verify teacher owns the request
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || request.teacher.toString() !== teacher._id.toString()) {
      return res.status(401).json({
        message: {
          en: 'Not authorized to manage this request',
          hi: 'इस अनुरोध को प्रबंधित करने के लिए अधिकृत नहीं हैं'
        }
      });
    }

    // Update status
    request.status = 'rejected';
    await request.save();

    // Notify student
    await request.populate({
      path: 'student',
      populate: { path: 'user' }
    });

    if (request.student && request.student.user) {
      await createNotification({
        userId: request.student.user._id.toString(),
        title: 'Enrollment Request Update',
        message: `Your request to join ${req.user.name}'s ${request.subject} class was not accepted at this time.`,
        type: 'MESSAGE',
        link: '/student?tab=explore'
      });
    }

    res.json({
      success: true,
      message: {
        en: 'Request rejected politely.',
        hi: 'अनुरोध विनम्रता से खारिज कर दिया गया।'
      },
      request
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: {
        en: 'Server error rejecting request',
        hi: 'अनुरोध खारिज करने में सर्वर त्रुटि'
      }
    });
  }
};

// @desc    Get secure Student profile view for evaluation
// @route   GET /api/requests/student-profile/:id
// @access  Private (Teacher)
export const getStudentProfileForTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(401).json({
        message: {
          en: 'Only registered teachers can evaluate student profiles',
          hi: 'केवल पंजीकृत शिक्षक ही छात्र प्रोफाइल का मूल्यांकन कर सकते हैं'
        }
      });
    }

    // Find student profile, populate base user info
    const student = await Student.findById(req.params.id)
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
        populate: { path: 'user', select: 'name subjects' }
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
