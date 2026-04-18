import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Calendar, Clock, MapPin, CalendarDays, AlertCircle, Loader2, Bell, 
  Facebook, Twitter, Linkedin, Link as LinkIcon
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, selectEvents, selectEventsStatus, selectEventsError } from "../../store/slices/eventsSlice";
import { checkRegistration, selectIsRegisteredForEvent } from "../../store/slices/registrationSlice";
import RegistrationModal from "../../components/RegistrationModal";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Event Card (Redesigned) ──────────────────────────────────────────────────
function EventCard({ event, onNavigate }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(event.date);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spotsData, setSpotsData] = useState(null);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0); // ✅ Track last check to prevent hammering API
  
  // Use per-event selector for registration status
  const isRegistered = useSelector(state => selectIsRegisteredForEvent(state, event._id));

  // ✅ Helper function to check if we should make API call (debounce/prevent hammering)
  const shouldCheckRegistration = useCallback(() => {
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckTime;
    const MIN_INTERVAL = 2000; // Minimum 2 seconds between checks for same event
    return timeSinceLastCheck >= MIN_INTERVAL;
  }, [lastCheckTime]);

  // Fetch spots data on mount
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        setSpotsLoading(true);
        const response = await fetch(`/api/registrations/${event._id}/spots`);
        if (response.ok) {
          const data = await response.json();
          setSpotsData(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch spots:', err);
      } finally {
        setSpotsLoading(false);
      }
    };
    fetchSpots();
  }, [event._id]);

  // ✅ CHECK REGISTRATION STATUS ON MOUNT (Only once!)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && event._id) {
      // ✅ Single check on mount - eventId is passed through thunk payload
      dispatch(checkRegistration(event._id));
      setLastCheckTime(Date.now());
    }
  }, [event._id, dispatch]);

  // ✅ RE-CHECK WHEN MODAL OPENS (if enough time has passed)
  useEffect(() => {
    if (isModalOpen) {
      const token = localStorage.getItem('token');
      if (token && event._id && shouldCheckRegistration()) {
        setLastCheckTime(Date.now());
        dispatch(checkRegistration(event._id));
      }
    }
  }, [isModalOpen, event._id, dispatch, shouldCheckRegistration]);

  // ✅ RE-CHECK WHEN MODAL CLOSES (after user registers)
  useEffect(() => {
    if (!isModalOpen && event._id) {
      const token = localStorage.getItem('token');
      if (token && shouldCheckRegistration()) {
        // Delay a bit to let backend data settle
        const timer = setTimeout(() => {
          setLastCheckTime(Date.now());
          dispatch(checkRegistration(event._id));
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isModalOpen, event._id, dispatch, shouldCheckRegistration]);

  const handleRegisterClick = (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      sessionStorage.setItem(
        'flash_message',
        JSON.stringify({ type: 'info', message: 'Please log in to register for events' })
      );
      navigate(`/login/user?redirectTo=${encodeURIComponent(`/events/upcoming/${encodeURIComponent(event.title)}`)}`);
      return;
    }
    setIsModalOpen(true);
  };

  const getButtonState = () => {
    if (isRegistered) {
      return { label: '✓ Already Registered', disabled: true, color: 'bg-stone-100 text-stone-500' };
    }
    if (spotsData?.isFullyBooked) {
      return { label: 'Fully Booked', disabled: true, color: 'bg-stone-100 text-stone-500' };
    }
    return { label: 'Register Now', disabled: false, color: 'bg-[#0F766E] hover:bg-[#0D9488] text-white' };
  };

  const buttonState = getButtonState();

  return (
    <>
    <article 
      onClick={() => onNavigate(event._id, event.title)}
      className="group cursor-pointer bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full">
      
      {/* Image Container */}
      <div className="relative h-52 bg-stone-100 overflow-hidden flex-shrink-0">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays size={48} className="text-stone-300" strokeWidth={1} />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex flex-col flex-1">
        
        {/* Title */}
        <h3 className="font-bold text-stone-900 text-xl leading-snug mb-3 line-clamp-2">
          {event.title}
        </h3>

        {/* Date & Location Line */}
        <div className="flex flex-wrap items-center gap-3 text-stone-600 text-sm font-medium mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="text-stone-400" />
            {fmtDate(event.date)}
          </div>
          <span className="text-stone-300">|</span>
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="text-stone-400" />
            <span className="truncate max-w-[150px]">{event.location || "TBA"}</span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
            {event.description}
          </p>
        )}

        {/* Countdown Timer */}
        {!expired ? (
          <div className="mb-6 bg-[#fcf9f2] rounded-xl border border-amber-200/60 p-4 mt-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px bg-amber-200 flex-1"></div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Starts In</span>
              <div className="h-px bg-amber-200 flex-1"></div>
            </div>
            
            <div className="flex justify-between items-center px-1">
              {/* Days */}
              <div className="flex flex-col items-center flex-1 bg-white border border-amber-100 rounded-lg py-2 shadow-sm">
                <span className="font-bold text-amber-900 text-xl leading-none mb-1">{String(days).padStart(2, "0")}</span>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Days</span>
              </div>
              
              <span className="text-amber-800/50 font-bold mx-2 pb-3">:</span>
              
              {/* Hours */}
              <div className="flex flex-col items-center flex-1 bg-white border border-amber-100 rounded-lg py-2 shadow-sm">
                <span className="font-bold text-amber-900 text-xl leading-none mb-1">{String(hours).padStart(2, "0")}</span>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Hrs</span>
              </div>
              
              <span className="text-amber-800/50 font-bold mx-2 pb-3">:</span>
              
              {/* Minutes */}
              <div className="flex flex-col items-center flex-1 bg-white border border-amber-100 rounded-lg py-2 shadow-sm">
                <span className="font-bold text-amber-900 text-xl leading-none mb-1">{String(minutes).padStart(2, "0")}</span>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Min</span>
              </div>
              
              <span className="text-amber-800/50 font-bold mx-2 pb-3">:</span>
              
              {/* Seconds */}
              <div className="flex flex-col items-center flex-1 bg-white border border-amber-100 rounded-lg py-2 shadow-sm">
                <span className="font-bold text-amber-900 text-xl leading-none mb-1">{String(seconds).padStart(2, "0")}</span>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Sec</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 mt-auto">
            <div className="w-full py-3 bg-stone-100 text-stone-500 text-sm font-bold text-center rounded-xl border border-stone-200">
              Event has started
            </div>
          </div>
        )}

          {/* Spots Remaining Display */}
          {spotsData && (
            <div className="mb-4 text-center">
              {spotsData.isFullyBooked ? (
                <p className="text-sm font-bold text-red-600">No spots available</p>
              ) : (
                <p className="text-sm font-bold text-green-600">
                  {spotsData.spotsRemaining} {spotsData.spotsRemaining === 1 ? 'spot' : 'spots'} remaining
                </p>
              )}
            </div>
          )}

          {/* CTA Area */}
          <div className="flex flex-col gap-2">
            <button 
              onClick={handleRegisterClick}
              disabled={buttonState.disabled}
              className={`w-full ${buttonState.color} font-bold py-3 rounded-lg transition-all text-xs tracking-wide shadow-sm disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {buttonState.label}
            </button>
            <p className="text-[11px] text-center text-stone-500 font-medium">
              Register to secure a spot & get reminders
            </p>
          </div>
        </div>

      </article>

      {/* Registration Modal */}
      <RegistrationModal 
        event={event} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        isRegistered={isRegistered}
      />
    </>
  );
}

// ─── Full Page Event Detail View ──────────────────────────────────────────────
function EventDetailView({ event, onBack }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(event.date);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      
      {/* Back Link */}
      <button 
        onClick={onBack}
        className="group flex items-center gap-2 text-stone-600 hover:text-stone-900 font-semibold mb-10 transition-colors text-lg"
      >
        « <span className="group-hover:-translate-x-0.5 transition-transform">All Events</span>
      </button>

      {/* Title */}
      <h1 className="text-3xl md:text-5xl font-black text-stone-900 leading-tight mb-8 uppercase tracking-tight">
        {event.title}
      </h1>

      {/* Hero Image */}
      <div className="w-full max-w-[1200px] aspect-[3/2] bg-stone-100 rounded-xl overflow-hidden mb-12 shadow-lg mx-auto">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300">
            <CalendarDays size={80} className="text-stone-400" strokeWidth={1} />
          </div>
        )}
      </div>

      {/* Date, Time & Location */}
      <div className="w-full mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <Calendar size={20} className="text-stone-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Date</p>
            <p className="text-lg font-bold text-stone-900">{fmtDate(event.date)}</p>
          </div>
        </div>
        {event.startTime && (
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-stone-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Time</p>
              <p className="text-lg font-bold text-stone-900">{event.startTime}</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <MapPin size={20} className="text-stone-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Location</p>
            <p className="text-lg font-bold text-stone-900">{event.location || "TBA"}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="w-full mb-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-4 pb-3 border-b-2 border-stone-200">About the Event</h2>
        <p className="text-stone-700 text-lg leading-relaxed whitespace-pre-wrap">
          {event.description || "No description provided for this event."}
        </p>
      </div>

      {/* Countdown Section */}
      {!expired && (
        <div className="w-full mb-12 bg-[#fcf9f2] rounded-xl border border-amber-200/60 p-6 sm:p-8">
          
          {/* New Heading Added Above Timer */}
          <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-6 text-center">
            Support Drive
          </h3>

          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6">
            <div className="h-px bg-amber-300 flex-1"></div>
            <h2 className="text-lg sm:text-2xl font-bold text-amber-900 uppercase tracking-wider whitespace-nowrap">Starts In</h2>
            <div className="h-px bg-amber-300 flex-1"></div>
          </div>
          
          {/* Responsive gap and text sizing */}
          <div className="flex justify-center items-center gap-1 sm:gap-3 mb-4">
            {/* Days */}
            <div className="flex flex-col items-center">
              <div className="bg-white border-2 border-amber-700 rounded-lg px-3 py-3 sm:px-5 sm:py-4 min-w-[65px] sm:min-w-[90px] text-center shadow-sm">
                <span className="font-black text-amber-900 text-xl sm:text-3xl block">{String(days).padStart(2, "0")}</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-amber-700 mt-2 sm:mt-3 uppercase tracking-wide">Days</span>
            </div>
            
            <span className="text-xl sm:text-3xl font-bold text-amber-700 mb-6 sm:mb-8">:</span>
            
            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="bg-white border-2 border-amber-700 rounded-lg px-3 py-3 sm:px-5 sm:py-4 min-w-[65px] sm:min-w-[90px] text-center shadow-sm">
                <span className="font-black text-amber-900 text-xl sm:text-3xl block">{String(hours).padStart(2, "0")}</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-amber-700 mt-2 sm:mt-3 uppercase tracking-wide">Hrs</span>
            </div>
            
            <span className="text-xl sm:text-3xl font-bold text-amber-700 mb-6 sm:mb-8">:</span>
            
            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="bg-white border-2 border-amber-700 rounded-lg px-3 py-3 sm:px-5 sm:py-4 min-w-[65px] sm:min-w-[90px] text-center shadow-sm">
                <span className="font-black text-amber-900 text-xl sm:text-3xl block">{String(minutes).padStart(2, "0")}</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-amber-700 mt-2 sm:mt-3 uppercase tracking-wide">Min</span>
            </div>
            
            <span className="text-xl sm:text-3xl font-bold text-amber-700 mb-6 sm:mb-8">:</span>
            
            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="bg-white border-2 border-amber-700 rounded-lg px-3 py-3 sm:px-5 sm:py-4 min-w-[65px] sm:min-w-[90px] text-center shadow-sm">
                <span className="font-black text-amber-900 text-xl sm:text-3xl block">{String(seconds).padStart(2, "0")}</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-amber-700 mt-2 sm:mt-3 uppercase tracking-wide">Sec</span>
            </div>
          </div>
        </div>
      )}

      {/* Event Gallery Section */}
      {event.photos && event.photos.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-stone-900 mb-8 pb-4 border-b-2 border-stone-200">
            Event Gallery
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.photos.map((photo) => (
              <div 
                key={photo._id} 
                className="group relative rounded-lg overflow-hidden bg-stone-100 aspect-[4/3] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <img
                  src={photo.imageUrl}
                  alt="event gallery"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {photo.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white text-sm font-medium line-clamp-3">{photo.caption}</p>
                    {photo.uploadedBy?.name && (
                      <p className="text-stone-300 text-xs mt-2">by {photo.uploadedBy.name}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Education", "Health", "Environment", "Community", "Cultural", "Sports", "General"];

export default function UpcomingEventsPage() {
  const navigate = useNavigate();
  const { eventName } = useParams();
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const status = useSelector(selectEventsStatus);
  const error = useSelector(selectEventsError);
  const loading = status === "loading" || status === "idle";
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterCat, setFilterCat] = useState("All");

  useEffect(() => {
    if (status === "idle") dispatch(fetchEvents());
  }, [status, dispatch]);

  useEffect(() => {
    if (eventName && events.length > 0) {
      const decodedName = decodeURIComponent(eventName);
      const event = events.find(e => e.title === decodedName);
      if (event) {
        setSelectedEvent(event);
        window.scrollTo(0, 0);
      }
    }
  }, [eventName, events]);

  const handleEventClick = (id, title) => {
    const event = events.find(e => e._id === id);
    if (event) {
      setSelectedEvent(event);
      navigate(`/events/upcoming/${encodeURIComponent(title)}`);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setSelectedEvent(null);
    navigate('/events/upcoming');
  };

  // Filter for upcoming and ongoing events
  const upcomingEvents = events.filter(e => e.status === "upcoming" || e.status === "ongoing");
  const filtered = filterCat === "All" ? upcomingEvents : upcomingEvents.filter((e) => e.category === filterCat);

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pb-24 font-sans">
        <div className="bg-[#4A3F35] text-white py-16 px-6 relative drop-shadow-md">
          <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-wider mb-4">
              EVENT DETAILS
            </h1>
            {/* Updated Breadcrumbs for Event Detail View with Responsive Flex-Wrap */}
            <nav className="flex flex-wrap justify-center items-center gap-2 text-stone-300 text-sm md:text-base font-medium tracking-wide">
              <a href="/" className="hover:text-white transition-colors whitespace-nowrap">Home</a>
              <span className="whitespace-nowrap">-</span>
              <button onClick={handleBack} className="hover:text-white transition-colors whitespace-nowrap">
                Upcoming Events
              </button>
              <span className="whitespace-nowrap">-</span>
              {/* Removed truncation constraints to display full title */}
              <span className="text-white text-center">{selectedEvent.title}</span>
            </nav>
          </div>
        </div>
        <main className="relative z-20">
          <EventDetailView event={selectedEvent} onBack={handleBack} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 font-sans">

      {/* Hero Header Section */}
      <div className="bg-[#4A3F35] text-white py-16 px-6 relative drop-shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-wider mb-4">
            UPCOMING EVENTS
          </h1>
          
          {/* Updated Breadcrumbs for Main List View */}
          <nav className="flex flex-wrap justify-center items-center gap-2 text-stone-300 text-sm md:text-base font-medium tracking-wide">
            <a href="/" className="hover:text-white transition-colors whitespace-nowrap">Home</a>
            <span className="whitespace-nowrap">-</span>
            <button 
              onClick={() => { setFilterCat("All"); window.scrollTo(0, 0); }} 
              className="text-white hover:text-stone-200 transition-colors whitespace-nowrap"
            >
              Upcoming Events
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">

        {/* Category filter */}
        <div className="mb-12 pb-8 border-b border-stone-200">
          <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Filter by Category</p>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-6 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all shadow-sm ${
                  filterCat === cat
                    ? 'bg-[#9B7341] text-white shadow-md'
                    : 'bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-stone-400">
            <Loader2 size={44} className="animate-spin text-[#0F766E] mb-6" />
            <span className="font-semibold text-stone-600">Loading upcoming events...</span>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto flex items-center gap-4 bg-red-50 text-red-800 rounded-2xl p-6 border border-red-200/60 shadow-sm">
            <AlertCircle size={28} className="flex-shrink-0 text-red-600" /> 
            <p className="font-medium">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-stone-200 shadow-sm max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays size={40} className="text-stone-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-3">No upcoming events</h3>
            <p className="text-stone-500 text-lg">Check back soon for new opportunities to engage!</p>
          </div>
        ) : (
          <>
            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((event) => (
                <EventCard key={event._id} event={event} onNavigate={handleEventClick} />
              ))}
            </div>
          </>
        )}

      </main>

      {/* Hide scrollbar styles for horizontal scrolling */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}