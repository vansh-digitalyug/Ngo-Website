import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, Users, Star, CheckCircle, Clock, AlertCircle,
  Droplets, Zap, Trash2, Route, ArrowLeft, Flag, Loader2,
  TrendingUp, ChevronDown, ChevronUp, ThumbsUp
} from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const fmtINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const NEED_ICONS = { water: Droplets, electricity: Zap, sanitation: Trash2, roads: Route };
const NEED_LABELS = { water: "Water Supply", electricity: "Electricity", sanitation: "Sanitation", roads: "Roads" };
const NEED_COLORS = { water: "#0ea5e9", electricity: "#eab308", sanitation: "#10b981", roads: "#8b5cf6" };

const PROB_CATEGORIES = ["all", "water", "sanitation", "education", "health", "road", "employment", "electricity", "other"];
const PRIORITY_COLORS = { low: "#64748b", medium: "#d97706", high: "#ea580c", critical: "#dc2626" };
const STATUS_ICONS = { pending: Clock, in_progress: TrendingUp, solved: CheckCircle };
const STATUS_COLORS = { pending: "#d97706", in_progress: "#2563eb", solved: "#16a34a" };

// ── Problem submission form ────────────────────────────────────────────────────
function ProblemForm({ villageId, onSubmitted }) {
  const [form, setForm] = useState({ title: "", description: "", category: "water", priority: "medium" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState("");
  const token = localStorage.getItem("token");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setErr("Title required"); return; }
    setSubmitting(true); setErr("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/villages/${villageId}/problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      setSuccess(true);
      setForm({ title: "", description: "", category: "water", priority: "medium" });
      onSubmitted();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inp = { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", marginTop: "20px" }}>
      <h4 style={{ margin: "0 0 14px", fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>Report a Problem</h4>
      <form onSubmit={submit} style={{ display: "grid", gap: "10px" }}>
        <input value={form.title} onChange={e => set("title", e.target.value)} style={inp} placeholder="Problem title *" required />
        <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} placeholder="Describe the problem in detail..." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <select value={form.category} onChange={e => set("category", e.target.value)} style={inp}>
            {["water", "sanitation", "education", "health", "road", "employment", "electricity", "other"].map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <select value={form.priority} onChange={e => set("priority", e.target.value)} style={inp}>
            {["low", "medium", "high", "critical"].map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</option>
            ))}
          </select>
        </div>
        {err && <div style={{ padding: "8px 12px", background: "#fef2f2", borderRadius: "7px", color: "#dc2626", fontSize: "13px" }}>{err}</div>}
        {success && <div style={{ padding: "8px 12px", background: "#f0fdf4", borderRadius: "7px", color: "#16a34a", fontSize: "13px", fontWeight: "600" }}>✓ Problem submitted successfully!</div>}
        <button type="submit" disabled={submitting} style={{ padding: "10px", background: submitting ? "#94a3b8" : "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          {submitting ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Submitting…</> : "Submit Problem"}
        </button>
      </form>
    </div>
  );
}

export default function VillageDetail() {
  const { id } = useParams();
  const [village, setVillage] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [probLoading, setProbLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [milestonesOpen, setMilestonesOpen] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/villages/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setVillage(d.data.village); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const loadProblems = () => {
    setProbLoading(true);
    const params = new URLSearchParams({ limit: 30 });
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (catFilter !== "all") params.set("category", catFilter);

    fetch(`${API_BASE_URL}/api/villages/${id}/problems?${params}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProblems(d.data.problems); })
      .catch(() => {})
      .finally(() => setProbLoading(false));
  };

  useEffect(() => { if (activeTab === "problems") loadProblems(); }, [activeTab, catFilter, statusFilter]);

  const handleUpvote = async (problemId) => {
    if (!token) { alert("Please login to upvote"); return; }
    try {
      await fetch(`${API_BASE_URL}/api/villages/problems/${problemId}/upvote`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      loadProblems();
    } catch {}
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", gap: "10px", color: "#64748b" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /> Loading village...
        <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (!village) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ color: "#94a3b8" }}>Village not found.</p>
        <Link to="/villages" style={{ color: "#2563eb" }}>← Back to villages</Link>
      </div>
    );
  }

  const TABS = ["overview", "problems", "impact"];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e40af 100%)", color: "#fff", padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Link to="/villages" style={{ color: "#93c5fd", fontSize: "13px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "16px" }}>
            <ArrowLeft size={14} /> All Villages
          </Link>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "900" }}>{village.villageName}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#93c5fd", fontSize: "14px", marginBottom: "8px" }}>
            <MapPin size={14} /> {village.district}, {village.state} {village.pincode && `· ${village.pincode}`}
          </div>
          {village.ngoId?.ngoName && (
            <div style={{ fontSize: "13px", color: "#bfdbfe" }}>Adopted by: <strong>{village.ngoId.ngoName}</strong></div>
          )}

          {/* Quick stats */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "16px" }}>
            <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "5px", color: "#e2e8f0" }}>
              <Users size={13} /> {village.totalFamilies || 0} Families
            </span>
            <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "5px", color: "#e2e8f0" }}>
              <Star size={13} /> {village.milestones?.length || 0} Milestones
            </span>
            {village.problemStats && (
              <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "5px", color: "#e2e8f0" }}>
                <CheckCircle size={13} /> {village.problemStats.solved || 0} Problems Solved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", gap: "0" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: activeTab === tab ? "#2563eb" : "#64748b", borderBottom: `2px solid ${activeTab === tab ? "#2563eb" : "transparent"}`, textTransform: "capitalize", transition: "all 0.15s" }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gap: "20px" }}>
            {village.description && (
              <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
                <h3 style={{ margin: "0 0 10px", fontWeight: "700", color: "#0f172a" }}>About this Village</h3>
                <p style={{ margin: 0, color: "#374151", lineHeight: 1.7, fontSize: "14px" }}>{village.description}</p>
              </div>
            )}

            {/* Basic needs */}
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
              <h3 style={{ margin: "0 0 16px", fontWeight: "700", color: "#0f172a" }}>Basic Services Coverage</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "14px" }}>
                {["water", "electricity", "sanitation", "roads"].map(need => {
                  const Icon = NEED_ICONS[need];
                  const color = NEED_COLORS[need];
                  const data = village.basicNeeds?.[need] || {};
                  const pct = data.coveragePercent || 0;
                  return (
                    <div key={need} style={{ padding: "14px", background: `${color}0d`, borderRadius: "10px", border: `1px solid ${color}30` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
                        <Icon size={16} color={color} />
                        <span style={{ fontSize: "13px", fontWeight: "600", color }}>{NEED_LABELS[need]}</span>
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: "800", color, marginBottom: "6px" }}>{pct}%</div>
                      <div style={{ height: "6px", background: `${color}30`, borderRadius: "3px" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "3px", transition: "width 0.8s" }} />
                      </div>
                      <div style={{ fontSize: "10px", color, marginTop: "4px", fontWeight: "600", textTransform: "uppercase" }}>
                        {data.status?.replace("_", " ") || "Not started"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Problem stats */}
            {village.problemStats && (
              <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ margin: 0, fontWeight: "700", color: "#0f172a" }}>Community Issues</h3>
                  <button onClick={() => setActiveTab("problems")} style={{ fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>View all →</button>
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {[
                    { label: "Pending", value: village.problemStats.pending, bg: "#fef9c3", color: "#854d0e" },
                    { label: "In Progress", value: village.problemStats.in_progress, bg: "#dbeafe", color: "#1e40af" },
                    { label: "Solved", value: village.problemStats.solved, bg: "#dcfce7", color: "#166534" },
                  ].map(({ label, value, bg, color }) => (
                    <div key={label} style={{ flex: 1, minWidth: "80px", padding: "12px", background: bg, borderRadius: "10px", textAlign: "center" }}>
                      <div style={{ fontSize: "24px", fontWeight: "800", color }}>{value || 0}</div>
                      <div style={{ fontSize: "11px", color, fontWeight: "600" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones */}
            {village.milestones?.length > 0 && (
              <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
                <button onClick={() => setMilestonesOpen(o => !o)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 0 }}>
                  <h3 style={{ margin: 0, fontWeight: "700", color: "#0f172a" }}>Milestones Achieved ({village.milestones.length})</h3>
                  {milestonesOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                </button>
                {milestonesOpen && (
                  <div style={{ marginTop: "14px", position: "relative" }}>
                    <div style={{ position: "absolute", left: "7px", top: 0, bottom: 0, width: "2px", background: "#e2e8f0" }} />
                    {village.milestones.map((m, i) => (
                      <div key={m._id || i} style={{ display: "flex", gap: "14px", marginBottom: "14px", position: "relative" }}>
                        <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#6366f1", flexShrink: 0, marginTop: "2px", position: "relative", zIndex: 1 }} />
                        <div>
                          <p style={{ margin: "0 0 3px", fontWeight: "700", fontSize: "14px", color: "#0f172a" }}>{m.title}</p>
                          {m.description && <p style={{ margin: "0 0 3px", fontSize: "12px", color: "#64748b" }}>{m.description}</p>}
                          <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{fmtDate(m.achievedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PROBLEMS TAB */}
        {activeTab === "problems" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <h3 style={{ margin: 0, fontWeight: "700", color: "#0f172a" }}>Community Problems</h3>
              <button onClick={() => setShowForm(f => !f)} style={{ padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                {showForm ? "Cancel" : "+ Report Problem"}
              </button>
            </div>

            {showForm && <ProblemForm villageId={id} onSubmitted={() => { loadProblems(); setShowForm(false); }} />}

            {/* Filters */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap", marginTop: "14px" }}>
              {["all", "pending", "in_progress", "solved"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{ padding: "5px 12px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: "600",
                    background: statusFilter === s ? STATUS_COLORS[s] || "#2563eb" : "#fff",
                    color: statusFilter === s ? "#fff" : "#374151",
                    borderColor: statusFilter === s ? (STATUS_COLORS[s] || "#2563eb") : "#e2e8f0",
                  }}>
                  {s === "all" ? "All" : s.replace("_", " ")}
                </button>
              ))}
            </div>

            {probLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "40px", gap: "8px", color: "#64748b" }}>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Loading...
              </div>
            ) : problems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No problems found.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {problems.map(p => {
                  const SIcon = STATUS_ICONS[p.status] || AlertCircle;
                  const sColor = STATUS_COLORS[p.status] || "#64748b";
                  return (
                    <div key={p._id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: `4px solid ${PRIORITY_COLORS[p.priority] || "#64748b"}`, borderRadius: "10px", padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                            <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>{p.title}</span>
                            <span style={{ padding: "2px 7px", borderRadius: "5px", fontSize: "10px", fontWeight: "700", background: PRIORITY_COLORS[p.priority] + "18", color: PRIORITY_COLORS[p.priority] }}>
                              {p.priority?.toUpperCase()}
                            </span>
                          </div>
                          {p.description && <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>{p.description}</p>}
                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", fontSize: "11px", color: "#94a3b8" }}>
                            <span style={{ background: "#f1f5f9", padding: "2px 7px", borderRadius: "4px", fontWeight: "600", textTransform: "capitalize" }}>{p.category}</span>
                            <span>By {p.submittedByName || "Anonymous"}</span>
                            <span>{fmtDate(p.createdAt)}</span>
                            {p.resolvedAt && <span style={{ color: "#16a34a" }}>Resolved {fmtDate(p.resolvedAt)}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "20px", background: `${sColor}15`, color: sColor, fontSize: "11px", fontWeight: "700" }}>
                            <SIcon size={10} /> {p.status.replace("_", " ")}
                          </span>
                          <button onClick={() => handleUpvote(p._id)} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
                            <ThumbsUp size={11} /> {p.upvotes?.length || 0}
                          </button>
                        </div>
                      </div>
                      {p.resolvedNote && (
                        <div style={{ marginTop: "8px", padding: "8px 10px", background: "#f0fdf4", borderRadius: "7px", fontSize: "12px", color: "#166534" }}>
                          ✓ Resolution: {p.resolvedNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* IMPACT TAB */}
        {activeTab === "impact" && (
          <div style={{ display: "grid", gap: "16px" }}>
            {village.fundSummary && (
              <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px", fontWeight: "700", color: "#0f172a" }}>Fund Utilization for this Village</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  {[
                    { label: "Total Received", value: fmtINR(village.fundSummary.credit), color: "#16a34a", bg: "#f0fdf4" },
                    { label: "Total Spent", value: fmtINR(village.fundSummary.debit), color: "#dc2626", bg: "#fef2f2" },
                    { label: "Balance", value: fmtINR(village.fundSummary.credit - village.fundSummary.debit), color: "#2563eb", bg: "#eff6ff" },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} style={{ padding: "14px", background: bg, borderRadius: "10px", textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: "800", color }}>{value}</div>
                      <div style={{ fontSize: "11px", color, fontWeight: "600", marginTop: "3px" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px" }}>
              <h3 style={{ margin: "0 0 12px", fontWeight: "700", color: "#0f172a" }}>Key Achievements</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f0fdf4", borderRadius: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Families Covered</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#16a34a" }}>{village.totalFamilies || 0}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#eff6ff", borderRadius: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Milestones Achieved</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#2563eb" }}>{village.milestones?.length || 0}</span>
                </div>
                {village.problemStats && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#faf5ff", borderRadius: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Problems Resolved</span>
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#7c3aed" }}>{village.problemStats.solved || 0}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
