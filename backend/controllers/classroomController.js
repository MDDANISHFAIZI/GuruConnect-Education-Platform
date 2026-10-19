import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';
import Note from '../models/Note.js';
import Doubt from '../models/Doubt.js';
import Homework from '../models/Homework.js';
import Announcement from '../models/Announcement.js';
import Attendance from '../models/Attendance.js';
import TeacherStudentConnection from '../models/TeacherStudentConnection.js';
import { createNotification, notifyStudents } from '../utils/notificationHelper.js';
import AIServiceBridge from '../services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Get list of accepted teacher IDs for a student
const getConnectedTeacherIds = async (studentId) => {
  const connections = await TeacherStudentConnection.find({
    student: studentId,
    status: 'accepted'
  });
  return connections.map(c => c.teacher);
};

// Helper: Build robust multi-source authorized query for student classroom access
const getStudentAuthorizedClassroomQuery = async (student) => {
  const studentEnrollments = await Enrollment.find({ student: student._id, status: 'active' });
  const connections = await TeacherStudentConnection.find({ student: student._id, status: 'accepted' });

  const teacherIds = new Set();
  if (student.joinedTeachers && Array.isArray(student.joinedTeachers)) {
    student.joinedTeachers.forEach(t => {
      if (t) teacherIds.add(t._id ? t._id.toString() : t.toString());
    });
  }
  connections.forEach(c => {
    if (c.teacher) teacherIds.add(c.teacher.toString());
  });
  studentEnrollments.forEach(e => {
    if (e.teacher) teacherIds.add(e.teacher.toString());
  });

  const orClauses = [];
  studentEnrollments.forEach(se => {
    orClauses.push({ teacher: se.teacher, class: se.class });
    orClauses.push({ teacher: se.teacher, class: 'All' });
  });

  if (teacherIds.size > 0) {
    if (student.class) {
      orClauses.push({ teacher: { $in: Array.from(teacherIds) }, class: student.class });
    }
    orClauses.push({ teacher: { $in: Array.from(teacherIds) }, class: 'All' });
    orClauses.push({ teacher: { $in: Array.from(teacherIds) } });
  }

  if (orClauses.length === 0) {
    return null;
  }

  return { $or: orClauses };
};

// ==========================================
// 1. NOTES SYSTEM CONTROLLERS
// ==========================================

