import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Clock, CheckCircle, Check, X, Hand, Lightbulb, Mail, Phone, Calendar, AlertCircle, UserCheck, UserX, UserPlus } from 'lucide-react';
import { API_BASE_URL } from './NgoLayout';
import './ngo.css';

export default function NgoVolunteers() {
  const { ngoData } = useOutletContext();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ fullName: '', email: '', phone: '', role: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/volunteers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const raw = data.data || data.volunteers || [];
        setVolunteers(raw.map(v => ({
          ...v,
          name: v.fullName || v.name || v.user?.name || '',
          status: (v.status || '').toLowerCase()
        })));
      }
    } catch (err) {
      console.error('Failed to fetch volunteers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVolunteer = async (e) => {
    e.preventDefault();
    if (!addForm.fullName.trim() || !addForm.email.trim()) return;
    setAddLoading(true);
    setAddError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/volunteers/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(addForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.message || 'Failed to add volunteer');
        return;
      }
      const added = data.data;
      setVolunteers(prev => [{
        _id: added._id,
        name: added.fullName,
        email: added.email,
        phone: added.phone !== 'N/A' ? added.phone : '',
        status: 'approved',
        createdAt: added.createdAt || new Date().toISOString()
      }, ...prev]);
      setMessage({ type: 'success', text: `${added.fullName} added as volunteer!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      setShowAddModal(false);
      setAddForm({ fullName: '', email: '', phone: '', role: '' });
    } catch {
      setAddError('Something went wrong. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleStatusUpdate = async (volunteerId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/volunteers/${volunteerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) })
      });

      if (res.ok) {
        setVolunteers(prev =>
          prev.map(v =>
            v._id === volunteerId ? { ...v, status: newStatus.toLowerCase() } : v
          )
        );
        setMessage({ 
          type: 'success', 
          text: `Volunteer ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully!` 
        });
        
        // Auto-hide message after 3s
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Failed to update status' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredVolunteers = volunteers.filter(v => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  const stats = {
    total: volunteers.length,
    pending: volunteers.filter(v => v.status === 'pending').length,
    approved: volunteers.filter(v => v.status === 'approved').length,
    rejected: volunteers.filter(v => v.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="ngo-loading-screen">
        <div className="ngo-loading-spinner"></div>
        <p>Loading volunteers...</p>
      </div>
    );
  }

  return (
    <div className="ngo-volunteers-page">
      {/* Page Header */}
      <div className="ngo-page-header">
        <div className="page-header-content">
          <h1>Volunteer Management</h1>
          <p>Review applications and manage your volunteer team</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {stats.pending > 0 && (
            <div className="header-badge attention">
              <Clock size={14} /> {stats.pending} pending review
            </div>
          )}
          <button
            className="ngo-btn ngo-btn-primary"
            onClick={() => { setShowAddModal(true); setAddError(''); setAddForm({ fullName: '', email: '', phone: '', role: '' }); }}
          >
            <UserPlus size={16} /> Add Volunteer
          </button>
        </div>
      </div>

      {/* Add Volunteer Modal */}
      {showAddModal && (
        <div className="ngo-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="ngo-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                  <UserPlus size={20} color="#fff" />
                </div>
                <h2>Add Volunteer</h2>
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <p className="modal-subtitle">Add a volunteer directly — no registration needed.</p>
            <form onSubmit={handleAddVolunteer}>
              {[
                { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'e.g. Rahul Sharma', required: true },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'volunteer@example.com', required: true },
                { label: 'Phone', key: 'phone', type: 'tel', placeholder: '10-digit mobile number', required: false },
                { label: 'Role / Designation', key: 'role', type: 'text', placeholder: 'e.g. Field Coordinator, Event Helper...', required: false }
              ].map(({ label, key, type, placeholder, required }) => (
                <div key={key} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>
                    {label} {required ? <span style={{ color: '#ef4444' }}>*</span> : <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>}
                  </label>
                  <input
                    type={type}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    placeholder={placeholder}
                    value={addForm[key]}
                    onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))}
                    required={required}
                    autoFocus={key === 'fullName'}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    maxLength={key === 'role' ? 60 : undefined}
                  />
                </div>
              ))}
              {addError && (
                <div className="ngo-alert error" style={{ marginBottom: '12px' }}>
                  <AlertCircle size={16} />
                  <span>{addError}</span>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="ngo-btn-secondary ngo-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="ngo-btn-primary ngo-btn" disabled={addLoading || !addForm.fullName.trim() || !addForm.email.trim()}>
                  {addLoading ? 'Adding...' : <><UserPlus size={15} /> Add Volunteer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Message */}
      {message.text && (
        <div className={`ngo-alert ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="alert-close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="volunteer-stats-row">
        <div className="volunteer-stat-card">
          <div className="stat-icon purple"><Users size={20} /></div>
          <div className="stat-content">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>
        <div className="volunteer-stat-card">
          <div className="stat-icon orange"><Clock size={20} /></div>
          <div className="stat-content">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>
        <div className="volunteer-stat-card highlight">
          <div className="stat-icon green"><UserCheck size={20} /></div>
          <div className="stat-content">
            <span className="stat-number">{stats.approved}</span>
            <span className="stat-label">Active Volunteers</span>
          </div>
        </div>
      </div>

      {/* Volunteers List */}
      <div className="ngo-section">
        <div className="ngo-section-header">
          <h2>Applications</h2>
          <div className="filter-tabs">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && stats.pending > 0 && (
                  <span className="filter-badge">{stats.pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="ngo-section-body">
          {filteredVolunteers.length > 0 ? (
            <div className="volunteers-list">
              {filteredVolunteers.map((volunteer) => (
                <div key={volunteer._id} className="volunteer-card">
                  <div className="volunteer-avatar">
                    {getInitials(volunteer.name)}
                  </div>
                  <div className="volunteer-info">
                    <h4>{volunteer.name || 'Anonymous'}</h4>
                    <div className="volunteer-meta">
                      <span><Mail size={12} /> {volunteer.email}</span>
                      {volunteer.phone && <span><Phone size={12} /> {volunteer.phone}</span>}
                      <span><Calendar size={12} /> {formatDate(volunteer.createdAt)}</span>
                    </div>
                  </div>
                  <div className="volunteer-actions">
                    {volunteer.status === 'pending' ? (
                      <>
                        <button
                          className="action-btn approve"
                          onClick={() => handleStatusUpdate(volunteer._id, 'approved')}
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => handleStatusUpdate(volunteer._id, 'rejected')}
                        >
                          <X size={16} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`status-pill ${volunteer.status}`}>
                        {volunteer.status === 'approved' ? <UserCheck size={14} /> : <UserX size={14} />}
                        {volunteer.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ngo-empty-state">
              <Users size={56} strokeWidth={1.5} />
              <h4>
                {filter === 'all' 
                  ? 'No volunteer applications yet' 
                  : `No ${filter} applications`}
              </h4>
              <p>
                {filter === 'all'
                  ? 'When people apply to volunteer with your organization, they will appear here.'
                  : `You don't have any ${filter} volunteer applications.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      {volunteers.length > 0 && (
        <div className="ngo-tips-card" style={{ marginTop: '24px' }}>
          <div className="tips-header">
            <Lightbulb size={18} />
            <h4>Tips for Managing Volunteers</h4>
          </div>
          <ul className="tips-list">
            <li>Review volunteer applications promptly to keep applicants engaged</li>
            <li>Approved volunteers will receive an email notification</li>
            <li>You can view volunteer contact details to reach out directly</li>
            <li>Consider skills and availability when matching volunteers to tasks</li>
          </ul>
        </div>
      )}
    </div>
  );
}