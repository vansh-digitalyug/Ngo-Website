import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CalendarDays, PlusCircle, Pencil, Trash2, ImagePlus,
  Loader2, X, Clock, MapPin, Users, Tag, CheckCircle,
  XCircle, AlertCircle, Eye, EyeOff, Camera, Calendar
} from "lucide-react";
import {
  fetchMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImageToS3,
  addEventPhotos,
  fetchEventPhotos,
} from "../../utils/eventStore";

const CATEGORIES = ["General", "Education", "Health", "Environment", "Community", "Cultural", "Sports"];
const STATUSES = ["upcoming", "ongoing", "completed", "cancelled"];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const ampm = h >= 12 ? "pm" : "am";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function statusColor(s) {
  return {
    upcoming: "bg-blue-50 text-blue-700 border-blue-200",
    ongoing: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-slate-100 text-slate-600 border-slate-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
  }[s] || "bg-gray-100 text-gray-600";
}

// ─── Image Upload ─────────────────────────────────────────────────────────────
function ImageUpload({ preview, existingUrl, onFile, onClear, fileRef }) {
  const show = preview || existingUrl;
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cover Image</label>
      {show ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black">
          <img src={show} alt="cover" className="w-full h-40 object-cover opacity-90" />
          <button type="button" onClick={onClear} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
            <X size={13} />
          </button>
          <span className="absolute bottom-2 left-3 text-xs text-white bg-black/40 px-2 py-0.5 rounded">
            {preview ? "New image selected" : "Current image"}
          </span>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center gap-2 cursor-pointer bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><ImagePlus size={18} className="text-blue-500" /></div>
          <span className="text-sm font-semibold text-slate-600">Click to upload image</span>
          <span className="text-xs text-slate-400">JPEG, PNG, WebP — max 10 MB</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={onFile} />
    </div>
  );
}

// ─── Event Form Modal ─────────────────────────────────────────────────────────
const emptyForm = {
  title: "", description: "", date: "", startTime: "", endTime: "",
  location: "", category: "General", maxParticipants: "", status: "upcoming",
};

function EventFormModal({ mode, event, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(isEdit ? {
    title: event.title || "", description: event.description || "",
    date: event.date ? event.date.split("T")[0] : "",
    startTime: event.startTime || "", endTime: event.endTime || "",
    location: event.location || "", category: event.category || "General",
    maxParticipants: event.maxParticipants || "", status: event.status || "upcoming",
  } : emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingUrl, setExistingUrl] = useState(isEdit ? event.imageUrl : null);
  const [keepExisting, setKeepExisting] = useState(isEdit && !!event.imageUrl);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const fileRef = useRef(null);

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setMsg({ text: "Image must be under 10 MB.", ok: false }); return; }
    setImageFile(file); setImagePreview(URL.createObjectURL(file));
    setKeepExisting(false); setMsg({ text: "", ok: true });
  };

  const clearImage = () => {
    setImageFile(null); setImagePreview(null); setExistingUrl(null); setKeepExisting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.date || !form.location.trim()) {
      setMsg({ text: "Title, description, date, and location are required.", ok: false }); return;
    }
    setSubmitting(true); setMsg({ text: "", ok: true });
    try {
      let s3Key = undefined;
      if (imageFile) s3Key = await uploadEventImageToS3(imageFile);
      const payload = {
        title: form.title.trim(), description: form.description.trim(),
        date: form.date, startTime: form.startTime, endTime: form.endTime,
        location: form.location.trim(), category: form.category, status: form.status,
        ...(form.maxParticipants ? { maxParticipants: Number(form.maxParticipants) } : {}),
        ...(s3Key ? { S3Imagekey: s3Key } : {}),
      };
      const saved = isEdit
        ? await updateEvent(event._id, payload, true)
        : await createEvent(payload, true);
      onSaved(saved, isEdit); onClose();
    } catch (err) {
      setMsg({ text: err.message || "Failed to save event.", ok: false });
    } finally { setSubmitting(false); }
  };

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition-all";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-slate-100 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEdit ? "bg-blue-50" : "bg-green-50"}`}>
              {isEdit ? <Pencil size={14} className="text-blue-600" /> : <PlusCircle size={14} className="text-green-600" />}
            </div>
            <h2 className="text-sm font-bold text-slate-800">{isEdit ? "Edit Event" : "Create New Event"}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 grid gap-4">
          <div>
            <label className={labelCls}>Event Title *</label>
            <input name="title" value={form.title} onChange={onChange} placeholder="Event title" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description *</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={3} placeholder="Describe the event…" className={`${inputCls} resize-y`} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Date *</label>
              <input type="date" name="date" value={form.date} onChange={onChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Start Time</label>
              <input type="time" name="startTime" value={form.startTime} onChange={onChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Time</label>
              <input type="time" name="endTime" value={form.endTime} onChange={onChange} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Location *</label>
            <input name="location" value={form.location} onChange={onChange} placeholder="Venue address" className={inputCls} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Category</label>
              <select name="category" value={form.category} onChange={onChange} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select name="status" value={form.status} onChange={onChange} className={inputCls}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Max Participants</label>
              <input type="number" name="maxParticipants" value={form.maxParticipants} onChange={onChange} placeholder="Optional" min="1" className={inputCls} />
            </div>
          </div>
          <ImageUpload preview={imagePreview} existingUrl={keepExisting ? existingUrl : null} onFile={onImageChange} onClear={clearImage} fileRef={fileRef} />

          {msg.text && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${msg.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
              {msg.ok ? <CheckCircle size={14} /> : <XCircle size={14} />} {msg.text}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className={`px-5 py-2 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-colors ${submitting ? "bg-slate-400 cursor-not-allowed" : isEdit ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}>
              {submitting
                ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                : isEdit ? <><Pencil size={13} /> Save</> : <><PlusCircle size={13} /> Create</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Photos Modal ─────────────────────────────────────────────────────────
function AddPhotosModal({ event, onClose, onAdded }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const fileRef = useRef(null);

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  const onFileChange = (e) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.size <= 10 * 1024 * 1024);
    setFiles((prev) => [...prev, ...selected]);
    setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
    setCaptions((prev) => [...prev, ...selected.map(() => "")]);
  };

  const removeFile = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
    setCaptions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onUpload = async () => {
    if (files.length === 0) { setMsg({ text: "Please select at least one photo.", ok: false }); return; }
    setUploading(true); setProgress(0); setMsg({ text: "", ok: true });
    try {
      const uploaded = [];
      for (let i = 0; i < files.length; i++) {
        const key = await uploadEventImageToS3(files[i]);
        uploaded.push({ S3Imagekey: key, caption: captions[i] || "" });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      await addEventPhotos(event._id, uploaded, true);
      onAdded();
      onClose();
    } catch (err) {
      setMsg({ text: err.message || "Upload failed.", ok: false });
    } finally { setUploading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-slate-100 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><Camera size={14} className="text-purple-600" /></div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Add Event Photos</h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{event.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center gap-2 cursor-pointer bg-slate-50 hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <ImagePlus size={22} className="text-purple-400" />
            <span className="text-sm font-semibold text-slate-600">Click to select photos</span>
            <span className="text-xs text-slate-400">Multiple files allowed, max 10 MB each</span>
          </button>
          <input ref={fileRef} type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={onFileChange} />

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  <button onClick={() => removeFile(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors text-xs">
                    ×
                  </button>
                  <input
                    value={captions[i]}
                    onChange={(e) => setCaptions((prev) => prev.map((c, idx) => idx === i ? e.target.value : c))}
                    placeholder="Caption…"
                    className="w-full mt-1 px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-purple-400"
                  />
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="space-y-1">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-center text-slate-400">Uploading… {progress}%</p>
            </div>
          )}

          {msg.text && (
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border ${msg.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
              {msg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {msg.text}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={onUpload} disabled={uploading || files.length === 0}
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {uploading ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> : <><Camera size={13} /> Upload {files.length > 0 ? `${files.length} Photo${files.length > 1 ? "s" : ""}` : "Photos"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Event Card for NGO Dashboard ─────────────────────────────────────────────
function NgoEventCard({ event, onEdit, onDelete, onAddPhotos }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="relative h-40 bg-slate-100 flex-shrink-0">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <CalendarDays size={36} strokeWidth={1.2} />
          </div>
        )}
        <span className={`absolute top-2 left-2 text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${statusColor(event.status)}`}>
          {event.status}
        </span>
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${event.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
          {event.isPublished ? "Published" : "Draft"}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{event.title}</h3>
        <div className="space-y-1 text-xs text-slate-500 flex-1">
          <div className="flex items-center gap-1.5"><Calendar size={11} /> {formatDate(event.date)}</div>
          {event.startTime && <div className="flex items-center gap-1.5"><Clock size={11} /> {formatTime(event.startTime)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ""}</div>}
          <div className="flex items-start gap-1.5"><MapPin size={11} className="mt-0.5 flex-shrink-0" /><span className="line-clamp-1">{event.location}</span></div>
          <div className="flex items-center gap-1.5"><Tag size={11} /> {event.category}</div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-slate-50 mt-auto">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors"
          >
            <Pencil size={11} /> Edit
          </button>
          {event.status === "completed" && (
            <button
              onClick={() => onAddPhotos(event)}
              className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 flex items-center justify-center gap-1 transition-colors"
            >
              <Camera size={11} /> Photos
            </button>
          )}
          <button
            onClick={() => onDelete(event._id)}
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 flex items-center justify-center gap-1 transition-colors"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main NgoEvents Page ──────────────────────────────────────────────────────
export default function NgoEvents() {
  const { ngoData } = useOutletContext() || {};
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal, setModal] = useState(null);
  const [photosModal, setPhotosModal] = useState(null);
  const [globalMsg, setGlobalMsg] = useState({ text: "", ok: true });

  useEffect(() => {
    fetchMyEvents(true)
      .then(setEvents)
      .catch((e) => setGlobalMsg({ text: e.message || "Failed to load events.", ok: false }))
      .finally(() => setLoading(false));
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id, true);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setGlobalMsg({ text: "Event deleted.", ok: true });
    } catch (err) {
      setGlobalMsg({ text: err.message || "Failed to delete.", ok: false });
    }
  };

  const onSaved = (saved, isEdit) => {
    if (isEdit) {
      setEvents((prev) => prev.map((e) => e._id === saved._id ? { ...e, ...saved } : e));
      setGlobalMsg({ text: "Event updated!", ok: true });
    } else {
      setEvents((prev) => [saved, ...prev]);
      setGlobalMsg({ text: "Event created! Pending admin approval for publishing.", ok: true });
    }
  };

  const filtered = filterStatus === "All" ? events : events.filter((e) => e.status === filterStatus);

  const total = events.length;
  const upcoming = events.filter((e) => e.status === "upcoming").length;
  const published = events.filter((e) => e.isPublished).length;
  const completed = events.filter((e) => e.status === "completed").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <CalendarDays size={22} className="text-blue-500" /> My Events
          </h1>
          {ngoData && <p className="text-sm text-slate-400 mt-0.5">{ngoData.ngoName}</p>}
        </div>
        <button
          onClick={() => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "create" }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-sm transition-colors"
        >
          <PlusCircle size={16} /> New Event
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
        <AlertCircle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700 font-medium">
          Events you create need admin approval before they are published publicly. You can add photos to completed events.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: total, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "Upcoming", value: upcoming, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Published", value: published, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
          { label: "Completed", value: completed, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
            <p className="text-xs font-semibold text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Global message */}
      {globalMsg.text && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium ${globalMsg.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          <span className="flex items-center gap-2">
            {globalMsg.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {globalMsg.text}
          </span>
          <button onClick={() => setGlobalMsg({ text: "", ok: true })} className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${filterStatus === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm">Loading events…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
          <CalendarDays size={44} className="mx-auto text-slate-200 mb-3" strokeWidth={1} />
          <p className="text-slate-400 text-sm mb-4">No events found.</p>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <PlusCircle size={14} /> Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((event) => (
            <NgoEventCard
              key={event._id}
              event={event}
              onEdit={(e) => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "edit", event: e }); }}
              onDelete={onDelete}
              onAddPhotos={(e) => setPhotosModal(e)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {modal && (
        <EventFormModal
          mode={modal.mode}
          event={modal.event}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}

      {/* Add Photos Modal */}
      {photosModal && (
        <AddPhotosModal
          event={photosModal}
          onClose={() => setPhotosModal(null)}
          onAdded={() => {
            setGlobalMsg({ text: "Photos uploaded successfully!", ok: true });
            setPhotosModal(null);
          }}
        />
      )}
    </div>
  );
}
