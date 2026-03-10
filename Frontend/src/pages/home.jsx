import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding, FaHeart, FaMapMarkerAlt, FaHandshake, FaChartBar,
  FaCheckCircle, FaFileAlt, FaSatelliteDish, FaChild, FaUtensils,
  FaHospitalAlt, FaFemale, FaRing, FaRoad, FaSearch, FaCreditCard,
  FaChartLine, FaMobileAlt, FaHandHoldingHeart,
  FaArrowUp, FaShieldAlt, FaUsers, FaQuoteLeft, FaCheck,
} from "react-icons/fa";
import elderImage    from "../assets/images/elderly/elder.png";
import elderMedical  from "../assets/images/elderly/medical.webp";
import elderFood     from "../assets/images/elderly/food.jpg";
import orphanEducation from "../assets/images/orphanage/education.jpg";
import orphanFood    from "../assets/images/orphanage/food.webp";
import orphanHealth  from "../assets/images/orphanage/health.jpg";
import medicalCamp   from "../assets/images/Medical/camp.jpg";
import widow         from "../assets/images/women/widow.png";
import kandyaDan     from "../assets/images/socialWelfare/kanyadan.png";
import kanyaHero     from "../assets/images/socialWelfare/Kanyadan/hero.png";
import road          from "../assets/images/infrastructure/road.jpg";


/* ── color tokens ── */
const C = {
  green:     "#2d6a4f",   // primary — deep muted green
  greenDark: "#1b4332",   // hover / headings
  greenSoft: "#52b788",   // accents
  greenBg:   "#f0f4f1",   // soft green background
  orange:    "#c45c2e",   // warm terracotta CTA
  orangeHov: "#a84a22",
  orangeBg:  "#fdf3ed",
  warmBg:    "#f9f6f2",   // off-white warm sections
  border:    "#e0dbd5",
  text:      "#1c1c1c",
  textMid:   "#4a4a4a",
  textLight: "#767676",
  white:     "#ffffff",
};

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

