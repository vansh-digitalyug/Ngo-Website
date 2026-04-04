import { useState, useEffect } from "react";
import {
  BarChart2, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Minus, FileText, CheckCircle, Trash2, Zap, X, Building2, MapPin,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { API_BASE_URL } from "./AdminLayout.jsx";

// ── Meta ──────────────────────────────────────────────────────────────────────
const STATUS_META = {
  draft:     { label: "Draft",     cls: "bg-beige-200 text-gray-600 border-beige-300",  Icon: FileText },
  published: { label: "Published", cls: "bg-olive-100 text-olive-700 border-olive-200", Icon: CheckCircle },
};

const PERIOD_LABELS = { monthly: "Monthly", quarterly: "Quarterly", annual: "Annual", custom: "Custom" };

const CAT_CLS = {
  beneficiaries: "bg-blue-50 text-blue-700",
  health:        "bg-olive-100 text-olive-700",
  education:     "bg-purple-50 text-purple-700",
  employment:    "bg-amber-50 text-amber-700",
  infrastructure:"bg-cyan-50 text-cyan-700",
  environment:   "bg-emerald-50 text-emerald-700",
  other:         "bg-beige-200 text-gray-600",
};

// kept as hex — recharts requires hex colors
const CHART_COLORS = {
  beneficiaries: "#2563eb", health: "#16a34a", education: "#7c3aed",
  employment: "#d97706", infrastructure: "#0891b2", environment: "#059669", other: "#64748b",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ── MetricChip ────────────────────────────────────────────────────────────────
function MetricChip({ m }) {
  const catCls  = CAT_CLS[m.category] || CAT_CLS.other;
  const catHex  = CHART_COLORS[m.category] || CHART_COLORS.other;
  const Icon    = m.changeType === "increase" ? TrendingUp : m.changeType === "decrease" ? TrendingDown : Minus;
  const changeCls = m.changeType === "increase" ? "text-olive-700" : m.changeType === "decrease" ? "text-red-600" : "text-gray-400";

  return (
    <div className="bg-beige-200 border border-beige-300 rounded-xl p-3 min-w-[120px]">
      <p className={`text-[10px] font-bold capitalize mb-0.5 ${catCls} px-1.5 py-0.5 rounded-full w-fit`}>
        {m.category}
      </p>
      <p className="font-extrabold text-lg mt-1 mb-0.5" style={{ color: catHex }}>
        {m.value}
        <span className="text-[11px] font-normal text-gray-400 ml-1">{m.unit}</span>
      </p>
      <p className="text-xs font-semibold text-gray-700 mb-0.5">{m.label}</p>
      {m.change != null && (
        <p className={`flex items-center gap-0.5 text-[10px] font-semibold ${changeCls}`}>
          <Icon size={10} /> {m.change}%
        </p>
      )}
    </div>
  );
}

// ── ReportCharts ──────────────────────────────────────────────────────────────
function ReportCharts({ metrics }) {
  if (!metrics || metrics.length === 0) return null;

  const barData = metrics.filter((m) => m.value > 0).map((m) => ({
    name: m.label.length > 16 ? m.label.slice(0, 14) + "…" : m.label,
    value: m.value, category: m.category, unit: m.unit,
  }));

  const catCount = metrics.reduce((acc, m) => { acc[m.category] = (acc[m.category] || 0) + 1; return acc; }, {});
  const pieData  = Object.entries(catCount).map(([cat, count]) => ({ name: cat, value: count, fill: CHART_COLORS[cat] || "#64748b" }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
      {barData.length > 0 && (
        <div>
          <p className="text-[10px] font-extrabold text-olive-600 uppercase tracking-widest mb-2">Metric Values</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 36 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} width={36} />
              <Tooltip formatter={(v, n, p) => [`${v} ${p.payload.unit || ""}`, p.payload.name]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={CHART_COLORS[d.category] || "#64748b"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {pieData.length > 1 && (
        <div>
          <p className="text-[10px] font-extrabold text-olive-600 uppercase tracking-widest mb-2">Category Breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false} style={{ fontSize: 9 }}>
                {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Expanded Detail ───────────────────────────────────────────────────────────
function ReportDetail({ r }) {
  return (
    <div className="px-4 py-4 sm:px-5 bg-beige-200 border-t border-beige-300">
      {r.summary && (
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">{r.summary}</p>
      )}
      {r.metrics?.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {r.metrics.map((m, i) => <MetricChip key={i} m={m} />)}
          </div>
          <ReportCharts metrics={r.metrics} />
        </>
      )}
      {r.highlights?.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-extrabold text-olive-700 uppercase tracking-widest mb-1">Highlights</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {r.highlights.map((h, i) => <li key={i} className="text-xs text-gray-600">{h}</li>)}
          </ul>
        </div>
      )}
      {r.challenges?.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-extrabold text-red-600 uppercase tracking-widest mb-1">Challenges</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {r.challenges.map((c, i) => <li key={i} className="text-xs text-gray-600">{c}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Mobile Card ───────────────────────────────────────────────────────────────
function ReportCard({ r, onDelete, onAutoUpdate }) {
  const [open, setOpen]       = useState(false);
  const [updating, setUpdating] = useState(false);
  const sm = STATUS_META[r.status] || STATUS_META.draft;

  const handleAutoUpdate = async (e) => {
    e.stopPropagation();
    if (!confirm("Re-pull live data for this report? Metrics, highlights, and summary will be overwritten.")) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE_URL}/api/impact-reports/admin/auto-update/${r._id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) onAutoUpdate(data.data.report);
      else alert(data.message || "Update failed");
    } catch { alert("Network error"); }
    finally { setUpdating(false); }
  };

  return (
    <div className="border-b border-beige-300 last:border-b-0">
      <div
        className="p-4 hover:bg-beige-200 transition-colors cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Title + actions */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="font-bold text-gray-900 text-sm leading-tight flex-1">{r.title}</p>
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleAutoUpdate}
              disabled={updating}
              title="Re-pull live data"
              className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${updating ? "bg-beige-200 text-gray-400 border-beige-300 cursor-not-allowed" : "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"}`}
            >
              <RefreshCw size={11} className={updating ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => onDelete(r._id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 cursor-pointer transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-2">{PERIOD_LABELS[r.reportPeriod] || r.reportPeriod}</p>

        {/* Status badge */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sm.cls}`}>
            <sm.Icon size={9} /> {sm.label}
          </span>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Building2 size={10} className="text-gray-400 shrink-0" />
            <span className="truncate">{r.ngoId?.ngoName || "—"}</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={10} className="text-gray-400 shrink-0" />
            <span className="truncate">{r.villageId?.villageName || "—"}</span>
          </span>
          <span className="text-xs text-gray-500">{r.metrics?.length || 0} metrics</span>
          <span className="text-xs text-gray-400">
            {r.periodStart && r.periodEnd
              ? `${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}`
              : fmtDate(r.createdAt)}
          </span>
        </div>

        {/* Expand indicator */}
        <div className="flex justify-center mt-2">
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </div>

      {open && <ReportDetail r={r} />}
    </div>
  );
}

// ── Desktop Row ───────────────────────────────────────────────────────────────
function ReportRow({ r, onDelete, onAutoUpdate }) {
  const [open, setOpen]         = useState(false);
  const [updating, setUpdating] = useState(false);
  const sm = STATUS_META[r.status] || STATUS_META.draft;

  const handleAutoUpdate = async (e) => {
    e.stopPropagation();
    if (!confirm("Re-pull live data for this report? Metrics, highlights, and summary will be overwritten.")) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE_URL}/api/impact-reports/admin/auto-update/${r._id}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) onAutoUpdate(data.data.report);
      else alert(data.message || "Update failed");
    } catch { alert("Network error"); }
    finally { setUpdating(false); }
  };

  return (
    <>
      <tr
        className="hover:bg-beige-200 transition-colors cursor-pointer border-b border-beige-200"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Report */}
        <td className="px-4 py-3.5 max-w-[220px]">
          <p className="font-bold text-sm text-gray-900 truncate">{r.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{PERIOD_LABELS[r.reportPeriod] || r.reportPeriod}</p>
        </td>

        {/* NGO */}
        <td className="px-4 py-3.5">
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <Building2 size={11} className="text-gray-400 shrink-0" />
            {r.ngoId?.ngoName || "—"}
          </span>
        </td>

        {/* Village */}
        <td className="px-4 py-3.5">
          <span className="text-xs text-gray-500">{r.villageId?.villageName || "—"}</span>
        </td>

        {/* Status */}
        <td className="px-4 py-3.5">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${sm.cls}`}>
            <sm.Icon size={10} /> {sm.label}
          </span>
        </td>

        {/* Metrics */}
        <td className="px-4 py-3.5">
          <span className="text-xs text-gray-600">{r.metrics?.length || 0} metrics</span>
        </td>

        {/* Period */}
        <td className="px-4 py-3.5">
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {r.periodStart && r.periodEnd
              ? `${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}`
              : fmtDate(r.createdAt)}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAutoUpdate}
              disabled={updating}
              title="Re-pull live data"
              className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${updating ? "bg-beige-200 text-gray-400 border-beige-300 cursor-not-allowed" : "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"}`}
            >
              <RefreshCw size={13} className={updating ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => onDelete(r._id)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 cursor-pointer transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={7} className="p-0">
            <ReportDetail r={r} />
          </td>
        </tr>
      )}
    </>
  );
}

// ── Auto-Generate Modal ───────────────────────────────────────────────────────
function AdminAutoGenModal({ onClose, onGenerated }) {
  const today        = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const lastOfMonth  = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [form, setForm]           = useState({ reportPeriod: "monthly", periodStart: firstOfMonth, periodEnd: lastOfMonth });
  const [generating, setGenerating] = useState(false);
  const [error, setError]         = useState("");
  const [visible, setVisible]     = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handlePeriodChange = (period) => {
    const now = new Date();
    let start, end;
    if (period === "monthly") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === "quarterly") {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q * 3, 1);
      end   = new Date(now.getFullYear(), q * 3 + 3, 0);
    } else if (period === "annual") {
      start = new Date(now.getFullYear(), 0, 1);
      end   = new Date(now.getFullYear(), 11, 31);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    setForm((f) => ({ ...f, reportPeriod: period, periodStart: start.toISOString().slice(0, 10), periodEnd: end.toISOString().slice(0, 10) }));
  };

  const generate = async () => {
    setGenerating(true); setError("");
    try {
      const res  = await fetch(`${API_BASE_URL}/api/impact-reports/admin/auto-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { onGenerated(data.data.report); onClose(); }
      else setError(data.message || "Generation failed");
    } catch { setError("Network error"); }
    finally { setGenerating(false); }
  };

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6 transition-all duration-300 ${visible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"}`}
      onClick={onClose}
    >
      <div
        className={`bg-beige-100 rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-lg overflow-hidden shadow-2xl transition-all duration-300 ease-out ${visible ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-full opacity-0 sm:scale-95 sm:translate-y-6"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-gray-900 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-amber-400" />
              <h2 className="text-lg font-extrabold text-white m-0">Auto-Generate Report</h2>
            </div>
            <p className="text-xs text-white/60">Aggregates live data across all NGOs on the platform</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs font-extrabold text-blue-700 mb-2">Auto-pulls from:</p>
            <div className="flex flex-wrap gap-1.5">
              {["Volunteers", "Events", "Villages", "Fund Ledger", "Employment", "Surveys", "Problems"].map((t) => (
                <span key={t} className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Period type */}
          <div>
            <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wide block mb-2">Period Type</label>
            <div className="flex flex-wrap gap-1.5">
              {["monthly", "quarterly", "annual", "custom"].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                    form.reportPeriod === p
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-beige-200 text-gray-600 border-beige-300 hover:border-beige-400"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">From</label>
              <input
                type="date"
                value={form.periodStart}
                onChange={(e) => setForm((f) => ({ ...f, periodStart: e.target.value }))}
                className="w-full bg-beige-200 border border-beige-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-olive-400 text-gray-700"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">To</label>
              <input
                type="date"
                value={form.periodEnd}
                onChange={(e) => setForm((f) => ({ ...f, periodEnd: e.target.value }))}
                className="w-full bg-beige-200 border border-beige-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-olive-400 text-gray-700"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Report will be <strong className="text-gray-600">published publicly</strong> immediately and visible on the Our Impact page.
          </p>

          {/* Footer buttons */}
          <div className="flex gap-2.5 justify-end pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-beige-300 bg-beige-200 text-gray-700 text-sm font-semibold hover:border-beige-400 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={generate}
              disabled={generating}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors cursor-pointer border-0 ${generating ? "bg-gray-400 cursor-not-allowed" : "bg-olive-700 hover:bg-olive-800"}`}
            >
              {generating
                ? <><RefreshCw size={14} className="animate-spin" /> Generating…</>
                : <><Zap size={14} /> Generate Report</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminImpactReports() {
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [pagination, setPagination]   = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [autoGenModal, setAutoGenModal] = useState(false);
  const token = localStorage.getItem("token");

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 25 });
    if (statusFilter !== "all") params.set("status", statusFilter);
    fetch(`${API_BASE_URL}/api/impact-reports/admin/all?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setReports(d.data.reports); setPagination(d.data.pagination); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(1); }, [statusFilter]);
  useEffect(() => { load(page); }, [page]);

  const deleteReport = (id) => {
    if (!confirm("Delete this impact report?")) return;
    fetch(`${API_BASE_URL}/api/impact-reports/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setReports((rs) => rs.filter((r) => r._id !== id)); })
      .catch(() => {});
  };

  const onAutoUpdate = (updated) => {
    setReports((rs) => rs.map((r) => r._id === updated._id ? updated : r));
  };

  return (
    <div className="min-h-screen bg-beige-300 p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-1">
            Impact <span className="text-olive-700">Reports</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            {pagination.total} report{pagination.total !== 1 ? "s" : ""} across all NGOs
          </p>
        </div>
        <button
          onClick={() => setAutoGenModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-olive-700 hover:bg-olive-800 text-white text-sm font-bold transition-colors cursor-pointer border-0 shrink-0 self-start"
        >
          <Zap size={14} /> Auto Generate
        </button>
      </div>

      {/* ── Status Filter Pills ── */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5 sm:mb-6">
        {["all", "draft", "published"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold cursor-pointer transition-all border whitespace-nowrap ${
              statusFilter === s
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-beige-100 text-gray-600 border-beige-300 hover:border-beige-400"
            }`}
          >
            {s === "all" ? "All Status" : STATUS_META[s]?.label || s}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <RefreshCw size={20} className="animate-spin" />
          <span className="text-sm">Loading reports…</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No impact reports found.</p>
          <p className="text-xs mt-1 text-gray-400">Try adjusting your filters or generate a new report</p>
        </div>
      ) : (
        <div className="bg-beige-100 rounded-2xl sm:rounded-3xl border border-beige-300 overflow-hidden">

          {/* ── Mobile cards ── */}
          <div className="sm:hidden">
            {reports.map((r) => (
              <ReportCard key={r._id} r={r} onDelete={deleteReport} onAutoUpdate={onAutoUpdate} />
            ))}
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-beige-200 border-b border-beige-300">
                  {["Report", "NGO", "Village", "Status", "Metrics", "Period", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-olive-600 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <ReportRow key={r._id} r={r} onDelete={deleteReport} onAutoUpdate={onAutoUpdate} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6 sm:mt-8 pt-5 border-t border-beige-300">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-beige-300 bg-beige-100 text-sm font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:border-beige-400 transition-colors"
          >
            <ChevronLeft size={15} /> Prev
          </button>
          <span className="text-sm text-gray-500 font-medium">
            Page {page} of {pagination.pages}
            <span className="hidden sm:inline"> · {pagination.total} total</span>
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-beige-300 bg-beige-100 text-sm font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:border-beige-400 transition-colors"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── Auto-Generate Modal ── */}
      {autoGenModal && (
        <AdminAutoGenModal
          onClose={() => setAutoGenModal(false)}
          onGenerated={(r) => {
            setReports((prev) => [r, ...prev]);
            setPagination((p) => ({ ...p, total: p.total + 1 }));
          }}
        />
      )}
    </div>
  );
}
