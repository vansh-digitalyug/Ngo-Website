import { useState, useEffect } from "react";
import { Briefcase, Plus, Edit2, Trash2, Loader2, X, ChevronDown, MapPin, Users, IndianRupee, CheckCircle, Clock, XCircle } from "lucide-react";
import { API_BASE_URL } from "./NgoLayout.jsx";

const CAT_LABELS = {
  skill_training: "Skill Training", job_placement: "Job Placement",
  self_employment: "Self Employment", apprenticeship: "Apprenticeship", other: "Other",
};
const CAT_COLORS = {
  skill_training: "#0891b2", job_placement: "#16a34a",
  self_employment: "#d97706", apprenticeship: "#7c3aed", other: "#64748b",
};
const STATUS_META = {
  open:      { label: "Open",      bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
  closed:    { label: "Closed",    bg: "#fef9c3", color: "#854d0e", Icon: Clock },
  completed: { label: "Completed", bg: "#dbeafe", color: "#1e40af", Icon: XCircle },
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtINR  = (n) => n > 0 ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n) + "/mo" : "Unpaid";

const EMPTY = {
  title: "", category: "skill_training", description: "", skills: "", location: "",
  openings: 1, filled: 0, stipend: 0, status: "open",
  startDate: "", endDate: "", villageId: "", isPublic: true,
};

function JobModal({ job, villages, onClose, onSaved }) {
  const [form, setForm] = useState(job ? {
    title: job.title || "", category: job.category || "skill_training",
    description: job.description || "", skills: (job.skills || []).join(", "),
    location: job.location || "", openings: job.openings ?? 1, filled: job.filled ?? 0,
    stipend: job.stipend ?? 0, status: job.status || "open",
    startDate: job.startDate ? new Date(job.startDate).toISOString().slice(0,10) : "",
    endDate: job.endDate ? new Date(job.endDate).toISOString().slice(0,10) : "",
    villageId: job.villageId?._id || job.villageId || "",
    isPublic: job.isPublic !== false,
  } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    const body = {
      ...form,
      skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      openings: Number(form.openings), filled: Number(form.filled),
      stipend: Number(form.stipend), villageId: form.villageId || null,
    };
    const url = job ? `${API_BASE_URL}/api/employment/${job._id}` : `${API_BASE_URL}/api/employment`;
    fetch(url, { method: job ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
      .then(r => r.json())
      .then(d => { if (d.success) { onSaved(d.data.job); onClose(); } else setError(d.message || "Failed"); })
      .catch(() => setError("Network error"))
      .finally(() => setSaving(false));
  };

  const inp = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };
  const sel = { ...inp, appearance: "none", cursor: "pointer" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: "580px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontWeight: "800", fontSize: "18px", color: "#0f172a" }}>{job ? "Edit Listing" : "New Employment Listing"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
        </div>
        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Program Title *</label>
            <input style={inp} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Mobile Repair Skill Training" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Category</label>
            <div style={{ position: "relative" }}>
              <select style={sel} value={form.category} onChange={e => set("category", e.target.value)}>
                {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Status</label>
            <div style={{ position: "relative" }}>
              <select style={sel} value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
            </div>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Description</label>
            <textarea rows={3} style={{ ...inp, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the program, eligibility, and expected outcomes…" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Skills (comma-separated)</label>
            <input style={inp} value={form.skills} onChange={e => set("skills", e.target.value)} placeholder="e.g. Mobile repair, soldering, customer service" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Location</label>
            <input style={inp} value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Rampur Village Center" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Linked Village</label>
            <div style={{ position: "relative" }}>
              <select style={sel} value={form.villageId} onChange={e => set("villageId", e.target.value)}>
                <option value="">None</option>
                {villages.map(v => <option key={v._id} value={v._id}>{v.villageName}, {v.district}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Openings</label>
            <input type="number" min={0} style={inp} value={form.openings} onChange={e => set("openings", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Filled</label>
            <input type="number" min={0} style={inp} value={form.filled} onChange={e => set("filled", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Stipend/Month (₹, 0 = unpaid)</label>
            <input type="number" min={0} style={inp} value={form.stipend} onChange={e => set("stipend", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Start Date</label>
            <input type="date" style={inp} value={form.startDate} onChange={e => set("startDate", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>End Date</label>
            <input type="date" style={inp} value={form.endDate} onChange={e => set("endDate", e.target.value)} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
              <input type="checkbox" checked={form.isPublic} onChange={e => set("isPublic", e.target.checked)} style={{ width: "16px", height: "16px" }} />
              Show on public employment listings
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "22px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving}
            style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : job ? "Save Changes" : "Create Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onEdit, onDelete }) {
  const sm = STATUS_META[job.status] || STATUS_META.open;
  const catColor = CAT_COLORS[job.category] || "#64748b";
  const fillPct = job.openings > 0 ? Math.min(100, Math.round((job.filled / job.openings) * 100)) : 0;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "15px", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ background: `${catColor}18`, color: catColor, padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600" }}>{CAT_LABELS[job.category]}</span>
            <span style={{ background: sm.bg, color: sm.color, padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px" }}>
              <sm.Icon size={10} /> {sm.label}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", marginLeft: "10px", flexShrink: 0 }}>
          <button onClick={() => onEdit(job)} style={{ background: "#eff6ff", border: "none", color: "#2563eb", borderRadius: "6px", padding: "6px 8px", cursor: "pointer" }}><Edit2 size={13} /></button>
          <button onClick={() => onDelete(job._id)} style={{ background: "#fef2f2", border: "none", color: "#dc2626", borderRadius: "6px", padding: "6px 8px", cursor: "pointer" }}><Trash2 size={13} /></button>
        </div>
      </div>

      {job.description && <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{job.description}</p>}

      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "12px" }}>
        {job.location && <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}><MapPin size={11} />{job.location}</span>}
        <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}><Users size={11} />{job.filled}/{job.openings} filled</span>
        <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}><IndianRupee size={11} />{fmtINR(job.stipend)}</span>
        {job.startDate && <span style={{ fontSize: "12px", color: "#94a3b8" }}>{fmtDate(job.startDate)} → {fmtDate(job.endDate)}</span>}
      </div>

      {/* Fill progress */}
      {job.openings > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Seats filled</span>
            <span style={{ fontSize: "11px", fontWeight: "700", color: fillPct >= 100 ? "#16a34a" : "#0f172a" }}>{fillPct}%</span>
          </div>
          <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "3px" }}>
            <div style={{ height: "100%", width: `${fillPct}%`, background: fillPct >= 100 ? "#16a34a" : "#2563eb", borderRadius: "3px" }} />
          </div>
        </div>
      )}

      {job.skills?.length > 0 && (
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "10px" }}>
          {job.skills.slice(0, 5).map(s => (
            <span key={s} style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "5px", fontSize: "11px" }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NgoEmployment() {
  const [jobs, setJobs] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/employment/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/villages/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([jobs, vils]) => {
        if (jobs.success) setJobs(jobs.data.jobs);
        if (vils.success) setVillages(vils.data.villages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSaved = (job) => setJobs(js => {
    const idx = js.findIndex(j => j._id === job._id);
    if (idx >= 0) { const n = [...js]; n[idx] = job; return n; }
    return [job, ...js];
  });

  const onDelete = (id) => {
    if (!confirm("Delete this listing?")) return;
    fetch(`${API_BASE_URL}/api/employment/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setJobs(js => js.filter(j => j._id !== id)); })
      .catch(() => {});
  };

  const filtered = statusFilter === "all" ? jobs : jobs.filter(j => j.status === statusFilter);

  // Summary counts
  const counts = jobs.reduce((a, j) => { a[j.status] = (a[j.status] || 0) + 1; return a; }, {});
  const totalFilled = jobs.reduce((a, j) => a + (j.filled || 0), 0);

  return (
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Employment & Rojgar</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Skill training, job placements, and self-employment programs</p>
        </div>
        <button onClick={() => setModal("create")}
          style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
          <Plus size={16} /> New Program
        </button>
      </div>

      {/* Stats */}
      {jobs.length > 0 && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "10px 18px" }}>
            <span style={{ fontWeight: "800", fontSize: "18px", color: "#166534" }}>{jobs.length}</span>
            <span style={{ fontSize: "13px", color: "#166534", marginLeft: "6px" }}>Total Programs</span>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "10px 18px" }}>
            <span style={{ fontWeight: "800", fontSize: "18px", color: "#1e40af" }}>{totalFilled}</span>
            <span style={{ fontSize: "13px", color: "#1e40af", marginLeft: "6px" }}>People Placed</span>
          </div>
          {Object.entries(counts).map(([s, c]) => {
            const sm = STATUS_META[s];
            return sm ? (
              <div key={s} style={{ background: sm.bg, border: `1px solid ${sm.color}30`, borderRadius: "10px", padding: "10px 18px" }}>
                <span style={{ fontWeight: "800", fontSize: "18px", color: sm.color }}>{c}</span>
                <span style={{ fontSize: "13px", color: sm.color, marginLeft: "6px" }}>{sm.label}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["all","open","closed","completed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: "600",
              background: statusFilter === s ? "#0f172a" : "#fff",
              color: statusFilter === s ? "#fff" : "#374151",
              borderColor: statusFilter === s ? "#0f172a" : "#e2e8f0" }}>
            {s === "all" ? "All" : STATUS_META[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px", gap: "10px", color: "#64748b" }}>
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "14px", border: "1px dashed #e2e8f0" }}>
          <Briefcase size={48} style={{ color: "#cbd5e1", marginBottom: "14px" }} />
          <h3 style={{ margin: "0 0 8px", fontWeight: "700", color: "#0f172a" }}>No programs yet</h3>
          <p style={{ color: "#64748b", margin: "0 0 20px" }}>Create employment and skill training programs to track your impact.</p>
          <button onClick={() => setModal("create")}
            style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: "pointer" }}>
            Create First Program
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: "16px" }}>
          {filtered.map(j => <JobCard key={j._id} job={j} onEdit={j => setModal(j)} onDelete={onDelete} />)}
        </div>
      )}

      {modal && <JobModal job={modal === "create" ? null : modal} villages={villages} onClose={() => setModal(null)} onSaved={onSaved} />}
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
