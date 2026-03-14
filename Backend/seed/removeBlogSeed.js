import "../config/loadEnv.js";
import connectDB from "../config/db.js";
import Blog from "../models/blog.model.js";

const SEED_TITLES = [
  "How One Community Kitchen Served 12,000 Meals in 90 Days",
  "Five Practical Ways to Verify an NGO Before Donating",
  "From Software Engineer to Full-Time Volunteer: Rohan's Story",
  "Why Mid-Day Meal Quality Matters More Than Quantity",
  "Mobile Health Camps: Reaching the Last Mile in Chhattisgarh",
  "What Transparent Fund Reporting Does to Donor Retention",
];

async function remove() {
  await connectDB();
  const result = await Blog.deleteMany({ title: { $in: SEED_TITLES } });
  console.log(`Deleted ${result.deletedCount} seeded blog post(s).`);
  process.exit(0);
}

remove().catch((err) => {
  console.error(err);
  process.exit(1);
});
