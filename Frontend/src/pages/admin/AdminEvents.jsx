import { useState, useEffect, useRef } from "react";
import {
  CalendarDays, PlusCircle, Pencil, Trash2, Eye, EyeOff,
  Loader2, X, ImagePlus, Clock, MapPin,
  CheckCircle, XCircle, AlertCircle,
} from "lucide-react";
import AIDescribeButton from "../../components/ui/AIDescribeButton.jsx";
import {
  adminFetchAllEvents, adminTogglePublish,
  createEvent, updateEvent, deleteEvent, uploadEventImageToS3,
} from "../../utils/eventStore";

const CATEGORIES = ["General", "Education", "Health", "Environment", "Community", "Cultural", "Sports"];
const STATUSES   = ["upcoming", "ongoing", "completed", "cancelled"];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

/* ── Status pill config ── */
const STATUS_CFG = {
  published:  "border border-green-400 text-green-600 bg-green-50",
  upcoming:   "border border-yellow-300 text-yellow-600 bg-yellow-50",
  ongoing:    "border border-blue-300 text-blue-600 bg-blue-50",
  completed:  "border border-gray-300 text-gray-500 bg-gray-50",
  cancelled:  "border border-red-300 text-red-500 bg-red-50",
};


/* ── Event Form Modal ── */
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
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingUrl,  setExistingUrl]  = useState(isEdit ? event.imageUrl : null);
  const [keepExisting, setKeepExisting] = useState(isEdit && !!event.imageUrl);
  const [submitting,   setSubmitting]   = useState(false);
  const [msg,          setMsg]          = useState({ text: "", ok: true });
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
    setImageFile(null); setImagePreview(null);
    setExistingUrl(null); setKeepExisting(false);
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

  const inputCls = "w-full bg-[#f0ede8] border-0 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#2d5a1b]/30 transition-all placeholder:text-gray-400";
  const labelCls = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2";

  const showImg = imagePreview || (keepExisting ? existingUrl : null);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#faf9f6] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 flex-shrink-0">
          {/* pull handle on mobile */}
          <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 m-0 leading-tight">
              {isEdit ? "Edit Event" : "Create Event"}
            </h2>
            {isEdit && (
              <p className="text-sm font-semibold text-[#2d5a1b] m-0 mt-1 line-clamp-1">
                {event.title}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 border-0 flex items-center justify-center text-gray-600 cursor-pointer transition-colors flex-shrink-0 mt-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 pb-4">

            {/* Two-column grid on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">

              {/* ── LEFT COLUMN ── */}
              <div className="flex flex-col gap-4">

                {/* Event Title */}
                <div>
                  <label className={labelCls}>Event Title <span className="text-red-400">*</span></label>
                  <input
                    name="title" value={form.title} onChange={onChange}
                    placeholder="e.g. Annual Education Campaign"
                    className={inputCls}
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`${labelCls} m-0`}>Description <span className="text-red-400">*</span></label>
                    <AIDescribeButton context="event" hint={form.title} onGenerated={(v) => setForm((p) => ({ ...p, description: v }))} />
                  </div>
                  <textarea
                    name="description" value={form.description} onChange={onChange}
                    rows={4} placeholder="Describe the event…"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* Date + Start Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Date <span className="text-red-400">*</span></label>
                    <input type="date" name="date" value={form.date} onChange={onChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Start Time</label>
                    <input type="time" name="startTime" value={form.startTime} onChange={onChange} className={inputCls} />
                  </div>
                </div>

                {/* End Time + Max Participants */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>End Time</label>
                    <input type="time" name="endTime" value={form.endTime} onChange={onChange} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Max Participants</label>
                    <input
                      type="number" name="maxParticipants" value={form.maxParticipants}
                      onChange={onChange} placeholder="Optional" min="1"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="flex flex-col gap-4">

                {/* Cover Image */}
                <div>
                  <label className={labelCls}>Cover Image</label>
                  {showImg ? (
                    <div className="relative rounded-2xl overflow-hidden bg-black">
                      <img src={showImg} alt="cover" className="w-full h-48 sm:h-52 object-cover block" />
                      <button
                        type="button" onClick={clearImage}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 border-0 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <span className="absolute bottom-2.5 left-3 text-xs text-white bg-black/40 px-2.5 py-1 rounded-full">
                        {imagePreview ? "New image selected" : "Current image — ✕ to replace"}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button" onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-10 flex flex-col items-center gap-2 cursor-pointer bg-[#f0ede8] hover:border-[#2d5a1b] hover:bg-green-50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#e5e2db] flex items-center justify-center">
                        <ImagePlus size={22} className="text-gray-500" strokeWidth={1.6} />
                      </div>
                      <span className="text-sm font-semibold text-gray-600">Click to upload image</span>
                      <span className="text-xs text-gray-400">JPEG, PNG, WebP — max 10 MB</span>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={onImageChange} />
                </div>

                {/* Location */}
                <div>
                  <label className={labelCls}>Location <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      name="location" value={form.location} onChange={onChange}
                      placeholder="e.g. City Center Square"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                {/* Category + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Category</label>
                    <select name="category" value={form.category} onChange={onChange} className={inputCls}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select
                      name="status" value={form.status} onChange={onChange}
                      className={`${inputCls} ${form.status === "upcoming" ? "text-[#2d5a1b] font-semibold" : ""}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Preview notice */}
                {isEdit && (
                  <div className="flex items-center gap-3 bg-[#eaf5d3] rounded-2xl px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-[#2d5a1b] flex items-center justify-center flex-shrink-0">
                      <Eye size={17} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1f3f12] m-0">Live Preview Active</p>
                      <p className="text-xs text-[#3a6b20] m-0 mt-0.5">Changes will reflect on the portal immediately.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            {msg.text && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium mt-4 ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {msg.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {msg.text}
              </div>
            )}
          </div>

          {/* ── Sticky Footer ── */}
          <div className="sticky bottom-0 bg-[#f0ede8] border-t border-gray-200/60 px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-3xl">
            <button
              type="button" onClick={onClose}
              className="px-6 py-3 rounded-full text-sm font-semibold text-gray-600 bg-transparent border-0 hover:text-gray-900 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={submitting}
              className="px-7 py-3 rounded-full border-0 bg-[#2d5a1b] hover:bg-[#1f3f12] text-white text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {submitting
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : isEdit
                  ? <><CheckCircle size={14} /> Save Changes</>
                  : <><PlusCircle size={14} /> Create Event</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminEvents() {
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [modal,       setModal]       = useState(null);
  const [globalMsg,   setGlobalMsg]   = useState({ text: "", ok: true });
  const [toggling,    setToggling]    = useState(null);
  const [deleting,    setDeleting]    = useState(null);

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
      setGlobalMsg({ text: err.message || "Failed to toggle.", ok: false });
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

  const total       = events.length;
  const published   = events.filter((e) => e.isPublished).length;
  const upcoming    = events.filter((e) => e.status === "upcoming").length;
  const unpublished = events.filter((e) => !e.isPublished).length;

  const filtered = filterStatus === "All"
    ? events
    : events.filter((e) => e.status === filterStatus.toLowerCase());

  const TABS = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8]">
      <div className="p-4 sm:p-6 lg:p-8">

        {/* ══ HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[1.8rem] sm:text-[2.4rem] font-black text-gray-900 leading-tight m-0">
              Event Management
            </h1>
            <p className="text-sm text-gray-500 mt-1 m-0">Create and manage all public events.</p>
          </div>
          <button
            onClick={() => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "create" }); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-0 bg-[#2d5a1b] hover:bg-[#1f3f12] text-white font-semibold text-sm cursor-pointer transition-colors shadow-sm self-start"
          >
            <PlusCircle size={15} /> New Event
          </button>
        </div>

        {/* ══ STAT CARDS ══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">

          {/* Total Events */}
          <div className="bg-[#edeae2] rounded-2xl p-5 flex flex-col justify-between min-h-[130px]">
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center">
                <CalendarDays size={17} className="text-[#2d5a1b]" />
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right leading-tight">Total<br/>Events</span>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-black text-gray-900 m-0 leading-none tabular-nums">
                {String(total).padStart(2, "0")}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 m-0">Active campaigns</p>
            </div>
          </div>

          {/* Published */}
          <div className="bg-[#edeae2] rounded-2xl p-5 flex flex-col justify-between min-h-[130px]">
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center">
                <Eye size={17} className="text-[#2d5a1b]" />
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right leading-tight">Published</span>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-black text-gray-900 m-0 leading-none tabular-nums">
                {String(published).padStart(2, "0")}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 m-0">Live for public</p>
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-[#edeae2] rounded-2xl p-5 flex flex-col justify-between min-h-[130px]">
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center">
                <Clock size={17} className="text-[#2d5a1b]" />
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right leading-tight">Upcoming</span>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-black text-gray-900 m-0 leading-none tabular-nums">
                {String(upcoming).padStart(2, "0")}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 m-0">In queue</p>
            </div>
          </div>

          {/* Unpublished */}
          <div className="bg-[#edeae2] rounded-2xl p-5 flex flex-col justify-between min-h-[130px]">
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center">
                <EyeOff size={17} className="text-red-400" />
              </div>
              <span className="text-[9px] font-bold text-red-300 uppercase tracking-widest text-right leading-tight">Unpublished</span>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-black text-gray-900 m-0 leading-none tabular-nums">
                {String(unpublished).padStart(2, "0")}
              </p>
              <p className="text-xs text-gray-500 mt-1.5 m-0">Draft versions</p>
            </div>
          </div>

        </div>

        {/* ══ GLOBAL MESSAGE ══ */}
        {globalMsg.text && (
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium mb-5 ${
            globalMsg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
            <span className="flex items-center gap-2">
              {globalMsg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {globalMsg.text}
            </span>
            <button onClick={() => setGlobalMsg({ text: "", ok: true })} className="border-0 bg-transparent cursor-pointer text-inherit text-lg leading-none opacity-60 hover:opacity-100 ml-4 p-0">×</button>
          </div>
        )}

        {/* ══ FILTER TABS ══ */}
        <div className="mb-5 overflow-x-auto pb-1">
          <div className="inline-flex bg-[#edeae2] rounded-full p-1 gap-0.5 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer border-0 whitespace-nowrap ${
                  filterStatus === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "bg-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ══ EVENT LIST ══ */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-gray-400">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm">Loading events…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl text-center py-20 shadow-sm">
            <CalendarDays size={44} className="mx-auto text-gray-200 mb-3" strokeWidth={1} />
            <p className="text-gray-400 text-sm m-0 mb-4">No events found.</p>
            <button
              onClick={() => setModal({ mode: "create" })}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border-0 bg-[#2d5a1b] text-white text-sm font-semibold hover:bg-[#1f3f12] cursor-pointer transition-colors"
            >
              <PlusCircle size={14} /> Create First Event
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((event) => {
              const badgeKey = event.isPublished ? "published" : event.status;
              const badgeLabel = event.isPublished ? "PUBLISHED" : event.status.toUpperCase();
              const badgeCls = STATUS_CFG[badgeKey] || STATUS_CFG.upcoming;
              const busy = toggling === event._id || deleting === event._id;

              return (
                <div key={event._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">

                  {/* ── Desktop / Tablet row (md+) ── */}
                  <div className="hidden md:flex items-center gap-5 px-5 py-4">

                    {/* Thumbnail */}
                    <div className="w-[100px] h-[76px] rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <CalendarDays size={22} strokeWidth={1.2} />
                        </div>
                      )}
                    </div>

                    {/* Title + Location */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[17px] font-black text-gray-900 m-0 leading-snug line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-400 m-0 mt-1 flex items-center gap-1">
                        <MapPin size={12} className="flex-shrink-0" />
                        {event.location || "—"}
                      </p>
                    </div>

                    {/* Schedule */}
                    <div className="flex-shrink-0 min-w-[160px]">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest m-0 mb-1">Schedule</p>
                      <p className="text-sm font-bold text-gray-800 m-0">{formatDate(event.date)}</p>
                      {(event.startTime || event.endTime) && (
                        <p className="text-xs text-gray-400 m-0 mt-0.5">
                          {formatTime(event.startTime)}{event.endTime ? ` - ${formatTime(event.endTime)}` : ""}
                        </p>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="flex-shrink-0 w-28 flex justify-center">
                      <span className={`inline-flex px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${badgeCls}`}>
                        {badgeLabel}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => onTogglePublish(event._id)}
                        disabled={busy}
                        title={event.isPublished ? "Unpublish" : "Publish"}
                        className={`w-9 h-9 rounded-full border-0 flex items-center justify-center cursor-pointer disabled:opacity-40 transition-colors ${
                          event.isPublished
                            ? "bg-green-100 hover:bg-green-200 text-green-600"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-600"
                        }`}
                      >
                        {toggling === event._id
                          ? <Loader2 size={14} className="animate-spin" />
                          : event.isPublished ? <Eye size={14} /> : <EyeOff size={14} />
                        }
                      </button>
                      <button
                        onClick={() => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "edit", event }); }}
                        title="Edit"
                        className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border-0 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(event._id)}
                        disabled={busy}
                        title="Delete"
                        className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-red-500 border-0 flex items-center justify-center cursor-pointer disabled:opacity-40 transition-colors"
                      >
                        {deleting === event._id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />
                        }
                      </button>
                    </div>
                  </div>

                  {/* ── Mobile + Small Tablet card (< md) ── */}
                  <div className="md:hidden">

                    {/* Top: thumbnail full-width with overlay info */}
                    <div className="relative w-full h-36 sm:h-44 overflow-hidden rounded-t-2xl bg-gray-900">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <CalendarDays size={32} strokeWidth={1} />
                        </div>
                      )}
                      {/* gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      {/* status badge on image */}
                      <span className={`absolute top-3 right-3 inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeCls}`}>
                        {badgeLabel}
                      </span>
                      {/* title + location on image bottom */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-white text-base font-black m-0 leading-snug line-clamp-2 drop-shadow">
                          {event.title}
                        </h3>
                        <p className="text-white/70 text-xs m-0 mt-1 flex items-center gap-1">
                          <MapPin size={11} className="flex-shrink-0" />
                          {event.location || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      {/* Schedule chip */}
                      {event.date && (
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                            <CalendarDays size={11} className="text-[#2d5a1b]" />
                            {formatDate(event.date)}
                          </span>
                          {event.startTime && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                              <Clock size={11} className="text-[#2d5a1b]" />
                              {formatTime(event.startTime)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ""}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => onTogglePublish(event._id)}
                          disabled={busy}
                          className={`py-2.5 rounded-xl border-0 text-xs font-bold cursor-pointer disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 ${
                            event.isPublished
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          }`}
                        >
                          {toggling === event._id
                            ? <Loader2 size={12} className="animate-spin" />
                            : event.isPublished ? <><EyeOff size={12} /> Unpublish</> : <><Eye size={12} /> Publish</>
                          }
                        </button>
                        <button
                          onClick={() => { setGlobalMsg({ text: "", ok: true }); setModal({ mode: "edit", event }); }}
                          className="py-2.5 rounded-xl border-0 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => onDelete(event._id)}
                          disabled={busy}
                          className="py-2.5 rounded-xl border-0 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 cursor-pointer disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
                        >
                          {deleting === event._id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <><Trash2 size={12} /> Delete</>
                          }
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
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

      </div>
    </div>
  );
}
