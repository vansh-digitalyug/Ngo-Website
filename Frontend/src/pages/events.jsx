import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, MapPin, Users, Facebook, Twitter, Linkedin, CalendarDays, AlertCircle, Loader2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, selectEvents, selectEventsStatus, selectEventsError } from "../store/slices/eventsSlice";

/* ─── EVENT REGISTRATION VALIDATION UTILITY ──────────────────────────────────── */
const EVENT_VALIDATION = {
  onlyText: (str) => str.replace(/[^a-zA-Z\s]/g, ""),
  onlyDigits: (str) => str.replace(/[^0-9]/g, ""),
  maxLength: (str, len) => str.slice(0, len),
  
  validateName: (name) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return "Name is required";
    if (trimmed.length < 2) return "Name must be at least 2 characters";
    if (trimmed.length > 50) return "Name limited to 50 characters";
    return "";
  },
  
  validatePhone: (phone) => {
    if (phone.length === 0) return "Phone is required";
    if (phone.length !== 10) return "Phone must be exactly 10 digits";
    return "";
  },
  
  validateEmail: (email) => {
    if (email.length === 0) return "Email is required";
    if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return "Invalid email address";
    return "";
  },
  
  validateAge: (age) => {
    if (age.length === 0) return "Age is required";
    const ageNum = Number(age);
    if (ageNum < 5 || ageNum > 120) return "Age must be between 5 and 120";
    return "";
  },
  
  validateCity: (city) => {
    const trimmed = city.trim();
    if (trimmed.length === 0) return "City is required";
    if (trimmed.length < 2) return "City must be at least 2 characters";
    if (trimmed.length > 50) return "City limited to 50 characters";
    return "";
  },
};

// ─── Countdown Hook ───────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const calc = useCallback(() => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false,
    };
  }, [targetDate]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return time;
}

