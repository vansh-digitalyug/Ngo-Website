import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaChevronDown,
    FaHeartbeat,
    FaRegClock,
    FaShieldAlt,
    FaUserCircle,
    FaStethoscope
} from "react-icons/fa";

// Replace with your actual image path
import kidneyCareImg from "../../../assets/images/Medical/kidney.jpg";
import { useServiceImage } from "../../../hooks/useServiceImage.js";
import "./kidney.css";

const DONATIONS = [
    { name: "Suresh Gupta", amount: 50000, note: "For dialysis sessions" },
    { name: "Anita Kapoor", amount: 20000, note: "Keep fighting" },
    { name: "Rajat Sharma", amount: 15000, note: "Donating for the cause" },
    { name: "Deepika Padukone", amount: 10000, note: "Health is wealth" },
    { name: "Amitabh Bachchan", amount: 8000, note: "Stay strong" },
    { name: "Meena Iyer", amount: 5000, note: "For medical aid" },
    { name: "Anonymous", amount: 3000, note: "God bless all" },
    { name: "Rahul Dravid", amount: 2500, note: "Small help from my side" },
    { name: "Sneha Reddy", amount: 2000, note: "Stay hopeful" },
    { name: "Vinod Khanna", amount: 1500, note: "Best wishes" },
    { name: "Anonymous", amount: 1000, note: "Keep going" },
    { name: "Kavita Singh", amount: 750, note: "For essential care" },
    { name: "Anonymous", amount: 500, note: "Blessings" },
    { name: "Arun Jaitley", amount: 500, note: "Support the needy" },
];

const FAQS = [
    {
        question: "What kidney support do you provide?",
        questionHi: "आप किस प्रकार की किडनी सहायता प्रदान करते हैं?",
        answer:
            "We provide financial assistance for dialysis sessions, essential medications, and pre-transplant diagnostic tests for patients in need.",
        answerHi:
            "हम डायलिसिस सत्र, आवश्यक दवाओं और प्रत्यारोपण-पूर्व नैदानिक परीक्षणों के लिए जरूरतमंद रोगियों को वित्तीय सहायता प्रदान करते हैं।",
    },
    {
        question: "How is my donation used for kidney patients?",
        questionHi: "मेरा दान किडनी रोगियों के लिए कैसे उपयोग किया जाता है?",
        answer:
            "Donations directly cover the recurring costs of dialysis, which many underprivileged families cannot afford on a long-term basis.",
        answerHi:
            "दान सीधे डायलिसिस की आवर्ती लागत को कवर करता है, जो कई वंचित परिवार दीर्घकालिक आधार पर वहन नहीं कर सकते।",
    },
    {
        question: "Do you help with kidney transplant costs?",
        questionHi: "क्या आप किडनी प्रत्यारोपण की लागत में मदद करते हैं?",
        answer:
            "While our primary focus is on ongoing dialysis support, we do provide partial financial assistance for life-saving transplant surgeries based on medical board approvals.",
        answerHi:
            "जबकि हमारा प्राथमिक ध्यान चल रहे डायलिसिस सहायता पर है, हम चिकित्सा बोर्ड की मंजूरी के आधार पर जीवन रक्षक प्रत्यारोपण सर्जरी के लिए आंशिक वित्तीय सहायता प्रदान करते हैं।",
    },
    {
        question: "How can I refer a patient for kidney care assistance?",
        questionHi: "मैं किडनी देखभाल सहायता के लिए किसी मरीज को कैसे रेफर कर सकता हूँ?",
        answer:
            "Submit medical reports and financial status proof via our application form. Our team reviews all cases for eligibility and transparency.",
        answerHi:
            "हमारे आवेदन फॉर्म के माध्यम से चिकित्सा रिपोर्ट और वित्तीय स्थिति प्रमाण जमा करें। हमारी टीम पात्रता और पारदर्शिता के लिए सभी मामलों की समीक्षा करती है।",
    },
    {
        question: "Can I volunteer for kidney health awareness camps?",
        questionHi: "क्या मैं किडनी स्वास्थ्य जागरूकता शिविरों के लिए स्वयंसेवा कर सकता हूँ?",
        answer:
            "Yes! We regularly hold awareness sessions on preventive kidney health and chronic kidney disease management. Reach out to join our volunteer base.",
        answerHi:
            "हाँ! हम नियमित रूप से निवारक किडनी स्वास्थ्य और क्रोनिक किडनी रोग प्रबंधन पर जागरूकता सत्र आयोजित करते हैं। हमारे स्वयंसेवक आधार में शामिल होने के लिए संपर्क करें।",
    },
];

