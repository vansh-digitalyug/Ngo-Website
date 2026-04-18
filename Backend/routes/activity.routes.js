import express from 'express';
import {
  getUserActivity,
  getActivityByType,
  getActivityStats,
  deleteActivity,
} from '../controllers/activity.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get user's recent activities
router.get('/user/activity', authenticate, getUserActivity);

// Get activity by type
router.get('/user/activity/type/:type', authenticate, getActivityByType);

// Get activity statistics
router.get('/user/activity/stats', authenticate, getActivityStats);

// Delete/hide an activity
router.delete('/user/activity/:activityId', authenticate, deleteActivity);

export default router;
