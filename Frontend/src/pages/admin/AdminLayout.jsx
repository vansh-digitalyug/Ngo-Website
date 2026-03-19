import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";


// import { LayoutDashboard, Building2, Users, Mail, Image, UserCircle, Heart, ClipboardList, Wallet, IndianRupee, CheckCircle2, Coins, BookOpenText, CalendarDays, Settings, Briefcase, Globe } from "lucide-react";
import { LayoutDashboard, Building2, Users, Mail, Image, UserCircle, Heart, ClipboardList, Wallet, IndianRupee, CheckCircle2, Coins, BookOpenText, CalendarDays, Settings, Briefcase, MapPin, BookMarked,Globe } from "lucide-react";



import "./admin.css";
// Removed remove-admin-padding.css import

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const NAV_ITEMS = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/admin/ngos", label: "NGOs", icon: Building2 },
  { path: "/admin/volunteers", label: "Volunteers", icon: Users },
  { path: "/admin/contacts", label: "Contacts", icon: Mail },
  { path: "/admin/gallery", label: "Gallery", icon: Image },
  { path: "/admin/blogs", label: "Blogs", icon: BookOpenText },
  { path: "/admin/events", label: "Events", icon: CalendarDays },
  { path: "/admin/users", label: "Users", icon: UserCircle },
  { path: "/admin/kanyadan", label: "Kanyadan", icon: Heart },
  { path: "/admin/donations", label: "Donations", icon: Coins },
  { path: "/admin/tasks", label: "Tasks", icon: ClipboardList },
  { path: "/admin/funds", label: "Fund Requests", icon: Wallet },
  { path: "/admin/payments", label: "Payments", icon: IndianRupee },
  { path: "/admin/completed-tasks", label: "Completed Tasks", icon: CheckCircle2 },
  { path: "/admin/services/add", label: "Add Services", icon: Briefcase },
  { path: "/admin/services/manage", label: "Manage Services", icon: Settings },

  { path: "/admin/communities", label: "Communities", icon: Globe },

  { path: "/admin/villages", label: "Villages", icon: MapPin },
  { path: "/admin/fund-ledger", label: "Fund Ledger", icon: BookMarked },

];

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingCounts, setPendingCounts] = useState({ ngos: 0, volunteers: 0, contacts: 0, kanyadan: 0, funds: 0, communities: 0 });

  // Removed body class toggling for admin dashboard to restore default spacing

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  useEffect(() => {
    const currentUser = (() => {
      try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
    })();

    if (!currentUser || currentUser.role !== "admin") {
      sessionStorage.setItem("flash_message", JSON.stringify({ type: "error", message: "Admin access required." }));
      navigate("/login/admin", { replace: true });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setPendingCounts({
            ngos: d.data.stats.pendingNgos || 0,
            volunteers: d.data.stats.pendingVolunteers || 0,
            contacts: d.data.stats.newContacts || 0,
            kanyadan: 0
          });
        }
        // Fetch kanyadan pending count separately
        return fetch(`${API_BASE_URL}/api/admin/kanyadan/stats`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include"
        });
      })
      .then(r => r?.json?.())
      .then(d => {
        if (d?.success) {
          setPendingCounts(prev => ({ ...prev, kanyadan: d.data?.pending || 0 }));
        }
        const token2 = localStorage.getItem("token");
        return fetch(`${API_BASE_URL}/api/admin/funds?status=Pending&limit=1`, {
          headers: { Authorization: `Bearer ${token2}` },
          credentials: "include"
        });
      })
      .then(r => r?.json?.())
      .then(d => {
        if (d?.success) {
          setPendingCounts(prev => ({ ...prev, funds: d.data?.pagination?.total || 0 }));
        }
        const token3 = localStorage.getItem("token");
        return fetch(`${API_BASE_URL}/api/admin/communities/stats`, {
          headers: { Authorization: `Bearer ${token3}` },
          credentials: "include"
        });
      })
      .then(r => r?.json?.())
      .then(d => {
        if (d?.success) {
          setPendingCounts(prev => ({ ...prev, communities: d.data?.communities?.pending || 0 }));
        }
      })
      .catch(() => { });
  }, [location.pathname, navigate]);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const getBadge = (label) => {
    if (label === "NGOs" && pendingCounts.ngos > 0) return pendingCounts.ngos;
    if (label === "Volunteers" && pendingCounts.volunteers > 0) return pendingCounts.volunteers;
    if (label === "Contacts" && pendingCounts.contacts > 0) return pendingCounts.contacts;
    if (label === "Kanyadan" && pendingCounts.kanyadan > 0) return pendingCounts.kanyadan;
    if (label === "Fund Requests" && pendingCounts.funds > 0) return pendingCounts.funds;
    if (label === "Communities" && pendingCounts.communities > 0) return pendingCounts.communities;
    return null;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Admin Panel</h2>
          <p>{user?.name || "Administrator"}</p>
        </div>
        <ul className="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className={isActive(item) ? "active" : ""}>
                <span className="nav-icon"><item.icon size={18} /></span>
                <span className="nav-text">{item.label}</span>
                {getBadge(item.label) && (
                  <span className="nav-badge">{getBadge(item.label)}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <button
          className="admin-logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.clear();
            navigate("/login/admin", { replace: true });
          }}
        >
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
export { API_BASE_URL };
