import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { verifyAdmin } from '../middlewares/admin.middleware.js';
import {
  sendEventCancelledNotification,
  sendVenueShiftedNotification,
  sendTimeShiftedNotification,
  getEventNotifications,
} from '../controllers/notification.controller.js';

const router = express.Router();

// ─── ADMIN Routes (send notifications) ────────────────────────────────────────
router.post(
  '/admin/event-cancelled',
  authenticate,
  verifyAdmin,
  sendEventCancelledNotification
);

router.post(
  '/admin/venue-shifted',
  authenticate,
  verifyAdmin,
  sendVenueShiftedNotification
);

router.post(
  '/admin/time-shifted',
  authenticate,
  verifyAdmin,
  sendTimeShiftedNotification
);

// ─── USER Routes (get notifications) ──────────────────────────────────────────
router.get('/my-notifications', authenticate, getEventNotifications);

export default router;
