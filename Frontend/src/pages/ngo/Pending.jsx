import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, XCircle, AlertTriangle, FileEdit, ArrowLeft } from 'lucide-react';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function NgoPending() {
  const navigate = useNavigate();
  const [ngoData, setNgoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkNgoStatus();
  }, []);

  const checkNgoStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        
        // If NGO is verified, redirect to dashboard
        if (data.status === 'approved') {
          navigate('/ngo/dashboard');
          return;
        }
        
        // If no NGO found, redirect to add-ngo
        if (data.status === 'none') {
          navigate('/add-ngo');
          return;
        }

        setNgoData(data);
      } else {
        navigate('/add-ngo');
      }
    } catch (err) {
      console.error('Failed to check NGO status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setChecking(true);
    await checkNgoStatus();
    setChecking(false);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: 'calc(100vh - 70px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div className="ngo-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: '#f8fafc' }}>
      <div className="ngo-pending-container">
        <div className="ngo-pending-card">
          {ngoData?.status === 'pending' && (
            <>
              <div className="ngo-pending-icon"><Clock size={64} /></div>
              <h1>Application Under Review</h1>
              <p className="ngo-name">{ngoData?.data?.ngoName}</p>
              
              <div className="ngo-pending-status">
                <RefreshCw size={16} /> Pending Admin Approval
              </div>

              <div className="ngo-pending-info">
                <h4>What happens next?</h4>
                <ul>
                  <li>
                    <span className="step-icon">1</span>
                    Our team reviews your submitted documents
                  </li>
                  <li>
                    <span className="step-icon">2</span>
                    Verification of registration certificate & credentials
                  </li>
                  <li>
                    <span className="step-icon">3</span>
                    You'll receive an email once approved
                  </li>
                  <li>
                    <span className="step-icon">4</span>
                    Full dashboard access will be granted
                  </li>
                </ul>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
                This usually takes 1-3 business days. Thank you for your patience!
              </p>
            </>
          )}

          {ngoData?.status === 'rejected' && (
            <>
              <div className="ngo-pending-icon"><XCircle size={64} /></div>
              <h1>Application Rejected</h1>
              <p className="ngo-name">{ngoData?.data?.ngoName}</p>
              
              <div className="ngo-pending-status" style={{ background: '#fee2e2', color: '#991b1b' }}>
                <AlertTriangle size={16} /> Not Approved
              </div>

              <div className="ngo-pending-info">
                <h4>Reason for rejection:</h4>
                <p style={{ color: '#64748b', margin: '12px 0 0 0' }}>
                  {ngoData?.data?.rejectionReason || 'No specific reason provided. Please contact support for more details.'}
                </p>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', marginTop: '20px' }}>
                You may submit a new application with corrected information.
              </p>
            </>
          )}

          <div className="ngo-pending-actions">
            <Link to="/" className="ngo-btn ngo-btn-secondary">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            {ngoData?.status === 'pending' && (
              <button 
                className="ngo-btn ngo-btn-primary"
                onClick={handleRefresh}
                disabled={checking}
              >
                <RefreshCw size={16} className={checking ? 'spin' : ''} /> {checking ? 'Checking...' : 'Check Status'}
              </button>
            )}
            {ngoData?.status === 'rejected' && (
              <Link to="/add-ngo" className="ngo-btn ngo-btn-primary">
                <FileEdit size={16} /> Submit New Application
              </Link>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center',
          padding: '20px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            Have questions? <Link to="/contact" style={{ color: '#7c3aed', fontWeight: 600 }}>Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
