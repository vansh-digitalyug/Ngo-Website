import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, User, UserCheck, Image, Video, Search, IndianRupee } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const token = () => localStorage.getItem("token");
const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminCompletedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState(null); // { url, type }

  const fetchTasks = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/tasks/admin/all?status=completed`, {
      headers: { Authorization: `Bearer ${token()}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setTasks(Array.isArray(d.data) ? d.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filtered = tasks.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (t.title || "").toLowerCase().includes(q) ||
      (t.volunteerName || "").toLowerCase().includes(q) ||
      (t.donorName || "").toLowerCase().includes(q) ||
      (t.serviceTitle || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 className="admin-page-title">Completed Tasks</h1>

      {/* Summary */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div style={{ padding: "10px 20px", borderRadius: "8px", background: "#d1fae5", color: "#065f46", fontWeight: "600", fontSize: "14px" }}>
          Total Completed: {tasks.length}
        </div>
        <div style={{ padding: "10px 20px", borderRadius: "8px", background: "#dbeafe", color: "#1e40af", fontWeight: "600", fontSize: "14px" }}>
          With Media: {tasks.filter(t => t.mediaUrl).length}
        </div>
        <div style={{ padding: "10px 20px", borderRadius: "8px", background: "#f0fdf4", color: "#16a34a", fontWeight: "600", fontSize: "14px" }}>
          Donors Notified: {tasks.filter(t => t.notificationSent).length}
        </div>
      </div>

      {/* Search */}
      <div className="admin-filters" style={{ marginBottom: "20px" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search by task title, volunteer, donor or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>
      </div>

      {/* List */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">Loading completed tasks...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty-state">
            {tasks.length === 0 ? "No completed tasks yet." : "No tasks match your search."}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filtered.map((t) => (
              <div
                key={t._id}
                style={{ border: "1px solid #a7f3d0", borderLeft: "4px solid #10b981", borderRadius: "10px", background: "#fff", padding: "20px", display: "grid", gap: "14px" }}
              >
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <CheckCircle size={16} color="#10b981" />
                      <span style={{ fontWeight: "700", fontSize: "15px", color: "#0f172a" }}>{t.title}</span>
                    </div>
                    {t.serviceTitle && (
                      <span style={{
                        display: "inline-block", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                        background: (!t.serviceTitle || t.serviceTitle === "General Donation") ? "#f0fdf4" : "#eff6ff",
                        color: (!t.serviceTitle || t.serviceTitle === "General Donation") ? "#166534" : "#1e40af",
                      }}>
                        {t.serviceTitle || "General Donation"}
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "700", fontSize: "16px", color: "#16a34a" }}>{fmt(t.donationAmount)}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>Completed {fmtDate(t.completedAt || t.updatedAt)}</div>
                  </div>
                </div>

                {/* People row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <UserCheck size={15} color="#4f46e5" />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>Volunteer</div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{t.volunteerName || "—"}</div>
                      {t.volunteerEmail && <div style={{ fontSize: "12px", color: "#64748b" }}>{t.volunteerEmail}</div>}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <User size={15} color="#ca8a04" />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>Donor</div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{t.donorName || t.donorEmail || "Anonymous"}</div>
                      {t.donorEmail && t.donorName && <div style={{ fontSize: "12px", color: "#64748b" }}>{t.donorEmail}</div>}
                    </div>
                  </div>

                  {t.notificationSent !== undefined && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                        background: t.notificationSent ? "#d1fae5" : "#fef3c7",
                        color: t.notificationSent ? "#065f46" : "#92400e"
                      }}>
                        {t.notificationSent ? "✓ Donor Notified" : "⏳ Notification Pending"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description / Admin Note */}
                {(t.description || t.adminNote) && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "10px" }}>
                    {t.description && (
                      <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Task Description</div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#374151", lineHeight: "1.5" }}>{t.description}</p>
                      </div>
                    )}
                    {t.adminNote && (
                      <div style={{ padding: "10px 14px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: "#1e40af", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Admin Note</div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#1e3a8a", lineHeight: "1.5" }}>{t.adminNote}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Media proof */}
                {t.mediaUrl && (
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Proof of Completion
                    </div>
                    {t.mediaType === "image" ? (
                      <img
                        src={t.mediaUrl}
                        alt="Task proof"
                        onClick={() => setLightbox({ url: t.mediaUrl, type: "image" })}
                        style={{ maxWidth: "280px", maxHeight: "180px", borderRadius: "8px", objectFit: "cover", cursor: "pointer", border: "1px solid #e2e8f0", display: "block" }}
                      />
                    ) : (
                      <button
                        onClick={() => setLightbox({ url: t.mediaUrl, type: "video" })}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#1e40af", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                      >
                        <Video size={14} /> Watch Video
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <button
              onClick={() => setLightbox(null)}
              style={{ position: "absolute", top: "-40px", right: 0, background: "none", border: "none", color: "#fff", fontSize: "28px", cursor: "pointer", lineHeight: 1 }}
            >×</button>
            {lightbox.type === "image" ? (
              <img src={lightbox.url} alt="proof" style={{ maxWidth: "85vw", maxHeight: "85vh", borderRadius: "8px", objectFit: "contain" }} />
            ) : (
              <video src={lightbox.url} controls autoPlay style={{ maxWidth: "85vw", maxHeight: "85vh", borderRadius: "8px" }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