export default function Home() {
  const [slide, setSlide]         = useState(0);
  const [openFaq, setOpenFaq]     = useState(null);

  /* hero slides */
  const slides = [
    {
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1920&auto=format&fit=crop",
      kicker: "Child Welfare",
      h: "Every Child Deserves a Safe Childhood",
      p: "Providing shelter, nutrition, and education to thousands of orphaned children across India.",
    },
    {
      img: elderImage,
      kicker: "Elderly Care",
      h: "Honouring Those Who Built Our Nation",
      p: "Bringing healthcare, companionship, and dignity to India's forgotten senior citizens.",
    },
    {
      img: "https://images.pexels.com/photos/1181216/pexels-photo-1181216.jpeg?auto=compress&cs=tinysrgb&w=1920",
      kicker: "Women Empowerment",
      h: "Empowering Women, Strengthening Communities",
      p: "Supporting widowed and underprivileged women with livelihood training and financial aid.",
    },
  ];

  useEffect(() => {
    const id = setInterval(() => setSlide(p => (p + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  /* scroll reveal */
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("sv"); }),
      { threshold: 0.07 }
    );
    document.querySelectorAll(".sr, .sl").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* counters */
  const [statsRef, statsHit] = useInView(0.3);
  const n1 = useCountUp(500,  2000, statsHit);
  const n2 = useCountUp(10000, 2200, statsHit);
  const n3 = useCountUp(25,   1500, statsHit);
  const n4 = useCountUp(3200, 2000, statsHit);

  /* data */
  const causes = [
    { img: orphanEducation, cat: "Child Welfare",  title: "Education for Every Orphaned Child",  raised: 148000, goal: 250000, link: "/services/orphanage" },
    { img: elderMedical,    cat: "Elderly Care",   title: "Medical Aid for Senior Citizens",     raised: 92000,  goal: 150000, link: "/services/elderly"  },
    { img: medicalCamp,     cat: "Medical Aid",    title: "Free Health Camps in Rural Areas",    raised: 67000,  goal: 100000, link: "/services"           },
    { img: kandyaDan,       cat: "Kanya Daan",     title: "Support for Girls' Weddings",         raised: 78000,  goal: 120000, link: "/services"           },
  ];

  const programs = [
    { img: orphanFood,   Icon: FaChild,       title: "Child Nutrition",     desc: "Daily meals and nutrition for orphaned children in partner shelters across India.",               link: "/services/orphanage" },
    { img: elderFood,    Icon: FaUtensils,    title: "Meals for Seniors",   desc: "Freshly cooked meals delivered to elderly citizens who live alone and can no longer cook.",       link: "/services/elderly"  },
    { img: orphanHealth, Icon: FaHospitalAlt, title: "Health Camps",        desc: "Free medical camps offering check-ups, medicines, and specialist consultations in rural areas.",  link: "/services"          },
    { img: widow,        Icon: FaFemale,      title: "Women Empowerment",   desc: "Livelihood training, financial aid, and emotional support for widowed and underprivileged women.", link: "/services"          },
    { img: kanyaHero,    Icon: FaRing,        title: "Kanya Daan Yojana",   desc: "Financial and logistical support for families who cannot afford their daughters' marriages.",     link: "/services"          },
    { img: road,         Icon: FaRoad,        title: "Rural Infrastructure",desc: "Community-driven road, water, and sanitation projects in villages with no basic amenities.",      link: "/services"          },
  ];

  const whyUs = [
    { Icon: FaShieldAlt,    h: "Strict Verification",   p: "Every NGO undergoes field audits, legal document checks, and trustee background verification before listing." },
    { Icon: FaChartBar,     h: "Full Transparency",     p: "Donors receive fund utilisation reports and downloadable receipts for every contribution they make." },
    { Icon: FaFileAlt,      h: "80G Tax Benefits",      p: "All donations are eligible for Section 80G deductions. We generate your certificate within 48 hours." },
    { Icon: FaMapMarkerAlt, h: "Pan-India Reach",       p: "Our network spans 25+ states and 200+ districts — from remote villages to metro cities." },
    { Icon: FaUsers,        h: "Volunteer Matching",    p: "We pair volunteers with opportunities that match their skills, availability, and preferred causes." },
    { Icon: FaMobileAlt,    h: "Secure Payments",       p: "Donate in under 60 seconds via UPI, net banking, or card — secured by Razorpay's bank-grade encryption." },
  ];

  const stories = [
    { quote: "Before SevaIndia, I struggled to find reliable NGOs. Now I donate monthly and see exactly where every rupee goes. It changed how I think about giving.", name: "Rahul Mehta", role: "Software Engineer, Mumbai", tag: "Donor since 2022" },
    { quote: "After registering on SevaIndia and completing KYC, our monthly donations tripled within six months. The platform is a genuine game-changer for small NGOs.", name: "Sister Mary Thomas", role: "Director, Bal Ashram Trust, Jaipur", tag: "NGO partner since 2021" },
    { quote: "I volunteered two hours a week. Children who hadn't spoken in weeks started laughing. That kind of impact is impossible to put into words.", name: "Ananya Singh", role: "Student & Volunteer, Bangalore", tag: "Volunteer since 2023" },
  ];

  const faqs = [
    { q: "Is my donation tax-deductible?",         a: "Yes. All donations are eligible for deduction under Section 80G of the Income Tax Act. You will receive your certificate by email within 48 hours." },
    { q: "How do I know the NGO is genuine?",       a: "Every NGO on SevaIndia goes through KYC verification — legal registration documents, trustee IDs, field visits, and annual audits." },
    { q: "Can I donate from outside India?",        a: "We currently accept donations from Indian residents and NRIs via UPI, net banking, and cards. International donors can write to us at support@sevaindia.org." },
    { q: "How do I become a volunteer?",            a: "Click Apply as Volunteer, fill in your skills and availability, and we will match you with an NGO near you within 48 hours." },
    { q: "Can I donate to a specific NGO or cause?",a: "Absolutely. Browse NGOs using the Find NGOs page and earmark your donation to a specific project or programme." },
  ];

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',Roboto,sans-serif", color: C.text, overflowX: "hidden", background: C.white }}>

      <style>{`
        /* reveal */
        .sr { opacity:0; transform:translateY(28px); transition:opacity .7s ease,transform .7s ease; }
        .sr.sv { opacity:1; transform:none; }
        .sr.d1{transition-delay:.08s} .sr.d2{transition-delay:.16s} .sr.d3{transition-delay:.24s}

        /* slide-left reveal */
        .sl { opacity:0; transform:translateX(-60px); transition:opacity .75s ease,transform .75s ease; }
        .sl.sv { opacity:1; transform:none; }
        .sl.d1{transition-delay:.05s} .sl.d2{transition-delay:.2s} .sl.d3{transition-delay:.38s}
        .sr.d4{transition-delay:.32s} .sr.d5{transition-delay:.40s} .sr.d6{transition-delay:.48s}

        /* buttons */
        .bt-primary {
          display:inline-flex; align-items:center; gap:8px;
          background:${C.orange}; color:#fff; padding:13px 30px;
          border-radius:5px; font-weight:600; font-size:.95rem;
          text-decoration:none; border:none; cursor:pointer;
          transition:background .2s,transform .2s,box-shadow .2s;
        }
        .bt-primary:hover { background:${C.orangeHov}; transform:translateY(-2px); box-shadow:0 6px 20px rgba(196,92,46,.25); }

        .bt-outline-w {
          display:inline-flex; align-items:center; gap:8px;
          border:1.5px solid rgba(255,255,255,.55); color:#fff; background:transparent;
          padding:12px 28px; border-radius:5px; font-weight:600; font-size:.95rem;
          text-decoration:none; cursor:pointer; transition:all .2s;
        }
        .bt-outline-w:hover { background:rgba(255,255,255,.1); border-color:#fff; }

        .bt-green {
          display:inline-flex; align-items:center; gap:8px;
          background:${C.green}; color:#fff; padding:12px 28px;
          border-radius:5px; font-weight:600; font-size:.92rem;
          text-decoration:none; border:none; cursor:pointer; transition:background .2s,transform .2s;
        }
        .bt-green:hover { background:${C.greenDark}; transform:translateY(-2px); }

        .bt-green-o {
          display:inline-flex; align-items:center; gap:8px;
          border:1.5px solid ${C.green}; color:${C.green}; background:${C.white};
          padding:11px 27px; border-radius:5px; font-weight:600; font-size:.92rem;
          text-decoration:none; cursor:pointer; transition:all .2s;
        }
        .bt-green-o:hover { background:${C.greenBg}; }

        /* section header */
        .sh-tag {
          display:inline-block; font-size:.7rem; font-weight:700; letter-spacing:2px;
          text-transform:uppercase; padding:4px 14px; border-radius:50px; margin-bottom:10px;
        }
        .sh-tag.green { background:${C.greenBg}; color:${C.green}; }
        .sh-tag.orange { background:${C.orangeBg}; color:${C.orange}; }

        /* card hover lift */
        .card-lift { transition:transform .28s ease,box-shadow .28s ease; }
        .card-lift:hover { transform:translateY(-7px); box-shadow:0 14px 40px rgba(0,0,0,.1) !important; }

        /* prog card image zoom */
        .prog-img { width:100%; height:200px; object-fit:cover; display:block; transition:transform .5s ease; }
        .prog-wrap:hover .prog-img { transform:scale(1.04); }

        /* faq */
        .faq-row { border-bottom:1px solid ${C.border}; }
        .faq-btn {
          width:100%; background:none; border:none; text-align:left; padding:20px 24px;
          font-size:.97rem; font-weight:600; color:${C.text}; cursor:pointer;
          display:flex; justify-content:space-between; align-items:center; gap:12px;
        }
        .faq-body { padding:0 24px 20px; font-size:.9rem; color:${C.textMid}; line-height:1.8; }

        /* input */
        .fi {
          width:100%; padding:12px 14px; border:1.5px solid ${C.border}; border-radius:6px;
          font-size:.92rem; font-family:inherit; outline:none; background:${C.white};
          transition:border-color .2s; box-sizing:border-box;
        }
        .fi:focus { border-color:${C.green}; }

        /* two-col split */
        .two-col { display:grid; grid-template-columns:1fr 1fr; gap:72px; align-items:center; }

        /* grids */
        .g2 { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
        .g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
        .g4 { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }

        /* scroll to top */
        .stt {
          position:fixed; bottom:26px; right:26px; width:42px; height:42px;
          background:${C.green}; color:#fff; border-radius:50%; border:none; cursor:pointer;
          z-index:999; display:flex; align-items:center; justify-content:center;
          box-shadow:0 3px 12px rgba(0,0,0,.2); transition:all .25s;
        }
        .stt:hover { background:${C.orange}; transform:translateY(-3px); }

        /* stats divider */
        .stat-cell { padding:28px 16px; text-align:center; }
        .stat-cell + .stat-cell { border-left:1px solid rgba(255,255,255,.12); }

        /* ngo chip */
        .ngo-chip {
          display:flex; align-items:center; gap:14px; padding:16px 20px;
          background:${C.white}; border:1px solid ${C.border}; border-radius:10px;
          box-shadow:0 1px 8px rgba(0,0,0,.05); transition:box-shadow .25s;
        }
        .ngo-chip:hover { box-shadow:0 4px 18px rgba(0,0,0,.1); }

        @media(max-width:1024px){
          .two-col { grid-template-columns:1fr; gap:40px; }
          .g4 { grid-template-columns:repeat(2,1fr); }
          .g3 { grid-template-columns:repeat(2,1fr); }
          .rev-img { order:-1; }
        }
        @media(max-width:640px){
          .g3 { grid-template-columns:1fr; }
          .g4 { grid-template-columns:1fr 1fr; }
          .g2 { grid-template-columns:1fr; }
          .hero-row { flex-direction:column !important; align-items:flex-start !important; }
          .stats-inner { grid-template-columns:1fr 1fr !important; }
          .stat-cell + .stat-cell { border-left:none; border-top:1px solid rgba(255,255,255,.12); }
          .action-card { flex-direction:column !important; }
          .action-block { width:100% !important; border-right:none !important; flex-direction:row !important; padding:20px 24px !important; gap:20px !important; justify-content:flex-start !important; align-items:center !important; }
        }
        @media(max-width:400px){
          .g4 { grid-template-columns:1fr; }
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* ╔══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════╗ */}
      <section style={{ position: "relative", height: "100vh", minHeight: "600px", overflow: "hidden" }}>

        {/* background slides */}
        {slides.map((s, i) => (
          <div key={i} style={{
            position: "absolute", inset: 0,
            backgroundImage: `url('${s.img}')`,
            backgroundSize: "cover", backgroundPosition: "center top",
            opacity: i === slide ? 1 : 0,
            transition: "opacity 1.4s ease",
          }} />
        ))}

        {/* overlay — subtle, not pitch black */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(27,67,50,.82) 0%, rgba(27,67,50,.55) 55%, rgba(0,0,0,.2) 100%)" }} />

        {/* content */}
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 36px", width: "100%" }}>

            {/* kicker */}
            <span key={`k${slide}`} style={{ display: "inline-block", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", padding: "5px 16px", borderRadius: "50px", fontSize: ".7rem", fontWeight: "700", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "20px", animation: "fadeUp .5s ease forwards" }}>
              {slides[slide].kicker}
            </span>

            <h1 key={`h${slide}`} style={{ fontSize: "clamp(2rem,5vw,3.8rem)", fontWeight: "800", color: "#fff", lineHeight: "1.14", margin: "0 0 18px", maxWidth: "640px", animation: "fadeUp .55s ease .06s both" }}>
              {slides[slide].h}
            </h1>

            <p key={`p${slide}`} style={{ fontSize: "clamp(.95rem,1.6vw,1.1rem)", color: "rgba(255,255,255,.85)", margin: "0 0 34px", maxWidth: "520px", lineHeight: "1.8", animation: "fadeUp .55s ease .12s both" }}>
              {slides[slide].p}
            </p>

            <div className="hero-row" style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link to="/donate" className="bt-primary">Donate Now</Link>
              <a href="#services" className="bt-outline-w">Our Programmes</a>
            </div>
          </div>
        </div>

        {/* slide dots */}
        <div style={{ position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 3 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} style={{
              width: i === slide ? "28px" : "8px", height: "8px", borderRadius: "4px",
              background: i === slide ? "#fff" : "rgba(255,255,255,.35)",
              border: "none", cursor: "pointer", padding: 0, transition: "all .35s",
            }} />
          ))}
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════╗ */}
      <div ref={statsRef} style={{ background: C.greenDark }}>
        <div className="stats-inner" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { n: n1, s: "+", label: "Verified NGOs",  Icon: FaBuilding    },
            { n: n2, s: "+", label: "Lives Changed",  Icon: FaHeart       },
            { n: n3, s: "+", label: "States Covered", Icon: FaMapMarkerAlt},
            { n: n4, s: "+", label: "Active Donors",  Icon: FaHandshake   },
          ].map((s, i) => (
            <div key={i} className="stat-cell">
              <s.Icon style={{ color: "rgba(255,255,255,.5)", fontSize: "1.1rem", marginBottom: "8px" }} />
              <div style={{ fontSize: "clamp(1.7rem,2.8vw,2.4rem)", fontWeight: "800", color: "#fff", lineHeight: 1 }}>
                {s.n.toLocaleString("en-IN")}{s.s}
              </div>
              <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "5px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════
          ABOUT — split
      ══════════════════════════════════════════════════╗ */}
      <section style={{ padding: "100px 36px", background: C.white }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div className="two-col">

            {/* left text */}
            <div className="sr">
              <span className="sh-tag green">Who We Are</span>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.6rem)", fontWeight: "800", color: C.text, margin: "8px 0 16px", lineHeight: 1.25 }}>
                Bridging the Gap Between<br /><span style={{ color: C.green }}>Compassion and Real Change</span>
              </h2>
              <div style={{ width: "44px", height: "3px", background: C.orange, borderRadius: "2px", marginBottom: "22px" }} />
              <p style={{ color: C.textMid, lineHeight: "1.9", fontSize: "1rem", margin: "0 0 16px" }}>
                SevaIndia was built on one belief: <strong style={{ color: C.text }}>good people want to help, but they need a trustworthy bridge.</strong> We verify NGOs, track every rupee, and make giving as simple and transparent as possible.
              </p>
              <p style={{ color: C.textMid, lineHeight: "1.9", fontSize: "1rem", margin: "0 0 28px" }}>
                From an orphaned child in a Rajasthan shelter to a senior citizen in a Mumbai chawl, our platform ensures that your donation reaches the right person — and that you can see exactly how it is used.
              </p>

              {/* trust chips */}
              <div className="g2" style={{ marginBottom: "30px" }}>
                {[
                  { Icon: FaChartBar,    label: "100% Transparent"  },
                  { Icon: FaCheckCircle, label: "KYC-Verified NGOs" },
                  { Icon: FaFileAlt,     label: "80G Tax Benefits"   },
                  { Icon: FaSatelliteDish, label: "Live Tracking"   },
                ].map(b => (
                  <div key={b.label} style={{ display: "flex", alignItems: "center", gap: "9px", padding: "11px 14px", background: C.greenBg, border: `1px solid #c3dece`, borderRadius: "8px", fontSize: ".85rem", fontWeight: "600", color: C.green }}>
                    <b.Icon style={{ flexShrink: 0, fontSize: ".95rem" }} /> {b.label}
                  </div>
                ))}
              </div>
              <Link to="/find-ngos" className="bt-green">Explore Our Network</Link>
            </div>

            {/* right image with floating badges */}
            <div className="sr d2" style={{ position: "relative" }}>
              <img src={orphanEducation} alt="Children learning" style={{ width: "100%", height: "420px", objectFit: "cover", borderRadius: "12px", display: "block", boxShadow: "0 8px 32px rgba(0,0,0,.1)" }} />
              {/* bottom left badge */}
              <div style={{ position: "absolute", bottom: "-24px", left: "-24px", background: C.white, borderRadius: "10px", padding: "18px 22px", boxShadow: "0 6px 28px rgba(0,0,0,.1)", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "1.6rem", fontWeight: "800", color: C.green }}>₹2.4 Cr+</div>
                <div style={{ fontSize: ".75rem", color: C.textLight, marginTop: "3px" }}>Channelled to verified causes</div>
              </div>
              {/* top right badge */}
              <div style={{ position: "absolute", top: "-16px", right: "-16px", background: C.orange, borderRadius: "10px", padding: "16px 18px", boxShadow: "0 4px 20px rgba(196,92,46,.28)", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#fff" }}>98%</div>
                <div style={{ fontSize: ".65rem", color: "rgba(255,255,255,.85)", fontWeight: "600", letterSpacing: ".5px", textTransform: "uppercase" }}>Donor<br/>Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════
          FEATURED CAUSES — progress bars
      ══════════════════════════════════════════════════╗ */}
      <section id="causes" style={{ padding: "90px 36px", background: C.warmBg }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>

          <div className="sr" style={{ marginBottom: "52px" }}>
            <span className="sh-tag orange">Active Campaigns</span>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: "800", color: C.text, margin: "8px 0 10px" }}>Fundraising Campaigns That Need You</h2>
            <p style={{ color: C.textLight, fontSize: ".95rem", maxWidth: "500px", lineHeight: 1.8 }}>These causes need your support right now. Every donation brings us closer to the goal.</p>
          </div>

          <div className="g4">
            {causes.map((c, i) => (
              <div key={i} className={`card-lift sr d${i + 1}`} style={{ background: C.white, borderRadius: "10px", overflow: "hidden", border: `1px solid ${C.border}` }}>
                <div style={{ overflow: "hidden", height: "180px" }}>
                  <img src={c.img} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform .5s" }} />
                </div>
                <div style={{ padding: "20px 18px" }}>
                  <span style={{ display: "inline-block", background: C.greenBg, color: C.green, fontSize: ".65rem", fontWeight: "700", padding: "3px 10px", borderRadius: "50px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>{c.cat}</span>
                  <h3 style={{ fontSize: ".93rem", fontWeight: "700", color: C.text, margin: "0 0 14px", lineHeight: 1.5 }}>{c.title}</h3>

                  <div style={{ background: "#ececec", borderRadius: "3px", height: "5px", marginBottom: "8px" }}>
                    <div style={{ height: "5px", borderRadius: "3px", background: C.green, width: `${Math.round((c.raised / c.goal) * 100)}%`, transition: "width 1.4s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".75rem", color: C.textLight, marginBottom: "16px" }}>
                    <span><strong style={{ color: C.green }}>₹{(c.raised / 1000).toFixed(0)}K</strong> raised</span>
                    <span>of ₹{(c.goal / 1000).toFixed(0)}K</span>
                  </div>
                  <Link to={c.link} className="bt-primary" style={{ display: "block", textAlign: "center", padding: "10px 16px", fontSize: ".85rem" }}>Support This Cause</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════
          PROGRAMMES
      ══════════════════════════════════════════════════╗ */}
      <section id="services" style={{ padding: "90px 36px", background: C.white }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>

          <div className="sr" style={{ textAlign: "center", marginBottom: "52px" }}>
            <span className="sh-tag green">What We Do</span>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: "800", color: C.text, margin: "8px 0 10px" }}>Our Programmes &amp; Services</h2>
            <div style={{ width: "40px", height: "3px", background: C.orange, borderRadius: "2px", margin: "0 auto 14px" }} />
            <p style={{ color: C.textLight, fontSize: ".95rem", maxWidth: "540px", margin: "0 auto", lineHeight: 1.8 }}>
              Targeted programmes addressing the root causes of poverty and neglect in India's most vulnerable communities.
            </p>
          </div>

          <div className="g3">
            {programs.map((p, i) => (
              <div key={i} className={`prog-wrap card-lift sr d${(i % 3) + 1}`} style={{ background: C.white, borderRadius: "10px", overflow: "hidden", border: `1px solid ${C.border}` }}>
                <div style={{ overflow: "hidden" }}>
                  <img src={p.img} alt={p.title} className="prog-img" loading="lazy" />
                </div>
                <div style={{ padding: "22px 20px" }}>
                  <div style={{ width: "38px", height: "38px", background: C.greenBg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                    <p.Icon style={{ color: C.green, fontSize: "1.1rem" }} />
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "700", color: C.text, margin: "0 0 8px" }}>{p.title}</h3>
                  <p style={{ fontSize: ".85rem", color: C.textMid, lineHeight: "1.7", margin: "0 0 16px" }}>{p.desc}</p>
                  <Link to={p.link} style={{ fontSize: ".85rem", fontWeight: "600", color: C.green, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    Learn more →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="sr" style={{ textAlign: "center", marginTop: "44px" }}>
            <Link to="/services" className="bt-green">View All Programmes</Link>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════
          QUOTE BANNER
      ══════════════════════════════════════════════════╗ */}
      <section style={{ padding: "72px 36px", background: C.greenDark, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: "rgba(255,255,255,.03)" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "260px", height: "260px", borderRadius: "50%", background: "rgba(255,255,255,.03)" }} />
        <div style={{ maxWidth: "780px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <FaQuoteLeft className="sr" style={{ color: "rgba(255,255,255,.12)", fontSize: "3.5rem", marginBottom: "12px" }} />
          <h2 className="sr" style={{ fontSize: "clamp(1.4rem,3vw,2.2rem)", fontWeight: "700", color: "#fff", margin: "0 0 16px", lineHeight: 1.4, fontStyle: "italic" }}>
            "A single donation can feed a child for a month, pay for a senior's medicines, or put a girl through school."
          </h2>
          <p className="sr d1" style={{ color: "rgba(255,255,255,.6)", fontSize: ".92rem", margin: "0 0 32px", lineHeight: 1.8 }}>
            Minimum ₹1,000 — 100% goes to the cause. Operational costs are covered through institutional funding.
          </p>
          <div className="sr d2" style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/donate" className="bt-primary">Start with ₹1,000</Link>
            <Link to="/find-ngos" className="bt-outline-w">Find a Cause</Link>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════╗ */}
      <section id="how" style={{ padding: "90px 36px", background: C.warmBg }}>
        <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
          <div className="sr" style={{ textAlign: "center", marginBottom: "52px" }}>
            <span className="sh-tag orange">Process</span>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: "800", color: C.text, margin: "8px 0 10px" }}>How It Works in 3 Steps</h2>
            <p style={{ color: C.textLight, fontSize: ".95rem", maxWidth: "460px", margin: "0 auto", lineHeight: 1.8 }}>
              We removed every barrier between your intention to give and measurable impact on the ground.
            </p>
          </div>

          <div className="g3">
            {[
              { n: "01", Icon: FaSearch,     h: "Browse & Choose",  p: "Search 500+ verified NGOs by cause, location, or rating. Read their reports, audit financials, and pick the cause that matters to you." },
              { n: "02", Icon: FaCreditCard, h: "Donate Securely",  p: "Donate via UPI, net banking, or card in under 60 seconds. Receive an instant receipt and your 80G tax certificate." },
              { n: "03", Icon: FaChartLine,  h: "Track the Impact", p: "Follow your donation's journey with fund utilisation updates, ground photos, and annual impact reports from the NGO." },
            ].map((s, i) => (
              <div key={i} className={`sr d${i + 1}`} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "36px 28px", position: "relative" }}>
                <div style={{ position: "absolute", top: "16px", right: "20px", fontSize: "3rem", fontWeight: "900", color: "#efefef", lineHeight: 1 }}>{s.n}</div>
                <div style={{ width: "44px", height: "44px", background: C.orangeBg, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <s.Icon style={{ color: C.orange, fontSize: "1.2rem" }} />
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: C.text, margin: "0 0 10px" }}>{s.h}</h3>
                <p style={{ color: C.textMid, lineHeight: "1.75", fontSize: ".88rem", margin: 0 }}>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════
          WHY SEVA INDIA — split
      ══════════════════════════════════════════════════╗ */}
      <section style={{ padding: "90px 36px", background: C.white }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div className="two-col">

            <div className="sr">
              <span className="sh-tag green">Why Us</span>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.6rem)", fontWeight: "800", color: C.text, margin: "8px 0 16px", lineHeight: 1.25 }}>
                India's Most Trusted<br />NGO Donation Platform
              </h2>
              <div style={{ width: "44px", height: "3px", background: C.orange, borderRadius: "2px", marginBottom: "20px" }} />
              <p style={{ color: C.textMid, lineHeight: "1.9", fontSize: "1rem", margin: "0 0 16px" }}>
                We didn't build SevaIndia to be another donation portal. We built it to fix a trust problem. Billions of rupees meant for charity are lost annually to fraud and mismanagement in India.
              </p>
              <p style={{ color: C.textMid, lineHeight: "1.9", fontSize: "1rem", margin: "0 0 28px" }}>
                SevaIndia ensures <strong style={{ color: C.text }}>every rupee you donate reaches the people it was meant for</strong> — with proof, gratitude, and the ability to see the change you created.
              </p>
              <Link to="/add-ngo" className="bt-green-o">Register Your NGO</Link>
            </div>

            <div className="sr d2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {whyUs.map((w, i) => (
                <div key={i} style={{ background: C.warmBg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "22px 18px" }}>
                  <div style={{ width: "40px", height: "40px", background: C.greenBg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                    <w.Icon style={{ color: C.green, fontSize: "1rem" }} />
                  </div>
                  <h4 style={{ fontSize: ".9rem", fontWeight: "700", color: C.text, margin: "0 0 6px" }}>{w.h}</h4>
                  <p style={{ fontSize: ".8rem", color: C.textMid, lineHeight: "1.65", margin: 0 }}>{w.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════
          FIND NGOs — split reversed
      ══════════════════════════════════════════════════╗ */}
      <section id="find-ngos" style={{ padding: "90px 36px", background: C.warmBg }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div className="two-col">

            {/* NGO preview cards */}
            <div className="sr rev-img" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { name: "Bal Ashram Trust",              city: "Rajasthan",   cause: "Child Welfare",     rating: "4.9", donors: "1.2K", color: "#2d5a27" },
                { name: "Elders' Haven Society",         city: "Maharashtra", cause: "Elderly Care",      rating: "4.8", donors: "890",  color: "#1b4d7a" },
                { name: "Sakhi Women's Foundation",      city: "Delhi",       cause: "Women Empowerment", rating: "4.7", donors: "650",  color: "#5a2d82" },
                { name: "Arogya Health Initiative",      city: "Karnataka",   cause: "Medical Aid",       rating: "4.8", donors: "540",  color: "#7a2020" },
              ].map((n, i) => (
                <div key={i} className={`ngo-chip sr d${i + 1}`}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: n.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "1rem", flexShrink: 0 }}>{n.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "700", fontSize: ".9rem", color: C.text }}>{n.name}</div>
                    <div style={{ fontSize: ".75rem", color: C.textLight, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <FaMapMarkerAlt style={{ flexShrink: 0, fontSize: ".7rem" }} /> {n.city} · {n.cause}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: "#c8942a", fontWeight: "700", fontSize: ".85rem" }}>★ {n.rating}</div>
                    <div style={{ fontSize: ".7rem", color: C.textLight }}>{n.donors} donors</div>
                  </div>
                </div>
              ))}
              <div style={{ textAlign: "center", paddingTop: "4px" }}>
                <Link to="/find-ngos" style={{ color: C.green, fontWeight: "600", fontSize: ".85rem", textDecoration: "none" }}>View all 500+ verified NGOs →</Link>
              </div>
            </div>

            {/* text */}
            <div className="sr d2">
              <span className="sh-tag green">NGO Network</span>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.6rem)", fontWeight: "800", color: C.text, margin: "8px 0 16px", lineHeight: 1.25 }}>
                Find a Verified NGO<br />Near Your City
              </h2>
              <div style={{ width: "44px", height: "3px", background: C.orange, borderRadius: "2px", marginBottom: "20px" }} />
              <p style={{ color: C.textMid, lineHeight: "1.9", fontSize: "1rem", margin: "0 0 16px" }}>
                Every NGO on SevaIndia is personally verified. We visit offices, check legal filings, audit past expenditures, and speak with beneficiaries before approving a listing.
              </p>
              <p style={{ color: C.textMid, lineHeight: "1.9", fontSize: "1rem", margin: "0 0 28px" }}>
                Filter by cause, state, or rating to find organisations working on issues closest to your heart.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link to="/find-ngos" className="bt-green">Browse NGOs</Link>
                <Link to="/add-ngo" className="bt-green-o">Register Your NGO</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════╗ */}
      <section style={{ padding: "90px 36px", background: C.white }}>
        <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
          <div className="sr" style={{ textAlign: "center", marginBottom: "52px" }}>
            <span className="sh-tag orange">Real Stories</span>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: "800", color: C.text, margin: "8px 0 10px" }}>Voices From Our Community</h2>
            <p style={{ color: C.textLight, fontSize: ".95rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
              Donors, volunteers, and NGO partners share how SevaIndia changed the way they give.
            </p>
          </div>

          <div className="g3">
            {stories.map((s, i) => (
              <div key={i} className={`sr d${i + 1}`} style={{ background: C.warmBg, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "28px 24px" }}>
                <FaQuoteLeft style={{ color: C.green, fontSize: "1.2rem", opacity: .5, marginBottom: "14px" }} />
                <p style={{ color: C.textMid, lineHeight: "1.85", fontSize: ".9rem", margin: "0 0 22px", fontStyle: "italic" }}>{s.quote}</p>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "18px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: C.greenDark, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: ".8rem", flexShrink: 0 }}>{s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: ".9rem", color: C.text }}>{s.name}</div>
                    <div style={{ fontSize: ".75rem", color: C.textLight, marginTop: "1px" }}>{s.role}</div>
                    <div style={{ fontSize: ".7rem", color: C.greenSoft, marginTop: "1px" }}>{s.tag}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════
          GET INVOLVED — 3 cards
      ══════════════════════════════════════════════════╗ */}
      <section id="join" style={{ padding: "90px 36px", background: C.warmBg }}>
        <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
          <div className="sr" style={{ textAlign: "center", marginBottom: "52px" }}>
            <span className="sh-tag green">Get Involved</span>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: "800", color: C.text, margin: "8px 0 10px" }}>There Are Many Ways to Help</h2>
            <p style={{ color: C.textLight, fontSize: ".95rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>You don't need to donate money to create change. Your time, skills, or network can be equally powerful.</p>
          </div>

          <div className="g3">
            {[
              {
                Icon: FaHandHoldingHeart, topBg: "#c45c2e", label: "Donate",
                desc: "Contribute to a verified cause. Every rupee is tracked and 80G tax-deductible.",
                benefits: ["As low as ₹100", "Instant receipt & 80G cert", "Choose your cause", "Monthly giving option"],
                link: "/donate", btnLabel: "Donate Now", btnStyle: "bt-primary",
              },
              {
                Icon: FaHandshake, topBg: C.green, label: "Volunteer",
                desc: "Give your time and skills. We match you with opportunities that fit your schedule.",
                benefits: ["Flexible hours", "Remote or on-ground", "Certificate of service", "25+ states"],
                link: "/volunteer", btnLabel: "Apply as Volunteer", btnStyle: "bt-green",
              },
              {
                Icon: FaBuilding, topBg: "#2a2a2a", label: "Register NGO",
                desc: "Reach thousands of donors across India. Get KYC-verified and start fundraising.",
                benefits: ["Free listing", "Verified badge", "Donor network access", "Fundraising tools"],
                link: "/add-ngo", btnLabel: "Register Your NGO", btnStyle: "bt-green",
              },
            ].map((card, i) => (
              <div key={i} className={`card-lift sr d${i + 1}`} style={{ background: C.white, borderRadius: "10px", overflow: "hidden", border: `1px solid ${C.border}` }}>
                <div style={{ background: card.topBg, padding: "32px 26px" }}>
                  <card.Icon style={{ fontSize: "2rem", color: "rgba(255,255,255,.9)", marginBottom: "12px", display: "block" }} />
                  <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: "800", margin: "0 0 6px" }}>{card.label}</h3>
                  <p style={{ color: "rgba(255,255,255,.78)", fontSize: ".85rem", margin: 0, lineHeight: 1.65 }}>{card.desc}</p>
                </div>
                <div style={{ padding: "24px 26px" }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: "9px" }}>
                    {card.benefits.map(b => (
                      <li key={b} style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: ".85rem", color: C.textMid }}>
                        <FaCheck style={{ color: C.green, fontSize: ".7rem", flexShrink: 0 }} /> {b}
                      </li>
                    ))}
                  </ul>
                  <Link to={card.link} className={card.btnStyle} style={{ display: "block", textAlign: "center", justifyContent: "center" }}>{card.btnLabel}</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════╗ */}
      <section style={{ padding: "90px 36px", background: C.white }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div className="sr" style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="sh-tag orange">FAQ</span>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: "800", color: C.text, margin: "8px 0 10px" }}>Frequently Asked Questions</h2>
            <p style={{ color: C.textLight, fontSize: ".95rem", lineHeight: 1.8 }}>Everything you need to know before making your first donation.</p>
          </div>

          <div style={{ border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
            {faqs.map((f, i) => (
              <div key={i} className="faq-row sr">
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span style={{ fontSize: "1.1rem", color: C.textLight, flexShrink: 0, transition: "transform .22s", transform: openFaq === i ? "rotate(45deg)" : "none", display: "block" }}>+</span>
                </button>
                {openFaq === i && <div className="faq-body">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════════╗ */}
      {/* ── Action Pathways (slide-left) ── */}
      <section id="action" style={{ padding: "90px 36px", background: C.white }}>
        <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
          <div className="sr" style={{ textAlign: "center", marginBottom: "56px" }}>
            <span className="sh-tag orange">Take Action</span>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: "800", color: C.text, margin: "8px 0 10px" }}>Three Ways to Create Change</h2>
            <p style={{ color: C.textLight, fontSize: ".95rem", maxWidth: "440px", margin: "0 auto", lineHeight: 1.8 }}>Whether you give, volunteer, or represent an NGO — there is a path for you here.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { accent: C.orange,    accentBg: C.orangeBg, Icon: FaHandHoldingHeart, stat: "₹10 Cr+", label: "Total Funds Raised",  title: "Donate to a Cause",    desc: "Every rupee you give is tracked and reported. Choose a cause, donate securely via UPI or card, and receive your 80G certificate within 48 hours.", cta: "Donate Now",         link: "/donate"   },
              { accent: C.green,     accentBg: C.greenBg,  Icon: FaUsers,           stat: "1,200+",   label: "Active Volunteers",    title: "Volunteer Your Time",  desc: "Two hours a week can transform a life. Tell us your skills and location — we will match you with verified NGOs that need you most.",               cta: "Apply as Volunteer", link: "/volunteer"},
              { accent: C.greenDark, accentBg: "#e8edf0",  Icon: FaBuilding,        stat: "500+",     label: "NGOs Onboarded",       title: "Register Your NGO",    desc: "List your organisation, pass our KYC, and unlock a verified donor base across India. We handle the platform — you focus on impact.",               cta: "Register NGO",       link: "/add-ngo"  },
            ].map((item, i) => (
              <div
                key={i}
                className={`sl d${i + 1} action-card`}
                style={{ display: "flex", borderRadius: "12px", overflow: "hidden", border: `1px solid ${C.border}`, background: C.white, transition: "box-shadow .28s ease" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,.09)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                {/* colour block */}
                <div className="action-block" style={{ width: "200px", flexShrink: 0, background: item.accentBg, borderRight: `4px solid ${item.accent}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 20px", gap: "14px" }}>
                  <div style={{ width: "60px", height: "60px", background: item.accent, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.Icon style={{ color: "#fff", fontSize: "1.5rem" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem", fontWeight: "900", color: item.accent, lineHeight: 1 }}>{item.stat}</div>
                    <div style={{ fontSize: ".68rem", color: C.textLight, fontWeight: "600", marginTop: "5px", textTransform: "uppercase", letterSpacing: ".5px" }}>{item.label}</div>
                  </div>
                </div>

                {/* content */}
                <div style={{ flex: 1, padding: "32px 36px", display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={{ fontSize: ".68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "2px", color: item.accent, marginBottom: "8px" }}>Path {i + 1}</div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: C.text, margin: "0 0 10px" }}>{item.title}</h3>
                    <p style={{ color: C.textMid, fontSize: ".9rem", lineHeight: 1.85, margin: 0 }}>{item.desc}</p>
                  </div>
                  <Link to={item.link} className="bt-primary" style={{ flexShrink: 0, whiteSpace: "nowrap" }}>{item.cta}</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* scroll to top */}
      <button className="stt" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top">
        <FaArrowUp style={{ fontSize: ".9rem" }} />
      </button>
    </div>
  );
}
