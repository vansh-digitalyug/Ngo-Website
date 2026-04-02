import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ClipboardList, Trash2,
  Eye, X, CheckCircle, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight, MoreVertical, GraduationCap,
  ShieldCheck, Package, Zap,
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const token = () => localStorage.getItem("token");
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const isToday = (d) => {
  if (!d) return false;
  const t = new Date(d);
  const now = new Date();
  return t.getDate() === now.getDate() && t.getMonth() === now.getMonth() && t.getFullYear() === now.getFullYear();
};

const AVATAR_HEX = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
const avatarColor = (name) => AVATAR_HEX[(name?.charCodeAt(0) || 0) % AVATAR_HEX.length];

// Pick task icon + icon bg based on title/service keywords
const taskIcon = (title = "", service = "") => {
  const text = (title + " " + service).toLowerCase();
  if (text.includes("urgent") || text.includes("crisis") || text.includes("emergency"))
    return { Icon: AlertCircle, bg: "bg-red-100", color: "text-red-500" };
  if (text.includes("water") || text.includes("health") || text.includes("medical") || text.includes("guardian"))
    return { Icon: ShieldCheck, bg: "bg-beige-200", color: "text-gray-500" };
  if (text.includes("education") || text.includes("school") || text.includes("training") || text.includes("stationary"))
    return { Icon: GraduationCap, bg: "bg-beige-200", color: "text-gray-500" };
  if (text.includes("supply") || text.includes("logistics") || text.includes("distribution") || text.includes("resource"))
    return { Icon: Package, bg: "bg-orange-100", color: "text-orange-500" };
  if (text.includes("vocational") || text.includes("women") || text.includes("economic"))
    return { Icon: Zap, bg: "bg-yellow-100", color: "text-yellow-500" };
  return { Icon: ClipboardList, bg: "bg-beige-200", color: "text-gray-500" };
};

// Status badge
function StatusBadge({ status }) {
  const styles = {
    assigned:    "bg-lime text-olive-800",
    in_progress: "bg-yellow-200 text-yellow-800",
    completed:   "bg-gray-200 text-gray-600",
  };
  const labels = { assigned: "ASSIGNED", in_progress: "IN PROGRESS", completed: "COMPLETED" };
  const dots = { assigned: "bg-olive-600", in_progress: "bg-yellow-500", completed: "bg-gray-400" };
  const cls = styles[status] || "bg-gray-100 text-gray-500";
  const label = labels[status] || status?.toUpperCase();
  const dot = dots[status] || "bg-gray-400";
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

// Media lightbox
function MediaLightbox({ task, onClose }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/90 z-[1001] flex items-center justify-center p-6"
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 bg-white/15 hover:bg-white/25 border-0 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-white transition-colors"
      >
        <X size={20} />
      </button>
      <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-3 max-w-[90vw] max-h-[90vh]">
        {task.mediaType === "video" ? (
          <video src={task.mediaUrl} controls autoPlay className="max-w-full max-h-[80vh] rounded-xl bg-black" />
        ) : (
          <img src={task.mediaUrl} alt={task.title} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
        )}
        <p className="text-white font-semibold m-0">{task.title}</p>
        {task.volunteerNote && <p className="text-gray-400 text-sm m-0">Note: {task.volunteerNote}</p>}
      </div>
    </div>
  );
}

