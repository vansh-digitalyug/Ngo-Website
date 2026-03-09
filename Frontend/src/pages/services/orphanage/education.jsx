
import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {

    FaChevronDown,

    FaHandHoldingHeart,

    FaRegClock,

    FaShieldAlt,

    FaUserCircle,

} from "react-icons/fa";

import { useLanguage, translate } from "../../../utils/useLanguage.jsx";

import { orphanEducationTranslations } from "../../../utils/serviceTranslations.js";

import orphanEducation from "../../../assets/images/orphanage/education.jpg";

import "./education.css";



const DONATIONS = [

    { name: "Sourabh Bakshi", amount: 15000, note: "Helping children" },

    { name: "Jayesh Shrivastava", amount: 7500, note: "Top Donor" },

    { name: "Priya Sharma", amount: 5000, note: "Monthly supporter" },

    { name: "Rahul Verma", amount: 3000, note: "In memory donation" },

    { name: "Neha Gupta", amount: 2500, note: "Education first" },

    { name: "Kunal Jain", amount: 2100, note: "For school kits" },

    { name: "Anonymous", amount: 1111, note: "Joined today" },

    { name: "A. Das", amount: 1500, note: "With gratitude" },

    { name: "Simran Kaur", amount: 1200, note: "Keep going" },

    { name: "Rohit Singh", amount: 1000, note: "Best wishes" },

    { name: "Meera Nair", amount: 900, note: "Small effort" },

    { name: "Vikash Kumar", amount: 800, note: "For children" },

    { name: "Anonymous", amount: 700, note: "Blessings" },

    { name: "Anita Menon", amount: 500, note: "Support education" },

];



const FAQS = [

    {

        question: "How does this education fundraiser help children?",

        answer: "Funds are used for school fees, books, uniforms, tutoring support, and basic classroom needs for children living in orphanage care.",

        questionHi: "यह शिक्षा धन संचय बच्चों को कैसे मदद करता है?",

        answerHi: "धन को अनाथालय देखभाल में रहने वाले बच्चों के लिए स्कूल फीस, किताबें, वर्दी, ट्यूशन सहायता और बुनियादी कक्षा की जरूरतों के लिए उपयोग किया जाता है।",

    },

    {

        question: "Is my donation secure?",

        answer: "Yes. Donations are processed through secure payment channels and campaign-level records are maintained for accountability.",

        questionHi: "क्या मेरा दान सुरक्षित है?",

        answerHi: "हाँ। दान को सुरक्षित भुगतान चैनलों के माध्यम से संसाधित किया जाता है और जवाबदेही के लिए अभियान-स्तरीय रिकॉर्ड बनाए रखे जाते हैं।",

    },

    {

        question: "Will I get donation confirmation?",

        answer: "Yes. You receive confirmation as soon as your contribution is completed successfully.",

        questionHi: "क्या मुझे दान की पुष्टि मिलेगी?",

        answerHi: "हाँ। आप अपना योगदान सफलतापूर्वक पूर्ण होते ही पुष्टि प्राप्त करते हैं।",

    },

    {

        question: "Can I support this fundraiser monthly?",

        answer: "Yes. You can return and donate again any time, or support related child welfare campaigns regularly.",

        questionHi: "क्या मैं इस धन संचय को मासिक समर्थन कर सकता हूँ?",

        answerHi: "हाँ। आप कभी भी वापस आ सकते हैं और फिर से दान कर सकते हैं, या संबंधित बाल कल्याण अभियानों को नियमित रूप से समर्थन कर सकते हैं।",

    },

    {

        question: "Can I share this campaign with friends?",

        answer: "Yes. You can use the Share button to quickly send this page to your contacts and help this cause reach more people.",

        questionHi: "क्या मैं इस अभियान को दोस्तों के साथ साझा कर सकता हूँ?",

        answerHi: "हाँ। आप इस पृष्ठ को अपने संपर्कों को जल्दी भेजने के लिए साझा बटन का उपयोग कर सकते हैं और इस कारण को अधिक लोगों तक पहुंचने में मदद कर सकते हैं।",

    },

];