/* ─── REGISTRATION MODAL ──────────────────────────────────────────────────────── */
function EventRegistrationModal({ event, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    city: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === "checkbox" ? checked : value;

    // Text-only fields - PREVENT numbers completely
    if (["name", "city"].includes(name)) {
      nextValue = EVENT_VALIDATION.onlyText(String(nextValue));
      if (name === "name") nextValue = EVENT_VALIDATION.maxLength(nextValue, 50);
      if (name === "city") nextValue = EVENT_VALIDATION.maxLength(nextValue, 50);
    }

    // Number-only fields - PREVENT letters completely
    if (["phone", "age"].includes(name)) {
      nextValue = EVENT_VALIDATION.onlyDigits(String(nextValue));
      if (name === "phone") nextValue = nextValue.slice(0, 10);
      if (name === "age") nextValue = nextValue.slice(0, 3);
    }

    // Update the DOM immediately
    if (e.target) e.target.value = nextValue;
    
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const nameErr = EVENT_VALIDATION.validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;
    const emailErr = EVENT_VALIDATION.validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;
    const phoneErr = EVENT_VALIDATION.validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;
    const ageErr = EVENT_VALIDATION.validateAge(formData.age);
    if (ageErr) newErrors.age = ageErr;
    const cityErr = EVENT_VALIDATION.validateCity(formData.city);
    if (cityErr) newErrors.city = cityErr;
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setFormData({
          name: "",
          email: "",
          phone: "",
          age: "",
          city: "",
          agreeToTerms: false,
        });
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      setErrors({ submit: "Failed to register. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Register for Event</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Registration Successful!</h3>
            <p className="text-sm text-slate-600">We'll send you event details at {formData.email}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {event?.title && (
              <p className="text-sm text-slate-600 mb-4">
                <span className="font-semibold text-slate-900">{event.title}</span>
              </p>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onInput={handleInputChange}
                  placeholder="e.g. Rajesh Kumar"
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm outline-none transition-all ${
                    errors.name
                      ? "border-red-300 bg-red-50 focus:border-red-400"
                      : formData.name.trim().length >= 2 && !errors.name
                      ? "border-green-300 bg-green-50 focus:border-green-400"
                      : "border-slate-200 bg-white hover:border-slate-300 focus:border-green-600"
                  }`}
                />
                {formData.name.trim().length >= 2 && !errors.name && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">
                    ✓
                  </span>
                )}
              </div>
              {errors.name && (
                <span className="text-xs text-red-600 mt-1 block font-medium">{errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm outline-none transition-all ${
                    errors.email
                      ? "border-red-300 bg-red-50 focus:border-red-400"
                      : /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email) && !errors.email
                      ? "border-green-300 bg-green-50 focus:border-green-400"
                      : "border-slate-200 bg-white hover:border-slate-300 focus:border-green-600"
                  }`}
                />
                {/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email) && !errors.email && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">
                    ✓
                  </span>
                )}
              </div>
              {errors.email && (
                <span className="text-xs text-red-600 mt-1 block font-medium">{errors.email}</span>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onInput={handleInputChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm outline-none transition-all ${
                    errors.phone
                      ? "border-red-300 bg-red-50 focus:border-red-400"
                      : formData.phone.length === 10 && !errors.phone
                      ? "border-green-300 bg-green-50 focus:border-green-400"
                      : "border-slate-200 bg-white hover:border-slate-300 focus:border-green-600"
                  }`}
                />
                {formData.phone.length === 10 && !errors.phone && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">
                    ✓
                  </span>
                )}
              </div>
              {errors.phone && (
                <span className="text-xs text-red-600 mt-1 block font-medium">{errors.phone}</span>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Age *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  onInput={handleInputChange}
                  placeholder="e.g. 25"
                  maxLength={3}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm outline-none transition-all ${
                    errors.age
                      ? "border-red-300 bg-red-50 focus:border-red-400"
                      : formData.age && !errors.age
                      ? "border-green-300 bg-green-50 focus:border-green-400"
                      : "border-slate-200 bg-white hover:border-slate-300 focus:border-green-600"
                  }`}
                />
                {formData.age && !errors.age && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">
                    ✓
                  </span>
                )}
              </div>
              {errors.age && (
                <span className="text-xs text-red-600 mt-1 block font-medium">{errors.age}</span>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                City *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onInput={handleInputChange}
                  placeholder="e.g. New Delhi"
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm outline-none transition-all ${
                    errors.city
                      ? "border-red-300 bg-red-50 focus:border-red-400"
                      : formData.city.trim().length >= 2 && !errors.city
                      ? "border-green-300 bg-green-50 focus:border-green-400"
                      : "border-slate-200 bg-white hover:border-slate-300 focus:border-green-600"
                  }`}
                />
                {formData.city.trim().length >= 2 && !errors.city && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">
                    ✓
                  </span>
                )}
              </div>
              {errors.city && (
                <span className="text-xs text-red-600 mt-1 block font-medium">{errors.city}</span>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mt-1 accent-green-600 w-4 h-4 rounded cursor-pointer"
              />
              <label className="text-xs text-slate-600 cursor-pointer">
                I agree to receive event updates and acknowledge the{" "}
                <span className="font-semibold text-slate-900">terms and conditions</span>
                {errors.agreeToTerms && (
                  <span className="block text-red-600 font-medium mt-0.5">{errors.agreeToTerms}</span>
                )}
              </label>
            </div>

            {errors.submit && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                isSubmitting || Object.keys(errors).length > 0
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Registering...
                </span>
              ) : (
                "Register Now"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Digit Box ────────────────────────────────────────────────────────────────
function DigitBox({ value }) {
  const str = String(value).padStart(2, "0");
  return (
    <div className="flex gap-1">
      {str.split("").map((d, i) => (
        <div
          key={i}
          className="w-10 h-11 sm:w-12 sm:h-13 bg-white border-2 border-[#1a2744] rounded-md flex items-center justify-center text-[#1a2744] font-extrabold text-xl sm:text-2xl shadow"
        >
          {d}
        </div>
      ))}
    </div>
  );
}

function CountdownTimer({ date }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(date);
  if (expired) return (
    <p className="text-green-600 font-semibold text-sm">This event is happening now!</p>
  );
  return (
    <div className="flex items-end gap-5 flex-wrap">
      {[["Days", days], ["Hours", hours], ["Minutes", minutes], ["Seconds", seconds]].map(([label, val]) => (
        <div key={label} className="flex flex-col items-center gap-1.5">
          <DigitBox value={val} />
          <span className="text-[11px] font-bold tracking-[0.15em] text-slate-500 uppercase">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
}

// ─── Featured Event ───────────────────────────────────────────────────────────
function FeaturedEvent({ event, onRegister }) {
  const timeStr = [event.startTime && fmtTime(event.startTime), event.endTime && fmtTime(event.endTime)]
    .filter(Boolean).join(" – ");

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100">
      <div className="flex flex-col lg:flex-row">
        {/* Image */}
        <div className="lg:w-[48%] h-72 lg:h-auto min-h-[340px] bg-slate-100 flex-shrink-0 overflow-hidden">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <CalendarDays size={56} className="text-slate-300" strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="lg:w-[52%] p-7 sm:p-10 flex flex-col gap-6 justify-center">
          {event.category && event.category !== "General" && (
            <span className="self-start text-xs font-bold uppercase tracking-widest text-orange-600 border-b-2 border-orange-400 pb-0.5">
              {event.category}
            </span>
          )}

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a2744] leading-tight">
            {event.title}
          </h2>

          {/* Countdown */}
          {event.status === "upcoming" && (
            <div>
              <CountdownTimer date={event.date} />
            </div>
          )}
          {event.status === "ongoing" && (
            <p className="text-green-600 font-semibold text-sm">Event is ongoing right now</p>
          )}

          {/* Details */}
          <div className="space-y-2.5 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Calendar size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <span>{fmtDate(event.date)}</span>
            </div>
            {timeStr && (
              <div className="flex items-start gap-3">
                <Clock size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{timeStr}</span>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
            {event.maxParticipants && (
              <div className="flex items-start gap-3">
                <Users size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{event.maxParticipants.toLocaleString()} participants</span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
              {event.description}
            </p>
          )}

          {/* Published by */}
          {event.ngoId?.ngoName && (
            <p className="text-xs text-slate-400">
              Published by <span className="font-semibold text-[#1a2744]">{event.ngoId.ngoName}</span>
            </p>
          )}

          {/* Share & Register */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Share</span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1877f2]/10 flex items-center justify-center text-[#1877f2] hover:bg-[#1877f2]/20 transition-colors">
                <Facebook size={14} />
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                <Twitter size={14} />
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#0077b5]/10 flex items-center justify-center text-[#0077b5] hover:bg-[#0077b5]/20 transition-colors">
                <Linkedin size={14} />
              </a>
            </div>
            <button
              onClick={() => onRegister?.(event)}
              className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-md shadow-green-200"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onRegister }) {
  const timeStr = [event.startTime && fmtTime(event.startTime), event.endTime && fmtTime(event.endTime)]
    .filter(Boolean).join(" – ");

  return (
    <article className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {/* Image */}
      <div className="h-48 bg-slate-100 overflow-hidden flex-shrink-0">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays size={40} className="text-slate-200" strokeWidth={1} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {event.category && event.category !== "General" && (
          <span className="self-start text-[10px] font-bold uppercase tracking-widest text-orange-600 border-b border-orange-300 pb-0.5 mb-2">
            {event.category}
          </span>
        )}

        <h3 className="font-bold text-[#1a2744] text-base leading-snug mb-3">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-slate-500 text-sm leading-relaxed flex-1">
            {event.description}
          </p>
        )}

        <div className="mt-auto space-y-2.5">
          {event.ngoId?.ngoName && (
            <p className="text-xs text-slate-400">
              Published by <span className="font-semibold text-[#1a2744]">{event.ngoId.ngoName}</span>
            </p>
          )}
          <div className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar size={12} className="flex-shrink-0" />
              <span className="text-slate-500">{fmtDate(event.date)}</span>
            </div>
            {timeStr && (
              <div className="flex items-center gap-2">
                <Clock size={12} className="flex-shrink-0" />
                <span className="text-slate-500">{timeStr}</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin size={12} className="flex-shrink-0 mt-0.5" />
              <span className="text-slate-500">{event.location}</span>
            </div>
          </div>
          <button
            onClick={() => onRegister?.(event)}
            className="w-full mt-4 px-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            Register Now
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Education", "Health", "Environment", "Community", "Cultural", "Sports", "General"];

export default function EventsPage() {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const status = useSelector(selectEventsStatus);
  const error = useSelector(selectEventsError);
  const loading = status === "loading" || status === "idle";
  const [filterCat, setFilterCat] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleRegisterClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  useEffect(() => {
    if (status === "idle") dispatch(fetchEvents());
  }, [status, dispatch]);

  const filtered = filterCat === "All" ? events : events.filter((e) => e.category === filterCat);
  const featured = filtered[0] || null;
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-[#f5f6fa]">

      {/* Hero */}
      <div className="bg-[#1a2744] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Our Events</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Upcoming Events & Programmes
          </h1>
          <p className="text-slate-300 text-base max-w-lg mx-auto leading-relaxed">
            Be a part of our mission. Join our events and help us serve those who need it most.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
                ${filterCat === cat
                  ? "bg-[#1a2744] text-white border-[#1a2744]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#1a2744] hover:text-[#1a2744]"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-32 text-slate-400">
            <Loader2 size={24} className="animate-spin" />
            <span>Loading events…</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <CalendarDays size={48} className="mx-auto text-slate-200 mb-4" strokeWidth={1} />
            <p className="text-slate-400">No events found in this category.</p>
            <button
              onClick={() => setFilterCat("All")}
              className="mt-4 text-sm text-[#1a2744] underline underline-offset-2"
            >
              View all events
            </button>
          </div>
        ) : (
          <div className="space-y-12">

            {/* Featured */}
            {featured && <FeaturedEvent event={featured} onRegister={handleRegisterClick} />}

            {/* More events */}
            {rest.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-lg font-bold text-[#1a2744]">More Events</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((event) => (
                    <EventCard key={event._id} event={event} onRegister={handleRegisterClick} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Registration Modal */}
      <EventRegistrationModal 
        event={selectedEvent} 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
}
