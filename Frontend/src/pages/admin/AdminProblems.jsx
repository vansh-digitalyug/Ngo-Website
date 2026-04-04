import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, RefreshCw, ChevronDown, MapPin, Building2, User, Trash2, ArrowUpRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "./AdminLayout.jsx";

// ── Meta ──────────────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:     { label: "Pending",     cls: "bg-amber-50 text-amber-700 border-amber-200",     Icon: Clock },
  in_progress: { label: "In Progress", cls: "bg-olive-100 text-olive-700 border-olive-200",    Icon: AlertTriangle },
  solved:      { label: "Solved",      cls: "bg-olive-200 text-olive-800 border-olive-300",    Icon: CheckCircle },
};

const PRIORITY_META = {
  low:      { label: "Low",      cls: "bg-beige-200 text-gray-600 border-beige-300" },
  medium:   { label: "Medium",   cls: "bg-amber-50 text-amber-700 border-amber-200" },
  high:     { label: "High",     cls: "bg-red-50 text-red-600 border-red-200" },
  critical: { label: "Critical", cls: "bg-red-100 text-red-800 border-red-300" },
};

const CATEGORIES = ["all","water","sanitation","education","health","road","employment","electricity","other"];

// ── StatusSelect ──────────────────────────────────────────────────────────────
function StatusSelect({ value, onChange }) {
  const meta = STATUS_META[value] || STATUS_META.pending;
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none pl-2.5 pr-7 py-1.5 rounded-full text-xs font-bold border cursor-pointer outline-none ${meta.cls}`}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="solved">Solved</option>
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ modal, resolveNote, setResolveNote, onConfirm, onClose, saving }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const newLabel = modal.newStatus === "in_progress" ? "In Progress"
    : modal.newStatus.charAt(0).toUpperCase() + modal.newStatus.slice(1);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className={`fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6 transition-all duration-300 ${
        visible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
    >
      <div className={`bg-beige-100 rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-md flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-full opacity-0 sm:scale-95 sm:translate-y-6"
      }`}>
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1 bg-beige-300 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-beige-300 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-olive-600 uppercase tracking-widest mb-1">Update Status</p>
            <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
              Mark as {newLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-beige-200 hover:bg-beige-300 flex items-center justify-center border-0 cursor-pointer text-gray-500 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-beige-200 rounded-2xl p-3.5">
            <p className="text-[10px] font-bold text-olive-600 uppercase tracking-widest mb-1">Problem</p>
            <p className="text-sm font-semibold text-gray-800 leading-snug">{modal.problem.title}</p>
          </div>

          {modal.newStatus === "solved" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                Resolution Note <span className="text-gray-400 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="Describe how the problem was resolved…"
                className="w-full bg-beige-200 border border-beige-300 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-olive-400 transition-all placeholder-gray-400"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-beige-300 bg-beige-200 text-sm font-semibold text-gray-700 hover:border-beige-400 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={saving}
              className="flex-1 py-2.5 rounded-full bg-olive-700 hover:bg-olive-800 disabled:opacity-60 text-white text-sm font-bold border-0 cursor-pointer transition-colors"
            >
              {saving ? "Saving…" : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminProblems() {
  const [problems, setProblems]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [resolveModal, setResolveModal] = useState(null);
  const [resolveNote, setResolveNote]   = useState("");
  const [saving, setSaving]             = useState(false);

  const token = localStorage.getItem("token");

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 25 });
    if (statusFilter !== "all")  params.set("status", statusFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);

    fetch(`${API_BASE_URL}/api/villages/admin/problems?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProblems(d.data.problems);
          setPagination(d.data.pagination);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(1); }, [statusFilter, categoryFilter, priorityFilter]);
  useEffect(() => { load(page); }, [page]);

  const openStatusChange = (problem, newStatus) => {
    setResolveNote("");
    setResolveModal({ problem, newStatus });
  };

  const confirmStatusChange = () => {
    if (!resolveModal) return;
    setSaving(true);
    fetch(`${API_BASE_URL}/api/villages/problems/${resolveModal.problem._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: resolveModal.newStatus, resolvedNote: resolveNote }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProblems((ps) => ps.map((p) => p._id === resolveModal.problem._id ? { ...p, status: resolveModal.newStatus } : p));
          setResolveModal(null);
        }
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  const deleteProblem = (id) => {
    if (!confirm("Delete this problem report?")) return;
    fetch(`${API_BASE_URL}/api/villages/problems/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setProblems((ps) => ps.filter((p) => p._id !== id)); })
      .catch(() => {});
  };

  const STATUS_FILTERS = ["all", "pending", "in_progress", "solved"];

  return (
    <div className="min-h-screen bg-beige-300 p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-1">
            Community <span className="text-olive-700">Problems</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            {pagination.total} problem{pagination.total !== 1 ? "s" : ""} reported across all villages
          </p>
        </div>
        <button
          onClick={() => load(page)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-beige-100 border border-beige-300 text-gray-700 text-sm font-semibold hover:border-beige-400 transition-colors cursor-pointer shrink-0 self-start"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 mb-5 sm:mb-6">
        {/* Status pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold cursor-pointer transition-all border whitespace-nowrap ${
                statusFilter === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-beige-100 text-gray-600 border-beige-300 hover:border-beige-400"
              }`}
            >
              {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Category + Priority dropdowns */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-beige-100 border border-beige-300 rounded-xl sm:rounded-2xl pl-3 pr-8 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-olive-400 cursor-pointer text-gray-700"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none bg-beige-100 border border-beige-300 rounded-xl sm:rounded-2xl pl-3 pr-8 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-olive-400 cursor-pointer text-gray-700"
            >
              {["all","low","medium","high","critical"].map((p) => (
                <option key={p} value={p}>{p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <RefreshCw size={20} className="animate-spin" />
          <span className="text-sm">Loading problems…</span>
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <AlertTriangle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No problems found for the selected filters.</p>
        </div>
      ) : (
        <div className="bg-beige-100 rounded-2xl sm:rounded-3xl border border-beige-300 overflow-hidden">

          {/* ── Mobile cards ── */}
          <div className="sm:hidden divide-y divide-beige-300">
            {problems.map((p) => {
              const pm = PRIORITY_META[p.priority] || PRIORITY_META.medium;
              return (
                <div key={p._id} className="p-4 hover:bg-beige-200 transition-colors">
                  {/* Title + Priority */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-bold text-gray-900 text-sm leading-tight flex-1">{p.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize shrink-0 ${pm.cls}`}>
                      {p.priority}
                    </span>
                  </div>

                  {/* Description */}
                  {p.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.description}</p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {p.villageId && (
                      <Link to={`/villages/${p.villageId._id}`} target="_blank"
                        className="flex items-center gap-1 text-xs text-olive-700 font-semibold no-underline hover:underline"
                      >
                        <MapPin size={10} /> {p.villageId.villageName} <ArrowUpRight size={10} />
                      </Link>
                    )}
                    {p.ngoId?.ngoName && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Building2 size={10} /> {p.ngoId.ngoName}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <User size={10} /> {p.submittedBy?.name || p.submittedByName || "Anonymous"}
                    </span>
                  </div>

                  {/* Category + Status + Delete */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-beige-200 text-gray-600 border border-beige-300 capitalize">
                      {p.category}
                    </span>
                    <StatusSelect value={p.status} onChange={(v) => openStatusChange(p, v)} />
                    <button
                      onClick={() => deleteProblem(p._id)}
                      className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 cursor-pointer transition-colors"
                    >
                      <Trash2 size={12} />
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
                  {["Problem", "Village", "NGO", "Category", "Priority", "Status", "Reported By", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-olive-600 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {problems.map((p) => {
                  const pm = PRIORITY_META[p.priority] || PRIORITY_META.medium;
                  return (
                    <tr key={p._id} className="hover:bg-beige-200 transition-colors">
                      <td className="px-4 py-3.5 max-w-[220px]">
                        <p className="font-bold text-sm text-gray-900 truncate">{p.title}</p>
                        {p.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{p.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {p.villageId ? (
                          <Link
                            to={`/villages/${p.villageId._id}`}
                            target="_blank"
                            className="flex items-center gap-1 text-olive-700 text-xs font-semibold no-underline hover:underline"
                          >
                            <MapPin size={11} /> {p.villageId.villageName} <ArrowUpRight size={11} />
                          </Link>
                        ) : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Building2 size={11} className="text-gray-400" /> {p.ngoId?.ngoName || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-beige-200 text-gray-600 border border-beige-300 capitalize">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${pm.cls}`}>
                          {p.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusSelect value={p.status} onChange={(v) => openStatusChange(p, v)} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <User size={11} className="text-gray-400" />
                          {p.submittedBy?.name || p.submittedByName || "Anonymous"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => deleteProblem(p._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 cursor-pointer transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
            ← Prev
          </button>
          <span className="text-sm text-gray-500 font-medium">
            Page {page} of {pagination.pages}
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-beige-300 bg-beige-100 text-sm font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:border-beige-400 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Status Change Modal ── */}
      {resolveModal && (
        <ConfirmModal
          modal={resolveModal}
          resolveNote={resolveNote}
          setResolveNote={setResolveNote}
          onConfirm={confirmStatusChange}
          onClose={() => setResolveModal(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
