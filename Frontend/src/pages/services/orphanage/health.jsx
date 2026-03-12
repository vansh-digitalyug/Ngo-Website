import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaChevronDown,
    FaHandHoldingHeart,
    FaRegClock,
    FaShieldAlt,
    FaCheckCircle,
    FaStar,
    FaHeartbeat,
    FaSyringe,
    FaTooth,
    FaBrain,
    FaUsers,
} from "react-icons/fa";
import orphanHealth from "../../../assets/images/orphanage/health.jpg";
import healthImg1 from "../../../assets/images/orphanage/medical/image1.png";
import healthImg2 from "../../../assets/images/orphanage/medical/image2.png";
import healthImg3 from "../../../assets/images/orphanage/medical/image3.png";
import healthImg4 from "../../../assets/images/orphanage/medical/image4.png";
import healthImg5 from "../../../assets/images/orphanage/medical/image5.png";
import "./health.css";

const HEALTH_BENEFITS = [
    {
        icon: FaHeartbeat,
        title: "Monthly Health Checkups for Every Child",
        desc: "Every child undergoes a full health examination every month — height, weight, vision, hearing, and general physical assessment — so no health issue ever goes undetected or untreated.",
    },
    {
        icon: FaSyringe,
        title: "Complete Vaccination Program",
        desc: "We follow the national immunization schedule strictly. Every child in our care is fully vaccinated against preventable diseases — from infancy through adolescence — at no cost to the orphanage.",
    },
    {
        icon: FaTooth,
        title: "Dental & Eye Care",
        desc: "Regular dental checkups and eye tests are conducted twice a year. Children who need corrective glasses or dental treatment receive them promptly, ensuring they can learn and live without discomfort.",
    },
    {
        icon: FaBrain,
        title: "Mental Health & Counselling Support",
        desc: "Our trained counsellors conduct weekly group sessions and individual counselling for children dealing with trauma, anxiety, or emotional difficulties — because mental health is as important as physical health.",
    },
];

const WHAT_WE_PROVIDE = [
    "Monthly full-body health checkups for every child by a qualified doctor",
    "Complete national immunization schedule — all vaccines provided free of cost",
    "Emergency medical treatment and hospital admission support when required",
    "Essential medicines, first aid, and on-site medical supplies maintained at all times",
    "Dental checkups and treatment twice a year for every child",
    "Annual vision tests and prescription glasses provided for children who need them",
    "Weekly mental health counselling sessions by trained child psychologists",
    "Nutritional assessments and supplement programs for malnourished children",
    "Health education sessions teaching children about hygiene, sanitation, and wellness",
    "80G tax exemption certificates issued to all donors supporting this program",
];

const GOALS = [
    { number: "150+", label: "Children Under Care" },
    { number: "100%", label: "Vaccination Coverage" },
    { number: "24/7", label: "Medical Support" },
    { number: "6 yrs", label: "Program Running" },
];

const FAQS = [
    {
        question: "What medical services does this program cover?",
        answer: "The program covers monthly health checkups, complete vaccinations, emergency treatments, hospitalisation support, dental care, eye tests, prescription glasses, mental health counselling, and essential medicines — everything a child needs to stay healthy.",
    },
    {
        question: "Who provides the medical care to the children?",
        answer: "We partner with qualified doctors, dentists, and child psychologists who visit the orphanage regularly. For emergencies and specialist care, children are taken to our partner hospitals where treatment is covered by our medical fund.",
    },
    {
        question: "How is emergency medical care handled?",
        answer: "We maintain an emergency medical fund specifically for sudden illnesses, accidents, and urgent hospitalisations. Our staff are trained in first aid, and we have a direct helpline to our partner doctors for after-hours emergencies.",
    },
    {
        question: "Does the program include mental health support?",
        answer: "Yes. Many children in orphanage care have experienced trauma or loss. Our trained counsellors conduct weekly group therapy sessions and one-on-one sessions for children who need individual support. Mental wellness is a core part of our health program.",
    },
    {
        question: "How much does it cost to support one child's healthcare?",
        answer: "₹2,500 covers one child's complete monthly healthcare — checkups, medicines, vaccinations, and counselling. Your donation goes directly into our medical fund and is used only for the children's healthcare.",
    },
    {
        question: "Is my donation eligible for tax exemption?",
        answer: "Yes. All donations to our NGO are eligible for 80G tax deduction under the Income Tax Act. An official receipt and tax certificate will be sent to you after your donation.",
    },
];

