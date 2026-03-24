import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

const API = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

/* ─── CSS injected once ─────────────────────────────────────── */
const STYLES = `
  @keyframes srFadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes srSpin     { to{transform:rotate(360deg)} }
  @keyframes srPop      { 0%{transform:scale(0.6);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
  @keyframes srShimmer  { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes srPulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes srProgress { from{width:0} }

  .sr-fade  { animation:srFadeUp 0.5s ease-out both; }
  .sr-pop   { animation:srPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
  .sr-spin  { animation:srSpin 0.8s linear infinite; }
  .sr-skel  {
    background:linear-gradient(90deg,#e8ecf0 0%,#d1d8e0 50%,#e8ecf0 100%);
    background-size:600px 100%;
    animation:srShimmer 1.6s infinite;
    border-radius:8px;
  }

  .sr-star { font-size:36px; cursor:pointer; transition:transform 0.15s, color 0.15s; user-select:none; }
  .sr-star:hover { transform:scale(1.2); }

  .sr-opt {
    display:flex; align-items:center; gap:12px;
    padding:13px 16px; border-radius:12px;
    border:2px solid #e2e8f0; background:#fff;
    cursor:pointer; transition:all 0.2s; text-align:left; width:100%;
  }
  .sr-opt:hover { border-color:#0f766e; background:#f0fdf4; }
  .sr-opt.selected { border-color:#0f766e; background:#f0fdf4; }

  .sr-yn {
    flex:1; padding:16px 12px; border-radius:12px; border:2px solid #e2e8f0;
    background:#fff; cursor:pointer; font-weight:800; font-size:16px;
    transition:all 0.22s; display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .sr-yn.yes.selected { border-color:#16a34a; background:#dcfce7; color:#166534; }
  .sr-yn.no.selected  { border-color:#dc2626; background:#fee2e2; color:#991b1b; }
  .sr-yn.yes:hover:not(.selected) { border-color:#16a34a; background:#f0fdf4; }
  .sr-yn.no:hover:not(.selected)  { border-color:#dc2626; background:#fff5f5; }

  .sr-scale-btn {
    width:40px; height:40px; border-radius:10px;
    border:2px solid #e2e8f0; background:#fff;
    font-weight:800; font-size:14px; cursor:pointer;
    transition:all 0.18s; display:flex; align-items:center; justify-content:center;
    color:#374151; flex-shrink:0;
  }
  .sr-scale-btn:hover:not(.selected) { border-color:#0f766e; color:#0f766e; background:#f0fdf4; }
  .sr-scale-btn.selected { border-color:#0f766e; background:#0f766e; color:#fff; }

  .sr-textarea {
    width:100%; resize:vertical; border:2px solid #e2e8f0; border-radius:12px;
    padding:12px 14px; font-size:15px; font-family:inherit; outline:none;
    line-height:1.7; color:#1e293b; background:#fafafa; transition:all 0.22s;
    box-sizing:border-box; min-height:100px;
  }
  .sr-textarea:focus { border-color:#0f766e; background:#fff; box-shadow:0 0 0 4px rgba(15,118,110,0.08); }

  .sr-text-input {
    width:100%; border:2px solid #e2e8f0; border-radius:10px;
    padding:11px 14px; font-size:14px; font-family:inherit; outline:none;
    color:#1e293b; background:#fafafa; transition:all 0.22s; box-sizing:border-box;
  }
  .sr-text-input:focus { border-color:#0f766e; background:#fff; box-shadow:0 0 0 3px rgba(15,118,110,0.08); }

  @media(max-width:500px) {
    .sr-scale-btn { width:34px; height:34px; font-size:12px; border-radius:8px; }
    .sr-star { font-size:30px; }
  }
`;

/* ─── Question type label ───────────────────────────────────── */
const TYPE_LABEL = {
  text:            { label: "Text Answer",      color: "#6366f1", bg: "#eef2ff" },
  multiple_choice: { label: "Multiple Choice",  color: "#0891b2", bg: "#ecfeff" },
  yes_no:          { label: "Yes / No",         color: "#059669", bg: "#ecfdf5" },
  rating:          { label: "Star Rating",      color: "#d97706", bg: "#fffbeb" },
  scale:           { label: "Scale",            color: "#7c3aed", bg: "#f5f3ff" },
};

/* ─── Star Rating ───────────────────────────────────────────── */
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const active = hover || value || 0;
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map(s => (
          <span
            key={s}
            className="sr-star"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            style={{ color: s <= active ? "#f59e0b" : "#d1d5db" }}
            role="button"
            aria-label={`${s} star`}
          >
            ★
          </span>
        ))}
      </div>
      {active > 0 && (
        <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginTop: 2 }}>
          {labels[active]}
        </div>
      )}
    </div>
  );
}

