import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, X, Loader2,
  TrendingUp, TrendingDown, RefreshCw, Download,
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const token   = () => localStorage.getItem("token");
const fmtINR  = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

const AVATAR_HEX = [
  "#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444",
  "#8b5cf6","#ec4899","#14b8a6","#f97316","#84cc16",
];
const avatarColor = (name) => AVATAR_HEX[(name?.charCodeAt(0) || 0) % AVATAR_HEX.length];
const fakeRefId = (id) => {
  const num = parseInt((id || "").slice(-5), 16) % 99999 || 10001;
  const suffix = (id || "XX").slice(-2).toUpperCase();
  return `TXN-${String(num).padStart(5, "0")}-${suffix}`;
};
const initials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

const CATEGORIES = [
  "donation","govt_grant","salary","materials","event",
  "operations","village_work","medical","education","other",
];
const CAT_LABELS = {
  donation: "Donation", govt_grant: "Govt Grant", salary: "Salaries",
  materials: "Materials", event: "Events", operations: "Operations",
  village_work: "Village Work", medical: "Medical", education: "Education", other: "Other",
};
const CAT_BADGE = {
  donation:     "bg-emerald-50 text-emerald-700",
  govt_grant:   "bg-sky-50 text-sky-700",
  salary:       "bg-purple-50 text-purple-700",
  materials:    "bg-orange-50 text-orange-700",
  event:        "bg-cyan-50 text-cyan-700",
  operations:   "bg-slate-100 text-slate-600",
  village_work: "bg-amber-50 text-amber-700",
  medical:      "bg-red-50 text-red-700",
  education:    "bg-violet-50 text-violet-700",
  other:        "bg-gray-100 text-gray-600",
};

const inputCls = "w-full rounded-lg border border-beige-200 bg-beige-50 px-3 py-2.5 text-sm text-olive-900 placeholder-olive-300 focus:outline-none focus:ring-2 focus:ring-olive-400 focus:border-transparent transition";
const labelCls = "block text-xs font-semibold text-olive-500 uppercase tracking-wide mb-1";

