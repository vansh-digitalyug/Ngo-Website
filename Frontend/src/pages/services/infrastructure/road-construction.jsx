import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaChevronDown,
    FaRoad,
    FaRegClock,
    FaShieldAlt,
    FaUserCircle,
    FaTools
} from "react-icons/fa";

// Replace with your actual image path
import roadConstructionImg from "../../../assets/images/infrastructure/road.jpg";
import { useServiceImage } from "../../../hooks/useServiceImage.js";
import "./road-construction.css";

const DONATIONS = [
    { name: "Rajesh Kumar", amount: 50000, note: "Supporting village connectivity" },
    { name: "Meera Singh", amount: 30000, note: "For rural infrastructure" },
    { name: "Arjun Patel", amount: 20000, note: "Building better roads" },
    { name: "Priya Sharma", amount: 15000, note: "Community development" },
    { name: "Vikram Reddy", amount: 12000, note: "Infrastructure matters" },
    { name: "Anjali Verma", amount: 10000, note: "Safe travel for all" },
    { name: "Rohan Desai", amount: 8000, note: "Economic growth support" },
    { name: "Neha Kapoor", amount: 6000, note: "For future generations" },
    { name: "Suresh Iyer", amount: 5000, note: "Happy to contribute" },
    { name: "Pooja Nair", amount: 4000, note: "Building connections" },
    { name: "Aditya Tiwari", amount: 3000, note: "Rural development" },
    { name: "Divya Saxena", amount: 2500, note: "Support the cause" },
    { name: "Anonymous", amount: 2000, note: "Good wishes" },
    { name: "Karan Malhotra", amount: 1500, note: "For better roads" },
];

const FAQS = [
    {
        question: "What does this road construction project cover?",
        questionHi: "यह सड़क निर्माण परियोजना क्या कवर करती है?",
        answer:
            "The project focuses on constructing and repairing roads in rural and semi-urban areas, improving connectivity between villages, markets, and healthcare facilities. We repair potholes, enhance drainage, and ensure safe passage for all vehicles.",
        answerHi:
            "यह परियोजना ग्रामीण और अर्ध-शहरी क्षेत्रों में सड़कों के निर्माण और मरम्मत पर केंद्रित है, गांवों, बाज़ारों और स्वास्थ्य सुविधाओं के बीच कनेक्टिविटी में सुधार करती है। हम गड्ढों की मरम्मत करते हैं, जल निकासी बढ़ाते हैं और सभी वाहनों के लिए सुरक्षित मार्ग सुनिश्चित करते हैं।",
    },
    {
        question: "How will my donation be used?",
        questionHi: "मेरे दान का उपयोग कैसे किया जाएगा?",
        answer:
            "Funds are allocated for purchasing construction materials (cement, bitumen, gravel), labor costs, equipment rental, and supervision by qualified civil engineers. We maintain complete transparency in our spending reports.",
        answerHi:
            "निर्माण सामग्री (सीमेंट, बिटुमेन, बजरी) की खरीद, श्रम लागत, उपकरण किराये और योग्य सिविल इंजीनियरों द्वारा पर्यवेक्षण के लिए धन आवंटित किया जाता है। हम अपनी खर्च रिपोर्ट में पूर्ण पारदर्शिता बनाए रखते हैं।",
    },
    {
        question: "Are the engineers and workers qualified?",
        questionHi: "क्या इंजीनियर और श्रमिक योग्य हैं?",
        answer:
            "Absolutely. All engineers are certified civil professionals registered with the state engineering council. Workers undergo safety training and quality control checks are done at every construction phase.",
        answerHi:
            "बिल्कुल। सभी इंजीनियर राज्य इंजीनियरिंग परिषद में पंजीकृत प्रमाणित सिविल पेशेवर हैं। श्रमिक सुरक्षा प्रशिक्षण से गुजरते हैं और प्रत्येक निर्माण चरण में गुणवत्ता नियंत्रण जांच की जाती है।",
    },
    {
        question: "Is my donation tax-deductible?",
        questionHi: "क्या मेरा दान कर-कटौती योग्य है?",
        answer:
            "Yes. All contributions to this infrastructure initiative are eligible for 80G tax exemption under the Income Tax Act.",
        answerHi:
            "हाँ। इस अवसंरचना पहल में सभी योगदान आयकर अधिनियम के तहत 80G कर छूट के पात्र हैं।",
    },
    {
        question: "How long does a typical road construction project take?",
        questionHi: "एक सामान्य सड़क निर्माण परियोजना में कितना समय लगता है?",
        answer:
            "Depending on the road length and soil conditions, most projects are completed within 3-6 months. Weather and seasonal factors may affect the timeline. We provide monthly progress updates to all donors.",
        answerHi:
            "सड़क की लंबाई और मिट्टी की स्थिति के आधार पर, अधिकांश परियोजनाएं 3-6 महीने के भीतर पूरी हो जाती हैं। मौसम और मौसमी कारक समयरेखा को प्रभावित कर सकते हैं। हम सभी दानदाताओं को मासिक प्रगति अपडेट प्रदान करते हैं।",
    },
];

