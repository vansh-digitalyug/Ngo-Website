import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, MapPin, Users, Facebook, Twitter, Linkedin, CalendarDays, AlertCircle, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, selectEvents, selectEventsStatus, selectEventsError } from "../../store/slices/eventsSlice";

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
function FeaturedEvent({ event }) {
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

          {/* Share */}
          <div className="flex items-center gap-3 pt-1">
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
        </div>
      </div>
    </div>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ event }) {
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
        </div>
      </div>
    </article>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Education", "Health", "Environment", "Community", "Cultural", "Sports", "General"];

export default function UpcomingEventsPage() {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const status = useSelector(selectEventsStatus);
  const error = useSelector(selectEventsError);
  const loading = status === "loading" || status === "idle";
  const [filterCat, setFilterCat] = useState("All");

  useEffect(() => {
    if (status === "idle") dispatch(fetchEvents());
  }, [status, dispatch]);

  // Filter for upcoming and ongoing events
  const upcomingEvents = events.filter(e => e.status === "upcoming" || e.status === "ongoing");
  const filtered = filterCat === "All" ? upcomingEvents : upcomingEvents.filter((e) => e.category === filterCat);
  const featured = filtered[0] || null;
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-[#f5f6fa]">

      {/* Hero */}
      <div className="bg-[#1a2744] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Upcoming Events</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Join Our Upcoming Events
          </h1>
          <p className="text-slate-300 text-base max-w-lg mx-auto leading-relaxed">
            Be a part of our mission. Join our upcoming events and help us serve those who need it most.
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
            <p className="text-slate-400">No upcoming events at this moment.</p>
            <p className="text-slate-400 text-sm mt-2">Check back soon for new events!</p>
          </div>
        ) : (
          <div className="space-y-12">

            {/* Featured */}
            {featured && <FeaturedEvent event={featured} />}

            {/* More events */}
            {rest.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-lg font-bold text-[#1a2744]">More Upcoming Events</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
