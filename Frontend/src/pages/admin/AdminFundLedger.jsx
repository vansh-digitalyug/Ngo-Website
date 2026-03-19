import { useState, useEffect } from "react";
import {
  IndianRupee, Plus, Pencil, Trash2, X, Loader2,
  TrendingUp, TrendingDown, RefreshCw, Filter, Eye, EyeOff
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const token = () => localStorage.getItem("token");
const fmtINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const CATEGORIES = ["donation", "govt_grant", "salary", "materials", "event", "operations", "village_work", "medical", "education", "other"];
const CAT_LABELS = {
  donation: "Donation", govt_grant: "Govt Grant", salary: "Salaries",
  materials: "Materials", event: "Events", operations: "Operations",
  village_work: "Village Work", medical: "Medical", education: "Education", other: "Other",
};
const CAT_COLORS = {
  donation: "#16a34a", govt_grant: "#0369a1", salary: "#9333ea",
  materials: "#ea580c", event: "#0891b2", operations: "#64748b",
  village_work: "#d97706", medical: "#dc2626", education: "#7c3aed", other: "#475569",
};

// ── Entry Form Modal ──────────────────────────────────────────────────────────
function EntryModal({ entry, ngos, onClose, onSaved }) {
  const isEdit = Boolean(entry);
  const [form, setForm] = useState(isEdit ? {
    ngoId: entry.ngoId?._id || entry.ngoId || "",
    type: entry.type || "debit",
    amount: entry.amount || "",
    category: entry.category || "other",
    description: entry.description || "",
    referenceId: entry.referenceId || "",
    date: entry.date ? new Date(entry.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    isPublic: entry.isPublic !== false,
  } : {
    ngoId: "", type: "debit", amount: "", category: "other",
    description: "", referenceId: "",
    date: new Date().toISOString().slice(0, 10),
    isPublic: true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) < 1) { setErr("Valid amount required"); return; }
    if (!form.description.trim()) { setErr("Description required"); return; }
    setSaving(true); setErr("");
    try {
      const url = isEdit
        ? `${API_BASE_URL}/api/fund-ledger/${entry._id}`
        : `${API_BASE_URL}/api/fund-ledger/admin/entries`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      onSaved(d.data.entry);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = { width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lbl = { display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: "600", color: "#374151" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, fontWeight: "800", color: "#0f172a", fontSize: "16px" }}>
            {isEdit ? "Edit Entry" : "Add Fund Entry"}
          </h3>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} color="#64748b" />
          </button>
        </div>

        <form onSubmit={submit} style={{ padding: "24px", display: "grid", gap: "14px" }}>
          {!isEdit && (
            <div>
              <label style={lbl}>NGO *</label>
              <select value={form.ngoId} onChange={e => set("ngoId", e.target.value)} style={inp} required>
                <option value="">— Select NGO —</option>
                {ngos.map(n => <option key={n._id} value={n._id}>{n.ngoName}</option>)}
              </select>
            </div>
          )}

          {/* Type toggle */}
          <div>
            <label style={lbl}>Entry Type *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {["credit", "debit"].map(t => (
                <button key={t} type="button" onClick={() => set("type", t)}
                  style={{ padding: "10px", borderRadius: "8px", border: `2px solid ${form.type === t ? (t === "credit" ? "#16a34a" : "#dc2626") : "#e2e8f0"}`, background: form.type === t ? (t === "credit" ? "#f0fdf4" : "#fef2f2") : "#fff", cursor: "pointer", fontWeight: "700", fontSize: "14px", color: form.type === t ? (t === "credit" ? "#16a34a" : "#dc2626") : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  {t === "credit" ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                  {t === "credit" ? "Credit (Income)" : "Debit (Expense)"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={lbl}>Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} style={inp} placeholder="0" min={1} required />
            </div>
            <div>
              <label style={lbl}>Date *</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inp} required />
            </div>
          </div>

          <div>
            <label style={lbl}>Category *</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} style={inp}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Description *</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} placeholder="What was this transaction for?" required />
          </div>

          <div>
            <label style={lbl}>Reference ID (optional)</label>
            <input value={form.referenceId} onChange={e => set("referenceId", e.target.value)} style={inp} placeholder="Invoice no., cheque no., order ID..." />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
            <input type="checkbox" checked={form.isPublic} onChange={e => set("isPublic", e.target.checked)} />
            Show on public transparency page
          </label>

          {err && <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626", fontSize: "13px" }}>{err}</div>}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: "9px 24px", borderRadius: "8px", border: "none", background: saving ? "#94a3b8" : form.type === "credit" ? "#16a34a" : "#dc2626", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "7px" }}>
              {saving ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</> : isEdit ? "Save Changes" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminFundLedger() {
  const [entries, setEntries] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [summary, setSummary] = useState({ totals: { credit: 0, debit: 0 }, byCategory: {} });

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 4000); };

  const load = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 25 });
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (catFilter !== "all") params.set("category", catFilter);

      const res = await fetch(`${API_BASE_URL}/api/fund-ledger/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token()}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) {
        setEntries(d.data.entries);
        setPagination(d.data.pagination);
      }
    } catch { showMsg("error", "Failed to load ledger"); }
    finally { setLoading(false); }
  };

  const loadSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/fund-ledger/public/summary`, { credentials: "include" });
      const d = await res.json();
      if (d.success) setSummary(d.data);
    } catch {}
  };

  const loadNgos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ngos?status=verified&limit=100`, {
        headers: { Authorization: `Bearer ${token()}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) setNgos(d.data?.ngos || d.data || []);
    } catch {}
  };

  useEffect(() => { load(1); setPage(1); }, [typeFilter, catFilter]);
  useEffect(() => { load(page); }, [page]);
  useEffect(() => { loadSummary(); loadNgos(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/fund-ledger/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` }, credentials: "include",
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      setEntries(e => e.filter(x => x._id !== id));
      loadSummary();
      showMsg("success", "Entry deleted");
    } catch (e) { showMsg("error", e.message); }
  };

  const handleSaved = (entry) => {
    setEntries(prev => {
      const exists = prev.find(e => e._id === entry._id);
      return exists ? prev.map(e => e._id === entry._id ? entry : e) : [entry, ...prev];
    });
    loadSummary();
    showMsg("success", modal?.entry ? "Entry updated!" : "Entry added!");
    setModal(null);
  };

  const balance = summary.totals.credit - summary.totals.debit;

  return (
    <div>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <h1 className="admin-page-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <IndianRupee size={22} /> Fund Ledger
        </h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => { load(page); loadSummary(); }} style={{ padding: "9px 14px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setModal({ mode: "create" })} style={{ padding: "9px 18px", background: "#16a34a", border: "none", borderRadius: "8px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700" }}>
            <Plus size={15} /> Add Entry
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "14px", marginBottom: "20px" }}>
        <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "16px", border: "1px solid #bbf7d0" }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Credit</p>
          <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#166534" }}>{fmtINR(summary.totals.credit)}</p>
        </div>
        <div style={{ background: "#fef2f2", borderRadius: "12px", padding: "16px", border: "1px solid #fecaca" }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#991b1b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Debit</p>
          <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#991b1b" }}>{fmtINR(summary.totals.debit)}</p>
        </div>
        <div style={{ background: balance >= 0 ? "#eff6ff" : "#fff7ed", borderRadius: "12px", padding: "16px", border: `1px solid ${balance >= 0 ? "#bfdbfe" : "#fed7aa"}` }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: balance >= 0 ? "#1e40af" : "#c2410c", textTransform: "uppercase", letterSpacing: "0.05em" }}>Balance</p>
          <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: balance >= 0 ? "#1e40af" : "#c2410c" }}>{fmtINR(balance)}</p>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0" }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Entries</p>
          <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>{pagination.total}</p>
        </div>
      </div>

      {/* Feedback */}
      {msg.text && (
        <div style={{ padding: "12px 16px", marginBottom: "16px", borderRadius: "8px", background: msg.type === "success" ? "#f0fdf4" : "#fef2f2", color: msg.type === "success" ? "#166534" : "#991b1b", fontWeight: "600", fontSize: "14px", border: `1px solid ${msg.type === "success" ? "#bbf7d0" : "#fecaca"}` }}>
          {msg.text}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "credit", "debit"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                background: typeFilter === t ? (t === "credit" ? "#16a34a" : t === "debit" ? "#dc2626" : "#2563eb") : "#fff",
                color: typeFilter === t ? "#fff" : "#374151",
                borderColor: typeFilter === t ? (t === "credit" ? "#16a34a" : t === "debit" ? "#dc2626" : "#2563eb") : "#e2e8f0",
              }}>
              {t === "all" ? "All" : t === "credit" ? "Credit" : "Debit"}
            </button>
          ))}
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", cursor: "pointer" }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "60px 0", color: "#64748b" }}>
            <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /> Loading…
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>No entries found.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Date", "NGO", "Type", "Category", "Description", "Amount", "Ref ID", "Public", ""].map(h => (
                  <th key={h} style={{ padding: "10px 12px", fontSize: "11px", fontWeight: "700", color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e._id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", transition: "background 0.15s" }}
                  onMouseEnter={ev => ev.currentTarget.style.background = "#f0f9ff"}
                  onMouseLeave={ev => ev.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa"}>
                  <td style={{ padding: "10px 12px", fontSize: "13px", color: "#374151", whiteSpace: "nowrap" }}>{fmtDate(e.date)}</td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", color: "#374151" }}>{e.ngoId?.ngoName || "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
                      background: e.type === "credit" ? "#dcfce7" : "#fee2e2",
                      color: e.type === "credit" ? "#166534" : "#991b1b",
                      display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      {e.type === "credit" ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {e.type}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600", background: CAT_COLORS[e.category] + "18", color: CAT_COLORS[e.category] }}>{CAT_LABELS[e.category]}</span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "13px", color: "#374151", maxWidth: "200px" }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{e.description}</span>
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: "700", fontSize: "14px", color: e.type === "credit" ? "#16a34a" : "#dc2626", whiteSpace: "nowrap" }}>
                    {e.type === "credit" ? "+" : "−"}{fmtINR(e.amount)}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "12px", color: "#64748b" }}>{e.referenceId || "—"}</td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    {e.isPublic ? <Eye size={14} color="#16a34a" /> : <EyeOff size={14} color="#94a3b8" />}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button onClick={() => setModal({ mode: "edit", entry: e })} style={{ padding: "5px 8px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", cursor: "pointer", color: "#1d4ed8" }}>
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(e._id)} style={{ padding: "5px 8px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", color: "#dc2626" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", marginTop: "20px" }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "7px 16px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1, fontWeight: "600", fontSize: "13px" }}>← Prev</button>
          <span style={{ fontSize: "13px", color: "#64748b" }}>Page {page} of {pagination.pages} ({pagination.total} entries)</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} style={{ padding: "7px 16px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#fff", cursor: page >= pagination.pages ? "not-allowed" : "pointer", opacity: page >= pagination.pages ? 0.5 : 1, fontWeight: "600", fontSize: "13px" }}>Next →</button>
        </div>
      )}

      {/* Modals */}
      {modal && (
        <EntryModal
          entry={modal.entry}
          ngos={ngos}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
