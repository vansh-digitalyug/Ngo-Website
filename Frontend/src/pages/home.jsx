import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding, FaHeart, FaMapMarkerAlt, FaHandshake, FaChartBar,
  FaCheckCircle, FaFileAlt, FaSatelliteDish, FaChild, FaUtensils,
  FaHospitalAlt, FaFemale, FaRing, FaRoad, FaSearch, FaCreditCard,
  FaChartLine, FaMobileAlt, FaHandHoldingHeart,
  FaArrowUp, FaShieldAlt, FaUsers, FaQuoteLeft, FaCheck, FaChevronDown,
  FaRupeeSign, FaStar, FaHandHoldingUsd, FaRegClock, FaFireAlt,
} from "react-icons/fa";
import "./home.css";
import elderImage       from "../assets/images/elderly/elder.png";
import elderMedical     from "../assets/images/elderly/medical.webp";
import elderFood        from "../assets/images/elderly/food.jpg";
import orphanEducation  from "../assets/images/orphanage/education.jpg";
import orphanFood       from "../assets/images/orphanage/food.webp";
import orphanHealth     from "../assets/images/orphanage/health.jpg";
import medicalCamp      from "../assets/images/Medical/camp.jpg";
import widow            from "../assets/images/women/widow.png";
import kandyaDan        from "../assets/images/socialWelfare/kanyadan.png";
import kanyaHero        from "../assets/images/socialWelfare/Kanyadan/hero.png";
import road             from "../assets/images/infrastructure/road.jpg";

/* ── animated counter ── */
function useCountUp(end, duration = 2000, trigger = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let raf;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(e * end));
      if (p < 1) raf = requestAnimationFrame(tick); else setVal(end);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, end, duration]);
  return val;
}

/* ── one-shot intersection hook ── */
function useInView(threshold = 0.18) {
  const ref = useRef(null);
  const [hit, setHit] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHit(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, hit];
}

// In dev: empty string → Vite proxies /api/* to localhost:5000 (no CORS issues)
// In prod: uses the deployed backend URL from env
const API = import.meta.env.PROD
  ? String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")
  : "";

