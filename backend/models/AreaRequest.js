import mongoose from 'mongoose';

const areaRequestSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    default: ''
  },
  requestCount: {
    type: Number,
    default: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

areaRequestSchema.index({ location: '2dsphere' });

const AreaRequest = mongoose.model('AreaRequest', areaRequestSchema);
export default AreaRequest;
