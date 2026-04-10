import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Calendar, Clock, MapPin, Users, Facebook, Twitter, Linkedin, 
  CalendarDays, AlertCircle, Loader2, ChevronRight, Image as ImageIcon, ChevronLeft
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

// ─── Event Card (Grid Item) ───────────────────────────────────────────────────
function EventCard({ event, onClick, onNavigate }) {
  return (
    <article 
      onClick={() => onNavigate(event._id, event.title)}
      className="group cursor-pointer bg-white rounded-xl border border-stone-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full"
    >
      <div className="relative h-56 bg-stone-100 overflow-hidden flex-shrink-0">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays size={40} className="text-stone-300" strokeWidth={1} />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-stone-900 text-xl leading-snug mb-3 line-clamp-2 group-hover:text-amber-800 transition-colors">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
            {event.description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-stone-100 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 text-sm text-stone-600">
            <Calendar size={16} className="text-amber-700/70" />
            <span className="font-medium">{fmtDate(event.date)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-stone-600">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <MapPin size={16} className="text-amber-700/70 flex-shrink-0" />
              <span className="truncate pr-2">{event.location}</span>
            </div>
            {event.photos && event.photos.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md flex-shrink-0 border border-amber-100">
                <ImageIcon size={12} /> {event.photos.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Full Page Event Detail View ──────────────────────────────────────────────
function EventDetailView({ event, onBack }) {
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

      {/* Description */}
      <div className="w-full mb-16">
        <p className="text-stone-700 text-lg leading-relaxed whitespace-pre-wrap">
          {event.description || "No description provided for this event."}
        </p>
      </div>

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
const ITEMS_PER_PAGE = 6;

export default function PastEventsPage() {
  const navigate = useNavigate();
  const { eventName } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    // Scroll to top when view changes
    window.scrollTo(0, 0);
  }, [selectedEvent, currentPage, selectedYear]);

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/events/past/all`);
        if (!res.ok) throw new Error("Failed to fetch past events");
        const json = await res.json();
        const eventsData = Array.isArray(json.data) ? json.data : [];
        setEvents(eventsData);

        // If eventName is in URL, set it as selected
        if (eventName) {
          const decodedName = decodeURIComponent(eventName);
          const event = eventsData.find(e => e.title === decodedName);
          if (event) {
            setSelectedEvent(event);
            const eventYear = new Date(event.date).getFullYear();
            setSelectedYear(eventYear);
          }
        } else {
          // Set default year to the latest year with events
          if (eventsData.length > 0) {
            const years = [...new Set(eventsData.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a);
            setSelectedYear(years[0]);
          }
        }
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load past events");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPastEvents();
  }, [eventName]);

  const handleEventClick = (id, title) => {
    const event = events.find(e => e._id === id);
    if (event) {
      setSelectedEvent(event);
      const eventYear = new Date(event.date).getFullYear();
      setSelectedYear(eventYear);
      navigate(`/events/past/${encodeURIComponent(title)}`);
    }
  };

  const handleBack = () => {
    setSelectedEvent(null);
    navigate('/events/past');
  };

  // Get all unique years from events
  const currentYear = new Date().getFullYear();
  const startYear = 2015;
  
  // Generate all years from start year to current year
  const allYears = [];
  for (let year = currentYear; year >= startYear; year--) {
    allYears.push(year);
  }

  // Filter events by selected year
  const filteredEvents = selectedYear 
    ? events.filter(e => new Date(e.date).getFullYear() === selectedYear)
    : events;

  // Pagination Logic
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE) || 1;
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  
  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24 font-sans">
      
      {/* Hero Header Section */}
      <div className="bg-[#4A3F35] text-white py-16 px-6 relative drop-shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-wider mb-4">
            {selectedEvent ? 'EVENT DETAILS' : 'PAST EVENTS'}
          </h1>
          
          {/* Clickable Breadcrumbs */}
          <nav className="flex items-center gap-2 text-stone-300 text-sm md:text-base font-medium tracking-wide">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>-</span>
            <button 
              onClick={handleBack} 
              className={`${!selectedEvent ? 'text-white' : 'hover:text-white transition-colors'}`}
            >
              Past Events
            </button>
            {selectedEvent && (
              <>
                <span>-</span>
                <span className="text-white truncate max-w-[150px] md:max-w-[300px]">
                  {selectedEvent.title}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-stone-400">
            <Loader2 size={44} className="animate-spin text-amber-700 mb-6" />
            <span className="font-semibold text-stone-600">Loading memories...</span>
          </div>
        ) : error ? (
          <div className="max-w-2xl mx-auto flex items-center gap-4 bg-red-50 text-red-800 rounded-2xl p-6 border border-red-200/60 shadow-sm mt-16">
            <AlertCircle size={28} className="flex-shrink-0 text-red-600" /> 
            <p className="font-medium">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-stone-200 shadow-sm max-w-3xl mx-auto mt-16 mx-4">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays size={40} className="text-stone-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-3">No past events yet</h3>
            <p className="text-stone-500 text-lg">Check back later for beautiful moments shared with the community.</p>
          </div>
        ) : selectedEvent ? (
          /* Render Full Page Detail View */
          <EventDetailView 
            event={selectedEvent} 
            onBack={handleBack} 
          />
        ) : (
          /* Render List View with Year Filters */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            
            {/* Year Filter Tabs */}
            <div className="mb-12 pb-8 border-b border-stone-200">
              <p className="text-sm font-semibold text-stone-600 uppercase tracking-wide mb-4">Filter by Year</p>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {allYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`px-6 py-2.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                      selectedYear === year
                        ? 'bg-amber-700 text-white shadow-md'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Grid or Empty State */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 border-dashed">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarDays size={32} className="text-stone-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">No events in {selectedYear}</h3>
                <p className="text-stone-500">There are no past events recorded for this year.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentEvents.map((event) => (
                    <EventCard 
                      key={event._id} 
                      event={event}
                      onNavigate={handleEventClick}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-6 pt-16 mt-8">
                    <button 
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${
                        currentPage === 1 
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        : 'bg-white text-stone-700 shadow-sm hover:shadow hover:-translate-y-0.5 border border-stone-200 hover:border-stone-300 hover:text-stone-900'
                      }`}
                    >
                      <ChevronLeft size={18} /> Prev
                    </button>
                    <div className="text-stone-600 font-medium">
                      Page <span className="font-bold text-stone-900">{currentPage}</span> of {totalPages}
                    </div>
                    <button 
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${
                        currentPage === totalPages
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        : 'bg-white text-stone-700 shadow-sm hover:shadow hover:-translate-y-0.5 border border-stone-200 hover:border-stone-300 hover:text-stone-900'
                      }`}
                    >
                      Next <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
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