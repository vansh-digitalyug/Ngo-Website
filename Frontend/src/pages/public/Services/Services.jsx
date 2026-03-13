import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaFemale,
  FaHandHoldingHeart,
  FaHeartbeat,
  FaSearch,
  FaShieldAlt,
  FaThLarge,
  FaTimes,
} from "react-icons/fa";
import { FaChildren } from "react-icons/fa6";
import { MdElderly } from "react-icons/md";
import orphanEducation from "../assets/images/orphanage/education.jpg";
import eduImg1 from "../assets/images/orphanage/education/image1.png";
import eduImg2 from "../assets/images/orphanage/education/image2.png";
import eduImg3 from "../assets/images/orphanage/education/image3.png";
import eduImg4 from "../assets/images/orphanage/education/image4.png";
import eduImg5 from "../assets/images/orphanage/education/image5.png";
import orphanFood from "../assets/images/orphanage/food.webp";
import mealImg1 from "../assets/images/orphanage/meal/image1.png";
import mealImg2 from "../assets/images/orphanage/meal/image2.png";
import mealImg3 from "../assets/images/orphanage/meal/image3.png";
import mealImg4 from "../assets/images/orphanage/meal/image 4.png";
import mealImg5 from "../assets/images/orphanage/meal/image5.png";
import orphanHealth from "../assets/images/orphanage/health.jpg";
import healthImg1 from "../assets/images/orphanage/medical/image1.png";
import healthImg2 from "../assets/images/orphanage/medical/image2.png";
import healthImg3 from "../assets/images/orphanage/medical/image3.png";
import healthImg4 from "../assets/images/orphanage/medical/image4.png";
import healthImg5 from "../assets/images/orphanage/medical/image5.png";
import elderFood from "../assets/images/elderly/food.jpg";
import elderLiving from "../assets/images/elderly/living.jpg";
import elderMedical from "../assets/images/elderly/medical.webp";
import medicalCamp from "../assets/images/Medical/camp.jpg";
import medicalCancer from "../assets/images/Medical/cancer.png";
import medicalKidney from "../assets/images/Medical/kidney.jpg";
import helmet from "../assets/images/communitySafety/helmet.png";
import rites from "../assets/images/socialWelfare/rites.png";
import kandyaDan from "../assets/images/socialWelfare/kanyadan.png";
import kanyaHero from "../assets/images/socialWelfare/Kanyadan/hero.png";
import kanyaBeginning from "../assets/images/socialWelfare/Kanyadan/Beggining.png";
import kanyaHelp from "../assets/images/socialWelfare/Kanyadan/Help.png";
import kanyaSupport from "../assets/images/socialWelfare/Kanyadan/Support.png";
import kanyaFuture from "../assets/images/socialWelfare/Kanyadan/Future.png";
import road from "../assets/images/infrastructure/road.jpg";
import widow from "../assets/images/women/widow.png";
import empowerImg1 from "../assets/images/women/empowerment/image1.png";
import empowerImg2 from "../assets/images/women/empowerment/image2.png";
import empowerImg3 from "../assets/images/women/empowerment/image3.png";
import empowerImg4 from "../assets/images/women/empowerment/image4.png";
import empowerImg5 from "../assets/images/women/empowerment/image5.png";
import cowImg1 from "../assets/images/socialWelfare/Cow/image1.png";
import cowImg2 from "../assets/images/socialWelfare/Cow/image2.png";
import cowImg3 from "../assets/images/socialWelfare/Cow/image3.png";
import "./service.css";

