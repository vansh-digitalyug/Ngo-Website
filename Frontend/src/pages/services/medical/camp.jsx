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
import healthCampImg from "../../../assets/images/Medical/camp.jpg"; 
import "./camp.css";

const DONATIONS = [
    { name: "Dr. Arvind Mehta", amount: 25000, note: "For medical supplies" },
    { name: "Sunita Rao", amount: 10000, note: "Happy to help" },
    { name: "Vikram Chatterjee", amount: 5000, note: "Monthly health supporter" },
    { name: "Aisha Khan", amount: 3500, note: "In memory of my father" },
    { name: "Pooja Desai", amount: 2500, note: "Health is wealth" },
    { name: "Manoj Tiwari", amount: 2000, note: "For the eye checkup camp" },
    { name: "Anonymous", amount: 1500, note: "Good luck to the doctors" },
    { name: "R. Krishnan", amount: 1500, note: "With gratitude" },
    { name: "Neha Patil", amount: 1000, note: "Keep saving lives" },
    { name: "Suresh Reddy", amount: 1000, note: "Best wishes" },
    { name: "Anil Kumar", amount: 800, note: "Small effort for rural care" },
    { name: "Priyanka S.", amount: 750, note: "For pediatric medicines" },
    { name: "Anonymous", amount: 500, note: "Blessings" },
    { name: "Kiran Verma", amount: 500, note: "Support the camp" },
];

const FAQS = [
    {
        question: "What medical services will be provided at the camp?",
        questionHi: "शिविर में कौन सी चिकित्सा सेवाएं प्रदान की जाएंगी?",
        answer:
            "The camp will offer general physician consultations, blood pressure and sugar monitoring, basic ECGs, eye and dental screenings, and distribution of free essential medicines.",
        answerHi:
            "शिविर में सामान्य चिकित्सक परामर्श, रक्तचाप और शर्करा की निगरानी, बुनियादी ईसीजी, आंख और दंत जांच, और मुफ्त आवश्यक दवाओं का वितरण किया जाएगा।",
    },
    {
        question: "How will my donation be utilized?",
        questionHi: "मेरा दान कैसे उपयोग किया जाएगा?",
        answer:
            "Funds cover the cost of diagnostic equipment rentals, essential generic medicines, setup of medical tents, and logistics to transport volunteering doctors to remote areas.",
        answerHi:
            "धन नैदानिक उपकरण किराये, आवश्यक जेनेरिक दवाओं, चिकित्सा तंबू की स्थापना, और स्वयंसेवी डॉक्टरों को दूरदराज के क्षेत्रों में ले जाने के लिए रसद की लागत को कवर करता है।",
    },
    {
        question: "Are the attending doctors certified professionals?",
        questionHi: "क्या उपस्थित डॉक्टर प्रमाणित पेशेवर हैं?",
        answer:
            "Absolutely. We partner with state medical boards and registered city hospitals. All participating doctors and nurses are fully licensed and certified.",
        answerHi:
            "बिल्कुल। हम राज्य चिकित्सा बोर्ड और पंजीकृत शहरी अस्पतालों के साथ साझेदारी करते हैं। सभी भाग लेने वाले डॉक्टर और नर्सें पूरी तरह से लाइसेंस प्राप्त और प्रमाणित हैं।",
    },
    {
        question: "Is my donation tax-deductible?",
        questionHi: "क्या मेरा दान कर-कटौती योग्य है?",
        answer:
            "Yes. All contributions made to this campaign are eligible for 80G tax exemption under the Income Tax Act.",
        answerHi:
            "हाँ। इस अभियान में किए गए सभी योगदान आयकर अधिनियम के तहत 80G कर छूट के लिए पात्र हैं।",
    },
    {
        question: "Can I volunteer as a medical or non-medical professional?",
        questionHi: "क्या मैं एक चिकित्सा या गैर-चिकित्सा पेशेवर के रूप में स्वयंसेवा कर सकता हूँ?",
        answer:
            "Yes! We are always looking for both medical volunteers and logistics coordinators. Please contact us via our main website to register as a volunteer.",
        answerHi:
            "हाँ! हम हमेशा चिकित्सा स्वयंसेवकों और लॉजिस्टिक्स समन्वयकों दोनों की तलाश में रहते हैं। स्वयंसेवक के रूप में पंजीकरण करने के लिए कृपया हमारी मुख्य वेबसाइट के माध्यम से हमसे संपर्क करें।",
    },
];

