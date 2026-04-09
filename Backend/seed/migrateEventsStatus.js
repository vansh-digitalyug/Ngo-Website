// Migration script to update old "completed" events to "past" status and publish them
import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/event.model.js";

dotenv.config();

async function migrateEventsStatus() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✓ Connected to MongoDB");

    // Step 1: Find all events with status "completed"
    const completedCount = await Event.countDocuments({ status: "completed" });
    console.log(`Found ${completedCount} events with status "completed"`);

    if (completedCount > 0) {
      const result1 = await Event.updateMany(
        { status: "completed" },
        { status: "past" }
      );
      console.log(`✓ Updated ${result1.modifiedCount} events: "completed" → "past"`);
    }

    // Step 2: Find all unpublished past/completed events and publish them
    const unpublishedCount = await Event.countDocuments({
      status: { $in: ["past", "completed"] },
      isPublished: false,
    });
    console.log(`Found ${unpublishedCount} unpublished past events`);

    if (unpublishedCount > 0) {
      const result2 = await Event.updateMany(
        { status: { $in: ["past", "completed"] }, isPublished: false },
        { isPublished: true }
      );
      console.log(`✓ Published ${result2.modifiedCount} past events`);
    }

    // Step 3: Show statistics
    const allPastEvents = await Event.countDocuments({
      status: "past",
      isPublished: true,
    });
    console.log(`\n✓ Total published past events now: ${allPastEvents}`);

    // Show sample events
    if (allPastEvents > 0) {
      const samples = await Event.find({
        status: "past",
        isPublished: true,
      })
        .limit(3)
        .select("title date status isPublished");
      console.log("\nSample past events:");
      samples.forEach((e, i) => {
        console.log(`  ${i + 1}. ${e.title} (${e.date.toISOString().split("T")[0]})`);
      });
    }

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  }
}

// Run the migration
migrateEventsStatus();