const STORY = [
    {
        en: "A child who is unwell cannot learn. A child in pain cannot play. A child struggling with unaddressed trauma cannot grow into the confident adult they deserve to be. For children in orphanage care, access to consistent, professional medical attention is not a luxury — it is the difference between a childhood survived and a childhood truly lived.",
        hi: "एक बीमार बच्चा सीख नहीं सकता। दर्द में रहने वाला बच्चा खेल नहीं सकता। अनसुलझे आघात से जूझता बच्चा उस आत्मविश्वासी वयस्क नहीं बन सकता जिसका वह हकदार है। अनाथालय में रहने वाले बच्चों के लिए निरंतर, पेशेवर चिकित्सा देखभाल तक पहुंच एक विलासिता नहीं है।",
    },
    {
        en: "Our Health & Medical Care Program was built to ensure that no child in our care ever has to wait for medical attention, go without medicines, or suffer from a condition that could have been prevented or treated. Every child receives a full monthly health checkup, complete vaccinations, dental care, and annual vision tests — all funded through this program.",
        hi: "हमारा स्वास्थ्य और चिकित्सा देखभाल कार्यक्रम यह सुनिश्चित करने के लिए बनाया गया था कि हमारी देखभाल में कोई भी बच्चा कभी भी चिकित्सा ध्यान का इंतजार न करे, दवाओं के बिना न जाए, या किसी ऐसी स्थिति से पीड़ित न हो जिसे रोका या उपचारित किया जा सकता था।",
    },
    {
        en: "Beyond the physical, we recognise that many children in orphanage care carry invisible wounds. Our team of trained counsellors conducts weekly mental health sessions — group and individual — to help children process their experiences, build emotional resilience, and develop the confidence to face the world. Because health is not just the absence of illness; it is the presence of wellbeing.",
        hi: "शारीरिक स्वास्थ्य से परे, हम पहचानते हैं कि अनाथालय में कई बच्चे अदृश्य घाव लिए चलते हैं। हमारे प्रशिक्षित परामर्शदाताओं की टीम साप्ताहिक मानसिक स्वास्थ्य सत्र आयोजित करती है — समूह और व्यक्तिगत — बच्चों को उनके अनुभवों को संसाधित करने में मदद करने के लिए।",
    },
    {
        en: "When a child is healthy — physically and mentally — everything else becomes possible. They attend school with energy. They make friends with confidence. They dream about a future. That is what your donation to this program protects. Not just a body, but a whole life.",
        hi: "जब एक बच्चा स्वस्थ होता है — शारीरिक और मानसिक रूप से — तो बाकी सब कुछ संभव हो जाता है। वे ऊर्जा के साथ स्कूल जाते हैं। वे आत्मविश्वास के साथ दोस्त बनाते हैं। वे भविष्य के बारे में सपने देखते हैं। यही वह है जो इस कार्यक्रम में आपका दान सुरक्षित करता है।",
    },
];

