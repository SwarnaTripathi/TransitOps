import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    liters: { type: Number, required: true, min: 0.01 },
    cost: { type: Number, required: true, min: 0 },
    distance: { type: Number, required: true, min: 0 }, // distance covered since last fill-up
    date: { type: Date, default: Date.now },

    // Fuel Anomaly Detection fields (Feature 1)
    actualEfficiency: { type: Number },
    expectedEfficiency: { type: Number },
    deviationPct: { type: Number },
    flagged: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const expenseSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    type: { type: String, enum: ["toll", "other"], default: "other" },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    note: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const FuelLog = mongoose.model("FuelLog", fuelLogSchema);
export const Expense = mongoose.model("Expense", expenseSchema);
