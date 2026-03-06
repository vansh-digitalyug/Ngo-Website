import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema({
  // --- Step 1: Basic Info ---
  ngoName: {
    type: String,
    required: [true, 'NGO Name is required'],
    trim: true
  },
  ngoS3Id:{
    type: String,
    default: ''
  },
  regType: {
    type: String,
    required: [true, 'Registration Type is required'],
    enum: ['Public Trust', 'Society', 'Section 8 Company'] // Matches your dropdown
  },
  regNumber: {
    type: String,
    required: [true, 'Registration Number is required'],
    unique: true, // Prevents duplicate registrations
    trim: true
  },
  estYear: {
    type: Number,
    min: [1800, 'Year must be valid'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  darpanId: {
    type: String,
    trim: true,
    default: ''
  },
  panNumber: {
    type: String,
    trim: true,
    uppercase: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },

  // --- Step 2: Location ---
  state: {
    type: String,
    required: [true, 'State is required']
  },
  district: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  pincode: {
    type: String, // String is safer for codes to preserve leading zeros
    required: [true, 'Pincode is required'],
    match: [/^\d{6}$/, 'Invalid 6-digit Pincode'] // Matches frontend validation
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },

  // --- Step 3: Contact ---
  contactName: {
    type: String,
    required: [true, 'Contact Name is required'],
    trim: true
  },
  contactRole: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    required: [true, 'Phone Number is required'],
    match: [/^\d{10}$/, 'Phone number must be 10 digits'] // Matches frontend validation
  },
  whatsapp: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Invalid email address'] // Matches frontend validation
  },
  website: {
    type: String,
    trim: true,
    default: ''
  },
  socialMedia: {
    facebook: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' }
  },

  // --- Step 4: Services ---
  services: {
    type: [String], // Array of strings
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Select at least one service'
    }
  },
  otherService: {
    type: String,
    trim: true,
    default: ''
  },

  // --- Step 5: Documents (Storing File URLs/Paths) ---
  // Assuming you will upload files to cloud/server and store the string URL here
  documents: {
    registrationCertificate: { type: String, default: '' },
    certificate12A: { type: String, default: '' },
    certificate80G: { type: String, default: '' }
  },

  // --- Metadata & Agreements ---
  agreeToTerms: {
    type: Boolean,
    required: [true, 'You must agree to the terms'],
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false // Set to true only after admin verification
  },
  
  // --- Ownership & Team ---
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  teamMembers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    role: {
      type: String,
      enum: ["manager", "coordinator"],
      default: "coordinator"
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // --- Statistics (cached for dashboard) ---
  stats: {
    totalDonations: { type: Number, default: 0 },
    totalVolunteers: { type: Number, default: 0 },
    totalGalleryItems: { type: Number, default: 0 }
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

export default mongoose.model("Ngo", ngoSchema);
