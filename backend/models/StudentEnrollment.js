import mongoose from 'mongoose';

const studentEnrollmentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student' // Null for manual offline student
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  fees: {
    type: Number,
    required: true
  },
  parentPhone: {
    type: String,
    default: ''
  },
  studentPhone: {
    type: String,
    default: ''
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending' // pending until marked as paid/approved
  },
  type: {
    type: String,
    enum: ['online', 'manual'],
    default: 'online'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const StudentEnrollment = mongoose.model('StudentEnrollment', studentEnrollmentSchema);
export default StudentEnrollment;
