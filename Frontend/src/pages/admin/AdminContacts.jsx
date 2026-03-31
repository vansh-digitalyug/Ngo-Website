import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Mail, Send, X, ChevronLeft, ChevronRight, Loader,
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";
import { useFlash } from "../../components/common/FlashMessage.jsx";

const STATUS_OPTIONS = ["New", "In Progress", "Resolved", "Spam"];
const LIMIT = 8;

/* ── Avatar palette ── */
const PALETTE = [
  { bg: "#d8e8b8", text: "#3a5c1a" },
  { bg: "#c7d9f0", text: "#1e40af" },
  { bg: "#fde68a", text: "#92400e" },
  { bg: "#fecaca", text: "#991b1b" },
  { bg: "#e9d5ff", text: "#6d28d9" },
  { bg: "#fed7aa", text: "#9a3412" },
  { bg: "#d1fae5", text: "#065f46" },
];
const avatarStyle = (name) => PALETTE[(name || " ").charCodeAt(0) % PALETTE.length];
const getInitials = (name) =>
  (name || "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/* ── Outlined status pill ── */
function StatusBadge({ status }) {
  const cfg = {
    "New":         "border border-red-300 text-red-500 bg-red-50",
    "In Progress": "border border-blue-300 text-blue-600 bg-blue-50",
    "Resolved":    "border border-green-400 text-green-600 bg-green-50",
    "Replied":     "border border-gray-300 text-gray-500 bg-gray-50",
    "Spam":        "border border-purple-300 text-purple-600 bg-purple-50",
  };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${cfg[status] || "border border-gray-300 text-gray-500 bg-gray-50"}`}>
      {status}
    </span>
  );
}

/* ── Pagination helper ── */
function pageRange(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "...", total];
  if (current >= total - 2) return [1, "...", total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "—";

/* ════════════════════════════════════════════════════ */
function AdminContacts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contacts,      setContacts]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState(searchParams.get("search") || "");
  const [statusFilter,  setStatusFilter]  = useState(searchParams.get("status") || "");
  const [page,          setPage]          = useState(Number(searchParams.get("page")) || 1);
  const [pagination,    setPagination]    = useState({ total: 0, pages: 1 });
  const [actionLoading, setActionLoading] = useState(null);

  /* Modal state with smooth transition */
  const [selected,    setSelected]    = useState(null);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [replyMsg,    setReplyMsg]    = useState("");
  const [sending,     setSending]     = useState(false);

  const token = localStorage.getItem("token");
  const flash = useFlash();

  /* ── Fetch contacts list ── */
  const fetchContacts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)       params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page",  page);
    params.set("limit", LIMIT);
    fetch(`${API_BASE_URL}/api/contact/all?${params}`, {
      headers: { Authorization: `Bearer ${token}` }, credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setContacts(d.contacts || []);
          const total = d.count || 0;
          setPagination({ total, pages: Math.ceil(total / LIMIT) || 1 });
        }
      })
      .catch(() => flash.error("Failed to load contacts"))
      .finally(() => setLoading(false));
  }, [search, statusFilter, page, token, flash]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  useEffect(() => {
    const p = {};
    if (search)       p.search = search;
    if (statusFilter) p.status = statusFilter;
    if (page > 1)     p.page   = page;
    setSearchParams(p, { replace: true });
  }, [search, statusFilter, page, setSearchParams]);

  /* ── Modal open / close with transition ── */
  const openModal = (c) => {
    setSelected(c);
    setReplyMsg("");
    requestAnimationFrame(() => requestAnimationFrame(() => setModalOpen(true)));
  };
  const closeModal = () => {
    if (sending) return;
    setModalOpen(false);
    setTimeout(() => { setSelected(null); setReplyMsg(""); }, 320);
  };

  /* ── API actions ── */
  const updateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const d = await res.json();
      if (d.success) {
        flash.success(`Status updated to "${status}"`);
        fetchContacts();
        if (selected?._id === id) setSelected({ ...selected, status });
      } else flash.error(d.message || "Failed to update status");
    } catch { flash.error("Network error"); }
    finally { setActionLoading(null); }
  };

  const deleteContact = async (id) => {
    if (!confirm("Delete this contact message? This cannot be undone.")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }, credentials: "include",
      });
      const d = await res.json();
      if (d.success) {
        flash.success("Contact deleted");
        if (selected?._id === id) closeModal();
        fetchContacts();
      } else flash.error(d.message || "Failed to delete");
    } catch { flash.error("Network error"); }
    finally { setActionLoading(null); }
  };

  const sendReply = async () => {
    if (!replyMsg.trim() || replyMsg.trim().length < 10) {
      flash.warning("Reply must be at least 10 characters");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${selected._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ replyMessage: replyMsg.trim(), adminName: "SevaIndia Support Team" }),
      });
      const d = await res.json();
      if (d.success) {
        flash.success(`Reply sent to ${selected.email}`);
        closeModal();
        fetchContacts();
      } else flash.error(d.message || "Failed to send reply");
    } catch { flash.error("Network error"); }
    finally { setSending(false); }
  };

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8]">
      <div className="p-4 sm:p-6 lg:p-8">

        {/* ══ HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl border-2 border-[#2d5a1b] flex items-center justify-center flex-shrink-0 mt-1">
              <Mail size={20} className="text-[#2d5a1b]" />
            </div>
            <div>
              <h1 className="text-[1.8rem] sm:text-[2.4rem] font-black text-gray-900 leading-tight m-0">
                Manage Contacts
              </h1>
              <p className="text-sm text-gray-500 mt-1 m-0 max-w-lg leading-relaxed">
                Review and respond to inquiries from global partners, volunteers, and the community.
                Impact begins with every conversation.
              </p>
            </div>
          </div>
        </div>

        {/* ══ FILTERS ══ */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by name, email, subject..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer shadow-sm w-full sm:w-[160px]"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* ══ TABLE CARD ══ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading contacts…</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No contacts found.</div>
          ) : (
            <>
              {/* ── Desktop table (lg+) ── */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#fafaf9] border-b border-gray-100">
                      {["Name", "Email", "Subject", "Status", "Date", "Actions"].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c) => {
                      const av   = avatarStyle(c.name);
                      const busy = actionLoading === c._id;
                      return (
                        <tr
                          key={c._id}
                          className={`border-b border-gray-50 last:border-b-0 transition-colors hover:bg-gray-50/50 ${c.status === "New" ? "bg-red-50/20" : ""}`}
                        >
                          {/* Name + Avatar */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                style={{ background: av.bg, color: av.text }}
                              >
                                {getInitials(c.name)}
                              </div>
                              <span className="font-semibold text-gray-800 text-sm leading-snug">
                                {c.name}
                              </span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-5 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                            {c.email}
                          </td>

                          {/* Subject */}
                          <td className="px-5 py-4 text-sm text-gray-700 max-w-[180px]">
                            <span className="line-clamp-2 leading-snug">{c.subject}</span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <StatusBadge status={c.status} />
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">
                            {formatDate(c.createdAt)}
                          </td>

                          {/* Actions — two colored circles */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openModal(c)}
                                title="Reply"
                                className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors border-0 cursor-pointer"
                              >
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                              </button>
                              <button
                                onClick={() => deleteContact(c._id)}
                                disabled={busy}
                                title="Delete"
                                className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors border-0 cursor-pointer disabled:opacity-40"
                              >
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile + Tablet cards (< lg) ── */}
              <div className="lg:hidden divide-y divide-gray-100">
                {contacts.map((c) => {
                  const av   = avatarStyle(c.name);
                  const busy = actionLoading === c._id;
                  return (
                    <div key={c._id} className={`px-4 py-4 sm:px-5 sm:py-5 ${c.status === "New" ? "bg-red-50/30" : ""}`}>

                      {/* Row 1: Avatar + Name + Status */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm"
                          style={{ background: av.bg, color: av.text }}>
                          {getInitials(c.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm m-0 truncate">{c.name}</p>
                          <p className="text-xs text-gray-400 m-0 mt-0.5 truncate">{c.email}</p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>

                      {/* Row 2: Subject + Date chips */}
                      <div className="flex flex-wrap gap-2 mb-3 pl-[3.25rem]">
                        <span className="text-xs text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full line-clamp-1 max-w-[200px]">
                          📋 {c.subject}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                          🕐 {formatDate(c.createdAt)}
                        </span>
                      </div>

                      {/* Row 3: Actions */}
                      <div className="flex items-center gap-2 pl-[3.25rem]">
                        <button onClick={() => openModal(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 border-0 cursor-pointer transition-colors">
                          <Send size={12} /> Reply
                        </button>
                        <button onClick={() => updateStatus(c._id, "Resolved")} disabled={busy || c.status === "Resolved"}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 border-0 cursor-pointer transition-colors disabled:opacity-40">
                          Resolve
                        </button>
                        <button onClick={() => deleteContact(c._id)} disabled={busy}
                          className="ml-auto px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 border-0 cursor-pointer transition-colors disabled:opacity-40">
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ══ FOOTER: count + numbered pagination ══ */}
        {!loading && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <p className="text-sm text-gray-500 m-0">
              Showing{" "}
              <strong className="text-gray-800">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)}</strong>
              {" "}of{" "}
              <strong className="text-gray-800">{pagination.total.toLocaleString()}</strong> contact requests
            </p>
            {pagination.pages > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  <ChevronLeft size={16} />
                </button>
                {pageRange(page, pagination.pages).map((n, i) =>
                  n === "..." ? (
                    <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                  ) : (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors cursor-pointer border-0 ${
                        page === n ? "bg-[#2d5a1b] text-white shadow-sm" : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                      }`}>
                      {n}
                    </button>
                  )
                )}
                <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.pages}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ REPLY MODAL — smooth slide-up transition ══ */}
        {selected && (
          <>
            {/* Backdrop */}
            <div
              onClick={closeModal}
              className="fixed inset-0 z-[9998] transition-all duration-300"
              style={{ background: modalOpen ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)" }}
            />

            {/* Sheet: bottom on mobile, centred on sm+ */}
            <div className="fixed z-[9999] inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 pointer-events-none">
              <div
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl transition-all duration-300 ease-out"
                style={{
                  transform: modalOpen ? "translateY(0)" : "translateY(40px)",
                  opacity:   modalOpen ? 1 : 0,
                }}
              >
                {/* Pull handle — mobile only */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: avatarStyle(selected.name).bg, color: avatarStyle(selected.name).text }}>
                      {getInitials(selected.name)}
                    </div>
                    <div>
                      <h3 className="m-0 text-base font-bold text-gray-900 leading-tight">{selected.name}</h3>
                      <p className="m-0 text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{selected.email}</p>
                    </div>
                  </div>
                  <button onClick={closeModal} disabled={sending}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors border-0 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="px-5 sm:px-6 py-5">
                  {/* To / Subject */}
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-5">
                    <p className="text-sm text-green-800 m-0 mb-1">
                      <span className="font-bold">To:</span> {selected.name} &lt;{selected.email}&gt;
                    </p>
                    <p className="text-sm text-green-800 m-0">
                      <span className="font-bold">Subject:</span> Re: {selected.subject}
                    </p>
                  </div>

                  {/* Original message */}
                  <div className="mb-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 m-0">
                      Original Message
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 italic leading-relaxed max-h-28 overflow-y-auto">
                      "{selected.message}"
                    </div>
                  </div>

                  {/* Status quick-change */}
                  <div className="mb-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 m-0">
                      Update Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selected._id, s)}
                          disabled={selected.status === s || actionLoading === selected._id}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-40 ${
                            selected.status === s
                              ? "bg-[#2d5a1b] text-white border-[#2d5a1b]"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reply textarea */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Your Reply <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={replyMsg}
                      onChange={(e) => setReplyMsg(e.target.value)}
                      placeholder="Write your professional response here..."
                      disabled={sending}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm leading-relaxed resize-y outline-none focus:border-[#2d5a1b] transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-1 m-0">
                      {replyMsg.trim().length} / minimum 10 characters
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-2.5 px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                  <button onClick={closeModal} disabled={sending}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button
                    onClick={sendReply}
                    disabled={sending || replyMsg.trim().length < 10}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#2d5a1b] hover:bg-[#1f3f12] transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {sending ? <><Loader size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send Reply</>}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default AdminContacts;
