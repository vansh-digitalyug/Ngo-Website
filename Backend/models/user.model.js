import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        default: ""
    },
    address: {
        type: String,
        trim: true,
        default: ""
    },
    city: {
        type: String,
        trim: true,
        default: ""
    },
    state: {
        type: String,
        trim: true,
        default: ""
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: function () {
            return this.authProvider === "local";
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        trim: true,
        default: "",
        maxlength: [200, "Bio cannot exceed 200 characters"]
    },
    preferredLanguage: {
        type: String,
        default: "English",
        enum: ["English", "Hindi", "Marathi"]
    },
    timezone: {
        type: String,
        default: "Asia/Kolkata"
    },
    socialAccounts: {
        linkedin: {
            type: String,
            trim: true,
            default: null
        },
        twitter: {
            type: String,
            trim: true,
            default: null
        },
        facebook: {
            type: String,
            trim: true,
            default: null
        }
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOtpHash: {
        type: String,
        default: null
    },
    emailVerificationOtpExpiresAt: {
        type: Date,
        default: null
    },
    emailVerificationOtpAttempts: {
        type: Number,
        default: 0
    },
    emailVerificationOtpLastSentAt: {
        type: Date,
        default: null
    },
    resetPasswordTokenHash: {
        type: String,
        default: null
    },
    resetPasswordExpiresAt: {
        type: Date,
        default: null
    },
    aadhaarVerified: {
        type: Boolean,
        default: false
    },
    panVerified: {
        type: Boolean,
        default: false
    },
    panNumber: {
        type: String,
        default: null,
        trim: true
    },
    panVerificationData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    // --- NGO Dashboard Access ---
    ngoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ngo",
        default: null
    },
    ngoRole: {
        type: String,
        enum: ["owner", "manager", "coordinator", null],
        default: null
    },

    // --- Community Dashboard Access ---
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        default: null
    },
    communityRole: {
        type: String,
        enum: ["leader", "co-leader", "coordinator", null],
        default: null
    }
}, {
    timestamps: true
})

userSchema.index({ resetPasswordTokenHash: 1, resetPasswordExpiresAt: 1 });
userSchema.index({ emailVerificationOtpHash: 1, emailVerificationOtpExpiresAt: 1 });
// userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

// ✅ Added indexes
userSchema.index({ role: 1 });                        // admin: find all admins quickly
userSchema.index({ ngoId: 1 });                       // find all users belonging to an NGO
userSchema.index({ createdAt: -1 });                  // admin: recent registrations

const User = mongoose.model("User", userSchema);
export default User;
