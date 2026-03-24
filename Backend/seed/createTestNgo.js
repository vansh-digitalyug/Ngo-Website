/**
 * Quick script to create a test NGO for surveys
 * Run: node seed/createTestNgo.js
 */

import "../config/loadEnv.js";
import connectDB from "../config/db.js";
import Ngo from "../models/ngo.model.js";

async function createTestNgo() {
  await connectDB();
  console.log("🔌 Connected to database\n");

  // Check if NGO already exists
  const exists = await Ngo.findOne({ ngoName: "Survey Test NGO" });
  if (exists) {
    console.log("✅ Test NGO already exists!");
    console.log(`NGO ID: ${exists._id}`);
    process.exit(0);
  }

  // Create test NGO
  const ngo = await Ngo.create({
    ngoName: "Survey Test NGO",
    description: "Test NGO for survey seeding",
    contactEmail: "survey@testngo.com",
    contactPhone: "9999999999",
    state: "Maharashtra",
    city: "Mumbai",
    area: "Test Area",
    address: "123 Test Street",
    zipCode: "400001",
    registrationNumber: "TEST123",
    adminId: null, // No admin for now
    status: "approved",
    isVerified: true,
    location: {
      type: "Point",
      coordinates: [72.8479, 19.0760] // Mumbai coordinates
    }
  });

  console.log("✅ Test NGO created successfully!");
  console.log(`\nNGO Details:`);
  console.log(`  Name: ${ngo.ngoName}`);
  console.log(`  ID: ${ngo._id}`);
  console.log(`  Status: ${ngo.status}`);
  console.log(`\n⏭️  Now run: node seed/surveySeed.js\n`);
  
  process.exit(0);
}

createTestNgo().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
