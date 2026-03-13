import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Image,
  Handshake,
  Building2,
  CheckCircle,
  Globe,
  LogOut,
  ChevronRight,
  Settings,
  HelpCircle,
  IndianRupee
} from "lucide-react";
import "./ngo.css";
// Removed remove-ngo-padding.css import

export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const NAV_ITEMS = [
  { path: "/ngo", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/ngo/profile", label: "Organization Profile", icon: User },
  { path: "/ngo/gallery", label: "Media Gallery", icon: Image },
  { path: "/ngo/volunteers", label: "Volunteer Management", icon: Handshake },
  { path: "/ngo/funds", label: "Fund Requests", icon: IndianRupee },
];

function NgoLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ngoData, setNgoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingCounts, setPendingCounts] = useState({ gallery: 0, volunteers: 0 });

  // Removed body class toggling for NGO dashboard to restore default spacing

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || !token) {
      sessionStorage.setItem("flash_message", JSON.stringify({ 
        type: "error", 
        message: "Please login to access NGO Dashboard." 
      }));
      navigate("/login", { replace: true });
      return;
    }

    // Fetch NGO status
    fetch(`${API_BASE_URL}/api/ngo-dashboard/status`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    })
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          throw new Error(data.message);
        }

        if (data.status === "none") {
          // User has no NGO - redirect to add NGO page
          sessionStorage.setItem("flash_message", JSON.stringify({
            type: "info",
            message: "You don't have an NGO registered. Please register first."
          }));
          navigate("/add-ngo", { replace: true });
          return;
        }

        if (data.status === "pending") {
          // NGO exists but pending - redirect to pending page
          navigate("/ngo/pending", { replace: true, state: { ngo: data.data } });
          return;
        }

        // NGO is approved - fetch dashboard data
        setNgoData(data.data);
        fetchDashboardStats();
      })
      .catch(err => {
        console.error("NGO Status Error:", err);
        sessionStorage.setItem("flash_message", JSON.stringify({
          type: "error",
          message: err.message || "Failed to load NGO data"
        }));
        navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchDashboardStats = () => {
    fetch(`${API_BASE_URL}/api/ngo-dashboard/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setNgoData(data.data.ngo);
          setPendingCounts({
            gallery: data.data.stats.gallery?.pending || 0,
            volunteers: data.data.stats.volunteers?.pending || 0
          });
        }
      })
      .catch(() => {});
  };

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const getBadge = (label) => {
    if (label === "Gallery" && pendingCounts.gallery > 0) return pendingCounts.gallery;
    if (label === "Volunteers" && pendingCounts.volunteers > 0) return pendingCounts.volunteers;
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  };

  if (loading) {
    return (
      <div className="ngo-loading-screen">
        <div className="ngo-loading-spinner"></div>
        <p>Loading NGO Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="ngo-layout">
      {/* Sidebar */}
      <aside className="ngo-sidebar">
        <div className="ngo-sidebar-header">
          <div className="ngo-org-logo">
            {ngoData?.ngoName?.charAt(0) || 'N'}
          </div>
          <div className="ngo-org-details">
            <h2>{ngoData?.ngoName || "NGO Dashboard"}</h2>
            <span className="ngo-verified-badge">
              <CheckCircle size={10} /> Verified
            </span>
          </div>
        </div>

        <nav className="ngo-sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-label">Main Menu</span>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className={isActive(item) ? "active" : ""}>
                    <span className="nav-icon"><item.icon size={18} /></span>
                    <span className="nav-text">{item.label}</span>
                    {getBadge(item.label) && (
                      <span className="nav-badge">{getBadge(item.label)}</span>
                    )}
                    <ChevronRight size={14} className="nav-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="ngo-sidebar-divider"></div>

          <div className="nav-section">
            <span className="nav-section-label">Other</span>
            <ul className="ngo-sidebar-bottom">
              <li>
                <Link to="/" className="back-link">
                  <span className="nav-icon"><Globe size={18} /></span>
                  <span className="nav-text">Back to Website</span>
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  <span className="nav-icon"><LogOut size={18} /></span>
                  <span className="nav-text">Sign Out</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="ngo-sidebar-footer">
          <span>SevaIndia Platform</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ngo-content">
        <Outlet context={{ ngoData, setNgoData, refreshStats: fetchDashboardStats }} />
      </main>
    </div>
  );
}

export default NgoLayout;