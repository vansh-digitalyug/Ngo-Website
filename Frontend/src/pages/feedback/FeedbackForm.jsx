import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare, Star, CheckCircle, Loader2,
  ArrowLeft, User, Mail, Phone, ChevronRight,
  Monitor, Building2, HandHeart, CalendarDays,
  Users, Layers, HelpCircle, X, AlertTriangle,
} from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

/* ===========================
   VALIDATION UTILITIES
   =========================== */
const VALIDATION = {
  // Remove all numbers and special chars, keep letters, spaces, hyphens
  onlyTextNoNumbers: (value) =>
    value
      .replace(/[0-9]/g, "")
      .replace(/[^a-zA-Z\s'-]/g, "")
      .trim(),

  // Keep only numbers for phone field
  onlyNumbers: (value) =>
    value.replace(/[^0-9]/g, "").slice(0, 10),

  // Validate email format
  isValidEmail: (email) => {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  },

  // Validate name format
  isValidName: (name) => {
    const trimmed = name.trim();
    return (
      trimmed.length >= 2 &&
      trimmed.length <= 100 &&
      /^[a-zA-Z]/.test(trimmed) &&
      !/[0-9]/.test(trimmed) &&
      /[a-zA-Z\s'-]/.test(trimmed)
    );
  },

  // Validate phone format (exactly 10 digits)
  isValidPhone: (phone) => {
    if (!phone.trim()) return true; // optional field
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length === 10;
  },


};

/* ===========================
   VALIDATION FUNCTIONS
   =========================== */
const validateFeedbackForm = (form) => {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "Full name is required.";
  } else if (!VALIDATION.isValidName(form.name)) {
    errors.name = "⚠️ Name must be 2-100 characters, start with a letter, no numbers.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!VALIDATION.isValidEmail(form.email)) {
    errors.email = "⚠️ Please enter a valid email address.";
  }

  if (form.phone && !VALIDATION.isValidPhone(form.phone)) {
    errors.phone = "Phone number must be exactly 10 digits.";
  }

  if (!form.feedbackType) {
    errors.feedbackType = "Please select a feedback type.";
  }



  if (form.rating && (form.rating < 1 || form.rating > 5)) {
    errors.rating = "Rating must be between 1 and 5.";
  }

  return errors;
};

// ── Constants ────────────────────────────────────────────────────────────────
const FEEDBACK_TYPES = [
  { value: "platform",  label: "Platform",   icon: Monitor,      color: "#6366f1", bg: "#eef2ff", desc: "Website / App experience" },
  { value: "ngo",       label: "NGO",        icon: Building2,    color: "#0ea5e9", bg: "#f0f9ff", desc: "NGO you interacted with" },
  { value: "volunteer", label: "Volunteer",  icon: HandHeart,    color: "#10b981", bg: "#f0fdf4", desc: "Volunteer experience" },
  { value: "event",     label: "Event",      icon: CalendarDays, color: "#f59e0b", bg: "#fffbeb", desc: "Event you attended" },
  { value: "community", label: "Community",  icon: Users,        color: "#8b5cf6", bg: "#f5f3ff", desc: "Community feedback" },
  { value: "service",   label: "Service",    icon: Layers,       color: "#ef4444", bg: "#fef2f2", desc: "Services offered" },
  { value: "other",     label: "Other",      icon: HelpCircle,   color: "#6b7280", bg: "#f9fafb", desc: "General feedback" },
];

const TARGET_LABEL = {
  ngo:       "NGO Name",
  volunteer: "Volunteer Name",
  event:     "Event Name",
  community: "Community Name",
  service:   "Service Name",
};

// ── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(value === star ? null : star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none transition-transform hover:scale-125 duration-150"
          >
            <Star
              size={36}
              className="transition-colors duration-150"
              fill={(hovered || value) >= star ? "#f59e0b" : "none"}
              stroke={(hovered || value) >= star ? "#f59e0b" : "#d1d5db"}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <span
        className="text-sm font-semibold h-5 transition-all duration-200"
        style={{ color: value ? "#f59e0b" : "#9ca3af" }}
      >
        {hovered
          ? labels[hovered]
          : value
          ? labels[value]
          : "Click to rate (optional)"}
      </span>
    </div>
  );
}