const STORY = [

    {
        en: "Children in orphanage care often have dreams of becoming teachers, doctors, artists, and leaders, but financial barriers keep interrupting their schooling.",
        hi: "अनाथालय देखभाल में बच्चों के अक्सर शिक्षक, डॉक्टर, कलाकार और नेता बनने के सपने होते हैं, लेकिन वित्तीय बाधाएं उनकी पढ़ाई में बाधा डालती हैं।",
    },

    {
        en: "This education support fundraiser helps cover school enrollment, books, uniforms, and daily learning essentials so children can continue studying with confidence.",
        hi: "यह शिक्षा सहायता धन संचय अभियान स्कूल नामांकन, किताबें, वर्दी और दैनिक सीखने की जरूरी चीजों को कवर करने में मदद करता है ताकि बच्चे आत्मविश्वास के साथ अध्ययन जारी रख सकें।",
    },

    {
        en: "With your support, every child gets a fair chance to stay in school, learn consistently, and build a brighter and more secure future.",
        hi: "आपके समर्थन से, हर बच्चे को स्कूल में रहने, लगातार सीखने और एक उज्जवल और अधिक सुरक्षित भविष्य बनाने का उचित मौका मिलता है।",
    },

];



function OrphanageEducationPage() {

    const { language } = useLanguage();

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

    const modalTitle = donationModalType === "top" ? translate("topDonations", orphanEducationTranslations, language) : translate("allDonations", orphanEducationTranslations, language);



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

                    title: translate("title", orphanEducationTranslations, language),

                    text: translate("supportDesc", orphanEducationTranslations, language),

                    url: pageUrl,

                });

                return;

            }



            if (navigator.clipboard && navigator.clipboard.writeText) {

                await navigator.clipboard.writeText(pageUrl);

                setShareLabel(translate("linkCopied", orphanEducationTranslations, language));

                window.setTimeout(() => setShareLabel(translate("share", orphanEducationTranslations, language)), 1600);

            }

        } catch {

            setShareLabel(translate("share", orphanEducationTranslations, language));

        }

    };



    return (

        <section className="education-detail-page">

            <div className="education-detail-shell">

                <div className="education-content-grid">

                    <aside className="education-side-stack">

                        <article className="campaign-card">

                            <div className="campaign-image-wrap">

                                <img src={orphanEducation} alt="Children receiving education support" />

                                <span className="campaign-chip">Tax Benefits Available</span>

                            </div>



                            <div className="campaign-body">

                                <h1>Help provide education support for children in orphanage care</h1>

                                <p className="campaign-org">by Guardian of Angels Trust</p>



                                <div className="campaign-amounts">

                                    <strong>Rs 2,61,000</strong>

                                    <span>raised of Rs 5,00,000 goal</span>

                                </div>



                                <div className="campaign-progress" aria-hidden="true">

                                    <span className="campaign-progress-fill" style={{ width: "52%" }} />

                                </div>



                                <div className="campaign-stats">

                                    <div>

                                        <strong>124</strong>

                                        <span>Donors</span>

                                    </div>

                                    <div>

                                        <strong>14</strong>

                                        <span>Days left</span>

                                    </div>

                                    <div>

                                        <strong>52%</strong>

                                        <span>Funded</span>

                                    </div>

                                </div>



                                <div className="campaign-actions">

                                    <Link to="/donate" state={{ serviceImage: orphanEducation, serviceTitle: "Help provide education support for children in orphanage care" }} className="campaign-btn campaign-btn-primary">

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



                    <div className="education-main-stack">

                        <section className="education-section-card">

                            <h2>{translate("story", orphanEducationTranslations, language)}</h2>

                            <div className={`story-content ${storyExpanded ? "expanded" : ""}`}>

                                {STORY.map((paragraph, index) => (

                                    <p key={index}>{language === "en" ? paragraph.en : paragraph.hi}</p>

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



                        <section className="education-section-card">

                            <div className="section-head">

                                <h2>Recent Donations</h2>

                                <span>114 Donations</span>

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

                            <h2>Support the fundraiser</h2>

                            <p>Every small share and donation counts.</p>

                            <div className="support-actions">

                                <Link to="/donate" state={{ serviceImage: orphanEducation, serviceTitle: "Help provide education support for children in orphanage care" }} className="campaign-btn campaign-btn-primary">

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



                        <section className="education-section-card">

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

                                        <p>Your support helps children stay in school and continue learning.</p>

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



                        <section className="education-section-card faq-section">

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

                                                <span>{language === "en" ? faq.question : faq.questionHi}</span>

                                                <FaChevronDown aria-hidden="true" />

                                            </button>

                                            {isOpen && <p className="faq-answer">{language === "en" ? faq.answer : faq.answerHi}</p>}

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



export default OrphanageEducationPage;