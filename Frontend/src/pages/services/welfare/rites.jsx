import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaChevronDown,
    FaHandHoldingHeart,
    FaRegClock,
    FaShieldAlt,
    FaUserCircle,
} from "react-icons/fa";

// Ensure you replace this with an appropriate image for Last Rites
import ritesImage from "../../../assets/images/socialWelfare/rites.png";
import "./rites.css";

const DONATIONS = [
    { name: "Amit Desai", amount: 11000, noteEn: "For a dignified farewell", noteHi: "सम्मानजनक विदाई के लिए" },
    { name: "Suresh Kumar", amount: 5100, noteEn: "Top Donor", noteHi: "शीर्ष दानकर्ता" },
    { name: "Meena Iyer", amount: 5000, noteEn: "In loving memory of my father", noteHi: "पिताजी की स्मृति में" },
    { name: "Karan Malhotra", amount: 3100, noteEn: "Rest in peace", noteHi: "शांति मिले" },
    { name: "Anonymous", amount: 2500, noteEn: "Happy to help", noteHi: "मदद करके खुशी हुई" },
    { name: "Rajat Sharma", amount: 2100, noteEn: "For cremation expenses", noteHi: "अंतिम संस्कार के खर्च के लिए" },
    { name: "Anjali Verma", amount: 1500, noteEn: "A noble cause", noteHi: "एक नेक काम" },
    { name: "V. Patil", amount: 1100, noteEn: "With gratitude", noteHi: "आभार के साथ" },
    { name: "Gaurav Singh", amount: 1000, noteEn: "Keep going", noteHi: "महान कार्य" },
    { name: "Deepak Joshi", amount: 500, noteEn: "Prayers", noteHi: "प्रार्थनाएं" },
];

const FAQS = [
    {
        question: "How will my donation be used?",
        questionHi: "मेरे दान का उपयोग कैसे किया जाएगा?",
        answer: "Funds are used to cover funeral expenses including transportation (ambulance/hearse), cremation wood or burial fees, and essential items required for basic last rites.",
        answerHi: "धन का उपयोग अंतिम संस्कार के खर्चों को कवर करने के लिए किया जाता है, जिसमें परिवहन (एम्बुलेंस), श्मशान की लकड़ी या दफनाने का शुल्क और बुनियादी अंतिम संस्कार के लिए आवश्यक सामग्री शामिल है।",
    },
    {
        question: "Are religious customs respected?",
        questionHi: "क्या धार्मिक रीति-रिवाजों का सम्मान किया जाता है?",
        answer: "Yes, we ensure that the final rites are performed strictly according to the individual's respective faith and religious customs.",
        answerHi: "हाँ, हम यह सुनिश्चित करते हैं कि अंतिम संस्कार व्यक्ति के संबंधित धर्म और धार्मिक रीति-रिवाजों के अनुसार ही किए जाएं।",
    },
    {
        question: "Is my donation secure?",
        questionHi: "क्या मेरा दान सुरक्षित है?",
        answer: "Yes. Donations are processed through secure payment channels and campaign-level records are maintained.",
        answerHi: "हाँ। दान सुरक्षित भुगतान चैनलों के माध्यम से संसाधित किए जाते हैं और अभियान-स्तर के रिकॉर्ड बनाए रखे जाते हैं।",
    },
    {
        question: "Will I get a donation confirmation?",
        questionHi: "क्या मुझे दान की पुष्टि मिलेगी?",
        answer: "Yes. You will receive a confirmation as soon as your contribution is completed successfully.",
        answerHi: "हाँ। जैसे ही आपका योगदान सफलतापूर्वक पूरा हो जाएगा, आपको एक पुष्टि प्राप्त होगी।",
    },
];

const STORY = [
    { en: "Every human being deserves a dignified farewell from this world. Unfortunately, for many destitute families and unclaimed individuals, the rising costs of a funeral make this basic right impossible.", hi: "हर इंसान इस दुनिया से एक सम्मानजनक विदाई का हकदार है। दुर्भाग्य से, कई गरीब परिवारों और लावारिस लोगों के लिए, अंतिम संस्कार का बढ़ता खर्च इस बुनियादी अधिकार को असंभव बना देता है।" },
    { en: "Countless families struggle to afford wood, transportation, and burial ground fees, while unclaimed bodies often await a respectful departure.", hi: "अनगिनत परिवार लकड़ी, परिवहन और श्मशान/कब्रिस्तान के शुल्क का भुगतान करने के लिए संघर्ष करते हैं, जबकि लावारिस शव अक्सर एक सम्मानजनक विदाई की प्रतीक्षा करते रह जाते हैं।" },
    { en: "Your contribution will help cover the complete costs of cremation or burial, including essential items and basic rituals, ensuring that no one leaves this world without the dignity and respect they deserve.", hi: "आपका योगदान दाह संस्कार या दफनाने की पूरी लागत को कवर करने में मदद करेगा, जिसमें आवश्यक सामग्री और बुनियादी अनुष्ठान शामिल हैं, यह सुनिश्चित करते हुए कि कोई भी बिना सम्मान के इस दुनिया से न जाए।" },
];

