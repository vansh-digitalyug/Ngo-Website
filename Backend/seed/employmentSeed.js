/**
 * Seed 5 Employment / Rojgar Yojana records
 * Run: node seed/employmentSeed.js
 */

import "../config/loadEnv.js";
import connectDB from "../config/db.js";
import Ngo from "../models/ngo.model.js";
import Employment from "../models/Employment.model.js";

const records = [
  {
    title: "Tailoring & Garment Making Training",
    category: "skill_training",
    description:
      "A 45-day residential training programme teaching women basic to advanced tailoring, including cutting, stitching, and garment finishing. Trainees receive a starter kit on completion.",
    skills: ["Tailoring", "Cutting & Stitching", "Garment Finishing", "Embroidery"],
    location: "Barmer, Rajasthan",
    openings: 30,
    filled: 28,
    status: "completed",
    startDate: new Date("2024-01-10"),
    endDate: new Date("2024-02-24"),
    stipend: 1500,
    isPublic: true,
  },
  {
    title: "Mobile Phone Repair Apprenticeship",
    category: "apprenticeship",
    description:
      "3-month hands-on apprenticeship with certified repair shops in Jaipur. Participants learn hardware diagnostics, screen replacement, and software flashing. Certificate issued by partnered shop.",
    skills: ["Hardware Repair", "Software Flashing", "Customer Service", "Inventory Management"],
    location: "Jaipur, Rajasthan",
    openings: 15,
    filled: 15,
    status: "closed",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-05-31"),
    stipend: 3000,
    isPublic: true,
  },
  {
    title: "Organic Farming & Self-Help Group Setup",
    category: "self_employment",
    description:
      "Empower rural women to form SHGs and begin organic farming collectives. Covers soil preparation, crop selection, micro-financing, and market linkage to local mandis.",
    skills: ["Organic Farming", "SHG Formation", "Microfinance Basics", "Market Linkage"],
    location: "Tonk, Rajasthan",
    openings: 50,
    filled: 42,
    status: "open",
    startDate: new Date("2024-06-15"),
    endDate: new Date("2024-12-15"),
    stipend: 0,
    isPublic: true,
  },
  {
    title: "Rural BPO Job Placement Drive",
    category: "job_placement",
    description:
      "Partnership with two Jaipur-based BPO firms to place 10th-pass rural youth in inbound customer support roles. NGO facilitates transport allowance for the first 3 months.",
    skills: ["Communication Skills", "Basic English", "Data Entry", "Phone Handling"],
    location: "Jaipur, Rajasthan",
    openings: 20,
    filled: 17,
    status: "open",
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-06-30"),
    stipend: 9500,
    isPublic: true,
  },
  {
    title: "Solar Panel Installation Technician Training",
    category: "apprenticeship",
    description:
      "Collaboration with a state DISCOM to train youth as solar technicians. Covers panel installation, wiring, maintenance, and troubleshooting for off-grid and rooftop systems.",
    skills: ["Solar Wiring", "Panel Installation", "Electrical Safety", "Maintenance & Troubleshooting"],
    location: "Jodhpur, Rajasthan",
    openings: 12,
    filled: 10,
    status: "open",
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-04-30"),
    stipend: 4000,
    isPublic: true,
  },
];

async function seed() {
  await connectDB();
  console.log("Connected to database\n");

  const ngo = await Ngo.findOne();
  if (!ngo) {
    console.error("No NGO found in the database. Please create one first.");
    process.exit(1);
  }
  console.log(`Using NGO: ${ngo.ngoName} (${ngo._id})\n`);

  let created = 0;
  for (const rec of records) {
    await Employment.create({ ...rec, ngoId: ngo._id });
    console.log(`  Seeded: ${rec.title}`);
    created++;
  }

  console.log(`\nDone — ${created} employment records seeded.`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
