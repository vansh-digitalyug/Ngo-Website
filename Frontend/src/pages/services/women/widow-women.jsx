import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaChevronDown,
    FaHeart,
    FaRegClock,
    FaShieldAlt,
    FaUserCircle,
    FaHandsHelping
} from "react-icons/fa";

// Replace with your actual image path
import widowWomenImg from "../../../assets/images/women/widow.png"; 
import "./widow-women.css";

const DONATIONS = [
    { name: "Priya Sharma", amount: 50000, note: "Supporting widow women empowerment" },
    { name: "Rajesh Gupta", amount: 35000, note: "For financial assistance" },
    { name: "Meera Verma", amount: 25000, note: "Women welfare initiative" },
    { name: "Arun Kumar", amount: 20000, note: "Skill development support" },
    { name: "Anjali Desai", amount: 15000, note: "Healthcare for widows" },
    { name: "Vikram Singh", amount: 12000, note: "Community support" },
    { name: "Pooja Nair", amount: 10000, note: "Education and training" },
    { name: "Suresh Iyer", amount: 8000, note: "Livelihood programs" },
    { name: "Neha Kapoor", amount: 6000, note: "Social security" },
    { name: "Aditya Patel", amount: 5000, note: "Dignity and respect" },
    { name: "Divya Singh", amount: 3500, note: "Monthly support" },
    { name: "Rohan Sharma", amount: 2500, note: "Help them shine" },
    { name: "Karan Saxena", amount: 2000, note: "Every contribution helps" },
    { name: "Anonymous", amount: 1500, note: "Blessings to all" },
];

const FAQS = [
    {
        question: "What support does the widow women program provide?",
        questionHi: "विधवा महिला कार्यक्रम क्या सहायता प्रदान करता है?",
        answer:
            "Our program provides monthly financial assistance, skill development training, healthcare support, educational opportunities for their children, and counseling services. We focus on helping widows rebuild their lives with dignity and self-sufficiency.",
        answerHi:
            "हमारा कार्यक्रम मासिक वित्तीय सहायता, कौशल विकास प्रशिक्षण, स्वास्थ्य सेवा सहायता, उनके बच्चों के लिए शैक्षिक अवसर और परामर्श सेवाएं प्रदान करता है। हम विधवाओं को गरिमा और आत्मनिर्भरता के साथ अपना जीवन पुनर्निर्माण करने में मदद करने पर ध्यान केंद्रित करते हैं।",
    },
    {
        question: "How will my donation help widow women?",
        questionHi: "मेरा दान विधवा महिलाओं की कैसे मदद करेगा?",
        answer:
            "Your donation directly supports monthly stipends for sustenance, vocational training programs, medical expenses, school fees for their children, and creation of income-generating opportunities through self-help groups and small businesses.",
        answerHi:
            "आपका दान सीधे जीवन निर्वाह के लिए मासिक वजीफे, व्यावसायिक प्रशिक्षण कार्यक्रमों, चिकित्सा खर्चों, उनके बच्चों की स्कूल फीस और स्वयं सहायता समूहों तथा छोटे व्यवसायों के माध्यम से आय-उत्पादन के अवसर बनाने में सहायता करता है।",
    },
    {
        question: "How are beneficiaries selected?",
        questionHi: "लाभार्थियों का चयन कैसे किया जाता है?",
        answer:
            "We conduct thorough background verification through village councils and local leaders. Priority is given to widows below the poverty line, those caring for children, elderly widows, and women facing social discrimination.",
        answerHi:
            "हम ग्राम पंचायतों और स्थानीय नेताओं के माध्यम से गहन पृष्ठभूमि सत्यापन करते हैं। गरीबी रेखा से नीचे की विधवाओं, बच्चों की देखभाल करने वाली, बुजुर्ग विधवाओं और सामाजिक भेदभाव का सामना करने वाली महिलाओं को प्राथमिकता दी जाती है।",
    },
    {
        question: "Is my donation tax-deductible?",
        questionHi: "क्या मेरा दान कर-कटौती योग्य है?",
        answer:
            "Yes. All contributions to our widow women welfare program are eligible for 80G tax exemption under the Income Tax Act.",
        answerHi:
            "हाँ। हमारे विधवा महिला कल्याण कार्यक्रम में सभी योगदान आयकर अधिनियम के तहत 80G कर छूट के लिए पात्र हैं।",
    },
    {
        question: "How can I stay updated on the impact of my donation?",
        questionHi: "मैं अपने दान के प्रभाव के बारे में कैसे अपडेट रह सकता हूँ?",
        answer:
            "We provide quarterly impact reports showcasing the lives transformed through our program. You can see testimonials from beneficiaries and detailed accounts of how funds are utilized for their welfare and empowerment.",
        answerHi:
            "हम तिमाही प्रभाव रिपोर्ट प्रदान करते हैं जो हमारे कार्यक्रम के माध्यम से बदले गए जीवन को प्रदर्शित करती हैं। आप लाभार्थियों के प्रशंसापत्र और धन के उपयोग का विस्तृत विवरण देख सकते हैं।",
    },
];

