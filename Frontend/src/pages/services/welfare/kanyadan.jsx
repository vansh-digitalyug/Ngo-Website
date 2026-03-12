import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
import {
    FaChevronDown,
    FaHandHoldingHeart,
    FaRegClock,
    FaShieldAlt,
    FaCheckCircle,
    FaStar,
    FaLeaf,
    FaGift,
    FaTimes,
    FaUsers,
} from "react-icons/fa";
import kanyadanImage from "../../../assets/images/socialWelfare/kanyadan.png";
import heroImg from "../../../assets/images/socialWelfare/Kanyadan/hero.png";
import beginningImg from "../../../assets/images/socialWelfare/Kanyadan/Beggining.png";
import helpImg from "../../../assets/images/socialWelfare/Kanyadan/Help.png";
import supportImg from "../../../assets/images/socialWelfare/Kanyadan/Support.png";
import futureImg from "../../../assets/images/socialWelfare/Kanyadan/Future.png";
import "./kanyadan.css";

const LIC_BENEFITS = [
    {
        icon: FaGift,
        title: "First 3 Premiums Paid by Our NGO",
        desc: "Our NGO directly pays the first 3 LIC premium installments for every enrolled girl — completely free for the family. This removes the single biggest barrier to policy enrollment for low-income households and ensures the policy is active and growing from day one.",
    },
    {
        icon: FaShieldAlt,
        title: "Life Insurance Cover from Day One",
        desc: "From the moment the policy is issued, the girl has an active LIC life insurance cover. In the unfortunate event of the policyholder's demise, the nominee receives the full sum assured — giving the family a crucial financial safety net during the most vulnerable years.",
    },
    {
        icon: FaLeaf,
        title: "Structured Savings That Grow Over Time",
        desc: "Unlike a one-time donation, an LIC policy builds a compounding savings corpus year after year. Every premium paid adds to the girl's future fund. By the time she reaches adulthood, the accumulated corpus with bonuses can be worth several times the total premiums paid.",
    },
    {
        icon: FaStar,
        title: "Lump-Sum Maturity Payout for Her Future",
        desc: "On policy maturity — typically when the girl is between 18 and 25 years old — she receives a guaranteed lump-sum payout along with accumulated bonuses. This money is entirely hers: for higher education, launching a business, securing her life after marriage, or any dream she chooses to pursue.",
    },
];

const WHAT_WE_PROVIDE = [
    "Complete LIC policy enrollment — we handle all paperwork, KYC, and form submission on behalf of the family so they face zero administrative burden",
    "Direct payment of the first 3 LIC premium installments from NGO funds — no hidden charges, no partial support",
    "Selection of the most suitable LIC policy (Jeevan Tarun / Jeevan Lakshya) based on the girl's age, family profile, and long-term needs",
    "A dedicated relationship manager assigned to each enrolled family for the entire policy term",
    "Financial literacy workshops held at the community level to educate families about insurance, savings, and the long-term value of the policy",
    "Annual follow-up calls and visits to ensure premium continuity — we proactively address any risk of lapse",
    "Connection to government micro-finance schemes and self-help groups for families who need additional support to continue premiums",
    "Full documentation support for nominee registration, policy servicing, loan-against-policy queries, and maturity claim processing",
    "80G tax exemption certificates issued to all donors supporting this program",
];

const GOALS = [
    { number: "500+", label: "Girls to be enrolled in Year 1" },
    { number: "3", label: "LIC Premiums paid per beneficiary" },
    { number: "₹15Cr+", label: "Total future corpus for beneficiaries" },
    { number: "100%", label: "Verified underprivileged families" },
];

