import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
