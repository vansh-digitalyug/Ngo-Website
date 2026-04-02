import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "./AdminLayout.jsx";
import {
  ChevronDown, ChevronUp, FileText, CheckCircle, Clock,
  Trash2, Search, MapPin, Phone, Globe, ExternalLink,
  ChevronLeft, ChevronRight, Loader, Upload,
} from "lucide-react";

const LIMIT = 8;

function pageRange(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "...", total];
  if (current >= total - 2) return [1, "...", total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const timeAgo = (d) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

/* ── Info field ── */
function InfoField({ label, value, green }) {
  return (
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 m-0">{label}</p>
      <p className={`text-sm font-bold m-0 break-words ${green ? "text-[#2d5a1b]" : "text-gray-900"}`}>
        {value || "—"}
      </p>
    </div>
  );
}

/* ── NGO Avatar ── */
const PALETTE = [
  { bg: "#d8e8b8", text: "#3a5c1a" }, { bg: "#c7d9f0", text: "#1e40af" },
  { bg: "#fde68a", text: "#92400e" }, { bg: "#fecaca", text: "#991b1b" },
  { bg: "#e9d5ff", text: "#6d28d9" }, { bg: "#fed7aa", text: "#9a3412" },
  { bg: "#d1fae5", text: "#065f46" }, { bg: "#c8f56a", text: "#2d5a1b" },
];
const avatarStyle = (name) => PALETTE[(name || " ").charCodeAt(0) % PALETTE.length];

/* ════════════════════════════════════════════════════ */
function AdminNgos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ngos,          setNgos]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState(searchParams.get("search") || "");
  const [statusFilter,  setStatusFilter]  = useState(searchParams.get("status") || "");
  const [page,          setPage]          = useState(Number(searchParams.get("page")) || 1);
  const [pagination,    setPagination]    = useState({ total: 0, pages: 1 });
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedId,    setExpandedId]    = useState(null);

  const token = localStorage.getItem("token");

  const fetchNgos = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)       params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page",  page);
    params.set("limit", LIMIT);
    fetch(`${API_BASE_URL}/api/admin/ngos?${params}`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setNgos(d.data);
          const total = d.pagination?.total ?? d.data?.length ?? 0;
          setPagination({ total, pages: Math.ceil(total / LIMIT) || 1 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, statusFilter, page, token]);

  useEffect(() => { fetchNgos(); }, [fetchNgos]);
  useEffect(() => {
    const p = {};
    if (search)       p.search = search;
    if (statusFilter) p.status = statusFilter;
    if (page > 1)     p.page   = page;
    setSearchParams(p, { replace: true });
  }, [search, statusFilter, page, setSearchParams]);

  const updateStatus = async (id, isVerified) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ngos/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ isVerified }),
      });
      const d = await res.json();
      if (d.success) fetchNgos();
      else alert(d.message || "Failed to update status");
    } catch { alert("Network error"); }
    finally   { setActionLoading(null); }
  };

  const deleteNgo = async (id, name) => {
    if (!confirm(`Delete NGO "${name}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ngos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) fetchNgos();
      else alert(d.message || "Failed to delete");
    } catch { alert("Network error"); }
    finally   { setActionLoading(null); }
  };

  const viewDocument = async (key) => {
    if (!key || key === "not found") return;
    if (key.startsWith("http")) { window.open(key, "_blank", "noopener"); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/s3/get-url?key=${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.data?.Url) window.open(d.data.Url, "_blank", "noopener");
      else alert("Could not generate document link.");
    } catch { alert("Failed to load document."); }
  };

  const showFrom = pagination.total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const showTo   = Math.min(page * LIMIT, pagination.total);

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8]">
      <div className="p-4 sm:p-6 lg:p-8">

        {/* ══ HEADER ══ */}
        <div className="mb-7">
          <h1 className="text-[2rem] sm:text-[2.4rem] font-black text-gray-900 leading-tight m-0">
            Manage NGOs
          </h1>
          <p className="text-sm text-gray-500 mt-1 m-0">
            Review, verify and manage all registered NGOs on the platform.
          </p>
        </div>

        {/* ══ FILTERS ══ */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, city..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer shadow-sm w-full sm:w-[160px]"
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* ══ LIST ══ */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader size={28} className="animate-spin" />
            <p className="text-sm m-0">Loading NGOs…</p>
          </div>
        ) : ngos.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No NGOs found.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {ngos.map((n) => {
              const isExpanded = expandedId === n._id;
              const busy       = actionLoading === n._id;
              const av         = avatarStyle(n.ngoName);
              const fullAddress = [n.address, n.city, n.district, n.state, n.pincode].filter(Boolean).join(", ");
              const mapQuery   = encodeURIComponent((fullAddress ? `${fullAddress}, India` : n.ngoName));

              return (
                <div key={n._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">

                  {/* ── Collapsed header (always visible) ── */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : n._id)}
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Logo / Avatar */}
                    {n.logo ? (
                      <img src={n.logo} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0"
                        style={{ background: av.bg, color: av.text }}
                      >
                        {(n.ngoName || "N").charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm m-0 truncate">{n.ngoName}</p>
                      <p className="text-xs text-gray-400 m-0 mt-0.5 truncate">
                        {n.email}{n.city ? ` • ${n.city}` : ""}
                      </p>
                    </div>

                    {/* Verified badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 ${
                      n.isVerified
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    }`}>
                      {n.isVerified
                        ? <><CheckCircle size={11} /><span className="hidden sm:inline">Verified</span></>
                        : <><Clock size={11} /><span className="hidden sm:inline">Pending</span></>
                      }
                    </span>

                    {/* Chevron */}
                    <div className="text-gray-400 flex-shrink-0">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* ── Expanded detail ── */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-[#faf9f6] px-4 sm:px-6 py-6">

                      {/* ── Top: identity + dates + action buttons ── */}
                      <div className="flex flex-col sm:flex-row gap-5 mb-6">

                        {/* Left: logo + name + desc + buttons */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-3">
                            {n.logo ? (
                              <img src={n.logo} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                            ) : (
                              <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl flex-shrink-0"
                                style={{ background: av.bg, color: av.text }}
                              >
                                {(n.ngoName || "N").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h2 className="text-xl font-black text-gray-900 m-0 leading-tight">{n.ngoName}</h2>
                                {n.isVerified && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-[11px] font-black rounded-full border border-green-200">
                                    <CheckCircle size={10} /> VERIFIED
                                  </span>
                                )}
                              </div>
                              {n.description && (
                                <p className="text-sm text-gray-500 m-0 leading-relaxed max-w-xl line-clamp-3">
                                  {n.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 flex-wrap mt-4">
                            {n.isVerified ? (
                              <button
                                onClick={() => updateStatus(n._id, false)}
                                disabled={busy}
                                className="px-4 py-2 rounded-full border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer bg-transparent disabled:opacity-40"
                              >
                                Revoke Access
                              </button>
                            ) : (
                              <button
                                onClick={() => updateStatus(n._id, true)}
                                disabled={busy}
                                className="px-4 py-2 rounded-full border border-green-300 text-green-700 text-xs font-bold hover:bg-green-50 transition-colors cursor-pointer bg-transparent disabled:opacity-40"
                              >
                                ✓ Approve
                              </button>
                            )}
                            <button
                              onClick={() => deleteNgo(n._id, n.ngoName)}
                              disabled={busy}
                              className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer bg-transparent disabled:opacity-40 flex items-center gap-1.5"
                            >
                              <Trash2 size={12} /> Delete NGO
                            </button>
                            {busy && <Loader size={16} className="animate-spin text-gray-400" />}
                          </div>
                        </div>

                        {/* Right: date chips */}
                        <div className="flex flex-row sm:flex-col gap-3">
                          <div className="bg-[#f0ede8] rounded-2xl px-4 py-3 flex-1 sm:flex-none sm:min-w-[150px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest m-0 mb-1">Registration Date</p>
                            <p className="text-sm font-bold text-gray-900 m-0">{formatDate(n.createdAt)}</p>
                          </div>
                          <div className="bg-[#f0ede8] rounded-2xl px-4 py-3 flex-1 sm:flex-none sm:min-w-[150px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest m-0 mb-1">Last Activity</p>
                            <p className="text-sm font-bold text-gray-900 m-0">{timeAgo(n.updatedAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* ── Registration & Contact (side by side) ── */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                        {/* Registration & Impact */}
                        <div className="bg-[#f0ede8] rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText size={16} className="text-[#2d5a1b]" />
                            <h3 className="text-sm font-black text-gray-900 m-0">Registration &amp; Impact</h3>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 mb-4">
                            <InfoField label="Reg Type"   value={n.regType} />
                            <InfoField label="Est. Year"  value={n.estYear} />
                            <InfoField label="PAN Number" value={n.panNumber} />
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                            <InfoField label="Reg Number" value={n.regNumber} />
                            <InfoField label="DARPAN ID"  value={n.darpanId} />
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div className="bg-[#f0ede8] rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <Phone size={16} className="text-[#2d5a1b]" />
                            <h3 className="text-sm font-black text-gray-900 m-0">Contact Details</h3>
                          </div>
                          <div className="flex flex-col gap-3">
                            {n.contactName && (
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 m-0">Executive Director</p>
                                <p className="text-sm font-bold text-gray-900 m-0">{n.contactName}{n.contactRole ? ` · ${n.contactRole}` : ""}</p>
                              </div>
                            )}
                            {n.phone && (
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 m-0">Phone</p>
                                <p className="text-sm font-bold text-gray-900 m-0">+91 {n.phone}</p>
                              </div>
                            )}
                            {n.email && (
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 m-0">Email</p>
                                <p className="text-sm font-bold text-gray-900 m-0 break-all">{n.email}</p>
                              </div>
                            )}
                            {n.website && (
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 m-0">Website</p>
                                <a
                                  href={n.website.startsWith("http") ? n.website : `https://${n.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-bold text-[#2d5a1b] hover:underline flex items-center gap-1 m-0"
                                >
                                  {n.website.replace(/^https?:\/\//, "")}
                                  <Globe size={11} />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── Location + Map ── */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

                        {/* Address card */}
                        <div className="bg-[#f0ede8] rounded-2xl p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin size={16} className="text-[#2d5a1b]" />
                              <h3 className="text-sm font-black text-gray-900 m-0">Location</h3>
                            </div>
                            <p className="text-sm text-gray-700 m-0 leading-relaxed">
                              {n.address && <>{n.address},<br /></>}
                              {n.district && <>{n.district},<br /></>}
                              {n.city && n.state
                                ? `${n.city}, ${n.state}${n.pincode ? ` - ${n.pincode}` : ""}`
                                : (n.state || n.city || "—")}
                            </p>
                          </div>
                          {fullAddress && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d5a1b] hover:underline mt-4"
                            >
                              <ExternalLink size={12} /> View on Map
                            </a>
                          )}
                        </div>

                        {/* Map embed */}
                        <div className="sm:col-span-2 rounded-2xl overflow-hidden min-h-[240px] sm:min-h-[220px] bg-gray-100">
                          <iframe
                            title="NGO Location"
                            width="100%"
                            height="100%"
                            style={{ minHeight: "240px", border: 0, display: "block" }}
                            loading="lazy"
                            src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15&iwloc=B`}
                          />
                        </div>
                      </div>

                      {/* ── Services ── */}
                      {n.services?.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-black text-gray-900 m-0 mb-3">Services</h3>
                          <div className="flex flex-wrap gap-2">
                            {n.services.map((s, i) => (
                              <span key={i} className="px-3 py-1 bg-[#eef8e4] text-[#2d5a1b] border border-green-200 rounded-full text-xs font-semibold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── Documents & Certification ── */}
                      {n.documents && (
                        <div>
                          <h3 className="text-sm font-black text-gray-900 m-0 mb-3">Documents &amp; Certification</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { label: "Registration Cert", key: n.documents.registrationCertificate },
                              { label: "12A Certificate",   key: n.documents.certificate12A },
                              { label: "80G Certificate",   key: n.documents.certificate80G },
                            ].map(({ label, key }) => {
                              const hasDoc = key && key !== "not found";
                              return (
                                <div
                                  key={label}
                                  className="bg-[#f0ede8] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-center min-h-[110px]"
                                >
                                  <Upload size={22} className={hasDoc ? "text-[#2d5a1b]" : "text-gray-300"} />
                                  <p className="text-xs font-bold text-gray-700 m-0">{label}</p>
                                  {hasDoc ? (
                                    <button
                                      onClick={() => viewDocument(key)}
                                      className="text-xs font-bold text-[#2d5a1b] hover:underline border-0 bg-transparent cursor-pointer flex items-center gap-1"
                                    >
                                      View <ExternalLink size={10} />
                                    </button>
                                  ) : (
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest m-0">
                                      Not Uploaded
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ PAGINATION ══ */}
        {!loading && ngos.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <p className="text-sm text-gray-500 m-0">
              Showing{" "}
              <strong className="text-gray-800">{showFrom}–{showTo}</strong>
              {" "}of{" "}
              <strong className="text-gray-800">{pagination.total}</strong> NGOs
            </p>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              {pageRange(page, pagination.pages).map((n, i) =>
                n === "..." ? (
                  <span key={`e${i}`} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors cursor-pointer border-0 ${
                      page === n
                        ? "bg-[#2d5a1b] text-white shadow-sm"
                        : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.pages}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminNgos;
