import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    type: { type: String, required: true }, // e.g. "Oil Change", "Tire Rotation", "Brake Inspection"
    description: { type: String, default: "" },
    cost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const MaintenanceLog = mongoose.model("MaintenanceLog", maintenanceLogSchema);

export default MaintenanceLog;
