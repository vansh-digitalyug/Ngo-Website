import React from 'react';
import { FaSpinner, FaSync, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import { fmtCurr, fmtD } from '../utils/helpers.jsx';

const DonorTasks = ({
  donorTasks,
  donorTasksLoading,
  fetchDonorTasks,
}) => {
  return (
    <div className="animate-fadeIn p-6">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold text-slate-900 m-0">My Donated Tasks</h2>
        <button
          onClick={fetchDonorTasks}
          disabled={donorTasksLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          <FaSync className={donorTasksLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {donorTasksLoading ? (
        <div className="text-center py-12">
          <FaSpinner className="inline-block animate-spin text-blue-600 text-2xl mb-4" />
          <p className="text-slate-600">Loading tasks...</p>
        </div>
      ) : donorTasks.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
          <FaClipboardList className="inline-block text-4xl text-slate-400 mb-4" />
          <p className="text-slate-700 font-semibold">No completed volunteer tasks yet for your donations.</p>
          <p className="text-slate-600 text-sm mt-2">When a volunteer completes work on your donation, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {donorTasks.map((task) => (
            <div key={task._id} className="bg-white rounded-xl border border-l-4 border-green-600 p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 mb-2">{task.title}</p>
                  <p className="text-xs text-slate-600 mb-1">
                    Service: <strong>{task.serviceTitle || 'General Donation'}</strong> · Donated: <strong>{fmtCurr(task.donationAmount)}</strong>
                  </p>
                  <p className="text-xs text-slate-500">
                    Volunteer: <strong>{task.volunteerName || '—'}</strong> · Completed: {fmtD(task.completedAt)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
                  <FaCheckCircle /> Completed
                </span>
              </div>

              {/* Volunteer Note */}
              {task.volunteerNote && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-900">
                    <span className="mr-2">💬</span>
                    <em>{task.volunteerNote}</em>
                  </p>
                </div>
              )}

              {/* Media */}
              {task.mediaUrl && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-700 mb-3">Proof of Work:</p>
                  {task.mediaType === 'video' ? (
                    <video
                      src={task.mediaUrl}
                      controls
                      className="max-w-full max-h-80 rounded-lg border border-slate-200"
                    />
                  ) : (
                    <img
                      src={task.mediaUrl}
                      alt="Task proof"
                      className="max-w-full max-h-80 object-cover rounded-lg border border-slate-200"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorTasks;