function LastRitesPage() {
    const [storyExpanded, setStoryExpanded] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [shareLabel, setShareLabel] = useState("Share");
    const [donationModalType, setDonationModalType] = useState(null);

    const isDonationModalOpen = donationModalType !== null;
    const sortedDonations = useMemo(
        () => [...DONATIONS].sort((a, b) => b.amount - a.amount),
        []
    );
    const modalDonations = donationModalType === "top" ? sortedDonations.slice(0, 10) : sortedDonations;
    const modalTitle = donationModalType === "top" ? "Top Donations" : "All Donations";

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!isDonationModalOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const closeOnEscape = (event) => {
            if (event.key === "Escape") setDonationModalType(null);
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
                    title: "Dignified Last Rites Support",
                    text: "Help ensure a dignified farewell for the underprivileged.",
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
        <section className="rites-detail-page">
            <div className="rites-detail-shell">
                <div className="rites-content-grid">
                    <aside className="rites-side-stack">
                        <article className="campaign-card">
                            <div className="campaign-image-wrap">
                                <img src={ritesImage} alt="Dignified Last Rites Support" />
                                <span className="campaign-chip">Tax Benefits Available</span>
                            </div>

                            <div className="campaign-body">
                                <h1>Support Dignified Last Rites: A Respectful Farewell for the Underprivileged</h1>
                                <p className="campaign-org">by Guardian of Angels Trust</p>

                                <div className="campaign-amounts">
                                    <strong>Rs 1,32,000</strong>
                                    <span>raised of Rs 3,00,000 goal</span>
                                </div>

                                <div className="campaign-progress" aria-hidden="true">
                                    <span className="campaign-progress-fill" style={{ width: "44%" }} />
                                </div>

                                <div className="campaign-stats">
                                    <div>
                                        <strong>86</strong>
                                        <span>Donors</span>
                                    </div>
                                    <div>
                                        <strong>21</strong>
                                        <span>Days left</span>
                                    </div>
                                    <div>
                                        <strong>44%</strong>
                                        <span>Funded</span>
                                    </div>
                                </div>

                                <div className="campaign-actions">
                                    <Link to="/donate" state={{ serviceImage: ritesImage, serviceTitle: "Support Dignified Last Rites: A Respectful Farewell for the Underprivileged" }} className="campaign-btn campaign-btn-primary">
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

                    <div className="rites-main-stack">
                        <section className="rites-section-card">
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

                        <section className="rites-section-card">
                            <div className="section-head">
                                <h2>Recent Donations</h2>
                                <span>86 Donations</span>
                            </div>

                            <div className="donation-list">
                                {sortedDonations.slice(0, 3).map((donation) => (
                                    <article key={`${donation.name}-${donation.amount}`} className="donation-item">
                                        <FaUserCircle aria-hidden="true" />
                                        <div>
                                            <h3>{donation.name}</h3>
                                            <p>{formatAmount(donation.amount)}</p>
                                        </div>
                                        <span>{donation.noteEn}</span>
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
                            <h2>Support dignified last rites</h2>
                            <p>Your donation helps underprivileged families perform respectful final rites.</p>
                            <div className="support-actions">
                                <Link to="/donate" state={{ serviceImage: ritesImage, serviceTitle: "Support Dignified Last Rites: A Respectful Farewell for the Underprivileged" }} className="campaign-btn campaign-btn-primary">
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

                        <section className="rites-section-card">
                            <h2>Organizers</h2>
                            <div className="organizer-list">
                                <article className="organizer-item">
                                    <span className="organizer-logo">GA</span>
                                    <div>
                                        <h3>Guardian of Angels Trust</h3>
                                        <p>Verified Charity</p>
                                    </div>
                                </article>
                                <article className="organizer-item">
                                    <span className="organizer-logo organizer-logo-alt">g</span>
                                    <div>
                                        <h3>Give</h3>
                                        <p>Organizer</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section className="trust-strip">
                            <h2>India&apos;s trusted online donation platform</h2>
                            <div className="trust-grid">
                                <article>
                                    <FaShieldAlt aria-hidden="true" />
                                    <div>
                                        <h3>Easy</h3>
                                        <p>Donate quickly and securely in a few steps.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaHandHoldingHeart aria-hidden="true" />
                                    <div>
                                        <h3>Impactful</h3>
                                        <p>Your support ensures a dignified farewell for a departed soul.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRegClock aria-hidden="true" />
                                    <div>
                                        <h3>Credible</h3>
                                        <p>Campaign records and charity details are maintained clearly.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        <section className="rites-section-card faq-section">
                            <h2>FAQs</h2>
                            <p className="faq-intro">Everything you need to know before you donate.</p>

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
                            Showing {modalDonations.length} contributions to this fundraiser
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
                                    <span>{donation.noteEn}</span>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default LastRitesPage;