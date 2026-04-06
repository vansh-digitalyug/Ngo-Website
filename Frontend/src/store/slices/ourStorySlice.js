import { createSlice } from "@reduxjs/toolkit";

/**
 * All static content for the OurStory page lives here.
 * Images cannot be stored in Redux directly (they are ES-module objects),
 * so every item that needs an image uses an `imgKey` string.
 * OurStory.jsx maintains a local `imageMap` that resolves keys → imports.
 */
const initialState = {
  // ── Impact stats ──────────────────────────────────────────────────────────
  stats: [
    { value: 8,  suffix: "+", label: "Partner NGOs",  delay: 0    },
    { value: 84000, suffix: "+", label: "Beneficiaries", delay: 0.12 },
    { value: 12,  suffix: "+", label: "Volunteers",    delay: 0.24 },
    { value: 25,    suffix: "",  label: "States",        delay: 0.36 },
  ],

  // ── Core values ───────────────────────────────────────────────────────────
  values: [
    {
      emoji: "🔍", title: "Radical Transparency",
      body: "Every rupee tracked. Every programme audited. We publish quarterly impact reports — warts and all — because the people we serve and the donors who fund us deserve the truth.",
      color: "from-blue-50 to-blue-100", borderColor: "border-blue-200", textColor: "text-blue-700", delay: 0,
    },
    {
      emoji: "🌱", title: "Grassroots First",
      body: "We don't parachute solutions into communities. We listen, learn, and build alongside the people we serve. Local knowledge is always the most important knowledge.",
      color: "from-green-50 to-green-100", borderColor: "border-green-200", textColor: "text-green-700", delay: 0.1,
    },
    {
      emoji: "⚡", title: "Technology as a Tool",
      body: "Tech should amplify human compassion, not replace it. Every feature we build must make it easier to give, to volunteer, or to get help — never harder.",
      color: "from-yellow-50 to-yellow-100", borderColor: "border-yellow-200", textColor: "text-yellow-700", delay: 0.2,
    },
    {
      emoji: "🔁", title: "Long-Term Commitment",
      body: "We don't show up for photo-ops. Our village partners have had the same field officer for years. Continuity builds trust, and trust is what makes real change possible.",
      color: "from-red-50 to-red-100", borderColor: "border-red-200", textColor: "text-red-700", delay: 0,
    },
    {
      emoji: "🧭", title: "Dignity Above All",
      body: "Aid that humiliates is no aid at all. Every programme is designed to preserve and strengthen the dignity and agency of the people we work with.",
      color: "from-purple-50 to-purple-100", borderColor: "border-purple-200", textColor: "text-purple-700", delay: 0.1,
    },
    {
      emoji: "📢", title: "Amplifying Voices",
      body: "The communities we serve know what they need. Our job is to give them the platform, the resources, and the tools — then step back and let them lead.",
      color: "from-indigo-50 to-indigo-100", borderColor: "border-indigo-200", textColor: "text-indigo-700", delay: 0.2,
    },
  ],

  // ── Timeline milestones (used by the tree timeline section) ───────────────
  milestones: [
    {
      year: "2016 — The Beginning", reverse: false, imgKey: "edu2Img",
      title: "12 NGOs. One spreadsheet.",
      body: "Arjun's spreadsheet goes online. Twelve NGOs from Uttar Pradesh join. The first coordination — ₹5,000 worth of stationery for a school in Barabanki — takes three days and three phone calls, but it works. Every child in that classroom got a notebook and a pencil. The platform was born.",
    },
    {
      year: "2018 — Expanding the mission", reverse: true, imgKey: "empowerImg1",
      title: "When giving goes beyond money",
      body: "We launch volunteer matching — connecting skilled professionals (doctors, lawyers, teachers, engineers) with NGOs that need their expertise on weekends. Over 800 professionals sign up in the first two months. Women's empowerment groups across UP and Bihar are among the first beneficiaries.",
    },
    {
      year: "2020 — The COVID response", reverse: false, imgKey: "campImg",
      title: "₹2.4 Cr in 90 days",
      body: "When the pandemic hit, SevaIndia became the nerve centre for rural relief. We onboarded 340 new NGOs in 30 days, coordinated 1,200 volunteer deployments, set up mobile medical camps in 6 states, and facilitated ₹2.4 crore in emergency relief — food, medicine, and protective gear for the most vulnerable.",
    },
    {
      year: "2022 — Kanyadan Yojana", reverse: true, imgKey: "kanayadanHero",
      title: "Celebrating 4,000 families",
      body: "We partner with state governments to roll out our flagship welfare programme — subsidising weddings for economically marginalised families and ensuring every bride has the dignity her day deserves. In year one, 1,400 families benefit. By 2024, the number crosses 4,000 across 9 states.",
    },
    {
      year: "2023 — Elder care & animal welfare", reverse: false, imgKey: "elderFoodImg",
      title: "No one left behind",
      body: "We launch dedicated elder care programmes — nutrition support, emotional companionship, and medical access for India's forgotten elderly population. Simultaneously, our Gau Seva programme extends our reach to animal welfare, because compassion has no boundaries.",
    },
    {
      year: "2024 — Rojgar Yojana & village tech", reverse: true, imgKey: "roadImg",
      title: "Building rural livelihoods",
      body: "We launch our employment platform connecting rural youth to skill training, apprenticeships, and job placements — giving young people a path forward. Our village portal gives every partner village a digital home: health data, problem reports, event calendars, and real-time impact tracking.",
    },
  ],

  // ── Testimonials ──────────────────────────────────────────────────────────
  testimonials: [
    {
      quote: "Before SevaIndia, I spent 40% of my time fundraising. Now I spend 90% doing actual work. The platform genuinely changed how we operate as an NGO.",
      name: "Priya Sharma", role: "Director, Asha Kiran NGO — Patna",
      imgKey: "empowerImg2", icon: "🎯", delay: 0,
    },
    {
      quote: "My daughter's wedding happened with full dignity because of the Kanyadan Yojana. I cannot put into words what that meant for our family.",
      name: "Ramesh Kumar", role: "Beneficiary, Allahabad",
      imgKey: "kanayadanSupport", icon: "💍", delay: 0.1,
    },
    {
      quote: "I'm a software engineer in Pune. Every weekend I mentor rural students through SevaIndia. It is the most meaningful thing I do with my time.",
      name: "Ananya Joshi", role: "Volunteer, Pune",
      imgKey: "edu1Img", icon: "🤝", delay: 0.2,
    },
  ],

  // ── Photo gallery ─────────────────────────────────────────────────────────
  gallery: {
    row1: [
      { imgKey: "healthImg",       alt: "Orphan health programme",      delay: 0,    span2: true },
      { imgKey: "empowerImg2",     alt: "Women empowerment",            delay: 0.1  },
      { imgKey: "kanayadanSupport",alt: "Kanyadan support",             delay: 0.15 },
      { imgKey: "elderEmotional",  alt: "Elder care — emotional support",delay: 0.2  },
      { imgKey: "empowerImg3",     alt: "Rural women's group",          delay: 0.25 },
    ],
    row2: [
      { imgKey: "medicalImg", alt: "Medical camp",             delay: 0.1  },
      { imgKey: "cowImg",     alt: "Gau Seva programme",       delay: 0.15 },
      { imgKey: "widowImg",   alt: "Widow support programme",  delay: 0.2  },
      { imgKey: "ritesImg",   alt: "Last rites support",       delay: 0.25 },
      { imgKey: "mealImg",    alt: "Meal programme",           delay: 0.3  },
    ],
  },
};

const ourStorySlice = createSlice({
  name: "ourStory",
  initialState,
  reducers: {
    // Reducers can be added here later for dynamic updates (e.g. API fetch)
  },
});

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectStats        = (state) => state.ourStory.stats;
export const selectValues       = (state) => state.ourStory.values;
export const selectMilestones   = (state) => state.ourStory.milestones;
export const selectTestimonials = (state) => state.ourStory.testimonials;
export const selectGallery      = (state) => state.ourStory.gallery;

export default ourStorySlice.reducer;
