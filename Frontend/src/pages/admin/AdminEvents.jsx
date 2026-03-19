import React, { useState, useEffect, useRef } from "react";
import {
  CalendarDays, PlusCircle, Pencil, Trash2, Eye, EyeOff,
  Loader2, X, ImagePlus, Clock, MapPin, Users, Tag,
  CheckCircle, XCircle, AlertCircle, Calendar
} from "lucide-react";
import AIDescribeButton from "../../components/ui/AIDescribeButton.jsx";
import {
  adminFetchAllEvents,
  adminTogglePublish,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImageToS3,
} from "../../utils/eventStore";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

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
          <img src={show} alt="cover" className="w-full h-44 object-cover opacity-90" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X size={13} />
          </button>
          <span className="absolute bottom-2 left-3 text-xs text-white bg-black/40 px-2 py-0.5 rounded">
            {preview ? "New image selected" : "Current image"}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 rounded-xl py-7 flex flex-col items-center gap-2 cursor-pointer bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <ImagePlus size={20} className="text-blue-500" />
          </div>
          <span className="text-sm font-semibold text-slate-600">Click to upload image</span>
          <span className="text-xs text-slate-400">JPEG, PNG, WebP — max 10 MB</span>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={onFile}
      />
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
    title: event.title || "",
    description: event.description || "",
    date: event.date ? event.date.split("T")[0] : "",
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    location: event.location || "",
    category: event.category || "General",
    maxParticipants: event.maxParticipants || "",
    status: event.status || "upcoming",
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
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setKeepExisting(false);
    setMsg({ text: "", ok: true });
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingUrl(null);
    setKeepExisting(false);
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
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location.trim(),
        category: form.category,
        status: form.status,
        ...(form.maxParticipants ? { maxParticipants: Number(form.maxParticipants) } : {}),
        ...(s3Key ? { S3Imagekey: s3Key } : {}),
      };

      const saved = isEdit
        ? await updateEvent(event._id, payload, false)
        : await createEvent(payload, false);

      onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      setMsg({ text: err.message || "Failed to save event.", ok: false });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition-all";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEdit ? "bg-blue-50" : "bg-green-50"}`}>
              {isEdit ? <Pencil size={16} className="text-blue-600" /> : <PlusCircle size={16} className="text-green-600" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{isEdit ? "Edit Event" : "Create New Event"}</h2>
              {isEdit && <p className="text-xs text-slate-400 truncate max-w-xs">{event.title}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 grid gap-4">
          {/* Title */}
          <div>
            <label className={labelCls}>Event Title *</label>
            <input name="title" value={form.title} onChange={onChange} placeholder="e.g. 45th Divyang & Poor Mass Wedding Ceremony" className={inputCls} />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls} style={{ margin: 0 }}>Description *</label>
              <AIDescribeButton context="event" hint={form.title} onGenerated={v => setForm(p => ({ ...p, description: v }))} />
            </div>
            <textarea name="description" value={form.description} onChange={onChange} rows={3} placeholder="Describe the event…" className={`${inputCls} resize-y`} />
          </div>

          {/* Date, StartTime, EndTime */}
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

          {/* Location */}
          <div>
            <label className={labelCls}>Location *</label>
            <input name="location" value={form.location} onChange={onChange} placeholder="e.g. Seva Mahatirth, Udaipur (Raj.)" className={inputCls} />
          </div>

          {/* Category, Status, MaxParticipants */}
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

          {/* Image */}
          <ImageUpload
            preview={imagePreview}
            existingUrl={keepExisting ? existingUrl : null}
            onFile={onImageChange}
            onClear={clearImage}
            fileRef={fileRef}
          />

          {/* Message */}
          {msg.text && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${msg.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
              {msg.ok ? <CheckCircle size={15} /> : <XCircle size={15} />}
              {msg.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-lg text-white text-sm font-bold flex items-center gap-2 transition-colors ${submitting ? "bg-slate-400 cursor-not-allowed" : isEdit ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
            >
              {submitting
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : isEdit
                  ? <><Pencil size={14} /> Save Changes</>
                  : <><PlusCircle size={14} /> Create Event</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Admin Events Page ────────────────────────────────────────────────────────
export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal, setModal] = useState(null);
  const [globalMsg, setGlobalMsg] = useState({ text: "", ok: true });
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    adminFetchAllEvents()
      .then(setEvents)
      .catch((e) => setGlobalMsg({ text: e.message || "Failed to load events.", ok: false }))
      .finally(() => setLoading(false));
  }, []);

  const onTogglePublish = async (id) => {
    setToggling(id);
    try {
      const updated = await adminTogglePublish(id);
      setEvents((prev) => prev.map((e) => e._id === id ? { ...e, isPublished: updated.isPublished } : e));
      setGlobalMsg({ text: updated.isPublished ? "Event published." : "Event unpublished.", ok: true });
    } catch (err) {
      setGlobalMsg({ text: err.message || "Failed to toggle publish.", ok: false });
    } finally {
      setToggling(null);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Permanently delete this event?")) return;
    setDeleting(id);
    try {
      await deleteEvent(id, false);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setGlobalMsg({ text: "Event deleted.", ok: true });
    } catch (err) {
      setGlobalMsg({ text: err.message || "Failed to delete.", ok: false });
    } finally {
      setDeleting(null);
    }
  };

  const onSaved = (saved, isEdit) => {
    if (isEdit) {
      setEvents((prev) => prev.map((e) => e._id === saved._id ? { ...e, ...saved } : e));
      setGlobalMsg({ text: "Event updated!", ok: true });
    } else {
      setEvents((prev) => [saved, ...prev]);
      setGlobalMsg({ text: "Event created!", ok: true });
    }
  };

  const filtered = filterStatus === "All" ? events : events.filter((e) => e.status === filterStatus);

  // Stats
  const total = events.length;
  const published = events.filter((e) => e.isPublished).length;
  const upcoming = events.filter((e) => e.status === "upcoming").length;
  const unpublished = events.filter((e) => !e.isPublished).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold text-slate-800">
          <CalendarDays size={22} className="text-blue-600" /> Event Management
        </h1>
        <button
          onClick={() => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "create" }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-sm transition-colors"
        >
          <PlusCircle size={16} /> New Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: total, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
          { label: "Published", value: published, color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
          { label: "Upcoming", value: upcoming, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Unpublished", value: unpublished, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
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
            {globalMsg.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {globalMsg.text}
          </span>
          <button onClick={() => setGlobalMsg({ text: "", ok: true })} className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Table Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Panel header + filter */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h2 className="text-sm font-bold text-slate-700">All Events</h2>
            <p className="text-xs text-slate-400">{filtered.length} of {total} shown</p>
          </div>
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm">Loading events…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays size={44} className="mx-auto text-slate-200 mb-3" strokeWidth={1} />
            <p className="text-slate-400 text-sm">No events found.</p>
            <button
              onClick={() => setModal({ mode: "create" })}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <PlusCircle size={14} /> Create First Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="text-left px-5 py-3">Event</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Location</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Published</th>
                  <th className="text-left px-4 py-3">Created By</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((event) => (
                  <tr key={event._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 flex-shrink-0">
                            <CalendarDays size={16} />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 text-sm line-clamp-1 max-w-[200px]">{event.title}</p>
                          <p className="text-xs text-slate-400">{event.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1"><Calendar size={11} /> {formatDate(event.date)}</div>
                      {event.startTime && <div className="flex items-center gap-1 mt-0.5"><Clock size={11} /> {formatTime(event.startTime)}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-[140px]">
                      <div className="flex items-start gap-1"><MapPin size={11} className="mt-0.5 flex-shrink-0" /><span className="line-clamp-2">{event.location}</span></div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${statusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onTogglePublish(event._id)}
                        disabled={toggling === event._id}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${event.isPublished ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"}`}
                      >
                        {toggling === event._id
                          ? <Loader2 size={11} className="animate-spin" />
                          : event.isPublished
                            ? <><Eye size={11} /> Published</>
                            : <><EyeOff size={11} /> Draft</>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div className="font-medium">
                        {event.ngoId?.ngoName || event.createdBy?.name || "—"}
                      </div>
                      <div className="text-slate-400 capitalize">{event.createdByRole}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "edit", event }); }}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => onDelete(event._id)}
                          disabled={deleting === event._id}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === event._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {modal && (
        <EventFormModal
          mode={modal.mode}
          event={modal.event}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
