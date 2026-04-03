import { useState, useEffect, useRef } from "react";
import { API } from "../../utils/S3.js";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useInView } from "react-intersection-observer";
import { AnimatePresence, motion } from "framer-motion";

/* ── image imports ── */
import imgEducation from "../../assets/images/orphanage/education.jpg";
import imgCamp      from "../../assets/images/Medical/camp.jpg";
import imgWomen     from "../../assets/images/women/empowerment/image1.png";
import imgRoad      from "../../assets/images/infrastructure/road.jpg";
import imgKanyadan  from "../../assets/images/socialWelfare/Kanyadan/hero.png";
import imgElderly   from "../../assets/images/elderly/emotional.jpg";

/* ── Keyframes + hover-only rules (cannot be done in Tailwind) ── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
  * { box-sizing: border-box; }

  @keyframes floatY {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    50%      { transform: translateY(-14px) rotate(1deg); }
  }
  @keyframes orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(30px,-20px) scale(1.08); }
    66%     { transform: translate(-20px,30px) scale(0.95); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(-25px,20px) scale(1.05); }
    66%     { transform: translate(20px,-25px) scale(0.92); }
  }
  .oi-hero-img { transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1); }
  .oi-hero-img:hover { transform: scale(1.04) rotateY(-3deg); }
  .oi-stat-card { border-left: 3px solid #4a6a1a; padding-left: 20px; transition: border-color 0.3s ease; }
  .oi-stat-card:hover { border-color: #6a9a28; }
  .oi-report-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
  .oi-report-card:hover { transform: translateY(-5px); box-shadow: 0 18px 50px rgba(0,0,0,0.12) !important; }
`;

const CAT = {
  beneficiaries: { color: "#6366f1", label: "Beneficiaries" },
  health:        { color: "#ec4899", label: "Health" },
  education:     { color: "#f59e0b", label: "Education" },
  employment:    { color: "#22c55e", label: "Employment" },
  infrastructure:{ color: "#06b6d4", label: "Infrastructure" },
  environment:   { color: "#84cc16", label: "Environment" },
  other:         { color: "#94a3b8", label: "Other" },
};
const PERIOD_LABEL = { monthly:"Monthly", quarterly:"Quarterly", annual:"Annual", custom:"Custom" };

function fmt(v) { return Number(v || 0).toLocaleString("en-IN"); }
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
}

/* ── Animated counter ── */
function AnimCounter({ end, suffix = "", duration = 2200 }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {

    if (!inView || started.current) return;
    started.current = true;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);
  return <span ref={ref}>{count.toLocaleString("en-IN")}{suffix}</span>;
}

