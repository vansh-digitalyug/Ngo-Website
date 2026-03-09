import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./navbar.css";
import GoogleTranslate from "../GoogleTranslate.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const readUser = () => {
    const raw = localStorage.getItem("user");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("token")));
  const [user, setUser] = useState(readUser());
  const [hasNgo, setHasNgo] = useState(false);
  const [ngoStatus, setNgoStatus] = useState(null);
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const isAdmin = user?.role === "admin";


  // Check if user has an NGO
  useEffect(() => {
    const checkNgoStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token || isAdmin) {
        setHasNgo(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status !== 'none') {
            setHasNgo(true);
            setNgoStatus(data.status);
          } else {
            setHasNgo(false);
          }
        }
      } catch (err) {
        console.error('Failed to check NGO status:', err);
      }
    };

    if (isLoggedIn && !isAdmin) {
      checkNgoStatus();
    }
  }, [isLoggedIn, isAdmin]);

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("token")));
      setUser(readUser());
    };

    window.addEventListener("authChanged", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("authChanged", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const handleLogout = async (e) => {
    if (e) e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch("http://localhost:5000/api/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Ignore logout endpoint errors and clear client auth anyway.
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("authChanged"));
      setMenuOpen(false);
      sessionStorage.setItem(
        "flash_message",
        JSON.stringify({ type: "success", message: "Logout successfully." })
      );
      navigate("/");
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <span className="logo-icon">{"\u2665"}</span>
          <span className="logo-text">
            Seva<span>India</span>
          </span>
        </div>

        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/find-ngos">Find NGOs</Link></li>
          <li><Link to="/donate">Donate</Link></li>
          <li><Link to="/volunteer">Volunteer</Link></li>
          <li><Link to="/add-ngo">Add Your NGO</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        <div className="navbar-auth">
          <GoogleTranslate />
          {isLoggedIn ? (
            <div className="dropdown profile-dropdown">
              <div className="profile-icon" title={user?.name || "User"}>
                {userInitial}
              </div>
              <ul className="dropdown-menu profile-menu-right">
                {isAdmin ? (
                  <li>
                    <Link to="/admin" className="profile-link">
                      Admin Panel
                    </Link>
                  </li>
                ) : hasNgo ? (
                  <li>
                    <Link
                      to={ngoStatus === 'approved' ? "/ngo/dashboard" : "/ngo/pending"}
                      className="profile-link ngo-link"
                    >
                      <span className="link-icon">My NGO</span>
                      {ngoStatus === 'pending' && (
                        <span className="pending-badge">Pending</span>
                      )}
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link to="/profile" className="profile-link">
                      My Profile
                    </Link>
                  </li>
                )}
                <li>
                  <button onClick={handleLogout} className="dropdown-logout-btn">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          {"\u2630"}
        </button>

      </nav>

      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-header">
          <span>Menu</span>
          <button
            className="close-btn"
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            {"\u2715"}
          </button>
        </div>

        <div className="mobile-translate">
          <GoogleTranslate />
        </div>

        <ul>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/">Home</Link>
          </li>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/services">Services</Link>
          </li>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/services/medical/cancer">Cancer Support</Link>
          </li>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/services/medical/kidney">Kidney Support</Link>
          </li>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/find-ngos">Find NGOs</Link>
          </li>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/donate">Donate</Link>
          </li>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/volunteer">Volunteer</Link>
          </li>
          <li onClick={() => setMenuOpen(false)}>
            <Link to="/add-ngo">Add Your NGO</Link>
          </li>

          {isLoggedIn ? (
            <>
              <li
                style={{ borderTop: "2px solid #f0f0f0", marginTop: "10px" }}
                onClick={() => setMenuOpen(false)}
              >
                {isAdmin ? (
                  <Link to="/admin" style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1e40af", fontWeight: "bold" }}>
                    Admin Panel
                  </Link>
                ) : hasNgo ? (
                  <Link
                    to={ngoStatus === 'approved' ? "/ngo/dashboard" : "/ngo/pending"}
                    style={{ display: "flex", alignItems: "center", gap: "10px", color: "#7c3aed", fontWeight: "bold" }}
                  >
                    My NGO
                    {ngoStatus === 'pending' && (
                      <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>
                        Pending
                      </span>
                    )}
                  </Link>
                ) : (
                  <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="profile-icon mobile-icon">{userInitial}</div>My Profile
                  </Link>
                )}
              </li>
              <li>
                <button
                  type="button"
                  className="logout-btn-mobile"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li onClick={() => setMenuOpen(false)}>
              <Link to="/login" style={{ color: "#2e7d32", fontWeight: "bold" }}>Login</Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
export default Navbar;
