import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, X, ChevronLeft, ChevronRight, MapPin, Calendar, Shield } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"];
const LIMIT = 8;

const PALETTE = [
  { bg: "#d8e8b8", text: "#3a5c1a" },
  { bg: "#c7d9f0", text: "#1e40af" },
  { bg: "#fde68a", text: "#92400e" },
  { bg: "#fecaca", text: "#991b1b" },
  { bg: "#e9d5ff", text: "#6d28d9" },
  { bg: "#fed7aa", text: "#9a3412" },
  { bg: "#d1fae5", text: "#065f46" },
];
const avatarStyle = (name) => PALETTE[(name || " ").charCodeAt(0) % PALETTE.length];
const getInitials = (name) =>
  (name || "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function StatusBadge({ status }) {
  const cls =
    status === "Approved" ? "bg-green-100 text-green-700" :
    status === "Rejected" ? "bg-red-100 text-red-600"    :
                            "bg-yellow-100 text-yellow-700";
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
}

function pageRange(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "...", total];
  if (current >= total - 2) return [1, "...", total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

/* ════════════════════════════════════════════════════ */
function AdminVolunteers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [volunteers,    setVolunteers]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState(searchParams.get("search") || "");
  const [statusFilter,  setStatusFilter]  = useState(searchParams.get("status") || "");
  const [page,          setPage]          = useState(Number(searchParams.get("page")) || 1);
  const [pagination,    setPagination]    = useState({ total: 0, pages: 1 });
  const [actionLoading, setActionLoading] = useState(null);

  /* Modal state — two-step for smooth transition */
  const [selected,    setSelected]    = useState(null);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalStatus, setModalStatus] = useState("");
  const [modalRole,   setModalRole]   = useState("");
  const [modalArea,   setModalArea]   = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  const token = localStorage.getItem("token");

  const fetchVolunteers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)       params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", page);
    params.set("limit", LIMIT);
    fetch(`${API_BASE_URL}/api/admin/volunteers?${params}`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setVolunteers(d.data);
          const total = d.pagination?.total ?? d.data?.length ?? 0;
          setPagination({ total, pages: Math.ceil(total / LIMIT) || 1 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, statusFilter, page, token]);

  useEffect(() => { fetchVolunteers(); }, [fetchVolunteers]);
  useEffect(() => {
    const p = {};
    if (search)       p.search = search;
    if (statusFilter) p.status = statusFilter;
    if (page > 1)     p.page   = page;
    setSearchParams(p, { replace: true });
  }, [search, statusFilter, page, setSearchParams]);

  /* ── Smooth modal open: mount first, then trigger CSS transition ── */
  const openModal = (v) => {
    setSelected(v);
    setModalStatus(v.status);
    setModalRole(v.role || "");
    setModalArea(v.assignedArea || "");
    requestAnimationFrame(() => requestAnimationFrame(() => setModalOpen(true)));
  };

  /* ── Smooth modal close: reverse transition, then unmount ── */
  const closeModal = () => {
    if (modalSaving) return;
    setModalOpen(false);
    setTimeout(() => setSelected(null), 320);
  };

  const handleModalSave = async () => {
    if (!selected) return;
    setModalSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/volunteers/${selected._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status: modalStatus, role: modalRole, assignedArea: modalArea }),
      });
      const d = await res.json();
      if (d.success) { closeModal(); fetchVolunteers(); }
      else alert(d.message || "Failed to update");
    } catch { alert("Network error"); }
    finally { setModalSaving(false); }
  };

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/volunteers/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const d = await res.json();
      if (d.success) fetchVolunteers(); else alert(d.message || "Failed");
    } catch { alert("Network error"); }
    finally { setActionLoading(null); }
  };

  const deleteVolunteer = async (id, name) => {
    if (!confirm(`Delete volunteer "${name}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/volunteers/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) fetchVolunteers(); else alert(d.message || "Failed to delete");
    } catch { alert("Network error"); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8]">
      <div className="p-4 sm:p-6 lg:p-8">

        {/* ══ HEADER ══ */}
        <div className="mb-6">
          <div>
            <h1 className="text-[1.8rem] sm:text-[2.4rem] font-black text-gray-900 leading-tight m-0">
              Manage Volunteers
            </h1>
            <p className="text-sm text-gray-500 mt-1 m-0">
              Review, approve, and manage community impact contributors.
            </p>
          </div>
        </div>

        {/* ══ FILTERS ══ */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by name, email, city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer shadow-sm w-full sm:w-[160px]"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* ══ TABLE CARD (no border) ══ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading volunteers…</div>
          ) : volunteers.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No volunteers found.</div>
          ) : (
            <>
              {/* ── Desktop table (lg+) ── */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Volunteer Name", "Email / Phone", "City / State", "Role", "Applied Date", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((v) => {
                      const av   = avatarStyle(v.fullName);
                      const busy = actionLoading === v._id;
                      return (
                        <tr key={v._id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                style={{ background: av.bg, color: av.text }}>
                                {getInitials(v.fullName)}
                              </div>
                              <span className="font-semibold text-gray-800 text-sm">{v.fullName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-700 m-0">{v.email}</p>
                            <p className="text-xs text-gray-400 m-0 mt-0.5">{v.phone}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-700 m-0">{v.city}</p>
                            <p className="text-xs text-gray-400 m-0 mt-0.5">{v.state}</p>
                          </td>
                          <td className="px-5 py-4">
                            {v.role
                              ? <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 uppercase tracking-wide">{v.role}</span>
                              : <span className="text-gray-300 text-sm">—</span>}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(v.createdAt)}</td>
                          <td className="px-5 py-4"><StatusBadge status={v.status} /></td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => openModal(v)} title="View & Edit"
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border-0 cursor-pointer">
                                <Eye size={15} />
                              </button>
                              {v.status !== "Approved" && (
                                <button onClick={() => updateStatus(v._id, "Approved")} disabled={busy}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-40 border-0 cursor-pointer">
                                  Approve
                                </button>
                              )}
                              {v.status !== "Rejected" && (
                                <button onClick={() => updateStatus(v._id, "Rejected")} disabled={busy}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40 border-0 cursor-pointer">
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile + Tablet cards (< lg) ── */}
              <div className="lg:hidden">
                {volunteers.map((v) => {
                  const av   = avatarStyle(v.fullName);
                  const busy = actionLoading === v._id;
                  return (
                    <div key={v._id} className="border-b border-gray-100 last:border-b-0 px-4 py-4 sm:px-5 sm:py-5 hover:bg-gray-50/50 transition-colors">

                      {/* Row 1 — Avatar + Name + Status */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-base"
                          style={{ background: av.bg, color: av.text }}>
                          {getInitials(v.fullName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm m-0 truncate">{v.fullName}</p>
                          <p className="text-xs text-gray-400 m-0 mt-0.5 truncate">{v.email}</p>
                        </div>
                        <StatusBadge status={v.status} />
                      </div>

                      {/* Row 2 — Info chips */}
                      <div className="flex flex-wrap gap-2 mb-3 pl-[3.25rem]">
                        {/* Phone */}
                        <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                          📞 {v.phone || "—"}
                        </span>
                        {/* Location */}
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                          <MapPin size={10} />
                          {[v.city, v.state].filter(Boolean).join(", ") || "—"}
                        </span>
                        {/* Applied date */}
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                          <Calendar size={10} />
                          {formatDate(v.createdAt)}
                        </span>
                        {/* Role */}
                        {v.role && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide">
                            <Shield size={10} />
                            {v.role}
                          </span>
                        )}
                      </div>

                      {/* Row 3 — Action buttons */}
                      <div className="flex items-center gap-2 pl-[3.25rem]">
                        <button onClick={() => openModal(v)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors border-0 cursor-pointer">
                          <Eye size={13} /> View
                        </button>
                        {v.status !== "Approved" && (
                          <button onClick={() => updateStatus(v._id, "Approved")} disabled={busy}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-40 border-0 cursor-pointer">
                            ✓ Approve
                          </button>
                        )}
                        {v.status !== "Rejected" && (
                          <button onClick={() => updateStatus(v._id, "Rejected")} disabled={busy}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40 border-0 cursor-pointer">
                            ✗ Reject
                          </button>
                        )}
                        <button onClick={() => deleteVolunteer(v._id, v.fullName)} disabled={busy}
                          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-40 border-0 cursor-pointer">
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

        {/* ══ FOOTER: count + numbered pagination ══ */}
        {!loading && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">
            <p className="text-sm text-gray-500 m-0">
              Showing{" "}
              <strong className="text-gray-800">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)}</strong>
              {" "}of{" "}
              <strong className="text-gray-800">{pagination.total.toLocaleString()}</strong> volunteers
            </p>
            {pagination.pages > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  <ChevronLeft size={16} />
                </button>
                {pageRange(page, pagination.pages).map((n, i) =>
                  n === "..." ? (
                    <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                  ) : (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors cursor-pointer border-0 ${
                        page === n ? "bg-[#2d5a1b] text-white shadow-sm" : "border border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
                      }`}>
                      {n}
                    </button>
                  )
                )}
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.pages}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ MODAL — with smooth slide-up + fade transition ══ */}
        {selected && (
          <>
            {/* Backdrop */}
            <div
              onClick={closeModal}
              className="fixed inset-0 z-[9998] transition-all duration-300"
              style={{ background: modalOpen ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)" }}
            />

            {/* Sheet: bottom-sheet on mobile, centred on sm+ */}
            <div
              className="fixed z-[9999] inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 pointer-events-none"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto bg-white w-full sm:max-w-lg max-h-[90vh] overflow-y-auto
                           rounded-t-3xl sm:rounded-2xl shadow-2xl
                           transition-all duration-300 ease-out"
                style={{
                  transform: modalOpen ? "translateY(0)" : "translateY(40px)",
                  opacity:   modalOpen ? 1 : 0,
                }}
              >
                {/* Pull handle — mobile only */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: avatarStyle(selected.fullName).bg, color: avatarStyle(selected.fullName).text }}>
                      {getInitials(selected.fullName)}
                    </div>
                    <div>
                      <h3 className="m-0 text-base font-bold text-gray-900 leading-tight">{selected.fullName}</h3>
                      <p className="m-0 text-xs text-gray-400 mt-0.5">Volunteer Details</p>
                    </div>
                  </div>
                  <button onClick={closeModal} disabled={modalSaving}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors border-0 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="px-5 sm:px-6 py-5">
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-5">
                    {[
                      ["Email",        selected.email],
                      ["Phone",        selected.phone],
                      ["City",         selected.city],
                      ["State",        selected.state],
                      ["Mode",         selected.mode || "—"],
                      ["Availability", selected.availability || "—"],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 m-0">{label}</p>
                        <p className="text-sm font-semibold text-gray-800 m-0 break-words">{val || "—"}</p>
                      </div>
                    ))}
                    {selected.interests?.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 m-0">Interests</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.interests.map((i) => (
                            <span key={i} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{i}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selected.skills && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 m-0">Skills</p>
                        <p className="text-sm font-semibold text-gray-800 m-0">{selected.skills}</p>
                      </div>
                    )}
                    {selected.motivation && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 m-0">Motivation</p>
                        <p className="text-sm text-gray-700 m-0 leading-relaxed">{selected.motivation}</p>
                      </div>
                    )}
                  </div>

                  <hr className="border-gray-100 my-4" />

                  {/* Edit fields */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Status</label>
                      <select value={modalStatus} onChange={(e) => setModalStatus(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors bg-white cursor-pointer">
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Role (assigned by admin)</label>
                      <input type="text" placeholder="e.g. Field Coordinator, Camp Leader"
                        value={modalRole} onChange={(e) => setModalRole(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Assigned Area</label>
                      <input type="text" placeholder="e.g. North Delhi, Rajasthan Zone"
                        value={modalArea} onChange={(e) => setModalArea(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2.5 px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl sm:rounded-b-2xl">
                  <button onClick={closeModal} disabled={modalSaving}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={handleModalSave} disabled={modalSaving}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#2d5a1b] hover:bg-[#1f3f12] transition-colors cursor-pointer disabled:opacity-60">
                    {modalSaving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default AdminVolunteers;
