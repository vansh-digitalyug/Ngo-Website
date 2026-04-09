import React, { useState, useEffect } from "react";
import { 
  Calendar, Clock, MapPin, Users, Facebook, Twitter, Linkedin, 
  CalendarDays, AlertCircle, Loader2, X, ChevronRight, Image as ImageIcon
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition-colors shadow-sm"
        >
          <X size={20} />
        </button>
        <div className="overflow-y-auto w-full no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Featured Event ───────────────────────────────────────────────────────────
function FeaturedEvent({ event, onClick }) {
  const timeStr = [event.startTime && fmtTime(event.startTime), event.endTime && fmtTime(event.endTime)]
    .filter(Boolean).join(" – ");

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/60 transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Image */}
        <div className="lg:w-1/2 h-72 lg:h-[420px] bg-slate-100 flex-shrink-0 overflow-hidden relative">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <CalendarDays size={64} className="text-slate-300" strokeWidth={1} />
            </div>
          )}
          <div className="absolute top-6 left-6 flex gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              Featured
            </span>
            {event.category && event.category !== "General" && (
              <span className="px-3 py-1 bg-indigo-600/90 backdrop-blur-sm text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                {event.category}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
            {event.title}
          </h2>

          <div className="space-y-3 text-sm text-slate-600 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-indigo-500 flex-shrink-0" />
              <span className="font-medium text-slate-700">{fmtDate(event.date)}</span>
            </div>
            {timeStr && (
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-indigo-500 flex-shrink-0" />
                <span>{timeStr}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-indigo-500 flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>

          {event.description && (
            <p className="text-slate-500 text-base leading-relaxed line-clamp-3 mb-8">
              {event.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
             {event.photos && event.photos.length > 0 && (
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <ImageIcon size={18} className="text-slate-400" />
                  {event.photos.length} Photos
                </div>
              )}
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm ml-auto group-hover:translate-x-1 transition-transform">
              View Event Details <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event, onClick }) {
  const timeStr = [event.startTime && fmtTime(event.startTime), event.endTime && fmtTime(event.endTime)]
    .filter(Boolean).join(" – ");

  return (
    <article 
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full"
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-100 overflow-hidden flex-shrink-0">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays size={40} className="text-slate-300" strokeWidth={1} />
          </div>
        )}
        {event.category && event.category !== "General" && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
            {event.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-extrabold text-slate-900 text-lg leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
            {event.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={14} className="text-slate-400" />
            <span className="font-medium">{fmtDate(event.date)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin size={14} className="text-slate-400 flex-shrink-0" />
              <span className="truncate pr-2">{event.location}</span>
            </div>
            {event.photos && event.photos.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md flex-shrink-0">
                <ImageIcon size={12} /> {event.photos.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Event Detail (Inside Modal) ──────────────────────────────────────────────
function EventDetail({ event }) {
  const timeStr = [event.startTime && fmtTime(event.startTime), event.endTime && fmtTime(event.endTime)]
    .filter(Boolean).join(" – ");

  return (
    <div className="bg-white">
      {/* Cover Image */}
      <div className="w-full h-64 sm:h-80 bg-slate-100 relative">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <CalendarDays size={64} className="text-slate-300" strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full">
          {event.category && event.category !== "General" && (
            <span className="inline-block px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              {event.category}
            </span>
          )}
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {event.title}
          </h2>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Info */}
          <div className="lg:w-2/3 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">About this Event</h3>
              <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
                {event.description || "No description provided for this event."}
              </p>
            </div>

            {/* Gallery Section */}
            {event.photos && event.photos.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Event Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {event.photos.map((photo) => (
                    <PhotoCard key={photo._id} photo={photo} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4">Event Details</h4>
              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Date</p>
                    <p>{fmtDate(event.date)}</p>
                  </div>
                </div>
                {timeStr && (
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Time</p>
                      <p>{timeStr}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Location</p>
                    <p>{event.location}</p>
                  </div>
                </div>
                {event.maxParticipants && (
                  <div className="flex items-start gap-3">
                    <Users size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Attendance</p>
                      <p>{event.maxParticipants.toLocaleString()} participants</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Share */}
            <div className="p-6 rounded-2xl border border-slate-200">
              <p className="text-sm font-bold text-slate-900 mb-3">Share this event</p>
              <div className="flex items-center gap-3">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1877f2] hover:text-white transition-colors">
                  <Facebook size={18} />
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-colors">
                  <Twitter size={18} />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white transition-colors">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>

            {event.ngoId?.ngoName && (
              <p className="text-xs text-center text-slate-500">
                Organized by <span className="font-bold text-slate-900">{event.ngoId.ngoName}</span>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Photo Card ───────────────────────────────────────────────────────────────
function PhotoCard({ photo }) {
  return (
    <div className="relative group rounded-xl overflow-hidden bg-slate-100 aspect-square">
      <img
        src={photo.imageUrl}
        alt="event moment"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      {photo.caption && (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <p className="text-white text-sm font-medium line-clamp-3">{photo.caption}</p>
          {photo.uploadedBy?.name && (
            <p className="text-slate-300 text-xs mt-1">by {photo.uploadedBy.name}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Education", "Health", "Environment", "Community", "Cultural", "Sports", "General"];

export default function PastEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/events/past/all`);
        if (!res.ok) throw new Error("Failed to fetch past events");
        const json = await res.json();
        setEvents(Array.isArray(json.data) ? json.data : []);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load past events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPastEvents();
  }, []);

  const filtered = filterCat === "All" ? events : events.filter((e) => e.category === filterCat);
  const featuredEvent = filtered.length > 0 ? filtered[0] : null;
  const gridEvents = filtered.length > 1 ? filtered.slice(1) : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-20 pb-24 px-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[150%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute -bottom-[30%] -left-[10%] w-[50%] h-[100%] bg-emerald-500/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
            <CalendarDays size={14} /> Memories & Impact
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Our Past Events
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Explore the milestones we've reached and the beautiful moments we've shared with the community.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        
        {/* Category Filters */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex gap-2 overflow-x-auto no-scrollbar snap-x mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all snap-start
                ${filterCat === cat
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
            <span className="font-medium">Loading amazing memories...</span>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto flex items-center gap-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 shadow-sm">
            <AlertCircle size={24} className="flex-shrink-0" /> 
            <p className="font-medium">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-slate-200 border-dashed max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays size={32} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No past events found</h3>
            <p className="text-slate-500">We don't have any past events in the "{filterCat}" category yet.</p>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Featured Event (First Item) */}
            {featuredEvent && (
              <FeaturedEvent 
                event={featuredEvent} 
                onClick={() => setSelectedEvent(featuredEvent)} 
              />
            )}

            {/* Event Grid (Remaining Items) */}
            {gridEvents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridEvents.map((event) => (
                  <EventCard 
                    key={event._id} 
                    event={event} 
                    onClick={() => setSelectedEvent(event)} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal Overlay */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        {selectedEvent && <EventDetail event={selectedEvent} />}
      </Modal>

      {/* Hide scrollbar styles for horizontal scrolling */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}