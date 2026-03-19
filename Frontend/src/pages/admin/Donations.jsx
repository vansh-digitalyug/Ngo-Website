import React, { useState, useEffect, useCallback } from "react";
import { IndianRupee, User, UserCheck, Plus, X, Search, RefreshCw, MapPin, Tag, CheckCircle, ClipboardList, FileText, MessageSquare, ChevronRight, ChevronLeft, Trash2 } from "lucide-react";
import AIDescribeButton from "../../components/ui/AIDescribeButton.jsx";
import { API_BASE_URL } from "./AdminLayout.jsx";

const token = () => localStorage.getItem("token");
const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// ── Interest matching helper ──────────────────────────────────────────────────
const matchesService = (volunteer, serviceTitle) => {
  if (!serviceTitle || serviceTitle === "General Donation") return false;
  const title = serviceTitle.toLowerCase();
  return (volunteer.interests || []).some(interest => {
    const i = interest.toLowerCase();
    return title.includes(i) || i.split(" ").some(word => word.length > 2 && title.includes(word));
  });
};

// ── Avatar initial helper ─────────────────────────────────────────────────────
const AVATAR_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// ── Assign Task Modal ────────────────────────────────────────────────────────
function AssignModal({ donation, volunteers, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = pick volunteer, 2 = task details
  const [form, setForm] = useState({ volunteerId: "", title: "", description: "", adminNote: "" });
  const [selectedVol, setSelectedVol] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const serviceTitle = donation.serviceTitle || "General Donation";
  const donorLabel = donation.isAnonymous ? "Anonymous" : (donation.donorName || donation.user?.name || "Donor");

  const filtered = volunteers.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return v.fullName.toLowerCase().includes(q) || (v.email || "").toLowerCase().includes(q) ||
      (v.city || "").toLowerCase().includes(q);
  });

  const matched = filtered.filter(v => matchesService(v, serviceTitle));
  const other   = filtered.filter(v => !matchesService(v, serviceTitle));

  const selectVol = (v) => {
    setSelectedVol(v);
    set("volunteerId", v._id);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.volunteerId || !form.title.trim()) { setErr("Please select a volunteer and enter a task title."); return; }
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

  const inp = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px",
    fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.2s", background: "#fafafa"
  };

  const VolCard = ({ v, isMatch }) => {
    const isSelected = selectedVol?._id === v._id;
    const initials = v.fullName?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
    const color = avatarColor(v.fullName);
    return (
      <div
        onClick={() => selectVol(v)}
        style={{
          display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px",
          borderRadius: "10px", cursor: "pointer", transition: "all 0.15s",
          border: isSelected ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
          background: isSelected ? "#eff6ff" : "#fafafa",
          boxShadow: isSelected ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
          position: "relative"
        }}
      >
        {/* Avatar */}
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "15px", flexShrink: 0 }}>
          {initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontWeight: "700", fontSize: "14px", color: isSelected ? "#1d4ed8" : "#0f172a" }}>{v.fullName}</span>
            {isMatch && (
              <span style={{ padding: "1px 7px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: "#d1fae5", color: "#065f46" }}>
                ★ Match
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px", flexWrap: "wrap" }}>
            {(v.city || v.state) && (
              <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#64748b" }}>
                <MapPin size={11} /> {[v.city, v.state].filter(Boolean).join(", ")}
              </span>
            )}
            {v.interests?.length > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#64748b" }}>
                <Tag size={11} /> {v.interests.slice(0, 2).join(", ")}
              </span>
            )}
          </div>
        </div>

        {/* Check */}
        {isSelected && (
          <CheckCircle size={18} color="#2563eb" style={{ flexShrink: 0 }} />
        )}
      </div>
    );
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "580px", maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>

        {/* ── Header ── */}
        <div style={{ background: "linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)", padding: "22px 24px 18px", color: "#fff", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ClipboardList size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700" }}>Assign Task to Volunteer</h3>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>Step {step} of 2 — {step === 1 ? "Select Volunteer" : "Task Details"}</p>
            </div>
          </div>

          {/* Donation badge */}
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
            <div>
              <div style={{ fontSize: "13px", opacity: 0.85 }}>Donor: <strong>{donorLabel}</strong></div>
              <div style={{ fontSize: "12px", opacity: 0.75 }}>{serviceTitle} · {fmtDate(donation.createdAt)}</div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800" }}>{fmt(donation.amount)}</div>
          </div>

          {/* Step progress bar */}
          <div style={{ marginTop: "14px", height: "4px", borderRadius: "4px", background: "rgba(255,255,255,0.2)" }}>
            <div style={{ height: "100%", borderRadius: "4px", background: "#fff", width: step === 1 ? "50%" : "100%", transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>

          {/* ─ STEP 1: Pick Volunteer ─ */}
          {step === 1 && (
            <>
              {/* Search */}
              <div style={{ position: "relative", marginBottom: "14px" }}>
                <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedVol(null); set("volunteerId", ""); }}
                  placeholder="Search by name, email or city…"
                  style={{ ...inp, paddingLeft: "36px" }}
                />
              </div>

              {/* Count */}
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px" }}>
                {filtered.length} volunteer{filtered.length !== 1 ? "s" : ""} available
                {matched.length > 0 && <span style={{ color: "#059669", fontWeight: "600" }}> · ★ {matched.length} interest match</span>}
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  <UserCheck size={32} style={{ marginBottom: "8px", opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: "14px" }}>No volunteers found</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Matched first */}
                  {matched.length > 0 && (
                    <>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#059669", textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 0" }}>
                        ★ Interest Match ({matched.length})
                      </div>
                      {matched.map(v => <VolCard key={v._id} v={v} isMatch />)}
                    </>
                  )}
                  {/* Other volunteers */}
                  {other.length > 0 && (
                    <>
                      {matched.length > 0 && (
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", padding: "8px 0 4px" }}>
                          All Other Volunteers ({other.length})
                        </div>
                      )}
                      {other.map(v => <VolCard key={v._id} v={v} isMatch={false} />)}
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* ─ STEP 2: Task Details ─ */}
          {step === 2 && (
            <>
              {/* Selected volunteer summary */}
              {selectedVol && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "#eff6ff", borderRadius: "10px", border: "1.5px solid #bfdbfe", marginBottom: "20px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: avatarColor(selectedVol.fullName), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>
                    {selectedVol.fullName?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e40af" }}>{selectedVol.fullName}</div>
                    {(selectedVol.city || selectedVol.state) && (
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{[selectedVol.city, selectedVol.state].filter(Boolean).join(", ")}</div>
                    )}
                  </div>
                  <button onClick={() => setStep(1)} style={{ marginLeft: "auto", fontSize: "12px", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: "600" }}>Change</button>
                </div>
              )}

              <form id="task-form" onSubmit={submit}>
                {/* Task Title */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px", fontWeight: "600", fontSize: "13px", color: "#374151" }}>
                    <ClipboardList size={14} color="#6366f1" /> Task Title *
                  </label>
                  <input
                    style={inp}
                    value={form.title}
                    onChange={e => set("title", e.target.value)}
                    placeholder="e.g. Distribute food to 20 families"
                    required
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", fontSize: "13px", color: "#374151", margin: 0 }}>
                      <FileText size={14} color="#6366f1" /> Description
                    </label>
                    <AIDescribeButton context="task" hint={form.title} onGenerated={v => set("description", v)} />
                  </div>
                  <textarea
                    rows={3}
                    style={{ ...inp, resize: "vertical" }}
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                    placeholder="Additional details about the task…"
                  />
                </div>

                {/* Instructions */}
                <div style={{ marginBottom: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px", fontWeight: "600", fontSize: "13px", color: "#374151" }}>
                    <MessageSquare size={14} color="#6366f1" /> Instructions for Volunteer
                  </label>
                  <textarea
                    rows={3}
                    style={{ ...inp, resize: "vertical" }}
                    value={form.adminNote}
                    onChange={e => set("adminNote", e.target.value)}
                    placeholder="What the volunteer should do, document, photograph, etc."
                  />
                </div>
              </form>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", background: "#fafafa" }}>
          {err && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
              {err}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            {step === 1 ? (
              <>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: "11px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!form.volunteerId}
                  onClick={() => { setErr(""); setStep(2); }}
                  style={{ flex: 2, padding: "11px", background: form.volunteerId ? "linear-gradient(135deg,#2563eb,#4f46e5)" : "#e2e8f0", color: form.volunteerId ? "#fff" : "#94a3b8", border: "none", borderRadius: "10px", cursor: form.volunteerId ? "pointer" : "not-allowed", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  Next: Task Details <ChevronRight size={16} />
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: "11px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  form="task-form"
                  disabled={saving}
                  style={{ flex: 2, padding: "11px", background: saving ? "#93c5fd" : "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", border: "none", borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}
                >
                  {saving ? (
                    <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> Assigning…</>
                  ) : (
                    <><CheckCircle size={15} /> Assign Task</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(""); // "" | "general" | "specific"
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [assignTarget, setAssignTarget] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 4000); };

  const loadVolunteers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/volunteers`, {
        headers: { Authorization: `Bearer ${token()}` }, credentials: "include"
      });
      const d = await res.json();
      if (d.success) setVolunteers(d.data || []);
    } catch {}
  }, []);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 20, page });
      if (search)     params.set("search", search);
      if (typeFilter) params.set("serviceType", typeFilter);
      const res = await fetch(`${API_BASE_URL}/api/tasks/admin/donations?${params}`, {
        headers: { Authorization: `Bearer ${token()}` }, credentials: "include"
      });
      const d = await res.json();
      if (d.success) {
        setDonations(d.data.donations || []);
        setPagination({ page: d.data.page, pages: d.data.pages, total: d.data.total });
      }
    } catch { showMsg("error", "Failed to load donations"); }
    finally { setLoading(false); }
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
      // Optimistically update the donation card to show Assign Task button
      setDonations(prev => prev.map(don =>
        don._id === donationId ? { ...don, hasTask: false, taskId: null, taskStatus: null, taskVolunteer: null } : don
      ));
      showMsg("success", "Task deleted. You can now re-assign.");
    } catch (e) { showMsg("error", e.message || "Failed to delete task"); }
  };

  const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "12px" };
  const btn = (c) => ({ padding: "7px 14px", background: c, color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "600", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "5px" });

  return (
    <div>
      <h1 className="admin-page-title">Donations</h1>

      {/* Summary badges */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div style={{ padding: "10px 20px", borderRadius: "8px", background: "#f0fdf4", color: "#166534", fontWeight: "600", fontSize: "14px" }}>
          Total Paid: {pagination.total}
        </div>
        <div style={{ padding: "10px 20px", borderRadius: "8px", background: "#eff6ff", color: "#1e40af", fontWeight: "600", fontSize: "14px" }}>
          Volunteers Available: {volunteers.length}
        </div>
      </div>

      {msg.text && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", background: msg.type === "success" ? "#dcfce7" : "#fee2e2", color: msg.type === "success" ? "#166534" : "#991b1b", fontWeight: "600", fontSize: "14px" }}>
          {msg.text}
        </div>
      )}

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search by donor name or service…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="admin-search-input"
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {[["", "All"], ["general", "General"], ["specific", "Service-specific"]].map(([val, label]) => (
            <button key={val} onClick={() => { setTypeFilter(val); setPage(1); }}
              style={{ padding: "7px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap",
                background: typeFilter === val ? "#2563eb" : "#fff",
                color:      typeFilter === val ? "#fff"    : "#374151",
                borderColor: typeFilter === val ? "#2563eb" : "#e2e8f0" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "12px", color: "#64748b", fontSize: "13px" }}>
        {pagination.total} paid donation{pagination.total !== 1 ? "s" : ""} found.
        {" "}Click <strong>Assign Task</strong> on a service-specific donation to create a volunteer task.
      </div>

      {/* List */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">
            <RefreshCw size={22} style={{ animation: "spin 1s linear infinite", marginRight: "8px" }} />
            Loading donations…
          </div>
        ) : donations.length === 0 ? (
          <div className="admin-empty-state">No paid donations found.</div>
        ) : donations.map(d => {
          const isGeneral = !d.serviceTitle || d.serviceTitle === "General Donation";
          return (
            <div key={d._id} style={{ ...card, borderLeft: `4px solid ${isGeneral ? "#16a34a" : "#2563eb"}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>
                    <User size={14} style={{ marginRight: 5, verticalAlign: "middle" }} />
                    {d.isAnonymous ? "Anonymous" : (d.donorName || d.user?.name || d.user?.email || "Guest")}
                    {" "}donated{" "}
                    <span style={{ color: "#16a34a", fontWeight: "800" }}>{fmt(d.amount)}</span>
                  </p>
                  <p style={{ margin: "0 0 4px", color: "#374151", fontSize: "13px" }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                      background: isGeneral ? "#f0fdf4" : "#eff6ff",
                      color: isGeneral ? "#166534" : "#1e40af", marginRight: "6px" }}>
                      {isGeneral ? "General Donation" : d.serviceTitle}
                    </span>
                    {d.ngoId?.ngoName && <span style={{ color: "#64748b", fontSize: "12px" }}>· {d.ngoId.ngoName}</span>}
                  </p>
                  {d.user?.email && <p style={{ margin: 0, color: "#64748b", fontSize: "12px" }}>{d.user.email}</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span style={{ color: "#64748b", fontSize: "12px" }}>{fmtDate(d.createdAt)}</span>
                  {!isGeneral && (
                    d.hasTask ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "7px", background: "#f0fdf4", color: "#16a34a", fontSize: "12px", fontWeight: "600", border: "1px solid #bbf7d0" }}>
                          <CheckCircle size={12} /> Task Created
                        </span>
                        {d.taskVolunteer && (
                          <span style={{ fontSize: "11px", color: "#64748b" }}>→ {d.taskVolunteer}</span>
                        )}
                        {d.taskStatus && (
                          <span style={{ fontSize: "11px", color: d.taskStatus === "completed" ? "#16a34a" : d.taskStatus === "in_progress" ? "#ca8a04" : "#2563eb", fontWeight: "600", textTransform: "capitalize" }}>
                            {d.taskStatus.replace("_", " ")}
                          </span>
                        )}
                        {d.taskStatus !== "completed" && (
                          <button
                            onClick={() => deleteTask(d.taskId, d._id)}
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 9px", borderRadius: "6px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}
                          >
                            <Trash2 size={11} /> Delete & Reassign
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        style={btn("#2563eb")}
                        onClick={() => {
                          if (volunteers.length === 0) { showMsg("error", "No approved volunteers available"); return; }
                          setAssignTarget(d);
                        }}
                      >
                        <Plus size={14} /> Assign Task
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="admin-pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {pagination.pages} ({pagination.total} total)</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
