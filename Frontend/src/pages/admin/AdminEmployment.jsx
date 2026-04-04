import { useState, useEffect } from "react";
import {
  Briefcase, RefreshCw, ChevronDown, ChevronLeft, ChevronRight,
  Users, MapPin, Building2, IndianRupee, CheckCircle, Clock, XCircle, Trash2,
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

// ── Meta ──────────────────────────────────────────────────────────────────────
const CAT_META = {
  skill_training:  { label: "Skill Training",  cls: "bg-olive-100 text-olive-700 border-olive-200" },
  job_placement:   { label: "Job Placement",   cls: "bg-olive-200 text-olive-800 border-olive-300" },
  self_employment: { label: "Self Employment", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  apprenticeship:  { label: "Apprenticeship",  cls: "bg-beige-200 text-gray-700 border-beige-300" },
  other:           { label: "Other",           cls: "bg-beige-300 text-gray-600 border-beige-400" },
};

const STATUS_META = {
  open:      { label: "Open",      cls: "bg-olive-100 text-olive-700 border-olive-200",  Icon: CheckCircle },
  closed:    { label: "Closed",    cls: "bg-amber-50 text-amber-700 border-amber-200",   Icon: Clock },
  completed: { label: "Completed", cls: "bg-beige-200 text-gray-700 border-beige-300",  Icon: XCircle },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const fmtINR = (n) =>
  n > 0 ? "₹" + new Intl.NumberFormat("en-IN").format(n) + "/mo" : "Unpaid";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminEmployment() {
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter]     = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const token = localStorage.getItem("token");

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 25 });
    if (statusFilter !== "all")  params.set("status", statusFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    fetch(`${API_BASE_URL}/api/employment/admin/all?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setJobs(d.data.jobs);
          setPagination(d.data.pagination);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(1); }, [statusFilter, categoryFilter]);
  useEffect(() => { load(page); }, [page]);

  const deleteJob = (id) => {
    if (!confirm("Delete this listing?")) return;
    fetch(`${API_BASE_URL}/api/employment/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setJobs((js) => js.filter((j) => j._id !== id)); })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-beige-300 p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-1">
            Employment <span className="text-olive-700">Programs</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            {pagination.total} program{pagination.total !== 1 ? "s" : ""} across all NGOs
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
          {["all", "open", "closed", "completed"].map((s) => (
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

        {/* Category dropdown */}
        <div className="relative self-start">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none bg-beige-100 border border-beige-300 rounded-xl sm:rounded-2xl pl-3 pr-8 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-olive-400 cursor-pointer text-gray-700"
          >
            <option value="all">All Categories</option>
            {Object.entries(CAT_META).map(([v, m]) => (
              <option key={v} value={v}>{m.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <RefreshCw size={20} className="animate-spin" />
          <span className="text-sm">Loading programs…</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No programs found.</p>
          <p className="text-xs mt-1 text-gray-400">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-beige-100 rounded-2xl sm:rounded-3xl border border-beige-300 overflow-hidden">

          {/* ── Mobile cards ── */}
          <div className="sm:hidden divide-y divide-beige-300">
            {jobs.map((j) => {
              const sm  = STATUS_META[j.status]    || STATUS_META.open;
              const cat = CAT_META[j.category]     || CAT_META.other;
              return (
                <div key={j._id} className="p-4 hover:bg-beige-200 transition-colors">

                  {/* Title + delete */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-bold text-gray-900 text-sm leading-tight flex-1">{j.title}</p>
                    <button
                      onClick={() => deleteJob(j._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 cursor-pointer transition-colors shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Location */}
                  {j.location && (
                    <p className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <MapPin size={10} /> {j.location}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sm.cls}`}>
                      <sm.Icon size={9} /> {sm.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.cls}`}>
                      {cat.label}
                    </span>
                  </div>

                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Building2 size={10} className="text-gray-400 shrink-0" />
                      <span className="truncate">{j.ngoId?.ngoName || "—"}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={10} className="text-gray-400 shrink-0" />
                      <span className="truncate">{j.villageId?.villageName || "—"}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Users size={10} className="text-gray-400 shrink-0" />
                      {j.filled}/{j.openings} filled
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <IndianRupee size={10} className="text-gray-400 shrink-0" />
                      {fmtINR(j.stipend)}
                    </span>
                    <span className="text-xs text-gray-400 col-span-2">
                      Starts: {fmtDate(j.startDate)}
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
                  {["Program", "NGO", "Village", "Category", "Status", "Openings", "Stipend", "Start Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-olive-600 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {jobs.map((j) => {
                  const sm  = STATUS_META[j.status]  || STATUS_META.open;
                  const cat = CAT_META[j.category]   || CAT_META.other;
                  return (
                    <tr key={j._id} className="hover:bg-beige-200 transition-colors">

                      {/* Program */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="font-bold text-sm text-gray-900 truncate">{j.title}</p>
                        {j.location && (
                          <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <MapPin size={10} /> {j.location}
                          </p>
                        )}
                      </td>

                      {/* NGO */}
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Building2 size={11} className="text-gray-400 shrink-0" />
                          {j.ngoId?.ngoName || "—"}
                        </span>
                      </td>

                      {/* Village */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-500">{j.villageId?.villageName || "—"}</span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cat.cls}`}>
                          {cat.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${sm.cls}`}>
                          <sm.Icon size={10} /> {sm.label}
                        </span>
                      </td>

                      {/* Openings */}
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Users size={11} className="text-gray-400" />
                          {j.filled}/{j.openings}
                        </span>
                      </td>

                      {/* Stipend */}
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                          <IndianRupee size={11} className="text-gray-400" />
                          {fmtINR(j.stipend)}
                        </span>
                      </td>

                      {/* Start Date */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(j.startDate)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => deleteJob(j._id)}
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