export default function Home() {
  const [slide, setSlide]     = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [showStt, setShowStt] = useState(false);

  /* ── live NGO data from backend ── */
  const [liveNgos, setLiveNgos]   = useState([]);
  const [ngoTotal, setNgoTotal]   = useState(500);
  const [ngoLoading, setNgoLoading] = useState(true);

  /* ── slides ── */
  const slides = [
    {
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1920&auto=format&fit=crop",
      kicker: "Child Welfare",
      h: <>Every Child Deserves a <em>Safe Childhood</em></>,
      p: "Providing shelter, nutrition, and education to thousands of orphaned children across India.",
    },
    {
      img: elderImage,
      kicker: "Elderly Care",
      h: <>Honouring Those Who <em>Built Our Nation</em></>,
      p: "Bringing healthcare, companionship, and dignity to India's forgotten senior citizens.",
    },
    {
      img: "https://images.pexels.com/photos/1181216/pexels-photo-1181216.jpeg?auto=compress&cs=tinysrgb&w=1920",
      kicker: "Women Empowerment",
      h: <>Empowering Women, <em>Strengthening Communities</em></>,
      p: "Supporting widowed and underprivileged women with livelihood training and financial aid.",
    },
  ];

  /* hero auto-advance */
  useEffect(() => {
    const id = setInterval(() => setSlide(p => (p + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  /* scroll reveal — watches all 4 animation classes */
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("sv"); }),
      { threshold: 0.07 }
    );
    document.querySelectorAll(".sr,.sl,.sfr,.ssc").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* scroll-to-top visibility */
  useEffect(() => {
    const onScroll = () => setShowStt(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── fetch NGOs from backend (public endpoint) ── */
  useEffect(() => {
    fetch(`${API}/api/ngo?limit=4&page=1`)
      .then(r => {
        if (!r.ok) throw new Error(`API returned ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (typeof json.total === "number") setNgoTotal(json.total);
        if (Array.isArray(json.data) && json.data.length > 0) {
          setLiveNgos(json.data.map(n => ({
            id:     n._id,
            name:   n.ngoName,
            city:   n.city  || n.state || "India",
            cause:  Array.isArray(n.services) && n.services[0] ? n.services[0] : "General",
            rating: n.rating ? Number(n.rating).toFixed(1) : "4.8",
          })));
        }
      })
      .catch(err => console.error("[Home] NGO fetch error:", err))
      .finally(() => setNgoLoading(false));
  }, []);

  /* animated counters — n1 uses live ngoTotal once fetched */
  const [statsRef, statsHit] = useInView(0.3);
  const n1 = useCountUp(ngoTotal, 2000, statsHit);
  const n2 = useCountUp(10000,    2200, statsHit);
  const n3 = useCountUp(25,       1500, statsHit);
  const n4 = useCountUp(3200,     2000, statsHit);

  /* ── data ── */
  const causes = [
    { img: orphanEducation, cat: "Child Welfare",  title: "Education for Every Orphaned Child",  raised: 148000, goal: 250000, link: "/services/orphanage" },
    { img: elderMedical,    cat: "Elderly Care",   title: "Medical Aid for Senior Citizens",     raised: 92000,  goal: 150000, link: "/services/elderly"  },
    { img: medicalCamp,     cat: "Medical Aid",    title: "Free Health Camps in Rural Areas",    raised: 67000,  goal: 100000, link: "/services"           },
    { img: kandyaDan,       cat: "Kanya Daan",     title: "Support for Girls' Weddings",         raised: 78000,  goal: 120000, link: "/services"           },
  ];

  const programs = [
    { img: orphanFood,   Icon: FaChild,       title: "Child Nutrition",      desc: "Daily meals and nutrition for orphaned children in partner shelters across India.",               link: "/services/orphanage" },
    { img: elderFood,    Icon: FaUtensils,    title: "Meals for Seniors",    desc: "Freshly cooked meals delivered to elderly citizens who live alone and can no longer cook.",       link: "/services/elderly"  },
    { img: orphanHealth, Icon: FaHospitalAlt, title: "Health Camps",         desc: "Free medical camps offering check-ups, medicines, and specialist consultations in rural areas.",  link: "/services"          },
    { img: widow,        Icon: FaFemale,      title: "Women Empowerment",    desc: "Livelihood training, financial aid, and emotional support for widowed and underprivileged women.", link: "/services"          },
    { img: kanyaHero,    Icon: FaRing,        title: "Kanya Daan Yojana",    desc: "Financial and logistical support for families who cannot afford their daughters' marriages.",     link: "/services"          },
    { img: road,         Icon: FaRoad,        title: "Rural Infrastructure", desc: "Community-driven road, water, and sanitation projects in villages with no basic amenities.",      link: "/services"          },
  ];

  const whyUs = [
    { Icon: FaShieldAlt,     h: "Strict Verification",  p: "Every NGO undergoes field audits, legal document checks, and trustee background verification before listing." },
    { Icon: FaChartBar,      h: "Full Transparency",    p: "Donors receive fund utilisation reports and downloadable receipts for every contribution they make." },
    { Icon: FaFileAlt,       h: "80G Tax Benefits",     p: "All donations are eligible for Section 80G deductions. We generate your certificate within 48 hours." },
    { Icon: FaMapMarkerAlt,  h: "Pan-India Reach",      p: "Our network spans 25+ states and 200+ districts — from remote villages to metro cities." },
    { Icon: FaUsers,         h: "Volunteer Matching",   p: "We pair volunteers with opportunities that match their skills, availability, and preferred causes." },
    { Icon: FaMobileAlt,     h: "Secure Payments",      p: "Donate in under 60 seconds via UPI, net banking, or card — secured by Razorpay's bank-grade encryption." },
  ];

  const stories = [
    { quote: "Before SevaIndia, I struggled to find reliable NGOs. Now I donate monthly and see exactly where every rupee goes. It changed how I think about giving.", name: "Rahul Mehta",        role: "Software Engineer, Mumbai",               tag: "Donor since 2022"       },
    { quote: "After registering on SevaIndia and completing KYC, our monthly donations tripled within six months. The platform is a genuine game-changer for small NGOs.", name: "Sister Mary Thomas", role: "Director, Bal Ashram Trust, Jaipur",       tag: "NGO partner since 2021" },
    { quote: "I volunteered two hours a week. Children who hadn't spoken in weeks started laughing. That kind of impact is impossible to put into words.", name: "Ananya Singh",       role: "Student & Volunteer, Bangalore",           tag: "Volunteer since 2023"   },
  ];

  const faqs = [
    { q: "Is my donation tax-deductible?",           a: "Yes. All donations are eligible for deduction under Section 80G of the Income Tax Act. You will receive your certificate by email within 48 hours." },
    { q: "How do I know the NGO is genuine?",         a: "Every NGO on SevaIndia goes through KYC verification — legal registration documents, trustee IDs, field visits, and annual audits." },
    { q: "Can I donate from outside India?",          a: "We currently accept donations from Indian residents and NRIs via UPI, net banking, and cards. International donors can write to us at support@sevaindia.org." },
    { q: "How do I become a volunteer?",              a: "Click Apply as Volunteer, fill in your skills and availability, and we will match you with an NGO near you within 48 hours." },
    { q: "Can I donate to a specific NGO or cause?",  a: "Absolutely. Browse NGOs using the Find NGOs page and earmark your donation to a specific project or programme." },
  ];

  // After loading: use live DB data. If DB empty, show nothing (handled by skeleton/loading state).
  const ngos = liveNgos;

  /* marquee ticker items — ngoTotal is live from API */
  const marqueeItems = [
    { Icon: FaStar,             text: <><strong>{ngoTotal}+</strong> Verified NGOs</> },
    { Icon: FaHandHoldingUsd,   text: <><strong>₹2.4 Crore+</strong> Donated</> },
    { Icon: FaMapMarkerAlt,     text: <><strong>25 States</strong> Covered</> },
    { Icon: FaUsers,            text: <><strong>3,200+</strong> Active Donors</> },
    { Icon: FaCheckCircle,      text: <><strong>100%</strong> Transparent</> },
    { Icon: FaFileAlt,          text: <><strong>80G</strong> Tax Benefits</> },
    { Icon: FaHeart,            text: <><strong>10,000+</strong> Lives Changed</> },
    { Icon: FaFireAlt,          text: <><strong>48 hrs</strong> Certificate Delivery</> },
    { Icon: FaShieldAlt,        text: <><strong>KYC-Verified</strong> Every NGO</> },
    { Icon: FaHandshake,        text: <><strong>1,200+</strong> Volunteers</> },
  ];

  /* recent donations feed */
  const recentDonations = [
    { initials: "RM", color: "#1a2d5a", name: "Rahul M.",       cause: "Education for Orphaned Children",  amount: "₹2,500",  time: "2 min ago"  },
    { initials: "PS", color: "#b45309", name: "Priya S.",        cause: "Medical Aid for Senior Citizens",  amount: "₹5,000",  time: "8 min ago"  },
    { initials: "AK", color: "#065f46", name: "Amit K.",         cause: "Nutritious Meal Programme",        amount: "₹1,000",  time: "15 min ago" },
    { initials: "ST", color: "#5b21b6", name: "Sunita T.",       cause: "Kanya Daan Yojana",                amount: "₹10,000", time: "22 min ago" },
    { initials: "VR", color: "#9f1239", name: "Vikram R.",       cause: "Rural Infrastructure Project",     amount: "₹3,000",  time: "31 min ago" },
    { initials: "MN", color: "#1e3a5f", name: "Meena N.",        cause: "Women Empowerment Programme",      amount: "₹1,500",  time: "45 min ago" },
    { initials: "DJ", color: "#78350f", name: "Dev J.",          cause: "Free Health Camps",                amount: "₹7,500",  time: "1 hr ago"   },
    { initials: "RP", color: "#14532d", name: "Ritu P.",         cause: "Education for Orphaned Children",  amount: "₹2,000",  time: "1 hr ago"   },
    { initials: "NK", color: "#312e81", name: "Nikhil K.",       cause: "Elderly Care Support",             amount: "₹4,000",  time: "2 hrs ago"  },
  ];

  return (
    <div className="hm-root">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="hero">

        {slides.map((s, i) => (
          <div key={i} className={`hero-slide${i === slide ? " active" : ""}`}>
            <img src={s.img} alt={s.kicker} loading={i === 0 ? "eager" : "lazy"} />
          </div>
        ))}

        <div className="hero-overlay" />

        <div className="hero-content">
          <span key={`k${slide}`} className="hero-kicker">{slides[slide].kicker}</span>
          <h1 key={`h${slide}`} className="hero-h1">{slides[slide].h}</h1>
          <p key={`p${slide}`} className="hero-p">{slides[slide].p}</p>
          <div className="hero-actions">
            <Link to="/donate" className="btn-amber">Donate Now</Link>
            <a href="#services" className="btn-white-outline">Our Programmes</a>
          </div>
        </div>

        <div className="hero-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === slide ? " on" : ""}`}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="hero-scroll-cue">
          <span className="hero-scroll-line" />
          Scroll to explore
        </div>

      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <div ref={statsRef} className="stats-bar">
        <div className="stats-inner">
          {[
            { n: n1, s: "+", label: "Verified NGOs",  Icon: FaBuilding      },
            { n: n2, s: "+", label: "Lives Changed",  Icon: FaHeart         },
            { n: n3, s: "+", label: "States Covered", Icon: FaMapMarkerAlt  },
            { n: n4, s: "+", label: "Active Donors",  Icon: FaHandshake     },
          ].map((st, i) => (
            <div key={i} className="stat-cell">
              <st.Icon />
              <div className="stat-num">{st.n.toLocaleString("en-IN")}{st.s}</div>
              <div className="stat-label">{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          INFINITE MARQUEE BANNER
      ══════════════════════════════════════════ */}
      <div className="marquee-section">
        <div className="marquee-wrapper">
          {/* duplicate the list so the loop is seamless */}
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="marquee-item">
                <item.Icon />
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════ */}
      <section className="about-section">
        <div className="about-inner">

          <div className="about-text sl">
            <span className="sec-tag navy">Who We Are</span>
            <h2 className="sec-title">
              Bridging the Gap Between<br />
              <span>Compassion and Real Change</span>
            </h2>
            <div className="sec-divider" />
            <p>
              SevaIndia was built on one belief:{" "}
              <strong>good people want to help, but they need a trustworthy bridge.</strong>{" "}
              We verify NGOs, track every rupee, and make giving as simple and transparent as possible.
            </p>
            <p>
              From an orphaned child in a Rajasthan shelter to a senior citizen in a Mumbai chawl, our
              platform ensures that your donation reaches the right person — and that you can see exactly
              how it is used.
            </p>
            <div className="about-bullets">
              {[
                { Icon: FaChartBar,      label: "100% Transparent"   },
                { Icon: FaCheckCircle,   label: "KYC-Verified NGOs"  },
                { Icon: FaFileAlt,       label: "80G Tax Benefits"   },
                { Icon: FaSatelliteDish, label: "Live Tracking"      },
              ].map(b => (
                <div key={b.label} className="about-bullet">
                  <b.Icon /> {b.label}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "28px" }}>
              <Link to="/find-ngos" className="btn-navy">Explore Our Network</Link>
            </div>
          </div>

          <div className="about-img-wrap sfr d2">
            <img src={orphanEducation} alt="Children learning" />
            <div className="about-badge">
              <FaHeart />
              <div>
                <div style={{ fontSize: "1.28rem", fontWeight: 900, lineHeight: 1 }}>₹2.4 Cr+</div>
                <div style={{ fontSize: ".7rem", opacity: .88, marginTop: 3 }}>Channelled to verified causes</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          CAUSES
      ══════════════════════════════════════════ */}
      <section id="causes" className="causes-section">
        <div className="causes-inner">

          <div className="sr sec-center" style={{ marginBottom: "48px" }}>
            <span className="sec-tag amber">Active Campaigns</span>
            <h2 className="sec-title">Fundraising Campaigns <span>That Need You</span></h2>
            <div className="sec-divider center" />
            <p className="sec-sub">
              These causes need your support right now. Every donation brings us closer to the goal.
            </p>
          </div>

          <div className="causes-grid">
            {causes.map((c, i) => (
              <div key={i} className={`cause-card sr d${i + 1}`}>
                <div className="cause-card-img-wrap">
                  <img src={c.img} alt={c.title} loading="lazy" />
                  <span className="cause-cat">{c.cat}</span>
                </div>
                <div className="cause-body">
                  <h3>{c.title}</h3>
                  <div className="cause-amounts">
                    <span className="cause-raised">₹{(c.raised / 1000).toFixed(0)}K raised</span>
                    <span className="cause-goal">of ₹{(c.goal / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="cause-bar">
                    <div
                      className="cause-bar-fill"
                      style={{ width: `${Math.round((c.raised / c.goal) * 100)}%` }}
                    />
                  </div>
                  <div className="cause-pct">{Math.round((c.raised / c.goal) * 100)}% funded</div>
                  <Link to={c.link} className="cause-cta">Support This Cause →</Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROGRAMMES
      ══════════════════════════════════════════ */}
      <section id="services" className="programs-section">
        <div className="programs-inner">

          <div className="sr sec-center" style={{ marginBottom: "48px" }}>
            <span className="sec-tag navy">What We Do</span>
            <h2 className="sec-title">Our <span>Programmes</span> &amp; Services</h2>
            <div className="sec-divider center" />
            <p className="sec-sub">
              Targeted programmes addressing the root causes of poverty and neglect in India's
              most vulnerable communities.
            </p>
          </div>

          <div className="programs-grid">
            {programs.map((p, i) => (
              <div key={i} className={`prog-card sr d${(i % 3) + 1}`}>
                <div className="prog-img-wrap">
                  <img src={p.img} alt={p.title} loading="lazy" />
                  <div className="prog-icon-wrap"><p.Icon /></div>
                </div>
                <div className="prog-body">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <Link to={p.link} className="prog-link">Learn more →</Link>
                </div>
              </div>
            ))}
          </div>

          <div className="sr sec-center" style={{ marginTop: "40px" }}>
            <Link to="/services" className="btn-navy">View All Programmes</Link>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          MID CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="mid-cta">
        <div className="mid-cta-inner">
          <span className="sec-tag white sr">"One donation. Real change."</span>
          <h2 className="sr d1">
            A single contribution can feed a child for a month, pay for a senior's medicines,
            or put a girl through school.
          </h2>
          <p className="sr d2">
            Minimum ₹1,000 — 100% goes to the cause. Operational costs are covered through
            institutional funding.
          </p>
          <div className="mid-cta-actions sr d3">
            <Link to="/donate" className="btn-amber">Start with ₹1,000</Link>
            <Link to="/find-ngos" className="btn-white-outline">Find a Cause</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how" className="how-section">
        <div className="how-inner">

          <div className="sr sec-center" style={{ marginBottom: "52px" }}>
            <span className="sec-tag amber">The Process</span>
            <h2 className="sec-title">How It Works in <span>4 Simple Steps</span></h2>
            <div className="sec-divider center" />
            <p className="sec-sub">
              We removed every barrier between your intention to give and measurable impact on
              the ground.
            </p>
          </div>

          <div className="how-steps">
            {[
              { n: "01", Icon: FaSearch,      h: "Browse NGOs",     p: "Search 500+ verified NGOs by cause, location, or rating. Read reports and audit financials." },
              { n: "02", Icon: FaCheckCircle, h: "Pick a Cause",    p: "Choose a project that resonates with you — child welfare, elderly care, women empowerment, or more." },
              { n: "03", Icon: FaCreditCard,  h: "Donate Securely", p: "Pay via UPI, net banking, or card in under 60 seconds. Get an instant receipt + 80G certificate." },
              { n: "04", Icon: FaChartLine,   h: "Track Impact",    p: "Follow your donation's journey with fund utilisation updates and ground-level impact reports." },
            ].map((s, i) => (
              <div key={i} className={`how-step sr d${i + 1}`}>
                <div className="how-num">{s.n}</div>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY US
      ══════════════════════════════════════════ */}
      <section className="why-section">
        <div className="why-inner">

          <div className="sr sec-center" style={{ marginBottom: "48px" }}>
            <span className="sec-tag navy">Why SevaIndia</span>
            <h2 className="sec-title">India's Most Trusted <span>NGO Donation Platform</span></h2>
            <div className="sec-divider center" />
            <p className="sec-sub">
              SevaIndia ensures every rupee you donate reaches the people it was meant for —
              with proof, gratitude, and the ability to see the change you created.
            </p>
          </div>

          <div className="why-grid">
            {whyUs.map((w, i) => (
              <div key={i} className={`why-card ssc d${(i % 3) + 1}`}>
                <div className="why-icon"><w.Icon /></div>
                <h3>{w.h}</h3>
                <p>{w.p}</p>
              </div>
            ))}
          </div>

          <div className="sr sec-center" style={{ marginTop: "40px" }}>
            <Link to="/add-ngo" className="btn-navy-outline">Register Your NGO</Link>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          FIND NGOs
      ══════════════════════════════════════════ */}
      <section id="find-ngos" className="find-section">
        <div className="find-inner">

          <div className="sl">
            <div className="find-chips">

              {/* loading skeleton */}
              {ngoLoading && [0,1,2,3].map(i => (
                <div key={i} className="ngo-chip" style={{ opacity: .5 }}>
                  <div className="ngo-logo" style={{ background: "#c7d2fe" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: "#e5e7eb", borderRadius: 4, marginBottom: 6, width: "60%" }} />
                    <div style={{ height: 10, background: "#f3f4f6", borderRadius: 4, width: "80%" }} />
                  </div>
                </div>
              ))}

              {/* real data from DB */}
              {!ngoLoading && ngos.map((n, i) => (
                <Link to={`/ngo/${n.id || ""}`} key={n.id || i} className={`ngo-chip sr d${i + 1}`}>
                  <div className="ngo-logo">{n.name ? n.name[0].toUpperCase() : "N"}</div>
                  <div>
                    <h4>{n.name}</h4>
                    <p>
                      <FaMapMarkerAlt style={{ fontSize: ".68rem", marginRight: 3 }} />
                      {n.city} · {n.cause}
                    </p>
                  </div>
                  <span className="ngo-chip-verified">★ {n.rating} Verified</span>
                </Link>
              ))}

              <div style={{ textAlign: "center", paddingTop: "6px" }}>
                <Link
                  to="/find-ngos"
                  style={{ color: "var(--navy)", fontWeight: 700, fontSize: ".85rem", textDecoration: "none" }}
                >
                  View all {ngoTotal}+ verified NGOs →
                </Link>
              </div>
            </div>
          </div>

          <div className="sfr d2">
            <span className="sec-tag navy">NGO Network</span>
            <h2 className="sec-title">Find a Verified NGO<br /><span>Near Your City</span></h2>
            <div className="sec-divider" />
            <p className="sec-sub" style={{ marginBottom: "16px" }}>
              Every NGO on SevaIndia is personally verified. We visit offices, check legal filings,
              audit past expenditures, and speak with beneficiaries before approving a listing.
            </p>
            <p className="sec-sub" style={{ marginBottom: "28px" }}>
              Filter by cause, state, or rating to find organisations working on issues closest
              to your heart.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link to="/find-ngos" className="btn-navy">Browse NGOs</Link>
              <Link to="/add-ngo" className="btn-navy-outline">Register Your NGO</Link>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="testimonials-section">
        <div className="testimonials-inner">

          <div className="sr sec-center" style={{ marginBottom: "48px" }}>
            <span className="sec-tag white">Real Stories</span>
            <h2 className="sec-title light">Voices From <span>Our Community</span></h2>
            <div className="sec-divider center" />
            <p className="sec-sub light">
              Donors, volunteers, and NGO partners share how SevaIndia changed the way they give.
            </p>
          </div>

          <div className="testimonials-grid">
            {stories.map((s, i) => (
              <div key={i} className={`testi-card sr d${i + 1}`}>
                <div className="testi-quote-icon"><FaQuoteLeft /></div>
                <p className="testi-text">{s.quote}</p>
                <div className="testi-author">
                  <div className="testi-avatar">
                    {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="testi-name">{s.name}</p>
                    <p className="testi-role">{s.role}</p>
                    <span className="testi-tag">{s.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          JOIN / GET INVOLVED
      ══════════════════════════════════════════ */}
      <section id="join" className="join-section">
        <div className="join-inner">

          <div className="sr sec-center" style={{ marginBottom: "48px" }}>
            <span className="sec-tag amber">Get Involved</span>
            <h2 className="sec-title">There Are Many <span>Ways to Help</span></h2>
            <div className="sec-divider center" />
            <p className="sec-sub">
              You don't need to donate money to create change. Your time, skills, or network can
              be equally powerful.
            </p>
          </div>

          <div className="join-cards">
            {[
              {
                Icon: FaHandHoldingHeart,
                h: "Donate",
                p: "Contribute to a verified cause. Every rupee is tracked and 80G tax-deductible.",
                link: "/donate",
                btn: "Donate Now",
                benefits: ["As low as ₹100", "Instant receipt & 80G cert", "Choose your cause", "Monthly giving option"],
              },
              {
                Icon: FaHandshake,
                h: "Volunteer",
                p: "Give your time and skills. We match you with opportunities that fit your schedule.",
                link: "/volunteer",
                btn: "Apply as Volunteer",
                benefits: ["Flexible hours", "Remote or on-ground", "Certificate of service", "25+ states"],
              },
              {
                Icon: FaBuilding,
                h: "Register NGO",
                p: "Reach thousands of donors across India. Get KYC-verified and start fundraising.",
                link: "/add-ngo",
                btn: "Register Your NGO",
                benefits: ["Free listing", "Verified badge", "Donor network access", "Fundraising tools"],
              },
            ].map((card, i) => (
              <div key={i} className={`join-card sr d${i + 1}`}>
                <div className="join-card-icon"><card.Icon /></div>
                <h3>{card.h}</h3>
                <p>{card.p}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", textAlign: "left" }}>
                  {card.benefits.map(b => (
                    <li key={b} style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: ".84rem", color: "var(--text-mid)", marginBottom: "8px" }}>
                      <FaCheck style={{ color: "var(--amber)", fontSize: ".68rem", flexShrink: 0 }} />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to={card.link}
                  className="btn-amber"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {card.btn}
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          RECENT DONATIONS
      ══════════════════════════════════════════ */}
      <section className="donations-section">
        <div className="donations-inner">

          <div className="sr sec-center" style={{ marginBottom: "48px" }}>
            <span className="live-dot">Live Feed</span>
            <h2 className="sec-title">Recent <span>Donations</span></h2>
            <div className="sec-divider center" />
            <p className="sec-sub">
              Real people making real impact — see the latest contributions flowing in right now.
            </p>
          </div>

          <div className="donations-grid">
            {recentDonations.map((d, i) => (
              <div key={i} className={`donation-card sr d${(i % 3) + 1}`}>
                <div className="donor-avatar" style={{ background: d.color }}>
                  {d.initials}
                </div>
                <div className="donation-info">
                  <h4>{d.name}</h4>
                  <p className="donation-cause">{d.cause}</p>
                  <div className="donation-meta">
                    <span className="donation-amount">{d.amount}</span>
                    <span className="donation-time">
                      <FaRegClock style={{ fontSize: ".65rem", marginRight: 4 }} />
                      {d.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* total raised ticker bar */}
          <div className="donations-ticker sr">
            <div className="donations-ticker-left">
              <div className="donations-ticker-icon">
                <FaHandHoldingUsd />
              </div>
              <div>
                <h3>₹2,40,87,450</h3>
                <p>Total funds raised to date</p>
              </div>
            </div>
            <Link to="/donate" className="btn-amber">
              Add Your Contribution
            </Link>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="faq-section">
        <div className="faq-inner">

          <div className="sr sec-center" style={{ marginBottom: "44px" }}>
            <span className="sec-tag amber">FAQ</span>
            <h2 className="sec-title">Frequently Asked <span>Questions</span></h2>
            <div className="sec-divider center" />
            <p className="sec-sub">
              Everything you need to know before making your first donation.
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-row sr${openFaq === i ? " open" : ""}`}>
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <FaChevronDown className="faq-chevron" />
                </button>
                {openFaq === i && <div className="faq-body">{f.a}</div>}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          SCROLL TO TOP
      ══════════════════════════════════════════ */}
      <button
        className={`stt-btn${showStt ? " visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <FaArrowUp />
      </button>

    </div>
  );
}
