import React from 'react';
import { Calendar, MapPin, Users, CheckCircle, Clock, XCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const TYPE_LABELS = {
  cleanup: '🧹 Cleanup',
  medical_camp: '🏥 Medical Camp',
  education: '📚 Education',
  food_distribution: '🍱 Food Distribution',
  infrastructure: '🏗️ Infrastructure',
  awareness: '📢 Awareness',
  tree_plantation: '🌱 Tree Plantation',
  skill_development: '🛠️ Skill Development',
  sanitation: '🚿 Sanitation',
  women_empowerment: '👩 Women Empowerment',
  child_welfare: '👶 Child Welfare',
  other: '📌 Other',
};

const TYPE_COLORS = {
  cleanup: 'bg-green-100 text-green-700',
  medical_camp: 'bg-red-100 text-red-700',
  education: 'bg-blue-100 text-blue-700',
  food_distribution: 'bg-orange-100 text-orange-700',
  infrastructure: 'bg-gray-100 text-gray-700',
  awareness: 'bg-purple-100 text-purple-700',
  tree_plantation: 'bg-emerald-100 text-emerald-700',
  skill_development: 'bg-yellow-100 text-yellow-700',
  sanitation: 'bg-cyan-100 text-cyan-700',
  women_empowerment: 'bg-pink-100 text-pink-700',
  child_welfare: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-600',
};

const STATUS_CONFIG = {
  planned: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Planned' },
  ongoing: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Ongoing' },
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
};

const ActivityCard = ({ activity, communityId }) => {
  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusCfg = STATUS_CONFIG[activity.status] || STATUS_CONFIG.planned;
  const StatusIcon = statusCfg.icon;
  const typeColor = TYPE_COLORS[activity.activityType] || TYPE_COLORS.other;
  const typeLabel = TYPE_LABELS[activity.activityType] || activity.activityType;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Top color bar by status */}
      <div className={`h-1 ${activity.status === 'completed' ? 'bg-green-400' : activity.status === 'ongoing' ? 'bg-blue-400' : activity.status === 'cancelled' ? 'bg-red-400' : 'bg-yellow-400'}`} />

      <div className="p-5">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColor}`}>
            {typeLabel}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${statusCfg.color}`}>
            <StatusIcon size={11} />
            {statusCfg.label}
          </span>
          {activity.adminVerified && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 flex items-center gap-1">
              <Shield size={11} />
              Verified
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-1">{activity.title}</h3>
        {activity.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{activity.description}</p>
        )}

        {/* Meta */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} className="text-blue-500 shrink-0" />
            <span>{formatDate(activity.plannedDate)}</span>
          </div>
          {activity.specificLocation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} className="text-red-500 shrink-0" />
              <span className="line-clamp-1">{activity.specificLocation}</span>
            </div>
          )}
          {(activity.volunteersCount > 0 || activity.beneficiariesCount > 0) && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Users size={14} className="text-green-500 shrink-0" />
              {activity.volunteersCount > 0 && <span>{activity.volunteersCount} volunteers</span>}
              {activity.beneficiariesCount > 0 && <span>{activity.beneficiariesCount} beneficiaries</span>}
            </div>
          )}
        </div>

        {/* Conductor */}
        {activity.conductedByName && (
          <p className="text-xs text-gray-400 mb-3">By {activity.conductedByName}</p>
        )}

        {/* View link */}
        <Link
          to={`/community/${communityId}/activities/${activity._id}`}
          className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 rounded-lg text-sm transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ActivityCard;
