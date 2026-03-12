import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaChevronDown,
    FaHeartbeat,
    FaRegClock,
    FaShieldAlt,
    FaUserCircle,
    FaStethoscope,
    FaRibbon
} from "react-icons/fa";

// Replace with your actual image path
import cancerCareImg from "../../../assets/images/Medical/cancer.png";
import "./cancer.css";

const DONATIONS = [
    { name: "Suresh Gupta", amount: 50000, note: "For chemotherapy support" },
    { name: "Anita Kapoor", amount: 20000, note: "In memory of my mother" },
    { name: "Rajat Sharma", amount: 15000, note: "Fighting cancer together" },
    { name: "Deepika Padukone", amount: 10000, note: "Support the survivors" },
    { name: "Amitabh Bachchan", amount: 8000, note: "Keep strong" },
    { name: "Meena Iyer", amount: 5000, note: "For early screening" },
    { name: "Anonymous", amount: 3000, note: "God bless" },
    { name: "Rahul Dravid", amount: 2500, note: "With hope" },
    { name: "Sneha Reddy", amount: 2000, note: "Stay hopeful" },
    { name: "Vinod Khanna", amount: 1500, note: "Best wishes" },
    { name: "Anonymous", amount: 1000, note: "Strength to you" },
    { name: "Kavita Singh", amount: 750, note: "For medicines" },
    { name: "Anonymous", amount: 500, note: "Blessings" },
    { name: "Arun Jaitley", amount: 500, note: "Support the cause" },
];

const FAQS = [
    {
        question: "What types of cancer support do you provide?",
        questionHi: "आप किस प्रकार की कैंसर सहायता प्रदान करते हैं?",
        answer:
            "We provide financial assistance for chemotherapy, radiation therapy, and essential cancer medications. We also organize awareness programs and free screening camps for early detection.",
        answerHi:
            "हम कीमोथेरेपी, विकिरण चिकित्सा और आवश्यक कैंसर दवाओं के लिए वित्तीय सहायता प्रदान करते हैं। हम जागरूकता कार्यक्रम और शीघ्र पहचान के लिए मुफ्त जांच शिविर भी आयोजित करते हैं।",
    },
    {
        question: "How is my donation used for cancer patients?",
        questionHi: "मेरा दान कैंसर रोगियों के लिए कैसे उपयोग किया जाता है?",
        answer:
            "Donations directly fund the treatment costs for patients from underprivileged backgrounds, including hospital stays, diagnostic tests, and palliative care.",
        answerHi:
            "दान सीधे वंचित पृष्ठभूमि के रोगियों के उपचार की लागत को वित्त पोषित करता है, जिसमें अस्पताल में रहना, नैदानिक परीक्षण और उपशामक देखभाल शामिल है।",
    },
    {
        question: "Do you help with emotional and psychological support?",
        questionHi: "क्या आप भावनात्मक और मनोवैज्ञानिक सहायता में मदद करते हैं?",
        answer:
            "Yes, we partner with specialized counseling networks to provide support groups and psychological counseling for patients and their families.",
        answerHi:
            "हाँ, हम रोगियों और उनके परिवारों के लिए सहायता समूह और मनोवैज्ञानिक परामर्श प्रदान करने के लिए विशेष परामर्श नेटवर्क के साथ साझेदारी करते हैं।",
    },
    {
        question: "How can I refer a patient for assistance?",
        questionHi: "मैं सहायता के लिए किसी मरीज को कैसे रेफर कर सकता हूँ?",
        answer:
            "You can refer a patient by submitting their medical documents and financial status Proof via our contact form. Our medical board reviews applications weekly.",
        answerHi:
            "आप हमारे संपर्क फॉर्म के माध्यम से उनके चिकित्सा दस्तावेज और वित्तीय स्थिति प्रमाण जमा करके मरीज को रेफर कर सकते हैं। हमारा चिकित्सा बोर्ड साप्ताहिक रूप से आवेदनों की समीक्षा करता है।",
    },
    {
        question: "Can I volunteer for the cancer awareness programs?",
        questionHi: "क्या मैं कैंसर जागरूकता कार्यक्रमों के लिए स्वयंसेवा कर सकता हूँ?",
        answer:
            "Absolutely! We welcome volunteers for organizing workshops, spreading awareness in schools, and supporting our fundraising events.",
        answerHi:
            "बिल्कुल! हम कार्यशालाओं का आयोजन, स्कूलों में जागरूकता फैलाने और हमारे धन संचय कार्यक्रमों का समर्थन करने के लिए स्वयंसेवकों का स्वागत करते हैं।",
    },
];

