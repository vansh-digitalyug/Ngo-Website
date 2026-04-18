import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'donation',
        'profile_update',
        'event_registration',
        'survey_completed',
        'task_created',
        'task_completed',
        'feedback_submitted',
        'verification_completed',
        'badge_earned',
        'volunteer_task',
        'kanyadan_application',
        'community_post',
        'document_upload',
        'login',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      default: null,
    },
    reference: {
      type: {
        type: String, // 'donation', 'event', 'survey', etc.
      },
      id: mongoose.Schema.Types.ObjectId,
      name: String,
    },
    metadata: {
      type: Object,
      default: {},
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, type: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
