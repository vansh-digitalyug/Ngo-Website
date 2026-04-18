import React, { useState, useEffect } from 'react';
import { FaSpinner, FaSync, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { getApiUrl } from '../utils/helpers.jsx';

const RegisteredEvents = ({
  user,
  eventRegistrations = [],
  eventsLoading = false,
  fetchEventRegistrations = () => {},
}) => {
  const [registrations, setRegistrations] = useState(eventRegistrations);
  const [loading, setLoading] = useState(eventsLoading);

  useEffect(() => {
    setRegistrations(eventRegistrations);
    setLoading(eventsLoading);
  }, [eventRegistrations, eventsLoading]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || 'registered';
    if (statusLower.includes('registered')) return 'bg-[#5A7C5A]/10 text-[#5A7C5A]';
    if (statusLower.includes('confirmed')) return 'bg-[#5A7C5A]/10 text-[#5A7C5A]';
    if (statusLower.includes('pending')) return 'bg-[#8B8B8B]/10 text-[#8B8B8B]';
    if (statusLower.includes('cancelled')) return 'bg-red-100 text-red-700';
    if (statusLower.includes('attended')) return 'bg-[#5A7C5A]/10 text-[#5A7C5A]';
    return 'bg-[#6B5D49]/10 text-[#6B5D49]';
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || 'registered';
    if (statusLower.includes('registered') || statusLower.includes('confirmed') || statusLower.includes('attended')) return <FaCheckCircle size={12} />;
    if (statusLower.includes('cancelled')) return <FaTimesCircle size={12} />;
    return <FaClock size={12} />;
  };

  const getStatusText = (status) => {
    if (status === 'confirmed') return 'Confirmed';
    if (status === 'registered') return 'Registered';
    if (status === 'attended') return 'Attended';
    if (status === 'pending') return 'Pending';
    if (status === 'cancelled') return 'Cancelled';
    return status || 'Registered';
  };

  const upcomingEvents = registrations.filter(reg => {
    const eventDate = new Date(reg.eventId?.date || '');
    return eventDate > new Date();
  }).sort((a, b) => new Date(a.eventId?.date || 0) - new Date(b.eventId?.date || 0));

  const pastEvents = registrations.filter(reg => {
    const eventDate = new Date(reg.eventId?.date || '');
    return eventDate <= new Date();
  }).sort((a, b) => new Date(b.eventId?.date || 0) - new Date(a.eventId?.date || 0));

  return (
    <div className="animate-fadeIn min-h-screen bg-[#F8F7F5] pb-24">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-12 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-[#3D342B] tracking-tight">My Events</h1>
            <p className="text-[15px] text-[#8B8B8B] mt-1">Your registered events and volunteer opportunities.</p>
          </div>
          <button
            onClick={fetchEventRegistrations}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6B5D49] hover:bg-[#5A4E3D] text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md w-fit"
          >
            <FaSync className={loading ? 'animate-spin' : ''} size={14} /> Refresh
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Total Registrations */}
          <div className="bg-gradient-to-br from-[#8B8B8B] to-[#6B5D49] rounded-3xl p-6 md:p-8 shadow-sm border border-[#7A7A7A] text-white">
            <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-2">Total Registrations</p>
            <p className="text-3xl md:text-4xl font-extrabold">{registrations.length}</p>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gradient-to-br from-[#EBE4D5] to-[#E0D9CC] rounded-3xl p-6 md:p-8 shadow-sm border border-[#D9D1C5] text-[#3D342B]">
            <p className="text-sm font-semibold text-[#8B8B8B] uppercase tracking-wide mb-2">Upcoming Events</p>
            <p className="text-3xl md:text-4xl font-extrabold text-[#3D342B]">{upcomingEvents.length}</p>
          </div>

          {/* Completed Events */}
          <div className="bg-gradient-to-br from-[#DDD6CA] to-[#D3CCBE] rounded-3xl p-6 md:p-8 shadow-sm border border-[#D0C9BF] text-[#3D342B]">
            <p className="text-sm font-semibold text-[#8B8B8B] uppercase tracking-wide mb-2">Completed Events</p>
            <p className="text-3xl md:text-4xl font-extrabold text-[#3D342B]">{pastEvents.length}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-12">
        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E6E1] shadow-sm">
            <FaSpinner className="inline-block animate-spin text-[#6B5D49] text-3xl mb-4" />
            <p className="text-[#8B8B8B] font-medium">Loading events...</p>
          </div>
        ) : registrations.length > 0 ? (
          <div className="space-y-8">
            {/* Upcoming Events Section */}
            {upcomingEvents.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E8E6E1] shadow-sm overflow-hidden">
                <div className="bg-[#F8F7F5] px-6 md:px-8 py-6 border-b border-[#E8E6E1]">
                  <h3 className="text-lg md:text-xl font-bold text-[#3D342B]">🗓️ Upcoming Events</h3>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E8E6E1] bg-[#FCFBF8]">
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Event Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Registered On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E6E1]">
                      {upcomingEvents.map((reg) => (
                        <tr key={reg._id} className="hover:bg-[#F8F7F5] transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-[#3D342B]">
                            {reg.eventId?.title || 'Event Name'}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#3D342B] font-medium">
                            {formatDate(reg.eventId?.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6B5D49]">
                            {reg.eventId?.location || 'Location TBA'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(reg.status)}`}>
                              {getStatusIcon(reg.status)} {getStatusText(reg.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#8B8B8B] font-medium">
                            {formatDate(reg.registeredAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="md:hidden divide-y divide-[#E8E6E1]">
                  {upcomingEvents.map((reg) => (
                    <div key={reg._id} className="p-4 sm:p-6 hover:bg-[#F8F7F5] transition-colors">
                      <div className="mb-3">
                        <h4 className="text-sm font-bold text-[#3D342B] mb-2">
                          {reg.eventId?.title || 'Event Name'}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <FaCalendarAlt className="text-[#8B8B8B]" size={12} />
                          <p className="text-xs text-[#8B8B8B] font-medium">
                            {formatDate(reg.eventId?.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-[#8B8B8B]" size={12} />
                          <p className="text-xs text-[#8B8B8B] font-medium">
                            {reg.eventId?.location || 'Location TBA'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-[#E8E6E1]">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(reg.status)}`}>
                          {getStatusIcon(reg.status)} {getStatusText(reg.status)}
                        </span>
                        <p className="text-xs text-[#8B8B8B] font-medium">
                          {formatDate(reg.registeredAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Events Section */}
            {pastEvents.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E8E6E1] shadow-sm overflow-hidden">
                <div className="bg-[#F8F7F5] px-6 md:px-8 py-6 border-b border-[#E8E6E1]">
                  <h3 className="text-lg md:text-xl font-bold text-[#3D342B]">✅ Past Events</h3>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E8E6E1] bg-[#FCFBF8]">
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Event Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#8B8B8B] uppercase tracking-wider">Registered On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E6E1]">
                      {pastEvents.map((reg) => (
                        <tr key={reg._id} className="hover:bg-[#F8F7F5] transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-[#3D342B]">
                            {reg.eventId?.title || 'Event Name'}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#3D342B] font-medium">
                            {formatDate(reg.eventId?.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-[#6B5D49]">
                            {reg.eventId?.location || 'Location TBA'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(reg.status)}`}>
                              {getStatusIcon(reg.status)} {getStatusText(reg.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#8B8B8B] font-medium">
                            {formatDate(reg.registeredAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="md:hidden divide-y divide-[#E8E6E1]">
                  {pastEvents.map((reg) => (
                    <div key={reg._id} className="p-4 sm:p-6 hover:bg-[#F8F7F5] transition-colors">
                      <div className="mb-3">
                        <h4 className="text-sm font-bold text-[#3D342B] mb-2">
                          {reg.eventId?.title || 'Event Name'}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <FaCalendarAlt className="text-[#8B8B8B]" size={12} />
                          <p className="text-xs text-[#8B8B8B] font-medium">
                            {formatDate(reg.eventId?.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-[#8B8B8B]" size={12} />
                          <p className="text-xs text-[#8B8B8B] font-medium">
                            {reg.eventId?.location || 'Location TBA'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-[#E8E6E1]">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(reg.status)}`}>
                          {getStatusIcon(reg.status)} {getStatusText(reg.status)}
                        </span>
                        <p className="text-xs text-[#8B8B8B] font-medium">
                          {formatDate(reg.registeredAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E6E1] shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E8E6E1] text-[#A9A9A9] mb-6">
              <FaCalendarAlt size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#3D342B] mb-2">No Events Yet</h3>
            <p className="text-[#8B8B8B] mb-6 font-medium">You haven't registered for any events. Check out upcoming events and join us!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisteredEvents;
