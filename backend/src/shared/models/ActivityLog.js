import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  actorName: {
    type: String,
    required: false,
    default: 'System'
  },
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    enum: ['Vehicle', 'Driver', 'Trip', 'Maintenance'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
