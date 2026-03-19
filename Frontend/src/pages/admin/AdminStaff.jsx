import { useState, useEffect } from "react";
import { Users, Loader2, ChevronDown, Phone, Mail, Building2, UserCheck, UserX, Trash2 } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const ROLES = ["doctor","teacher","nurse","social_worker","engineer","lawyer","paramedic","counselor","other"];
const ROLE_LABELS = { doctor:"Doctor", teacher:"Teacher", nurse:"Nurse", social_worker:"Social Worker", engineer:"Engineer", lawyer:"Lawyer", paramedic:"Paramedic", counselor:"Counselor", other:"Other" };
const ROLE_COLORS = { doctor:"#dc2626", teacher:"#2563eb", nurse:"#db2777", social_worker:"#16a34a", engineer:"#d97706", lawyer:"#7c3aed", paramedic:"#ea580c", counselor:"#0891b2", other:"#64748b" };
const EMP_LABELS = { full_time:"Full-Time", part_time:"Part-Time", volunteer:"Volunteer", contractual:"Contractual" };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({ byRole: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const token = localStorage.getItem("token");

  const loadStats = () => {
    fetch(`${API_BASE_URL}/api/staff/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(() => {});
  };

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 30 });
    if (roleFilter !== "all") params.set("role", roleFilter);
    if (activeFilter !== "all") params.set("isActive", activeFilter === "active");
    fetch(`${API_BASE_URL}/api/staff/admin/all?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) { setStaff(d.data.staff); setPagination(d.data.pagination); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { setPage(1); load(1); }, [roleFilter, activeFilter]);
  useEffect(() => { load(page); }, [page]);

  const deleteStaff = (id) => {
    if (!confirm("Remove this staff member?")) return;
    fetch(`${API_BASE_URL}/api/staff/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) { setStaff(ms => ms.filter(m => m._id !== id)); loadStats(); } })
      .catch(() => {});
  };

  return (
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Staff & Professionals</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{stats.total} professionals across all NGOs</p>
      </div>

      {/* Role stats */}
      {stats.byRole.length > 0 && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
          {stats.byRole.filter(r => r.total > 0).map(r => {
            const color = ROLE_COLORS[r._id] || "#64748b";
            return (
              <div key={r._id} style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: "10px", padding: "10px 16px" }}>
                <span style={{ fontWeight: "800", fontSize: "16px", color }}>{r.total}</span>
                <span style={{ fontSize: "12px", color, marginLeft: "5px" }}>{ROLE_LABELS[r._id] || r._id}</span>
                {r.active < r.total && <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "4px" }}>({r.active} active)</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all","active","inactive"].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: "600",
                background: activeFilter === f ? "#0f172a" : "#fff",
                color: activeFilter === f ? "#fff" : "#374151",
                borderColor: activeFilter === f ? "#0f172a" : "#e2e8f0" }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ appearance: "none", padding: "7px 28px 7px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", background: "#fff", cursor: "pointer", color: "#374151" }}>
            <option value="all">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px", gap: "10px", color: "#64748b" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Loading…
        </div>
      ) : staff.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <Users size={40} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
          <p style={{ fontSize: "15px" }}>No staff members found.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Name", "Role", "Specialization", "NGO", "Village", "Contact", "Type", "Status", "Joined", ""].map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map(m => {
                  const roleColor = ROLE_COLORS[m.role] || "#64748b";
                  return (
                    <tr key={m._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "11px 14px", fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>{m.name}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ background: `${roleColor}18`, color: roleColor, padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600" }}>{ROLE_LABELS[m.role]}</span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: "#64748b" }}>{m.specialization || "—"}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "3px" }}><Building2 size={11} />{m.ngoId?.ngoName || "—"}</span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: "#64748b" }}>{m.villageId?.villageName || "—"}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {m.phone && <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}><Phone size={10} />{m.phone}</span>}
                          {m.email && <span style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}><Mail size={10} />{m.email}</span>}
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: "11px", color: "#64748b", background: "#f1f5f9", padding: "2px 7px", borderRadius: "5px" }}>{EMP_LABELS[m.employmentType]}</span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "3px", background: m.isActive ? "#dcfce7" : "#f1f5f9", color: m.isActive ? "#166534" : "#64748b", padding: "2px 8px", borderRadius: "5px", width: "fit-content" }}>
                          {m.isActive ? <UserCheck size={10} /> : <UserX size={10} />}
                          {m.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{fmtDate(m.joinedAt)}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <button onClick={() => deleteStaff(m._id)}
                          style={{ background: "#fef2f2", border: "none", color: "#dc2626", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", marginTop: "24px" }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1, fontWeight: "600" }}>← Prev</button>
          <span style={{ color: "#64748b", fontSize: "13px" }}>Page {page} of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: page >= pagination.pages ? "not-allowed" : "pointer", opacity: page >= pagination.pages ? 0.5 : 1, fontWeight: "600" }}>Next →</button>
        </div>
      )}
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
