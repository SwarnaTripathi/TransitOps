import express from 'express';
import ActivityLog from '../models/ActivityLog.js';
import { authGuard } from '../middleware/auth.js';

const router = express.Router();

// GET last 20 activity logs
router.get('/', authGuard, async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(20);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

export default router;
