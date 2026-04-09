import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle, CheckCircle, Clock, Loader2, ChevronDown,
  MapPin, User, TrendingUp, ArrowUpRight, X, Calendar,
  Tag, Flag, FileText, ThumbsUp, CheckSquare, MessageSquare
} from "lucide-react";
import { API_BASE_URL } from "./NgoLayout.jsx";

const STATUS_META = {
  pending:     { label: "Pending",     className: "bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]", Icon: Clock },
  in_progress: { label: "In Progress", className: "bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]", Icon: TrendingUp },
  solved:      { label: "Solved",      className: "bg-[#f0f4ea] text-[#5a6b46] border border-[#d6e3c9]", Icon: CheckCircle },
};

const PRIORITY_COLORS = {
  low:      { className: "bg-slate-50 text-slate-600 border border-slate-200" },
  medium:   { className: "bg-amber-50 text-amber-700 border border-amber-200" },
  high:     { className: "bg-orange-50 text-orange-700 border border-orange-200" },
  critical: { className: "bg-red-50 text-red-700 border border-red-200" },
};

const CATEGORIES = ["all","water","sanitation","education","health","road","employment","electricity","other"];

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "—";

const inputCls = "w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all";
const labelCls = "block text-sm font-bold text-[#222222] mb-1.5";

