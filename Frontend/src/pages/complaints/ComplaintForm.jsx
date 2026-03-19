import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, CheckCircle, ChevronDown, Search,
  Loader2, X, ArrowLeft, MapPin, FileText,
  Droplets, BookOpen, Heart, Zap, Briefcase,
  Trash2, Route, HelpCircle, Flag
} from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

// ── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "water",       label: "Water Supply",         icon: Droplets,   color: "#0ea5e9" },
  { value: "sanitation",  label: "Sanitation",           icon: Trash2,     color: "#10b981" },
  { value: "education",   label: "Education",            icon: BookOpen,   color: "#8b5cf6" },
  { value: "health",      label: "Health",               icon: Heart,      color: "#ef4444" },
  { value: "road",        label: "Road / Infrastructure", icon: Route,     color: "#f59e0b" },
  { value: "employment",  label: "Employment",           icon: Briefcase,  color: "#6366f1" },
  { value: "electricity", label: "Electricity",          icon: Zap,        color: "#eab308" },
  { value: "other",       label: "Other",                icon: HelpCircle, color: "#6b7280" },
];

const PRIORITIES = [
  { value: "low",      label: "Low",      desc: "Can wait",         bg: "#f0fdf4", color: "#166534", border: "#86efac" },
  { value: "medium",   label: "Medium",   desc: "Needs attention",  bg: "#fffbeb", color: "#92400e", border: "#fcd34d" },
  { value: "high",     label: "High",     desc: "Urgent",           bg: "#fff7ed", color: "#9a3412", border: "#fb923c" },
  { value: "critical", label: "Critical", desc: "Immediate action", bg: "#fef2f2", color: "#991b1b", border: "#fca5a5" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function readUser() {
  try { return JSON.parse(localStorage.getItem("user")) || null; }
  catch { return null; }
}

// ── Village Search Dropdown ──────────────────────────────────────────────────
function VillageDropdown({ value, onChange, error }) {
  const [query, setQuery]       = useState("");
  const [villages, setVillages] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/villages?limit=100&status=all`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        // API returns: { success, data: { villages: [...] } }
        const all = Array.isArray(data?.data?.villages)
          ? data.data.villages
          : Array.isArray(data?.data)
          ? data.data
          : [];
        // Filter client-side by name/district/state
        const q = query.trim().toLowerCase();
        const filtered = q
          ? all.filter(
              (v) =>
                v.villageName?.toLowerCase().includes(q) ||
                v.district?.toLowerCase().includes(q) ||
                v.state?.toLowerCase().includes(q)
            )
          : all;
        setVillages(filtered);
      } catch {
        setVillages([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const choose = (v) => {
    setSelected(v);
    onChange(v._id);
    setOpen(false);
    setQuery("");
  };

  const clear = () => {
    setSelected(null);
    onChange("");
    setQuery("");
  };

  return (
    <div className="relative">
      {selected ? (
        <div className={`flex items-center justify-between w-full px-4 py-3 border rounded-xl bg-green-50 ${error ? "border-red-400" : "border-green-400"}`}>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">{selected.villageName}</p>
              <p className="text-xs text-gray-500">{selected.district}, {selected.state}</p>
            </div>
          </div>
          <button type="button" onClick={clear} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="Search your village / gram panchayat..."
            className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
              error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
            }`}
          />
          {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
        </div>
      )}

      {open && !selected && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {villages.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500 text-center">
              {loading ? "Searching…" : query ? "No villages found" : "Type to search villages"}
            </p>
          ) : (
            villages.map((v) => (
              <button
                key={v._id}
                type="button"
                onMouseDown={() => choose(v)}
                className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <p className="text-sm font-medium text-gray-800">{v.villageName}</p>
                <p className="text-xs text-gray-500">{v.district}, {v.state} {v.pincode ? `- ${v.pincode}` : ""}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Form ────────────────────────────────────────────────────────────────
export default function ComplaintForm() {
  const navigate  = useNavigate();
  const user      = readUser();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const [form, setForm] = useState({
    villageId:   "",
    title:       "",
    description: "",
    category:    "",
    priority:    "medium",
    name:        user?.name || "",
  });

  const [errors,   setErrors]   = useState({});
  const [status,   setStatus]   = useState("idle"); // idle | submitting | success | error
  const [apiError, setApiError] = useState("");

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.villageId)              e.villageId   = "Please select your village.";
    if (!form.title.trim())           e.title       = "Title is required.";
    if (form.title.trim().length > 200) e.title     = "Title cannot exceed 200 characters.";
    if (!form.category)               e.category    = "Please select a problem category.";
    if (form.description.length > 2000) e.description = "Description cannot exceed 2000 characters.";
    if (!isLoggedIn && !form.name.trim()) e.name    = "Your name is required.";
    return e;
  };

  const clearError = (field) => setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus("submitting");
    setApiError("");

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const body = {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        priority:    form.priority,
      };
      if (!isLoggedIn) body.submittedByName = form.name.trim();

      const res = await fetch(`${API_BASE_URL}/api/villages/${form.villageId}/problems`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to submit complaint.");

      setStatus("success");
    } catch (err) {
      setApiError(err.message);
      setStatus("error");
    }
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complaint Submitted!</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Your complaint has been registered. The concerned NGO and admin will review it and take necessary action.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setForm({ villageId: "", title: "", description: "", category: "", priority: "medium", name: user?.name || "" }); setStatus("idle"); }}
              className="px-5 py-2.5 border border-orange-400 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors text-sm"
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate("/villages")}
              className="px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm"
            >
              View Villages
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-10 px-4">

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={24} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report a Local Problem</h1>
            <p className="text-gray-500 text-sm mt-1">
              Help us improve your community by reporting issues in your village or locality.
            </p>
          </div>
        </div>
      </div>

      {/* Card */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-500"
            style={{ width: `${
              (form.villageId ? 25 : 0) +
              (form.title ? 25 : 0) +
              (form.category ? 25 : 0) +
              (form.description ? 25 : 0)
            }%` }}
          />
        </div>

        <div className="p-6 md:p-8 space-y-7">

          {/* API Error */}
          {status === "error" && apiError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <X size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          )}

          {/* ── Section 1: Location ── */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={14} className="text-orange-500" /> Location
            </h3>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Village / Gram Panchayat <span className="text-red-500">*</span>
            </label>
            <VillageDropdown
              value={form.villageId}
              onChange={(id) => { setForm((p) => ({ ...p, villageId: id })); clearError("villageId"); }}
              error={errors.villageId}
            />
            {errors.villageId && <p className="text-xs text-red-500 mt-1">{errors.villageId}</p>}
          </div>

          {/* ── Section 2: Problem Details ── */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <FileText size={14} className="text-orange-500" /> Problem Details
            </h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Problem Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                maxLength={200}
                onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); clearError("title"); }}
                placeholder="e.g. No drinking water supply for 3 days"
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors ${
                  errors.title ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-orange-400"
                }`}
              />
              <div className="flex justify-between mt-1">
                {errors.title
                  ? <p className="text-xs text-red-500">{errors.title}</p>
                  : <span />
                }
                <span className={`text-xs ${form.title.length > 180 ? "text-red-500" : "text-gray-400"}`}>
                  {form.title.length}/200
                </span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setForm((p) => ({ ...p, category: value })); clearError("category"); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-xs font-semibold ${
                      form.category === value
                        ? "border-orange-400 bg-orange-50 text-orange-700 shadow-sm scale-[1.02]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={20} style={{ color: form.category === value ? "#f97316" : color }} />
                    {label}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level <span className="text-gray-400 text-xs font-normal">(How urgent is this?)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORITIES.map(({ value, label, desc, bg, color, border }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, priority: value }))}
                    className="flex flex-col items-center gap-0.5 p-3 rounded-xl border-2 transition-all duration-200 text-xs font-semibold"
                    style={
                      form.priority === value
                        ? { background: bg, borderColor: border, color, transform: "scale(1.02)" }
                        : { background: "#fff", borderColor: "#e5e7eb", color: "#6b7280" }
                    }
                  >
                    <Flag size={14} />
                    {label}
                    <span className="text-[10px] font-normal opacity-75">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description{" "}
                <span className="text-gray-400 text-xs font-normal">(Optional — more details help faster resolution)</span>
              </label>
              <textarea
                value={form.description}
                maxLength={2000}
                rows={4}
                onChange={(e) => { setForm((p) => ({ ...p, description: e.target.value })); clearError("description"); }}
                placeholder="Describe the problem in detail — when did it start, how many people are affected, what has been tried so far..."
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition-colors ${
                  errors.description ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-orange-400"
                }`}
              />
              <div className="flex justify-between mt-1">
                {errors.description
                  ? <p className="text-xs text-red-500">{errors.description}</p>
                  : <span />
                }
                <span className={`text-xs ${form.description.length > 1900 ? "text-red-500" : "text-gray-400"}`}>
                  {form.description.length}/2000
                </span>
              </div>
            </div>
          </div>

          {/* ── Section 3: Reporter Info ── */}
          {!isLoggedIn && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                Your Details
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); clearError("name"); }}
                placeholder="Enter your name (or leave blank for Anonymous)"
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors ${
                  errors.name ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-orange-400"
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              <p className="text-xs text-gray-400 mt-1">
                <button
                  type="button"
                  onClick={() => navigate("/login/user")}
                  className="text-orange-500 hover:underline"
                >
                  Login
                </button>{" "}
                to auto-fill your details and track your complaint.
              </p>
            </div>
          )}

          {isLoggedIn && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle size={16} className="text-green-600 shrink-0" />
              <p className="text-sm text-green-700">
                Submitting as <strong>{user?.name || "You"}</strong>. Your complaint will be linked to your account.
              </p>
            </div>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg"
          >
            {status === "submitting" ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting…</>
            ) : (
              <><AlertTriangle size={18} /> Submit Complaint</>
            )}
          </button>

          <p className="text-xs text-center text-gray-400">
            Complaints are reviewed by the concerned NGO and admin within 48–72 hours.
          </p>
        </div>
      </form>
    </div>
  );
}
