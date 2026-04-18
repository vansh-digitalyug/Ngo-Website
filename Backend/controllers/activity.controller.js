import Activity from '../models/activity.model.js';
import mongoose from 'mongoose';

// Helper to validate MongoDB ObjectId
const validateMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Get user's recent activities
 * GET /api/user/activity
 */
export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId || !validateMongoId(userId)) {
      console.error('getUserActivity: Invalid user ID', { userId, userObj: req.user });
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const limit = parseInt(req.query.limit) || 15;
    const skip = parseInt(req.query.skip) || 0;

    console.log('Fetching activities for user:', { userId, limit, skip });

    const activities = await Activity.find({
      userId,
      isVisible: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('type title description amount reference createdAt');

    const totalCount = await Activity.countDocuments({
      userId,
      isVisible: true,
    });

    console.log('Activity fetch result:', {
      userId,
      found: activities.length,
      total: totalCount,
    });

    res.json({
      success: true,
      data: activities,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
};

/**
 * Get activity by type (internal method for dashboards)
 * GET /api/user/activity/type/:type
 */
export const getActivityByType = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (!userId || !validateMongoId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const activities = await Activity.find({
      userId,
      type,
      isVisible: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('type title description amount reference createdAt');

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('Get activity by type error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
};

/**
 * Log a new activity (Internal Helper - Called by other controllers)
 * POST /api/user/activity/log (DO NOT expose to user directly)
 */
export const logActivity = async (req, res) => {
  try {
    const { userId, type, title, description, amount, reference, metadata } = req.body;

    if (!userId || !type || !title) {
      return res.status(400).json({
        success: false,
        message: 'userId, type, and title are required',
      });
    }

    const activity = new Activity({
      userId,
      type,
      title,
      description,
      amount: amount || null,
      reference: reference || {},
      metadata: metadata || {},
    });

    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: activity,
    });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to log activity' });
  }
};

/**
 * Bulk create activities (for internal use)
 * Used when multiple activities need to be logged together
 */
export const createActivity = async (userId, type, title, description, amount = null, reference = {}, metadata = {}) => {
  try {
    if (!userId || !type || !title) {
      console.error('createActivity: Missing required fields', { userId, type, title });
      return null;
    }

    // Validate that userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('createActivity: Invalid userId ObjectId', { userId });
      return null;
    }

    const activity = new Activity({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      title,
      description,
      amount,
      reference,
      metadata,
      isVisible: true,
    });

    const savedActivity = await activity.save();
    
    console.log('✓ Activity saved successfully:', {
      activityId: savedActivity._id,
      userId: savedActivity.userId,
      type: savedActivity.type,
      title: savedActivity.title,
    });
    
    return savedActivity;
  } catch (error) {
    console.error('✗ createActivity error:', error.message, {
      userId,
      type,
      title,
      stack: error.stack,
    });
    return null;
  }
};

/**
 * Get activity statistics for dashboard
 * GET /api/user/activity/stats
 */
export const getActivityStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !validateMongoId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Activity.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isVisible: true,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$amount', 0] } },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity stats' });
  }
};

/**
 * Delete activity (soft delete - set isVisible to false)
 */
export const deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user?.id;

    if (!validateMongoId(activityId) || !validateMongoId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const activity = await Activity.findOneAndUpdate(
      { _id: activityId, userId },
      { isVisible: false },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.json({
      success: true,
      message: 'Activity deleted successfully',
      data: activity,
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete activity' });
  }
};