const STORY = [
    {
        en: "Poor road infrastructure in rural areas severely impacts economic growth, healthcare access, and educational opportunities. Many villages remain isolated, especially during monsoon seasons, affecting trade and emergency services.",
        hi: "ग्रामीण क्षेत्रों में खराब सड़क अवसंरचना आर्थिक विकास, स्वास्थ्य सेवा पहुंच और शैक्षिक अवसरों को गंभीर रूप से प्रभावित करती है। कई गांव विशेष रूप से मानसून के मौसम में अलग-थलग रहते हैं, जिससे व्यापार और आपातकालीन सेवाएं प्रभावित होती हैं।",
    },
    {
        en: "Our road construction initiative aims to transform rural connectivity by building durable, all-weather roads. These projects directly improve agricultural productivity, enable healthcare access, and create employment opportunities.",
        hi: "हमारी सड़क निर्माण पहल टिकाऊ, सभी मौसम की सड़कों का निर्माण करके ग्रामीण कनेक्टिविटी को बदलने का लक्ष्य रखती है। ये परियोजनाएं सीधे कृषि उत्पादकता में सुधार करती हैं, स्वास्थ्य सेवा पहुंच सक्षम करती हैं और रोजगार के अवसर पैदा करती हैं।",
    },
    {
        en: "Your contribution funds materials, skilled labor, and engineering expertise. Every rupee invested builds safer roads that connect communities to markets, schools, and hospitals, creating lasting positive impact for generations.",
        hi: "आपका योगदान सामग्री, कुशल श्रम और इंजीनियरिंग विशेषज्ञता को वित्त पोषित करता है। निवेश किया गया हर रुपया सुरक्षित सड़कें बनाता है जो समुदायों को बाज़ारों, स्कूलों और अस्पतालों से जोड़ती हैं, पीढ़ियों के लिए स्थायी सकारात्मक प्रभाव पैदा करती हैं।",
    },
];

