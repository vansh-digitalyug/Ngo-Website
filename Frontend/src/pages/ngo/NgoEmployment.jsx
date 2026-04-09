import { useState, useEffect, useCallback } from "react";
import {
  Briefcase, Plus, Edit2, Trash2, Loader2, X, ChevronDown,
  MapPin, Users, IndianRupee, CheckCircle, Clock, XCircle,
  FileText, Eye, ChevronLeft, ChevronRight,
} from "lucide-react";
import { API_BASE_URL } from "./NgoLayout.jsx";

const CAT_LABELS = {
  skill_training: "Skill Training", job_placement: "Job Placement",
  self_employment: "Self Employment", apprenticeship: "Apprenticeship", other: "Other",
};

const CAT_COLORS = {
  skill_training: "bg-cyan-50 text-cyan-700",
  job_placement: "bg-green-50 text-green-700",
  self_employment: "bg-amber-50 text-amber-700",
  apprenticeship: "bg-purple-50 text-purple-700",
  other: "bg-slate-50 text-slate-700",
};

const STATUS_META = {
  open: { label: "Open", bg: "bg-green-100", color: "text-green-800", Icon: CheckCircle },
  closed: { label: "Closed", bg: "bg-yellow-100", color: "text-yellow-800", Icon: Clock },
  completed: { label: "Completed", bg: "bg-blue-100", color: "text-blue-800", Icon: XCircle },
};

const APP_STATUS_META = {
  pending: { label: "Pending", bg: "bg-yellow-100", color: "text-yellow-800", border: "border-yellow-200" },
  reviewing: { label: "Reviewing", bg: "bg-purple-100", color: "text-purple-800", border: "border-purple-200" },
  accepted: { label: "Accepted", bg: "bg-green-100", color: "text-green-800", border: "border-green-200" },
  rejected: { label: "Rejected", bg: "bg-red-100", color: "text-red-800", border: "border-red-200" },
};

const EDU_LABELS = {
  below_10th: "Below 10th", "10th": "10th Pass", "12th": "12th Pass",
  graduate: "Graduate", postgraduate: "Post Graduate", other: "Other",
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtINR = (n) => n > 0 ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n) + "/mo" : "Unpaid";

const EMPTY = {
  title: "", category: "skill_training", description: "", skills: "", location: "",
  openings: 1, filled: 0, stipend: 0, status: "open",
  startDate: "", endDate: "", villageId: "", isPublic: true,
};

