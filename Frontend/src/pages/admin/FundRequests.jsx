import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { IndianRupee, CheckCircle, XCircle, Clock, Send, ChevronDown, ChevronUp, Search } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const STATUS_STYLES = {
  Pending:  { bg: "#fef3c7", color: "#92400e", icon: Clock },
  Approved: { bg: "#dbeafe", color: "#1e40af", icon: CheckCircle },
  Released: { bg: "#d1fae5", color: "#065f46", icon: Send },
  Rejected: { bg: "#fee2e2", color: "#991b1b", icon: XCircle },
};

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminFundRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [noteInputs, setNoteInputs] = useState({});   // { [id]: string }

  const token = localStorage.getItem("token");

  const fetchRequests = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    params.set("page", page);
    params.set("limit", 15);

    fetch(`${API_BASE_URL}/api/admin/funds?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRequests(d.data.requests || []);
          setPagination(d.data.pagination || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter, search, page, token]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    const p = {};
    if (statusFilter) p.status = statusFilter;
    if (search) p.search = search;
    if (page > 1) p.page = page;
    setSearchParams(p, { replace: true });
  }, [statusFilter, search, page, setSearchParams]);

  const updateStatus = async (id, status) => {
    setActionLoading(`${id}-${status}`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/funds/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status, adminNote: noteInputs[id] || "" }),
      });
      const d = await res.json();
      if (d.success) {
        fetchRequests();
        setExpandedId(null);
      } else {
        alert(d.message || "Failed to update status");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const statusCounts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="admin-page-title">Fund Requests</h1>

      {/* Summary Badges */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
        {[
          { label: "Total",    value: pagination.total || 0,       bg: "#f1f5f9", color: "#334155" },
          { label: "Pending",  value: statusCounts.Pending || 0,   bg: "#fef3c7", color: "#92400e" },
          { label: "Approved", value: statusCounts.Approved || 0,  bg: "#dbeafe", color: "#1e40af" },
          { label: "Released", value: statusCounts.Released || 0,  bg: "#d1fae5", color: "#065f46" },
          { label: "Rejected", value: statusCounts.Rejected || 0,  bg: "#fee2e2", color: "#991b1b" },
        ].map(({ label, value, bg, color }) => (
          <div key={label} style={{ padding: "10px 20px", borderRadius: "8px", background: bg, color, fontWeight: "600", fontSize: "14px" }}>
            {label}: {value}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search by NGO name or purpose..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="admin-search-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="admin-filter-select"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Released">Released</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* List */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">Loading fund requests...</div>
        ) : requests.length === 0 ? (
          <div className="admin-empty-state">No fund requests found.</div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {requests.map((req) => {
              const s = STATUS_STYLES[req.status] || STATUS_STYLES.Pending;
              const Icon = s.icon;
              const isExpanded = expandedId === req._id;

              return (
                <div key={req._id} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden", background: "#fff" }}>
                  {/* Card Header */}
                  <div
                    style={{ padding: "16px 20px", background: "#f9fafb", borderBottom: isExpanded ? "1px solid #e5e7eb" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: "16px" }}
                    onClick={() => setExpandedId(isExpanded ? null : req._id)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>
                          {req.ngoId?.ngoName || req.ngoName}
                        </span>
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: s.bg, color: s.color, display: "flex", alignItems: "center", gap: "4px" }}>
                          <Icon size={12} /> {req.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                        {req.ngoId?.email && <span>{req.ngoId.email} • </span>}
                        {req.ngoId?.city && <span>{req.ngoId.city}, {req.ngoId.state}</span>}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "700", fontSize: "17px", color: "#16a34a" }}>{fmt(req.amount)}</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>{fmtDate(req.createdAt)}</div>
                      </div>
                      {isExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{ padding: "20px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Purpose</div>
                          <div style={{ fontSize: "14px", color: "#1f2937" }}>{req.purpose}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount Requested</div>
                          <div style={{ fontSize: "14px", color: "#16a34a", fontWeight: "600" }}>{fmt(req.amount)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Submitted</div>
                          <div style={{ fontSize: "14px", color: "#1f2937" }}>{fmtDate(req.createdAt)}</div>
                        </div>
                        {req.releasedAt && (
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Released At</div>
                            <div style={{ fontSize: "14px", color: "#065f46" }}>{fmtDate(req.releasedAt)}</div>
                          </div>
                        )}
                      </div>

                      {req.description && (
                        <div style={{ marginBottom: "16px", padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</div>
                          <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: "1.6" }}>{req.description}</p>
                        </div>
                      )}

                      {req.adminNote && (
                        <div style={{ marginBottom: "16px", padding: "12px 16px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#1e40af", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Admin Note</div>
                          <p style={{ margin: 0, fontSize: "14px", color: "#1e3a8a" }}>{req.adminNote}</p>
                        </div>
                      )}

                      {req.isResolved && (
                        <div style={{ marginBottom: "16px", padding: "10px 16px", background: "#d1fae5", borderRadius: "8px", border: "1px solid #a7f3d0", fontSize: "13px", fontWeight: "600", color: "#065f46" }}>
                          ✓ NGO has acknowledged receipt of funds
                        </div>
                      )}

                      {/* Action Buttons — only for non-terminal statuses */}
                      {req.status !== "Rejected" && req.status !== "Released" && (
                        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
                          <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                              Admin Note (optional)
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Add a note for the NGO..."
                              value={noteInputs[req._id] || ""}
                              onChange={(e) => setNoteInputs(prev => ({ ...prev, [req._id]: e.target.value }))}
                              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                            />
                          </div>

                          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {req.status === "Pending" && (
                              <>
                                <button
                                  disabled={actionLoading === `${req._id}-Approved`}
                                  onClick={() => updateStatus(req._id, "Approved")}
                                  style={{ padding: "9px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "600", fontSize: "13px", opacity: actionLoading === `${req._id}-Approved` ? 0.6 : 1 }}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  disabled={actionLoading === `${req._id}-Rejected`}
                                  onClick={() => updateStatus(req._id, "Rejected")}
                                  style={{ padding: "9px 20px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", borderRadius: "7px", cursor: "pointer", fontWeight: "600", fontSize: "13px", opacity: actionLoading === `${req._id}-Rejected` ? 0.6 : 1 }}
                                >
                                  ✗ Reject
                                </button>
                              </>
                            )}
                            {req.status === "Approved" && (
                              <button
                                disabled={actionLoading === `${req._id}-Released`}
                                onClick={() => updateStatus(req._id, "Released")}
                                style={{ padding: "9px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "600", fontSize: "13px", opacity: actionLoading === `${req._id}-Released` ? 0.6 : 1 }}
                              >
                                💸 Release Funds
                              </button>
                            )}
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
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="admin-pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {pagination.totalPages} ({pagination.total} total)</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
