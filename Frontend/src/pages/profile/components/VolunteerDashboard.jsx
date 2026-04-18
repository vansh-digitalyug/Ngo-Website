import React from 'react';
import { FaUser, FaHandHoldingHeart, FaMapMarkerAlt, FaClock, FaStar, FaHeart, FaCheckCircle, FaClipboardList, FaSpinner, FaSync } from 'react-icons/fa';

const VolunteerDashboard = ({
  volunteerData,
  visibleAvatar,
  userInitial,
  user,
  volunteerTasks,
  volunteerTasksLoading,
  fetchVolunteerTasks,
}) => {
  if (!volunteerData) return null;

  const joinedDate = volunteerData.createdAt
    ? new Date(volunteerData.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const dobFmt = volunteerData.dob
    ? new Date(volunteerData.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="animate-fadeIn p-6">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">Volunteer Dashboard</h2>

      {/* Hero Card */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Avatar and Badge */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-white flex items-center justify-center text-3xl font-bold text-slate-700 overflow-hidden shadow-md border-2 border-green-200">
              {visibleAvatar ? <img src={visibleAvatar} alt="Profile" className="w-full h-full object-cover" /> : userInitial}
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold text-white max-w-fit ${
                volunteerData.status === 'Approved' ? 'bg-green-500' :
                volunteerData.status === 'Pending' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                {volunteerData.status}
              </span>
              <span className="inline-flex items-center gap-1 bg-white text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold max-w-fit border border-slate-200">
                <FaHandHoldingHeart size={12} /> Volunteer
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">{volunteerData.fullName || user.name}</h2>
            <p className="text-slate-600 text-sm mb-4 flex items-center gap-2">
              <FaClock size={14} /> Member since {joinedDate}
            </p>

            {volunteerData.city && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200">
                <FaMapMarkerAlt className="text-green-600" size={18} />
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Location</p>
                  <p className="text-sm font-semibold text-slate-900">{volunteerData.city}{volunteerData.state ? `, ${volunteerData.state}` : ''}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Personal Details */}
        <InfoCard icon={<FaUser />} title="Personal Details">
          <InfoRow label="Full Name" value={volunteerData.fullName} />
          <InfoRow label="Email" value={volunteerData.email} />
          <InfoRow label="Phone" value={volunteerData.phone} />
          <InfoRow label="Date of Birth" value={dobFmt} />
          <InfoRow label="Occupation" value={volunteerData.occupation || '—'} />
          <InfoRow label="Education" value={volunteerData.education || '—'} />
        </InfoCard>

        {/* Volunteer Details */}
        <InfoCard icon={<FaHandHoldingHeart />} title="Volunteer Details">
          <InfoRow label="Mode" value={volunteerData.mode || '—'} />
          <InfoRow label="Availability" value={volunteerData.availability || '—'} />
          <InfoRow label="Skills" value={volunteerData.skills || '—'} />
          <div className="py-2 border-b border-slate-200 last:border-b-0">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">ID Verified</p>
            <p className={`text-sm font-medium flex items-center gap-2 ${volunteerData.idVerified ? 'text-green-700' : 'text-slate-600'}`}>
              {volunteerData.idVerified ? <><FaCheckCircle /> Verified</> : 'Not Verified'}
            </p>
          </div>
          <InfoRow label="ID Type" value={volunteerData.idType || '—'} />
        </InfoCard>
      </div>

      {/* Interests */}
      {volunteerData.interests?.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaStar className="text-yellow-500" size={20} />
              <h3 className="text-lg font-bold text-slate-900">Areas of Interest</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {volunteerData.interests.map((tag, i) => (
                <span key={i} className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Motivation */}
      {volunteerData.motivation && (
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaHeart className="text-red-500" size={20} />
              <h3 className="text-lg font-bold text-slate-900">Motivation</h3>
            </div>
            <p className="text-slate-700 italic text-sm">"{volunteerData.motivation}"</p>
          </div>
        </div>
      )}

      {/* Assigned Tasks */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FaClipboardList className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-slate-900">My Assigned Tasks</h3>
          </div>
          <button
            onClick={fetchVolunteerTasks}
            disabled={volunteerTasksLoading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <FaSync className={volunteerTasksLoading ? 'animate-spin' : ''} size={12} /> Refresh
          </button>
        </div>

        {volunteerTasksLoading ? (
          <div className="text-center py-12">
            <FaSpinner className="inline-block animate-spin text-blue-600 text-2xl mb-4" />
            <p className="text-slate-600">Loading tasks...</p>
          </div>
        ) : volunteerTasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <FaClipboardList className="inline-block text-3xl text-slate-400 mb-3" />
            <p className="text-slate-600">No tasks assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {volunteerTasks.map((task) => {
              const statusColor = {
                assigned: '#f59e0b',
                in_progress: '#3b82f6',
                completed: '#22c55e'
              }[task.status] || '#9ca3af';
              const statusLabel = {
                assigned: 'Assigned',
                in_progress: 'In Progress',
                completed: 'Completed'
              }[task.status] || task.status;

              return (
                <div key={task._id} className="border border-l-4 rounded-lg p-4" style={{ borderLeftColor: statusColor }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 mb-1">{task.title}</p>
                      <p className="text-xs text-slate-600">
                        Service: <strong>{task.serviceTitle || '—'}</strong> · Donor: <strong>{task.donorName || '—'}</strong>
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: statusColor }}>
                      {statusLabel}
                    </span>
                  </div>
                  {task.description && <p className="text-sm text-slate-700 mb-2">{task.description}</p>}
                  {task.completedAt && (
                    <p className="text-xs text-slate-500">
                      Completed: {new Date(task.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
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

const InfoCard = ({ icon, title, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
    <div className="flex items-center gap-3 mb-6">
      <span className="text-blue-600">{icon}</span>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="py-2 border-b border-slate-200 last:border-b-0">
    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{label}</p>
    <p className="text-sm font-medium text-slate-900">{value}</p>
  </div>
);

export default VolunteerDashboard;
