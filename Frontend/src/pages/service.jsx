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
import "./service.css";

const SERVICE_DATA = [
  {
    id: "women-empowerment",
    label: "Women",
    labelHi: "महिला",
    labelBn: "মহিলা",
    labelPa: "ਔਰਤਾਂ",
    icon: FaFemale,
    programs: [
      {
        title: "Hope for Widowed Women",
        titleHi: "विधवा महिलाओं के लिए आशा",
        titleBn: "বিধবা নারীদের জন্য আশা",
        titlePa: "ਵਿਧਵਾ ਔਰਤਾਂ ਲਈ ਆਸ਼ਾ",
        description: "We provide regular financial support to widowed women to help them meet their daily needs.",
        descriptionHi: "हम विधवा महिलाओं को उनकी दैनिक जरूरतों को पूरा करने में मदद के लिए नियमित वित्तीय सहायता प्रदान करते हैं।",
        descriptionBn: "আমরা বিধবা নারীদের দৈনন্দিন চাহিদা পূরণে সহায়তা করতে নিয়মিত আর্থিক সহায়তা প্রদান করি।",
        descriptionPa: "ਅਸੀਂ ਵਿਧਵਾ ਔਰਤਾਂ ਨੂੰ ਉਨ੍ਹਾਂ ਦੀਆਂ ਰੋਜ਼ਾਨਾ ਲੋੜਾਂ ਪੂਰੀਆਂ ਕਰਨ ਵਿੱਚ ਮਦਦ ਲਈ ਨਿਯਮਿਤ ਵਿੱਤੀ ਸਹਾਇਤਾ ਪ੍ਰਦਾਨ ਕਰਦੇ ਹਾਂ।",
        fullDescription: "Widowhood is one of the most vulnerable conditions a woman can face in India. Without spousal support, many widowed women struggle to meet basic needs like food, shelter, healthcare, and children's education. Our Hope for Widowed Women program provides monthly financial assistance directly to women who have lost their husbands and have no other source of income. We conduct home visits to assess each family's situation and ensure the funds reach those who truly need them. Beyond financial support, we connect widows with legal aid for property rights, help them access government welfare schemes they are entitled to, and offer emotional counseling through trained volunteers. Our network of partner NGOs and community leaders helps us reach widows in rural and semi-urban areas who often fall through the cracks of the formal welfare system. We believe every woman deserves to live with dignity, regardless of her marital status. Your donation directly funds the monthly stipends and support services that help these women rebuild their lives, regain confidence, and provide a better future for their children.",
        fullDescriptionHi: "भारत में विधवापन एक महिला की सबसे कमजोर स्थितियों में से एक है। पति की सहायता के बिना, कई विधवा महिलाएं भोजन, आश्रय, स्वास्थ्य देखभाल और बच्चों की शिक्षा जैसी बुनियादी जरूरतों को पूरा करने के लिए संघर्ष करती हैं। हमारा यह कार्यक्रम उन महिलाओं को मासिक वित्तीय सहायता प्रदान करता है जिन्होंने अपने पतियों को खो दिया है। हम घर का दौरा करके प्रत्येक परिवार की स्थिति का आकलन करते हैं और यह सुनिश्चित करते हैं कि धन उन लोगों तक पहुंचे जिन्हें वास्तव में इसकी आवश्यकता है।",
        image: widow,
        cta: "Help Now",
        href: "/services/women/widow-women",
        donationTitle: "Empower Widow Women with Financial and Social Support",
      },
      {
        title: "Women Skill Development",
        titleHi: "महिला कौशल विकास",
        titleBn: "নারী দক্ষতা উন্নয়ন",
        titlePa: "ਔਰਤਾਂ ਦੀ ਕੁਸ਼ਲਤਾ ਵਿਕਾਸ",
        description: "Vocational training in tailoring, handicrafts, and digital skills to make women financially independent.",
        descriptionHi: "महिलाओं को आर्थिक रूप से स्वतंत्र बनाने के लिए सिलाई, हस्तशिल्प और डिजिटल कौशल में व्यावसायिक प्रशिक्षण।",
        descriptionBn: "নারীদের আর্থিকভাবে স্বাবলম্বী করতে সেলাই, হস্তশিল্প ও ডিজিটাল দক্ষতায় বৃত্তিমূলক প্রশিক্ষণ।",
        descriptionPa: "ਔਰਤਾਂ ਨੂੰ ਆਰਥਿਕ ਤੌਰ 'ਤੇ ਸੁਤੰਤਰ ਬਣਾਉਣ ਲਈ ਸਿਲਾਈ, ਦਸਤਕਾਰੀ ਅਤੇ ਡਿਜੀਟਲ ਹੁਨਰਾਂ ਵਿੱਚ ਵੋਕੇਸ਼ਨਲ ਸਿਖਲਾਈ।",
        fullDescription: "Economic independence is the foundation of women's empowerment. Our Women Skill Development program offers free vocational training to women from low-income and marginalized households. Courses include tailoring and garment making, embroidery and handicrafts, basic computer literacy, digital payment systems, and small business management. Each batch runs for three to six months with certified trainers. We provide all materials free of cost to trainees. After completion, participants receive certificates recognized by local industries and government skill boards. Our placement cell actively connects graduates with employment opportunities, self-help groups, and microfinance schemes so they can start their own businesses. We have trained over five thousand women across six states in the past three years. Many of our graduates now run their own small enterprises, employ other women, and have become role models in their communities. The program also includes soft skills training such as communication, financial literacy, and confidence building. Your support enables us to expand this program to more districts, purchase training equipment, and provide stipends to women who travel long distances to attend sessions.",
        fullDescriptionHi: "आर्थिक स्वतंत्रता महिला सशक्तिकरण की नींव है। हमारा महिला कौशल विकास कार्यक्रम कम आय और हाशिए पर रहने वाले परिवारों की महिलाओं को मुफ्त व्यावसायिक प्रशिक्षण प्रदान करता है। पाठ्यक्रमों में सिलाई, कढ़ाई, बुनियादी कंप्यूटर साक्षरता, डिजिटल भुगतान प्रणाली और छोटे व्यवसाय प्रबंधन शामिल हैं। प्रत्येक बैच तीन से छह महीने तक चलता है। स्नातकों को स्थानीय उद्योगों और सरकारी कौशल बोर्डों द्वारा मान्यता प्राप्त प्रमाण पत्र मिलते हैं।",
        image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
        cta: "Help Now",
        href: null,
        donationTitle: "Fund Vocational Training for Women's Economic Independence",
      },
      {
        title: "Self-Help Group (SHG) Support",
        titleHi: "स्वयं सहायता समूह (SHG) सहायता",
        titleBn: "স্বনির্ভর গোষ্ঠী (SHG) সহায়তা",
        titlePa: "ਸਵੈ-ਸਹਾਇਤਾ ਸਮੂਹ (SHG) ਸਹਾਇਤਾ",
        description: "Forming and nurturing women's self-help groups to enable collective savings, micro-loans, and community support.",
        descriptionHi: "सामूहिक बचत, माइक्रो-ऋण और सामुदायिक सहायता को सक्षम करने के लिए महिला स्वयं सहायता समूहों का गठन।",
        descriptionBn: "সমষ্টিগত সঞ্চয়, ক্ষুদ্রঋণ ও সামুদায়িক সহায়তার জন্য নারী স্বনির্ভর গোষ্ঠী গঠন ও পালন।",
        descriptionPa: "ਸਮੂਹਿਕ ਬੱਚਤ, ਮਾਈਕ੍ਰੋ-ਲੋਨ ਅਤੇ ਭਾਈਚਾਰਕ ਸਹਾਇਤਾ ਲਈ ਔਰਤਾਂ ਦੇ ਸਵੈ-ਸਹਾਇਤਾ ਸਮੂਹਾਂ ਦਾ ਗਠਨ।",
        fullDescription: "Self-Help Groups (SHGs) are one of the most powerful grassroots models for women's financial and social empowerment. Our SHG Support program helps form, register, and nurture women's groups of ten to twenty members in rural and semi-urban areas. Each group is trained in collective savings, internal lending, bookkeeping, and democratic decision-making. We connect established SHGs with microfinance institutions and government schemes like NRLM to access larger loans for income-generating activities. Our field coordinators make regular visits to mentor group leaders and resolve conflicts. We have supported the formation of over eight hundred SHGs, benefiting more than twelve thousand women. Beyond financial tools, SHGs become safe spaces where women discuss health, education, domestic issues, and community development together. Many SHG federations formed through our program have taken up local issues like sanitation, child marriage prevention, and public health campaigns. Your donation funds the training materials, field visits, registration costs, and seed capital that help new SHGs get started on the right foot and grow into lasting institutions that sustain themselves for years.",
        fullDescriptionHi: "स्वयं सहायता समूह (SHG) महिलाओं के वित्तीय और सामाजिक सशक्तिकरण के लिए सबसे शक्तिशाली जमीनी स्तर के मॉडलों में से एक हैं। हमारा SHG सहायता कार्यक्रम ग्रामीण और अर्ध-शहरी क्षेत्रों में महिलाओं के समूह बनाने, पंजीकृत करने और पोषित करने में मदद करता है। प्रत्येक समूह को सामूहिक बचत, आंतरिक ऋण और लोकतांत्रिक निर्णय लेने में प्रशिक्षित किया जाता है।",
        image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800",
        cta: "Help Now",
        href: null,
        donationTitle: "Empower Women Through Self-Help Groups",
      },
      {
        title: "Women's Health Camps",
        titleHi: "महिला स्वास्थ्य शिविर",
        titleBn: "নারী স্বাস্থ্য শিবির",
        titlePa: "ਔਰਤਾਂ ਦੇ ਸਿਹਤ ਕੈਂਪ",
        description: "Free health camps for women covering gynaecology, anaemia screening, and maternal health awareness.",
        descriptionHi: "स्त्री रोग, एनीमिया जाँच और मातृ स्वास्थ्य जागरूकता को कवर करने वाले महिलाओं के लिए मुफ्त स्वास्थ्य शिविर।",
        descriptionBn: "স্ত্রীরোগ, রক্তাল্পতা পরীক্ষা ও মাতৃস্বাস্থ্য সচেতনতা কভার করে নারীদের জন্য বিনামূল্যে স্বাস্থ্য শিবির।",
        descriptionPa: "ਗਾਇਨੀਕੋਲੋਜੀ, ਅਨੀਮੀਆ ਜਾਂਚ ਅਤੇ ਮਾਤਾ ਸਿਹਤ ਜਾਗਰੂਕਤਾ ਲਈ ਔਰਤਾਂ ਦੇ ਮੁਫ਼ਤ ਸਿਹਤ ਕੈਂਪ।",
        fullDescription: "Women's healthcare in rural India remains critically underserved. Millions of women suffer from preventable conditions such as anaemia, reproductive health issues, malnutrition, and complications during pregnancy — all because they lack access to regular medical care. Our Women's Health Camps program organizes dedicated health camps specifically designed for women and girls. Each camp provides free gynaecological consultations, anaemia screening with iron supplementation, breast and cervical cancer awareness and early detection, prenatal and postnatal guidance for mothers, nutritional counseling, and distribution of sanitary hygiene products. We deploy teams of female doctors, nurses, and ASHA workers to ensure women feel comfortable discussing sensitive health matters. Camps are held in schools, community halls, and panchayat grounds to maximize reach. We maintain follow-up records and refer serious cases to partner hospitals where treatment is arranged at subsidized costs. Over the past two years we have screened more than twenty thousand women and provided free medicines to over eight thousand patients. Your contribution helps us organize more camps, pay medical professionals, procure medicines and diagnostic equipment, and reach women in the most remote corners of India.",
        fullDescriptionHi: "ग्रामीण भारत में महिलाओं की स्वास्थ्य सेवा गंभीर रूप से कमजोर बनी हुई है। लाखों महिलाएं एनीमिया, प्रजनन स्वास्थ्य समस्याओं और गर्भावस्था के दौरान जटिलताओं जैसी रोकथाम योग्य स्थितियों से पीड़ित हैं। हमारा महिला स्वास्थ्य शिविर कार्यक्रम महिलाओं और लड़कियों के लिए समर्पित स्वास्थ्य शिविर आयोजित करता है जो मुफ्त स्त्री रोग परामर्श, एनीमिया जाँच, प्रसव पूर्व मार्गदर्शन और स्वच्छता उत्पाद वितरण प्रदान करता है।",
        image: "https://images.pexels.com/photos/5765827/pexels-photo-5765827.jpeg?auto=compress&cs=tinysrgb&w=800",
        cta: "Help Now",
        href: null,
        donationTitle: "Fund Free Women's Health Camps Across Rural India",
      },
      {
        title: "Legal Aid for Women",
        titleHi: "महिलाओं के लिए कानूनी सहायता",
        titleBn: "নারীদের জন্য আইনি সহায়তা",
        titlePa: "ਔਰਤਾਂ ਲਈ ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ",
        description: "Free legal counseling and court support for women facing domestic violence, property disputes, and harassment.",
        descriptionHi: "घरेलू हिंसा, संपत्ति विवाद और उत्पीड़न का सामना करने वाली महिलाओं के लिए मुफ्त कानूनी परामर्श और न्यायालय सहायता।",
        descriptionBn: "গৃহস্থালী সহিংসতা, সম্পত্তি বিরোধ ও হয়রানির শিকার নারীদের জন্য বিনামূল্যে আইনি পরামর্শ ও আদালত সহায়তা।",
        descriptionPa: "ਘਰੇਲੂ ਹਿੰਸਾ, ਸੰਪਤੀ ਵਿਵਾਦ ਅਤੇ ਪਰੇਸ਼ਾਨੀ ਦਾ ਸਾਹਮਣਾ ਕਰ ਰਹੀਆਂ ਔਰਤਾਂ ਲਈ ਮੁਫ਼ਤ ਕਾਨੂੰਨੀ ਸਲਾਹ ਅਤੇ ਅਦਾਲਤੀ ਸਹਾਇਤਾ।",
        fullDescription: "Many women in India are unaware of their legal rights or cannot afford legal representation when they face domestic violence, property disputes, divorce, workplace harassment, or exploitation. Our Legal Aid for Women program bridges this critical gap by providing free legal counseling through a panel of experienced lawyers and paralegals who specialize in women's rights. We operate legal aid helplines and walk-in centers in multiple cities. Services include legal awareness workshops in villages, one-on-one counseling sessions, assistance with filing FIRs and court petitions, representation in family courts and labour tribunals, and support in accessing government schemes for women in distress. We also work closely with women's shelters and police helpdesks to provide holistic support. Each year our team handles hundreds of cases and conducts awareness workshops reaching thousands of women. Our lawyers have successfully helped women recover property rights, secure divorce settlements, obtain restraining orders against abusers, and win workplace discrimination cases. Your donation pays for lawyer fees, court filing costs, travel expenses for rural outreach, and operation of our legal aid helpline so that justice is accessible to every woman regardless of her financial situation.",
        fullDescriptionHi: "भारत में कई महिलाएं अपने कानूनी अधिकारों से अनजान हैं या घरेलू हिंसा, संपत्ति विवाद और उत्पीड़न का सामना करने पर कानूनी प्रतिनिधित्व का खर्च नहीं उठा सकतीं। हमारा महिला कानूनी सहायता कार्यक्रम अनुभवी वकीलों और पैरालीगल के माध्यम से मुफ्त कानूनी परामर्श प्रदान करके इस महत्वपूर्ण अंतर को पाटता है। हम एफआईआर दर्ज करने, अदालती याचिकाओं और पारिवारिक न्यायालयों में प्रतिनिधित्व में सहायता करते हैं।",
        image: "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800",
        cta: "Help Now",
        href: null,
        donationTitle: "Provide Free Legal Aid to Women in Need",
      },
    ],
  },
  {
    id: "orphan",
    label: "Orphan",
    labelHi: "अनाथ",
    labelBn: "এতিম",
    labelPa: "ਅਨਾਥ",
    icon: FaChildren,
    programs: [
      {
        title: "Education Support",
        titleHi: "शिक्षा सहायता",
        titleBn: "শিক্ষা সহায়তা",
        titlePa: "ਸਿੱਖਿਆ ਸਹਾਇਤਾ",
        description: "School enrollment, books, and learning support for every child.",
        descriptionHi: "हर बच्चे के लिए स्कूल नामांकन, किताबें और सीखने का समर्थन।",
        descriptionBn: "প্রতিটি শিশুর জন্য স্কুলে ভর্তি, বই এবং শেখার সহায়তা।",
        descriptionPa: "ਹਰ ਬੱਚੇ ਲਈ ਸਕੂਲ ਦਾਖਲਾ, ਕਿਤਾਬਾਂ ਅਤੇ ਸਿੱਖਣ ਦੀ ਸਹਾਇਤਾ।",
        fullDescription: "Education is the most powerful tool to break the cycle of poverty for orphaned children. Our Education Support program ensures that every child in our partner orphanages is enrolled in school and receives the academic support needed to succeed. We cover school fees, uniforms, stationery, textbooks, and examination fees. Beyond enrollment, we provide after-school tutoring by trained educators, access to digital learning resources, and mentoring by college student volunteers. For older children, we offer career counseling and scholarship guidance to help them pursue higher education or vocational training. We also organize special learning camps during vacations to address learning gaps and build confidence in subjects where children struggle. Our program currently supports over two thousand children across thirty partner orphanages in eight states. We track each child's academic progress through quarterly reports and intervene quickly when a child begins to fall behind. Many of our alumni have gone on to complete college degrees, join the armed forces, become teachers, and pursue other meaningful careers — returning to their communities as role models. Your donation directly funds school fees, learning materials, tutor salaries, and the digital resources that give orphaned children the same educational opportunities as their peers.",
        fullDescriptionHi: "शिक्षा अनाथ बच्चों के लिए गरीबी के चक्र को तोड़ने का सबसे शक्तिशाली साधन है। हमारा शिक्षा सहायता कार्यक्रम यह सुनिश्चित करता है कि हमारे सहयोगी अनाथालयों के हर बच्चे को स्कूल में नामांकित किया जाए। हम स्कूल फीस, वर्दी, स्टेशनरी, पाठ्यपुस्तकें और परीक्षा शुल्क को कवर करते हैं। स्कूल के बाद के ट्यूशन, डिजिटल शिक्षण संसाधन और कॉलेज स्वयंसेवकों द्वारा मेंटरिंग भी प्रदान की जाती है।",
        image: orphanEducation,
        images: [eduImg1, eduImg2, eduImg3, eduImg4, eduImg5],
        cta: "Help Now",
        href: "/services/orphanage/education",
        donationTitle: "Help provide education support for children in orphanage care",
      },
      {
        title: "Nutritious Meal Program",
        titleHi: "पौष्टिक भोजन कार्यक्रम",
        titleBn: "পুষ্টিকর খাদ্য কর্মসূচি",
        titlePa: "ਪੌਸ਼ਟਿਕ ਭੋਜਨ ਪ੍ਰੋਗਰਾਮ",
        description: "Daily nutritious meals to help children grow healthy and strong.",
        descriptionHi: "बच्चों को स्वस्थ और मजबूत बनाने के लिए दैनिक पौष्टिक भोजन।",
        descriptionBn: "শিশুদের সুস্থ ও শক্তিশালী করে গড়ে তুলতে প্রতিদিনের পুষ্টিকর খাবার।",
        descriptionPa: "ਬੱਚਿਆਂ ਨੂੰ ਸਿਹਤਮੰਦ ਅਤੇ ਮਜ਼ਬੂਤ ਬਣਾਉਣ ਲਈ ਰੋਜ਼ਾਨਾ ਪੌਸ਼ਟਿਕ ਭੋਜਨ।",
        fullDescription: "Proper nutrition during childhood is critical for physical and cognitive development. Many orphaned children suffer from malnutrition, stunting, and micronutrient deficiencies that have long-lasting effects on their health and learning ability. Our Nutritious Meal Program ensures that children in partner orphanages receive three balanced meals every day, formulated by nutritionists to meet the specific dietary needs of growing children. The meal plan includes proteins, vitamins, minerals, and adequate calories across breakfast, lunch, and dinner. We also provide vitamin supplements and conduct regular growth monitoring to track each child's health progress. Trained cooks prepare meals using locally sourced, fresh ingredients, supporting local farmers and ensuring food quality. Special meals are provided during festivals and birthdays to give children a sense of celebration and belonging. We also run nutrition education sessions so older children understand the importance of healthy eating habits. Seasonal menus are adjusted based on availability and doctor recommendations. Our program has shown measurable improvements in weight-for-age and height-for-age indicators among children enrolled for over six months. Your donation funds ingredients, kitchen equipment, and nutritionist consultations that keep these children healthy, focused in school, and full of energy to dream big.",
        fullDescriptionHi: "बचपन में उचित पोषण शारीरिक और संज्ञानात्मक विकास के लिए महत्वपूर्ण है। हमारा पौष्टिक भोजन कार्यक्रम यह सुनिश्चित करता है कि सहयोगी अनाथालयों के बच्चों को हर दिन तीन संतुलित भोजन मिले, जो बच्चों की विशिष्ट आहार आवश्यकताओं को पूरा करने के लिए पोषण विशेषज्ञों द्वारा तैयार किया गया है।",
        image: orphanFood,
        images: [mealImg4, mealImg1, mealImg3, mealImg5, mealImg2],
        cta: "Help Now",
        href: "/services/orphanage/meal",
        donationTitle: "Provide high-quality nutritious meals for orphans",
      },
      {
        title: "Health & Medical Care",
        titleHi: "स्वास्थ्य और चिकित्सा देखभाल",
        titleBn: "স্বাস্থ্য ও চিকিৎসা সেবা",
        titlePa: "ਸਿਹਤ ਅਤੇ ਡਾਕਟਰੀ ਦੇਖਭਾਲ",
        description: "Regular checkups, medicines, and timely healthcare for children.",
        descriptionHi: "बच्चों के लिए नियमित जाँच, दवाइयाँ और समय पर स्वास्थ्य सेवा।",
        descriptionBn: "শিশুদের জন্য নিয়মিত স্বাস্থ্য পরীক্ষা, ওষুধ এবং সময়মতো স্বাস্থ্যসেবা।",
        descriptionPa: "ਬੱਚਿਆਂ ਲਈ ਨਿਯਮਿਤ ਜਾਂਚ, ਦਵਾਈਆਂ ਅਤੇ ਸਮੇਂ ਸਿਰ ਸਿਹਤ ਸੇਵਾ।",
        fullDescription: "Orphaned children are among the most medically vulnerable populations, often arriving at care centers with untreated infections, dental problems, skin conditions, and nutritional deficiencies. Our Health and Medical Care program ensures that every child in our partner orphanages receives comprehensive healthcare. We organize monthly health checkups by qualified pediatricians, dental screenings, eye examinations, and mental health assessments. All prescribed medicines are procured and administered under caregiver supervision. Children requiring specialist treatment are referred to partner hospitals where costs are covered through our fund. We maintain detailed health records for every child and set up vaccination schedules in line with government immunization programs. Our caregiver training includes first aid, recognizing signs of illness, and emergency protocols. Children who have experienced trauma receive counseling and psychological support from trained therapists. Hygiene education is embedded in daily routines to prevent illness at the source. We also run dental hygiene drives and distribute health kits that include toothbrushes, soaps, and personal hygiene items. Your donation directly funds doctor visits, medicines, specialist referrals, and the mental health support that helps these children heal from past trauma and grow up healthy and resilient.",
        fullDescriptionHi: "अनाथ बच्चे सबसे चिकित्सकीय रूप से कमजोर आबादी में से हैं। हमारा स्वास्थ्य और चिकित्सा देखभाल कार्यक्रम यह सुनिश्चित करता है कि सहयोगी अनाथालयों के हर बच्चे को व्यापक स्वास्थ्य सेवा मिले। हम मासिक स्वास्थ्य जाँच, दंत स्क्रीनिंग, आँख की परीक्षा और मानसिक स्वास्थ्य आकलन आयोजित करते हैं।",
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
    labelHi: "बुजुर्ग",
    labelBn: "বয়স্ক",
    labelPa: "ਬਜ਼ੁਰਗ",
    icon: MdElderly,
    programs: [
      {
        title: "Daily Meal Care",
        titleHi: "दैनिक भोजन देखभाल",
        titleBn: "দৈনিক খাদ্য সেবা",
        titlePa: "ਰੋਜ਼ਾਨਾ ਭੋਜਨ ਦੇਖਭਾਲ",
        description: "Nutritious meals and hydration plans for seniors in need.",
        descriptionHi: "जरूरतमंद बुजुर्गों के लिए पौष्टिक भोजन और जलयोजना।",
        descriptionBn: "প্রয়োজনগ্রস্ত বয়স্কদের জন্য পুষ্টিকর খাবার ও পানীয় পরিকল্পনা।",
        descriptionPa: "ਲੋੜਵੰਦ ਬਜ਼ੁਰਗਾਂ ਲਈ ਪੌਸ਼ਟਿਕ ਭੋਜਨ ਅਤੇ ਪਾਣੀ ਦੀ ਯੋਜਨਾ।",
        fullDescription: "Food security for the elderly is a growing crisis in India. Many older citizens — especially those abandoned by families or widowed without financial support — go hungry every day. Age-related conditions like diabetes, hypertension, and reduced mobility mean that seniors need specially prepared nutritious meals that are soft, easy to digest, and medically appropriate. Our Daily Meal Care program delivers freshly cooked, nutrition-balanced meals to elderly individuals living alone or in partner care centers twice a day. Our menus are designed by dietitians with senior nutrition in mind, incorporating seasonal vegetables, proteins, and adequate hydration. Volunteers and field staff build personal relationships with each recipient, checking on their health and wellbeing during each delivery. This regular human contact is itself a powerful intervention against isolation and depression, which are major health risks for the elderly. We also maintain an emergency food bank for times when recipients are unwell and need specific dietary support. Currently we serve over three thousand elderly individuals across our partner cities and districts. Your donation funds meal preparation, delivery logistics, and nutritionist consultations that ensure our elderly beneficiaries receive the nourishment and care they deserve in their final years.",
        fullDescriptionHi: "भारत में बुजुर्गों के लिए खाद्य सुरक्षा एक बढ़ती संकट है। हमारा दैनिक भोजन देखभाल कार्यक्रम अकेले रहने वाले बुजुर्ग व्यक्तियों को दिन में दो बार ताजा पका, पोषण-संतुलित भोजन प्रदान करता है। हमारे मेनू आहार विशेषज्ञों द्वारा बुजुर्ग पोषण को ध्यान में रखते हुए मौसमी सब्जियों, प्रोटीन और पर्याप्त जलयोजन के साथ डिज़ाइन किए गए हैं।",
        image: elderFood,
        cta: "Help Now",
        href: "/services/elder/meal",
        donationTitle: "Provide daily nutritious meals for abandoned elderly",
      },
      {
        title: "Dignified Living Support",
        titleHi: "सम्मानजनक जीवन सहायता",
        titleBn: "মর্যাদাপূর্ণ জীবনযাপন সহায়তা",
        titlePa: "ਸਤਿਕਾਰ ਨਾਲ ਜੀਵਨ ਸਹਾਇਤਾ",
        description: "Comfortable shelter, clean essentials, and respectful care.",
        descriptionHi: "आरामदायक आश्रय, स्वच्छ आवश्यकताएं और सम्मानजनक देखभाल।",
        descriptionBn: "আরামদায়ক আশ্রয়, পরিষ্কার প্রয়োজনীয়তা এবং শ্রদ্ধাশীল সেবা।",
        descriptionPa: "ਆਰਾਮਦਾਇਕ ਆਸਰਾ, ਸਾਫ਼ ਜ਼ਰੂਰਤਾਂ ਅਤੇ ਸਤਿਕਾਰਯੋਗ ਦੇਖਭਾਲ।",
        fullDescription: "Every elderly person deserves to live their final years with dignity, comfort, and respect — not abandoned in squalor or depending on the charity of strangers. Our Dignified Living Support program provides elderly individuals in partner care homes with clean, safe, and comfortable living spaces equipped with age-appropriate furniture, proper lighting, ventilation, and sanitation. We ensure each resident has an adequate supply of personal hygiene items, seasonal clothing, and bedding. Trained caregivers attend to daily personal care needs including bathing, grooming, and mobility assistance for those who are physically challenged. Activities such as yoga, devotional singing, storytelling, and craft sessions are organized to keep residents mentally engaged and emotionally fulfilled. Regular family outreach workers encourage family members to maintain contact with their elderly relatives in care. We also facilitate group celebrations for birthdays, festivals, and Independence Day that create a sense of community and joy. Legal protection officers help residents who have property or pension rights issues. Your donation covers shelter maintenance, caregiver salaries, hygiene supplies, recreational activities, and the day-to-day costs of running dignified care facilities that treat every resident as a valued human being.",
        fullDescriptionHi: "हर बुजुर्ग व्यक्ति गरिमा, आराम और सम्मान के साथ अपने अंतिम वर्ष जीने का हकदार है। हमारा सम्मानजनक जीवन सहायता कार्यक्रम सहयोगी देखभाल घरों में बुजुर्ग व्यक्तियों को स्वच्छ, सुरक्षित और आरामदायक रहने की जगह प्रदान करता है। प्रशिक्षित देखभालकर्ता दैनिक व्यक्तिगत देखभाल आवश्यकताओं में भाग लेते हैं।",
        image: elderLiving,
        cta: "Help Now",
        href: "/services/elder/living",
        donationTitle: "Provide dignified living and shelter for abandoned elderly",
      },
      {
        title: "Medical Assistance",
        titleHi: "चिकित्सा सहायता",
        titleBn: "চিকিৎসা সহায়তা",
        titlePa: "ਡਾਕਟਰੀ ਸਹਾਇਤਾ",
        description: "Doctor visits, medicines, and regular health monitoring.",
        descriptionHi: "डॉक्टर की मुलाकात, दवाइयाँ और नियमित स्वास्थ्य निगरानी।",
        descriptionBn: "ডাক্তারের পরামর্শ, ওষুধ এবং নিয়মিত স্বাস্থ্য পর্যবেক্ষণ।",
        descriptionPa: "ਡਾਕਟਰ ਦੌਰੇ, ਦਵਾਈਆਂ ਅਤੇ ਨਿਯਮਿਤ ਸਿਹਤ ਨਿਗਰਾਨੀ।",
        fullDescription: "Aging comes with a range of health challenges that require consistent, attentive medical care. For elderly individuals without family support or financial means, accessing quality healthcare is nearly impossible. Our Medical Assistance program provides comprehensive medical support to senior citizens in our care network. This includes bi-monthly visits by qualified doctors and general physicians, regular blood pressure, blood sugar, and cholesterol monitoring, and prescription management. We procure medicines at bulk rates and provide them free to elderly beneficiaries. Specialist consultations in cardiology, orthopaedics, and geriatrics are arranged through partner hospitals at no cost. Physiotherapy sessions are available for those recovering from fractures, strokes, or mobility impairment. Our trained nursing staff monitor vitals daily in residential care settings and respond to health emergencies promptly. We maintain complete health records for every patient and coordinate seamlessly between general practitioners and specialists. Mobile medical units visit beneficiaries who cannot travel to clinics. Palliative care and pain management are provided with sensitivity for those in the final stages of life. Your donation directly funds doctor fees, medicines, medical equipment, ambulance support, and the specialized care that helps our elderly beneficiaries manage chronic conditions and live with dignity.",
        fullDescriptionHi: "बुजुर्ग होने पर कई स्वास्थ्य चुनौतियाँ आती हैं जिन्हें लगातार चिकित्सा देखभाल की आवश्यकता होती है। हमारा चिकित्सा सहायता कार्यक्रम हमारे देखभाल नेटवर्क में वरिष्ठ नागरिकों को व्यापक चिकित्सा सहायता प्रदान करता है। इसमें योग्य डॉक्टरों द्वारा द्विमासिक दौरे, रक्तचाप और रक्त शर्करा की नियमित निगरानी और नुस्खे प्रबंधन शामिल हैं।",
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
    labelHi: "सामुदायिक सुरक्षा",
    labelBn: "সামুদায়িক নিরাপত্তা",
    labelPa: "ਸਮੁਦਾਇਕ ਸੁਰੱਖਿਆ",
    icon: FaShieldAlt,
    programs: [
      {
        title: "Helmet Distribution Drive",
        titleHi: "हेलमेट वितरण अभियान",
        titleBn: "হেলমেট বিতরণ অভিযান",
        titlePa: "ਹੈਲਮੇਟ ਵੰਡ ਮੁਹਿੰਮ",
        description: "Distributing certified safety helmets to riders to reduce head injuries and save lives.",
        descriptionHi: "सिर की चोटों को कम करने और जीवन बचाने के लिए सवारों को प्रमाणित सुरक्षा हेलमेट वितरित करना।",
        descriptionBn: "মাথার আঘাত কমাতে এবং জীবন বাঁচাতে চালকদের মধ্যে সার্টিফাইড সেফটি হেলমেট বিতরণ।",
        descriptionPa: "ਸਿਰ ਦੀਆਂ ਸੱਟਾਂ ਘਟਾਉਣ ਅਤੇ ਜਾਨਾਂ ਬਚਾਉਣ ਲਈ ਸਵਾਰਾਂ ਨੂੰ ਸਰਟੀਫਾਈਡ ਸੁਰੱਖਿਆ ਹੈਲਮੇਟ ਵੰਡਣਾ।",
        fullDescription: "Road accidents are one of India's leading causes of death, and head injuries are responsible for the majority of fatalities in two-wheeler crashes. Wearing a certified helmet can reduce the risk of fatal head injury by up to 70%, yet millions of riders in rural and semi-urban India go without one — often due to cost or lack of awareness. Our Helmet Distribution Drive procures ISI-certified helmets in bulk and distributes them free of charge to two-wheeler riders from low-income households, daily wage workers, delivery riders, and schoolchildren who ride bicycles on busy roads. Each distribution camp is accompanied by road safety awareness sessions conducted in partnership with local traffic police and NGO volunteers. We cover the importance of wearing helmets correctly, traffic rules, safe riding practices, and first aid. We also engage local schools and community leaders as champions of road safety in their areas. Special drives are organized before festivals and monsoon season when accident rates spike. Our goal is to create a culture of safety where helmets are seen as essential protective gear rather than a burden. Your donation helps us procure helmets, organize distribution camps, cover transportation costs, and run awareness programs that save lives every day.",
        fullDescriptionHi: "सड़क दुर्घटनाएं भारत में मृत्यु के प्रमुख कारणों में से एक हैं। हमारा हेलमेट वितरण अभियान ISI-प्रमाणित हेलमेट थोक में खरीदता है और कम आय वाले परिवारों के दो-पहिया वाहन सवारों को मुफ्त वितरित करता है। प्रत्येक वितरण शिविर के साथ यातायात पुलिस के सहयोग से सड़क सुरक्षा जागरूकता सत्र आयोजित किए जाते हैं।",
        image: helmet,
        cta: "Help Now",
        href: "/services/safety/helmet",
        donationTitle: "Protect Lives: Nationwide Helmet Distribution Drive",
      },
      {
        title: "Fire Safety Awareness Camps",
        titleHi: "अग्नि सुरक्षा जागरूकता शिविर",
        titleBn: "অগ্নি নিরাপত্তা সচেতনতা শিবির",
        titlePa: "ਅੱਗ ਸੁਰੱਖਿਆ ਜਾਗਰੂਕਤਾ ਕੈਂਪ",
        description: "Training communities on fire prevention, safe cooking practices, and emergency evacuation procedures.",
        descriptionHi: "आग की रोकथाम, सुरक्षित खाना पकाने और आपातकालीन निकासी प्रक्रियाओं पर समुदायों को प्रशिक्षित करना।",
        descriptionBn: "অগ্নি প্রতিরোধ, নিরাপদ রান্নার অভ্যাস এবং জরুরি উচ্ছেদ পদ্ধতিতে সম্প্রদায়কে প্রশিক্ষণ দেওয়া।",
        descriptionPa: "ਅੱਗ ਦੀ ਰੋਕਥਾਮ, ਸੁਰੱਖਿਅਤ ਖਾਣਾ ਪਕਾਉਣ ਅਤੇ ਐਮਰਜੈਂਸੀ ਨਿਕਾਸੀ ਪ੍ਰਕਿਰਿਆਵਾਂ ਬਾਰੇ ਭਾਈਚਾਰਿਆਂ ਨੂੰ ਸਿਖਲਾਈ ਦੇਣਾ।",
        fullDescription: "Thousands of fire accidents occur every year in Indian homes, slums, and markets — many of them preventable with basic knowledge and precautions. Rural households using wood-fired stoves, kerosene lamps, and makeshift electrical connections face particularly high risks. Our Fire Safety Awareness Camps program trains communities in fire prevention and emergency response through interactive workshops, demonstrations, and hands-on drills. Sessions cover safe cooking practices on biomass stoves, proper storage of flammable materials, electrical safety in homes, how to use basic fire extinguishers, and how to conduct safe evacuation of elderly, children, and differently-abled individuals during a fire emergency. We partner with local fire stations to bring trained firefighters to conduct live demonstrations in villages and urban slums. Women's self-help groups and youth clubs are specifically engaged as community fire safety ambassadors. We also distribute affordable fire safety kits including smoke alarms, small extinguishers, and safety guides. Schools are trained to conduct fire drills and post emergency exit plans. Your support enables us to reach more communities, procure training materials, bring expert trainers, and create a generation of safety-conscious citizens who protect themselves and their neighbors from fire tragedies.",
        fullDescriptionHi: "भारत में हर साल घरों, झुग्गियों और बाजारों में हजारों अग्नि दुर्घटनाएं होती हैं। हमारा अग्नि सुरक्षा जागरूकता शिविर कार्यक्रम इंटरैक्टिव कार्यशालाओं, प्रदर्शनों और हाथों-हाथ अभ्यास के माध्यम से समुदायों को अग्नि रोकथाम और आपातकालीन प्रतिक्रिया में प्रशिक्षित करता है।",
        image: "https://images.pexels.com/photos/1363876/pexels-photo-1363876.jpeg?auto=compress&cs=tinysrgb&w=800",
        cta: "Help Now",
        href: null,
        donationTitle: "Fund Fire Safety Camps to Protect Communities",
      },
      {
        title: "Child Safety & Protection",
        titleHi: "बाल सुरक्षा और संरक्षण",
        titleBn: "শিশু নিরাপত্তা ও সুরক্ষা",
        titlePa: "ਬਾਲ ਸੁਰੱਖਿਆ ਅਤੇ ਸੰਰੱਖਣ",
        description: "Awareness and reporting systems to protect children from abuse, trafficking, and exploitation.",
        descriptionHi: "बच्चों को दुर्व्यवहार, तस्करी और शोषण से बचाने के लिए जागरूकता और रिपोर्टिंग प्रणाली।",
        descriptionBn: "শিশুদের নির্যাতন, পাচার ও শোষণ থেকে রক্ষা করতে সচেতনতা ও রিপোর্টিং ব্যবস্থা।",
        descriptionPa: "ਬੱਚਿਆਂ ਨੂੰ ਦੁਰਵਿਵਹਾਰ, ਤਸਕਰੀ ਅਤੇ ਸ਼ੋਸ਼ਣ ਤੋਂ ਬਚਾਉਣ ਲਈ ਜਾਗਰੂਕਤਾ ਅਤੇ ਰਿਪੋਰਟਿੰਗ ਪ੍ਰਣਾਲੀ।",
        fullDescription: "Child abuse, trafficking, and labor exploitation remain serious threats to children across India, particularly in economically vulnerable communities. Awareness, early identification, and prompt reporting are the most effective tools against these crimes. Our Child Safety and Protection program works at the community level to create a network of informed adults who can recognize warning signs and take action. We conduct child safety workshops in schools, training children about good touch and bad touch, online safety, identifying trusted adults, and how to report abuse safely. We train teachers, anganwadi workers, and community health workers to recognize signs of abuse, neglect, and trafficking. A dedicated helpline connects at-risk children and concerned adults with child protection officers and legal authorities. We work closely with police, Child Welfare Committees, and NGO networks to ensure swift action in reported cases. Our awareness drives have helped identify and rescue dozens of children from abusive situations each year. We also run reintegration and counseling programs for rescued children. Your donation funds awareness workshops, helpline operations, training programs, and the legal and psychological support services that protect our most vulnerable children.",
        fullDescriptionHi: "बाल दुर्व्यवहार, तस्करी और श्रम शोषण पूरे भारत में बच्चों के लिए गंभीर खतरे बने हुए हैं। हमारा बाल सुरक्षा और संरक्षण कार्यक्रम स्कूलों में बाल सुरक्षा कार्यशालाएं आयोजित करता है, बच्चों को अच्छे और बुरे स्पर्श, ऑनलाइन सुरक्षा और दुर्व्यवहार की रिपोर्ट करने के बारे में प्रशिक्षित करता है।",
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
    labelHi: "सामाजिक कल्याण",
    labelBn: "সামাজিক কল্যাণ",
    labelPa: "ਸਮਾਜਿਕ ਭਲਾਈ",
    icon: FaHandHoldingHeart,
    programs: [
      {
        title: "Kanyadan Yojna — LIC Support",
        titleHi: "कन्यादान योजना — LIC बीमा सहायता",
        titleBn: "কন্যাদান যোজনা — LIC বীমা সহায়তা",
        titlePa: "ਕੰਨਿਆਦਾਨ ਯੋਜਨਾ — LIC ਬੀਮਾ ਸਹਾਇਤਾ",
        description: "We enroll underprivileged girls in LIC life insurance policies and pay the first 3 premiums — giving every daughter a secured financial future.",
        descriptionHi: "हम वंचित लड़कियों को LIC जीवन बीमा पॉलिसी में नामांकित करते हैं और पहली 3 प्रीमियम भरते हैं — हर बेटी को एक सुरक्षित भविष्य देते हैं।",
        descriptionBn: "আমরা সুবিধাবঞ্চিত মেয়েদের LIC জীবন বীমা পলিসিতে নথিভুক্ত করি এবং প্রথম ৩টি প্রিমিয়াম পরিশোধ করি।",
        descriptionPa: "ਅਸੀਂ ਵੰਚਿਤ ਲੜਕੀਆਂ ਨੂੰ LIC ਜੀਵਨ ਬੀਮਾ ਪਾਲਿਸੀ ਵਿੱਚ ਦਾਖਲ ਕਰਦੇ ਹਾਂ ਅਤੇ ਪਹਿਲੇ 3 ਪ੍ਰੀਮੀਅਮ ਭਰਦੇ ਹਾਂ।",
        fullDescription: "Marriage is a significant social milestone in India, but for families living in poverty, arranging a daughter's wedding can mean selling assets, taking high-interest loans, or simply being unable to provide the basic dignified celebration their daughter deserves. Our Kanyadan Yojna provides financial and material support for marriages of girls from below-poverty-line and economically weaker families. Support includes contribution toward wedding ceremony costs, essential household items like utensils, bedding, and basic furniture for the new home, assistance with wedding attire for the bride, and guidance on legal registration of marriage and accessing government marriage assistance schemes. We work with local panchayats, social workers, and community leaders to identify genuine cases and ensure the support reaches families in need, not those misusing welfare programs. We also conduct premarital counseling and awareness sessions on legal rights, domestic violence prevention, and family planning. Group wedding ceremonies organized under this program help families reduce costs while creating a joyful community celebration. Your donation contributes directly to helping daughters begin their new lives with dignity and to reducing the financial burden that pushes many poor families into debt.",
        fullDescriptionHi: "शादी भारत में एक महत्वपूर्ण सामाजिक मील का पत्थर है, लेकिन गरीबी में रहने वाले परिवारों के लिए बेटी की शादी का इंतजाम करना मुश्किल हो सकता है। हमारी कन्यादान योजना गरीबी रेखा से नीचे के परिवारों की शादियों के लिए वित्तीय और भौतिक सहायता प्रदान करती है। समर्थन में विवाह समारोह लागत, आवश्यक घरेलू सामान और विवाह पोशाक शामिल हैं।",
        image: kandyaDan,
        images: [kanyaHero, kanyaBeginning, kanyaHelp, kanyaSupport, kanyaFuture],
        cta: "Help Now",
        href: "/services/welfare/kanyadan",
        donationTitle: "Support LIC Policy Enrollment for Underprivileged Girls — Kanyadan Yojna",
      },
      {
        title: "Dignified Last Rites",
        titleHi: "सम्मानजनक अंतिम संस्कार",
        titleBn: "মর্যাদাপূর্ণ অন্তিম সংস্কার",
        titlePa: "ਸਤਿਕਾਰਯੋਗ ਅੰਤਿਮ ਸੰਸਕਾਰ",
        description: "Helping underprivileged families perform respectful and dignified final rites for loved ones.",
        descriptionHi: "वंचित परिवारों को अपने प्रियजनों के लिए सम्मानजनक अंतिम संस्कार करने में मदद।",
        descriptionBn: "সুবিধাবঞ্চিত পরিবারকে প্রিয়জনের জন্য শ্রদ্ধাশীল ও মর্যাদাপূর্ণ অন্তিম সংস্কার করতে সহায়তা।",
        descriptionPa: "ਗਰੀਬ ਪਰਿਵਾਰਾਂ ਨੂੰ ਆਪਣੇ ਪਿਆਰਿਆਂ ਲਈ ਸਤਿਕਾਰਯੋਗ ਅੰਤਿਮ ਸੰਸਕਾਰ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਨਾ।",
        fullDescription: "The loss of a loved one is among the most painful experiences in life. For families living in poverty, the inability to perform proper last rites compounds grief with shame and helplessness. In Indian culture, funeral and cremation rituals hold deep religious and emotional significance — yet for many poor families, the costs of wood, ritual items, transport, and ceremony are simply unaffordable. Our Dignified Last Rites program responds within hours of receiving a call for assistance. We provide the materials and logistics required for a proper funeral — cremation wood, ritual items, shroud, transport of the body, and support with death certificate registration. A trained social worker accompanies the family throughout the process to offer both practical help and emotional support. We operate with deep sensitivity to the religious practices of each family, respecting Hindu, Muslim, Christian, Sikh, and all other traditions equally. We also help surviving family members connect with government death benefits, insurance claims, and pension transfer procedures. Since our inception, we have helped hundreds of families bid farewell to their loved ones with the dignity and respect every human being deserves. Your donation makes it possible for a grieving family to say a proper goodbye, regardless of their financial condition.",
        fullDescriptionHi: "किसी प्रियजन का नुकसान जीवन में सबसे दर्दनाक अनुभवों में से एक है। हमारा सम्मानजनक अंतिम संस्कार कार्यक्रम सहायता के लिए कॉल प्राप्त होने के घंटों के भीतर प्रतिक्रिया करता है। हम उचित अंतिम संस्कार के लिए आवश्यक सामग्री और रसद प्रदान करते हैं। एक प्रशिक्षित सामाजिक कार्यकर्ता पूरी प्रक्रिया में परिवार के साथ रहता है।",
        image: rites,
        cta: "Help Now",
        href: "/services/welfare/rites",
        donationTitle: "Support Dignified Last Rites: A Respectful Farewell for the Underprivileged",
      },
      {
        title: "Destitute Support Program",
        titleHi: "निराश्रित सहायता कार्यक्रम",
        titleBn: "নিঃস্ব সহায়তা কর্মসূচি",
        titlePa: "ਬੇਸਹਾਰਾ ਸਹਾਇਤਾ ਪ੍ਰੋਗਰਾਮ",
        description: "Emergency aid including food, shelter, and clothing for destitute individuals found on streets.",
        descriptionHi: "सड़कों पर पाए गए निराश्रित व्यक्तियों के लिए भोजन, आश्रय और कपड़ों सहित आपातकालीन सहायता।",
        descriptionBn: "রাস্তায় পাওয়া নিঃস্ব ব্যক্তিদের জন্য খাদ্য, আশ্রয় ও বস্ত্রসহ জরুরি সহায়তা।",
        descriptionPa: "ਸੜਕਾਂ 'ਤੇ ਮਿਲੇ ਬੇਸਹਾਰਾ ਲੋਕਾਂ ਲਈ ਭੋਜਨ, ਆਸਰਾ ਅਤੇ ਕੱਪੜਿਆਂ ਸਮੇਤ ਐਮਰਜੈਂਸੀ ਸਹਾਇਤਾ।",
        fullDescription: "India's cities and highways are home to countless destitute individuals — people who have lost family support, suffered from mental illness, fled domestic violence, or been displaced by poverty and disaster. Without intervention, these individuals face hunger, exposure, disease, and violence every day. Our Destitute Support Program operates rescue teams that identify individuals sleeping on streets, railway stations, bus stands, and hospital premises and connect them with immediate assistance. Emergency support includes cooked meals, clean water, seasonal clothing, a safe place to sleep, basic medical care, and mental health first aid. We work with municipal authorities, police, and NGO shelters to provide longer-term rehabilitation. Each rescued person is assessed for specific needs — whether employment support, substance abuse treatment, mental health care, or reconnection with family. Our teams have helped hundreds of destitute individuals get off the streets, access government welfare identity documents like Aadhaar, and begin the process of rebuilding their lives. Your donation supports rescue team operations, emergency supplies, shelter facility maintenance, and the rehabilitation services that transform lives from crisis to stability.",
        fullDescriptionHi: "भारत के शहरों और राजमार्गों पर अनगिनत निराश्रित व्यक्ति रहते हैं। हमारा निराश्रित सहायता कार्यक्रम बचाव टीमों का संचालन करता है जो सड़कों, रेलवे स्टेशनों और अस्पताल परिसरों में व्यक्तियों की पहचान करती है और उन्हें तत्काल सहायता से जोड़ती है। आपातकालीन सहायता में पका भोजन, स्वच्छ पानी, मौसमी कपड़े और बुनियादी चिकित्सा देखभाल शामिल है।",
        image: "https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg?auto=compress&cs=tinysrgb&w=800",
        cta: "Help Now",
        href: null,
        donationTitle: "Support Destitute Individuals with Emergency Aid and Rehabilitation",
      },
    ],
  },
  {
    id: "medical-support",
    label: "Medical Support",
    labelHi: "चिकित्सा सहायता",
    labelBn: "চিকিৎসা সহায়তা",
    labelPa: "ਡਾਕਟਰੀ ਸਹਾਇਤਾ",
    icon: FaHeartbeat,
    programs: [
      {
        title: "Free Health Camp Checkups",
        titleHi: "मुफ्त स्वास्थ्य शिविर जाँच",
        titleBn: "বিনামূল্যে স্বাস্থ্য শিবির পরীক্ষা",
        titlePa: "ਮੁਫ਼ਤ ਸਿਹਤ ਕੈਂਪ ਜਾਂਚ",
        description: "Regular free health camps offering doctor consultations, basic diagnostics, and early screening for vulnerable communities.",
        descriptionHi: "कमजोर समुदायों के लिए डॉक्टर परामर्श, बुनियादी निदान और प्रारंभिक जाँच के नियमित मुफ्त स्वास्थ्य शिविर।",
        descriptionBn: "দুর্বল সম্প্রদায়ের জন্য ডাক্তারের পরামর্শ, মৌলিক ডায়াগনস্টিক এবং প্রাথমিক স্ক্রীনিং সহ নিয়মিত বিনামূল্যে স্বাস্থ্য শিবির।",
        descriptionPa: "ਕਮਜ਼ੋਰ ਭਾਈਚਾਰਿਆਂ ਲਈ ਡਾਕਟਰ ਸਲਾਹ-ਮਸ਼ਵਰੇ, ਬੁਨਿਆਦੀ ਜਾਂਚ ਅਤੇ ਸ਼ੁਰੂਆਤੀ ਸਕ੍ਰੀਨਿੰਗ ਦੇ ਨਿਯਮਿਤ ਮੁਫ਼ਤ ਸਿਹਤ ਕੈਂਪ।",
        fullDescription: "Access to basic healthcare is a fundamental right, yet millions of Indians living in rural areas, urban slums, and tribal communities have never seen a qualified doctor. Preventable and treatable diseases go undetected for years, causing suffering and death that could easily be avoided. Our Free Health Camp Checkups program deploys mobile medical teams to organize camps in villages, slums, tribal settlements, construction sites, and brick kilns where healthcare access is most limited. Each camp provides free consultations with qualified general physicians and specialists, blood pressure measurement, blood glucose testing, haemoglobin testing, BMI assessment, eye testing, basic dental examination, and distribution of free medicines for common ailments. Patients with serious conditions are referred to partner hospitals where treatment is arranged at subsidized costs or free of charge through government schemes. We also conduct health awareness sessions on topics like hygiene, nutrition, water sanitation, malaria prevention, and maternal health. Our camps have screened over fifty thousand patients in the past three years. Early detection of conditions like hypertension, diabetes, and anaemia has prevented serious complications for thousands. Your donation helps deploy medical teams, procure diagnostic equipment, purchase medicines, and reach the most medically underserved communities across India.",
        fullDescriptionHi: "बुनियादी स्वास्थ्य सेवा तक पहुंच एक मौलिक अधिकार है, फिर भी लाखों भारतीयों ने कभी योग्य डॉक्टर नहीं देखा है। हमारा मुफ्त स्वास्थ्य शिविर जाँच कार्यक्रम गाँवों, झुग्गियों और आदिवासी बस्तियों में शिविर आयोजित करने के लिए मोबाइल मेडिकल टीमों को तैनात करता है। प्रत्येक शिविर मुफ्त परामर्श, रक्त परीक्षण और सामान्य बीमारियों के लिए मुफ्त दवाएं प्रदान करता है।",
        image: medicalCamp,
        cta: "Help Now",
        href: "/services/medical/camp",
        donationTitle: "Fund a Mega Free Health Checkup Camp for rural communities",
      },
      {
        title: "Cancer Treatment Support",
        titleHi: "कैंसर उपचार सहायता",
        titleBn: "ক্যান্সার চিকিৎসা সহায়তা",
        titlePa: "ਕੈਂਸਰ ਇਲਾਜ ਸਹਾਇਤਾ",
        description: "Financial aid for cancer treatment, including chemotherapy cycles, diagnostics, and essential medicines for patients in need.",
        descriptionHi: "जरूरतमंद रोगियों के लिए कीमोथेरेपी, निदान और आवश्यक दवाइयों सहित कैंसर उपचार के लिए वित्तीय सहायता।",
        descriptionBn: "প্রয়োজনগ্রস্ত রোগীদের জন্য কেমোথেরাপি, ডায়াগনস্টিক এবং প্রয়োজনীয় ওষুধ সহ ক্যান্সার চিকিৎসার জন্য আর্থিক সহায়তা।",
        descriptionPa: "ਲੋੜਵੰਦ ਮਰੀਜ਼ਾਂ ਲਈ ਕੀਮੋਥੈਰੇਪੀ, ਜਾਂਚ ਅਤੇ ਜ਼ਰੂਰੀ ਦਵਾਈਆਂ ਸਮੇਤ ਕੈਂਸਰ ਇਲਾਜ ਲਈ ਵਿੱਤੀ ਸਹਾਇਤਾ।",
        fullDescription: "Cancer is one of India's most devastating diseases, affecting over 1.4 million new patients every year. For families living below or near the poverty line, a cancer diagnosis is not just a medical crisis — it is a financial catastrophe that can wipe out years of savings, force families to sell land and livestock, and still leave the patient without adequate treatment. Our Cancer Treatment Support program provides financial assistance to low-income cancer patients to cover costs that are not covered by government schemes or insurance. We fund chemotherapy cycles, radiation therapy sessions, diagnostic scans including CT, PET, and MRI, biopsy procedures, essential medicines, and hospital admission charges at partner hospitals and cancer institutes. Each case is reviewed by a medical social worker who assesses eligibility, coordinates with the treating oncologist, and arranges timely disbursement of funds directly to hospitals. We also provide nutritional support and counseling for patients and their caregivers. Our program has supported hundreds of patients each year, helping them complete treatment courses that would otherwise be abandoned mid-way due to lack of funds. Early completion of full treatment protocols significantly improves survival rates. Your donation makes the difference between a patient giving up on treatment and a patient completing their journey toward recovery.",
        fullDescriptionHi: "कैंसर भारत की सबसे विनाशकारी बीमारियों में से एक है, जो हर साल 14 लाख से अधिक नए रोगियों को प्रभावित करती है। हमारा कैंसर उपचार सहायता कार्यक्रम कम आय वाले कैंसर रोगियों को वित्तीय सहायता प्रदान करता है। हम कीमोथेरेपी चक्र, डायग्नोस्टिक स्कैन, आवश्यक दवाएं और अस्पताल प्रवेश शुल्क को वित्त पोषित करते हैं।",
        image: medicalCancer,
        cta: "Help Now",
        href: "/services/medical/cancer",
        donationTitle: "Support Life-Saving Cancer Treatments & Care",
      },
      {
        title: "Kidney Dialysis Support",
        titleHi: "किडनी डायलिसिस सहायता",
        titleBn: "কিডনি ডায়ালিসিস সহায়তা",
        titlePa: "ਕਿਡਨੀ ਡਾਇਲਿਸਿਸ ਸਹਾਇਤਾ",
        description: "Helping low-income patients afford recurring dialysis sessions and related treatment costs for long-term kidney care.",
        descriptionHi: "कम आय वाले रोगियों को आवर्ती डायलिसिस सत्र और दीर्घकालिक किडनी देखभाल की लागत वहन करने में मदद।",
        descriptionBn: "কম আয়ের রোগীদের নিয়মিত ডায়ালিসিস সেশন এবং দীর্ঘমেয়াদী কিডনি সেবার খরচ বহন করতে সহায়তা।",
        descriptionPa: "ਘੱਟ ਆਮਦਨ ਵਾਲੇ ਮਰੀਜ਼ਾਂ ਨੂੰ ਵਾਰ-ਵਾਰ ਡਾਇਲਿਸਿਸ ਸੈਸ਼ਨਾਂ ਅਤੇ ਲੰਮੀ-ਮਿਆਦ ਕਿਡਨੀ ਦੇਖਭਾਲ ਦੀ ਲਾਗਤ ਲਈ ਮਦਦ ਕਰਨਾ।",
        fullDescription: "Chronic kidney disease affects millions of Indians, and for those with end-stage renal failure, dialysis is not optional — it is a life-sustaining procedure required two to three times per week without interruption. Each dialysis session costs between five hundred and fifteen hundred rupees in government facilities, and more in private centres. For poor patients, the cumulative cost of three sessions per week becomes impossible to sustain. Missing sessions leads to dangerous toxin buildup that can be fatal within days. Our Kidney Dialysis Support program subsidizes or fully covers the cost of dialysis sessions for low-income patients who cannot afford treatment independently. We have empanelled dialysis centres in multiple cities where patients receive sessions at zero or minimal cost through our support. Each patient is registered with our programme after verification of income and medical status by a social worker and nephrologist. In addition to financial support, we help patients access government schemes like PMJAY, transportation reimbursement, and dietary counseling — because dialysis patients need strict dietary management that is also costly. Our program currently supports over two hundred active patients. Your donation funds dialysis sessions, consumables used during procedures, patient transport, and nutritional support — everything needed for a kidney patient to survive and maintain quality of life.",
        fullDescriptionHi: "क्रोनिक किडनी रोग लाखों भारतीयों को प्रभावित करता है। हमारा किडनी डायलिसिस सहायता कार्यक्रम कम आय वाले रोगियों के लिए डायलिसिस सत्रों की लागत को सब्सिडी देता है या पूरी तरह से कवर करता है। हमने कई शहरों में डायलिसिस केंद्रों को सूचीबद्ध किया है जहां रोगी हमारे समर्थन के माध्यम से शून्य या न्यूनतम लागत पर सत्र प्राप्त करते हैं।",
        image: medicalKidney,
        cta: "Help Now",
        href: "/services/medical/kidney",
        donationTitle: "Support Life-Saving Kidney Dialysis & Care",
      },
      {
        title: "Blood Donation Camps",
        titleHi: "रक्तदान शिविर",
        titleBn: "রক্তদান শিবির",
        titlePa: "ਖੂਨਦਾਨ ਕੈਂਪ",
        description: "Organizing voluntary blood donation events to address India's critical blood shortage and save lives.",
        descriptionHi: "भारत की गंभीर रक्त की कमी को दूर करने और जीवन बचाने के लिए स्वैच्छिक रक्तदान कार्यक्रम आयोजित करना।",
        descriptionBn: "ভারতের গুরুতর রক্তের ঘাটতি মোকাবেলা এবং জীবন বাঁচাতে স্বেচ্ছামূলক রক্তদান অনুষ্ঠান আয়োজন।",
        descriptionPa: "ਭਾਰਤ ਦੀ ਗੰਭੀਰ ਖੂਨ ਦੀ ਕਮੀ ਨੂੰ ਦੂਰ ਕਰਨ ਅਤੇ ਜ਼ਿੰਦਗੀਆਂ ਬਚਾਉਣ ਲਈ ਸਵੈ-ਇੱਛਤ ਖੂਨਦਾਨ ਸਮਾਗਮ ਆਯੋਜਿਤ ਕਰਨਾ।",
        fullDescription: "India faces a massive shortage of safe blood every year, with demand exceeding supply by over three million units. This shortage costs thousands of lives — patients needing surgery, cancer treatment, dialysis, accident victims, and mothers during childbirth all depend on readily available blood. Voluntary, regular blood donation is the only safe and sustainable solution. Our Blood Donation Camps program organizes large-scale voluntary blood donation drives in colleges, corporate offices, community halls, temples, mosques, and public spaces. Each camp is conducted in partnership with licensed blood banks and hospitals, ensuring that donated blood is screened, stored safely, and distributed to patients who need it most. Trained medical staff conduct pre-donation health checks, collect blood using sterile equipment, and provide post-donation refreshments and certificates to donors. We conduct extensive awareness campaigns to dispel myths about blood donation — that it weakens the body, affects health, or is unsafe — replacing fear with facts and pride. Youth groups, college students, and corporate volunteers are our biggest donors, and we work hard to engage them as regular year-round donors rather than one-time participants. Our camps have collected over fifty thousand units of blood in the past five years. Your donation funds camp logistics, medical supplies, awareness materials, refreshments for donors, and the administrative work that connects voluntary donors with patients who desperately need this gift of life.",
        fullDescriptionHi: "भारत हर साल सुरक्षित रक्त की भारी कमी का सामना करता है। हमारा रक्तदान शिविर कार्यक्रम कॉलेजों, कॉर्पोरेट कार्यालयों और सामुदायिक हॉल में बड़े पैमाने पर स्वैच्छिक रक्तदान अभियान आयोजित करता है। प्रत्येक शिविर लाइसेंस प्राप्त ब्लड बैंकों और अस्पतालों के साथ साझेदारी में आयोजित किया जाता है। प्रशिक्षित चिकित्सा कर्मचारी दान पूर्व स्वास्थ्य जाँच करते हैं और बाँझ उपकरण का उपयोग करके रक्त संग्रह करते हैं।",
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
    labelHi: "बुनियादी ढांचा",
    labelBn: "অবকাঠামো",
    labelPa: "ਬੁਨਿਆਦੀ ਢਾਂਚਾ",
    icon: FaBuilding,
    programs: [
      {
        title: "Road Construction",
        titleHi: "सड़क निर्माण",
        titleBn: "সড়ক নির্মাণ",
        titlePa: "ਸੜਕ ਨਿਰਮਾਣ",
        description: "Build and upgrade roads, pathways, and connectivity for rural communities.",
        descriptionHi: "ग्रामीण समुदायों के लिए सड़कें, रास्ते और कनेक्टिविटी बनाएं और उन्नत करें।",
        descriptionBn: "গ্রামীণ সম্প্রদায়ের জন্য সড়ক, পথ এবং সংযোগ তৈরি ও উন্নত করা।",
        descriptionPa: "ਪੇਂਡੂ ਭਾਈਚਾਰਿਆਂ ਲਈ ਸੜਕਾਂ, ਰਸਤੇ ਅਤੇ ਕਨੈਕਟੀਵਿਟੀ ਬਣਾਉਣਾ ਅਤੇ ਅੱਪਗ੍ਰੇਡ ਕਰਨਾ।",
        fullDescription: "Rural road connectivity is foundational to economic development, healthcare access, and educational opportunity. Yet thousands of villages in India remain cut off from the nearest town or highway due to lack of proper roads — especially during monsoon season when unpaved paths become impassable. Farmers cannot take their produce to market, children cannot reach schools, and patients cannot access hospitals in emergencies. Our Road Construction program identifies villages where road connectivity is most critical and partners with panchayats, district authorities, and construction companies to build or upgrade roads using durable materials appropriate to local terrain. Projects include dirt-to-paved road conversions, culvert and bridge construction over seasonal streams, road widening for two-way vehicle traffic, streetlight installation for safety, and drainage systems to prevent waterlogging. Each project is managed by trained civil engineers with community involvement at every stage — from route planning to final inspection. We prioritize projects that serve multiple villages, schools, primary health centres, or weekly markets to maximize impact. Completed roads have transformed communities by enabling regular transport services, reducing emergency response times, improving school attendance, and allowing farmers to access better market prices. Your donation funds materials, labour, engineering supervision, and the community engagement work that ensures roads are built where they matter most.",
        fullDescriptionHi: "ग्रामीण सड़क कनेक्टिविटी आर्थिक विकास, स्वास्थ्य सेवा पहुंच और शैक्षिक अवसर के लिए आधारभूत है। हमारा सड़क निर्माण कार्यक्रम उन गाँवों की पहचान करता है जहाँ सड़क कनेक्टिविटी सबसे महत्वपूर्ण है और पंचायतों और जिला अधिकारियों के साथ साझेदारी करके टिकाऊ सामग्री का उपयोग करके सड़कें बनाता या उन्नत करता है।",
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