const SERVICE_DATA = [
  {
    id: "women-empowerment",
    label: "Women",
    icon: FaFemale,
    programs: [
      {
        title: "Hope for Widowed Women",
        description: "We provide regular financial support to widowed women to help them meet their daily needs.",
        fullDescription: "Widowhood is one of the most vulnerable conditions a woman can face in India. Without spousal support, many widowed women struggle to meet basic needs like food, shelter, healthcare, and children's education. Our Hope for Widowed Women program provides monthly financial assistance directly to women who have lost their husbands and have no other source of income. We conduct home visits to assess each family's situation and ensure the funds reach those who truly need them. Beyond financial support, we connect widows with legal aid for property rights, help them access government welfare schemes they are entitled to, and offer emotional counseling through trained volunteers. Our network of partner NGOs and community leaders helps us reach widows in rural and semi-urban areas who often fall through the cracks of the formal welfare system. We believe every woman deserves to live with dignity, regardless of her marital status. Your donation directly funds the monthly stipends and support services that help these women rebuild their lives, regain confidence, and provide a better future for their children.",
        image: widow,
        cta: "Help Now",
        href: "/services/women/widow-women",
        donationTitle: "Empower Widow Women with Financial and Social Support",
      },
      {
        title: "Women Empowerment Program",
        description: "We give women from low-income families the seed money to set up a home-based production unit — agarbatti, achar, candles, soaps — so they can earn their own income without leaving home.",
        fullDescription: "Millions of women in India have the skills to earn — they know how to make agarbatti, prepare achar, roll papad, craft candles, and produce herbal soaps. What they lack is not ability. What they lack is money. Even ₹2,000–₹3,000 for raw materials and basic equipment is beyond reach for a woman from a low-income household. Our Women Empowerment Program closes that gap. We provide direct seed money — no training, no loans, no repayments — so a woman can immediately set up a production unit inside her own home. She produces, she sells, she keeps the income. Our field team identifies eligible women from below-poverty-line families through community visits and partner referrals, reviews their product plan, and disburses the seed fund directly. We follow up with each unit to ensure it is running and provide additional support if needed. A unit that starts with ₹3,000 in materials can generate ₹8,000–₹12,000 per month within weeks. Over 1,200 women have set up units through our program, with a 95% unit survival rate. Your donation funds the seed money that turns a woman's skill into a sustainable income — and changes her family's life.",
        image: empowerImg1,
        images: [empowerImg1, empowerImg2, empowerImg3, empowerImg4, empowerImg5],
        cta: "Help Now",
        href: "/services/women/empowerment",
        donationTitle: "Empower Women Through Education, Skills & Opportunity",
      },
    ],
  },
  {
    id: "orphan",
    label: "Orphan",
    icon: FaChildren,
    programs: [
      {
        title: "Education Support",
        description: "School enrollment, books, and learning support for every child.",
        fullDescription: "Education is the most powerful tool to break the cycle of poverty for orphaned children. Our Education Support program ensures that every child in our partner orphanages is enrolled in school and receives the academic support needed to succeed. We cover school fees, uniforms, stationery, textbooks, and examination fees. Beyond enrollment, we provide after-school tutoring by trained educators, access to digital learning resources, and mentoring by college student volunteers. For older children, we offer career counseling and scholarship guidance to help them pursue higher education or vocational training. We also organize special learning camps during vacations to address learning gaps and build confidence in subjects where children struggle. Our program currently supports over two thousand children across thirty partner orphanages in eight states. We track each child's academic progress through quarterly reports and intervene quickly when a child begins to fall behind. Many of our alumni have gone on to complete college degrees, join the armed forces, become teachers, and pursue other meaningful careers — returning to their communities as role models. Your donation directly funds school fees, learning materials, tutor salaries, and the digital resources that give orphaned children the same educational opportunities as their peers.",
        image: orphanEducation,
        images: [eduImg1, eduImg2, eduImg3, eduImg4, eduImg5],
        cta: "Help Now",
        href: "/services/orphanage/education",
        donationTitle: "Help provide education support for children in orphanage care",
      },
      {
        title: "Nutritious Meal Program",
        description: "Daily nutritious meals to help children grow healthy and strong.",
        fullDescription: "Proper nutrition during childhood is critical for physical and cognitive development. Many orphaned children suffer from malnutrition, stunting, and micronutrient deficiencies that have long-lasting effects on their health and learning ability. Our Nutritious Meal Program ensures that children in partner orphanages receive three balanced meals every day, formulated by nutritionists to meet the specific dietary needs of growing children. The meal plan includes proteins, vitamins, minerals, and adequate calories across breakfast, lunch, and dinner. We also provide vitamin supplements and conduct regular growth monitoring to track each child's health progress. Trained cooks prepare meals using locally sourced, fresh ingredients, supporting local farmers and ensuring food quality. Special meals are provided during festivals and birthdays to give children a sense of celebration and belonging. We also run nutrition education sessions so older children understand the importance of healthy eating habits. Seasonal menus are adjusted based on availability and doctor recommendations. Our program has shown measurable improvements in weight-for-age and height-for-age indicators among children enrolled for over six months. Your donation funds ingredients, kitchen equipment, and nutritionist consultations that keep these children healthy, focused in school, and full of energy to dream big.",
        image: orphanFood,
        images: [mealImg4, mealImg1, mealImg3, mealImg5, mealImg2],
        cta: "Help Now",
        href: "/services/orphanage/meal",
        donationTitle: "Provide high-quality nutritious meals for orphans",
      },
      {
        title: "Health & Medical Care",
        description: "Regular checkups, medicines, and timely healthcare for children.",
        fullDescription: "Orphaned children are among the most medically vulnerable populations, often arriving at care centers with untreated infections, dental problems, skin conditions, and nutritional deficiencies. Our Health and Medical Care program ensures that every child in our partner orphanages receives comprehensive healthcare. We organize monthly health checkups by qualified pediatricians, dental screenings, eye examinations, and mental health assessments. All prescribed medicines are procured and administered under caregiver supervision. Children requiring specialist treatment are referred to partner hospitals where costs are covered through our fund. We maintain detailed health records for every child and set up vaccination schedules in line with government immunization programs. Our caregiver training includes first aid, recognizing signs of illness, and emergency protocols. Children who have experienced trauma receive counseling and psychological support from trained therapists. Hygiene education is embedded in daily routines to prevent illness at the source. We also run dental hygiene drives and distribute health kits that include toothbrushes, soaps, and personal hygiene items. Your donation directly funds doctor visits, medicines, specialist referrals, and the mental health support that helps these children heal from past trauma and grow up healthy and resilient.",
        image: orphanHealth,
        images: [healthImg1, healthImg2, healthImg3, healthImg4, healthImg5],
        cta: "Help Now",
        href: "/services/orphanage/health",
        donationTitle: "Help provide healthcare and medical support for children in orphanage care",
      },
    ],
  },
  {
    id: "elder",
    label: "Elderly",
    icon: MdElderly,
    programs: [
      {
        title: "Daily Meal Care",
        description: "Nutritious meals and hydration plans for seniors in need.",
        fullDescription: "Food security for the elderly is a growing crisis in India. Many older citizens — especially those abandoned by families or widowed without financial support — go hungry every day. Age-related conditions like diabetes, hypertension, and reduced mobility mean that seniors need specially prepared nutritious meals that are soft, easy to digest, and medically appropriate. Our Daily Meal Care program delivers freshly cooked, nutrition-balanced meals to elderly individuals living alone or in partner care centers twice a day. Our menus are designed by dietitians with senior nutrition in mind, incorporating seasonal vegetables, proteins, and adequate hydration. Volunteers and field staff build personal relationships with each recipient, checking on their health and wellbeing during each delivery. This regular human contact is itself a powerful intervention against isolation and depression, which are major health risks for the elderly. We also maintain an emergency food bank for times when recipients are unwell and need specific dietary support. Currently we serve over three thousand elderly individuals across our partner cities and districts. Your donation funds meal preparation, delivery logistics, and nutritionist consultations that ensure our elderly beneficiaries receive the nourishment and care they deserve in their final years.",
        image: elderFood,
        cta: "Help Now",
        href: "/services/elder/meal",
        donationTitle: "Provide daily nutritious meals for abandoned elderly",
      },
      {
        title: "Dignified Living Support",
        description: "Comfortable shelter, clean essentials, and respectful care.",
        fullDescription: "Every elderly person deserves to live their final years with dignity, comfort, and respect — not abandoned in squalor or depending on the charity of strangers. Our Dignified Living Support program provides elderly individuals in partner care homes with clean, safe, and comfortable living spaces equipped with age-appropriate furniture, proper lighting, ventilation, and sanitation. We ensure each resident has an adequate supply of personal hygiene items, seasonal clothing, and bedding. Trained caregivers attend to daily personal care needs including bathing, grooming, and mobility assistance for those who are physically challenged. Activities such as yoga, devotional singing, storytelling, and craft sessions are organized to keep residents mentally engaged and emotionally fulfilled. Regular family outreach workers encourage family members to maintain contact with their elderly relatives in care. We also facilitate group celebrations for birthdays, festivals, and Independence Day that create a sense of community and joy. Legal protection officers help residents who have property or pension rights issues. Your donation covers shelter maintenance, caregiver salaries, hygiene supplies, recreational activities, and the day-to-day costs of running dignified care facilities that treat every resident as a valued human being.",
        image: elderLiving,
        cta: "Help Now",
        href: "/services/elder/living",
        donationTitle: "Provide dignified living and shelter for abandoned elderly",
      },
      {
        title: "Medical Assistance",
        description: "Doctor visits, medicines, and regular health monitoring.",
        fullDescription: "Aging comes with a range of health challenges that require consistent, attentive medical care. For elderly individuals without family support or financial means, accessing quality healthcare is nearly impossible. Our Medical Assistance program provides comprehensive medical support to senior citizens in our care network. This includes bi-monthly visits by qualified doctors and general physicians, regular blood pressure, blood sugar, and cholesterol monitoring, and prescription management. We procure medicines at bulk rates and provide them free to elderly beneficiaries. Specialist consultations in cardiology, orthopaedics, and geriatrics are arranged through partner hospitals at no cost. Physiotherapy sessions are available for those recovering from fractures, strokes, or mobility impairment. Our trained nursing staff monitor vitals daily in residential care settings and respond to health emergencies promptly. We maintain complete health records for every patient and coordinate seamlessly between general practitioners and specialists. Mobile medical units visit beneficiaries who cannot travel to clinics. Palliative care and pain management are provided with sensitivity for those in the final stages of life. Your donation directly funds doctor fees, medicines, medical equipment, ambulance support, and the specialized care that helps our elderly beneficiaries manage chronic conditions and live with dignity.",
        image: elderMedical,
        cta: "Help Now",
        href: "/services/elder/medical",
        donationTitle: "Provide urgent medical assistance and life-saving care",
      },
    ],
  },
  {
    id: "community-safety",
    label: "Community Safety",
    icon: FaShieldAlt,
    programs: [
      {
        title: "Helmet Distribution Drive",
        description: "Distributing certified safety helmets to riders to reduce head injuries and save lives.",
        fullDescription: "Road accidents are one of India's leading causes of death, and head injuries are responsible for the majority of fatalities in two-wheeler crashes. Wearing a certified helmet can reduce the risk of fatal head injury by up to 70%, yet millions of riders in rural and semi-urban India go without one — often due to cost or lack of awareness. Our Helmet Distribution Drive procures ISI-certified helmets in bulk and distributes them free of charge to two-wheeler riders from low-income households, daily wage workers, delivery riders, and schoolchildren who ride bicycles on busy roads. Each distribution camp is accompanied by road safety awareness sessions conducted in partnership with local traffic police and NGO volunteers. We cover the importance of wearing helmets correctly, traffic rules, safe riding practices, and first aid. We also engage local schools and community leaders as champions of road safety in their areas. Special drives are organized before festivals and monsoon season when accident rates spike. Our goal is to create a culture of safety where helmets are seen as essential protective gear rather than a burden. Your donation helps us procure helmets, organize distribution camps, cover transportation costs, and run awareness programs that save lives every day.",
        image: helmet,
        cta: "Help Now",
        href: "/services/safety/helmet",
        donationTitle: "Protect Lives: Nationwide Helmet Distribution Drive",
      },
      {
        title: "Fire Safety Awareness Camps",
        description: "Training communities on fire prevention, safe cooking practices, and emergency evacuation procedures.",
        fullDescription: "Thousands of fire accidents occur every year in Indian homes, slums, and markets — many of them preventable with basic knowledge and precautions. Rural households using wood-fired stoves, kerosene lamps, and makeshift electrical connections face particularly high risks. Our Fire Safety Awareness Camps program trains communities in fire prevention and emergency response through interactive workshops, demonstrations, and hands-on drills. Sessions cover safe cooking practices on biomass stoves, proper storage of flammable materials, electrical safety in homes, how to use basic fire extinguishers, and how to conduct safe evacuation of elderly, children, and differently-abled individuals during a fire emergency. We partner with local fire stations to bring trained firefighters to conduct live demonstrations in villages and urban slums. Women's self-help groups and youth clubs are specifically engaged as community fire safety ambassadors. We also distribute affordable fire safety kits including smoke alarms, small extinguishers, and safety guides. Schools are trained to conduct fire drills and post emergency exit plans. Your support enables us to reach more communities, procure training materials, bring expert trainers, and create a generation of safety-conscious citizens who protect themselves and their neighbors from fire tragedies.",
        image: "https://images.pexels.com/photos/1363876/pexels-photo-1363876.jpeg?auto=compress&cs=tinysrgb&w=800",
        cta: "Help Now",
        href: null,
        donationTitle: "Fund Fire Safety Camps to Protect Communities",
      },
      {
        title: "Child Safety & Protection",
        description: "Awareness and reporting systems to protect children from abuse, trafficking, and exploitation.",
        fullDescription: "Child abuse, trafficking, and labor exploitation remain serious threats to children across India, particularly in economically vulnerable communities. Awareness, early identification, and prompt reporting are the most effective tools against these crimes. Our Child Safety and Protection program works at the community level to create a network of informed adults who can recognize warning signs and take action. We conduct child safety workshops in schools, training children about good touch and bad touch, online safety, identifying trusted adults, and how to report abuse safely. We train teachers, anganwadi workers, and community health workers to recognize signs of abuse, neglect, and trafficking. A dedicated helpline connects at-risk children and concerned adults with child protection officers and legal authorities. We work closely with police, Child Welfare Committees, and NGO networks to ensure swift action in reported cases. Our awareness drives have helped identify and rescue dozens of children from abusive situations each year. We also run reintegration and counseling programs for rescued children. Your donation funds awareness workshops, helpline operations, training programs, and the legal and psychological support services that protect our most vulnerable children.",
        image: "https://images.pexels.com/photos/296301/pexels-photo-296301.jpeg?auto=compress&cs=tinysrgb&w=800",
        cta: "Help Now",
        href: null,
        donationTitle: "Protect Children from Abuse, Trafficking and Exploitation",
      },
    ],
  },
  {
    id: "social-welfare",
    label: "Social Welfare",
    icon: FaHandHoldingHeart,
    programs: [
      {
        title: "Kanyadan Yojna — LIC Support",
        description: "We enroll underprivileged girls in LIC life insurance policies and pay the first 3 premiums — giving every daughter a secured financial future.",
        fullDescription: "Marriage is a significant social milestone in India, but for families living in poverty, arranging a daughter's wedding can mean selling assets, taking high-interest loans, or simply being unable to provide the basic dignified celebration their daughter deserves. Our Kanyadan Yojna provides financial and material support for marriages of girls from below-poverty-line and economically weaker families. Support includes contribution toward wedding ceremony costs, essential household items like utensils, bedding, and basic furniture for the new home, assistance with wedding attire for the bride, and guidance on legal registration of marriage and accessing government marriage assistance schemes. We work with local panchayats, social workers, and community leaders to identify genuine cases and ensure the support reaches families in need, not those misusing welfare programs. We also conduct premarital counseling and awareness sessions on legal rights, domestic violence prevention, and family planning. Group wedding ceremonies organized under this program help families reduce costs while creating a joyful community celebration. Your donation contributes directly to helping daughters begin their new lives with dignity and to reducing the financial burden that pushes many poor families into debt.",
        image: kandyaDan,
        images: [kanyaHero, kanyaBeginning, kanyaHelp, kanyaSupport, kanyaFuture],
        cta: "Help Now",
        href: "/services/welfare/kanyadan",
        donationTitle: "Support LIC Policy Enrollment for Underprivileged Girls — Kanyadan Yojna",
      },
      {
        title: "Dignified Last Rites",
        description: "Helping underprivileged families perform respectful and dignified final rites for loved ones.",
        fullDescription: "The loss of a loved one is among the most painful experiences in life. For families living in poverty, the inability to perform proper last rites compounds grief with shame and helplessness. In Indian culture, funeral and cremation rituals hold deep religious and emotional significance — yet for many poor families, the costs of wood, ritual items, transport, and ceremony are simply unaffordable. Our Dignified Last Rites program responds within hours of receiving a call for assistance. We provide the materials and logistics required for a proper funeral — cremation wood, ritual items, shroud, transport of the body, and support with death certificate registration. A trained social worker accompanies the family throughout the process to offer both practical help and emotional support. We operate with deep sensitivity to the religious practices of each family, respecting Hindu, Muslim, Christian, Sikh, and all other traditions equally. We also help surviving family members connect with government death benefits, insurance claims, and pension transfer procedures. Since our inception, we have helped hundreds of families bid farewell to their loved ones with the dignity and respect every human being deserves. Your donation makes it possible for a grieving family to say a proper goodbye, regardless of their financial condition.",
        image: rites,
        cta: "Help Now",
        href: "/services/welfare/rites",
        donationTitle: "Support Dignified Last Rites: A Respectful Farewell for the Underprivileged",
      },
      {
        title: "Gau Seva — Cow Protection & Care",
        description: "We rescue stray and injured cows, provide daily nutritious feed, complete veterinary treatment, and permanent shelter at our gaushala.",
        fullDescription: "India has over 5 million stray cows wandering roads and highways — abandoned when they stopped producing milk, suffering from injuries, starvation, and plastic ingestion. Our Gau Seva program rescues, treats, and permanently shelters these cows. We provide three core services: Chaara aur Paani (daily nutritious feed and clean water), Ilaaj (complete veterinary treatment for injuries and illness), and Aashray (safe, clean gaushala shelter). Our rescue team operates 7 days a week responding to calls about injured or stray cows. Partnered veterinary doctors conduct regular health camps. Your donation directly feeds, heals, and protects Gau Mata — an act of faith, compassion, and humanity.",
        image: cowImg1,
        images: [cowImg1, cowImg2, cowImg3],
        cta: "Help Now",
        href: "/services/animal/gau-seva",
        donationTitle: "Gau Seva — Rescue, Treat & Shelter Stray Cows",
      },
    ],
  },
  {
    id: "medical-support",
    label: "Medical Support",
    icon: FaHeartbeat,
    programs: [
      {
        title: "Free Health Camp Checkups",
        description: "Regular free health camps offering doctor consultations, basic diagnostics, and early screening for vulnerable communities.",
        fullDescription: "Access to basic healthcare is a fundamental right, yet millions of Indians living in rural areas, urban slums, and tribal communities have never seen a qualified doctor. Preventable and treatable diseases go undetected for years, causing suffering and death that could easily be avoided. Our Free Health Camp Checkups program deploys mobile medical teams to organize camps in villages, slums, tribal settlements, construction sites, and brick kilns where healthcare access is most limited. Each camp provides free consultations with qualified general physicians and specialists, blood pressure measurement, blood glucose testing, haemoglobin testing, BMI assessment, eye testing, basic dental examination, and distribution of free medicines for common ailments. Patients with serious conditions are referred to partner hospitals where treatment is arranged at subsidized costs or free of charge through government schemes. We also conduct health awareness sessions on topics like hygiene, nutrition, water sanitation, malaria prevention, and maternal health. Our camps have screened over fifty thousand patients in the past three years. Early detection of conditions like hypertension, diabetes, and anaemia has prevented serious complications for thousands. Your donation helps deploy medical teams, procure diagnostic equipment, purchase medicines, and reach the most medically underserved communities across India.",
        image: medicalCamp,
        cta: "Help Now",
        href: "/services/medical/camp",
        donationTitle: "Fund a Mega Free Health Checkup Camp for rural communities",
      },
      {
        title: "Cancer Treatment Support",
        description: "Financial aid for cancer treatment, including chemotherapy cycles, diagnostics, and essential medicines for patients in need.",
        fullDescription: "Cancer is one of India's most devastating diseases, affecting over 1.4 million new patients every year. For families living below or near the poverty line, a cancer diagnosis is not just a medical crisis — it is a financial catastrophe that can wipe out years of savings, force families to sell land and livestock, and still leave the patient without adequate treatment. Our Cancer Treatment Support program provides financial assistance to low-income cancer patients to cover costs that are not covered by government schemes or insurance. We fund chemotherapy cycles, radiation therapy sessions, diagnostic scans including CT, PET, and MRI, biopsy procedures, essential medicines, and hospital admission charges at partner hospitals and cancer institutes. Each case is reviewed by a medical social worker who assesses eligibility, coordinates with the treating oncologist, and arranges timely disbursement of funds directly to hospitals. We also provide nutritional support and counseling for patients and their caregivers. Our program has supported hundreds of patients each year, helping them complete treatment courses that would otherwise be abandoned mid-way due to lack of funds. Early completion of full treatment protocols significantly improves survival rates. Your donation makes the difference between a patient giving up on treatment and a patient completing their journey toward recovery.",
        image: medicalCancer,
        cta: "Help Now",
        href: "/services/medical/cancer",
        donationTitle: "Support Life-Saving Cancer Treatments & Care",
      },
      {
        title: "Kidney Dialysis Support",
        description: "Helping low-income patients afford recurring dialysis sessions and related treatment costs for long-term kidney care.",
        fullDescription: "Chronic kidney disease affects millions of Indians, and for those with end-stage renal failure, dialysis is not optional — it is a life-sustaining procedure required two to three times per week without interruption. Each dialysis session costs between five hundred and fifteen hundred rupees in government facilities, and more in private centres. For poor patients, the cumulative cost of three sessions per week becomes impossible to sustain. Missing sessions leads to dangerous toxin buildup that can be fatal within days. Our Kidney Dialysis Support program subsidizes or fully covers the cost of dialysis sessions for low-income patients who cannot afford treatment independently. We have empanelled dialysis centres in multiple cities where patients receive sessions at zero or minimal cost through our support. Each patient is registered with our programme after verification of income and medical status by a social worker and nephrologist. In addition to financial support, we help patients access government schemes like PMJAY, transportation reimbursement, and dietary counseling — because dialysis patients need strict dietary management that is also costly. Our program currently supports over two hundred active patients. Your donation funds dialysis sessions, consumables used during procedures, patient transport, and nutritional support — everything needed for a kidney patient to survive and maintain quality of life.",
        image: medicalKidney,
        cta: "Help Now",
        href: "/services/medical/kidney",
        donationTitle: "Support Life-Saving Kidney Dialysis & Care",
      },
      {
        title: "Blood Donation Camps",
        description: "Organizing voluntary blood donation events to address India's critical blood shortage and save lives.",
        fullDescription: "India faces a massive shortage of safe blood every year, with demand exceeding supply by over three million units. This shortage costs thousands of lives — patients needing surgery, cancer treatment, dialysis, accident victims, and mothers during childbirth all depend on readily available blood. Voluntary, regular blood donation is the only safe and sustainable solution. Our Blood Donation Camps program organizes large-scale voluntary blood donation drives in colleges, corporate offices, community halls, temples, mosques, and public spaces. Each camp is conducted in partnership with licensed blood banks and hospitals, ensuring that donated blood is screened, stored safely, and distributed to patients who need it most. Trained medical staff conduct pre-donation health checks, collect blood using sterile equipment, and provide post-donation refreshments and certificates to donors. We conduct extensive awareness campaigns to dispel myths about blood donation — that it weakens the body, affects health, or is unsafe — replacing fear with facts and pride. Youth groups, college students, and corporate volunteers are our biggest donors, and we work hard to engage them as regular year-round donors rather than one-time participants. Our camps have collected over fifty thousand units of blood in the past five years. Your donation funds camp logistics, medical supplies, awareness materials, refreshments for donors, and the administrative work that connects voluntary donors with patients who desperately need this gift of life.",
        image: "https://images.pexels.com/photos/6823601/pexels-photo-6823601.jpeg?auto=compress&cs=tinysrgb&w=800",
        cta: "Help Now",
        href: null,
        donationTitle: "Support Community Blood Donation Camps",
      },
    ],
  },
  {
    id: "infrastructure-development",
    label: "Infrastructure",
    icon: FaBuilding,
    programs: [
      {
        title: "Road Construction",
        description: "Build and upgrade roads, pathways, and connectivity for rural communities.",
        fullDescription: "Rural road connectivity is foundational to economic development, healthcare access, and educational opportunity. Yet thousands of villages in India remain cut off from the nearest town or highway due to lack of proper roads — especially during monsoon season when unpaved paths become impassable. Farmers cannot take their produce to market, children cannot reach schools, and patients cannot access hospitals in emergencies. Our Road Construction program identifies villages where road connectivity is most critical and partners with panchayats, district authorities, and construction companies to build or upgrade roads using durable materials appropriate to local terrain. Projects include dirt-to-paved road conversions, culvert and bridge construction over seasonal streams, road widening for two-way vehicle traffic, streetlight installation for safety, and drainage systems to prevent waterlogging. Each project is managed by trained civil engineers with community involvement at every stage — from route planning to final inspection. We prioritize projects that serve multiple villages, schools, primary health centres, or weekly markets to maximize impact. Completed roads have transformed communities by enabling regular transport services, reducing emergency response times, improving school attendance, and allowing farmers to access better market prices. Your donation funds materials, labour, engineering supervision, and the community engagement work that ensures roads are built where they matter most.",
        image: road,
        cta: "Help Now",
        href: "/services/infrastructure/road-construction",
        donationTitle: "Support Rural Road Construction for Community Connectivity",
      },
    ],
  },
];

