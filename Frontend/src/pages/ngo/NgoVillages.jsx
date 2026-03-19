import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  MapPin, Plus, Edit2, Trash2, CheckCircle, PauseCircle, Flag,
  Loader2, Users, Droplets, Zap, Trash, Route, ChevronDown,
  X, AlertTriangle, Clock, TrendingUp
} from "lucide-react";
import { API_BASE_URL } from "./NgoLayout.jsx";

const STATUS_META = {
  active:    { label: "Active",    bg: "#dcfce7", color: "#166534", Icon: CheckCircle },
  paused:    { label: "Paused",    bg: "#fef9c3", color: "#854d0e", Icon: PauseCircle },
  completed: { label: "Completed", bg: "#dbeafe", color: "#1e40af", Icon: Flag },
};

const NEED_KEYS = ["water", "electricity", "sanitation", "roads"];
const NEED_ICONS = { water: Droplets, electricity: Zap, sanitation: Trash, roads: Route };
const NEED_COLORS = { water: "#0ea5e9", electricity: "#eab308", sanitation: "#10b981", roads: "#8b5cf6" };

const empty = {
  villageName: "", district: "", state: "", pincode: "",
  totalFamilies: "", description: "", status: "active",
  basicNeeds: { water: { coveragePercent: 0 }, electricity: { coveragePercent: 0 }, sanitation: { coveragePercent: 0 }, roads: { coveragePercent: 0 } },
};

