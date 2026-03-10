import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaChevronDown,
    FaHandHoldingHeart,
    FaRegClock,
    FaShieldAlt,
    FaCheckCircle,
    FaStar,
    FaBookOpen,
    FaGraduationCap,
    FaChalkboardTeacher,
    FaLaptop,
    FaUsers,
} from "react-icons/fa";
import { useLanguage } from "../../../utils/useLanguage.jsx";
import orphanEducation from "../../../assets/images/orphanage/education.jpg";
import eduImg1 from "../../../assets/images/orphanage/education/image1.png";
import eduImg2 from "../../../assets/images/orphanage/education/image2.png";
import eduImg3 from "../../../assets/images/orphanage/education/image3.png";
import eduImg4 from "../../../assets/images/orphanage/education/image4.png";
import eduImg5 from "../../../assets/images/orphanage/education/image5.png";
import "./education.css";

const EDU_BENEFITS = [
    {
        icon: FaBookOpen,
        title: "School Fees & Books Fully Covered",
        desc: "We pay every rupee of school enrollment fees, purchase textbooks, notebooks, stationery, and all required learning materials so no child misses school due to financial constraints.",
    },
    {
        icon: FaChalkboardTeacher,
        title: "Dedicated Weekly Tutoring",
        desc: "Trained tutors visit the orphanage multiple times a week to provide subject-specific coaching, resolve doubts, and give every child the individual attention their school classroom cannot offer.",
    },
    {
        icon: FaLaptop,
        title: "Digital Literacy & Computer Skills",
        desc: "Children are introduced to computers, basic internet use, and digital tools — equipping them with practical skills that are essential for education and employment in the modern world.",
    },
    {
        icon: FaGraduationCap,
        title: "Career Guidance for Older Students",
        desc: "As children grow, our mentors guide them through higher education options, vocational training programs, scholarship applications, and career pathways suited to their strengths.",
    },
];

const WHAT_WE_PROVIDE = [
    "Full school enrollment — we handle all admissions paperwork, fees, and documentation",
    "Complete uniform set, school bags, shoes, and stationery provided free of cost at the start of every academic year",
    "Textbooks, notebooks, and all required study materials purchased and delivered to each child",
    "Dedicated tutors visiting the orphanage weekly for individual subject coaching",
    "Monthly academic progress tracking shared with orphanage caretakers",
    "Digital literacy sessions covering computers, internet safety, and basic software tools",
    "Career counselling and mentoring sessions for students in Class 8 and above",
    "Support for competitive exam preparation — scholarships, entrance tests, and government schemes",
    "Emotional and motivational support to keep every child engaged and confident in school",
];

const GOALS = [
    { number: "200+", label: "Children Educated" },
    { number: "15+", label: "Partner Schools" },
    { number: "98%", label: "Attendance Rate" },
    { number: "5 yrs", label: "Program Running" },
];

const FAQS = [
    {
        question: "Which children are covered under this program?",
        answer: "All children residing in our partner orphanages who are of school-going age (5–18 years) are eligible. There is no application process — our team directly enrolls every child into the nearest suitable school.",
    },
    {
        question: "What exactly does the program pay for?",
        answer: "We cover school admission fees, annual tuition, uniforms, school bags, shoes, textbooks, notebooks, stationery, and all project or activity materials required throughout the year.",
    },
    {
        question: "How are tutors selected for the children?",
        answer: "Our tutors are screened volunteers and paid educators with verified backgrounds. They are matched to children by subject and grade level, and each tutor works consistently with the same group to build rapport.",
    },
    {
        question: "What happens when a child completes Class 12?",
        answer: "We actively support students in applying for college scholarships, vocational training institutes, and government skill development programs. Our career mentors assist with entrance exams and admission processes.",
    },
    {
        question: "How can I donate to this program?",
        answer: "Click the 'Help Now' button on this page to make a secure donation. Every ₹2,000 covers one child's school expenses for a full month. All donations are eligible for 80G tax exemption.",
    },
    {
        question: "Is my donation eligible for tax exemption?",
        answer: "Yes. All donations to our NGO are eligible for 80G tax deduction under the Income Tax Act. An official receipt and tax certificate will be sent to you after your donation.",
    },
];

