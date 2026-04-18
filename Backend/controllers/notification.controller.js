import EventNotification from '../models/eventNotification.model.js';
import EventRegistration from '../models/eventRegistration.model.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';
import { getTransporter, getSenderAddress } from '../config/nodemailer.config.js';

// Helper function to send emails
const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!to || !to.includes('@')) {
      console.error('Invalid email address:', to);
      return false;
    }

    const transporter = getTransporter();

    await transporter.sendMail({
      from: getSenderAddress(),
      to,
      subject,
      html: htmlContent,
    });
    console.log(`✓ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`✗ Email send error for ${to}:`, error.message);
    return false;
  }
};

// ─── Send Event Cancelled Notification ────────────────────────────────────────
export const sendEventCancelledNotification = async (req, res) => {
  try {
    const { eventId, reason } = req.body;

    if (!eventId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and reason are required',
      });
    }

    console.log(`\n[EVENT_CANCELLED] Starting notification for event: ${eventId}`);

    // Find event and check if exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    console.log(`[EVENT_CANCELLED] Event found: ${event.title}`);

    // Get all registered users for this event
    const registrations = await EventRegistration.find({ eventId }).populate(
      'userId',
      'name email'
    );

    console.log(`[EVENT_CANCELLED] Found ${registrations.length} registrations`);

    if (registrations.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No registered users to notify',
        sentTo: 0,
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    const failedEmails = [];

    // Send email to each registered user
    for (const registration of registrations) {
      const user = registration.userId;
      
      if (!user) {
        console.warn(`[EVENT_CANCELLED] Registration has no user data`);
        failedCount++;
        failedEmails.push('Unknown user (no data)');
        continue;
      }

      if (!user.email) {
        console.warn(`[EVENT_CANCELLED] User ${user._id} has no email`);
        failedCount++;
        failedEmails.push(user.name || user._id);
        continue;
      }

      const htmlContent = `
        <div style="font-family: 'Arial', sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF6B6B; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0; font-size: 24px;">Event Cancelled 🚫</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Event Details</h3>
            <p><strong>Event Name:</strong> ${event.title}</p>
            <p><strong>Scheduled Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}</p>
            <p><strong>Location:</strong> ${event.location || 'TBA'}</p>
          </div>

          <div style="padding: 20px; background-color: #FFE5E5; border-left: 4px solid #FF6B6B; margin-bottom: 20px; border-radius: 4px;">
            <h4 style="color: #FF6B6B; margin-top: 0;">Reason for Cancellation</h4>
            <p style="margin: 0; color: #333;">${reason}</p>
          </div>

          <p style="color: #666; line-height: 1.6;">
            We sincerely apologize for any inconvenience this may cause. If you have any questions, please don't hesitate to contact us.
          </p>

          <p style="margin-top: 30px; color: #999; font-size: 12px; text-align: center;">
            This is an automated notification from NGO Website. Please do not reply to this email.
          </p>
        </div>
      `;

      const sent = await sendEmail(
        user.email,
        `Event Cancelled: ${event.title}`,
        htmlContent
      );
      if (sent) sentCount++;
      else {
        failedCount++;
        failedEmails.push(user.email);
      }
    }

    console.log(`[EVENT_CANCELLED] Sent: ${sentCount}, Failed: ${failedCount}`);

    // Create notification record
    const notification = await EventNotification.create({
      eventId,
      notificationType: 'EVENT_CANCELLED',
      title: `Event Cancelled: ${event.title}`,
      message: reason,
      details: { reason },
      sentTo: sentCount,
      failedCount,
    });

    res.status(200).json({
      success: true,
      message: `Notification sent to ${sentCount} users${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
      notification,
      stats: {
        sentTo: sentCount,
        failedCount,
        totalRegistered: registrations.length,
        failedEmails: failedCount > 0 ? failedEmails : [],
      },
    });
  } catch (error) {
    console.error('[EVENT_CANCELLED] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending notification',
    });
  }
};

