import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Trash2, Eye, X } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const STATUS_OPTIONS = ["Pending", "Approved", "Rejected"];

function AdminVolunteers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionLoading, setActionLoading] = useState(null);

  // Detail / update modal
  const [selected, setSelected] = useState(null);
  const [modalStatus, setModalStatus] = useState("");
  const [modalRole, setModalRole] = useState("");
  const [modalArea, setModalArea] = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  const token = localStorage.getItem("token");

  const fetchVolunteers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", page);
    params.set("limit", 10);

    fetch(`${API_BASE_URL}/api/admin/volunteers?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setVolunteers(d.data);
          setPagination(d.pagination);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, statusFilter, page, token]);

  useEffect(() => { fetchVolunteers(); }, [fetchVolunteers]);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [search, statusFilter, page, setSearchParams]);

  const openModal = (v) => {
    setSelected(v);
    setModalStatus(v.status);
    setModalRole(v.role || "");
    setModalArea(v.assignedArea || "");
  };

  const closeModal = () => {
    if (modalSaving) return;
    setSelected(null);
  };

  const handleModalSave = async () => {
    if (!selected) return;
    setModalSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/volunteers/${selected._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status: modalStatus, role: modalRole, assignedArea: modalArea })
      });
      const d = await res.json();
      if (d.success) { closeModal(); fetchVolunteers(); }
      else alert(d.message || "Failed to update");
    } catch { alert("Network error"); }
    finally { setModalSaving(false); }
  };

  const quickApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/volunteers/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status: "Approved" })
      });
      const d = await res.json();
      if (d.success) fetchVolunteers();
      else alert(d.message || "Failed to update status");
    } catch { alert("Network error"); }
    finally { setActionLoading(null); }
  };

  const quickReject = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/volunteers/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status: "Rejected" })
      });
      const d = await res.json();
      if (d.success) fetchVolunteers();
      else alert(d.message || "Failed to update status");
    } catch { alert("Network error"); }
    finally { setActionLoading(null); }
  };

  const deleteVolunteer = async (id, name) => {
    if (!confirm(`Delete volunteer "${name}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/volunteers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      const d = await res.json();
      if (d.success) fetchVolunteers();
      else alert(d.message || "Failed to delete");
    } catch { alert("Network error"); }
    finally { setActionLoading(null); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div>
      <h1 className="admin-page-title">Manage Volunteers</h1>

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
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">Loading volunteers...</div>
        ) : volunteers.length === 0 ? (
          <div className="admin-empty-state">No volunteers found.</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email / Phone</th>
                  <th>City / State</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(v => (
                  <tr key={v._id}>
                    <td><strong>{v.fullName}</strong></td>
                    <td>
                      {v.email}
                      <br /><small style={{ color: "#6b7280" }}>{v.phone}</small>
                    </td>
                    <td>{v.city}<br /><small style={{ color: "#6b7280" }}>{v.state}</small></td>
                    <td>{v.role || <span style={{ color: "#9ca3af" }}>—</span>}</td>
                    <td>
                      <span className={`admin-badge ${v.status === "Approved" ? "green" : v.status === "Rejected" ? "red" : "yellow"}`}>
                        {v.status}
                      </span>
                    </td>
                    <td>{formatDate(v.createdAt)}</td>
                    <td>
                      <div className="admin-action-group">
                        <button
                          className="admin-action-btn"
                          style={{ background: "#e0f2fe", color: "#0369a1" }}
                          title="View & Edit"
                          onClick={() => openModal(v)}
                        >
                          <Eye size={15} />
                        </button>
                        {v.status !== "Approved" && (
                          <button
                            className="admin-action-btn approve"
                            disabled={actionLoading === v._id}
                            onClick={() => quickApprove(v._id)}
                          >
                            ✓ Approve
                          </button>
                        )}
                        {v.status !== "Rejected" && (
                          <button
                            className="admin-action-btn reject"
                            disabled={actionLoading === v._id}
                            onClick={() => quickReject(v._id)}
                          >
                            ✗ Reject
                          </button>
                        )}
                        <button
                          className="admin-action-btn delete"
                          disabled={actionLoading === v._id}
                          onClick={() => deleteVolunteer(v._id, v.fullName)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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

      {/* Detail / Update Modal */}
      {selected && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal-card" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Volunteer Details — {selected.fullName}</h3>
              <button className="admin-modal-close" onClick={closeModal} disabled={modalSaving}><X size={18} /></button>
            </div>
            <div className="admin-modal-body" style={{ display: "grid", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.875rem" }}>
                <div><span style={{ color: "#6b7280" }}>Email:</span><br /><strong>{selected.email}</strong></div>
                <div><span style={{ color: "#6b7280" }}>Phone:</span><br /><strong>{selected.phone}</strong></div>
                <div><span style={{ color: "#6b7280" }}>City:</span><br /><strong>{selected.city}</strong></div>
                <div><span style={{ color: "#6b7280" }}>State:</span><br /><strong>{selected.state}</strong></div>
                <div><span style={{ color: "#6b7280" }}>Mode:</span><br /><strong>{selected.mode || "—"}</strong></div>
                <div><span style={{ color: "#6b7280" }}>Availability:</span><br /><strong>{selected.availability || "—"}</strong></div>
                <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "#6b7280" }}>Interests:</span><br /><strong>{selected.interests?.join(", ") || "—"}</strong></div>
                {selected.skills && <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "#6b7280" }}>Skills:</span><br /><strong>{selected.skills}</strong></div>}
                {selected.motivation && <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "#6b7280" }}>Motivation:</span><br /><strong>{selected.motivation}</strong></div>}
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "8px 0" }} />

              <label className="admin-form-label">Status</label>
              <select className="admin-form-select" value={modalStatus} onChange={e => setModalStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <label className="admin-form-label">Role (assigned by admin)</label>
              <input
                className="admin-form-input"
                type="text"
                placeholder="e.g. Field Coordinator, Camp Leader"
                value={modalRole}
                onChange={e => setModalRole(e.target.value)}
              />

              <label className="admin-form-label">Assigned Area</label>
              <input
                className="admin-form-input"
                type="text"
                placeholder="e.g. North Delhi, Rajasthan Zone"
                value={modalArea}
                onChange={e => setModalArea(e.target.value)}
              />
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={closeModal} disabled={modalSaving}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleModalSave} disabled={modalSaving}>
                {modalSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVolunteers;
