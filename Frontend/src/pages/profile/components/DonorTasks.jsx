import React from 'react';
import { 
  FaSpinner, 
  FaSync, 
  FaClipboardList, 
  FaCheckCircle, 
  FaCommentAlt, 
  FaRegCheckCircle 
} from 'react-icons/fa';
import { fmtCurr, fmtD } from '../utils/helpers.jsx';

const DonorTasks = ({
  donorTasks,
  donorTasksLoading,
  fetchDonorTasks,
}) => {
  // Calculate total impact for the footer
  const totalImpact = donorTasks.reduce((total, task) => total + (task.donationAmount || 0), 0);

  return (
    // Main wrapper with a subtle beige background to match the theme
    <div className="min-h-screen bg-[#faf8f6] p-4 md:p-8 lg:p-12 font-sans text-gray-800 animate-fadeIn">
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#6d4c41] mb-2">My Donated Tasks</h2>
            <p className="text-sm text-gray-500 font-medium">
              Showing {donorTasks.length} completed historical records <span className="mx-2">•</span> <span className="text-[#8d6e63]">FY 2025-26</span>
            </p>
          </div>
          <button
            onClick={fetchDonorTasks}
            disabled={donorTasksLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <FaSync className={`${donorTasksLoading ? 'animate-spin' : ''} text-sm`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto">
        {donorTasksLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-[#8d6e63] text-4xl mb-4" />
            <p className="text-gray-500 font-medium">Loading archival records...</p>
          </div>
        ) : donorTasks.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <FaClipboardList className="inline-block text-5xl text-gray-300 mb-4" />
            <p className="text-xl text-gray-700 font-medium">No completed historical records yet.</p>
            <p className="text-gray-500 text-sm mt-2">Completed volunteer tasks associated with your donations will appear here.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {donorTasks.map((task, index) => {
              // Alternating layout logic for desktop
              const isEven = index % 2 === 0;

              return (
                <div 
                  key={task._id} 
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-md duration-300`}
                >
                  
                  {/* Media Section (Image/Video) */}
                  <div className="relative w-full lg:w-[45%] min-h-[300px] lg:min-h-[450px] bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {task.mediaUrl ? (
                      task.mediaType === 'video' ? (
                        <video
                          src={task.mediaUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={task.mediaUrl}
                          alt="Task proof"
                          className="w-full h-full object-contain p-4"
                        />
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FaClipboardList size={48} className="mb-3 opacity-40" />
                        <span className="text-sm font-medium">No Media Available</span>
                      </div>
                    )}
                    
                    {/* Floating Proof of Work Badge */}
                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                      <FaRegCheckCircle className="text-[#8d6e63] text-xs" />
                      <span className="text-[10px] font-bold tracking-widest text-[#6d4c41] uppercase">Proof of Work</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="w-full lg:w-[55%] p-6 md:p-10 flex flex-col justify-center">
                    
                    {/* Top Labels */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Service Name</span>
                      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Completed
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8 leading-snug">
                      {task.serviceTitle || task.title || 'General Donation Support'}
                    </h3>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 border-t border-gray-100 pt-8">
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Donated Amount</p>
                        <p className="text-xl font-bold text-[#8d6e63]">{fmtCurr(task.donationAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Volunteer Name</p>
                        <p className="text-base font-medium text-gray-800">{task.volunteerName || '—'}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Completion Date</p>
                        <p className="text-base font-medium text-gray-800">{task.completedAt ? fmtD(task.completedAt) : '—'}</p>
                      </div>
                    </div>

                    {/* Volunteer Note / Feedback */}
                    {task.volunteerNote && (
                      <div className="bg-[#fcfaf8] p-5 rounded-xl border border-[#f0ebe1]">
                        <div className="flex items-center gap-2 mb-2">
                          <FaCommentAlt className="text-[#8d6e63] text-[10px]" />
                          <span className="text-[10px] font-bold tracking-widest text-[#8d6e63] uppercase">Feedback Note</span>
                        </div>
                        <p className="text-sm text-gray-600 italic leading-relaxed">
                          "{task.volunteerNote}"
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Footer & Pagination Summary */}
        {!donorTasksLoading && donorTasks.length > 0 && (
          <div className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-gray-200 pt-8 gap-6">
            <p className="text-sm text-gray-600 font-medium">
              Total Impact Contributed: <span className="font-bold text-[#8d6e63] text-base">{fmtCurr(totalImpact)}</span>
            </p>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#6d4c41] text-white text-sm font-medium rounded-lg hover:bg-[#5d4037] transition-colors shadow-sm">
                Next Page
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default DonorTasks;