import { useState, useEffect } from "react";
import {
  Users, RefreshCw, ChevronDown, ChevronLeft, ChevronRight,
  Phone, Mail, Building2, MapPin, UserCheck, UserX, Trash2,
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

// ── Meta ──────────────────────────────────────────────────────────────────────
const ROLE_META = {
  doctor:        { label: "Doctor",        cls: "bg-red-50 text-red-700 border-red-200" },
  teacher:       { label: "Teacher",       cls: "bg-blue-50 text-blue-700 border-blue-200" },
  nurse:         { label: "Nurse",         cls: "bg-pink-50 text-pink-700 border-pink-200" },
  social_worker: { label: "Social Worker", cls: "bg-olive-100 text-olive-700 border-olive-200" },
  engineer:      { label: "Engineer",      cls: "bg-amber-50 text-amber-700 border-amber-200" },
  lawyer:        { label: "Lawyer",        cls: "bg-purple-50 text-purple-700 border-purple-200" },
  paramedic:     { label: "Paramedic",     cls: "bg-orange-50 text-orange-700 border-orange-200" },
  counselor:     { label: "Counselor",     cls: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  other:         { label: "Other",         cls: "bg-beige-200 text-gray-700 border-beige-300" },
};

const EMP_LABELS = {
  full_time:   "Full-Time",
  part_time:   "Part-Time",
  volunteer:   "Volunteer",
  contractual: "Contractual",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminStaff() {
  const [staff, setStaff]           = useState([]);
  const [stats, setStats]           = useState({ byRole: [], total: 0 });
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [roleFilter, setRoleFilter]     = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  const token = localStorage.getItem("token");

  const loadStats = () => {
    fetch(`${API_BASE_URL}/api/staff/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .catch(() => {});
  };

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 30 });
    if (roleFilter !== "all")   params.set("role", roleFilter);
    if (activeFilter !== "all") params.set("isActive", activeFilter === "active");
    fetch(`${API_BASE_URL}/api/staff/admin/all?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStaff(d.data.staff);
          setPagination(d.data.pagination);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { setPage(1); load(1); }, [roleFilter, activeFilter]);
  useEffect(() => { load(page); }, [page]);

  const deleteStaff = (id) => {
    if (!confirm("Remove this staff member?")) return;
    fetch(`${API_BASE_URL}/api/staff/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStaff((ms) => ms.filter((m) => m._id !== id));
          loadStats();
        }
      })
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-beige-300 p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-1">
            Staff &amp; <span className="text-olive-700">Professionals</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            {stats.total} professional{stats.total !== 1 ? "s" : ""} across all NGOs
          </p>
        </div>
        <button
          onClick={() => { loadStats(); load(page); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-beige-100 border border-beige-300 text-gray-700 text-sm font-semibold hover:border-beige-400 transition-colors cursor-pointer shrink-0 self-start"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Role Stats ── */}
      {stats.byRole.filter((r) => r.total > 0).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
          {stats.byRole.filter((r) => r.total > 0).map((r) => {
            const meta = ROLE_META[r._id] || ROLE_META.other;
            return (
              <div
                key={r._id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${meta.cls}`}
              >
                <span className="text-sm font-extrabold">{r.total}</span>
                <span>{meta.label}</span>
                {r.active < r.total && (
                  <span className="font-normal opacity-60">({r.active} active)</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 mb-5 sm:mb-6">

        {/* Active/Inactive pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold cursor-pointer transition-all border whitespace-nowrap ${
                activeFilter === f
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-beige-100 text-gray-600 border-beige-300 hover:border-beige-400"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Role dropdown */}
        <div className="relative self-start">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none bg-beige-100 border border-beige-300 rounded-xl sm:rounded-2xl pl-3 pr-8 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-olive-400 cursor-pointer text-gray-700"
          >
            <option value="all">All Roles</option>
            {Object.entries(ROLE_META).map(([v, m]) => (
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
          <span className="text-sm">Loading staff…</span>
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No staff members found.</p>
          <p className="text-xs mt-1 text-gray-400">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-beige-100 rounded-2xl sm:rounded-3xl border border-beige-300 overflow-hidden">

          {/* ── Mobile cards ── */}
          <div className="sm:hidden divide-y divide-beige-300">
            {staff.map((m) => {
              const role = ROLE_META[m.role] || ROLE_META.other;
              return (
                <div key={m._id} className="p-4 hover:bg-beige-200 transition-colors">

                  {/* Name + delete */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-bold text-gray-900 text-sm leading-tight flex-1">{m.name}</p>
                    <button
                      onClick={() => deleteStaff(m._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 cursor-pointer transition-colors shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Specialization */}
                  {m.specialization && (
                    <p className="text-xs text-gray-400 mb-2">{m.specialization}</p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.cls}`}>
                      {role.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        m.isActive
                          ? "bg-olive-100 text-olive-700 border-olive-200"
                          : "bg-beige-200 text-gray-600 border-beige-300"
                      }`}
                    >
                      {m.isActive ? <UserCheck size={9} /> : <UserX size={9} />}
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                    {m.employmentType && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-beige-200 text-gray-600 border-beige-300">
                        {EMP_LABELS[m.employmentType] || m.employmentType}
                      </span>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Building2 size={10} className="text-gray-400 shrink-0" />
                      <span className="truncate">{m.ngoId?.ngoName || "—"}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={10} className="text-gray-400 shrink-0" />
                      <span className="truncate">{m.villageId?.villageName || "—"}</span>
                    </span>
                    {m.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone size={10} className="text-gray-400 shrink-0" />
                        {m.phone}
                      </span>
                    )}
                    {m.email && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 col-span-2">
                        <Mail size={10} className="text-gray-400 shrink-0" />
                        <span className="truncate">{m.email}</span>
                      </span>
                    )}
                    <span className="text-xs text-gray-400 col-span-2">
                      Joined: {fmtDate(m.joinedAt)}
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
                  {["Name", "Role", "Specialization", "NGO", "Village", "Contact", "Type", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-olive-600 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {staff.map((m) => {
                  const role = ROLE_META[m.role] || ROLE_META.other;
                  return (
                    <tr key={m._id} className="hover:bg-beige-200 transition-colors">

                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-sm text-gray-900">{m.name}</p>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${role.cls}`}>
                          {role.label}
                        </span>
                      </td>

                      {/* Specialization */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-500">{m.specialization || "—"}</span>
                      </td>

                      {/* NGO */}
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Building2 size={11} className="text-gray-400 shrink-0" />
                          {m.ngoId?.ngoName || "—"}
                        </span>
                      </td>

                      {/* Village */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-500">{m.villageId?.villageName || "—"}</span>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          {m.phone && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone size={10} className="text-gray-400" /> {m.phone}
                            </span>
                          )}
                          {m.email && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail size={10} className="text-gray-400" /> {m.email}
                            </span>
                          )}
                          {!m.phone && !m.email && <span className="text-xs text-gray-400">—</span>}
                        </div>
                      </td>

                      {/* Employment type */}
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-beige-200 text-gray-600 border-beige-300">
                          {EMP_LABELS[m.employmentType] || m.employmentType || "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            m.isActive
                              ? "bg-olive-100 text-olive-700 border-olive-200"
                              : "bg-beige-200 text-gray-600 border-beige-300"
                          }`}
                        >
                          {m.isActive ? <UserCheck size={10} /> : <UserX size={10} />}
                          {m.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(m.joinedAt)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => deleteStaff(m._id)}
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