const STORY = [
    {
        en: "Children in orphanage care carry a weight that most children never know. Alongside the emotional gap left by the absence of family, they face a very practical barrier — the financial impossibility of consistent schooling. School fees, books, uniforms, examination charges — costs that seem small to many are completely out of reach for an orphanage running on limited resources.",
        hi: "अनाथालय में रहने वाले बच्चे एक ऐसा बोझ उठाते हैं जिसे अधिकांश बच्चे कभी नहीं जानते। परिवार की अनुपस्थिति से उत्पन्न भावनात्मक कमी के साथ-साथ उन्हें एक व्यावहारिक बाधा का सामना करना पड़ता है — लगातार स्कूली शिक्षा की वित्तीय असंभवता।",
    },
    {
        en: "Our Education Support Program was built to remove that barrier completely. We do not just pay school fees — we take full responsibility for every aspect of a child's educational journey. From the moment a child joins the orphanage, our team coordinates with the nearest suitable school, handles all paperwork, and ensures the child walks in on the first day with everything they need.",
        hi: "हमारा शिक्षा सहायता कार्यक्रम उस बाधा को पूरी तरह दूर करने के लिए बनाया गया था। हम केवल स्कूल फीस नहीं देते — हम एक बच्चे की शैक्षणिक यात्रा के हर पहलू की पूरी जिम्मेदारी लेते हैं।",
    },
    {
        en: "Beyond the classroom, we invest in what makes education truly transformative. Our weekly tutoring sessions ensure no child falls behind. Our digital literacy programme gives children skills the modern economy demands. And as they grow older, our mentors help them navigate the complex world of higher education, scholarships, and career options — so that when they leave the orphanage at 18, they leave as capable, qualified, and confident young adults.",
        hi: "कक्षा से परे, हम उसमें निवेश करते हैं जो शिक्षा को वास्तव में परिवर्तनकारी बनाता है। हमारे साप्ताहिक ट्यूटरिंग सत्र सुनिश्चित करते हैं कि कोई बच्चा पीछे न रहे। हमारा डिजिटल साक्षरता कार्यक्रम बच्चों को वे कौशल देता है जिनकी आधुनिक अर्थव्यवस्था में जरूरत है।",
    },
    {
        en: "Education is not a gift we give children — it is a right we help them reclaim. Every child in our care deserves the same quality of schooling, the same encouragement, and the same shot at a future that any child born into privilege takes for granted. That is what this program is about. That is what your support makes possible.",
        hi: "शिक्षा कोई उपहार नहीं है जो हम बच्चों को देते हैं — यह एक अधिकार है जिसे हम उन्हें वापस दिलाने में मदद करते हैं। हमारी देखभाल में हर बच्चा समान गुणवत्ता की शिक्षा, समान प्रोत्साहन और उज्ज्वल भविष्य का समान अवसर पाने का हकदार है।",
    },
];

