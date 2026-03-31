import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MoreVertical, Trash2, Users } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const LIMIT = 8;

/* ── Avatar palette ── */
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
  const pages = [];
  if (current <= 3) {
    pages.push(1, 2, 3, "...", total);
  } else if (current >= total - 2) {
    pages.push(1, "...", total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
}

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ── Three-dot action menu ── */
function ActionMenu({ user, onDelete }) {
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
        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center border-0 bg-transparent cursor-pointer transition-colors"
      >
        <MoreVertical size={16} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-36 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onDelete(user._id); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-0 bg-transparent transition-colors"
          >
            <Trash2 size={13} /> Delete User
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState(searchParams.get("search") || "");
  const [page,       setPage]       = useState(Number(searchParams.get("page")) || 1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", page);
    params.set("limit", LIMIT);
    fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUsers(d.data);
          const total = d.pagination?.total ?? d.data?.length ?? 0;
          setPagination({ total, pages: Math.ceil(total / LIMIT) || 1 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page, token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => {
    const p = {};
    if (search) p.search = search;
    if (page > 1) p.page = page;
    setSearchParams(p, { replace: true });
  }, [search, page, setSearchParams]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
      });
      fetchUsers();
    } catch {}
  };

  const showFrom = pagination.total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const showTo   = Math.min(page * LIMIT, pagination.total);

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8]">
      <div className="p-4 sm:p-6 lg:p-8">

        {/* ══ HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[1.8rem] sm:text-[2.4rem] font-black text-gray-900 leading-tight m-0">
              Registered Users
            </h1>
            <p className="text-sm text-gray-500 mt-1 m-0">
              Manage all platform users and their account details.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm font-semibold text-gray-600 self-start">
            <Users size={15} className="text-[#2d5a1b]" />
            {pagination.total} Users
          </div>
        </div>

        {/* ══ SEARCH ══ */}
        <div className="mb-5 relative max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm"
          />
        </div>

        {/* ══ TABLE CARD ══ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-24 text-gray-400 text-sm">Loading users…</div>
          ) : users.length === 0 ? (
            <div className="text-center py-24 text-gray-400 text-sm">No users found.</div>
          ) : (
            <>
              {/* ── Desktop table (lg+) ── */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["User", "Contact Details", "Location", "Provider", "Verified", "Joined", "Actions"].map((h) => (
                        <th key={h} className="text-left px-5 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const av = avatarStyle(u.name);
                      return (
                        <tr key={u._id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors">

                          {/* User */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {u.avatar ? (
                                <img src={u.avatar} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div
                                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                                  style={{ background: av.bg, color: av.text }}
                                >
                                  {getInitials(u.name)}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-gray-900 text-sm m-0 leading-snug">{u.name}</p>
                                {u.username && (
                                  <p className="text-xs text-gray-400 m-0 mt-0.5">@{u.username}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Contact Details */}
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-700 m-0 leading-snug">{u.email}</p>
                            {u.phone ? (
                              <p className="text-xs text-gray-400 m-0 mt-0.5">{u.phone}</p>
                            ) : (
                              <p className="text-xs text-gray-300 m-0 mt-0.5 italic">Not provided</p>
                            )}
                          </td>

                          {/* Location */}
                          <td className="px-5 py-4">
                            {u.city ? (
                              <span className="text-sm text-gray-700">{u.city}</span>
                            ) : (
                              <span className="text-sm text-gray-300 italic">Not provided</span>
                            )}
                          </td>

                          {/* Provider */}
                          <td className="px-5 py-4">
                            <span className="inline-flex px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wide">
                              {u.authProvider || "local"}
                            </span>
                          </td>

                          {/* Verified */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                              u.emailVerified
                                ? "bg-green-50 text-green-600 border border-green-200"
                                : "bg-red-50 text-red-500 border border-red-200"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${u.emailVerified ? "bg-green-500" : "bg-red-400"}`} />
                              {u.emailVerified ? "Yes" : "No"}
                            </span>
                          </td>

                          {/* Joined */}
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {formatDate(u.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <ActionMenu user={u} onDelete={handleDelete} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile + Tablet cards (< lg) ── */}
              <div className="lg:hidden divide-y divide-gray-100">
                {users.map((u) => {
                  const av = avatarStyle(u.name);
                  return (
                    <div key={u._id} className="px-4 py-4 sm:px-5 sm:py-5">
                      {/* Row 1: avatar + name + actions */}
                      <div className="flex items-center gap-3 mb-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                            style={{ background: av.bg, color: av.text }}
                          >
                            {getInitials(u.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm m-0 truncate">{u.name}</p>
                          {u.username && <p className="text-xs text-gray-400 m-0 mt-0.5">@{u.username}</p>}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${
                          u.emailVerified
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : "bg-red-50 text-red-500 border border-red-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.emailVerified ? "bg-green-500" : "bg-red-400"}`} />
                          {u.emailVerified ? "Yes" : "No"}
                        </span>
                        <ActionMenu user={u} onDelete={handleDelete} />
                      </div>

                      {/* Row 2: chips */}
                      <div className="flex flex-wrap gap-2 pl-[3.5rem]">
                        <span className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full truncate max-w-[200px]">
                          ✉ {u.email}
                        </span>
                        {u.phone && (
                          <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                            📞 {u.phone}
                          </span>
                        )}
                        {u.city && (
                          <span className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                            📍 {u.city}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full uppercase font-semibold">
                          {u.authProvider || "local"}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                          🗓 {formatDate(u.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ══ PAGINATION ══ */}
        {!loading && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5">
            <p className="text-sm text-gray-500 m-0">
              Showing <strong className="text-gray-800">{showFrom} – {showTo}</strong> of{" "}
              <strong className="text-gray-800">{pagination.total.toLocaleString()}</strong> users
            </p>
            {pagination.pages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm"
                >
                  ‹
                </button>
                {pageRange(page, pagination.pages).map((n, i) =>
                  n === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors cursor-pointer border-0 ${
                        page === n
                          ? "bg-[#2d5a1b] text-white shadow-sm"
                          : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.pages}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminUsers;
