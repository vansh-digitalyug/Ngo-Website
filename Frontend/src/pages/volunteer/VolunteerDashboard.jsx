import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaBriefcase,
  FaGraduationCap, FaMapMarkerAlt, FaStar, FaCheckCircle,
  FaClock, FaTimesCircle, FaHandHoldingHeart, FaSpinner,
  FaArrowLeft, FaIdCard, FaCalendarAlt, FaLayerGroup,
  FaClipboardList, FaRupeeSign, FaPlay, FaUpload, FaLock,
  FaImage, FaVideo, FaCheckSquare, FaExclamationCircle
} from "react-icons/fa";
import "./volunteer-dashboard.css";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const StatusBadge = ({ status }) => {
  const map = {
    Approved:     { icon: <FaCheckCircle />,  cls: "vd-badge-approved" },
    Pending:      { icon: <FaClock />,         cls: "vd-badge-pending" },
    Rejected:     { icon: <FaTimesCircle />,   cls: "vd-badge-rejected" },
  };
  const { icon, cls } = map[status] || { icon: null, cls: "" };
  return <span className={`vd-badge ${cls}`}>{icon} {status}</span>;
};

const InfoRow = ({ label, value }) => (
  <div className="vd-info-row">
    <span className="vd-info-label">{label}</span>
    <span className="vd-info-value">{value || "—"}</span>
  </div>
);