function OrphanageEducationPage() {
    const { language } = useLanguage();
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
                    title: "Education Support for Orphanage Children",
                    text: "Help provide quality education for children in orphanage care. Every donation covers school fees, books, and tutoring.",
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
        <section className="education-detail-page">
            <div className="education-detail-shell">
                <div className="education-content-grid">

                    {/* LEFT — MAIN CONTENT */}
                    <div className="education-main-stack">

                        {/* Hero Banner */}
                        <section className="education-hero-card">
                            <div className="education-hero-img-wrap">
                                <img src={orphanEducation} alt="Orphanage Education Support Program" />
                                <div className="education-hero-overlay">
                                    <span className="edu-badge">Orphanage Program</span>
                                    <h1>Education Support Program</h1>
                                    <p>We ensure every orphaned child stays in school — covering fees, books, uniforms, tutoring, and career guidance so no child's future is left to chance</p>
                                </div>
                            </div>
                        </section>

                        {/* Journey Photo Strip */}
                        <section className="education-section-card edu-journey-section">
                            <h2>A Child's Educational Journey</h2>
                            <p className="edu-section-desc">From a child with no school access to a confident young adult ready for the world — this is the journey our Education Support Program makes possible, one step at a time.</p>
                            <div className="edu-journey-grid">
                                <div className="edu-journey-item">
                                    <img src={eduImg1} alt="Child enrolling in school" />
                                    <div className="edu-journey-caption">
                                        <span className="edu-journey-step">Step 1</span>
                                        <strong>School Enrollment</strong>
                                        <p>We handle admission paperwork, pay all fees, and provide uniform and stationery</p>
                                    </div>
                                </div>
                                <div className="edu-journey-item">
                                    <img src={eduImg2} alt="Child studying with tutor" />
                                    <div className="edu-journey-caption">
                                        <span className="edu-journey-step">Step 2</span>
                                        <strong>Tutoring & Learning</strong>
                                        <p>Dedicated tutors visit weekly for individual coaching and doubt resolution</p>
                                    </div>
                                </div>
                                <div className="edu-journey-item">
                                    <img src={eduImg3} alt="Child using computer" />
                                    <div className="edu-journey-caption">
                                        <span className="edu-journey-step">Step 3</span>
                                        <strong>Digital Skills</strong>
                                        <p>Children learn computers and internet skills to prepare for the modern world</p>
                                    </div>
                                </div>
                                <div className="edu-journey-item">
                                    <img src={eduImg4} alt="Child graduating" />
                                    <div className="edu-journey-caption">
                                        <span className="edu-journey-step">Step 4</span>
                                        <strong>Future Ready</strong>
                                        <p>Career mentors guide students toward higher education, scholarships, and careers</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Story */}
                        <section className="education-section-card">
                            <h2>{language === "hi" ? "हमारी पहल" : "Our Initiative"}</h2>
                            <div className={`story-content ${storyExpanded ? "expanded" : ""}`}>
                                {STORY.map((item, idx) => (
                                    <p key={idx}>{language === "hi" ? item.hi : item.en}</p>
                                ))}
                            </div>
                            <button
                                type="button"
                                className="text-action"
                                onClick={() => setStoryExpanded((c) => !c)}
                            >
                                {storyExpanded ? "Read Less" : "Read More"}
                            </button>
                        </section>

                        {/* Goals */}
                        <section className="education-section-card">
                            <h2>Our Impact So Far</h2>
                            <div className="edu-goals-grid">
                                {GOALS.map((g) => (
                                    <div key={g.label} className="edu-goal-item">
                                        <strong>{g.number}</strong>
                                        <span>{g.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Benefits */}
                        <section className="education-section-card">
                            <h2>What Our Program Provides</h2>
                            <p className="edu-section-desc">Education is more than a classroom. Here is the full support system we build around every child — from the day they enroll to the day they graduate:</p>
                            <div className="edu-benefits-grid">
                                {EDU_BENEFITS.map((b) => (
                                    <article key={b.title} className="edu-benefit-card">
                                        <div className="edu-benefit-icon">
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
                        <section className="education-section-card">
                            <h2>Everything We Cover</h2>
                            <p className="edu-section-desc">Our support goes far beyond school fees. Here is the complete list of what every child in our program receives — from day one of enrollment to the day they step into adulthood:</p>
                            <ul className="edu-provide-list">
                                {WHAT_WE_PROVIDE.map((item) => (
                                    <li key={item}>
                                        <FaCheckCircle aria-hidden="true" className="edu-check-icon" />
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
                                        <h3>Verified Program</h3>
                                        <p>Every child is independently verified and enrolled through our structured process.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaHandHoldingHeart aria-hidden="true" />
                                    <div>
                                        <h3>Real Impact</h3>
                                        <p>Your donation directly funds school fees, books, and tutoring for a real child.</p>
                                    </div>
                                </article>
                                <article>
                                    <FaRegClock aria-hidden="true" />
                                    <div>
                                        <h3>Long-Term Commitment</h3>
                                        <p>We support each child throughout their entire school journey — not just for one year.</p>
                                    </div>
                                </article>
                            </div>
                        </section>

                        {/* Impact CTA */}
                        <section className="education-section-card edu-impact-cta">
                            <div className="edu-impact-cta-content">
                                <FaUsers className="edu-impact-cta-icon" aria-hidden="true" />
                                <div>
                                    <h2>Make a Real Difference Today</h2>
                                    <p>₹2,000 covers one child's complete school expenses for a full month — fees, books, uniform, and tutoring. Your donation goes directly to a child in our care. Every rupee is accounted for, and you will receive an 80G tax exemption certificate for your contribution.</p>
                                </div>
                            </div>
                            <Link
                                to="/donate"
                                state={{ serviceImage: orphanEducation, serviceTitle: "Education Support for Orphanage Children" }}
                                className="campaign-btn campaign-btn-primary edu-impact-cta-btn"
                            >
                                Help a Child Learn
                            </Link>
                        </section>

                        {/* FAQs */}
                        <section className="education-section-card faq-section">
                            <h2>Frequently Asked Questions</h2>
                            <p className="faq-intro">Everything you need to know about how we support children's education.</p>
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
                    <aside className="education-side-stack">
                        <article className="campaign-card">
                            <div className="campaign-image-wrap">
                                <img src={eduImg5} alt="Education Support for Children" />
                                <span className="campaign-chip">Orphanage Education</span>
                            </div>

                            <div className="campaign-body">
                                <h1>Help provide education support for children in orphanage care</h1>
                                <p className="campaign-org">Guardian of Angels Trust</p>

                                <div className="edu-premium-highlight">
                                    <FaBookOpen aria-hidden="true" />
                                    <span>₹2,000 covers <strong>1 child's full monthly education</strong></span>
                                </div>

                                <div className="campaign-amounts">
                                    <strong>₹2,61,000</strong>
                                    <span>raised of ₹5,00,000 goal</span>
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
                                        <strong>200+</strong>
                                        <span>Children</span>
                                    </div>
                                    <div>
                                        <strong>52%</strong>
                                        <span>Funded</span>
                                    </div>
                                </div>

                                <div className="edu-impact-note">
                                    <FaStar aria-hidden="true" />
                                    <span>80G tax exemption on all donations</span>
                                </div>

                                <div className="campaign-actions">
                                    <Link
                                        to="/donate"
                                        state={{ serviceImage: orphanEducation, serviceTitle: "Education Support for Orphanage Children" }}
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
                            </div>
                        </article>

                        <article className="edu-how-it-works-card">
                            <h3>How It Works</h3>
                            <ol className="edu-steps-list">
                                <li>
                                    <span className="edu-step-num">1</span>
                                    <div>
                                        <strong>Child Assessment</strong>
                                        <p>We assess each child's academic level, grade, and individual learning needs</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="edu-step-num">2</span>
                                    <div>
                                        <strong>School Admission</strong>
                                        <p>We handle all paperwork, fees, uniform, and stationery for enrollment</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="edu-step-num">3</span>
                                    <div>
                                        <strong>Ongoing Tutoring</strong>
                                        <p>Dedicated tutors provide weekly coaching and track monthly progress</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="edu-step-num">4</span>
                                    <div>
                                        <strong>Digital & Life Skills</strong>
                                        <p>Children learn computers, internet literacy, and soft skills alongside academics</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="edu-step-num">5</span>
                                    <div>
                                        <strong>Career Guidance</strong>
                                        <p>Mentors guide older students toward higher education and career opportunities</p>
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

export default OrphanageEducationPage;
