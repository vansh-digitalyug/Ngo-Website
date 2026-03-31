import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Menu, X,
  LayoutDashboard, Building2, Users, Mail, Image, UserCircle, Heart,
  ClipboardList, Wallet, IndianRupee, CheckCircle2, Coins, BookOpenText,
  CalendarDays, Settings, Briefcase, MapPin, BookMarked, Globe,
  MessageSquare, UserCog, AlertCircle, BarChart2,
} from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const NAV_ITEMS = [
  { path: "/admin",                   label: "Dashboard",        icon: LayoutDashboard, exact: true },
  { path: "/admin/ngos",              label: "NGOs",             icon: Building2 },
  { path: "/admin/volunteers",        label: "Volunteers",       icon: Users },
  { path: "/admin/contacts",          label: "Contacts",         icon: Mail },
  { path: "/admin/gallery",           label: "Gallery",          icon: Image },
  { path: "/admin/blogs",             label: "Blogs",            icon: BookOpenText },
  { path: "/admin/events",            label: "Events",           icon: CalendarDays },
  { path: "/admin/users",             label: "Users",            icon: UserCircle },
  { path: "/admin/kanyadan",          label: "Kanyadan",         icon: Heart },
  { path: "/admin/donations",         label: "Donations",        icon: Coins },
  { path: "/admin/tasks",             label: "Tasks",            icon: ClipboardList },
  { path: "/admin/funds",             label: "Fund Requests",    icon: Wallet },
  { path: "/admin/payments",          label: "Payments",         icon: IndianRupee },
  { path: "/admin/completed-tasks",   label: "Completed Tasks",  icon: CheckCircle2 },
  { path: "/admin/services/add",      label: "Add Services",     icon: Briefcase },
  { path: "/admin/services/manage",   label: "Manage Services",  icon: Settings },
  { path: "/admin/communities",       label: "Communities",      icon: Globe },
  { path: "/admin/villages",          label: "Villages",         icon: MapPin },
  { path: "/admin/fund-ledger",       label: "Fund Ledger",      icon: BookMarked },
  { path: "/admin/feedback",          label: "Feedback",         icon: MessageSquare },
  { path: "/admin/problems",          label: "Problems",         icon: AlertCircle },
  { path: "/admin/employment",        label: "Employment",       icon: UserCog },
  { path: "/admin/staff",             label: "Staff",            icon: Users },
  { path: "/admin/surveys",           label: "Surveys",          icon: ClipboardList },
  { path: "/admin/impact-reports",    label: "Impact Reports",   icon: BarChart2 },
];

function AdminLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({
    ngos: 0, volunteers: 0, contacts: 0, kanyadan: 0, funds: 0, communities: 0, feedback: 0,
  });

  /* Close sidebar whenever the route changes */
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  /* Prevent body scroll when mobile sidebar is open */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

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
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setPendingCounts(prev => ({
          ...prev,
          ngos:       d.data.stats.pendingNgos       || 0,
          volunteers: d.data.stats.pendingVolunteers || 0,
          contacts:   d.data.stats.newContacts       || 0,
        }));
        return fetch(`${API_BASE_URL}/api/admin/kanyadan/stats`, {
          headers: { Authorization: `Bearer ${token}` }, credentials: "include",
        });
      })
      .then(r => r?.json?.())
      .then(d => {
        if (d?.success) setPendingCounts(prev => ({ ...prev, kanyadan: d.data?.pending || 0 }));
        return fetch(`${API_BASE_URL}/api/admin/funds?status=Pending&limit=1`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, credentials: "include",
        });
      })
      .then(r => r?.json?.())
      .then(d => {
        if (d?.success) setPendingCounts(prev => ({ ...prev, funds: d.data?.pagination?.total || 0 }));
        return fetch(`${API_BASE_URL}/api/admin/communities/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, credentials: "include",
        });
      })
      .then(r => r?.json?.())
      .then(d => {
        if (d?.success) setPendingCounts(prev => ({ ...prev, communities: d.data?.communities?.pending || 0 }));
        return fetch(`${API_BASE_URL}/api/admin/feedback/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, credentials: "include",
        });
      })
      .then(r => r?.json?.())
      .then(d => {
        if (d?.success) setPendingCounts(prev => ({ ...prev, feedback: d.data?.unread || 0 }));
      })
      .catch(() => {});
  }, [location.pathname, navigate]);

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const getBadge = (label) => {
    const map = {
      "NGOs":          pendingCounts.ngos,
      "Volunteers":    pendingCounts.volunteers,
      "Contacts":      pendingCounts.contacts,
      "Kanyadan":      pendingCounts.kanyadan,
      "Fund Requests": pendingCounts.funds,
      "Communities":   pendingCounts.communities,
      "Feedback":      pendingCounts.feedback,
    };
    return map[label] > 0 ? map[label] : null;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login/admin", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ══ Mobile backdrop ══ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══ Sidebar ══ */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          h-screen w-[260px] lg:w-[250px]
          bg-[#1e293b] flex flex-col flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-[1.15rem] font-bold text-white m-0 leading-tight">Admin Panel</h2>
            <p className="text-xs text-slate-400 mt-0.5 m-0 truncate max-w-[160px]">
              {user?.name || "Administrator"}
            </p>
          </div>
          {/* Close button — mobile only */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
          <ul className="list-none m-0 p-0">
            {NAV_ITEMS.map((item) => {
              const badge   = getBadge(item.label);
              const active  = isActive(item);
              return (
                <li key={item.path} className="mb-0.5">
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.875rem]
                      no-underline transition-all duration-150 w-full
                      ${active
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"}
                    `}
                  >
                    <item.icon size={17} className="flex-shrink-0" />
                    <span className="flex-1 leading-none">{item.label}</span>
                    {badge && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors cursor-pointer border-0"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ Main content ══ */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-gray-800 text-base">Admin Panel</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
export { API_BASE_URL };