const FAQS = [
    {
        question: "Which LIC policy is enrolled under this scheme?",
        answer: "We enroll girls under LIC's Jeevan Tarun or Jeevan Lakshya policies — specially designed for girl children, offering life cover, savings, and maturity benefits. The exact policy is selected based on the girl's age and family profile.",
    },
    {
        question: "Who is eligible to benefit from this program?",
        answer: "Girls from families with an annual income below ₹2.5 lakhs are eligible. The girl should be between 1 to 12 years of age at the time of enrollment. Families go through a verification process before enrollment.",
    },
    {
        question: "What happens after the NGO pays the first 3 premiums?",
        answer: "After our NGO pays the first 3 premiums, the family takes over the policy. We provide financial counselling and continued support to ensure families are aware of the long-term benefits and continue the policy without lapse.",
    },
    {
        question: "Will the policy lapse if the family cannot continue?",
        answer: "We proactively follow up with enrolled families and connect them to government welfare schemes or micro-finance support where needed. Our goal is zero policy lapses among our beneficiaries.",
    },
    {
        question: "How can I donate to this program?",
        answer: "Click the 'Help Now' button on this page to make a secure donation. Every ₹5,000 donated funds the first 3 premiums for one girl. All donations are eligible for 80G tax exemption.",
    },
    {
        question: "Is my donation eligible for tax exemption?",
        answer: "Yes. All donations made to our NGO are eligible for 80G tax deduction under the Income Tax Act. You will receive an official receipt and tax certificate after your donation.",
    },
];

const STORY = [
    {
        en: "In India, a daughter's birth is still met with financial anxiety in millions of households. Families in low-income communities worry not just about today's meals, but about her education, her marriage, and whether she will ever have a safety net if something goes wrong. The burden falls silently on her parents — and ultimately on her.",
        hi: "भारत में, लाखों परिवारों में बेटी का जन्म अभी भी आर्थिक चिंता के साथ आता है। कम आय वाले समुदायों में परिवार न केवल आज के खर्चों की बल्कि उसकी शिक्षा, विवाह और भविष्य की सुरक्षा की भी चिंता करते हैं।",
    },
    {
        en: "Life Insurance Corporation of India (LIC) offers some of the most powerful savings-cum-insurance policies specifically designed for girl children — policies like Jeevan Tarun and Jeevan Lakshya that guarantee life cover, structured payouts, and a maturity corpus. Yet for the very families who need these policies the most, the first premium itself feels unaffordable.",
        hi: "LIC भारत की सबसे विश्वसनीय बीमा कंपनी है जो विशेष रूप से लड़कियों के लिए जीवन तरुण और जीवन लक्ष्य जैसी पॉलिसियां प्रदान करती है — जो जीवन बीमा, बचत और परिपक्वता लाभ की गारंटी देती हैं। लेकिन जिन परिवारों को इनकी सबसे अधिक जरूरत है, उनके लिए पहली प्रीमियम भी वहन करना मुश्किल होता है।",
    },
    {
        en: "This is exactly the gap our Kanyadan Yojna fills. We identify eligible girls from underprivileged families, complete the entire LIC enrollment process on their behalf, and — most crucially — our NGO directly pays the first 3 LIC premium installments. This kickstarts the policy and gives the family time to stabilize financially before they take over.",
        hi: "यही वह अंतर है जिसे हमारी कन्यादान योजना भरती है। हम वंचित परिवारों की पात्र लड़कियों की पहचान करते हैं, उनकी ओर से LIC में नामांकन की पूरी प्रक्रिया पूरी करते हैं और — सबसे महत्वपूर्ण — हमारा NGO पहली 3 LIC प्रीमियम किश्तें सीधे भरता है।",
    },
    {
        en: "We do not stop there. Our team conducts financial literacy sessions to help families understand how the policy works, what benefits it unlocks, and why continuing the premium is one of the best investments they will ever make for their daughter. We track every enrolled girl, follow up with the family annually, and connect them to micro-finance support if they struggle to continue.",
        hi: "हम यहीं नहीं रुकते। हमारी टीम वित्तीय साक्षरता सत्र आयोजित करती है ताकि परिवार समझ सकें कि पॉलिसी कैसे काम करती है और इसे जारी रखना उनकी बेटी के लिए सबसे अच्छा निवेश क्यों है।",
    },
    {
        en: "When the policy matures — typically when the girl is 18 to 25 years old — she receives a substantial lump-sum payout. That money is hers. It can fund a college degree, start a small business, secure her after marriage, or simply give her the confidence that she has something of her own. That is what Kanyadan truly means — gifting a daughter not just love, but freedom.",
        hi: "जब पॉलिसी परिपक्व होती है — आमतौर पर जब लड़की 18 से 25 वर्ष की होती है — उसे एक बड़ी एकमुश्त राशि मिलती है। वह राशि उसकी है। यह एक कॉलेज की डिग्री, एक छोटा व्यवसाय, या बस यह आत्मविश्वास दे सकती है कि उसके पास अपना कुछ है। यही सच्चा कन्यादान है।",
    },
];