function VillageModal({ village, onClose, onSaved }) {
  const [form, setForm] = useState(village ? {
    villageName: village.villageName || "",
    district: village.district || "",
    state: village.state || "",
    pincode: village.pincode || "",
    totalFamilies: village.totalFamilies || "",
    description: village.description || "",
    status: village.status || "active",
    basicNeeds: {
      water:       { coveragePercent: village.basicNeeds?.water?.coveragePercent ?? 0 },
      electricity: { coveragePercent: village.basicNeeds?.electricity?.coveragePercent ?? 0 },
      sanitation:  { coveragePercent: village.basicNeeds?.sanitation?.coveragePercent ?? 0 },
      roads:       { coveragePercent: village.basicNeeds?.roads?.coveragePercent ?? 0 },
    },
  } : { ...empty, basicNeeds: { water: { coveragePercent: 0 }, electricity: { coveragePercent: 0 }, sanitation: { coveragePercent: 0 }, roads: { coveragePercent: 0 } } });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setNeed = (need, pct) => setForm(f => ({
    ...f, basicNeeds: { ...f.basicNeeds, [need]: { coveragePercent: Number(pct) } }
  }));

  const save = () => {
    if (!form.villageName.trim() || !form.district.trim() || !form.state.trim()) {
      setError("Village name, district, and state are required.");
      return;
    }
    setSaving(true); setError("");
    const url = village ? `${API_BASE_URL}/api/villages/${village._id}` : `${API_BASE_URL}/api/villages`;
    fetch(url, {
      method: village ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, totalFamilies: Number(form.totalFamilies) || 0 }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) { onSaved(d.data.village); onClose(); }
        else setError(d.message || "Failed to save");
      })
      .catch(() => setError("Network error"))
      .finally(() => setSaving(false));
  };

  const inp = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontWeight: "800", fontSize: "18px", color: "#0f172a" }}>
            {village ? "Edit Village" : "Adopt a Village"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
        </div>

        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Village Name *</label>
            <input style={inp} value={form.villageName} onChange={e => set("villageName", e.target.value)} placeholder="e.g. Rampur" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>District *</label>
            <input style={inp} value={form.district} onChange={e => set("district", e.target.value)} placeholder="e.g. Varanasi" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>State *</label>
            <input style={inp} value={form.state} onChange={e => set("state", e.target.value)} placeholder="e.g. Uttar Pradesh" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Pincode</label>
            <input style={inp} value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="221001" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Total Families</label>
            <input type="number" style={inp} value={form.totalFamilies} onChange={e => set("totalFamilies", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Status</label>
            <div style={{ position: "relative" }}>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                style={{ ...inp, appearance: "none", paddingRight: "30px", cursor: "pointer" }}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} />
            </div>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Description</label>
            <textarea rows={3} style={{ ...inp, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Briefly describe the village and your goals…" />
          </div>
        </div>

        {/* Basic Needs coverage */}
        <div style={{ marginTop: "20px" }}>
          <p style={{ margin: "0 0 12px", fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>Basic Needs Coverage (%)</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {NEED_KEYS.map(need => {
              const Icon = NEED_ICONS[need];
              const color = NEED_COLORS[need];
              return (
                <div key={need}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color, display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" }}>
                    <Icon size={13} /> {need.charAt(0).toUpperCase() + need.slice(1)}
                  </label>
                  <input type="number" min={0} max={100} style={inp} value={form.basicNeeds[need]?.coveragePercent ?? 0}
                    onChange={e => setNeed(need, e.target.value)} />
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving}
            style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : village ? "Save Changes" : "Create Village"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MilestoneModal({ village, onClose, onAdded }) {
  const [form, setForm] = useState({ title: "", description: "", achievedAt: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const save = () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    fetch(`${API_BASE_URL}/api/villages/${village._id}/milestone`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) { onAdded(d.data.milestones); onClose(); }
        else setError(d.message || "Failed");
      })
      .catch(() => setError("Network error"))
      .finally(() => setSaving(false));
  };

  const inp = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "440px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontWeight: "800", fontSize: "17px", color: "#0f172a" }}>Add Milestone</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "9px 12px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Title *</label>
            <input style={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Water tank installed" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Description</label>
            <textarea rows={2} style={{ ...inp, resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details…" />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "5px" }}>Achievement Date</label>
            <input type="date" style={inp} value={form.achievedAt} onChange={e => setForm(f => ({ ...f, achievedAt: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving}
            style={{ padding: "9px 20px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Add Milestone"}
          </button>
        </div>
      </div>
    </div>
  );
}

function VillageCard({ village, onEdit, onDelete, onAddMilestone, onMilestoneRemoved }) {
  const sm = STATUS_META[village.status] || STATUS_META.active;
  const [expanded, setExpanded] = useState(false);
  const token = localStorage.getItem("token");

  const removeMilestone = (mid) => {
    if (!confirm("Remove this milestone?")) return;
    fetch(`${API_BASE_URL}/api/villages/${village._id}/milestone/${mid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) onMilestoneRemoved(village._id, d.data.milestones); })
      .catch(() => {});
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden" }}>
      <div style={{ height: "5px", background: "linear-gradient(90deg, #2563eb, #7c3aed)" }} />
      <div style={{ padding: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <h3 style={{ margin: "0 0 3px", fontWeight: "800", color: "#0f172a", fontSize: "16px" }}>{village.villageName}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748b", fontSize: "12px" }}>
              <MapPin size={11} /> {village.district}, {village.state}
            </div>
          </div>
          <span style={{ background: sm.bg, color: sm.color, padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px" }}>
            <sm.Icon size={10} /> {sm.label}
          </span>
        </div>

        {village.description && (
          <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>{village.description}</p>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "14px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
            <Users size={11} /> {village.totalFamilies || 0} families
          </span>
          <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "3px" }}>
            <TrendingUp size={11} /> {village.milestones?.length || 0} milestones
          </span>
        </div>

        {/* Need bars */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
          {NEED_KEYS.map(need => {
            const Icon = NEED_ICONS[need];
            const color = NEED_COLORS[need];
            const pct = village.basicNeeds?.[need]?.coveragePercent || 0;
            return (
              <div key={need}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span style={{ fontSize: "11px", color, fontWeight: "600", display: "flex", alignItems: "center", gap: "3px" }}><Icon size={11} />{need}</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color }}>{pct}%</span>
                </div>
                <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "3px" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "3px" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => onEdit(village)}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
            <Edit2 size={12} /> Edit
          </button>
          <button onClick={() => onAddMilestone(village)}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#f0fdf4", color: "#166534", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
            <Plus size={12} /> Milestone
          </button>
          <button onClick={() => setExpanded(x => !x)}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#eff6ff", color: "#1d4ed8", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
            {expanded ? "Hide" : "View"} Milestones ({village.milestones?.length || 0})
          </button>
          <button onClick={() => onDelete(village._id)}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "7px", border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: "pointer", marginLeft: "auto" }}>
            <Trash2 size={12} /> Delete
          </button>
        </div>

        {/* Milestones */}
        {expanded && (
          <div style={{ marginTop: "14px", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
            {!village.milestones?.length ? (
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No milestones yet. Add your first achievement!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {village.milestones.map(m => (
                  <div key={m._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#f8fafc", borderRadius: "8px", padding: "10px 12px" }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>{m.title}</p>
                      {m.description && <p style={{ margin: "0 0 2px", fontSize: "12px", color: "#64748b" }}>{m.description}</p>}
                      {m.achievedAt && <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{new Date(m.achievedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
                    </div>
                    <button onClick={() => removeMilestone(m._id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "2px" }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NgoVillages() {
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // "create" | village object for edit
  const [milestoneTarget, setMilestoneTarget] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/villages/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setVillages(d.data.villages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSaved = (village) => {
    setVillages(vs => {
      const idx = vs.findIndex(v => v._id === village._id);
      if (idx >= 0) { const n = [...vs]; n[idx] = village; return n; }
      return [village, ...vs];
    });
  };

  const onDelete = (id) => {
    if (!confirm("Delete this village adoption? This will also delete all associated problems.")) return;
    fetch(`${API_BASE_URL}/api/villages/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setVillages(vs => vs.filter(v => v._id !== id)); })
      .catch(() => {});
  };

  const onMilestoneAdded = (milestones) => {
    if (!milestoneTarget) return;
    setVillages(vs => vs.map(v => v._id === milestoneTarget._id ? { ...v, milestones } : v));
  };

  const onMilestoneRemoved = (villageId, milestones) => {
    setVillages(vs => vs.map(v => v._id === villageId ? { ...v, milestones } : v));
  };

  return (
    <div style={{ padding: "28px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontWeight: "800", fontSize: "22px", color: "#0f172a" }}>Village Adoptions</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Manage villages your NGO has adopted for development</p>
        </div>
        <button onClick={() => setModal("create")}
          style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
          <Plus size={16} /> Adopt a Village
        </button>
      </div>

      {/* Summary */}
      {villages.length > 0 && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          {Object.entries(
            villages.reduce((acc, v) => { acc[v.status] = (acc[v.status] || 0) + 1; return acc; }, {})
          ).map(([status, count]) => {
            const sm = STATUS_META[status] || STATUS_META.active;
            return (
              <div key={status} style={{ background: sm.bg, border: `1px solid ${sm.color}30`, borderRadius: "10px", padding: "10px 18px", display: "flex", alignItems: "center", gap: "8px" }}>
                <sm.Icon size={14} color={sm.color} />
                <span style={{ fontWeight: "700", fontSize: "16px", color: sm.color }}>{count}</span>
                <span style={{ fontSize: "13px", color: sm.color }}>{sm.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px", gap: "10px", color: "#64748b" }}>
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /> Loading villages…
        </div>
      ) : villages.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: "16px", border: "1px dashed #e2e8f0" }}>
          <MapPin size={48} style={{ color: "#cbd5e1", marginBottom: "16px" }} />
          <h3 style={{ margin: "0 0 8px", fontWeight: "700", color: "#0f172a" }}>No villages adopted yet</h3>
          <p style={{ color: "#64748b", margin: "0 0 20px" }}>Start by adopting a village to track your NGO's ground-level impact.</p>
          <button onClick={() => setModal("create")}
            style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "700", cursor: "pointer" }}>
            Adopt First Village
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: "18px" }}>
          {villages.map(v => (
            <VillageCard
              key={v._id}
              village={v}
              onEdit={v => setModal(v)}
              onDelete={onDelete}
              onAddMilestone={v => setMilestoneTarget(v)}
              onMilestoneRemoved={onMilestoneRemoved}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <VillageModal
          village={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}
      {milestoneTarget && (
        <MilestoneModal
          village={milestoneTarget}
          onClose={() => setMilestoneTarget(null)}
          onAdded={onMilestoneAdded}
        />
      )}

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
}
