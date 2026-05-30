import mongoose from 'mongoose';

const teacherConnectionCodeSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });

const TeacherConnectionCode = mongoose.model('TeacherConnectionCode', teacherConnectionCodeSchema);
export default TeacherConnectionCode;
