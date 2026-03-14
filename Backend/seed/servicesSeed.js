/**
 * Services Seed — Categories & Programs
 *
 * Safe to run multiple times: uses upsert (findOneAndUpdate) so no existing
 * data is ever deleted or duplicated. Only creates or updates documents.
 *
 * To run:
 *   node seed/servicesSeed.js
 *   (or add  "seed:services": "node seed/servicesSeed.js"  to package.json scripts)
 */

import "../config/loadEnv.js";
import connectDB from "../config/db.js";
import Category from "../models/Services.Category.models.js";
import Program from "../models/Services.Program.models.js";

// ─────────────────────────────────────────────────────────────────────────────
// DATA — mirrors SERVICE_DATA in Frontend/src/pages/service.jsx exactly.
// imagekeys / galleryImageKeys: set to null / [] here; upload real images
// via the admin panel (S3) and update these fields afterwards.
// External Pexels URLs are kept as-is for programs that had them.
// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_SEED_DATA = [

  // ── 1. Women Empowerment ──────────────────────────────────────────────────
  {
    name: "Women Empowerment",
    description: "Programs supporting women through financial aid, skill development, health camps, self-help groups, and legal assistance.",
    programs: [
      {
        title: "Hope for Widowed Women",
        description: "We provide regular financial support to widowed women to help them meet their daily needs.",
        fullDescription: "Widowhood is one of the most vulnerable conditions a woman can face in India. Without spousal support, many widowed women struggle to meet basic needs like food, shelter, healthcare, and children's education. Our Hope for Widowed Women program provides monthly financial assistance directly to women who have lost their husbands and have no other source of income. We conduct home visits to assess each family's situation and ensure the funds reach those who truly need them. Beyond financial support, we connect widows with legal aid for property rights, help them access government welfare schemes they are entitled to, and offer emotional counseling through trained volunteers. Our network of partner NGOs and community leaders helps us reach widows in rural and semi-urban areas who often fall through the cracks of the formal welfare system. We believe every woman deserves to live with dignity, regardless of her marital status. Your donation directly funds the monthly stipends and support services that help these women rebuild their lives, regain confidence, and provide a better future for their children.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/women/widow-women",
        donationTitle: "Empower Widow Women with Financial and Social Support",
      },
      {
        title: "Women Skill Development",
        description: "Vocational training in tailoring, handicrafts, and digital skills to make women financially independent.",
        fullDescription: "Economic independence is the foundation of women's empowerment. Our Women Skill Development program offers free vocational training to women from low-income and marginalized households. Courses include tailoring and garment making, embroidery and handicrafts, basic computer literacy, digital payment systems, and small business management. Each batch runs for three to six months with certified trainers. We provide all materials free of cost to trainees. After completion, participants receive certificates recognized by local industries and government skill boards. Our placement cell actively connects graduates with employment opportunities, self-help groups, and microfinance schemes so they can start their own businesses. We have trained over five thousand women across six states in the past three years. Your support enables us to expand this program to more districts, purchase training equipment, and provide stipends to women who travel long distances to attend sessions.",
        imagekeys: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
        galleryImageKeys: [],
        cta: "Help Now",
        href: null,
        donationTitle: "Fund Vocational Training for Women's Economic Independence",
      },
      {
        title: "Self-Help Group (SHG) Support",
        description: "Forming and nurturing women's self-help groups to enable collective savings, micro-loans, and community support.",
        fullDescription: "Self-Help Groups (SHGs) are one of the most powerful grassroots models for women's financial and social empowerment. Our SHG Support program helps form, register, and nurture women's groups of ten to twenty members in rural and semi-urban areas. Each group is trained in collective savings, internal lending, bookkeeping, and democratic decision-making. We connect established SHGs with microfinance institutions and government schemes like NRLM to access larger loans for income-generating activities. Our field coordinators make regular visits to mentor group leaders and resolve conflicts. We have supported the formation of over eight hundred SHGs, benefiting more than twelve thousand women. Your donation funds the training materials, field visits, registration costs, and seed capital that help new SHGs get started on the right foot and grow into lasting institutions that sustain themselves for years.",
        imagekeys: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
        galleryImageKeys: [],
        cta: "Help Now",
        href: null,
        donationTitle: "Empower Women Through Self-Help Groups",
      },
      {
        title: "Women's Health Camps",
        description: "Free health camps for women covering gynaecology, anaemia screening, and maternal health awareness.",
        fullDescription: "Women's healthcare in rural India remains critically underserved. Millions of women suffer from preventable conditions such as anaemia, reproductive health issues, malnutrition, and complications during pregnancy — all because they lack access to regular medical care. Our Women's Health Camps program organizes dedicated health camps specifically designed for women and girls. Each camp provides free gynaecological consultations, anaemia screening with iron supplementation, breast and cervical cancer awareness and early detection, prenatal and postnatal guidance for mothers, nutritional counseling, and distribution of sanitary hygiene products. Over the past two years we have screened more than twenty thousand women and provided free medicines to over eight thousand patients.",
        imagekeys: "https://images.pexels.com/photos/5765827/pexels-photo-5765827.jpeg?auto=compress&cs=tinysrgb&w=800",
        galleryImageKeys: [],
        cta: "Help Now",
        href: null,
        donationTitle: "Fund Free Women's Health Camps Across Rural India",
      },
      {
        title: "Legal Aid for Women",
        description: "Free legal counseling and court support for women facing domestic violence, property disputes, and harassment.",
        fullDescription: "Many women in India are unaware of their legal rights or cannot afford legal representation when they face domestic violence, property disputes, divorce, workplace harassment, or exploitation. Our Legal Aid for Women program bridges this critical gap by providing free legal counseling through a panel of experienced lawyers and paralegals who specialize in women's rights. We operate legal aid helplines and walk-in centers in multiple cities. Services include legal awareness workshops in villages, one-on-one counseling sessions, assistance with filing FIRs and court petitions, representation in family courts and labour tribunals, and support in accessing government schemes for women in distress.",
        imagekeys: "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800",
        galleryImageKeys: [],
        cta: "Help Now",
        href: null,
        donationTitle: "Provide Free Legal Aid to Women in Need",
      },
    ],
  },

  // ── 2. Orphan ────────────────────────────────────────────────────────────
  {
    name: "Orphan",
    description: "Education, nutrition, and healthcare support for orphaned children in partner care homes across India.",
    programs: [
      {
        title: "Education Support",
        description: "School enrollment, books, and learning support for every child.",
        fullDescription: "Education is the most powerful tool to break the cycle of poverty for orphaned children. Our Education Support program ensures that every child in our partner orphanages is enrolled in school and receives the academic support needed to succeed. We cover school fees, uniforms, stationery, textbooks, and examination fees. Beyond enrollment, we provide after-school tutoring by trained educators, access to digital learning resources, and mentoring by college student volunteers. For older children, we offer career counseling and scholarship guidance to help them pursue higher education or vocational training. Our program currently supports over two thousand children across thirty partner orphanages in eight states.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/orphanage/education",
        donationTitle: "Help provide education support for children in orphanage care",
      },
      {
        title: "Nutritious Meal Program",
        description: "Daily nutritious meals to help children grow healthy and strong.",
        fullDescription: "Proper nutrition during childhood is critical for physical and cognitive development. Many orphaned children suffer from malnutrition, stunting, and micronutrient deficiencies that have long-lasting effects on their health and learning ability. Our Nutritious Meal Program ensures that children in partner orphanages receive three balanced meals every day, formulated by nutritionists to meet the specific dietary needs of growing children. The meal plan includes proteins, vitamins, minerals, and adequate calories across breakfast, lunch, and dinner. We also provide vitamin supplements and conduct regular growth monitoring to track each child's health progress.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/orphanage/meal",
        donationTitle: "Provide high-quality nutritious meals for orphans",
      },
      {
        title: "Health & Medical Care",
        description: "Regular checkups, medicines, and timely healthcare for children.",
        fullDescription: "Orphaned children are among the most medically vulnerable populations, often arriving at care centers with untreated infections, dental problems, skin conditions, and nutritional deficiencies. Our Health and Medical Care program ensures that every child in our partner orphanages receives comprehensive healthcare. We organize monthly health checkups by qualified pediatricians, dental screenings, eye examinations, and mental health assessments. All prescribed medicines are procured and administered under caregiver supervision. Children requiring specialist treatment are referred to partner hospitals where costs are covered through our fund.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/orphanage/health",
        donationTitle: "Help provide healthcare and medical support for children in orphanage care",
      },
    ],
  },

  // ── 3. Elderly ───────────────────────────────────────────────────────────
  {
    name: "Elderly",
    description: "Daily meals, dignified shelter, and medical assistance for senior citizens who have been abandoned or have no support.",
    programs: [
      {
        title: "Daily Meal Care",
        description: "Nutritious meals and hydration plans for seniors in need.",
        fullDescription: "Food security for the elderly is a growing crisis in India. Many older citizens — especially those abandoned by families or widowed without financial support — go hungry every day. Our Daily Meal Care program delivers freshly cooked, nutrition-balanced meals to elderly individuals living alone or in partner care centers twice a day. Our menus are designed by dietitians with senior nutrition in mind, incorporating seasonal vegetables, proteins, and adequate hydration. Volunteers and field staff build personal relationships with each recipient, checking on their health and wellbeing during each delivery. Currently we serve over three thousand elderly individuals across our partner cities and districts.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/elder/meal",
        donationTitle: "Provide daily nutritious meals for abandoned elderly",
      },
      {
        title: "Dignified Living Support",
        description: "Comfortable shelter, clean essentials, and respectful care.",
        fullDescription: "Every elderly person deserves to live their final years with dignity, comfort, and respect — not abandoned in squalor or depending on the charity of strangers. Our Dignified Living Support program provides elderly individuals in partner care homes with clean, safe, and comfortable living spaces equipped with age-appropriate furniture, proper lighting, ventilation, and sanitation. We ensure each resident has an adequate supply of personal hygiene items, seasonal clothing, and bedding. Trained caregivers attend to daily personal care needs including bathing, grooming, and mobility assistance for those who are physically challenged.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/elder/living",
        donationTitle: "Provide dignified living and shelter for abandoned elderly",
      },
      {
        title: "Medical Assistance",
        description: "Doctor visits, medicines, and regular health monitoring.",
        fullDescription: "Aging comes with a range of health challenges that require consistent, attentive medical care. For elderly individuals without family support or financial means, accessing quality healthcare is nearly impossible. Our Medical Assistance program provides comprehensive medical support to senior citizens in our care network. This includes bi-monthly visits by qualified doctors, regular blood pressure, blood sugar, and cholesterol monitoring, and prescription management. We procure medicines at bulk rates and provide them free to elderly beneficiaries. Specialist consultations in cardiology, orthopaedics, and geriatrics are arranged through partner hospitals at no cost.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/elder/medical",
        donationTitle: "Provide urgent medical assistance and life-saving care",
      },
    ],
  },

  // ── 4. Community Safety ──────────────────────────────────────────────────
  {
    name: "Community Safety",
    description: "Road safety, fire prevention, and child protection programs to build safer communities.",
    programs: [
      {
        title: "Helmet Distribution Drive",
        description: "Distributing certified safety helmets to riders to reduce head injuries and save lives.",
        fullDescription: "Road accidents are one of India's leading causes of death, and head injuries are responsible for the majority of fatalities in two-wheeler crashes. Wearing a certified helmet can reduce the risk of fatal head injury by up to 70%, yet millions of riders in rural and semi-urban India go without one — often due to cost or lack of awareness. Our Helmet Distribution Drive procures ISI-certified helmets in bulk and distributes them free of charge to two-wheeler riders from low-income households, daily wage workers, delivery riders, and schoolchildren who ride bicycles on busy roads. Each distribution camp is accompanied by road safety awareness sessions conducted in partnership with local traffic police and NGO volunteers.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/safety/helmet",
        donationTitle: "Protect Lives: Nationwide Helmet Distribution Drive",
      },
      {
        title: "Fire Safety Awareness Camps",
        description: "Training communities on fire prevention, safe cooking practices, and emergency evacuation procedures.",
        fullDescription: "Thousands of fire accidents occur every year in Indian homes, slums, and markets — many of them preventable with basic knowledge and precautions. Our Fire Safety Awareness Camps program trains communities in fire prevention and emergency response through interactive workshops, demonstrations, and hands-on drills. Sessions cover safe cooking practices on biomass stoves, proper storage of flammable materials, electrical safety in homes, how to use basic fire extinguishers, and how to conduct safe evacuation of elderly, children, and differently-abled individuals during a fire emergency. We partner with local fire stations to bring trained firefighters to conduct live demonstrations in villages and urban slums.",
        imagekeys: "https://images.pexels.com/photos/1363876/pexels-photo-1363876.jpeg?auto=compress&cs=tinysrgb&w=800",
        galleryImageKeys: [],
        cta: "Help Now",
        href: null,
        donationTitle: "Fund Fire Safety Camps to Protect Communities",
      },
      {
        title: "Child Safety & Protection",
        description: "Awareness and reporting systems to protect children from abuse, trafficking, and exploitation.",
        fullDescription: "Child abuse, trafficking, and labor exploitation remain serious threats to children across India, particularly in economically vulnerable communities. Our Child Safety and Protection program works at the community level to create a network of informed adults who can recognize warning signs and take action. We conduct child safety workshops in schools, training children about good touch and bad touch, online safety, identifying trusted adults, and how to report abuse safely. We train teachers, anganwadi workers, and community health workers to recognize signs of abuse, neglect, and trafficking. A dedicated helpline connects at-risk children and concerned adults with child protection officers and legal authorities.",
        imagekeys: "https://images.pexels.com/photos/296301/pexels-photo-296301.jpeg?auto=compress&cs=tinysrgb&w=800",
        galleryImageKeys: [],
        cta: "Help Now",
        href: null,
        donationTitle: "Protect Children from Abuse, Trafficking and Exploitation",
      },
    ],
  },

  // ── 5. Social Welfare ────────────────────────────────────────────────────
  {
    name: "Social Welfare",
    description: "Kanyadan Yojna LIC support for underprivileged girls and dignified last-rites assistance for poor families.",
    programs: [
      {
        title: "Kanyadan Yojna — LIC Support",
        description: "We enroll underprivileged girls in LIC life insurance policies and pay the first 3 premiums — giving every daughter a secured financial future.",
        fullDescription: "Marriage is a significant social milestone in India, but for families living in poverty, arranging a daughter's wedding can mean selling assets, taking high-interest loans, or simply being unable to provide the basic dignified celebration their daughter deserves. Our Kanyadan Yojna provides financial and material support for marriages of girls from below-poverty-line and economically weaker families. Support includes contribution toward wedding ceremony costs, essential household items like utensils, bedding, and basic furniture for the new home, assistance with wedding attire for the bride, and guidance on legal registration of marriage and accessing government marriage assistance schemes.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/welfare/kanyadan",
        donationTitle: "Support LIC Policy Enrollment for Underprivileged Girls — Kanyadan Yojna",
      },
      {
        title: "Dignified Last Rites",
        description: "Helping underprivileged families perform respectful and dignified final rites for loved ones.",
        fullDescription: "The loss of a loved one is among the most painful experiences in life. For families living in poverty, the inability to perform proper last rites compounds grief with shame and helplessness. In Indian culture, funeral and cremation rituals hold deep religious and emotional significance — yet for many poor families, the costs of wood, ritual items, transport, and ceremony are simply unaffordable. Our Dignified Last Rites program responds within hours of receiving a call for assistance. We provide the materials and logistics required for a proper funeral — cremation wood, ritual items, shroud, transport of the body, and support with death certificate registration. A trained social worker accompanies the family throughout the process to offer both practical help and emotional support.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/welfare/rites",
        donationTitle: "Support Dignified Last Rites: A Respectful Farewell for the Underprivileged",
      },
    ],
  },

  // ── 6. Medical Support ───────────────────────────────────────────────────
  {
    name: "Medical Support",
    description: "Free health camps, cancer treatment aid, kidney dialysis support, and blood donation drives for vulnerable communities.",
    programs: [
      {
        title: "Free Health Camp Checkups",
        description: "Regular free health camps offering doctor consultations, basic diagnostics, and early screening for vulnerable communities.",
        fullDescription: "Access to basic healthcare is a fundamental right, yet millions of Indians living in rural areas, urban slums, and tribal communities have never seen a qualified doctor. Our Free Health Camp Checkups program deploys mobile medical teams to organize camps in villages, slums, tribal settlements, construction sites, and brick kilns where healthcare access is most limited. Each camp provides free consultations with qualified general physicians and specialists, blood pressure measurement, blood glucose testing, haemoglobin testing, BMI assessment, eye testing, basic dental examination, and distribution of free medicines for common ailments. Our camps have screened over fifty thousand patients in the past three years.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/medical/camp",
        donationTitle: "Fund a Mega Free Health Checkup Camp for rural communities",
      },
      {
        title: "Cancer Treatment Support",
        description: "Financial aid for cancer treatment, including chemotherapy cycles, diagnostics, and essential medicines for patients in need.",
        fullDescription: "Cancer is one of India's most devastating diseases, affecting over 1.4 million new patients every year. For families living below or near the poverty line, a cancer diagnosis is not just a medical crisis — it is a financial catastrophe. Our Cancer Treatment Support program provides financial assistance to low-income cancer patients to cover costs not covered by government schemes or insurance. We fund chemotherapy cycles, radiation therapy sessions, diagnostic scans including CT, PET, and MRI, biopsy procedures, essential medicines, and hospital admission charges at partner hospitals and cancer institutes. Each case is reviewed by a medical social worker who assesses eligibility and coordinates timely disbursement of funds directly to hospitals.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/medical/cancer",
        donationTitle: "Support Life-Saving Cancer Treatments & Care",
      },
      {
        title: "Kidney Dialysis Support",
        description: "Helping low-income patients afford recurring dialysis sessions and related treatment costs for long-term kidney care.",
        fullDescription: "Chronic kidney disease affects millions of Indians, and for those with end-stage renal failure, dialysis is not optional — it is a life-sustaining procedure required two to three times per week without interruption. Each dialysis session costs between five hundred and fifteen hundred rupees in government facilities. For poor patients, the cumulative cost of three sessions per week becomes impossible to sustain. Our Kidney Dialysis Support program subsidizes or fully covers the cost of dialysis sessions for low-income patients. We have empanelled dialysis centres in multiple cities where patients receive sessions at zero or minimal cost through our support. Our program currently supports over two hundred active patients.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/medical/kidney",
        donationTitle: "Support Life-Saving Kidney Dialysis & Care",
      },
      {
        title: "Blood Donation Camps",
        description: "Organizing voluntary blood donation events to address India's critical blood shortage and save lives.",
        fullDescription: "India faces a massive shortage of safe blood every year, with demand exceeding supply by over three million units. Voluntary, regular blood donation is the only safe and sustainable solution. Our Blood Donation Camps program organizes large-scale voluntary blood donation drives in colleges, corporate offices, community halls, temples, mosques, and public spaces. Each camp is conducted in partnership with licensed blood banks and hospitals, ensuring that donated blood is screened, stored safely, and distributed to patients who need it most. Trained medical staff conduct pre-donation health checks, collect blood using sterile equipment, and provide post-donation refreshments and certificates to donors. Our camps have collected over fifty thousand units of blood in the past five years.",
        imagekeys: "https://images.pexels.com/photos/6823601/pexels-photo-6823601.jpeg?auto=compress&cs=tinysrgb&w=800",
        galleryImageKeys: [],
        cta: "Help Now",
        href: null,
        donationTitle: "Support Community Blood Donation Camps",
      },
    ],
  },

  // ── 7. Infrastructure Development ────────────────────────────────────────
  {
    name: "Infrastructure Development",
    description: "Building and upgrading roads, pathways, and connectivity to unlock economic and social development in rural India.",
    programs: [
      {
        title: "Road Construction",
        description: "Build and upgrade roads, pathways, and connectivity for rural communities.",
        fullDescription: "Rural road connectivity is foundational to economic development, healthcare access, and educational opportunity. Yet thousands of villages in India remain cut off from the nearest town or highway due to lack of proper roads. Our Road Construction program identifies villages where road connectivity is most critical and partners with panchayats, district authorities, and construction companies to build or upgrade roads using durable materials appropriate to local terrain. Projects include dirt-to-paved road conversions, culvert and bridge construction over seasonal streams, road widening for two-way vehicle traffic, streetlight installation for safety, and drainage systems to prevent waterlogging. Completed roads have transformed communities by enabling regular transport services, reducing emergency response times, improving school attendance, and allowing farmers to access better market prices.",
        imagekeys: null,
        galleryImageKeys: [],
        cta: "Help Now",
        href: "/services/infrastructure/road-construction",
        donationTitle: "Support Rural Road Construction for Community Connectivity",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
const seedServices = async () => {
  // When called from server.js, DB is already connected — skip connectDB()
  const runningDirectly = process.argv[1] === (await import("url")).fileURLToPath(import.meta.url);
  if (runningDirectly) await connectDB();

  console.log("\n  Starting services seed (upsert)…\n");

  let catCreated = 0, catUpdated = 0, progCreated = 0, progUpdated = 0;

  for (const catData of SERVICE_SEED_DATA) {
    const { programs, imageUrl, ...catFields } = catData;

    // ── Upsert category (text fields only) ──────────────────────────────────
    const catBefore = await Category.findOne({ name: catFields.name });
    const category = await Category.findOneAndUpdate(
      { name: catFields.name },
      { $set: catFields },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (catBefore) { catUpdated++; console.log(`    Category updated : ${category.name}`); }
    else           { catCreated++; console.log(`    Category created : ${category.name}`); }

    // ── Upsert each program ──────────────────────────────────────────────────
    for (const progData of programs) {
      const { imagekeys, galleryImageKeys, ...textFields } = progData;
      const progBefore = await Program.findOne({ title: progData.title, categoryId: category._id });

      await Program.findOneAndUpdate(
        { title: progData.title, categoryId: category._id },
        {
          // Always update text/meta fields
          $set: {
            ...textFields,
            categoryId:   category._id,
            categoryName: category.name,
          },
          // Image keys: only set when CREATING — never overwrite uploaded S3 keys
          $setOnInsert: {
            imagekeys:        imagekeys ?? null,
            galleryImageKeys: galleryImageKeys || [],
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (progBefore) { progUpdated++; console.log(`       Program updated : ${progData.title}`); }
      else            { progCreated++; console.log(`       Program created : ${progData.title}`); }
    }

    console.log();
  }

  console.log("  ----------------------------------------");
  console.log(`  Categories — created: ${catCreated}, updated: ${catUpdated}`);
  console.log(`  Programs   — created: ${progCreated}, updated: ${progUpdated}`);
  console.log("  Services seed completed.\n");

  // Only exit when run as a standalone script, not when imported by server.js
  if (runningDirectly) process.exit(0);
};

export default seedServices;

// Run when executed directly: node seed/servicesSeed.js
import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedServices().catch((err) => { console.error(err.message); process.exit(1); });
}