function OrphanageHealthPage() {
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
                    title: "Health & Medical Care for Orphanage Children",
                    text: "Help provide complete healthcare for children in orphanage care — checkups, medicines, vaccines, and counselling.",
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
        <section className="health-detail-page">
            <div className="health-detail-shell">
                <div className="health-content-grid">

                    {/* LEFT — MAIN CONTENT */}
                    <div className="health-main-stack">

                        {/* Hero Banner */}
                        <section className="health-hero-card">
                            <div className="health-hero-img-wrap">
                                <img src={orphanHealth} alt="Health and Medical Care for Orphanage Children" />
                                <div className="health-hero-overlay">
                                    <span className="health-badge">Orphanage Program</span>
                                    <h1>Health & Medical Care Program</h1>
                                    <p>We provide every orphaned child with complete healthcare — monthly checkups, vaccinations, dental care, emergency treatment, and mental health counselling — so every child grows up healthy, strong, and cared for</p>
                                </div>
                            </div>
                        </section>

                        {/* Journey Photo Strip */}
                        <section className="health-section-card health-journey-section">
                            <h2>A Child's Complete Healthcare Journey</h2>
                            <p className="health-section-desc">From routine checkups to emergency care — this is the full healthcare safety net we build around every child in our orphanage program.</p>
                            <div className="health-journey-grid">
                                <div className="health-journey-item">
                                    <img src={healthImg1} alt="Monthly health checkup for children" />
                                    <div className="health-journey-caption">
                                        <span className="health-journey-step">Monthly</span>
                                        <strong>Health Checkups</strong>
                                        <p>Full physical examination every month — weight, vision, hearing and overall health assessment</p>
                                    </div>
                                </div>
                                <div className="health-journey-item">
                                    <img src={healthImg2} alt="Vaccination program for children" />
                                    <div className="health-journey-caption">
                                        <span className="health-journey-step">Preventive</span>
                                        <strong>Vaccinations</strong>
                                        <p>Complete national immunization schedule followed for every child from infancy to adolescence</p>
                                    </div>
                                </div>
                                <div className="health-journey-item">
                                    <img src={healthImg3} alt="Dental and eye care for children" />
                                    <div className="health-journey-caption">
                                        <span className="health-journey-step">Twice Yearly</span>
                                        <strong>Dental & Eye Care</strong>
                                        <p>Regular dental checkups and annual vision tests with glasses provided for children who need them</p>
                                    </div>
                                </div>
                                <div className="health-journey-item">
                                    <img src={healthImg4} alt="Mental health counselling for children" />
                                    <div className="health-journey-caption">
                                        <span className="health-journey-step">Weekly</span>
                                        <strong>Mental Wellness</strong>
                                        <p>Trained counsellors conduct weekly sessions to support emotional health and build resilience</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Story */}
                        <section className="health-section-card">
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
                        <section className="health-section-card">
                            <h2>Our Impact So Far</h2>
                            <div className="health-goals-grid">
                                {GOALS.map((g) => (
                                    <div key={g.label} className="health-goal-item">
                                        <strong>{g.number}</strong>
                                        <span>{g.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Benefits */}
                        <section className="health-section-card">
                            <h2>What Our Program Provides</h2>
                            <p className="health-section-desc">Healthcare is more than treating illness — it is preventing it, supporting it, and nurturing every dimension of a child's wellbeing:</p>
                            <div className="health-benefits-grid">
                                {HEALTH_BENEFITS.map((b) => (
                                    <article key={b.title} className="health-benefit-card">
                                        <div className="health-benefit-icon">
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
                        <section className="health-section-card">
                            <h2>Everything We Cover</h2>
                            <p className="health-section-desc">Our support covers every aspect of a child's health — from routine prevention to emergency response:</p>
                            <ul className="health-provide-list">
                                {WHAT_WE_PROVIDE.map((item) => (
                                    <li key={item}>
                                        <FaCheckCircle aria-hidden="true" className="health-check-icon" />
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
                                        <h3>Qualified Medical Partners</h3>
                                        <p>All healthcare is provided by verified doctors, dentists, and licensed counsellors.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaHandHoldingHeart aria-hidden="true" />
                                    <div>
                                        <h3>Real Impact</h3>
                                        <p>Your donation directly funds medicines, checkups, and treatment for children in our care.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRegClock aria-hidden="true" />
                                    <div>
                                        <h3>24/7 Emergency Support</h3>
                                        <p>Emergency medical funds are always maintained — no child ever waits for urgent treatment.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        {/* Impact CTA */}
                        <section className="health-section-card health-impact-cta">
                            <div className="health-impact-cta-content">
                                <FaUsers className="health-impact-cta-icon" aria-hidden="true" />
                                <div>
                                    <h2>Protect a Child's Health Today</h2>
                                    <p>₹2,500 covers one child's complete monthly healthcare — checkups, medicines, vaccinations, and counselling. Your donation goes directly into our medical fund and is used exclusively for the children's health and wellbeing. All contributions are eligible for 80G tax exemption.</p>
                                </div>
                            </div>
                            <Link
                                to="/donate"
                                state={{ serviceImage: orphanHealth, serviceTitle: "Health & Medical Care for Orphanage Children" }}
                                className="campaign-btn campaign-btn-primary health-impact-cta-btn"
                            >
                                Protect a Child
                            </Link>
                        </section>

                        {/* FAQs */}
                        <section className="health-section-card faq-section">
                            <h2>Frequently Asked Questions</h2>
                            <p className="faq-intro">Everything you need to know about how we care for children's health.</p>
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
                    <aside className="health-side-stack">
                        <article className="campaign-card">
                            <div className="campaign-image-wrap">
                                <img src={healthImg5} alt="Health & Medical Care Program" />
                                <span className="campaign-chip">Orphanage Healthcare</span>
                            </div>

                            <div className="campaign-body">
                                <h1>Help provide complete healthcare for children in orphanage care</h1>
                                <p className="campaign-org">Guardian of Angels Trust</p>

                                <div className="health-premium-highlight">
                                    <FaHeartbeat aria-hidden="true" />
                                    <span>₹2,500 covers <strong>1 child's full monthly healthcare</strong></span>
                                </div>

                                <div className="campaign-amounts">
                                    <strong>₹3,45,000</strong>
                                    <span>raised of ₹5,00,000 goal</span>
                                </div>

                                <div className="campaign-progress" aria-hidden="true">
                                    <span className="campaign-progress-fill" style={{ width: "69%" }} />
                                </div>

                                <div className="campaign-stats">
                                    <div>
                                        <strong>189</strong>
                                        <span>Donors</span>
                                    </div>
                                    <div>
                                        <strong>150+</strong>
                                        <span>Children</span>
                                    </div>
                                    <div>
                                        <strong>69%</strong>
                                        <span>Funded</span>
                                    </div>
                                </div>

                                <div className="health-impact-note">
                                    <FaStar aria-hidden="true" />
                                    <span>80G tax exemption on all donations</span>
                                </div>

                                <div className="campaign-actions">
                                    <Link
                                        to="/donate"
                                        state={{ serviceImage: orphanHealth, serviceTitle: "Health & Medical Care for Orphanage Children" }}
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

                        <article className="health-how-it-works-card">
                            <h3>How It Works</h3>
                            <ol className="health-steps-list">
                                <li>
                                    <span className="health-step-num">1</span>
                                    <div>
                                        <strong>Monthly Health Assessment</strong>
                                        <p>Every child is examined by a qualified doctor each month for full health screening</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="health-step-num">2</span>
                                    <div>
                                        <strong>Vaccinations & Prevention</strong>
                                        <p>All vaccines are administered on schedule to protect children from preventable diseases</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="health-step-num">3</span>
                                    <div>
                                        <strong>Treatment & Medicines</strong>
                                        <p>Sick children receive prompt treatment and medicines fully covered by our medical fund</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="health-step-num">4</span>
                                    <div>
                                        <strong>Dental & Eye Care</strong>
                                        <p>Biannual dental checkups and annual eye tests keep children healthy beyond the basics</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="health-step-num">5</span>
                                    <div>
                                        <strong>Mental Health Support</strong>
                                        <p>Weekly counselling sessions help children build emotional strength and resilience</p>
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

export default OrphanageHealthPage;
