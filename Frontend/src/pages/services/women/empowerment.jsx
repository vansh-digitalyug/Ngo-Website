import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaChevronDown,
    FaChevronLeft,
    FaChevronRight,
    FaHandHoldingHeart,
    FaRegClock,
    FaShieldAlt,
    FaCheckCircle,
    FaStar,
    FaUsers,
    FaRupeeSign,
    FaHome,
    FaBoxOpen,
    FaHeart,
} from "react-icons/fa";
import empowerImg1 from "../../../assets/images/women/empowerment/image1.png";
import empowerImg2 from "../../../assets/images/women/empowerment/image2.png";
import empowerImg3 from "../../../assets/images/women/empowerment/image3.png";
import empowerImg4 from "../../../assets/images/women/empowerment/image4.png";
import empowerImg5 from "../../../assets/images/women/empowerment/image5.png";
import { useServiceImage } from "../../../hooks/useServiceImage.js";
import "./empowerment.css";

const CAROUSEL_SLIDES = [
    {
        img: empowerImg1,
        caption: "Women working together in their home making agarbatti (incense sticks) — our seed money helped them set up this joint production unit that now supplies local markets every week.",
    },
    {
        img: empowerImg2,
        caption: "Two women happily preparing homemade mango achar using traditional spices — funded through our program, their pickle-making unit now sells jars to households and shops across the neighbourhood.",
    },
    {
        img: empowerImg3,
        caption: "Women from the same village preparing papad and food items together in their courtyard — a shared home production unit that brings income to multiple families from a single investment.",
    },
    {
        img: empowerImg4,
        caption: "A woman running her own candle-making production unit from home — she pours, sets, and sells handcrafted candles to shops and festival markets, all from a workspace within her house.",
    },
    {
        img: empowerImg5,
        caption: "A woman preparing natural herbal soaps in her home unit — her products are sold under her own brand at local stores, turning a small seed fund into a sustainable daily income.",
    },
];

const EMP_BENEFITS = [
    {
        icon: FaRupeeSign,
        title: "Seed Money to Start a Home Unit",
        desc: "We provide direct financial support to women so they can purchase raw materials, basic equipment, and packaging needed to launch their own home-based production unit — no loans, no repayments.",
    },
    {
        icon: FaHome,
        title: "Production Right From Home",
        desc: "Every unit is set up inside the woman's own home — no need to travel, rent a space, or leave family responsibilities. She earns without stepping out.",
    },
    {
        icon: FaBoxOpen,
        title: "Wide Range of Products Supported",
        desc: "From agarbatti making and pickle preparation to candle crafting and herbal soap production — we fund any home-based unit that has clear local demand and can generate steady income.",
    },
    {
        icon: FaHeart,
        title: "Dignity, Independence & Family Security",
        desc: "When a woman earns from home, she gains financial independence, respect in the household, and the ability to invest in her children's education and family's health.",
    },
];

const WHAT_WE_PROVIDE = [
    "One-time seed money to purchase raw materials and basic equipment for the home production unit",
    "Support for agarbatti making, pickle and achar preparation, papad rolling, candle making, soap making, and similar cottage products",
    "No repayment required — the fund is a grant, not a loan, so women start earning without any financial pressure",
    "Follow-up visits by our field team to check on the unit's progress and provide additional support if needed",
    "Help connecting women with local vendors, market stalls, and neighbourhood buyers for their finished products",
    "Support for women from below-poverty-line families, widows, and those with no other source of income",
    "Priority given to women in rural and semi-urban areas where employment opportunities are extremely limited",
    "Additional support for women who want to expand their unit after their first production cycle succeeds",
];

const GOALS = [
    { number: "1,200+", label: "Women Supported" },
    { number: "8+", label: "Products Funded" },
    { number: "4 yrs", label: "Program Running" },
    { number: "95%", label: "Units Still Active" },
];

const FAQS = [
    {
        question: "What exactly does your organization provide to women?",
        answer: "We provide direct financial support — seed money — so a woman can purchase the raw materials and basic equipment she needs to start a home-based production unit. We do not provide training; we fund the setup so she can begin earning from a skill she already has.",
    },
    {
        question: "What kinds of home production units do you fund?",
        answer: "We fund any home-based cottage industry that has clear local demand. This includes agarbatti making, pickle and achar preparation, papad rolling, candle making, herbal soap production, pappad, namkeen, and similar food or household product units.",
    },
    {
        question: "Is this a loan that the woman has to repay?",
        answer: "No. The financial support we provide is a grant, not a loan. There is no repayment required. We believe that a woman starting her first production unit should be free from financial pressure so she can focus entirely on building her income.",
    },
    {
        question: "Who is eligible for this support?",
        answer: "Women from below-poverty-line families, widows, and women with no other source of income are given priority. We especially focus on rural and semi-urban women who already have a skill or product idea but lack the money to buy materials and equipment.",
    },
    {
        question: "How does a woman apply for the support?",
        answer: "Our field team identifies eligible women through community visits, panchayat recommendations, and partner NGO referrals. Women can also approach us directly through our contact channels. Each case is reviewed personally before support is disbursed.",
    },
    {
        question: "Is my donation eligible for tax exemption?",
        answer: "Yes. All donations to our NGO are eligible for 80G tax deduction under the Income Tax Act. An official receipt and tax certificate will be sent to you after your donation.",
    },
];

