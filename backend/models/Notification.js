import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'ENROLLMENT_REQUEST',
      'ENROLLMENT_ACCEPTED',
      'NEW_NOTE',
      'NEW_DOUBT',
      'DOUBT_REPLY',
      'ATTENDANCE_MARKED',
      'FEE_DUE',
      'ANNOUNCEMENT',
      'MESSAGE'
    ],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Alias virtuals for requested model structure:
notificationSchema.virtual('userId').get(function() {
  return this.user;
}).set(function(val) {
  this.user = val;
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
