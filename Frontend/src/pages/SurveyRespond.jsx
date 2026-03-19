import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, CheckCircle, AlertTriangle, Star, ChevronLeft } from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", fontSize: "28px", color: star <= (hover || value) ? "#f59e0b" : "#e2e8f0", transition: "color 0.1s" }}>
          ★
        </button>
      ))}
    </div>
  );
}

function ScaleInput({ min = 1, max = 10, value, onChange }) {
  const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {nums.map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          style={{ width: "42px", height: "42px", borderRadius: "8px", border: `2px solid ${value === n ? "#2563eb" : "#e2e8f0"}`, background: value === n ? "#eff6ff" : "#fff", color: value === n ? "#2563eb" : "#374151", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
          {n}
        </button>
      ))}
    </div>
  );
}

export default function SurveyRespond() {
  const { token } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [respondentName, setRespondentName] = useState("");
  const [respondentPhone, setRespondentPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/surveys/respond/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setSurvey(d.data.survey);
        else setError(d.message || "Survey not found");
      })
      .catch(() => setError("Failed to load survey"))
      .finally(() => setLoading(false));
  }, [token]);

  const setAnswer = (qId, val) => setAnswers(a => ({ ...a, [qId]: val }));

  const submit = () => {
    if (!survey) return;

    // Validate required questions
    const missing = survey.questions.filter(q => q.required && (answers[q._id] === undefined || answers[q._id] === "" || answers[q._id] === null));
    if (missing.length > 0) { setError(`Please answer all required questions (marked *)`); return; }

    setSubmitting(true); setError("");
    const payload = {
      respondentName: respondentName.trim() || "Anonymous",
      respondentPhone: respondentPhone.trim(),
      answers: survey.questions.map(q => ({ questionId: q._id, answer: answers[q._id] ?? "" })),
    };

    fetch(`${API_BASE_URL}/api/surveys/respond/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setSubmitted(true);
        else setError(d.message || "Submission failed");
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setSubmitting(false));
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#2563eb" }} />
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "48px 40px", maxWidth: "460px", width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <CheckCircle size={36} color="#16a34a" />
        </div>
        <h2 style={{ margin: "0 0 10px", fontWeight: "900", fontSize: "24px", color: "#0f172a" }}>Thank You!</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px", lineHeight: 1.6 }}>
          Your response has been recorded. Your feedback helps improve services for the community.
        </p>
        <Link to="/" style={{ display: "inline-block", padding: "10px 24px", background: "#2563eb", color: "#fff", borderRadius: "8px", fontWeight: "700", textDecoration: "none", fontSize: "14px" }}>
          Back to Home
        </Link>
      </div>
    </div>
  );

  if (error && !survey) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "40px", maxWidth: "420px", textAlign: "center" }}>
        <AlertTriangle size={40} color="#f59e0b" style={{ marginBottom: "16px" }} />
        <h2 style={{ margin: "0 0 8px", fontWeight: "800", color: "#0f172a" }}>Survey Unavailable</h2>
        <p style={{ color: "#64748b", margin: "0 0 20px" }}>{error}</p>
        <Link to="/" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>← Back to Home</Link>
      </div>
    </div>
  );

  const inp = { padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "9px", fontSize: "14px", width: "100%", boxSizing: "border-box", fontFamily: "inherit", outline: "none" };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", color: "#fff", padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#93c5fd", display: "flex", alignItems: "center", gap: "5px" }}>
            <CheckCircle size={12} /> {survey?.ngoId?.ngoName}
          </p>
          <h1 style={{ margin: "0 0 8px", fontWeight: "900", fontSize: "clamp(22px, 4vw, 32px)" }}>{survey?.title}</h1>
          {survey?.description && <p style={{ margin: 0, color: "#93c5fd", lineHeight: 1.6 }}>{survey.description}</p>}
          {survey?.targetAudience && <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#60a5fa" }}>For: {survey.targetAudience}</p>}
        </div>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "28px 16px 60px" }}>
        {/* Respondent info */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 14px", fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>Your Information (optional)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <input style={inp} value={respondentName} onChange={e => setRespondentName(e.target.value)} placeholder="Your name" />
            <input style={inp} value={respondentPhone} onChange={e => setRespondentPhone(e.target.value)} placeholder="Phone number" />
          </div>
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
          {survey?.questions?.map((q, i) => (
            <div key={q._id} style={{ background: "#fff", borderRadius: "14px", padding: "20px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 14px", fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>
                {i + 1}. {q.question}
                {q.required && <span style={{ color: "#dc2626", marginLeft: "4px" }}>*</span>}
              </p>

              {q.type === "text" && (
                <textarea rows={3} style={{ ...inp, resize: "vertical" }} value={answers[q._id] || ""}
                  onChange={e => setAnswer(q._id, e.target.value)} placeholder="Your answer…" />
              )}
              {q.type === "multiple_choice" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {q.options?.map(opt => (
                    <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "10px 14px", borderRadius: "9px", border: `2px solid ${answers[q._id] === opt ? "#2563eb" : "#e2e8f0"}`, background: answers[q._id] === opt ? "#eff6ff" : "#fff" }}>
                      <input type="radio" name={q._id} value={opt} checked={answers[q._id] === opt} onChange={() => setAnswer(q._id, opt)} style={{ accentColor: "#2563eb" }} />
                      <span style={{ fontSize: "14px", color: answers[q._id] === opt ? "#1d4ed8" : "#374151", fontWeight: answers[q._id] === opt ? "600" : "400" }}>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type === "rating" && (
                <StarRating value={answers[q._id] || 0} onChange={v => setAnswer(q._id, v)} />
              )}
              {q.type === "yes_no" && (
                <div style={{ display: "flex", gap: "10px" }}>
                  {["yes","no"].map(v => (
                    <button key={v} type="button" onClick={() => setAnswer(q._id, v)}
                      style={{ flex: 1, padding: "12px", borderRadius: "9px", border: `2px solid ${answers[q._id] === v ? (v === "yes" ? "#16a34a" : "#dc2626") : "#e2e8f0"}`, background: answers[q._id] === v ? (v === "yes" ? "#dcfce7" : "#fee2e2") : "#fff", color: answers[q._id] === v ? (v === "yes" ? "#166534" : "#991b1b") : "#374151", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
                      {v === "yes" ? "✅ Yes" : "❌ No"}
                    </button>
                  ))}
                </div>
              )}
              {q.type === "scale" && (
                <ScaleInput min={q.scaleMin || 1} max={q.scaleMax || 10} value={answers[q._id]} onChange={v => setAnswer(q._id, v)} />
              )}
            </div>
          ))}
        </div>

        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "9px", marginBottom: "16px", fontSize: "13px" }}>{error}</div>}

        <button onClick={submit} disabled={submitting}
          style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "none", background: submitting ? "#93c5fd" : "#2563eb", color: "#fff", fontWeight: "800", fontSize: "16px", cursor: submitting ? "not-allowed" : "pointer" }}>
          {submitting ? "Submitting…" : "Submit Response"}
        </button>
      </div>
    </div>
  );
}
