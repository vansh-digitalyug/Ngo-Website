import { useState, useEffect } from "react";
import FixGrammarButton from "../../components/ui/FixGrammarButton";
import { usePincodeAutoFill } from "../../hooks/usePincodeAutoFill";
import { useOutletContext } from "react-router-dom";
import {
  MapPin, Plus, Edit2, Trash2, CheckCircle, PauseCircle, Flag,
  Loader2, Users, Droplets, Zap, Trash, Route, ChevronDown,
  X, AlertTriangle, Clock, TrendingUp, Home
} from "lucide-react";
import { API_BASE_URL } from "./NgoLayout.jsx";

const STATUS_META = {
  active:    { label: "Active",    className: "bg-[#f0f4ea] text-[#5a6b46] border border-[#d6e3c9]", Icon: CheckCircle },
  paused:    { label: "Paused",    className: "bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]", Icon: PauseCircle },
  completed: { label: "Completed", className: "bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]", Icon: Flag },
};

const NEED_KEYS = ["water", "electricity", "sanitation", "roads"];
const NEED_ICONS = { water: Droplets, electricity: Zap, sanitation: Trash, roads: Route };
const NEED_COLORS = { 
  water: { text: "text-[#0ea5e9]", bg: "bg-[#0ea5e9]", track: "bg-[#e0f2fe]" }, 
  electricity: { text: "text-[#eab308]", bg: "bg-[#eab308]", track: "bg-[#fef9c3]" }, 
  sanitation: { text: "text-[#10b981]", bg: "bg-[#10b981]", track: "bg-[#d1fae5]" }, 
  roads: { text: "text-[#8b5cf6]", bg: "bg-[#8b5cf6]", track: "bg-[#ede9fe]" } 
};

const empty = {
  villageName: "", district: "", state: "", pincode: "",
  totalFamilies: "", description: "", status: "active",
  basicNeeds: { water: { coveragePercent: 0 }, electricity: { coveragePercent: 0 }, sanitation: { coveragePercent: 0 }, roads: { coveragePercent: 0 } },
};

