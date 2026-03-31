import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, Building2, Clock, CheckCircle, Handshake, Mail,
  Bell, IndianRupee, ClipboardList, TrendingUp, ArrowUpRight,
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

function StatusPill({ label, variant }) {
  const cls =
    variant === "green"  ? "bg-green-100 text-green-700"  :
    variant === "yellow" ? "bg-yellow-100 text-yellow-700" :
    variant === "red"    ? "bg-red-100 text-red-700"       :
    variant === "blue"   ? "bg-blue-100 text-blue-700"     :
                           "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

/* ── Section card wrapper ── */
function SectionCard({ title, linkTo, linkLabel = "View All →", children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="m-0 text-[15px] font-bold text-gray-800">{title}</h3>
        <Link to={linkTo} className="text-xs font-semibold text-blue-600 hover:text-blue-700 no-underline transition-colors">
          {linkLabel}
        </Link>
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

/* ── Mini table shared styles ── */
const TH = "text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100";
const TD = "px-4 py-3 text-sm text-gray-700 border-b border-gray-50 last:border-b-0";

/* ════════════════════════════════════════════════════ */
function AdminDashboard() {
  const navigate = useNavigate();
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch(`${API_BASE_URL}/api/tasks/admin/donations?limit=5`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setDonations(d.data.donations || []); })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-[#2d5a1b] animate-spin" />
          <p className="text-gray-400 text-sm m-0">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { stats, recent } = data;

  const statCards = [
    { label: "Total Users",         value: stats.totalUsers,         icon: Users,     iconBg: "bg-blue-100",   iconColor: "text-blue-600",   link: "/admin/users" },
    { label: "Total NGOs",          value: stats.totalNgos,          icon: Building2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Pending NGOs",        value: stats.pendingNgos,        icon: Clock,     iconBg: "bg-yellow-100", iconColor: "text-yellow-600", link: "/admin/ngos?status=pending" },
    { label: "Verified NGOs",       value: stats.verifiedNgos,       icon: CheckCircle, iconBg: "bg-green-100", iconColor: "text-green-600" },
    { label: "Total Volunteers",    value: stats.totalVolunteers,    icon: Handshake, iconBg: "bg-violet-100", iconColor: "text-violet-600", link: "/admin/volunteers" },
    { label: "Pending Volunteers",  value: stats.pendingVolunteers,  icon: Clock,     iconBg: "bg-orange-100", iconColor: "text-orange-600", link: "/admin/volunteers?status=Pending" },
    { label: "Total Contacts",      value: stats.totalContacts,      icon: Mail,      iconBg: "bg-pink-100",   iconColor: "text-pink-600",   link: "/admin/contacts" },
    { label: "New Contacts",        value: stats.newContacts,        icon: Bell,      iconBg: "bg-red-100",    iconColor: "text-red-600",    link: "/admin/contacts?status=New" },
  ];

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8]">
      <div className="p-4 sm:p-6 lg:p-8">

        {/* ══ HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-7">
          <div>
            <h1 className="text-[1.8rem] sm:text-[2.4rem] font-black text-gray-900 leading-tight m-0">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1 m-0">
              Welcome back — here's what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-sm font-semibold text-gray-600 shadow-sm">
              <TrendingUp size={15} className="text-[#2d5a1b]" />
              Live Overview
            </span>
          </div>
        </div>

        {/* ══ STAT CARDS ══ */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-7">
          {statCards.map((c, i) => (
            <div
              key={i}
              onClick={() => c.link && navigate(c.link)}
              className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4 transition-all duration-200 ${
                c.link ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : "cursor-default"
              }`}
            >
              {/* Icon box */}
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
                <c.icon size={20} className={c.iconColor} />
              </div>
              {/* Value + label */}
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-black text-gray-900 m-0 leading-none">
                  {c.value ?? 0}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-500 m-0 mt-1 leading-snug">
                  {c.label}
                </p>
              </div>
              {/* Arrow — only for linked cards */}
              {c.link && (
                <ArrowUpRight size={14} className="text-gray-300 ml-auto flex-shrink-0 hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* ══ RECENT DONATIONS FEED ══ */}
        {donations.length > 0 && (
          <div className="mb-7">
            {/* Section header */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-3">
              <h2 className="flex items-center gap-2 m-0 text-[17px] font-bold text-gray-900">
                <IndianRupee size={18} className="text-green-600" />
                Recent Donations
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to="/admin/donations"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 no-underline px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <IndianRupee size={12} /> All Donations
                </Link>
                <Link
                  to="/admin/tasks"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 no-underline px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <ClipboardList size={12} /> Manage Tasks
                </Link>
              </div>
            </div>

            {/* Donations list card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {donations.slice(0, 5).map((d, i) => (
                <div
                  key={d._id}
                  className={`flex items-center gap-3 px-4 sm:px-5 py-3.5 ${i < donations.slice(0, 5).length - 1 ? "border-b border-gray-50" : ""}`}
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <IndianRupee size={15} className="text-green-600" />
                  </div>
                  {/* Text */}
                  <p className="m-0 text-sm text-gray-600 flex-1 leading-snug">
                    <span className="font-bold text-gray-900">
                      {d.isAnonymous ? "Anonymous" : (d.donorName || d.user?.name || "Someone")}
                    </span>
                    {" donated "}
                    <span className="font-bold text-green-600">{fmt(d.amount)}</span>
                    {d.serviceTitle && (
                      <> for <span className="font-semibold text-gray-800">{d.serviceTitle}</span></>
                    )}
                  </p>
                  {/* Date */}
                  <span className="text-xs text-gray-400 flex-shrink-0 hidden xs:block">
                    {formatDate(d.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ RECENT SECTIONS 2×2 GRID ══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

          {/* Recent NGOs */}
          <SectionCard title="Recent NGOs" linkTo="/admin/ngos">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={TH}>Name</th>
                  <th className={TH}>Status</th>
                  <th className={`${TH} hidden sm:table-cell`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.ngos.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-sm text-gray-400">No NGOs yet</td>
                  </tr>
                ) : recent.ngos.map((n) => (
                  <tr key={n._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className={`${TD} font-medium text-gray-800 max-w-[140px] truncate`}>{n.ngoName}</td>
                    <td className={TD}>
                      <StatusPill label={n.isVerified ? "Verified" : "Pending"} variant={n.isVerified ? "green" : "yellow"} />
                    </td>
                    <td className={`${TD} text-gray-400 hidden sm:table-cell`}>{formatDate(n.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          {/* Recent Volunteers */}
          <SectionCard title="Recent Volunteers" linkTo="/admin/volunteers">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={TH}>Name</th>
                  <th className={TH}>Status</th>
                  <th className={`${TH} hidden sm:table-cell`}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.volunteers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-sm text-gray-400">No volunteers yet</td>
                  </tr>
                ) : recent.volunteers.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className={`${TD} font-medium text-gray-800 max-w-[140px] truncate`}>{v.fullName}</td>
                    <td className={TD}>
                      <StatusPill
                        label={v.status}
                        variant={v.status === "Approved" ? "green" : v.status === "Rejected" ? "red" : "yellow"}
                      />
                    </td>
                    <td className={`${TD} text-gray-400 hidden sm:table-cell`}>{formatDate(v.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          {/* Recent Contacts */}
          <SectionCard title="Recent Contacts" linkTo="/admin/contacts">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={TH}>Name</th>
                  <th className={`${TH} hidden sm:table-cell`}>Subject</th>
                  <th className={TH}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.contacts.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-sm text-gray-400">No contacts yet</td>
                  </tr>
                ) : recent.contacts.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className={`${TD} font-medium text-gray-800`}>{c.name}</td>
                    <td className={`${TD} text-gray-500 max-w-[160px] truncate hidden sm:table-cell`}>{c.subject}</td>
                    <td className={TD}>
                      <StatusPill
                        label={c.status}
                        variant={c.status === "Resolved" ? "green" : c.status === "Spam" ? "red" : c.status === "In Progress" ? "blue" : "yellow"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

          {/* Recent Users */}
          <SectionCard title="Recent Users" linkTo="/admin/users">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={TH}>Name</th>
                  <th className={`${TH} hidden sm:table-cell`}>Email</th>
                  <th className={TH}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recent.users.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-sm text-gray-400">No users yet</td>
                  </tr>
                ) : recent.users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className={`${TD} font-medium text-gray-800`}>{u.name}</td>
                    <td className={`${TD} text-gray-400 max-w-[180px] truncate hidden sm:table-cell`}>{u.email}</td>
                    <td className={`${TD} text-gray-400 whitespace-nowrap`}>{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