export const uploadNote = async (req, res) => {
  try {
    const { title, fileUrl, fileType, class: className, subject, rawContent } = req.body;
    
    if (!title || !fileUrl || !className) {
      return res.status(400).json({ message: { en: 'Title, File URL, and Class are required', hi: 'शीर्षक, फ़ाइल URL और कक्षा आवश्यक हैं' } });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    let savedFileUrl = fileUrl;
    let localDiskPath = '';

    // If teacher uploaded a direct file as a base64 data URL, persist it to disk
    if (fileUrl.startsWith('data:')) {
      try {
        const uploadsDir = path.join(__dirname, '../public/uploads/notes');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const matches = fileUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const ext = fileType === 'docx' ? 'docx' : 'pdf';
        const filename = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        localDiskPath = path.join(uploadsDir, filename);

        if (matches && matches[2]) {
          const buffer = Buffer.from(matches[2], 'base64');
          fs.writeFileSync(localDiskPath, buffer);
          savedFileUrl = `/uploads/notes/${filename}`;
        }
      } catch (fileSaveErr) {
        console.warn('[NOTE FILE PERSISTENCE WARNING]', fileSaveErr.message);
      }
    }

    const note = await Note.create({
      teacher: teacher._id,
      title,
      fileUrl: savedFileUrl,
      fileType: fileType || 'pdf',
      class: className,
      subject: subject || 'General',
      rawContent: rawContent || ''
    });

    // Asynchronously ingest note into GuruAI RAG Vector Store
    // Pass local disk path if saved, otherwise the fileUrl or base64 string
    const ingestPayloadUrl = localDiskPath || savedFileUrl;
    AIServiceBridge.ingestDocument({
      materialId: note._id,
      teacherId: teacher._id,
      teacherName: req.user.name,
      className,
      title,
      fileUrl: ingestPayloadUrl,
      fileType: fileType || 'pdf',
      rawContent,
      subject: subject || 'General'
    }).then(async (result) => {
      if (result && result.success) {
        note.isIndexed = true;
        note.indexedAt = new Date();
        note.chunkCount = result.chunkCount || 1;
        await note.save();
      }
    }).catch(err => console.warn('[NOTE AI INGEST NON-FATAL ERROR]', err.message));

    // Notify all students in this class for the teacher
    await notifyStudents({
      teacherId: teacher._id,
      className,
      title: 'New Study Material Uploaded',
      message: `${req.user.name} uploaded new notes: "${title}" for ${className}.`,
      type: 'NEW_NOTE',
      link: '/student?tab=classroom'
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('[UPLOAD NOTE ERROR]', error);
    res.status(500).json({ message: { en: 'Error saving study note.', hi: 'अध्ययन नोट सहेजने में त्रुटि।' } });
  }
};


export const getTeacherNotes = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const { class: className } = req.query;
    const filter = { teacher: teacher._id };
    if (className && className !== 'All' && className !== 'undefined' && className !== 'null') {
      filter.class = className;
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('[GET TEACHER NOTES ERROR]', error);
    res.status(500).json({ message: { en: 'Server error retrieving notes', hi: 'नोट्स पुनर्प्राप्त करने में सर्वर त्रुटि' } });
  }
};

export const getStudentNotes = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: { en: 'Student profile not found.', hi: 'छात्र प्रोफ़ाइल नहीं मिली।' } });
    }

    const query = await getStudentAuthorizedClassroomQuery(student);
    if (!query) {
      return res.json([]);
    }

    const notes = await Note.find(query)
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('[GET STUDENT NOTES ERROR]', error);
    res.status(500).json({ message: { en: 'Server error retrieving classroom notes', hi: 'कक्षा के नोट्स पुनर्प्राप्त करने में सर्वर त्रुटि' } });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const note = await Note.findOneAndDelete({ _id: req.params.id, teacher: teacher._id });
    if (!note) {
      return res.status(404).json({ message: { en: 'Note not found.', hi: 'नोट नहीं मिला।' } });
    }

    // Remove document chunks from GuruAI Vector Store
    AIServiceBridge.deleteDocument(note._id).catch(err => console.warn('[NOTE AI DELETE NON-FATAL ERROR]', err.message));

    res.json({ success: true, message: { en: 'Note deleted.', hi: 'नोट हटा दिया गया।' } });
  } catch (error) {
    console.error('[DELETE NOTE ERROR]', error);
    res.status(500).json({ message: { en: 'Server error deleting note', hi: 'नोट हटाने में सर्वर त्रुटि' } });
  }
};

// ==========================================
// 2. DOUBT SYSTEM CONTROLLERS
// ==========================================

export const askDoubt = async (req, res) => {
  try {
    const { teacherId, question } = req.body;

    if (!teacherId || !question) {
      return res.status(400).json({ message: { en: 'Teacher and question are required', hi: 'शिक्षक और प्रश्न आवश्यक हैं' } });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: { en: 'Student profile not found.', hi: 'छात्र प्रोफ़ाइल नहीं मिली।' } });
    }

    // Verify student is connected to teacher and retrieve the class
    const enrollment = await Enrollment.findOne({
      student: student._id,
      teacher: teacherId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({ message: { en: 'Not active or enrolled with this teacher.', hi: 'इस शिक्षक के साथ नामांकित या सक्रिय नहीं हैं।' } });
    }

    const doubt = await Doubt.create({
      student: student._id,
      teacher: teacherId,
      question,
      class: enrollment.class
    });

    // Notify teacher
    const teacher = await Teacher.findById(teacherId).populate('user');
    if (teacher && teacher.user) {
      await createNotification({
        userId: teacher.user._id.toString(),
        title: 'New Doubt Submitted',
        message: `${req.user.name} asked a doubt in ${enrollment.class}: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`,
        type: 'NEW_DOUBT',
        link: '/teacher?tab=doubts'
      });
    }

    res.status(201).json({ success: true, doubt });
  } catch (error) {
    console.error('[ASK DOUBT ERROR]', error);
    res.status(500).json({ message: { en: 'Server error asking doubt', hi: 'शंका पूछने में सर्वर त्रुटि' } });
  }
};

