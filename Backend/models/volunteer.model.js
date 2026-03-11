import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema({
  // Link to a registered user (optional for NGO-added volunteers)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  // --- 1. Personal Information ---
  fullName: {
    type: String,
    required: [true, 'Full Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  dob: {
    type: Date,
    required: [true, 'Date of Birth is required']
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true
  },

  // --- 2. Preferences ---
  interests: {
    type: [String], // Array of strings for multi-select checkboxes
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Select at least one area of interest'
    }
  },
  mode: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },
  availability: {
    type: String,
    enum: ['Weekdays', 'Weekends', 'Flexible']
  },

  // --- 3. Skills & Experience ---
  occupation: {
    type: String,
    trim: true
  },
  education: {
    type: String,
    enum: ['High School', 'Undergraduate', 'Postgraduate', 'Other']
  },
  skills: {
    type: String, // Storing comma-separated string from input
    trim: true
  },

  // --- 4. Safety & Verification ---
  idType: {
    type: String,
    enum: ['Aadhaar', 'PAN'],
    required: [true, 'ID Type is required']
  },
  idNumber: {
    type: String,
    required: [true, 'ID Number is required'],
    trim: true
  },
  idVerified: {
    type: Boolean,
    default: false
  },
  emergencyName: {
    type: String,
    trim: true
  },
  emergencyPhone: {
    type: String,
    trim: true
  },
  bgCheck: {
    type: Boolean,
    default: false
  },

  // --- 5. Motivation ---
  motivation: {
    type: String,
    required: [true, 'Motivation is required'],
    trim: true
  },
  declaration: {
    type: Boolean,
    required: [true, 'You must agree to the declaration'],
    validate: {
      validator: function (v) {
        return v === true;
      },
      message: 'Declaration must be accepted'
    }
  },

  // --- NGO Link ---
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ngo",
    default: null
  },

  // --- System Fields ---
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  role: {
    type: String,
    trim: true,
    default: ''
  },
  assignedArea: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enforce one application per user per NGO (only for registered users)
volunteerSchema.index(
  { user: 1, ngoId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { user: { $ne: null } } }
);

export default mongoose.model("Volunteer", volunteerSchema);
