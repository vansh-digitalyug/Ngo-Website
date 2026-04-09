import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CalendarDays, PlusCircle, Pencil, Trash2, ImagePlus,
  Loader2, X, Clock, MapPin, Users, Tag, CheckCircle,
  XCircle, AlertCircle, Eye, EyeOff, Camera, Calendar
} from "lucide-react";
import AIDescribeButton from "../../components/ui/AIDescribeButton.jsx";
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
    upcoming: "bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]",
    ongoing: "bg-[#f0f4ea] text-[#5a6b46] border border-[#d6e3c9]",
    completed: "bg-[#f8f7f5] text-[#6c6c6c] border border-[#eaddc8]",
    cancelled: "bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]",
  }[s] || "bg-[#f8f7f5] text-[#6c6c6c] border border-[#eaddc8]";
}

// ─── Image Upload ─────────────────────────────────────────────────────────────
function ImageUpload({ preview, existingUrl, onFile, onClear, fileRef }) {
  const show = preview || existingUrl;
  return (
    <div>
      <label className="block text-sm font-bold text-[#222222] mb-1.5">Cover Image</label>
      {show ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-[#f8f7f5]">
          <img src={show} alt="cover" className="w-full h-40 object-cover" />
          <button type="button" onClick={onClear} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 backdrop-blur-sm transition-colors z-10">
            <X size={16} />
          </button>
          <span className="absolute bottom-2 left-3 text-[10px] font-extrabold uppercase tracking-wider text-[#222222] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
            {preview ? "New image selected" : "Current image"}
          </span>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 flex flex-col items-center gap-2 cursor-pointer bg-[#f8f7f5] hover:border-[#6c5d46] transition-all">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#6c5d46] mb-1"><ImagePlus size={24} /></div>
          <span className="text-sm font-bold text-[#222222]">Click to upload image</span>
          <span className="text-xs font-medium text-[#888888]">JPEG, PNG, WebP — max 10 MB</span>
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

  const inputCls = "w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all";
  const labelCls = "block text-sm font-bold text-[#222222] mb-1.5";

  return (
    <div className="fixed inset-0 z-50 bg-[#222222]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 opacity-100 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-xl scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#222222] flex items-center gap-2">
              {isEdit ? <><Pencil size={20} className="text-[#6c5d46]" /> Edit Event</> : <><PlusCircle size={20} className="text-[#6c5d46]" /> Create New Event</>}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="eventForm" onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>Event Title <span className="text-red-500">*</span></label>
              <input name="title" value={form.title} onChange={onChange} placeholder="Event title" className={inputCls} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-[#222222]" style={{ margin: 0 }}>Description <span className="text-red-500">*</span></label>
                <AIDescribeButton context="event" hint={form.title} onGenerated={v => setForm(p => ({ ...p, description: v }))} />
              </div>
              <textarea name="description" value={form.description} onChange={onChange} rows={3} placeholder="Describe the event..." className={`${inputCls} resize-y min-h-[100px]`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Date <span className="text-red-500">*</span></label>
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
              <label className={labelCls}>Location <span className="text-red-500">*</span></label>
              <input name="location" value={form.location} onChange={onChange} placeholder="Venue address" className={inputCls} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Category</label>
                <select name="category" value={form.category} onChange={onChange} className={`${inputCls} appearance-none cursor-pointer`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select name="status" value={form.status} onChange={onChange} className={`${inputCls} appearance-none cursor-pointer`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}>
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
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border ${msg.ok ? "bg-[#f0f4ea] text-[#5a6b46] border-[#d6e3c9]" : "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"}`}>
                {msg.ok ? <CheckCircle size={16} /> : <XCircle size={16} />} {msg.text}
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white text-[#2c2c2c] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
            Cancel
          </button>
          <button type="submit" form="eventForm" disabled={submitting}
            className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : isEdit ? "Save Changes" : "Create Event"}
          </button>
        </div>

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
    <div className="fixed inset-0 z-50 bg-[#222222]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 opacity-100 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#222222] flex items-center gap-2">
              <Camera size={20} className="text-[#6c5d46]" /> Add Event Photos
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          <p className="text-sm font-medium text-[#6c6c6c] truncate">Adding photos for: <span className="font-bold text-[#222222]">{event.title}</span></p>

          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 flex flex-col items-center gap-2 cursor-pointer bg-[#f8f7f5] hover:border-[#6c5d46] transition-all"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#6c5d46] mb-1"><ImagePlus size={24} /></div>
            <span className="text-sm font-bold text-[#222222]">Click to select photos</span>
            <span className="text-xs font-medium text-[#888888]">Multiple files allowed, max 10 MB each</span>
          </button>
          <input ref={fileRef} type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={onFileChange} />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt="" className="w-full aspect-square object-cover rounded-xl border border-gray-200" />
                  <button onClick={() => removeFile(i)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
                    <X size={12} />
                  </button>
                  <input
                    value={captions[i]}
                    onChange={(e) => setCaptions((prev) => prev.map((c, idx) => idx === i ? e.target.value : c))}
                    placeholder="Add caption..."
                    className="w-full mt-2 px-3 py-1.5 text-xs bg-[#f8f7f5] border border-[#e5e5e5] rounded-lg outline-none focus:border-[#6c5d46] focus:ring-1 focus:ring-[#6c5d46] transition-all"
                  />
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="h-2 bg-[#f8f7f5] rounded-full overflow-hidden border border-[#eaddc8]">
                <div className="h-full bg-[#6c5d46] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs font-bold text-center text-[#888888] uppercase tracking-wider">Uploading... {progress}%</p>
            </div>
          )}

          {msg.text && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border ${msg.ok ? "bg-[#f0f4ea] text-[#5a6b46] border-[#d6e3c9]" : "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"}`}>
              {msg.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {msg.text}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 bg-white text-[#2c2c2c] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
            Cancel
          </button>
          <button onClick={onUpload} disabled={uploading || files.length === 0}
            className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
            {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : `Upload ${files.length > 0 ? `${files.length} Photo${files.length > 1 ? "s" : ""}` : "Photos"}`}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Event Card for NGO Dashboard ─────────────────────────────────────────────
function NgoEventCard({ event, onEdit, onDelete, onAddPhotos }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative h-44 bg-[#f8f7f5] flex-shrink-0">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#d5cfc4]">
            <CalendarDays size={40} strokeWidth={1.2} />
          </div>
        )}
        <span className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm z-10 ${statusColor(event.status)}`}>
          {event.status}
        </span>
        <span className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm z-10 ${event.isPublished ? "bg-[#f0f4ea] text-[#5a6b46] border border-[#d6e3c9]" : "bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]"}`}>
          {event.isPublished ? "Published" : "Draft"}
        </span>
      </div>
      
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-[#222222] text-base leading-snug line-clamp-2">{event.title}</h3>
        
        <div className="space-y-2 text-sm font-medium text-[#6c6c6c] flex-1">
          <div className="flex items-center gap-2"><Calendar size={14} className="text-[#888888]" /> {formatDate(event.date)}</div>
          {event.startTime && <div className="flex items-center gap-2"><Clock size={14} className="text-[#888888]" /> {formatTime(event.startTime)}{event.endTime ? ` - ${formatTime(event.endTime)}` : ""}</div>}
          <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 flex-shrink-0 text-[#888888]" /><span className="line-clamp-1">{event.location}</span></div>
          <div className="flex items-center gap-2"><Tag size={14} className="text-[#888888]" /> {event.category}</div>
        </div>
        
        <div className="flex gap-2 pt-4 mt-auto">
          <button
            onClick={() => onEdit(event)}
            className="flex-1 py-2 text-xs font-bold rounded-lg bg-[#f8f7f5] text-[#222222] border border-[#eaddc8] hover:bg-[#eaddc8] transition-colors flex items-center justify-center gap-1.5"
          >
            <Pencil size={12} /> Edit
          </button>
          {event.status === "completed" && (
            <button
              onClick={() => onAddPhotos(event)}
              className="flex-1 py-2 text-xs font-bold rounded-lg bg-[#f8f7f5] text-[#222222] border border-[#eaddc8] hover:bg-[#eaddc8] transition-colors flex items-center justify-center gap-1.5"
            >
              <Camera size={12} /> Photos
            </button>
          )}
          <button
            onClick={() => onDelete(event._id)}
            className="flex-1 py-2 text-xs font-bold rounded-lg bg-white text-[#991b1b] border border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 size={12} /> Delete
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
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id, true);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setGlobalMsg({ text: "Event deleted successfully.", ok: true });
    } catch (err) {
      setGlobalMsg({ text: err.message || "Failed to delete event.", ok: false });
    }
  };

  const onSaved = (saved, isEdit) => {
    if (isEdit) {
      setEvents((prev) => prev.map((e) => e._id === saved._id ? { ...e, ...saved } : e));
      setGlobalMsg({ text: "Event updated successfully!", ok: true });
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
    <div className="min-h-screen bg-[#f8f7f5] p-4 sm:p-6 lg:p-8 font-sans text-[#2c2c2c] selection:bg-[#eaddc8] selection:text-[#2c2c2c] flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#222222] flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-[#6c5d46]">
              <CalendarDays size={24} />
            </div>
            My Events
          </h1>
          {ngoData && <p className="text-[#6c6c6c] text-sm sm:text-base font-medium mt-2">{ngoData.ngoName}</p>}
        </div>
        <button
          onClick={() => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "create" }); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm shrink-0"
        >
          <PlusCircle size={16} /> New Event
        </button>
      </div>

      {/* Global message */}
      {globalMsg.text && (
        <div className={`flex items-center justify-between p-4 rounded-xl text-sm font-bold border ${globalMsg.ok ? "bg-[#f0f4ea] text-[#5a6b46] border-[#d6e3c9]" : "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]"}`}>
          <span className="flex items-center gap-3">
            {globalMsg.ok ? <CheckCircle size={18} /> : <AlertCircle size={18} />} {globalMsg.text}
          </span>
          <button onClick={() => setGlobalMsg({ text: "", ok: true })} className="p-1 hover:bg-white/50 rounded-md transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Info banner */}
      <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={18} className="text-[#c2410c] mt-0.5 shrink-0" />
        <p className="text-sm font-medium text-[#c2410c]">
          Events you create need admin approval before they are published publicly. You can add photos to completed events to showcase your work.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: total, icon: <Calendar size={20} /> },
          { label: "Upcoming", value: upcoming, icon: <Clock size={20} /> },
          { label: "Published", value: published, icon: <Eye size={20} /> },
          { label: "Completed", value: completed, icon: <CheckCircle size={20} /> },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#f8f7f5] text-[#6c5d46] shrink-0 border border-[#eaddc8]">
              {s.icon}
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-[#222222]">{s.value}</span>
              <span className="block text-xs font-bold text-[#888888] uppercase tracking-wider mt-0.5">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              filterStatus === s 
                ? "bg-[#6c5d46] text-white border-[#6c5d46] shadow-sm" 
                : "bg-white text-[#6c6c6c] border-gray-200 hover:border-[#eaddc8] hover:bg-[#f8f7f5]"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="w-10 h-10 border-4 border-[#eaddc8] border-t-[#6c5d46] rounded-full animate-spin"></div>
          <p className="text-[#888888] font-medium">Loading events...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-[#f8f7f5] rounded-full flex items-center justify-center text-[#d5cfc4] mb-4">
            <CalendarDays size={32} strokeWidth={1.5} />
          </div>
          <h4 className="text-lg font-bold text-[#222222] mb-2">No events found</h4>
          <p className="text-sm font-medium text-[#888888] mb-6">You haven't created any events matching this criteria yet.</p>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#6c5d46] text-white rounded-xl text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm"
          >
            <PlusCircle size={16} /> Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
            setGlobalMsg({ text: "Photos uploaded successfully! Pending review.", ok: true });
            setPhotosModal(null);
          }}
        />
      )}
    </div>
  );
}