function KanyadanYojnaPage() {
    const [storyExpanded, setStoryExpanded] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [shareLabel, setShareLabel] = useState("Share");
    const [applyOpen, setApplyOpen] = useState(false);
    const [applySubmitted, setApplySubmitted] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyError, setApplyError] = useState("");
    const [applyForm, setApplyForm] = useState({
        guardianName: "", mobile: "", state: "", district: "",
        village: "", girlName: "", girlAge: "", annualIncome: "",
        howHeard: "", message: "",
    });

    const handleApplyChange = (e) => {
        setApplyForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleApplySubmit = async (e) => {
        e.preventDefault();
        setApplyError("");
        setApplyLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`${API_BASE_URL}/api/kanyadan/apply`, {
                method: "POST",
                headers,
                body: JSON.stringify(applyForm),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Submission failed. Please try again.");
            }
            setApplySubmitted(true);
        } catch (err) {
            setApplyError(err.message);
        } finally {
            setApplyLoading(false);
        }
    };

    const handleApplyClose = () => {
        setApplyOpen(false);
        setApplySubmitted(false);
        setApplyError("");
        setApplyForm({
            guardianName: "", mobile: "", state: "", district: "",
            village: "", girlName: "", girlAge: "", annualIncome: "",
            howHeard: "", message: "",
        });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleShare = async () => {
        const pageUrl = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Kanyadan Yojna — LIC Policy Support for Girls",
                    text: "Our NGO pays the first 3 LIC premiums for underprivileged girls. Support a daughter's future today.",
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
        <section className="kanyadan-detail-page">
            <div className="kanyadan-detail-shell">
                <div className="kanyadan-content-grid">

                    {/* LEFT — MAIN CONTENT */}
                    <div className="kanyadan-main-stack">

                        {/* Hero Banner */}
                        <section className="kanyadan-hero-card">
                            <div className="kanyadan-hero-img-wrap">
                                <img src={heroImg} alt="Kanyadan Yojna — LIC for Girls" />
                                <div className="kanyadan-hero-overlay">
                                    <span className="lic-badge">LIC Policy Support</span>
                                    <h1>Kanyadan Yojna</h1>
                                    <p>We enroll underprivileged girls into LIC life insurance policies and pay the first 3 premiums — so every daughter gets a secured financial future, regardless of her family's income</p>
                                </div>
                            </div>
                        </section>

                        {/* Journey Photo Strip */}
                        <section className="kanyadan-section-card ky-journey-section">
                            <h2>A Daughter's Journey</h2>
                            <p className="ky-section-desc">From a family's worry to a girl's secured future — this is the journey our Kanyadan Yojna makes possible, one premium at a time.</p>
                            <div className="ky-journey-grid">
                                <div className="ky-journey-item">
                                    <img src={beginningImg} alt="The Beginning — underprivileged family" />
                                    <div className="ky-journey-caption">
                                        <span className="ky-journey-step">Step 1</span>
                                        <strong>The Beginning</strong>
                                        <p>An underprivileged family worries about their daughter's financial future</p>
                                    </div>
                                </div>
                                <div className="ky-journey-item">
                                    <img src={helpImg} alt="The Help — NGO enrollment" />
                                    <div className="ky-journey-caption">
                                        <span className="ky-journey-step">Step 2</span>
                                        <strong>The Help</strong>
                                        <p>Our NGO enrolls the girl in a suitable LIC policy and handles all paperwork</p>
                                    </div>
                                </div>
                                <div className="ky-journey-item">
                                    <img src={supportImg} alt="The Support — NGO pays premiums" />
                                    <div className="ky-journey-caption">
                                        <span className="ky-journey-step">Step 3</span>
                                        <strong>The Support</strong>
                                        <p>We pay the first 3 LIC premium installments — completely free for the family</p>
                                    </div>
                                </div>
                                <div className="ky-journey-item">
                                    <img src={futureImg} alt="Her Future — secured and hopeful" />
                                    <div className="ky-journey-caption">
                                        <span className="ky-journey-step">Step 4</span>
                                        <strong>Her Future</strong>
                                        <p>She grows up with a secured financial future, free to pursue her dreams</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Story */}
                        <section className="kanyadan-section-card">
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
                                {storyExpanded ? 'Read Less' : 'Read More'}
                            </button>
                        </section>

                        {/* Goals */}
                        <section className="kanyadan-section-card">
                            <h2>Our Goals</h2>
                            <div className="ky-goals-grid">
                                {GOALS.map((g) => (
                                    <div key={g.label} className="ky-goal-item">
                                        <strong>{g.number}</strong>
                                        <span>{g.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* LIC Benefits */}
                        <section className="kanyadan-section-card">
                            <h2>What the LIC Policy Provides</h2>
                            <p className="ky-section-desc">LIC's Jeevan Tarun and Jeevan Lakshya policies are purpose-built for girl children. Here is what every enrolled girl receives — for life — the moment her policy is activated:</p>
                            <div className="lic-benefits-grid">
                                {LIC_BENEFITS.map((b) => (
                                    <article key={b.title} className="lic-benefit-card">
                                        <div className="lic-benefit-icon">
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
                        <section className="kanyadan-section-card">
                            <h2>What We Provide</h2>
                            <p className="ky-section-desc">Our support goes far beyond paying the first 3 premiums. Here is the full spectrum of what we do for every enrolled girl and her family — from the day of enrollment to the day she receives her maturity payout:</p>
                            <ul className="ky-provide-list">
                                {WHAT_WE_PROVIDE.map((item) => (
                                    <li key={item}>
                                        <FaCheckCircle aria-hidden="true" className="ky-check-icon" />
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
                                        <h3>Verified Process</h3>
                                        <p>Every beneficiary family is independently verified before policy enrollment.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaHandHoldingHeart aria-hidden="true" />
                                    <div>
                                        <h3>Real Impact</h3>
                                        <p>Your donation directly funds the first 3 LIC premiums for a girl's policy.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRegClock aria-hidden="true" />
                                    <div>
                                        <h3>Long-Term Commitment</h3>
                                        <p>We follow up with families throughout the policy term — not just at enrollment.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        {/* Apply CTA */}
                        <section className="kanyadan-section-card ky-apply-cta">
                            <div className="ky-apply-cta-content">
                                <FaUsers className="ky-apply-cta-icon" aria-hidden="true" />
                                <div>
                                    <h2>Is Your Daughter Eligible?</h2>
                                    <p>If your family's annual income is below ₹2.5 lakhs and your daughter is between 1–12 years old, she may qualify for free LIC policy enrollment under our Kanyadan Yojna. Our team will verify your details, handle all paperwork, and pay the first 3 premiums — at absolutely no cost to you.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="campaign-btn campaign-btn-primary ky-apply-cta-btn"
                                onClick={() => setApplyOpen(true)}
                            >
                                Apply for LIC Policy Benefit
                            </button>
                        </section>

                        {/* FAQs */}
                        <section className="kanyadan-section-card faq-section">
                            <h2>Frequently Asked Questions</h2>
                            <p className="faq-intro">Everything you need to know about the LIC policy support program.</p>
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

                    {/* RIGHT — STICKY CAMPAIGN CARD */}
                    <aside className="kanyadan-side-stack">
                        <article className="campaign-card">
                            <div className="campaign-image-wrap">
                                <img src={heroImg} alt="Kanyadan Yojna" />
                                <span className="campaign-chip">LIC Policy Support</span>
                            </div>

                            <div className="campaign-body">
                                <h1>Kanyadan Yojna — LIC for Girls</h1>
                                <p className="campaign-org">Guardian of Angels Trust</p>

                                <div className="ky-premium-highlight">
                                    <FaGift aria-hidden="true" />
                                    <span>NGO pays <strong>first 3 LIC premiums</strong> for every girl</span>
                                </div>

                                <div className="campaign-amounts">
                                    <strong>₹8,43,000</strong>
                                    <span>raised of ₹25,00,000 goal</span>
                                </div>

                                <div className="campaign-progress" aria-hidden="true">
                                    <span className="campaign-progress-fill" style={{ width: "34%" }} />
                                </div>

                                <div className="campaign-stats">
                                    <div>
                                        <strong>168</strong>
                                        <span>Donors</span>
                                    </div>
                                    <div>
                                        <strong>87</strong>
                                        <span>Girls Enrolled</span>
                                    </div>
                                    <div>
                                        <strong>34%</strong>
                                        <span>Funded</span>
                                    </div>
                                </div>

                                <div className="ky-impact-note">
                                    <FaCheckCircle aria-hidden="true" />
                                    <span>₹5,000 funds 3 premiums for 1 girl</span>
                                </div>

                                <div className="campaign-actions">
                                    <Link
                                        to="/donate"
                                        state={{ serviceImage: kanyadanImage, serviceTitle: "Support a daughter's future through Kanyadan Yojna LIC Policy" }}
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
                                <button
                                    type="button"
                                    className="campaign-btn campaign-btn-apply"
                                    onClick={() => setApplyOpen(true)}
                                >
                                    Apply for LIC Policy Benefit
                                </button>
                            </div>
                        </article>

                        <article className="ky-how-it-works-card">
                            <h3>How It Works</h3>
                            <ol className="ky-steps-list">
                                <li>
                                    <span className="ky-step-num">1</span>
                                    <div>
                                        <strong>Family Verification</strong>
                                        <p>We verify the family's income and the girl's eligibility</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="ky-step-num">2</span>
                                    <div>
                                        <strong>Policy Enrollment</strong>
                                        <p>We enroll the girl in a suitable LIC policy and complete all paperwork</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="ky-step-num">3</span>
                                    <div>
                                        <strong>NGO Pays First 3 Premiums</strong>
                                        <p>Our NGO directly pays the first 3 LIC premium installments</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="ky-step-num">4</span>
                                    <div>
                                        <strong>Family Continues the Policy</strong>
                                        <p>The family takes over with our ongoing guidance and support</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="ky-step-num">5</span>
                                    <div>
                                        <strong>Girl Receives Maturity Corpus</strong>
                                        <p>On maturity, she receives a lump-sum for her education or future</p>
                                    </div>
                                </li>
                            </ol>
                        </article>
                    </aside>

                </div>
            </div>

            {/* Apply Modal */}
            {applyOpen && (
                <div className="ky-modal-backdrop" onClick={handleApplyClose}>
                    <div className="ky-modal" onClick={(e) => e.stopPropagation()}>

                        <div className="ky-modal-head">
                            <div>
                                <h3>Apply for Kanyadan Yojna</h3>
                                <p>LIC Policy Support for your Daughter — Free of Cost</p>
                            </div>
                            <button type="button" className="ky-modal-close" onClick={handleApplyClose} aria-label="Close">
                                <FaTimes />
                            </button>
                        </div>

                        {applySubmitted ? (
                            <div className="ky-modal-success">
                                <FaCheckCircle className="ky-success-icon" aria-hidden="true" />
                                <h3>Application Received!</h3>
                                <p>Thank you for reaching out. Our team will contact you within 2–3 working days to verify your details and guide you through the LIC policy enrollment process — at no cost to your family.</p>
                                <button type="button" className="campaign-btn campaign-btn-primary" onClick={handleApplyClose}>
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form className="ky-apply-form" onSubmit={handleApplySubmit}>
                                <div className="ky-form-body">
                                    {applyError && (
                                        <div style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", fontSize: "0.9rem" }}>
                                            {applyError}
                                        </div>
                                    )}
                                    <p className="ky-form-note">
                                        <FaShieldAlt aria-hidden="true" />
                                        All information is kept strictly confidential and used only for enrollment purposes.
                                    </p>

                                    <div className="ky-form-section-title">Parent / Guardian Details</div>

                                    <div className="ky-form-row">
                                        <div className="ky-form-field">
                                            <label htmlFor="guardianName">Full Name *</label>
                                            <input
                                                id="guardianName"
                                                name="guardianName"
                                                type="text"
                                                placeholder="Parent or Guardian's full name"
                                                value={applyForm.guardianName}
                                                onChange={handleApplyChange}
                                                required
                                            />
                                        </div>
                                        <div className="ky-form-field">
                                            <label htmlFor="mobile">Mobile Number *</label>
                                            <input
                                                id="mobile"
                                                name="mobile"
                                                type="tel"
                                                placeholder="10-digit mobile number"
                                                pattern="[6-9][0-9]{9}"
                                                value={applyForm.mobile}
                                                onChange={handleApplyChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="ky-form-row">
                                        <div className="ky-form-field">
                                            <label htmlFor="kyState">State *</label>
                                            <select id="kyState" name="state" value={applyForm.state} onChange={handleApplyChange} required>
                                                <option value="">Select State</option>
                                                <option>Uttar Pradesh</option>
                                                <option>Madhya Pradesh</option>
                                                <option>Bihar</option>
                                                <option>Rajasthan</option>
                                                <option>Jharkhand</option>
                                                <option>Odisha</option>
                                                <option>Chhattisgarh</option>
                                                <option>West Bengal</option>
                                                <option>Maharashtra</option>
                                                <option>Gujarat</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="ky-form-field">
                                            <label htmlFor="district">District *</label>
                                            <input
                                                id="district"
                                                name="district"
                                                type="text"
                                                placeholder="Your district"
                                                value={applyForm.district}
                                                onChange={handleApplyChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="ky-form-field">
                                        <label htmlFor="village">Village / Area</label>
                                        <input
                                            id="village"
                                            name="village"
                                            type="text"
                                            placeholder="Village or locality name"
                                            value={applyForm.village}
                                            onChange={handleApplyChange}
                                        />
                                    </div>

                                    <div className="ky-form-section-title">Girl's Details</div>

                                    <div className="ky-form-row">
                                        <div className="ky-form-field">
                                            <label htmlFor="girlName">Girl's Name *</label>
                                            <input
                                                id="girlName"
                                                name="girlName"
                                                type="text"
                                                placeholder="Full name of the girl"
                                                value={applyForm.girlName}
                                                onChange={handleApplyChange}
                                                required
                                            />
                                        </div>
                                        <div className="ky-form-field">
                                            <label htmlFor="girlAge">Age (in years) *</label>
                                            <input
                                                id="girlAge"
                                                name="girlAge"
                                                type="number"
                                                min="1"
                                                max="12"
                                                placeholder="1 to 12 years"
                                                value={applyForm.girlAge}
                                                onChange={handleApplyChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="ky-form-field">
                                        <label htmlFor="annualIncome">Annual Family Income *</label>
                                        <select id="annualIncome" name="annualIncome" value={applyForm.annualIncome} onChange={handleApplyChange} required>
                                            <option value="">Select income range</option>
                                            <option value="below1L">Below ₹1,00,000</option>
                                            <option value="1to1.5L">₹1,00,000 – ₹1,50,000</option>
                                            <option value="1.5to2L">₹1,50,000 – ₹2,00,000</option>
                                            <option value="2to2.5L">₹2,00,000 – ₹2,50,000</option>
                                        </select>
                                    </div>

                                    <div className="ky-form-field">
                                        <label htmlFor="howHeard">How did you hear about us?</label>
                                        <select id="howHeard" name="howHeard" value={applyForm.howHeard} onChange={handleApplyChange}>
                                            <option value="">Select an option</option>
                                            <option>Social Media</option>
                                            <option>Community / Village Meeting</option>
                                            <option>NGO Volunteer / Field Worker</option>
                                            <option>Friend or Family</option>
                                            <option>Government Office</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div className="ky-form-field">
                                        <label htmlFor="kyMessage">Additional Message (Optional)</label>
                                        <textarea
                                            id="kyMessage"
                                            name="message"
                                            rows="3"
                                            placeholder="Any questions or additional information you'd like to share..."
                                            value={applyForm.message}
                                            onChange={handleApplyChange}
                                        />
                                    </div>
                                </div>

                                <div className="ky-form-footer">
                                    <button type="button" className="campaign-btn campaign-btn-secondary" onClick={handleApplyClose} disabled={applyLoading}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="campaign-btn campaign-btn-primary" disabled={applyLoading}>
                                        {applyLoading ? "Submitting..." : "Submit Application"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

export default KanyadanYojnaPage;