import EventRegistration from '../models/eventRegistration.model.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';
import nodemailer from 'nodemailer';

// ─── USER: Register for event ─────────────────────────────────────────────────
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, fullName, email, phone, registrationType, additionalInfo } = req.body;
    const userId = req.user._id;

    // Validation
    if (!eventId || !fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (eventId, fullName, email, phone)'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate phone format
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone format (minimum 10 digits)'
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registration deadline has passed
    const registrationDeadline = new Date(event.registrationDeadline || event.date);
    if (new Date() > registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed for this event'
      });
    }

    // Check if spots are available
    const registrationCount = await EventRegistration.countDocuments({ eventId, status: { $in: ['registered', 'attended'] } });
    const eventCapacity = event.eventCapacity || 100; // default 100 if not set
    
    if (registrationCount >= eventCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is fully booked. No spots available.'
      });
    }

    // Check if user is already registered
    const existingRegistration = await EventRegistration.findOne({ eventId, userId });
    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Create registration
    const registration = await EventRegistration.create({
      eventId,
      userId,
      fullName,
      email,
      phone,
      registrationType: registrationType || 'individual',
      additionalInfo: additionalInfo || null,
      status: 'registered'
    });

    // Send confirmation email (non-blocking)
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.MAIL_FROM_EMAIL,
          pass: process.env.MAIL_FROM_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.MAIL_FROM_EMAIL,
        to: email,
        subject: `Registration Confirmed: ${event.title}`,
        html: `
          <div style="font-family: 'Arial', sans-serif; color: #333;">
            <h2 style="color: #4A3F35;">Registration Confirmed! ✓</h2>
            <p>Hi ${fullName},</p>
            <p>Thank you for registering for our event!</p>
            <div style="background-color: #FDFBF7; padding: 20px; border-left: 4px solid #9B7341; margin: 20px 0; border-radius: 4px;">
              <h3 style="color: #9B7341; margin-top: 0;">Event Details</h3>
              <p><strong>Event:</strong> ${event.title}</p>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p><strong>Time:</strong> ${event.startTime || 'TBA'}</p>
              <p><strong>Location:</strong> ${event.location || 'TBA'}</p>
            </div>
            <p>We look forward to seeing you at the event!</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending error:', emailError.message);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event!',
      registration: {
        _id: registration._id,
        eventId: registration.eventId,
        status: registration.status,
        registeredAt: registration.registeredAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering for event'
    });
  }
};

// ─── USER: Check if registered for event ──────────────────────────────────────
export const checkRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const registration = await EventRegistration.findOne({ eventId, userId });

    res.json({
      success: true,
      isRegistered: !!registration,
      registration: registration ? {
        _id: registration._id,
        status: registration.status,
        registeredAt: registration.registeredAt
      } : null
    });

  } catch (error) {
    console.error('Check registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error checking registration'
    });
  }
};

// ─── USER: Get user's all registrations ────────────────────────────────────────
export const getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10, page = 1 } = req.query;

    let query = { userId };
    if (status) query.status = status;

    const registrations = await EventRegistration.find(query)
      .populate('eventId', 'title date location startTime imageUrl')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ registeredAt: -1 });

    const total = await EventRegistration.countDocuments(query);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      registrations
    });

  } catch (error) {
    console.error('Get user registrations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching registrations'
    });
  }
};

// ─── USER: Cancel registration ─────────────────────────────────────────────────
export const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const registration = await EventRegistration.findOne({ eventId, userId });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (registration.status === 'attended') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration for an event you have attended'
      });
    }

    await EventRegistration.deleteOne({ _id: registration._id });

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling registration'
    });
  }
};

// ─── ADMIN: Get event registrations ────────────────────────────────────────────
export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, search, limit = 20, page = 1 } = req.query;

    let query = { eventId };
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const registrations = await EventRegistration.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ registeredAt: -1 });

    const total = await EventRegistration.countDocuments(query);

    // Get event details
    const event = await Event.findById(eventId).select('title eventCapacity');

    res.json({
      success: true,
      event,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      registrations
    });

  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching event registrations'
    });
  }
};

// ─── ADMIN: Get registration statistics ────────────────────────────────────────
export const getRegistrationStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Count registrations by status
    const registered = await EventRegistration.countDocuments({ eventId, status: 'registered' });
    const attended = await EventRegistration.countDocuments({ eventId, status: 'attended' });
    const cancelled = await EventRegistration.countDocuments({ eventId, status: 'cancelled' });
    const noShow = await EventRegistration.countDocuments({ eventId, status: 'no-show' });

    const eventCapacity = event.eventCapacity || 100;
    const spotsRemaining = Math.max(0, eventCapacity - registered);
    const attendanceRate = registered > 0 ? ((attended / registered) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      stats: {
        totalCapacity: eventCapacity,
        registered,
        attended,
        cancelled,
        noShow,
        spotsRemaining,
        attendanceRate: `${attendanceRate}%`,
        capacityFilled: `${((registered / eventCapacity) * 100).toFixed(2)}%`
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching statistics'
    });
  }
};

// ─── ADMIN: Mark attendance ────────────────────────────────────────────────────
export const markAttendance = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await EventRegistration.findByIdAndUpdate(
      registrationId,
      {
        status: 'attended',
        attendedAt: new Date()
      },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Marked as attended',
      registration
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking attendance'
    });
  }
};

// ─── ADMIN: Export registrations as CSV ────────────────────────────────────────
export const exportRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;

    let query = { eventId };
    if (status) query.status = status;

    const registrations = await EventRegistration.find(query).sort({ registeredAt: -1 });
    const event = await Event.findById(eventId);

    // Create CSV content
    let csv = 'Full Name,Email,Phone,Type,Status,Registered Date,Attended Date\n';
    registrations.forEach(reg => {
      csv += `"${reg.fullName}","${reg.email}","${reg.phone}","${reg.registrationType}","${reg.status}","${new Date(reg.registeredAt).toLocaleDateString()}","${reg.attendedAt ? new Date(reg.attendedAt).toLocaleDateString() : 'N/A'}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="event-registrations-${event.title}.csv"`);
    res.send('\uFEFF' + csv);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error exporting registrations'
    });
  }
};

// ─── FRONTEND: Get event spots remaining ───────────────────────────────────────
export const getEventSpots = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const registrationCount = await EventRegistration.countDocuments({ 
      eventId, 
      status: { $in: ['registered', 'attended'] } 
    });

    const eventCapacity = event.eventCapacity || 100;
    const spotsRemaining = Math.max(0, eventCapacity - registrationCount);
    const isFullyBooked = spotsRemaining === 0;

    res.json({
      success: true,
      eventCapacity,
      registeredCount: registrationCount,
      spotsRemaining,
      isFullyBooked,
      capacityPercentage: ((registrationCount / eventCapacity) * 100).toFixed(2)
    });

  } catch (error) {
    console.error('Get spots error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching event spots'
    });
  }
};

// ─── ADMIN: Get all registrations across all events ──────────────────────────────
export const getAllRegistrations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, eventId, search } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (eventId) {
      query.eventId = eventId;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const registrations = await EventRegistration.find(query)
      .populate('eventId', 'title date location')
      .populate('userId', 'name email')
      .sort({ registeredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EventRegistration.countDocuments(query);

    res.json({
      success: true,
      data: registrations,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all registrations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching registrations'
    });
  }
};
