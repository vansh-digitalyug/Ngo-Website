import React, { useEffect, useState } from 'react';
import { FaSpinner, FaSync, FaUser, FaCalendar, FaHeart, FaHandHoldingHeart, FaStar, FaCheckCircle } from 'react-icons/fa';

const RecentActivity = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const THEME = {
    bg: '#F8F7F5',
    surface: '#E8E6E1',
    textMain: '#2D2520',
    textMuted: '#8B8B8B',
    accent: '#6B5D49',
    accentLight: '#E0D9CC',
    border: '#DDD6CA',
  };

  const getApiUrl = () => {
    let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    baseUrl = baseUrl.replace(/\/$/, '');
    if (!baseUrl.endsWith('/api')) {
      baseUrl += '/api';
    }
    return baseUrl;
  };

  useEffect(() => {
    fetchRecentActivity();
  }, [user]);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/user/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data || []);
      } else if (response.status === 404) {
        // Endpoint doesn't exist yet, show placeholder
        setActivities([]);
      } else {
        setError('Failed to fetch recent activity');
      }
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'donation':
        return <FaHeart size={16} />;
      case 'event_registration':
        return <FaCalendar size={16} />;
      case 'volunteer_task':
      case 'task_completed':
        return <FaHandHoldingHeart size={16} />;
      case 'feedback_submitted':
        return <FaStar size={16} />;
      case 'profile_update':
      case 'document_upload':
        return <FaUser size={16} />;
      default:
        return <FaCheckCircle size={16} />;
    }
  };

  const getActivityColor = (type) => {
    const typeLabel = {
      'donation': 'Donation',
      'event_registration': 'Event',
      'volunteer_task': 'Volunteer',
      'task_completed': 'Task',
      'feedback_submitted': 'Feedback',
      'profile_update': 'Profile',
      'document_upload': 'Upload',
      'survey_completed': 'Survey',
      'kanyadan_application': 'Application',
      'community_post': 'Post',
      'verification_completed': 'Verified',
      'badge_earned': 'Badge',
      'task_created': 'Task Created',
      'login': 'Login',
    }[type] || 'Activity';

    const colors = {
      'donation': { bg: '#E8D4C8', text: '#8B5A3C' },
      'event_registration': { bg: '#D4E8E0', text: '#3C6B5A' },
      'volunteer_task': { bg: '#E0D9CC', text: '#6B5D49' },
      'task_completed': { bg: '#D9E0CC', text: '#5D6B49' },
      'feedback_submitted': { bg: '#E8D9E0', text: '#6B495D' },
      'profile_update': { bg: '#D9D9E8', text: '#495D6B' },
      'document_upload': { bg: '#E8DFCC', text: '#6B6039' },
      'survey_completed': { bg: '#CCE0D9', text: '#396B5A' },
      'kanyadan_application': { bg: '#E0CCE8', text: '#5D3D6B' },
      'community_post': { bg: '#E8CCD4', text: '#6B3C5A' },
      'verification_completed': { bg: '#CCE8D9', text: '#396B5A' },
      'badge_earned': { bg: '#E8E0CC', text: '#6B6839' },
      'task_created': { bg: '#D9E8CC', text: '#5D6B39' },
      'login': { bg: '#E0E8D9', text: '#5D6B49' },
    };

    return {
      ...colors[type] || { bg: '#E8E6E1', text: '#8B8B8B' },
      label: typeLabel,
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const mockActivities = [
    {
      id: 1,
      type: 'donation',
      title: 'Donation Made',
      description: 'You donated ₹5,000 to Support Education Initiative',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    },
    {
      id: 2,
      type: 'event_registration',
      title: 'Event Registered',
      description: 'You registered for Health Awareness Workshop',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 3,
      type: 'feedback_submitted',
      title: 'Feedback Submitted',
      description: 'You submitted feedback for Community Service Drive',
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: 4,
      type: 'volunteer_task',
      title: 'Volunteer Contribution',
      description: 'You completed a volunteer assignment',
      timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    },
    {
      id: 5,
      type: 'profile_update',
      title: 'Profile Updated',
      description: 'You updated your profile information',
      timestamp: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    },
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <div
      className="w-full min-h-screen animate-fadeIn font-sans"
      style={{ backgroundColor: THEME.bg }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Header Section */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl m-0 font-bold"
              style={{ color: THEME.textMain }}
            >
              Recent Activity
            </h1>
            <p className="text-sm mt-2" style={{ color: THEME.textMuted }}>
              Your actions and interactions with SevaIndia
            </p>
          </div>

          <button
            onClick={fetchRecentActivity}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 whitespace-nowrap border-2"
            style={{
              borderColor: THEME.accent,
              color: THEME.accent,
              backgroundColor: loading ? THEME.accentLight : 'transparent',
            }}
          >
            <FaSync className={loading ? 'animate-spin' : ''} size={14} />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-24">
            <FaSpinner
              className="inline-block animate-spin text-4xl mb-4"
              style={{ color: THEME.accent }}
            />
            <p className="text-sm font-medium" style={{ color: THEME.textMuted }}>
              Loading your activity...
            </p>
          </div>
        ) : error ? (
          <div
            className="p-6 rounded-xl text-center border-2"
            style={{ backgroundColor: THEME.surface, borderColor: THEME.border }}
          >
            <p style={{ color: THEME.textMain }} className="font-semibold">
              {error}
            </p>
          </div>
        ) : displayActivities.length > 0 ? (
          /* Timeline View */
          <div className="space-y-4">
            {displayActivities.map((activity, index) => {
              const activityColor = getActivityColor(activity.type);
              return (
                <div
                  key={activity.id || index}
                  className="relative flex gap-6 p-6 rounded-xl border-2 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: THEME.surface,
                    borderColor: THEME.border,
                  }}
                >
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center border-2 transition-all"
                      style={{
                        backgroundColor: activityColor.bg,
                        borderColor: THEME.border,
                        color: activityColor.text,
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    {/* Horizontal line below icon */}
                    <div
                      className="w-10 h-1.5 mt-3 mb-2 rounded-full"
                      style={{ backgroundColor: activityColor.bg }}
                    />
                    {/* Vertical line below horizontal line */}
                    <div
                      className="w-1.5 h-12"
                      style={{ backgroundColor: activityColor.bg }}
                    />
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 pt-1">
                    {/* Type Badge */}
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span
                        className="px-3 py-1 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: activityColor.bg,
                          color: activityColor.text,
                        }}
                      >
                        {activityColor.label}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: THEME.textMuted }}
                      >
                        {formatDate(activity.timestamp || activity.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-lg font-bold mb-1"
                      style={{ color: THEME.textMain }}
                    >
                      {activity.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: THEME.textMuted }}
                    >
                      {activity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div
            className="text-center py-20 rounded-xl border-2"
            style={{ backgroundColor: THEME.surface, borderColor: THEME.border }}
          >
            <FaUser
              className="inline-block text-5xl mb-4 opacity-30"
              style={{ color: THEME.textMain }}
            />
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: THEME.textMain }}
            >
              No Activity Yet
            </h3>
            <p className="text-sm" style={{ color: THEME.textMuted }}>
              Your activity will appear here as you interact with SevaIndia
            </p>
          </div>
        )}

        {/* Footer indicator */}
        {displayActivities.length > 0 && (
          <div className="mt-8 text-center">
            <span className="text-xs font-medium" style={{ color: THEME.textMuted }}>
              Showing {displayActivities.length} activity item{displayActivities.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;