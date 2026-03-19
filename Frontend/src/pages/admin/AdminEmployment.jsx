import { useState, useEffect } from "react";
import { Briefcase, Loader2, ChevronDown, Users, MapPin, Building2, IndianRupee, CheckCircle, Clock, XCircle, Trash2 } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const CAT_LABELS = { skill_training:"Skill Training", job_placement:"Job Placement", self_employment:"Self Employment", apprenticeship:"Apprenticeship", other:"Other" };
const CAT_COLORS = { skill_training:"#0891b2", job_placement:"#16a34a", self_employment:"#d97706", apprenticeship:"#7c3aed", other:"#64748b" };
const STATUS_META = {
  open:      { label: "Open",      bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
  closed:    { label: "Closed",    bg: "#fef9c3", color: "#854d0e", Icon: Clock },
  completed: { label: "Completed", bg: "#dbeafe", color: "#1e40af", Icon: XCircle },
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtINR  = (n) => n > 0 ? "₹" + new Intl.NumberFormat("en-IN").format(n) + "/mo" : "Unpaid";

export default function AdminEmployment() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const token = localStorage.getItem("token");

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 25 });
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    fetch(`${API_BASE_URL}/api/employment/admin/all?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) { setJobs(d.data.jobs); setPagination(d.data.pagination); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(1); }, [statusFilter, categoryFilter]);
  useEffect(() => { load(page); }, [page]);

  const deleteJob = (id) => {
    if (!confirm("Delete this listing?")) return;
    fetch(`${API_BASE_URL}/api/employment/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setJobs(js => js.filter(j => j._id !== id)); })
      .catch(() => {});
  };

  return (
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Employment Programs</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{pagination.total} program{pagination.total !== 1 ? "s" : ""} across all NGOs</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all","open","closed","completed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: "600",
                background: statusFilter === s ? "#0f172a" : "#fff",
                color: statusFilter === s ? "#fff" : "#374151",
                borderColor: statusFilter === s ? "#0f172a" : "#e2e8f0" }}>
              {s === "all" ? "All Status" : STATUS_META[s]?.label || s}
            </button>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            style={{ appearance: "none", padding: "7px 28px 7px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", background: "#fff", cursor: "pointer", color: "#374151" }}>
            <option value="all">All Categories</option>
            {Object.entries(CAT_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px", gap: "10px", color: "#64748b" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Loading…
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <Briefcase size={40} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
          <p style={{ fontSize: "15px" }}>No programs found.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Program", "NGO", "Village", "Category", "Status", "Openings", "Stipend", "Dates", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => {
                  const sm = STATUS_META[j.status] || STATUS_META.open;
                  const catColor = CAT_COLORS[j.category] || "#64748b";
                  return (
                    <tr key={j._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", maxWidth: "200px" }}>
                        <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "13px", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.title}</p>
                        {j.location && <p style={{ margin: 0, fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}><MapPin size={10} />{j.location}</p>}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "4px" }}><Building2 size={11} />{j.ngoId?.ngoName || "—"}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{j.villageId ? `${j.villageId.villageName}` : "—"}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: `${catColor}18`, color: catColor, padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600" }}>{CAT_LABELS[j.category]}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: sm.bg, color: sm.color, padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px", width: "fit-content" }}>
                          <sm.Icon size={10} />{sm.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "3px" }}><Users size={11} />{j.filled}/{j.openings}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "3px" }}><IndianRupee size={11} />{fmtINR(j.stipend)}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{fmtDate(j.startDate)}</span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button onClick={() => deleteJob(j._id)}
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
