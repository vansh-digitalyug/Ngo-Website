import React from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner, FaSync, FaRegFileAlt, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { incomeLabel } from '../utils/helpers.jsx';

// Internal Thematic Status Badge to strictly enforce the 3-color palette
const ArchivalStatusBadge = ({ status }) => {
  let icon;
  
  switch (status?.toLowerCase()) {
    case 'approved':
      icon = <FaCheckCircle size={10} />;
      break;
    case 'rejected':
      icon = <FaTimesCircle size={10} />;
      break;
    default:
      icon = <FaClock size={10} />;
      break;
  }

  return (
    <div className="flex flex-col items-end">
      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1">
        Current Verification
      </span>
      <div 
        className="flex items-center gap-2 px-3 py-1.5 border"
        style={{ 
          backgroundColor: '#EAE6DF', // Darker Beige
          borderColor: '#DCD6CC',
          color: '#5C4134' // Archival Brown
        }}
      >
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
          {status || 'Under Review'}
        </span>
      </div>
    </div>
  );
};

const Kanyadan = ({
  kanyadanApps,
  kanyadanLoading,
  fetchKanyadan,
}) => {
  // Strict Archival 3-Color Palette
  const THEME = {
    bg: '#F5F4F0', // Light Beige background
    surface: '#EFECE6', // Slightly darker beige for cards/boxes
    textMain: '#2C2C2C', // Dark Grey/Black for main text
    textMuted: '#6B7280', // Grey for secondary text
    accent: '#5C4134', // Archival Brown
    border: '#DCD6CC', // Muted beige-grey border
  };

  return (
    <div 
      className="w-full min-h-screen animate-fadeIn font-sans pb-20"
      style={{ backgroundColor: THEME.bg }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 border-b pb-6" style={{ borderColor: THEME.border }}>
          <div>
            <p 
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
              style={{ color: THEME.textMuted }}
            >
              Registry & Welfare Records
            </p>
            <h2 
              className="text-4xl md:text-5xl m-0 font-normal leading-tight"
              style={{ color: THEME.accent, fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Kanyadan Status
            </h2>
          </div>

          <button
            onClick={fetchKanyadan}
            disabled={kanyadanLoading}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-all disabled:opacity-50 border hover:opacity-70"
            style={{
              borderColor: THEME.accent,
              color: THEME.accent,
              backgroundColor: 'transparent',
            }}
          >
            <FaSync className={kanyadanLoading ? 'animate-spin' : ''} size={10} />
            Refresh Ledger
          </button>
        </div>

        {/* Content Area */}
        {kanyadanLoading ? (
          <div className="text-center py-24 flex flex-col items-center">
            <FaSpinner
              className="animate-spin text-3xl mb-4"
              style={{ color: THEME.accent }}
            />
            <p className="text-[11px] uppercase tracking-[0.1em]" style={{ color: THEME.textMuted }}>
              Retrieving Archival Records...
            </p>
          </div>
        ) : kanyadanApps?.length === 0 ? (
          /* Empty State */
          <div 
            className="text-center py-24 border"
            style={{ backgroundColor: THEME.surface, borderColor: THEME.border }}
          >
            <FaRegFileAlt className="inline-block text-4xl mb-4 opacity-40" style={{ color: THEME.accent }} />
            <h3 
              className="text-2xl mb-3"
              style={{ color: THEME.accent, fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              No Application Found
            </h3>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: THEME.textMuted }}>
              There is currently no Kanyadan enrollment on record for this profile. Please initiate a formal application to enroll in the programme.
            </p>
            <Link 
              to="/services/welfare/kanyadan" 
              className="inline-block px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
              style={{ backgroundColor: THEME.accent, color: THEME.bg }}
            >
              Initiate Application
            </Link>
          </div>
        ) : (
          /* Applications List */
          <div className="space-y-12">
            {kanyadanApps.map((app) => (
              <div key={app._id} className="relative">
                
                {/* Record Metadata & Status Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1">
                      Date of Application
                    </p>
                    <p className="text-lg" style={{ color: THEME.textMain, fontFamily: 'Georgia, "Times New Roman", serif' }}>
                      {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <ArchivalStatusBadge status={app.status} />
                </div>

                {/* Main Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  
                  {/* Identity Profile (Girl) */}
                  <div 
                    className="p-6 md:p-8 border"
                    style={{ backgroundColor: THEME.surface, borderColor: THEME.border }}
                  >
                    <h4 
                      className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 pb-2 border-b"
                      style={{ color: THEME.accent, borderColor: THEME.border }}
                    >
                      Identity Profile
                    </h4>
                    <div className="space-y-5">
                      <DetailRow label="Full Legal Name" value={app.girlName} />
                      <DetailRow label="Recorded Age" value={`${app.girlAge} year${app.girlAge !== 1 ? 's' : ''}`} />
                    </div>
                  </div>

                  {/* Guardian Particulars */}
                  <div 
                    className="p-6 md:p-8 border"
                    style={{ backgroundColor: THEME.surface, borderColor: THEME.border }}
                  >
                    <h4 
                      className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 pb-2 border-b"
                      style={{ color: THEME.accent, borderColor: THEME.border }}
                    >
                      Guardian Particulars
                    </h4>
                    <div className="space-y-5">
                      <DetailRow label="Primary Guardian" value={app.guardianName} />
                      <DetailRow label="Declared Annual Income" value={incomeLabel(app.annualIncome)} />
                    </div>
                  </div>

                  {/* Geographic Residency (Spans full width on mobile, 1 col on desktop if needed, or structured alongside) */}
                  <div 
                    className="p-6 md:p-8 border md:col-span-2 lg:col-span-1"
                    style={{ backgroundColor: THEME.surface, borderColor: THEME.border }}
                  >
                    <h4 
                      className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 pb-2 border-b"
                      style={{ color: THEME.accent, borderColor: THEME.border }}
                    >
                      Geographic Residency
                    </h4>
                    <div className="space-y-5">
                      <DetailRow label="District / Region" value={app.district} />
                      <DetailRow label="State Jurisdiction" value={app.state} />
                    </div>
                  </div>

                  {/* Institutional Note (Admin Note) */}
                  <div 
                    className="p-6 md:p-8 border md:col-span-2 lg:col-span-1"
                    style={{ backgroundColor: THEME.bg, borderColor: THEME.border }}
                  >
                    <h4 
                      className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 pb-2 border-b"
                      style={{ color: THEME.textMuted, borderColor: THEME.border }}
                    >
                      Archival Response Log
                    </h4>
                    {app.adminNote ? (
                      <p className="text-sm italic leading-relaxed" style={{ color: THEME.textMain }}>
                        "{app.adminNote}"
                      </p>
                    ) : (
                      <p className="text-[11px] uppercase tracking-[0.1em] italic opacity-50" style={{ color: THEME.textMuted }}>
                        No institutional remarks recorded at this time.
                      </p>
                    )}
                  </div>

                </div>

                {/* Bottom Separator for multiple applications */}
                <div className="w-16 h-px mx-auto mt-12" style={{ backgroundColor: THEME.border }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Internal Helper for displaying key-value pairs elegantly
const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: '#8B8B8B' }}>
      {label}
    </p>
    <p className="text-[15px]" style={{ color: '#2C2C2C', fontFamily: 'Georgia, "Times New Roman", serif' }}>
      {value || '—'}
    </p>
  </div>
);

export default Kanyadan;