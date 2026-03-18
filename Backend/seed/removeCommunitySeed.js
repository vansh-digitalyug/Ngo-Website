/**
 * Remove Community Seed Data
 *
 * Safely removes all seeded communities, activities, and responsibilities.
 * Only removes records that match the seed data pattern.
 *
 * To run:
 *   node seed/removeCommunitySeed.js
 */

import "../config/loadEnv.js";
import connectDB from "../config/db.js";
import Community from "../models/community.model.js";
import CommunityActivity from "../models/communityActivity.model.js";
import CommunityResponsibility from "../models/communityResponsibility.model.js";

const SEED_COMMUNITY_NAMES = [
  "Walled City Community Initiative",
  "Green Valley Village Development",
  "Cyber Colony Education Hub",
  "Riverside Cleanup & Conservation",
  "Gao Seva Sustainable Livelihoods",
];

const main = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to database");

    // Find all seeded communities
    const communities = await Community.find({
      name: { $in: SEED_COMMUNITY_NAMES }
    });

    console.log(`\n🗑️  Found ${communities.length} seeded communities`);

    if (communities.length === 0) {
      console.log("No seeded data found.");
      process.exit(0);
    }

    const communityIds = communities.map(c => c._id);

    // Delete activities
    const activitiesDeleted = await CommunityActivity.deleteMany({
      communityId: { $in: communityIds }
    });
    console.log(`  ✅ Deleted ${activitiesDeleted.deletedCount} activities`);

    // Delete responsibilities
    const responsibilitiesDeleted = await CommunityResponsibility.deleteMany({
      communityId: { $in: communityIds }
    });
    console.log(`  ✅ Deleted ${responsibilitiesDeleted.deletedCount} responsibilities`);

    // Delete communities
    const communitiesDeleted = await Community.deleteMany({
      _id: { $in: communityIds }
    });
    console.log(`  ✅ Deleted ${communitiesDeleted.deletedCount} communities`);

    console.log("\n✨ Cleanup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
};

main();
