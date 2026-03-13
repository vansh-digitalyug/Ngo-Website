import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "./AdminLayout.jsx";

function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", page);
    params.set("limit", 10);

    fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setUsers(d.data);
          setPagination(d.pagination);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page, token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [search, page, setSearchParams]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div>
      <h1 className="admin-page-title">Registered Users</h1>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search by name, email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="admin-search-input"
        />
      </div>

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="admin-empty-state">No users found.</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Provider</th>
                  <th>Email Verified</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt=""
                            style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%",
                            background: "#e5e7eb", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280"
                          }}>
                            {u.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</td>
                    <td>{u.phone || "—"}</td>
                    <td>{u.city || "—"}</td>
                    <td>
                      <span className={`admin-badge ${u.authProvider === "google" ? "blue" : "gray"}`}>
                        {u.authProvider || "local"}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${u.emailVerified ? "green" : "yellow"}`}>
                        {u.emailVerified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
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
    </div>
  );
}

export default AdminUsers;