const ALL_CAUSES_ID = "all-causes";
const FEATURED_CHILD_CAUSE_ID = "women-empowerment";

const CATEGORY_OPTIONS = [
  { id: ALL_CAUSES_ID, icon: FaThLarge },
  ...SERVICE_DATA.map((service) => ({
    id: service.id,
    icon: service.icon,
  })),
];

function CardCarousel({ images, alt }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 2800);
    return () => clearInterval(t);
  }, [images.length]);
  return (
    <>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={alt}
          className={`carousel-slide${i === idx ? " active" : ""}`}
          loading="lazy"
        />
      ))}
      <div className="carousel-dots">
        {images.map((_, i) => (
          <span
            key={i}
            className={`carousel-dot${i === idx ? " active" : ""}`}
            onClick={(e) => { e.stopPropagation(); setIdx(i); }}
          />
        ))}
      </div>
    </>
  );
}

function ServicePage() {
  const navigate = useNavigate();
  const [activeServiceId, setActiveServiceId] = useState(SERVICE_DATA[0].id);
  const [query, setQuery] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileQuickCauseId, setMobileQuickCauseId] = useState(FEATURED_CHILD_CAUSE_ID);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const categoryScrollerRef = useRef(null);
  const categoryItemRefs = useRef({});

  const getCatLabel = (serviceId) => {
    const labelMap = {
      [ALL_CAUSES_ID]: "All Causes",
      "orphan": "Orphan",
      "elder": "Elderly",
      "community-safety": "Community Safety",
      "social-welfare": "Social Welfare",
      "medical-support": "Medical Support",
      "infrastructure-development": "Infrastructure",
      "women-empowerment": "Women",
    };
    return labelMap[serviceId] || serviceId;
  };

  const selectedService = useMemo(
    () => SERVICE_DATA.find((service) => service.id === activeServiceId) || null,
    [activeServiceId]
  );

  const allPrograms = useMemo(
    () =>
      SERVICE_DATA.flatMap((service) =>
        service.programs.map((program) => ({
          ...program,
          serviceId: service.id,
        }))
      ),
    []
  );

  const sourcePrograms = useMemo(() => {
    if (activeServiceId === ALL_CAUSES_ID) return allPrograms;
    if (!selectedService) return [];
    return selectedService.programs.map((program) => ({
      ...program,
      serviceId: selectedService.id,
    }));
  }, [activeServiceId, allPrograms, selectedService]);

  const visiblePrograms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return sourcePrograms;
    return sourcePrograms.filter((program) => {
      return (
        program.title.toLowerCase().includes(normalizedQuery) ||
        program.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, sourcePrograms]);

  const centerActiveCategory = (serviceId) => {
    const container = categoryScrollerRef.current;
    const categoryItem = categoryItemRefs.current[serviceId];
    if (!container || !categoryItem) return;
    const idealLeft = categoryItem.offsetLeft - (container.clientWidth - categoryItem.clientWidth) / 2;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    container.scrollTo({ left: Math.max(0, Math.min(idealLeft, maxScrollLeft)), behavior: "smooth" });
  };

  useEffect(() => {
    centerActiveCategory(activeServiceId);
  }, [activeServiceId]);

  useEffect(() => {
    if (!selectedProgram) return;
    const handleKey = (e) => { if (e.key === "Escape") setSelectedProgram(null); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedProgram]);

  const mobileQuickCause = useMemo(() => {
    return (
      CATEGORY_OPTIONS.find((cause) => cause.id === mobileQuickCauseId) ||
      CATEGORY_OPTIONS.find((cause) => cause.id === FEATURED_CHILD_CAUSE_ID) ||
      CATEGORY_OPTIONS[1]
    );
  }, [mobileQuickCauseId]);

  const handleServiceChange = (serviceId) => {
    setActiveServiceId(serviceId);
    if (serviceId !== ALL_CAUSES_ID) setMobileQuickCauseId(serviceId);
    setMobileFilterOpen(false);
  };

  const moveActiveService = (direction) => {
    const currentIndex = CATEGORY_OPTIONS.findIndex((service) => service.id === activeServiceId);
    if (currentIndex < 0) return;
    const nextIndex = Math.max(0, Math.min(currentIndex + direction, CATEGORY_OPTIONS.length - 1));
    const nextCauseId = CATEGORY_OPTIONS[nextIndex].id;
    setActiveServiceId(nextCauseId);
    if (nextCauseId !== ALL_CAUSES_ID) setMobileQuickCauseId(nextCauseId);
    setMobileFilterOpen(false);
  };

  return (
    <section className="service-page">
<div className="service-layout">
        <div className="service-topbar">
          <div className="title-block">
            <h1>Explore Causes</h1>
            <span className="title-rule" />
          </div>
          <div className="topbar-controls">
            <label className="search-control" htmlFor="service-search">
              <FaSearch aria-hidden="true" />
              <input
                id="service-search"
                type="text"
                placeholder="Search for a cause"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="category-strip desktop-category-strip">
          <button type="button" className="scroll-btn" aria-label="Scroll left" onClick={() => moveActiveService(-1)}>
            <FaChevronLeft />
          </button>
          <div className="category-list" ref={categoryScrollerRef}>
            {CATEGORY_OPTIONS.map((service) => {
              const ServiceIcon = service.icon;
              const isActive = service.id === activeServiceId;
              return (
                <button
                  key={service.id}
                  ref={(node) => { categoryItemRefs.current[service.id] = node; }}
                  type="button"
                  className={`category-item ${isActive ? "is-active" : ""}`}
                  onClick={() => handleServiceChange(service.id)}
                  aria-pressed={isActive}
                >
                  <ServiceIcon className="category-icon" aria-hidden="true" />
                  <span>{getCatLabel(service.id)}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="scroll-btn" aria-label="Scroll right" onClick={() => moveActiveService(1)}>
            <FaChevronRight />
          </button>
        </div>

        <div className="programs-head">
          <h2>DONATE ONE-TIME</h2>
          <span className="title-rule" />
        </div>

        <p className="programs-context">
          Showing programs under{" "}
          <strong>{getCatLabel(activeServiceId)}</strong>
        </p>

        <div className="program-grid">
          {visiblePrograms.length > 0 ? (
            visiblePrograms.map((program) => (
              <article
                key={`${program.serviceId}-${program.title}`}
                className="program-card"
                style={{ cursor: "pointer" }}
                onClick={() => program.href ? navigate(program.href) : setSelectedProgram(program)}
              >
                <div className="program-media-link" aria-label={`Read more about ${program.title}`}>
                  <div className="program-media">
                    {program.images ? (
                      <CardCarousel images={program.images} alt={program.title} />
                    ) : (
                      <img src={program.image} alt={program.title} loading="lazy" />
                    )}
                    <div className="program-readmore" aria-hidden="true">
                      <span>Read More</span>
                      <span className="program-readmore-dots">...</span>
                    </div>
                  </div>
                </div>
                <div className="program-body">
                  {activeServiceId === ALL_CAUSES_ID && (
                    <span className="program-service-tag">{getCatLabel(program.serviceId)}</span>
                  )}
                  <h3>{program.title}</h3>
                  <p>{program.description}</p>
                  <button
                    className="program-donate-btn"
                    aria-label={`Donate now for ${program.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/donate", {
                        state: {
                          serviceImage: program.image,
                          serviceTitle: program.donationTitle,
                        },
                      });
                    }}
                  >
                    Help Now
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h3>No programs found</h3>
              <p>Try another search term or switch to a different category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div
          className="program-modal-overlay"
          onClick={() => setSelectedProgram(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedProgram.title}
        >
          <div
            className="program-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="program-modal-close"
              onClick={() => setSelectedProgram(null)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <div className="program-modal-img">
              <img src={selectedProgram.image} alt={selectedProgram.title} />
            </div>
            <div className="program-modal-body">
              <h2>{selectedProgram.title}</h2>
              <p className="program-modal-about-label">About This Program</p>
              <p className="program-modal-desc">
                {selectedProgram.fullDescription || selectedProgram.description}
              </p>
              <div className="program-modal-actions">
                <button
                  type="button"
                  className="program-modal-btn secondary"
                  onClick={() => setSelectedProgram(null)}
                >
                  Learn More
                </button>
                <button
                  type="button"
                  className="program-modal-btn primary"
                  onClick={() => {
                    setSelectedProgram(null);
                    navigate("/donate", {
                      state: {
                        serviceImage: selectedProgram.image,
                        serviceTitle: selectedProgram.donationTitle,
                      },
                    });
                  }}
                >
                  Help Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`mobile-cause-backdrop ${mobileFilterOpen ? "open" : ""}`}
        onClick={() => setMobileFilterOpen(false)}
        aria-label="Close filter panel"
      />

      <div className={`mobile-cause-panel ${mobileFilterOpen ? "open" : ""}`}>
        <div className="mobile-cause-panel-head">
          <span className="line" />
          <h3>Filter by Cause</h3>
          <span className="line" />
        </div>
        <div className="mobile-cause-grid">
          {CATEGORY_OPTIONS.map((cause) => {
            const CauseIcon = cause.icon;
            const isActive = cause.id === activeServiceId;
            return (
              <button
                key={cause.id}
                type="button"
                className={`mobile-cause-item ${isActive ? "is-active" : ""}`}
                onClick={() => handleServiceChange(cause.id)}
              >
                <CauseIcon className="category-icon" aria-hidden="true" />
                <span>{getCatLabel(cause.id)}</span>
              </button>
            );
          })}
        </div>
        <button type="button" className="mobile-show-less" onClick={() => setMobileFilterOpen(false)}>
          <FaChevronUp aria-hidden="true" />
          <span>Show Less</span>
        </button>
      </div>

      <div className="mobile-cause-footer">
        <div className="mobile-cause-footer-title">
          <span className="line" />
          <h3>Filter by Cause</h3>
          <span className="line" />
        </div>
        <div className="mobile-cause-footer-actions">
          <button
            type="button"
            className={`mobile-quick-cause ${activeServiceId === ALL_CAUSES_ID ? "is-active" : ""}`}
            onClick={() => handleServiceChange(ALL_CAUSES_ID)}
          >
            <FaThLarge className="quick-icon" aria-hidden="true" />
            <span>{getCatLabel(ALL_CAUSES_ID)}</span>
          </button>
          <button
            type="button"
            className={`mobile-quick-cause ${activeServiceId !== ALL_CAUSES_ID && activeServiceId === mobileQuickCause?.id ? "is-active" : ""}`}
            onClick={() => handleServiceChange(mobileQuickCause?.id || FEATURED_CHILD_CAUSE_ID)}
          >
            {mobileQuickCause && <mobileQuickCause.icon className="quick-icon" aria-hidden="true" />}
            <span>{getCatLabel(mobileQuickCause?.id || FEATURED_CHILD_CAUSE_ID)}</span>
          </button>
          <button type="button" className="mobile-quick-cause more" onClick={() => setMobileFilterOpen(true)}>
            <span className="more-dots">...</span>
            <span>More</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default ServicePage;
