import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPublicStats, selectPublicStats, selectPublicStatsStatus } from "../store/slices/publicStatsSlice";
import { fetchNgos, selectNgos, selectNgosStatus } from "../store/slices/ngosSlice";
import { Link } from "react-router-dom";
import IndiaMap from "../components/IndiaMap.jsx";
import {
  FaBuilding, FaHeart, FaMapMarkerAlt, FaHandshake, FaChartBar,
  FaCheckCircle, FaFileAlt, FaSatelliteDish, FaChild, FaUtensils,
  FaHospitalAlt, FaFemale, FaRing, FaRoad, FaSearch, FaCreditCard,
  FaChartLine, FaMobileAlt, FaHandHoldingHeart,
  FaShieldAlt, FaUsers, FaQuoteLeft, FaCheck, FaChevronDown,
  FaRupeeSign, FaStar, FaHandHoldingUsd, FaRegClock, FaFireAlt,
} from "react-icons/fa";

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
function useCountUp(end, duration = 2500, trigger = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let raf;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4); // Smoother ease-out curve
      setVal(Math.floor(e * end));
      if (p < 1) raf = requestAnimationFrame(tick); else setVal(end);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, end, duration]);
  return val;
}

/* ── one-shot intersection hook ── */
function useInView(threshold = 0.15) {
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
  const [slide, setSlide]     = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  /* ── Redux store ── */
  const dispatch          = useDispatch();
  const publicData        = useSelector(selectPublicStats);
  const statsStatus       = useSelector(selectPublicStatsStatus);
  const allNgos           = useSelector(selectNgos);
  const ngosStatus        = useSelector(selectNgosStatus);

  /* ── programmes carousel ── */
  const [progSlide, setProgSlide] = useState(0);
  const [progVisible, setProgVisible] = useState(3);

  /* ── slides ── */
  const slides = [
    {
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1920&auto=format&fit=crop",
      kicker: "Child Welfare",
      h: <>Every Child Deserves a <em className="not-italic bg-gradient-to-r from-amber-200 to-amber-600 bg-clip-text text-transparent">Safe Childhood</em></>,
      p: "Providing shelter, nutrition, and education to thousands of orphaned children across India.",
    },
    {
      img: elderImage,
      kicker: "Elderly Care",
      h: <>Honouring Those Who <em className="not-italic bg-gradient-to-r from-amber-200 to-amber-600 bg-clip-text text-transparent">Built Our Nation</em></>,
      p: "Bringing healthcare, companionship, and dignity to India's forgotten senior citizens.",
    },
    {
      img: "https://images.pexels.com/photos/1181216/pexels-photo-1181216.jpeg?auto=compress&cs=tinysrgb&w=1920",
      kicker: "Women Empowerment",
      h: <>Empowering Women, <em className="not-italic bg-gradient-to-r from-amber-200 to-amber-600 bg-clip-text text-transparent">Strengthening Communities</em></>,
      p: "Supporting widowed and underprivileged women with livelihood training and financial aid.",
    },
  ];

  useEffect(() => {
    const id = setInterval(() => setSlide(p => (p + 1) % slides.length), 7000); // Slowed down hero slide change
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("sv");
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".sr,.sl,.sfr,.ssc,.line-track").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const update = () => {
      const vis = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
      setProgVisible(vis);
      setProgSlide(s => Math.min(s, Math.max(0, 6 - vis)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ── programmes carousel auto-play ── */
  const [progPaused, setProgPaused] = useState(false);
  useEffect(() => {
    if (progPaused) return;
    const id = setInterval(() => {
      setProgSlide(s => {
        const max = Math.max(0, 6 - progVisible);
        return s >= max ? 0 : s + 1;
      });
    }, 4000); // Slowed down auto-play
    return () => clearInterval(id);
  }, [progPaused, progVisible]);

  /* ── fetch from Redux store once (idle guard) ── */
  useEffect(() => { if (statsStatus === "idle") dispatch(fetchPublicStats()); }, [statsStatus, dispatch]);
  useEffect(() => { if (ngosStatus  === "idle") dispatch(fetchNgos());        }, [ngosStatus,  dispatch]);

  /* ── derive variables from the store ── */
  const liveStats           = publicData?.stats          ?? null;
  const liveCauses          = publicData?.topCauses      ?? [];
  const liveRecentDonations = publicData?.recentDonations ?? [];

  const ngoLoading = ngosStatus === "idle" || ngosStatus === "loading";
  const ngoTotal   = liveStats?.totalNgos ?? allNgos.length;
  const liveNgos   = allNgos.slice(0, 4).map(n => ({
    id:    n._id,
    name:  n.ngoName,
    city:  n.city  || n.state || "India",
    cause: Array.isArray(n.services) && n.services[0] ? n.services[0] : "General",
    rating: n.rating != null ? Number(n.rating).toFixed(1) : null,
  }));

  const [statsRef, statsHit] = useInView(0.3);
  const n1 = useCountUp(liveStats?.totalNgos      ?? ngoTotal, 2500, statsHit);
  const n2 = useCountUp(liveStats?.totalDonations ?? 0,        3000, statsHit);
  const n3 = useCountUp(liveStats?.statesCovered  ?? 0,        2000, statsHit);
  const n4 = useCountUp(liveStats?.totalVolunteers ?? 0,       2800, statsHit);

  const CAUSE_IMG_MAP = [
    { keywords: ["orphan", "child", "education", "school"],   img: orphanEducation, link: "/services/orphanage/education" },
    { keywords: ["elder", "senior"],                           img: elderMedical,    link: "/services/elder/medical"        },
    { keywords: ["meal", "food", "nutrition"],                 img: orphanFood,      link: "/services/orphanage/meal"       },
    { keywords: ["kanya", "wedding", "marriage", "girl"],      img: kandyaDan,       link: "/services/welfare/kanyadan"     },
    { keywords: ["widow", "women", "woman", "empowerment"],    img: widow,           link: "/services/women/widow-women"    },
    { keywords: ["road", "infrastructure", "construction"],    img: road,            link: "/services/infrastructure/road-construction" },
    { keywords: ["cancer", "kidney"],                          img: medicalCamp,     link: "/services/medical/cancer"       },
    { keywords: ["camp", "health", "medical"],                 img: medicalCamp,     link: "/services/medical/camp"         },
  ];

  const getCauseImg = (title) => {
    const lower = (title || "").toLowerCase();
    for (const m of CAUSE_IMG_MAP) {
      if (m.keywords.some(k => lower.includes(k))) return { img: m.img, link: m.link };
    }
    return { img: medicalCamp, link: "/services" };
  };

  const staticCauses = [
    { img: orphanEducation, cat: "Child Welfare", title: "Education for Every Orphaned Child", raised: 148000, goal: 250000, link: "/services/orphanage/education" },
    { img: elderMedical,    cat: "Elderly Care",  title: "Medical Aid for Senior Citizens",    raised: 92000,  goal: 150000, link: "/services/elder/medical"       },
    { img: medicalCamp,     cat: "Medical Aid",   title: "Free Health Camps in Rural Areas",   raised: 67000,  goal: 100000, link: "/services/medical/camp"         },
    { img: kandyaDan,       cat: "Kanya Daan",    title: "Support for Girls' Weddings",        raised: 78000,  goal: 120000, link: "/services/welfare/kanyadan"     },
  ];

  const causes = liveCauses.length > 0
    ? liveCauses.map(c => {
        const { img, link } = getCauseImg(c.title);
        return { img, cat: c.cat, title: c.title, raised: c.raised, goal: c.goal, donors: c.donors, link };
      })
    : staticCauses;

  const recentDonations = liveRecentDonations.length > 0 ? liveRecentDonations : [
    { initials: "RK", color: "#1a2d5a", name: "Rahul K.",    cause: "Education for Orphaned Children", amount: "₹2,000",  time: "2 hr ago"   },
    { initials: "PS", color: "#b45309", name: "Priya S.",    cause: "Medical Aid for Senior Citizens", amount: "₹5,000",  time: "5 hr ago"   },
    { initials: "AM", color: "#065f46", name: "Amit M.",     cause: "Free Health Camps",               amount: "₹1,500",  time: "8 hr ago"   },
    { initials: "SG", color: "#5b21b6", name: "Sneha G.",    cause: "Kanya Daan Yojana",               amount: "₹10,000", time: "1 day ago"  },
    { initials: "VR", color: "#9f1239", name: "Vikram R.",   cause: "Daily Meals for Orphans",         amount: "₹3,000",  time: "1 day ago"  },
    { initials: "AN", color: "#1e3a5f", name: "Anonymous",   cause: "Women Empowerment",               amount: "₹7,500",  time: "2 days ago" },
  ];

  const programs = [
    { img: orphanFood,   Icon: FaChild,       title: "Child Nutrition",      desc: "Daily meals and nutrition for orphaned children in partner shelters across India.",               link: "/services/orphanage", wide: true  },
    { img: elderFood,    Icon: FaUtensils,    title: "Meals for Seniors",    desc: "Freshly cooked meals delivered to elderly citizens who live alone and can no longer cook.",       link: "/services/elderly",   wide: false },
    { img: orphanHealth, Icon: FaHospitalAlt, title: "Health Camps",         desc: "Free medical camps offering check-ups, medicines, and specialist consultations in rural areas.",  link: "/services",           wide: false },
    { img: widow,        Icon: FaFemale,      title: "Women Empowerment",    desc: "Livelihood training, financial aid, and emotional support for widowed and underprivileged women.", link: "/services",           wide: true  },
    { img: kanyaHero,    Icon: FaRing,        title: "Kanya Daan Yojana",    desc: "Financial and logistical support for families who cannot afford their daughters' marriages.",     link: "/services",           wide: false },
    { img: road,         Icon: FaRoad,        title: "Rural Infrastructure", desc: "Community-driven road, water, and sanitation projects in villages with no basic amenities.",      link: "/services",           wide: true  },
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

  const totalRaisedCr = liveStats?.totalRaised ? (liveStats.totalRaised / 10000000).toFixed(1) : null;
  
  /* ── Top Marquee: Mission & Impact Focused ── */
  const topMarqueeItems = [
    { Icon: FaChild,          text: <><strong>Orphaned Children</strong> receive quality education & healthcare</> },
    { Icon: FaUtensils,       text: <><strong>Senior Citizens</strong> get daily meals & medical support</> },
    { Icon: FaFemale,         text: <><strong>Women Empowerment</strong> through livelihood & financial aid</> },
    { Icon: FaRoad,           text: <><strong>Infrastructure</strong> built in {liveStats?.statesCovered ?? "20+"} rural states</> },
    { Icon: FaHospitalAlt,    text: <><strong>Free Health Camps</strong> serving underprivileged communities</> },
    { Icon: FaRing,           text: <><strong>Kanya Daan</strong> supporting girls' futures & dignity</> },
    { Icon: FaHandshake,      text: <><strong>Join {(liveStats?.totalVolunteers ?? 1000).toLocaleString("en-IN")}+ Volunteers</strong> making real impact</> },
    { Icon: FaHeart,          text: <><strong>Together We've Changed</strong> 10,000+ lives across India</> },
  ];

  /* ── Bottom Marquee: Stats & Trust Focused ── */
  const marqueeItems = [
    { Icon: FaStar,           text: <><strong>{(liveStats?.totalNgos ?? ngoTotal) || "—"}+</strong> Verified NGOs</> },
    { Icon: FaHandHoldingUsd, text: <><strong>{totalRaisedCr ? `₹${totalRaisedCr} Cr+` : "—"}</strong> Donated</> },
    { Icon: FaMapMarkerAlt,   text: <><strong>{liveStats?.statesCovered ?? "—"} States</strong> Covered</> },
    { Icon: FaUsers,          text: <><strong>{(liveStats?.totalDonations ?? 0).toLocaleString("en-IN")}+</strong> Donations Made</> },
    { Icon: FaCheckCircle,    text: <><strong>100%</strong> Transparent</> },
    { Icon: FaFileAlt,        text: <><strong>80G</strong> Tax Benefits</> },
    { Icon: FaHeart,          text: <><strong>10,000+</strong> Lives Changed</> },
    { Icon: FaShieldAlt,      text: <><strong>KYC-Verified</strong> Every NGO</> },
    { Icon: FaHandshake,      text: <><strong>{(liveStats?.totalVolunteers ?? 0).toLocaleString("en-IN")}+</strong> Volunteers</> },
  ];

  /* Shared Button Classes */
  const btnAmber = "inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-7 py-3 rounded-lg font-bold text-[0.95rem] tracking-wide transition-all hover:bg-amber-700 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(217,119,6,0.3)]";
  const btnWhiteOutline = "inline-flex items-center justify-center gap-2 border-[1.5px] border-white/60 text-white bg-transparent px-7 py-3 rounded-lg font-semibold text-[0.95rem] transition-all hover:bg-white/10 hover:border-white";
  const btnNavy = "inline-flex items-center justify-center gap-2 bg-[#1a2d5a] text-white px-7 py-3 rounded-lg font-semibold text-[0.92rem] transition-all hover:bg-[#243a72] hover:-translate-y-0.5";
  const btnNavyOutline = "inline-flex items-center justify-center gap-2 border-[1.5px] border-[#1a2d5a] text-[#1a2d5a] bg-white px-6 py-[11px] rounded-lg font-semibold text-[0.92rem] transition-all hover:bg-[#1a2d5a] hover:text-white";

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden bg-white">
      {/* ── Custom Keyframes & Slower, Smoother Scroll Reveals ── */}
      <style>{`
        /* Disable Overscroll Bounce */
        html, body { overscroll-behavior: none; }
        
        /* Premium Slow, Smooth Cubic-Bezier Transitions */
        .sr { opacity: 0; transform: translateY(50px); transition: opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1); will-change: opacity, transform; }
        .sl { opacity: 0; transform: translateX(-60px); transition: opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1); will-change: opacity, transform; }
        .sfr { opacity: 0; transform: translateX(60px); transition: opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1); will-change: opacity, transform; }
        .ssc { opacity: 0; transform: scale(.92); transition: opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1); will-change: opacity, transform; }
        
        .sr.sv, .sl.sv, .sfr.sv, .ssc.sv { opacity: 1; transform: none; will-change: auto; }
        
        /* Line Drawing Animation Base - Slower */
        .line-track { width: 0%; transition: width 2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s; }
        .line-track.sv { width: 100%; }

        /* Cascading Delays */
        .d1 { transition-delay: .1s } .d2 { transition-delay: .25s } .d3 { transition-delay: .4s }
        .d4 { transition-delay: .55s } .d5 { transition-delay: .7s } .d6 { transition-delay: .85s }
        
        @keyframes fadeUp { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes marquee-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes float-soft { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>

      {/* ══════════════════════════════════════════
          TOP MARQUEE (Mission & Impact Stories)
      ══════════════════════════════════════════ */}
      <div className="bg-[#1a2d5a] overflow-hidden py-10 pb-6 relative z-50 border-b border-amber-600/20">
        <div className="flex w-max gap-0 animate-[marquee-scroll_40s_linear_infinite] hover:[animation-play-state:paused] cursor-default">
          {[...topMarqueeItems, ...topMarqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-2 px-6 whitespace-nowrap text-[1rem] font-bold text-white/80 tracking-[0.05em] hover:text-amber-300 transition-colors duration-300">
              <item.Icon className="text-amber-500 text-[0.8rem] shrink-0" />
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative h-[calc(100vh-32px)] min-h-[600px] overflow-hidden">
        {slides.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-[1200ms] ${i === slide ? "opacity-100 z-0" : "opacity-0 -z-10"}`}>
            <img src={s.img} alt={s.kicker} loading={i === 0 ? "eager" : "lazy"} className={`w-full h-full object-cover transition-transform duration-[10s] ease-out ${i === slide ? "scale-100" : "scale-[1.08]"}`} />
          </div>
        ))}

        <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(15,25,60,.88)_0%,rgba(15,25,60,.60)_55%,rgba(0,0,0,.20)_100%)] z-10" />

        <div className="relative z-20 h-full flex flex-col justify-center max-w-[1200px] mx-auto px-10">
          <h1 key={`h${slide}`} className="text-[clamp(2.2rem,5.5vw,4rem)] font-black text-white leading-[1.12] mb-5 max-w-[660px] opacity-0 animate-[fadeUp_0.9s_cubic-bezier(0.16,1,0.3,1)_0.1s_forwards]">{slides[slide].h}</h1>
          <p key={`p${slide}`} className="text-[clamp(0.95rem,1.6vw,1.1rem)] text-white/80 leading-[1.85] mb-9 max-w-[520px] opacity-0 animate-[fadeUp_0.9s_cubic-bezier(0.16,1,0.3,1)_0.3s_forwards]">{slides[slide].p}</p>
          <div className="flex gap-4 flex-wrap opacity-0 animate-[fadeUp_0.9s_cubic-bezier(0.16,1,0.3,1)_0.5s_forwards]">
            <Link to="/donate" className={btnAmber}>Donate Now</Link>
            <a href="#services" className={btnWhiteOutline}>Our Programmes</a>
          </div>
        </div>

        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} className={`h-2 rounded-full transition-all duration-500 ease-in-out ${i === slide ? "bg-amber-600 w-8" : "bg-white/40 w-2 hover:bg-white/60"}`} />
          ))}
        </div>

        <div className="hidden md:flex absolute bottom-10 right-12 z-30 items-center gap-2.5 text-white/50 text-[0.72rem] tracking-[1.5px] uppercase font-semibold opacity-0 animate-[fadeUp_1.2s_ease_1s_forwards]">
          <span className="w-11 h-[1px] bg-white/30" />
          Scroll to explore
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <div ref={statsRef} className="bg-[#1a2d5a]">
        <div className="max-w-[1100px] mx-auto px-7 grid grid-cols-2 md:grid-cols-4">
          {[
            { n: n1, s: "+", label: "Verified NGOs",  Icon: FaBuilding },
            { n: n2, s: "+", label: "Donations Made", Icon: FaHeart },
            { n: n3, s: "+", label: "States Covered", Icon: FaMapMarkerAlt },
            { n: n4, s: "+", label: "Volunteers",     Icon: FaHandshake },
          ].map((st, i) => (
            <div key={i} className={`p-8 text-center border-b md:border-b-0 md:border-r border-white/10 ${i % 2 === 0 ? "border-r" : ""} ${i === 3 ? "border-none" : ""}`}>
              <st.Icon className="text-amber-600 text-xl mx-auto mb-2.5" />
              <div className="text-[clamp(1.8rem,2.8vw,2.5rem)] font-black text-white leading-none tabular-nums transition-all duration-300">{st.n.toLocaleString("en-IN")}{st.s}</div>
              <div className="text-[0.7rem] text-white/50 uppercase tracking-[1.8px] mt-1.5">{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          INFINITE MARQUEE BANNER
      ══════════════════════════════════════════ */}
      <div className="bg-[#1a2d5a] overflow-hidden border-y border-white/5 relative sticky top-[100px] md:top-[90px] z-30">
        <div className="h-[3px] bg-[linear-gradient(90deg,#d97706,#f59e0b,#b45309,#d97706)] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />
        <div className="overflow-hidden py-6 pb-2 pt-2 relative group">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#1a2d5a] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#1a2d5a] to-transparent z-10 pointer-events-none" />
          <div className="flex w-max gap-0 animate-[marquee-scroll_45s_linear_infinite] group-hover:[animation-play-state:paused]">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-2.5 px-9 pt-8 pb-2 whitespace-nowrap border-r border-white/10 text-[0.82rem] font-semibold text-white/70 tracking-[0.02em]">
                <item.Icon className="text-amber-600 text-[0.88rem] shrink-0" />
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════ */}
      <section className="py-[100px] px-5 md:px-10 bg-white">
        <div className="max-w-[1160px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="sl d1">
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight text-gray-900 mb-4">
              Bridging the Gap Between<br />
              <span className="text-amber-600">Compassion and Real Change</span>
            </h2>
            <div className="w-11 h-[3px] rounded bg-amber-600 my-4" />
            <p className="text-gray-600 leading-[1.9] text-base mb-4">
              SevaIndia was built on one belief: <strong>good people want to help, but they need a trustworthy bridge.</strong> We verify NGOs, track every rupee, and make giving as simple and transparent as possible.
            </p>
            <p className="text-gray-600 leading-[1.9] text-base mb-4">
              From an orphaned child in a Rajasthan shelter to a senior citizen in a Mumbai chawl, our platform ensures that your donation reaches the right person — and that you can see exactly how it is used.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
              {[
                { Icon: FaChartBar, label: "100% Transparent" },
                { Icon: FaCheckCircle, label: "KYC-Verified NGOs" },
                { Icon: FaFileAlt, label: "80G Tax Benefits" },
                { Icon: FaSatelliteDish, label: "Live Tracking" },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2.5 p-3 rounded-lg bg-[#eff3ff] border border-[#c7d2fe] text-[0.85rem] font-semibold text-[#1a2d5a] hover:bg-[#1a2d5a] hover:text-white transition-colors duration-500 group">
                  <b.Icon className="text-amber-600 shrink-0 group-hover:text-amber-400 transition-colors duration-500" /> {b.label}
                </div>
              ))}
            </div>
            <div className="mt-7">
              <Link to="/find-ngos" className={btnNavy}>Explore Our Network</Link>
            </div>
          </div>

          <div className="sfr d2 relative mt-8 lg:mt-0">
            <img src={orphanEducation} alt="Children learning" className="w-full h-[340px] lg:h-[440px] object-cover rounded-[22px] shadow-[0_12px_40px_rgba(0,0,0,0.13)] transition-transform duration-700 hover:scale-[1.02]" />
            <div className="absolute -bottom-5 -left-5 lg:-left-5 bg-amber-600 text-white p-4 lg:p-5 rounded-[14px] shadow-[0_8px_24px_rgba(217,119,6,0.35)] flex items-center gap-2.5 animate-[fadeUp_1.2s_ease_0.8s_backwards] hover:scale-105 transition-transform duration-500">
              <FaHeart className="text-[1.2rem]" />
              <div>
                <div className="text-[1.28rem] font-black leading-none">
                  {liveStats?.totalRaised ? `₹${(liveStats.totalRaised / 10000000).toFixed(1)} Cr+` : "₹2.4 Cr+"}
                </div>
                <div className="text-[0.7rem] opacity-90 mt-1">Channelled to verified causes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CAUSES
      ══════════════════════════════════════════ */}
      <section id="causes" className="py-20 px-5 md:px-10 bg-[#faf9f7]">
        <div className="max-w-[1200px] mx-auto">
          <div className="sr text-center mb-12">
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight text-gray-900 mb-4">Fundraising Campaigns <span className="text-amber-600">That Need You</span></h2>
            <div className="w-11 h-[3px] rounded bg-amber-600 mx-auto my-4" />
            <p className="text-base text-gray-600 leading-relaxed max-w-[560px] mx-auto">These causes need your support right now. Every donation brings us closer to the goal.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {causes.map((c, i) => (
              <div key={i} className={`sr d${i + 1} bg-white border border-gray-200 rounded-[14px] overflow-hidden group cursor-pointer hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)] transition-all duration-700`}>
                <div className="relative overflow-hidden">
                  <img src={c.img} alt={c.title} loading="lazy" className="w-full h-[200px] object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110" />
                  <span className="absolute top-3 left-3 bg-amber-600 text-white text-[0.66rem] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded-full shadow-md">{c.cat}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-[0.97rem] font-bold text-gray-900 mb-3.5 leading-[1.4] group-hover:text-[#1a2d5a] transition-colors duration-500">{c.title}</h3>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[0.92rem] font-extrabold text-[#1a2d5a]">
                      {c.raised >= 100000 ? `₹${(c.raised / 100000).toFixed(1)}L raised` : `₹${(c.raised / 1000).toFixed(0)}K raised`}
                    </span>
                    {c.goal && (
                      <span className="text-[0.78rem] text-gray-400">
                        of {c.goal >= 100000 ? `₹${(c.goal / 100000).toFixed(0)}L` : `₹${(c.goal / 1000).toFixed(0)}K`}
                      </span>
                    )}
                  </div>
                  {c.goal && (
                    <div className="w-full h-[5px] bg-gray-200 rounded-full overflow-hidden mb-1.5 relative">
                      <div className="absolute inset-y-0 left-0 h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-[1.5s] ease-out" style={{ width: `${Math.min(Math.round((c.raised / c.goal) * 100), 100)}%` }} />
                    </div>
                  )}
                  <div className="text-[0.75rem] text-amber-700 font-bold">
                    {c.goal ? `${Math.min(Math.round((c.raised / c.goal) * 100), 100)}% funded` : ""}
                    {c.donors && <span className="ml-2 opacity-65 text-[0.78rem]">· {c.donors} donors</span>}
                  </div>
                  <Link to={c.link} className="flex items-center gap-1.5 mt-4 text-[0.85rem] font-bold text-[#1a2d5a] group-hover:gap-2.5 transition-all duration-500">Support This Cause <span className="text-amber-600">→</span></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PROGRAMMES
      ══════════════════════════════════════════ */}
      <section id="services" className="py-20 px-5 md:px-10 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="sr text-center mb-12">
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight text-gray-900 mb-4">Our <span className="text-amber-600">Programmes</span> &amp; Services</h2>
            <div className="w-11 h-[3px] rounded bg-amber-600 mx-auto my-4" />
            <p className="text-base text-gray-600 leading-relaxed max-w-[560px] mx-auto">Targeted programmes addressing the root causes of poverty and neglect in India's most vulnerable communities.</p>
          </div>

          {/* ── Programmes Carousel ── */}
          {(() => {
            const maxSlide = Math.max(0, programs.length - progVisible);
            const bump = (fn) => { setProgPaused(true); fn(); setTimeout(() => setProgPaused(false), 5000); };
            const prev = () => bump(() => setProgSlide(s => Math.max(0, s - 1)));
            const next = () => bump(() => setProgSlide(s => Math.min(maxSlide, s + 1)));
            const goTo = (i) => bump(() => setProgSlide(Math.min(i, maxSlide)));
            const cardPct = 100 / programs.length; 
            return (
              <div
                className="relative sr d2"
                onMouseEnter={() => setProgPaused(true)}
                onMouseLeave={() => setProgPaused(false)}
              >
                {/* ── Prev arrow ── */}
                <button
                  onClick={prev}
                  disabled={progSlide === 0}
                  aria-label="Previous"
                  className="absolute left-0 top-[45%] -translate-y-1/2 -translate-x-5 z-10 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold hover:bg-amber-50 hover:border-amber-400 hover:text-amber-600 transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  ‹
                </button>

                {/* ── Track wrapper ── */}
                <div style={{ overflowX: "clip", overflowY: "visible" }} className="py-4">
                  <div
                    className="flex"
                    style={{
                      width: `${(programs.length / progVisible) * 100}%`,
                      transform: `translateX(-${progSlide * cardPct}%)`,
                      transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)", /* Slower, smoother slide */
                    }}
                  >
                    {programs.map(({ img, Icon, title, desc, link }, i) => (
                      <div
                        key={i}
                        style={{ width: `${cardPct}%` }}
                        className="flex-shrink-0 px-3"
                      >
                        <Link to={link} className="group block rounded-2xl overflow-hidden shadow-md hover:shadow-[0_16px_40px_rgba(217,119,6,0.15)] transition-all duration-700 hover:-translate-y-1.5" style={{ transformOrigin: "center bottom" }}>
                          {/* Image */}
                          <div className="relative h-56 sm:h-64 md:h-72 overflow-hidden">
                            <img
                              src={img}
                              alt={title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-700" />
                            <div className="absolute inset-0 bg-amber-600/0 group-hover:bg-amber-600/20 transition-all duration-700" />

                            <div className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-sm shadow-md group-hover:bg-amber-500 group-hover:border-amber-400 transition-all duration-500">
                              <Icon />
                            </div>

                            <div className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-[1.5px] text-white/90 border border-white/30 px-2.5 py-1 rounded-full backdrop-blur-md bg-black/20">
                              Programme
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-2">
                              <h3 className="text-[1.05rem] font-extrabold text-white leading-snug drop-shadow-md">
                                {title}
                              </h3>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="bg-white px-5 py-5 group-hover:bg-[#faf9f7] transition-colors duration-700">
                            <p className="text-[0.8rem] text-gray-500 leading-relaxed line-clamp-2 mb-3">
                              {desc}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[0.75rem] font-bold text-amber-600 uppercase tracking-[1.5px] group-hover:gap-2.5 transition-all duration-500">
                              Explore <span className="text-base leading-none">→</span>
                            </span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Next arrow ── */}
                <button
                  onClick={next}
                  disabled={progSlide === maxSlide}
                  aria-label="Next"
                  className="absolute right-0 top-[45%] -translate-y-1/2 translate-x-5 z-10 w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold hover:bg-amber-50 hover:border-amber-400 hover:text-amber-600 transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  ›
                </button>

                {/* ── Dot indicators ── */}
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-500 ease-in-out ${
                        i === progSlide
                          ? "bg-amber-600 w-8"
                          : "bg-gray-200 w-2 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="sr text-center mt-10">
            <Link to="/services" className={btnNavy}>View All Programmes</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MID CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="py-20 px-5 md:px-10 bg-[#1a2d5a] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-[220px] h-[220px] rounded-full bg-[#d97706]/15 pointer-events-none" />
        
        <div className="max-w-[860px] mx-auto text-center relative z-10">
          <h2 className="sr d1 text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold text-white mb-3.5 leading-[1.3]">
            A single contribution can feed a child for a month, pay for a senior's medicines, or put a girl through school.
          </h2>
          <p className="sr d2 text-[1.02rem] text-white/75 leading-[1.8] mb-8">
            Minimum ₹1,000 — 100% goes to the cause. Operational costs are covered through institutional funding.
          </p>
          <div className="sr d3 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
            <Link to="/donate" className={btnAmber}>Start with ₹1,000</Link>
            <Link to="/find-ngos" className={btnWhiteOutline}>Find a Cause</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS (With Drawing Line Animation)
      ══════════════════════════════════════════ */}
      <section id="how" className="py-20 px-5 md:px-10 bg-[#f2f3f5]">
        <div className="max-w-[1100px] mx-auto">
          <div className="sr text-center mb-12">
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight text-gray-900 mb-4">How It Works in <span className="text-amber-600">4 Simple Steps</span></h2>
            <div className="w-11 h-[3px] rounded bg-amber-600 mx-auto my-4" />
            <p className="text-base text-gray-600 leading-relaxed max-w-[560px] mx-auto">We removed every barrier between your intention to give and measurable impact on the ground.</p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-0 mt-12">
            
            {/* The Drawing Line Animation */}
            <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-[2px] bg-gray-200 z-0">
              <div className="line-track h-full bg-gradient-to-r from-amber-600 via-amber-400 to-[#1a2d5a]" />
            </div>

            {[
              { n: "01", Icon: FaSearch, h: "Browse NGOs", p: "Search 500+ verified NGOs by cause, location, or rating. Read reports and audit financials." },
              { n: "02", Icon: FaCheckCircle, h: "Pick a Cause", p: "Choose a project that resonates with you — child welfare, elderly care, women empowerment, or more." },
              { n: "03", Icon: FaCreditCard, h: "Donate Securely", p: "Pay via UPI, net banking, or card in under 60 seconds. Get an instant receipt + 80G certificate." },
              { n: "04", Icon: FaChartLine, h: "Track Impact", p: "Follow your donation's journey with fund utilisation updates and ground-level impact reports." },
            ].map((s, i) => (
              <div key={i} className={`sr d${i + 1} text-center px-4 relative z-10 group`}>
                <div className="w-[50px] h-[50px] rounded-full bg-[#1a2d5a] text-white flex items-center justify-center text-[1.1rem] font-extrabold mx-auto mb-5 border-4 border-[#f2f3f5] shadow-[0_4px_14px_rgba(26,45,90,0.25)] group-hover:bg-amber-600 group-hover:scale-110 transition-all duration-500">{s.n}</div>
                <h3 className="text-[0.97rem] font-bold text-gray-900 mb-2">{s.h}</h3>
                <p className="text-[0.84rem] text-gray-600 leading-[1.6]">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY US
      ══════════════════════════════════════════ */}
      <section className="py-20 px-5 md:px-10 bg-white">
        <div className="max-w-[1160px] mx-auto">
          <div className="sr text-center mb-12">
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight text-gray-900 mb-4">India's Most Trusted <span className="text-amber-600">NGO Donation Platform</span></h2>
            <div className="w-11 h-[3px] rounded bg-amber-600 mx-auto my-4" />
            <p className="text-base text-gray-600 leading-relaxed max-w-[560px] mx-auto">SevaIndia ensures every rupee you donate reaches the people it was meant for — with proof, gratitude, and the ability to see the change you created.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {whyUs.map((w, i) => (
              <div key={i} className={`ssc d${(i % 3) + 1} p-7 border border-gray-200 rounded-[14px] bg-white hover:border-[#c7d2fe] hover:shadow-[0_16px_40px_rgba(26,45,90,0.08)] hover:-translate-y-2 transition-all duration-700 group`}>
                <div className="w-[54px] h-[54px] rounded-xl bg-[#eff3ff] flex items-center justify-center text-[1.3rem] text-[#1a2d5a] mb-5 group-hover:bg-[#1a2d5a] group-hover:text-white transition-colors duration-700"><w.Icon /></div>
                <h3 className="text-[1.05rem] font-bold text-gray-900 mb-2">{w.h}</h3>
                <p className="text-[0.86rem] text-gray-600 leading-[1.65]">{w.p}</p>
              </div>
            ))}
          </div>
          <div className="sr text-center mt-12">
            <Link to="/add-ngo" className={btnNavyOutline}>Register Your NGO</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FIND NGOs
      ══════════════════════════════════════════ */}
      <section id="find-ngos" className="py-20 px-5 md:px-10 bg-[#faf9f7]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* LEFT — Map */}
          <div className="sl d1">
            <IndiaMap />
          </div>

          {/* RIGHT — Text + NGO cards */}
          <div className="sfr d2 flex flex-col gap-6">
            <div>
              <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight text-gray-900 mb-4">Find a Verified NGO<br /><span className="text-amber-600">Near Your City</span></h2>
              <div className="w-11 h-[3px] rounded bg-amber-600 my-4" />
              <p className="text-base text-gray-600 leading-relaxed mb-4">
                Every NGO on SevaIndia is personally verified. We visit offices, check legal filings, audit past expenditures, and speak with beneficiaries before approving a listing.
              </p>
              <p className="text-base text-gray-600 leading-relaxed mb-6">
                Filter by cause, state, or rating to find organisations working on issues closest to your heart.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/find-ngos" className={btnNavy}>Browse NGOs</Link>
                <Link to="/add-ngo" className={btnNavyOutline}>Register Your NGO</Link>
              </div>
            </div>

            {/* NGO list */}
            <div className="flex flex-col gap-3 mt-2">
              {ngoLoading && [0,1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3.5 p-3.5 bg-white border border-gray-200 rounded-[14px] opacity-50 shadow-sm">
                  <div className="w-11 h-11 rounded-lg bg-indigo-200 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-[60%] mb-1.5" />
                    <div className="h-2.5 bg-gray-100 rounded w-[80%]" />
                  </div>
                </div>
              ))}
              {!ngoLoading && liveNgos.map((n, i) => (
                <Link to={`/ngo/${n.id || ""}`} key={n.id || i} className={`sr d${i + 1} flex items-center gap-3.5 p-4 bg-white border border-gray-200 rounded-[14px] shadow-sm hover:shadow-md hover:translate-x-2 hover:border-[#c7d2fe] transition-all duration-500`}>
                  <div className="w-12 h-12 rounded-xl bg-[#1a2d5a] text-white flex items-center justify-center text-[1rem] font-extrabold shrink-0 transition-transform group-hover:scale-105">{n.name ? n.name[0].toUpperCase() : "N"}</div>
                  <div>
                    <h4 className="text-[0.95rem] font-bold text-gray-900 mb-0.5">{n.name}</h4>
                    <p className="text-[0.8rem] text-gray-500 flex items-center">
                      <FaMapMarkerAlt className="text-[0.7rem] mr-1.5 text-amber-600" />
                      {n.city} <span className="mx-1.5 opacity-50">|</span> {n.cause}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 text-[0.7rem] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">{n.rating ? `★ ${n.rating} ` : ""}Verified</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-20 px-5 md:px-10 bg-[#1a2d5a] relative overflow-hidden">
        <div className="absolute -top-10 left-10 text-[22rem] font-black text-white/[0.03] leading-none pointer-events-none select-none">"</div>
        <div className="max-w-[1160px] mx-auto relative z-10">
          <div className="sr text-center mb-12">
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight text-white mb-4">Voices From <span className="text-amber-200">Our Community</span></h2>
            <div className="w-11 h-[3px] rounded bg-amber-600 mx-auto my-4" />
            <p className="text-base text-white/80 leading-relaxed max-w-[560px] mx-auto">Donors, volunteers, and NGO partners share how SevaIndia changed the way they give.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
            {stories.map((s, i) => (
              <div key={i} className={`sr d${i + 1} bg-white/[0.06] border border-white/10 rounded-[14px] p-8 hover:bg-white/10 hover:-translate-y-2 transition-all duration-700`}>
                <FaQuoteLeft className="text-[1.8rem] text-amber-500 mb-5 opacity-80" />
                <p className="text-[0.95rem] text-white/90 leading-[1.8] italic mb-6">"{s.quote}"</p>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-[0.9rem] font-extrabold shrink-0 shadow-lg">
                    {s.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-[0.92rem] font-bold text-white mb-0.5">{s.name}</p>
                    <p className="text-[0.78rem] text-white/60">{s.role}</p>
                    <span className="inline-block text-[0.68rem] font-bold bg-[#d97706]/30 text-amber-200 border border-amber-500/30 rounded-full px-2.5 py-1 mt-2.5">{s.tag}</span>
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
      <section id="join" className="py-20 px-5 md:px-10 bg-[#f2f3f5]">
        <div className="max-w-[1100px] mx-auto">
          <div className="sr text-center mb-12">
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight text-gray-900 mb-4">There Are Many <span className="text-amber-600">Ways to Help</span></h2>
            <div className="w-11 h-[3px] rounded bg-amber-600 mx-auto my-4" />
            <p className="text-base text-gray-600 leading-relaxed max-w-[560px] mx-auto">You don't need to donate money to create change. Your time, skills, or network can be equally powerful.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              { Icon: FaHandHoldingHeart, h: "Donate", p: "Contribute to a verified cause. Every rupee is tracked and 80G tax-deductible.", link: "/donate", btn: "Donate Now", benefits: ["As low as ₹100", "Instant receipt & 80G cert", "Choose your cause", "Monthly giving option"] },
              { Icon: FaHandshake, h: "Volunteer", p: "Give your time and skills. We match you with opportunities that fit your schedule.", link: "/volunteer", btn: "Apply as Volunteer", benefits: ["Flexible hours", "Remote or on-ground", "Certificate of service", "25+ states"] },
              { Icon: FaBuilding, h: "Register NGO", p: "Reach thousands of donors across India. Get KYC-verified and start fundraising.", link: "/add-ngo", btn: "Register Your NGO", benefits: ["Free listing", "Verified badge", "Donor network access", "Fundraising tools"] },
            ].map((card, i) => (
              <div key={i} className={`sr d${i + 1} bg-white border border-gray-200 rounded-[14px] p-8 text-center hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:border-[#c7d2fe] transition-all duration-700 group`}>
                <div className="w-[64px] h-[64px] rounded-2xl bg-[#eff3ff] mx-auto mb-5 flex items-center justify-center text-[1.5rem] text-[#1a2d5a] group-hover:bg-amber-600 group-hover:text-white transition-colors duration-700"><card.Icon className="group-hover:animate-bounce" /></div>
                <h3 className="text-[1.1rem] font-extrabold text-gray-900 mb-2.5">{card.h}</h3>
                <p className="text-[0.88rem] text-gray-600 leading-[1.65] mb-5">{card.p}</p>
                <ul className="list-none p-0 m-0 mb-6 text-left">
                  {card.benefits.map(b => (
                    <li key={b} className="flex items-center gap-2.5 text-[0.84rem] text-gray-600 mb-2.5">
                      <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <FaCheck className="text-amber-600 text-[0.55rem]" />
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link to={card.link} className={`${btnAmber} w-full`}>{card.btn}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          RECENT DONATIONS (Slower Marquee + Float Animation + Fade Edges)
      ══════════════════════════════════════════ */}
      <section className="py-20 bg-[#faf9f7] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10">
          <div className="sr text-center mb-10">
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight text-gray-900 mb-4">Recent <span className="text-amber-600">Donations</span></h2>
            <div className="w-11 h-[3px] rounded bg-amber-600 mx-auto my-4" />
            <p className="text-base text-gray-600 leading-relaxed max-w-[560px] mx-auto">Real people making real impact — see the latest contributions flowing in right now.</p>
          </div>
        </div>

        {/* Smoother, Slower Moving Ticker Strip with Fade Edges */}
        <div className="relative mt-6" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
          <div className="flex w-max gap-6 animate-[marquee-scroll_75s_linear_infinite] hover:[animation-play-state:paused] py-6 px-5">
            {[...recentDonations, ...recentDonations, ...recentDonations, ...recentDonations].map((d, i) => (
              <div 
                key={i} 
                className="w-[320px] sm:w-[360px] shrink-0 bg-white border border-gray-200 rounded-[14px] p-5 flex items-start gap-4 relative overflow-hidden group/card hover:scale-[1.02] hover:shadow-xl hover:border-amber-300 transition-all duration-500 animate-[float-soft_4s_ease-in-out_infinite]"
                style={{ animationDelay: `${(i % 5) * 0.5}s` }} /* Slight staggering for floating effect */
              >
                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-bl-[14px] group-hover/card:w-full transition-all duration-700 ease-out" />
                <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center text-[0.9rem] font-extrabold text-white shrink-0 tracking-[0.02em] shadow-inner transition-transform duration-500 group-hover/card:scale-110" style={{ background: d.color }}>
                  {d.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[0.95rem] font-bold text-gray-900 mb-1 truncate">{d.name}</h4>
                  <p className="text-[0.78rem] text-gray-500 mb-3 truncate">{d.cause}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[1.05rem] font-black text-[#1a2d5a]">{d.amount}</span>
                    <span className="text-[0.7rem] text-gray-500 bg-[#f2f3f5] px-2.5 py-1 rounded-md whitespace-nowrap flex items-center font-semibold">
                      <FaRegClock className="text-[0.65rem] mr-1.5 text-amber-600" />{d.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-5 md:px-10 mt-10">
          <div className="sr d2 bg-[#1a2d5a] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5 shadow-[0_16px_40px_rgba(26,45,90,0.15)] hover:shadow-[0_20px_50px_rgba(26,45,90,0.25)] transition-shadow duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-[1.4rem] text-amber-500 backdrop-blur-sm border border-white/10 shadow-inner">
                <FaHandHoldingUsd />
              </div>
              <div>
                <h3 className="text-[1.6rem] font-black text-white mb-1">
                  {liveStats?.totalRaised ? `₹${Number(liveStats.totalRaised).toLocaleString("en-IN")}` : "₹2,40,87,450"}
                </h3>
                <p className="text-[0.78rem] text-amber-200/80 uppercase tracking-[1.5px] font-bold m-0">Total funds raised to date</p>
              </div>
            </div>
            <Link to="/donate" className={`${btnAmber} relative z-10 !px-8 !py-3.5 hover:scale-105`}>Add Your Contribution</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="py-20 px-5 md:px-10 bg-white">
        <div className="max-w-[820px] mx-auto">
          <div className="sr text-center mb-11">
            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight text-gray-900 mb-4">Frequently Asked <span className="text-amber-600">Questions</span></h2>
            <div className="w-11 h-[3px] rounded bg-amber-600 mx-auto my-4" />
            <p className="text-base text-gray-600 leading-relaxed max-w-[560px] mx-auto">Everything you need to know before making your first donation.</p>
          </div>

          <div className="mt-11">
            {faqs.map((f, i) => (
              <div key={i} className={`sr d${i + 1} border-b border-gray-200 last:border-b-0`}>
                <div className={`transition-colors duration-500 ${openFaq === i ? "bg-[#faf9f7] rounded-lg" : ""}`}>
                  <button className="w-full text-left py-5 px-4 flex justify-between items-center gap-3.5 text-[0.97rem] font-bold text-gray-900 hover:text-amber-600 transition-colors duration-300" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{f.q}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${openFaq === i ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400"}`}>
                      <FaChevronDown className={`text-[0.7rem] transition-transform duration-500 ${openFaq === i ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-[600ms] ease-in-out px-4 text-[0.92rem] text-gray-600 leading-[1.8] ${openFaq === i ? "max-h-[400px] pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
                    {f.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}