import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Image,
  Building2,
  CheckCircle,
  Globe,
  LogOut,
  ChevronRight,
  Settings,
  HelpCircle,
  IndianRupee,
  CalendarDays,
  MapPin,
  BookMarked,
  Briefcase,
  Users,
  ClipboardList,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import "./ngo.css";
// Removed remove-ngo-padding.css import

export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const NAV_ITEMS = [
  { path: "/ngo", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/ngo/profile", label: "Organization Profile", icon: User },
  { path: "/ngo/gallery", label: "Media Gallery", icon: Image },
  { path: "/ngo/events", label: "Events", icon: CalendarDays },
  { path: "/ngo/funds", label: "Fund Requests", icon: IndianRupee },
  { path: "/ngo/villages", label: "Village Adoptions", icon: MapPin },
  { path: "/ngo/problems", label: "Village Problems", icon: AlertTriangle },
  { path: "/ngo/fund-ledger", label: "Fund Ledger", icon: BookMarked },
  { path: "/ngo/employment", label: "Employment & Rojgar", icon: Briefcase },
  { path: "/ngo/staff", label: "Staff & Professionals", icon: Users },
  { path: "/ngo/surveys", label: "Surveys", icon: ClipboardList },
];

function NgoLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ngoData, setNgoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingCounts, setPendingCounts] = useState({ gallery: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          sessionStorage.setItem("flash_message", JSON.stringify({
            type: "info",
            message: "You don't have an NGO registered. Please register first."
          }));
          navigate("/add-ngo", { replace: true });
          return;
        }

        if (data.status === "pending") {
          navigate("/ngo/pending", { replace: true, state: { ngo: data.data } });
          return;
        }

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
            gallery: data.data.stats.gallery?.pending || 0
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#1a2744] rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading NGO Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8f7f5]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative w-64 h-screen bg-white border-r border-slate-200 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out z-40 flex flex-col overflow-hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#1a2744] to-[#2d3e5f] text-white flex items-center justify-center font-bold text-xl shadow-md">
              {ngoData?.ngoName?.charAt(0) || 'N'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-[#1a2744] truncate">{ngoData?.ngoName || "NGO Dashboard"}</h2>
              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-1">
                <CheckCircle size={11} /> Verified
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          <p className="px-4 py-2 text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Main Menu</p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive(item) 
                        ? "bg-[#1a2744] text-white shadow-md" 
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {getBadge(item.label) && (
                      <span className="inline-flex items-center justify-center min-w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm">
                        {getBadge(item.label)}
                      </span>
                    )}
                    <ChevronRight size={16} className={`flex-shrink-0 transition-opacity ${isActive(item) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="my-6 border-t border-slate-200"></div>

          {/* Other Section */}
          <p className="px-4 py-2 text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Other</p>
          <ul className="space-y-1">
            <li>
              <Link 
                to="/" 
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all duration-200 group"
              >
                <Globe size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium flex-1">Back to Website</span>
                <ChevronRight size={16} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </li>
            <li>
              <button 
                onClick={() => {
                  handleLogout();
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
              >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium flex-1 text-left">Sign Out</span>
                <ChevronRight size={16} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white text-center">
          <span className="text-xs text-slate-500 font-semibold">SevaIndia Platform</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header - Visible on small devices */}
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex items-center justify-center p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            title={sidebarOpen ? "Close Menu" : "Open Menu"}
          >
            {sidebarOpen ? (
              <X size={24} className="text-slate-600" />
            ) : (
              <Menu size={24} className="text-slate-600" />
            )}
          </button>
          <h1 className="text-lg font-bold text-slate-800">NGO Panel</h1>
        </div>

        {/* Content Area with Padding */}
        <div className="flex-1 overflow-auto bg-[#f8f7f5]">
          <div className="pt-4 sm:pt-6 lg:pt-8 pr-4 sm:pr-6 lg:pr-8 pb-4 sm:pb-6 lg:pb-8 pl-0">
            <Outlet context={{ ngoData, setNgoData, refreshStats: fetchDashboardStats }} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default NgoLayout;