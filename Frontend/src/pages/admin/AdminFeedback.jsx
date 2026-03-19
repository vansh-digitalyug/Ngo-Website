import { useState, useEffect, useCallback } from "react";
import { Star, Eye, Trash2, Send, X, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

// ── Helpers ──────────────────────────────────────────────────────────────────
const token = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

const fmt = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const TYPE_META = {
  platform:  { label: "Platform",   bg: "#eef2ff", color: "#6366f1" },
  ngo:       { label: "NGO",        bg: "#f0f9ff", color: "#0ea5e9" },
  volunteer: { label: "Volunteer",  bg: "#f0fdf4", color: "#10b981" },
  event:     { label: "Event",      bg: "#fffbeb", color: "#f59e0b" },
  community: { label: "Community",  bg: "#f5f3ff", color: "#8b5cf6" },
  service:   { label: "Service",    bg: "#fef2f2", color: "#ef4444" },
  other:     { label: "Other",      bg: "#f9fafb", color: "#6b7280" },
};

const STATUS_META = {
  new:          { label: "New",          bg: "#fef2f2", color: "#dc2626" },
  read:         { label: "Read",         bg: "#eff6ff", color: "#2563eb" },
  acknowledged: { label: "Acknowledged", bg: "#fffbeb", color: "#d97706" },
  resolved:     { label: "Resolved",     bg: "#f0fdf4", color: "#16a34a" },
};

function Badge({ meta, value }) {
  const m = meta[value] || { label: value, bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ background: m.bg, color: m.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

function Stars({ rating, size = 13 }) {
  if (!rating) return <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} fill={s <= rating ? "#f59e0b" : "none"} stroke={s <= rating ? "#f59e0b" : "#d1d5db"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, bg }) {
  return (
    <div style={{ background: bg, border: `1.5px solid ${color}30`, borderRadius: 14, padding: "16px 20px", minWidth: 110, flex: 1 }}>
      <p style={{ fontSize: 26, fontWeight: 800, color, margin: 0, lineHeight: 1 }}>{value ?? "—"}</p>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "4px 0 0" }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{sub}</p>}
    </div>
  );
}