// ── Detail modal ──────────────────────────────────────────────────────────────
function ProblemDetailModal({ problem, onClose, onStatusChanged }) {
  const [resolveNote, setResolveNote] = useState(problem.resolvedNote || "");
  const [newStatus, setNewStatus]     = useState(problem.status);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const token = localStorage.getItem("token");

  const sm  = STATUS_META[problem.status] || STATUS_META.pending;
  const pc  = PRIORITY_COLORS[problem.priority] || PRIORITY_COLORS.medium;

  const handleStatusSave = () => {
    if (newStatus === problem.status && resolveNote === (problem.resolvedNote || "")) return;
    setSaving(true);
    fetch(`${API_BASE_URL}/api/villages/problems/${problem._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ status: newStatus, resolvedNote: resolveNote }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          onStatusChanged(problem._id, newStatus, resolveNote);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  // close on backdrop click
  const onBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div
      onClick={onBackdrop}
      className="fixed inset-0 z-50 bg-[#222222]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 opacity-100 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">

        {/* Header bar */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4 bg-white shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-[#222222] leading-tight mb-2">{problem.title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm ${sm.className}`}>
                <sm.Icon size={12} /> {sm.label}
              </span>
              <span className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm ${pc.className}`}>
                {problem.priority}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm bg-[#f8f7f5] text-[#6c6c6c] border border-[#e5e5e5]">
                <Tag size={12} /> {problem.category}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">

          {/* Description */}
          {problem.description && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">
                <FileText size={14} /> Description
              </p>
              <p className="text-sm text-[#222222] leading-relaxed bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl p-4">
                {problem.description}
              </p>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl p-4">
              <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1">Village</p>
              {problem.villageId ? (
                <>
                  <Link
                    to={`/villages/${problem.villageId._id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-sm font-extrabold text-[#6c5d46] hover:text-[#584a36] hover:underline"
                  >
                    <MapPin size={14} /> {problem.villageId.villageName}
                    <ArrowUpRight size={12} />
                  </Link>
                  {problem.villageId?.district && (
                    <p className="mt-1 text-xs text-[#6c6c6c]">{problem.villageId.district}, {problem.villageId.state}</p>
                  )}
                </>
              ) : <span className="text-sm text-[#6c6c6c]">—</span>}
            </div>

            <div className="bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl p-4">
              <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1">Reported By</p>
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#222222]">
                <User size={14} className="text-[#888888]" /> {problem.submittedBy?.name || problem.submittedByName || "Anonymous"}
              </p>
            </div>

            <div className="bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl p-4">
              <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1">Reported On</p>
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#222222]">
                <Calendar size={14} className="text-[#888888]" /> {fmtDate(problem.createdAt)}
              </p>
            </div>

            <div className="bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl p-4">
              <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1">Upvotes</p>
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#222222]">
                <ThumbsUp size={14} className="text-[#888888]" /> {problem.upvotes?.length || 0} people
              </p>
            </div>
          </div>

          {/* Resolution info (if already solved) */}
          {problem.status === "solved" && problem.resolvedAt && (
            <div className="bg-[#f0f4ea] border border-[#d6e3c9] rounded-xl p-4">
              <p className="flex items-center gap-1.5 text-xs font-extrabold text-[#5a6b46] uppercase tracking-wider mb-2">
                <CheckSquare size={14} /> Resolved on {fmtDate(problem.resolvedAt)}
              </p>
              {problem.resolvedNote && (
                <p className="text-sm text-[#4b593a] leading-relaxed">{problem.resolvedNote}</p>
              )}
            </div>
          )}

          {/* ── Update status ── */}
          <div className="pt-6 border-t border-gray-100">
            <p className="flex items-center gap-2 text-sm font-bold text-[#222222] mb-3">
              <Flag size={16} className="text-[#6c5d46]" /> Update Status
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {["pending", "in_progress", "solved"].map(s => {
                const m = STATUS_META[s];
                const active = newStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={`px-4 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all
                      ${active 
                        ? `${m.className} ring-2 ring-offset-1 ring-[#eaddc8]` 
                        : "bg-white border-[#e5e5e5] text-[#6c6c6c] hover:bg-[#f8f7f5]"}`}
                  >
                    <m.Icon size={14} /> {m.label}
                  </button>
                );
              })}
            </div>

            {newStatus === "solved" && (
              <div className="mb-4 animate-in slide-in-from-top-2 duration-200">
                <textarea
                  rows={2}
                  value={resolveNote}
                  onChange={e => setResolveNote(e.target.value)}
                  placeholder="Resolution note (optional) — describe how it was resolved…"
                  className={`${inputCls} resize-y min-h-[80px]`}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-2">
              <button onClick={onClose} className="px-5 py-2.5 bg-white text-[#2c2c2c] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
                Close
              </button>
              <button
                onClick={handleStatusSave}
                disabled={saving || (newStatus === problem.status && resolveNote === (problem.resolvedNote || ""))}
                className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : saved ? "✓ Saved" : "Save Changes"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Status inline select (table) ──────────────────────────────────────────────
function StatusSelect({ value, onChange }) {
  const meta = STATUS_META[value] || STATUS_META.pending;
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onClick={e => e.stopPropagation()}
        className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#eaddc8] transition-colors ${meta.className.replace('border', 'border')}`}
      >
        <option value="pending" className="text-[#222222] bg-white">Pending</option>
        <option value="in_progress" className="text-[#222222] bg-white">In Progress</option>
        <option value="solved" className="text-[#222222] bg-white">Solved</option>
      </select>
      <ChevronDown size={14} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${meta.className.split(' ')[1]}`} />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NgoProblems() {
  const [problems, setProblems]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter]     = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [detailProblem, setDetailProblem]   = useState(null); // problem for detail modal
  const [resolveModal, setResolveModal]     = useState(null); // quick status change from table
  const [resolveNote, setResolveNote]       = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");

  const token = localStorage.getItem("token");

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 25 });
    if (statusFilter !== "all")   params.set("status",   statusFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);

    fetch(`${API_BASE_URL}/api/villages/ngo/problems?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setProblems(d.data.problems); setPagination(d.data.pagination); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(1); }, [statusFilter, categoryFilter, priorityFilter]);
  useEffect(() => { load(page); }, [page]);

  // called by both the detail modal and the quick-change flow
  const applyStatusChange = (id, status, note) => {
    setProblems(ps => ps.map(p =>
      p._id === id ? { ...p, status, resolvedNote: note, resolvedAt: status === "solved" ? new Date().toISOString() : p.resolvedAt } : p
    ));
    // keep detail modal in sync
    if (detailProblem?._id === id) {
      setDetailProblem(prev => ({ ...prev, status, resolvedNote: note, resolvedAt: status === "solved" ? new Date().toISOString() : prev.resolvedAt }));
    }
    setMsg("Status updated successfully");
    setTimeout(() => setMsg(""), 3000);
  };

  const openQuickStatus = (problem, newStatus) => {
    setResolveNote("");
    setResolveModal({ problem, newStatus });
  };

  const confirmQuickStatus = () => {
    if (!resolveModal) return;
    setSaving(true);
    fetch(`${API_BASE_URL}/api/villages/problems/${resolveModal.problem._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ status: resolveModal.newStatus, resolvedNote: resolveNote }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          applyStatusChange(resolveModal.problem._id, resolveModal.newStatus, resolveNote);
          setResolveModal(null);
        }
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <div className="min-h-screen bg-[#f8f7f5] p-4 sm:p-6 lg:p-8 font-sans text-[#2c2c2c] selection:bg-[#eaddc8] selection:text-[#2c2c2c] flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#222222] flex items-center gap-3 mb-2">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-[#6c5d46]">
            <MessageSquare size={24} />
          </div>
          Village Problems
        </h1>
        <p className="text-[#6c6c6c] text-sm sm:text-base font-medium">
          {pagination.total} problem{pagination.total !== 1 ? "s" : ""} reported across your adopted villages · click a row to see full details
        </p>
      </div>

      {msg && (
        <div className="px-4 py-3 bg-[#f0f4ea] border border-[#d6e3c9] text-[#5a6b46] rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={16} /> {msg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "in_progress", "solved"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border
                ${statusFilter === s 
                  ? "bg-[#6c5d46] text-white border-[#6c5d46] shadow-sm" 
                  : "bg-white text-[#6c6c6c] border-gray-200 hover:bg-[#f8f7f5]"}`}
            >
              {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="appearance-none pl-4 pr-10 py-2 bg-[#f8f7f5] border border-[#e5e5e5] rounded-lg text-xs font-bold text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#eaddc8] cursor-pointer">
              {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
          </div>

          <div className="relative">
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="appearance-none pl-4 pr-10 py-2 bg-[#f8f7f5] border border-[#e5e5e5] rounded-lg text-xs font-bold text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#eaddc8] cursor-pointer">
              {["all", "low", "medium", "high", "critical"].map(p => <option key={p} value={p}>{p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="w-10 h-10 border-4 border-[#eaddc8] border-t-[#6c5d46] rounded-full animate-spin"></div>
          <p className="text-[#888888] font-medium">Loading problems…</p>
        </div>
      ) : problems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-[#f8f7f5] rounded-full flex items-center justify-center text-[#d5cfc4] mb-4">
            <AlertTriangle size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold text-[#222222] mb-2">No problems found</h3>
          <p className="text-sm font-medium text-[#888888]">Try adjusting your filters or search criteria.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#f8f7f5] border-b border-gray-100">
                  {["Problem", "Village", "Category", "Priority", "Status", "Reported By", "Update Status"].map(h => (
                    <th key={h} className="py-3 px-4 text-[11px] font-extrabold text-[#888888] uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {problems.map(p => {
                  const sm = STATUS_META[p.status] || STATUS_META.pending;
                  const pc = PRIORITY_COLORS[p.priority] || PRIORITY_COLORS.medium;
                  return (
                    <tr
                      key={p._id}
                      onClick={() => setDetailProblem(p)}
                      className="border-b border-gray-50 hover:bg-[#f8f7f5] cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-4 max-w-[250px]">
                        <p className="font-bold text-sm text-[#222222] truncate mb-0.5 group-hover:text-[#6c5d46] transition-colors">{p.title}</p>
                        {p.description && <p className="text-xs text-[#888888] truncate">{p.description}</p>}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {p.villageId ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-[#222222]">
                            <MapPin size={14} className="text-[#6c5d46]" /> {p.villageId.villageName}
                          </span>
                        ) : <span className="text-[#888888]">—</span>}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="bg-[#f8f7f5] text-[#6c6c6c] border border-[#e5e5e5] px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${pc.className}`}>
                          {p.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm w-max ${sm.className}`}>
                          <sm.Icon size={12} /> {sm.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-[#6c6c6c] flex items-center gap-1.5">
                          <User size={14} /> {p.submittedBy?.name || p.submittedByName || "Anonymous"}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusSelect value={p.status} onChange={v => openQuickStatus(p, v)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[#222222]">
            &larr; Prev
          </button>
          <span className="text-sm font-bold text-[#888888]">
            Page {page} of {pagination.pages}
          </span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[#222222]">
            Next &rarr;
          </button>
        </div>
      )}

      {/* ── Detail modal ── */}
      {detailProblem && (
        <ProblemDetailModal
          problem={detailProblem}
          onClose={() => setDetailProblem(null)}
          onStatusChanged={(id, status, note) => {
            applyStatusChange(id, status, note);
          }}
        />
      )}

      {/* ── Quick status change confirm (from table dropdown) ── */}
      {resolveModal && (
        <div className="fixed inset-0 z-[60] bg-[#222222]/60 backdrop-blur-sm flex items-center justify-center p-4 opacity-100 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[#222222] mb-2 flex items-center gap-2">
              Update Status &rarr; 
              <span className={`px-2 py-0.5 rounded text-xs uppercase tracking-wider border ${STATUS_META[resolveModal.newStatus].className}`}>
                {STATUS_META[resolveModal.newStatus].label}
              </span>
            </h3>
            <p className="text-sm text-[#6c6c6c] mb-5">
              Problem: <strong className="text-[#222222]">{resolveModal.problem.title}</strong>
            </p>
            
            {resolveModal.newStatus === "solved" && (
              <div className="mb-5 animate-in slide-in-from-top-2">
                <label className={labelCls}>Resolution Note (optional)</label>
                <textarea 
                  rows={3} 
                  value={resolveNote} 
                  onChange={e => setResolveNote(e.target.value)}
                  placeholder="Describe how the problem was resolved…"
                  className={`${inputCls} resize-y min-h-[80px]`} 
                />
              </div>
            )}
            
            <div className="flex items-center justify-end gap-3 mt-2">
              <button onClick={() => setResolveModal(null)} className="px-5 py-2.5 bg-white text-[#2c2c2c] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
                Cancel
              </button>
              <button onClick={confirmQuickStatus} disabled={saving} className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}