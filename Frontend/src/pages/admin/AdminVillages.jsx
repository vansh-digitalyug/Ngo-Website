import { useState, useEffect } from "react";
import {
  MapPin, Plus, Pencil, Trash2, X, Loader2, RefreshCw,
  CheckCircle, Clock, PauseCircle, Users, Flag, Droplets,
  Zap, Trash, Route, ChevronDown, ChevronUp, Star
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const token = () => localStorage.getItem("token");
const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_META = {
  active:    { label: "Active",    bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
  paused:    { label: "Paused",    bg: "#fef9c3", color: "#854d0e", Icon: PauseCircle },
  completed: { label: "Completed", bg: "#dbeafe", color: "#1e40af", Icon: Flag },
};

const NEED_ICONS = { water: Droplets, electricity: Zap, sanitation: Trash, roads: Route };
const NEED_LABELS = { water: "Water", electricity: "Electricity", sanitation: "Sanitation", roads: "Roads" };
const NEED_COLORS = { water: "#0ea5e9", electricity: "#eab308", sanitation: "#10b981", roads: "#8b5cf6" };

// ── Inline helpers ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.active;
  return (
    <span style={{ background: m.bg, color: m.color, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
      <m.Icon size={11} /> {m.label}
    </span>
  );
}

function NeedBar({ need, value, status }) {
  const Icon = NEED_ICONS[need];
  const color = NEED_COLORS[need];
  const pct = Math.min(100, Math.max(0, value || 0));
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
          <Icon size={12} color={color} /> {NEED_LABELS[need]}
        </span>
        <span style={{ fontSize: "11px", fontWeight: "600", color }}>{pct}%</span>
      </div>
      <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "4px" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

// ── Village Form Modal ────────────────────────────────────────────────────────
function VillageFormModal({ village, ngos, onClose, onSaved }) {
  const isEdit = Boolean(village);
  const [form, setForm] = useState(isEdit ? {
    ngoId: village.ngoId?._id || village.ngoId || "",
    villageName: village.villageName || "",
    district: village.district || "",
    state: village.state || "",
    pincode: village.pincode || "",
    totalFamilies: village.totalFamilies || 0,
    description: village.description || "",
    status: village.status || "active",
  } : {
    ngoId: "", villageName: "", district: "", state: "",
    pincode: "", totalFamilies: 0, description: "", status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.villageName.trim()) { setErr("Village name required"); return; }
    if (!form.district.trim() || !form.state.trim()) { setErr("District and State required"); return; }
    if (!isEdit && !form.ngoId) { setErr("Select an NGO"); return; }

    setSaving(true); setErr("");
    try {
      const url = isEdit
        ? `${API_BASE_URL}/api/villages/${village._id}`
        : `${API_BASE_URL}/api/villages/admin/create`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      onSaved(d.data.village);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lbl = { display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: "600", color: "#374151" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "560px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontWeight: "800", color: "#0f172a", fontSize: "16px" }}>
            {isEdit ? "Edit Village" : "Adopt New Village"}
          </h3>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} color="#64748b" />
          </button>
        </div>

        <form onSubmit={submit} style={{ padding: "24px", display: "grid", gap: "14px" }}>
          {!isEdit && (
            <div>
              <label style={lbl}>NGO *</label>
              <select value={form.ngoId} onChange={e => set("ngoId", e.target.value)} style={inp} required>
                <option value="">— Select NGO —</option>
                {ngos.map(n => <option key={n._id} value={n._id}>{n.ngoName}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={lbl}>Village / Area Name *</label>
            <input value={form.villageName} onChange={e => set("villageName", e.target.value)} style={inp} placeholder="e.g. Rampur Village" required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={lbl}>District *</label>
              <input value={form.district} onChange={e => set("district", e.target.value)} style={inp} placeholder="e.g. Varanasi" required />
            </div>
            <div>
              <label style={lbl}>State *</label>
              <input value={form.state} onChange={e => set("state", e.target.value)} style={inp} placeholder="e.g. Uttar Pradesh" required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={lbl}>Pincode</label>
              <input value={form.pincode} onChange={e => set("pincode", e.target.value)} style={inp} placeholder="6-digit pincode" maxLength={6} />
            </div>
            <div>
              <label style={lbl}>Total Families</label>
              <input type="number" value={form.totalFamilies} onChange={e => set("totalFamilies", e.target.value)} style={inp} min={0} />
            </div>
          </div>

          <div>
            <label style={lbl}>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} style={inp}>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label style={lbl}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} style={{ ...inp, resize: "vertical" }} placeholder="Brief overview of adoption goals and current situation..." />
          </div>

          {err && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626", fontSize: "13px", fontWeight: "600" }}>
              {err}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: "9px 24px", borderRadius: "8px", border: "none", background: saving ? "#94a3b8" : "#2563eb", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "7px" }}>
              {saving ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</> : isEdit ? "Save Changes" : "Adopt Village"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Milestone Modal ───────────────────────────────────────────────────────────
function MilestoneModal({ village, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [achievedAt, setAchievedAt] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setErr("Title required"); return; }
    setSaving(true); setErr("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/villages/${village._id}/milestone`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        credentials: "include",
        body: JSON.stringify({ title: title.trim(), description: description.trim(), achievedAt }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      onSaved(d.data.milestones);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <h4 style={{ margin: 0, fontWeight: "800", color: "#0f172a" }}>Add Milestone — {village.villageName}</h4>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={14} />
          </button>
        </div>
        <form onSubmit={submit} style={{ display: "grid", gap: "12px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "600", color: "#374151" }}>Milestone Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inp} placeholder="e.g. Clean water supply installed" required />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "600", color: "#374151" }}>Achieved On</label>
            <input type="date" value={achievedAt} onChange={e => setAchievedAt(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "600", color: "#374151" }}>Details (optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} placeholder="What was achieved, how many people benefited..." />
          </div>
          {err && <div style={{ padding: "8px 12px", background: "#fef2f2", borderRadius: "7px", color: "#dc2626", fontSize: "13px" }}>{err}</div>}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
              {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Star size={13} />} Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Village Card ──────────────────────────────────────────────────────────────
function VillageCard({ village, onEdit, onDelete, onMilestone }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
              <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "15px" }}>{village.villageName}</span>
              <StatusBadge status={village.status} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "12px" }}>
              <MapPin size={11} /> {village.district}, {village.state}
              {village.pincode && <span>· {village.pincode}</span>}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}>
              NGO: {village.ngoId?.ngoName || "—"} · Adopted {fmtDate(village.adoptedAt)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <button onClick={() => onMilestone(village)} title="Add milestone" style={{ padding: "6px 10px", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "7px", cursor: "pointer", color: "#92400e", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600" }}>
              <Star size={12} /> Milestone
            </button>
            <button onClick={() => onEdit(village)} style={{ padding: "6px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "7px", cursor: "pointer", color: "#1d4ed8", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600" }}>
              <Pencil size={12} /> Edit
            </button>
            <button onClick={() => onDelete(village._id)} style={{ padding: "6px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "7px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600" }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: "16px", marginTop: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
            <Users size={11} /> {fmt(village.totalFamilies || 0)} families
          </span>
          <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
            <Star size={11} /> {village.milestones?.length || 0} milestones
          </span>
        </div>
      </div>

      {/* Basic needs */}
      <div style={{ padding: "12px 18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
          {["water", "electricity", "sanitation", "roads"].map(need => (
            <NeedBar
              key={need}
              need={need}
              value={village.basicNeeds?.[need]?.coveragePercent || 0}
              status={village.basicNeeds?.[need]?.status}
            />
          ))}
        </div>
      </div>

      {/* Milestones toggle */}
      {village.milestones?.length > 0 && (
        <div style={{ borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => setExpanded(e => !e)} style={{ width: "100%", padding: "10px 18px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", color: "#6366f1" }}>
            <span>Milestones ({village.milestones.length})</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {expanded && (
            <div style={{ padding: "0 18px 14px" }}>
              {village.milestones.map((m, i) => (
                <div key={m._id || i} style={{ display: "flex", gap: "10px", marginBottom: "8px", padding: "8px 10px", background: "#f8fafc", borderRadius: "8px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366f1", marginTop: "5px", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "13px", color: "#0f172a" }}>{m.title}</p>
                    {m.description && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>{m.description}</p>}
                    <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#94a3b8" }}>{fmtDate(m.achievedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminVillages() {
  const [villages, setVillages] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);  // null | { mode: "create"|"edit", village? }
  const [milestoneTarget, setMilestoneTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 12 });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`${API_BASE_URL}/api/villages/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
        credentials: "include",
      });
      const d = await res.json();
      if (d.success) {
        setVillages(d.data.villages);
        setPagination(d.data.pagination);
      }
    } catch { showMsg("error", "Failed to load villages"); }
    finally { setLoading(false); }
  };

  const loadNgos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ngos?status=verified&limit=100`, {
        headers: { Authorization: `Bearer ${token()}` },
        credentials: "include",
      });
      const d = await res.json();
      if (d.success) setNgos(d.data?.ngos || d.data || []);
    } catch {}
  };

  useEffect(() => { load(1); setPage(1); }, [statusFilter]);
  useEffect(() => { load(page); }, [page]);
  useEffect(() => { loadNgos(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this village adoption? This also deletes all associated problems.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/villages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
        credentials: "include",
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      setVillages(v => v.filter(x => x._id !== id));
      showMsg("success", "Village deleted");
    } catch (e) { showMsg("error", e.message); }
  };

  const handleSaved = (village) => {
    setVillages(prev => {
      const exists = prev.find(v => v._id === village._id);
      return exists ? prev.map(v => v._id === village._id ? village : v) : [village, ...prev];
    });
    showMsg("success", modal?.mode === "edit" ? "Village updated!" : "Village adoption created!");
    setModal(null);
  };

  const handleMilestoneSaved = (milestones) => {
    setVillages(prev => prev.map(v => v._id === milestoneTarget._id ? { ...v, milestones } : v));
    showMsg("success", "Milestone added!");
    setMilestoneTarget(null);
  };

  const counts = { total: pagination.total, active: 0, paused: 0, completed: 0 };
  villages.forEach(v => { if (counts[v.status] !== undefined) counts[v.status]++; });

  return (
    <div>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <h1 className="admin-page-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <MapPin size={22} /> Village Adoptions
        </h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => load(page)} style={{ padding: "9px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setModal({ mode: "create" })} style={{ padding: "9px 18px", background: "#2563eb", border: "none", borderRadius: "8px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700" }}>
            <Plus size={15} /> Adopt Village
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Total Villages", value: pagination.total, bg: "#f0f9ff", color: "#0369a1" },
          { label: "Active", value: villages.filter(v => v.status === "active").length, bg: "#dcfce7", color: "#166534" },
          { label: "Paused", value: villages.filter(v => v.status === "paused").length, bg: "#fef9c3", color: "#854d0e" },
          { label: "Completed", value: villages.filter(v => v.status === "completed").length, bg: "#dbeafe", color: "#1e40af" },
        ].map(({ label, value, bg, color }) => (
          <div key={label} style={{ background: bg, borderRadius: "10px", padding: "14px 16px" }}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: "600", color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            <p style={{ margin: "4px 0 0", fontSize: "26px", fontWeight: "800", color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Feedback */}
      {msg.text && (
        <div style={{ padding: "12px 16px", marginBottom: "16px", borderRadius: "8px", background: msg.type === "success" ? "#f0fdf4" : "#fef2f2", color: msg.type === "success" ? "#166534" : "#991b1b", fontWeight: "600", fontSize: "14px", border: `1px solid ${msg.type === "success" ? "#bbf7d0" : "#fecaca"}` }}>
          {msg.text}
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["all", "active", "paused", "completed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: "600",
              background: statusFilter === s ? "#2563eb" : "#fff",
              color:      statusFilter === s ? "#fff"    : "#374151",
              borderColor: statusFilter === s ? "#2563eb" : "#e2e8f0",
            }}>
            {s === "all" ? "All" : STATUS_META[s]?.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "10px", color: "#64748b" }}>
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /> Loading villages…
        </div>
      ) : villages.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          <MapPin size={40} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
          <p style={{ color: "#94a3b8", margin: 0 }}>No villages adopted yet.</p>
          <button onClick={() => setModal({ mode: "create" })} style={{ marginTop: "14px", padding: "9px 20px", borderRadius: "8px", background: "#2563eb", border: "none", color: "#fff", fontWeight: "600", cursor: "pointer" }}>Adopt First Village</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: "16px" }}>
          {villages.map(v => (
            <VillageCard
              key={v._id} village={v}
              onEdit={(v) => setModal({ mode: "edit", village: v })}
              onDelete={handleDelete}
              onMilestone={setMilestoneTarget}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", marginTop: "24px" }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "7px 16px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1, fontWeight: "600", fontSize: "13px" }}>← Prev</button>
          <span style={{ fontSize: "13px", color: "#64748b" }}>Page {page} of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} style={{ padding: "7px 16px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#fff", cursor: page >= pagination.pages ? "not-allowed" : "pointer", opacity: page >= pagination.pages ? 0.5 : 1, fontWeight: "600", fontSize: "13px" }}>Next →</button>
        </div>
      )}

      {/* Modals */}
      {modal && (
        <VillageFormModal
          village={modal.village}
          ngos={ngos}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {milestoneTarget && (
        <MilestoneModal
          village={milestoneTarget}
          onClose={() => setMilestoneTarget(null)}
          onSaved={handleMilestoneSaved}
        />
      )}
    </div>
  );
}