// ── View / Reply Modal ────────────────────────────────────────────────────────
function FeedbackModal({ item, onClose, onStatusUpdate, onReply, onDelete }) {
  const [reply, setReply]       = useState("");
  const [status, setStatus]     = useState(item.status);
  const [note, setNote]         = useState(item.adminNote || "");
  const [saving, setSaving]     = useState(false);
  const [replying, setReplying] = useState(false);
  const [flash, setFlash]       = useState("");

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 3000); };

  const handleStatusSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${item._id}/status`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ status, adminNote: note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onStatusUpdate(item._id, status, note);
      showFlash("Status updated successfully.");
    } catch (e) { showFlash(`Error: ${e.message}`); }
    finally { setSaving(false); }
  };

  const handleReply = async () => {
    if (reply.trim().length < 5) { showFlash("Reply must be at least 5 characters."); return; }
    setReplying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${item._id}/reply`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ adminReply: reply.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onReply(item._id);
      showFlash("Reply sent and marked as resolved.");
      setReply("");
    } catch (e) { showFlash(`Error: ${e.message}`); }
    finally { setReplying(false); }
  };

  const type = TYPE_META[item.feedbackType] || TYPE_META.other;
  const stat = STATUS_META[item.status]     || STATUS_META.new;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", padding: "20px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Feedback Detail</p>
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 800, margin: "4px 0 0", lineHeight: 1.3 }}>{item.subject}</h3>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>

          {/* Flash */}
          {flash && (
            <div style={{ background: flash.startsWith("Error") ? "#fef2f2" : "#f0fdf4", border: `1px solid ${flash.startsWith("Error") ? "#fca5a5" : "#86efac"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: flash.startsWith("Error") ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
              {flash}
            </div>
          )}

          {/* Submitter info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              ["Name", item.name],
              ["Email", item.email],
              ["Phone", item.phone || "—"],
              ["Submitted", fmt(item.createdAt)],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, margin: 0 }}>{k}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "3px 0 0", wordBreak: "break-all" }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Type / Status / Rating row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            <span style={{ background: type.bg, color: type.color, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{type.label}</span>
            <span style={{ background: stat.bg, color: stat.color, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{stat.label}</span>
            {item.targetName && (
              <span style={{ background: "#f3f4f6", color: "#374151", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>📌 {item.targetName}</span>
            )}
            {item.rating && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, background: "#fffbeb", color: "#d97706", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                <Star size={12} fill="#f59e0b" stroke="#f59e0b" /> {item.rating}/5
              </span>
            )}
          </div>

          {/* Message */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px", marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 8px" }}>Message</p>
            <p style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{item.message}</p>
          </div>

          {/* Admin note if exists */}
          {item.adminNote && (
            <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>Admin Note</p>
              <p style={{ fontSize: 13, color: "#78350f", margin: 0 }}>{item.adminNote}</p>
            </div>
          )}

          {/* Admin reply if exists */}
          {item.adminReply && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>Reply Sent • {fmt(item.repliedAt)}</p>
              <p style={{ fontSize: 13, color: "#14532d", margin: 0 }}>{item.adminReply}</p>
            </div>
          )}

          {/* ── Update Status ── */}
          <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "16px", marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.6 }}>Update Status</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {Object.entries(STATUS_META).map(([v, m]) => (
                <button
                  key={v}
                  onClick={() => setStatus(v)}
                  style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1.5px solid ${status === v ? m.color : "#e5e7eb"}`, background: status === v ? m.bg : "#fff", color: status === v ? m.color : "#9ca3af", fontWeight: 700, fontSize: 11, cursor: "pointer", transition: "all 0.15s" }}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Add an internal admin note (optional)..."
              style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 10 }}
            />
            <button
              onClick={handleStatusSave}
              disabled={saving}
              style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, width: "100%" }}
            >
              {saving ? "Saving…" : "Save Status"}
            </button>
          </div>

          {/* ── Reply ── */}
          {!item.adminReply && (
            <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "16px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.6 }}>Send Reply</p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Write your reply to the user... (min 5 characters)"
                style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", fontSize: 13, resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 10 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: reply.length < 5 && reply.length > 0 ? "#ef4444" : "#9ca3af" }}>
                  {reply.length < 5 && reply.length > 0 ? `${5 - reply.length} more needed` : `${reply.length} chars`}
                </span>
                <button
                  onClick={handleReply}
                  disabled={replying || reply.trim().length < 5}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: replying || reply.trim().length < 5 ? "not-allowed" : "pointer", opacity: replying || reply.trim().length < 5 ? 0.5 : 1 }}
                >
                  <Send size={14} /> {replying ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </div>
          )}

          {/* Delete */}
          <button
            onClick={() => { if (window.confirm("Permanently delete this feedback?")) onDelete(item._id); }}
            style={{ width: "100%", background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <Trash2 size={14} /> Delete This Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminFeedback() {
  const [feedbacks, setFeedbacks]   = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [typeFilter, setType]       = useState("");
  const [ratingFilter, setRating]   = useState("");

  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);

  const [selected, setSelected]     = useState(null);
  const [flash, setFlash]           = useState("");

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(""), 4000); };

  // ── Fetch Stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/stats`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch { /* silent */ }
    finally { setStatsLoading(false); }
  }, []);

  // ── Fetch List ───────────────────────────────────────────────────────────
  const fetchFeedbacks = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 12 });
      if (search)       params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter)   params.set("feedbackType", typeFilter);
      if (ratingFilter) params.set("rating", ratingFilter);

      const res  = await fetch(`${API_BASE_URL}/api/admin/feedback?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data.feedbacks || []);
        const p = data.data.pagination;
        setTotal(p?.total || 0);
        setTotalPages(Math.ceil((p?.total || 0) / 12) || 1);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [search, statusFilter, typeFilter, ratingFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); fetchFeedbacks(1); }, [search, statusFilter, typeFilter, ratingFilter]);
  useEffect(() => { fetchFeedbacks(page); }, [page]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleView = async (id) => {
    try {
      const res  = await fetch(`${API_BASE_URL}/api/admin/feedback/${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setSelected(data.data.feedback);
        // Update status in list (new → read)
        setFeedbacks((prev) => prev.map((f) => f._id === id && f.status === "new" ? { ...f, status: "read" } : f));
      }
    } catch { /* silent */ }
  };

  const handleStatusUpdate = (id, status, adminNote) => {
    setFeedbacks((prev) => prev.map((f) => f._id === id ? { ...f, status, adminNote } : f));
    if (selected?._id === id) setSelected((s) => ({ ...s, status, adminNote }));
    fetchStats();
  };

  const handleReply = (id) => {
    setFeedbacks((prev) => prev.map((f) => f._id === id ? { ...f, status: "resolved" } : f));
    if (selected?._id === id) setSelected((s) => ({ ...s, status: "resolved" }));
    setSelected(null);
    showFlash("Reply sent successfully.");
    fetchStats();
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      setSelected(null);
      showFlash("Feedback deleted.");
      fetchStats();
    } catch (e) { showFlash(`Error: ${e.message}`); }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px", fontFamily: "system-ui, -apple-system, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

      {/* Page Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>Feedback</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Manage and respond to user feedback</p>
        </div>
        <button
          onClick={() => { fetchFeedbacks(page); fetchStats(); }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", color: "#374151" }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Flash */}
      {flash && (
        <div style={{ background: flash.startsWith("Error") ? "#fef2f2" : "#f0fdf4", border: `1px solid ${flash.startsWith("Error") ? "#fca5a5" : "#86efac"}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: flash.startsWith("Error") ? "#dc2626" : "#16a34a", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {flash}
          <button onClick={() => setFlash("")} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.6 }}><X size={14} /></button>
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Total"        value={statsLoading ? "…" : stats?.total}                 color="#6366f1" bg="#eef2ff" />
        <StatCard label="New / Unread" value={statsLoading ? "…" : stats?.unread}                color="#dc2626" bg="#fef2f2" sub="Needs attention" />
        <StatCard label="Acknowledged" value={statsLoading ? "…" : stats?.byStatus?.acknowledged} color="#d97706" bg="#fffbeb" />
        <StatCard label="Resolved"     value={statsLoading ? "…" : stats?.byStatus?.resolved}     color="#16a34a" bg="#f0fdf4" />
        <StatCard
          label="Avg Rating"
          value={statsLoading ? "…" : stats?.ratings?.average ? `${stats.ratings.average}/5` : "—"}
          color="#f59e0b" bg="#fffbeb"
          sub={stats?.ratings?.total ? `from ${stats.ratings.total} ratings` : ""}
        />
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search by name, email, subject..."
          style={{ flex: 2, minWidth: 200, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 14px", fontSize: 13, outline: "none" }}
        />
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)}
          style={{ flex: 1, minWidth: 130, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setType(e.target.value)}
          style={{ flex: 1, minWidth: 130, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="">All Types</option>
          {Object.entries(TYPE_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </select>
        <select value={ratingFilter} onChange={(e) => setRating(e.target.value)}
          style={{ flex: 1, minWidth: 110, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{"★".repeat(r)} ({r})</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            Feedback Submissions <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>({total} total)</span>
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 10px", display: "block" }} />
            <p style={{ margin: 0, fontSize: 14 }}>Loading feedback…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : feedbacks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <p style={{ fontSize: 15, margin: 0 }}>No feedback found</p>
            <p style={{ fontSize: 13, margin: "6px 0 0" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Submitter", "Type", "Subject", "Rating", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.6, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((f, i) => (
                  <tr
                    key={f._id}
                    style={{ background: f.status === "new" ? "#fef7f7" : i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f0f9ff"}
                    onMouseLeave={(e) => e.currentTarget.style.background = f.status === "new" ? "#fef7f7" : i % 2 === 0 ? "#fff" : "#fafafa"}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: 13 }}>{f.name}</p>
                      <p style={{ color: "#94a3b8", margin: "2px 0 0", fontSize: 11 }}>{f.email}</p>
                    </td>
                    <td style={{ padding: "12px 16px" }}><Badge meta={TYPE_META} value={f.feedbackType} /></td>
                    <td style={{ padding: "12px 16px", maxWidth: 200 }}>
                      <p style={{ margin: 0, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 190 }}>{f.subject}</p>
                      {f.targetName && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>📌 {f.targetName}</p>}
                    </td>
                    <td style={{ padding: "12px 16px" }}><Stars rating={f.rating} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge meta={STATUS_META} value={f.status} />
                      {f.adminReply && <p style={{ fontSize: 10, color: "#16a34a", margin: "3px 0 0", fontWeight: 600 }}>✓ Replied</p>}
                    </td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap", color: "#64748b", fontSize: 12 }}>{fmt(f.createdAt)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleView(f._id)}
                          title="View & Reply"
                          style={{ display: "flex", alignItems: "center", gap: 4, background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 8, padding: "6px 10px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => { if (window.confirm("Delete this feedback permanently?")) handleDelete(f._id); }}
                          title="Delete"
                          style={{ display: "flex", alignItems: "center", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Page {page} of {totalPages} ({total} records)
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                style={{ display: "flex", alignItems: "center", gap: 4, background: page === 1 ? "#f1f5f9" : "#fff", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#cbd5e1" : "#374151" }}>
                <ChevronLeft size={14} /> Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    style={{ background: page === pg ? "#6366f1" : "#fff", color: page === pg ? "#fff" : "#374151", border: `1.5px solid ${page === pg ? "#6366f1" : "#e5e7eb"}`, borderRadius: 8, padding: "7px 13px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ display: "flex", alignItems: "center", gap: 4, background: page === totalPages ? "#f1f5f9" : "#fff", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "#cbd5e1" : "#374151" }}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <FeedbackModal
          item={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={handleStatusUpdate}
          onReply={handleReply}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