/* ── Report Modal ── */
function ReportModal({ report, onClose }) {
  if (!report) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="modal-bg"
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-[1000] flex items-start justify-center py-10 sm:py-16 px-4 overflow-y-auto"
      >
        <motion.div
          key="modal-box"
          initial={{ opacity:0, y:40, scale:0.95 }}
          animate={{ opacity:1, y:0, scale:1 }}
          exit={{ opacity:0, y:40, scale:0.95 }}
          transition={{ type:"spring", stiffness:300, damping:28 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-[800px] w-full shadow-[0_32px_100px_rgba(0,0,0,0.25)] overflow-hidden"
        >
          {/* header */}
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] px-5 sm:px-9 pt-7 pb-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[11px] font-bold text-green-500 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-[3px] tracking-[0.08em] uppercase">
                  {PERIOD_LABEL[report.reportPeriod] || "Report"}
                </span>
                <h2 className="mt-3 mb-1.5 text-white text-lg sm:text-[22px] font-extrabold leading-snug">{report.title}</h2>
                <p className="m-0 text-[#94a3b8] text-xs sm:text-[13px]">
                  {report.ngoId?.ngoName || "NGO"} &nbsp;·&nbsp;
                  {fmtDate(report.periodStart)} – {fmtDate(report.periodEnd)}
                </p>
              </div>
              <button onClick={onClose}
                className="bg-white/10 border-none rounded-full w-9 h-9 text-white text-base cursor-pointer flex items-center justify-center flex-shrink-0">
                ✕
              </button>
            </div>
            {report.summary && (
              <p className="mt-4 mb-0 text-[#cbd5e1] text-sm leading-[1.7]">{report.summary}</p>
            )}
          </div>

          {/* body */}
          <div className="px-5 sm:px-9 pt-6 pb-8">
            {report.metrics?.length > 0 && (
              <section className="mb-7">
                <h3 className="m-0 mb-4 text-sm font-bold text-[#1e293b]">Key Metrics</h3>
                <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))" }}>
                  {report.metrics.map((m, i) => {
                    const cat = CAT[m.category] || CAT.other;
                    return (
                      <div key={i} className="rounded-2xl p-3 sm:p-4"
                        style={{ background:`${cat.color}12`, border:`1px solid ${cat.color}30` }}>
                        <span className="text-[10px] font-bold uppercase" style={{ color:cat.color }}>{cat.label}</span>
                        <div className="text-xl font-extrabold text-[#1e293b] my-1">
                          {m.unit === "₹" ? `₹${fmt(m.value)}` : fmt(m.value)}{m.unit && m.unit !== "₹" ? ` ${m.unit}` : ""}
                        </div>
                        <div className="text-xs text-[#64748b]">{m.label}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={report.metrics.filter(m => m.value > 0).map(m => ({
                      name: m.label.length > 14 ? m.label.slice(0,13)+"…" : m.label,
                      value: m.value, cat: m.category,
                    }))} margin={{ top:4, right:8, left:0, bottom:44 }}>
                      <XAxis dataKey="name" tick={{ fontSize:9, fill:"#94a3b8" }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize:9, fill:"#94a3b8" }} width={32} />
                      <Tooltip contentStyle={{ fontSize:11, borderRadius:8 }} />
                      <Bar dataKey="value" radius={[4,4,0,0]}>
                        {report.metrics.filter(m => m.value > 0).map((m, i) => (
                          <Cell key={i} fill={CAT[m.category]?.color || "#94a3b8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {[
              { key:"highlights", emoji:"🏆", title:"Achievements", items:report.highlights, bg:"#f0fdf4", border:"#bbf7d0", sym:"✓", symColor:"#22c55e", textColor:"#166534" },
              { key:"challenges", emoji:"⚡", title:"Challenges",   items:report.challenges, bg:"#fff7ed", border:"#fed7aa", sym:"!",  symColor:"#f97316", textColor:"#9a3412" },
              { key:"nextSteps",  emoji:"🎯", title:"Next Steps",   items:report.nextSteps,  bg:"#eff6ff", border:"#bfdbfe", sym:"→", symColor:"#3b82f6", textColor:"#1e40af" },
            ].map(({ key, emoji, title, items, bg, border, sym, symColor, textColor }) =>
              items?.length > 0 && (
                <section key={key} className="mb-5">
                  <h3 className="m-0 mb-3 text-sm font-bold text-[#1e293b]">{emoji} {title}</h3>
                  <div className="flex flex-col gap-2">
                    {items.map((item, i) => (
                      <div key={i} className="rounded-xl px-3.5 py-2.5 flex gap-2.5"
                        style={{ background:bg, border:`1px solid ${border}` }}>
                        <span className="font-extrabold flex-shrink-0" style={{ color:symColor }}>{sym}</span>
                        <span className="text-sm leading-[1.6]" style={{ color:textColor }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function OurImpact() {
  const [loading, setLoading]             = useState(true);
  const [selected, setSelected]           = useState(null);
  const [allReports, setAllReports]       = useState([]);
  const [archiveFilter, setArchiveFilter] = useState("all");
  const [archivePage, setArchivePage]     = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/impact-reports/public?page=1&limit=1000`);
        const d = await r.json();
        if (active) setAllReports(d.data?.reports || []);
      } catch { /* silent */ } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const liveStats = (() => {
    let volunteers=0, villages=0, beneficiaries=0, fundsIn=0;
    allReports.forEach(r => {
      (r.metrics||[]).forEach(m => {
        const v = Number(m.value)||0, lbl=(m.label||"").toLowerCase(), cat=(m.category||"").toLowerCase();
        if (lbl.includes("active volunteer"))                       volunteers   = Math.max(volunteers,v);
        if (lbl.includes("village"))                                villages     = Math.max(villages,v);
        if (cat==="beneficiaries"||lbl.includes("beneficiar"))      beneficiaries += v;
        if (lbl.includes("fund")&&m.unit==="₹")                    fundsIn     += v;
      });
    });
    return { lives:beneficiaries>0?beneficiaries:volunteers, villages, reports:allReports.length, funds:fundsIn };
  })();

  const trendData = (() => {
    const BASELINE = {2022:42,2023:85,2024:138,2025:195,2026:248};
    const yearMap = {...BASELINE};
    allReports.forEach(r => {
      const year = new Date(r.periodEnd||r.periodStart||Date.now()).getFullYear();
      if (year<2022) return;
      const vol  = (r.metrics||[]).find(m=>(m.label||"").toLowerCase().includes("active volunteer"))?.value||0;
      const newV = (r.metrics||[]).find(m=>(m.label||"").toLowerCase().includes("new volunteer"))?.value||0;
      const real = vol+newV;
      if (real>0) yearMap[year] = Math.max(yearMap[year]||0, real);
    });
    return Object.entries(yearMap).sort(([a],[b])=>a-b).map(([year,value])=>({year:String(year),value}));
  })();

  const yoyBadges = (() => {
    if (trendData.length<2) return {thisYear:0,pct:null};
    const last=trendData[trendData.length-1], prev=trendData[trendData.length-2];
    const pct = prev.value>0 ? Math.round(((last.value-prev.value)/prev.value)*100) : null;
    return {thisYear:last.value,year:last.year,prevYear:prev.year,pct};
  })();

  const allocData = (() => {
    const catMap = {
      health:        {label:"Health & Medical",total:0},
      education:     {label:"Education",total:0},
      infrastructure:{label:"Infrastructure",total:0},
      employment:    {label:"Employment",total:0},
      other:         {label:"Other Programs",total:0},
    };
    allReports.forEach(r => {
      (r.metrics||[]).forEach(m => {
        const cat=(m.category||"").toLowerCase(), v=Number(m.value)||0;
        if (v<=0) return;
        if      (cat==="health")         catMap.health.total         += v;
        else if (cat==="education")      catMap.education.total      += v;
        else if (cat==="infrastructure") catMap.infrastructure.total += v;
        else if (cat==="employment")     catMap.employment.total     += v;
        else if (cat&&cat!=="beneficiaries") catMap.other.total      += v;
      });
    });
    const entries = Object.values(catMap).filter(c=>c.total>0);
    if (!entries.length) return [
      {label:"Health & Medical",amount:"4.2L",pct:84},
      {label:"Education",amount:"3.8L",pct:76},
      {label:"Infrastructure",amount:"5.0L",pct:62},
      {label:"Other Programs",amount:"1.5L",pct:30},
    ];
    const max = Math.max(...entries.map(e=>e.total));
    return entries.sort((a,b)=>b.total-a.total).slice(0,4).map(e=>({
      label:e.label,
      amount:e.total>=100000?`${(e.total/100000).toFixed(1)}L`:e.total>=1000?`${(e.total/1000).toFixed(1)}K`:String(e.total),
      pct:Math.round((e.total/max)*100),
    }));
  })();

  const stories = [
    { img:imgEducation, tag:"CASE STUDY: EDUCATION",        quote:"Access to our learning centres changed everything. Children who never held a book now read fluently and dream of becoming doctors.",                                        author:"PRIYA S.",     role:"REGIONAL EDUCATION DIRECTOR" },
    { img:imgCamp,      tag:"CASE STUDY: HEALTH",           quote:"The mobile medical camp treated over 1,200 villagers in a single day. People walked three hours just to receive care they'd never had access to.",                           author:"DR. ANIL M.",  role:"CHIEF MEDICAL OFFICER" },
    { img:imgWomen,     tag:"CASE STUDY: WOMEN EMPOWERMENT",quote:"The skill training programme gave me the courage to start my own business. Today I employ six women from my village and we support each other.",                           author:"SUNITA K.",    role:"WOMEN EMPOWERMENT LEAD" },
    { img:imgRoad,      tag:"CASE STUDY: INFRASTRUCTURE",   quote:"A paved road changed everything — children now reach school in minutes, ambulances can enter our village, and markets are finally accessible.",                             author:"RAMESH P.",    role:"VILLAGE SARPANCH" },
    { img:imgKanyadan,  tag:"CASE STUDY: SOCIAL WELFARE",   quote:"The Kanyadan programme didn't just help with the wedding — it gave our family dignity and showed us that society cares for every daughter.",                              author:"MEERA D.",     role:"BENEFICIARY, RAJASTHAN" },
    { img:imgElderly,   tag:"CASE STUDY: ELDERLY CARE",     quote:"At 78, I had nobody. The volunteers now visit every week — they bring medicine, food, and most importantly, someone to talk to.",                                          author:"SHYAMLAL B.", role:"BENEFICIARY, ELDERLY CARE" },
  ];

  const [storySlide, setStorySlide] = useState(0);
  const PAIRS = Math.ceil(stories.length / 2);

  const { ref: leanRef, inView: leanInView } = useInView({ triggerOnce:true, threshold:0.3 });

  return (
    <div className="bg-[#f8fafc] font-sans overflow-x-hidden">
      <style>{STYLES}</style>

      {/* ╔══════════════════════════════════╗
          ║  HERO                            ║
          ╚══════════════════════════════════╝ */}
      <section ref={heroRef} className="bg-[#f5f2ee] min-h-[92vh] flex items-center relative overflow-hidden py-14 md:py-20">

        {/* decorative orbs — desktop only */}
        <div className="hidden md:block" style={{ position:"absolute", top:"10%", right:"8%", width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle,#22c55e18,transparent 70%)", animation:"orb1 12s ease-in-out infinite", pointerEvents:"none" }} />
        <div className="hidden md:block" style={{ position:"absolute", bottom:"5%", left:"5%",  width:340, height:340, borderRadius:"50%", background:"radial-gradient(circle,#6366f118,transparent 70%)", animation:"orb2 15s ease-in-out infinite", pointerEvents:"none" }} />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── Left: text ── */}
            <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.9, ease:[0.22,1,0.36,1] }}>
              <h1 className="m-0 mb-1 font-black leading-none text-[#0f172a]"
                  style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(2.6rem,6vw,5.5rem)", letterSpacing:"-2px" }}>
                Data is
              </h1>
              <h1 className="m-0 mb-6 font-black leading-none text-[#0f172a]"
                  style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(2.6rem,6vw,5.5rem)", letterSpacing:"-2px" }}>
                Humanity<span className="text-green-500">.</span>
              </h1>
              <p className="m-0 mb-7 text-sm sm:text-base text-[#475569] leading-[1.8] max-w-[440px]">
                Every dollar tracked. Every life impacted. We turn your generosity into measurable change through open-source philanthropy — fully audited, fully transparent.
              </p>
              {/* Audit badge */}
              <div className="inline-flex items-center gap-3 bg-[#0f172a] rounded-2xl px-4 sm:px-[22px] py-3 sm:py-[14px] shadow-[0_8px_32px_rgba(15,23,42,0.25)]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                     style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)" }}>✓</div>
                <div>
                  <div className="text-sm font-extrabold text-white">100% Audit Integrity</div>
                  <div className="text-[11px] text-[#94a3b8] mt-0.5 hidden sm:block">Verified by independent third-party humanitarian reviewers</div>
                </div>
              </div>
            </motion.div>

            {/* ── Right: image collage (hidden on mobile, visible md+) ── */}
            <motion.div
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
              transition={{ duration:0.9, delay:0.15, ease:[0.22,1,0.36,1] }}
              className="hidden md:block relative h-[400px] lg:h-[520px]"
            >
              {/* Big image */}
              <div className="oi-hero-img absolute top-0 left-0 right-[50px] lg:right-[60px] bottom-[60px] lg:bottom-[80px] rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
                <img src={imgEducation} alt="Impact" className="w-full h-full object-cover" />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[9px]">▶</div>
                  <span className="text-xs text-white font-semibold">The 2024 Impact Movement</span>
                </div>
              </div>
              {/* Small floating image */}
              <div className="oi-hero-img absolute bottom-0 right-0 w-[48%] h-[42%] rounded-[20px] overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.2)]"
                   style={{ animation:"floatY 6s ease-in-out infinite" }}>
                <img src={imgCamp} alt="Camp" className="w-full h-full object-cover" />
              </div>
              {/* Floating stat pill */}
              <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
                className="absolute top-6 right-0 bg-white rounded-2xl px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                     style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)" }}>🌱</div>
                <div>
                  <div className="text-base font-black text-[#0f172a] leading-none">450+</div>
                  <div className="text-[11px] text-[#64748b]">Villages Served</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Mobile-only: single image below text */}
            <motion.div
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.7, delay:0.2 }}
              className="block md:hidden rounded-2xl overflow-hidden shadow-xl h-52 sm:h-64"
            >
              <img src={imgEducation} alt="Impact" className="w-full h-full object-cover" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════╗
          ║  STATS BAR                       ║
          ╚══════════════════════════════════╝ */}
      <section className="bg-white border-t border-b border-[#e8eee0] py-12 md:py-[72px] px-4 sm:px-8 lg:px-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-0 items-start">
            {[
              { num:liveStats.lives    ||0, suffix:"+", label:"Lives Impacted",  sub:"Across all programmes" },
              { num:liveStats.villages ||0, suffix:"+", label:"Villages Covered", sub:"In rural India" },
              { num:liveStats.reports  ||0, suffix:"",  label:"Impact Reports",   sub:"Publicly available" },
              { num:liveStats.funds>0?Math.round(liveStats.funds/100000):0, suffix:"L+", label:"Funds Mobilised", sub:"Verified & audited" },
            ].map((s, i) => (
              <motion.div key={i} className="oi-stat-card"
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.1 }}>
                <div className="font-black text-[#3a5a10] leading-none mb-2"
                     style={{ fontSize:"clamp(2rem,4.5vw,3.8rem)" }}>
                  <AnimCounter end={s.num} suffix={s.suffix} duration={2200} />
                </div>
                <div className="text-[10px] sm:text-xs font-extrabold text-[#1a2a08] tracking-[0.1em] uppercase mb-1.5">{s.label}</div>
                <div className="text-xs sm:text-[13px] text-[#6a7a58] leading-[1.6]">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════╗
          ║  YoY ACCELERATION                ║
          ╚══════════════════════════════════╝ */}
      <section className="py-16 md:py-[100px] px-4 sm:px-8 lg:px-12 bg-[#eae6de]">
        <div className="max-w-[1100px] mx-auto">

          {/* header row */}
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="flex flex-col sm:flex-row justify-between items-start mb-10 md:mb-16 gap-6 sm:gap-8">
            <div className="max-w-[540px]">
              <h2 className="m-0 mb-4 font-black text-[#1a1a0a] leading-[1.15]"
                  style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(1.9rem,4vw,3.2rem)" }}>
                Year–over–Year<br />Acceleration.
              </h2>
              <p className="m-0 text-sm sm:text-[15px] text-[#5a5a40] leading-[1.75]">
                Our efficiency compounds. We're not just growing; we're optimising how every resource is deployed to maximise human potential.
              </p>
            </div>
            {/* YoY badges */}
            <div className="flex gap-3 items-start flex-wrap flex-shrink-0">
              <div className="bg-[#3a5a10] rounded-2xl px-5 py-4 min-w-[140px]">
                <div className="text-[10px] font-extrabold text-[#a8c878] tracking-[0.12em] uppercase mb-1.5">
                  {yoyBadges.year||"This Year"} Volunteers
                </div>
                <div className="text-[1.7rem] font-black text-[#d4e8a8] leading-none">
                  {yoyBadges.thisYear.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="bg-[#e0dbd0] rounded-2xl px-5 py-4 min-w-[140px]">
                <div className="text-[10px] font-extrabold text-[#8a8a6a] tracking-[0.12em] uppercase mb-1.5">
                  YoY Growth vs {yoyBadges.prevYear||"Last Year"}
                </div>
                <div className="text-[1.7rem] font-black text-[#3a3a20] leading-none">
                  {yoyBadges.pct!==null ? `${yoyBadges.pct>=0?"+":""}${yoyBadges.pct}%` : "—"}
                </div>
              </div>
            </div>
          </motion.div>

          {/* chart cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
            <motion.div initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.7 }}
              className="bg-white rounded-3xl p-6 sm:p-9 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
              <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                <div>
                  <div className="text-sm sm:text-base font-bold text-[#1a1a0a]">Volunteer Growth by Year</div>
                  <div className="text-[11px] font-semibold text-[#8a9a7a] tracking-[0.08em] uppercase mt-1">Beneficiaries Reached</div>
                </div>
                <span className="text-[11px] font-extrabold bg-[#d4e8a8] text-[#3a5a10] rounded-full px-3 py-[5px]">
                  GROWTH SECTOR
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendData} margin={{ top:16, right:4, left:-24, bottom:4 }} barCategoryGap="28%">
                  <XAxis dataKey="year" tick={{ fontSize:11, fill:"#8a9a7a", fontWeight:500 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius:10, border:"none", boxShadow:"0 4px 20px rgba(0,0,0,0.12)", fontSize:12 }}
                    formatter={v => [`${v} volunteers`, ""]} cursor={{ fill:"rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="value" radius={[6,6,0,0]}>
                    {trendData.map((_,i) => {
                      const shades=["#c8d8a8","#a8c080","#7a9a50","#3a5a10"];
                      return <Cell key={i} fill={shades[i]||"#3a5a10"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.7 }}
              className="bg-white rounded-3xl p-6 sm:p-9 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
              <div className="mb-6">
                <div className="text-sm sm:text-base font-bold text-[#1a1a0a]">Asset Allocation by Sector</div>
                <div className="text-[11px] font-semibold text-[#8a9a7a] tracking-[0.08em] uppercase mt-1">Capital Deployment Strategy</div>
              </div>
              {allocData.map((a, i) => (
                <div key={i} className="mb-5">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[11px] font-bold text-[#5a5a40] tracking-[0.08em] uppercase">{a.label}</span>
                    <span className="text-sm font-extrabold text-[#3a5a10]">₹{a.amount}</span>
                  </div>
                  <div className="h-[7px] bg-[#e8e4d8] rounded-full overflow-hidden">
                    <motion.div initial={{ width:0 }} whileInView={{ width:`${a.pct}%` }}
                      viewport={{ once:true }} transition={{ duration:1, delay:i*0.15, ease:"easeOut" }}
                      className="h-full bg-[#3a5a10] rounded-full" />
                  </div>
                </div>
              ))}
              <div className="bg-[#f4f0e8] rounded-xl px-4 py-3 mt-3">
                <p className="m-0 text-xs text-[#5a5a40] leading-[1.6] italic">
                  "Every rupee allocated is tracked and audited — ensuring maximum impact for every community we serve."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════╗
          ║  HUMAN STORIES                   ║
          ╚══════════════════════════════════╝ */}
      <section className="bg-[#fafaf7] py-16 md:py-[100px] px-4 sm:px-8">
        <div className="max-w-[1140px] mx-auto border-[1.5px] border-dashed border-[#c8d4b8] rounded-[24px] md:rounded-[32px] px-4 sm:px-8 md:px-14 py-10 md:py-[60px]">

          {/* header */}
          <div className="flex justify-between items-end mb-10 md:mb-16 flex-wrap gap-4">
            <div>
              <span className="text-[11px] font-extrabold text-[#3a8a60] tracking-[0.14em] uppercase">Ground Truth</span>
              <h2 className="mt-2 mb-0 font-black text-[#111108] leading-[1.1]"
                  style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(2rem,5vw,3.8rem)" }}>
                Human Stories.
              </h2>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStorySlide(p=>Math.max(0,p-1))} disabled={storySlide===0}
                className="w-11 h-11 rounded-full border-[1.5px] border-[#c8d4b8] flex items-center justify-center text-base transition-all"
                style={{ background:storySlide===0?"#f0f0ea":"#fff", color:storySlide===0?"#b0b8a0":"#1a2a0a", cursor:storySlide===0?"default":"pointer" }}>
                ←
              </button>
              <button onClick={() => setStorySlide(p=>Math.min(PAIRS-1,p+1))} disabled={storySlide===PAIRS-1}
                className="w-11 h-11 rounded-full border-[1.5px] border-[#c8d4b8] flex items-center justify-center text-base transition-all"
                style={{ background:storySlide===PAIRS-1?"#f0f0ea":"#3a5a10", color:storySlide===PAIRS-1?"#b0b8a0":"#fff", cursor:storySlide===PAIRS-1?"default":"pointer" }}>
                →
              </button>
            </div>
          </div>

          {/* slide */}
          <AnimatePresence mode="wait">
            <motion.div key={storySlide}
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }}
              transition={{ duration:0.5, ease:"easeInOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-start">
              {[stories[storySlide*2], stories[storySlide*2+1]].map((s, i) => s && (
                <div key={i} className={i===1 ? "sm:mt-16" : ""}>
                  <div className="relative rounded-[16px] sm:rounded-[20px] overflow-hidden mb-5 sm:mb-7">
                    <img src={s.img} alt={s.tag}
                      className="w-full object-cover block"
                      style={{ height:"clamp(200px,35vw,380px)", filter:"grayscale(100%)" }} />
                    <div className="absolute top-3 sm:top-[18px] left-3 sm:left-[18px] bg-white/90 backdrop-blur-md rounded-full px-3 sm:px-4 py-1 text-[9px] sm:text-[10px] font-extrabold text-[#1a1a0a] tracking-[0.1em]">
                      {s.tag}
                    </div>
                  </div>
                  <p className="m-0 mb-4 font-bold text-[#111108] leading-[1.5]"
                     style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(1rem,2vw,1.4rem)" }}>
                    "{s.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-0.5 bg-[#3a8a60] rounded-full flex-shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-[#5a6a4a] tracking-[0.08em]">
                      {s.author} &nbsp;•&nbsp; {s.role}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* dots */}
          <div className="flex gap-2 mt-10 md:mt-14 justify-center">
            {Array.from({ length:PAIRS }).map((_,i) => (
              <button key={i} onClick={() => setStorySlide(i)}
                className="h-2 rounded-full border-none cursor-pointer transition-all p-0"
                style={{ width:i===storySlide?28:8, background:i===storySlide?"#3a5a10":"#c8d4b8" }} />
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════╗
          ║  LEAN BY DESIGN                  ║
          ╚══════════════════════════════════╝ */}
      <section className="bg-[#1c1c1c] py-14 md:py-20 px-4 sm:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">

            {/* text + bars */}
            <motion.div initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }}
              viewport={{ once:true }} transition={{ duration:0.7 }}>
              <h2 className="m-0 mb-5 font-black text-white leading-[1.1]"
                  style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(2.2rem,4.5vw,3.6rem)" }}>
                Lean<br />by Design.
              </h2>
              <p className="m-0 mb-10 text-sm sm:text-[15px] text-[#8a9a8a] leading-[1.9] max-w-[380px]">
                We pride ourselves on lean operations. For every rupee donated,{" "}
                <strong className="text-white">90 paise go directly</strong>{" "}
                toward programs in the field. This is how we ensure your generosity has maximum impact.
              </p>
              <div className="flex flex-col gap-6 sm:gap-7">
                {[
                  { label:"PROGRAM SERVICES",    pct:90, highlight:true  },
                  { label:"FUNDRAISING & GROWTH", pct:6,  highlight:false },
                  { label:"ADMINISTRATION",       pct:4,  highlight:false },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-[10px] font-bold tracking-[0.12em] uppercase"
                            style={{ color:item.highlight?"#8aaa8a":"#4a5a4a" }}>
                        {item.label}
                      </span>
                      <span className="font-black leading-none"
                            style={{ fontSize:item.highlight?26:18, color:item.highlight?"#fff":"#4a5a4a" }}>
                        {item.pct}%
                      </span>
                    </div>
                    <div className="bg-[#2a2a2a] rounded-full h-[5px] overflow-hidden">
                      <motion.div initial={{ width:0 }}
                        whileInView={{ width:`${item.pct}%` }} viewport={{ once:true }}
                        transition={{ duration:1.4, delay:i*0.2, ease:[0.34,1.56,0.64,1] }}
                        className="h-full bg-[#c8f040] rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* SVG donut */}
            <motion.div ref={leanRef}
              initial={{ opacity:0, scale:0.85 }} whileInView={{ opacity:1, scale:1 }}
              viewport={{ once:true }} transition={{ duration:0.9, type:"spring", stiffness:160 }}
              className="flex justify-center items-center">
              <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[300px] md:h-[300px]">
                <svg width="100%" height="100%" viewBox="0 0 300 300" style={{ transform:"rotate(-90deg)" }}>
                  <circle cx="150" cy="150" r="120" fill="none" stroke="#2a2a2a" strokeWidth="28" />
                  <motion.circle cx="150" cy="150" r="120"
                    fill="none" stroke="#c8f040" strokeWidth="28" strokeLinecap="round"
                    strokeDasharray={`${2*Math.PI*120}`}
                    initial={{ strokeDashoffset:2*Math.PI*120 }}
                    whileInView={{ strokeDashoffset:leanInView ? 2*Math.PI*120*(1-0.90) : 2*Math.PI*120 }}
                    viewport={{ once:true }}
                    transition={{ duration:2, ease:"easeOut", delay:0.3 }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="font-black text-[#c8f040] leading-none"
                       style={{ fontSize:"clamp(2.4rem,6vw,4.5rem)" }}>
                    <AnimCounter end={leanInView?90:0} suffix="%" duration={2000} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-extrabold text-[#6a7a6a] tracking-[0.14em] uppercase mt-2 text-center">
                    Direct Field Impact
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════╗
          ║  HISTORICAL ARCHIVES             ║
          ╚══════════════════════════════════╝ */}
      <section className="py-16 md:py-[100px] px-4 sm:px-8 lg:px-12 bg-white">
        <div className="max-w-[1100px] mx-auto">

          {/* header */}
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-16 gap-6">
            <div>
              <h2 className="m-0 mb-3 font-black text-[#111108] leading-[1.1]"
                  style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(2rem,5vw,3.8rem)" }}>
                Historical<br />Archives.
              </h2>
              <p className="m-0 text-sm text-[#7a7a6a] max-w-[340px] leading-[1.7]">
                Transparency is a lifelong commitment. We maintain an open record of every impact report published on this platform.
              </p>
            </div>
            {/* filter pills */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key:"all",       label:"All Reports" },
                { key:"monthly",   label:"Monthly"     },
                { key:"quarterly", label:"Quarterly"   },
                { key:"annual",    label:"Annual"      },
              ].map(f => (
                <button key={f.key}
                  onClick={() => { setArchiveFilter(f.key); setArchivePage(0); }}
                  className="px-4 py-2 rounded-full border-[1.5px] text-[12px] sm:text-[13px] font-semibold cursor-pointer transition-all"
                  style={{
                    borderColor: archiveFilter===f.key ? "#3a5a10" : "#d8d4cc",
                    background:  archiveFilter===f.key ? "#3a5a10" : "#fff",
                    color:       archiveFilter===f.key ? "#fff"    : "#5a5a4a",
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* cards */}
          {(() => {
            if (loading) return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {[0,1,2].map(i => <div key={i} className="bg-[#f0ede6] rounded-[20px] h-64 sm:h-80 opacity-60" />)}
              </div>
            );

            const filtered = archiveFilter==="all"
              ? allReports
              : allReports.filter(r => r.reportPeriod===archiveFilter);

            if (!filtered.length) return (
              <div className="text-center py-16 text-[#9a9a8a] text-sm sm:text-[15px]">
                No {archiveFilter} reports published yet.
              </div>
            );

            const PER_PAGE   = 3;
            const totalPages = Math.ceil(filtered.length/PER_PAGE);
            const safePage   = Math.min(archivePage, totalPages-1);
            const pageReports = filtered.slice(safePage*PER_PAGE, safePage*PER_PAGE+PER_PAGE);

            const ArchiveCard = ({ r, i }) => {
              const yr        = new Date(r.periodEnd||r.periodStart||Date.now()).getFullYear();
              const typeLabel = (PERIOD_LABEL[r.reportPeriod]||"Report").toUpperCase()+" REPORT";
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
                  transition={{ duration:0.45, delay:i*0.08 }}
                  onClick={() => setSelected(r)}
                  whileHover={{ y:-5, boxShadow:"0 20px 56px rgba(0,0,0,0.11)" }}
                  className="oi-report-card bg-[#f0ede6] rounded-[20px] pt-6 sm:pt-7 px-5 sm:px-7 pb-0 cursor-pointer flex flex-col min-h-[260px] sm:min-h-[320px]">
                  <div className="flex justify-between items-start mb-auto">
                    <span className="font-black leading-none"
                          style={{
                            fontSize:"clamp(2.6rem,5.5vw,5rem)",
                            fontFamily:"'Playfair Display',Georgia,serif",
                            color: i===0&&safePage===0 ? "#3a5a10" : "#b0b8a0",
                          }}>
                      {String(yr).slice(-2)}
                    </span>
                    <div className="w-10 h-10 sm:w-[46px] sm:h-[46px] rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </div>
                  </div>
                  <div className="pb-6 sm:pb-7 pt-8 sm:pt-11">
                    <div className="font-extrabold text-[#1a1a0a] leading-[1.35] mb-2"
                         style={{ fontSize:"clamp(0.9rem,1.5vw,1.2rem)" }}>
                      {r.title}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-semibold text-[#8a8a6a] tracking-[0.08em] uppercase">
                      {typeLabel} &nbsp;•&nbsp; {yr}
                    </div>
                    <div className="h-px bg-[#d8d4cc] mt-4 sm:mt-6" />
                  </div>
                </motion.div>
              );
            };

            return (
              <>
                <AnimatePresence mode="wait">
                  <motion.div key={`${archiveFilter}-${safePage}`}
                    initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}
                    transition={{ duration:0.35 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {pageReports.map((r, i) => <ArchiveCard key={r._id} r={r} i={i} />)}
                    {pageReports.length < PER_PAGE && Array.from({ length:PER_PAGE-pageReports.length }).map((_,i) => (
                      <div key={`empty-${i}`} />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {totalPages>1 && (
                  <div className="flex justify-center items-center gap-4 mt-8 md:mt-10">
                    <button onClick={() => setArchivePage(p=>Math.max(0,p-1))} disabled={safePage===0}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[1.5px] flex items-center justify-center text-base"
                      style={{
                        borderColor: safePage===0?"#e0dcd4":"#3a5a10",
                        background:  safePage===0?"#f8f6f2":"#fff",
                        color:       safePage===0?"#c0bab0":"#3a5a10",
                        cursor:      safePage===0?"default":"pointer",
                      }}>←</button>

                    <div className="flex gap-2">
                      {Array.from({ length:totalPages }).map((_,i) => (
                        <button key={i} onClick={() => setArchivePage(i)}
                          className="h-2 rounded-full border-none cursor-pointer transition-all p-0"
                          style={{ width:i===safePage?28:8, background:i===safePage?"#3a5a10":"#d8d4cc" }} />
                      ))}
                    </div>

                    <button onClick={() => setArchivePage(p=>Math.min(totalPages-1,p+1))} disabled={safePage===totalPages-1}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[1.5px] flex items-center justify-center text-base"
                      style={{
                        borderColor: safePage===totalPages-1?"#e0dcd4":"#3a5a10",
                        background:  safePage===totalPages-1?"#f8f6f2":"#3a5a10",
                        color:       safePage===totalPages-1?"#c0bab0":"#fff",
                        cursor:      safePage===totalPages-1?"default":"pointer",
                      }}>→</button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      <ReportModal report={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