// ── Task status UI helpers ────────────────────────────────────────────────────
const TASK_STATUS = {
  assigned:    { label: "Assigned",    color: "#1e40af", bg: "#dbeafe", Icon: FaClock },
  in_progress: { label: "In Progress", color: "#854d0e", bg: "#fef9c3", Icon: FaPlay },
  completed:   { label: "Completed",   color: "#166534", bg: "#dcfce7", Icon: FaCheckCircle },
};

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ── Complete Task Modal ───────────────────────────────────────────────────────
function CompleteTaskModal({ task, token, apiBase, volunteerId, onClose, onDone }) {
  const [file, setFile]             = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaType, setMediaType]   = useState("image");
  const [volunteerNote, setNote]    = useState("");
  const [addToGallery, setAddToGal] = useState(true);
  const [galleryCategory, setGalCat] = useState("Volunteer Activities");
  const [progress, setProgress]     = useState("");
  const [saving, setSaving]         = useState(false);
  const [err, setErr]               = useState("");
  const fileRef = React.useRef(null);

  const MAX_MB = 100;
  const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/x-msvideo";

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) { setErr(`File exceeds ${MAX_MB} MB limit.`); return; }
    setErr("");
    setFile(f);
    const isVid = f.type.startsWith("video/");
    setMediaType(isVid ? "video" : "image");
    setPreviewUrl(isVid ? URL.createObjectURL(f) : null);
    if (!isVid) {
      const r = new FileReader();
      r.onload = (ev) => setPreviewUrl(ev.target.result);
      r.readAsDataURL(f);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) { setErr("Please select an image or video file."); return; }
    setSaving(true); setErr("");
    try {
      // Step 1 — presigned S3 URL
      setProgress("Getting upload URL…");
      const urlRes = await fetch(`${apiBase}/api/s3/generate-upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ fileName: file.name, fileType: file.type, location: `volunteerTask/${volunteerId}` }),
      });
      const urlData = await urlRes.json();
      if (!urlData.success) throw new Error(urlData.message || "Failed to get upload URL");
      const { uploadUrl, key } = urlData.data;

      // Step 2 — upload directly to S3
      setProgress(`Uploading ${(file.size / 1024 / 1024).toFixed(1)} MB to S3…`);
      const s3Res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!s3Res.ok) throw new Error("S3 upload failed. Please try again.");

      // Step 3 — mark task complete
      setProgress("Completing task…");
      const res = await fetch(`${apiBase}/api/tasks/volunteer/${task._id}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ s3Key: key, mediaType, volunteerNote, addToGallery, galleryCategory }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      onDone();
    } catch (ex) {
      setErr(ex.message || "Something went wrong");
    } finally {
      setSaving(false); setProgress("");
    }
  };

  const inp = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "13px", color: "#374151" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "14px", padding: "28px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>Complete Task</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#64748b" }}>✕</button>
        </div>

        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px", marginBottom: "18px" }}>
          <p style={{ margin: 0, fontWeight: "700", color: "#166534" }}>{task.title}</p>
          <p style={{ margin: "4px 0 0", color: "#374151", fontSize: "13px" }}>Service: {task.serviceTitle || "—"} · Donor: {task.donorName || "—"}</p>
        </div>

        <form onSubmit={submit}>
          {/* File picker */}
          <div style={{ marginBottom: "16px" }}>
            <label style={lbl}>Upload Photo or Video * <span style={{ fontWeight: "400", color: "#64748b" }}>(max {MAX_MB} MB)</span></label>
            <input ref={fileRef} type="file" accept={ACCEPT} onChange={handleFileChange} style={{ display: "none" }} />
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${file ? "#86efac" : "#cbd5e1"}`, borderRadius: "10px", padding: "20px", textAlign: "center", cursor: "pointer", background: file ? "#f0fdf4" : "#f8fafc" }}
            >
              {previewUrl ? (
                mediaType === "video"
                  ? <video src={previewUrl} muted style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "6px" }} />
                  : <img src={previewUrl} alt="preview" style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "contain", borderRadius: "6px" }} />
              ) : (
                <>
                  <FaUpload style={{ fontSize: "1.8rem", color: "#94a3b8", marginBottom: "6px" }} />
                  <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>Click to select photo or video</p>
                  <p style={{ margin: "3px 0 0", color: "#94a3b8", fontSize: "11px" }}>JPG · PNG · WEBP · MP4 · MOV · max 100 MB</p>
                </>
              )}
            </div>
            {file && <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#64748b" }}>{file.name} · {(file.size/1024/1024).toFixed(1)} MB · {mediaType}</p>}
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Completion Note</label>
            <textarea style={{ ...inp, minHeight: "70px", resize: "vertical" }} value={volunteerNote} onChange={e => setNote(e.target.value)} placeholder="Describe what you did and how many people were helped…" />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
              <input type="checkbox" checked={addToGallery} onChange={e => setAddToGal(e.target.checked)} />
              Add this media to the public gallery
            </label>
          </div>

          {addToGallery && (
            <div style={{ marginBottom: "14px" }}>
              <label style={lbl}>Gallery Category</label>
              <select value={galleryCategory} onChange={e => setGalCat(e.target.value)} style={{ ...inp, background: "#fff" }}>
                {["Food Distribution","Medical Camps","Education","Elder Care","Women Empowerment","Events","Volunteer Activities","Other"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {progress && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", color: "#1e40af", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaSpinner style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} /> {progress}
            </div>
          )}
          {err && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "10px" }}>{err}</p>}

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose} disabled={saving} style={{ flex: 1, padding: "10px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Uploading…" : "✓ Upload & Complete Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [tasks, setTasks]         = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [taskMsg, setTaskMsg] = useState({ type: "", text: "" });

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  const loadTasks = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setTasksLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/volunteer/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const d = await res.json();
      if (d.success) setTasks(d.data || []);
    } catch { /* silent */ }
    finally { setTasksLoading(false); }
  }, []);

  const startTask = async (taskId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/volunteer/${taskId}/start`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      loadTasks();
    } catch (e) {
      setTaskMsg({ type: "error", text: e.message });
      setTimeout(() => setTaskMsg({ type: "", text: "" }), 3000);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    fetch(`${API_BASE_URL}/api/profile/volunteer`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => {
        if (!d?.success) throw new Error(d?.message || "Failed to load volunteer data");
        if (!d.data) {
          // User has not applied as a volunteer
          setError("no-application");
        } else {
          setVolunteer(d.data);
          loadTasks(); // load tasks only when volunteer profile confirmed
        }
      })
      .catch(err => setError(err.message || "Something went wrong"))
      .finally(() => setLoading(false));
  }, [loadTasks]);

  const userInitial = storedUser?.name ? storedUser.name.charAt(0).toUpperCase() : "V";
  const userAvatar  = storedUser?.avatar || "";

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="vd-fullpage-center">
        <FaSpinner className="vd-spinner" />
        <p>Loading your volunteer dashboard…</p>
      </div>
    );
  }

  // ── Not applied ───────────────────────────────────────────────────────────
  if (error === "no-application") {
    return (
      <div className="vd-fullpage-center">
        <div className="vd-empty-icon"><FaHandHoldingHeart /></div>
        <h2>You haven't applied as a volunteer yet</h2>
        <p>Join our volunteer programme and make a difference in communities across India.</p>
        <div className="vd-cta-row">
          <Link to="/volunteer" className="vd-btn-primary">Apply Now</Link>
          <Link to="/profile" className="vd-btn-secondary">Back to Profile</Link>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="vd-fullpage-center">
        <p className="vd-error-msg">{error}</p>
        <Link to="/profile" className="vd-btn-secondary">Back to Profile</Link>
      </div>
    );
  }

  const dobFormatted = volunteer.dob
    ? new Date(volunteer.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  const joinDate = volunteer.createdAt
    ? new Date(volunteer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  return (
    <div className="vd-page">
      {/* Top nav bar */}
      <div className="vd-topbar">
        <Link to="/profile" className="vd-back-link">
          <FaArrowLeft /> Back to Profile
        </Link>
        <span className="vd-topbar-title">Volunteer Dashboard</span>
      </div>

      <div className="vd-container">

        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <div className="vd-hero-card">
          <div className="vd-hero-left">
            <div className="vd-hero-avatar">
              {userAvatar
                ? <img src={userAvatar} alt="avatar" />
                : userInitial}
            </div>
            <div className="vd-hero-info">
              <h1 className="vd-hero-name">{volunteer.fullName}</h1>
              <div className="vd-hero-badges">
                <StatusBadge status={volunteer.status} />
                {volunteer.role && (
                  <span className="vd-role-badge"><FaStar /> {volunteer.role}</span>
                )}
              </div>
              {joinDate && (
                <p className="vd-hero-since"><FaCalendarAlt /> Volunteer since {joinDate}</p>
              )}
            </div>
          </div>
          {volunteer.assignedArea && (
            <div className="vd-hero-area">
              <FaMapMarkerAlt />
              <div>
                <p className="vd-area-label">Assigned Area</p>
                <p className="vd-area-value">{volunteer.assignedArea}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Status note for pending/rejected ──────────────────────────── */}
        {volunteer.status === "Pending" && (
          <div className="vd-status-note vd-note-pending">
            <FaClock /> Your application is under review. You will be notified once approved.
          </div>
        )}
        {volunteer.status === "Rejected" && (
          <div className="vd-status-note vd-note-rejected">
            <FaTimesCircle /> Your application was not approved at this time. Contact us for more information.
          </div>
        )}

        {/* ── Info grid ─────────────────────────────────────────────────── */}
        <div className="vd-grid">

          {/* Personal Information */}
          <div className="vd-card">
            <div className="vd-card-header">
              <FaUser className="vd-card-icon" />
              <h3>Personal Information</h3>
            </div>
            <div className="vd-card-body">
              <InfoRow label="Full Name"    value={volunteer.fullName} />
              <InfoRow label="Email"        value={volunteer.email} />
              <InfoRow label="Phone"        value={volunteer.phone} />
              {dobFormatted && <InfoRow label="Date of Birth" value={dobFormatted} />}
              <InfoRow label="Occupation"   value={volunteer.occupation} />
              <InfoRow label="Education"    value={volunteer.education} />
            </div>
          </div>

          {/* Location */}
          <div className="vd-card">
            <div className="vd-card-header">
              <FaMapMarkerAlt className="vd-card-icon" />
              <h3>Location & Area</h3>
            </div>
            <div className="vd-card-body">
              <InfoRow label="City"          value={volunteer.city} />
              <InfoRow label="State"         value={volunteer.state} />
              {volunteer.assignedArea && (
                <InfoRow label="Assigned Area" value={volunteer.assignedArea} />
              )}
            </div>
          </div>

          {/* Role & Preferences */}
          <div className="vd-card">
            <div className="vd-card-header">
              <FaLayerGroup className="vd-card-icon" />
              <h3>Role & Preferences</h3>
            </div>
            <div className="vd-card-body">
              {volunteer.role && <InfoRow label="Assigned Role" value={volunteer.role} />}
              <InfoRow label="Mode"         value={volunteer.mode} />
              <InfoRow label="Availability" value={volunteer.availability} />
              {volunteer.skills && <InfoRow label="Skills" value={volunteer.skills} />}
            </div>
          </div>

          {/* ID Verification */}
          <div className="vd-card">
            <div className="vd-card-header">
              <FaIdCard className="vd-card-icon" />
              <h3>ID Verification</h3>
            </div>
            <div className="vd-card-body">
              <InfoRow label="ID Type"   value={volunteer.idType} />
              <InfoRow label="ID Number" value={
                volunteer.idNumber
                  ? volunteer.idNumber.replace(/.(?=.{4})/g, "•")
                  : null
              } />
              <div className="vd-info-row">
                <span className="vd-info-label">Verified</span>
                <span className={`vd-verify-tag ${volunteer.idVerified ? "vd-verify-yes" : "vd-verify-no"}`}>
                  {volunteer.idVerified ? <><FaCheckCircle /> Verified</> : <><FaClock /> Pending</>}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {(volunteer.emergencyName || volunteer.emergencyPhone) && (
            <div className="vd-card">
              <div className="vd-card-header">
                <FaPhone className="vd-card-icon" />
                <h3>Emergency Contact</h3>
              </div>
              <div className="vd-card-body">
                <InfoRow label="Name"  value={volunteer.emergencyName} />
                <InfoRow label="Phone" value={volunteer.emergencyPhone} />
              </div>
            </div>
          )}

          {/* Motivation */}
          {volunteer.motivation && (
            <div className="vd-card vd-card-wide">
              <div className="vd-card-header">
                <FaHandHoldingHeart className="vd-card-icon" />
                <h3>Motivation</h3>
              </div>
              <div className="vd-card-body">
                <p className="vd-motivation-text">{volunteer.motivation}</p>
              </div>
            </div>
          )}

          {/* Areas of Interest */}
          {volunteer.interests?.length > 0 && (
            <div className="vd-card vd-card-wide">
              <div className="vd-card-header">
                <FaStar className="vd-card-icon" />
                <h3>Areas of Interest</h3>
              </div>
              <div className="vd-card-body">
                <div className="vd-interest-tags">
                  {volunteer.interests.map(i => (
                    <span key={i} className="vd-interest-tag">{i}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── My Assigned Tasks ─────────────────────────────────────────── */}
        {volunteer.status === "Approved" && (
          <div style={{ marginTop: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaClipboardList style={{ color: "#2563eb" }} /> My Assigned Tasks
                <span style={{ background: "#dbeafe", color: "#1e40af", fontSize: "12px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px" }}>{tasks.length}</span>
              </h2>
              <button onClick={loadTasks} disabled={tasksLoading} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
                {tasksLoading ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : "↻"} Refresh
              </button>
            </div>

            {taskMsg.text && (
              <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "12px", background: taskMsg.type === "error" ? "#fee2e2" : "#dcfce7", color: taskMsg.type === "error" ? "#991b1b" : "#166534", fontWeight: "600", fontSize: "13px" }}>
                {taskMsg.text}
              </div>
            )}

            {tasksLoading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                <FaSpinner style={{ fontSize: "24px", animation: "spin 1s linear infinite" }} />
              </div>
            ) : tasks.length === 0 ? (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                <FaClipboardList style={{ fontSize: "2rem", marginBottom: "10px" }} />
                <p style={{ margin: 0 }}>No tasks assigned yet. Check back soon!</p>
              </div>
            ) : tasks.map(task => {
              const sm = TASK_STATUS[task.status] || TASK_STATUS.assigned;
              return (
                <div key={task._id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", marginBottom: "12px", borderLeft: `4px solid ${sm.color}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>{task.title}</span>
                        <span style={{ background: sm.bg, color: sm.color, padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <sm.Icon size={10} /> {sm.label}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 4px", color: "#374151", fontSize: "13px" }}>
                        <FaRupeeSign style={{ verticalAlign: "middle" }} /> Donation: <strong>{fmt(task.donationAmount)}</strong> for <strong>{task.serviceTitle || "General"}</strong>
                      </p>
                      <p style={{ margin: "0 0 4px", color: "#64748b", fontSize: "12px" }}>Donor: {task.donorName || "—"} · Assigned: {fmtDate(task.createdAt)}</p>
                      {task.description && <p style={{ margin: "6px 0 0", color: "#374151", fontSize: "13px" }}>{task.description}</p>}
                      {task.adminNote && (
                        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "6px", padding: "8px 12px", marginTop: "8px" }}>
                          <p style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#0369a1" }}>📋 Admin Instructions:</p>
                          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0c4a6e" }}>{task.adminNote}</p>
                        </div>
                      )}
                      {task.status === "completed" && task.mediaUrl && (
                        <div style={{ marginTop: "10px" }}>
                          {task.mediaType === "video"
                            ? <video src={task.mediaUrl} controls style={{ maxWidth: "300px", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                            : <img src={task.mediaUrl} alt="proof" style={{ maxWidth: "200px", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                          }
                          {task.volunteerNote && <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "12px" }}>Note: {task.volunteerNote}</p>}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {task.status === "assigned" && (
                        <button onClick={() => startTask(task._id)} style={{ padding: "8px 14px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaPlay size={11} /> Start Task
                        </button>
                      )}
                      {task.status === "in_progress" && (
                        <button onClick={() => setCompleteTarget(task)} style={{ padding: "8px 14px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaUpload size={11} /> Upload & Complete
                        </button>
                      )}
                      {task.status === "completed" && (
                        <span style={{ background: "#dcfce7", color: "#166534", padding: "8px 14px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaCheckSquare /> Done
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {completeTarget && (
        <CompleteTaskModal
          task={completeTarget}
          token={localStorage.getItem("token")}
          apiBase={API_BASE_URL}
          volunteerId={volunteer?._id}
          onClose={() => setCompleteTarget(null)}
          onDone={() => {
            setCompleteTarget(null);
            setTaskMsg({ type: "success", text: "Task completed! Donor has been notified via email." });
            setTimeout(() => setTaskMsg({ type: "", text: "" }), 5000);
            loadTasks();
          }}
        />
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
