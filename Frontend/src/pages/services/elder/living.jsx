import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaChevronDown,
  FaHandHoldingHeart,
  FaRegClock,
  FaShieldAlt,
  FaUserCircle,
} from "react-icons/fa";

// Make sure to add a relevant image to this path in your project
import livingSupportImg from "../../../assets/images/elderly/living.jpg";
import { useServiceImage } from "../../../hooks/useServiceImage.js";
import "./living.css";

const DONATIONS = [
  { name: "Vikram Malhotra", amount: 25000, note: "For medical checkups" },
  { name: "Priya Ramesh", amount: 15000, note: "Top Donor" },
  { name: "Arjun Das", amount: 10000, note: "For winter blankets and beds" },
  { name: "Meera Syal", amount: 5000, note: "In loving memory of my parents" },
  { name: "Rahul Jain", amount: 4500, note: "Monthly supporter" },
  { name: "Sneha Patil", amount: 3000, note: "For hygiene kits" },
  { name: "Anonymous", amount: 2500, note: "Blessings" },
  { name: "T. K. Raman", amount: 2000, note: "With deep gratitude" },
  { name: "Harpreet Kaur", amount: 1500, note: "Happy to help" },
  { name: "Aman Gupta", amount: 1000, note: "For walking aids" },
  { name: "Riya Sharma", amount: 1000, note: "Small contribution" },
  { name: "Kiran Bedi", amount: 800, note: "For the elders" },
  { name: "Anonymous", amount: 500, note: "Stay healthy and safe" },
  { name: "Deepak Verma", amount: 500, note: "Support elder care" },
];

const FAQS = [
  {
    question: "What does 'Dignified Living Support' include?",
    questionHi: "'सम्मानजनक जीवन सहायता' में क्या शामिल है?",
    answer:
      "This initiative covers comprehensive care, including a clean and safe shelter, clean clothing, daily hygiene kits, mobility aids (like walkers and wheelchairs), and regular medical checkups.",
    answerHi:
      "इस पहल में व्यापक देखभाल शामिल है, जिसमें स्वच्छ और सुरक्षित आश्रय, साफ कपड़े, दैनिक स्वच्छता किट, गतिशीलता सहायक उपकरण (जैसे वॉकर और व्हीलचेयर), और नियमित चिकित्सा जांच शामिल हैं।",
  },
  {
    question: "Is my donation secure?",
    questionHi: "क्या मेरा दान सुरक्षित है?",
    answer:
      "Yes. Donations are processed through secure payment channels, and we maintain strict campaign-level records for full accountability.",
    answerHi:
      "हाँ। दान सुरक्षित भुगतान चैनलों के माध्यम से संसाधित किए जाते हैं, और हम पूर्ण जवाबदेही के लिए सख्त अभियान-स्तरीय रिकॉर्ड बनाए रखते हैं।",
  },
  {
    question: "Will I get a tax exemption receipt?",
    questionHi: "क्या मुझे कर छूट रसीद मिलेगी?",
    answer:
      "Yes. Upon successful donation, you will receive an 80G tax exemption receipt on your registered email ID.",
    answerHi:
      "हाँ। सफल दान के बाद, आपको अपनी पंजीकृत ईमेल आईडी पर 80G कर छूट रसीद प्राप्त होगी।",
  },
  {
    question: "Can I donate physical items like clothes or medicines?",
    questionHi: "क्या मैं कपड़े या दवाइयाँ जैसी भौतिक वस्तुएँ दान कर सकता हूँ?",
    answer:
      "Yes! While financial donations help us allocate resources where they are needed most urgently, we do accept gently used warm clothing, adult diapers, and sealed medical supplies. Please contact our shelter directly.",
    answerHi:
      "हाँ! जबकि वित्तीय दान हमें संसाधनों को सबसे अधिक जरूरत वाले स्थानों पर आवंटित करने में मदद करते हैं, हम धीरे से इस्तेमाल किए गए गर्म कपड़े, वयस्क डायपर और सीलबंद चिकित्सा आपूर्ति स्वीकार करते हैं। कृपया हमारे आश्रय से सीधे संपर्क करें।",
  },
  {
    question: "Can I share this campaign with friends?",
    questionHi: "क्या मैं इस अभियान को दोस्तों के साथ साझा कर सकता हूँ?",
    answer:
      "Absolutely! Use the Share button to send this page to your family and friends via WhatsApp, social media, or email to help us reach more people.",
    answerHi:
      "बिल्कुल! इस पृष्ठ को अपने परिवार और दोस्तों को WhatsApp, सोशल मीडिया या ईमेल के माध्यम से भेजने के लिए शेयर बटन का उपयोग करें ताकि हम अधिक लोगों तक पहुँच सकें।",
  },
];

