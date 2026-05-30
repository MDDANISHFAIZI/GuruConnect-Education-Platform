import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    default: ''
  },
  isResolved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Doubt = mongoose.model('Doubt', doubtSchema);
export default Doubt;
