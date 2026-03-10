import React, { useState, useEffect } from "react";
import {
  Camera, Video, Trash2, Search, Eye, X,
  Image as ImageIcon, CheckSquare, Square, CheckCircle, XCircle, Clock, Building2
} from "lucide-react";
import { useFlash } from "../../components/common/FlashMessage.jsx";
import { API_BASE_URL } from "./AdminLayout.jsx";

// Helper to get proper image URL (handles both NGO and platform uploads)
const getImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/400x250?text=No+Image";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/uploads/gallery/${url}`;
};

const CATEGORIES = [
  "Food Distribution", "Medical Camps", "Education Programs", 
  "Elder Care", "Women Empowerment", "Events", "Volunteer Activities", "Other"
];

const AdminGallery = () => {
  // --- State Management ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ images: 0, videos: 0, pending: 0 });
  const [activeTab, setActiveTab] = useState("all");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  const token = localStorage.getItem("token");
  const flash = useFlash();

  // --- Effects & Fetching ---
  useEffect(() => {
    fetchGalleryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, category, statusFilter, search]);

  const fetchGalleryItems = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("type", activeTab);
      if (category !== "all") params.set("category", category);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("page", page);
      params.set("limit", 20);

      const res = await fetch(`${API_BASE_URL}/api/gallery/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      const data = await res.json();
      
      if (data.success) {
        setItems(data.items);
        setCounts(data.counts);
        setPagination(data.pagination);
      }
    } catch (error) {
      flash.error("Failed to load gallery items");
    } finally {
      setLoading(false);
    }
  };

  // --- Approve/Reject Handlers ---
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery/admin/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        flash.success("Item approved successfully");
        fetchGalleryItems(pagination.page);
      } else {
        flash.error(data.message || "Failed to approve");
      }
    } catch (error) {
      flash.error("Failed to approve item");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery/admin/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        flash.success("Item rejected");
        fetchGalleryItems(pagination.page);
      } else {
        flash.error(data.message || "Failed to reject");
      }
    } catch (error) {
      flash.error("Failed to reject item");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteItem = async (id, type) => {
    if (!window.confirm(`Delete this ${type}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      const result = await res.json();
      if (result.success) {
        flash.success(result.message);
        fetchGalleryItems();
      } else {
        flash.error(result.message || "Failed to delete item");
      }
    } catch (error) {
      flash.error("Failed to delete item");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.length) return;
    if (!window.confirm(`Delete ${selectedItems.length} selected item(s)? This cannot be undone.`)) return;

    setBulkDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery/admin/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ ids: selectedItems })
      });
      const result = await res.json();
      if (result.success) {
        flash.success(result.message);
        setSelectedItems([]);
        fetchGalleryItems();
      } else {
        flash.error(result.message || "Failed to delete items");
      }
    } catch (error) {
      flash.error("Failed to delete items");
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAllItems = () => {
    setSelectedItems(selectedItems.length === items.length ? [] : items.map(i => i._id));
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: "#fef3c7", color: "#92400e", icon: Clock, text: "Pending" },
      approved: { bg: "#d1fae5", color: "#065f46", icon: CheckCircle, text: "Approved" },
      rejected: { bg: "#fee2e2", color: "#991b1b", icon: XCircle, text: "Rejected" }
    };
    return badges[status] || badges.pending;
  };

  // --- UI Components ---
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", color: "#1e293b", fontFamily: "system-ui, sans-serif" }}>
      
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0", color: "#0f172a" }}>Media Gallery</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>Review and manage NGO uploaded media content.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div style={styles.statCard}>
          <div style={{...styles.iconWrapper, background: "#ecfdf5", color: "#10b981"}}>
            <Camera size={24} />
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>{counts.images}</div>
            <div style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Total Images</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.iconWrapper, background: "#fef2f2", color: "#ef4444"}}>
            <Video size={24} />
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>{counts.videos}</div>
            <div style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Total Videos</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.iconWrapper, background: "#fef3c7", color: "#f59e0b"}}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>{counts.pending || 0}</div>
            <div style={{ color: "#64748b", fontSize: "14px", fontWeight: "500" }}>Pending Review</div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div style={styles.controlBar}>
        <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "8px" }}>
          {["all", "image", "video"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={activeTab === tab ? styles.tabActive : styles.tabInactive}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.input}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.input}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{...styles.input, width: "100%", paddingLeft: "42px", boxSizing: "border-box"}}
          />
        </div>

        {selectedItems.length > 0 && (
          <button onClick={handleBulkDelete} disabled={bulkDeleting} style={styles.dangerBtn}>
            <Trash2 size={16} /> Delete Selected ({selectedItems.length})
          </button>
        )}
      </div>

      {/* Bulk Action Header */}
      {!loading && items.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={selectAllItems} style={styles.textBtn}>
            {selectedItems.length === items.length ? <CheckSquare size={18} color="#3b82f6"/> : <Square size={18} color="#94a3b8"/>}
            <span style={{ fontWeight: "500" }}>Select All</span>
          </button>
          <span style={{ color: "#64748b", fontSize: "14px" }}>Showing {items.length} of {pagination.total} items</span>
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div style={styles.emptyState}>Loading gallery...</div>
      ) : items.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{...styles.iconWrapper, width: "64px", height: "64px", margin: "0 auto 16px", background: "#f1f5f9", color: "#94a3b8"}}>
            <ImageIcon size={32} />
          </div>
          <h3 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>No media found</h3>
          <p style={{ margin: 0, color: "#64748b" }}>No gallery items match your filters.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {items.map(item => (
            <div key={item._id} style={{...styles.card, borderColor: selectedItems.includes(item._id) ? "#3b82f6" : "#e2e8f0"}}>
              
              <div style={{ position: "relative", aspectRatio: "16/10", cursor: "pointer", overflow: "hidden" }} onClick={() => toggleSelectItem(item._id)}>
                {item.type === "video" ? (
                  <video
                    src={getImageUrl(item.url)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    preload="metadata"
                    muted
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <img
                    src={getImageUrl(item.url)}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                    onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                    onError={e => { e.currentTarget.src = "https://via.placeholder.com/400x250?text=Image+Not+Found"; }}
                  />
                )}
                {item.type === "video" && (
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "rgba(0,0,0,0.5)", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <Video size={20} color="white" />
                  </div>
                )}

                <div style={styles.badge(item.type === "image" ? "#10b981" : "#ef4444")}>
                  {item.type === "image" ? <Camera size={12} /> : <Video size={12} />}
                  {item.type === "image" ? "Image" : "Video"}
                </div>

                <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "6px", alignItems: "center" }}>
                  <button
                    onClick={e => { e.stopPropagation(); setPreviewItem(item); }}
                    style={{ background: "white", border: "none", borderRadius: "6px", padding: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                    title={item.type === "video" ? "Play video" : "Preview image"}
                  >
                    <Eye size={18} color="#3b82f6" />
                  </button>
                  <div style={{ background: "white", borderRadius: "6px", display: "flex" }}>
                    {selectedItems.includes(item._id) ? <CheckSquare size={24} color="#3b82f6" fill="#eff6ff" /> : <Square size={24} color="#cbd5e1" />}
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                    {item.title}
                  </h4>
                  {(() => {
                    const badge = getStatusBadge(item.status);
                    const Icon = badge.icon;
                    return (
                      <span style={{ background: badge.bg, color: badge.color, padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", marginLeft: "8px" }}>
                        <Icon size={12} /> {badge.text}
                      </span>
                    );
                  })()}
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={styles.categoryPill}>{item.category}</span>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                {/* NGO Info */}
                {item.ngoId && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", padding: "8px 10px", background: "#f0f9ff", borderRadius: "6px", border: "1px solid #bae6fd" }}>
                    <Building2 size={14} style={{ color: "#0284c7" }} />
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#0369a1" }}>
                      {item.ngoId.ngoName || "Unknown NGO"}
                    </span>
                  </div>
                )}

                {!item.ngoId && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", padding: "8px 10px", background: "#f1f5f9", borderRadius: "6px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Platform Upload</span>
                  </div>
                )}

                {/* Action Buttons */}
                {item.status === "pending" && (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <button 
                      onClick={() => handleApprove(item._id)} 
                      disabled={actionLoading === item._id}
                      style={{ flex: 1, padding: "8px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button 
                      onClick={() => handleReject(item._id)} 
                      disabled={actionLoading === item._id}
                      style={{ flex: 1, padding: "8px", background: "#fff", color: "#ef4444", border: "1px solid #fca5a5", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}

                <button onClick={() => handleDeleteItem(item._id, item.type)} style={styles.deleteBtn}>
                  <Trash2 size={16} /> Delete Media
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Preview Lightbox */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
        >
          <button
            onClick={() => setPreviewItem(null)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
          >
            <X size={22} />
          </button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            {previewItem.type === "video" ? (
              <video
                src={getImageUrl(previewItem.url)}
                controls
                autoPlay
                style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "8px", background: "#000", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
              />
            ) : (
              <img
                src={getImageUrl(previewItem.url)}
                alt={previewItem.title}
                style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "8px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
                onError={e => { e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Not+Found"; }}
              />
            )}
            <div style={{ color: "white", textAlign: "center" }}>
              <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "16px" }}>{previewItem.title}</p>
              {previewItem.description && <p style={{ margin: 0, color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>{previewItem.description}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "32px" }}>
          <button 
            disabled={pagination.page <= 1} 
            onClick={() => fetchGalleryItems(pagination.page - 1)}
            style={pagination.page <= 1 ? styles.paginationDisabled : styles.paginationBtn}
          >
            Previous
          </button>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button 
            disabled={pagination.page >= pagination.pages} 
            onClick={() => fetchGalleryItems(pagination.page + 1)}
            style={pagination.page >= pagination.pages ? styles.paginationDisabled : styles.paginationBtn}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// --- Unified Styles Object ---
const styles = {
  dangerBtn: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fca5a5", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "14px", marginLeft: "auto" },
  textBtn: { display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#334155", fontSize: "14px" },
  
  statCard: { background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  iconWrapper: { width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" },
  
  controlBar: { display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center", background: "white", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  tabActive: { padding: "8px 16px", background: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#0f172a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", fontSize: "14px" },
  tabInactive: { padding: "8px 16px", background: "transparent", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", color: "#64748b", fontSize: "14px" },
  
  input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", color: "#1e293b", background: "white", outline: "none", transition: "border-color 0.2s" },
  label: { display: "block", marginBottom: "8px", fontWeight: "600", color: "#334155", fontSize: "14px" },
  
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" },
  card: { background: "white", borderRadius: "12px", overflow: "hidden", border: "2px solid", transition: "all 0.2s ease", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
  badge: (bg) => ({ position: "absolute", top: "12px", left: "12px", background: bg, color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }),
  categoryPill: { background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" },
  deleteBtn: { width: "100%", padding: "10px", background: "transparent", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "8px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.2s" },
  
  emptyState: { textAlign: "center", padding: "64px 20px", background: "white", borderRadius: "12px", border: "1px dashed #cbd5e1" },

  paginationBtn: { padding: "8px 16px", background: "white", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "14px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  paginationDisabled: { padding: "8px 16px", background: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "not-allowed", fontWeight: "500", fontSize: "14px" }
};

// Explicit default export
export default AdminGallery;