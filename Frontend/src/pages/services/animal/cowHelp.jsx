import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaChevronDown,
    FaHandHoldingHeart,
    FaRegClock,
    FaShieldAlt,
    FaCheckCircle,
    FaStar,
    FaLeaf,
    FaHeart,
    FaMapMarkerAlt,
} from "react-icons/fa";
import { GiCow } from "react-icons/gi";
import cowImg1 from "../../../assets/images/socialWelfare/Cow/image1.png";
import cowImg2 from "../../../assets/images/socialWelfare/Cow/image2.png";
import cowImg3 from "../../../assets/images/socialWelfare/Cow/image3.png";
import "./cowHelp.css";

const SERVICES = [
    {
        icon: FaLeaf,
        title: "Chaara aur Paani (Feed & Water)",
        desc: "Every stray and sheltered cow receives fresh green fodder, dry hay, and clean drinking water daily. Our volunteers ensure no cow sleeps hungry — rain, summer, or winter. We provide balanced nutrition including mineral supplements to maintain health.",
    },
    {
        icon: FaHeart,
        title: "Ilaaj (Medical Treatment)",
        desc: "Injured, sick, and abandoned cows receive complete veterinary care — wound dressing, medicines, vaccinations, and surgeries when needed. Our partnered veterinary doctors conduct regular health checkups at the gaushala to catch problems early.",
    },
    {
        icon: FaMapMarkerAlt,
        title: "Aashray (Safe Shelter)",
        desc: "We maintain a clean, spacious gaushala where rescued cows live safely — protected from traffic accidents, plastic ingestion, and extreme weather. Every cow gets her own space with proper ventilation, shade, and bedding.",
    },
];

const WHAT_WE_PROVIDE = [
    "Daily supply of green grass, hay, and clean water for every cow in our shelter",
    "Complete veterinary care — wound treatment, medicines, vaccinations, and surgical support",
    "Safe and clean gaushala with proper shade, ventilation, and hygiene maintenance",
    "24/7 caretaker presence to monitor cow health and respond to emergencies",
    "Rescue operations for injured, abandoned, or road-accident cows across the area",
    "Plastic hazard removal — cows die from ingesting plastic; we conduct regular cleanup drives",
    "Awareness campaigns in local communities about not feeding harmful substances to cows",
    "Partnership with local veterinary colleges for regular health camps at the gaushala",
    "80G tax exemption certificates issued to all donors supporting this program",
];

const GOALS = [
    { number: "200+", label: "Cows sheltered & cared for" },
    { number: "50+", label: "Rescue operations per month" },
    { number: "365", label: "Days of care, every year" },
    { number: "100%", label: "Verified rescue & treatment" },
];

const FAQS = [
    {
        question: "How are the stray cows rescued?",
        answer: "Our rescue team operates 7 days a week. When a stray or injured cow is reported — via our helpline or social media — our team reaches the spot, provides first aid if needed, and safely transports the cow to our gaushala for full treatment and rehabilitation.",
    },
    {
        question: "What happens to cows after they recover?",
        answer: "Recovered cows are kept at our gaushala where they are cared for permanently. If a responsible family or farmer wishes to adopt a cow for ethical purposes, we verify their setup before facilitating the adoption.",
    },
    {
        question: "How does my donation help?",
        answer: "₹500 feeds one cow for a full month. ₹1,500 covers a basic medical checkup. ₹3,000 funds complete treatment for an injured cow. Every rupee goes directly toward feed, medicine, and shelter maintenance — zero administrative overhead on your donation.",
    },
    {
        question: "Do you accept non-monetary donations?",
        answer: "Yes! We gladly accept donations of green fodder, hay, grain, medicines, blankets, and veterinary supplies. Contact us to coordinate a direct drop-off at our gaushala.",
    },
    {
        question: "Is my donation eligible for tax exemption?",
        answer: "Yes. All donations to our NGO are eligible for 80G tax deduction under the Income Tax Act. You will receive an official receipt and tax certificate after your donation.",
    },
];

const STORY = [
    "India has over 5 million stray cows wandering city roads, highways, and villages. These are not wild animals — most were once family-owned cows, abandoned when they stopped producing milk. They scavenge through garbage, ingest polythene bags and plastic waste, get hit by vehicles, and suffer slow, painful deaths.",
    "In our city alone, we see dozens of such cows every week — limping, starving, or lying injured on roadsides. The problem is not lack of compassion — it is lack of a system. Our Gau Seva program is that system.",
    "We run a fully operational gaushala where rescued cows receive the three things they need most: nutritious food and clean water every day (Chaara aur Paani), complete medical treatment for injuries and illness (Ilaaj), and a safe, permanent shelter away from roads and danger (Aashray).",
    "Our team responds to rescue calls 7 days a week. Our partnered veterinarians conduct regular health camps. Our volunteers clean, feed, and care for every cow — giving them the dignity every living being deserves. When you donate to Gau Seva, you are not just helping an animal. In our culture, Gau Mata is sacred. Serving her is an act of faith, compassion, and humanity.",
];

