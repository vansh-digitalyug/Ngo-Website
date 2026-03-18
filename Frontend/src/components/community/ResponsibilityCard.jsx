import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, UserCheck } from 'lucide-react';

const ROLE_COLORS = {
  leader:       { bg: '#ede9fe', text: '#6d28d9' },
  'co-leader':  { bg: '#dbeafe', text: '#1d4ed8' },
  coordinator:  { bg: '#cffafe', text: '#0e7490' },
  volunteer:    { bg: '#d1fae5', text: '#065f46' },
};

const STATUS_CONFIG = {
  pending:   { color: 'bg-yellow-100 text-yellow-700', icon: Clock,         label: 'Pending' },
  active:    { color: 'bg-green-100 text-green-700',   icon: CheckCircle,   label: 'Active' },
  completed: { color: 'bg-blue-100 text-blue-700',     icon: CheckCircle,   label: 'Completed' },
  revoked:   { color: 'bg-red-100 text-red-700',       icon: XCircle,       label: 'Revoked' },
};

const ResponsibilityCard = ({ responsibility }) => {
  const roleStyle = ROLE_COLORS[responsibility.role] || { bg: '#f3f4f6', text: '#374151' };
  const statusCfg = STATUS_CONFIG[responsibility.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: roleStyle.bg }}
          >
            <UserCheck size={18} style={{ color: roleStyle.text }} />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{responsibility.takenByName || '—'}</p>
            <p className="text-xs text-gray-400">
              {responsibility.takenByType === 'ngo' ? 'NGO Representative' : 'Community Member'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {/* Role badge */}
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: roleStyle.bg, color: roleStyle.text }}
          >
            {responsibility.role?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Volunteer'}
          </span>
          {/* Status badge */}
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${statusCfg.color}`}>
            <StatusIcon size={10} />
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Responsibilities list */}
      {responsibility.responsibilities?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Responsibilities</p>
          <ul className="space-y-1">
            {responsibility.responsibilities.slice(0, 3).map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                <span>{r}</span>
              </li>
            ))}
            {responsibility.responsibilities.length > 3 && (
              <li className="text-xs text-gray-400">+{responsibility.responsibilities.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Motivation */}
      {responsibility.motivation && (
        <p className="text-xs text-gray-500 italic line-clamp-2 mb-3">"{responsibility.motivation}"</p>
      )}

      {/* Dates */}
      <div className="flex gap-4 text-xs text-gray-400">
        {formatDate(responsibility.startDate) && (
          <span>Started: {formatDate(responsibility.startDate)}</span>
        )}
        {formatDate(responsibility.endDate) && (
          <span>Ends: {formatDate(responsibility.endDate)}</span>
        )}
      </div>
    </div>
  );
};

export default ResponsibilityCard;
