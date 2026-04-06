import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, IndianRupee, Eye, Calendar, Tag, Building2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFundSummary, selectFundSummary, selectFundSummaryStatus } from "../store/slices/fundLedgerSlice";
const fmtINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const CAT_LABELS = {
  donation: "Donations", govt_grant: "Govt Grants", salary: "Salaries",
  materials: "Materials", event: "Events", operations: "Operations",
  village_work: "Village Work", medical: "Medical", education: "Education", other: "Other",
};
const CAT_COLORS = {
  donation: "#16a34a", govt_grant: "#0369a1", salary: "#9333ea",
  materials: "#ea580c", event: "#0891b2", operations: "#64748b",
  village_work: "#d97706", medical: "#dc2626", education: "#7c3aed", other: "#475569",
};

// Simple horizontal bar chart (no external dep)
function BarChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {data.map(({ label, value, color }) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{label}</span>
            <span style={{ fontSize: "12px", fontWeight: "700", color }}>{fmtINR(value)}</span>
          </div>
          <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px" }}>
            <div style={{ height: "100%", width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color, borderRadius: "4px", transition: "width 0.8s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Transparency() {
  const dispatch = useDispatch();
  const rawSummary = useSelector(selectFundSummary);
  const summaryStatus = useSelector(selectFundSummaryStatus);

  const summary = rawSummary || { totals: { credit: 0, debit: 0 }, byCategory: {} };
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (summaryStatus === "idle") dispatch(fetchFundSummary());
  }, [summaryStatus, dispatch]);

  const balance = summary.totals.credit - summary.totals.debit;
  const utilizationPct = summary.totals.credit > 0
    ? Math.round((summary.totals.debit / summary.totals.credit) * 100)
    : 0;

  // Build chart data from byCategory
  const debitChartData = Object.entries(summary.byCategory)
    .filter(([, v]) => v.debit > 0)
    .map(([cat, v]) => ({ label: CAT_LABELS[cat] || cat, value: v.debit, color: CAT_COLORS[cat] || "#64748b" }))
    .sort((a, b) => b.value - a.value);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff", padding: "60px 24px 48px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "20px", color: "#93c5fd" }}>
            <Eye size={14} /> 100% Transparent
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: "900", lineHeight: 1.1 }}>
            Fund Transparency Dashboard
          </h1>
          <p style={{ margin: "0 auto", maxWidth: "560px", color: "#94a3b8", fontSize: "16px", lineHeight: 1.7 }}>
            Every rupee donated is accounted for here. See exactly how funds are received and utilized across all NGO activities.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 16px 60px" }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Total Received", value: fmtINR(summary.totals.credit), icon: TrendingUp, bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", iconBg: "#dcfce7" },
            { label: "Total Utilized", value: fmtINR(summary.totals.debit), icon: TrendingDown, bg: "#fef2f2", border: "#fecaca", color: "#991b1b", iconBg: "#fee2e2" },
            { label: "Current Balance", value: fmtINR(Math.abs(balance)), icon: IndianRupee, bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", iconBg: "#dbeafe" },
            { label: "Fund Utilization", value: `${utilizationPct}%`, icon: Eye, bg: "#faf5ff", border: "#ddd6fe", color: "#6d28d9", iconBg: "#ede9fe" },
          ].map(({ label, value, icon: Icon, bg, border, color, iconBg }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={color} />
                </div>
                <span style={{ fontSize: "12px", fontWeight: "600", color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              </div>
              <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Utilization meter */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>Overall Fund Utilization</h3>
            <span style={{ fontWeight: "800", fontSize: "20px", color: utilizationPct >= 80 ? "#16a34a" : "#d97706" }}>{utilizationPct}%</span>
          </div>
          <div style={{ height: "12px", background: "#f1f5f9", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, utilizationPct)}%`, background: utilizationPct >= 80 ? "#16a34a" : "#d97706", borderRadius: "6px", transition: "width 1s ease" }} />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#64748b" }}>
            {fmtINR(summary.totals.debit)} spent out of {fmtINR(summary.totals.credit)} received
          </p>
        </div>

        {/* Expenditure breakdown */}
        {debitChartData.length > 0 && (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ margin: "0 0 20px", fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>Expenditure Breakdown</h3>
            <BarChart data={debitChartData} />
          </div>
        )}

        {/* Category breakdown table */}
        {Object.keys(summary.byCategory).length > 0 && (
          <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ margin: "0 0 16px", fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>Category-wise Summary</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "500px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Category", "Total Received", "Total Spent", "Net"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", fontSize: "11px", fontWeight: "700", color: "#64748b", textAlign: h === "Category" ? "left" : "right", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.byCategory).map(([cat, data]) => {
                    const net = (data.credit || 0) - (data.debit || 0);
                    return (
                      <tr key={cat} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: CAT_COLORS[cat] || "#64748b", display: "inline-block" }} />
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{CAT_LABELS[cat] || cat}</span>
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", color: "#16a34a", fontWeight: "600" }}>{fmtINR(data.credit || 0)}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", color: "#dc2626", fontWeight: "600" }}>{fmtINR(data.debit || 0)}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontSize: "13px", fontWeight: "700", color: net >= 0 ? "#1e40af" : "#dc2626" }}>{fmtINR(Math.abs(net))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info note */}
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "12px", padding: "16px 20px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <Eye size={18} color="#0284c7" style={{ marginTop: "2px", flexShrink: 0 }} />
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#0369a1", fontSize: "14px" }}>About This Dashboard</p>
            <p style={{ margin: 0, color: "#0369a1", fontSize: "13px", lineHeight: 1.6 }}>
              This transparency page shows only entries marked as public by our NGO partners. All fund entries are recorded by verified NGO administrators and reviewed by the platform. For detailed audits, please contact us directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
