/**
 * Survey Seed — Fake Survey Data
 *
 * Creates realistic sample surveys using the first NGO found in the database.
 * Safe to re-run: skips surveys whose title already exists for that NGO.
 *
 * To run:
 *   node seed/surveySeed.js
 */

import "../config/loadEnv.js";
import connectDB from "../config/db.js";
import Survey from "../models/Survey.model.js";
import Ngo from "../models/ngo.model.js";

const SURVEYS = [
  // ─── 1. Health Camp Feedback ──────────────────────────────────────────────
  {
    title: "Free Health Camp — Community Feedback",
    description:
      "We recently organised a free health camp in your area. Please share your experience so we can improve our services for future camps.",
    targetAudience: "Residents who attended the health camp",
    status: "active",
    isPublic: true,
    startDate: new Date("2025-03-01"),
    endDate: new Date("2025-04-30"),
    questions: [
      {
        type: "rating",
        question: "How would you rate the overall quality of the health camp?",
        required: true,
      },
      {
        type: "yes_no",
        question: "Were you able to meet a doctor without long waiting?",
        required: true,
      },
      {
        type: "multiple_choice",
        question: "Which medical service did you use at the camp?",
        required: true,
        options: [
          "General health check-up",
          "Eye examination",
          "Dental check-up",
          "Blood test / lab work",
          "Medicine distribution",
          "Gynecology / Women's health",
        ],
      },
      {
        type: "yes_no",
        question: "Did you receive free medicines at the camp?",
        required: false,
      },
      {
        type: "scale",
        question: "On a scale of 1–10, how clean and hygienic was the camp location?",
        required: true,
        scaleMin: 1,
        scaleMax: 10,
      },
      {
        type: "yes_no",
        question: "Would you recommend this health camp to your family and friends?",
        required: true,
      },
      {
        type: "text",
        question: "What improvements would you suggest for the next health camp?",
        required: false,
      },
    ],
  },

  // ─── 2. Education & Children Survey ──────────────────────────────────────
  {
    title: "Children's Education Needs — Village Survey",
    description:
      "Help us understand the education situation in your village. Your answers will help us plan schools, coaching centres, and scholarship programs.",
    targetAudience: "Parents with children aged 5–18 years",
    status: "active",
    isPublic: true,
    startDate: new Date("2025-02-15"),
    endDate: new Date("2025-05-31"),
    questions: [
      {
        type: "multiple_choice",
        question: "How many school-going children are there in your household?",
        required: true,
        options: ["None", "1", "2", "3", "4 or more"],
      },
      {
        type: "yes_no",
        question: "Is there a government school within 2 km of your home?",
        required: true,
      },
      {
        type: "multiple_choice",
        question: "What is the biggest challenge your child faces in education?",
        required: true,
        options: [
          "No school nearby",
          "Cannot afford school fees",
          "No books / stationery",
          "Child has to work to support family",
          "School has poor teachers / quality",
          "No problem — child studies well",
        ],
      },
      {
        type: "yes_no",
        question: "Does your child have access to a smartphone or computer for studies?",
        required: false,
      },
      {
        type: "rating",
        question: "How would you rate the quality of teachers in your local school?",
        required: false,
      },
      {
        type: "yes_no",
        question: "Would you be interested in free coaching classes for your child?",
        required: true,
      },
      {
        type: "multiple_choice",
        question: "Which subject does your child need the most help with?",
        required: false,
        options: ["Mathematics", "English", "Science", "Hindi / Regional Language", "All subjects equally"],
      },
      {
        type: "text",
        question: "Any other concern or suggestion regarding education in your area?",
        required: false,
      },
    ],
  },

  // ─── 3. Women Empowerment Survey ─────────────────────────────────────────
  {
    title: "Women Empowerment & Self-Reliance Survey",
    description:
      "This survey helps us design skill training, livelihood programs, and support services specifically for women in our community.",
    targetAudience: "Women aged 18–55 years",
    status: "active",
    isPublic: true,
    startDate: new Date("2025-03-10"),
    endDate: new Date("2025-06-10"),
    questions: [
      {
        type: "multiple_choice",
        question: "What is your current employment status?",
        required: true,
        options: [
          "Homemaker (not employed)",
          "Self-employed / small business",
          "Daily wage worker",
          "Government job",
          "Private job",
          "Farmer / agricultural worker",
        ],
      },
      {
        type: "yes_no",
        question: "Are you interested in learning a new skill or vocational training?",
        required: true,
      },
      {
        type: "multiple_choice",
        question: "Which skill training would you be most interested in?",
        required: false,
        options: [
          "Tailoring & embroidery",
          "Computer / mobile skills",
          "Beauty & wellness",
          "Cooking / food processing",
          "Handicrafts & art",
          "Farming & horticulture",
        ],
      },
      {
        type: "yes_no",
        question: "Do you have a bank account in your own name?",
        required: true,
      },
      {
        type: "scale",
        question: "On a scale of 1–10, how safe do you feel in your community?",
        required: true,
        scaleMin: 1,
        scaleMax: 10,
      },
      {
        type: "yes_no",
        question: "Have you ever faced any kind of discrimination at work or in public?",
        required: false,
      },
      {
        type: "rating",
        question: "How would you rate the support available to women in your village?",
        required: false,
      },
      {
        type: "text",
        question: "What one change would make the biggest difference in your daily life?",
        required: false,
      },
    ],
  },

  // ─── 4. Clean Water & Sanitation Survey ──────────────────────────────────
  {
    title: "Water & Sanitation — Household Survey",
    description:
      "We are mapping water and sanitation access across villages. This information will be used to prioritise bore well installation, toilet construction, and clean water drives.",
    targetAudience: "All households in the village",
    status: "active",
    isPublic: true,
    startDate: new Date("2025-01-20"),
    endDate: new Date("2025-04-20"),
    questions: [
      {
        type: "multiple_choice",
        question: "What is your primary source of drinking water?",
        required: true,
        options: [
          "Government tap / pipeline",
          "Hand pump / bore well",
          "Open well",
          "River / pond / lake",
          "Water tanker",
          "Packaged / bottled water",
        ],
      },
      {
        type: "yes_no",
        question: "Is clean drinking water available throughout the year in your area?",
        required: true,
      },
      {
        type: "multiple_choice",
        question: "How far do you travel to fetch water if it is not available at home?",
        required: false,
        options: [
          "Water is available at home",
          "Less than 500 metres",
          "500 metres to 1 km",
          "1 km to 3 km",
          "More than 3 km",
        ],
      },
      {
        type: "yes_no",
        question: "Does your household have a proper toilet?",
        required: true,
      },
      {
        type: "yes_no",
        question: "Is there proper drainage / waste disposal system in your area?",
        required: true,
      },
      {
        type: "scale",
        question: "On a scale of 1–10, how would you rate water quality in your area?",
        required: true,
        scaleMin: 1,
        scaleMax: 10,
      },
      {
        type: "text",
        question: "Describe the biggest water or sanitation problem in your village.",
        required: false,
      },
    ],
  },

  // ─── 5. Elderly Care Survey ───────────────────────────────────────────────
  {
    title: "Elderly Care Needs Assessment",
    description:
      "We are planning a dedicated elderly care programme. Please help us understand the health, social, and daily care needs of senior citizens in your area.",
    targetAudience: "Senior citizens aged 60+ and their family members",
    status: "active",
    isPublic: true,
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-05-01"),
    questions: [
      {
        type: "multiple_choice",
        question: "What is the age of the senior citizen in your household?",
        required: true,
        options: ["60–65 years", "66–70 years", "71–80 years", "Above 80 years", "No senior citizen at home"],
      },
      {
        type: "yes_no",
        question: "Does the senior citizen in your home have any chronic illness?",
        required: true,
      },
      {
        type: "multiple_choice",
        question: "Which illness does the elderly person suffer from?",
        required: false,
        options: [
          "Diabetes",
          "Heart disease",
          "High blood pressure",
          "Arthritis / joint pain",
          "Kidney disease",
          "Eye / vision problems",
          "None",
        ],
      },
      {
        type: "yes_no",
        question: "Does the elderly person get a regular pension or financial support?",
        required: false,
      },
      {
        type: "rating",
        question: "How would you rate the availability of healthcare for elderly near your area?",
        required: true,
      },
      {
        type: "yes_no",
        question: "Is the senior citizen able to go out of the house independently?",
        required: false,
      },
      {
        type: "scale",
        question: "On a scale of 1–10, how lonely or isolated does the elderly person feel?",
        required: false,
        scaleMin: 1,
        scaleMax: 10,
      },
      {
        type: "text",
        question: "What kind of help or service would benefit elderly people most in your area?",
        required: false,
      },
    ],
  },

  // ─── 6. Environment & Cleanliness Survey ─────────────────────────────────
  {
    title: "Village Environment & Cleanliness Survey",
    description:
      "Help us understand the environmental health of your village — garbage, pollution, tree cover, and open burning are some of the issues we want to address.",
    targetAudience: "All residents",
    status: "active",
    isPublic: true,
    startDate: new Date("2025-03-05"),
    endDate: new Date("2025-06-05"),
    questions: [
      {
        type: "yes_no",
        question: "Is there a regular garbage collection service in your area?",
        required: true,
      },
      {
        type: "multiple_choice",
        question: "Where does most of the waste in your area end up?",
        required: true,
        options: [
          "Municipal garbage collection",
          "Burnt openly",
          "Dumped in fields or empty plots",
          "Thrown in rivers / water bodies",
          "Composted / recycled at home",
        ],
      },
      {
        type: "yes_no",
        question: "Have you noticed open burning of garbage or crop stubble near your area?",
        required: false,
      },
      {
        type: "scale",
        question: "On a scale of 1–10, how clean is your village / neighbourhood?",
        required: true,
        scaleMin: 1,
        scaleMax: 10,
      },
      {
        type: "yes_no",
        question: "Are there enough trees and green spaces in your area?",
        required: false,
      },
      {
        type: "rating",
        question: "How would you rate the overall environmental cleanliness of your locality?",
        required: true,
      },
      {
        type: "yes_no",
        question: "Would you volunteer for a cleanliness / tree plantation drive in your village?",
        required: true,
      },
      {
        type: "text",
        question: "What is the biggest environmental problem in your area? Please describe.",
        required: false,
      },
    ],
  },

  // ─── 7. NGO Service Satisfaction Survey ──────────────────────────────────
  {
    title: "Our Services — Your Satisfaction Survey",
    description:
      "We want to know how well our NGO is serving you. Your honest feedback helps us improve and serve the community better.",
    targetAudience: "Anyone who has used our services",
    status: "active",
    isPublic: true,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    questions: [
      {
        type: "multiple_choice",
        question: "Which of our services have you used?",
        required: true,
        options: [
          "Health camp / medical aid",
          "Food / meal distribution",
          "Education / scholarship support",
          "Skill training / employment",
          "Emergency relief",
          "Women empowerment programme",
          "None — first time visiting",
        ],
      },
      {
        type: "rating",
        question: "Overall, how satisfied are you with our services?",
        required: true,
      },
      {
        type: "yes_no",
        question: "Did our staff treat you with respect and dignity?",
        required: true,
      },
      {
        type: "yes_no",
        question: "Was the process to access our services easy and straightforward?",
        required: true,
      },
      {
        type: "scale",
        question: "On a scale of 1–10, how likely are you to recommend us to others?",
        required: true,
        scaleMin: 1,
        scaleMax: 10,
      },
      {
        type: "multiple_choice",
        question: "How did you hear about our organisation?",
        required: false,
        options: [
          "Word of mouth / neighbour",
          "Village leader / sarpanch",
          "Social media",
          "Government office",
          "Newspaper / pamphlet",
          "This website",
        ],
      },
      {
        type: "text",
        question: "What one thing should we improve to serve the community better?",
        required: false,
      },
    ],
  },
];

// ─── Runner ───────────────────────────────────────────────────────────────────
async function seed() {
  await connectDB();
  console.log("✅  Connected to database\n");

  // Find the first available NGO
  const ngo = await Ngo.findOne().lean();
  if (!ngo) {
    console.error("❌  No NGO found in database. Please add an NGO first, then run this seed.");
    process.exit(1);
  }

  console.log(`🏢  Using NGO: "${ngo.ngoName}" (${ngo._id})\n`);

  let created = 0;
  let skipped = 0;

  for (const data of SURVEYS) {
    const exists = await Survey.findOne({ ngoId: ngo._id, title: data.title });
    if (exists) {
      console.log(`⏭   Skipped (already exists): "${data.title}"`);
      skipped++;
      continue;
    }

    const survey = await Survey.create({ ...data, ngoId: ngo._id });
    console.log(`✅  Created: "${survey.title}"  →  token: ${survey.shareToken}`);
    created++;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊  Done! Created: ${created}  |  Skipped: ${skipped}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  process.exit(0);
}

seed().catch(err => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
