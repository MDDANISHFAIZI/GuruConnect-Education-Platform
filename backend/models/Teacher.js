import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjects: {
    type: [String],
    required: true
  },
  classes: {
    type: [String],
    required: true
  },
  teachesFrom: {
    type: Number,
    default: 1
  },
  teachesTo: {
    type: Number,
    default: 12
  },
  fees: {
    type: Number,
    required: true
  },
  timings: {
    type: String,
    required: true
  },
  qualification: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  mode: {
    type: String,
    enum: ['online', 'offline', 'both'],
    default: 'offline'
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  profileImagePublicId: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: true
  },
  villageOrArea: {
    type: String,
    required: true,
    default: 'Detected Area'
  },
  teachingArea: {
    type: String,
    required: true,
    default: 'Detected Area'
  },
  locality: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    required: true,
    default: 'Dhanbad'
  },
  state: {
    type: String,
    required: true,
    default: 'Jharkhand'
  },
  demoAvailable: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [longitude, latitude] - optional
    }
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  joinedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
});

// Create 2dsphere index on the location field for geolocation queries
teacherSchema.index({ location: '2dsphere' });

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
