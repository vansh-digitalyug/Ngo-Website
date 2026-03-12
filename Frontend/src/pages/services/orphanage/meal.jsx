import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaChevronDown,
    FaHandHoldingHeart,
    FaRegClock,
    FaShieldAlt,
    FaCheckCircle,
    FaStar,
    FaUtensils,
    FaAppleAlt,
    FaLeaf,
    FaHeart,
    FaUsers,
} from "react-icons/fa";
import orphanMeal from "../../../assets/images/orphanage/food.webp";
import mealImg1 from "../../../assets/images/orphanage/meal/image1.png";
import mealImg2 from "../../../assets/images/orphanage/meal/image2.png";
import mealImg3 from "../../../assets/images/orphanage/meal/image3.png";
import mealImg4 from "../../../assets/images/orphanage/meal/image 4.png";
import mealImg5 from "../../../assets/images/orphanage/meal/image5.png";
import "./meal.css";

const MEAL_BENEFITS = [
    {
        icon: FaUtensils,
        title: "Three Balanced Meals Every Day",
        desc: "Every child receives breakfast, lunch, and dinner — each carefully planned by a nutritionist to include proteins, carbohydrates, vitamins, and minerals essential for growing bodies.",
    },
    {
        icon: FaAppleAlt,
        title: "Fresh Fruits & Milk Daily",
        desc: "We ensure every child gets a daily serving of seasonal fresh fruits and a glass of milk — nutrients that are critical for bone development, immunity, and cognitive function.",
    },
    {
        icon: FaLeaf,
        title: "Hygienic Kitchen & Safe Preparation",
        desc: "All meals are prepared in a clean, regularly inspected kitchen by trained staff. We follow strict food safety protocols so no child ever falls ill due to contaminated food.",
    },
    {
        icon: FaHeart,
        title: "Special Meals on Festivals & Birthdays",
        desc: "Every festival and every child's birthday is celebrated with a special meal — because food is not just nutrition, it is joy, dignity, and love that every child deserves to feel.",
    },
];

const WHAT_WE_PROVIDE = [
    "Three nutritionist-planned meals per day — breakfast, lunch, and dinner — for every child",
    "Daily fresh fruit servings and a glass of full-cream milk for each child",
    "Weekly special protein-rich meals including eggs, dal, and paneer",
    "Vitamin and mineral supplements for children identified as malnourished",
    "Hygienic kitchen operations with monthly health inspections and staff food safety training",
    "Seasonal menu rotation to ensure variety and complete nutritional coverage",
    "Special festive meals and birthday celebrations for every child in our care",
    "Monthly health and weight tracking to monitor each child's nutritional progress",
    "80G tax exemption certificates issued to all donors supporting this program",
];

const GOALS = [
    { number: "150+", label: "Children Fed Daily" },
    { number: "3", label: "Meals Per Child/Day" },
    { number: "100%", label: "Hygienic Standards" },
    { number: "4 yrs", label: "Program Running" },
];

const FAQS = [
    {
        question: "How does my donation help feed the children?",
        answer: "Every ₹1,500 donated covers one child's complete monthly meal expenses — three meals a day including fresh fruits and milk. Your donation goes directly to purchasing ingredients, running the kitchen, and nutritional supplements.",
    },
    {
        question: "Who plans the meals for the children?",
        answer: "Our meals are planned by a certified nutritionist who designs weekly menus to meet the dietary requirements of growing children aged 4 to 17. The menu is reviewed every season to ensure variety and freshness.",
    },
    {
        question: "How is food hygiene maintained?",
        answer: "Our kitchen undergoes monthly hygiene inspections. All kitchen staff are trained in food safety protocols. Ingredients are sourced fresh daily from verified suppliers, and no processed or packaged food is served regularly.",
    },
    {
        question: "What happens if a child is malnourished?",
        answer: "We conduct monthly weight and health checkups for every child. Children identified as malnourished receive additional nutritional support — extra protein meals, vitamin supplements, and in severe cases, coordination with our medical team.",
    },
    {
        question: "Can I donate food items instead of money?",
        answer: "Yes. We accept dry food donations such as rice, dal, cooking oil, and sugar from individuals and corporates. Contact us directly to arrange a food donation drop-off or pickup.",
    },
    {
        question: "Is my donation eligible for tax exemption?",
        answer: "Yes. All donations to our NGO are eligible for 80G tax deduction under the Income Tax Act. An official receipt and tax certificate will be sent to you after your donation.",
    },
];

