import { useState, useEffect } from "react";
import { BarChart2, Loader2, TrendingUp, TrendingDown, Minus, FileText, CheckCircle, Trash2, ExternalLink } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const STATUS_META = {
  draft:     { label: "Draft",     bg: "#f1f5f9", color: "#475569", Icon: FileText },
  published: { label: "Published", bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
};

const PERIOD_LABELS = { monthly: "Monthly", quarterly: "Quarterly", annual: "Annual", custom: "Custom" };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const CAT_COLORS = {
  beneficiaries: "#2563eb", health: "#16a34a", education: "#7c3aed",
  employment: "#d97706", infrastructure: "#0891b2", environment: "#059669", other: "#64748b",
};

function MetricChip({ m }) {
  const color = CAT_COLORS[m.category] || CAT_COLORS.other;
  const Icon = m.changeType === "increase" ? TrendingUp : m.changeType === "decrease" ? TrendingDown : Minus;
  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 12px", minWidth: "120px" }}>
      <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#94a3b8", textTransform: "capitalize" }}>{m.category}</p>
      <p style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "18px", color }}>{m.value}<span style={{ fontSize: "11px", fontWeight: "400", color: "#94a3b8", marginLeft: "3px" }}>{m.unit}</span></p>
      <p style={{ margin: 0, fontSize: "11px", color: "#374151", fontWeight: "600" }}>{m.label}</p>
      {m.change != null && (
        <p style={{ margin: "3px 0 0", fontSize: "10px", color: m.changeType === "increase" ? "#16a34a" : m.changeType === "decrease" ? "#dc2626" : "#64748b", display: "flex", alignItems: "center", gap: "2px" }}>
          <Icon size={10} /> {m.change}%
        </p>
      )}
    </div>
  );
}

function ReportRow({ r, onDelete }) {
  const [open, setOpen] = useState(false);
  const sm = STATUS_META[r.status] || STATUS_META.draft;

  return (
    <>
      <tr style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
        <td style={{ padding: "12px 14px", maxWidth: "220px" }}>
          <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "13px", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</p>
          <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{PERIOD_LABELS[r.reportPeriod] || r.reportPeriod}</p>
        </td>
        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#374151" }}>{r.ngoId?.ngoName || "—"}</td>
        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#64748b" }}>{r.villageId?.villageName || "—"}</td>
        <td style={{ padding: "12px 14px" }}>
          <span style={{ background: sm.bg, color: sm.color, padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px", width: "fit-content" }}>
            <sm.Icon size={10} /> {sm.label}
          </span>
        </td>
        <td style={{ padding: "12px 14px", fontSize: "12px", color: "#374151" }}>{r.metrics?.length || 0} metrics</td>
        <td style={{ padding: "12px 14px", fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
          {r.periodStart && r.periodEnd ? `${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}` : fmtDate(r.createdAt)}
        </td>
        <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onDelete(r._id)}
            style={{ background: "#fef2f2", border: "none", color: "#dc2626", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}>
            <Trash2 size={13} />
          </button>
        </td>
      </tr>
      {open && (
        <tr style={{ background: "#f8fafc" }}>
          <td colSpan={7} style={{ padding: "16px 20px" }}>
            {r.summary && <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>{r.summary}</p>}
            {r.metrics?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                {r.metrics.map((m, i) => <MetricChip key={i} m={m} />)}
              </div>
            )}
            {r.highlights?.length > 0 && (
              <div style={{ marginBottom: "8px" }}>
                <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase" }}>Highlights</p>
                <ul style={{ margin: 0, paddingLeft: "16px" }}>
                  {r.highlights.map((h, i) => <li key={i} style={{ fontSize: "12px", color: "#374151", marginBottom: "2px" }}>{h}</li>)}
                </ul>
              </div>
            )}
            {r.challenges?.length > 0 && (
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#dc2626", textTransform: "uppercase" }}>Challenges</p>
                <ul style={{ margin: 0, paddingLeft: "16px" }}>
                  {r.challenges.map((c, i) => <li key={i} style={{ fontSize: "12px", color: "#374151", marginBottom: "2px" }}>{c}</li>)}
                </ul>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminImpactReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState("all");
  const token = localStorage.getItem("token");

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 25 });
    if (statusFilter !== "all") params.set("status", statusFilter);
    fetch(`${API_BASE_URL}/api/impact-reports/admin/all?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) { setReports(d.data.reports); setPagination(d.data.pagination); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(1); }, [statusFilter]);
  useEffect(() => { load(page); }, [page]);

  const deleteReport = (id) => {
    if (!confirm("Delete this impact report?")) return;
    fetch(`${API_BASE_URL}/api/impact-reports/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setReports(rs => rs.filter(r => r._id !== id)); })
      .catch(() => {});
  };

  return (
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Impact Reports</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{pagination.total} report{pagination.total !== 1 ? "s" : ""} across all NGOs</p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["all", "draft", "published"].map(s => (
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
      ) : reports.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <BarChart2 size={40} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
          <p style={{ fontSize: "15px" }}>No impact reports found.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "680px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Report", "NGO", "Village", "Status", "Metrics", "Period", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => <ReportRow key={r._id} r={r} onDelete={deleteReport} />)}
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