const STORY = [
    {
        en: "Millions of people in rural areas lack access to basic primary healthcare. Simple, treatable conditions often worsen due to delayed diagnosis and the inability to afford basic consultations.",
        hi: "ग्रामीण क्षेत्रों में लाखों लोगों को बुनियादी प्राथमिक स्वास्थ्य सेवा तक पहुंच नहीं है। साधारण, इलाज योग्य स्थितियां अक्सर विलंबित निदान और बुनियादी परामर्श का खर्च उठाने में असमर्थता के कारण बिगड़ जाती हैं।",
    },
    {
        en: "Our upcoming Mega Free Health Checkup Camp aims to bridge this gap by bringing certified doctors, diagnostic tools, and free medicines directly to the communities that need them the most.",
        hi: "हमारा आगामी मेगा फ्री स्वास्थ्य जांच शिविर प्रमाणित डॉक्टरों, नैदानिक उपकरणों और मुफ्त दवाओं को सीधे उन समुदायों तक लाकर इस अंतर को पाटने का लक्ष्य रखता है जिन्हें उनकी सबसे अधिक आवश्यकता है।",
    },
    {
        en: "Your contribution acts as a lifeline. By supporting this campaign, you are directly funding medical supplies, patient screening processes, and vital health awareness sessions that can save lives.",
        hi: "आपका योगदान एक जीवन रेखा के रूप में कार्य करता है। इस अभियान का समर्थन करके, आप सीधे चिकित्सा आपूर्ति, रोगी जांच प्रक्रियाओं और महत्वपूर्ण स्वास्थ्य जागरूकता सत्रों को वित्त पोषित कर रहे हैं जो जान बचा सकते हैं।",
    },
];

function FreeHealthCamp() {
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
                    title: "Support Free Health Camp",
                    text: "Help provide free medical checkups and medicines to rural communities.",
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
                    <aside className="health-side-stack">
                        <article className="campaign-card">
                            <div className="campaign-image-wrap">
                                <img src={healthCampImg} alt="Doctors treating patients at a free health camp" />
                                <span className="campaign-chip">Tax Benefits Available</span>
                            </div>

                            <div className="campaign-body">
                                <h1>Fund a Mega Free Health Checkup Camp for rural communities</h1>
                                <p className="campaign-org">by Arogya Care Foundation</p>

                                <div className="campaign-amounts">
                                    <strong>Rs 3,45,000</strong>
                                    <span>raised of Rs 6,00,000 goal</span>
                                </div>

                                <div className="campaign-progress" aria-hidden="true">
                                    <span className="campaign-progress-fill" style={{ width: "57%" }} />
                                </div>

                                <div className="campaign-stats">
                                    <div>
                                        <strong>218</strong>
                                        <span>Donors</span>
                                    </div>
                                    <div>
                                        <strong>10</strong>
                                        <span>Days left</span>
                                    </div>
                                    <div>
                                        <strong>57%</strong>
                                        <span>Funded</span>
                                    </div>
                                </div>

                                <div className="campaign-actions">
                                    <Link to="/donate" state={{ serviceImage: healthCampImg, serviceTitle: "Fund a Mega Free Health Checkup Camp for rural communities" }} className="campaign-btn campaign-btn-primary">
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

                    <div className="health-main-stack">
                        <section className="health-section-card">
                            <h2>Story</h2>
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

                        <section className="health-section-card">
                            <div className="section-head">
                                <h2>Recent Donations</h2>
                                <span>218 Donations</span>
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
                            <h2>Support free health camps</h2>
                            <p>Your donation helps organize free health camps for underserved communities.</p>
                            <div className="support-actions">
                                <Link to="/donate" state={{ serviceImage: healthCampImg, serviceTitle: "Fund a Mega Free Health Checkup Camp for rural communities" }} className="campaign-btn campaign-btn-primary">
                                    Help Now
                                </Link>
                                <button
                                    type="button"
                                    className="campaign-btn campaign-btn-secondary"
                                    onClick={handleShare}
                                >
                                    Share
                                </button>
                            </div>
                        </section>

                        <section className="health-section-card">
                            <h2>Organizers</h2>
                            <div className="organizer-list">
                                <article className="organizer-item">
                                    <span className="organizer-logo">AC</span>
                                    <div>
                                        <h3>Arogya Care Foundation</h3>
                                        <p>Verified Medical Charity</p>
                                    </div>
                                </article>
                                <article className="organizer-item">
                                    <span className="organizer-logo organizer-logo-alt">
                                        <FaStethoscope size={18} />
                                    </span>
                                    <div>
                                        <h3>HealthConnect</h3>
                                        <p>Campaign Partner</p>
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
                                    <FaHeartbeat aria-hidden="true" />
                                    <div>
                                        <h3>Life-Saving</h3>
                                        <p>Directly funds treatments, diagnoses, and crucial medication.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRegClock aria-hidden="true" />
                                    <div>
                                        <h3>Transparent</h3>
                                        <p>All medical bills and post-camp impact reports are shared with donors.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section className="health-section-card faq-section">
                            <h2>FAQs</h2>
                            <p className="faq-intro">Common questions about this medical camp.</p>

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
                            Showing {modalDonations.length} contributions to this medical camp
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

export default FreeHealthCamp;