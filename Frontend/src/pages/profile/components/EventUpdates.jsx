import React, { useEffect } from 'react';
import { 
  FaSpinner, FaSync, FaBell, FaCheckCircle, 
  FaArrowRight, FaMapMarkerAlt, FaRegClock, FaLock
} from 'react-icons/fa';

const EventUpdates = ({
  eventNotifications,
  eventNotificationsLoading,
  fetchEventNotifications,
}) => {
  useEffect(() => {
    console.log('[EventUpdates] Data received:', {
      notificationsCount: eventNotifications?.length,
      isLoading: eventNotificationsLoading,
      notifications: eventNotifications,
    });
  }, [eventNotifications, eventNotificationsLoading]);

  // Strict Original Theme Palette
  const THEME = {
    bg: '#F8F7F5',
    surface: '#E8E6E1',
    textMain: '#3D342B',
    textMuted: '#8B8B8B',
    accent: '#6B5D49',
    accentLight: '#E0D9CC',
    border: '#DDD6CA',
  };

  const getFormalType = (type) => {
    switch (type) {
      case 'EVENT_CANCELLED':
        return 'Event Cancelled';
      case 'VENUE_SHIFTED':
        return 'New Venue';
      case 'TIME_SHIFTED':
      case 'DATE_SHIFTED':
        return 'Time Updated';
      default:
        return 'Important Notice';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'EVENT_CANCELLED': return <FaBell size={10} />;
      case 'VENUE_SHIFTED': return <FaMapMarkerAlt size={10} />;
      case 'TIME_SHIFTED': 
      case 'DATE_SHIFTED': return <FaRegClock size={10} />;
      default: return <FaCheckCircle size={10} />;
    }
  };

  return (
    <div 
      className="w-full min-h-screen font-sans animate-fadeIn"
      style={{ backgroundColor: THEME.bg, color: THEME.textMain }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Institutional Header */}
        <div className="mb-16 border-b pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6" style={{ borderColor: THEME.border }}>
          <div>
            <p 
              className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-3" 
              style={{ color: THEME.accent }}
            >
              📢 SevaIndia Communications Hub
            </p>
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl m-0 font-normal"
              style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif', color: THEME.textMain }}
            >
              Event Announcements
            </h1>
            <p className="text-sm sm:text-base mt-4 max-w-2xl leading-relaxed" style={{ color: THEME.textMuted }}>
              Stay informed about important updates regarding your registered programmes. We keep you updated on schedule changes, venue modifications, and critical announcements to ensure you never miss any important information.
            </p>
          </div>
          
          <button
            onClick={fetchEventNotifications}
            disabled={eventNotificationsLoading}
            className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 whitespace-nowrap hover:bg-black/5 rounded-lg border-2"
            style={{ 
              borderColor: THEME.accent,
              color: THEME.accent,
            }}
          >
            <FaSync className={eventNotificationsLoading ? 'animate-spin' : ''} size={12} /> 
            {eventNotificationsLoading ? 'Updating' : 'Refresh'}
          </button>
        </div>

        {/* Loading State */}
        {eventNotificationsLoading ? (
          <div className="text-center py-32">
            <FaSpinner className="inline-block animate-spin text-3xl mb-6" style={{ color: THEME.accent }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: THEME.textMuted }}>
              Fetching Your Updates...
            </p>
          </div>
        ) : eventNotifications.length > 0 ? (
          
          /* Notifications Ledger List */
          <div className="flex flex-col gap-12 sm:gap-16">
            {eventNotifications.map((notif, index) => {
              const dateObj = new Date(notif.createdAt);
              const formattedDate = dateObj.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });
              
              const refId = `UPD-${dateObj.getFullYear()}-${String(index + 1).padStart(4, '0')}`;

              return (
                <div key={notif._id} className="flex flex-col md:flex-row gap-4 md:gap-12 group">
                  
                  {/* Left Column: Date & Meta */}
                  <div className="md:w-1/4 flex-shrink-0">
                    <div className="sticky top-24">
                      <p className="text-sm font-bold tracking-wider mb-2" style={{ color: THEME.textMain }}>
                        {formattedDate}
                      </p>
                      <p className="text-[10px] font-semibold tracking-wider" style={{ color: THEME.textMuted }}>
                        {refId}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Content */}
                  <div className="md:w-3/4 flex flex-col">
                    
                    {/* Badge Row */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: THEME.accentLight, color: THEME.accent }}
                      >
                        {getTypeIcon(notif.notificationType)}
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {getFormalType(notif.notificationType)}
                        </span>
                      </div>
                      
                      {!notif.isRead && (
                        <span 
                          className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg animate-pulse"
                          style={{ backgroundColor: '#E8D4C8', color: '#8B5A3C' }}
                        >
                          ⚡ Important
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 
                      className="text-2xl sm:text-3xl font-bold leading-tight mb-4"
                      style={{ color: THEME.textMain }}
                    >
                      {notif.title || getFormalType(notif.notificationType)}
                    </h3>

                    {/* Message Body */}
                    <p className="text-base leading-relaxed mb-6" style={{ color: THEME.textMain }}>
                      {notif.message}
                    </p>

                    {/* Highly Styled Details Block (Based on provided screenshot) */}
                    {(notif.details?.reason || notif.details?.oldVenue || notif.details?.oldTime) && (
                      <div 
                        className="rounded-xl p-6 mb-6 space-y-4 border-2"
                        style={{ 
                          backgroundColor: THEME.surface, 
                          borderColor: THEME.accentLight,
                          borderLeft: `6px solid ${THEME.accent}`
                        }}
                      >
                        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: THEME.accent }}>
                          📋 Important Details
                        </p>

                        {notif.details?.reason && (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: THEME.accent }}>
                              Reason for Change
                            </span>
                            <span className="text-sm leading-relaxed block" style={{ color: THEME.textMain }}>
                              {notif.details.reason}
                            </span>
                          </div>
                        )}
                        
                        {notif.details?.oldVenue && (
                          <div className={notif.details?.reason ? "pt-4 border-t" : ""} style={{ borderColor: THEME.border }}>
                            <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: THEME.accent }}>
                              📍 Venue Relocation
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <span className="line-through opacity-60 text-sm" style={{ color: THEME.textMuted }}>{notif.details.oldVenue}</span> 
                              <FaArrowRight size={12} style={{ color: THEME.accent }} className="hidden sm:block" />
                              <span className="font-semibold text-sm" style={{ color: THEME.accent }}>{notif.details.newVenue}</span>
                            </div>
                          </div>
                        )}

                        {notif.details?.oldTime && (
                          <div className={notif.details?.reason || notif.details?.oldVenue ? "pt-4 border-t" : ""} style={{ borderColor: THEME.border }}>
                            <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: THEME.accent }}>
                              ⏰ Schedule Change
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <span className="line-through opacity-60 text-sm font-mono" style={{ color: THEME.textMuted }}>{notif.details.oldTime}</span> 
                              <FaArrowRight size={12} style={{ color: THEME.accent }} className="hidden sm:block" />
                              <span className="font-semibold text-sm font-mono" style={{ color: THEME.accent }}>{notif.details.newTime}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Action */}
                    <div className="mt-4 flex items-center gap-4 pt-4 border-t" style={{ borderColor: THEME.border }}>
                      <span 
                        className="text-[9px] font-bold uppercase tracking-[0.15em] cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ color: THEME.accent }}
                      >
                        More Details →
                      </span>
                      <span 
                        className="text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{ backgroundColor: THEME.accentLight, color: THEME.accent }}
                      >
                        ✓ Official Update
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          
          /* Empty State */
          <div className="text-center py-24 border-y-2 rounded-xl" style={{ borderColor: THEME.border, backgroundColor: THEME.surface }}>
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
              style={{ backgroundColor: THEME.accentLight }}
            >
              <FaBell size={32} style={{ color: THEME.accent }} />
            </div>
            <h3 
              className="text-3xl font-normal mb-3"
              style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif', color: THEME.textMain }}
            >
              All Caught Up!
            </h3>
            <p className="text-sm" style={{ color: THEME.textMuted }}>
              No active updates for your registered events. We'll notify you as soon as there are any important changes or announcements.
            </p>
          </div>
        )}
        
        {/* Pagination/Footer Indicator */}
        {eventNotifications.length > 0 && (
          <div className="mt-20 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: THEME.border, color: THEME.textMuted }}>
            <span className="text-[10px] uppercase tracking-widest font-semibold">
              Updated {new Date().toLocaleDateString('en-IN')}
            </span>
            <span className="text-[10px] uppercase tracking-widest font-semibold">
              {eventNotifications.length} Active Update{eventNotifications.length !== 1 ? 's' : ''} • Stay Informed
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventUpdates;