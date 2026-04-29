import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";

const API = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

/* ─── Respondent Validation ───────────────────────────────── */
const RESPONDENT_VALIDATION = {
  onlyTextSpaces: (str) => str.replace(/[^a-zA-Z\s]/g, ""),
  onlyDigits: (str) => str.replace(/[^0-9]/g, ""),
  validateName: (name) => {
    const trimmed = name.trim();
    if (trimmed.length > 0 && trimmed.length < 2) return "Must be at least 2 characters";
    if (trimmed.length > 50) return "Limited to 50 characters";
    return "";
  },
  validatePhone: (phone) => {
    const digits = phone.replace(/\D/g, "");
    if (phone.length > 0 && digits.length < 10) return "Must be exactly 10 digits";
    if (digits.length > 10) return "Must be exactly 10 digits";
    return "";
  },
};

/* ─── Cover Image Loader ───────────────────────────────────── */
function CoverImageDisplay({ imgKey }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!imgKey) return;
    fetch(`${API}/api/s3/get-url?key=${encodeURIComponent(imgKey)}`)
      .then(r => r.json())
      .then(d => { if (d.data?.Url) setUrl(d.data.Url); })
      .catch(() => {});
  }, [imgKey]);

  if (!url) return null;
  return (
    <img 
      src={url} 
      alt="Survey cover" 
      className="w-full h-[260px] object-cover rounded-sm mb-8 grayscale-[20%] contrast-110" 
    />
  );
}

/* ─── Star Rating ───────────────────────────────────────────── */
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const active = hover || value || 0;
  return (
    <div className="flex gap-1.5 text-[22px] cursor-pointer text-slate-300">
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          className={`transition-colors duration-200 ${s <= active ? "text-blue-600" : ""}`}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          role="button"
        >
          ★
        </span>
      ))}
    </div>
  );
}

/* ─── Scale Input ───────────────────────────────────────────── */
function ScaleInput({ min = 1, max = 5, value, onChange }) {
  const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-3 md:py-2 md:px-4 border border-slate-200 w-full md:inline-flex md:w-auto box-border rounded-sm">
      <span className="text-[9px] uppercase text-slate-500 font-semibold tracking-wider">
        Inaccessible
      </span>
      <div className="flex w-full md:w-auto justify-between gap-1.5">
        {nums.map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-9 h-9 border flex items-center justify-center font-semibold cursor-pointer transition-colors text-sm rounded-sm 
              ${value === n 
                ? "bg-gray-900 text-white border-gray-900" 
                : "border-slate-200 bg-white text-slate-800 hover:border-gray-900"
              }`}
          >
            {n}
          </button>
        ))}
      </div>
      <span className="text-[9px] uppercase text-slate-500 font-semibold tracking-wider">
        Excellent
      </span>
    </div>
  );
}

/* ─── Question Row ─────────────────────────────────────────── */
function QuestionRow({ q, index, answer, onChange }) {
  const numStr = String(index + 1).padStart(2, '0') + ".";

  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-5 mb-10 pb-10 border-b border-slate-200">
      <div className="font-['Playfair_Display',_serif] text-[22px] md:text-[26px] text-slate-400 font-medium md:w-10 shrink-0">
        {numStr}
      </div>
      <div className="flex-1">
        <h3 className="font-['Playfair_Display',_serif] text-xl text-slate-900 mb-5 font-medium leading-[1.4]">
          {q.question}
          {q.required && <span className="text-red-500 text-sm ml-1.5">*</span>}
        </h3>

        {q.type === "text" && (
          <textarea
            className="w-full border border-slate-200 p-4 font-['Inter',_sans-serif] text-sm min-h-[120px] resize-y outline-none bg-white rounded-sm text-slate-800 focus:border-gray-900 transition-colors"
            value={answer || ""}
            onChange={e => onChange(e.target.value)}
            placeholder="Type your response here..."
            maxLength={500}
          />
        )}

        {q.type === "multiple_choice" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(q.options || []).map(opt => (
              <div
                key={opt}
                onClick={() => onChange(opt)}
                className={`border p-3.5 flex items-center gap-3.5 cursor-pointer transition-all rounded-sm
                  ${answer === opt 
                    ? "border-gray-900 bg-slate-100" 
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 
                  ${answer === opt ? "border-gray-900" : "border-slate-400"}`}
                >
                  {answer === opt && <div className="w-1.5 h-1.5 bg-gray-900 rounded-full" />}
                </div>
                <span className="text-[13px] text-slate-700 font-medium">{opt}</span>
              </div>
            ))}
          </div>
        )}

        {q.type === "yes_no" && (
          <div className="flex gap-3">
            {["yes", "no"].map((opt) => (
              <div
                key={opt}
                onClick={() => onChange(opt)}
                className={`w-[100px] text-center py-3.5 justify-center font-semibold text-[13px] tracking-wider uppercase border cursor-pointer transition-all rounded-sm
                  ${answer === opt 
                    ? "border-gray-900 bg-slate-100 text-gray-900" 
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                {opt}
              </div>
            ))}
          </div>
        )}

        {q.type === "rating" && (
          <StarRating value={answer || 0} onChange={onChange} />
        )}

        {q.type === "scale" && (
          <ScaleInput
            min={q.scaleMin || 1}
            max={q.scaleMax || 5}
            value={answer}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function SurveyRespond() {
  const { token } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [answers, setAnswers] = useState({});
  const [respondentName, setRespondentName] = useState("");
  const [respondentPhone, setRespondentPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const topRef = useRef(null);

  /* Inject required fonts (Inter & Playfair Display) */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');";
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  /* Fetch survey */
  useEffect(() => {
    fetch(`${API}/api/surveys/respond/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setSurvey(d.data.survey);
        else setFetchError(d.message || "Survey not found.");
      })
      .catch(() => setFetchError("Could not load survey. Please check your connection."))
      .finally(() => setLoading(false));
  }, [token]);

  const setAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setSubmitError("");
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    const cleaned = RESPONDENT_VALIDATION.onlyTextSpaces(value);
    const limited = cleaned.slice(0, 50);
    setRespondentName(limited);
    setNameError(RESPONDENT_VALIDATION.validateName(limited));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const digits = RESPONDENT_VALIDATION.onlyDigits(value);
    const limited = digits.slice(0, 10);
    setRespondentPhone(limited);
    setPhoneError(RESPONDENT_VALIDATION.validatePhone(limited));
  };

  /* Progress calculation */
  const total = survey?.questions?.length || 0;
  const answered = survey?.questions?.filter(q => {
    const a = answers[q._id];
    return a !== undefined && a !== "" && a !== null;
  }).length || 0;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  /* Submit */
  const handleSubmit = () => {
    if (!survey) return;

    if (respondentName.trim() && RESPONDENT_VALIDATION.validateName(respondentName)) {
      setSubmitError("Please fix name format.");
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (respondentPhone.trim() && RESPONDENT_VALIDATION.validatePhone(respondentPhone)) {
      setSubmitError("Please fix phone format.");
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const missing = survey.questions.filter(
      q => q.required && (answers[q._id] === undefined || answers[q._id] === "" || answers[q._id] === null)
    );
    if (missing.length > 0) {
      setSubmitError(`Please answer all required questions (${missing.length} remaining).`);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      respondentName: respondentName.trim() || "Anonymous",
      respondentPhone: respondentPhone.trim(),
      answers: survey.questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id] ?? "",
      })),
    };

    const localToken = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (localToken) headers["Authorization"] = `Bearer ${localToken}`;

    fetch(`${API}/api/surveys/respond/${token}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setSubmitted(true);
        else setSubmitError(d.message || "Submission failed. Please try again.");
      })
      .catch(() => setSubmitError("Network error. Please try again."))
      .finally(() => setSubmitting(false));
  };

  /* ── COMMON WRAPPER CLASSES ── */
  const layoutWrapperClasses = "font-['Inter',_sans-serif] text-gray-900 bg-slate-50 min-h-screen pb-[100px]";
  const centerContentClasses = "flex items-center justify-center min-h-screen p-5 bg-slate-50";
  const messageCardClasses = "text-center bg-white p-10 md:p-[60px_40px] border border-slate-200 max-w-[460px] w-full rounded-sm shadow-sm";

  /* ── LOADING ── */
  if (loading) return (
    <div className={centerContentClasses}>
      <div className="w-10 h-10 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </div>
  );

  /* ── ERROR ── */
  if (fetchError) return (
    <div className={centerContentClasses}>
      <div className={messageCardClasses}>
        <h2 className="font-['Playfair_Display',_serif] text-[28px] font-semibold mb-3 text-slate-900">
          Survey Unavailable
        </h2>
        <p className="text-[15px] text-slate-600 leading-relaxed mb-8">
          {fetchError}
        </p>
        <Link to="/" className="inline-block bg-black text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-neutral-800 transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );

  /* ── SUBMITTED ── */
  if (submitted) return (
    <div className={centerContentClasses}>
      <div className={`${messageCardClasses} max-w-[500px]`}>
        <h2 className="font-['Playfair_Display',_serif] text-[32px] font-semibold mb-3 text-slate-900">
          Thank You
        </h2>
        <p className="text-[15px] text-slate-600 leading-relaxed mb-8">
          Your response has been recorded successfully. Your data contributes to the broader research goals of <strong className="text-slate-900 font-semibold">{survey?.ngoId?.ngoName || "our organization"}</strong>.
        </p>
        <Link to="/" className="inline-block bg-black text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-neutral-800 transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );

  /* ── MAIN SURVEY PAGE ── */
  return (
    <div className={layoutWrapperClasses} ref={topRef}>
      
      <div className="max-w-[760px] mx-auto py-12 px-5 md:px-8 bg-slate-50">
        
        {/* Header Section */}
        <div className="mb-12">
          <span className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.1em] mb-2 block">
            {survey?.ngoId?.ngoName || "COMMUNITY ASSESSMENT 2024"}
          </span>
          <h1 className="font-['Playfair_Display',_serif] text-[32px] md:text-[42px] font-semibold leading-[1.1] mb-4 tracking-[-0.02em] text-slate-900">
            {survey?.title || "Public Health & Wellness Impact Survey"}
          </h1>
          <p className="text-[15px] text-slate-600 leading-relaxed max-w-[600px] mb-10">
            {survey?.description || "This inquiry assists our research team in quantifying systemic trends. Your individual data remains anonymized, contributing to the broader report."}
          </p>
          {survey?.coverImageKey && <CoverImageDisplay imgKey={survey.coverImageKey} />}
        </div>

        {/* Respondent Info */}
        <div className="mb-10 pb-10 border-b border-slate-200">
          <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-500 mb-4">
            Respondent Information (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                className={`w-full border p-3.5 font-['Inter',_sans-serif] text-sm outline-none rounded-sm transition-colors
                  ${nameError ? 'border-red-500 bg-red-50' : respondentName ? 'border-emerald-500 bg-white' : 'border-slate-200 bg-white focus:border-gray-900'}`}
                value={respondentName}
                onChange={handleNameChange}
                placeholder="Full Name"
                maxLength={50}
              />
              {nameError && <p className="text-red-500 text-[11px] font-medium mt-1.5">{nameError}</p>}
            </div>
            <div>
              <input
                className={`w-full border p-3.5 font-['Inter',_sans-serif] text-sm outline-none rounded-sm transition-colors
                  ${phoneError ? 'border-red-500 bg-red-50' : respondentPhone.length === 10 ? 'border-emerald-500 bg-white' : 'border-slate-200 bg-white focus:border-gray-900'}`}
                value={respondentPhone}
                onChange={handlePhoneChange}
                placeholder="Phone Number (10 digits)"
                type="tel"
                maxLength={10}
              />
              {phoneError && <p className="text-red-500 text-[11px] font-medium mt-1.5">{phoneError}</p>}
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-200 mb-8">
          <span>Survey Questions</span>
          <span>{progress}% Complete</span>
        </div>

        {/* Questions */}
        <div>
          {(survey?.questions || []).map((q, i) => (
            <QuestionRow
              key={q._id}
              q={q}
              index={i}
              answer={answers[q._id]}
              onChange={val => setAnswer(q._id, val)}
            />
          ))}
        </div>

        {/* Error State */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium mb-5 rounded-sm">
            {submitError}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row justify-end items-center mt-6 gap-4">
          <button
            onClick={handleSubmit}
            disabled={submitting || nameError || phoneError}
            className="bg-black text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors w-full md:w-auto"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Survey Response"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}