const inputCls = "w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all";
const labelCls = "block text-sm font-bold text-[#222222] mb-1.5";

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

  const { fetchPincode, pincodeLoading, pincodeError } = usePincodeAutoFill((info) => {
    setForm(f => ({ ...f, district: info.district, state: info.state }));
  });

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

  return (
    <div className="fixed inset-0 z-50 bg-[#222222]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 opacity-100 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 rounded-t-2xl">
          <h2 className="text-lg font-bold text-[#222222] flex items-center gap-2">
            <Home size={20} className="text-[#6c5d46]" />
            {village ? "Edit Village" : "Adopt a Village"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border bg-[#fef2f2] text-[#991b1b] border-[#fecaca]">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className={labelCls}>Village Name <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.villageName} onChange={e => set("villageName", e.target.value)} placeholder="e.g. Rampur" />
            </div>
            
            <div>
              <label className={labelCls}>District <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.district} onChange={e => set("district", e.target.value)} placeholder="e.g. Varanasi" />
            </div>
            
            <div>
              <label className={labelCls}>State <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.state} onChange={e => set("state", e.target.value)} placeholder="e.g. Uttar Pradesh" />
            </div>
            
            <div>
              <label className={labelCls}>Pincode</label>
              <input className={inputCls} value={form.pincode} onChange={e => { set("pincode", e.target.value); fetchPincode(e.target.value); }} placeholder="221001" />
              {pincodeLoading && <p className="text-xs font-medium text-[#888888] mt-1.5 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Fetching location…</p>}
              {pincodeError  && <p className="text-xs font-medium text-red-500 mt-1.5">{pincodeError}</p>}
            </div>
            
            <div>
              <label className={labelCls}>Total Families</label>
              <input type="number" min="0" className={inputCls} value={form.totalFamilies} onChange={e => set("totalFamilies", e.target.value)} placeholder="0" />
            </div>
            
            <div className="sm:col-span-2">
              <label className={labelCls}>Status</label>
              <div className="relative">
                <select value={form.status} onChange={e => set("status", e.target.value)} className={`${inputCls} appearance-none pr-10 cursor-pointer`}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-[#222222]">Description</label>
                <FixGrammarButton text={form.description} onFixed={t => set("description", t)} />
              </div>
              <textarea rows={3} className={`${inputCls} resize-y min-h-[80px]`} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Briefly describe the village and your goals…" />
            </div>
          </div>

          <div className="bg-[#f8f7f5] rounded-xl p-5 border border-[#e5e5e5]">
            <h3 className="text-sm font-bold text-[#222222] mb-4">Basic Needs Coverage (%)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {NEED_KEYS.map(need => {
                const Icon = NEED_ICONS[need];
                const theme = NEED_COLORS[need];
                return (
                  <div key={need} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className={`p-2 rounded-md bg-opacity-20 ${theme.bg.replace('bg-', 'bg-')}/10`}>
                      <Icon size={16} className={theme.text} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-[#6c6c6c] capitalize mb-1">{need}</label>
                      <input type="number" min={0} max={100} className="w-full px-2 py-1 bg-[#f8f7f5] border border-[#e5e5e5] rounded text-sm font-bold focus:outline-none focus:border-[#6c5d46]" value={form.basicNeeds[need]?.coveragePercent ?? 0} onChange={e => setNeed(need, e.target.value)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 bg-white text-[#2c2c2c] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : (village ? "Save Changes" : "Create Village")}
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

  return (
    <div className="fixed inset-0 z-50 bg-[#222222]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 opacity-100 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-xl scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 rounded-t-2xl">
          <h3 className="text-lg font-bold text-[#222222] flex items-center gap-2">
            <Flag size={20} className="text-[#6c5d46]" /> Add Milestone
          </h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-5">
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border bg-[#fef2f2] text-[#991b1b] border-[#fecaca]">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          
          <div>
            <label className={labelCls}>Title <span className="text-red-500">*</span></label>
            <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Water tank installed" />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={2} className={`${inputCls} resize-y min-h-[80px]`} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Details…" />
          </div>
          <div>
            <label className={labelCls}>Achievement Date</label>
            <input type="date" className={inputCls} value={form.achievedAt} onChange={e => setForm(f => ({ ...f, achievedAt: e.target.value }))} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 bg-white text-[#2c2c2c] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Add Milestone"}
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
    if (!window.confirm("Remove this milestone?")) return;
    fetch(`${API_BASE_URL}/api/villages/${village._id}/milestone/${mid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) onMilestoneRemoved(village._id, d.data.milestones); })
      .catch(() => {});
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5 hover:shadow-md transition-all relative overflow-hidden group">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#6c5d46] opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div>
        <div className="flex justify-between items-start gap-3 mb-2">
          <div>
            <h3 className="font-extrabold text-[#222222] text-lg mb-1">{village.villageName}</h3>
            <div className="flex items-center gap-1.5 text-[#888888] text-xs font-bold uppercase tracking-wide">
              <MapPin size={12} /> {village.district}, {village.state}
            </div>
          </div>
          <span className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm ${sm.className}`}>
            <sm.Icon size={12} /> {sm.label}
          </span>
        </div>

        {village.description && (
          <p className="text-sm text-[#6c6c6c] leading-relaxed line-clamp-2 mt-3">{village.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 py-3 border-y border-gray-100">
        <span className="flex items-center gap-1.5 text-xs font-bold text-[#6c6c6c] bg-[#f8f7f5] px-2.5 py-1.5 rounded-lg border border-[#e5e5e5]">
          <Users size={14} className="text-[#888888]" /> {village.totalFamilies || 0} families
        </span>
        <span className="flex items-center gap-1.5 text-xs font-bold text-[#6c6c6c] bg-[#f8f7f5] px-2.5 py-1.5 rounded-lg border border-[#e5e5e5]">
          <TrendingUp size={14} className="text-[#888888]" /> {village.milestones?.length || 0} milestones
        </span>
      </div>

      {/* Need bars */}
      <div className="grid grid-cols-2 gap-4">
        {NEED_KEYS.map(need => {
          const Icon = NEED_ICONS[need];
          const theme = NEED_COLORS[need];
          const pct = village.basicNeeds?.[need]?.coveragePercent || 0;
          return (
            <div key={need}>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider ${theme.text}`}>
                  <Icon size={12} /> {need}
                </span>
                <span className={`text-[10px] font-extrabold ${theme.text}`}>{pct}%</span>
              </div>
              <div className={`h-1.5 w-full rounded-full ${theme.track} overflow-hidden`}>
                <div className={`h-full rounded-full ${theme.bg}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 mt-auto">
        <button onClick={() => onEdit(village)} className="px-3 py-1.5 bg-white border border-gray-200 text-[#6c6c6c] hover:bg-gray-50 hover:text-[#222222] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
          <Edit2 size={12} /> Edit
        </button>
        <button onClick={() => onAddMilestone(village)} className="px-3 py-1.5 bg-[#f0f4ea] text-[#5a6b46] border border-[#d6e3c9] hover:bg-[#e4ebd8] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
          <Plus size={12} /> Milestone
        </button>
        <button onClick={() => setExpanded(x => !x)} className="px-3 py-1.5 bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] hover:bg-[#dbeafe] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
          {expanded ? "Hide" : "View"} ({village.milestones?.length || 0})
        </button>
        <button onClick={() => onDelete(village._id)} className="px-3 py-1.5 bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] hover:bg-[#fee2e2] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ml-auto">
          <Trash2 size={12} />
        </button>
      </div>

      {/* Milestones Dropdown */}
      {expanded && (
        <div className="mt-2 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          {!village.milestones?.length ? (
            <div className="text-center p-4 bg-[#f8f7f5] rounded-xl border border-gray-100 border-dashed">
              <p className="text-sm font-medium text-[#888888]">No milestones yet. Add your first achievement!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {village.milestones.map(m => (
                <div key={m._id} className="flex justify-between items-start p-3 bg-[#f8f7f5] rounded-xl border border-[#e5e5e5]">
                  <div>
                    <p className="font-bold text-sm text-[#222222] mb-0.5">{m.title}</p>
                    {m.description && <p className="text-xs text-[#6c6c6c] leading-relaxed mb-1.5">{m.description}</p>}
                    {m.achievedAt && (
                      <p className="text-[10px] font-extrabold text-[#888888] uppercase tracking-wider flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(m.achievedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <button onClick={() => removeMilestone(m._id)} className="p-1.5 text-gray-400 hover:text-[#991b1b] hover:bg-[#fef2f2] rounded-md transition-colors shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
    if (!window.confirm("Delete this village adoption? This will also delete all associated problems.")) return;
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
    <div className="min-h-screen bg-[#f8f7f5] p-4 sm:p-6 lg:p-8 font-sans text-[#2c2c2c] selection:bg-[#eaddc8] selection:text-[#2c2c2c] flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#222222] flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-[#6c5d46]">
              <Home size={24} />
            </div>
            Village Adoptions
          </h1>
          <p className="text-[#6c6c6c] text-sm sm:text-base font-medium mt-2">
            Manage villages your NGO has adopted for development.
          </p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm shrink-0"
        >
          <Plus size={16} /> Adopt a Village
        </button>
      </div>

      {/* Summary */}
      {villages.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {Object.entries(
            villages.reduce((acc, v) => { acc[v.status] = (acc[v.status] || 0) + 1; return acc; }, {})
          ).map(([status, count]) => {
            const sm = STATUS_META[status] || STATUS_META.active;
            return (
              <div key={status} className={`px-4 py-3 rounded-xl flex items-center gap-3 font-bold ${sm.className}`}>
                <sm.Icon size={18} />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl">{count}</span>
                  <span className="text-xs uppercase tracking-wide opacity-80">{sm.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="w-10 h-10 border-4 border-[#eaddc8] border-t-[#6c5d46] rounded-full animate-spin"></div>
          <p className="text-[#888888] font-medium">Loading villages…</p>
        </div>
      ) : villages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-[#f8f7f5] rounded-full flex items-center justify-center text-[#d5cfc4] mb-4">
            <MapPin size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold text-[#222222] mb-2">No villages adopted yet</h3>
          <p className="text-sm font-medium text-[#888888] mb-6">Start by adopting a village to track your NGO's ground-level impact.</p>
          <button onClick={() => setModal("create")} className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm">
            Adopt First Village
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
    </div>
  );
}