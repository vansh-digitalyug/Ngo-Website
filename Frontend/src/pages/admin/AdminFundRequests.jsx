import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle, XCircle, Send, Search,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Wallet, AlertCircle, RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const AVATAR_HEX = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
const avatarColor = (name) => AVATAR_HEX[(name?.charCodeAt(0) || 0) % AVATAR_HEX.length];
const getInitials = (name) =>
  name ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";

const STATUS_META = {
  Pending:  { label: "PENDING",  cls: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  Approved: { label: "APPROVED", cls: "bg-lime text-olive-800",         dot: "bg-olive-600"  },
  Released: { label: "RELEASED", cls: "bg-olive-100 text-olive-700",    dot: "bg-olive-500"  },
  Rejected: { label: "REJECTED", cls: "bg-red-100 text-red-600",        dot: "bg-red-500"    },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status?.toUpperCase(), cls: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${m.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />
      {m.label}
    </span>
  );
}

const LIMIT = 8;

export default function AdminFundRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [pagination, setPagination]       = useState({ total: 0, totalPages: 1, page: 1 });
  const [statusFilter, setStatusFilter]   = useState(searchParams.get("status") || "");
  const [search, setSearch]               = useState(searchParams.get("search") || "");
  const [page, setPage]                   = useState(Number(searchParams.get("page")) || 1);
  const [expandedId, setExpandedId]       = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [noteInputs, setNoteInputs]       = useState({});

  const token = localStorage.getItem("token");

  const fetchRequests = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (search)       params.set("search", search);
    params.set("page", page);
    params.set("limit", LIMIT);

    fetch(`${API_BASE_URL}/api/admin/funds?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRequests(d.data.requests || []);
          setPagination(d.data.pagination || {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter, search, page, token]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    const p = {};
    if (statusFilter) p.status = statusFilter;
    if (search)       p.search = search;
    if (page > 1)     p.page   = page;
    setSearchParams(p, { replace: true });
  }, [statusFilter, search, page, setSearchParams]);

  const updateStatus = async (id, status) => {
    setActionLoading(`${id}-${status}`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/funds/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status, adminNote: noteInputs[id] || "" }),
      });
      const d = await res.json();
      if (d.success) { fetchRequests(); setExpandedId(null); }
      else alert(d.message || "Failed to update status");
    } catch { alert("Network error"); }
    finally { setActionLoading(null); }
  };

  const handleFilterChange = (f) => { setStatusFilter(f); setPage(1); setExpandedId(null); };
  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const statusCounts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-beige-300 p-3 sm:p-5 lg:p-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-1 sm:mb-2">
            Fund Requests
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm lg:text-base max-w-lg leading-relaxed">
            Review and process ongoing funding applications from verified NGO partners.
          </p>
        </div>
        {/* Summary pills */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <div className="px-3 sm:px-4 py-2 rounded-2xl bg-beige-100 border border-beige-300 text-center">
            <div className="text-lg sm:text-2xl font-extrabold text-gray-900 leading-none">{pagination.total}</div>
            <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">Total</div>
          </div>
          <div className="px-3 sm:px-4 py-2 rounded-2xl bg-yellow-50 border border-yellow-100 text-center">
            <div className="text-lg sm:text-2xl font-extrabold text-yellow-700 leading-none">{statusCounts.Pending || 0}</div>
            <div className="text-[10px] sm:text-xs font-bold text-yellow-500 uppercase tracking-wider mt-0.5">Pending</div>
          </div>
          <div className="px-3 sm:px-4 py-2 rounded-2xl bg-olive-50 border border-olive-100 text-center">
            <div className="text-lg sm:text-2xl font-extrabold text-olive-700 leading-none">{statusCounts.Released || 0}</div>
            <div className="text-[10px] sm:text-xs font-bold text-olive-500 uppercase tracking-wider mt-0.5">Released</div>
          </div>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by NGO name or purpose..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-2xl text-sm outline-none bg-white focus:border-olive-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {[["", "All"], ["Pending", "Pending"], ["Approved", "Approved"], ["Released", "Released"], ["Rejected", "Rejected"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => handleFilterChange(val)}
              className={`px-3 py-2 rounded-2xl border text-xs font-semibold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                statusFilter === val
                  ? "bg-olive-700 text-white border-olive-700"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Request List ── */}
      {loading ? (
        <div className="bg-beige-100 rounded-3xl p-12 flex items-center justify-center gap-2 text-gray-400">
          <RefreshCw size={20} className="animate-spin" />
          <span className="text-sm">Loading fund requests…</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-beige-100 rounded-3xl p-12 text-center text-gray-400">
          <Wallet size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No fund requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const ngoName   = req.ngoId?.ngoName || req.ngoName || "NGO";
            const isExpanded = expandedId === req._id;
            const canAct    = req.status !== "Rejected" && req.status !== "Released";

            return (
              <div
                key={req._id}
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-beige-300"
              >
                {/* ── Collapsed header row — always visible, clickable ── */}
                <div
                  onClick={() => toggleExpand(req._id)}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 cursor-pointer hover:bg-beige-50 transition-colors select-none"
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-sm sm:text-base shrink-0"
                    style={{ background: avatarColor(ngoName) }}
                  >
                    {getInitials(ngoName)}
                  </div>

                  {/* Name + ID */}
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-gray-900 text-sm sm:text-base leading-tight truncate">
                      {ngoName}
                    </div>
                    </div>

                  {/* Status badge — hidden on very small, shown sm+ */}
                  <div className="hidden sm:block shrink-0">
                    <StatusBadge status={req.status} />
                  </div>

                  {/* Amount */}
                  <div className="shrink-0 text-right">
                    <div className="font-extrabold text-gray-900 text-sm sm:text-base whitespace-nowrap">
                      {fmt(req.amount)}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5 hidden sm:block">
                      {fmtDate(req.createdAt)}
                    </div>
                  </div>

                  {/* Chevron */}
                  <div className="shrink-0 ml-1">
                    {isExpanded
                      ? <ChevronUp size={18} className="text-gray-400" />
                      : <ChevronDown size={18} className="text-gray-400" />
                    }
                  </div>
                </div>

                {/* ── Expanded details ── */}
                {isExpanded && (
                  <div className="border-t border-beige-300 px-4 sm:px-6 py-4 sm:py-5 space-y-4">

                    {/* Status badge on mobile */}
                    <div className="flex items-center gap-2 sm:hidden">
                      <StatusBadge status={req.status} />
                      <span className="text-gray-400 text-xs">{fmtDate(req.createdAt)}</span>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-beige-100 rounded-2xl px-4 py-3">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount Requested</div>
                        <div className="text-lg sm:text-xl font-extrabold text-gray-900">{fmt(req.amount)}</div>
                      </div>
                      <div className="bg-beige-100 rounded-2xl px-4 py-3">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                          {req.releasedAt ? "Released On" : "Submitted"}
                        </div>
                        <div className="text-base sm:text-lg font-extrabold text-gray-900">
                          {req.releasedAt ? fmtDate(req.releasedAt) : fmtDate(req.createdAt)}
                        </div>
                      </div>
                      {req.ngoId?.city && (
                        <div className="bg-beige-100 rounded-2xl px-4 py-3">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Location</div>
                          <div className="text-sm font-semibold text-gray-700">
                            {[req.ngoId.city, req.ngoId.state].filter(Boolean).join(", ")}
                          </div>
                        </div>
                      )}
                      {req.ngoId?.email && (
                        <div className="bg-beige-100 rounded-2xl px-4 py-3">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</div>
                          <div className="text-sm font-semibold text-gray-700 truncate">{req.ngoId.email}</div>
                        </div>
                      )}
                    </div>

                    {/* Purpose */}
                    {req.purpose && (
                      <div className="bg-beige-100 rounded-2xl px-4 py-3">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Purpose</div>
                        <p className="text-sm text-gray-700 leading-relaxed">{req.purpose}</p>
                      </div>
                    )}

                    {/* Description */}
                    {req.description && (
                      <div className="bg-beige-100 rounded-2xl px-4 py-3">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</div>
                        <p className="text-sm text-gray-600 leading-relaxed">{req.description}</p>
                      </div>
                    )}

                    {/* Existing admin note */}
                    {req.adminNote && (
                      <div className="bg-olive-50 rounded-2xl px-4 py-3 border border-olive-200">
                        <div className="text-xs font-bold text-olive-600 uppercase tracking-wider mb-1">Admin Note</div>
                        <p className="text-sm text-olive-700">{req.adminNote}</p>
                      </div>
                    )}

                    {/* Acknowledged */}
                    {req.isResolved && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-olive-50 rounded-2xl border border-olive-200">
                        <CheckCircle size={15} className="text-olive-600 shrink-0" />
                        <span className="text-sm font-semibold text-olive-700">NGO has acknowledged receipt of funds</span>
                      </div>
                    )}

                    {/* Verified badge */}
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-olive-600" />
                      <span className="text-xs font-semibold text-gray-500">Verified Partner</span>
                    </div>

                    {/* Action area */}
                    {canAct && (
                      <div className="border-t border-beige-300 pt-4 space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <AlertCircle size={11} /> Admin Notes
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Add disbursement notes here..."
                            value={noteInputs[req._id] || ""}
                            onChange={(e) => setNoteInputs((p) => ({ ...p, [req._id]: e.target.value }))}
                            className="w-full px-4 py-3 bg-beige-100 rounded-2xl text-sm outline-none placeholder-gray-400 focus:ring-2 focus:ring-olive-400 transition-all border-0 resize-none"
                          />
                        </div>

                        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                          {req.status === "Pending" && (
                            <>
                              <button
                                disabled={!!actionLoading}
                                onClick={() => updateStatus(req._id, "Approved")}
                                className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border-0 cursor-pointer ${
                                  actionLoading === `${req._id}-Approved`
                                    ? "bg-lime/60 text-olive-800 cursor-not-allowed"
                                    : "bg-lime text-olive-900 hover:brightness-95"
                                }`}
                              >
                                <CheckCircle size={15} />
                                {actionLoading === `${req._id}-Approved` ? "Approving…" : "Approve"}
                              </button>
                              <button
                                disabled={!!actionLoading}
                                onClick={() => updateStatus(req._id, "Rejected")}
                                className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors border cursor-pointer ${
                                  actionLoading === `${req._id}-Rejected`
                                    ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed"
                                    : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                }`}
                              >
                                <XCircle size={15} />
                                {actionLoading === `${req._id}-Rejected` ? "Rejecting…" : "Reject"}
                              </button>
                            </>
                          )}
                          {req.status === "Approved" && (
                            <button
                              disabled={!!actionLoading}
                              onClick={() => updateStatus(req._id, "Released")}
                              className={`w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors border-0 cursor-pointer ${
                                actionLoading === `${req._id}-Released`
                                  ? "bg-olive-400 text-white cursor-not-allowed"
                                  : "bg-olive-700 hover:bg-olive-800 text-white"
                              }`}
                            >
                              <Send size={16} />
                              {actionLoading === `${req._id}-Released` ? "Releasing…" : "Release Funds Now"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 sm:mt-7 pt-4 sm:pt-5 border-t border-beige-400">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Page {page} of {pagination.totalPages}
            <span className="hidden sm:inline"> · {pagination.total} total</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-9 h-9 rounded-full border border-beige-400 bg-white flex items-center justify-center text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:border-gray-400 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-9 h-9 rounded-full bg-olive-700 hover:bg-olive-800 border-0 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