export const replyToDoubt = async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ message: { en: 'Reply answer is required', hi: 'उत्तर आवश्यक है' } });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const doubt = await Doubt.findOne({ _id: req.params.id, teacher: teacher._id });
    if (!doubt) {
      return res.status(404).json({ message: { en: 'Doubt not found.', hi: 'शंका नहीं मिली।' } });
    }

    doubt.answer = answer;
    doubt.isResolved = true;
    await doubt.save();

    // Notify student
    const doubtWithStudent = await doubt.populate({
      path: 'student',
      populate: { path: 'user' }
    });
    if (doubtWithStudent.student && doubtWithStudent.student.user) {
      await createNotification({
        userId: doubtWithStudent.student.user._id.toString(),
        title: 'Doubt Resolved',
        message: `${req.user.name} replied to your doubt: "${answer.substring(0, 50)}${answer.length > 50 ? '...' : ''}"`,
        type: 'DOUBT_REPLY',
        link: '/student?tab=classroom'
      });
    }

    res.json({ success: true, doubt });
  } catch (error) {
    console.error('[REPLY TO DOUBT ERROR]', error);
    res.status(500).json({ message: { en: 'Server error replying to doubt', hi: 'शंका का उत्तर देने में सर्वर त्रुटि' } });
  }
};

export const getTeacherDoubts = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const { class: className } = req.query;
    const filter = { teacher: teacher._id };
    if (className && className !== 'All' && className !== 'undefined' && className !== 'null') {
      filter.class = className;
    }

    const doubts = await Doubt.find(filter)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(doubts);
  } catch (error) {
    console.error('[GET TEACHER DOUBTS ERROR]', error);
    res.status(500).json({ message: { en: 'Server error retrieving doubts', hi: 'शंकाएं पुनर्प्राप्त करने में सर्वर त्रुटि' } });
  }
};

export const getStudentDoubts = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: { en: 'Student profile not found.', hi: 'छात्र प्रोफ़ाइल नहीं मिली।' } });
    }

    const query = await getStudentAuthorizedClassroomQuery(student);
    if (!query) {
      return res.json([]);
    }

    const doubts = await Doubt.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name' }
      })
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(doubts);
  } catch (error) {
    console.error('[GET STUDENT DOUBTS ERROR]', error);
    res.status(500).json({ message: { en: 'Server error retrieving doubts', hi: 'शंकाएं पुनर्प्राप्त करने में सर्वर त्रुटि' } });
  }
};

// ==========================================
// 3. HOMEWORK SYSTEM CONTROLLERS
// ==========================================

export const createHomework = async (req, res) => {
  try {
    const { title, description, deadline, class: className } = req.body;

    if (!title || !description || !deadline || !className) {
      return res.status(400).json({ message: { en: 'Title, description, deadline and Class are required', hi: 'शीर्षक, विवरण, समय सीमा और कक्षा आवश्यक हैं' } });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const homework = await Homework.create({
      teacher: teacher._id,
      title,
      description,
      deadline: new Date(deadline),
      class: className
    });

    // Notify students
    await notifyStudents({
      teacherId: teacher._id,
      className,
      title: 'New Homework Assigned',
      message: `${req.user.name} assigned new homework: "${title}" for ${className}.`,
      type: 'NEW_NOTE',
      link: '/student?tab=classroom'
    });

    res.status(201).json({ success: true, homework });
  } catch (error) {
    console.error('[CREATE HOMEWORK ERROR]', error);
    res.status(500).json({ message: { en: 'Server error creating homework', hi: 'गृहकार्य बनाने में सर्वर त्रुटि' } });
  }
};

export const getTeacherHomework = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const { class: className } = req.query;
    const filter = { teacher: teacher._id };
    if (className && className !== 'All' && className !== 'undefined' && className !== 'null') {
      filter.class = className;
    }

    const homework = await Homework.find(filter).sort({ createdAt: -1 });
    res.json(homework);
  } catch (error) {
    console.error('[GET TEACHER HOMEWORK ERROR]', error);
    res.status(500).json({ message: { en: 'Server error retrieving homework', hi: 'गृहकार्य पुनर्प्राप्त करने में सर्वर त्रुटि' } });
  }
};

export const getStudentHomework = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: { en: 'Student profile not found.', hi: 'छात्र प्रोफ़ाइल नहीं मिली।' } });
    }

    const query = await getStudentAuthorizedClassroomQuery(student);
    if (!query) {
      return res.json([]);
    }

    const homework = await Homework.find(query)
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(homework);
  } catch (error) {
    console.error('[GET STUDENT HOMEWORK ERROR]', error);
    res.status(500).json({ message: { en: 'Server error retrieving homework', hi: 'गृहकार्य पुनर्प्राप्त करने में सर्वर त्रुटि' } });
  }
};

