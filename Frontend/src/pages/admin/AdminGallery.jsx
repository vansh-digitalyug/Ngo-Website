import { useState, useEffect, useCallback } from "react";
import {
  Camera, Video, Trash2, Eye, X,
  Image as ImageIcon, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useFlash } from "../../components/common/FlashMessage.jsx";
import { API_BASE_URL } from "./AdminLayout.jsx";

const CATEGORIES = [
  "Food Distribution", "Medical Camps", "Education Programs",
  "Elder Care", "Women Empowerment", "Events", "Other",
];
const LIMIT = 6;

const getImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/400x250?text=No+Image";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/uploads/gallery/${url}`;
};

const isExternalVideo = (url) =>
  url && (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com"));

const getEmbedUrl = (url) => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return null;
};

function pageRange(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5];
  if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
}

const STATUS_CFG = {
  pending:  { dot: "bg-yellow-400", pill: "bg-yellow-50 text-yellow-700 border border-yellow-200", label: "Pending" },
  approved: { dot: "bg-green-500",  pill: "bg-green-50 text-green-700 border border-green-200",   label: "Approved" },
  rejected: { dot: "bg-red-400",    pill: "bg-red-50 text-red-600 border border-red-200",          label: "Rejected" },
};

/* ════════════════════════════════════════════════════ */
function AdminGallery() {
  const [items,         setItems]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [counts,        setCounts]        = useState({ images: 0, videos: 0, pending: 0 });
  const [activeTab,     setActiveTab]     = useState("all");
  const [category,      setCategory]      = useState("all");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [ngoFilter,     setNgoFilter]     = useState("all");
  const [ngoOptions,    setNgoOptions]    = useState([]);
  const [page,          setPage]          = useState(1);
  const [pagination,    setPagination]    = useState({ page: 1, pages: 1, total: 0 });
  const [actionLoading, setActionLoading] = useState(null);
  const [previewItem,   setPreviewItem]   = useState(null);

  const token = localStorage.getItem("token");
  const flash = useFlash();

  /* ── Reset page when filters change ── */
  useEffect(() => { setPage(1); }, [activeTab, category, statusFilter, ngoFilter]);

  /* ── Fetch ── */
  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "all")     params.set("type",     activeTab);
    if (category !== "all")      params.set("category", category);
    if (statusFilter !== "all")  params.set("status",   statusFilter);
    if (ngoFilter !== "all")     params.set("ngoId",    ngoFilter);
    params.set("page",  page);
    params.set("limit", LIMIT);

    fetch(`${API_BASE_URL}/api/gallery/admin/all?${params}`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setItems(data.items);
          setCounts(data.counts);
          setPagination(data.pagination);
          setNgoOptions((prev) => {
            const map = new Map(prev.map((o) => [o._id, o]));
            data.items.forEach((item) => {
              if (item.ngoId?._id)
                map.set(item.ngoId._id, { _id: item.ngoId._id, ngoName: item.ngoId.ngoName });
            });
            return Array.from(map.values()).sort((a, b) => a.ngoName.localeCompare(b.ngoName));
          });
        }
      })
      .catch(() => flash.error("Failed to load gallery items"))
      .finally(() => setLoading(false));
  }, [activeTab, category, statusFilter, ngoFilter, page, token, flash]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ── Actions ── */
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/gallery/admin/${id}/approve`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
      });
      const data = await res.json();
      if (data.success) { flash.success("Item approved"); fetchItems(); }
      else flash.error(data.message || "Failed to approve");
    } catch { flash.error("Failed to approve item"); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/gallery/admin/${id}/reject`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
      });
      const data = await res.json();
      if (data.success) { flash.success("Item rejected"); fetchItems(); }
      else flash.error(data.message || "Failed to reject");
    } catch { flash.error("Failed to reject item"); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Delete this ${type}? This cannot be undone.`)) return;
    try {
      const res    = await fetch(`${API_BASE_URL}/api/gallery/admin/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
      });
      const result = await res.json();
      if (result.success) { flash.success(result.message); fetchItems(); }
      else flash.error(result.message || "Failed to delete");
    } catch { flash.error("Failed to delete item"); }
  };

  /* ── Pagination range ── */
  const showFrom = pagination.total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const showTo   = Math.min(page * LIMIT, pagination.total);

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8]">
      <div className="p-4 sm:p-6 lg:p-8">

        {/* ══ HEADER ══ */}
        <div className="mb-7">
          <h1 className="text-[1.8rem] sm:text-[2.4rem] font-black text-gray-900 leading-tight m-0">
            Manage Media
          </h1>
          <p className="text-sm text-gray-500 mt-1 m-0">
            Organize and curate visual stories for SevaIndia's impact.
          </p>
        </div>

        {/* ══ STAT CARDS ══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">

          {/* Library */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[110px]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Camera size={20} className="text-green-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Library</span>
            </div>
            <div>
              <p className="text-4xl font-black text-gray-900 m-0 leading-none tabular-nums">
                {String(counts.images).padStart(2, "0")}
              </p>
              <p className="text-sm text-gray-500 mt-1 m-0">Total Images</p>
            </div>
          </div>

          {/* Assets */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[110px]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Video size={20} className="text-blue-600" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assets</span>
            </div>
            <div>
              <p className="text-4xl font-black text-gray-900 m-0 leading-none tabular-nums">
                {String(counts.videos).padStart(2, "0")}
              </p>
              <p className="text-sm text-gray-500 mt-1 m-0">Total Videos</p>
            </div>
          </div>

          {/* Queue — dashed border */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[110px] border-2 border-dashed border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Clock size={20} className="text-red-500" />
              </div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Queue</span>
            </div>
            <div>
              <p className="text-4xl font-black text-gray-900 m-0 leading-none tabular-nums">
                {String(counts.pending || 0).padStart(2, "0")}
              </p>
              <p className="text-sm text-gray-500 mt-1 m-0">Pending Review</p>
            </div>
          </div>

        </div>

        {/* ══ FILTER BAR ══ */}
        <div className="bg-white rounded-2xl px-4 py-3.5 mb-5 flex flex-wrap items-center gap-3 shadow-sm">

          {/* Tab pills */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl flex-shrink-0">
            {[["all", "All"], ["image", "Image"], ["video", "Video"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setActiveTab(val)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 ${
                  activeTab === val
                    ? "bg-[#2d5a1b] text-white shadow-sm"
                    : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap gap-2 flex-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={ngoFilter}
              onChange={(e) => setNgoFilter(e.target.value)}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 outline-none cursor-pointer"
            >
              <option value="all">All NGOs</option>
              {ngoOptions.map((o) => <option key={o._id} value={o._id}>{o.ngoName}</option>)}
            </select>
          </div>
        </div>

        {/* ══ GRID ══ */}
        {loading ? (
          <div className="text-center py-24 text-gray-400">Loading gallery…</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={32} className="text-gray-400" />
            </div>
            <h3 className="text-gray-800 font-bold text-lg m-0 mb-1">No media found</h3>
            <p className="text-gray-400 text-sm m-0">No gallery items match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {items.map((item) => {
              const sc   = STATUS_CFG[item.status] || STATUS_CFG.pending;
              const busy = actionLoading === item._id;
              return (
                <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                  {/* ── Thumbnail ── */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-900">
                    {item.type === "video" ? (
                      <img
                        src={item.thumbnail ? getImageUrl(item.thumbnail) : "https://via.placeholder.com/400x250?text=Video"}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-90"
                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x250?text=Video"; }}
                      />
                    ) : (
                      <img
                        src={getImageUrl(item.url)}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x250?text=Image+Not+Found"; }}
                      />
                    )}

                    {/* Video play icon overlay */}
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-11 h-11 rounded-full bg-black/50 flex items-center justify-center">
                          <Video size={18} className="text-white" />
                        </div>
                      </div>
                    )}

                    {/* Top-left: type badge + status badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-black/70 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider">
                        {item.type === "video" ? "VIDEO" : "IMAGE"}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider ${sc.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} flex-shrink-0`} />
                        {sc.label}
                      </span>
                    </div>

                    {/* Top-right: preview button */}
                    <button
                      onClick={() => setPreviewItem(item)}
                      title="Preview"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm border-0 cursor-pointer transition-colors"
                    >
                      <Eye size={15} className="text-gray-700" />
                    </button>
                  </div>

                  {/* ── Card body ── */}
                  <div className="p-4">

                    {/* Category pill */}
                    <span className="inline-block text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full mb-2">
                      {item.category}
                    </span>

                    {/* Title */}
                    <h3 className="text-[15px] font-bold text-gray-900 m-0 mb-3 leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Approve / Reject row for pending */}
                    {item.status === "pending" && (
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => handleApprove(item._id)}
                          disabled={busy}
                          className="flex-1 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(item._id)}
                          disabled={busy}
                          className="flex-1 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-500 text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(item._id, item.type)}
                      className="w-full mt-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ PAGINATION ══ */}
        {!loading && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 m-0">
              Showing <strong className="text-gray-800">{showFrom} – {showTo}</strong> of{" "}
              <strong className="text-gray-800">{pagination.total}</strong> assets
            </p>
            {pagination.pages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                {pageRange(page, pagination.pages).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors cursor-pointer border-0 ${
                      page === n
                        ? "bg-[#2d5a1b] text-white shadow-sm"
                        : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.pages}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ LIGHTBOX PREVIEW ══ */}
        {previewItem && (
          <div
            onClick={() => setPreviewItem(null)}
            className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-6"
          >
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border-0 flex items-center justify-center text-white cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-4 max-w-[90vw]"
            >
              {previewItem.type === "video" ? (
                isExternalVideo(previewItem.url) ? (
                  <iframe
                    src={getEmbedUrl(previewItem.url)}
                    title={previewItem.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="rounded-xl border-0 shadow-2xl"
                    style={{ width: "min(800px, 88vw)", height: "min(450px, 50vh)" }}
                  />
                ) : (
                  <video
                    src={getImageUrl(previewItem.url)}
                    controls
                    autoPlay
                    className="max-w-full rounded-xl shadow-2xl bg-black"
                    style={{ maxHeight: "80vh" }}
                  />
                )
              ) : (
                <img
                  src={getImageUrl(previewItem.url)}
                  alt={previewItem.title}
                  className="max-w-full rounded-xl shadow-2xl object-contain"
                  style={{ maxHeight: "80vh" }}
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Not+Found"; }}
                />
              )}
              <div className="text-center text-white">
                <p className="m-0 font-bold text-base">{previewItem.title}</p>
                {previewItem.description && (
                  <p className="m-0 mt-1 text-white/70 text-sm">{previewItem.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminGallery;
