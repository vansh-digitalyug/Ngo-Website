import { useState, useEffect, useCallback } from "react";
import {
  BarChart2, Eye, Trash2, X, ChevronLeft, ChevronRight,
  Loader, MoreHorizontal, CheckCircle2, XCircle, MapPin, Search,
  Wallet, Megaphone, Clock,
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const LIMIT = 8;
const STATUS_OPTIONS = ["Pending", "Under Review", "Approved", "Rejected"];

const INCOME_LABELS = {
  "below1L": "Below 1,00,000",
  "1to1.5L": "₹1,00,000 – ₹1,50,000",
  "1.5to2L": "₹1,50,000 – ₹2,00,000",
  "2to2.5L": "₹2,00,000 – ₹2,50,000",
};

/* Status pill in table */
const STATUS_CFG = {
  "Pending":      { dot: "bg-yellow-400", pill: "border border-yellow-300 text-yellow-700 bg-yellow-50" },
  "Under Review": { dot: "bg-blue-400",   pill: "border border-blue-300 text-blue-700 bg-blue-50"       },
  "Approved":     { dot: "bg-green-500",  pill: "border border-green-400 text-green-700 bg-green-50"    },
  "Rejected":     { dot: "bg-red-400",    pill: "border border-red-300 text-red-600 bg-red-50"          },
};

/* Status hero-card in modal */
const STATUS_CARD_CFG = {
  "Pending":      { bg: "bg-yellow-50",   text: "text-yellow-700",   Icon: Clock         },
  "Under Review": { bg: "bg-blue-50",     text: "text-blue-700",     Icon: Eye           },
  "Approved":     { bg: "bg-[#eef8e4]",   text: "text-[#2d5a1b]",   Icon: CheckCircle2  },
  "Rejected":     { bg: "bg-red-100",     text: "text-red-700",      Icon: XCircle       },
};

const PALETTE = [
  { bg: "#c8f56a", text: "#2d5a1b" },
  { bg: "#fde68a", text: "#92400e" },
  { bg: "#c7d9f0", text: "#1e40af" },
  { bg: "#fecaca", text: "#991b1b" },
  { bg: "#d8e8b8", text: "#3a5c1a" },
  { bg: "#e9d5ff", text: "#6d28d9" },
  { bg: "#fed7aa", text: "#9a3412" },
  { bg: "#d1fae5", text: "#065f46" },
];
const avatarStyle = (name) => PALETTE[(name || " ").charCodeAt(0) % PALETTE.length];
const getInitials = (name) =>
  (name || "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function pageRange(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "...", total];
  if (current >= total - 2) return [1, "...", total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "numeric", year: "numeric" }) : "—";

const formatDateLong = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { dot: "bg-gray-400", pill: "border border-gray-300 text-gray-600 bg-gray-50" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  );
}

