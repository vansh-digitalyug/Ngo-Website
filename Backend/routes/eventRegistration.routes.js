import express from 'express';
import {
  registerForEvent,
  checkRegistration,
  getUserRegistrations,
  cancelRegistration,
  getEventRegistrations,
  getRegistrationStats,
  markAttendance,
  exportRegistrations,
  getEventSpots,
  getAllRegistrations
} from '../controllers/eventRegistration.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { verifyAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

// ─── PUBLIC Routes ────────────────────────────────────────────────────────────
router.get('/:eventId/spots', getEventSpots);

// ─── USER Routes (require authentication) ────────────────────────────────────
router.post('/register', authenticate, registerForEvent);
router.get('/:eventId/check', authenticate, checkRegistration);
router.get('/user/registrations', authenticate, getUserRegistrations);
router.delete('/:eventId/cancel', authenticate, cancelRegistration);

// ─── ADMIN Routes (require authentication + admin) ────────────────────────────
router.get('/admin/all', authenticate, verifyAdmin, getAllRegistrations);
router.get('/admin/:eventId/registrations', authenticate, verifyAdmin, getEventRegistrations);
router.get('/admin/:eventId/stats', authenticate, verifyAdmin, getRegistrationStats);
router.put('/admin/:registrationId/mark-attended', authenticate, verifyAdmin, markAttendance);
router.get('/admin/:eventId/export', authenticate, verifyAdmin, exportRegistrations);

export default router;
