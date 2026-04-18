import React, { useState, useEffect } from "react";
import { Loader2, Send, AlertTriangle, Check, ChevronDown, Bell } from "lucide-react";

export default function AdminNotificationManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notificationType, setNotificationType] = useState("EVENT_CANCELLED");
  const [formData, setFormData] = useState({
    reason: "",
    oldVenue: "",
    newVenue: "",
    oldTime: "",
    newTime: "",
    customMessage: "",
  });

  const getApiUrl = () => {
    let baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    baseUrl = baseUrl.replace(/\/$/, "");
    if (!baseUrl.endsWith("/api")) {
      baseUrl += "/api";
    }
    return baseUrl;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/events/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      }
    } catch (err) {
      setError("Failed to fetch institutional events.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setFormData({
      reason: "",
      oldVenue: "",
      newVenue: "",
      oldTime: "",
      newTime: "",
      customMessage: "",
    });
    setNotificationType("EVENT_CANCELLED");
    setSelectedEvent(null);
    setError(null);
    setSuccess(null);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();

    if (!selectedEvent) {
      setError("Please select a target event for dispatch.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("token");
      const apiUrl = getApiUrl();

      let endpoint = "";
      let payload = { eventId: selectedEvent._id };

      switch (notificationType) {
        case "EVENT_CANCELLED":
          endpoint = `${apiUrl}/notifications/admin/event-cancelled`;
          payload.reason = formData.reason;
          break;
        case "VENUE_SHIFTED":
          endpoint = `${apiUrl}/notifications/admin/venue-shifted`;
          payload.oldVenue = formData.oldVenue;
          payload.newVenue = formData.newVenue;
          payload.reason = formData.reason;
          break;
        case "TIME_SHIFTED":
          endpoint = `${apiUrl}/notifications/admin/time-shifted`;
          payload.oldTime = formData.oldTime;
          payload.newTime = formData.newTime;
          payload.reason = formData.reason;
          break;
        default:
          setError("Invalid notification classification.");
          return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || "Communiqué dispatched successfully.");
        handleClear();
        setTimeout(() => setSuccess(null), 5000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to dispatch communiqué.");
      }
    } catch (err) {
      setError(err.message || "System error during dispatch sequence.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { value: "EVENT_CANCELLED", label: "Event Cancellation" },
    { value: "VENUE_SHIFTED", label: "Venue Relocation" },
    { value: "TIME_SHIFTED", label: "Schedule Modification" },
  ];

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 min-h-screen bg-[#f5f0e8]">
      <div className="p-4 sm:p-6 lg:p-8">

        {/* ══ HEADER ══ */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl border-2 border-[#2d5a1b] flex items-center justify-center flex-shrink-0 mt-1">
              <Bell size={20} className="text-[#2d5a1b]" />
            </div>
            <div>
              <h1 className="text-[1.8rem] sm:text-[2.4rem] font-black text-gray-900 leading-tight m-0">
                Event Notifications
              </h1>
              <p className="text-sm text-gray-500 mt-1 m-0 max-w-lg leading-relaxed">
                Send important updates to registered participants. Manage cancellations, venue changes, and schedule modifications with ease.
              </p>
            </div>
          </div>
        </div>

        {/* ══ ALERTS ══ */}
        {success && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
            <Check size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-green-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* ══ FORM CARD ══ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={handleSendNotification} className="p-8 sm:p-10 lg:p-12 space-y-8">
            
            {/* ── Event Selection ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Select Event</label>
                <div className="relative">
                  <select
                    value={selectedEvent?._id || ""}
                    onChange={(e) => {
                      const event = events.find((ev) => ev._id === e.target.value);
                      setSelectedEvent(event);
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Choose an event...</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.title} ({new Date(event.date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={16} />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">{events.length} events available</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Notification Type</label>
                <div className="relative">
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm appearance-none cursor-pointer"
                  >
                    {notificationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" size={16} />
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-gray-100"></div>

            {/* ── Conditional Fields ── */}
            {notificationType === "EVENT_CANCELLED" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Cancellation Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Explain why the event is being cancelled..."
                  rows="8"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm resize-none"
                  required
                />
              </div>
            )}

            {notificationType === "VENUE_SHIFTED" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Previous Venue</label>
                    <input
                      type="text"
                      name="oldVenue"
                      value={formData.oldVenue}
                      onChange={handleInputChange}
                      placeholder="Previous venue location"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">New Venue</label>
                    <input
                      type="text"
                      name="newVenue"
                      value={formData.newVenue}
                      onChange={handleInputChange}
                      placeholder="New venue location"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Additional Details (Optional)</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Add any extra information about the venue change..."
                    rows="6"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm resize-none"
                  />
                </div>
              </div>
            )}

            {notificationType === "TIME_SHIFTED" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Previous Time</label>
                    <input
                      type="time"
                      name="oldTime"
                      value={formData.oldTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">New Time</label>
                    <input
                      type="time"
                      name="newTime"
                      value={formData.newTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Additional Details (Optional)</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Add any extra information about the time change..."
                    rows="6"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2d5a1b] transition-colors shadow-sm resize-none"
                  />
                </div>
              </div>
            )}

            {/* ── Divider ── */}
            <div className="border-t border-gray-100"></div>

            {/* ── Actions ── */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 justify-between">
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-2.5 rounded-xl bg-transparent border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Clear Form
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2d5a1b] hover:bg-[#245217] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 cursor-pointer border-0"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Notification</span>
                  </>
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}