import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle, CheckCircle, Clock, Loader2, ChevronDown,
  MapPin, User, TrendingUp, ArrowUpRight, X, Calendar,
  Tag, Flag, FileText, ThumbsUp, CheckSquare
} from "lucide-react";
import { API_BASE_URL } from "./NgoLayout.jsx";

const STATUS_META = {
  pending:     { label: "Pending",     bg: "#fef9c3", color: "#854d0e", Icon: Clock },
  in_progress: { label: "In Progress", bg: "#dbeafe", color: "#1e40af", Icon: TrendingUp },
  solved:      { label: "Solved",      bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
};

const PRIORITY_COLORS = {
  low:      { bg: "#f1f5f9", color: "#475569" },
  medium:   { bg: "#fffbeb", color: "#92400e" },
  high:     { bg: "#fef2f2", color: "#991b1b" },
  critical: { bg: "#fee2e2", color: "#7f1d1d" },
};

const CATEGORIES = ["all","water","sanitation","education","health","road","employment","electricity","other"];

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "—";

// ── Detail modal ──────────────────────────────────────────────────────────────
function ProblemDetailModal({ problem, onClose, onStatusChanged }) {
  const [resolveNote, setResolveNote] = useState(problem.resolvedNote || "");
  const [newStatus, setNewStatus]     = useState(problem.status);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const token = localStorage.getItem("token");

  const sm  = STATUS_META[problem.status] || STATUS_META.pending;
  const pc  = PRIORITY_COLORS[problem.priority] || PRIORITY_COLORS.medium;

  const handleStatusSave = () => {
    if (newStatus === problem.status && resolveNote === (problem.resolvedNote || "")) return;
    setSaving(true);
    fetch(`${API_BASE_URL}/api/villages/problems/${problem._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ status: newStatus, resolvedNote: resolveNote }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          onStatusChanged(problem._id, newStatus, resolveNote);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  // close on backdrop click
  const onBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div
      onClick={onBackdrop}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
    >
      <div style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>

        {/* Header bar */}
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: "0 0 6px", fontWeight: "800", fontSize: "17px", color: "#0f172a", lineHeight: 1.3 }}>{problem.title}</h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ background: sm.bg, color: sm.color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <sm.Icon size={10} /> {sm.label}
              </span>
              <span style={{ background: pc.bg, color: pc.color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textTransform: "capitalize" }}>
                {problem.priority} priority
              </span>
              <span style={{ background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", textTransform: "capitalize", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Tag size={10} /> {problem.category}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <X size={15} color="#64748b" />
          </button>
        </div>

        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Description */}
          {problem.description && (
            <div>
              <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "5px" }}>
                <FileText size={12} /> Description
              </p>
              <p style={{ margin: 0, fontSize: "14px", color: "#374151", lineHeight: 1.7, background: "#f8fafc", borderRadius: "10px", padding: "12px 14px" }}>
                {problem.description}
              </p>
            </div>
          )}

          {/* Meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 14px" }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Village</p>
              {problem.villageId ? (
                <Link
                  to={`/villages/${problem.villageId._id}`}
                  target="_blank"
                  style={{ display: "flex", alignItems: "center", gap: "5px", color: "#2563eb", fontSize: "13px", fontWeight: "700", textDecoration: "none" }}
                >
                  <MapPin size={12} /> {problem.villageId.villageName}
                  <ArrowUpRight size={11} />
                </Link>
              ) : <span style={{ fontSize: "13px", color: "#64748b" }}>—</span>}
              {problem.villageId?.district && (
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{problem.villageId.district}, {problem.villageId.state}</p>
              )}
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 14px" }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Reported By</p>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "5px" }}>
                <User size={12} /> {problem.submittedBy?.name || problem.submittedByName || "Anonymous"}
              </p>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 14px" }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Reported On</p>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#374151", display: "flex", alignItems: "center", gap: "5px" }}>
                <Calendar size={12} /> {fmtDate(problem.createdAt)}
              </p>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 14px" }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Upvotes</p>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#374151", display: "flex", alignItems: "center", gap: "5px" }}>
                <ThumbsUp size={12} /> {problem.upvotes?.length || 0} people
              </p>
            </div>
          </div>

          {/* Resolution info (if already solved) */}
          {problem.status === "solved" && problem.resolvedAt && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 14px" }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "5px" }}>
                <CheckSquare size={12} /> Resolved on {fmtDate(problem.resolvedAt)}
              </p>
              {problem.resolvedNote && (
                <p style={{ margin: 0, fontSize: "13px", color: "#15803d", lineHeight: 1.6 }}>{problem.resolvedNote}</p>
              )}
            </div>
          )}

          {/* ── Update status ── */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
              <Flag size={13} /> Update Status
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
              {["pending", "in_progress", "solved"].map(s => {
                const m = STATUS_META[s];
                const active = newStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    style={{ padding: "7px 16px", borderRadius: "8px", border: `2px solid ${active ? m.color : "#e2e8f0"}`, background: active ? m.bg : "#fff", color: active ? m.color : "#374151", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.15s" }}
                  >
                    <m.Icon size={12} /> {m.label}
                  </button>
                );
              })}
            </div>

            {newStatus === "solved" && (
              <textarea
                rows={2}
                value={resolveNote}
                onChange={e => setResolveNote(e.target.value)}
                placeholder="Resolution note (optional) — describe how it was resolved…"
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", marginBottom: "10px" }}
              />
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
                Close
              </button>
              <button
                onClick={handleStatusSave}
                disabled={saving || (newStatus === problem.status && resolveNote === (problem.resolvedNote || ""))}
                style={{ padding: "9px 22px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", fontSize: "13px", cursor: "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", gap: "6px" }}
              >
                {saving ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving…</> : saved ? "✓ Saved" : "Save Changes"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Status inline select (table) ──────────────────────────────────────────────
function StatusSelect({ value, onChange }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onClick={e => e.stopPropagation()}
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NgoProblems() {
  const [problems, setProblems]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [statusFilter, setStatusFilter]     = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [detailProblem, setDetailProblem]   = useState(null); // problem for detail modal
  const [resolveModal, setResolveModal]     = useState(null); // quick status change from table
  const [resolveNote, setResolveNote]       = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");

  const token = localStorage.getItem("token");

  const load = (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 25 });
    if (statusFilter !== "all")   params.set("status",   statusFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);

    fetch(`${API_BASE_URL}/api/villages/ngo/problems?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setProblems(d.data.problems); setPagination(d.data.pagination); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(1); }, [statusFilter, categoryFilter, priorityFilter]);
  useEffect(() => { load(page); }, [page]);

  // called by both the detail modal and the quick-change flow
  const applyStatusChange = (id, status, note) => {
    setProblems(ps => ps.map(p =>
      p._id === id ? { ...p, status, resolvedNote: note, resolvedAt: status === "solved" ? new Date().toISOString() : p.resolvedAt } : p
    ));
    // keep detail modal in sync
    if (detailProblem?._id === id) {
      setDetailProblem(prev => ({ ...prev, status, resolvedNote: note, resolvedAt: status === "solved" ? new Date().toISOString() : prev.resolvedAt }));
    }
    setMsg("Status updated successfully");
    setTimeout(() => setMsg(""), 3000);
  };

  const openQuickStatus = (problem, newStatus) => {
    setResolveNote("");
    setResolveModal({ problem, newStatus });
  };

  const confirmQuickStatus = () => {
    if (!resolveModal) return;
    setSaving(true);
    fetch(`${API_BASE_URL}/api/villages/problems/${resolveModal.problem._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ status: resolveModal.newStatus, resolvedNote: resolveNote }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          applyStatusChange(resolveModal.problem._id, resolveModal.newStatus, resolveNote);
          setResolveModal(null);
        }
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  const inp = { appearance: "none", padding: "7px 28px 7px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", background: "#fff", cursor: "pointer", color: "#374151" };

  return (
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Village Problems</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          {pagination.total} problem{pagination.total !== 1 ? "s" : ""} reported across your adopted villages · click a row to see full details
        </p>
      </div>

      {msg && (
        <div style={{ padding: "10px 14px", marginBottom: "16px", borderRadius: "8px", background: "#f0fdf4", color: "#166534", fontWeight: "600", fontSize: "14px", border: "1px solid #bbf7d0" }}>
          {msg}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["all", "pending", "in_progress", "solved"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: "600",
                background: statusFilter === s ? "#0f172a" : "#fff",
                color:      statusFilter === s ? "#fff"    : "#374151",
                borderColor: statusFilter === s ? "#0f172a" : "#e2e8f0",
              }}>
              {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ position: "relative" }}>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={inp}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
        </div>

        <div style={{ position: "relative" }}>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={inp}>
            {["all", "low", "medium", "high", "critical"].map(p => <option key={p} value={p}>{p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
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
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", background: "#fff", borderRadius: "14px", border: "1px dashed #e2e8f0" }}>
          <AlertTriangle size={40} style={{ marginBottom: "12px", color: "#cbd5e1" }} />
          <p style={{ fontSize: "15px", margin: 0 }}>No problems found for the selected filters.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "680px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Problem", "Village", "Category", "Priority", "Status", "Reported By", "Update Status"].map(h => (
                    <th key={h} style={{ padding: "11px 14px", fontSize: "11px", fontWeight: "700", color: "#64748b", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {problems.map(p => {
                  const sm = STATUS_META[p.status] || STATUS_META.pending;
                  const pc = PRIORITY_COLORS[p.priority] || PRIORITY_COLORS.medium;
                  return (
                    <tr
                      key={p._id}
                      onClick={() => setDetailProblem(p)}
                      style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                    >
                      <td style={{ padding: "12px 14px", maxWidth: "220px" }}>
                        <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "13px", color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                        {p.description && <p style={{ margin: 0, fontSize: "11px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</p>}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {p.villageId ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#374151", fontSize: "12px", fontWeight: "600" }}>
                            <MapPin size={11} color="#2563eb" /> {p.villageId.villageName}
                          </span>
                        ) : "—"}
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
                        <span style={{ background: sm.bg, color: sm.color, padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <sm.Icon size={10} /> {sm.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                          <User size={11} /> {p.submittedBy?.name || p.submittedByName || "Anonymous"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <StatusSelect value={p.status} onChange={v => openQuickStatus(p, v)} />
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

      {/* ── Detail modal ── */}
      {detailProblem && (
        <ProblemDetailModal
          problem={detailProblem}
          onClose={() => setDetailProblem(null)}
          onStatusChanged={(id, status, note) => {
            applyStatusChange(id, status, note);
          }}
        />
      )}

      {/* ── Quick status change confirm (from table dropdown) ── */}
      {resolveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "420px" }}>
            <h3 style={{ margin: "0 0 8px", fontWeight: "800", fontSize: "17px", color: "#0f172a" }}>
              Change Status → {resolveModal.newStatus === "in_progress" ? "In Progress" : resolveModal.newStatus.charAt(0).toUpperCase() + resolveModal.newStatus.slice(1)}
            </h3>
            <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "13px" }}>Problem: <strong>{resolveModal.problem.title}</strong></p>
            {resolveModal.newStatus === "solved" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Resolution Note (optional)</label>
                <textarea rows={3} value={resolveNote} onChange={e => setResolveNote(e.target.value)}
                  placeholder="Describe how the problem was resolved…"
                  style={{ width: "100%", padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setResolveModal(null)} style={{ padding: "9px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmQuickStatus} disabled={saving}
                style={{ padding: "9px 18px", borderRadius: "8px", border: "none", background: "#0f172a", color: "#fff", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