// Three-dot action menu
function ActionsMenu({ task, onDelete, onPreview }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors border-0 bg-transparent cursor-pointer"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 min-w-[140px]">
          {task.mediaUrl && (
            <button
              onClick={() => { onPreview(task); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-beige-100 transition-colors border-0 bg-transparent cursor-pointer text-left"
            >
              <Eye size={14} className="text-gray-400" /> View Media
            </button>
          )}
          <button
            onClick={() => { onDelete(task._id); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer text-left"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

const LIMIT = 8;

export default function AdminTasks() {
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewTask, setPreviewTask]   = useState(null);
  const [page, setPage]                 = useState(1);
  const [msg, setMsg]                   = useState({ type: "", text: "" });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/all`, {
        headers: { Authorization: `Bearer ${token()}` },
        credentials: "include",
      });
      const d = await res.json();
      if (d.success) setTasks(d.data || []);
    } catch {
      showMsg("error", "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
        credentials: "include",
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      setTasks((p) => p.filter((t) => t._id !== id));
      showMsg("success", "Task deleted");
    } catch (e) {
      showMsg("error", e.message);
    }
  };

  const counts = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

  const filtered = statusFilter === "all" ? tasks : tasks.filter((t) => t.status === statusFilter);
  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleFilterChange = (f) => { setStatusFilter(f); setPage(1); };

  const statCards = [
    { label: "Total Tasks",  value: tasks.length,           icon: CheckCircle,  highlight: false },
    { label: "Assigned",     value: counts.assigned    || 0, icon: ClipboardList, highlight: true  },
    { label: "In Progress",  value: counts.in_progress || 0, icon: RefreshCw,    highlight: false },
    { label: "Completed",    value: counts.completed   || 0, icon: CheckCircle,  highlight: false },
  ];

  return (
    <div className="min-h-screen bg-beige-300 p-3 sm:p-5 lg:p-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-2">
            Tasks
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-lg leading-relaxed">
            Manage and monitor grassroots operational duties. Real-time tracking of impact initiatives assigned to our global volunteers.
          </p>
        </div>
      </div>

      {/* ── Alert ── */}
      {msg.text && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl mb-5 text-sm font-semibold ${
          msg.type === "success"
            ? "bg-olive-100 text-olive-800 border border-olive-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {msg.text}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map(({ label, value, icon: Icon, highlight }) => (
          <div
            key={label}
            className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 ${
              highlight ? "bg-lime" : "bg-beige-100"
            }`}
          >
            <Icon size={20} className={highlight ? "text-olive-700" : "text-gray-400"} />
            <div>
              <div className={`text-3xl sm:text-4xl font-extrabold leading-none mb-1 ${
                highlight ? "text-olive-800" : "text-gray-900"
              }`}>
                {value}
              </div>
              <div className={`text-xs font-bold uppercase tracking-widest ${
                highlight ? "text-olive-700" : "text-gray-400"
              }`}>
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Active Assignments Card ── */}
      <div className="bg-beige-100 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">

        {/* Card header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-beige-300">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Active Assignments</h2>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 px-5 sm:px-7 py-3 sm:py-4 overflow-x-auto no-scrollbar border-b border-beige-300">
          {[
            ["all", `All (${tasks.length})`],
            ["assigned",    `Assigned (${counts.assigned    || 0})`],
            ["in_progress", `In Progress (${counts.in_progress || 0})`],
            ["completed",   `Completed (${counts.completed   || 0})`],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => handleFilterChange(val)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-semibold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                statusFilter === val
                  ? "bg-olive-700 text-white border-olive-700"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Loading tasks…</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ClipboardList size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks found.</p>
          </div>
        ) : (
          <>
            {/* Column headers — desktop only */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 sm:px-7 py-3 border-b border-beige-300">
              {["Task Details", "Assignee", "Status", "Due Date", "Actions"].map((h) => (
                <div key={h} className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-beige-300">
              {paginated.map((t) => {
                const { Icon, bg, color } = taskIcon(t.title, t.serviceTitle);
                const volunteerInitials = t.volunteerName
                  ? t.volunteerName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
                  : "?";
                const due = t.dueDate || t.createdAt;
                const todayDue = isToday(due);

                return (
                  <div key={t._id} className="px-5 sm:px-7 py-4 sm:py-5 hover:bg-beige-50 transition-colors">

                    {/* ── Desktop row ── */}
                    <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center">
                      {/* Task details */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                          <Icon size={18} className={color} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 text-sm leading-tight mb-0.5 truncate">
                            {t.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {t.serviceTitle || "General Donation"}
                          </div>
                          {t.description && (
                            <div className="text-xs text-gray-400 mt-0.5 truncate">{t.description}</div>
                          )}
                        </div>
                      </div>

                      {/* Assignee */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ background: avatarColor(t.volunteerName || "?") }}
                        >
                          {volunteerInitials}
                        </div>
                        <span className="text-sm text-gray-700 font-semibold truncate">
                          {t.volunteerName || "—"}
                        </span>
                      </div>

                      {/* Status */}
                      <div><StatusBadge status={t.status} /></div>

                      {/* Due date */}
                      <div className={`text-sm font-semibold ${todayDue ? "text-red-500" : "text-gray-600"}`}>
                        {todayDue ? "Today" : fmtDate(due)}
                      </div>

                      {/* Actions */}
                      <div>
                        <ActionsMenu task={t} onDelete={handleDelete} onPreview={setPreviewTask} />
                      </div>
                    </div>

                    {/* ── Mobile row ── */}
                    <div className="md:hidden flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                        <Icon size={17} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-bold text-gray-900 text-sm leading-tight">{t.title}</div>
                          <ActionsMenu task={t} onDelete={handleDelete} onPreview={setPreviewTask} />
                        </div>
                        <div className="text-xs text-gray-500 mb-2 truncate">
                          {t.serviceTitle || "General Donation"}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={t.status} />
                          {t.volunteerName && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[9px] shrink-0"
                                style={{ background: avatarColor(t.volunteerName) }}
                              >
                                {volunteerInitials}
                              </div>
                              {t.volunteerName}
                            </span>
                          )}
                          <span className={`text-xs font-semibold ${todayDue ? "text-red-500" : "text-gray-400"}`}>
                            {todayDue ? "Due Today" : fmtDate(due)}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-t border-beige-300">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                Showing {Math.min((page - 1) * LIMIT + 1, filtered.length)}–{Math.min(page * LIMIT, filtered.length)} of {filtered.length} active task{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="w-9 h-9 rounded-full border border-beige-400 flex items-center justify-center text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:border-gray-400 transition-colors bg-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-olive-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors bg-olive-700 hover:bg-olive-800 border-0"
                >
                  <ChevronRight size={16} className="text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {previewTask && <MediaLightbox task={previewTask} onClose={() => setPreviewTask(null)} />}

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