/* ── Job Form Modal ──────────────────────────────────────────────────────── */
function JobModal({ job, villages, onClose, onSaved }) {
  const [form, setForm] = useState(job ? {
    title: job.title || "", category: job.category || "skill_training",
    description: job.description || "", skills: (job.skills || []).join(", "),
    location: job.location || "", openings: job.openings ?? 1, filled: job.filled ?? 0,
    stipend: job.stipend ?? 0, status: job.status || "open",
    startDate: job.startDate ? new Date(job.startDate).toISOString().slice(0, 10) : "",
    endDate: job.endDate ? new Date(job.endDate).toISOString().slice(0, 10) : "",
    villageId: job.villageId?._id || job.villageId || "",
    isPublic: job.isPublic !== false,
  } : { ...EMPTY });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    const body = {
      ...form,
      skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
      openings: Number(form.openings), filled: Number(form.filled),
      stipend: Number(form.stipend), villageId: form.villageId || null,
    };
    const url = job ? `${API_BASE_URL}/api/employment/${job._id}` : `${API_BASE_URL}/api/employment`;
    fetch(url, { method: job ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
      .then(r => r.json())
      .then(d => { if (d.success) { onSaved(d.data.job); onClose(); } else setError(d.message || "Failed"); })
      .catch(() => setError("Network error"))
      .finally(() => setSaving(false));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{job ? "Edit Listing" : "New Employment Listing"}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Program Title *</label>
            <input 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Mobile Repair Skill Training" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Category</label>
            <div className="relative">
              <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" value={form.category} onChange={e => set("category", e.target.value)}>
                {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Status</label>
            <div className="relative">
              <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Description</label>
            <textarea 
              rows={3} 
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the program, eligibility, and expected outcomes…" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Skills (comma-separated)</label>
            <input 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.skills} onChange={e => set("skills", e.target.value)} placeholder="e.g. Mobile repair, soldering, customer service" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Location</label>
            <input 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Rampur Village Center" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Linked Village</label>
            <div className="relative">
              <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" value={form.villageId} onChange={e => set("villageId", e.target.value)}>
                <option value="">None</option>
                {villages.map(v => <option key={v._id} value={v._id}>{v.villageName}, {v.district}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Openings</label>
            <input 
              type="number" min={0} 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.openings} onChange={e => set("openings", e.target.value)} 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Filled</label>
            <input 
              type="number" min={0} 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.filled} onChange={e => set("filled", e.target.value)} 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Stipend/Month (₹, 0 = unpaid)</label>
            <input 
              type="number" min={0} 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.stipend} onChange={e => set("stipend", e.target.value)} 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Start Date</label>
            <input 
              type="date" 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.startDate} onChange={e => set("startDate", e.target.value)} 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">End Date</label>
            <input 
              type="date" 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.endDate} onChange={e => set("endDate", e.target.value)} 
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-[#6B5A46] focus:ring-[#6B5A46]" 
                checked={form.isPublic} onChange={e => set("isPublic", e.target.checked)} 
              />
              Show on public employment listings
            </label>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <button onClick={onClose} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            Cancel
          </button>
          <button 
            onClick={save} disabled={saving}
            className={`rounded-lg bg-[#6B5A46] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#5D4E3C] ${saving ? "cursor-not-allowed opacity-70" : ""}`}
          >
            {saving ? "Saving…" : job ? "Save Changes" : "Create Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Application Detail Modal ────────────────────────────────────────────── */
function AppDetailModal({ app, onClose, onUpdated }) {
  const [status, setStatus] = useState(app.status);
  const [note, setNote] = useState(app.ngoNote || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const save = () => {
    setSaving(true); setError("");
    fetch(`${API_BASE_URL}/api/employment-applications/${app._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, ngoNote: note }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) { onUpdated({ ...app, status, ngoNote: note }); onClose(); }
        else setError(d.message || "Failed");
      })
      .catch(() => setError("Network error"))
      .finally(() => setSaving(false));
  };

  const sm = APP_STATUS_META[status] || APP_STATUS_META.pending;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-900 px-6 py-5">
          <div>
            <div className="mb-1 text-xs font-bold tracking-wider text-gray-400">APPLICATION</div>
            <div className="text-lg font-bold text-white">{app.name}</div>
          </div>
          <button onClick={onClose} className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {/* Applicant info */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {[
              ["Email", app.email],
              ["Phone", app.phone || "—"],
              ["Age", app.age || "—"],
              ["Education", EDU_LABELS[app.education] || app.education || "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-gray-50 p-3">
                <div className="mb-1 text-xs font-semibold text-gray-500">{label}</div>
                <div className="text-sm font-semibold text-gray-900">{value}</div>
              </div>
            ))}
          </div>

          {app.experience && (
            <div className="mb-4">
              <div className="mb-1.5 text-xs font-bold text-gray-700">Experience</div>
              <p className="rounded-xl bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">{app.experience}</p>
            </div>
          )}

          {app.message && (
            <div className="mb-6">
              <div className="mb-1.5 text-xs font-bold text-gray-700">Cover Message</div>
              <p className="rounded-xl bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">{app.message}</p>
            </div>
          )}

          {/* Status update */}
          <div className="border-t border-gray-100 pt-5">
            <div className="mb-3 text-xs font-bold text-gray-700">Update Status</div>
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.entries(APP_STATUS_META).map(([s, meta]) => (
                <button 
                  key={s} onClick={() => setStatus(s)}
                  className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition-all ${
                    status === s 
                      ? `${meta.bg} ${meta.color} border-transparent shadow-sm` 
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {meta.label}
                </button>
              ))}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">NGO Note (optional)</label>
              <textarea 
                rows={2} 
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
                value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for the applicant…" 
              />
            </div>
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
            
            <div className="mt-5 flex items-center justify-end gap-3">
              <button onClick={onClose} className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                Cancel
              </button>
              <button 
                onClick={save} disabled={saving}
                className={`rounded-lg bg-[#6B5A46] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#5D4E3C] ${saving ? "cursor-not-allowed opacity-70" : ""}`}
              >
                {saving ? "Saving…" : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Job Card ─────────────────────────────────────────────────────────────── */
function JobCard({ job, onEdit, onDelete }) {
  const sm = STATUS_META[job.status] || STATUS_META.open;
  const catClasses = CAT_COLORS[job.category] || "bg-slate-50 text-slate-700";
  const fillPct = job.openings > 0 ? Math.min(100, Math.round((job.filled / job.openings) * 100)) : 0;
  
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="mb-2 truncate text-base font-bold text-gray-900">{job.title}</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${catClasses}`}>
              {CAT_LABELS[job.category]}
            </span>
            <span className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold ${sm.bg} ${sm.color}`}>
              <sm.Icon size={12} /> {sm.label}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={() => onEdit(job)} className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(job._id)} className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {job.description && (
        <p className="line-clamp-2 mb-4 text-sm leading-relaxed text-gray-500">
          {job.description}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
        {job.location && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <MapPin size={12} /> {job.location}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <Users size={12} /> {job.filled}/{job.openings} filled
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <IndianRupee size={12} /> {fmtINR(job.stipend)}
        </span>
        {job.startDate && (
          <span className="text-xs font-medium text-gray-400">
            {fmtDate(job.startDate)} → {fmtDate(job.endDate)}
          </span>
        )}
      </div>

      <div className="mt-auto">
        {job.openings > 0 && (
          <div className="mb-4">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="font-medium text-gray-500">Seats filled</span>
              <span className={`font-bold ${fillPct >= 100 ? "text-green-600" : "text-gray-900"}`}>{fillPct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${fillPct >= 100 ? "bg-green-500" : "bg-[#6B5A46]"}`} 
                style={{ width: `${fillPct}%` }} 
              />
            </div>
          </div>
        )}

        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map(s => (
              <span key={s} className="rounded-md bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600 border border-gray-100">
                {s}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="rounded-md bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-400 border border-gray-100">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Applications Tab ─────────────────────────────────────────────────────── */
function ApplicationsTab({ jobs }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatus] = useState("all");
  const [jobFilter, setJob] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const token = localStorage.getItem("token");
  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (jobFilter !== "all") params.set("jobId", jobFilter);

    fetch(`${API_BASE_URL}/api/employment-applications/ngo?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setApps(d.data.applications || []); setTotal(d.data.pagination?.total || 0); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter, jobFilter, token]);

  useEffect(() => { load(); }, [load]);

  const onUpdated = (updated) => {
    setApps(prev => prev.map(a => a._id === updated._id ? updated : a));
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="animate-in fade-in duration-300">
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "reviewing", "accepted", "rejected"].map(s => {
            const meta = APP_STATUS_META[s];
            const isActive = statusFilter === s;
            return (
              <button 
                key={s} onClick={() => { setStatus(s); setPage(1); }}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
                  isActive 
                    ? "border-[#6B5A46] bg-[#6B5A46] text-white" 
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {meta?.label || "All"}
              </button>
            );
          })}
        </div>
        
        {jobs.length > 0 && (
          <div className="relative w-full sm:w-auto">
            <select 
              value={jobFilter} onChange={e => { setJob(e.target.value); setPage(1); }}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-gray-700 focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46] sm:min-w-[200px]"
            >
              <option value="all">All Programs</option>
              {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-500">
          <Loader2 size={24} className="animate-spin text-[#6B5A46]" />
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 px-6 text-center">
          <FileText size={48} className="mb-4 text-gray-300" />
          <h3 className="mb-1 text-base font-bold text-gray-900">No applications found</h3>
          <p className="text-sm text-gray-500">Applications from public listings will appear here.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Applicant", "Program", "Education", "Applied On", "Status", ""].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {apps.map((app) => {
                  const sm = APP_STATUS_META[app.status] || APP_STATUS_META.pending;
                  return (
                    <tr key={app._id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{app.name}</div>
                        <div className="text-xs text-gray-500">{app.email}</div>
                      </td>
                      <td className="max-w-[200px] truncate px-5 py-4 text-sm text-gray-600">
                        {app.employmentId?.title || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {EDU_LABELS[app.education] || app.education || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                        {fmtDate(app.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${sm.bg} ${sm.color}`}>
                          {sm.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => setSelected(app)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#6B5A46]"
                        >
                          <Eye size={14} /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <span className="text-sm font-medium text-gray-500">{total} applications total</span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-4 text-sm font-bold text-gray-700">
                  Page {page} of {pages}
                </span>
                <button 
                  disabled={page >= pages} onClick={() => setPage(p => p + 1)}
                  className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selected && <AppDetailModal app={selected} onClose={() => setSelected(null)} onUpdated={onUpdated} />}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */
export default function NgoEmployment() {
  const [jobs, setJobs] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [statusFilter, setStatus] = useState("all");
  const [activeTab, setTab] = useState("listings");
  const token = localStorage.getItem("token");

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/employment/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/villages/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([jobsRes, vilsRes]) => {
        if (jobsRes.success) setJobs(jobsRes.data.jobs);
        if (vilsRes.success) setVillages(vilsRes.data.villages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const onSaved = (job) => setJobs(js => {
    const idx = js.findIndex(j => j._id === job._id);
    if (idx >= 0) { const n = [...js]; n[idx] = job; return n; }
    return [job, ...js];
  });

  const onDelete = (id) => {
    if (!window.confirm("Delete this listing?")) return;
    fetch(`${API_BASE_URL}/api/employment/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setJobs(js => js.filter(j => j._id !== id)); })
      .catch(() => {});
  };

  const filtered = statusFilter === "all" ? jobs : jobs.filter(j => j.status === statusFilter);
  const counts = jobs.reduce((a, j) => { a[j.status] = (a[j.status] || 0) + 1; return a; }, {});
  const totalFilled = jobs.reduce((a, j) => a + (j.filled || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 font-sans sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="mb-1 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Employment & Rojgar</h1>
          <p className="text-sm font-medium text-gray-500">Manage skill training, job placements, and self-employment programs</p>
        </div>
        <button 
          onClick={() => setModal("create")}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#6B5A46] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#5D4E3C] hover:shadow"
        >
          <Plus size={18} /> New Program
        </button>
      </div>

      {/* Stats Cards (Inspired by the "Growth Overview" earthy styling) */}
      {jobs.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#E8DCC8]/60 bg-[#F4EFE6] p-5">
            <div className="text-2xl font-black text-[#5D4E3C]">{jobs.length}</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#7A6C5B]">Total Programs</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-2xl font-black text-gray-900">{totalFilled}</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500">People Placed</div>
          </div>
          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="text-2xl font-black text-green-700">{counts.open || 0}</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-green-600">Active / Open</div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="text-2xl font-black text-blue-700">{counts.completed || 0}</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-blue-600">Completed</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 flex gap-6 border-b border-gray-200">
        {[{ key: "listings", label: "My Listings", Icon: Briefcase }, { key: "applications", label: "Applications", Icon: FileText }].map(({ key, label, Icon }) => (
          <button 
            key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-colors ${
              activeTab === key 
                ? "border-[#6B5A46] text-[#6B5A46]" 
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "listings" ? (
        <div className="animate-in fade-in duration-300">
          {/* Status filter */}
          {jobs.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {["all", "open", "closed", "completed"].map(s => (
                <button 
                  key={s} onClick={() => setStatus(s)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                    statusFilter === s 
                      ? "border-gray-900 bg-gray-900 text-white" 
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s === "all" ? "All Programs" : STATUS_META[s]?.label || s}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20 text-gray-500">
              <Loader2 size={24} className="animate-spin text-[#6B5A46]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 px-6 text-center">
              <Briefcase size={48} className="mb-4 text-gray-300" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">No programs yet</h3>
              <p className="mb-6 max-w-sm text-sm text-gray-500">Create employment and skill training programs to start tracking your impact and receiving applications.</p>
              <button 
                onClick={() => setModal("create")}
                className="rounded-xl bg-[#6B5A46] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#5D4E3C]"
              >
                Create First Program
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map(j => <JobCard key={j._id} job={j} onEdit={j => setModal(j)} onDelete={onDelete} />)}
            </div>
          )}
        </div>
      ) : (
        <ApplicationsTab jobs={jobs} />
      )}

      {modal && <JobModal job={modal === "create" ? null : modal} villages={villages} onClose={() => setModal(null)} onSaved={onSaved} />}
    </div>
  );
}