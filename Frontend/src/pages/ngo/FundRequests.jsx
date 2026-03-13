import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  IndianRupee,
  Plus,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
  FileText,
  AlertCircle,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from './NgoLayout';


const STATUS_CONFIG = {
  Pending:  { color: '#d97706', bg: '#fef3c7', icon: Clock },
  Approved: { color: '#2563eb', bg: '#dbeafe', icon: CheckCircle2 },
  Released: { color: '#16a34a', bg: '#dcfce7', icon: Banknote },
  Rejected: { color: '#dc2626', bg: '#fee2e2', icon: XCircle }
};

const PURPOSE_OPTIONS = [
  'Medical Equipment',
  'Food & Nutrition',
  'Education Materials',
  'Infrastructure Repair',
  'Disaster Relief',
  'Staff Salaries',
  'Community Event',
  'Other'
];

export default function NgoFundRequests() {
  const { ngoData } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resolving, setResolving] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [form, setForm] = useState({ amount: '', purpose: '', description: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests(1, filterStatus);
  }, [filterStatus]);

  const fetchRequests = async (page = 1, status = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (status) params.set('status', status);
      const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/funds?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data.requests);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch fund requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!form.purpose.trim()) {
      setFormError('Please select or enter a purpose.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/funds/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(form.amount),
          purpose: form.purpose.trim(),
          description: form.description.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess('Fund request submitted successfully! The admin will review it shortly.');
        setForm({ amount: '', purpose: '', description: '' });
        setShowForm(false);
        fetchRequests(1, filterStatus);
      } else {
        setFormError(data.message || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      setFormError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id) => {
    if (!window.confirm('Confirm that you have received the funds and want to close this ticket?')) return;
    setResolving(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/funds/${id}/resolve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchRequests(pagination.page, filterStatus);
      }
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    } finally {
      setResolving(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const totalPending  = requests.filter(r => r.status === 'Pending').length;
  const totalApproved = requests.filter(r => r.status === 'Approved').length;
  const totalReleased = requests.filter(r => r.status === 'Released').length;

  return (
    <div className="ngo-dashboard">
      {/* Header */}
      <header className="ngo-welcome-header">
        <div className="ngo-welcome-content">
          <div className="ngo-welcome-text">
            <h1>Fund Requests</h1>
            <p>Submit and track funding requests for your organization's needs.</p>
          </div>
          <div className="ngo-welcome-actions">
            <button className="ngo-header-btn primary" onClick={() => { setShowForm(true); setFormError(''); setFormSuccess(''); }}>
              <Plus size={18} />
              New Request
            </button>
          </div>
        </div>
      </header>

      {/* Success Banner */}
      {formSuccess && (
        <div className="fund-alert fund-alert-success">
          <CheckCircle2 size={18} />
          <span>{formSuccess}</span>
          <button onClick={() => setFormSuccess('')}><X size={16} /></button>
        </div>
      )}

      {/* Summary Stats */}
      <section className="ngo-stats-section">
        <div className="ngo-stats-row">
          <div className="ngo-stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Requests</span>
              <div className="stat-icon purple"><IndianRupee size={20} /></div>
            </div>
            <div className="stat-value">{pagination.total}</div>
            <div className="stat-footer"><span className="stat-neutral">All time</span></div>
          </div>
          <div className="ngo-stat-card">
            <div className="stat-header">
              <span className="stat-label">Pending Review</span>
              <div className="stat-icon orange"><Clock size={20} /></div>
            </div>
            <div className="stat-value">{totalPending}</div>
            <div className="stat-footer"><span className="stat-neutral">Awaiting admin</span></div>
          </div>
          <div className="ngo-stat-card">
            <div className="stat-header">
              <span className="stat-label">Approved</span>
              <div className="stat-icon blue"><CheckCircle2 size={20} /></div>
            </div>
            <div className="stat-value">{totalApproved}</div>
            <div className="stat-footer"><span className="stat-neutral">Ready for release</span></div>
          </div>
          <div className="ngo-stat-card highlight">
            <div className="stat-header">
              <span className="stat-label">Funds Released</span>
              <div className="stat-icon green"><Banknote size={20} /></div>
            </div>
            <div className="stat-value">{totalReleased}</div>
            <div className="stat-footer"><span className="stat-neutral">Received</span></div>
          </div>
        </div>
      </section>

      {/* New Request Form Modal */}
      {showForm && (
        <div className="fund-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="fund-modal" onClick={e => e.stopPropagation()}>
            <div className="fund-modal-header">
              <div className="fund-modal-title">
                <IndianRupee size={20} />
                <h3>Submit Fund Request</h3>
              </div>
              <button className="fund-modal-close" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="fund-form" onSubmit={handleSubmit}>
              {formError && (
                <div className="fund-alert fund-alert-error">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="fund-form-group">
                <label>Requested Amount (₹) <span className="required">*</span></label>
                <div className="fund-input-prefix">
                  <span className="prefix-symbol">₹</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50000"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="fund-form-group">
                <label>Purpose <span className="required">*</span></label>
                <div className="fund-select-wrap">
                  <select
                    value={PURPOSE_OPTIONS.includes(form.purpose) ? form.purpose : (form.purpose ? 'Other' : '')}
                    onChange={e => setForm({ ...form, purpose: e.target.value === 'Other' ? '' : e.target.value })}
                  >
                    <option value="">Select a purpose</option>
                    {PURPOSE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="select-chevron" />
                </div>
                {(!PURPOSE_OPTIONS.includes(form.purpose) || form.purpose === '') && (
                  <input
                    type="text"
                    placeholder="Describe the purpose..."
                    value={form.purpose}
                    onChange={e => setForm({ ...form, purpose: e.target.value })}
                    className="fund-input-text"
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>

              <div className="fund-form-group">
                <label>Additional Description <span className="optional">(optional)</span></label>
                <textarea
                  rows={4}
                  placeholder="Provide more details about why this funding is needed, how it will be used, and expected impact..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="fund-form-info">
                <AlertCircle size={14} />
                <p>Your request will be reviewed by the admin team. You'll be notified once a decision is made.</p>
              </div>

              <div className="fund-form-actions">
                <button type="button" className="fund-btn-secondary" onClick={() => setShowForm(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="fund-btn-primary" disabled={submitting}>
                  {submitting ? (
                    <><RefreshCw size={16} className="spin" /> Submitting...</>
                  ) : (
                    <><IndianRupee size={16} /> Submit Request</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests List */}
      <section className="ngo-section">
        <div className="ngo-section-header">
          <h2>My Fund Requests</h2>
          <div className="fund-filter-wrap">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="fund-filter-select"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Released">Released</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ChevronDown size={14} className="filter-chevron" />
          </div>
        </div>

        {loading ? (
          <div className="fund-loading">
            <div className="ngo-loading-spinner" style={{ width: 32, height: 32 }}></div>
            <p>Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="ngo-empty-state">
            <IndianRupee size={48} strokeWidth={1.5} />
            <h4>No fund requests yet</h4>
            <p>Submit your first fund request by clicking the "New Request" button above.</p>
          </div>
        ) : (
          <div className="fund-requests-list">
            {requests.map(req => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending;
              const StatusIcon = cfg.icon;
              return (
                <div key={req._id} className={`fund-request-card ${req.isResolved ? 'resolved' : ''}`}>
                  <div className="fund-request-top">
                    <div className="fund-request-amount">
                      <IndianRupee size={18} />
                      <span>₹{Number(req.amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="fund-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                      <StatusIcon size={13} />
                      {req.isResolved ? 'Resolved' : req.status}
                    </div>
                  </div>

                  <div className="fund-request-purpose">
                    <FileText size={14} />
                    <strong>{req.purpose}</strong>
                  </div>

                  {req.description && (
                    <p className="fund-request-desc">{req.description}</p>
                  )}

                  {req.adminNote && (
                    <div className="fund-admin-note">
                      <AlertCircle size={14} />
                      <span><strong>Admin note:</strong> {req.adminNote}</span>
                    </div>
                  )}

                  <div className="fund-request-footer">
                    <span className="fund-request-date">Submitted: {formatDate(req.createdAt)}</span>
                    {req.releasedAt && (
                      <span className="fund-request-date">Released: {formatDate(req.releasedAt)}</span>
                    )}
                    {req.status === 'Released' && !req.isResolved && (
                      <button
                        className="fund-resolve-btn"
                        onClick={() => handleResolve(req._id)}
                        disabled={resolving === req._id}
                      >
                        {resolving === req._id ? (
                          <><RefreshCw size={14} className="spin" /> Resolving...</>
                        ) : (
                          <><CheckCircle2 size={14} /> Mark as Received</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="fund-pagination">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`fund-page-btn ${pagination.page === page ? 'active' : ''}`}
                onClick={() => fetchRequests(page, filterStatus)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
