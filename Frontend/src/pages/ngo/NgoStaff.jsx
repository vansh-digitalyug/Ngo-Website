import { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2, Loader2, X, ChevronDown, Phone, Mail, UserCheck, UserX, Briefcase, MapPin } from "lucide-react";
import { API_BASE_URL } from "./NgoLayout.jsx";

const ROLES = ["doctor", "teacher", "nurse", "social_worker", "engineer", "lawyer", "paramedic", "counselor", "other"];

const ROLE_LABELS = {
  doctor: "Doctor", teacher: "Teacher", nurse: "Nurse", social_worker: "Social Worker",
  engineer: "Engineer", lawyer: "Lawyer", paramedic: "Paramedic", counselor: "Counselor", other: "Other",
};

// Mapped to Tailwind classes for a clean, consistent UI without inline hex codes
const ROLE_STYLES = {
  doctor: "bg-red-50 text-red-700 border-red-100",
  teacher: "bg-blue-50 text-blue-700 border-blue-100",
  nurse: "bg-pink-50 text-pink-700 border-pink-100",
  social_worker: "bg-green-50 text-green-700 border-green-100",
  engineer: "bg-amber-50 text-amber-700 border-amber-100",
  lawyer: "bg-purple-50 text-purple-700 border-purple-100",
  paramedic: "bg-orange-50 text-orange-700 border-orange-100",
  counselor: "bg-cyan-50 text-cyan-700 border-cyan-100",
  other: "bg-slate-50 text-slate-700 border-slate-100",
};

const EMP_LABELS = { full_time: "Full-Time", part_time: "Part-Time", volunteer: "Volunteer", contractual: "Contractual" };

const EMPTY = { name: "", role: "doctor", specialization: "", phone: "", email: "", bio: "", employmentType: "volunteer", villageId: "", isActive: true, joinedAt: "" };