/* ─── Scale Input ───────────────────────────────────────────── */
function ScaleInput({ min = 1, max = 10, value, onChange }) {
  const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {nums.map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`sr-scale-btn${value === n ? " selected" : ""}`}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", fontWeight: 600, marginTop: 4 }}>
        <span>{min} — Lowest</span>
        <span>Highest — {max}</span>
      </div>
    </div>
  );
}

/* ─── Question Card ─────────────────────────────────────────── */
function QuestionCard({ q, index, total, answer, onChange }) {
  const meta = TYPE_LABEL[q.type] || { label: q.type, color: "#64748b", bg: "#f8fafc" };
  const answered = answer !== undefined && answer !== "" && answer !== null;

  return (
    <div
      className="sr-fade"
      style={{
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        border: `1.5px solid ${answered ? "#0f766e33" : "#f1f5f9"}`,
        transition: "border-color 0.3s",
        animationDelay: `${index * 0.07}s`,
      }}
    >
      {/* Question header */}
      <div style={{
        padding: "16px 20px 14px",
        borderBottom: "1px solid #f8fafc",
        display: "flex", alignItems: "flex-start", gap: 12,
      }}>
        {/* Number badge */}
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: answered ? "linear-gradient(135deg,#0f766e,#059669)" : "#f1f5f9",
          color: answered ? "#fff" : "#64748b",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 13, transition: "all 0.3s",
        }}>
          {answered ? "✓" : index + 1}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{
              background: meta.bg, color: meta.color,
              fontSize: 10, fontWeight: 800, padding: "2px 8px",
              borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              {meta.label}
            </span>
            {q.required && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", background: "#fee2e2", padding: "2px 7px", borderRadius: 999 }}>
                Required
              </span>
            )}
            <span style={{ fontSize: 11, color: "#cbd5e1", marginLeft: "auto" }}>
              {index + 1} / {total}
            </span>
          </div>
          <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: 15, lineHeight: 1.5 }}>
            {q.question}
          </p>
        </div>
      </div>

      {/* Answer input */}
      <div style={{ padding: "18px 20px" }}>
        {q.type === "text" && (
          <div>
            <textarea
              className="sr-textarea"
              value={answer || ""}
              onChange={e => onChange(e.target.value)}
              placeholder="Type your answer here…"
              maxLength={500}
              rows={3}
            />
            <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "right", marginTop: 4 }}>
              {(answer || "").length} / 500
            </div>
          </div>
        )}

        {q.type === "multiple_choice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(q.options || []).map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`sr-opt${answer === opt ? " selected" : ""}`}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  border: `2px solid ${answer === opt ? "#0f766e" : "#cbd5e1"}`,
                  background: answer === opt ? "#0f766e" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  {answer === opt && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                  )}
                </div>
                <span style={{
                  fontSize: 14, fontWeight: answer === opt ? 700 : 500,
                  color: answer === opt ? "#065f46" : "#374151",
                }}>
                  {opt}
                </span>
              </button>
            ))}
          </div>
        )}

        {q.type === "yes_no" && (
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => onChange("yes")}
              className={`sr-yn yes${answer === "yes" ? " selected" : ""}`}
            >
              <span style={{ fontSize: 20 }}>👍</span> Yes
            </button>
            <button
              type="button"
              onClick={() => onChange("no")}
              className={`sr-yn no${answer === "no" ? " selected" : ""}`}
            >
              <span style={{ fontSize: 20 }}>👎</span> No
            </button>
          </div>
        )}

        {q.type === "rating" && (
          <StarRating value={answer || 0} onChange={onChange} />
        )}

        {q.type === "scale" && (
          <ScaleInput
            min={q.scaleMin || 1}
            max={q.scaleMax || 10}
            value={answer}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function SurveyRespond() {
  const { token } = useParams();
  const [survey,          setSurvey]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [fetchError,      setFetchError]      = useState("");
  const [answers,         setAnswers]         = useState({});
  const [respondentName,  setRespondentName]  = useState("");
  const [respondentPhone, setRespondentPhone] = useState("");
  const [submitting,      setSubmitting]      = useState(false);
  const [submitError,     setSubmitError]     = useState("");
  const [submitted,       setSubmitted]       = useState(false);
  const topRef = useRef(null);

  /* inject styles */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  /* fetch survey */
  useEffect(() => {
    fetch(`${API}/api/surveys/respond/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setSurvey(d.data.survey);
        else setFetchError(d.message || "Survey not found.");
      })
      .catch(() => setFetchError("Could not load survey. Please check your connection."))
      .finally(() => setLoading(false));
  }, [token]);

  const setAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setSubmitError("");
  };

  /* progress */
  const total    = survey?.questions?.length || 0;
  const answered = survey?.questions?.filter(q => {
    const a = answers[q._id];
    return a !== undefined && a !== "" && a !== null;
  }).length || 0;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  /* submit */
  const handleSubmit = () => {
    if (!survey) return;

    /* validate required */
    const missing = survey.questions.filter(
      q => q.required && (answers[q._id] === undefined || answers[q._id] === "" || answers[q._id] === null)
    );
    if (missing.length > 0) {
      setSubmitError(`Please answer all required questions (${missing.length} remaining).`);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      respondentName:  respondentName.trim() || "Anonymous",
      respondentPhone: respondentPhone.trim(),
      answers: survey.questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id] ?? "",
      })),
    };

    fetch(`${API}/api/surveys/respond/${token}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setSubmitted(true);
        else setSubmitError(d.message || "Submission failed. Please try again.");
      })
      .catch(() => setSubmitError("Network error. Please try again."))
      .finally(() => setSubmitting(false));
  };

  /* ── LOADING ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", gap: 16 }}>
      <div style={{ width: 48, height: 48, border: "4px solid #e2e8f0", borderTopColor: "#0f766e", borderRadius: "50%" }} className="sr-spin" />
      <p style={{ color: "#94a3b8", fontWeight: 600, fontSize: 15, fontFamily: "system-ui,sans-serif" }}>Loading survey…</p>
    </div>
  );

  /* ── ERROR (survey not found / not active) ── */
  if (fetchError) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui,sans-serif" }}>
      <div className="sr-pop" style={{ background: "#fff", borderRadius: 24, padding: "48px 36px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
        <h2 style={{ margin: "0 0 10px", fontWeight: 900, fontSize: 22, color: "#0f172a" }}>
          Survey Unavailable
        </h2>
        <p style={{ color: "#64748b", margin: "0 0 28px", lineHeight: 1.65, fontSize: 15 }}>
          {fetchError}
        </p>
        <Link
          to="/"
          style={{
            display: "inline-block", padding: "12px 28px",
            background: "linear-gradient(135deg,#0f766e,#065f46)",
            color: "#fff", borderRadius: 12, fontWeight: 700,
            textDecoration: "none", fontSize: 14,
            boxShadow: "0 6px 20px rgba(15,118,110,0.3)",
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );

  /* ── SUBMITTED ── */
  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#ecfdf5,#eff6ff)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui,sans-serif" }}>
      <div className="sr-pop" style={{ background: "#fff", borderRadius: 28, padding: "52px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 16px 60px rgba(15,118,110,0.15)" }}>
        {/* Checkmark circle */}
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: "linear-gradient(135deg,#34d399,#059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 12px 36px rgba(52,211,153,0.4)",
        }}>
          <span style={{ fontSize: 42, color: "#fff" }}>✓</span>
        </div>

        <h2 style={{ margin: "0 0 12px", fontWeight: 900, fontSize: 26, color: "#0f172a" }}>
          Thank You!
        </h2>
        <p style={{ color: "#475569", margin: "0 0 8px", fontSize: 16, lineHeight: 1.65 }}>
          Your response has been recorded successfully.
        </p>
        <p style={{ color: "#94a3b8", margin: "0 0 32px", fontSize: 14 }}>
          Your feedback helps <strong style={{ color: "#0f766e" }}>{survey?.ngoId?.ngoName}</strong> improve community services.
        </p>

        <div style={{ background: "#f0fdf4", borderRadius: 14, padding: "16px 20px", marginBottom: 28, border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 13, color: "#059669", fontWeight: 700 }}>
            📋 {survey?.title}
          </div>
          {survey?.villageId && (
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              📍 {survey.villageId.villageName}, {survey.villageId.district}
            </div>
          )}
        </div>

        <Link
          to="/"
          style={{
            display: "inline-block", padding: "13px 32px",
            background: "linear-gradient(135deg,#0f766e,#065f46)",
            color: "#fff", borderRadius: 14, fontWeight: 800,
            textDecoration: "none", fontSize: 15,
            boxShadow: "0 8px 24px rgba(15,118,110,0.3)",
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );

  /* ── MAIN SURVEY PAGE ── */
  const requiredLeft = (survey?.questions || []).filter(
    q => q.required && (answers[q._id] === undefined || answers[q._id] === "" || answers[q._id] === null)
  ).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui,-apple-system,sans-serif" }} ref={topRef}>

      {/* ── Sticky progress bar ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ height: 5, background: "#e2e8f0" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg,#0f766e,#34d399)",
            transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
            borderRadius: "0 4px 4px 0",
          }} />
        </div>
        <div style={{ padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0f766e" }}>
            {survey?.ngoId?.ngoName || "Survey"}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
            {answered}/{total} answered · {progress}%
          </span>
        </div>
      </div>

      {/* ── Hero header ── */}
      <div style={{
        background: "linear-gradient(135deg,#064e3b 0%,#0f766e 55%,#1d4ed8 100%)",
        padding: "40px 20px 52px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative dots */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div style={{ maxWidth: 660, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* NGO badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(255,255,255,0.14)", color: "#fff",
            borderRadius: 999, padding: "5px 14px", fontSize: 11,
            fontWeight: 700, letterSpacing: "0.08em", marginBottom: 18,
            border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(8px)",
          }}>
            🏢 {survey?.ngoId?.ngoName || "NGO Survey"}
          </div>

          <h1 style={{
            color: "#fff", fontSize: "clamp(1.5rem,4vw,2.2rem)",
            fontWeight: 900, margin: "0 0 12px", lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}>
            {survey?.title}
          </h1>

          {survey?.description && (
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 520 }}>
              {survey.description}
            </p>
          )}

          {/* Meta pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {survey?.villageId && (
              <div style={{
                background: "rgba(255,255,255,0.12)", color: "#fff",
                borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.2)",
              }}>
                📍 {survey.villageId.villageName}, {survey.villageId.district}
              </div>
            )}
            {survey?.targetAudience && (
              <div style={{
                background: "rgba(255,255,255,0.12)", color: "#fff",
                borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.2)",
              }}>
                👥 {survey.targetAudience}
              </div>
            )}
            <div style={{
              background: "rgba(255,255,255,0.12)", color: "#fff",
              borderRadius: 999, padding: "5px 12px", fontSize: 12, fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
              📝 {total} Question{total !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ width: "100%", height: 40 }}>
            <path d="M0,20 C480,40 960,0 1440,20 L1440,40 L0,40Z" fill="#f1f5f9" />
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Respondent info card */}
        <div className="sr-fade" style={{
          background: "#fff", borderRadius: 18, padding: "20px 22px",
          marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "1.5px solid #f1f5f9",
        }}>
          <p style={{ margin: "0 0 14px", fontWeight: 800, fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 18 }}>👤</span> Your Information
            <span style={{ fontWeight: 500, color: "#9ca3af", fontSize: 12 }}>(optional)</span>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              className="sr-text-input"
              value={respondentName}
              onChange={e => setRespondentName(e.target.value)}
              placeholder="Your name"
            />
            <input
              className="sr-text-input"
              value={respondentPhone}
              onChange={e => setRespondentPhone(e.target.value)}
              placeholder="Phone number"
              type="tel"
            />
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "#94a3b8" }}>
            You can fill this survey anonymously. Name and phone are not required.
          </p>
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(survey?.questions || []).map((q, i) => (
            <QuestionCard
              key={q._id}
              q={q}
              index={i}
              total={total}
              answer={answers[q._id]}
              onChange={val => setAnswer(q._id, val)}
            />
          ))}
        </div>

        {/* Error */}
        {submitError && (
          <div style={{
            margin: "20px 0 0",
            background: "#fff1f2", border: "1.5px solid #fecdd3",
            color: "#be123c", padding: "14px 16px", borderRadius: 12,
            fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 9,
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span> {submitError}
          </div>
        )}

        {/* Submit */}
        <div style={{ marginTop: 28 }}>
          {/* Completion indicator */}
          {requiredLeft > 0 && (
            <p style={{ textAlign: "center", fontSize: 13, color: "#f97316", fontWeight: 600, marginBottom: 12 }}>
              ⚠ {requiredLeft} required question{requiredLeft > 1 ? "s" : ""} still unanswered
            </p>
          )}
          {requiredLeft === 0 && total > 0 && (
            <p style={{ textAlign: "center", fontSize: 13, color: "#059669", fontWeight: 700, marginBottom: 12 }}>
              ✅ All required questions answered — ready to submit!
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%", padding: "16px",
              borderRadius: 14, border: "none",
              background: submitting
                ? "#94a3b8"
                : "linear-gradient(135deg,#0f766e 0%,#065f46 100%)",
              color: "#fff", fontWeight: 900, fontSize: 17,
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: submitting ? "none" : "0 8px 28px rgba(15,118,110,0.35)",
              transition: "all 0.3s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
            onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(15,118,110,0.45)"; } }}
            onMouseLeave={e => { if (!submitting) { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 8px 28px rgba(15,118,110,0.35)"; } }}
          >
            {submitting ? (
              <>
                <div style={{ width: 20, height: 20, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} className="sr-spin" />
                Submitting…
              </>
            ) : (
              <>🚀 Submit Response</>
            )}
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 14, lineHeight: 1.6 }}>
            By submitting, your feedback will be shared with {survey?.ngoId?.ngoName}.<br />
            This survey is powered by <strong style={{ color: "#0f766e" }}>SevaIndia</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