export const deleteHomework = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const hw = await Homework.findOneAndDelete({ _id: req.params.id, teacher: teacher._id });
    if (!hw) {
      return res.status(404).json({ message: { en: 'Homework not found.', hi: 'गृहकार्य नहीं मिला।' } });
    }

    res.json({ success: true, message: { en: 'Homework deleted.', hi: 'गृहकार्य हटा दिया गया।' } });
  } catch (error) {
    console.error('[DELETE HOMEWORK ERROR]', error);
    res.status(500).json({ message: { en: 'Server error deleting homework', hi: 'गृहकार्य हटाने में सर्वर त्रुटि' } });
  }
};

// ==========================================
// 4. ANNOUNCEMENTS SYSTEM CONTROLLERS
// ==========================================

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, class: className } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: { en: 'Title and content are required', hi: 'शीर्षक और सामग्री आवश्यक हैं' } });
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const announcement = await Announcement.create({
      teacher: teacher._id,
      title,
      content,
      class: className || 'All'
    });

    // Notify students
    await notifyStudents({
      teacherId: teacher._id,
      className: className || 'All',
      title: 'New Announcement',
      message: `${req.user.name} posted an announcement: "${title}"`,
      type: 'ANNOUNCEMENT',
      link: '/student?tab=classroom'
    });

    res.status(201).json({ success: true, announcement });
  } catch (error) {
    console.error('[CREATE ANNOUNCEMENT ERROR]', error);
    res.status(500).json({ message: { en: 'Server error creating announcement', hi: 'घोषणा बनाने में सर्वर त्रुटि' } });
  }
};

export const getTeacherAnnouncements = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const { class: className } = req.query;
    const filter = { teacher: teacher._id };
    if (className && className !== 'All' && className !== 'undefined' && className !== 'null') {
      filter.class = className;
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    console.error('[GET TEACHER ANNOUNCEMENTS ERROR]', error);
    res.status(500).json({ message: { en: 'Server error retrieving announcements', hi: 'घोषणाएं पुनर्प्राप्त करने में सर्वर त्रुटि' } });
  }
};

export const getStudentAnnouncements = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: { en: 'Student profile not found.', hi: 'छात्र प्रोफ़ाइल नहीं मिली।' } });
    }

    const query = await getStudentAuthorizedClassroomQuery(student);
    if (!query) {
      return res.json([]);
    }

    const announcements = await Announcement.find(query)
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    console.error('[GET STUDENT ANNOUNCEMENTS ERROR]', error);
    res.status(500).json({ message: { en: 'Server error retrieving announcements', hi: 'घोषणाएं पुनर्प्राप्त करने में सर्वर त्रुटि' } });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: { en: 'Teacher profile not found.', hi: 'शिक्षक प्रोफ़ाइल नहीं मिली।' } });
    }

    const notice = await Announcement.findOneAndDelete({ _id: req.params.id, teacher: teacher._id });
    if (!notice) {
      return res.status(404).json({ message: { en: 'Announcement not found.', hi: 'घोषणा नहीं मिली।' } });
    }

    res.json({ success: true, message: { en: 'Announcement deleted.', hi: 'घोषणा हटा दी गई।' } });
  } catch (error) {
    console.error('[DELETE ANNOUNCEMENT ERROR]', error);
    res.status(500).json({ message: { en: 'Server error deleting announcement', hi: 'घोषणा हटाने में सर्वर त्रुटि' } });
  }
};

// ==========================================
// 5. ATTENDANCE METRICS FOR STUDENTS
// ==========================================

export const getStudentAttendanceMetrics = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: { en: 'Student profile not found.', hi: 'छात्र प्रोफ़ाइल नहीं मिली।' } });
    }

    // Find all enrollment records associated with this student
    const enrollments = await Enrollment.find({ student: student._id });
    const enrollmentIds = enrollments.map(e => e._id);

    // Fetch full history logs of attendance
    const attendanceLogs = await Attendance.find({ studentEnrollment: { $in: enrollmentIds } })
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ date: -1 });

    const totalDays = attendanceLogs.length;
    const presentDays = attendanceLogs.filter(a => a.status === 'present').length;
    const absentDays = totalDays - presentDays;
    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    res.json({
      metrics: {
        totalDays,
        presentDays,
        absentDays,
        percentage
      },
      history: attendanceLogs
    });
  } catch (error) {
    console.error('[GET ATTENDANCE METRICS ERROR]', error);
    res.status(500).json({ message: { en: 'Server error retrieving attendance analytics', hi: 'उपस्थिति विश्लेषण प्राप्त करने में सर्वर त्रुटि' } });
  }
};
