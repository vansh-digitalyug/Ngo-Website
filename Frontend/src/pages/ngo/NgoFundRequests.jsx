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
  RefreshCw,
  Wallet
} from 'lucide-react';
import { API_BASE_URL } from './NgoLayout';

const STATUS_CONFIG = {
  Pending:  { className: 'bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]', icon: Clock },
  Approved: { className: 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]', icon: CheckCircle2 },
  Released: { className: 'bg-[#f0f4ea] text-[#5a6b46] border border-[#d6e3c9]', icon: Banknote },
  Rejected: { className: 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]', icon: XCircle }
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

  const inputCls = "w-full px-4 py-2.5 bg-[#f8f7f5] border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#eaddc8] focus:border-[#6c5d46] transition-all";
  const labelCls = "block text-sm font-bold text-[#222222] mb-1.5";

  return (
    <div className="min-h-screen bg-[#f8f7f5] p-4 sm:p-6 lg:p-8 font-sans text-[#2c2c2c] selection:bg-[#eaddc8] selection:text-[#2c2c2c] flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#222222] flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-[#6c5d46]">
              <Wallet size={24} />
            </div>
            Fund Requests
          </h1>
          <p className="text-[#6c6c6c] text-sm sm:text-base font-medium mt-2">
            Submit and track funding requests for your organization's needs.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(''); setFormSuccess(''); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm shrink-0"
        >
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Success Banner */}
      {formSuccess && (
        <div className="flex items-center justify-between p-4 rounded-xl text-sm font-bold border bg-[#f0f4ea] text-[#5a6b46] border-[#d6e3c9]">
          <span className="flex items-center gap-3">
            <CheckCircle2 size={18} /> {formSuccess}
          </span>
          <button onClick={() => setFormSuccess('')} className="p-1 hover:bg-white/50 rounded-md transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: pagination.total, icon: <IndianRupee size={20} />, bg: "text-[#6c5d46]" },
          { label: "Pending", value: totalPending, icon: <Clock size={20} />, bg: "text-[#c2410c]" },
          { label: "Approved", value: totalApproved, icon: <CheckCircle2 size={20} />, bg: "text-[#1d4ed8]" },
          { label: "Released", value: totalReleased, icon: <Banknote size={20} />, bg: "text-[#5a6b46]" },
        ].map((s, idx) => (
          <div key={idx} className={`flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border ${idx === 3 ? 'border-[#d6e3c9]' : 'border-gray-100'}`}>
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-[#f8f7f5] shrink-0 border border-[#eaddc8] ${s.bg}`}>
              {s.icon}
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-[#222222]">{s.value}</span>
              <span className="block text-xs font-bold text-[#888888] uppercase tracking-wider mt-0.5">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-[#222222]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 opacity-100 animate-in fade-in duration-200" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-[#222222] flex items-center gap-2">
                  <IndianRupee size={20} className="text-[#6c5d46]" /> Submit Fund Request
                </h2>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="fundForm" onSubmit={handleSubmit} className="space-y-5">
                {formError && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border bg-[#fef2f2] text-[#991b1b] border-[#fecaca]">
                    <AlertCircle size={16} /> {formError}
                  </div>
                )}

                <div>
                  <label className={labelCls}>Requested Amount (₹) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 50000"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      className={`${inputCls} pl-8`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Purpose <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={PURPOSE_OPTIONS.includes(form.purpose) ? form.purpose : (form.purpose ? 'Other' : '')}
                      onChange={e => setForm({ ...form, purpose: e.target.value === 'Other' ? '' : e.target.value })}
                      className={`${inputCls} appearance-none pr-10 cursor-pointer`}
                    >
                      <option value="">Select a purpose</option>
                      {PURPOSE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
                  </div>
                  {(!PURPOSE_OPTIONS.includes(form.purpose) && form.purpose !== '' || (PURPOSE_OPTIONS.includes(form.purpose) === false && form.purpose !== '')) && (
                    <input
                      type="text"
                      placeholder="Describe the purpose..."
                      value={form.purpose}
                      onChange={e => setForm({ ...form, purpose: e.target.value })}
                      className={`${inputCls} mt-2`}
                    />
                  )}
                </div>

                <div>
                  <label className={labelCls}>Additional Description <span className="text-xs font-medium text-[#888888]">(optional)</span></label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about why funding is needed and the expected impact..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className={`${inputCls} resize-y min-h-[100px]`}
                  />
                </div>

                <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-[#c2410c] mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-[#c2410c]">
                    Your request will be reviewed by the admin team. You'll be notified once a decision is made.
                  </p>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
              <button type="button" onClick={() => setShowForm(false)} disabled={submitting} className="px-5 py-2.5 bg-white text-[#2c2c2c] border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
                Cancel
              </button>
              <button type="submit" form="fundForm" disabled={submitting} className="px-5 py-2.5 bg-[#6c5d46] text-white rounded-lg text-sm font-semibold hover:bg-[#584a36] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                {submitting ? <><RefreshCw size={16} className="animate-spin" /> Submitting...</> : <><IndianRupee size={16} /> Submit Request</>}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Requests List Area */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#222222]">My Fund Requests</h2>
          <div className="relative shrink-0">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#6c6c6c] appearance-none focus:outline-none focus:border-[#6c5d46] hover:border-[#eaddc8] hover:bg-[#f8f7f5] transition-all shadow-sm cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Released">Released</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
            <div className="w-10 h-10 border-4 border-[#eaddc8] border-t-[#6c5d46] rounded-full animate-spin"></div>
            <p className="text-[#888888] font-medium">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-[#f8f7f5] rounded-full flex items-center justify-center text-[#d5cfc4] mb-4">
              <IndianRupee size={32} strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-bold text-[#222222] mb-2">No fund requests yet</h4>
            <p className="text-sm font-medium text-[#888888] mb-6">Submit your first fund request by clicking the "New Request" button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map(req => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.Pending;
              const StatusIcon = cfg.icon;
              return (
                <div key={req._id} className={`bg-white rounded-2xl border ${req.isResolved ? 'border-[#d6e3c9] bg-[#fdfdfc]' : 'border-gray-100'} shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-all relative overflow-hidden`}>
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-2xl font-extrabold text-[#222222]">
                      <IndianRupee size={22} className="text-[#6c5d46]" />
                      <span>{Number(req.amount).toLocaleString('en-IN')}</span>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm ${req.isResolved ? 'bg-[#f8f7f5] text-[#888888] border border-gray-200' : cfg.className}`}>
                      <StatusIcon size={12} />
                      {req.isResolved ? 'Resolved' : req.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-[#222222]">
                    <FileText size={16} className="text-[#888888]" />
                    {req.purpose}
                  </div>

                  {req.description && (
                    <p className="text-sm text-[#6c6c6c] leading-relaxed line-clamp-3 flex-1">{req.description}</p>
                  )}

                  {req.adminNote && (
                    <div className="bg-[#fff7ed] border border-[#ffedd5] text-[#c2410c] p-3 rounded-xl text-xs font-medium mt-2">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <AlertCircle size={14} /> Admin Note
                      </div>
                      {req.adminNote}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-[#888888]">Submitted: {formatDate(req.createdAt)}</span>
                      {req.releasedAt && (
                        <span className="text-xs font-bold text-[#5a6b46]">Released: {formatDate(req.releasedAt)}</span>
                      )}
                    </div>
                    
                    {req.status === 'Released' && !req.isResolved && (
                      <button
                        onClick={() => handleResolve(req._id)}
                        disabled={resolving === req._id}
                        className="px-4 py-2 bg-[#f0f4ea] text-[#5a6b46] border border-[#d6e3c9] hover:bg-[#e4ebd8] rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto disabled:opacity-70"
                      >
                        {resolving === req._id ? (
                          <><RefreshCw size={14} className="animate-spin" /> Resolving...</>
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
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => fetchRequests(page, filterStatus)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all border shadow-sm ${
                  pagination.page === page
                    ? 'bg-[#6c5d46] text-white border-[#6c5d46]'
                    : 'bg-white text-[#6c6c6c] border-gray-200 hover:border-[#eaddc8] hover:bg-[#f8f7f5]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}