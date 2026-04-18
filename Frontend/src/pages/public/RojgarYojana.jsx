import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, IndianRupee, Users, Search, X,
  CheckCircle, AlertCircle, Clock, GraduationCap,
  Wrench, Store, Building2, Briefcase, ArrowUpRight,
} from "lucide-react";
import { API } from "../../utils/S3.js";

const CATEGORIES = [
  { key: "all",             label: "All"              },
  { key: "skill_training",  label: "Skill Training"   },
  { key: "job_placement",   label: "Job Placement"    },
  { key: "self_employment", label: "Self Employment"  },
  { key: "apprenticeship",  label: "Apprenticeship"   },
  { key: "other",           label: "Other"            },
];

const CAT_META = {
  skill_training:  { label: "Skill Training",  color: "#7c3aed", bg: "#f5f3ff", icon: GraduationCap },
  job_placement:   { label: "Job Placement",   color: "#0369a1", bg: "#f0f9ff", icon: Building2    },
  self_employment: { label: "Self Employment", color: "#b45309", bg: "#fffbeb", icon: Store        },
  apprenticeship:  { label: "Apprenticeship",  color: "#047857", bg: "#f0fdf4", icon: Wrench       },
  other:           { label: "Other",           color: "#64748b", bg: "#f8fafc", icon: Briefcase    },
};

