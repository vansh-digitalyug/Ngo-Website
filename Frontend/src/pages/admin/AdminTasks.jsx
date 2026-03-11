import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, IndianRupee, User, UserCheck, Trash2,
  Eye, X, CheckCircle, Clock, Play, AlertCircle, RefreshCw
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const token = () => localStorage.getItem("token");
const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_META = {
  assigned:    { label: "Assigned",    bg: "#dbeafe", color: "#1e40af", Icon: Clock },
  in_progress: { label: "In Progress", bg: "#fef9c3", color: "#854d0e", Icon: Play },
  completed:   { label: "Completed",   bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, bg: "#f1f5f9", color: "#475569", Icon: AlertCircle };
  return (
    <span style={{ background: m.bg, color: m.color, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
      <m.Icon size={11} /> {m.label}
    </span>
  );
}

function MediaLightbox({ task, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <X size={22} />
      </button>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        {task.mediaType === "video"
          ? <video src={task.mediaUrl} controls autoPlay style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "10px", background: "#000" }} />
          : <img src={task.mediaUrl} alt={task.title} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "10px" }} />
        }
        <p style={{ color: "#fff", margin: 0, fontWeight: "600" }}>{task.title}</p>
        {task.volunteerNote && <p style={{ color: "#94a3b8", margin: 0, fontSize: "13px" }}>Note: {task.volunteerNote}</p>}
      </div>
    </div>
  );
}

export default function AdminTasks() {
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [taskFilter, setTaskFilter] = useState("all");
  const [previewTask, setPreviewTask] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 4000); };

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/all`, {
        headers: { Authorization: `Bearer ${token()}` }, credentials: "include"
      });
      const d = await res.json();
      if (d.success) setTasks(d.data || []);
    } catch { showMsg("error", "Failed to load tasks"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
        credentials: "include"
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      setTasks(p => p.filter(t => t._id !== id));
      showMsg("success", "Task deleted");
    } catch (e) { showMsg("error", e.message); }
  };

  const filteredTasks = taskFilter === "all" ? tasks : tasks.filter(t => t.status === taskFilter);

  const S = {
    badge: (color, bg) => ({ background: bg, color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }),
    btn: (c) => ({ padding: "7px 14px", background: c, color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "5px" }),
  };

  // Count by status
  const counts = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});

  return (
    <div>
      <h1 className="admin-page-title">Tasks</h1>

      {/* Summary badges */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
        {[
          { label: "Total",       value: tasks.length,              bg: "#f1f5f9", color: "#334155" },
          { label: "Assigned",    value: counts.assigned    || 0,   bg: "#dbeafe", color: "#1e40af" },
          { label: "In Progress", value: counts.in_progress || 0,   bg: "#fef9c3", color: "#854d0e" },
          { label: "Completed",   value: counts.completed   || 0,   bg: "#dcfce7", color: "#166534" },
        ].map(({ label, value, bg, color }) => (
          <div key={label} style={{ padding: "10px 20px", borderRadius: "8px", background: bg, color, fontWeight: "600", fontSize: "14px" }}>
            {label}: {value}
          </div>
        ))}
      </div>

      {msg.text && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", background: msg.type === "success" ? "#dcfce7" : "#fee2e2", color: msg.type === "success" ? "#166534" : "#991b1b", fontWeight: "600", fontSize: "14px" }}>
          {msg.text}
        </div>
      )}

      {/* Filter pills */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["all", "assigned", "in_progress", "completed"].map(f => (
          <button key={f} onClick={() => setTaskFilter(f)}
            style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: "600",
              background: taskFilter === f ? "#1e40af" : "#fff",
              color:      taskFilter === f ? "#fff"    : "#374151",
              borderColor: taskFilter === f ? "#1e40af" : "#e2e8f0" }}>
            {f === "all" ? `All (${tasks.length})` : `${STATUS_META[f]?.label} (${counts[f] || 0})`}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">
            <RefreshCw size={22} style={{ animation: "spin 1s linear infinite", marginRight: "8px" }} />
            Loading tasks…
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="admin-empty-state">
            <ClipboardList size={32} style={{ marginBottom: "12px", opacity: 0.4 }} />
            <p style={{ margin: 0 }}>No tasks found.</p>
          </div>
        ) : filteredTasks.map(t => (
          <div key={t._id} style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderLeft: `4px solid ${t.status === "completed" ? "#22c55e" : t.status === "in_progress" ? "#eab308" : "#3b82f6"}`,
            borderRadius: "12px", padding: "16px", marginBottom: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>{t.title}</span>
                  <StatusBadge status={t.status} />
                  {t.addedToGallery && <span style={S.badge("#166534", "#dcfce7")}>Added to Gallery</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "4px 16px", fontSize: "13px", color: "#64748b" }}>
                  <span><IndianRupee size={12} style={{ verticalAlign: "middle" }} /> {fmt(t.donationAmount)} · {t.serviceTitle || "General"}</span>
                  <span><User size={12} style={{ verticalAlign: "middle" }} /> Donor: {t.donorName || t.donorEmail || "Anonymous"}</span>
                  <span><UserCheck size={12} style={{ verticalAlign: "middle" }} /> Volunteer: {t.volunteerName || "—"}</span>
                  <span>Created: {fmtDate(t.createdAt)}</span>
                  {t.completedAt && <span>Completed: {fmtDate(t.completedAt)}</span>}
                </div>
                {t.description && <p style={{ margin: "8px 0 0", color: "#374151", fontSize: "13px" }}>{t.description}</p>}
                {t.adminNote && <p style={{ margin: "6px 0 0", color: "#0369a1", fontSize: "12px", background: "#f0f9ff", padding: "4px 8px", borderRadius: "4px" }}>📋 {t.adminNote}</p>}
                {t.volunteerNote && <p style={{ margin: "6px 0 0", color: "#166534", fontSize: "12px", background: "#f0fdf4", padding: "4px 8px", borderRadius: "4px" }}>✅ Volunteer note: {t.volunteerNote}</p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                {t.mediaUrl && (
                  <button style={S.btn("#0369a1")} onClick={() => setPreviewTask(t)}>
                    <Eye size={14} /> View Media
                  </button>
                )}
                <button style={S.btn("#dc2626")} onClick={() => handleDelete(t._id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewTask && <MediaLightbox task={previewTask} onClose={() => setPreviewTask(null)} />}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
