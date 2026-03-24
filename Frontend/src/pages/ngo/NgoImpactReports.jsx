import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Plus, Edit2, Trash2, Loader2, X, ChevronDown, BarChart2, Eye, EyeOff, FileText, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { API_BASE_URL } from "./NgoLayout.jsx";

const CAT_COLORS = { beneficiaries:"#16a34a", health:"#dc2626", education:"#2563eb", employment:"#d97706", infrastructure:"#7c3aed", environment:"#0891b2", other:"#64748b" };
const CAT_LABELS = { beneficiaries:"Beneficiaries", health:"Health", education:"Education", employment:"Employment", infrastructure:"Infrastructure", environment:"Environment", other:"Other" };
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";

// ── Bar chart (no external lib) ───────────────────────────────────────────

function MetricChart({ metrics }) {
  if (!metrics || metrics.length === 0) return null;
  const byCat = metrics.reduce((acc, m) => {
    const c = m.category || "other";
    if (!acc[c]) acc[c] = [];
    acc[c].push(m);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {Object.entries(byCat).map(([cat, items]) => (
        <div key={cat}>
          <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "700", color: CAT_COLORS[cat] || "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{CAT_LABELS[cat]}</p>
          {items.map(m => {
            const ChangeIcon = m.changeType === "increase" ? TrendingUp : m.changeType === "decrease" ? TrendingDown : Minus;
            const changeColor = m.changeType === "increase" ? "#16a34a" : m.changeType === "decrease" ? "#dc2626" : "#64748b";
            return (
              <div key={m._id || m.label} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>{m.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {m.change !== 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: "600", color: changeColor }}>
                        <ChangeIcon size={11} />{Math.abs(m.change)}%
                      </span>
                    )}
                    <span style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>
                      {m.value.toLocaleString("en-IN")}{m.unit ? ` ${m.unit}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Metric editor row ─────────────────────────────────────────────────────

function MetricRow({ m, idx, onChange, onDelete }) {
  const inp = { padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "13px", boxSizing: "border-box", fontFamily: "inherit" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 0.7fr 1.2fr 0.8fr 0.7fr auto", gap: "6px", alignItems: "center" }}>
      <input style={{ ...inp, width: "100%" }} value={m.label} onChange={e => onChange(idx, { ...m, label: e.target.value })} placeholder="Metric name" />
      <input type="number" style={{ ...inp, width: "100%" }} value={m.value} onChange={e => onChange(idx, { ...m, value: Number(e.target.value) })} placeholder="0" />
      <input style={{ ...inp, width: "100%" }} value={m.unit} onChange={e => onChange(idx, { ...m, unit: e.target.value })} placeholder="unit" />
      <div style={{ position: "relative" }}>
        <select value={m.category} onChange={e => onChange(idx, { ...m, category: e.target.value })}
          style={{ ...inp, width: "100%", appearance: "none", paddingRight: "22px", cursor: "pointer" }}>
          {Object.entries(CAT_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <ChevronDown size={11} style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
      </div>
      <input type="number" style={{ ...inp, width: "100%" }} value={m.change} onChange={e => onChange(idx, { ...m, change: Number(e.target.value) })} placeholder="±%" />
      <div style={{ position: "relative" }}>
        <select value={m.changeType} onChange={e => onChange(idx, { ...m, changeType: e.target.value })}
          style={{ ...inp, width: "100%", appearance: "none", paddingRight: "22px", cursor: "pointer" }}>
          <option value="neutral">—</option>
          <option value="increase">↑ Up</option>
          <option value="decrease">↓ Down</option>
        </select>
        <ChevronDown size={11} style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
      </div>
      <button onClick={() => onDelete(idx)} style={{ background: "#fef2f2", border: "none", color: "#dc2626", borderRadius: "6px", padding: "6px 8px", cursor: "pointer" }}><X size={13} /></button>
    </div>
  );
}

// ── List editor (highlights / challenges / nextSteps) ─────────────────────

function ListEditor({ items, onChange, placeholder }) {
  const inp = { padding: "8px 11px", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "13px", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "6px" }}>
          <input style={inp} value={item} onChange={e => onChange(items.map((o, j) => j === i ? e.target.value : o))} placeholder={placeholder} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ background: "#fef2f2", border: "none", color: "#dc2626", borderRadius: "6px", padding: "6px 8px", cursor: "pointer" }}><X size={13} /></button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])}
        style={{ padding: "7px 12px", borderRadius: "7px", border: "1px dashed #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: "12px", fontWeight: "600", cursor: "pointer", textAlign: "left" }}>
        + Add item
      </button>
    </div>
  );
}

// ── Report Modal ──────────────────────────────────────────────────────────

function ReportModal({ report, villages, onClose, onSaved }) {
  const [form, setForm] = useState(report ? {
    title: report.title || "", reportPeriod: report.reportPeriod || "monthly",
    periodStart: report.periodStart ? new Date(report.periodStart).toISOString().slice(0,10) : "",
    periodEnd: report.periodEnd ? new Date(report.periodEnd).toISOString().slice(0,10) : "",
    summary: report.summary || "", villageId: report.villageId?._id || report.villageId || "",
    status: report.status || "draft", isPublic: report.isPublic || false,
    metrics: report.metrics || [], highlights: report.highlights || [],
    challenges: report.challenges || [], nextSteps: report.nextSteps || [],
  } : {
    title: "", reportPeriod: "monthly", periodStart: "", periodEnd: "", summary: "",
    villageId: "", status: "draft", isPublic: false,
    metrics: [], highlights: [], challenges: [], nextSteps: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("info");
  const token = localStorage.getItem("token");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addMetric = () => set("metrics", [...form.metrics, { label: "", value: 0, unit: "", category: "beneficiaries", change: 0, changeType: "neutral" }]);
  const updateMetric = (i, m) => set("metrics", form.metrics.map((o, j) => j === i ? m : o));
  const deleteMetric = (i) => set("metrics", form.metrics.filter((_, j) => j !== i));

  const save = () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.periodStart || !form.periodEnd) { setError("Period start and end are required"); return; }
    setSaving(true); setError("");
    const url = report ? `${API_BASE_URL}/api/impact-reports/${report._id}` : `${API_BASE_URL}/api/impact-reports`;
    fetch(url, {
      method: report ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, villageId: form.villageId || null }),
    })
      .then(r => r.json())
      .then(d => { if (d.success) { onSaved(d.data.report); onClose(); } else setError(d.message || "Failed"); })
      .catch(() => setError("Network error"))
      .finally(() => setSaving(false));
  };

  const inp = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };

  const TABS = [{ id: "info", label: "Info" }, { id: "metrics", label: `Metrics (${form.metrics.length})` }, { id: "narrative", label: "Narrative" }];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 1000, padding: "20px", overflowY: "auto" }}>
      <div style={{ background: "#f8fafc", borderRadius: "18px", width: "100%", maxWidth: "720px", marginBottom: "20px" }}>
        <div style={{ background: "#fff", borderRadius: "18px 18px 0 0", padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontWeight: "800", fontSize: "18px", color: "#0f172a" }}>{report ? "Edit Report" : "New Impact Report"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "0", padding: "0 24px" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontSize: "13px", fontWeight: "700", color: tab === t.id ? "#2563eb" : "#64748b", borderBottom: `2px solid ${tab === t.id ? "#2563eb" : "transparent"}`, marginBottom: "-1px" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>{error}</div>}

          {tab === "info" && (
            <>
              <input style={inp} value={form.title} onChange={e => set("title", e.target.value)} placeholder="Report title *" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ position: "relative" }}>
                  <select value={form.reportPeriod} onChange={e => set("reportPeriod", e.target.value)} style={{ ...inp, appearance: "none", paddingRight: "26px", cursor: "pointer" }}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                    <option value="custom">Custom</option>
                  </select>
                  <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
                </div>
                <div style={{ position: "relative" }}>
                  <select value={form.villageId} onChange={e => set("villageId", e.target.value)} style={{ ...inp, appearance: "none", paddingRight: "26px", cursor: "pointer" }}>
                    <option value="">All villages</option>
                    {villages.map(v => <option key={v._id} value={v._id}>{v.villageName}</option>)}
                  </select>
                  <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" }}>Period Start *</label>
                  <input type="date" style={inp} value={form.periodStart} onChange={e => set("periodStart", e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" }}>Period End *</label>
                  <input type="date" style={inp} value={form.periodEnd} onChange={e => set("periodEnd", e.target.value)} />
                </div>
                <div style={{ position: "relative" }}>
                  <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...inp, appearance: "none", paddingRight: "26px", cursor: "pointer" }}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                    <input type="checkbox" checked={form.isPublic} onChange={e => set("isPublic", e.target.checked)} style={{ width: "16px", height: "16px" }} />
                    Visible on public dashboard
                  </label>
                </div>
              </div>
              <textarea rows={3} style={{ ...inp, resize: "vertical" }} value={form.summary} onChange={e => set("summary", e.target.value)} placeholder="Executive summary — what happened this period?" />
            </>
          )}

          {tab === "metrics" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 0.7fr 1.2fr 0.8fr 0.7fr auto", gap: "6px", marginBottom: "6px", padding: "0 2px" }}>
                {["Metric", "Value", "Unit", "Category", "Change %", "Direction", ""].map(h => (
                  <span key={h} style={{ fontSize: "10px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
                {form.metrics.map((m, i) => <MetricRow key={i} m={m} idx={i} onChange={updateMetric} onDelete={deleteMetric} />)}
              </div>
              <button onClick={addMetric}
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px dashed #2563eb", background: "#eff6ff", color: "#2563eb", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
                + Add Metric
              </button>
            </div>
          )}

          {tab === "narrative" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#166534", display: "block", marginBottom: "8px" }}>✅ Key Highlights / Achievements</label>
                <ListEditor items={form.highlights} onChange={v => set("highlights", v)} placeholder="e.g. 200 children enrolled in school" />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#dc2626", display: "block", marginBottom: "8px" }}>⚠️ Challenges Faced</label>
                <ListEditor items={form.challenges} onChange={v => set("challenges", v)} placeholder="e.g. Monsoon delayed road construction" />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", display: "block", marginBottom: "8px" }}>🎯 Next Steps / Planned Actions</label>
                <ListEditor items={form.nextSteps} onChange={v => set("nextSteps", v)} placeholder="e.g. Launch medical camp in April" />
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
            <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
            <button onClick={save} disabled={saving}
              style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : report ? "Save Changes" : "Create Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Recharts metric bar chart ─────────────────────────────────────────────

const RCHART_COLORS = { beneficiaries:"#16a34a", health:"#dc2626", education:"#2563eb", employment:"#d97706", infrastructure:"#7c3aed", environment:"#0891b2", other:"#64748b" };

function MetricsBarChart({ metrics }) {
  if (!metrics || metrics.length === 0) return null;
  const data = metrics.filter(m => m.value > 0).map(m => ({
    name: m.label.length > 18 ? m.label.slice(0, 16) + "…" : m.label,
    value: m.value,
    category: m.category,
    unit: m.unit,
  }));
  if (data.length === 0) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Metrics Chart</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} width={40} />
          <Tooltip
            formatter={(val, name, props) => [`${val} ${props.payload.unit || ""}`, props.payload.name]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={RCHART_COLORS[d.category] || "#64748b"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Report Card ───────────────────────────────────────────────────────────

function ReportCard({ report, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isDraft = report.status === "draft";

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
      <div style={{ height: "4px", background: isDraft ? "#e2e8f0" : "linear-gradient(90deg, #2563eb, #7c3aed)" }} />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontWeight: "800", fontSize: "16px", color: "#0f172a" }}>{report.title}</h3>
              <span style={{ background: isDraft ? "#f1f5f9" : "#dcfce7", color: isDraft ? "#64748b" : "#166534", padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                {isDraft ? <FileText size={10} /> : <CheckCircle size={10} />}
                {isDraft ? "Draft" : "Published"}
              </span>
              {report.isPublic && <Eye size={12} color="#0891b2" />}
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              {report.reportPeriod?.charAt(0).toUpperCase() + report.reportPeriod?.slice(1)} · {fmtDate(report.periodStart)} – {fmtDate(report.periodEnd)}
              {report.villageId && <span style={{ color: "#6366f1", fontWeight: "600", marginLeft: "8px" }}>{report.villageId.villageName}</span>}
            </p>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => setExpanded(x => !x)}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
              <BarChart2 size={12} /> {expanded ? "Collapse" : "View"}
            </button>
            <button onClick={() => onEdit(report)} style={{ background: "#eff6ff", border: "none", color: "#2563eb", borderRadius: "6px", padding: "6px 9px", cursor: "pointer" }}><Edit2 size={13} /></button>
            <button onClick={() => onDelete(report._id)} style={{ background: "#fef2f2", border: "none", color: "#dc2626", borderRadius: "6px", padding: "6px 9px", cursor: "pointer" }}><Trash2 size={13} /></button>
          </div>
        </div>

        {expanded && (
          <div style={{ marginTop: "16px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
            {report.summary && <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, marginBottom: "16px" }}>{report.summary}</p>}
            {report.metrics?.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <MetricChart metrics={report.metrics} />
                <MetricsBarChart metrics={report.metrics} />
              </div>
            )}
            {report.highlights?.filter(Boolean).length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "700", color: "#166534" }}>✅ Key Achievements</p>
                {report.highlights.filter(Boolean).map((h, i) => (
                  <p key={i} style={{ margin: "0 0 4px", fontSize: "13px", color: "#374151", paddingLeft: "12px", borderLeft: "3px solid #16a34a" }}>{h}</p>
                ))}
              </div>
            )}
            {report.challenges?.filter(Boolean).length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "700", color: "#dc2626" }}>⚠️ Challenges</p>
                {report.challenges.filter(Boolean).map((c, i) => (
                  <p key={i} style={{ margin: "0 0 4px", fontSize: "13px", color: "#374151", paddingLeft: "12px", borderLeft: "3px solid #dc2626" }}>{c}</p>
                ))}
              </div>
            )}
            {report.nextSteps?.filter(Boolean).length > 0 && (
              <div>
                <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "700", color: "#2563eb" }}>🎯 Next Steps</p>
                {report.nextSteps.filter(Boolean).map((s, i) => (
                  <p key={i} style={{ margin: "0 0 4px", fontSize: "13px", color: "#374151", paddingLeft: "12px", borderLeft: "3px solid #2563eb" }}>{s}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function NgoImpactReports() {
  const [reports, setReports]     = useState([]);
  const [villages, setVillages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/impact-reports/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/villages/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([rp, v]) => {
      if (rp.success) setReports(rp.data.reports);
      if (v.success) setVillages(v.data.villages);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const onSaved = (rp) => setReports(rs => {
    const idx = rs.findIndex(r => r._id === rp._id);
    if (idx >= 0) { const n = [...rs]; n[idx] = rp; return n; }
    return [rp, ...rs];
  });

  const onDelete = (id) => {
    if (!confirm("Delete this impact report?")) return;
    fetch(`${API_BASE_URL}/api/impact-reports/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.success) setReports(rs => rs.filter(r => r._id !== id)); }).catch(() => {});
  };

  const filtered = statusFilter === "all" ? reports : reports.filter(r => r.status === statusFilter);

  return (
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Impact Reports</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Document and share your NGO's impact with metrics and charts</p>
        </div>
        <button onClick={() => setModal("create")}
          style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 18px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
          <Plus size={15} /> New Report
        </button>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["all","draft","published"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: "600",
              background: statusFilter === s ? "#0f172a" : "#fff",
              color: statusFilter === s ? "#fff" : "#374151",
              borderColor: statusFilter === s ? "#0f172a" : "#e2e8f0" }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px", gap: "10px", color: "#64748b" }}>
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "14px", border: "1px dashed #e2e8f0" }}>
          <BarChart2 size={48} style={{ color: "#cbd5e1", marginBottom: "14px" }} />
          <h3 style={{ margin: "0 0 8px", fontWeight: "700", color: "#0f172a" }}>No reports yet</h3>
          <p style={{ color: "#64748b", margin: "0 0 20px" }}>Create impact reports with metrics, highlights, and challenges to track and share your work.</p>
          <button onClick={() => setModal("create")}
            style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: "pointer" }}>
            Create First Report
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filtered.map(r => <ReportCard key={r._id} report={r} onEdit={r => setModal(r)} onDelete={onDelete} />)}
        </div>
      )}

      {modal && <ReportModal report={modal === "create" ? null : modal} villages={villages} onClose={() => setModal(null)} onSaved={onSaved} />}
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
