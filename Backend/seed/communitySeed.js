/**
 * Community Seed — Dummy Communities, Activities, and Responsibilities
 *
 * Inserts sample data for Community, CommunityActivity, and CommunityResponsibility.
 * Safe to re-run: skips records that already exist.
 *
 * Requirements:
 * - Ensure at least one user exists in the database (for createdBy, conductedBy, takenBy)
 * - Or create test users first
 *
 * To run:
 *   node seed/communitySeed.js
 */

import "../config/loadEnv.js";
import connectDB from "../config/db.js";
import Community from "../models/community.model.js";
import CommunityActivity from "../models/communityActivity.model.js";
import CommunityResponsibility from "../models/communityResponsibility.model.js";
import User from "../models/user.model.js";

const COMMUNITIES = [
  {
    name: "Walled City Community Initiative",
    areaType: "mohalla",
    description: "A grassroots initiative to improve living standards, sanitation, and education in the historic walled city. Focus on women and youth empowerment.",
    address: "Jauhari Bazaar, Walled City",
    pincode: "302002",
    city: "Jaipur",
    district: "Jaipur",
    state: "Rajasthan",
    location: {
      type: "Point",
      coordinates: [75.8245, 26.9124], // [longitude, latitude]
    },
    population: 15000,
    tags: ["sanitation", "education", "women-empowerment", "urban"],
    status: "active",
    verificationStatus: "verified",
    createdByNgoId: null,
  },
  {
    name: "Green Valley Village Development",
    areaType: "village",
    description: "Rural community focused on sustainable agriculture, water conservation, and skill development. Working with farmers on crop diversification.",
    address: "Village Council, Main Road",
    pincode: "303313",
    city: "Alwar",
    district: "Alwar",
    state: "Rajasthan",
    location: {
      type: "Point",
      coordinates: [75.7245, 27.5724],
    },
    population: 8500,
    tags: ["agriculture", "sustainability", "water-conservation", "skill-development"],
    status: "active",
    verificationStatus: "verified",
    createdByNgoId: null,
  },
  {
    name: "Cyber Colony Education Hub",
    areaType: "colony",
    description: "Residential colony with focus on digital literacy, vocational training, and community health awareness. Serves middle-class families transitioning to digital economy.",
    address: "Cyberpark Road, IT Zone",
    pincode: "302020",
    city: "Jaipur",
    district: "Jaipur",
    state: "Rajasthan",
    location: {
      type: "Point",
      coordinates: [75.8567, 26.8923],
    },
    population: 12000,
    tags: ["digital-literacy", "education", "health-awareness", "tech"],
    status: "active",
    verificationStatus: "verified",
    createdByNgoId: null,
  },
  {
    name: "Riverside Cleanup & Conservation",
    areaType: "ward",
    description: "Community ward along the river basin working on pollution control, waste management, and ecosystem restoration. Monthly cleanup drives and tree planting.",
    address: "Ward 42, Aravalli Road",
    pincode: "303308",
    city: "Jaipur",
    district: "Jaipur",
    state: "Rajasthan",
    location: {
      type: "Point",
      coordinates: [75.7845, 26.9045],
    },
    population: 5500,
    tags: ["environment", "cleanup", "conservation", "pollution-control"],
    status: "active",
    verificationStatus: "verified",
    createdByNgoId: null,
  },
  {
    name: "Gao Seva Sustainable Livelihoods",
    areaType: "gao",
    description: "Agricultural cooperative focused on animal husbandry, dairy farming, and organic produce. Empowering marginal farmers with market linkages.",
    address: "Cooperative Society Building",
    pincode: "302031",
    city: "Jaipur",
    district: "Jaipur",
    state: "Rajasthan",
    location: {
      type: "Point",
      coordinates: [75.9045, 26.8567],
    },
    population: 6800,
    tags: ["livelihood", "agriculture", "dairy", "organic-farming"],
    status: "active",
    verificationStatus: "verified",
    createdByNgoId: null,
  },
];

const seedCommunities = async (testUser) => {
  console.log("\n📍 Seeding Communities...");
  const createdCommunities = [];
  
  for (const comm of COMMUNITIES) {
    // Add the required createdBy field
    comm.createdBy = testUser._id;
    const exists = await Community.findOne({ 
      name: comm.name,
      city: comm.city 
    });
    
    if (exists) {
      console.log(`  ⏭️  Skipping: "${comm.name}" (already exists)`);
      createdCommunities.push(exists);
    } else {
      const created = await Community.create(comm);
      console.log(`  ✅ Created: "${created.name}" (${created._id})`);
      createdCommunities.push(created);
    }
  }
  
  return createdCommunities;
};