const EDU_OPTIONS = [
  { value: "below_10th",   label: "Below 10th"    },
  { value: "10th",         label: "10th Pass"     },
  { value: "12th",         label: "12th Pass"     },
  { value: "graduate",     label: "Graduate"      },
  { value: "postgraduate", label: "Post Graduate" },
  { value: "other",        label: "Other"         },
];

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Apply Modal ─────────────────────────────────────────────────────────── */
function ApplyModal({ job, onClose }) {
  const VALIDATION = {
    onlyTextNoNumbers: (value) =>
      value.replace(/[0-9]/g, "").replace(/[^a-zA-Z\s'-]/g, "").trim(),
    isValidEmail: (email) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    isValidName: (name) => {
      const trimmed = name.trim();
      return trimmed.length >= 2 && trimmed.length <= 100 && !/[0-9]/.test(trimmed) && /^[a-zA-Z]/.test(trimmed);
    },
    isValidPhone: (phone) => {
      const digitsOnly = phone.replace(/\D/g, "");
      return digitsOnly.length === 10;
    },
    onlyNumbers: (value) =>
      value.replace(/[^0-9]/g, "").slice(0, 10),
  };

  const validateApplicationForm = (formData) => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    } else if (!VALIDATION.isValidName(formData.name)) {
      errors.name = "Name must be 2-100 chars, no numbers, start with letter.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!VALIDATION.isValidEmail(formData.email)) {
      errors.email = "Please enter a valid email.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone is required.";
    } else if (!VALIDATION.isValidPhone(formData.phone)) {
      errors.phone = "Phone must be exactly 10 digits.";
    }

    if (formData.age && (formData.age < 14 || formData.age > 65)) {
      errors.age = "Age must be between 14 and 65.";
    }

    return errors;
  };

  const [form, setForm] = useState({
    name: "", email: "", phone: "", age: "", education: "other", experience: "", message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");
  const meta = CAT_META[job.category] || CAT_META.other;

  const set = (k, v) => {
    let processedVal = v;
    if ((k === "name") && typeof v === "string") {
      processedVal = VALIDATION.onlyTextNoNumbers(v);
    }
    if ((k === "phone") && typeof v === "string") {
      processedVal = VALIDATION.onlyNumbers(v);
    }
    if ((k === "age") && typeof v === "string") {
      processedVal = v.replace(/[^0-9]/g, "").slice(0, 2);
    }
    if ((k === "experience" || k === "message") && typeof v === "string") {
      processedVal = VALIDATION.onlyTextNoNumbers(v);
    }
    setForm(f => ({ ...f, [k]: processedVal }));
    if (errors[k]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[k];
        return newErrors;
      });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const formErrors = validateApplicationForm(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/employment-applications`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employmentId: job._id, ...form }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      setDone(true);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const input = "w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 bg-white transition-colors";
  const errorClass = "border-red-200 bg-red-50 text-red-700 focus:border-red-400";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(28,25,23,0.55)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }} transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl overflow-hidden max-h-[96vh] overflow-y-auto"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}
      >
        {/* header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-start justify-between gap-4">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md mb-2"
              style={{ background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
            <h2 className="text-base font-bold text-stone-800 leading-snug">{job.title}</h2>
            <p className="text-xs text-stone-500 mt-0.5">{job.ngoId?.ngoName || "NGO"} · {job.location}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors mt-1 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-16 text-center">
            <CheckCircle size={44} className="mx-auto mb-4" style={{ color: meta.color }} />
            <h3 className="text-lg font-bold text-stone-800 mb-2">Application Submitted</h3>
            <p className="text-sm text-stone-500 max-w-xs mx-auto mb-8">
              The NGO will review your application and get in touch soon.
            </p>
            <button onClick={onClose}
              className="px-8 py-2.5 rounded-lg font-semibold text-sm text-white"
              style={{ background: meta.color }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-5 flex flex-col gap-4">
            {/* Error Summary Box */}
            {Object.keys(errors).length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">Please fix the following errors:</div>
                    <ul className="list-disc ml-4 space-y-0.5">
                      {Object.values(errors).map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-4 py-3">
                <AlertCircle size={14} />{error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5 flex items-center justify-between">
                  <span>Full Name *</span>
                  {form.name && !errors.name && <CheckCircle size={14} className="text-green-600" />}
                </label>
                <input
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="Your name"
                  className={`${input} ${errors.name ? errorClass : ""}`}
                />
                {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5 flex items-center justify-between">
                  <span>Age</span>
                  {form.age && (form.age >= 14 && form.age <= 65) && <CheckCircle size={14} className="text-green-600" />}
                </label>
                <input
                  type="text"
                  min="14"
                  max="65"
                  value={form.age}
                  onChange={e => set("age", e.target.value)}
                  placeholder="14-65"
                  className={input}
                  maxLength={2}
                />
                {errors.age && <div className="text-xs text-red-600 mt-1">{errors.age}</div>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5 flex items-center justify-between">
                  <span>Email *</span>
                  {form.email && !errors.email && <CheckCircle size={14} className="text-green-600" />}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="you@email.com"
                  className={`${input} ${errors.email ? errorClass : ""}`}
                />
                {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5 flex items-center justify-between">
                  <span>Phone *</span>
                  {form.phone.length === 10 && <CheckCircle size={14} className="text-green-600" />}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    placeholder="10-digit number"
                    className={`${input} ${errors.phone ? errorClass : ""} pr-10`}
                    maxLength={10}
                    inputMode="numeric"
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold ${
                    form.phone.length === 10 ? "text-green-600" : form.phone.length > 0 ? "text-orange-400" : "text-stone-300"
                  }`}>
                    {form.phone.length}/10
                  </span>
                </div>
                {errors.phone && <div className="text-xs text-red-600 mt-1">{errors.phone}</div>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">Education</label>
              <select
                value={form.education}
                onChange={e => set("education", e.target.value)}
                className={input + " bg-white"}
              >
                {EDU_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 flex items-center justify-between">
                <span>Experience (Optional)</span>
                <span className="text-[10px] text-stone-400 font-normal">No numbers allowed</span>
              </label>
              <textarea
                value={form.experience}
                onChange={e => set("experience", e.target.value)}
                rows={2}
                placeholder="Skills, training, or work experience (letters only)…"
                className={input + " resize-none"}
                maxLength={500}
              />
              <div className={`text-xs mt-1 ${form.experience.length > 450 ? "text-orange-500" : "text-stone-400"}`}>
                {form.experience.length}/500
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 flex items-center justify-between">
                <span>Cover Message (Optional)</span>
                <span className="text-[10px] text-stone-400 font-normal">No numbers allowed</span>
              </label>
              <textarea
                value={form.message}
                onChange={e => set("message", e.target.value)}
                rows={3}
                placeholder="Why are you interested in this (letters only)?"
                className={input + " resize-none"}
                maxLength={500}
              />
              <div className={`text-xs mt-1 ${form.message.length > 450 ? "text-orange-500" : "text-stone-400"}`}>
                {form.message.length}/500
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className={`w-full py-3 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all mt-1 ${
                Object.keys(errors).length > 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90"
              }`}
              style={{ background: meta.color }}
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? "Submitting…" : Object.keys(errors).length > 0 ? `Fix ${Object.keys(errors).length} Error(s)` : "Submit Application"}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Job Card ─────────────────────────────────────────────────────────────── */
function JobCard({ job, onApply, index }) {
  const meta      = CAT_META[job.category] || CAT_META.other;
  const CatIcon   = meta.icon;
  const filled    = Math.min(job.filled || 0, job.openings || 1);
  const pct       = job.openings > 0 ? Math.round((filled / job.openings) * 100) : 0;
  const spotsLeft = Math.max(0, (job.openings || 1) - (job.filled || 0));
  const isOpen    = job.status === "open" && spotsLeft > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="bg-white rounded-xl flex flex-col overflow-hidden group"
      style={{
        border: "1px solid #e7e5e4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        transition: "box-shadow .2s, transform .2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* colored left strip via top border */}
      <div style={{ height: 3, background: meta.color }} />

      <div className="p-5 flex-1 flex flex-col gap-3">

        {/* top row: category + status */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md"
            style={{ background: meta.bg, color: meta.color }}>
            <CatIcon size={11} strokeWidth={2.5} />
            {meta.label}
          </span>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md inline-flex items-center gap-1 ${
            job.status === "open"
              ? "bg-emerald-50 text-emerald-700"
              : job.status === "completed"
              ? "bg-stone-100 text-stone-500"
              : "bg-red-50 text-red-600"
          }`}>
            {job.status === "open"
              ? <><CheckCircle size={9} /> Open</>
              : job.status === "completed"
              ? <><Clock size={9} /> Done</>
              : <><X size={9} /> Closed</>}
          </span>
        </div>

        {/* title + ngo */}
        <div>
          <h3 className="font-bold text-stone-800 text-[0.97rem] leading-snug mb-0.5">{job.title}</h3>
          <p className="text-xs font-medium text-stone-400">{job.ngoId?.ngoName || "NGO Partner"}</p>
        </div>

        {job.description && (
          <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{job.description}</p>
        )}

        {/* skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((s, i) => (
              <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">{s}</span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[10px] text-stone-400 self-center">+{job.skills.length - 4}</span>
            )}
          </div>
        )}

        {/* meta info */}
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-stone-500 mt-auto">
          <div className="flex items-center gap-1.5">
            <MapPin size={11} className="text-stone-400 shrink-0" />
            <span className="truncate">{job.location || "—"}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold" style={{ color: meta.color }}>
            <IndianRupee size={11} className="shrink-0" />
            <span>{job.stipend > 0 ? `₹${job.stipend.toLocaleString("en-IN")}/mo` : "Voluntary"}</span>
          </div>
          {job.startDate && (
            <div className="flex items-center gap-1.5">
              <Calendar size={11} className="text-stone-400 shrink-0" />
              <span>{fmtDate(job.startDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Users size={11} className="text-stone-400 shrink-0" />
            <span>{spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left` : "All filled"}</span>
          </div>
        </div>

        {/* fill bar */}
        <div>
          <div className="flex justify-between text-[10px] text-stone-400 mb-1">
            <span>{filled} filled</span>
            <span>{job.openings} openings</span>
          </div>
          <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: meta.color, opacity: 0.7 }} />
          </div>
        </div>
      </div>

      {/* footer cta */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onApply(job)}
          disabled={!isOpen}
          className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={isOpen
            ? { background: meta.color, color: "#fff" }
            : { background: "#f5f5f4", color: "#a8a29e" }}
        >
          {isOpen
            ? <><ArrowUpRight size={14} /> Apply Now</>
            : job.status !== "open" ? "Position Closed" : "Fully Booked"}
        </button>
      </div>
    </motion.article>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function RojgarYojana() {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("all");
  const [applying, setApplying] = useState(null);
  const [total, setTotal]       = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ status: "all", limit: 50 });
    if (category !== "all") params.set("category", category);
    if (search.trim()) params.set("search", search.trim());
    fetch(`${API}/api/employment?${params}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setJobs(d.data.jobs || []); setTotal(d.data.pagination?.total || 0); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [category, search]);

  const displayed = jobs.filter(j =>
    !search.trim() ||
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  const openCount = jobs.filter(j => j.status === "open").length;

  return (
    <div className="min-h-screen" style={{ background: "#fafaf8", fontFamily: "inherit" }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 px-5" style={{ background: "#fff", borderBottom: "1px solid #e7e5e4" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            {/* Left: heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3">
                सेवा India — Rojgar Yojana
              </p>
              <h1 className="font-black text-stone-900 leading-tight mb-4"
                style={{ fontSize: "clamp(2rem,5vw,3.25rem)" }}>
                Employment &<br />
                <span style={{ color: "#d97706" }}>Skill Development</span>
              </h1>
              <p className="text-stone-500 text-base max-w-lg leading-relaxed">
                Training programmes, job placements, and self-employment opportunities
                run by verified NGOs across rural and urban India.
              </p>
            </motion.div>

            {/* Right: stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-8 lg:gap-10 lg:pb-2"
            >
              {[
                { n: total || "—",    label: "Listings"   },
                { n: openCount || "—", label: "Open Now"  },
                { n: "25+",           label: "States"     },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-stone-800">{s.n}</div>
                  <div className="text-xs text-stone-400 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-8 max-w-xl"
          >
            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or location…"
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none transition-colors"
                style={{ border: "1.5px solid #e7e5e4", background: "#fafaf8" }}
                onFocus={e => e.target.style.borderColor = "#d97706"}
                onBlur={e => e.target.style.borderColor = "#e7e5e4"}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Category filter bar ───────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e7e5e4", position: "sticky", top: 56, zIndex: 40 }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex items-center gap-0.5 overflow-x-auto py-1 scrollbar-none">
            {CATEGORIES.map(c => {
              const active = category === c.key;
              const meta   = CAT_META[c.key] || {};
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className="px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 relative"
                  style={{ color: active ? (c.key === "all" ? "#1c1917" : meta.color) : "#78716c" }}
                >
                  {c.label}
                  {active && (
                    <motion.div layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: c.key === "all" ? "#1c1917" : meta.color }} />
                  )}
                </button>
              );
            })}
            <span className="ml-auto text-xs text-stone-400 pl-6 flex-shrink-0 self-center">
              {displayed.length} result{displayed.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── Job grid ─────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-5 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse"
                style={{ height: 280, border: "1px solid #e7e5e4" }}>
                <div className="h-0.5 bg-stone-200" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-3.5 bg-stone-100 rounded-md w-20" />
                  <div className="h-5 bg-stone-100 rounded-md w-3/4" />
                  <div className="h-3 bg-stone-100 rounded-md w-1/2" />
                  <div className="h-3 bg-stone-100 rounded-md w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase size={28} className="text-stone-300" />
            </div>
            <p className="font-bold text-stone-700 mb-1">No opportunities found</p>
            <p className="text-stone-400 text-sm">Try a different category or clear the search</p>
            {search && (
              <button onClick={() => setSearch("")}
                className="mt-5 px-5 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: "#d97706" }}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((job, i) => (
              <JobCard key={job._id} job={job} onApply={setApplying} index={i} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer strip ─────────────────────────────────────────────────── */}
      <section className="border-t border-stone-200 py-14 px-5" style={{ background: "#fff" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">For NGOs</p>
            <h3 className="text-xl font-black text-stone-800">Post your employment opportunities</h3>
            <p className="text-sm text-stone-500 mt-1">
              Register on SevaIndia and connect with thousands of job-seekers across India.
            </p>
          </div>
          <a href="/add-ngo"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: "#d97706" }}>
            Register Your NGO <ArrowUpRight size={15} />
          </a>
        </div>
      </section>

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {applying && <ApplyModal job={applying} onClose={() => setApplying(null)} />}
      </AnimatePresence>

    </div>
  );
}