// ── Feedback Type Selector ───────────────────────────────────────────────────
function TypeSelector({ value, onChange, error }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Feedback Type <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FEEDBACK_TYPES.map(({ value: v, label, icon: Icon, color, bg, desc }) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-xs font-semibold text-center ${
              value === v
                ? "shadow-md scale-[1.03]"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
            }`}
            style={
              value === v
                ? { borderColor: color, background: bg, color }
                : {}
            }
          >
            <Icon size={20} style={{ color: value === v ? color : "#9ca3af" }} />
            {label}
            <span
              className="text-[10px] font-normal leading-tight"
              style={{ color: value === v ? color : "#9ca3af", opacity: 0.85 }}
            >
              {desc}
            </span>
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

// ── Field Component ──────────────────────────────────────────────────────────
function Field({ label, required, error, children, hint, valid }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{" "}
        {required && <span className="text-red-500">*</span>}
        {!required && <span className="text-gray-400 text-xs font-normal">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1.5">
          <AlertTriangle size={12} /> {error}
        </p>
      )}
      {valid && !error && <p className="text-xs text-green-600 mt-1">✓ Valid</p>}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors ${
        error
          ? "border-red-400 bg-red-50 focus:ring-red-300"
          : "border-gray-200 bg-white focus:border-indigo-400"
      }`}
    />
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function FeedbackForm() {
  const navigate  = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const loggedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  })();

  const [form, setForm] = useState({
    name:         loggedUser?.name  || "",
    email:        loggedUser?.email || "",
    phone:        "",
    feedbackType: "",
    targetName:   "",
    subject:      "",
    message:      "",
    rating:       null,
  });

  const [errors,   setErrors]   = useState({});
  const [status,   setStatus]   = useState("idle"); // idle | submitting | success | error
  const [apiError, setApiError] = useState("");

  const set = (field, val) => {
    let processedVal = val;
    
    // Filter numbers from name and targetName fields
    if ((field === "name" || field === "targetName") && typeof val === "string") {
      processedVal = VALIDATION.onlyTextNoNumbers(val);
    }

    // Keep only numbers (max 10 digits) for phone field
    if (field === "phone" && typeof val === "string") {
      processedVal = VALIDATION.onlyNumbers(val);
    }

    setForm((p) => ({ ...p, [field]: processedVal }));
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = validateFeedbackForm(form);
    return errs;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { 
      setErrors(errs); 
      window.scrollTo({ top: 200, behavior: "smooth" }); 
      return; 
    }

    setStatus("submitting");
    setApiError("");

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const body = {
        name:         form.name.trim(),
        email:        form.email.trim().toLowerCase(),
        feedbackType: form.feedbackType,
        subject:      form.subject.trim(),
        message:      form.message.trim(),
      };
      if (form.phone.trim())     body.phone      = form.phone.trim();
      if (form.rating)           body.rating     = Number(form.rating);
      if (form.targetName.trim()) body.targetName = form.targetName.trim();

      const res  = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Submission failed. Please try again.");

      setStatus("success");
    } catch (err) {
      setApiError(err.message);
      setStatus("error");
    }
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-md w-full text-center border border-gray-100">
          {/* Animated check */}
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            Your feedback has been submitted successfully.
          </p>
          <p className="text-gray-400 text-xs mb-8">
            We review all feedback carefully and will get back to you if needed.
          </p>

          {/* Summary card */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const t = FEEDBACK_TYPES.find((t) => t.value === form.feedbackType);
                if (!t) return null;
                const Icon = t.icon;
                return (
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: t.bg, color: t.color }}
                  >
                    <Icon size={12} /> {t.label}
                  </span>
                );
              })()}
              {form.rating && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  <Star size={11} fill="#f59e0b" stroke="#f59e0b" /> {form.rating}/5
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">{form.subject}</p>
            <p className="text-xs text-gray-500 line-clamp-2">{form.message}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setForm({ name: loggedUser?.name || "", email: loggedUser?.email || "", phone: "", feedbackType: "", targetName: "", subject: "", message: "", rating: null });
                setStatus("idle");
              }}
              className="flex-1 py-2.5 border-2 border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all text-sm shadow-md"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-4">

      {/* Page Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shrink-0">
            <MessageSquare size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Share Your Feedback</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Help us improve by sharing your experience with SevaIndia.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} noValidate className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" />

        <div className="p-6 md:p-8 space-y-8">

          {/* API Error Banner */}
          {status === "error" && apiError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
              <X size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">Submission Failed</p>
                <p className="text-xs text-red-600 mt-0.5">{apiError}</p>
              </div>
              <button type="button" onClick={() => { setStatus("idle"); setApiError(""); }} className="ml-auto text-red-400 hover:text-red-600">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Validation Errors Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
              <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">Please fix the following errors:</p>
                <ul className="list-disc list-inside mt-2 text-xs text-red-600 space-y-1">
                  {Object.values(errors).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── Section 1: Your Info ── */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={13} /> Your Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required error={errors.name} valid={form.name && !errors.name && VALIDATION.isValidName(form.name)}>
                <Input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Your full name"
                  error={errors.name}
                  disabled={isLoggedIn && !!loggedUser?.name}
                  maxLength={100}
                />
              </Field>

              <Field label="Email Address" required error={errors.email} valid={form.email && !errors.email && VALIDATION.isValidEmail(form.email)}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  error={errors.email}
                  disabled={isLoggedIn && !!loggedUser?.email}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Phone Number" required={false} error={errors.phone} hint="We'll contact you only if needed. Must be exactly 10 digits." valid={form.phone && !errors.phone && VALIDATION.isValidPhone(form.phone)}>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="10-digit number"
                    error={errors.phone}
                    maxLength={10}
                    inputMode="numeric"
                    style={{ paddingLeft: "2.25rem", paddingRight: "3rem" }}
                  />
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold ${
                      form.phone.length === 10 ? "text-green-600" : form.phone.length > 0 ? "text-orange-400" : "text-gray-300"
                    }`}
                  >
                    {form.phone.length}/10
                  </span>
                </div>
              </Field>
            </div>

            {isLoggedIn && (
              <p className="text-xs text-indigo-500 mt-3 flex items-center gap-1.5 bg-indigo-50 px-3 py-2 rounded-xl w-fit">
                <CheckCircle size={12} /> Logged in as <strong>{loggedUser?.name}</strong> — details auto-filled.
              </p>
            )}
          </div>

          {/* ── Section 2: Feedback Type ── */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers size={13} /> Feedback Category
            </h3>
            <TypeSelector
              value={form.feedbackType}
              onChange={(v) => set("feedbackType", v)}
              error={errors.feedbackType}
            />

            {/* Target name — shown only for relevant types */}
            {TARGET_LABEL[form.feedbackType] && (
              <div className="mt-4">
                <Field
                  label={TARGET_LABEL[form.feedbackType]}
                  required={false}
                  hint={`Name of the ${form.feedbackType} you're giving feedback about`}
                  valid={form.targetName && !errors.targetName && VALIDATION.isValidName(form.targetName)}
                  error={errors.targetName}
                >
                  <Input
                    type="text"
                    value={form.targetName}
                    onChange={(e) => set("targetName", e.target.value)}
                    placeholder={`Enter ${TARGET_LABEL[form.feedbackType].toLowerCase()}...`}
                    maxLength={100}
                  />
                </Field>
              </div>
            )}
          </div>

          {/* ── Section 3: Rating ── */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star size={13} /> Overall Rating
            </h3>
            <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-100">
              <StarRating value={form.rating} onChange={(v) => set("rating", v)} />
            </div>
            {errors.rating && <p className="text-xs text-red-500 mt-1.5">{errors.rating}</p>}
          </div>

          {/* ── Section 4: Message ── */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare size={13} /> Your Feedback
            </h3>

            <div className="space-y-4">
              <Field label="Subject" required error={errors.subject}>
                <div className="relative">
                  <Input
                    type="text"
                    value={form.subject}
                    onChange={(e) => set("subject", e.target.value)}
                    placeholder="Brief title for your feedback..."
                    maxLength={200}
                    error={errors.subject}
                  />
                  <span
                    className="absolute right-3 bottom-3 text-[10px] text-gray-300"
                  >
                    {form.subject.length}/200
                  </span>
                </div>
              </Field>

              <Field label="Message" required error={errors.message} hint="Share your detailed feedback here." >
                <div className="relative">
                  <textarea
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    placeholder="Tell us in detail — what worked well, what could be improved, or any suggestions you have for us..."
                    rows={5}
                    maxLength={2000}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition-colors ${
                      errors.message
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 bg-white focus:border-indigo-400"
                    }`}
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-400">
                      {form.message.length}/2000
                    </span>
                  </div>
                </div>
              </Field>
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "submitting" || Object.keys(errors).length > 0}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-indigo-300 disabled:to-purple-300 text-white font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              title={Object.keys(errors).length > 0 ? `Please fix ${Object.keys(errors).length} error(s)` : ""}
            >
              {status === "submitting" ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting…</>
              ) : Object.keys(errors).length > 0 ? (
                <><AlertTriangle size={18} /> Fix {Object.keys(errors).length} Error(s) <ChevronRight size={16} /></>
              ) : (
                <><MessageSquare size={18} /> Submit Feedback <ChevronRight size={16} /></>
              )}
            </button>
            <p className="text-xs text-center text-gray-400 mt-3">
              Your feedback is private and will only be seen by the SevaIndia team.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
