import { useState, useEffect, useRef } from "react";
import { ClipboardList, Plus, Edit2, Trash2, Loader2, X, ChevronDown, Link2, Copy, BarChart2, Users, CheckCircle, Clock, FileText, Star, ToggleLeft, ImageIcon } from "lucide-react";
import { API_BASE_URL } from "./NgoLayout.jsx";

const STATUS_META = {
  draft:  { label: "Draft",  bg: "#f1f5f9", color: "#475569", Icon: FileText },
  active: { label: "Active", bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
  closed: { label: "Closed", bg: "#fef9c3", color: "#854d0e", Icon: Clock },
};

const Q_TYPES = [
  { value: "text",            label: "Text Answer",      icon: "📝" },
  { value: "multiple_choice", label: "Multiple Choice",  icon: "☑️" },
  { value: "rating",          label: "Rating (1–5 ⭐)",  icon: "⭐" },
  { value: "yes_no",          label: "Yes / No",         icon: "✅" },
  { value: "scale",           label: "Number Scale",     icon: "📊" },
];

const CAT_COLORS = { beneficiaries:"#16a34a", health:"#dc2626", education:"#2563eb", employment:"#d97706", infrastructure:"#7c3aed", environment:"#0891b2", other:"#64748b" };

// ── Mini chart components ─────────────────────────────────────────────────

function BarResult({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {data.map(({ label, count }) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
            <span style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>{label}</span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>{count}</span>
          </div>
          <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px" }}>
            <div style={{ height: "100%", width: `${(count / max) * 100}%`, background: "#2563eb", borderRadius: "4px", transition: "width 0.6s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RatingResult({ dist, avg, total }) {
  const max = Math.max(...dist.map(d => d.count), 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "10px" }}>
        <span style={{ fontSize: "28px", fontWeight: "900", color: "#d97706" }}>{avg}</span>
        <span style={{ fontSize: "13px", color: "#64748b" }}>/ 5 avg · {total} responses</span>
      </div>
      <div style={{ display: "flex", gap: "6px", alignItems: "flex-end", height: "50px" }}>
        {dist.map(({ value, count }) => (
          <div key={value} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <div style={{ width: "100%", background: "#fef3c7", borderRadius: "3px 3px 0 0", height: `${max > 0 ? (count / max) * 40 : 0}px`, minHeight: "2px" }} />
            <span style={{ fontSize: "10px", color: "#64748b" }}>{"⭐".repeat(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function YesNoResult({ yes, no, total }) {
  const yesPct = total > 0 ? Math.round((yes / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", gap: "16px", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>Yes: {yes} ({yesPct}%)</span>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626" }}>No: {no} ({100 - yesPct}%)</span>
      </div>
      <div style={{ height: "12px", background: "#fef2f2", borderRadius: "6px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${yesPct}%`, background: "#16a34a", borderRadius: "6px 0 0 6px" }} />
      </div>
    </div>
  );
}

function ResultsPanel({ surveyId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/surveys/${surveyId}/results`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [surveyId]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
      <div style={{ background: "#f8fafc", borderRadius: "18px", width: "100%", maxWidth: "680px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#fff", padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: "0 0 2px", fontWeight: "800", fontSize: "18px", color: "#0f172a" }}>Survey Results</h2>
            {data && <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{data.totalResponses} responses</p>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
        </div>
        <div style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px", gap: "10px", color: "#64748b" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Loading results…
            </div>
          ) : !data ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>No data available.</p>
          ) : data.results.map((r, i) => (
            <div key={r.questionId} style={{ background: "#fff", borderRadius: "12px", padding: "18px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "0 0 14px", fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>
                Q{i + 1}. {r.question}
                <span style={{ marginLeft: "8px", fontSize: "11px", fontWeight: "500", color: "#94a3b8" }}>({r.count} answered)</span>
              </p>
              {r.aggregated.type === "bar"    && <BarResult data={r.aggregated.data} />}
              {r.aggregated.type === "rating" && <RatingResult {...r.aggregated} />}
              {r.aggregated.type === "pie"    && <YesNoResult {...r.aggregated} />}
              {r.aggregated.type === "scale"  && <p style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>{r.aggregated.avg} <span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>/ {r.aggregated.max} avg</span></p>}
              {r.aggregated.type === "text"   && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {r.aggregated.answers.length === 0
                    ? <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No responses yet.</p>
                    : r.aggregated.answers.map((a, j) => (
                      <div key={j} style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "7px", fontSize: "13px", color: "#374151", borderLeft: "3px solid #e2e8f0" }}>{a}</div>
                    ))
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Question Builder ──────────────────────────────────────────────────────

function QuestionEditor({ q, idx, onChange, onDelete }) {
  const inp = { padding: "8px 11px", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "13px", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };

  const addOption = () => onChange(idx, { ...q, options: [...(q.options || []), ""] });
  const setOption = (oi, val) => onChange(idx, { ...q, options: q.options.map((o, j) => j === oi ? val : o) });
  const removeOption = (oi) => onChange(idx, { ...q, options: q.options.filter((_, j) => j !== oi) });

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", fontWeight: "800", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{idx + 1}</div>
        <div style={{ flex: 1 }}>
          <input style={inp} value={q.question} onChange={e => onChange(idx, { ...q, question: e.target.value })} placeholder="Enter your question…" />
        </div>
        <button onClick={() => onDelete(idx)} style={{ background: "#fef2f2", border: "none", color: "#dc2626", borderRadius: "6px", padding: "6px 8px", cursor: "pointer", flexShrink: 0 }}><X size={14} /></button>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
        <div style={{ position: "relative" }}>
          <select value={q.type} onChange={e => onChange(idx, { ...q, type: e.target.value, options: [] })}
            style={{ ...inp, width: "auto", appearance: "none", paddingRight: "26px", cursor: "pointer" }}>
            {Q_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "600", color: "#374151", cursor: "pointer" }}>
          <input type="checkbox" checked={q.required} onChange={e => onChange(idx, { ...q, required: e.target.checked })} />
          Required
        </label>
      </div>

      {q.type === "multiple_choice" && (
        <div style={{ marginLeft: "34px" }}>
          {(q.options || []).map((o, oi) => (
            <div key={oi} style={{ display: "flex", gap: "6px", marginBottom: "5px" }}>
              <input style={inp} value={o} onChange={e => setOption(oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
              <button onClick={() => removeOption(oi)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "0 4px" }}><X size={13} /></button>
            </div>
          ))}
          <button onClick={addOption} style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "1px dashed #bfdbfe", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", marginTop: "2px" }}>+ Add option</button>
        </div>
      )}
      {q.type === "scale" && (
        <div style={{ display: "flex", gap: "10px", marginLeft: "34px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#64748b" }}>Min</label>
            <input type="number" style={{ ...inp, width: "70px" }} value={q.scaleMin || 1} onChange={e => onChange(idx, { ...q, scaleMin: Number(e.target.value) })} />
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "#64748b" }}>Max</label>
            <input type="number" style={{ ...inp, width: "70px" }} value={q.scaleMax || 10} onChange={e => onChange(idx, { ...q, scaleMax: Number(e.target.value) })} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── S3 Cover Image display helper ─────────────────────────────────────────

function CoverImg({ imgKey, height = "auto" }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!imgKey) { setLoading(false); return; }
    fetch(`${API_BASE_URL}/api/s3/get-url?key=${encodeURIComponent(imgKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.data?.Url) setUrl(d.data.Url); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [imgKey]);

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive height logic
  let responsiveHeight = 280;
  if (windowWidth <= 480) {
    responsiveHeight = 180;
  } else if (windowWidth <= 768) {
    responsiveHeight = 220;
  } else if (windowWidth <= 1024) {
    responsiveHeight = 250;
  }

  const heightValue = height === "auto" ? `${responsiveHeight}px` : `${height}px`;

  return (
    <div style={{ 
      width: "100%", 
      height: heightValue, 
      position: "relative", 
      background: "#e2e8f0",
      transition: "height 0.3s ease"
    }}>
      {/* shimmer */}
      {loading && !url && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg,#e2e8f0 0%,#f1f5f9 50%,#e2e8f0 100%)",
          backgroundSize: "400% 100%",
          animation: "coverShimmer 1.4s ease infinite",
        }} />
      )}
      {/* background-image approach — maintains aspect ratio, shows full image */}
      {url && (
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${url})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#f8fafc"
        }} />
      )}
    </div>
  );
}

// ── Survey Form Modal ─────────────────────────────────────────────────────

function SurveyModal({ survey, villages, onClose, onSaved }) {
  const [form, setForm] = useState(survey ? {
    title: survey.title || "", description: survey.description || "",
    status: survey.status || "draft", targetAudience: survey.targetAudience || "",
    startDate: survey.startDate ? new Date(survey.startDate).toISOString().slice(0,10) : "",
    endDate: survey.endDate ? new Date(survey.endDate).toISOString().slice(0,10) : "",
    villageId: survey.villageId?._id || survey.villageId || "",
    isPublic: survey.isPublic !== false,
    questions: survey.questions || [],
    coverImageKey: survey.coverImageKey || "",
  } : { title: "", description: "", status: "draft", targetAudience: "", startDate: "", endDate: "", villageId: "", isPublic: true, questions: [], coverImageKey: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const coverInputRef = useRef(null);
  const token = localStorage.getItem("token");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const uploadCover = async (file) => {
    if (!file.type.startsWith("image/")) { setError("Only image files allowed for cover"); return; }
    setCoverUploading(true);
    setCoverPreview(URL.createObjectURL(file));
    try {
      const urlRes = await fetch(`${API_BASE_URL}/api/s3/generate-upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fileType: file.type, fileName: file.name, location: "surveys" }),
      });
      const { uploadUrl, key } = (await urlRes.json()).data;
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      set("coverImageKey", key);
    } catch { setError("Cover image upload failed. Please try again."); setCoverPreview(null); }
    finally { setCoverUploading(false); }
  };

  const addQuestion = () => set("questions", [...form.questions, { type: "text", question: "", required: false, options: [], scaleMin: 1, scaleMax: 10 }]);
  const updateQ = (idx, q) => set("questions", form.questions.map((o, i) => i === idx ? q : o));
  const deleteQ = (idx) => set("questions", form.questions.filter((_, i) => i !== idx));

  const save = () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    const url = survey ? `${API_BASE_URL}/api/surveys/${survey._id}` : `${API_BASE_URL}/api/surveys`;
    fetch(url, {
      method: survey ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, villageId: form.villageId || null }),
    })
      .then(r => r.json())
      .then(d => { if (d.success) { onSaved(d.data.survey); onClose(); } else setError(d.message || "Failed"); })
      .catch(() => setError("Network error"))
      .finally(() => setSaving(false));
  };

  const inp = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 1000, padding: "20px", overflowY: "auto" }}>
      <div style={{ background: "#f8fafc", borderRadius: "18px", width: "100%", maxWidth: "680px", marginBottom: "20px" }}>
        {/* Header */}
        <div style={{ background: "#fff", borderRadius: "18px 18px 0 0", padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontWeight: "800", fontSize: "18px", color: "#0f172a" }}>{survey ? "Edit Survey" : "Build a Survey"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>{error}</div>}

          {/* Basic info */}
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {/* Cover image area */}
            <div style={{ position: "relative", background: "#f1f5f9", minHeight: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }} />
              ) : form.coverImageKey ? (
                <CoverImg imgKey={form.coverImageKey} height={160} />
              ) : (
                <div style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>
                  <ImageIcon size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: "13px" }}>No cover image</p>
                </div>
              )}
              <div style={{ position: "absolute", bottom: "10px", right: "10px", display: "flex", gap: "6px" }}>
                <button type="button" onClick={() => coverInputRef.current?.click()} disabled={coverUploading}
                  style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", border: "none", background: "rgba(255,255,255,0.92)", fontWeight: "700", fontSize: "12px", cursor: coverUploading ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", color: "#374151" }}>
                  {coverUploading ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Uploading…</> : <><ImageIcon size={12} /> {form.coverImageKey || coverPreview ? "Change Cover" : "Add Cover"}</>}
                </button>
                {(form.coverImageKey || coverPreview) && (
                  <button type="button" onClick={() => { set("coverImageKey", ""); setCoverPreview(null); }}
                    style={{ padding: "7px 8px", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.9)", color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                    <X size={12} />
                  </button>
                )}
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) uploadCover(e.target.files[0]); e.target.value = ""; }} />
            </div>

            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>Survey Details</h3>
            <input style={inp} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Survey title *" />
            <textarea rows={2} style={{ ...inp, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description of this survey's purpose…" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ position: "relative" }}>
                <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...inp, appearance: "none", paddingRight: "26px", cursor: "pointer" }}>
                  <option value="draft">Draft</option>
                  <option value="active">Active (accepting responses)</option>
                  <option value="closed">Closed</option>
                </select>
                <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
              </div>
              <div style={{ position: "relative" }}>
                <select value={form.villageId} onChange={e => set("villageId", e.target.value)} style={{ ...inp, appearance: "none", paddingRight: "26px", cursor: "pointer" }}>
                  <option value="">No village</option>
                  {villages.map(v => <option key={v._id} value={v._id}>{v.villageName}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
              </div>
              <input style={inp} type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} placeholder="Start date" />
              <input style={inp} type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} placeholder="End date" />
            </div>
            <input style={inp} value={form.targetAudience} onChange={e => set("targetAudience", e.target.value)} placeholder="Target audience (e.g. Village women, Farmers)" />
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>Questions ({form.questions.length})</h3>
              <button onClick={addQuestion}
                style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", border: "1px dashed #2563eb", background: "#eff6ff", color: "#2563eb", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>
                <Plus size={13} /> Add Question
              </button>
            </div>
            {form.questions.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px", background: "#fff", borderRadius: "12px", border: "1px dashed #e2e8f0", color: "#94a3b8", fontSize: "13px" }}>
                Click "Add Question" to start building your survey.
              </div>
            )}
            {form.questions.map((q, i) => (
              <QuestionEditor key={i} q={q} idx={i} onChange={updateQ} onDelete={deleteQ} />
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
            <button onClick={save} disabled={saving}
              style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : survey ? "Save Changes" : "Create Survey"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function NgoSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [resultsId, setResultsId] = useState(null);
  const [copied, setCopied] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/surveys/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/villages/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([s, v]) => {
      if (s.success) setSurveys(s.data.surveys);
      if (v.success) setVillages(v.data.villages);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const onSaved = (sv) => setSurveys(ss => {
    const idx = ss.findIndex(s => s._id === sv._id);
    if (idx >= 0) { const n = [...ss]; n[idx] = sv; return n; }
    return [sv, ...ss];
  });

  const deleteSurvey = (id) => {
    if (!confirm("Delete this survey and all its responses?")) return;
    fetch(`${API_BASE_URL}/api/surveys/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.success) setSurveys(ss => ss.filter(s => s._id !== id)); }).catch(() => {});
  };

  const copyLink = (token) => {
    const url = `${window.location.origin}/survey/${token}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(token); setTimeout(() => setCopied(null), 2000); });
  };

  return (
    <div style={{ padding: "24px 20px", fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 2px", fontWeight: "800", fontSize: "28px", color: "#0f172a" }}>Surveys</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Collect community feedback with shareable surveys</p>
        </div>
        <button onClick={() => setModal("create")}
          style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer", boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)", transition: "all 0.2s ease" }}
          onMouseEnter={(e) => e.target.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)"}
          onMouseLeave={(e) => e.target.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.3)"}>
          <Plus size={16} /> Build Survey
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px", gap: "10px", color: "#64748b" }}>
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /> Loading…
        </div>
      ) : surveys.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "14px", border: "1px dashed #e2e8f0", maxWidth: "500px", margin: "0 auto" }}>
          <ClipboardList size={48} style={{ color: "#cbd5e1", marginBottom: "14px" }} />
          <h3 style={{ margin: "0 0 8px", fontWeight: "700", color: "#0f172a", fontSize: "16px" }}>No surveys yet</h3>
          <p style={{ color: "#64748b", margin: "0 0 22px", fontSize: "13px" }}>Build surveys to collect feedback from communities you serve.</p>
          <button onClick={() => setModal("create")}
            style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "14px", boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)", transition: "all 0.2s ease" }}
            onMouseEnter={(e) => e.target.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)"}
            onMouseLeave={(e) => e.target.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.3)"}>
            Create First Survey
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px", gridAutoRows: "auto" }}>
          {surveys.map(sv => {
            const sm = STATUS_META[sv.status] || STATUS_META.draft;
            return (
              <div key={sv._id} style={{ 
                background: "#fff", 
                border: "1px solid #e2e8f0", 
                borderRadius: "12px", 
                overflow: "hidden", 
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)", 
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                e.currentTarget.style.transform = "translateY(0)";
              }}>
                {/* Cover Image */}
                {sv.coverImageKey && <CoverImg imgKey={sv.coverImageKey} height={200} />}
                
                {/* Card Content */}
                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                  {/* Title and Status */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <h3 style={{ margin: 0, fontWeight: "800", fontSize: "14px", color: "#0f172a", lineHeight: "1.3", flex: 1, wordBreak: "break-word" }}>{sv.title}</h3>
                    <span style={{ background: sm.bg, color: sm.color, padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: "700", display: "flex", alignItems: "center", gap: "1px", whiteSpace: "nowrap", flexShrink: 0 }}>
                      <sm.Icon size={8} /> {sm.label}
                    </span>
                  </div>

                  {/* Description - max 2 lines */}
                  {sv.description && (
                    <p style={{ 
                      margin: 0, 
                      fontSize: "11px", 
                      color: "#64748b", 
                      lineHeight: "1.4",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {sv.description}
                    </p>
                  )}

                  {/* Divider */}
                  <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0" }} />

                  {/* Stats in compact row */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "10px", color: "#64748b" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "1px" }}>
                      <ClipboardList size={9} /> {sv.questions?.length || 0}
                    </span>
                    <span style={{ width: "1px", height: "12px", background: "#e2e8f0" }} />
                    <span style={{ display: "flex", alignItems: "center", gap: "1px" }}>
                      <Users size={9} /> {sv.responseCount || 0}
                    </span>
                    {sv.villageId && (
                      <>
                        <span style={{ width: "1px", height: "12px", background: "#e2e8f0" }} />
                        <span style={{ color: "#6366f1", fontWeight: "600", fontSize: "9px" }}>
                          📍 {sv.villageId.villageName?.substring(0, 12)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", marginTop: "4px" }}>
                    {/* Top row */}
                    <button onClick={() => copyLink(sv.shareToken)}
                      title="Share survey link"
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: "2px", 
                        padding: "5px 8px", 
                        borderRadius: "5px", 
                        border: "1px solid #e2e8f0", 
                        background: copied === sv.shareToken ? "#dcfce7" : "#f8fafc", 
                        fontSize: "10px", 
                        fontWeight: "600", 
                        cursor: "pointer", 
                        color: copied === sv.shareToken ? "#166534" : "#374151", 
                        transition: "all 0.2s ease"
                      }}>
                      {copied === sv.shareToken ? <CheckCircle size={10} /> : <Copy size={10} />}
                    </button>
                    <button onClick={() => setResultsId(sv._id)}
                      title="View results"
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: "2px", 
                        padding: "5px 8px", 
                        borderRadius: "5px", 
                        border: "1px solid #dcfce7", 
                        background: "#f0fdf4", 
                        color: "#166534", 
                        fontSize: "10px", 
                        fontWeight: "600", 
                        cursor: "pointer", 
                        transition: "all 0.2s ease"
                      }}>
                      <BarChart2 size={10} />
                    </button>
                    {/* Bottom row */}
                    <button onClick={() => setModal(sv)}
                      title="Edit survey"
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: "2px", 
                        padding: "5px 8px", 
                        borderRadius: "5px", 
                        border: "1px solid #bfdbfe", 
                        background: "#eff6ff", 
                        color: "#2563eb", 
                        fontSize: "10px", 
                        fontWeight: "600", 
                        cursor: "pointer", 
                        transition: "all 0.2s ease"
                      }}>
                      <Edit2 size={10} />
                    </button>
                    <button onClick={() => deleteSurvey(sv._id)}
                      title="Delete survey"
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: "2px", 
                        padding: "5px 8px", 
                        borderRadius: "5px", 
                        border: "1px solid #fecaca", 
                        background: "#fef2f2", 
                        color: "#dc2626", 
                        fontSize: "10px", 
                        fontWeight: "600", 
                        cursor: "pointer", 
                        transition: "all 0.2s ease"
                      }}>
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && <SurveyModal survey={modal === "create" ? null : modal} villages={villages} onClose={() => setModal(null)} onSaved={onSaved} />}
      {resultsId && <ResultsPanel surveyId={resultsId} onClose={() => setResultsId(null)} />}
      <style>{`
  @keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
  @keyframes coverShimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
`}</style>
    </div>
  );
}