// const STORY = [
//     {
//         en: "Behind every jar of homemade pickle, every bundle of agarbatti, and every handcrafted candle sold at a local market, there is a woman who chose to build her own future. But that choice is not always free — it costs money to buy raw materials, it costs money to get the right tools, and for a woman from a low-income household, that money simply does not exist.",
//         hi: "हर घर में बनी अचार की बोतल के पीछे, हर अगरबत्ती के बंडल के पीछे और हर स्थानीय बाजार में बिकने वाली हाथ से बनी मोमबत्ती के पीछे एक महिला है जिसने अपना भविष्य बनाने का फैसला किया। लेकिन उस फैसले के लिए पैसे चाहिए — कच्चा माल, सही उपकरण — और कम आय वाले परिवार की महिला के पास यह पैसा नहीं होता।",
//     },
//     {
//         en: "Our Women Empowerment Program does one simple thing: we give women the money they need to get started. No training, no conditions, no repayment. Just the seed fund that turns an idea into a working production unit inside her own home. From agarbatti making in a village courtyard to herbal soap production in a small kitchen — we fund the beginning so she can own the rest.",
//         hi: "हमारा महिला सशक्तिकरण कार्यक्रम एक सरल काम करता है: हम महिलाओं को शुरुआत के लिए ज़रूरी पैसे देते हैं। कोई प्रशिक्षण नहीं, कोई शर्त नहीं, कोई वापसी नहीं। बस वह बीज निधि जो एक विचार को उसके अपने घर के भीतर एक कार्यशील उत्पादन इकाई में बदल देती है।",
//     },
//     {
//         en: "The women we support do not need someone to teach them. They already know how to make achar, how to roll agarbatti, how to prepare papad — these are skills passed down through generations. What they need is the capital to turn those skills into income. That is exactly what we provide.",
//         hi: "जिन महिलाओं का हम समर्थन करते हैं, उन्हें किसी से सीखने की ज़रूरत नहीं है। वे पहले से ही अचार बनाना, अगरबत्ती लपेटना, पापड़ बनाना जानती हैं — ये पीढ़ियों से चली आ रही कलाएं हैं। उन्हें जो चाहिए वह है पूंजी — अपने हुनर को आय में बदलने के लिए।",
//     },
//     {
//         en: "A unit that starts with ₹3,000 in raw materials can generate ₹8,000–₹12,000 per month within a few weeks. That income changes everything — it pays for a child's school fees, buys medicine, and gives a woman something no one can take away: the confidence that comes from earning your own money.",
//         hi: "₹3,000 के कच्चे माल से शुरू होने वाली एक इकाई कुछ ही हफ्तों में प्रति माह ₹8,000–₹12,000 कमा सकती है। यह आय सब कुछ बदल देती है — बच्चे की स्कूल फीस, दवाइयां, और एक महिला को वह देती है जो कोई नहीं छीन सकता: अपनी कमाई का आत्मविश्वास।",
//     },
// ];

