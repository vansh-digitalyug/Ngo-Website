/**
 * Blog Seed — Dummy Blog Posts
 *
 * Inserts sample blog posts into the database.
 * Safe to re-run: skips posts whose title already exists.
 *
 * To run:
 *   node seed/blogSeed.js
 */

import "../config/loadEnv.js";
import connectDB from "../config/db.js";
import Blog from "../models/blog.model.js";

const SEED_BLOGS = [
  {
    title: "How One Community Kitchen Served 12,000 Meals in 90 Days",
    excerpt:
      "A volunteer-led kitchen in Jaipur scaled quickly with local donations and transparent reporting — here's how they did it.",
    content: `When food insecurity rose sharply last winter, a local network of volunteers and NGOs launched a neighborhood kitchen model. The initiative focused on daily meal kits for elderly citizens, single mothers, and migrant workers.

Within three months, the team served over 12,000 meals by pairing micro-donations with local vendor partnerships. Real-time updates and public expense sheets helped maintain donor trust throughout the campaign.

Key lessons from the operations team:
- Hyperlocal sourcing reduced food costs by 38%
- WhatsApp-based volunteer coordination cut admin overhead by half
- Daily social media updates drove a 4x increase in repeat donors

The model is now being replicated in five nearby districts with stronger last-mile logistics and a structured volunteer onboarding program. Any NGO looking to start a community kitchen can request their operations playbook for free on their website.`,
    S3Imagekey:
      "https://images.unsplash.com/photo-1593113598332-cd59a93a9fe6?q=80&w=1400&auto=format&fit=crop",
    author: "SevaIndia Editorial",
    category: "Community Impact",
    createdAt: new Date("2026-02-10T10:00:00.000Z"),
  },
  {
    title: "Five Practical Ways to Verify an NGO Before Donating",
    excerpt:
      "A checklist for checking credibility, fund-usage transparency, and reporting discipline before you give.",
    content: `Trust-based giving should still be evidence-based. Before you donate to any NGO, here are five checks you should run:

1. Confirm legal registration
   Look for the registration number under the Societies Registration Act, Section 8 Companies Act, or equivalent. Cross-check on the MCA portal or state registrar database.

2. Review annual filings and audited accounts
   FCRA-registered NGOs must file FC-4 returns annually. Organizations on the Darpan portal display their utilization certificates publicly.

3. Check board transparency
   A healthy governance structure names board members, their qualifications, and meeting frequency. Anonymous boards are a red flag.

4. Look for project-level impact reporting
   High-quality organizations track outcomes — number of students who passed exams, women who gained employment, patients treated — not just activity counts.

5. Test communication responsiveness
   Donate a small amount and observe how quickly they acknowledge it, issue a receipt, and follow up. Predictable communication is often a strong indicator of governance quality.

Remember: a well-designed website is not proof of credibility. Use these checks every time.`,
    S3Imagekey:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1400&auto=format&fit=crop",
    author: "SevaIndia Research Desk",
    category: "Donor Guide",
    createdAt: new Date("2026-01-28T09:20:00.000Z"),
  },
  {
    title: "From Software Engineer to Full-Time Volunteer: Rohan's Story",
    excerpt:
      "After 8 years in tech, Rohan Mehra quit his job to run rural digital-literacy camps. This is what he learned.",
    content: `Rohan Mehra spent eight years building fintech products in Bengaluru. In 2024, he took a three-month sabbatical to volunteer at a rural school in Rajasthan — and never went back to his desk job.

"I thought I'd miss the salary in two weeks," he says, laughing. "It's been eighteen months."

Rohan now runs week-long digital-literacy camps across 22 villages in the Barmer and Jaisalmer districts, training students aged 10–16 on basic computer use, internet safety, and government e-services portals like DigiLocker and Umang.

What surprised him most:
- Children grasp touchscreen interfaces faster than adults in every single batch
- The biggest barrier isn't devices — it's Gujarati-language content; most educational software defaults to Hindi or English
- Parent engagement doubles when workshops are held on Sundays

Rohan funds his work through crowdfunding and corporate CSR partnerships. Organizations looking to replicate the model in other states can reach out via the SevaIndia volunteer network.`,
    S3Imagekey:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop",
    author: "Priya Nair, Volunteer Correspondent",
    category: "Volunteer Stories",
    createdAt: new Date("2026-01-15T08:00:00.000Z"),
  },
  {
    title: "Why Mid-Day Meal Quality Matters More Than Quantity",
    excerpt:
      "A new field study across 200 government schools found that nutrition content — not calories — predicts student attendance rates.",
    content: `A three-month observational study conducted across 200 government schools in four states found a surprising result: schools that served nutritionally balanced mid-day meals — even in smaller portions — had 22% higher afternoon attendance than those serving calorie-dense but nutritionally poor meals.

The study, conducted by a consortium of NGOs including the SevaIndia Education Network, tracked:
- Meal composition (protein, iron, vitamin A content)
- Student attendance pre- and post-meal
- Teacher-reported afternoon alertness scores
- Dropout rates over a 6-month window

Key findings:
- Adding eggs or pulses three times per week correlated with a 14-point drop in afternoon absenteeism
- Iron-deficient meals were linked to measurably higher dropout rates in girls aged 10–13
- The cost difference between a nutritionally poor and nutritionally adequate meal was just ₹2.80 per child per day

The report recommends that state governments prioritize nutritional quality monitoring — not just caloric targets — in their mid-day meal audits. Full data is available for download on the SevaIndia website.`,
    S3Imagekey:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1400&auto=format&fit=crop",
    author: "Dr. Anjali Sharma, Education Team",
    category: "Education",
    createdAt: new Date("2026-01-05T07:30:00.000Z"),
  },
  {
    title: "Mobile Health Camps: Reaching the Last Mile in Chhattisgarh",
    excerpt:
      "Our mobile medical units completed 3,400 consultations in the tribal belt last quarter. Here's what the data reveals.",
    content: `Last quarter, two mobile health units operated by the SevaIndia Health Network completed 3,412 consultations across 47 villages in the tribal belt of Chhattisgarh. The camps covered primary care, maternal health checks, TB screening, and vision testing for children.

What the numbers showed:
- 68% of patients had never visited a primary health centre before
- Undiagnosed hypertension was detected in 1 in 4 adults screened
- 34 children were identified with treatable vision deficiencies and referred for free corrective glasses
- 12 cases of suspected TB were detected and referred for government DOTS treatment

The units operate on a rotating schedule, returning to each village every 45 days. Between visits, trained community health workers (ASHAs and Anganwadi workers) are equipped with telemedicine access to consult SevaIndia doctors remotely.

Challenges remain:
- Road access during monsoon cuts coverage by 30%
- Cold-chain limitations restrict availability of certain vaccines in remote camps
- Female patients consistently underreport symptoms due to hesitancy around male doctors

We are actively recruiting female doctors and nurses to join the mobile unit roster. If you are a healthcare professional interested in contributing time, please reach out through the volunteer portal.`,
    S3Imagekey:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=1400&auto=format&fit=crop",
    author: "Dr. Saurabh Tiwari, Health Programs Lead",
    category: "Health",
    createdAt: new Date("2025-12-20T06:00:00.000Z"),
  },
  {
    title: "What Transparent Fund Reporting Does to Donor Retention",
    excerpt:
      "NGOs that publish monthly expense breakdowns retain donors at 3x the rate of those that don't. The data is striking.",
    content: `Across a sample of 80 NGOs tracked by the SevaIndia Donor Intelligence team over 24 months, one variable predicted donor retention more reliably than campaign frequency, social media presence, or impact metrics: transparent fund reporting.

Organizations that published monthly expense breakdowns retained 71% of one-time donors as repeat donors. Organizations that published only annual reports retained 24%. Those that published nothing retained 9%.

Why does this work?

Psychologically, donors respond to real-time evidence of impact. A photo of the school being built this month is more compelling than an annual report saying "we built 12 schools." A ₹500 donation that gets acknowledged with a breakdown — "your gift funded 7 meals today" — creates a concrete emotional connection.

Practically, transparent reporting also:
- Reduces donor churn during organizational setbacks
- Attracts higher-value institutional donors who require audit trails
- Builds a community of advocates who share reports organically

The barrier to implementation is lower than most organizations assume. A monthly report template, a consistent upload schedule, and a WhatsApp broadcast list are enough to start. SevaIndia offers a free fund-reporting toolkit to any registered NGO on our platform.`,
    S3Imagekey:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop",
    author: "SevaIndia Research Desk",
    category: "Donor Guide",
    createdAt: new Date("2025-12-10T09:00:00.000Z"),
  },
];

async function seed() {
  await connectDB();
  console.log("Connected to database.");

  let inserted = 0;
  let skipped = 0;

  for (const blog of SEED_BLOGS) {
    const exists = await Blog.findOne({ title: blog.title }).lean();
    if (exists) {
      console.log(`  ↷ Skipped (already exists): "${blog.title}"`);
      skipped++;
    } else {
      await Blog.create(blog);
      console.log(`  ✓ Inserted: "${blog.title}"`);
      inserted++;
    }
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
