import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import StudentEnrollment from '../models/StudentEnrollment.js';
import TeacherStudentConnection from '../models/TeacherStudentConnection.js';

/**
 * Single source of truth for active student enrollment.
 * Automatically creates/updates TeacherStudentConnection and StudentEnrollment,
 * updates cohort arrays on both teacher and student profiles, and prints logs.
 */
export const activateStudentEnrollment = async ({ teacherId, studentId, subject, parentPhone }) => {
  try {
    // 1. Fetch teacher and student profiles
    const teacher = await Teacher.findById(teacherId);
    const student = await Student.findById(studentId).populate('user');

    if (!teacher || !student) {
      console.error('[Helper Activation Error] Teacher or Student profile not found');
      return null;
    }

    // 2. DEDUPLICATION: Check if enrollment already exists
    let enrollment = await StudentEnrollment.findOne({
      teacher: teacherId,
      student: studentId
    });

    if (enrollment) {
      // If exists, mark status as active
      enrollment.status = 'active';
      if (subject) enrollment.subject = subject;
      if (parentPhone) enrollment.parentPhone = parentPhone;
      await enrollment.save();
    } else {
      // Create new enrollment
      enrollment = await StudentEnrollment.create({
        teacher: teacherId,
        student: studentId,
        name: student.user?.name || 'Online Student',
        class: student.class || 'Class 10',
        subject: subject || teacher.subjects[0] || 'General Cohort',
        fees: teacher.fees || 500,
        parentPhone: parentPhone || student.user?.phone || '',
        status: 'active',
        type: 'online'
      });
    }

    // 3. Create or update TeacherStudentConnection
    await TeacherStudentConnection.findOneAndUpdate(
      { teacher: teacherId, student: studentId },
      { status: 'accepted', connectedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 4. Update cohort lists (Joined students and teachers)
    if (!teacher.joinedStudents.includes(studentId)) {
      teacher.joinedStudents.push(studentId);
      await teacher.save();
    }

    if (!student.joinedTeachers.includes(teacherId)) {
      student.joinedTeachers.push(teacherId);
      await student.save();
    }

    // 5. Output debugging logs verbatim
    console.log("Location Request Accepted");
    console.log("Code Verified");
    console.log("Enrollment Created");
    console.log("Student Added To Active Students");

    return enrollment;
  } catch (error) {
    console.error('[Helper Activation Exception]', error);
    throw error;
  }
};