function GauSevaPage() {
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
                    title: "Gau Seva — Cow Protection & Care",
                    text: "Help us rescue, treat, and shelter stray and injured cows. Your donation feeds, heals, and protects Gau Mata.",
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
        <section className="gau-detail-page">
            <div className="gau-detail-shell">
                <div className="gau-content-grid">

                    {/* LEFT — MAIN CONTENT */}
                    <div className="gau-main-stack">

                        {/* Hero Banner */}
                        <section className="gau-hero-card">
                            <div className="gau-hero-img-wrap">
                                <img src={cowImg1} alt="Gau Seva — Cow Protection & Care" />
                                <div className="gau-hero-overlay">
                                    <span className="gau-badge">Animal Care Program</span>
                                    <h1>Gau Seva</h1>
                                    <p>We rescue injured and stray cows, provide daily nutritious feed and clean water, complete veterinary treatment, and a safe permanent shelter — because every life deserves dignity.</p>
                                </div>
                            </div>
                        </section>

                        {/* 3 Services */}
                        <section className="gau-section-card gau-services-section">
                            <h2>Our Three Pillars of Gau Seva</h2>
                            <p className="gau-section-desc">Every cow in our care receives three things without exception — food, healing, and shelter. These are the foundations of everything we do.</p>
                            <div className="gau-services-grid">
                                {SERVICES.map((s, i) => (
                                    <div key={i} className="gau-service-item">
                                        <div className="gau-service-icon-wrap">
                                            <s.icon />
                                        </div>
                                        <div>
                                            <h3>{s.title}</h3>
                                            <p>{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Photo Strip */}
                        <section className="gau-section-card gau-photo-section">
                            <h2>Life at Our Gaushala</h2>
                            <p className="gau-section-desc">A glimpse of the care, love, and dignity that every cow in our shelter receives every single day.</p>
                            <div className="gau-photo-grid">
                                <div className="gau-photo-item">
                                    <img src={cowImg1} alt="Cows being fed fresh fodder" />
                                    <div className="gau-photo-caption">
                                        <strong>Chaara aur Paani</strong>
                                        <p>Daily fresh fodder and clean water — no cow sleeps hungry</p>
                                    </div>
                                </div>
                                <div className="gau-photo-item">
                                    <img src={cowImg2} alt="Veterinary treatment for injured cow" />
                                    <div className="gau-photo-caption">
                                        <strong>Ilaaj</strong>
                                        <p>Complete veterinary care for every injured and sick cow</p>
                                    </div>
                                </div>
                                <div className="gau-photo-item">
                                    <img src={cowImg3} alt="Cows resting safely in gaushala" />
                                    <div className="gau-photo-caption">
                                        <strong>Aashray</strong>
                                        <p>A safe, clean gaushala — their permanent home</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Story */}
                        <section className="gau-section-card">
                            <h2>Why This Matters</h2>
                            <div className={`gau-story-content ${storyExpanded ? "expanded" : ""}`}>
                                {STORY.map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="gau-text-action"
                                onClick={() => setStoryExpanded((c) => !c)}
                            >
                                {storyExpanded ? "Read Less" : "Read More"}
                            </button>
                        </section>

                        {/* Goals */}
                        <section className="gau-section-card">
                            <h2>Our Impact</h2>
                            <div className="gau-goals-grid">
                                {GOALS.map((g) => (
                                    <div key={g.label} className="gau-goal-item">
                                        <strong>{g.number}</strong>
                                        <span>{g.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* What We Provide */}
                        <section className="gau-section-card">
                            <h2>What We Provide</h2>
                            <p className="gau-section-desc">Our work goes far beyond feeding. Here is everything we do for every cow in our care:</p>
                            <ul className="gau-provide-list">
                                {WHAT_WE_PROVIDE.map((item) => (
                                    <li key={item}>
                                        <FaCheckCircle className="gau-check-icon" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Donation Impact */}
                        <section className="gau-section-card gau-impact-section">
                            <h2>What Your Donation Does</h2>
                            <div className="gau-impact-grid">
                                <div className="gau-impact-item">
                                    <span className="gau-impact-amount">₹500</span>
                                    <span className="gau-impact-label">Feeds 1 cow for a full month</span>
                                </div>
                                <div className="gau-impact-item">
                                    <span className="gau-impact-amount">₹1,500</span>
                                    <span className="gau-impact-label">Complete medical checkup for 1 cow</span>
                                </div>
                                <div className="gau-impact-item">
                                    <span className="gau-impact-amount">₹3,000</span>
                                    <span className="gau-impact-label">Full treatment for an injured cow</span>
                                </div>
                                <div className="gau-impact-item">
                                    <span className="gau-impact-amount">₹10,000</span>
                                    <span className="gau-impact-label">6 months of complete care for 1 cow</span>
                                </div>
                            </div>
                        </section>

                        {/* Trust Strip */}
                        <section className="gau-trust-strip">
                            <h2>Why Trust Us</h2>
                            <div className="gau-trust-grid">
                                <article>
                                    <FaShieldAlt />
                                    <div>
                                        <h3>Verified Operations</h3>
                                        <p>Our gaushala is registered and operates under full veterinary supervision with daily logs.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaHandHoldingHeart />
                                    <div>
                                        <h3>Direct Impact</h3>
                                        <p>100% of your donation goes toward feed, medicine, and shelter — zero on overhead.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRegClock />
                                    <div>
                                        <h3>365-Day Care</h3>
                                        <p>Our caretakers are present every single day — no holidays, no breaks for the cows.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        {/* FAQs */}
                        <section className="gau-section-card gau-faq-section">
                            <h2>Frequently Asked Questions</h2>
                            <p className="gau-section-desc">Everything you want to know about our Gau Seva program.</p>
                            <div className="gau-faq-list">
                                {FAQS.map((faq, index) => {
                                    const isOpen = openFaq === index;
                                    return (
                                        <article key={index} className={`gau-faq-item ${isOpen ? "open" : ""}`}>
                                            <button
                                                type="button"
                                                className="gau-faq-question"
                                                onClick={() => setOpenFaq(isOpen ? null : index)}
                                                aria-expanded={isOpen}
                                            >
                                                <span>{faq.question}</span>
                                                <FaChevronDown />
                                            </button>
                                            <div className="gau-faq-answer">
                                                <p>{faq.answer}</p>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT — STICKY CAMPAIGN CARD */}
                    <aside className="gau-side-stack">
                        <article className="gau-campaign-card">
                            <div className="gau-campaign-image-wrap">
                                <img src={cowImg2} alt="Gau Seva — Cow Protection" />
                                <span className="gau-campaign-chip">Animal Care Program</span>
                            </div>

                            <div className="gau-campaign-body">
                                <h1>Gau Seva — Cow Protection & Care</h1>
                                <p className="gau-campaign-org">Guardian of Angels Trust</p>

                                <div className="gau-premium-highlight">
                                    <GiCow />
                                    <span>Rescue · Treat · Shelter <strong>Gau Mata</strong></span>
                                </div>

                                <div className="gau-campaign-actions">
                                    <Link
                                        to="/donate"
                                        state={{ serviceImage: cowImg1, serviceTitle: "Gau Seva — Rescue, Treat & Shelter Stray Cows" }}
                                        className="gau-btn gau-btn-primary"
                                    >
                                        Help Now
                                    </Link>
                                    <button
                                        type="button"
                                        className="gau-btn gau-btn-secondary"
                                        onClick={handleShare}
                                    >
                                        {shareLabel}
                                    </button>
                                </div>
                            </div>
                        </article>

                        <article className="gau-how-it-works-card">
                            <h3>How Gau Seva Works</h3>
                            <ol className="gau-steps-list">
                                <li>
                                    <span className="gau-step-num">1</span>
                                    <div>
                                        <strong>Rescue Call Received</strong>
                                        <p>Stray or injured cow reported via helpline or social media</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="gau-step-num">2</span>
                                    <div>
                                        <strong>Team Dispatched</strong>
                                        <p>Our team reaches the spot, provides first aid, and transports the cow safely</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="gau-step-num">3</span>
                                    <div>
                                        <strong>Veterinary Treatment</strong>
                                        <p>Full medical evaluation and treatment at our gaushala</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="gau-step-num">4</span>
                                    <div>
                                        <strong>Daily Care</strong>
                                        <p>Fresh feed, clean water, and shelter — every day, permanently</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="gau-step-num">5</span>
                                    <div>
                                        <strong>Long-term Monitoring</strong>
                                        <p>Regular health checkups and care for the rest of the cow's life</p>
                                    </div>
                                </li>
                            </ol>
                        </article>

                        <article className="gau-impact-sidebar-card">
                            <h3>Quick Impact</h3>
                            <div className="gau-quick-impact">
                                <div><span className="qi-amount">₹500</span><span className="qi-label">1 month feed</span></div>
                                <div><span className="qi-amount">₹1,500</span><span className="qi-label">Medical checkup</span></div>
                                <div><span className="qi-amount">₹3,000</span><span className="qi-label">Full treatment</span></div>
                                <div><span className="qi-amount">₹10,000</span><span className="qi-label">6 months care</span></div>
                            </div>
                            <Link
                                to="/donate"
                                state={{ serviceImage: cowImg1, serviceTitle: "Gau Seva — Rescue, Treat & Shelter Stray Cows" }}
                                className="gau-btn gau-btn-primary"
                                style={{ display: "block", textAlign: "center", marginTop: "14px" }}
                            >
                                Donate Now
                            </Link>
                        </article>
                    </aside>

                </div>
            </div>
        </section>
    );
}

export default GauSevaPage;