const STORY = [
    { en: "Millions of widow women in India face severe social stigma, economic hardship, and discrimination. Many lose access to family support and struggle to meet basic needs while caring for children or elderly dependents.", hi: "भारत में लाखों विधवा महिलाएं गंभीर सामाजिक कलंक, आर्थिक कठिनाई और भेदभाव का सामना करती हैं। कई अपने परिवार के सहारे से वंचित हो जाती हैं और बच्चों या बुजुर्ग आश्रितों की देखभाल करते हुए बुनियादी जरूरतों को पूरा करने में संघर्ष करती हैं।" },
    { en: "Our widow women empowerment program provides comprehensive support including financial assistance, skill training, and healthcare. We believe every widow deserves dignity, respect, and a chance to rebuild her life independently.", hi: "हमारा विधवा महिला सशक्तिकरण कार्यक्रम वित्तीय सहायता, कौशल प्रशिक्षण और स्वास्थ्य सेवा सहित व्यापक सहायता प्रदान करता है। हमारा मानना है कि हर विधवा गरिमा, सम्मान और स्वतंत्र रूप से अपना जीवन पुनर्निर्माण करने का मौका पाने की हकदार है।" },
    { en: "Your contribution directly transforms lives by providing safety nets, creating livelihood opportunities, and restoring hope. Together, we can ensure widow women regain their self-respect and become independent, contributing members of society.", hi: "आपका योगदान सीधे सुरक्षा जाल प्रदान करके, आजीविका के अवसर बनाकर और आशा बहाल करके जीवन को बदलता है। साथ मिलकर, हम सुनिश्चित कर सकते हैं कि विधवा महिलाएं अपना आत्मसम्मान पुनः प्राप्त करें और समाज की स्वतंत्र, योगदान देने वाली सदस्य बनें।" },
];

function WidowWomen() {
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
                    title: "Support Widow Women Empowerment",
                    text: "Help widow women rebuild their lives with dignity and support.",
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
        <section className="widow-detail-page">
            <div className="widow-detail-shell">
                <div className="widow-content-grid">
                    <aside className="widow-side-stack">
                        <article className="campaign-card">
                            <div className="campaign-image-wrap">
                                <img src={widowWomenImg} alt="Widow women receiving support and empowerment" />
                                <span className="campaign-chip">Tax Benefits Available</span>
                            </div>

                            <div className="campaign-body">
                                <h1>Empower Widow Women with Financial and Social Support</h1>
                                <p className="campaign-org">by Women Welfare Foundation</p>

                                <div className="campaign-amounts">
                                    <strong>Rs 28,50,000</strong>
                                    <span>raised of Rs 75,00,000 goal</span>
                                </div>

                                <div className="campaign-progress" aria-hidden="true">
                                    <span className="campaign-progress-fill" style={{ width: "38%" }} />
                                </div>

                                <div className="campaign-stats">
                                    <div>
                                        <strong>521</strong>
                                        <span>Donors</span>
                                    </div>
                                    <div>
                                        <strong>60</strong>
                                        <span>Days left</span>
                                    </div>
                                    <div>
                                        <strong>38%</strong>
                                        <span>Funded</span>
                                    </div>
                                </div>

                                <div className="campaign-actions">
                                    <Link to="/donate" state={{ serviceImage: widowWomenImg, serviceTitle: "Empower Widow Women with Financial and Social Support" }} className="campaign-btn campaign-btn-primary">
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

                    <div className="widow-main-stack">
                        <section className="widow-section-card">
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

                        <section className="widow-section-card">
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
                            <h2>Support widow women empowerment</h2>
                            <p>Every donation provides financial assistance, skill training, and social support.</p>
                            <div className="support-actions">
                                <Link to="/donate" state={{ serviceImage: widowWomenImg, serviceTitle: "Empower Widow Women with Financial and Social Support" }} className="campaign-btn campaign-btn-primary">
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

                        <section className="widow-section-card">
                            <h2>Organizing Partners</h2>
                            <div className="organizer-list">
                                <article className="organizer-item">
                                    <span className="organizer-logo">WW</span>
                                    <div>
                                        <h3>Women Welfare Foundation</h3>
                                        <p>Verified Women's Organization</p>
                                    </div>
                                </article>
                                <article className="organizer-item">
                                    <span className="organizer-logo organizer-logo-alt">
                                        <FaHandsHelping size={18} />
                                    </span>
                                    <div>
                                        <h3>Community Care Network</h3>
                                        <p>Implementation Partner</p>
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
                                    <FaHeart aria-hidden="true" />
                                    <div>
                                        <h3>Life-Changing</h3>
                                        <p>Directly funds support programs that restore dignity and hope.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRegClock aria-hidden="true" />
                                    <div>
                                        <h3>Transparent</h3>
                                        <p>All expenditures and beneficiary testimonials shared with donors.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section className="widow-section-card faq-section">
                            <h2>FAQs</h2>
                            <p className="faq-intro">Common questions about widow women empowerment.</p>

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
                            Showing {modalDonations.length} contributions to widow women welfare program
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

export default WidowWomen;
