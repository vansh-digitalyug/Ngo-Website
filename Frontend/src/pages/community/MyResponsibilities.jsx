import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyResponsibilities } from '../../hooks/useCommunity';
import {
  Shield, CheckCircle, Clock, XCircle, AlertCircle,
  MapPin, Star, ChevronDown, ChevronUp, Send, ArrowLeft,
  FileText, Calendar, Loader2
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const roleColor = {
  leader:      { bg: '#ede9fe', text: '#5b21b6' },
  'co-leader': { bg: '#dbeafe', text: '#1e40af' },
  coordinator: { bg: '#e0f2fe', text: '#0369a1' },
  volunteer:   { bg: '#d1fae5', text: '#065f46' },
};

const statusConfig = {
  pending:   { bg: '#fef3c7', text: '#92400e', icon: Clock,        label: 'Pending Review' },
  active:    { bg: '#d1fae5', text: '#065f46', icon: CheckCircle,  label: 'Active' },
  revoked:   { bg: '#fee2e2', text: '#991b1b', icon: XCircle,      label: 'Revoked' },
  completed: { bg: '#dbeafe', text: '#1e40af', icon: CheckCircle,  label: 'Completed' },
};

const RoleBadge = ({ role }) => {
  const c = roleColor[role] || { bg: '#f3f4f6', text: '#374151' };
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.text }}>
      {role?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = statusConfig[status] || statusConfig.pending;
  const Icon = s.icon;
  return (
    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.text, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon size={12} /> {s.label}
    </span>
  );
};

