import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, Loader2, ChevronDown, MapPin, Building2, User, Trash2, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "./AdminLayout.jsx";

const STATUS_META = {
  pending:     { label: "Pending",     bg: "#fef9c3", color: "#854d0e", Icon: Clock },
  in_progress: { label: "In Progress", bg: "#dbeafe", color: "#1e40af", Icon: AlertTriangle },
  solved:      { label: "Solved",      bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
};

const PRIORITY_COLORS = {
  low:      { bg: "#f1f5f9", color: "#475569" },
  medium:   { bg: "#fffbeb", color: "#92400e" },
  high:     { bg: "#fef2f2", color: "#991b1b" },
  critical: { bg: "#fee2e2", color: "#7f1d1d" },
};

const CATEGORIES = ["all","water","sanitation","education","health","road","employment","electricity","other"];

function StatusSelect({ value, onChange }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ appearance: "none", padding: "5px 28px 5px 10px", borderRadius: "7px", border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: "600", background: "#fff", cursor: "pointer", color: "#374151" }}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="solved">Solved</option>
      </select>
      <ChevronDown size={12} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
    </div>
  );
}

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [resolveModal, setResolveModal] = useState(null); // { problem, newStatus }
  const [resolveNote, setResolveNote] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 25 });
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);

    fetch(`${API_BASE_URL}/api/villages/admin/problems?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProblems(d.data.problems);
          setPagination(d.data.pagination);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(1); }, [statusFilter, categoryFilter, priorityFilter]);
  useEffect(() => { load(page); }, [page]);

  const openStatusChange = (problem, newStatus) => {
    setResolveNote("");
    setResolveModal({ problem, newStatus });
  };

  const confirmStatusChange = () => {
    if (!resolveModal) return;
    setSaving(true);
    fetch(`${API_BASE_URL}/api/villages/problems/${resolveModal.problem._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: resolveModal.newStatus, resolvedNote: resolveNote }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProblems(ps => ps.map(p => p._id === resolveModal.problem._id ? { ...p, status: resolveModal.newStatus } : p));
          setResolveModal(null);
        }
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  const deleteProblem = (id) => {
    if (!confirm("Delete this problem report?")) return;
    fetch(`${API_BASE_URL}/api/villages/problems/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setProblems(ps => ps.filter(p => p._id !== id)); })
      .catch(() => {});
  };

  return (
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Community Problems</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          {pagination.total} problem{pagination.total !== 1 ? "s" : ""} reported across all villages
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        {/* Status */}
        <div style={{ display: "flex", gap: "6px" }}>
          {["all","pending","in_progress","solved"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: "600",
                background: statusFilter === s ? "#0f172a" : "#fff",
                color: statusFilter === s ? "#fff" : "#374151",
                borderColor: statusFilter === s ? "#0f172a" : "#e2e8f0",
              }}>
              {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Category select */}
        <div style={{ position: "relative" }}>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            style={{ appearance: "none", padding: "7px 28px 7px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", background: "#fff", cursor: "pointer", color: "#374151" }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
        </div>

        {/* Priority select */}
        <div style={{ position: "relative" }}>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            style={{ appearance: "none", padding: "7px 28px 7px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", background: "#fff", cursor: "pointer", color: "#374151" }}>
            {["all","low","medium","high","critical"].map(p => <option key={p} value={p}>{p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px", gap: "10px", color: "#64748b" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Loading…
        </div>
      ) : problems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <AlertTriangle size={40} style={{ marginBottom: "12px", color: "#cbd5e1" }} />
          <p style={{ fontSize: "15px" }}>No problems found for the selected filters.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Problem", "Village", "NGO", "Category", "Priority", "Status", "Reported By", "Actions"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {problems.map(p => {
                  const sm = STATUS_META[p.status] || STATUS_META.pending;
                  const pc = PRIORITY_COLORS[p.priority] || PRIORITY_COLORS.medium;
                  return (
                    <tr key={p._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", maxWidth: "220px" }}>
                        <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "13px", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                        {p.description && <p style={{ margin: 0, fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</p>}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {p.villageId ? (
                          <Link to={`/villages/${p.villageId._id}`} target="_blank"
                            style={{ display: "flex", alignItems: "center", gap: "4px", color: "#2563eb", fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>
                            <MapPin size={11} /> {p.villageId.villageName}
                            <ArrowUpRight size={11} />
                          </Link>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Building2 size={11} /> {p.ngoId?.ngoName || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600", textTransform: "capitalize" }}>
                          {p.category}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: pc.bg, color: pc.color, padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "700", textTransform: "capitalize" }}>
                          {p.priority}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <StatusSelect value={p.status} onChange={v => openStatusChange(p, v)} />
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                          <User size={11} /> {p.submittedBy?.name || p.submittedByName || "Anonymous"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <button onClick={() => deleteProblem(p._id)}
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

      {/* Status Change Confirm Modal */}
      {resolveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px" }}>
            <h3 style={{ margin: "0 0 8px", fontWeight: "800", fontSize: "17px", color: "#0f172a" }}>
              Change Status → {resolveModal.newStatus === "in_progress" ? "In Progress" : resolveModal.newStatus.charAt(0).toUpperCase() + resolveModal.newStatus.slice(1)}
            </h3>
            <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "13px" }}>Problem: <strong>{resolveModal.problem.title}</strong></p>
            {resolveModal.newStatus === "solved" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Resolution Note (optional)</label>
                <textarea
                  rows={3}
                  value={resolveNote}
                  onChange={e => setResolveNote(e.target.value)}
                  placeholder="Describe how the problem was resolved…"
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setResolveModal(null)} style={{ padding: "9px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmStatusChange} disabled={saving}
                style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: "#0f172a", color: "#fff", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