function PageCarousel() {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setIdx((i) => (i + 1) % CAROUSEL_SLIDES.length), 3500);
        return () => clearInterval(t);
    }, []);

    const prev = () => setIdx((i) => (i - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
    const next = () => setIdx((i) => (i + 1) % CAROUSEL_SLIDES.length);

    return (
        <div className="emp-page-carousel">
            <div className="emp-page-carousel-track">
                {CAROUSEL_SLIDES.map((slide, i) => (
                    <div
                        key={i}
                        className={`emp-page-carousel-slide${i === idx ? " active" : ""}`}
                    >
                        <img src={slide.img} alt={`Women empowerment — slide ${i + 1}`} />
                    </div>
                ))}
                <button type="button" className="emp-carousel-arrow left" onClick={prev} aria-label="Previous image">
                    <FaChevronLeft />
                </button>
                <button type="button" className="emp-carousel-arrow right" onClick={next} aria-label="Next image">
                    <FaChevronRight />
                </button>
                <div className="emp-carousel-dots">
                    {CAROUSEL_SLIDES.map((_, i) => (
                        <span
                            key={i}
                            className={`emp-carousel-dot${i === idx ? " active" : ""}`}
                            onClick={() => setIdx(i)}
                        />
                    ))}
                </div>
            </div>
            <p className="emp-page-carousel-caption">{CAROUSEL_SLIDES[idx].caption}</p>
        </div>
    );
}

function WomenEmpowermentPage() {
    const { coverUrl, galleryUrls } = useServiceImage("Women Skill Development", empowerImg1);
    const g = (i, fallback) => galleryUrls[i] || fallback;
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
                    title: "Women Empowerment — Home Production Unit Support",
                    text: "Help women set up home-based production units and earn their own income.",
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
        <section className="emp-detail-page">
            <div className="emp-detail-shell">
                <div className="emp-content-grid">

                    {/* LEFT — MAIN CONTENT */}
                    <div className="emp-main-stack">

                        {/* Hero Banner */}
                        <section className="emp-hero-card">
                            <div className="emp-hero-img-wrap">
                                <img src={empowerImg1} alt="Women making agarbatti in their home production unit" />
                                <div className="emp-hero-overlay">
                                    <span className="emp-badge">Women Empowerment</span>
                                    <h1>Home Production Unit Support Program</h1>
                                    <p>We give women the seed money to set up a production unit inside their own home — so they can earn an income, support their family, and stand on their own feet</p>
                                </div>
                            </div>
                        </section>

                        {/* Photo Carousel — Women in Action */}
                        <section className="emp-section-card emp-carousel-section">
                            <h2>Women at Work — Real Stories, Real Units</h2>
                            <p className="emp-section-desc">These are the women our program has supported. Each photograph shows a real home production unit — from agarbatti making to pickle preparation to herbal soap crafting — all running from inside a woman's home.</p>
                            <PageCarousel />
                        </section>

                        {/* Story */}
                        <section className="emp-section-card">
                            <h2>Our Initiative</h2>
                            <div className={`emp-story-content ${storyExpanded ? "expanded" : ""}`}>
                                {STORY.map((item, idx) => (
                                    <p key={idx}>{item.en}</p>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="emp-text-action"
                                onClick={() => setStoryExpanded((c) => !c)}
                            >
                                {storyExpanded ? "Read Less" : "Read More"}
                            </button>
                        </section>

                        {/* Goals */}
                        <section className="emp-section-card">
                            <h2>Our Impact So Far</h2>
                            <div className="emp-goals-grid">
                                {GOALS.map((g) => (
                                    <div key={g.label} className="emp-goal-item">
                                        <strong>{g.number}</strong>
                                        <span>{g.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Benefits */}
                        <section className="emp-section-card">
                            <h2>What We Do For Every Woman</h2>
                            <p className="emp-section-desc">We keep it simple. No training programs, no complicated schemes. We provide the money, she runs the unit, she keeps the income:</p>
                            <div className="emp-benefits-grid">
                                {EMP_BENEFITS.map((b) => (
                                    <article key={b.title} className="emp-benefit-card">
                                        <div className="emp-benefit-icon">
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
                        <section className="emp-section-card">
                            <h2>Exactly What Your Donation Funds</h2>
                            <p className="emp-section-desc">Every rupee donated goes directly to a woman's home production unit. Here is a complete picture of what we support:</p>
                            <ul className="emp-provide-list">
                                {WHAT_WE_PROVIDE.map((item) => (
                                    <li key={item}>
                                        <FaCheckCircle aria-hidden="true" className="emp-check-icon" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Trust Strip */}
                        <section className="emp-trust-strip">
                            <h2>Why Trust Us</h2>
                            <div className="emp-trust-grid">
                                <article>
                                    <FaShieldAlt aria-hidden="true" />
                                    <div>
                                        <h3>Directly Verified</h3>
                                        <p>Our field team personally visits and verifies each woman before any support is disbursed.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaHandHoldingHeart aria-hidden="true" />
                                    <div>
                                        <h3>No Middlemen</h3>
                                        <p>Your donation goes directly to the woman's unit — no overhead, no bureaucracy, no delays.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRegClock aria-hidden="true" />
                                    <div>
                                        <h3>Follow-Up Support</h3>
                                        <p>We revisit each unit to ensure the production is running and provide additional help if needed.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        {/* Impact CTA */}
                        <section className="emp-section-card emp-impact-cta">
                            <div className="emp-impact-cta-content">
                                <FaUsers className="emp-impact-cta-icon" aria-hidden="true" />
                                <div>
                                    <h2>₹3,000 Sets Up One Woman's Entire Production Unit</h2>
                                    <p>₹3,000 buys the raw materials and basic equipment a woman needs to start her home production unit. Within weeks she can be earning ₹8,000–₹12,000 a month — feeding her family, paying school fees, and building a life she controls. All donations are eligible for 80G tax exemption.</p>
                                </div>
                            </div>
                            <Link
                                to="/donate"
                                state={{ serviceImage: empowerImg2, serviceTitle: "Help a Woman Set Up a Home Production Unit" }}
                                className="emp-campaign-btn emp-campaign-btn-primary emp-impact-cta-btn"
                            >
                                Fund a Woman's Unit Today
                            </Link>
                        </section>

                        {/* FAQs */}
                        <section className="emp-section-card emp-faq-section">
                            <h2>Frequently Asked Questions</h2>
                            <p className="emp-faq-intro">Everything you need to know about how we support women through home production units.</p>
                            <div className="emp-faq-list">
                                {FAQS.map((faq, index) => {
                                    const isOpen = openFaq === index;
                                    return (
                                        <article key={index} className={`emp-faq-item ${isOpen ? "open" : ""}`}>
                                            <button
                                                type="button"
                                                className="emp-faq-question"
                                                onClick={() => setOpenFaq(isOpen ? null : index)}
                                                aria-expanded={isOpen}
                                            >
                                                <span>{faq.question}</span>
                                                <FaChevronDown aria-hidden="true" />
                                            </button>
                                            {isOpen && <p className="emp-faq-answer">{faq.answer}</p>}
                                        </article>
                                    );
                                })}
                            </div>
                        </section>

                    </div>

                    {/* RIGHT — STICKY CAMPAIGN CARD */}
                    <aside className="emp-side-stack">
                        <article className="emp-campaign-card">
                            <div className="emp-campaign-image-wrap">
                                <img src={empowerImg2} alt="Women making homemade achar in their home production unit" />
                                <span className="emp-campaign-chip">Women Empowerment</span>
                            </div>

                            <div className="emp-campaign-body">
                                <h1>Help a woman set up a home production unit and earn her own income</h1>
                                <p className="emp-campaign-org">Guardian of Angels Trust</p>

                                <div className="emp-premium-highlight">
                                    <FaRupeeSign aria-hidden="true" />
                                    <span>₹3,000 sets up <strong>1 complete home production unit</strong></span>
                                </div>

                                <div className="emp-campaign-amounts">
                                    <strong>₹3,60,000</strong>
                                    <span>raised of ₹6,00,000 goal</span>
                                </div>

                                <div className="emp-campaign-progress" aria-hidden="true">
                                    <span className="emp-campaign-progress-fill" style={{ width: "60%" }} />
                                </div>

                                <div className="emp-campaign-stats">
                                    <div>
                                        <strong>189</strong>
                                        <span>Donors</span>
                                    </div>
                                    <div>
                                        <strong>1,200+</strong>
                                        <span>Women</span>
                                    </div>
                                    <div>
                                        <strong>60%</strong>
                                        <span>Funded</span>
                                    </div>
                                </div>

                                <div className="emp-impact-note">
                                    <FaStar aria-hidden="true" />
                                    <span>80G tax exemption on all donations</span>
                                </div>

                                <div className="emp-campaign-actions">
                                    <Link
                                        to="/donate"
                                        state={{ serviceImage: empowerImg2, serviceTitle: "Help a Woman Set Up a Home Production Unit" }}
                                        className="emp-campaign-btn emp-campaign-btn-primary"
                                    >
                                        Help Now
                                    </Link>
                                    <button
                                        type="button"
                                        className="emp-campaign-btn emp-campaign-btn-secondary"
                                        onClick={handleShare}
                                    >
                                        {shareLabel}
                                    </button>
                                </div>
                            </div>
                        </article>

                        <article className="emp-how-it-works-card">
                            <h3>How It Works</h3>
                            <ol className="emp-steps-list">
                                <li>
                                    <span className="emp-step-num">1</span>
                                    <div>
                                        <strong>Woman Identified</strong>
                                        <p>Our field team identifies a woman from a low-income household who has a product idea and the skills to produce it</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="emp-step-num">2</span>
                                    <div>
                                        <strong>Unit Plan Reviewed</strong>
                                        <p>We assess the product, estimate the cost of raw materials and equipment needed to start the unit</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="emp-step-num">3</span>
                                    <div>
                                        <strong>Seed Money Released</strong>
                                        <p>The full seed amount is given directly to the woman — no loan, no conditions, no repayment</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="emp-step-num">4</span>
                                    <div>
                                        <strong>Unit Starts Production</strong>
                                        <p>She buys materials, sets up the unit at home, and begins producing and selling her products</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="emp-step-num">5</span>
                                    <div>
                                        <strong>Follow-Up & Growth</strong>
                                        <p>Our team revisits to check progress and offer additional support if the unit is ready to expand</p>
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

export default WomenEmpowermentPage;
