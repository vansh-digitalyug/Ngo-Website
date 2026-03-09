import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaBriefcase,
  FaGraduationCap, FaMapMarkerAlt, FaStar, FaCheckCircle,
  FaClock, FaTimesCircle, FaHandHoldingHeart, FaSpinner,
  FaArrowLeft, FaIdCard, FaCalendarAlt, FaLayerGroup
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

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

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
        }
      })
      .catch(err => setError(err.message || "Something went wrong"))
      .finally(() => setLoading(false));
  }, []);

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
      </div>
    </div>
  );
}
