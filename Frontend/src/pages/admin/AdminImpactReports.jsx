import { useState, useEffect } from "react";
import { BarChart2, Loader2, TrendingUp, TrendingDown, Minus, FileText, CheckCircle, Trash2, Zap, X, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
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

// ── Recharts ──────────────────────────────────────────────────────────────

const CHART_COLORS = { beneficiaries:"#16a34a", health:"#dc2626", education:"#2563eb", employment:"#d97706", infrastructure:"#7c3aed", environment:"#0891b2", other:"#64748b" };

function ReportCharts({ metrics }) {
  if (!metrics || metrics.length === 0) return null;

  // Bar chart data
  const barData = metrics.filter(m => m.value > 0).map(m => ({
    name: m.label.length > 16 ? m.label.slice(0,14) + "…" : m.label,
    value: m.value, category: m.category, unit: m.unit,
  }));

  // Pie chart: count per category
  const catCount = metrics.reduce((acc, m) => { acc[m.category] = (acc[m.category] || 0) + 1; return acc; }, {});
  const pieData = Object.entries(catCount).map(([cat, count]) => ({ name: cat, value: count, fill: CHART_COLORS[cat] || "#64748b" }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "14px" }}>
      {barData.length > 0 && (
        <div>
          <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Metric Values</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 36 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} width={36} />
              <Tooltip formatter={(v, n, p) => [`${v} ${p.payload.unit || ""}`, p.payload.name]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
              <Bar dataKey="value" radius={[3,3,0,0]}>{barData.map((d,i) => <Cell key={i} fill={CHART_COLORS[d.category] || "#64748b"} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {pieData.length > 1 && (
        <div>
          <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Category Breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 9 }}>
                {pieData.map((d,i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Admin Auto-Generate Modal ─────────────────────────────────────────────

function AdminAutoGenModal({ onClose, onGenerated }) {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10);
  const lastOfMonth  = new Date(today.getFullYear(), today.getMonth()+1, 0).toISOString().slice(0,10);

  const [form, setForm]       = useState({ reportPeriod: "monthly", periodStart: firstOfMonth, periodEnd: lastOfMonth });
  const [generating, setGenerating] = useState(false);
  const [error, setError]     = useState("");
  const token = localStorage.getItem("token");

  const handlePeriodChange = (period) => {
    const now = new Date();
    let start, end;
    if (period === "monthly") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = new Date(now.getFullYear(), now.getMonth()+1, 0);
    } else if (period === "quarterly") {
      const q = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), q*3, 1);
      end   = new Date(now.getFullYear(), q*3+3, 0);
    } else if (period === "annual") {
      start = new Date(now.getFullYear(), 0, 1);
      end   = new Date(now.getFullYear(), 11, 31);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = new Date(now.getFullYear(), now.getMonth()+1, 0);
    }
    setForm(f => ({ ...f, reportPeriod: period, periodStart: start.toISOString().slice(0,10), periodEnd: end.toISOString().slice(0,10) }));
  };

  const generate = async () => {
    setGenerating(true); setError("");
    try {
      const res  = await fetch(`${API_BASE_URL}/api/impact-reports/admin/auto-generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { onGenerated(data.data.report); onClose(); }
      else setError(data.message || "Generation failed");
    } catch { setError("Network error"); }
    finally { setGenerating(false); }
  };

  const inp = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "500px", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Zap size={18} color="#fbbf24" />
              <h2 style={{ margin: 0, fontWeight: "800", fontSize: "18px", color: "#fff" }}>Auto-Generate Report</h2>
            </div>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>Aggregates live data across all NGOs on the platform</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>{error}</div>}

          {/* Info box */}
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "12px 14px" }}>
            <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "700", color: "#1e40af" }}>📊 Auto-pulls from:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {["Volunteers","Events","Villages","Fund Ledger","Employment","Surveys","Problems"].map(t => (
                <span key={t} style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "99px" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Period */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "6px" }}>Period Type</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["monthly","quarterly","annual","custom"].map(p => (
                <button key={p} onClick={() => handlePeriodChange(p)}
                  style={{ padding: "7px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: "600",
                    background: form.reportPeriod === p ? "#0f172a" : "#fff",
                    color: form.reportPeriod === p ? "#fff" : "#374151",
                    borderColor: form.reportPeriod === p ? "#0f172a" : "#e2e8f0" }}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" }}>From</label>
              <input type="date" style={inp} value={form.periodStart} onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" }}>To</label>
              <input type="date" style={inp} value={form.periodEnd} onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))} />
            </div>
          </div>

          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>✅ Report will be <strong>published publicly</strong> immediately and visible on the Our Impact page.</p>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
            <button onClick={generate} disabled={generating}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 22px", borderRadius: "8px", border: "none", background: generating ? "#94a3b8" : "#0f172a", color: "#fff", fontWeight: "700", cursor: generating ? "not-allowed" : "pointer" }}>
              {generating ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Generating…</> : <><Zap size={14} /> Generate Report</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportRow({ r, onDelete, onAutoUpdate }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const sm = STATUS_META[r.status] || STATUS_META.draft;

  const handleAutoUpdate = async (e) => {
    e.stopPropagation();
    if (!confirm("Re-pull live data for this report? Metrics, highlights, and summary will be overwritten.")) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res  = await fetch(`${API_BASE_URL}/api/impact-reports/admin/auto-update/${r._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) onAutoUpdate(data.data.report);
      else alert(data.message || "Update failed");
    } catch { alert("Network error"); }
    finally { setUpdating(false); }
  };

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
          <div style={{ display: "flex", gap: "5px" }}>
            <button onClick={handleAutoUpdate} disabled={updating} title="Re-pull live data"
              style={{ background: updating ? "#f1f5f9" : "#eff6ff", border: "none", color: updating ? "#94a3b8" : "#2563eb", borderRadius: "6px", padding: "5px 8px", cursor: updating ? "not-allowed" : "pointer", display: "flex", alignItems: "center" }}>
              <RefreshCw size={13} style={updating ? { animation: "spin 1s linear infinite" } : {}} />
            </button>
            <button onClick={() => onDelete(r._id)}
              style={{ background: "#fef2f2", border: "none", color: "#dc2626", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}>
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr style={{ background: "#f8fafc" }}>
          <td colSpan={7} style={{ padding: "16px 20px" }}>
            {r.summary && <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>{r.summary}</p>}
            {r.metrics?.length > 0 && (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {r.metrics.map((m, i) => <MetricChip key={i} m={m} />)}
                </div>
                <ReportCharts metrics={r.metrics} />
              </>
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
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [autoGenModal, setAutoGenModal] = useState(false);
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

  const onAutoUpdate = (updated) => {
    setReports(rs => rs.map(r => r._id === updated._id ? updated : r));
  };

  return (
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Impact Reports</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{pagination.total} report{pagination.total !== 1 ? "s" : ""} across all NGOs</p>
        </div>
        <button onClick={() => setAutoGenModal(true)}
          style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#1e40af,#7c3aed)", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
          <Zap size={15} /> Auto Generate
        </button>
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
                {reports.map(r => <ReportRow key={r._id} r={r} onDelete={deleteReport} onAutoUpdate={onAutoUpdate} />)}
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
      {autoGenModal && (
        <AdminAutoGenModal
          onClose={() => setAutoGenModal(false)}
          onGenerated={(r) => { setReports(prev => [r, ...prev]); setPagination(p => ({ ...p, total: p.total + 1 })); }}
        />
      )}
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
