import { useState, useEffect } from "react";
import { ClipboardList, Loader2, Users, CheckCircle, Clock, FileText, Trash2, ExternalLink } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const STATUS_META = {
  draft:  { label: "Draft",  bg: "#f1f5f9", color: "#475569", Icon: FileText },
  active: { label: "Active", bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
  closed: { label: "Closed", bg: "#fef9c3", color: "#854d0e", Icon: Clock },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminSurveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState("all");
  const token = localStorage.getItem("token");

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 25 });
    if (statusFilter !== "all") params.set("status", statusFilter);
    fetch(`${API_BASE_URL}/api/surveys/admin/all?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) { setSurveys(d.data.surveys); setPagination(d.data.pagination); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(1); }, [statusFilter]);
  useEffect(() => { load(page); }, [page]);

  const deleteSurvey = (id) => {
    if (!confirm("Delete this survey and all its responses?")) return;
    fetch(`${API_BASE_URL}/api/surveys/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setSurveys(ss => ss.filter(s => s._id !== id)); })
      .catch(() => {});
  };

  return (
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Surveys</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{pagination.total} survey{pagination.total !== 1 ? "s" : ""} across all NGOs</p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["all","draft","active","closed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: "600",
              background: statusFilter === s ? "#0f172a" : "#fff",
              color: statusFilter === s ? "#fff" : "#374151",
              borderColor: statusFilter === s ? "#0f172a" : "#e2e8f0" }}>
            {s === "all" ? "All" : STATUS_META[s]?.label || s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px", gap: "10px", color: "#64748b" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Loading…
        </div>
      ) : surveys.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <ClipboardList size={40} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
          <p style={{ fontSize: "15px" }}>No surveys found.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Survey", "NGO", "Village", "Status", "Questions", "Responses", "Created", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {surveys.map(sv => {
                  const sm = STATUS_META[sv.status] || STATUS_META.draft;
                  return (
                    <tr key={sv._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", maxWidth: "220px" }}>
                        <p style={{ margin: 0, fontWeight: "700", fontSize: "13px", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sv.title}</p>
                        {sv.targetAudience && <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{sv.targetAudience}</p>}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: "#374151" }}>{sv.ngoId?.ngoName || "—"}</td>
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: "#64748b" }}>{sv.villageId?.villageName || "—"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: sm.bg, color: sm.color, padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px", width: "fit-content" }}>
                          <sm.Icon size={10} /> {sm.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "3px" }}>
                          <ClipboardList size={11} /> {sv.questions?.length || 0}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "3px" }}>
                          <Users size={11} /> {sv.responseCount || 0}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{fmtDate(sv.createdAt)}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {sv.status === "active" && (
                            <a href={`/survey/${sv.shareToken}`} target="_blank" rel="noreferrer"
                              style={{ background: "#eff6ff", border: "none", color: "#2563eb", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                              <ExternalLink size={13} />
                            </a>
                          )}
                          <button onClick={() => deleteSurvey(sv._id)}
                            style={{ background: "#fef2f2", border: "none", color: "#dc2626", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
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
