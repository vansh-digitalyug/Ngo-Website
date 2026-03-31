import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "./AdminLayout.jsx";
import { ChevronDown, ChevronUp, FileText, CheckCircle, Clock, Trash2 } from "lucide-react";

function AdminNgos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchNgos = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", page);
    params.set("limit", 10);

    fetch(`${API_BASE_URL}/api/admin/ngos?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setNgos(d.data);
          setPagination(d.pagination);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, statusFilter, page, token]);

  useEffect(() => { fetchNgos(); }, [fetchNgos]);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [search, statusFilter, page, setSearchParams]);

  const updateStatus = async (id, isVerified) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ngos/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ isVerified })
      });
      const d = await res.json();
      if (d.success) fetchNgos();
      else alert(d.message || "Failed to update status");
    } catch { alert("Network error"); }
    finally { setActionLoading(null); }
  };

  const deleteNgo = async (id, name) => {
    if (!confirm(`Delete NGO "${name}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ngos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      const d = await res.json();
      if (d.success) fetchNgos();
      else alert(d.message || "Failed to delete");
    } catch { alert("Network error"); }
    finally { setActionLoading(null); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const viewDocument = async (key) => {
    if (!key || key === "not found") return;
    // If already a full URL, open directly
    if (key.startsWith("http")) { window.open(key, "_blank", "noopener"); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/s3/get-url?key=${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      const d = await res.json();
      if (d.data?.Url) window.open(d.data.Url, "_blank", "noopener");
      else alert("Could not generate document link.");
    } catch { alert("Failed to load document."); }
  };

  return (
    <div>
      <h1 className="admin-page-title">Manage NGOs</h1>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search by name, email, city..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="admin-search-input"
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="admin-filter-select">
          <option value="">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">Loading NGOs...</div>
        ) : ngos.length === 0 ? (
          <div className="admin-empty-state">No NGOs found.</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              {ngos.map(n => (
                <div key={n._id} style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#fff"
                }}>
                  {/* Header */}
                  <div style={{
                    padding: "16px",
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer"
                  }} onClick={() => setExpandedId(expandedId === n._id ? null : n._id)}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600" }}>{n.ngoName}</h3>
                      <p style={{ margin: "0", fontSize: "13px", color: "#6b7280" }}>{n.email} • {n.city}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: n.isVerified ? "#d1fae5" : "#fef3c7",
                        color: n.isVerified ? "#065f46" : "#92400e"
                      }}>
                        {n.isVerified ? <><CheckCircle size={14} style={{ marginRight: 4 }} /> Verified</> : <><Clock size={14} style={{ marginRight: 4 }} /> Pending</>}
                      </span>
                      {expandedId === n._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === n._id && (
                    <div style={{ padding: "20px" }}>
                      {/* Registration Info */}
                      <div style={{ marginBottom: "20px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#1f2937" }}>Registration Details</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", fontSize: "13px" }}>
                          <div><strong>Reg Type:</strong> {n.regType}</div>
                          <div><strong>Reg Number:</strong> {n.regNumber}</div>
                          <div><strong>Est. Year:</strong> {n.estYear || "—"}</div>
                          <div><strong>DARPAN ID:</strong> {n.darpanId || "—"}</div>
                          <div><strong>PAN Number:</strong> {n.panNumber || "—"}</div>
                          <div><strong>Description:</strong> {n.description || "—"}</div>
                        </div>
                      </div>

                      {/* Location */}
                      <div style={{ marginBottom: "20px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#1f2937" }}>Location</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", fontSize: "13px" }}>
                          <div><strong>State:</strong> {n.state}</div>
                          <div><strong>District:</strong> {n.district}</div>
                          <div><strong>City:</strong> {n.city}</div>
                          <div><strong>Pincode:</strong> {n.pincode}</div>
                          <div style={{ gridColumn: "1 / -1" }}><strong>Address:</strong> {n.address}</div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div style={{ marginBottom: "20px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#1f2937" }}>Contact Information</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", fontSize: "13px" }}>
                          <div><strong>Contact Name:</strong> {n.contactName}</div>
                          <div><strong>Role:</strong> {n.contactRole}</div>
                          <div><strong>Phone:</strong> {n.phone}</div>
                          <div><strong>WhatsApp:</strong> {n.whatsapp}</div>
                          <div><strong>Email:</strong> {n.email}</div>
                          <div><strong>Website:</strong> {n.website ? <a href={n.website} target="_blank" rel="noopener noreferrer" style={{ color: "#0ea5e9" }}>{n.website}</a> : "—"}</div>
                        </div>
                        {(n.socialMedia?.facebook || n.socialMedia?.instagram) && (
                          <div style={{ marginTop: "8px", fontSize: "13px" }}>
                            {n.socialMedia.facebook && <div><strong>Facebook:</strong> <a href={`https://facebook.com/${n.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" style={{ color: "#0ea5e9" }}>{n.socialMedia.facebook}</a></div>}
                            {n.socialMedia.instagram && <div><strong>Instagram:</strong> <a href={`https://instagram.com/${n.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" style={{ color: "#0ea5e9" }}>{n.socialMedia.instagram}</a></div>}
                          </div>
                        )}
                      </div>

                      {/* Services */}
                      {n.services && n.services.length > 0 && (
                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#1f2937" }}>Services</h4>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {n.services.map((s, i) => (
                              <span key={i} style={{
                                padding: "4px 12px",
                                backgroundColor: "#e0e7ff",
                                borderRadius: "20px",
                                fontSize: "12px",
                                color: "#4c1d95"
                              }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certificates */}
                      {n.documents && (
                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#1f2937" }}>Certificates & Documents</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                            {[
                              { label: "Registration Cert", key: n.documents.registrationCertificate },
                              { label: "12A Certificate",   key: n.documents.certificate12A },
                              { label: "80G Certificate",   key: n.documents.certificate80G },
                            ].map(({ label, key }) => {
                              const hasDoc = key && key !== "not found";
                              return (
                                <div key={label} style={{ padding: "12px", backgroundColor: hasDoc ? "#f0f9ff" : "#f3f4f6", borderRadius: "6px", textAlign: "center", border: hasDoc ? "1px solid #bae6fd" : "1px solid #e5e7eb" }}>
                                  <FileText size={20} style={{ margin: "0 auto 8px", color: hasDoc ? "#0284c7" : "#9ca3af" }} />
                                  <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "4px" }}>{label}</div>
                                  {hasDoc ? (
                                    <button
                                      onClick={() => viewDocument(key)}
                                      style={{ color: "#0ea5e9", fontSize: "11px", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                                    >View →</button>
                                  ) : (
                                    <div style={{ color: "#9ca3af", fontSize: "11px" }}>Not uploaded</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{
                        paddingTop: "16px",
                        borderTop: "1px solid #e5e7eb",
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap"
                      }}>
                        {!n.isVerified && (
                          <button
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: actionLoading === n._id ? "not-allowed" : "pointer",
                              fontSize: "13px",
                              fontWeight: "500",
                              opacity: actionLoading === n._id ? 0.6 : 1
                            }}
                            disabled={actionLoading === n._id}
                            onClick={() => updateStatus(n._id, true)}
                          >
                            ✓ Approve
                          </button>
                        )}
                        {n.isVerified && (
                          <button
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: actionLoading === n._id ? "not-allowed" : "pointer",
                              fontSize: "13px",
                              fontWeight: "500",
                              opacity: actionLoading === n._id ? 0.6 : 1
                            }}
                            disabled={actionLoading === n._id}
                            onClick={() => updateStatus(n._id, false)}
                          >
                            ✗ Revoke
                          </button>
                        )}
                        <button
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: actionLoading === n._id ? "not-allowed" : "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                            opacity: actionLoading === n._id ? 0.6 : 1
                          }}
                          disabled={actionLoading === n._id}
                          onClick={() => deleteNgo(n._id, n.ngoName)}
                        >
                          <Trash2 size={14} style={{ marginRight: 4 }} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="admin-pagination">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span>Page {page} of {pagination.pages} ({pagination.total} total)</span>
                <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminNgos;