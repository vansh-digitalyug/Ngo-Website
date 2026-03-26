import { useState, useEffect, useRef } from "react";
import { API } from "../../utils/S3.js";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar,
} from "recharts";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

/* ── image imports ── */
import imgEducation  from "../../assets/images/orphanage/education.jpg";
import imgCamp       from "../../assets/images/Medical/camp.jpg";

/* ══════════════════════════════════════════
   STYLES
══════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');

  * { box-sizing: border-box; }

  @keyframes floatY {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    50%      { transform: translateY(-18px) rotate(1deg); }
  }
  @keyframes spin360 { to { transform: rotate(360deg); } }
  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
    50%      { box-shadow: 0 0 0 16px rgba(34,197,94,0); }
  }
  @keyframes shimmer {
    0%   { background-position: -800px 0; }
    100% { background-position: 800px 0; }
  }
  @keyframes gradShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
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
  @keyframes barFill {
    from { width: 0; }
    to   { width: var(--w); }
  }
  @keyframes countPulse {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.06); }
    100% { transform: scale(1); }
  }

  .oi-hero-img {
    transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1);
  }
  .oi-hero-img:hover { transform: scale(1.04) rotateY(-3deg); }

  .oi-stat-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .oi-stat-card:hover {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
  }

  .oi-story-card {
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease;
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  .oi-story-card:hover {
    transform: translateY(-10px) rotateX(2deg) rotateY(-2deg);
    box-shadow: 0 30px 80px rgba(0,0,0,0.35) !important;
  }

  .oi-report-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .oi-report-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 18px 50px rgba(0,0,0,0.12) !important;
  }

  .oi-bar-fill {
    height: 8px;
    border-radius: 99px;
    animation: barFill 1.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  @media (max-width: 768px) {
    .oi-hero-grid  { grid-template-columns: 1fr !important; }
    .oi-chart-grid { grid-template-columns: 1fr !important; }
    .oi-story-grid { grid-template-columns: 1fr !important; }
    .oi-stat-grid  { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 480px) {
    .oi-stat-grid  { grid-template-columns: 1fr !important; }
  }
`;

/* ══════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════ */
const CAT = {
  beneficiaries: { color: "#6366f1", label: "Beneficiaries" },
  health:        { color: "#ec4899", label: "Health" },
  education:     { color: "#f59e0b", label: "Education" },
  employment:    { color: "#22c55e", label: "Employment" },
  infrastructure:{ color: "#06b6d4", label: "Infrastructure" },
  environment:   { color: "#84cc16", label: "Environment" },
  other:         { color: "#94a3b8", label: "Other" },
};
const PERIOD_LABEL = {
  monthly: "Monthly", quarterly: "Quarterly",
  annual: "Annual", custom: "Custom",
};

function fmt(v) { return Number(v || 0).toLocaleString("en-IN"); }
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ══════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════ */
function AnimCounter({ end, suffix = "", prefix = "", duration = 2.5 }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <span ref={ref}>
      {inView
        ? <CountUp start={0} end={end} duration={duration} separator="," prefix={prefix} suffix={suffix} />
        : `${prefix}0${suffix}`}
    </span>
  );
}

