import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  regNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  maxLoadCapacity: {
    type: Number,
    required: true
  },
  odometer: {
    type: Number,
    required: true,
    default: 0
  },
  acquisitionCost: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
    default: 'Available'
  },
  region: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
