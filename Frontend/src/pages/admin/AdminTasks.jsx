import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, IndianRupee, User, UserCheck, Plus, Trash2,
  ChevronDown, ChevronUp, Eye, X, CheckCircle, Clock, Play,
  AlertCircle, RefreshCw
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

// ── helpers ──────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem("token");
const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_META = {
  assigned:    { label: "Assigned",    bg: "#dbeafe", color: "#1e40af", Icon: Clock },
  in_progress: { label: "In Progress", bg: "#fef9c3", color: "#854d0e", Icon: Play },
  completed:   { label: "Completed",   bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, bg: "#f1f5f9", color: "#475569", Icon: AlertCircle };
  return (
    <span style={{ background: m.bg, color: m.color, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
      <m.Icon size={11} /> {m.label}
    </span>
  );
}

// ── Interest matching helper ──────────────────────────────────────────────────
const matchesService = (volunteer, serviceTitle) => {
  if (!serviceTitle || serviceTitle === "General Donation") return false;
  const title = serviceTitle.toLowerCase();
  return (volunteer.interests || []).some(interest => {
    const i = interest.toLowerCase();
    return title.includes(i) || i.split(" ").some(word => word.length > 2 && title.includes(word));
  });
};

// ── Assign Task Modal ────────────────────────────────────────────────────────
function AssignModal({ donation, volunteers, onClose, onSuccess }) {
  const [form, setForm] = useState({ volunteerId: "", title: "", description: "", adminNote: "" });
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const serviceTitle = donation.serviceTitle || "General Donation";

  // Filter by search, then split into matched / other
  const filtered = volunteers.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return v.fullName.toLowerCase().includes(q) || v.email.toLowerCase().includes(q);
  });

  const matched = filtered.filter(v => matchesService(v, serviceTitle));
  const other   = filtered.filter(v => !matchesService(v, serviceTitle));
  const hasMatch = matched.length > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.volunteerId || !form.title.trim()) { setErr("Volunteer and title are required."); return; }
    setSaving(true); setErr("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        credentials: "include",
        body: JSON.stringify({ donationId: donation._id, ...form }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      onSuccess();
    } catch (e) {
      setErr(e.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const inp = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#374151" };

  const VolOption = ({ v, isMatch }) => (
    <option key={v._id} value={v._id}>
      {isMatch ? "★ " : ""}{v.fullName} ({v.city}, {v.state}){v.interests?.length ? ` — ${v.interests.slice(0, 2).join(", ")}` : ""}
    </option>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "14px", padding: "28px", width: "100%", maxWidth: "540px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>Assign Task to Volunteer</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color="#64748b" /></button>
        </div>

        {/* Donation Info */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
          <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#166534", fontSize: "15px" }}>
            {donation.isAnonymous ? "Anonymous" : (donation.donorName || donation.user?.name || "—")} donated {fmt(donation.amount)}
          </p>
          <p style={{ margin: 0, color: "#374151", fontSize: "13px" }}>
            Service: <strong>{serviceTitle}</strong> · {fmtDate(donation.createdAt)}
          </p>
        </div>

        <form onSubmit={submit}>
          {/* Volunteer Search */}
          <div style={{ marginBottom: "16px" }}>
            <label style={lbl}>Search Volunteer by Name / Email</label>
            <input
              style={inp}
              value={search}
              onChange={e => { setSearch(e.target.value); set("volunteerId", ""); }}
              placeholder="Type to filter volunteers…"
            />
          </div>

          {/* Volunteer Select — grouped by match */}
          <div style={{ marginBottom: "16px" }}>
            <label style={lbl}>
              Assign to Volunteer *
              {hasMatch && <span style={{ marginLeft: "8px", color: "#16a34a", fontSize: "12px", fontWeight: "500" }}>★ = interests match service</span>}
            </label>
            {filtered.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "6px 0" }}>No volunteers match your search.</p>
            ) : (
              <select value={form.volunteerId} onChange={e => set("volunteerId", e.target.value)} style={{ ...inp, background: "#fff" }} required>
                <option value="">— Select volunteer —</option>
                {hasMatch && (
                  <optgroup label={`★ Matched Interests (${matched.length})`}>
                    {matched.map(v => <VolOption key={v._id} v={v} isMatch />)}
                  </optgroup>
                )}
                <optgroup label={hasMatch ? `Other Volunteers (${other.length})` : `All Approved Volunteers (${other.length})`}>
                  {(hasMatch ? other : filtered).map(v => <VolOption key={v._id} v={v} />)}
                </optgroup>
              </select>
            )}
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={lbl}>Task Title *</label>
            <input style={inp} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Distribute food to 20 families" required />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp, minHeight: "72px", resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Additional details about the task…" />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={lbl}>Instructions for Volunteer</label>
            <textarea style={{ ...inp, minHeight: "72px", resize: "vertical" }} value={form.adminNote} onChange={e => set("adminNote", e.target.value)} placeholder="What the volunteer should do, document, etc." />
          </div>
          {err && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>{err}</p>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Assigning…" : "Assign Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Media Lightbox ────────────────────────────────────────────────────────────
function MediaLightbox({ task, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <X size={22} />
      </button>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        {task.mediaType === "video"
          ? <video src={task.mediaUrl} controls autoPlay style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "10px", background: "#000" }} />
          : <img src={task.mediaUrl} alt={task.title} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "10px" }} />
        }
        <p style={{ color: "#fff", margin: 0, fontWeight: "600" }}>{task.title}</p>
        {task.volunteerNote && <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>Note: {task.volunteerNote}</p>}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminTasks() {
  const [tab, setTab] = useState("donations"); // "donations" | "tasks"
  const [donations, setDonations]   = useState([]);
  const [tasks, setTasks]           = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [assignTarget, setAssignTarget] = useState(null); // donation to assign
  const [previewTask, setPreviewTask]   = useState(null);
  const [taskFilter, setTaskFilter]     = useState("all");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 4000); };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, tRes, vRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tasks/admin/donations?limit=50`, { headers: { Authorization: `Bearer ${token()}` }, credentials: "include" }),
        fetch(`${API_BASE_URL}/api/tasks/admin/all`,                { headers: { Authorization: `Bearer ${token()}` }, credentials: "include" }),
        fetch(`${API_BASE_URL}/api/tasks/admin/volunteers`,          { headers: { Authorization: `Bearer ${token()}` }, credentials: "include" }),
      ]);
      const [d, t, v] = await Promise.all([dRes.json(), tRes.json(), vRes.json()]);
      if (d.success) setDonations(d.data.donations || []);
      if (t.success) setTasks(t.data || []);
      if (v.success) setVolunteers(v.data || []);
    } catch { showMsg("error", "Failed to load data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token()}` }, credentials: "include" });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      setTasks(p => p.filter(t => t._id !== id));
      showMsg("success", "Task deleted");
    } catch (e) { showMsg("error", e.message); }
  };

  const filteredTasks = taskFilter === "all" ? tasks : tasks.filter(t => t.status === taskFilter);

  const S = {
    page: { padding: "28px" },
    title: { margin: "0 0 4px", fontSize: "22px", fontWeight: "700", color: "#0f172a" },
    sub: { margin: "0 0 24px", color: "#64748b", fontSize: "14px" },
    tabs: { display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", marginBottom: "24px", width: "fit-content" },
    tab: (active) => ({ padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "14px", background: active ? "#fff" : "transparent", color: active ? "#1e40af" : "#64748b", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }),
    card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "12px" },
    badge: (color, bg) => ({ background: bg, color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }),
    btn: (c) => ({ padding: "7px 14px", background: c, color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "5px" }),
  };

  return (
    <div style={S.page}>
      <h1 style={S.title}>Task Management</h1>
      <p style={S.sub}>View donations, assign tasks to volunteers, and track completion.</p>

      {msg.text && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", background: msg.type === "success" ? "#dcfce7" : "#fee2e2", color: msg.type === "success" ? "#166534" : "#991b1b", fontWeight: "600", fontSize: "14px" }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={S.tabs}>
        <button style={S.tab(tab === "donations")} onClick={() => setTab("donations")}>
          <IndianRupee size={14} style={{ marginRight: 4 }} />Donations ({donations.length})
        </button>
        <button style={S.tab(tab === "tasks")} onClick={() => setTab("tasks")}>
          <ClipboardList size={14} style={{ marginRight: 4 }} />Tasks ({tasks.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
          <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", marginBottom: "12px" }} />
          <p style={{ margin: 0 }}>Loading…</p>
        </div>
      ) : tab === "donations" ? (
        <>
          {/* ── Donations Tab ──────────────────────────────────────────── */}
          <div style={{ marginBottom: "12px", color: "#64748b", fontSize: "13px" }}>
            {donations.length} paid donation{donations.length !== 1 ? "s" : ""}. Click <strong>Assign Task</strong> to create a volunteer task for any donation.
          </div>
          {donations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
              <IndianRupee size={32} style={{ marginBottom: "12px" }} />
              <p style={{ margin: 0 }}>No paid donations yet.</p>
            </div>
          ) : donations.map(d => (
            <div key={d._id} style={S.card}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>
                    <User size={14} style={{ marginRight: 5, verticalAlign: "middle" }} />
                    {d.isAnonymous ? "Anonymous" : (d.donorName || d.user?.name || "Unknown")}
                    {" "}donated{" "}
                    <span style={{ color: "#16a34a", fontWeight: "800" }}>{fmt(d.amount)}</span>
                  </p>
                  <p style={{ margin: "0 0 4px", color: "#374151", fontSize: "13px" }}>
                    Service: <strong>{d.serviceTitle || "General Donation"}</strong>
                  </p>
                  {d.user?.email && <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>{d.user.email}</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>{fmtDate(d.createdAt)}</span>
                  <button
                    style={S.btn("#2563eb")}
                    onClick={() => { if (volunteers.length === 0) { showMsg("error", "No approved volunteers available"); return; } setAssignTarget(d); }}
                  >
                    <Plus size={14} /> Assign Task
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {/* ── Tasks Tab ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {["all", "assigned", "in_progress", "completed"].map(f => (
              <button key={f} onClick={() => setTaskFilter(f)}
                style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                  background: taskFilter === f ? "#1e40af" : "#fff",
                  color: taskFilter === f ? "#fff" : "#374151",
                  borderColor: taskFilter === f ? "#1e40af" : "#e2e8f0" }}>
                {f === "all" ? "All" : STATUS_META[f]?.label || f}
              </button>
            ))}
          </div>

          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
              <ClipboardList size={32} style={{ marginBottom: "12px" }} />
              <p style={{ margin: 0 }}>No tasks found.</p>
            </div>
          ) : filteredTasks.map(t => (
            <div key={t._id} style={{ ...S.card, borderLeft: `4px solid ${t.status === "completed" ? "#22c55e" : t.status === "in_progress" ? "#eab308" : "#3b82f6"}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>{t.title}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "4px 16px", fontSize: "13px", color: "#64748b" }}>
                    <span><IndianRupee size={12} style={{ verticalAlign: "middle" }} /> {fmt(t.donationAmount)} · {t.serviceTitle || "General"}</span>
                    <span><User size={12} style={{ verticalAlign: "middle" }} /> Donor: {t.donorName || "—"}</span>
                    <span><UserCheck size={12} style={{ verticalAlign: "middle" }} /> Volunteer: {t.volunteerName || "—"}</span>
                    <span>Created: {fmtDate(t.createdAt)}</span>
                    {t.completedAt && <span>Completed: {fmtDate(t.completedAt)}</span>}
                  </div>
                  {t.description && <p style={{ margin: "8px 0 0", color: "#374151", fontSize: "13px" }}>{t.description}</p>}
                  {t.adminNote && <p style={{ margin: "6px 0 0", color: "#0369a1", fontSize: "12px", background: "#f0f9ff", padding: "4px 8px", borderRadius: "4px" }}>📋 {t.adminNote}</p>}
                  {t.volunteerNote && <p style={{ margin: "6px 0 0", color: "#166534", fontSize: "12px", background: "#f0fdf4", padding: "4px 8px", borderRadius: "4px" }}>✅ Volunteer note: {t.volunteerNote}</p>}
                  {t.addedToGallery && <span style={S.badge("#166534", "#dcfce7")}>Added to Gallery</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                  {t.mediaUrl && (
                    <button style={S.btn("#0369a1")} onClick={() => setPreviewTask(t)}>
                      <Eye size={14} /> View Media
                    </button>
                  )}
                  <button style={S.btn("#dc2626")} onClick={() => handleDelete(t._id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {assignTarget && (
        <AssignModal
          donation={assignTarget}
          volunteers={volunteers}
          onClose={() => setAssignTarget(null)}
          onSuccess={() => { setAssignTarget(null); showMsg("success", "Task assigned successfully!"); loadAll(); setTab("tasks"); }}
        />
      )}

      {previewTask && <MediaLightbox task={previewTask} onClose={() => setPreviewTask(null)} />}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
