import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Users, CheckCircle, Clock, XCircle,
  Shield, Plus, ChevronDown, ChevronUp,
} from 'lucide-react';
import communityService from '../../services/communityService';

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

const STATUS_CONFIG = {
  planned:   { color: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400', icon: Clock, label: 'Planned' },
  ongoing:   { color: 'bg-blue-100 text-blue-700', bar: 'bg-blue-400', icon: Clock, label: 'Ongoing' },
  completed: { color: 'bg-green-100 text-green-700', bar: 'bg-green-400', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-700', bar: 'bg-red-400', icon: XCircle, label: 'Cancelled' },
};

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const MyActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    communityService.getMyActivities()
      .then(res => {
        const list = res?.data?.activities ?? res?.activities ?? res?.data ?? [];
        setActivities(Array.isArray(list) ? list : []);
      })
      .catch(err => setError(err.message || 'Failed to load activities'))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-500 mb-4">Please log in to view your activities.</p>
          <Link to="/auth/login" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const filtered = filter === 'all' ? activities : activities.filter(a => a.status === filter);

  const counts = FILTER_TABS.reduce((acc, t) => {
    acc[t.value] = t.value === 'all' ? activities.length : activities.filter(a => a.status === t.value).length;
    return acc;
  }, {});

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-1">My Activities</h1>
          <p className="text-emerald-100 text-sm">Activities you've posted across all communities</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTER_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                filter === t.value
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300'
              }`}
            >
              {t.label}
              {counts[t.value] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === t.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {counts[t.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No activities found</h3>
            <p className="text-gray-400 text-sm mb-6">
              {filter === 'all'
                ? "You haven't posted any activities yet."
                : `No ${filter} activities.`}
            </p>
            <Link to="/community" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors inline-flex items-center gap-2">
              <Plus size={16} /> Browse Communities
            </Link>
          </div>
        )}

        {/* Activity cards */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map(activity => {
              const sc = STATUS_CONFIG[activity.status] || STATUS_CONFIG.planned;
              const StatusIcon = sc.icon;
              const isOpen = expanded === activity._id;

              return (
                <div key={activity._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Status bar */}
                  <div className={`h-1 ${sc.bar}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                            {TYPE_LABELS[activity.activityType] || activity.activityType}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.color}`}>
                            <StatusIcon size={11} /> {sc.label}
                          </span>
                          {activity.adminVerified && (
                            <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Shield size={11} /> Verified
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-gray-800 truncate">{activity.title}</h3>
                        {activity.communityId?.name && (
                          <p className="text-xs text-gray-400 mt-0.5">{activity.communityId.name}</p>
                        )}
                      </div>

                      {/* Toggle */}
                      <button
                        onClick={() => setExpanded(isOpen ? null : activity._id)}
                        className="text-gray-400 hover:text-gray-600 shrink-0"
                      >
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>

                    {/* Quick meta */}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-blue-500" /> {formatDate(activity.plannedDate)}
                      </span>
                      {activity.specificLocation && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-red-500" /> {activity.specificLocation}
                        </span>
                      )}
                      {(activity.volunteersCount > 0 || activity.beneficiariesCount > 0) && (
                        <span className="flex items-center gap-1">
                          <Users size={13} className="text-emerald-500" />
                          {activity.volunteersCount > 0 && `${activity.volunteersCount} volunteers`}
                          {activity.volunteersCount > 0 && activity.beneficiariesCount > 0 && ' · '}
                          {activity.beneficiariesCount > 0 && `${activity.beneficiariesCount} beneficiaries`}
                        </span>
                      )}
                    </div>

                    {/* Expanded section */}
                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        {activity.description && (
                          <p className="text-gray-600 text-sm leading-relaxed">{activity.description}</p>
                        )}
                        {activity.completionNote && (
                          <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-green-700 mb-1">Completion Note</p>
                            <p className="text-green-800 text-sm">{activity.completionNote}</p>
                          </div>
                        )}
                        {activity.adminNote && (
                          <div className="bg-blue-50 rounded-xl p-3">
                            <p className="text-xs font-semibold text-blue-700 mb-1">Admin Note</p>
                            <p className="text-blue-800 text-sm">{activity.adminNote}</p>
                          </div>
                        )}

                        <Link
                          to={`/community/${activity.communityId?._id || activity.communityId}/activities/${activity._id}`}
                          className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                        >
                          View Full Details
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivities;
