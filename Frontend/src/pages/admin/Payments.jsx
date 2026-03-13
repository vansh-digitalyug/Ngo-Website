import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { IndianRupee, Search, CheckCircle, Clock, XCircle, Building2, User } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_STYLE = {
  paid:    { bg: "#d1fae5", color: "#065f46", Icon: CheckCircle, label: "Paid" },
  created: { bg: "#fef3c7", color: "#92400e", Icon: Clock,       label: "Pending" },
  failed:  { bg: "#fee2e2", color: "#991b1b", Icon: XCircle,     label: "Failed" },
};

export default function AdminPayments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [donations, setDonations] = useState([]);
  const [summary, setSummary]     = useState({ totalAmount: 0, totalCount: 0 });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading]     = useState(true);

  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "paid");
  const [search, setSearch]         = useState(searchParams.get("search") || "");
  const [page, setPage]             = useState(Number(searchParams.get("page")) || 1);

  const token = localStorage.getItem("token");

  const fetchDonations = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search)       params.set("search", search);
    params.set("page", page);
    params.set("limit", 20);

    fetch(`${API_BASE_URL}/api/admin/donations?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setDonations(d.data.donations || []);
          setSummary(d.data.summary   || { totalAmount: 0, totalCount: 0 });
          setPagination(d.data.pagination || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter, search, page, token]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  useEffect(() => {
    const p = {};
    if (statusFilter) p.status = statusFilter;
    if (search)       p.search = search;
    if (page > 1)     p.page   = page;
    setSearchParams(p, { replace: true });
  }, [statusFilter, search, page, setSearchParams]);

  const donorLabel = (d) => {
    if (d.isAnonymous) return "Anonymous";
    return d.donorName || d.user?.name || d.user?.email || "Guest";
  };

  return (
    <div>
      <h1 className="admin-page-title">Payments & Donations</h1>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Total Collected",  value: fmt(summary.totalAmount), color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
          { label: "Paid Donations",   value: summary.totalCount,       color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
          { label: "Showing",          value: pagination.total || 0,    color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: "10px", padding: "18px 20px" }}>
            <div style={{ fontSize: "22px", fontWeight: "800", color }}>{value}</div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search by donor name or service..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="admin-search-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="admin-filter-select">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="created">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">Loading payments...</div>
        ) : donations.length === 0 ? (
          <div className="admin-empty-state">No payments found.</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Service / NGO</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => {
                  const s = STATUS_STYLE[d.status] || STATUS_STYLE.created;
                  const isGeneral = !d.serviceTitle || d.serviceTitle === "General Donation";
                  return (
                    <tr key={d._id}>
                      {/* Donor */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <User size={15} color="#4f46e5" />
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>{donorLabel(d)}</div>
                            {d.user?.email && (
                              <div style={{ fontSize: "12px", color: "#94a3b8" }}>{d.user.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Service / NGO */}
                      <td>
                        <div>
                          <span style={{
                            display: "inline-block", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                            background: isGeneral ? "#f0fdf4" : "#eff6ff",
                            color: isGeneral ? "#166534" : "#1e40af",
                            marginBottom: "3px"
                          }}>
                            {isGeneral ? "General Donation" : d.serviceTitle}
                          </span>
                          {d.ngoId && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
                              <Building2 size={11} />
                              {d.ngoId.ngoName}
                              {d.ngoId.city && <span>· {d.ngoId.city}</span>}
                            </div>
                          )}
                          {!d.ngoId && (
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Platform donation</div>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td>
                        <span style={{ fontWeight: "700", fontSize: "15px", color: "#16a34a" }}>{fmt(d.amount)}</span>
                      </td>

                      {/* Status */}
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: s.bg, color: s.color }}>
                          <s.Icon size={12} /> {s.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" }}>{fmtDate(d.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="admin-pagination">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span>Page {page} of {pagination.totalPages} ({pagination.total} total)</span>
                <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
