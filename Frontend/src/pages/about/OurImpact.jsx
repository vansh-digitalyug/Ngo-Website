import { useState, useEffect } from "react";
import { API } from "../../utils/S3.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

/* ── category config ── */
const CAT = {
  beneficiaries: { color: "#6366f1", bg: "#6366f115", label: "Beneficiaries" },
  health:        { color: "#ec4899", bg: "#ec489915", label: "Health" },
  education:     { color: "#f59e0b", bg: "#f59e0b15", label: "Education" },
  employment:    { color: "#22c55e", bg: "#22c55e15", label: "Employment" },
  infrastructure:{ color: "#06b6d4", bg: "#06b6d415", label: "Infrastructure" },
  environment:   { color: "#84cc16", bg: "#84cc1615", label: "Environment" },
  other:         { color: "#94a3b8", bg: "#94a3b815", label: "Other" },
};

const PERIOD_LABEL = {
  monthly: "Monthly", quarterly: "Quarterly",
  annual: "Annual", custom: "Custom",
};

function formatValue(value, unit) {
  if (!unit) return value.toLocaleString("en-IN");
  if (unit === "₹") return `₹${value.toLocaleString("en-IN")}`;
  if (unit === "%") return `${value}%`;
  return `${value.toLocaleString("en-IN")} ${unit}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Mini bar for % change ── */
function ChangeBadge({ change, changeType }) {
  if (!change || changeType === "neutral") return null;
  const up = changeType === "increase";
  return (
    <span style={{
      fontSize: 11, fontWeight: 700,
      color: up ? "#22c55e" : "#ef4444",
      background: up ? "#22c55e15" : "#ef444415",
      borderRadius: 99, padding: "2px 8px",
    }}>
      {up ? "▲" : "▼"} {Math.abs(change)}%
    </span>
  );
}

/* ── Metric card ── */
function MetricCard({ metric }) {
  const cat = CAT[metric.category] || CAT.other;
  return (
    <div style={{
      background: cat.bg, border: `1px solid ${cat.color}30`,
      borderRadius: 14, padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {cat.label}
      </span>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>
        {formatValue(metric.value, metric.unit)}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>{metric.label}</span>
        <ChangeBadge change={metric.change} changeType={metric.changeType} />
      </div>
    </div>
  );
}

/* ── Report detail modal ── */
function ReportModal({ report, onClose }) {
  if (!report) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        zIndex: 1000, display: "flex", alignItems: "flex-start",
        justifyContent: "center", padding: "60px 16px 40px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, maxWidth: 780, width: "100%",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Modal header */}
        <div style={{
          background: "linear-gradient(135deg,#0f172a,#1e3a5f)",
          padding: "32px 36px 28px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: "#22c55e",
                background: "#22c55e18", border: "1px solid #22c55e30",
                borderRadius: 99, padding: "3px 12px", letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>
                {PERIOD_LABEL[report.reportPeriod] || "Report"}
              </span>
              <h2 style={{ margin: "12px 0 6px", color: "#fff", fontSize: 22, fontWeight: 800, lineHeight: 1.25 }}>
                {report.title}
              </h2>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                {report.ngoId?.ngoName || "NGO"} &nbsp;·&nbsp; {formatDate(report.periodStart)} – {formatDate(report.periodEnd)}
                {report.villageId && ` · ${report.villageId.villageName}, ${report.villageId.district}`}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%",
                width: 36, height: 36, color: "#fff", fontSize: 18,
                cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>
          {report.summary && (
            <p style={{ margin: "16px 0 0", color: "#cbd5e1", fontSize: 14, lineHeight: 1.7 }}>
              {report.summary}
            </p>
          )}
        </div>

        <div style={{ padding: "28px 36px 36px" }}>
          {/* Metrics grid */}
          {report.metrics?.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Key Metrics</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                gap: 12, marginBottom: 20,
              }}>
                {report.metrics.map((m, i) => <MetricCard key={i} metric={m} />)}
              </div>

              {/* Recharts bar chart */}
              {(() => {
                const barData = report.metrics.filter(m => m.value > 0).map(m => ({
                  name: m.label.length > 16 ? m.label.slice(0,14)+"…" : m.label,
                  value: m.value, category: m.category, unit: m.unit,
                }));
                const catCount = report.metrics.reduce((acc, m) => { acc[m.category]=(acc[m.category]||0)+1; return acc; }, {});
                const pieData  = Object.entries(catCount).map(([cat, v]) => ({ name: cat, value: v, fill: (CAT[cat]?.color || "#94a3b8") }));
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {barData.length > 0 && (
                      <div>
                        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Metric Values</p>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={barData} margin={{ top:4, right:8, left:0, bottom:44 }}>
                            <XAxis dataKey="name" tick={{ fontSize:9, fill:"#94a3b8" }} angle={-30} textAnchor="end" interval={0} />
                            <YAxis tick={{ fontSize:9, fill:"#94a3b8" }} width={38} />
                            <Tooltip formatter={(v,n,p) => [`${v} ${p.payload.unit||""}`, p.payload.name]} contentStyle={{ fontSize:11, borderRadius:8 }} />
                            <Bar dataKey="value" radius={[4,4,0,0]}>{barData.map((d,i) => <Cell key={i} fill={CAT[d.category]?.color || "#94a3b8"} />)}</Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {pieData.length > 1 && (
                      <div>
                        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Category Mix</p>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                              {pieData.map((d,i) => <Cell key={i} fill={d.fill} />)}
                            </Pie>
                            <Tooltip contentStyle={{ fontSize:11, borderRadius:8 }} />
                            <Legend iconSize={8} wrapperStyle={{ fontSize:10 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>
          )}

          {/* Highlights */}
          {report.highlights?.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                🏆 Key Achievements
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {report.highlights.map((h, i) => (
                  <li key={i} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    background: "#f0fdf4", borderRadius: 10, padding: "10px 14px",
                    border: "1px solid #bbf7d0",
                  }}>
                    <span style={{ color: "#22c55e", fontWeight: 800, fontSize: 16, marginTop: -1 }}>✓</span>
                    <span style={{ color: "#166534", fontSize: 14, lineHeight: 1.6 }}>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Challenges */}
          {report.challenges?.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                ⚡ Challenges Faced
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {report.challenges.map((c, i) => (
                  <li key={i} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    background: "#fff7ed", borderRadius: 10, padding: "10px 14px",
                    border: "1px solid #fed7aa",
                  }}>
                    <span style={{ color: "#f97316", fontWeight: 800, fontSize: 16, marginTop: -1 }}>!</span>
                    <span style={{ color: "#9a3412", fontSize: 14, lineHeight: 1.6 }}>{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Next steps */}
          {report.nextSteps?.length > 0 && (
            <section>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                🎯 Next Steps
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {report.nextSteps.map((n, i) => (
                  <li key={i} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    background: "#eff6ff", borderRadius: 10, padding: "10px 14px",
                    border: "1px solid #bfdbfe",
                  }}>
                    <span style={{ color: "#3b82f6", fontWeight: 800, fontSize: 15, marginTop: -1 }}>→</span>
                    <span style={{ color: "#1e40af", fontSize: 14, lineHeight: 1.6 }}>{n}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Report card ── */
function ReportCard({ report, onClick }) {
  const topMetrics = (report.metrics || []).slice(0, 3);
  const catColors = [...new Set((report.metrics || []).map(m => m.category))]
    .slice(0, 4).map(c => CAT[c]?.color || "#94a3b8");

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: 18, border: "1px solid #e2e8f0",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        cursor: "pointer", overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.05)";
      }}
    >
      {/* Color bar */}
      <div style={{
        height: 5,
        background: catColors.length > 1
          ? `linear-gradient(90deg,${catColors.join(",")})`
          : catColors[0] || "#6366f1",
      }} />

      <div style={{ padding: "20px 22px 22px" }}>
        {/* Period badge + date */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#6366f1",
            background: "#6366f115", borderRadius: 99, padding: "3px 10px",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            {PERIOD_LABEL[report.reportPeriod] || "Report"}
          </span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            {formatDate(report.periodStart)} – {formatDate(report.periodEnd)}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
          {report.title}
        </h3>

        {/* NGO + village */}
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "#64748b" }}>
          {report.ngoId?.ngoName || "NGO"}
          {report.villageId && ` · ${report.villageId.villageName}`}
        </p>

        {/* Summary */}
        {report.summary && (
          <p style={{
            margin: "0 0 16px", fontSize: 13, color: "#475569",
            lineHeight: 1.65, display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {report.summary}
          </p>
        )}

        {/* Top metrics */}
        {topMetrics.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {topMetrics.map((m, i) => {
              const cat = CAT[m.category] || CAT.other;
              return (
                <div key={i} style={{
                  background: cat.bg, border: `1px solid ${cat.color}30`,
                  borderRadius: 10, padding: "8px 12px", minWidth: 90,
                }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>
                    {formatValue(m.value, m.unit)}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{m.label}</div>
                </div>
              );
            })}
            {report.metrics.length > 3 && (
              <div style={{
                borderRadius: 10, padding: "8px 12px", border: "1px dashed #e2e8f0",
                display: "flex", alignItems: "center",
                fontSize: 12, color: "#94a3b8",
              }}>
                +{report.metrics.length - 3} more
              </div>
            )}
          </div>
        )}

        {/* Highlights count */}
        <div style={{ display: "flex", gap: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
          {report.highlights?.length > 0 && (
            <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>
              ✓ {report.highlights.length} achievement{report.highlights.length > 1 ? "s" : ""}
            </span>
          )}
          {report.challenges?.length > 0 && (
            <span style={{ fontSize: 12, color: "#f97316", fontWeight: 600 }}>
              ! {report.challenges.length} challenge{report.challenges.length > 1 ? "s" : ""}
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>
            View details →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
export default function OurImpact() {
  const [reports, setReports]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState("all"); // "all" | reportPeriod
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const LIMIT = 9;

  useEffect(() => {
    const q = new URLSearchParams({ page, limit: LIMIT });
    setLoading(true);
    fetch(`${API}/api/impact-reports/public?${q}`)
      .then(r => r.json())
      .then(d => {
        setReports(d.data?.reports || []);
        setPagination(d.data?.pagination || { total: 0, pages: 1 });
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = filter === "all"
    ? reports
    : reports.filter(r => r.reportPeriod === filter);

  /* aggregate top-level stats */
  const totalReports = pagination.total;
  const uniqueNgos = new Set(reports.map(r => r.ngoId?._id)).size;
  const totalBeneficiaries = reports.reduce((sum, r) => {
    const b = (r.metrics || []).find(m => m.category === "beneficiaries");
    return sum + (b?.value || 0);
  }, 0);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%)",
        padding: "80px 24px 70px",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* decorative circles */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle,#22c55e18,transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -40,
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle,#6366f118,transparent 70%)",
          pointerEvents: "none",
        }} />

        <span style={{
          display: "inline-block", fontSize: 11, fontWeight: 800, color: "#22c55e",
          background: "#22c55e18", border: "1px solid #22c55e35",
          borderRadius: 99, padding: "4px 16px", letterSpacing: "0.1em",
          textTransform: "uppercase", marginBottom: 20,
        }}>
          Transparency &amp; Accountability
        </span>

        <h1 style={{
          margin: "0 0 16px", color: "#fff",
          fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, lineHeight: 1.1,
        }}>
          Our Impact
        </h1>
        <p style={{
          margin: "0 auto", color: "#94a3b8", fontSize: 16, lineHeight: 1.75,
          maxWidth: 560,
        }}>
          Real numbers, real stories. Every report published here reflects the work
          our NGO partners do on the ground — transparent and verified.
        </p>

        {/* Summary stats */}
        {!loading && totalReports > 0 && (
          <div style={{
            display: "flex", justifyContent: "center", gap: 32, marginTop: 44,
            flexWrap: "wrap",
          }}>
            {[
              { value: totalReports, label: "Reports Published" },
              { value: uniqueNgos, label: "NGOs Reporting" },
              { value: totalBeneficiaries > 0 ? totalBeneficiaries.toLocaleString("en-IN") : "—", label: "Beneficiaries Reached" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#22c55e", lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "32px 24px 0",
        display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
      }}>
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginRight: 4 }}>Filter:</span>
        {["all", "monthly", "quarterly", "annual", "custom"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 16px", borderRadius: 99, border: "1px solid",
              borderColor: filter === f ? "#6366f1" : "#e2e8f0",
              background: filter === f ? "#6366f1" : "#fff",
              color: filter === f ? "#fff" : "#64748b",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.18s",
            }}
          >
            {f === "all" ? "All Reports" : PERIOD_LABEL[f]}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: 44, height: 44, border: "4px solid #e2e8f0",
              borderTopColor: "#6366f1", borderRadius: "50%",
              animation: "spin 0.7s linear infinite", margin: "0 auto 16px",
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: "#94a3b8", margin: 0 }}>Loading reports…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 24px",
            background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <h3 style={{ color: "#1e293b", margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>
              No Reports Yet
            </h3>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>
              Impact reports will appear here once NGOs publish them.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
              gap: 20,
            }}>
              {filtered.map(r => (
                <ReportCard key={r._id} report={r} onClick={() => setSelected(r)} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40 }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    style={{
                      width: 38, height: 38, borderRadius: "50%", border: "1px solid",
                      borderColor: page === p ? "#6366f1" : "#e2e8f0",
                      background: page === p ? "#6366f1" : "#fff",
                      color: page === p ? "#fff" : "#64748b",
                      fontWeight: 700, fontSize: 14, cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <ReportModal report={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
