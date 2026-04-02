import { useState, useEffect } from "react";
import {
  MapPin, Plus, Pencil, Trash2, X, Loader2, RefreshCw,
  CheckCircle, PauseCircle, Users, Flag, Droplets,
  Zap, Trash, Route, ChevronDown, ChevronUp, Star, ArrowRight,
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const token  = () => localStorage.getItem("token");
const fmt    = (n) => new Intl.NumberFormat("en-IN").format(n);
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_META = {
  active:    { label: "Active",    Icon: CheckCircle },
  paused:    { label: "Paused",    Icon: PauseCircle },
  completed: { label: "Completed", Icon: Flag },
};

const STATUS_BADGE = {
  active:    "bg-emerald-100 text-emerald-800",
  paused:    "bg-yellow-100 text-yellow-800",
  completed: "bg-sky-100 text-sky-800",
};

const NEED_ICONS  = { water: Droplets, electricity: Zap, sanitation: Trash, roads: Route };
const NEED_LABELS = { water: "Water Access", electricity: "Electricity", sanitation: "Sanitation", roads: "Roads" };
const NEED_BAR    = { water: "bg-sky-500", electricity: "bg-yellow-500", sanitation: "bg-emerald-500", roads: "bg-violet-500" };
const NEED_TEXT   = { water: "text-sky-600", electricity: "text-yellow-600", sanitation: "text-emerald-600", roads: "text-violet-600" };

const inputCls = "w-full rounded-lg border border-beige-200 bg-beige-50 px-3 py-2.5 text-sm text-olive-900 placeholder-olive-300 focus:outline-none focus:ring-2 focus:ring-olive-400 focus:border-transparent transition";
const labelCls = "block text-xs font-semibold text-olive-500 uppercase tracking-wide mb-1";

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const m   = STATUS_META[status] || STATUS_META.active;
  const cls = STATUS_BADGE[status] || STATUS_BADGE.active;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <m.Icon size={11} /> {m.label}
    </span>
  );
}

