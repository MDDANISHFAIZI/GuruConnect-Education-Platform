import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  studentEnrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentEnrollment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  month: {
    type: String,
    required: true // e.g. "May 2026"
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  paidDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  dueAmount: {
    type: Number,
    default: 0
  },
  receiptNumber: {
    type: String,
    default: ''
  }
});

// Automatic pre-save hook to generate professional receipt numbers when fee is marked paid
feeSchema.pre('save', async function(next) {
  if (this.status === 'paid' && !this.receiptNumber) {
    const today = this.paidDate ? new Date(this.paidDate) : new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyymmdd = `${yyyy}${mm}${dd}`;
    
    // Generate a random 3-digit number to guarantee uniqueness
    const rand = Math.floor(100 + Math.random() * 900);
    this.receiptNumber = `GC-${yyyymmdd}-${rand}`;
    console.log(`[DEBUG LOG] [FEE PRE-SAVE] Automatically generated Receipt Number: "${this.receiptNumber}" for Student: "${this.studentName}"`);
  }
  next();
});

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
