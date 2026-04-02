import React, { useState, useEffect, useCallback } from "react";
import {
  UserCheck, Plus, X, Search, RefreshCw, MapPin,
  CheckCircle, ChevronRight, ChevronLeft, Trash2, HandCoins,
} from "lucide-react";
import { API_BASE_URL } from "./AdminLayout.jsx";

const token = () => localStorage.getItem("token");
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const matchesService = (volunteer, serviceTitle) => {
  if (!serviceTitle || serviceTitle === "General Donation") return false;
  const title = serviceTitle.toLowerCase();
  return (volunteer.interests || []).some((interest) => {
    const i = interest.toLowerCase();
    return title.includes(i) || i.split(" ").some((w) => w.length > 2 && title.includes(w));
  });
};

const AVATAR_HEX = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
const avatarColor = (name) => AVATAR_HEX[(name?.charCodeAt(0) || 0) % AVATAR_HEX.length];

// ── Assign Task Modal ──────────────────────────────────────────────────────────
function AssignModal({ donation, volunteers, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ volunteerId: "", title: "", description: "", adminNote: "" });
  const [selectedVol, setSelectedVol] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const serviceTitle = donation.serviceTitle || "General Donation";
  const donorLabel = donation.isAnonymous
    ? "Anonymous"
    : donation.donorName || donation.user?.name || "Donor";

  const filtered = volunteers.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.fullName.toLowerCase().includes(q) ||
      (v.email || "").toLowerCase().includes(q) ||
      (v.city || "").toLowerCase().includes(q)
    );
  });

  const matched = filtered.filter((v) => matchesService(v, serviceTitle));
  const other = filtered.filter((v) => !matchesService(v, serviceTitle));
  const selectVol = (v) => { setSelectedVol(v); set("volunteerId", v._id); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.volunteerId || !form.title.trim()) {
      setErr("Please fill out this field");
      return;
    }
    setSaving(true); setErr("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        credentials: "include",
        body: JSON.stringify({ donationId: donation._id, ...form }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      onSuccess();
    } catch (e) {
      setErr(e.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const VolCard = ({ v, isMatch }) => {
    const isSelected = selectedVol?._id === v._id;
    const initials = v.fullName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
    return (
      <div
        onClick={() => selectVol(v)}
        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
          isSelected
            ? "bg-olive-50 ring-2 ring-olive-500"
            : "bg-beige-100 hover:bg-beige-200"
        }`}
      >
        {/* Avatar with check overlay */}
        <div className="relative shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base"
            style={{ background: avatarColor(v.fullName) }}
          >
            {initials}
          </div>
          {isSelected && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-olive-600 rounded-full flex items-center justify-center">
              <CheckCircle size={12} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-[15px] leading-tight mb-1">{v.fullName}</div>
          <div className="flex items-center gap-2 flex-wrap">
            {isMatch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-lime text-olive-800">
                ⚡ {matched.length} interest match
              </span>
            )}
            {(v.city || v.state) && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={10} /> {[v.city, v.state].filter(Boolean).join(", ")}
              </span>
            )}
            {!isMatch && v.interests?.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                ☆ {v.interests.slice(0, 1).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-[500px] max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 shrink-0" />

        {/* ── Top header (white) ── */}
        <div className="px-6 pt-5 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight mb-0.5">
                Assign Task to Volunteer
              </h2>
              {step === 1 ? (
                <p className="text-sm text-gray-500 m-0">Step 1 of 2 — Select Volunteer</p>
              ) : (
                <p className="text-xs font-bold text-olive-600 uppercase tracking-widest m-0">
                  Step 2 of 2 — Task Details
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center border-0 cursor-pointer text-gray-500 transition-colors shrink-0 mt-0.5"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              {/* Donor card */}
              <div className="flex items-center gap-4 bg-beige-100 rounded-2xl px-4 py-3.5 mb-5 border-l-4 border-olive-600">
                <div className="w-10 h-10 rounded-full bg-olive-100 flex items-center justify-center shrink-0">
                  <HandCoins size={20} className="text-olive-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-olive-600 uppercase tracking-wider mb-0.5">
                    Donor: {donorLabel}
                  </div>
                  <div className="text-[15px] font-semibold text-gray-800 truncate">{serviceTitle}</div>
                </div>
                <div className="text-xl font-extrabold text-gray-900 shrink-0">{fmt(donation.amount)}</div>
              </div>

              {/* Search */}
              <div className="relative mb-5">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedVol(null); set("volunteerId", ""); }}
                  placeholder="Search volunteers by name or skills..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none bg-beige-100 placeholder-gray-400 focus:ring-2 focus:ring-olive-400 transition-all border-0"
                />
              </div>

              {/* Volunteer list */}
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <UserCheck size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No volunteers found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {matched.length > 0 && (
                    <>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Top Matches</p>
                      {matched.map((v) => <VolCard key={v._id} v={v} isMatch />)}
                    </>
                  )}
                  {other.length > 0 && (
                    <>
                      {matched.length > 0 && (
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-3 mb-2">
                          All Volunteers
                        </p>
                      )}
                      {other.map((v) => <VolCard key={v._id} v={v} isMatch={false} />)}
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              {/* Selected volunteer card */}
              {selectedVol && (
                <div className="flex items-center gap-4 bg-beige-100 rounded-2xl px-4 py-3.5 mb-6">
                  <div className="relative shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base"
                      style={{ background: avatarColor(selectedVol.fullName) }}
                    >
                      {selectedVol.fullName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-olive-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={11} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-[15px] truncate">{selectedVol.fullName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {[selectedVol.city, selectedVol.state].filter(Boolean).join(", ") || "Volunteer"}
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm font-bold text-olive-600 hover:text-olive-800 bg-transparent border-0 cursor-pointer transition-colors shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}

              <form id="task-form" onSubmit={submit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none bg-beige-100 placeholder-gray-400 focus:ring-2 focus:ring-olive-400 transition-all border-0"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="e.g. Weekly Food Distribution Coordination"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none bg-beige-100 placeholder-gray-400 focus:ring-2 focus:ring-olive-400 transition-all border-0 resize-none"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Briefly describe the purpose of this assignment..."
                  />
                  {err && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs font-semibold">
                      <span className="text-base">ⓘ</span> {err}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Instructions for Volunteer
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none bg-beige-100 placeholder-gray-400 focus:ring-2 focus:ring-olive-400 transition-all border-0 resize-none"
                      value={form.adminNote}
                      onChange={(e) => set("adminNote", e.target.value)}
                      placeholder="List specific steps or requirements for the volunteer..."
                    />
                    <span className="absolute bottom-3 right-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">
                      Rich Text Enabled
                    </span>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-6 py-4 bg-beige-100 mt-2">
          <div className="flex items-center justify-between gap-4">
            {/* Left action */}
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setErr(""); setStep(1); }}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-transparent border-0 cursor-pointer transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            {/* Dot progress indicator */}
            <div className="flex items-center gap-2">
              <div className={`h-2 rounded-full transition-all ${step === 1 ? "w-6 bg-olive-700" : "w-2 bg-gray-300"}`} />
              <div className={`h-2 rounded-full transition-all ${step === 2 ? "w-6 bg-olive-700" : "w-2 bg-gray-300"}`} />
            </div>

            {/* Right action */}
            {step === 1 ? (
              <button
                type="button"
                disabled={!form.volunteerId}
                onClick={() => { setErr(""); setStep(2); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${
                  form.volunteerId
                    ? "bg-lime text-olive-900 hover:brightness-95 cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                form="task-form"
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${
                  saving
                    ? "bg-lime/60 text-olive-800 cursor-not-allowed"
                    : "bg-lime text-olive-900 hover:brightness-95 cursor-pointer"
                }`}
              >
                {saving ? (
                  <><RefreshCw size={14} className="animate-spin" /> Assigning…</>
                ) : (
                  <>Assign Task <CheckCircle size={15} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [assignTarget, setAssignTarget] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const loadVolunteers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/volunteers`, {
        headers: { Authorization: `Bearer ${token()}` },
        credentials: "include",
      });
      const d = await res.json();
      if (d.success) setVolunteers(d.data || []);
    } catch {}
  }, []);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 20, page });
      if (search) params.set("search", search);
      if (typeFilter) params.set("serviceType", typeFilter);
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/donations?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
        credentials: "include",
      });
      const d = await res.json();
      if (d.success) {
        setDonations(d.data.donations || []);
        setPagination({ page: d.data.page, pages: d.data.pages, total: d.data.total });
      }
    } catch {
      showMsg("error", "Failed to load donations");
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => { loadVolunteers(); }, [loadVolunteers]);
  useEffect(() => { loadDonations(); }, [loadDonations]);

  const deleteTask = async (taskId, donationId) => {
    if (!window.confirm("Delete this task? The donation will be available for re-assignment.")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
        credentials: "include",
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      setDonations((prev) =>
        prev.map((don) =>
          don._id === donationId
            ? { ...don, hasTask: false, taskId: null, taskStatus: null, taskVolunteer: null }
            : don
        )
      );
      showMsg("success", "Task deleted. You can now re-assign.");
    } catch (e) {
      showMsg("error", e.message || "Failed to delete task");
    }
  };

  return (
    <div className="min-h-screen bg-beige-300 p-3 sm:p-5 lg:p-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 sm:gap-5 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-1 sm:mb-2">
            Donations <span className="text-olive-700">&amp; Impact</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm lg:text-base max-w-md leading-relaxed">
            Monitor real-time humanitarian contributions and streamline volunteer task assignments for maximum field efficiency.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 sm:gap-8 lg:gap-12 shrink-0">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-olive-700 leading-none">
              {pagination.total}
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              Total<br />Paid
            </div>
          </div>
          <div className="w-px h-10 bg-gray-300 hidden xs:block" />
          <div className="text-center">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 leading-none">
              {volunteers.length}
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              Volunteers<br />Available
            </div>
          </div>
        </div>
      </div>

      {/* ── Alert ── */}
      {msg.text && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl mb-4 sm:mb-6 text-sm font-semibold ${
            msg.type === "success"
              ? "bg-olive-100 text-olive-800 border border-olive-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* ── Main Card ── */}
      <div className="bg-beige-100 rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6 lg:p-7">

        {/* Card header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-gray-800">
            Incoming Contributions
          </h2>
          <span className="text-xs sm:text-sm font-bold text-olive-600 flex items-center gap-1 cursor-pointer hover:text-olive-800 transition-colors whitespace-nowrap">
            View All <ChevronRight size={14} />
          </span>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search donor or service…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl sm:rounded-2xl text-sm outline-none bg-white focus:border-olive-500 transition-colors"
            />
          </div>
          {/* Horizontally scrollable filters on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 sm:pb-0 shrink-0 sm:flex-wrap no-scrollbar">
            {[["", "All"], ["general", "General"], ["specific", "Service-specific"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setTypeFilter(val); setPage(1); }}
                className={`px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-semibold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                  typeFilter === val
                    ? "bg-olive-700 text-white border-olive-700"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4 sm:mb-5 leading-relaxed">
          {pagination.total} paid donation{pagination.total !== 1 ? "s" : ""} found.{" "}
          Click <strong className="text-olive-600">Assign Task</strong> on service-specific donations to create a volunteer task.
        </p>

        {/* ── Donation List ── */}
        {loading ? (
          <div className="flex items-center justify-center py-16 sm:py-20 text-gray-400 gap-2">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Loading donations…</span>
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-16 sm:py-20 text-gray-400 text-sm">
            No paid donations found.
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {donations.map((d) => {
              const isGeneral = !d.serviceTitle || d.serviceTitle === "General Donation";
              const donorName = d.isAnonymous
                ? "Anonymous"
                : d.donorName || d.user?.name || d.user?.email || "Guest";
              const initials =
                donorName !== "Anonymous"
                  ? donorName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
                  : "AN";

              const statusBadge = d.hasTask ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-lime text-olive-800 whitespace-nowrap">
                  Task Created
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-500 whitespace-nowrap">
                  {isGeneral ? "General" : "Pending"}
                </span>
              );

              const actionBtn = !isGeneral ? (
                d.hasTask ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-500 rounded-full text-xs font-semibold whitespace-nowrap">
                      Assigned
                    </span>
                    {d.taskVolunteer && (
                      <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[120px]">
                        → {d.taskVolunteer}
                      </span>
                    )}
                    {d.taskStatus !== "completed" && (
                      <button
                        onClick={() => deleteTask(d.taskId, d._id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-500 border border-red-100 cursor-pointer text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={10} /> Reassign
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (volunteers.length === 0) {
                        showMsg("error", "No approved volunteers available");
                        return;
                      }
                      setAssignTarget(d);
                    }}
                    className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 bg-olive-700 hover:bg-olive-800 text-white rounded-full text-xs sm:text-sm font-bold cursor-pointer transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
                  >
                    <Plus size={12} />
                    <span className="hidden xs:inline">Assign Task</span>
                    <span className="xs:hidden">Assign</span>
                  </button>
                )
              ) : (
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-400 rounded-full text-xs font-semibold whitespace-nowrap">
                  General
                </span>
              );

              return (
                <div
                  key={d._id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-beige-300 hover:border-beige-400 hover:shadow-sm transition-all overflow-hidden"
                >
                  {/* ── Desktop / Tablet row (sm+) ── */}
                  <div className="hidden sm:flex items-center gap-4 p-4 sm:p-5">
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: avatarColor(donorName) }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 text-sm sm:text-[15px] leading-tight truncate">
                        {donorName}
                      </div>
                      <div className="text-gray-500 text-xs sm:text-sm mt-0.5 truncate">
                        {d.ngoId?.ngoName || d.serviceTitle || "General Donation"}
                      </div>
                    </div>
                    <div className="shrink-0">{statusBadge}</div>
                    <div className="shrink-0 font-extrabold text-gray-800 text-sm sm:text-base whitespace-nowrap">
                      {fmt(d.amount)}
                    </div>
                    <div className="shrink-0">{actionBtn}</div>
                  </div>

                  {/* ── Mobile layout (< sm) ── */}
                  <div className="sm:hidden p-3.5">
                    {/* Top row: avatar + name + amount */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ background: avatarColor(donorName) }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800 text-sm leading-tight truncate">
                          {donorName}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5 truncate">
                          {d.ngoId?.ngoName || d.serviceTitle || "General Donation"}
                        </div>
                      </div>
                      <div className="shrink-0 font-extrabold text-gray-800 text-sm whitespace-nowrap">
                        {fmt(d.amount)}
                      </div>
                    </div>
                    {/* Bottom row: badge + action */}
                    <div className="flex items-center justify-between gap-2 pl-[52px]">
                      {statusBadge}
                      {actionBtn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-5 sm:mt-7 pt-4 sm:pt-5 border-t border-gray-200">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:border-gray-400 transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="text-xs text-gray-500 font-medium text-center">
              <span className="hidden xs:inline">Page </span>{page} / {pagination.pages}
              <span className="hidden sm:inline"> · {pagination.total} total</span>
            </span>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-gray-200 text-xs sm:text-sm font-semibold text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:border-gray-400 transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Assign Modal ── */}
      {assignTarget && (
        <AssignModal
          donation={assignTarget}
          volunteers={volunteers}
          onClose={() => setAssignTarget(null)}
          onSuccess={() => {
            setAssignTarget(null);
            showMsg("success", "Task assigned successfully! Check Tasks section.");
            loadDonations();
          }}
        />
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