// ── Need Progress Bar ─────────────────────────────────────────────────────────
function NeedBar({ need, value }) {
  const Icon = NEED_ICONS[need];
  const pct  = Math.min(100, Math.max(0, value || 0));
  return (
    <div className="mb-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1 text-xs text-olive-500">
          <Icon size={11} className={NEED_TEXT[need]} />
          {NEED_LABELS[need]}
        </span>
        <span className={`text-xs font-bold ${NEED_TEXT[need]}`}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-beige-100 rounded-full">
        <div
          className={`h-full rounded-full transition-all duration-500 ${NEED_BAR[need]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Village Form Modal ────────────────────────────────────────────────────────
function VillageFormModal({ village, ngos, onClose, onSaved }) {
  const isEdit = Boolean(village);
  const [form, setForm] = useState(isEdit ? {
    ngoId:         village.ngoId?._id || village.ngoId || "",
    villageName:   village.villageName || "",
    district:      village.district || "",
    state:         village.state || "",
    pincode:       village.pincode || "",
    totalFamilies: village.totalFamilies || 0,
    description:   village.description || "",
    status:        village.status || "active",
  } : {
    ngoId: "", villageName: "", district: "", state: "",
    pincode: "", totalFamilies: 0, description: "", status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.villageName.trim())                    { setErr("Village name required"); return; }
    if (!form.district.trim() || !form.state.trim()) { setErr("District and State required"); return; }
    if (!isEdit && !form.ngoId)                      { setErr("Select an NGO"); return; }

    setSaving(true); setErr("");
    try {
      const url    = isEdit
        ? `${API_BASE_URL}/api/villages/${village._id}`
        : `${API_BASE_URL}/api/villages/admin/create`;
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-5"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-beige-100">
          <h3 className="text-base font-extrabold text-olive-900 m-0">
            {isEdit ? "Edit Village" : "Adopt New Village"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-beige-100 hover:bg-beige-200 text-olive-500 transition-colors border-0 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6 grid gap-4">
          {!isEdit && (
            <div>
              <label className={labelCls}>NGO *</label>
              <select
                value={form.ngoId}
                onChange={e => set("ngoId", e.target.value)}
                className={inputCls}
                required
              >
                <option value="">— Select NGO —</option>
                {ngos.map(n => <option key={n._id} value={n._id}>{n.ngoName}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className={labelCls}>Village / Area Name *</label>
            <input
              value={form.villageName}
              onChange={e => set("villageName", e.target.value)}
              className={inputCls}
              placeholder="e.g. Rampur Village"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>District *</label>
              <input
                value={form.district}
                onChange={e => set("district", e.target.value)}
                className={inputCls}
                placeholder="e.g. Varanasi"
                required
              />
            </div>
            <div>
              <label className={labelCls}>State *</label>
              <input
                value={form.state}
                onChange={e => set("state", e.target.value)}
                className={inputCls}
                placeholder="e.g. Uttar Pradesh"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Pincode</label>
              <input
                value={form.pincode}
                onChange={e => set("pincode", e.target.value)}
                className={inputCls}
                placeholder="6-digit pincode"
                maxLength={6}
              />
            </div>
            <div>
              <label className={labelCls}>Total Families</label>
              <input
                type="number"
                value={form.totalFamilies}
                onChange={e => set("totalFamilies", e.target.value)}
                className={inputCls}
                min={0}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select
              value={form.status}
              onChange={e => set("status", e.target.value)}
              className={inputCls}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={3}
              className={`${inputCls} resize-y`}
              placeholder="Brief overview of adoption goals and current situation..."
            />
          </div>

          {err && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-semibold">
              {err}
            </div>
          )}

          <div className="flex gap-2.5 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-beige-200 bg-white text-olive-700 font-semibold text-sm hover:bg-beige-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-olive-900 hover:bg-olive-800 disabled:bg-olive-400 text-lime font-bold text-sm transition-colors cursor-pointer flex items-center gap-2 border-0"
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : isEdit ? "Save Changes" : "Adopt Village"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Milestone Modal ───────────────────────────────────────────────────────────
function MilestoneModal({ village, onClose, onSaved }) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [achievedAt,  setAchievedAt]  = useState(new Date().toISOString().slice(0, 10));
  const [saving,      setSaving]      = useState(false);
  const [err,         setErr]         = useState("");

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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1001] flex items-center justify-center p-5"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <h4 className="font-extrabold text-olive-900 m-0 text-sm leading-snug">
            Add Milestone
            <br />
            <span className="font-semibold text-olive-500">{village.villageName}</span>
          </h4>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-beige-100 hover:bg-beige-200 text-olive-500 transition-colors border-0 cursor-pointer flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-3">
          <div>
            <label className={labelCls}>Milestone Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={inputCls}
              placeholder="e.g. Clean water supply installed"
              required
            />
          </div>
          <div>
            <label className={labelCls}>Achieved On</label>
            <input
              type="date"
              value={achievedAt}
              onChange={e => setAchievedAt(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Details (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className={`${inputCls} resize-y`}
              placeholder="What was achieved, how many people benefited..."
            />
          </div>

          {err && (
            <div className="px-3 py-2 bg-red-50 rounded-lg text-red-700 text-xs font-semibold border border-red-200">
              {err}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-beige-200 bg-white text-olive-700 font-semibold text-sm cursor-pointer hover:bg-beige-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-olive-900 hover:bg-olive-800 disabled:bg-olive-400 text-lime font-bold text-sm cursor-pointer flex items-center gap-1.5 border-0 transition-colors"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} />}
              Add
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
  const ngoName = village.ngoId?.ngoName || "—";

  return (
    <div className="bg-white rounded-2xl border border-beige-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      {/* Top image / placeholder */}
      <div className="relative h-36 bg-gradient-to-br from-olive-100 to-beige-200 flex items-center justify-center">
        <MapPin size={36} className="text-olive-300" />

        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={village.status} />
        </div>

        {/* Action buttons overlay */}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <button
            onClick={() => onMilestone(village)}
            title="Add milestone"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 hover:bg-white text-amber-600 transition-colors border-0 cursor-pointer shadow-sm"
          >
            <Star size={13} />
          </button>
          <button
            onClick={() => onEdit(village)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 hover:bg-white text-olive-700 transition-colors border-0 cursor-pointer shadow-sm"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(village._id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 hover:bg-white text-red-600 transition-colors border-0 cursor-pointer shadow-sm"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">

        {/* Village name + location */}
        <div className="mb-3">
          <h3 className="font-extrabold text-olive-900 text-base m-0 mb-0.5 leading-tight truncate">
            {village.villageName}
          </h3>
          <div className="flex items-center gap-1 text-xs text-olive-500">
            <MapPin size={10} />
            <span className="truncate">{village.district}, {village.state}</span>
            {village.pincode && <span>· {village.pincode}</span>}
          </div>
          <div className="text-xs text-olive-400 mt-0.5">Partner: {ngoName}</div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 mb-3">
          <span className="flex items-center gap-1 text-xs text-olive-500">
            <Users size={11} /> {fmt(village.totalFamilies || 0)} families
          </span>
          <span className="flex items-center gap-1 text-xs text-olive-500">
            <Star size={11} /> {village.milestones?.length || 0} milestones
          </span>
        </div>

        {/* Progress bars */}
        <div>
          {["water", "electricity", "sanitation", "roads"].map(need => (
            <NeedBar
              key={need}
              need={need}
              value={village.basicNeeds?.[need]?.coveragePercent || 0}
            />
          ))}
        </div>

        {/* View impact report button */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 w-full py-2 rounded-xl border-2 border-olive-200 text-olive-700 text-xs font-bold hover:border-olive-400 hover:bg-beige-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5 bg-transparent"
        >
          {expanded ? "Hide Details" : "View Full Impact Report"}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {/* Milestones expanded */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-beige-100">
            {village.milestones?.length > 0 ? (
              <div className="flex flex-col gap-2">
                {village.milestones.map((m, i) => (
                  <div key={m._id || i} className="flex gap-2.5 p-2 bg-beige-50 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-olive-500 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="m-0 font-semibold text-xs text-olive-900 truncate">{m.title}</p>
                      {m.description && (
                        <p className="m-0 mt-0.5 text-xs text-olive-500">{m.description}</p>
                      )}
                      <p className="m-0 mt-0.5 text-[10px] text-olive-400">{fmtDate(m.achievedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-olive-400 text-center py-2 m-0">
                No milestones yet. Add one using the ★ button.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminVillages() {
  const [villages,        setVillages]        = useState([]);
  const [ngos,            setNgos]            = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [modal,           setModal]           = useState(null);
  const [milestoneTarget, setMilestoneTarget] = useState(null);
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [msg,             setMsg]             = useState({ type: "", text: "" });
  const [page,            setPage]            = useState(1);
  const [pagination,      setPagination]      = useState({ total: 0, pages: 1 });

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

  // Collect recent milestones across all loaded villages for "Recent Updates" section
  const recentUpdates = villages
    .flatMap(v => (v.milestones || []).map(m => ({
      ...m,
      villageName: v.villageName,
      district:    v.district,
      state:       v.state,
    })))
    .sort((a, b) => new Date(b.achievedAt || b.createdAt) - new Date(a.achievedAt || a.createdAt))
    .slice(0, 5);

  return (
    <div className="min-h-screen">

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="text-xs font-semibold text-olive-400 mb-3 flex items-center gap-1.5">
        <span>Initiatives</span>
        <span>/</span>
        <span className="text-olive-600">Village Adoptions</span>
      </div>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight m-0 p-0">
            <span className="text-olive-900">Village</span><br />
            <span className="text-olive-600">Adoptions.</span>
          </h1>
          <p className="text-sm text-olive-500 mt-2 max-w-md m-0">
            Managing infrastructure development and social welfare programs across our adopted rural communities.
          </p>
        </div>

        {/* Right: action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => load(page)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-beige-100 border border-beige-200 text-olive-700 text-sm font-semibold hover:bg-beige-200 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-olive-900 text-lime text-sm font-bold hover:bg-olive-800 transition-colors cursor-pointer border-0"
          >
            <Plus size={15} /> Adopt Village
          </button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: "Total Villages",   value: pagination.total,                                    isLime: false },
          { label: "Active Adoptions", value: villages.filter(v => v.status === "active").length,    isLime: true  },
          { label: "Paused",           value: villages.filter(v => v.status === "paused").length,    isLime: false },
          { label: "Completed",        value: villages.filter(v => v.status === "completed").length, isLime: false },
        ].map(({ label, value, isLime }) => (
          <div
            key={label}
            className={`${isLime ? "bg-lime" : "bg-beige-100"} rounded-2xl px-5 py-4`}
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-olive-900 leading-none">
              {value}
            </div>
            <div className={`text-xs font-semibold mt-1 ${isLime ? "text-olive-700" : "text-olive-500"}`}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Feedback message ────────────────────────────────────────────────── */}
      {msg.text && (
        <div className={`px-4 py-3 rounded-xl mb-5 text-sm font-semibold border ${
          msg.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {msg.text}
        </div>
      )}

      {/* ── Status Filters ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "active", "paused", "completed"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${
              statusFilter === s
                ? "bg-olive-900 text-lime border-olive-900"
                : "bg-white text-olive-600 border-beige-200 hover:border-olive-400"
            }`}
          >
            {s === "all" ? "All" : STATUS_META[s]?.label}
          </button>
        ))}
      </div>

      {/* ── Village Grid ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-olive-400">
          <Loader2 size={22} className="animate-spin" /> Loading villages…
        </div>
      ) : villages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-beige-200">
          <MapPin size={40} className="text-beige-300 mx-auto mb-3" />
          <p className="text-olive-400 m-0 mb-4">No villages adopted yet.</p>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="px-5 py-2.5 rounded-xl bg-olive-900 text-lime font-semibold text-sm cursor-pointer border-0 hover:bg-olive-800 transition-colors"
          >
            Adopt First Village
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {villages.map(v => (
            <VillageCard
              key={v._id}
              village={v}
              onEdit={(v) => setModal({ mode: "edit", village: v })}
              onDelete={handleDelete}
              onMilestone={setMilestoneTarget}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-xl border border-beige-200 bg-white text-olive-700 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-beige-50 transition-colors cursor-pointer"
          >
            ← Prev
          </button>
          <span className="text-sm text-olive-500">Page {page} of {pagination.pages}</span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-xl border border-beige-200 bg-white text-olive-700 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-beige-50 transition-colors cursor-pointer"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Recent Village Updates ───────────────────────────────────────────── */}
      {recentUpdates.length > 0 && (
        <div className="mt-10 bg-white rounded-2xl border border-beige-200 overflow-hidden">
          <div className="px-5 sm:px-6 py-5 border-b border-beige-100">
            <h2 className="text-lg sm:text-xl font-extrabold text-olive-900 m-0 p-0">
              Recent Village Updates
            </h2>
            <p className="text-sm text-olive-400 mt-0.5 m-0">
              Real-time field reports from project leads
            </p>
          </div>

          <ul className="divide-y divide-beige-100 list-none m-0 p-0">
            {recentUpdates.map((update, i) => (
              <li
                key={update._id || i}
                className="flex items-start gap-3 px-5 sm:px-6 py-4 hover:bg-beige-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-olive-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Star size={14} className="text-olive-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-olive-900 truncate">{update.title}</div>
                  <div className="flex items-center gap-1.5 text-xs text-olive-400 mt-0.5">
                    <MapPin size={10} />
                    <span className="truncate">
                      {update.villageName} · {update.district}, {update.state}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-olive-400 flex-shrink-0 mt-0.5">
                  {fmtDate(update.achievedAt)}
                </div>
              </li>
            ))}
          </ul>

          <div className="px-5 sm:px-6 py-3 border-t border-beige-100">
            <button
              onClick={() => setStatusFilter("active")}
              className="text-sm font-semibold text-olive-600 hover:text-olive-900 transition-colors flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0"
            >
              See All Updates <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Add Button (mobile only) ───────────────────────────────── */}
      <button
        onClick={() => setModal({ mode: "create" })}
        className="sm:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 px-5 py-3 rounded-full bg-olive-900 text-lime font-bold text-sm shadow-lg hover:bg-olive-800 transition-all cursor-pointer border-0"
      >
        <Plus size={16} /> Add Village
      </button>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
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
