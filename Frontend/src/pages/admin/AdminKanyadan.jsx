import { useState, useEffect, useCallback } from "react";
import { Heart, Loader, Search, ChevronLeft, ChevronRight, Eye, Trash2, X } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const STATUS_OPTIONS = ["Pending", "Under Review", "Approved", "Rejected"];

const STATUS_COLORS = {
  "Pending":      { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
  "Under Review": { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
  "Approved":     { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  "Rejected":     { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
};

const INCOME_LABELS = {
  "below1L":  "Below ₹1,00,000",
  "1to1.5L":  "₹1,00,000 – ₹1,50,000",
  "1.5to2L":  "₹1,50,000 – ₹2,00,000",
  "2to2.5L":  "₹2,00,000 – ₹2,50,000",
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: "#f3f4f6", color: "#374151", border: "#d1d5db" };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: "6px", padding: "3px 10px", fontSize: "0.78rem", fontWeight: 600,
      whiteSpace: "nowrap"
    }}>
      {status}
    </span>
  );
}

function AdminKanyadan() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, underReview: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [actionLoading, setActionLoading] = useState(null);

  // Detail modal
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState("");

  const token = localStorage.getItem("token");

  // ── Fetch stats ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(() => {
    fetch(`${API_BASE_URL}/api/admin/kanyadan/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});
  }, [token]);

  // ── Fetch applications ────────────────────────────────────────────────────────
  const fetchApplications = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`${API_BASE_URL}/api/admin/kanyadan?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setApplications(d.data.applications || []);
          setPagination(d.data.pagination || { total: 0, totalPages: 1 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, page, search, statusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // ── Update status ────────────────────────────────────────────────────────────
  const handleUpdateStatus = async () => {
    if (!newStatus) { setModalError("Please select a status."); return; }
    setUpdating(true);
    setModalError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/kanyadan/${selected._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status: newStatus, adminNote }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");
      setSelected(null);
      fetchApplications();
      fetchStats();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application? This cannot be undone.")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/kanyadan/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message);
      fetchApplications();
      fetchStats();
    } catch (err) {
      alert(err.message || "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Open detail modal ────────────────────────────────────────────────────────
  const openModal = (app) => {
    setSelected(app);
    setNewStatus(app.status);
    setAdminNote(app.adminNote || "");
    setModalError("");
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1200px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <Heart size={24} color="#2e7d32" />
        <div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "#111827" }}>
            Kanyadan Yojna Applications
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
            LIC policy enrollment applications for underprivileged girls
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        {[
          { label: "Total", value: stats.total, bg: "#f8fafc", color: "#374151" },
          { label: "Pending", value: stats.pending, bg: "#fef9c3", color: "#854d0e" },
          { label: "Under Review", value: stats.underReview, bg: "#dbeafe", color: "#1e40af" },
          { label: "Approved", value: stats.approved, bg: "#dcfce7", color: "#166534" },
          { label: "Rejected", value: stats.rejected, bg: "#fee2e2", color: "#991b1b" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: "10px", padding: "16px 18px", border: "1px solid #e5e7eb" }}>
            <p style={{ margin: "0 0 4px", fontSize: "0.82rem", color: s.color, fontWeight: 600 }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            type="text"
            placeholder="Search by name, mobile, state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.9rem", minWidth: "150px", background: "#fff" }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>
            <Loader size={28} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "12px" }}>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af" }}>
            <Heart size={36} style={{ marginBottom: "12px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No applications found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Guardian", "Mobile", "Girl's Name", "Age", "State / District", "Income", "Status", "Date", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app, i) => (
                  <tr key={app._id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>{app.guardianName}</td>
                    <td style={{ padding: "12px 14px", color: "#374151" }}>{app.mobile}</td>
                    <td style={{ padding: "12px 14px", color: "#374151" }}>{app.girlName}</td>
                    <td style={{ padding: "12px 14px", color: "#374151", textAlign: "center" }}>{app.girlAge}</td>
                    <td style={{ padding: "12px 14px", color: "#374151" }}>
                      {app.state}
                      {app.district && <span style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af" }}>{app.district}</span>}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#374151", fontSize: "0.82rem" }}>{INCOME_LABELS[app.annualIncome] || app.annualIncome}</td>
                    <td style={{ padding: "12px 14px" }}><StatusBadge status={app.status} /></td>
                    <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {new Date(app.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => openModal(app)}
                          title="View & Update"
                          style={{ background: "#eff6ff", border: "none", borderRadius: "6px", padding: "6px 8px", cursor: "pointer", color: "#1d4ed8" }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(app._id)}
                          disabled={actionLoading === app._id}
                          title="Delete"
                          style={{ background: "#fff1f2", border: "none", borderRadius: "6px", padding: "6px 8px", cursor: "pointer", color: "#e11d48" }}
                        >
                          {actionLoading === app._id ? <Loader size={15} /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "20px" }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 12px", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center" }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ color: "#374151", fontSize: "0.9rem" }}>
            Page {page} of {pagination.totalPages} &nbsp;·&nbsp; {pagination.total} total
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 12px", background: "#fff", cursor: page === pagination.totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail / Update Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: "16px" }} onClick={() => setSelected(null)}>
          <div style={{ background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>Application Details</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><X size={20} /></button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "20px 24px" }}>

              {/* Info grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                {[
                  ["Guardian Name", selected.guardianName],
                  ["Mobile", selected.mobile],
                  ["Girl's Name", selected.girlName],
                  ["Girl's Age", `${selected.girlAge} years`],
                  ["State", selected.state],
                  ["District", selected.district],
                  ["Village / Area", selected.village || "—"],
                  ["Annual Income", INCOME_LABELS[selected.annualIncome] || selected.annualIncome],
                  ["How They Heard", selected.howHeard || "—"],
                  ["Applied On", new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ margin: "0 0 2px", fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#111827", fontWeight: 500 }}>{value}</p>
                  </div>
                ))}
              </div>

              {selected.message && (
                <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px 14px", marginBottom: "20px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Additional Message</p>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#374151" }}>{selected.message}</p>
                </div>
              )}

              {/* Current status */}
              <div style={{ marginBottom: "16px" }}>
                <p style={{ margin: "0 0 6px", fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>Current Status</p>
                <StatusBadge status={selected.status} />
              </div>

              {/* Update status */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>Update Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.9rem", background: "#fff" }}
                >
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Admin note */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>Admin Note (optional)</label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Internal note visible only to admins..."
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              {modalError && (
                <div style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontSize: "0.88rem" }}>
                  {modalError}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setSelected(null)} style={{ padding: "9px 16px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151" }}>
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  style={{ padding: "9px 20px", border: "none", borderRadius: "8px", background: "#2e7d32", color: "#fff", cursor: updating ? "not-allowed" : "pointer", fontWeight: 600, opacity: updating ? 0.7 : 1 }}
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminKanyadan;