// ─── Send Venue Shifted Notification ──────────────────────────────────────────
export const sendVenueShiftedNotification = async (req, res) => {
  try {
    const { eventId, oldVenue, newVenue, reason } = req.body;

    if (!eventId || !oldVenue || !newVenue) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, old venue, and new venue are required',
      });
    }

    console.log(`\n[VENUE_SHIFTED] Starting notification for event: ${eventId}`);

    // Find event and check if exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    console.log(`[VENUE_SHIFTED] Event found: ${event.title}`);

    // Get all registered users for this event
    const registrations = await EventRegistration.find({ eventId }).populate(
      'userId',
      'name email'
    );

    console.log(`[VENUE_SHIFTED] Found ${registrations.length} registrations`);

    if (registrations.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No registered users to notify',
        sentTo: 0,
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    const failedEmails = [];

    // Send email to each registered user
    for (const registration of registrations) {
      const user = registration.userId;
      
      if (!user) {
        console.warn(`[VENUE_SHIFTED] Registration has no user data`);
        failedCount++;
        failedEmails.push('Unknown user (no data)');
        continue;
      }

      if (!user.email) {
        console.warn(`[VENUE_SHIFTED] User ${user._id} has no email`);
        failedCount++;
        failedEmails.push(user.name || user._id);
        continue;
      }

      const htmlContent = `
        <div style="font-family: 'Arial', sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FFA500; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0; font-size: 24px;">Venue Changed 📍</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Event Details</h3>
            <p><strong>Event Name:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}</p>
            <p><strong>Time:</strong> ${event.startTime || 'TBA'}</p>
          </div>

          <div style="padding: 20px; background-color: #FFF3E0; border-left: 4px solid #FFA500; margin-bottom: 20px; border-radius: 4px;">
            <h4 style="color: #FFA500; margin-top: 0;">Venue Changes</h4>
            <p style="margin: 10px 0;"><strong>Previous Location:</strong><br/> ${oldVenue}</p>
            <p style="margin: 10px 0;"><strong>New Location:</strong><br/> ${newVenue}</p>
            ${reason ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>

          <p style="color: #666; line-height: 1.6;">
            Please update your event location in your calendar. Thank you for your continued participation!
          </p>

          <p style="margin-top: 30px; color: #999; font-size: 12px; text-align: center;">
            This is an automated notification from NGO Website. Please do not reply to this email.
          </p>
        </div>
      `;

      const sent = await sendEmail(
        user.email,
        `Venue Changed: ${event.title}`,
        htmlContent
      );
      if (sent) sentCount++;
      else {
        failedCount++;
        failedEmails.push(user.email);
      }
    }

    console.log(`[VENUE_SHIFTED] Sent: ${sentCount}, Failed: ${failedCount}`);

    // Create notification record
    const notification = await EventNotification.create({
      eventId,
      notificationType: 'VENUE_SHIFTED',
      title: `Venue Changed: ${event.title}`,
      message: `Venue changed from ${oldVenue} to ${newVenue}`,
      details: { oldVenue, newVenue, reason },
      sentTo: sentCount,
      failedCount,
    });

    res.status(200).json({
      success: true,
      message: `Notification sent to ${sentCount} users${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
      notification,
      stats: {
        sentTo: sentCount,
        failedCount,
        totalRegistered: registrations.length,
        failedEmails: failedCount > 0 ? failedEmails : [],
      },
    });
  } catch (error) {
    console.error('[VENUE_SHIFTED] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending notification',
    });
  }
};

// ─── Send Time Shifted Notification ───────────────────────────────────────────
export const sendTimeShiftedNotification = async (req, res) => {
  try {
    const { eventId, oldTime, newTime, reason } = req.body;

    if (!eventId || !oldTime || !newTime) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, old time, and new time are required',
      });
    }

    console.log(`\n[TIME_SHIFTED] Starting notification for event: ${eventId}`);

    // Find event and check if exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    console.log(`[TIME_SHIFTED] Event found: ${event.title}`);

    // Get all registered users for this event
    const registrations = await EventRegistration.find({ eventId }).populate(
      'userId',
      'name email'
    );

    console.log(`[TIME_SHIFTED] Found ${registrations.length} registrations`);

    if (registrations.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No registered users to notify',
        sentTo: 0,
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    const failedEmails = [];

    // Send email to each registered user
    for (const registration of registrations) {
      const user = registration.userId;
      
      if (!user) {
        console.warn(`[TIME_SHIFTED] Registration has no user data`);
        failedCount++;
        failedEmails.push('Unknown user (no data)');
        continue;
      }

      if (!user.email) {
        console.warn(`[TIME_SHIFTED] User ${user._id} has no email`);
        failedCount++;
        failedEmails.push(user.name || user._id);
        continue;
      }

      const htmlContent = `
        <div style="font-family: 'Arial', sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #9C27B0; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0; font-size: 24px;">Event Time Changed ⏰</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Event Details</h3>
            <p><strong>Event Name:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}</p>
            <p><strong>Location:</strong> ${event.location || 'TBA'}</p>
          </div>

          <div style="padding: 20px; background-color: #F3E5F5; border-left: 4px solid #9C27B0; margin-bottom: 20px; border-radius: 4px;">
            <h4 style="color: #9C27B0; margin-top: 0;">Time Changes</h4>
            <p style="margin: 10px 0;"><strong>Previous Time:</strong> ${oldTime}</p>
            <p style="margin: 10px 0;"><strong>New Time:</strong> ${newTime}</p>
            ${reason ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>

          <p style="color: #666; line-height: 1.6;">
            Please update your event time in your calendar. Make sure you don't miss the event at the new time!
          </p>

          <p style="margin-top: 30px; color: #999; font-size: 12px; text-align: center;">
            This is an automated notification from NGO Website. Please do not reply to this email.
          </p>
        </div>
      `;

      const sent = await sendEmail(
        user.email,
        `Event Time Changed: ${event.title}`,
        htmlContent
      );
      if (sent) sentCount++;
      else {
        failedCount++;
        failedEmails.push(user.email);
      }
    }

    console.log(`[TIME_SHIFTED] Sent: ${sentCount}, Failed: ${failedCount}`);

    // Create notification record
    const notification = await EventNotification.create({
      eventId,
      notificationType: 'TIME_SHIFTED',
      title: `Event Time Changed: ${event.title}`,
      message: `Event time changed from ${oldTime} to ${newTime}`,
      details: { oldTime, newTime, reason },
      sentTo: sentCount,
      failedCount,
    });

    res.status(200).json({
      success: true,
      message: `Notification sent to ${sentCount} users${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
      notification,
      stats: {
        sentTo: sentCount,
        failedCount,
        totalRegistered: registrations.length,
        failedEmails: failedCount > 0 ? failedEmails : [],
      },
    });
  } catch (error) {
    console.error('[TIME_SHIFTED] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending notification',
    });
  }
};

// ─── Get Event Notifications (for users to see) ────────────────────────────────
export const getEventNotifications = async (req, res) => {
  try {
    const { eventId } = req.query;
    const limit = parseInt(req.query.limit) || 50;

    console.log(`\n[GET_NOTIFICATIONS] Starting fetch`);
    console.log(`[GET_NOTIFICATIONS] Query params - eventId: ${eventId}, limit: ${limit}`);

    let query = {};
    if (eventId) query.eventId = eventId;

    // Get all notifications (users receive notifications about events they registered for)
    const notifications = await EventNotification.find(query)
      .populate('eventId', 'title date location')
      .sort({ createdAt: -1 })
      .limit(limit);

    console.log(`[GET_NOTIFICATIONS] Found ${notifications.length} notifications`);
    
    // Log each notification for debugging
    notifications.forEach((notif, index) => {
      console.log(`[GET_NOTIFICATIONS] Notification ${index + 1}: ${notif.title} (${notif.notificationType})`);
    });

    res.status(200).json({
      success: true,
      data: notifications,
      total: notifications.length,
    });
  } catch (error) {
    console.error('[GET_NOTIFICATIONS] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching notifications',
    });
  }
};
