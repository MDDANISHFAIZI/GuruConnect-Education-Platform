import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null // Null for manual offline student
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
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Set up virtuals for requested aliases
enrollmentSchema.virtual('teacherId').get(function() {
  return this.teacher;
}).set(function(val) {
  this.teacher = val;
});

enrollmentSchema.virtual('studentId').get(function() {
  return this.student;
}).set(function(val) {
  this.student = val;
});

enrollmentSchema.virtual('className').get(function() {
  return this.class;
}).set(function(val) {
  this.class = val;
});

enrollmentSchema.virtual('enrollmentStatus').get(function() {
  return this.status;
}).set(function(val) {
  this.status = val;
});

enrollmentSchema.virtual('joinedAt').get(function() {
  return this.joiningDate;
}).set(function(val) {
  this.joiningDate = val;
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;
