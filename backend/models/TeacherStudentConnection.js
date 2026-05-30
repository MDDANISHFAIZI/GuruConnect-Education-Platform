import mongoose from 'mongoose';

const teacherStudentConnectionSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  connectedAt: {
    type: Date
  }
}, { timestamps: true });

// Prevent duplicate student connections under same teacher
teacherStudentConnectionSchema.index({ teacher: 1, student: 1 }, { unique: true });

const TeacherStudentConnection = mongoose.model('TeacherStudentConnection', teacherStudentConnectionSchema);
export default TeacherStudentConnection;
