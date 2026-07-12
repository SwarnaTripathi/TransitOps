import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  cargoWeight: {
    type: Number,
    required: true,
    min: 0
  },
  plannedDistance: {
    type: Number,
    required: true,
    min: 0
  },
  actualDistance: {
    type: Number,
    default: null
  },
  fuelConsumed: {
    type: Number,
    default: null
  },
  revenue: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  dispatchedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
