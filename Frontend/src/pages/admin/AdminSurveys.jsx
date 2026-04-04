import { useState, useEffect } from "react";
import {
  ClipboardList, RefreshCw, ChevronLeft, ChevronRight,
  Users, CheckCircle, Clock, FileText, Building2, MapPin, Trash2, ExternalLink,
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

// ── Meta ──────────────────────────────────────────────────────────────────────
const STATUS_META = {
  draft:  { label: "Draft",  cls: "bg-beige-200 text-gray-600 border-beige-300",    Icon: FileText },
  active: { label: "Active", cls: "bg-olive-100 text-olive-700 border-olive-200",   Icon: CheckCircle },
  closed: { label: "Closed", cls: "bg-amber-50 text-amber-700 border-amber-200",    Icon: Clock },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminSurveys() {
  const [surveys, setSurveys]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("token");

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 25 });
    if (statusFilter !== "all") params.set("status", statusFilter);
    fetch(`${API_BASE_URL}/api/surveys/admin/all?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSurveys(d.data.surveys);
          setPagination(d.data.pagination);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(1); }, [statusFilter]);
  useEffect(() => { load(page); }, [page]);

  const deleteSurvey = (id) => {
    if (!confirm("Delete this survey and all its responses?")) return;
    fetch(`${API_BASE_URL}/api/surveys/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setSurveys((ss) => ss.filter((s) => s._id !== id)); })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-beige-300 p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-1">
            Survey <span className="text-olive-700">Management</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            {pagination.total} survey{pagination.total !== 1 ? "s" : ""} across all NGOs
          </p>
        </div>
        <button
          onClick={() => load(page)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-beige-100 border border-beige-300 text-gray-700 text-sm font-semibold hover:border-beige-400 transition-colors cursor-pointer shrink-0 self-start"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Status Filter Pills ── */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5 sm:mb-6">
        {["all", "draft", "active", "closed"].map((s) => (
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
          <span className="text-sm">Loading surveys…</span>
        </div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No surveys found.</p>
          <p className="text-xs mt-1 text-gray-400">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-beige-100 rounded-2xl sm:rounded-3xl border border-beige-300 overflow-hidden">

          {/* ── Mobile cards ── */}
          <div className="sm:hidden divide-y divide-beige-300">
            {surveys.map((sv) => {
              const sm = STATUS_META[sv.status] || STATUS_META.draft;
              return (
                <div key={sv._id} className="p-4 hover:bg-beige-200 transition-colors">

                  {/* Title + actions */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-bold text-gray-900 text-sm leading-tight flex-1">{sv.title}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {sv.status === "active" && (
                        <a
                          href={`/survey/${sv.shareToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-colors"
                        >
                          <ExternalLink size={11} />
                        </a>
                      )}
                      <button
                        onClick={() => deleteSurvey(sv._id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 cursor-pointer transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Target audience */}
                  {sv.targetAudience && (
                    <p className="text-xs text-gray-400 mb-2">{sv.targetAudience}</p>
                  )}

                  {/* Status badge */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sm.cls}`}>
                      <sm.Icon size={9} /> {sm.label}
                    </span>
                  </div>

                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Building2 size={10} className="text-gray-400 shrink-0" />
                      <span className="truncate">{sv.ngoId?.ngoName || "—"}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={10} className="text-gray-400 shrink-0" />
                      <span className="truncate">{sv.villageId?.villageName || "—"}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <ClipboardList size={10} className="text-gray-400 shrink-0" />
                      {sv.questions?.length || 0} question{sv.questions?.length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Users size={10} className="text-gray-400 shrink-0" />
                      {sv.responseCount || 0} response{sv.responseCount !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-gray-400 col-span-2">
                      Created: {fmtDate(sv.createdAt)}
                    </span>
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
                  {["Survey", "NGO", "Village", "Status", "Questions", "Responses", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-olive-600 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {surveys.map((sv) => {
                  const sm = STATUS_META[sv.status] || STATUS_META.draft;
                  return (
                    <tr key={sv._id} className="hover:bg-beige-200 transition-colors">

                      {/* Survey */}
                      <td className="px-4 py-3.5 max-w-[220px]">
                        <p className="font-bold text-sm text-gray-900 truncate">{sv.title}</p>
                        {sv.targetAudience && (
                          <p className="text-xs text-gray-400 mt-0.5">{sv.targetAudience}</p>
                        )}
                      </td>

                      {/* NGO */}
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Building2 size={11} className="text-gray-400 shrink-0" />
                          {sv.ngoId?.ngoName || "—"}
                        </span>
                      </td>

                      {/* Village */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-500">{sv.villageId?.villageName || "—"}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${sm.cls}`}>
                          <sm.Icon size={10} /> {sm.label}
                        </span>
                      </td>

                      {/* Questions */}
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <ClipboardList size={11} className="text-gray-400" />
                          {sv.questions?.length || 0}
                        </span>
                      </td>

                      {/* Responses */}
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Users size={11} className="text-gray-400" />
                          {sv.responseCount || 0}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(sv.createdAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {sv.status === "active" && (
                            <a
                              href={`/survey/${sv.shareToken}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-colors"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                          <button
                            onClick={() => deleteSurvey(sv._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 cursor-pointer transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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
    </div>
  );
}
