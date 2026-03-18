import { useState } from 'react';
import { X, Shield, Plus, Trash2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const ROLES = [
  { value: 'volunteer',    label: 'Volunteer',    desc: 'Contribute to community tasks and events' },
  { value: 'coordinator',  label: 'Coordinator',  desc: 'Coordinate activities and members' },
  { value: 'co-leader',    label: 'Co-Leader',    desc: 'Assist the community leader' },
  { value: 'leader',       label: 'Leader',       desc: 'Take full responsibility — awaits admin approval' },
];

const TakeResponsibilityModal = ({ community, onClose, onSubmit, loading, error }) => {
  const [role, setRole] = useState('volunteer');
  const [motivation, setMotivation] = useState('');
  const [respItems, setRespItems] = useState(['']);
  const [submitted, setSubmitted] = useState(false);

  const addItem = () => {
    if (respItems.length < 10) setRespItems([...respItems, '']);
  };

  const updateItem = (i, val) => {
    const copy = [...respItems];
    copy[i] = val;
    setRespItems(copy);
  };

  const removeItem = (i) => {
    if (respItems.length === 1) { setRespItems(['']); return; }
    setRespItems(respItems.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const responsibilities = respItems.map(r => r.trim()).filter(Boolean);
    await onSubmit({ role, motivation: motivation.trim(), responsibilities });
    setSubmitted(true);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', borderRadius: '16px 16px 0 0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Shield size={20} color="#fff" />
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>Take Responsibility</h2>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{community?.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#fff' }}>
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} color="#059669" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Application Submitted!</h3>
            <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>
              Your responsibility application is <strong>pending admin review</strong>. You'll be notified once it's approved.
            </p>
            <button
              onClick={onClose}
              style={{ padding: '10px 28px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ overflow: 'auto', flex: 1 }}>
            <div style={{ padding: '20px 24px' }}>
              {error && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
                  <AlertCircle size={15} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: '#991b1b' }}>{error}</span>
                </div>
              )}

              {/* Role select */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 10 }}>Select Your Role *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {ROLES.map(r => (
                    <label
                      key={r.value}
                      style={{
                        display: 'flex', flexDirection: 'column', gap: 2,
                        padding: '12px 14px', borderRadius: 10, border: `2px solid ${role === r.value ? '#3b82f6' : '#e5e7eb'}`,
                        background: role === r.value ? '#eff6ff' : '#fff',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} style={{ display: 'none' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: role === r.value ? '#1d4ed8' : '#374151' }}>{r.label}</span>
                      <span style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{r.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* What you'll do */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 8 }}>
                  What will you do? <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 12 }}>(up to 10 items)</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {respItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={item}
                        onChange={e => updateItem(i, e.target.value)}
                        placeholder={`Responsibility ${i + 1}...`}
                        maxLength={200}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, outline: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        style={{ padding: 6, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', display: 'flex' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                {respItems.length < 10 && (
                  <button
                    type="button"
                    onClick={addItem}
                    style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#f0f9ff', border: '1px dashed #93c5fd', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
                  >
                    <Plus size={13} /> Add another
                  </button>
                )}
              </div>

              {/* Motivation */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#374151', marginBottom: 8 }}>
                  Motivation <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 12 }}>(why do you want this role?)</span>
                </label>
                <textarea
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                  placeholder="Share your motivation and what you hope to achieve..."
                  rows={4}
                  maxLength={1000}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 10, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5, outline: 'none' }}
                />
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>{motivation.length}/1000</p>
              </div>

              {/* Notice */}
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#92400e', marginBottom: 4 }}>
                ℹ️ Your application will be <strong>reviewed by an admin</strong>. Only one active or pending application per community is allowed.
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ padding: '10px 24px', background: loading ? '#93c5fd' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
              >
                {loading && <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} />}
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TakeResponsibilityModal;