// ── Completion Report Modal ───────────────────────────────────────────────────
const ReportModal = ({ responsibility, onClose, onSubmit, loading }) => {
  const [report, setReport] = useState('');
  const [done, setDone]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!report.trim()) return;
    await onSubmit(responsibility._id, report.trim());
    setDone(true);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="#fff" />
            <h3 style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 700 }}>Submit Completion Report</h3>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '4px 8px', color: '#fff', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {done ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={28} color="#059669" />
            </div>
            <h4 style={{ margin: '0 0 8px', color: '#111827' }}>Report Submitted!</h4>
            <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 20px' }}>Your completion report has been sent for admin review.</p>
            <button onClick={onClose} style={{ padding: '10px 28px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 24 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#166534' }}>
              <strong>Community:</strong> {responsibility.communityId?.name} · Role: {responsibility.role}
            </div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 8 }}>
              Describe what you accomplished *
            </label>
            <textarea
              value={report}
              onChange={e => setReport(e.target.value)}
              placeholder="Detail what you did, outcomes achieved, challenges faced, and impact on the community..."
              rows={6}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 10, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, outline: 'none' }}
            />
            <p style={{ margin: '4px 0 20px', fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>{report.length} characters</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !report.trim()}
                style={{ padding: '10px 22px', background: loading || !report.trim() ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading || !report.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {loading && <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />}
                <Send size={13} /> Submit Report
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Responsibility Card ───────────────────────────────────────────────────────
const ResponsibilityItem = ({ record, onSubmitReport, submitLoading }) => {
  const [expanded, setExpanded] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const community = record.communityId;
  const s = statusConfig[record.status] || statusConfig.pending;

  return (
    <>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {/* Status bar */}
        <div style={{ height: 4, background: s.text }} />

        <div style={{ padding: '16px 20px' }}>
          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>
                  {community?.name || 'Community'}
                </h3>
                <RoleBadge role={record.role} />
              </div>
              {community && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 12 }}>
                  <MapPin size={11} />
                  {community.city}, {community.state}
                  {community.verificationStatus === 'verified' && (
                    <span style={{ marginLeft: 4, color: '#059669', fontWeight: 600 }}>· ✓ Verified</span>
                  )}
                </div>
              )}
            </div>
            <StatusBadge status={record.status} />
          </div>

          {/* Dates */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, fontSize: 12, color: '#9ca3af' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={11} /> Applied: {fmt(record.createdAt)}
            </span>
            {record.startDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669' }}>
                <CheckCircle size={11} /> Started: {fmt(record.startDate)}
              </span>
            )}
            {record.endDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Ended: {fmt(record.endDate)}
              </span>
            )}
          </div>

          {/* Motivation preview */}
          {record.motivation && !expanded && (
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#6b7280', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {record.motivation}
            </p>
          )}

          {/* Admin note */}
          {record.adminNote && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#92400e', marginBottom: 10 }}>
              <strong>Admin Note:</strong> {record.adminNote}
            </div>
          )}
          {record.revokeReason && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#991b1b', marginBottom: 10 }}>
              <strong>Revoke Reason:</strong> {record.revokeReason}
            </div>
          )}
          {record.completionReport && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#166534', marginBottom: 10 }}>
              <strong>Your Report:</strong> {record.completionReport}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
            <Link
              to={`/community/${community?._id}`}
              style={{ padding: '6px 14px', background: '#eff6ff', color: '#2563eb', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
            >
              View Community
            </Link>

            {record.status === 'active' && !record.completionReport && (
              <button
                onClick={() => setShowReport(true)}
                style={{ padding: '6px 14px', background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <FileText size={12} /> Submit Report
              </button>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              style={{ marginLeft: 'auto', padding: '6px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {expanded ? <><ChevronUp size={13} /> Less</> : <><ChevronDown size={13} /> More</>}
            </button>
          </div>

          {/* Expanded detail */}
          {expanded && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
              {record.motivation && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Motivation</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>{record.motivation}</p>
                </div>
              )}
              {record.responsibilities?.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Committed Responsibilities</p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#4b5563', lineHeight: 1.8 }}>
                    {record.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showReport && (
        <ReportModal
          responsibility={record}
          onClose={() => setShowReport(false)}
          onSubmit={onSubmitReport}
          loading={submitLoading}
        />
      )}
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyResponsibilities = () => {
  const { responsibilities, loading, error, fetchMyResponsibilities, submitReport, setError } = useMyResponsibilities();
  const [filter, setFilter] = useState('all');
  const [submitLoading, setSubmitLoading] = useState(false);

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    if (isLoggedIn) fetchMyResponsibilities();
  }, []);

  const handleSubmitReport = async (id, report) => {
    setSubmitLoading(true);
    try {
      await submitReport(id, report);
    } finally {
      setSubmitLoading(false);
    }
  };

  const filtered = filter === 'all'
    ? responsibilities
    : responsibilities.filter(r => r.status === filter);

  const counts = {
    all:       responsibilities.length,
    pending:   responsibilities.filter(r => r.status === 'pending').length,
    active:    responsibilities.filter(r => r.status === 'active').length,
    completed: responsibilities.filter(r => r.status === 'completed').length,
    revoked:   responsibilities.filter(r => r.status === 'revoked').length,
  };

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Shield size={32} color="#3b82f6" />
        </div>
        <h2 style={{ margin: '0 0 8px', color: '#111827' }}>Login Required</h2>
        <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>You need to be logged in to view your responsibility applications.</p>
        <Link to="/login/user" style={{ padding: '12px 28px', background: '#3b82f6', color: '#fff', borderRadius: 12, fontWeight: 600, textDecoration: 'none' }}>
          Login
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e40af,#4f46e5)', padding: '40px 0 48px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px' }}>
          <Link to="/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 16, textDecoration: 'none' }}>
            <ArrowLeft size={15} /> Back to Communities
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={26} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#fff' }}>My Responsibility Applications</h1>
              <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Track and manage your community responsibility requests</p>
            </div>
          </div>

          {/* Summary badges */}
          {responsibilities.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
              {counts.active > 0 && (
                <span style={{ padding: '4px 12px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 20, color: '#6ee7b7', fontSize: 12, fontWeight: 600 }}>
                  ● {counts.active} Active
                </span>
              )}
              {counts.pending > 0 && (
                <span style={{ padding: '4px 12px', background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 20, color: '#fde68a', fontSize: 12, fontWeight: 600 }}>
                  ⏳ {counts.pending} Pending
                </span>
              )}
              {counts.completed > 0 && (
                <span style={{ padding: '4px 12px', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 20, color: '#bfdbfe', fontSize: 12, fontWeight: 600 }}>
                  ✓ {counts.completed} Completed
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px 60px' }}>
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#991b1b' }}>
            <AlertCircle size={15} /> {error}
            <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <Loader2 size={36} style={{ animation: 'spin 0.7s linear infinite', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ margin: 0, fontSize: 14 }}>Loading your applications...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : responsibilities.length === 0 ? (
          /* Empty state */
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', padding: '60px 32px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Shield size={36} color="#93c5fd" />
            </div>
            <h2 style={{ margin: '0 0 8px', color: '#374151', fontSize: 20, fontWeight: 700 }}>No Applications Yet</h2>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 28, lineHeight: 1.6, maxWidth: 380, margin: '0 auto 28px' }}>
              You haven't applied for any community responsibilities. Find a verified community and take responsibility!
            </p>
            <Link
              to="/community"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 28px', background: '#3b82f6', color: '#fff', borderRadius: 12, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}
            >
              <Star size={15} /> Browse Communities
            </Link>
          </div>
        ) : (
          <>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#fff', borderRadius: 12, padding: 6, border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
              {[
                { key: 'all',       label: `All (${counts.all})` },
                { key: 'pending',   label: `Pending (${counts.pending})` },
                { key: 'active',    label: `Active (${counts.active})` },
                { key: 'completed', label: `Completed (${counts.completed})` },
                { key: 'revoked',   label: `Revoked (${counts.revoked})` },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
                    background: filter === f.key ? '#3b82f6' : 'transparent',
                    color: filter === f.key ? '#fff' : '#6b7280',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                No {filter} applications found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filtered.map(r => (
                  <ResponsibilityItem
                    key={r._id}
                    record={r}
                    onSubmitReport={handleSubmitReport}
                    submitLoading={submitLoading}
                  />
                ))}
              </div>
            )}

            {/* CTA to browse more */}
            <div style={{ marginTop: 28, background: 'linear-gradient(135deg,#eff6ff,#eef2ff)', border: '1px solid #bfdbfe', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#1e40af', fontSize: 14 }}>Want to contribute to more communities?</p>
                <p style={{ margin: 0, color: '#3b82f6', fontSize: 12 }}>Browse verified communities and take on new responsibilities</p>
              </div>
              <Link to="/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#3b82f6', color: '#fff', borderRadius: 10, fontWeight: 600, textDecoration: 'none', fontSize: 13, whiteSpace: 'nowrap' }}>
                Browse Communities
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyResponsibilities;