function RoadConstruction() {
    const { coverUrl } = useServiceImage("Road Construction & Repair", roadConstructionImg);
    const img = coverUrl || roadConstructionImg;
    const [storyExpanded, setStoryExpanded] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [shareLabel, setShareLabel] = useState("Share");
    const [donationModalType, setDonationModalType] = useState(null);

    const isDonationModalOpen = donationModalType !== null;
    const sortedDonations = useMemo(
        () => [...DONATIONS].sort((a, b) => b.amount - a.amount),
        []
    );
    const modalDonations =
        donationModalType === "top" ? sortedDonations.slice(0, 10) : sortedDonations;
    const modalTitle = donationModalType === "top" ? "Top Donations" : "All Donations";

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!isDonationModalOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                setDonationModalType(null);
            }
        };

        window.addEventListener("keydown", closeOnEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [isDonationModalOpen]);

    const formatAmount = (amount) => `Rs ${amount.toLocaleString("en-IN")}`;

    const handleShare = async () => {
        const pageUrl = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Support Rural Road Construction",
                    text: "Help build roads that connect rural communities to opportunities.",
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
        <section className="road-detail-page">
            <div className="road-detail-shell">
                <div className="road-content-grid">
                    <aside className="road-side-stack">
                        <article className="campaign-card">
                            <div className="campaign-image-wrap">
                                <img src={roadConstructionImg} alt="Road construction and infrastructure development" />
                                <span className="campaign-chip">Tax Benefits Available</span>
                            </div>

                            <div className="campaign-body">
                                <h1>Support Rural Road Construction for Community Connectivity</h1>
                                <p className="campaign-org">by Rural Infrastructure Development Trust</p>

                                <div className="campaign-amounts">
                                    <strong>Rs 45,00,000</strong>
                                    <span>raised of Rs 1,00,00,000 goal</span>
                                </div>

                                <div className="campaign-progress" aria-hidden="true">
                                    <span className="campaign-progress-fill" style={{ width: "45%" }} />
                                </div>

                                <div className="campaign-stats">
                                    <div>
                                        <strong>342</strong>
                                        <span>Donors</span>
                                    </div>
                                    <div>
                                        <strong>45</strong>
                                        <span>Days left</span>
                                    </div>
                                    <div>
                                        <strong>45%</strong>
                                        <span>Funded</span>
                                    </div>
                                </div>

                                <div className="campaign-actions">
                                    <Link to="/donate" state={{ serviceImage: roadConstructionImg, serviceTitle: "Support Rural Road Construction for Community Connectivity" }} className="campaign-btn campaign-btn-primary">
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
                    </aside>

                    <div className="road-main-stack">
                        <section className="road-section-card">
                            <h2>The Cause</h2>
                            <div className={`story-content ${storyExpanded ? "expanded" : ""}`}>
                                {STORY.map((item, idx) => (
                                    <p key={idx}>{item.en}</p>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="text-action"
                                onClick={() => setStoryExpanded((current) => !current)}
                            >
                                {storyExpanded ? "Read Less" : "Read More"}
                            </button>
                        </section>

                        <section className="road-section-card">
                            <div className="section-head">
                                <h2>Recent Donations</h2>
                                <span>{sortedDonations.length} Donations</span>
                            </div>

                            <div className="donation-list">
                                {sortedDonations.slice(0, 3).map((donation) => (
                                    <article key={`${donation.name}-${donation.amount}`} className="donation-item">
                                        <FaUserCircle aria-hidden="true" />
                                        <div>
                                            <h3>{donation.name}</h3>
                                            <p>{formatAmount(donation.amount)}</p>
                                        </div>
                                        <span>{donation.note}</span>
                                    </article>
                                ))}
                            </div>

                            <div className="section-links">
                                <button type="button" onClick={() => setDonationModalType("top")}>
                                    View Top Donations
                                </button>
                                <button type="button" onClick={() => setDonationModalType("all")}>
                                    View All Donations
                                </button>
                            </div>
                        </section>

                        <section className="support-panel">
                            <h2>Support this infrastructure mission</h2>
                            <p>Every donation funds quality materials and skilled workers for road construction.</p>
                            <div className="support-actions">
                                <Link to="/donate" state={{ serviceImage: roadConstructionImg, serviceTitle: "Support Rural Road Construction for Community Connectivity" }} className="campaign-btn campaign-btn-primary">
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
                        </section>

                        <section className="road-section-card">
                            <h2>Organizers</h2>
                            <div className="organizer-list">
                                <article className="organizer-item">
                                    <span className="organizer-logo">RI</span>
                                    <div>
                                        <h3>Rural Infrastructure Development Trust</h3>
                                        <p>Verified Development Organization</p>
                                    </div>
                                </article>
                                <article className="organizer-item">
                                    <span className="organizer-logo organizer-logo-alt">
                                        <FaTools size={18} />
                                    </span>
                                    <div>
                                        <h3>BuildCommunity</h3>
                                        <p>Construction Partner</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section className="trust-strip">
                            <h2>Your impact is secure and verified</h2>
                            <div className="trust-grid">
                                <article>
                                    <FaShieldAlt aria-hidden="true" />
                                    <div>
                                        <h3>Secure</h3>
                                        <p>100% secure payment processing with top-tier encryption.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRoad aria-hidden="true" />
                                    <div>
                                        <h3>Community Impact</h3>
                                        <p>Directly funds roads that connect villages and enable economic growth.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRegClock aria-hidden="true" />
                                    <div>
                                        <h3>Transparent</h3>
                                        <p>All construction bills and progress reports are shared with donors.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section className="road-section-card faq-section">
                            <h2>FAQs</h2>
                            <p className="faq-intro">Common questions about road construction projects.</p>

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
                </div>
            </div>

            {isDonationModalOpen && (
                <div
                    className="donation-modal-backdrop"
                    role="presentation"
                    onClick={() => setDonationModalType(null)}
                >
                    <div
                        className="donation-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={modalTitle}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="donation-modal-head">
                            <h3>{modalTitle}</h3>
                            <button
                                type="button"
                                className="donation-modal-close"
                                onClick={() => setDonationModalType(null)}
                                aria-label="Close donations popup"
                            >
                                x
                            </button>
                        </div>
                        <p className="donation-modal-subtitle">
                            Showing {modalDonations.length} contributions to this road construction project
                        </p>
                        <div className="donation-modal-list">
                            {modalDonations.map((donation) => (
                                <article
                                    key={`${donation.name}-${donation.amount}-modal`}
                                    className="donation-item donation-item-modal"
                                >
                                    <FaUserCircle aria-hidden="true" />
                                    <div>
                                        <h3>{donation.name}</h3>
                                        <p>{formatAmount(donation.amount)}</p>
                                    </div>
                                    <span>{donation.note}</span>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default RoadConstruction;