const STORY = [
    {
        en: "Chronic Kidney Disease (CKD) often requires regular dialysis, which is expensive and physically draining. For families with limited income, the recurring cost of treatment becomes an insurmountable barrier.",
        hi: "क्रोनिक किडनी रोग (CKD) में अक्सर नियमित डायलिसिस की आवश्यकता होती है, जो महंगा और शारीरिक रूप से थकाऊ होता है। सीमित आय वाले परिवारों के लिए, उपचार की आवर्ती लागत एक दुर्गम बाधा बन जाती है।",
    },
    {
        en: "Our 'Kidney Care & Dialysis Support' initiative helps bridge this gap. We provide financial aid to ensure that patients do not miss their life-saving sessions due to lack of funds.",
        hi: "हमारी 'किडनी केयर एंड डायलिसिस सपोर्ट' पहल इस अंतर को पाटने में मदद करती है। हम वित्तीय सहायता प्रदान करते हैं ताकि यह सुनिश्चित हो सके कि मरीज धन की कमी के कारण अपने जीवन रक्षक सत्र न चूकें।",
    },
    {
        en: "Your contribution makes a tangible difference. Every donation helps us cover treatment costs, ensuring that kidney patients can lead more stable and hopeful lives while they wait for long-term solutions.",
        hi: "आपका योगदान एक ठोस अंतर लाता है। हर दान हमें उपचार की लागत को कवर करने में मदद करता है, यह सुनिश्चित करता है कि किडनी के मरीज दीर्घकालिक समाधान की प्रतीक्षा करते हुए अधिक स्थिर और आशापूर्ण जीवन जी सकें।",
    },
];