/* ── Staff Form Modal ────────────────────────────────────────────────────── */
function StaffModal({ member, villages, onClose, onSaved }) {
  const [form, setForm] = useState(member ? {
    name: member.name || "", role: member.role || "doctor",
    specialization: member.specialization || "", phone: member.phone || "",
    email: member.email || "", bio: member.bio || "",
    employmentType: member.employmentType || "volunteer",
    villageId: member.villageId?._id || member.villageId || "",
    isActive: member.isActive !== false,
    joinedAt: member.joinedAt ? new Date(member.joinedAt).toISOString().slice(0, 10) : "",
  } : { ...EMPTY });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.role) { setError("Role is required"); return; }
    setSaving(true); setError("");
    const body = { ...form, villageId: form.villageId || null };
    const url = member ? `${API_BASE_URL}/api/staff/${member._id}` : `${API_BASE_URL}/api/staff`;
    
    fetch(url, { 
      method: member ? "PUT" : "POST", 
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, 
      body: JSON.stringify(body) 
    })
      .then(r => r.json())
      .then(d => { if (d.success) { onSaved(d.data.member); onClose(); } else setError(d.message || "Failed"); })
      .catch(() => setError("Network error"))
      .finally(() => setSaving(false));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{member ? "Edit Staff Member" : "Add Staff Member"}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Full Name *</label>
            <input 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.name} onChange={e => set("name", e.target.value)} placeholder="Dr. Anil Kumar" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Role *</label>
            <div className="relative">
              <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" value={form.role} onChange={e => set("role", e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Employment Type</label>
            <div className="relative">
              <select className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" value={form.employmentType} onChange={e => set("employmentType", e.target.value)}>
                {Object.entries(EMP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Specialization</label>
            <input 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.specialization} onChange={e => set("specialization", e.target.value)} placeholder="e.g. General Medicine, Primary Education" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Phone</label>
            <input 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Email</label>
            <input 
              type="email" 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.email} onChange={e => set("email", e.target.value)} placeholder="doctor@example.com" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Joined Date</label>
            <input 
              type="date" 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.joinedAt} onChange={e => set("joinedAt", e.target.value)} 
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
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">Bio / Notes</label>
            <textarea 
              rows={2} 
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46]" 
              value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Short bio or notes about this staff member…" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-[#6B5A46] focus:ring-[#6B5A46]" 
                checked={form.isActive} onChange={e => set("isActive", e.target.checked)} 
              />
              Currently active / serving
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
            {saving ? "Saving…" : member ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Staff Card ──────────────────────────────────────────────────────────── */
function StaffCard({ member, onEdit, onDelete }) {
  const roleStyle = ROLE_STYLES[member.role] || "bg-slate-50 text-slate-700 border-slate-100";
  
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-start">
      {/* Avatar */}
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${roleStyle}`}>
        <span className="text-xl font-black">{member.name.charAt(0).toUpperCase()}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h3 className="text-base font-bold text-gray-900">{member.name}</h3>
            
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-md border px-2.5 py-1 text-[11px] font-bold ${roleStyle}`}>
                {ROLE_LABELS[member.role]}
              </span>
              <span className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold ${member.isActive ? "bg-green-50 text-green-700 border border-green-100" : "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                {member.isActive ? <UserCheck size={12} /> : <UserX size={12} />}
                {member.isActive ? "Active" : "Inactive"}
              </span>
              <span className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                <Briefcase size={10} /> {EMP_LABELS[member.employmentType]}
              </span>
            </div>
          </div>
          
          <div className="flex shrink-0 gap-2">
            <button onClick={() => onEdit(member)} className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100">
              <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(member._id)} className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {member.specialization && (
          <p className="mb-3 text-sm text-gray-500 line-clamp-1">{member.specialization}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-50 pt-3 text-xs font-medium text-gray-500">
          {member.phone && (
            <span className="flex items-center gap-1.5">
              <Phone size={12} className="text-gray-400" /> {member.phone}
            </span>
          )}
          {member.email && (
            <span className="flex items-center gap-1.5">
              <Mail size={12} className="text-gray-400" /> {member.email}
            </span>
          )}
          {member.villageId && (
            <span className="flex items-center gap-1.5 font-bold text-[#6B5A46]">
              <MapPin size={12} className="text-[#6B5A46]" /> {member.villageId.villageName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */
export default function NgoStaff() {
  const [staff, setStaff] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/staff/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/villages/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([s, v]) => {
        if (s.success) setStaff(s.data.staff);
        if (v.success) setVillages(v.data.villages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const onSaved = (member) => setStaff(ms => {
    const idx = ms.findIndex(m => m._id === member._id);
    if (idx >= 0) { const n = [...ms]; n[idx] = member; return n; }
    return [member, ...ms];
  });

  const onDelete = (id) => {
    if (!window.confirm("Remove this staff member?")) return;
    fetch(`${API_BASE_URL}/api/staff/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setStaff(ms => ms.filter(m => m._id !== id)); })
      .catch(() => {});
  };

  const filtered = staff.filter(m =>
    (roleFilter === "all" || m.role === roleFilter) &&
    (activeFilter === "all" || (activeFilter === "active" ? m.isActive : !m.isActive))
  );

  const roleCounts = ROLES.reduce((a, r) => { a[r] = staff.filter(m => m.role === r).length; return a; }, {});

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 font-sans sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="mb-1 text-2xl font-black tracking-tight text-gray-900 md:text-3xl">Staff & Professionals</h1>
          <p className="text-sm font-medium text-gray-500">Manage doctors, teachers, and other professionals serving with your NGO</p>
        </div>
        <button 
          onClick={() => setModal("create")}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#6B5A46] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#5D4E3C] hover:shadow"
        >
          <Plus size={18} /> Add Staff
        </button>
      </div>

      {/* Role Stats Snippets */}
      {staff.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-3">
          {ROLES.filter(r => roleCounts[r] > 0).map(r => {
            const style = ROLE_STYLES[r] || "bg-gray-50 text-gray-700 border-gray-200";
            return (
              <div key={r} className={`flex items-center gap-2.5 rounded-xl border px-4 py-2 shadow-sm ${style}`}>
                <span className="text-lg font-black">{roleCounts[r]}</span>
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                  {ROLE_LABELS[r]}{roleCounts[r] > 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", "active", "inactive"].map(f => (
            <button 
              key={f} onClick={() => setActiveFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                activeFilter === f 
                  ? "border-gray-900 bg-gray-900 text-white" 
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <select 
            value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="w-full appearance-none rounded-full border border-gray-200 bg-white py-1.5 pl-4 pr-10 text-xs font-bold text-gray-700 transition-colors focus:border-[#6B5A46] focus:outline-none focus:ring-1 focus:ring-[#6B5A46] hover:bg-gray-50 sm:w-auto"
          >
            <option value="all">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* List content */}
      <div className="animate-in fade-in duration-300">
        {loading ? (
          <div className="flex justify-center py-20 text-gray-500">
            <Loader2 size={24} className="animate-spin text-[#6B5A46]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 px-6 text-center shadow-sm">
            <Users size={48} className="mb-4 text-gray-300" />
            <h3 className="mb-2 text-lg font-bold text-gray-900">No staff members found</h3>
            <p className="mb-6 max-w-sm text-sm text-gray-500">Add doctors, teachers, and professionals working with your NGO to easily manage and track them.</p>
            <button 
              onClick={() => setModal("create")}
              className="rounded-xl bg-[#6B5A46] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#5D4E3C]"
            >
              Add First Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filtered.map(m => <StaffCard key={m._id} member={m} onEdit={m => setModal(m)} onDelete={onDelete} />)}
          </div>
        )}
      </div>

      {modal && <StaffModal member={modal === "create" ? null : modal} villages={villages} onClose={() => setModal(null)} onSaved={onSaved} />}
    </div>
  );
}