// ── Entry Form Modal ──────────────────────────────────────────────────────────
function EntryModal({ entry, ngos, onClose, onSaved }) {
  const isEdit = Boolean(entry);
  const [form, setForm] = useState(isEdit ? {
    ngoId:        entry.ngoId?._id || entry.ngoId || "",
    type:         entry.type || "debit",
    amount:       entry.amount || "",
    category:     entry.category || "other",
    description:  entry.description || "",
    referenceId:  entry.referenceId || "",
    date:         entry.date ? new Date(entry.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    isPublic:     entry.isPublic !== false,
  } : {
    ngoId: "", type: "debit", amount: "", category: "other",
    description: "", referenceId: "",
    date: new Date().toISOString().slice(0, 10),
    isPublic: true,
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) < 1) { setErr("Valid amount required"); return; }
    if (!form.description.trim())                { setErr("Description required"); return; }
    setSaving(true); setErr("");
    try {
      const url = isEdit
        ? `${API_BASE_URL}/api/fund-ledger/${entry._id}`
        : `${API_BASE_URL}/api/fund-ledger/admin/entries`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      onSaved(d.data.entry);
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
            {isEdit ? "Edit Entry" : "Add Fund Entry"}
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

          {/* Type toggle */}
          <div>
            <label className={labelCls}>Entry Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {["credit", "debit"].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 font-bold text-sm transition-colors cursor-pointer ${
                    form.type === t
                      ? t === "credit"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-red-400 bg-red-50 text-red-700"
                      : "border-beige-200 bg-white text-olive-500 hover:border-olive-300"
                  }`}
                >
                  {t === "credit" ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                  {t === "credit" ? "Credit (Income)" : "Debit (Expense)"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Amount (₹) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => set("amount", e.target.value)}
                className={inputCls}
                placeholder="0"
                min={1}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => set("date", e.target.value)}
                className={inputCls}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Category *</label>
            <select
              value={form.category}
              onChange={e => set("category", e.target.value)}
              className={inputCls}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Description *</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={2}
              className={`${inputCls} resize-y`}
              placeholder="What was this transaction for?"
              required
            />
          </div>

          <div>
            <label className={labelCls}>Reference ID (optional)</label>
            <input
              value={form.referenceId}
              onChange={e => set("referenceId", e.target.value)}
              className={inputCls}
              placeholder="Invoice no., cheque no., order ID..."
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-olive-700">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={e => set("isPublic", e.target.checked)}
              className="w-4 h-4 accent-olive-700"
            />
            Show on public transparency page
          </label>

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
              className={`px-6 py-2.5 rounded-lg font-bold text-sm text-white transition-colors cursor-pointer flex items-center gap-2 border-0 disabled:opacity-50 ${
                form.type === "credit"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : isEdit ? "Save Changes" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminFundLedger() {
  const [entries,    setEntries]    = useState([]);
  const [ngos,       setNgos]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter,  setCatFilter]  = useState("all");
  const [msg,        setMsg]        = useState({ type: "", text: "" });
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [summary,    setSummary]    = useState({ totals: { credit: 0, debit: 0 }, byCategory: {} });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const LIMIT = 25;

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: LIMIT });
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (catFilter  !== "all") params.set("category", catFilter);
      const res = await fetch(`${API_BASE_URL}/api/fund-ledger/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token()}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) { setEntries(d.data.entries); setPagination(d.data.pagination); }
    } catch { showMsg("error", "Failed to load ledger"); }
    finally { setLoading(false); }
  };

  const loadSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/fund-ledger/public/summary`, { credentials: "include" });
      const d = await res.json();
      if (d.success) setSummary(d.data);
    } catch {}
  };

  const loadNgos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ngos?status=verified&limit=100`, {
        headers: { Authorization: `Bearer ${token()}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) setNgos(d.data?.ngos || d.data || []);
    } catch {}
  };

  useEffect(() => { load(1); setPage(1); }, [typeFilter, catFilter]);
  useEffect(() => { load(page); },           [page]);
  useEffect(() => { loadSummary(); loadNgos(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/fund-ledger/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` }, credentials: "include",
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      setEntries(e => e.filter(x => x._id !== id));
      loadSummary();
      showMsg("success", "Entry deleted");
    } catch (e) { showMsg("error", e.message); }
  };

  const handleSaved = (entry) => {
    setEntries(prev => {
      const exists = prev.find(e => e._id === entry._id);
      return exists ? prev.map(e => e._id === entry._id ? entry : e) : [entry, ...prev];
    });
    loadSummary();
    showMsg("success", modal?.entry ? "Entry updated!" : "Entry added!");
    setModal(null);
  };

  const exportCSV = () => {
    const headers = ["Date", "NGO", "Type", "Category", "Description", "Amount", "Ref ID"];
    const rows = entries.map(e => [
      fmtDate(e.date),
      e.ngoId?.ngoName || "—",
      e.type,
      CAT_LABELS[e.category] || e.category,
      `"${(e.description || "").replace(/"/g, '""')}"`,
      e.amount,
      e.referenceId || fakeRefId(e._id),
    ]);
    const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "fund-ledger.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const balance    = summary.totals.credit - summary.totals.debit;
  const allocation = summary.totals.credit > 0
    ? ((summary.totals.debit / summary.totals.credit) * 100).toFixed(0)
    : 0;
  const retainPct  = summary.totals.credit > 0
    ? ((balance / summary.totals.credit) * 100).toFixed(1)
    : 0;

  const pageStart = (page - 1) * LIMIT + 1;
  const pageEnd   = Math.min(page * LIMIT, pagination.total);

  // Visible page numbers around current
  const visiblePages = [];
  for (let i = Math.max(1, page - 1); i <= Math.min(pagination.pages, page + 1); i++) {
    visiblePages.push(i);
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight m-0 p-0">
            <span className="text-olive-900">Fund</span><br />
            <span className="text-olive-600">Ledger.</span>
          </h1>
          <p className="text-sm text-olive-500 mt-2 m-0">
            Real-time radical transparency audit log
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => { load(page); loadSummary(); }}
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-beige-100 border border-beige-200 text-olive-700 text-xs sm:text-sm font-semibold hover:bg-beige-200 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setModal({ mode: "create" })}
              className="flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl bg-olive-900 text-lime text-xs sm:text-sm font-bold hover:bg-olive-800 transition-colors cursor-pointer border-0"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Entry</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {/* Balance — dark card */}
        <div className="bg-olive-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-olive-700 flex items-center justify-center">
              <span className="text-lime font-extrabold text-base">₹</span>
            </div>
            <span className="bg-lime text-olive-900 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
              Live Balance
            </span>
          </div>
          <p className="text-olive-300 text-xs font-semibold uppercase tracking-widest m-0 mb-2">
            Total Available Impact Funds
          </p>
          <p className="text-white text-3xl sm:text-4xl font-extrabold m-0 leading-tight">
            {fmtINR(balance)}
          </p>
          {retainPct > 0 && (
            <p className="text-olive-300 text-xs mt-2 m-0">
              {retainPct}% of inflow retained
            </p>
          )}
        </div>

        {/* Total Inflow */}
        <div className="bg-white rounded-2xl border border-beige-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-olive-400 uppercase tracking-widest m-0">This Period</p>
              <p className="text-emerald-600 text-sm font-extrabold m-0">+{retainPct}%</p>
            </div>
          </div>
          <p className="text-olive-400 text-xs font-semibold uppercase tracking-widest m-0 mb-1">
            Total Inflow (Credit)
          </p>
          <p className="text-olive-900 text-2xl sm:text-3xl font-extrabold m-0 leading-tight">
            {fmtINR(summary.totals.credit)}
          </p>
        </div>

        {/* Total Outflow */}
        <div className="bg-white rounded-2xl border border-beige-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown size={18} className="text-red-500" />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-olive-400 uppercase tracking-widest m-0">Allocation</p>
              <p className="text-red-500 text-sm font-extrabold m-0">{allocation}% Deploy</p>
            </div>
          </div>
          <p className="text-olive-400 text-xs font-semibold uppercase tracking-widest m-0 mb-1">
            Total Outflow (Debit)
          </p>
          <p className="text-olive-900 text-2xl sm:text-3xl font-extrabold m-0 leading-tight">
            {fmtINR(summary.totals.debit)}
          </p>
        </div>
      </div>

      {/* ── Feedback ────────────────────────────────────────────────────────── */}
      {msg.text && (
        <div className={`px-4 py-3 rounded-xl mb-5 text-sm font-semibold border ${
          msg.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {msg.text}
        </div>
      )}

      {/* ── Transaction Details Section ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-beige-200 overflow-hidden">

        {/* Section header */}
        <div className="flex flex-col gap-4 px-0 sm:px-6 py-5 border-b border-beige-100 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-olive-900 m-0 p-0">
              Transaction Details
            </h2>
            <p className="text-xs sm:text-sm text-olive-400 mt-0.5 m-0">
              Complete audit log of all fund movements
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Type filters */}
            <div className="flex gap-1.5">
              {["all", "credit", "debit"].map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    typeFilter === t
                      ? t === "credit"
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : t === "debit"
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-olive-900 border-olive-900 text-lime"
                      : "bg-beige-50 border-beige-200 text-olive-600 hover:border-olive-400"
                  }`}
                >
                  {t === "all" ? "All" : t === "credit" ? "Credit" : "Debit"}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="px-2.5 sm:px-3 py-1.5 border border-beige-200 rounded-lg text-xs font-semibold text-olive-700 bg-beige-50 outline-none cursor-pointer hover:border-olive-400 transition-colors"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-beige-200 bg-beige-50 text-olive-600 text-xs font-semibold hover:bg-beige-100 transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>

        {/* Table / Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-olive-400">
            <Loader2 size={22} className="animate-spin" /> Loading…
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-olive-400">No entries found.</div>
        ) : (
          <>
            {/* ── Mobile card list (hidden on sm+) ── */}
            <ul className="sm:hidden divide-y divide-beige-100 list-none m-0 p-0">
              {entries.map((e) => {
                const ngoName = e.ngoId?.ngoName || "Platform";
                const bg      = avatarColor(ngoName);
                return (
                  <li key={e._id} className="px-4 py-4 hover:bg-beige-50 transition-colors">
                    {/* Row 1: Avatar + NGO + Amount */}
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: bg }}
                        >
                          {initials(ngoName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-olive-900 m-0 truncate">{ngoName}</p>
                          <p className="text-xs text-olive-400 m-0">{fmtDate(e.date)}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-extrabold m-0 ${e.type === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                          {e.type === "credit" ? "+" : "−"}{fmtINR(e.amount)}
                        </p>
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase ${
                          e.type === "credit" ? "text-emerald-600" : "text-red-500"
                        }`}>
                          {e.type === "credit" ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                          {e.type}
                        </span>
                      </div>
                    </div>

                    {/* Row 2: Category + Description */}
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${CAT_BADGE[e.category] || CAT_BADGE.other}`}>
                        {CAT_LABELS[e.category] || e.category}
                      </span>
                      <p className="text-xs text-olive-600 m-0 line-clamp-2">{e.description}</p>
                    </div>

                    {/* Row 3: Ref ID + Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-olive-400 font-mono">{e.referenceId || fakeRefId(e._id)}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setModal({ mode: "edit", entry: e })}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-beige-100 hover:bg-beige-200 text-olive-600 transition-colors border-0 cursor-pointer"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(e._id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors border-0 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* ── Desktop table (hidden below sm) ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-beige-50 border-b border-beige-100">
                    {["DATE", "NGO PARTNER", "TYPE", "CATEGORY", "DESCRIPTION", "AMOUNT", "REF ID", ""].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-bold text-olive-400 uppercase tracking-widest whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-50">
                  {entries.map((e) => {
                    const ngoName = e.ngoId?.ngoName || "Platform";
                    const bg      = avatarColor(ngoName);
                    return (
                      <tr key={e._id} className="hover:bg-beige-50 transition-colors">

                        {/* Date */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs font-semibold text-olive-800 leading-snug">
                            {fmtDate(e.date)}
                          </div>
                          <div className="text-[10px] text-olive-400">{fmtTime(e.date)} GMT</div>
                        </td>

                        {/* NGO */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                              style={{ background: bg }}
                            >
                              {initials(ngoName)}
                            </div>
                            <span className="text-sm text-olive-800 font-medium max-w-[110px] truncate">
                              {ngoName}
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                            e.type === "credit"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {e.type === "credit" ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                            {e.type}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${CAT_BADGE[e.category] || CAT_BADGE.other}`}>
                            {CAT_LABELS[e.category] || e.category}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="text-sm text-olive-700 m-0 line-clamp-2">{e.description}</p>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-sm font-extrabold ${
                            e.type === "credit" ? "text-emerald-600" : "text-red-600"
                          }`}>
                            {e.type === "credit" ? "+" : "−"}{fmtINR(e.amount)}
                          </span>
                        </td>

                        {/* Ref ID */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-olive-500 font-mono">{e.referenceId || fakeRefId(e._id)}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setModal({ mode: "edit", entry: e })}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-beige-100 hover:bg-beige-200 text-olive-600 transition-colors border-0 cursor-pointer"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(e._id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors border-0 cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col gap-3 px-0 sm:px-6 py-4 border-t border-beige-100 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs sm:text-sm text-olive-500">
              Showing {pageStart}–{pageEnd} of {pagination.total} transactions
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-beige-200 bg-white text-olive-600 hover:border-olive-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm flex-shrink-0"
              >
                ‹
              </button>
              {visiblePages.map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors cursor-pointer border-0 flex-shrink-0 ${
                    p === page
                      ? "bg-olive-900 text-lime"
                      : "bg-beige-100 text-olive-600 hover:bg-beige-200"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-beige-200 bg-white text-olive-600 hover:border-olive-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm flex-shrink-0"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {modal && (
        <EntryModal
          entry={modal.entry}
          ngos={ngos}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
