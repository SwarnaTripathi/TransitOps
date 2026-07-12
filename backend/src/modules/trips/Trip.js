import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  status: { type: String, enum: ['Completed', 'Draft', 'Dispatched', 'Cancelled'], default: 'Draft' },
  revenue: { type: Number, default: 0 } // Needed for ROI calculation
});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
