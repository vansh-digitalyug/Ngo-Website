import { useState, useEffect, useCallback } from "react";
import { Star, Eye, Trash2, Send, X, ChevronLeft, ChevronRight, RefreshCw, MessageSquare } from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

// ── Helpers ───────────────────────────────────────────────────────────────────
const token       = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

const fmt = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const TYPE_META = {
  platform:  { label: "Platform",  cls: "bg-olive-100 text-olive-700" },
  ngo:       { label: "NGO",       cls: "bg-beige-300 text-gray-700" },
  volunteer: { label: "Volunteer", cls: "bg-olive-50 text-olive-600" },
  event:     { label: "Event",     cls: "bg-amber-50 text-amber-700" },
  community: { label: "Community", cls: "bg-olive-200 text-olive-800" },
  service:   { label: "Service",   cls: "bg-red-50 text-red-700" },
  other:     { label: "Other",     cls: "bg-beige-200 text-gray-600" },
};

const STATUS_META = {
  new:          { label: "New",          cls: "bg-red-50 text-red-700 border-red-200" },
  read:         { label: "Read",         cls: "bg-beige-200 text-gray-700 border-beige-300" },
  acknowledged: { label: "Acknowledged", cls: "bg-olive-100 text-olive-700 border-olive-200" },
  resolved:     { label: "Resolved",     cls: "bg-olive-200 text-olive-800 border-olive-300" },
};

function Badge({ meta, value }) {
  const m = meta[value] || { label: value, cls: "bg-beige-200 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${m.cls}`}>
      {m.label}
    </span>
  );
}

function Stars({ rating, size = 13 }) {
  if (!rating) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} fill={s <= rating ? "#f59e0b" : "none"} stroke={s <= rating ? "#f59e0b" : "#d1d5db"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

// ── Feedback Detail Modal ─────────────────────────────────────────────────────
function FeedbackModal({ item, onClose, onStatusUpdate, onReply, onDelete }) {
  const [visible, setVisible]   = useState(false);
  const [reply, setReply]       = useState("");
  const [status, setStatus]     = useState(item.status);
  const [note, setNote]         = useState(item.adminNote || "");
  const [saving, setSaving]     = useState(false);
  const [replying, setReplying] = useState(false);
  const [flash, setFlash]       = useState("");

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 3000); };

  const handleStatusSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/feedback/${item._id}/status`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ status, adminNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onStatusUpdate(item._id, status, note);
      showFlash("Status updated successfully.");
    } catch (e) { showFlash(`Error: ${e.message}`); }
    finally { setSaving(false); }
  };

  const handleReply = async () => {
    if (reply.trim().length < 5) { showFlash("Reply must be at least 5 characters."); return; }
    setReplying(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/feedback/${item._id}/reply`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ adminReply: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onReply(item._id);
      showFlash("Reply sent and marked as resolved.");
      setReply("");
    } catch (e) { showFlash(`Error: ${e.message}`); }
    finally { setReplying(false); }
  };

  return (
    <div
      className={`fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6 transition-all duration-300 ${
        visible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-beige-100 rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ease-out ${
        visible
          ? "translate-y-0 opacity-100 sm:scale-100"
          : "translate-y-full opacity-0 sm:scale-95 sm:translate-y-6"
      }`}>

        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1 bg-beige-300 rounded-full mx-auto mt-3 shrink-0" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-beige-300 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-olive-600 uppercase tracking-widest mb-1">Feedback Detail</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight m-0">{item.subject}</h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-beige-200 hover:bg-beige-300 flex items-center justify-center border-0 cursor-pointer text-gray-500 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Flash */}
          {flash && (
            <div className={`rounded-2xl px-4 py-3 text-sm font-semibold border ${
              flash.startsWith("Error")
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-olive-100 text-olive-800 border-olive-200"
            }`}>
              {flash}
            </div>
          )}

          {/* Submitter info grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Name",      item.name],
              ["Email",     item.email],
              ["Phone",     item.phone || "—"],
              ["Submitted", fmt(item.createdAt)],
            ].map(([k, v]) => (
              <div key={k} className="bg-beige-200 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-olive-600 uppercase tracking-widest mb-1">{k}</p>
                <p className="text-sm font-semibold text-gray-900 break-words leading-tight">{v}</p>
              </div>
            ))}
          </div>

          {/* Type / Status / Rating row */}
          <div className="flex flex-wrap gap-2">
            <Badge meta={TYPE_META} value={item.feedbackType} />
            <Badge meta={STATUS_META} value={item.status} />
            {item.targetName && (
              <span className="bg-beige-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold border border-beige-300">
                📌 {item.targetName}
              </span>
            )}
            {item.rating && (
              <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-amber-200">
                <Star size={11} fill="#f59e0b" stroke="#f59e0b" /> {item.rating}/5
              </span>
            )}
          </div>

          {/* Message */}
          <div className="bg-beige-200 border border-beige-300 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-olive-600 uppercase tracking-widest mb-2">Message</p>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{item.message}</p>
          </div>

          {/* Admin note */}
          {item.adminNote && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-2">Admin Note</p>
              <p className="text-sm text-amber-900">{item.adminNote}</p>
            </div>
          )}

          {/* Admin reply */}
          {item.adminReply && (
            <div className="bg-olive-100 border border-olive-200 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-olive-800 uppercase tracking-widest mb-2">
                Reply Sent · {fmt(item.repliedAt)}
              </p>
              <p className="text-sm text-olive-900">{item.adminReply}</p>
            </div>
          )}

          {/* Update Status */}
          <div className="bg-beige-200 border border-beige-300 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-bold text-olive-600 uppercase tracking-widest">Update Status</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_META).map(([v, m]) => (
                <button
                  key={v}
                  onClick={() => setStatus(v)}
                  className={`py-2 px-3 rounded-xl border-2 font-bold text-xs uppercase transition-all cursor-pointer ${
                    status === v ? `${m.cls} border-current` : "bg-beige-100 text-gray-600 border-beige-300 hover:border-beige-400"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Add an internal admin note (optional)..."
              className="w-full bg-beige-100 border border-beige-300 rounded-xl p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-olive-400 transition-all placeholder-gray-400"
            />
            <button
              onClick={handleStatusSave}
              disabled={saving}
              className="w-full bg-olive-700 hover:bg-olive-800 disabled:opacity-60 text-white border-0 rounded-full py-2.5 font-bold text-sm cursor-pointer transition-colors"
            >
              {saving ? "Saving…" : "Save Status"}
            </button>
          </div>

          {/* Send Reply */}
          {!item.adminReply && (
            <div className="bg-beige-200 border border-beige-300 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-bold text-olive-600 uppercase tracking-widest">Send Reply to User</p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Write your reply… (min 5 characters)"
                className="w-full bg-beige-100 border border-beige-300 rounded-xl p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-olive-400 transition-all placeholder-gray-400"
              />
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${reply.length > 0 && reply.length < 5 ? "text-red-500" : "text-gray-400"}`}>
                  {reply.length > 0 && reply.length < 5 ? `${5 - reply.length} more chars needed` : `${reply.length} chars`}
                </span>
                <button
                  onClick={handleReply}
                  disabled={replying || reply.trim().length < 5}
                  className={`flex items-center gap-2 border-0 rounded-full py-2.5 px-5 font-bold text-sm transition-all ${
                    replying || reply.trim().length < 5
                      ? "bg-beige-300 text-gray-400 cursor-not-allowed"
                      : "bg-olive-700 hover:bg-olive-800 text-white cursor-pointer"
                  }`}
                >
                  <Send size={13} /> {replying ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </div>
          )}

          {/* Delete */}
          <button
            onClick={() => { if (window.confirm("Permanently delete this feedback?")) onDelete(item._id); }}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full py-2.5 font-bold text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 size={14} /> Delete This Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminFeedback() {
  const [feedbacks, setFeedbacks]       = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [typeFilter, setType]       = useState("");
  const [ratingFilter, setRating]   = useState("");

  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const [selected, setSelected] = useState(null);
  const [flash, setFlash]       = useState("");

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 4000); };

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/feedback/stats`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch { /* silent */ }
    finally { setStatsLoading(false); }
  }, []);

  const fetchFeedbacks = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 12 });
      if (search)       params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter)   params.set("feedbackType", typeFilter);
      if (ratingFilter) params.set("rating", ratingFilter);

      const res  = await fetch(`${API_BASE_URL}/api/admin/feedback?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data.feedbacks || []);
        const p = data.data.pagination;
        setTotal(p?.total || 0);
        setTotalPages(Math.ceil((p?.total || 0) / 12) || 1);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, statusFilter, typeFilter, ratingFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); fetchFeedbacks(1); }, [search, statusFilter, typeFilter, ratingFilter]);
  useEffect(() => { fetchFeedbacks(page); }, [page]);

  const handleView = async (id) => {
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/feedback/${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data.feedback);
        setFeedbacks((prev) => prev.map((f) => f._id === id && f.status === "new" ? { ...f, status: "read" } : f));
      }
    } catch { /* silent */ }
  };

  const handleStatusUpdate = (id, status, adminNote) => {
    setFeedbacks((prev) => prev.map((f) => f._id === id ? { ...f, status, adminNote } : f));
    if (selected?._id === id) setSelected((s) => ({ ...s, status, adminNote }));
    fetchStats();
  };

  const handleReply = (id) => {
    setFeedbacks((prev) => prev.map((f) => f._id === id ? { ...f, status: "resolved" } : f));
    if (selected?._id === id) setSelected((s) => ({ ...s, status: "resolved" }));
    setSelected(null);
    showFlash("Reply sent successfully.");
    fetchStats();
  };

  const handleDelete = async (id) => {
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/feedback/${id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      setSelected(null);
      showFlash("Feedback deleted.");
      fetchStats();
    } catch (e) { showFlash(`Error: ${e.message}`); }
  };

  const STAT_CARDS = [
    { label: "Total",        value: statsLoading ? "…" : stats?.total },
    { label: "New / Unread", value: statsLoading ? "…" : stats?.unread,                   sub: "Needs attention" },
    { label: "Acknowledged", value: statsLoading ? "…" : stats?.byStatus?.acknowledged },
    { label: "Resolved",     value: statsLoading ? "…" : stats?.byStatus?.resolved },
    {
      label: "Avg Rating",
      value: statsLoading ? "…" : stats?.ratings?.avgRating ? `${Number(stats.ratings.avgRating).toFixed(1)}/5` : "—",
      sub: stats?.ratings?.totalRated ? `from ${stats.ratings.totalRated} ratings` : "",
    },
  ];

  return (
    <div className="min-h-screen bg-beige-300 p-4 sm:p-6 lg:p-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-1">
            Feedback <span className="text-olive-700">&amp; Reviews</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-md leading-relaxed">
            Manage, respond to, and track all user feedback submissions in one place.
          </p>
        </div>
        <button
          onClick={() => { fetchFeedbacks(page); fetchStats(); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-beige-100 border border-beige-300 text-gray-700 text-sm font-semibold hover:border-beige-400 transition-colors cursor-pointer shrink-0 self-start"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Flash ── */}
      {flash && (
        <div className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 mb-5 text-sm font-semibold border ${
          flash.startsWith("Error")
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-olive-100 text-olive-800 border-olive-200"
        }`}>
          <span>{flash}</span>
          <button onClick={() => setFlash("")} className="bg-transparent border-0 cursor-pointer opacity-60 hover:opacity-100 shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="bg-beige-100 rounded-2xl border border-beige-300 p-4 sm:p-5">
            <p className="text-[10px] sm:text-xs font-extrabold text-olive-600 uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none mb-1">{s.value ?? "—"}</p>
            {s.sub && <p className="text-[11px] text-gray-400 font-medium">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Main Card ── */}
      <div className="bg-beige-100 rounded-2xl sm:rounded-3xl border border-beige-300 overflow-hidden">

        {/* Card header + filters */}
        <div className="bg-beige-200 px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-5 border-b border-beige-300">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-olive-700 flex items-center justify-center shrink-0">
                <MessageSquare size={15} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight">
                  Feedback Submissions
                </h2>
                <p className="text-[11px] text-gray-500 leading-none mt-0.5">{total} total records</p>
              </div>
            </div>
          </div>

          {/* Search — full width */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, subject…"
            className="w-full bg-beige-100 border border-beige-300 rounded-xl sm:rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-olive-400 transition-all placeholder-gray-400 mb-2"
          />

          {/* Dropdowns — 3-col grid on mobile, row on desktop */}
          <div className="grid grid-cols-3 sm:flex gap-2">
            <select
              value={statusFilter} onChange={(e) => setStatus(e.target.value)}
              className="bg-beige-100 border border-beige-300 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-olive-400 cursor-pointer text-gray-700 w-full"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
            </select>
            <select
              value={typeFilter} onChange={(e) => setType(e.target.value)}
              className="bg-beige-100 border border-beige-300 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-olive-400 cursor-pointer text-gray-700 w-full"
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
            </select>
            <select
              value={ratingFilter} onChange={(e) => setRating(e.target.value)}
              className="bg-beige-100 border border-beige-300 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-olive-400 cursor-pointer text-gray-700 w-full"
            >
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{"★".repeat(r)} ({r})</option>)}
            </select>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <RefreshCw size={24} className="animate-spin" />
            <p className="text-sm">Loading feedback…</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No feedback found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* ── Mobile cards ── */}
            <div className="sm:hidden divide-y divide-beige-300">
              {feedbacks.map((f) => {
                return (
                <div key={f._id} className="p-4 hover:bg-beige-200 transition-colors">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{f.name}</p>
                      <p className="text-xs text-gray-500 truncate">{f.email}</p>
                    </div>
                    <Badge meta={STATUS_META} value={f.status} />
                  </div>
                  <p className="text-sm text-gray-700 font-semibold mb-2 leading-tight">{f.subject}</p>
                  {f.targetName && <p className="text-xs text-gray-400 mb-2">📌 {f.targetName}</p>}
                  <div className="flex items-center justify-between mb-2">
                    <Badge meta={TYPE_META} value={f.feedbackType} />
                    <Stars rating={f.rating} size={11} />
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{fmt(f.createdAt)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(f._id)}
                      className="flex-1 bg-olive-700 hover:bg-olive-800 text-white border-0 rounded-full py-2 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye size={12} /> View
                    </button>
                    <button
                      onClick={() => { if (window.confirm("Delete this feedback permanently?")) handleDelete(f._id); }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full px-3 py-2 cursor-pointer transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
              })}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-beige-200 border-b border-beige-300">
                    {["Submitter", "Type", "Subject", "Rating", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-olive-600 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-300">
                  {feedbacks.map((f) => (
                    <tr key={f._id} className="hover:bg-beige-200 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-bold text-gray-900">{f.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{f.email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge meta={TYPE_META} value={f.feedbackType} />
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-sm font-semibold text-gray-800 truncate">{f.subject}</p>
                        {f.targetName && <p className="text-xs text-gray-400 mt-0.5">📌 {f.targetName}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <Stars rating={f.rating} size={12} />
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge meta={STATUS_META} value={f.status} />
                        {f.adminReply && (
                          <p className="text-[11px] text-olive-700 mt-1 font-bold">✓ Replied</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{fmt(f.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleView(f._id)}
                            className="flex items-center gap-1 bg-olive-700 hover:bg-olive-800 text-white border-0 rounded-full px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            onClick={() => { if (window.confirm("Delete this feedback permanently?")) handleDelete(f._id); }}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full px-2.5 py-1.5 cursor-pointer transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center px-5 py-4 border-t border-beige-300">
            <span className="text-xs text-gray-400 font-medium">
              Page {page} of {totalPages} · {total} records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-beige-300 bg-beige-200 text-sm font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:border-beige-400 transition-colors"
              >
                <ChevronLeft size={14} /> Prev
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button
                    key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-xl text-sm font-bold transition-colors cursor-pointer border ${
                      page === pg
                        ? "bg-olive-700 text-white border-olive-700"
                        : "bg-beige-200 border-beige-300 text-gray-600 hover:border-beige-400"
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-beige-300 bg-beige-200 text-sm font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:border-beige-400 transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {selected && (
        <FeedbackModal
          item={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
          onReply={handleReply}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
