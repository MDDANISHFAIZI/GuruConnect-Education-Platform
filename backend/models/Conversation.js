import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Study Session',
    trim: true
  },
  subject: {
    type: String,
    default: 'General'
  },
  class: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    enum: ['chat', 'agent', 'quiz', 'explain'],
    default: 'chat'
  }
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