const seedActivities = async (communities, testUser) => {
  console.log("\n🎯 Seeding Community Activities...");
  const ACTIVITIES = [];
  
  const activityTypes = [
    { type: "cleanup", title: "Community Cleanup Drive", desc: "Organized neighborhood cleanliness day" },
    { type: "education", title: "Digital Literacy Workshop", desc: "Training session on using smartphones and internet safely" },
    { type: "food_distribution", title: "Free Food Distribution", desc: "Weekly food and ration distribution to marginalized families" },
    { type: "medical_camp", title: "Free Health Checkup Camp", desc: "Free health screening and basic medicine distribution" },
    { type: "tree_plantation", title: "Tree Plantation Drive", desc: "Planting 500 saplings for environmental restoration" },
  ];

  // Create 4-5 activities per community
  for (const community of communities) {
    for (let i = 0; i < 4; i++) {
      const activityType = activityTypes[i % activityTypes.length];
      const activity = {
        communityId: community._id,
        title: `${activityType.title} - ${community.name}`,
        description: activityType.desc,
        activityType: activityType.type,
        status: ["completed", "ongoing", "planned"][Math.floor(Math.random() * 3)],
        plannedDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        completedDate: null,
        specificLocation: community.address,
        mediaKeys: [],
        mediaThumbnailKey: null,
        conductedBy: testUser._id,
        conductedByName: testUser.name,
        conductedByNgoId: null,
        beneficiariesCount: Math.floor(Math.random() * 500) + 50,
        volunteersCount: Math.floor(Math.random() * 50) + 5,
        adminVerified: true,
        adminNote: "Activity verified and documented",
        verifiedBy: testUser._id,
        verifiedAt: new Date(),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      };

      // 60% completed
      if (Math.random() < 0.6) {
        activity.status = "completed";
        activity.completedDate = new Date(activity.plannedDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
      }

      const exists = await CommunityActivity.findOne({
        communityId: community._id,
        title: activity.title,
      });

      if (exists) {
        console.log(`  ⏭️  Skipping: "${activity.title}" (already exists)`);
      } else {
        await CommunityActivity.create(activity);
        console.log(`  ✅ Created: "${activity.title}"`);
        ACTIVITIES.push(activity);
      }
    }
  }

  return ACTIVITIES;
};

const seedResponsibilities = async (communities, testUser) => {
  console.log("\n👥 Seeding Community Responsibilities...");
  
  const roles = ["volunteer", "coordinator", "co-leader", "leader"];
  const responsibilityItems = [
    "Organize weekly community meetings",
    "Document community activities",
    "Manage volunteer coordination",
    "Handle community fund management",
    "Conduct awareness sessions",
    "Monitor community health initiatives",
    "Coordinate with local administration",
    "Maintain community records",
  ];

  let totalCreated = 0;

  for (const community of communities) {
    // Create 4-5 responsibilities per community
    for (let i = 0; i < 5; i++) {
      const role = roles[i % roles.length];
      const selectedResponsibilities = responsibilityItems.slice(0, 2 + Math.floor(Math.random() * 3));
      
      const responsibility = {
        communityId: community._id,
        takenBy: testUser._id,
        takenByNgoId: null,
        takenByType: "user",
        takenByName: testUser.name,
        takenByEmail: testUser.email,
        takenByPhone: testUser.phone || null,
        role: role,
        responsibilities: selectedResponsibilities,
        motivation: `I want to contribute to ${community.name} and help improve the community. I have experience in ${role} roles and am committed to making a positive impact.`,
        status: ["pending", "active", "completed"][Math.floor(Math.random() * 3)],
        startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        endDate: null,
        adminNote: "Application reviewed and approved",
        approvedBy: testUser._id,
        approvedAt: new Date(),
        revokedBy: null,
        revokedAt: null,
        revokeReason: null,
        completionReport: null,
        completedAt: null,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      };

      // 40% completed
      if (Math.random() < 0.4) {
        responsibility.status = "completed";
        responsibility.completionReport = `Successfully completed ${selectedResponsibilities.length} key responsibilities. The community benefited greatly from this initiative.`;
        responsibility.completedAt = new Date(responsibility.startDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000);
      }

      const exists = await CommunityResponsibility.findOne({
        communityId: community._id,
        takenBy: testUser._id,
        role: role,
      });

      if (exists) {
        console.log(`  ⏭️  Skipping: ${testUser.name} as ${role} in ${community.name} (already exists)`);
      } else {
        await CommunityResponsibility.create(responsibility);
        console.log(`  ✅ Created: ${testUser.name} as ${role} in ${community.name}`);
        totalCreated++;
      }
    }
  }

  console.log(`  📊 Total responsibilities created: ${totalCreated}`);
};

const main = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to database");

    // Get or create a test user
    let testUser = await User.findOne({ email: "volunteer@test.com" });
    
    if (!testUser) {
      console.log("\n👤 Creating test user for seeding...");
      testUser = await User.create({
        name: "Rajesh Kumar",
        email: "volunteer@test.com",
        phone: "9876543210",
        password: "TestPassword123!", // Note: In production, use proper password hashing
        role: "user",
        isVerified: true,
      });
      console.log(`  ✅ Created test user: ${testUser.name}`);
    } else {
      console.log(`\n✅ Using existing test user: ${testUser.name}`);
    }

    // Seed communities
    const communities = await seedCommunities(testUser);

    // Seed activities
    await seedActivities(communities, testUser);

    // Seed responsibilities
    await seedResponsibilities(communities, testUser);

    console.log("\n✨ Seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`  • Communities: ${communities.length}`);
    console.log(`  • Activities: ${communities.length * 4} (4 per community)`);
    console.log(`  • Responsibilities: ${communities.length * 5} (5 per community)`);
    console.log(`\n💡 Test Data Ready! You can now:`);
    console.log(`  1. Visit /community to see the communities`);
    console.log(`  2. Click on a community to view activities and responsibilities`);
    console.log(`  3. Test the "Take Responsibility" feature`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

main();