/* ══════════════════════════════════════════
   REPORT MODAL (unchanged logic)
══════════════════════════════════════════ */
function ReportModal({ report, onClose }) {
  if (!report) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="modal-bg"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 1000, display: "flex", alignItems: "flex-start",
          justifyContent: "center", padding: "60px 16px 40px", overflowY: "auto",
        }}
      >
        <motion.div
          key="modal-box"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 24, maxWidth: 800, width: "100%",
            boxShadow: "0 32px 100px rgba(0,0,0,0.25)", overflow: "hidden",
          }}
        >
          <div style={{
            background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",
            padding: "32px 36px 28px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#22c55e",
                  background: "#22c55e18", border: "1px solid #22c55e30",
                  borderRadius: 99, padding: "3px 12px", letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}>
                  {PERIOD_LABEL[report.reportPeriod] || "Report"}
                </span>
                <h2 style={{ margin: "12px 0 6px", color: "#fff", fontSize: 22, fontWeight: 800 }}>
                  {report.title}
                </h2>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                  {report.ngoId?.ngoName || "NGO"} &nbsp;·&nbsp;
                  {fmtDate(report.periodStart)} – {fmtDate(report.periodEnd)}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%",
                  width: 38, height: 38, color: "#fff", fontSize: 18, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >✕</button>
            </div>
            {report.summary && (
              <p style={{ margin: "16px 0 0", color: "#cbd5e1", fontSize: 14, lineHeight: 1.7 }}>
                {report.summary}
              </p>
            )}
          </div>

          <div style={{ padding: "28px 36px 36px" }}>
            {report.metrics?.length > 0 && (
              <section style={{ marginBottom: 28 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Key Metrics</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
                  {report.metrics.map((m, i) => {
                    const cat = CAT[m.category] || CAT.other;
                    return (
                      <div key={i} style={{
                        background: `${cat.color}12`, border: `1px solid ${cat.color}30`,
                        borderRadius: 14, padding: "14px 16px",
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, textTransform: "uppercase" }}>{cat.label}</span>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "4px 0 2px" }}>
                          {m.unit === "₹" ? `₹${fmt(m.value)}` : fmt(m.value)}{m.unit && m.unit !== "₹" ? ` ${m.unit}` : ""}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{m.label}</div>
                      </div>
                    );
                  })}
                </div>
                {report.metrics.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={report.metrics.filter(m => m.value > 0).map(m => ({
                        name: m.label.length > 14 ? m.label.slice(0, 13) + "…" : m.label,
                        value: m.value, cat: m.category,
                      }))} margin={{ top: 4, right: 8, left: 0, bottom: 44 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} width={38} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {report.metrics.filter(m => m.value > 0).map((m, i) => (
                            <Cell key={i} fill={CAT[m.category]?.color || "#94a3b8"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>
            )}

            {report.highlights?.length > 0 && (
              <section style={{ marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>🏆 Achievements</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {report.highlights.map((h, i) => (
                    <div key={i} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10 }}>
                      <span style={{ color: "#22c55e", fontWeight: 800 }}>✓</span>
                      <span style={{ color: "#166534", fontSize: 14, lineHeight: 1.6 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {report.challenges?.length > 0 && (
              <section style={{ marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>⚡ Challenges</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {report.challenges.map((c, i) => (
                    <div key={i} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10 }}>
                      <span style={{ color: "#f97316", fontWeight: 800 }}>!</span>
                      <span style={{ color: "#9a3412", fontSize: 14, lineHeight: 1.6 }}>{c}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {report.nextSteps?.length > 0 && (
              <section>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>🎯 Next Steps</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {report.nextSteps.map((n, i) => (
                    <div key={i} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10 }}>
                      <span style={{ color: "#3b82f6", fontWeight: 800 }}>→</span>
                      <span style={{ color: "#1e40af", fontSize: 14, lineHeight: 1.6 }}>{n}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════
   REPORT CARD
══════════════════════════════════════════ */
function ReportCard({ report, onClick }) {
  const topMetrics = (report.metrics || []).slice(0, 3);
  const catColors = [...new Set((report.metrics || []).map(m => m.category))]
    .slice(0, 4).map(c => CAT[c]?.color || "#94a3b8");

  return (
    <div
      className="oi-report-card"
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)", cursor: "pointer", overflow: "hidden",
      }}
    >
      <div style={{
        height: 5,
        background: catColors.length > 1
          ? `linear-gradient(90deg,${catColors.join(",")})`
          : catColors[0] || "#6366f1",
      }} />
      <div style={{ padding: "20px 22px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#6366f1",
            background: "#6366f115", borderRadius: 99, padding: "3px 10px",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            {PERIOD_LABEL[report.reportPeriod] || "Report"}
          </span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            {fmtDate(report.periodStart)} – {fmtDate(report.periodEnd)}
          </span>
        </div>
        <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
          {report.title}
        </h3>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "#64748b" }}>
          {report.ngoId?.ngoName || "NGO"}
        </p>
        {report.summary && (
          <p style={{
            margin: "0 0 16px", fontSize: 13, color: "#475569", lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {report.summary}
          </p>
        )}
        {topMetrics.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {topMetrics.map((m, i) => {
              const cat = CAT[m.category] || CAT.other;
              return (
                <div key={i} style={{
                  background: `${cat.color}12`, border: `1px solid ${cat.color}30`,
                  borderRadius: 10, padding: "8px 12px",
                }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>
                    {fmt(m.value)}{m.unit && m.unit !== "₹" ? ` ${m.unit}` : ""}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{m.label}</div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", gap: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9", alignItems: "center" }}>
          {report.highlights?.length > 0 && (
            <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>
              ✓ {report.highlights.length} achievements
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#6366f1", fontWeight: 700 }}>
            View details →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ALLOCATION BAR ROW
══════════════════════════════════════════ */
function AllocBar({ label, amount, pct, color, delay = 0 }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <div ref={ref} style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>₹{amount}</span>
      </div>
      <div style={{ background: "#e2e8f0", borderRadius: 99, height: 8, overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ height: "100%", borderRadius: 99, background: color }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function OurImpact() {
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState("all");
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const heroRef = useRef(null);

  const LIMIT = 9;

  useEffect(() => {
    const q = new URLSearchParams({ page, limit: LIMIT });
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/impact-reports/public?${q}`);
        const d = await r.json();
        if (active) {
          setReports(d.data?.reports || []);
          setPagination(d.data?.pagination || { total: 0, pages: 1 });
        }
      } catch {
        if (active) setReports([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [page]);

  const filtered = filter === "all" ? reports : reports.filter(r => r.reportPeriod === filter);

  /* derive live stats from reports */
  const totalBenef = reports.reduce((s, r) => {
    const b = (r.metrics || []).find(m => m.category === "beneficiaries");
    return s + (b?.value || 0);
  }, 0);

  /* static chart data (representative) */
  const trendData = [
    { year: "2021", value: 38 },
    { year: "2022", value: 52 },
    { year: "2023", value: 71 },
    { year: "2024", value: 89 },
  ];
  const allocData = [
    { label: "Health & Medical",  amount: "4.2M", pct: 84, color: "#22c55e" },
    { label: "Education",         amount: "3.8M", pct: 76, color: "#6366f1" },
    { label: "Infrastructure",    amount: "5.0M", pct: 62, color: "#06b6d4" },
    { label: "Emergency Aid",     amount: "1.5M", pct: 30, color: "#f59e0b" },
  ];

  const stories = [
    {
      img: imgEducation,
      tag: "CASE STUDY · EDUCATION",
      quote: "\"Access to our learning centres changed everything. Children who never held a book now read fluently and dream of becoming doctors.\"",
      author: "Priya Sharma", role: "Regional Education Director",
    },
    {
      img: imgCamp,
      tag: "CASE STUDY · HEALTH",
      quote: "\"The mobile medical camp treated over 1,200 villagers in a single day. People walked three hours just to receive care they'd never had access to.\"",
      author: "Dr. Anil Mehta", role: "Chief Medical Officer",
    },
  ];

  const { ref: leanRef, inView: leanInView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <div style={{ background: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{STYLES}</style>

      {/* ══════════════════════════════════════════
          HERO — "Data is Humanity."
      ══════════════════════════════════════════ */}
      <section ref={heroRef} style={{ background: "#f5f2ee", minHeight: "92vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "80px 0 60px" }}>

        {/* animated orbs */}
        <div style={{ position: "absolute", top: "10%", right: "8%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,#22c55e18,transparent 70%)", animation: "orb1 12s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "5%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,#6366f118,transparent 70%)", animation: "orb2 15s ease-in-out infinite", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", width: "100%" }}>
          <div className="oi-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

            {/* Left text */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#22c55e18", border: "1px solid #22c55e40",
                borderRadius: 99, padding: "6px 16px", marginBottom: 28,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulseGlow 2s ease-in-out infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#16a34a", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Radical Transparency
                </span>
              </div>

              <h1 style={{
                margin: "0 0 8px",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(3rem, 6vw, 5.5rem)",
                fontWeight: 900, lineHeight: 1.0, color: "#0f172a", letterSpacing: "-2px",
              }}>
                Data is
              </h1>
              <h1 style={{
                margin: "0 0 28px",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(3rem, 6vw, 5.5rem)",
                fontWeight: 900, lineHeight: 1.0, color: "#0f172a", letterSpacing: "-2px",
              }}>
                Humanity<span style={{ color: "#22c55e" }}>.</span>
              </h1>

              <p style={{ margin: "0 0 32px", fontSize: 16, color: "#475569", lineHeight: 1.8, maxWidth: 440 }}>
                Every dollar tracked. Every life impacted. We turn your generosity into measurable change through open-source philanthropy — fully audited, fully transparent.
              </p>

              {/* Audit badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 14,
                background: "#0f172a", borderRadius: 16, padding: "14px 22px",
                boxShadow: "0 8px 32px rgba(15,23,42,0.25)",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>✓</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>100% Audit Integrity</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Verified by independent third-party humanitarian reviewers</div>
                </div>
              </div>
            </motion.div>

            {/* Right image collage */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "relative", height: 520 }}
            >
              {/* Big image */}
              <div className="oi-hero-img" style={{
                position: "absolute", top: 0, left: 0, right: 60, bottom: 80,
                borderRadius: 24, overflow: "hidden",
                boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
              }}>
                <img src={imgEducation} alt="Impact" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {/* video play badge */}
                <div style={{
                  position: "absolute", bottom: 20, left: 20,
                  background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                  borderRadius: 12, padding: "8px 14px",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10,
                  }}>▶</div>
                  <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>The 2024 Impact Movement</span>
                </div>
              </div>

              {/* Small image */}
              <div className="oi-hero-img" style={{
                position: "absolute", bottom: 0, right: 0, width: "48%", height: "44%",
                borderRadius: 20, overflow: "hidden",
                boxShadow: "0 16px 50px rgba(0,0,0,0.2)",
                animation: "floatY 6s ease-in-out infinite",
              }}>
                <img src={imgCamp} alt="Camp" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              {/* floating stat pill */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", top: 28, right: 0,
                  background: "#fff", borderRadius: 16,
                  padding: "12px 18px", boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌱</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>450+</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Villages Served</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <section style={{ background: "#fff", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", padding: "56px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="oi-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32 }}>
            {[
              { num: totalBenef > 0 ? totalBenef : 28400, suffix: "+", label: "Lives Impacted", sub: "Across all programmes" },
              { num: 312, suffix: "+", label: "Villages Covered", sub: "In rural India" },
              { num: pagination.total || 12, suffix: "", label: "Impact Reports", sub: "Publicly available" },
              { num: 96, suffix: "%", label: "Fund Efficiency", sub: "Goes directly to cause" },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="oi-stat-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{
                  textAlign: "center", padding: "28px 20px",
                  borderRadius: 20, background: "#f8fafc", border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: "clamp(2.4rem,4vw,3.2rem)", fontWeight: 900, color: "#0f172a", lineHeight: 1, marginBottom: 6 }}>
                  <AnimCounter end={s.num} suffix={s.suffix} duration={2.2} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          YEAR-OVER-YEAR ACCELERATION
      ══════════════════════════════════════════ */}
      <section style={{ padding: "100px 32px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: 56 }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, color: "#6366f1", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Impact growth
            </span>
            <h2 style={{
              margin: "12px 0 16px", fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, color: "#0f172a",
            }}>
              Year–over–Year<br />Acceleration.
            </h2>
            <p style={{ margin: 0, fontSize: 16, color: "#64748b", maxWidth: 500, lineHeight: 1.7 }}>
              Our efficiency compounds. We're not just growing — we're optimising how every resource is deployed to maximise human potential.
            </p>
          </motion.div>

          <div className="oi-chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {/* Bar chart */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{ background: "#fff", borderRadius: 24, padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Beneficiaries Trend</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Growth sector</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, background: "#22c55e18", color: "#16a34a", borderRadius: 99, padding: "4px 12px" }}>
                  ▲ +24%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                    formatter={v => [`${v}k people`, "Beneficiaries"]}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {trendData.map((_, i) => (
                      <Cell key={i} fill={i === trendData.length - 1 ? "#22c55e" : "#e2e8f0"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Allocation bars */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{ background: "#fff", borderRadius: 24, padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Fund Allocation by Sector</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>FY 2024-25</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, background: "#ef444418", color: "#dc2626", borderRadius: 99, padding: "4px 12px" }}>
                  ▼ -15% overhead
                </span>
              </div>
              {allocData.map((a, i) => (
                <AllocBar key={i} {...a} delay={i * 0.15} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HUMAN STORIES
      ══════════════════════════════════════════ */}
      <section style={{ background: "#0f172a", padding: "100px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: 60, textAlign: "center" }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Ground truth
            </span>
            <h2 style={{
              margin: "12px 0 0",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2rem,4vw,3rem)",
              fontWeight: 900, color: "#fff",
            }}>
              Human Stories<span style={{ color: "#22c55e" }}>.</span>
            </h2>
          </motion.div>

          <div className="oi-story-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            {stories.map((s, i) => (
              <motion.div
                key={i}
                className="oi-story-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                style={{
                  borderRadius: 24, overflow: "hidden",
                  background: "#1e293b", border: "1px solid #334155",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
                }}
              >
                {/* Image */}
                <div style={{ height: 260, overflow: "hidden", position: "relative" }}>
                  <img src={s.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom,transparent 40%,#1e293b 100%)",
                  }} />
                  <div style={{
                    position: "absolute", top: 16, left: 16,
                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
                    borderRadius: 99, padding: "4px 12px",
                    fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.1em",
                  }}>
                    {s.tag}
                  </div>
                </div>

                {/* Quote */}
                <div style={{ padding: "24px 28px 28px" }}>
                  <div style={{
                    width: 32, height: 3, background: "#22c55e",
                    borderRadius: 99, marginBottom: 16,
                  }} />
                  <p style={{
                    margin: "0 0 20px", fontSize: 16, color: "#e2e8f0",
                    lineHeight: 1.75, fontStyle: "italic",
                  }}>
                    {s.quote}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "linear-gradient(135deg,#22c55e,#16a34a)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 800, color: "#fff",
                    }}>
                      {s.author[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.author}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{s.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LEAN BY DESIGN
      ══════════════════════════════════════════ */}
      <section style={{ background: "#0f172a", borderTop: "1px solid #1e293b", padding: "100px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="oi-chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Operational model
              </span>
              <h2 style={{
                margin: "14px 0 20px",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(2rem,4vw,3rem)",
                fontWeight: 900, color: "#fff",
              }}>
                Lean<br />by Design<span style={{ color: "#22c55e" }}>.</span>
              </h2>
              <p style={{ margin: "0 0 32px", fontSize: 15, color: "#94a3b8", lineHeight: 1.8 }}>
                We pride ourselves on lean operations. For every dollar donated, <strong style={{ color: "#fff" }}>90 cents go directly</strong> toward programs in the field. This is how we ensure your generosity has maximum impact.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Program Delivery", pct: 90, color: "#22c55e" },
                  { label: "Administration",   pct: 6,  color: "#6366f1" },
                  { label: "Fundraising",      pct: 4,  color: "#f59e0b" },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#cbd5e1" }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.pct}%</span>
                    </div>
                    <div style={{ background: "#1e293b", borderRadius: 99, height: 6, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: i * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                        style={{ height: "100%", background: item.color, borderRadius: 99 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Radial / donut chart */}
            <motion.div
              ref={leanRef}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring", stiffness: 180 }}
              style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}
            >
              <div style={{ position: "relative", width: 280, height: 280 }}>
                <RadialBarChart
                  width={280} height={280}
                  cx={140} cy={140}
                  innerRadius={80} outerRadius={130}
                  data={[{ value: 90, fill: "#22c55e" }, { value: 10, fill: "#1e293b" }]}
                  startAngle={90} endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={10} />
                </RadialBarChart>
                {/* centre label */}
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                    {leanInView ? <CountUp start={0} end={90} duration={2} suffix="%" /> : "0%"}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, textAlign: "center" }}>
                    to programs
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HISTORICAL ARCHIVES
      ══════════════════════════════════════════ */}
      <section style={{ padding: "100px 32px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 24 }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6366f1", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Full registry
              </span>
              <h2 style={{
                margin: "12px 0 0",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(1.8rem,3vw,2.6rem)",
                fontWeight: 900, color: "#0f172a",
              }}>
                Historical Archives<span style={{ color: "#22c55e" }}>.</span>
              </h2>
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["all", "monthly", "quarterly", "annual"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "8px 18px", borderRadius: 99, border: "1.5px solid",
                    borderColor: filter === f ? "#6366f1" : "#e2e8f0",
                    background: filter === f ? "#6366f1" : "#fff",
                    color: filter === f ? "#fff" : "#64748b",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {f === "all" ? "All Reports" : PERIOD_LABEL[f]}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{
                width: 48, height: 48, border: "4px solid #e2e8f0",
                borderTopColor: "#6366f1", borderRadius: "50%",
                animation: "spin360 0.7s linear infinite", margin: "0 auto 16px",
              }} />
              <p style={{ color: "#94a3b8", margin: 0 }}>Loading archives…</p>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center", padding: "80px 24px",
                background: "#fff", borderRadius: 24, border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 20 }}>📊</div>
              <h3 style={{ color: "#1e293b", margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>No Reports Yet</h3>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: 15 }}>
                Impact reports will appear here once they're published.
              </p>
            </motion.div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 22 }}>
                {filtered.map((r, i) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                  >
                    <ReportCard report={r} onClick={() => setSelected(r)} />
                  </motion.div>
                ))}
              </div>

              {pagination.pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 48 }}>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      style={{
                        width: 42, height: 42, borderRadius: "50%", border: "1.5px solid",
                        borderColor: page === p ? "#6366f1" : "#e2e8f0",
                        background: page === p ? "#6366f1" : "#fff",
                        color: page === p ? "#fff" : "#64748b",
                        fontWeight: 700, fontSize: 14, cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Detail modal */}
      <ReportModal report={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