const STORY = [
  { en: "Imagine spending your twilight years without a roof over your head, shivering in the cold, and lacking the basic dignity of a clean bed. Unfortunately, this is the harsh reality for thousands of abandoned elderly citizens.", hi: "कल्पना कीजिए कि आप अपने अंतिम वर्ष बिना छत के बिता रहे हैं, ठंड में कांप रहे हैं, और एक साफ बिस्तर की बुनियादी गरिमा से भी वंचित हैं। दुर्भाग्य से, यह हजारों परित्यक्त बुजुर्ग नागरिकों की कठोर वास्तविकता है।" },
  { en: "Our Dignified Living Support initiative goes beyond just providing food. We aim to offer a holistic safe haven. This means providing comfortable bedding, clean clothes, daily personal hygiene kits, and a place they can truly call home.", hi: "हमारी सम्मानजनक जीवन सहायता पहल केवल भोजन प्रदान करने से परे है। हमारा लक्ष्य एक समग्र सुरक्षित आश्रय प्रदान करना है। इसका मतलब है आरामदायक बिस्तर, साफ कपड़े, दैनिक व्यक्तिगत स्वच्छता किट, और एक ऐसी जगह जिसे वे वास्तव में घर कह सकें।" },
  { en: "With advancing age comes the need for physical support. Your contributions directly fund the purchase of mobility aids like walking sticks and wheelchairs, as well as routine medical checkups and essential medications.", hi: "बढ़ती उम्र के साथ शारीरिक सहायता की आवश्यकता आती है। आपका योगदान सीधे वॉकिंग स्टिक और व्हीलचेयर जैसे गतिशीलता सहायक उपकरणों की खरीद, साथ ही नियमित चिकित्सा जांच और आवश्यक दवाओं के लिए धन प्रदान करता है।" },
  { en: "Help us restore their dignity. No elder should have to spend their final years feeling forgotten or unloved. Your contribution is not just a donation; it is a warm embrace that says, 'We care.'", hi: "उनकी गरिमा बहाल करने में हमारी मदद करें। किसी भी बुजुर्ग को अपने अंतिम वर्ष भूला हुआ या अप्रिय महसूस करते हुए नहीं बिताने चाहिए। आपका योगदान केवल एक दान नहीं है; यह एक गर्म आलिंगन है जो कहता है, 'हम परवाह करते हैं।'" },
];

function DignifiedLivingSupportPage() {
  const { coverUrl } = useServiceImage("Dignified Living Support for Elderly", livingSupportImg);
  const img = coverUrl || livingSupportImg;
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
          title: "Dignified Living Support for the Elderly",
          text: "Help provide shelter, medical care, and dignity for abandoned elderly citizens.",
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
    <section className="living-support-detail-page">
      <div className="living-support-detail-shell">
        <div className="living-support-content-grid">
          <aside className="living-support-side-stack">
            <article className="campaign-card">
              <div className="campaign-image-wrap">
                <img src={livingSupportImg} alt="Elderly person receiving support and care" />
                <span className="campaign-chip">80G Tax Benefits</span>
              </div>

              <div className="campaign-body">
                <h1>Provide dignified living and shelter for abandoned elderly</h1>
                <p className="campaign-org">by Silver Years Foundation</p>

                <div className="campaign-amounts">
                  <strong>Rs 3,45,000</strong>
                  <span>raised of Rs 8,00,000 goal</span>
                </div>

                <div className="campaign-progress" aria-hidden="true">
                  <span className="campaign-progress-fill" style={{ width: "43%" }} />
                </div>

                <div className="campaign-stats">
                  <div>
                    <strong>312</strong>
                    <span>Donors</span>
                  </div>
                  <div>
                    <strong>28</strong>
                    <span>Days left</span>
                  </div>
                  <div>
                    <strong>43%</strong>
                    <span>Funded</span>
                  </div>
                </div>

                <div className="campaign-actions">
                  <Link to="/donate" state={{ serviceImage: livingSupportImg, serviceTitle: "Provide dignified living and shelter for abandoned elderly" }} className="campaign-btn campaign-btn-primary">
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

          <div className="living-support-main-stack">
            <section className="living-support-section-card">
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

            <section className="living-support-section-card">
              <div className="section-head">
                <h2>Recent Donations</h2>
                <span>312 Donations</span>
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
              <p>Every small share and donation helps provide shelter, clothing, and care.</p>
              <div className="support-actions">
                <Link to="/donate" state={{ serviceImage: livingSupportImg, serviceTitle: "Provide dignified living and shelter for abandoned elderly" }} className="campaign-btn campaign-btn-primary">
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

            <section className="living-support-section-card">
              <h2>Organizers</h2>
              <div className="organizer-list">
                <article className="organizer-item">
                  <span className="organizer-logo">SY</span>
                  <div>
                    <h3>Silver Years Foundation</h3>
                    <p>Verified NGO</p>
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
                    <p>Your support directly funds shelter maintenance and medical care.</p>
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

            <section className="living-support-section-card faq-section">
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

export default DignifiedLivingSupportPage;