const STORY = [
    {
        en: "A growing child needs more than just food — they need the right food, at the right time, every single day. For children in orphanage care, this is not a given. Running an orphanage on limited funds means meals are often whatever is available, not what is needed. The result is silent malnutrition — children who look fed but are not truly nourished.",
        hi: "एक बढ़ते बच्चे को सिर्फ खाने से ज़्यादा ज़रूरत होती है — उन्हें सही खाना, सही समय पर, हर एक दिन चाहिए। अनाथालय में देखभाल में रहने वाले बच्चों के लिए, यह कोई गारंटी नहीं है। सीमित धन पर अनाथालय चलाने का मतलब है भोजन अक्सर जो उपलब्ध हो, न कि जो ज़रूरी हो।",
    },
    {
        en: "Our Nutritious Meal Program was created to end that gap. We do not just feed children — we nourish them. Every meal served under this program is designed by a certified nutritionist, prepared in a hygienic kitchen, and served on time, three times a day. Breakfast, lunch, and dinner. Every child. Every day.",
        hi: "हमारा पौष्टिक भोजन कार्यक्रम उस अंतर को खत्म करने के लिए बनाया गया था। हम सिर्फ बच्चों को खाना नहीं देते — हम उन्हें पोषण देते हैं। इस कार्यक्रम के तहत परोसा गया हर भोजन एक प्रमाणित पोषण विशेषज्ञ द्वारा डिज़ाइन किया गया है, एक स्वच्छ रसोई में तैयार किया गया है, और समय पर परोसा जाता है।",
    },
    {
        en: "Beyond the three daily meals, we ensure every child gets fresh seasonal fruits and a glass of full-cream milk every day. For children with identified nutritional deficiencies, we provide additional supplements and high-protein meals. Our kitchen staff are trained in food safety, and the entire operation is inspected monthly.",
        hi: "तीन दैनिक भोजन के अलावा, हम सुनिश्चित करते हैं कि हर बच्चे को हर दिन ताजे मौसमी फल और पूरे क्रीम दूध का एक गिलास मिले। पहचान की गई पोषण कमियों वाले बच्चों के लिए, हम अतिरिक्त सप्लीमेंट और उच्च-प्रोटीन भोजन प्रदान करते हैं।",
    },
    {
        en: "Food is also dignity. On every festival, every birthday, and every special occasion, we make sure the children get a meal worth celebrating. Because every child — regardless of how they came to live with us — deserves to feel special, loved, and cared for. That is what your donation makes possible.",
        hi: "भोजन गरिमा भी है। हर त्योहार, हर जन्मदिन और हर खास मौके पर, हम सुनिश्चित करते हैं कि बच्चों को जश्न मनाने लायक भोजन मिले। क्योंकि हर बच्चा — चाहे वे हमारे साथ किसी भी तरह रहते हों — विशेष, प्यार और देखभाल महसूस करने का हकदार है।",
    },
];

