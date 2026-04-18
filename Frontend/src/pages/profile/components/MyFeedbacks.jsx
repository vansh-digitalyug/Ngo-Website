import React from 'react';
import { FaSpinner, FaSync, FaHistory, FaPlus } from 'react-icons/fa';
// Assuming fmtDate is imported from your helpers
import { fmtDate } from '../utils/helpers.jsx'; 

const MyFeedbacks = ({
  myFeedbacks,
  feedbacksLoading,
  fetchMyFeedbacks,
}) => {
  // Theme palette: Grey-Beige-Brown matching the profile design system
  const THEME = {
    grey: '#8B8B8B',
    brown: '#6B5D49',
    beige: '#E8E6E1',
    lightBeige: '#E0D9CC',
    veryLightBeige: '#DDD6CA',
    dark: '#2D2520',
    white: '#FFFFFF',
    bg: '#FAFBF9',
    card: '#FFFFFF',
    primaryText: '#2D2520',
    secondaryText: '#8B8B8B',
    borderLight: '#E8E6E1',
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return { bg: `${THEME.beige}40`, text: THEME.brown, border: THEME.beige };
      case 'in progress':
        return { bg: `${THEME.lightBeige}40`, text: THEME.brown, border: THEME.lightBeige };
      case 'under review':
        return { bg: `${THEME.veryLightBeige}60`, text: THEME.dark, border: THEME.veryLightBeige };
      case 'pending':
      default:
        return { bg: `${THEME.beige}30`, text: THEME.grey, border: THEME.beige };
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 transition-all duration-300" style={{ backgroundColor: THEME.bg }}>
      
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 
              className="text-4xl md:text-5xl font-medium mb-4" 
              style={{ color: THEME.brown, fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              My Feedback
            </h1>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: THEME.secondaryText }}>
              Your records of correspondence and NGO responses. <br className="hidden md:block"/>
              Each entry is preserved for transparency and progress tracking.
            </p>
          </div>
          
          {/* Action Button (Styled like the "Submit New Feedback" in your image) */}
          <button
            onClick={fetchMyFeedbacks}
            disabled={feedbacksLoading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded text-sm font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: THEME.beige,
              color: THEME.brown,
              border: `2px solid ${THEME.brown}`,
              opacity: feedbacksLoading ? 0.7 : 1,
              cursor: feedbacksLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {feedbacksLoading ? (
              <FaSpinner className="animate-spin" size={14} />
            ) : (
              <FaSync size={14} />
            )}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto">
        {feedbacksLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-3xl mb-4" style={{ color: THEME.brown }} />
            <p className="text-sm uppercase tracking-widest font-semibold" style={{ color: THEME.grey }}>Loading feedback...</p>
          </div>
        ) : myFeedbacks.length === 0 ? (
          <div className="rounded-xl p-12 text-center shadow-sm" style={{ backgroundColor: THEME.white, border: `2px solid ${THEME.beige}` }}>
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-medium mb-2" style={{ color: THEME.dark, fontFamily: 'Georgia, serif' }}>
              No Feedback Yet
            </h3>
            <p className="text-sm" style={{ color: THEME.secondaryText }}>
              There are no feedback records to display.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {myFeedbacks.map((fb) => {
              const hasReply = !!fb.adminReply;

              return (
                <div
                  key={fb._id}
                  className="rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 md:p-8"
                  style={{ backgroundColor: THEME.white, border: `2px solid ${THEME.beige}` }}
                >
                  {/* Card Header */}
                  <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-start gap-4 mb-6">
                    <div>
                      <h2 
                        className="text-xl md:text-2xl font-medium mb-1" 
                        style={{ color: THEME.dark, fontFamily: 'Georgia, "Times New Roman", serif' }}
                      >
                        {fb.subject}
                      </h2>
                      <p className="text-xs" style={{ color: THEME.secondaryText }}>
                        Submitted: {fmtDate(fb.createdAt)}
                      </p>
                    </div>

                    <div className="self-start">
                      <span
                        className="inline-block px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded"
                        style={{
                          backgroundColor: getStatusStyle(fb.status).bg,
                          color: getStatusStyle(fb.status).text,
                          border: `1px solid ${getStatusStyle(fb.status).border}`,
                        }}
                      >
                        {fb.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Your Correspondence Block */}
                  <div 
                    className="p-5 md:p-6 mb-6 rounded-lg"
                    style={{ backgroundColor: `${THEME.beige}20`, border: `1px solid ${THEME.beige}` }}
                  >
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3" style={{ color: THEME.brown }}>
                      Your Feedback
                    </p>
                    <p className="text-sm md:text-base leading-relaxed" style={{ color: THEME.dark }}>
                      {fb.message}
                    </p>
                  </div>

                  {/* NGO Response Block */}
                  {hasReply ? (
                    <div className="flex items-start gap-4 pl-1 md:pl-2">
                      <div 
                        className="mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: THEME.brown }}
                      >
                        <FaPlus className="text-white text-[10px]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3" style={{ color: THEME.brown }}>
                          SevaIndia Response
                        </p>
                        <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: THEME.dark }}>
                          {fb.adminReply}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[10px] gap-2" style={{ color: THEME.secondaryText }}>
                          <span>SevaIndia Team</span>
                          <span>Response logged: {fmtDate(fb.repliedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="mt-2 py-6 rounded-lg border border-dashed flex flex-col items-center justify-center text-center gap-2"
                      style={{ borderColor: THEME.beige, backgroundColor: `${THEME.beige}10` }}
                    >
                      <FaHistory className="text-lg" style={{ color: THEME.grey }} />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest" style={{ color: THEME.grey }}>
                        Awaiting NGO Review
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}


      </div>
    </div>
  );
};

export default MyFeedbacks;