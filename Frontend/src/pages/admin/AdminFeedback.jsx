import { useState, useEffect, useCallback } from "react";
import { Star, Eye, Trash2, Send, X, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

// ── Helpers ──────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

const fmt = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const TYPE_META = {
  platform:  { label: "Platform",   cls: "bg-indigo-50 text-indigo-700" },
  ngo:       { label: "NGO",        cls: "bg-sky-50 text-sky-700" },
  volunteer: { label: "Volunteer",  cls: "bg-emerald-50 text-emerald-700" },
  event:     { label: "Event",      cls: "bg-amber-50 text-amber-700" },
  community: { label: "Community",  cls: "bg-violet-50 text-violet-700" },
  service:   { label: "Service",    cls: "bg-red-50 text-red-700" },
  other:     { label: "Other",      cls: "bg-gray-100 text-gray-600" },
};

const STATUS_META = {
  new:          { label: "New",          cls: "bg-red-50 text-red-700 border-red-200" },
  read:         { label: "Read",         cls: "bg-blue-50 text-blue-700 border-blue-200" },
  acknowledged: { label: "Acknowledged", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  resolved:     { label: "Resolved",     cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

function Badge({ meta, value }) {
  const m = meta[value] || { label: value, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${m.cls}`}>
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

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, bg }) {
  const colorMap = {
    "indigo": { bg: "bg-indigo-50", text: "text-indigo-600" },
    "red":    { bg: "bg-red-50", text: "text-red-600" },
    "amber":  { bg: "bg-amber-50", text: "text-amber-600" },
    "emerald": { bg: "bg-emerald-50", text: "text-emerald-600" },
  };
  const theme = colorMap[bg] || { bg: "bg-gray-100", text: "text-gray-600" };
  
  return (
    <div className={`${theme.bg} border border-gray-200 rounded-xl p-4 flex-1 min-w-[140px]`}>
      <p className={`text-2xl font-black ${theme.text} m-0 leading-none`}>{value ?? "—"}</p>
      <p className="text-xs font-semibold text-gray-600 m-0 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-500 m-0 mt-1">{sub}</p>}
    </div>
  );
}

// ── View / Reply Modal ────────────────────────────────────────────────────────
function FeedbackModal({ item, onClose, onStatusUpdate, onReply, onDelete }) {
  const [reply, setReply]       = useState("");
  const [status, setStatus]     = useState(item.status);
  const [note, setNote]         = useState(item.adminNote || "");
  const [saving, setSaving]     = useState(false);
  const [replying, setReplying] = useState(false);
  const [flash, setFlash]       = useState("");

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 3000); };

  const handleStatusSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${item._id}/status`, {
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
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${item._id}/reply`, {
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

  const type = TYPE_META[item.feedbackType] || TYPE_META.other;
  const stat = STATUS_META[item.status]     || STATUS_META.new;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 rounded-t-2xl flex justify-between items-start">
          <div>
            <p className="text-white/75 text-xs font-bold uppercase tracking-wider m-0">Feedback Detail</p>
            <h3 className="text-white text-lg font-extrabold m-0 mt-1 leading-tight">{item.subject}</h3>
          </div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 border-0 rounded-lg p-1.5 cursor-pointer text-white flex items-center transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">

          {/* Flash */}
          {flash && (
            <div className={`rounded-lg p-3 mb-4 text-sm font-semibold border ${
              flash.startsWith("Error") 
                ? "bg-red-50 text-red-700 border-red-200" 
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              {flash}
            </div>
          )}

          {/* Submitter info */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              ["Name", item.name],
              ["Email", item.email],
              ["Phone", item.phone || "—"],
              ["Submitted", fmt(item.createdAt)],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide m-0">{k}</p>
                <p className="text-sm font-semibold text-gray-900 m-0 mt-1 break-words">{v}</p>
              </div>
            ))}
          </div>

          {/* Type / Status / Rating row */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${TYPE_META[item.feedbackType]?.cls}`}>
              {type.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${stat.cls}`}>
              {stat.label}
            </span>
            {item.targetName && (
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                📌 {item.targetName}
              </span>
            )}
            {item.rating && (
              <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star size={12} fill="#f59e0b" stroke="#f59e0b" /> {item.rating}/5
              </span>
            )}
          </div>

          {/* Message */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide m-0 mb-2">Message</p>
            <p className="text-sm text-slate-900 leading-relaxed m-0 whitespace-pre-wrap">{item.message}</p>
          </div>

          {/* Admin note if exists */}
          {item.adminNote && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wide m-0 mb-2">Admin Note</p>
              <p className="text-sm text-amber-900 m-0">{item.adminNote}</p>
            </div>
          )}

          {/* Admin reply if exists */}
          {item.adminReply && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide m-0 mb-2">Reply Sent • {fmt(item.repliedAt)}</p>
              <p className="text-sm text-emerald-900 m-0">{item.adminReply}</p>
            </div>
          )}

          {/* ── Update Status ── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide m-0 mb-3">Update Status</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {Object.entries(STATUS_META).map(([v, m]) => (
                <button
                  key={v}
                  onClick={() => setStatus(v)}
                  className={`py-2 px-3 rounded-lg border-2 font-bold text-xs uppercase transition-all ${
                    status === v 
                      ? `${m.cls} border-current` 
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
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
              className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent mb-3"
            />
            <button
              onClick={handleStatusSave}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white border-0 rounded-lg py-2.5 font-bold text-sm cursor-pointer transition-colors"
            >
              {saving ? "Saving…" : "Save Status"}
            </button>
          </div>

          {/* ── Reply ── */}
          {!item.adminReply && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide m-0 mb-3">Send Reply</p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Write your reply to the user... (min 5 characters)"
                className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent mb-3"
              />
              <div className="flex justify-between items-center">
                <span className={`text-xs ${reply.length < 5 && reply.length > 0 ? "text-red-600" : "text-gray-500"}`}>
                  {reply.length < 5 && reply.length > 0 ? `${5 - reply.length} more needed` : `${reply.length} chars`}
                </span>
                <button
                  onClick={handleReply}
                  disabled={replying || reply.trim().length < 5}
                  className={`flex items-center gap-2 border-0 rounded-lg py-2.5 px-5 font-bold text-sm text-white transition-all disabled:opacity-50 ${
                    replying || reply.trim().length < 5
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 cursor-pointer"
                  }`}
                >
                  <Send size={14} /> {replying ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </div>
          )}

          {/* Delete */}
          <button
            onClick={() => { if (window.confirm("Permanently delete this feedback?")) onDelete(item._id); }}
            className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg py-2.5 font-bold text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors"
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
  const [feedbacks, setFeedbacks]   = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [typeFilter, setType]       = useState("");
  const [ratingFilter, setRating]   = useState("");

  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const [selected, setSelected]     = useState(null);
  const [flash, setFlash]           = useState("");

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 4000); };

  // ── Fetch Stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/stats`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch { /* silent */ }
    finally { setStatsLoading(false); }
  }, []);

  // ── Fetch List ───────────────────────────────────────────────────────────
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

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleView = async (id) => {
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/feedback/${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data.feedback);
        // Update status in list (new → read)
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
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      setSelected(null);
      showFlash("Feedback deleted.");
      fetchStats();
    } catch (e) { showFlash(`Error: ${e.message}`); }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50">

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 m-0">Feedback</h1>
          <p className="text-sm text-gray-600 mt-1 m-0">Manage and respond to user feedback</p>
        </div>
        <button
          onClick={() => { fetchFeedbacks(page); fetchStats(); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} /> <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`rounded-lg p-4 mb-6 text-sm font-semibold border flex justify-between items-center ${
          flash.startsWith("Error") 
            ? "bg-red-50 text-red-700 border-red-200" 
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}>
          {flash}
          <button onClick={() => setFlash("")} className="bg-transparent border-0 cursor-pointer opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard label="Total"        value={statsLoading ? "…" : stats?.total}                 color="indigo" bg="indigo" />
        <StatCard label="New / Unread" value={statsLoading ? "…" : stats?.unread}                color="red" bg="red" sub="Needs attention" />
        <StatCard label="Acknowledged" value={statsLoading ? "…" : stats?.byStatus?.acknowledged} color="amber" bg="amber" />
        <StatCard label="Resolved"     value={statsLoading ? "…" : stats?.byStatus?.resolved}     color="emerald" bg="emerald" />
        <StatCard
          label="Avg Rating"
          value={statsLoading ? "…" : stats?.ratings?.average ? `${stats.ratings.average}/5` : "—"}
          color="amber" bg="amber"
          sub={stats?.ratings?.total ? `from ${stats.ratings.total} ratings` : ""}
        />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search by name, email, subject..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white cursor-pointer">
          <option value="">All Statuses</option>
          {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white cursor-pointer">
          <option value="">All Types</option>
          {Object.entries(TYPE_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </select>
        <select value={ratingFilter} onChange={(e) => setRating(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white cursor-pointer">
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{"★".repeat(r)} ({r})</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-900">
            Feedback Submissions <span className="text-xs text-gray-500 font-normal">({total} total)</span>
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 size={28} className="animate-spin mb-3" />
            <p className="text-sm">Loading feedback…</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-sm">No feedback found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <ul className="sm:hidden divide-y divide-gray-200 list-none m-0 p-0">
              {feedbacks.map((f) => (
                <li key={f._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 m-0 text-sm">{f.name}</p>
                      <p className="text-xs text-gray-600 m-0">{f.email}</p>
                    </div>
                    <Badge meta={STATUS_META} value={f.status} />
                  </div>
                  <p className="text-sm text-gray-700 m-0 mb-2 font-medium">{f.subject}</p>
                  {f.targetName && <p className="text-xs text-gray-500 m-0 mb-2">📌 {f.targetName}</p>}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <Badge meta={TYPE_META} value={f.feedbackType} />
                    <Stars rating={f.rating} size={11} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 m-0">{fmt(f.createdAt)}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleView(f._id)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-0 rounded-lg py-2 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye size={12} /> View
                    </button>
                    <button
                      onClick={() => { if (window.confirm("Delete this feedback permanently?")) handleDelete(f._id); }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border-0 rounded-lg px-3 py-2 cursor-pointer transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Submitter", "Type", "Subject", "Rating", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {feedbacks.map((f, i) => (
                    <tr key={f._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 m-0">{f.name}</p>
                        <p className="text-xs text-gray-500 m-0">{f.email}</p>
                      </td>
                      <td className="px-4 py-3"><Badge meta={TYPE_META} value={f.feedbackType} /></td>
                      <td className="px-4 py-3 max-w-sm">
                        <p className="text-sm font-medium text-gray-900 m-0 truncate">{f.subject}</p>
                        {f.targetName && <p className="text-xs text-gray-500 m-0 mt-1">📌 {f.targetName}</p>}
                      </td>
                      <td className="px-4 py-3"><Stars rating={f.rating} size={12} /></td>
                      <td className="px-4 py-3">
                        <Badge meta={STATUS_META} value={f.status} />
                        {f.adminReply && <p className="text-xs text-emerald-700 m-0 mt-1 font-semibold">✓ Replied</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{fmt(f.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleView(f._id)}
                            className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-0 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            onClick={() => { if (window.confirm("Delete this feedback permanently?")) handleDelete(f._id); }}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border-0 rounded-lg px-2 py-1.5 cursor-pointer transition-colors"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-5 border-t border-gray-200">
            <span className="text-xs text-gray-600">
              Page {page} of {totalPages} ({total} records)
            </span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  page === 1 ? "bg-gray-100 border-gray-200 text-gray-500" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}>
                <ChevronLeft size={14} /> Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors cursor-pointer border-0 ${
                      page === pg ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}>
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  page === totalPages ? "bg-gray-100 border-gray-200 text-gray-500" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
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