function KidneySupport() {
    const { coverUrl } = useServiceImage("Kidney Patient Support", kidneyCareImg);
    const img = coverUrl || kidneyCareImg;
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
                    title: "Support Kidney Dialysis",
                    text: "Help provide life-saving dialysis sessions to those in need.",
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
        <section className="kidney-detail-page">
            <div className="kidney-detail-shell">
                <div className="kidney-content-grid">
                    <aside className="kidney-side-stack">
                        <article className="kidney-campaign-card">
                            <div className="kidney-campaign-image-wrap">
                                <img src={kidneyCareImg} alt="Kidney care and dialysis support" />
                                <span className="kidney-campaign-chip">Tax Benefits Available</span>
                            </div>

                            <div className="kidney-campaign-body">
                                <h1>Support Life-Saving Kidney Dialysis & Care</h1>
                                <p className="kidney-campaign-org">by Arogya Care Foundation</p>

                                <div className="kidney-campaign-amounts">
                                    <strong>Rs 4,20,000</strong>
                                    <span>raised of Rs 8,00,000 goal</span>
                                </div>

                                <div className="kidney-campaign-progress" aria-hidden="true">
                                    <span className="kidney-campaign-progress-fill" style={{ width: "52.5%" }} />
                                </div>

                                <div className="kidney-campaign-stats">
                                    <div>
                                        <strong>275</strong>
                                        <span>Donors</span>
                                    </div>
                                    <div>
                                        <strong>12</strong>
                                        <span>Days left</span>
                                    </div>
                                    <div>
                                        <strong>52%</strong>
                                        <span>Funded</span>
                                    </div>
                                </div>

                                <div className="kidney-campaign-actions">
                                    <Link to="/donate" state={{ serviceImage: kidneyCareImg, serviceTitle: "Support Life-Saving Kidney Dialysis & Care" }} className="kidney-campaign-btn kidney-campaign-btn-primary">
                                        Help Now
                                    </Link>
                                    <button
                                        type="button"
                                        className="kidney-campaign-btn kidney-campaign-btn-secondary"
                                        onClick={handleShare}
                                    >
                                        {shareLabel}
                                    </button>
                                </div>
                            </div>
                        </article>
                    </aside>

                    <div className="kidney-main-stack">
                        <section className="kidney-section-card">
                            <h2>Story</h2>
                            <div className={`kidney-story-content ${storyExpanded ? "expanded" : ""}`}>
                                {STORY.map((item, idx) => (
                                    <p key={idx}>{item.en}</p>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="kidney-text-action"
                                onClick={() => setStoryExpanded((current) => !current)}
                            >
                                {storyExpanded ? "Read Less" : "Read More"}
                            </button>
                        </section>

                        <section className="kidney-section-card">
                            <div className="kidney-section-head">
                                <h2>Recent Donations</h2>
                                <span>275 Donations</span>
                            </div>

                            <div className="kidney-donation-list">
                                {sortedDonations.slice(0, 3).map((donation) => (
                                    <article key={`${donation.name}-${donation.amount}`} className="kidney-donation-item">
                                        <FaUserCircle aria-hidden="true" />
                                        <div>
                                            <h3>{donation.name}</h3>
                                            <p>{formatAmount(donation.amount)}</p>
                                        </div>
                                        <span>{donation.note}</span>
                                    </article>
                                ))}
                            </div>

                            <div className="kidney-section-links">
                                <button type="button" onClick={() => setDonationModalType("top")}>
                                    View Top Donations
                                </button>
                                <button type="button" onClick={() => setDonationModalType("all")}>
                                    View All Donations
                                </button>
                            </div>
                        </section>

                        <section className="kidney-support-panel">
                            <h2>Support this mission</h2>
                            <p>Every small contribution ensures a dialysis session for someone in need.</p>
                            <div className="kidney-support-actions">
                                <Link to="/donate" state={{ serviceImage: kidneyCareImg, serviceTitle: "Support Life-Saving Kidney Dialysis & Care" }} className="kidney-campaign-btn kidney-campaign-btn-primary">
                                    Help Now
                                </Link>
                                <button
                                    type="button"
                                    className="kidney-campaign-btn kidney-campaign-btn-secondary"
                                    onClick={handleShare}
                                >
                                    Share
                                </button>
                            </div>
                        </section>

                        <section className="kidney-section-card">
                            <h2>Organizers</h2>
                            <div className="kidney-organizer-list">
                                <article className="kidney-organizer-item">
                                    <span className="kidney-organizer-logo">AC</span>
                                    <div>
                                        <h3>Arogya Care Foundation</h3>
                                        <p>Verified Medical Charity</p>
                                    </div>
                                </article>
                                <article className="kidney-organizer-item">
                                    <span className="kidney-organizer-logo kidney-organizer-logo-alt">
                                        <FaStethoscope size={18} />
                                    </span>
                                    <div>
                                        <h3>LifeConnect</h3>
                                        <p>Campaign Partner</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section className="kidney-trust-strip">
                            <h2>Your impact is secure and verified</h2>
                            <div className="kidney-trust-grid">
                                <article>
                                    <FaShieldAlt aria-hidden="true" />
                                    <div>
                                        <h3>Secure</h3>
                                        <p>100% secure payment processing with top-tier encryption.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaHeartbeat aria-hidden="true" />
                                    <div>
                                        <h3>Life-Saving</h3>
                                        <p>Directly funds treatments, dialysis cycles, and crucial medication.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRegClock aria-hidden="true" />
                                    <div>
                                        <h3>Transparent</h3>
                                        <p>All medical bills and impact reports are shared with donors.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section className="kidney-section-card kidney-faq-section">
                            <h2>FAQs</h2>
                            <p className="kidney-faq-intro">Common questions about this kidney dialysis initiative.</p>

                            <div className="kidney-faq-list">
                                {FAQS.map((faq, index) => {
                                    const isOpen = openFaq === index;
                                    return (
                                        <article key={index} className={`kidney-faq-item ${isOpen ? "open" : ""}`}>
                                            <button
                                                type="button"
                                                className="kidney-faq-question"
                                                onClick={() => setOpenFaq(isOpen ? null : index)}
                                                aria-expanded={isOpen}
                                            >
                                                <span>{faq.question}</span>
                                                <FaChevronDown aria-hidden="true" />
                                            </button>
                                            {isOpen && <p className="kidney-faq-answer">{faq.answer}</p>}
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
                    className="kidney-donation-modal-backdrop"
                    role="presentation"
                    onClick={() => setDonationModalType(null)}
                >
                    <div
                        className="kidney-donation-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={modalTitle}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="kidney-donation-modal-head">
                            <h3>{modalTitle}</h3>
                            <button
                                type="button"
                                className="kidney-donation-modal-close"
                                onClick={() => setDonationModalType(null)}
                                aria-label="Close donations popup"
                            >
                                x
                            </button>
                        </div>
                        <p className="kidney-donation-modal-subtitle">
                            Showing {modalDonations.length} contributions to this kidney dialysis initiative
                        </p>
                        <div className="kidney-donation-modal-list">
                            {modalDonations.map((donation) => (
                                <article
                                    key={`${donation.name}-${donation.amount}-modal`}
                                    className="kidney-donation-item kidney-donation-item-modal"
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

export default KidneySupport;