const STORY = [
    {
        en: "Cancer remains one of the leading causes of death in India, often exacerbated by late diagnosis and the high cost of specialized treatment. For families with limited resources, a cancer diagnosis can be devastating both emotionally and financially.",
        hi: "भारत में कैंसर मृत्यु के प्रमुख कारणों में से एक बना हुआ है, जो अक्सर देर से निदान और विशेष उपचार की उच्च लागत से बढ़ जाता है। सीमित संसाधनों वाले परिवारों के लिए, कैंसर का निदान भावनात्मक और आर्थिक दोनों रूप से विनाशकारी हो सकता है।",
    },
    {
        en: "Our 'Cancer Care & Support' initiative is dedicated to ensuring that no one has to fight this battle alone. We focus on bridging the gap by providing financial aid, facilitating access to quality healthcare, and promoting the importance of early detection.",
        hi: "हमारी 'कैंसर केयर एंड सपोर्ट' पहल यह सुनिश्चित करने के लिए समर्पित है कि किसी को भी अकेले इस लड़ाई से नहीं लड़ना पड़े। हम वित्तीय सहायता प्रदान करके, गुणवत्तापूर्ण स्वास्थ्य सेवा तक पहुँच को सुविधाजनक बनाकर और शीघ्र पहचान के महत्व को बढ़ावा देकर इस अंतर को पाटने पर ध्यान केंद्रित करते हैं।",
    },
    {
        en: "Your contribution is a beacon of hope. By donating today, you are helping us provide life-saving treatments, essential medications, and a support system that empowers patients to face cancer with strength and dignity.",
        hi: "आपका योगदान आशा की किरण है। आज दान करके, आप हमें जीवन रक्षक उपचार, आवश्यक दवाइयां और एक सहायता प्रणाली प्रदान करने में मदद कर रहे हैं जो रोगियों को शक्ति और गरिमा के साथ कैंसर का सामना करने के लिए सशक्त बनाती है।",
    },
];

