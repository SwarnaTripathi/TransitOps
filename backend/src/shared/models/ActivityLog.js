import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: String,
      default: "System",
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    actorName: {
      type: String,
      required: false,
      default: "System",
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["User", "Vehicle", "Driver", "Trip", "Maintenance", "Auth"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by entity type and timestamp
activityLogSchema.index({ entityType: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
