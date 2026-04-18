/**
 * Seed script to populate user profile for vt718147@gmail.com
 * Run: node seed/seedUserProfile.js
 */

import "../config/loadEnv.js";
import connectDB from "../config/db.js";
import User from "../models/user.model.js";
import Volunteer from "../models/volunteer.model.js";
import bcrypt from "bcrypt";

const DEFAULT_BCRYPT_SALT_ROUNDS = 8;
const BCRYPT_SALT_ROUNDS = (() => {
  const parsedRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
  return Number.isInteger(parsedRounds) && parsedRounds >= 8 && parsedRounds <= 14
    ? parsedRounds
    : DEFAULT_BCRYPT_SALT_ROUNDS;
})();

async function seedUserProfile() {
  await connectDB();
  console.log("🔌 Connected to database\n");

  try {
    const email = "vt718147@gmail.com";

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log("📝 Creating new user...");
      
      // Hash password for local auth
      const hashedPassword = await bcrypt.hash("TestPassword123!", BCRYPT_SALT_ROUNDS);

      user = await User.create({
        name: "Vansh Tyagi",
        email: email,
        phone: "+91-9876543210",
        address: "123 Main Street, Test Colony",
        city: "Mumbai",
        state: "Maharashtra",
        authProvider: "local",
        role: "user",
        password: hashedPassword,
        avatar: null,
        emailVerified: true,
        aadhaarVerified: false,
        panVerified: false
      });

      console.log("✅ User created successfully!");
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user._id}\n`);
    } else {
      console.log("✅ User already exists!");
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user._id}\n`);
    }

    // Check if volunteer profile exists for this user
    let volunteer = await Volunteer.findOne({ 
      $or: [
        { email: email },
        { user: user._id }
      ]
    });

    if (!volunteer) {
      console.log("📝 Creating volunteer profile...");

      volunteer = await Volunteer.create({
        user: user._id,
        fullName: "Vansh Tyagi",
        email: email,
        phone: "+91-9876543210",
        dob: new Date("1995-05-15"),
        city: "Mumbai",
        state: "Maharashtra",
        interests: ["Education", "Healthcare", "Environment"],
        mode: "Hybrid",
        availability: "Flexible",
        profession: "Student",
        occupation: "Full-time Student",
        education: "Postgraduate",
        skills: "Leadership, Communication, Problem Solving",
        idType: "Aadhaar",
        idNumber: "123456789012",
        idVerified: true,
        emergencyName: "John Tyagi",
        emergencyPhone: "+91-9876543211",
        bgCheck: false,
        motivation: "I am passionate about making a positive impact in society through volunteering and community service.",
        declaration: true,
        status: "Approved"
      });

      console.log("✅ Volunteer profile created successfully!");
      console.log(`   Name: ${volunteer.fullName}`);
      console.log(`   Interests: ${volunteer.interests.join(", ")}`);
      console.log(`   Status: ${volunteer.status}`);
      console.log(`   ID: ${volunteer._id}\n`);
    } else {
      console.log("✅ Volunteer profile already exists!");
      console.log(`   Name: ${volunteer.fullName}`);
      console.log(`   Status: ${volunteer.status}`);
      console.log(`   Email: ${volunteer.email}`);
      console.log(`   ID: ${volunteer._id}\n`);
    }


    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✨ Profile seeding completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📊 User Profile Data:");
    console.log("  ✓ User Account - Vansh Tyagi");
    console.log("  ✓ Email: vt718147@gmail.com");
    console.log("  ✓ Email Verified: Yes");
    console.log("  ✓ Volunteer Status: Approved");
    console.log("\n🔑 User Info:");
    console.log(`  ID: ${user._id}`);
    console.log(`  City: Mumbai, Maharashtra`);
    console.log(`  Phone: +91-9876543210\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding profile:", error.message);
    console.error(error);
    process.exit(1);
  }
}

seedUserProfile();