function CancerSupport() {
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
                    title: "Support Cancer Care",
                    text: "Help provide life-saving cancer treatments to those in need.",
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
        <section className="cancer-detail-page">
            <div className="cancer-detail-shell">
                <div className="cancer-content-grid">
                    <aside className="cancer-side-stack">
                        <article className="cancer-campaign-card">
                            <div className="cancer-campaign-image-wrap">
                                <img src={cancerCareImg} alt="Cancer support and care" />
                                <span className="cancer-campaign-chip">Tax Benefits Available</span>
                            </div>

                            <div className="cancer-campaign-body">
                                <h1>Support Life-Saving Cancer Treatments & Care</h1>
                                <p className="cancer-campaign-org">by Arogya Care Foundation</p>

                                <div className="cancer-campaign-amounts">
                                    <strong>Rs 5,12,000</strong>
                                    <span>raised of Rs 10,00,000 goal</span>
                                </div>

                                <div className="cancer-campaign-progress" aria-hidden="true">
                                    <span className="cancer-campaign-progress-fill" style={{ width: "51.2%" }} />
                                </div>

                                <div className="cancer-campaign-stats">
                                    <div>
                                        <strong>342</strong>
                                        <span>Donors</span>
                                    </div>
                                    <div>
                                        <strong>15</strong>
                                        <span>Days left</span>
                                    </div>
                                    <div>
                                        <strong>51%</strong>
                                        <span>Funded</span>
                                    </div>
                                </div>

                                <div className="cancer-campaign-actions">
                                    <Link to="/donate" state={{ serviceTitle: "Support Life-Saving Cancer Treatments & Care" }} className="cancer-campaign-btn cancer-campaign-btn-primary">
                                        Help Now
                                    </Link>
                                    <button
                                        type="button"
                                        className="cancer-campaign-btn cancer-campaign-btn-secondary"
                                        onClick={handleShare}
                                    >
                                        {shareLabel}
                                    </button>
                                </div>
                            </div>
                        </article>
                    </aside>

                    <div className="cancer-main-stack">
                        <section className="cancer-section-card">
                            <h2>Story</h2>
                            <div className={`cancer-story-content ${storyExpanded ? "expanded" : ""}`}>
                                {STORY.map((item, idx) => (
                                    <p key={idx}>{item.en}</p>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="cancer-text-action"
                                onClick={() => setStoryExpanded((current) => !current)}
                            >
                                {storyExpanded ? "Read Less" : "Read More"}
                            </button>
                        </section>

                        <section className="cancer-section-card">
                            <div className="cancer-section-head">
                                <h2>Recent Donations</h2>
                                <span>342 Donations</span>
                            </div>

                            <div className="cancer-donation-list">
                                {sortedDonations.slice(0, 3).map((donation) => (
                                    <article key={`${donation.name}-${donation.amount}`} className="cancer-donation-item">
                                        <FaUserCircle aria-hidden="true" />
                                        <div>
                                            <h3>{donation.name}</h3>
                                            <p>{formatAmount(donation.amount)}</p>
                                        </div>
                                        <span>{donation.note}</span>
                                    </article>
                                ))}
                            </div>

                            <div className="cancer-section-links">
                                <button type="button" onClick={() => setDonationModalType("top")}>
                                    View Top Donations
                                </button>
                                <button type="button" onClick={() => setDonationModalType("all")}>
                                    View All Donations
                                </button>
                            </div>
                        </section>

                        <section className="cancer-support-panel">
                            <h2>Support this mission</h2>
                            <p>Every small contribution brings us one step closer to a cancer-free future.</p>
                            <div className="cancer-support-actions">
                                <Link to="/donate" state={{ serviceTitle: "Support Life-Saving Cancer Treatments & Care" }} className="cancer-campaign-btn cancer-campaign-btn-primary">
                                    Help Now
                                </Link>
                                <button
                                    type="button"
                                    className="cancer-campaign-btn cancer-campaign-btn-secondary"
                                    onClick={handleShare}
                                >
                                    Share
                                </button>
                            </div>
                        </section>

                        <section className="cancer-section-card">
                            <h2>Organizers</h2>
                            <div className="cancer-organizer-list">
                                <article className="cancer-organizer-item">
                                    <span className="cancer-organizer-logo">AC</span>
                                    <div>
                                        <h3>Arogya Care Foundation</h3>
                                        <p>Verified Medical Charity</p>
                                    </div>
                                </article>
                                <article className="cancer-organizer-item">
                                    <span className="cancer-organizer-logo cancer-organizer-logo-alt">
                                        <FaRibbon size={18} />
                                    </span>
                                    <div>
                                        <h3>HopeNetwork</h3>
                                        <p>Campaign Partner</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section className="cancer-trust-strip">
                            <h2>Your impact is secure and verified</h2>
                            <div className="cancer-trust-grid">
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
                                        <p>Directly funds treatments, screenings, and crucial medication.</p>
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

                        <section className="cancer-section-card cancer-faq-section">
                            <h2>FAQs</h2>
                            <p className="cancer-faq-intro">Common questions about this cancer support initiative.</p>

                            <div className="cancer-faq-list">
                                {FAQS.map((faq, index) => {
                                    const isOpen = openFaq === index;
                                    return (
                                        <article key={index} className={`cancer-faq-item ${isOpen ? "open" : ""}`}>
                                            <button
                                                type="button"
                                                className="cancer-faq-question"
                                                onClick={() => setOpenFaq(isOpen ? null : index)}
                                                aria-expanded={isOpen}
                                            >
                                                <span>{faq.question}</span>
                                                <FaChevronDown aria-hidden="true" />
                                            </button>
                                            {isOpen && <p className="cancer-faq-answer">{faq.answer}</p>}
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
                    className="cancer-donation-modal-backdrop"
                    role="presentation"
                    onClick={() => setDonationModalType(null)}
                >
                    <div
                        className="cancer-donation-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={modalTitle}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="cancer-donation-modal-head">
                            <h3>{modalTitle}</h3>
                            <button
                                type="button"
                                className="cancer-donation-modal-close"
                                onClick={() => setDonationModalType(null)}
                                aria-label="Close donations popup"
                            >
                                x
                            </button>
                        </div>
                        <p className="cancer-donation-modal-subtitle">
                            Showing {modalDonations.length} contributions to this cancer support initiative
                        </p>
                        <div className="cancer-donation-modal-list">
                            {modalDonations.map((donation) => (
                                <article
                                    key={`${donation.name}-${donation.amount}-modal`}
                                    className="cancer-donation-item cancer-donation-item-modal"
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

export default CancerSupport;
