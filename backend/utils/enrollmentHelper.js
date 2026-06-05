import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Enrollment from '../models/Enrollment.js';
import TeacherStudentConnection from '../models/TeacherStudentConnection.js';

/**
 * Single source of truth for active student enrollment.
 * Automatically creates/updates TeacherStudentConnection and Enrollment,
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

    const className = student.class || 'Class 10';
    const subjectName = subject || teacher.subjects[0] || 'General Cohort';

    // 2. Check if enrollment already exists for this teacher, student, class, and subject
    let enrollment = await Enrollment.findOne({
      teacher: teacherId,
      student: studentId,
      class: className,
      subject: subjectName
    });

    if (enrollment) {
      // If exists, mark status as active
      enrollment.status = 'active';
      if (parentPhone) enrollment.parentPhone = parentPhone;
      await enrollment.save();
    } else {
      // Create new enrollment
      enrollment = await Enrollment.create({
        teacher: teacherId,
        student: studentId,
        name: student.user?.name || 'Online Student',
        class: className,
        subject: subjectName,
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
