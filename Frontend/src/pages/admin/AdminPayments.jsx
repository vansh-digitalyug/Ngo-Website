import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const LIMIT = 8;

const AVATAR_HEX = [
  "#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444",
  "#8b5cf6","#ec4899","#14b8a6","#f97316","#84cc16",
];
const avatarColor = (name) =>
  AVATAR_HEX[(name?.charCodeAt(0) || 0) % AVATAR_HEX.length];

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const initials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

export default function AdminPayments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [donations, setDonations]       = useState([]);
  const [summary, setSummary]           = useState({ totalAmount: 0, totalCount: 0 });
  const [pagination, setPagination]     = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(Number(searchParams.get("page")) || 1);
  const [growth, setGrowth]             = useState(null); // null = loading, false = unavailable

  const token = localStorage.getItem("token");

  // Fetch month-over-month growth: this month vs last month
  useEffect(() => {
    if (!token) return;
    const now            = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
    const hdrs           = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE_URL}/api/admin/donations?status=paid&startDate=${thisMonthStart}&limit=1`, { headers: hdrs, credentials: "include" }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/admin/donations?status=paid&startDate=${lastMonthStart}&endDate=${lastMonthEnd}&limit=1`, { headers: hdrs, credentials: "include" }).then(r => r.json()),
    ])
      .then(([thisRes, lastRes]) => {
        const curr = thisRes?.data?.summary?.totalAmount || 0;
        const prev = lastRes?.data?.summary?.totalAmount || 0;
        if (prev === 0) { setGrowth(false); return; }
        setGrowth(((curr - prev) / prev) * 100);
      })
      .catch(() => setGrowth(false));
  }, [token]);

  const fetchDonations = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("status", "paid");
    params.set("page", page);
    params.set("limit", LIMIT);

    fetch(`${API_BASE_URL}/api/admin/donations?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setDonations(d.data.donations || []);
          setSummary(d.data.summary    || { totalAmount: 0, totalCount: 0 });
          setPagination(d.data.pagination || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, token]);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);

  useEffect(() => {
    const p = {};
    if (page > 1) p.page = page;
    setSearchParams(p, { replace: true });
  }, [page, setSearchParams]);

  const donorName = (d) => {
    if (d.isAnonymous) return "Anonymous";
    return d.donorName || d.user?.name || d.user?.email || "Guest";
  };

  const serviceLabel = (d) =>
    !d.serviceTitle || d.serviceTitle === "General Donation"
      ? "General Donation"
      : d.serviceTitle;

  const ngoLabel = (d) => d.ngoId?.ngoName || "Platform";

  const currentYear = new Date().getFullYear();
  const fiscalYear  = `${currentYear - 1}–${String(currentYear).slice(-2)}`;

  return (
    <div className="min-h-screen">

      {/* ── Page Header ───────────────────────────────── */}
      <div className="flex flex-col gap-5 mb-8 sm:flex-row sm:items-start sm:justify-between">

        {/* Left: heading */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight m-0 p-0">
            <span className="text-olive-900">Financial</span><br />
            <span className="text-olive-600">Momentum.</span>
          </h1>
        </div>

        {/* Right: stat pill */}
        <div className="flex gap-3">
          {/* Lime pill: Paid Donations count */}
          <div className="bg-lime rounded-2xl px-5 py-4 min-w-[120px]">
            <div className="text-2xl font-extrabold text-olive-900 leading-none">
              {summary.totalCount || 0}
            </div>
            <div className="text-xs font-semibold text-olive-700 mt-1">Paid Donations</div>
          </div>
        </div>
      </div>

      {/* ── Total Collected Banner ─────────────────────── */}
      <div className="bg-beige-100 border border-beige-200 rounded-2xl p-6 sm:p-8 mb-8">
        <div className="text-[10px] font-bold uppercase tracking-widest text-olive-400 mb-3">
          Total Collected
        </div>
        <div className="flex flex-wrap items-end gap-2 mb-5">
          <span className="text-5xl sm:text-6xl font-extrabold text-olive-900 leading-none">
            ₹{fmtINR(summary.totalAmount)}
          </span>
          <span className="text-base font-bold text-olive-400 pb-1">INR</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {growth !== null && growth !== false && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${growth >= 0 ? "bg-lime text-olive-800" : "bg-red-100 text-red-700"}`}>
              {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {growth >= 0 ? "+" : ""}{growth.toFixed(1)}% vs last month
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 bg-beige-200 text-olive-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            Fiscal Year {fiscalYear}
          </span>
        </div>
      </div>

      {/* ── Donor Activity ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-beige-200 overflow-hidden">

        {/* Section header */}
        <div className="px-5 sm:px-6 py-5 border-b border-beige-100">
          <h2 className="text-lg sm:text-xl font-extrabold text-olive-900 m-0 p-0">Donor Activity</h2>
          <p className="text-sm text-olive-400 mt-0.5 m-0 p-0">
            Real-time ledger of global contributions
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-olive-400 text-sm">Loading payments…</div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center text-olive-400 text-sm">No payments found.</div>
        ) : (
          <>
            {/* Desktop column headers */}
            <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr] gap-4 px-6 py-3 bg-beige-50 border-b border-beige-100">
              {["Donor", "Service / NGO", "Amount", "Status"].map((h) => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-olive-400">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            <ul className="divide-y divide-beige-100 list-none m-0 p-0">
              {donations.map((d) => {
                const name = donorName(d);
                const bg   = avatarColor(name);
                return (
                  <li
                    key={d._id}
                    className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-beige-50 transition-colors"
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: bg }}
                    >
                      {initials(name)}
                    </div>

                    {/* Content grid */}
                    <div className="flex-1 min-w-0 sm:grid sm:grid-cols-[2fr_2fr_1fr_1fr] sm:gap-4 sm:items-center">

                      {/* Donor */}
                      <div className="min-w-0">
                        <div className="font-bold text-olive-900 text-sm truncate">{name}</div>
                        {d.user?.email && (
                          <div className="text-xs text-olive-400 truncate">{d.user.email}</div>
                        )}
                      </div>

                      {/* Service / NGO — hidden on mobile, shown on sm+ */}
                      <div className="hidden sm:block min-w-0">
                        <div className="text-sm text-olive-700 font-medium truncate">
                          {serviceLabel(d)}
                        </div>
                        <div className="text-xs text-olive-400 truncate">{ngoLabel(d)}</div>
                      </div>

                      {/* Amount + mobile service */}
                      <div>
                        <div className="font-extrabold text-olive-900 text-sm whitespace-nowrap">
                          ₹{fmtINR(d.amount)}
                        </div>
                        {/* Service shown below amount on mobile */}
                        <div className="sm:hidden text-xs text-olive-400 mt-0.5 truncate">
                          {serviceLabel(d)} · {ngoLabel(d)}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="hidden sm:flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
                          Paid
                        </span>
                        <span className="text-xs text-olive-400">{fmtDate(d.createdAt)}</span>
                      </div>
                    </div>

                    {/* Mobile: status dot on far right */}
                    <div className="sm:hidden flex-shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        Paid
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-beige-100">
                <span className="text-sm text-olive-500">
                  Page {page} of {pagination.totalPages}
                  <span className="hidden sm:inline"> · {pagination.total} total</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page <= 1}
                    className="w-9 h-9 rounded-full border-2 border-olive-300 flex items-center justify-center text-olive-600 hover:border-olive-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= pagination.totalPages}
                    className="w-9 h-9 rounded-full bg-olive-700 flex items-center justify-center text-white hover:bg-olive-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
