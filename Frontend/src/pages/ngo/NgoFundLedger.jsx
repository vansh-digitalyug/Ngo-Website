import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, IndianRupee, Plus, Edit2, Trash2, Loader2, X, ChevronDown, Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "./NgoLayout.jsx";

const fmtINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const CATEGORIES = ["donation","govt_grant","salary","materials","event","operations","village_work","medical","education","other"];
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

const emptyEntry = {
  type: "credit", category: "donation", amount: "", description: "", date: new Date().toISOString().slice(0,10), isPublic: true,
};

function EntryModal({ entry, onClose, onSaved }) {
  const [form, setForm] = useState(entry ? {
    type: entry.type,
    category: entry.category,
    amount: entry.amount,
    description: entry.description || "",
    date: entry.date ? new Date(entry.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    isPublic: entry.isPublic ?? true,
  } : { ...emptyEntry });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.amount || Number(form.amount) <= 0) { setError("Enter a valid amount"); return; }
    if (!form.description.trim()) { setError("Description is required"); return; }
    setSaving(true); setError("");
    const url = entry ? `${API_BASE_URL}/api/fund-ledger/${entry._id}` : `${API_BASE_URL}/api/fund-ledger`;
    fetch(url, {
      method: entry ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) { onSaved(d.data.entry); onClose(); }
        else setError(d.message || "Failed to save");
      })
      .catch(() => setError("Network error"))
      .finally(() => setSaving(false));
  };

  const inp = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: "480px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontWeight: "800", fontSize: "18px", color: "#0f172a" }}>{entry ? "Edit Entry" : "Add Fund Entry"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
        </div>

        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>{error}</div>}

        {/* Type toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {["credit","debit"].map(t => (
            <button key={t} onClick={() => set("type", t)}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "2px solid", cursor: "pointer", fontWeight: "700", fontSize: "14px",
                background: form.type === t ? (t === "credit" ? "#f0fdf4" : "#fef2f2") : "#fff",
                color: form.type === t ? (t === "credit" ? "#166534" : "#991b1b") : "#374151",
                borderColor: form.type === t ? (t === "credit" ? "#16a34a" : "#dc2626") : "#e2e8f0",
              }}>
              {t === "credit" ? "↑ Income" : "↓ Expense"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Amount (₹) *</label>
            <input type="number" style={inp} value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Category *</label>
            <div style={{ position: "relative" }}>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                style={{ ...inp, appearance: "none", paddingRight: "30px", cursor: "pointer" }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Description *</label>
            <textarea rows={2} style={{ ...inp, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Briefly describe this transaction…" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Date</label>
            <input type="date" style={inp} value={form.date} onChange={e => set("date", e.target.value)} />
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
              <input type="checkbox" checked={form.isPublic} onChange={e => set("isPublic", e.target.checked)} style={{ width: "16px", height: "16px" }} />
              Show on public transparency dashboard
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "22px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving}
            style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : entry ? "Save Changes" : "Add Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NgoFundLedger() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ totals: { credit: 0, debit: 0 }, byCategory: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [typeFilter, setTypeFilter] = useState("all");
  const [modal, setModal] = useState(null); // null | "create" | entry
  const token = localStorage.getItem("token");

  const loadSummary = () => {
    fetch(`${API_BASE_URL}/api/fund-ledger/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setSummary(d.data); })
      .catch(() => {});
  };

  const loadEntries = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 20 });
    if (typeFilter !== "all") params.set("type", typeFilter);
    fetch(`${API_BASE_URL}/api/fund-ledger?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setEntries(d.data.entries);
          setPagination(d.data.pagination);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSummary(); }, []);
  useEffect(() => { setPage(1); loadEntries(1); }, [typeFilter]);
  useEffect(() => { loadEntries(page); }, [page]);

  const onSaved = (entry) => {
    setEntries(es => {
      const idx = es.findIndex(e => e._id === entry._id);
      if (idx >= 0) { const n = [...es]; n[idx] = entry; return n; }
      return [entry, ...es];
    });
    loadSummary();
  };

  const deleteEntry = (id) => {
    if (!confirm("Delete this fund entry?")) return;
    fetch(`${API_BASE_URL}/api/fund-ledger/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setEntries(es => es.filter(e => e._id !== id));
          loadSummary();
        }
      })
      .catch(() => {});
  };

  const balance = summary.totals.credit - summary.totals.debit;

  return (
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Fund Ledger</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Track income and expenses for your NGO</p>
        </div>
        <button onClick={() => setModal("create")}
          style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Income", value: fmtINR(summary.totals.credit), icon: TrendingUp, bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" },
          { label: "Total Expense", value: fmtINR(summary.totals.debit), icon: TrendingDown, bg: "#fef2f2", border: "#fecaca", color: "#991b1b" },
          { label: "Net Balance", value: fmtINR(Math.abs(balance)), icon: IndianRupee, bg: balance >= 0 ? "#eff6ff" : "#fef2f2", border: balance >= 0 ? "#bfdbfe" : "#fecaca", color: balance >= 0 ? "#1e40af" : "#991b1b" },
        ].map(({ label, value, icon: Icon, bg, border, color }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: "12px", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <Icon size={16} color={color} />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "700", color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
            </div>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: "800", color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["all","credit","debit"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: "600",
              background: typeFilter === t ? "#0f172a" : "#fff",
              color: typeFilter === t ? "#fff" : "#374151",
              borderColor: typeFilter === t ? "#0f172a" : "#e2e8f0",
            }}>
            {t === "all" ? "All" : t === "credit" ? "↑ Income" : "↓ Expenses"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px", gap: "10px", color: "#64748b" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Loading…
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "14px", border: "1px dashed #e2e8f0" }}>
          <IndianRupee size={40} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
          <p style={{ color: "#94a3b8", fontSize: "15px", margin: "0 0 16px" }}>No entries yet. Start tracking your funds.</p>
          <button onClick={() => setModal("create")}
            style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: "pointer" }}>
            Add First Entry
          </button>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "620px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Date", "Type", "Category", "Description", "Amount", "Public", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", color: "#64748b", textAlign: h === "Amount" ? "right" : "left", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => {
                  const catColor = CAT_COLORS[e.category] || "#64748b";
                  return (
                    <tr key={e._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "11px 14px", fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>{fmtDate(e.date)}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                          background: e.type === "credit" ? "#dcfce7" : "#fee2e2",
                          color: e.type === "credit" ? "#166534" : "#991b1b",
                        }}>
                          {e.type === "credit" ? "↑ Income" : "↓ Expense"}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ background: `${catColor}18`, color: catColor, padding: "3px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600" }}>
                          {CAT_LABELS[e.category] || e.category}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: "13px", color: "#374151", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.description}</td>
                      <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: "700", fontSize: "13px", color: e.type === "credit" ? "#166534" : "#dc2626", whiteSpace: "nowrap" }}>
                        {e.type === "credit" ? "+" : "-"}{fmtINR(e.amount)}
                      </td>
                      <td style={{ padding: "11px 14px", textAlign: "center" }}>
                        {e.isPublic ? <Eye size={14} color="#16a34a" /> : <EyeOff size={14} color="#94a3b8" />}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => setModal(e)}
                            style={{ background: "#eff6ff", border: "none", color: "#2563eb", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => deleteEntry(e._id)}
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", marginTop: "24px" }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1, fontWeight: "600" }}>← Prev</button>
          <span style={{ color: "#64748b", fontSize: "13px" }}>Page {page} of {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: page >= pagination.pages ? "not-allowed" : "pointer", opacity: page >= pagination.pages ? 0.5 : 1, fontWeight: "600" }}>Next →</button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <EntryModal
          entry={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