function NutritiousMealPage() {
    const [storyExpanded, setStoryExpanded] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [shareLabel, setShareLabel] = useState("Share");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleShare = async () => {
        const pageUrl = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Nutritious Meal Program for Orphanage Children",
                    text: "Help provide three nutritious meals every day for children in orphanage care.",
                    url: pageUrl,
                });
                return;
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(pageUrl);
                setShareLabel("Link Copied");
                window.setTimeout(() => setShareLabel("Share"), 1600);
            }
        } catch {
            setShareLabel("Share");
        }
    };

    return (
        <section className="meal-detail-page">
            <div className="meal-detail-shell">
                <div className="meal-content-grid">

                    {/* LEFT — MAIN CONTENT */}
                    <div className="meal-main-stack">

                        {/* Hero Banner */}
                        <section className="meal-hero-card">
                            <div className="meal-hero-img-wrap">
                                <img src={orphanMeal} alt="Nutritious Meal Program for Orphanage Children" />
                                <div className="meal-hero-overlay">
                                    <span className="meal-badge">Orphanage Program</span>
                                    <h1>Nutritious Meal Program</h1>
                                    <p>We ensure every orphaned child receives three balanced, hygienic, and nutritionist-planned meals every single day — because proper nutrition is the foundation of every healthy childhood</p>
                                </div>
                            </div>
                        </section>

                        {/* Journey Photo Strip */}
                        <section className="meal-section-card meal-journey-section">
                            <h2>A Child's Daily Nourishment Journey</h2>
                            <p className="meal-section-desc">From a hungry morning to a nourished, energetic child ready to learn and play — this is what our Nutritious Meal Program delivers, three times a day, every day.</p>
                            <div className="meal-journey-grid">
                                <div className="meal-journey-item">
                                    <img src={mealImg1} alt="Morning breakfast for children" />
                                    <div className="meal-journey-caption">
                                        <span className="meal-journey-step">Morning</span>
                                        <strong>Healthy Breakfast</strong>
                                        <p>Nutritious morning meal with milk, fruits and wholesome grains to start the day right</p>
                                    </div>
                                </div>
                                <div className="meal-journey-item">
                                    <img src={mealImg2} alt="Nutritious lunch served to children" />
                                    <div className="meal-journey-caption">
                                        <span className="meal-journey-step">Afternoon</span>
                                        <strong>Balanced Lunch</strong>
                                        <p>Dal, rice, sabzi and roti — a complete balanced lunch planned by our nutritionist</p>
                                    </div>
                                </div>
                                <div className="meal-journey-item">
                                    <img src={mealImg3} alt="Fresh fruits and evening snack" />
                                    <div className="meal-journey-caption">
                                        <span className="meal-journey-step">Evening</span>
                                        <strong>Fruits & Snacks</strong>
                                        <p>Fresh seasonal fruits and evening snacks to keep energy levels up through the afternoon</p>
                                    </div>
                                </div>
                                <div className="meal-journey-item">
                                    <img src={mealImg4} alt="Warm dinner for children" />
                                    <div className="meal-journey-caption">
                                        <span className="meal-journey-step">Night</span>
                                        <strong>Warm Dinner</strong>
                                        <p>A warm, wholesome dinner every night ensuring children sleep full, healthy and happy</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Story */}
                        <section className="meal-section-card">
                            <h2>Our Initiative</h2>
                            <div className={`story-content ${storyExpanded ? "expanded" : ""}`}>
                                {STORY.map((item, idx) => (
                                    <p key={idx}>{item.en}</p>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="text-action"
                                onClick={() => setStoryExpanded((c) => !c)}
                            >
                                {storyExpanded ? "Read Less" : "Read More"}
                            </button>
                        </section>

                        {/* Goals */}
                        <section className="meal-section-card">
                            <h2>Our Impact So Far</h2>
                            <div className="meal-goals-grid">
                                {GOALS.map((g) => (
                                    <div key={g.label} className="meal-goal-item">
                                        <strong>{g.number}</strong>
                                        <span>{g.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Benefits */}
                        <section className="meal-section-card">
                            <h2>What Our Program Provides</h2>
                            <p className="meal-section-desc">Nutrition is more than filling a plate. Here is the complete care we build around every child's daily meals — from morning to night:</p>
                            <div className="meal-benefits-grid">
                                {MEAL_BENEFITS.map((b) => (
                                    <article key={b.title} className="meal-benefit-card">
                                        <div className="meal-benefit-icon">
                                            <b.icon aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3>{b.title}</h3>
                                            <p>{b.desc}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        {/* What We Provide */}
                        <section className="meal-section-card">
                            <h2>Everything We Cover</h2>
                            <p className="meal-section-desc">Our support goes far beyond three meals. Here is the full nutrition program every child in our care receives — every single day:</p>
                            <ul className="meal-provide-list">
                                {WHAT_WE_PROVIDE.map((item) => (
                                    <li key={item}>
                                        <FaCheckCircle aria-hidden="true" className="meal-check-icon" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Trust Strip */}
                        <section className="trust-strip">
                            <h2>Why Trust Us</h2>
                            <div className="trust-grid">
                                <article>
                                    <FaShieldAlt aria-hidden="true" />
                                    <div>
                                        <h3>Verified Kitchen Standards</h3>
                                        <p>Our kitchen is inspected monthly and all staff are trained in food safety protocols.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaHandHoldingHeart aria-hidden="true" />
                                    <div>
                                        <h3>Real Impact</h3>
                                        <p>Your donation directly buys fresh ingredients and nourishes a real child in our care.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRegClock aria-hidden="true" />
                                    <div>
                                        <h3>Daily Commitment</h3>
                                        <p>Three meals served on time, every day — 365 days a year, no exceptions.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        {/* Impact CTA */}
                        <section className="meal-section-card meal-impact-cta">
                            <div className="meal-impact-cta-content">
                                <FaUsers className="meal-impact-cta-icon" aria-hidden="true" />
                                <div>
                                    <h2>Feed a Child Today</h2>
                                    <p>₹1,500 covers one child's complete monthly meal program — breakfast, lunch, evening fruits, and dinner every day for a full month. Your donation goes directly to fresh ingredients, kitchen operations, and nutritional supplements. All contributions are eligible for 80G tax exemption.</p>
                                </div>
                            </div>
                            <Link
                                to="/donate"
                                state={{ serviceImage: orphanMeal, serviceTitle: "Nutritious Meal Program for Orphanage Children" }}
                                className="campaign-btn campaign-btn-primary meal-impact-cta-btn"
                            >
                                Feed a Child
                            </Link>
                        </section>

                        {/* FAQs */}
                        <section className="meal-section-card faq-section">
                            <h2>Frequently Asked Questions</h2>
                            <p className="faq-intro">Everything you need to know about how we nourish children every day.</p>
                            <div className="faq-list">
                                {FAQS.map((faq, index) => {
                                    const isOpen = openFaq === index;
                                    return (
                                        <article key={index} className={`faq-item ${isOpen ? "open" : ""}`}>
                                            <button
                                                type="button"
                                                className="faq-question"
                                                onClick={() => setOpenFaq(isOpen ? null : index)}
                                                aria-expanded={isOpen}
                                            >
                                                <span>{faq.question}</span>
                                                <FaChevronDown aria-hidden="true" />
                                            </button>
                                            {isOpen && <p className="faq-answer">{faq.answer}</p>}
                                        </article>
                                    );
                                })}
                            </div>
                        </section>

                    </div>

                    {/* RIGHT — STICKY SIDEBAR */}
                    <aside className="meal-side-stack">
                        <article className="campaign-card">
                            <div className="campaign-image-wrap">
                                <img src={mealImg5} alt="Nutritious Meal Program" />
                                <span className="campaign-chip">Orphanage Meals</span>
                            </div>

                            <div className="campaign-body">
                                <h1>Help provide three nutritious meals every day for children in orphanage care</h1>
                                <p className="campaign-org">Guardian of Angels Trust</p>

                                <div className="meal-premium-highlight">
                                    <FaUtensils aria-hidden="true" />
                                    <span>₹1,500 feeds <strong>1 child for a full month</strong></span>
                                </div>

                                <div className="campaign-amounts">
                                    <strong>₹1,50,000</strong>
                                    <span>raised of ₹3,00,000 goal</span>
                                </div>

                                <div className="campaign-progress" aria-hidden="true">
                                    <span className="campaign-progress-fill" style={{ width: "50%" }} />
                                </div>

                                <div className="campaign-stats">
                                    <div>
                                        <strong>85</strong>
                                        <span>Donors</span>
                                    </div>
                                    <div>
                                        <strong>150+</strong>
                                        <span>Children</span>
                                    </div>
                                    <div>
                                        <strong>50%</strong>
                                        <span>Funded</span>
                                    </div>
                                </div>

                                <div className="meal-impact-note">
                                    <FaStar aria-hidden="true" />
                                    <span>80G tax exemption on all donations</span>
                                </div>

                                <div className="campaign-actions">
                                    <Link
                                        to="/donate"
                                        state={{ serviceImage: orphanMeal, serviceTitle: "Nutritious Meal Program for Orphanage Children" }}
                                        className="campaign-btn campaign-btn-primary"
                                    >
                                        Help Now
                                    </Link>
                                    <button
                                        type="button"
                                        className="campaign-btn campaign-btn-secondary"
                                        onClick={handleShare}
                                    >
                                        {shareLabel}
                                    </button>
                                </div>
                            </div>
                        </article>

                        <article className="meal-how-it-works-card">
                            <h3>How It Works</h3>
                            <ol className="meal-steps-list">
                                <li>
                                    <span className="meal-step-num">1</span>
                                    <div>
                                        <strong>Nutritionist Planning</strong>
                                        <p>A certified nutritionist designs weekly balanced menus for all age groups</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="meal-step-num">2</span>
                                    <div>
                                        <strong>Fresh Sourcing</strong>
                                        <p>Ingredients are sourced fresh daily from verified local suppliers</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="meal-step-num">3</span>
                                    <div>
                                        <strong>Hygienic Preparation</strong>
                                        <p>Trained kitchen staff prepare all meals following strict food safety standards</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="meal-step-num">4</span>
                                    <div>
                                        <strong>Three Meals Served</strong>
                                        <p>Breakfast, lunch, and dinner served on time with fruits and milk daily</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="meal-step-num">5</span>
                                    <div>
                                        <strong>Monthly Health Tracking</strong>
                                        <p>Each child's weight and health is tracked to ensure proper nourishment</p>
                                    </div>
                                </li>
                            </ol>
                        </article>
                    </aside>

                </div>
            </div>
        </section>
    );
}

export default NutritiousMealPage;