/* ════════════════════════════════════════════════════ */
function AdminKanyadan() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, underReview: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionLoading, setActionLoading] = useState(null);

  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState("");

  const token = localStorage.getItem("token");

  const fetchStats = useCallback(() => {
    fetch(`${API_BASE_URL}/api/admin/kanyadan/stats`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, [token]);

  const fetchApplications = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`${API_BASE_URL}/api/admin/kanyadan?${params}`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const apps = d.data.applications || [];
          setApplications(apps);
          const p = d.data.pagination || {};
          const total =
            p.total ?? p.count ?? p.totalCount ?? p.totalDocs ??
            d.data.total ?? d.data.count ?? apps.length;
          setPagination({ total, pages: Math.ceil(total / LIMIT) || 1 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, page, search, statusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const openModal = (app) => {
    setSelected(app);
    setNewStatus(app.status);
    setAdminNote(app.adminNote || "");
    setModalError("");
    requestAnimationFrame(() => requestAnimationFrame(() => setModalOpen(true)));
  };
  const closeModal = () => {
    if (updating) return;
    setModalOpen(false);
    setTimeout(() => setSelected(null), 320);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) { setModalError("Please select a status."); return; }
    setUpdating(true);
    setModalError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/kanyadan/${selected._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status: newStatus, adminNote }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");
      closeModal();
      fetchApplications();
      fetchStats();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/kanyadan/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }, credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message);
      fetchApplications();
      fetchStats();
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const showFrom = pagination.total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const showTo   = Math.min(page * LIMIT, pagination.total);

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8]">
      <div className="p-4 sm:p-6 lg:p-8">

        {/* ══ HEADER ══ */}
        <div className="mb-8">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#2d5a1b] mb-2 m-0">
            Application Management
          </p>
          <h1 className="text-[2rem] sm:text-[2.8rem] font-black text-gray-900 leading-tight m-0 mb-3">
            Kanyadan Yojna Applications
          </h1>
          <p className="text-sm sm:text-base text-gray-500 m-0 max-w-xl leading-relaxed">
            LIC policy enrollment applications for underprivileged girls. Empowering
            communities through radical transparency and financial inclusion.
          </p>
        </div>

        {/* ══ STAT CARDS ══ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">

          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between min-h-[130px]">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 m-0">Total</p>
              <BarChart2 size={18} className="text-gray-300" />
            </div>
            <div>
              <p className="text-5xl font-black text-gray-900 leading-none m-0 mb-1">
                {String(stats.total).padStart(2, "0")}
              </p>
              <p className="text-xs text-[#2d5a1b] font-semibold m-0">+12% vs last month</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between min-h-[130px]">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 m-0">Pending</p>
              <MoreHorizontal size={18} className="text-gray-300" />
            </div>
            <p className="text-5xl font-black text-gray-900 leading-none m-0">
              {String(stats.pending).padStart(2, "0")}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 flex flex-col justify-between min-h-[130px] border-l-4 border-gray-200">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 m-0 leading-tight">
                Under<br />Review
              </p>
              <Eye size={18} className="text-gray-300" />
            </div>
            <p className="text-5xl font-black text-gray-900 leading-none m-0">
              {String(stats.underReview).padStart(2, "0")}
            </p>
          </div>

          <div className="bg-[#c8f56a] rounded-2xl p-5 flex flex-col justify-between min-h-[130px]">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#2d5a1b] m-0">Approved</p>
              <CheckCircle2 size={18} className="text-[#2d5a1b]" />
            </div>
            <div>
              <p className="text-5xl font-black text-[#2d5a1b] leading-none m-0 mb-1">
                {String(stats.approved).padStart(2, "0")}
              </p>
              <p className="text-xs text-[#2d5a1b] font-semibold m-0">Action required: 0</p>
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl p-5 flex flex-col justify-between min-h-[130px]">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-black uppercase tracking-widest text-red-400 m-0">Rejected</p>
              <XCircle size={18} className="text-red-300" />
            </div>
            <p className="text-5xl font-black text-red-500 leading-none m-0">
              {String(stats.rejected).padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* ══ TABLE CARD ══ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Card top bar */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-black text-gray-900 m-0">Recent Enrollment Requests</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 px-5 py-3 bg-[#fafaf9] border-b border-gray-100">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, mobile, state..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer w-full sm:w-[160px]"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Loader size={28} className="animate-spin" />
              <p className="text-sm m-0">Loading applications…</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">No applications found.</div>
          ) : (
            <>
              {/* Desktop table (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Guardian", "Contact", "Girl's Name & Age", "Location", "Income Level", "Status", "Submitted", "Actions"].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const av   = avatarStyle(app.guardianName);
                      const busy = actionLoading === app._id;
                      return (
                        <tr key={app._id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                style={{ background: av.bg, color: av.text }}
                              >
                                {getInitials(app.guardianName)}
                              </div>
                              <span className="font-bold text-gray-900 text-sm leading-snug">{app.guardianName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">+91 {app.mobile}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-800 text-sm">{app.girlName}</span>
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[11px] font-semibold whitespace-nowrap">
                                {app.girlAge} yrs
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-700 m-0">{app.state}</p>
                            {app.district && <p className="text-xs text-gray-400 m-0 mt-0.5">{app.district}</p>}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-semibold whitespace-nowrap">
                              {INCOME_LABELS[app.annualIncome] || app.annualIncome}
                            </span>
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={app.status} /></td>
                          <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">{formatDate(app.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openModal(app)}
                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors border-0 cursor-pointer"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(app._id)}
                                disabled={busy}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors border-0 cursor-pointer disabled:opacity-40"
                              >
                                {busy ? <Loader size={14} className="animate-spin" /> : <Trash2 size={15} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards (< md) */}
              <div className="md:hidden divide-y divide-gray-100">
                {applications.map((app) => {
                  const av   = avatarStyle(app.guardianName);
                  const busy = actionLoading === app._id;
                  return (
                    <div key={app._id} className="px-4 py-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: av.bg, color: av.text }}
                        >
                          {getInitials(app.guardianName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm m-0 truncate">{app.guardianName}</p>
                          <p className="text-xs text-gray-400 m-0 mt-0.5">+91 {app.mobile}</p>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3 pl-[3.25rem]">
                        <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                          {app.girlName}, {app.girlAge} yrs
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <MapPin size={10} />
                          {[app.state, app.district].filter(Boolean).join(", ")}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          {INCOME_LABELS[app.annualIncome] || app.annualIncome}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                          {formatDate(app.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pl-[3.25rem]">
                        <button
                          onClick={() => openModal(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 border-0 cursor-pointer transition-colors"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => handleDelete(app._id)}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 border-0 cursor-pointer transition-colors disabled:opacity-40"
                        >
                          {busy ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ══ PAGINATION ══ */}
        {!loading && applications.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">
            <p className="text-sm text-gray-500 m-0">
              Showing{" "}
              <strong className="text-gray-800">{showFrom}–{showTo}</strong>
              {" "}of{" "}
              <strong className="text-gray-800">{pagination.total}</strong> applications
            </p>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              {pageRange(page, pagination.pages).map((n, i) =>
                n === "..." ? (
                  <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors cursor-pointer border-0 ${
                      page === n
                        ? "bg-[#2d5a1b] text-white shadow-sm"
                        : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.pages}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ══ DETAIL MODAL ══ */}
      {selected && (() => {
        const scfg = STATUS_CARD_CFG[selected.status] || STATUS_CARD_CFG["Pending"];
        const StatusIcon = scfg.Icon;
        const appYear = selected.createdAt ? new Date(selected.createdAt).getFullYear() : "";
        const appId   = selected._id?.slice(-4).toUpperCase();
        return (
          <>
            {/* Backdrop */}
            <div
              onClick={closeModal}
              className="fixed inset-0 z-[9998] transition-all duration-300"
              style={{ background: modalOpen ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)" }}
            />

            {/* Sheet: bottom on mobile, centred on sm+ */}
            <div className="fixed z-[9999] inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 pointer-events-none">
              <div
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto bg-[#f5f0e8] w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl transition-all duration-300 ease-out"
                style={{
                  transform: modalOpen ? "translateY(0)" : "translateY(40px)",
                  opacity:   modalOpen ? 1 : 0,
                }}
              >
                {/* Pull handle — mobile only */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                {/* ── Modal Header ── */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 m-0 leading-tight">Application Details</h2>
                    <p className="text-sm text-gray-400 m-0 mt-1">
                      ID: #Ka-{appYear}-{appId} &nbsp;•&nbsp; Submitted on {formatDateLong(selected.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    disabled={updating}
                    className="p-2 rounded-xl hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors border-0 bg-transparent cursor-pointer flex-shrink-0 mt-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* ── White inner card ── */}
                <div className="mx-4 mb-4 bg-white rounded-2xl p-5">

                  {/* Row 1: Status card + Guardian info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                    {/* Current Status card */}
                    <div className={`${scfg.bg} rounded-2xl p-5 flex flex-col justify-between min-h-[140px]`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest m-0 ${scfg.text}`}>
                        Current Status
                      </p>
                      <div className={`flex items-center gap-2.5 ${scfg.text}`}>
                        <StatusIcon size={28} strokeWidth={2} />
                        <span className="text-2xl font-black leading-tight">{selected.status}</span>
                      </div>
                    </div>

                    {/* Guardian / girl info grid */}
                    <div className="bg-[#f5f0e8] rounded-2xl p-5 grid grid-cols-2 gap-x-4 gap-y-4">
                      {[
                        ["Guardian Name", selected.guardianName],
                        ["Mobile Number", selected.mobile],
                        ["Girl's Name",   selected.girlName],
                        ["Girl's Age",    `${selected.girlAge} years`],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 m-0">{label}</p>
                          <p className="text-sm font-bold text-gray-900 m-0 break-words">{val || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row 2: Location · Income · How They Heard */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

                    <div className="bg-[#f5f0e8] rounded-2xl p-4">
                      <MapPin size={18} className="text-gray-400 mb-2" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 m-0">Location</p>
                      <p className="text-sm font-bold text-gray-900 m-0">{selected.state || "—"}</p>
                      {(selected.district || selected.village) && (
                        <p className="text-xs text-gray-500 m-0 mt-0.5">
                          {[selected.district, selected.village].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="bg-[#f5f0e8] rounded-2xl p-4">
                      <Wallet size={18} className="text-gray-400 mb-2" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 m-0">Annual Income</p>
                      <p className="text-sm font-bold text-gray-900 m-0">
                        {INCOME_LABELS[selected.annualIncome] || selected.annualIncome || "—"}
                      </p>
                    </div>

                    <div className="bg-[#f5f0e8] rounded-2xl p-4">
                      <Megaphone size={18} className="text-gray-400 mb-2" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 m-0">How They Heard</p>
                      <p className="text-sm font-bold text-gray-900 m-0">{selected.howHeard || "—"}</p>
                    </div>
                  </div>

                  {/* Additional message */}
                  {selected.message && (
                    <div className="bg-[#f5f0e8] rounded-2xl p-4 mb-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 m-0">Additional Message</p>
                      <p className="text-sm text-gray-700 m-0 leading-relaxed">{selected.message}</p>
                    </div>
                  )}

                  {/* Row 3: Update Status + Admin Note side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-900 mb-2 block">
                        Update Application Status
                      </label>
                      <div className="relative">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full appearance-none px-4 py-3 bg-[#f0ede8] border-0 rounded-2xl text-sm font-semibold text-gray-800 outline-none cursor-pointer pr-10"
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-900 mb-2 block">
                        Admin Note{" "}
                        <span className="font-normal text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Add internal notes for processing..."
                        className="w-full px-4 py-3 bg-[#f0ede8] border-0 rounded-2xl text-sm outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {modalError && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                      {modalError}
                    </div>
                  )}
                </div>

                {/* ── Modal Footer ── */}
                <div className="flex items-center justify-end gap-4 px-6 pb-6 pt-2">
                  <button
                    onClick={closeModal}
                    disabled={updating}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer border-0 bg-transparent px-2 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="px-8 py-3 rounded-full bg-[#c8f56a] hover:bg-[#b8e855] text-[#1a3a0a] text-sm font-black transition-colors cursor-pointer border-0 disabled:opacity-60 inline-flex items-center gap-2"
                  >
                    {updating ? <><Loader size={14} className="animate-spin" /> Saving…</> : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}

    </div>
  );
}

export default AdminKanyadan;
