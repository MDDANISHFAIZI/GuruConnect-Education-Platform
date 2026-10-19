import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    default: 'General'
  },
  class: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'assignment', 'docx'],
    default: 'pdf'
  },
  rawContent: {
    type: String,
    default: ''
  },
  isIndexed: {
    type: Boolean,
    default: false
  },
  indexedAt: {
    type: Date
  },
  chunkCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);
export default Note;
