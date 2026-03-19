import { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2, Loader2, X, ChevronDown, Phone, Mail, UserCheck, UserX } from "lucide-react";
import { API_BASE_URL } from "./NgoLayout.jsx";

const ROLES = ["doctor","teacher","nurse","social_worker","engineer","lawyer","paramedic","counselor","other"];
const ROLE_LABELS = {
  doctor: "Doctor", teacher: "Teacher", nurse: "Nurse", social_worker: "Social Worker",
  engineer: "Engineer", lawyer: "Lawyer", paramedic: "Paramedic", counselor: "Counselor", other: "Other",
};
const ROLE_COLORS = {
  doctor: "#dc2626", teacher: "#2563eb", nurse: "#db2777", social_worker: "#16a34a",
  engineer: "#d97706", lawyer: "#7c3aed", paramedic: "#ea580c", counselor: "#0891b2", other: "#64748b",
};
const EMP_LABELS = { full_time: "Full-Time", part_time: "Part-Time", volunteer: "Volunteer", contractual: "Contractual" };

const EMPTY = { name: "", role: "doctor", specialization: "", phone: "", email: "", bio: "", employmentType: "volunteer", villageId: "", isActive: true, joinedAt: "" };

function StaffModal({ member, villages, onClose, onSaved }) {
  const [form, setForm] = useState(member ? {
    name: member.name || "", role: member.role || "doctor",
    specialization: member.specialization || "", phone: member.phone || "",
    email: member.email || "", bio: member.bio || "",
    employmentType: member.employmentType || "volunteer",
    villageId: member.villageId?._id || member.villageId || "",
    isActive: member.isActive !== false,
    joinedAt: member.joinedAt ? new Date(member.joinedAt).toISOString().slice(0,10) : "",
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
    fetch(url, { method: member ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
      .then(r => r.json())
      .then(d => { if (d.success) { onSaved(d.data.member); onClose(); } else setError(d.message || "Failed"); })
      .catch(() => setError("Network error"))
      .finally(() => setSaving(false));
  };

  const inp = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };
  const sel = { ...inp, appearance: "none", cursor: "pointer" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontWeight: "800", fontSize: "18px", color: "#0f172a" }}>{member ? "Edit Staff Member" : "Add Staff Member"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
        </div>
        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Full Name *</label>
            <input style={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Dr. Anil Kumar" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Role *</label>
            <div style={{ position: "relative" }}>
              <select style={sel} value={form.role} onChange={e => set("role", e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Employment Type</label>
            <div style={{ position: "relative" }}>
              <select style={sel} value={form.employmentType} onChange={e => set("employmentType", e.target.value)}>
                {Object.entries(EMP_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
            </div>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Specialization</label>
            <input style={inp} value={form.specialization} onChange={e => set("specialization", e.target.value)} placeholder="e.g. General Medicine, Primary Education" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Phone</label>
            <input style={inp} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Email</label>
            <input type="email" style={inp} value={form.email} onChange={e => set("email", e.target.value)} placeholder="doctor@example.com" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Joined Date</label>
            <input type="date" style={inp} value={form.joinedAt} onChange={e => set("joinedAt", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Linked Village</label>
            <div style={{ position: "relative" }}>
              <select style={sel} value={form.villageId} onChange={e => set("villageId", e.target.value)}>
                <option value="">None</option>
                {villages.map(v => <option key={v._id} value={v._id}>{v.villageName}, {v.district}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
            </div>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Bio / Notes</label>
            <textarea rows={2} style={{ ...inp, resize: "vertical" }} value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Short bio or notes about this staff member…" />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
              <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} style={{ width: "16px", height: "16px" }} />
              Currently active / serving
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "22px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving}
            style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : member ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StaffCard({ member, onEdit, onDelete }) {
  const roleColor = ROLE_COLORS[member.role] || "#64748b";
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px", display: "flex", gap: "14px" }}>
      {/* Avatar */}
      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: `${roleColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontWeight: "800", fontSize: "18px", color: roleColor }}>{member.name.charAt(0).toUpperCase()}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ margin: "0 0 3px", fontWeight: "800", fontSize: "15px", color: "#0f172a" }}>{member.name}</h3>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ background: `${roleColor}18`, color: roleColor, padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600" }}>{ROLE_LABELS[member.role]}</span>
              <span style={{ background: member.isActive ? "#dcfce7" : "#f1f5f9", color: member.isActive ? "#166534" : "#64748b", padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px" }}>
                {member.isActive ? <UserCheck size={10} /> : <UserX size={10} />}
                {member.isActive ? "Active" : "Inactive"}
              </span>
              <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "5px", fontSize: "11px" }}>{EMP_LABELS[member.employmentType]}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => onEdit(member)} style={{ background: "#eff6ff", border: "none", color: "#2563eb", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}><Edit2 size={13} /></button>
            <button onClick={() => onDelete(member._id)} style={{ background: "#fef2f2", border: "none", color: "#dc2626", borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}><Trash2 size={13} /></button>
          </div>
        </div>

        {member.specialization && <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#64748b" }}>{member.specialization}</p>}

        <div style={{ display: "flex", gap: "14px", marginTop: "8px", flexWrap: "wrap" }}>
          {member.phone && <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}><Phone size={11} />{member.phone}</span>}
          {member.email && <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}><Mail size={11} />{member.email}</span>}
          {member.villageId && <span style={{ fontSize: "12px", color: "#6366f1", fontWeight: "600" }}>{member.villageId.villageName}</span>}
        </div>
      </div>
    </div>
  );
}

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
  }, []);

  const onSaved = (member) => setStaff(ms => {
    const idx = ms.findIndex(m => m._id === member._id);
    if (idx >= 0) { const n = [...ms]; n[idx] = member; return n; }
    return [member, ...ms];
  });

  const onDelete = (id) => {
    if (!confirm("Remove this staff member?")) return;
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
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Staff & Professionals</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Doctors, teachers, and other professionals serving with your NGO</p>
        </div>
        <button onClick={() => setModal("create")}
          style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Role stats */}
      {staff.length > 0 && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
          {ROLES.filter(r => roleCounts[r] > 0).map(r => (
            <div key={r} style={{ background: `${ROLE_COLORS[r]}12`, border: `1px solid ${ROLE_COLORS[r]}30`, borderRadius: "10px", padding: "8px 16px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: "800", fontSize: "16px", color: ROLE_COLORS[r] }}>{roleCounts[r]}</span>
              <span style={{ fontSize: "12px", color: ROLE_COLORS[r] }}>{ROLE_LABELS[r]}{roleCounts[r] > 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {["all","active","inactive"].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ padding: "6px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: "600",
                background: activeFilter === f ? "#0f172a" : "#fff",
                color: activeFilter === f ? "#fff" : "#374151",
                borderColor: activeFilter === f ? "#0f172a" : "#e2e8f0" }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ appearance: "none", padding: "7px 28px 7px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", background: "#fff", cursor: "pointer", color: "#374151" }}>
            <option value="all">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px", gap: "10px", color: "#64748b" }}>
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "14px", border: "1px dashed #e2e8f0" }}>
          <Users size={48} style={{ color: "#cbd5e1", marginBottom: "14px" }} />
          <h3 style={{ margin: "0 0 8px", fontWeight: "700", color: "#0f172a" }}>No staff members</h3>
          <p style={{ color: "#64748b", margin: "0 0 20px" }}>Add doctors, teachers, and professionals working with your NGO.</p>
          <button onClick={() => setModal("create")}
            style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: "pointer" }}>
            Add First Member
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(m => <StaffCard key={m._id} member={m} onEdit={m => setModal(m)} onDelete={onDelete} />)}
        </div>
      )}

      {modal && <StaffModal member={modal === "create" ? null : modal} villages={villages} onClose={() => setModal(null)} onSaved={onSaved} />}
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
