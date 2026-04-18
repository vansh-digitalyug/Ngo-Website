import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

/* ===========================
   VALIDATION UTILITIES
   =========================== */
const VALIDATION = {
  // Remove all numbers and special chars, keep letters, spaces, hyphens
  onlyTextNoNumbers: (value) =>
    value
      .replace(/[0-9]/g, "")
      .replace(/[^a-zA-Z\s'-]/g, "")
      .trim(),

  // Validate email format
  isValidEmail: (email) => {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  },

  // Validate name format
  isValidName: (name) => {
    const trimmed = name.trim();
    return (
      trimmed.length >= 2 &&
      trimmed.length <= 100 &&
      /^[a-zA-Z]/.test(trimmed) &&
      !/[0-9]/.test(trimmed) &&
      /[a-zA-Z\s'-]/.test(trimmed)
    );
  },

  // Validate message length
  isValidMessage: (message) => {
    const trimmed = message.trim();
    return trimmed.length >= 10 && trimmed.length <= 2000;
  },
};

/* ===========================
   VALIDATION FUNCTIONS
   =========================== */
const validateContactForm = (formData) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "Full name is required.";
  } else if (!VALIDATION.isValidName(formData.name)) {
    errors.name = "⚠️ Name must be 2-100 characters, start with a letter, no numbers.";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required.";
  } else if (!VALIDATION.isValidEmail(formData.email)) {
    errors.email = "⚠️ Please enter a valid email address.";
  }

  if (!formData.message.trim()) {
    errors.message = "Message is required.";
  } else if (formData.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  } else if (formData.message.trim().length > 2000) {
    errors.message = "Message cannot exceed 2000 characters.";
  }

  if (!formData.privacy) {
    errors.privacy = "You must agree to the privacy policy.";
  }

  return errors;
};

const Contact = () => {
  // 1. State Management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
    privacy: false
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [submitMessage, setSubmitMessage] = useState('');
  const [fixingGrammar, setFixingGrammar] = useState(false);
  const [grammarError, setGrammarError] = useState('');

  // 2. Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    // Filter out numbers from name field
    if (name === "name") {
      processedValue = VALIDATION.onlyTextNoNumbers(value);
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    if (status === 'error') {
      setStatus('idle');
      setSubmitMessage('');
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : processedValue
    });
  };

  // 3. Validation Logic
  const validate = () => {
    const newErrors = validateContactForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fix Grammar using AI
  const handleFixGrammar = async () => {
    if (!formData.message.trim()) return;
    setFixingGrammar(true);
    setGrammarError('');
    try {
      const res = await fetch('http://localhost:5000/api/ai/fix-grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: formData.message }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message || 'Failed');
      setFormData(f => ({ ...f, message: d.text }));
    } catch (e) {
      setGrammarError(e.message || 'Grammar fix failed. Try again.');
    } finally {
      setFixingGrammar(false);
    }
  };

  // 4. Handle Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setStatus('submitting');
    setSubmitMessage('');

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          privacyAccepted: formData.privacy
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send message. Please try again.");
      }

      setStatus('success');
      setSubmitMessage(result.message || "Your message has been successfully sent. We will get back to you shortly.");
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '', privacy: false });

      // Reset status after 5 seconds to allow new messages
      setTimeout(() => {
        setStatus('idle');
        setSubmitMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setSubmitMessage(error.message || "Failed to send message. Please try again.");
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          :root {
            --primary: #2563eb;       /* Royal Blue */
            --primary-hover: #1d4ed8;
            --bg-color: #f8fafc;
            --text-dark: #1e293b;
            --text-gray: #64748b;
            --border: #e2e8f0;
            --error: #ef4444;
            --success: #22c55e;
            --radius: 12px;
          }

          * { margin: 0; padding: 0; box-sizing: border-box; }

          body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-dark);
            line-height: 1.5;
          }

          /* --- LAYOUT --- */
          .contact-container {
            max-width: 1100px;
            margin: 60px auto;
            padding: 0 20px;
          }

          .header {
            text-align: center;
            margin-bottom: 60px;
          }

          .header h1 {
            font-size: 42px;
            font-weight: 800;
            margin-bottom: 16px;
            letter-spacing: -1px;
            color: #0f172a;
          }

          .header p {
            font-size: 18px;
            color: var(--text-gray);
            max-width: 600px;
            margin: 0 auto;
          }

          /* --- CARD GRID --- */
          .grid-wrapper {
            display: grid;
            grid-template-columns: 1fr 1.5fr; /* Info takes less space than Form */
            gap: 40px;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px -5px rgba(0,0,0,0.05);
            border: 1px solid white;
          }

          /* --- LEFT COLUMN: INFO --- */
          .info-col {
            background: #1e293b;
            padding: 48px;
            color: white;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .info-col::before {
            content: '';
            position: absolute;
            top: -50px;
            right: -50px;
            width: 200px;
            height: 200px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            pointer-events: none;
          }

          .info-item {
            display: flex;
            gap: 16px;
            margin-bottom: 32px;
          }

          .info-icon {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
          }

          .info-text h3 { font-size: 16px; margin-bottom: 4px; font-weight: 600; }
          .info-text p { color: #94a3b8; font-size: 14px; }

          /* --- RIGHT COLUMN: FORM --- */
          .form-col {
            padding: 48px;
            background: white;
          }

          .form-group { margin-bottom: 24px; position: relative; }
          .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

          label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #334155;
          }

          input, select, textarea {
            width: 100%;
            padding: 14px;
            border: 2px solid var(--border);
            border-radius: var(--radius);
            font-size: 16px;
            transition: all 0.2s;
            background: #fff;
            font-family: inherit;
          }

          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
          }

          /* Error State */
          .error-input { border-color: var(--error); background: #fff5f5; }
          .error-msg { color: var(--error); font-size: 12px; margin-top: 6px; display: block; }

          /* Checkbox */
          .checkbox-group {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 24px;
          }
          
          .checkbox-group input { width: 20px; height: 20px; margin-top: 2px; }
          .checkbox-group label { font-weight: 400; color: var(--text-gray); font-size: 14px; margin: 0; }

          /* Button */
          .submit-btn {
            width: 100%;
            background: var(--primary);
            color: white;
            border: none;
            padding: 16px;
            border-radius: var(--radius);
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }

          .submit-btn:hover { background: var(--primary-hover); }
          .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

          /* Success Message */
          .success-box {
            background: #dcfce7;
            border: 1px solid #bbf7d0;
            color: #166534;
            padding: 20px;
            border-radius: var(--radius);
            text-align: center;
            margin-bottom: 20px;
            animation: fadeIn 0.5s ease;
          }

          .error-box {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 20px;
            border-radius: var(--radius);
            text-align: center;
            margin-bottom: 20px;
            animation: fadeIn 0.5s ease;
          }

          @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }

          .spinner {
            width: 20px; height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          /* --- RESPONSIVE --- */
          @media (max-width: 900px) {
            .grid-wrapper { grid-template-columns: 1fr; }
            .info-col { padding: 32px; flex-direction: row; flex-wrap: wrap; gap: 20px; }
            .info-col::before { display: none; }
            .info-item { width: 45%; margin: 0; }
          }
          @media (max-width: 600px) {
            .form-row { grid-template-columns: 1fr; }
            .info-item { width: 100%; }
            .contact-container { padding: 0 16px; margin: 30px auto; }
            .header h1 { font-size: 32px; }
          }
        `}
      </style>

      <div className="contact-container">
        
        {/* Header Section */}
        <div className="header">
          <h1>Get in Touch</h1>
          <p>Have a question or just want to say hi? We'd love to hear from you.</p>
        </div>

        <div className="grid-wrapper">
          
          {/* Left Side: Information */}
          <div className="info-col">
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '32px' }}>Contact Information</h2>
              
              <div className="info-item">
                <div className="info-icon">📍</div>
                <div className="info-text">
                  <h3>Office Location</h3>
                  <p>Sector 63, Noida<br/>Uttar Pradesh, India</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📧</div>
                <div className="info-text">
                  <h3>Email Address</h3>
                  <p>support@hopelink.org<br/>careers@hopelink.org</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📞</div>
                <div className="info-text">
                  <h3>Phone Number</h3>
                  <p>+91 (120) 123-4567<br/>Mon-Fri, 9am-6pm</p>
                </div>
              </div>
            </div>

            {/* Embed Map Preview */}
            <div style={{ marginTop: 'auto', borderRadius: '12px', overflow: 'hidden', height: '180px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.8!2d77.3726!3d28.6189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5f5f5f5f5f5%3A0x0!2sSector%2063%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1730000000000"
                width="100%" 
                height="100%" 
                style={{ border: 0, opacity: 0.8 }} 
                allowFullScreen="" 
                loading="lazy"
                title="Mini Map"
              ></iframe>
            </div>
          </div>

          {/* Right Side: Interactive Form */}
          <div className="form-col">
            
            {status === 'success' ? (
              <div className="success-box">
                <h3 style={{ marginBottom: '8px' }}>Thank you! 🎉</h3>
                <p>{submitMessage || "Your message has been successfully sent. We will get back to you shortly."}</p>
              </div>
            ) : null}

            {status === 'error' ? (
              <div className="error-box">
                <h3 style={{ marginBottom: '8px' }}>Unable to Send Message</h3>
                <p>{submitMessage || "Failed to send message. Please try again."}</p>
              </div>
            ) : null}

            {Object.keys(errors).length > 0 && (
              <div className="error-box" style={{ marginBottom: '20px', textAlign: 'left', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <AlertTriangle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '6px' }}>Please fix the following errors:</p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '0.9rem' }}>
                    {Object.values(errors).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                {/* Name */}
                <div className="form-group">
                  <label>Full Name <span style={{ fontSize: '0.8rem', color: '#999' }}>(Letters only)</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error-input' : ''}
                    placeholder="John Doe"
                    maxLength={100}
                  />
                  {errors.name && (
                    <span className="error-msg" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} /> {errors.name}
                    </span>
                  )}
                  {formData.name && !errors.name && (
                    <span style={{ color: '#16a34a', fontSize: '12px', marginTop: '6px', display: 'block' }}>✓ Valid name</span>
                  )}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error-input' : ''}
                    placeholder="john@example.com" 
                  />
                  {errors.email && (
                    <span className="error-msg" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} /> {errors.email}
                    </span>
                  )}
                  {formData.email && !errors.email && VALIDATION.isValidEmail(formData.email) && (
                    <span style={{ color: '#16a34a', fontSize: '12px', marginTop: '6px', display: 'block' }}>✓ Valid email</span>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label>Subject</label>
                <select 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option>General Inquiry</option>
                  <option>Support Request</option>
                  <option>Partnership Opportunity</option>
                  <option>Job Application</option>
                </select>
              </div>

              {/* Message */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Message</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: formData.message.length > 2000 ? '#ef4444' : formData.message.length >= 10 ? '#16a34a' : '#999' }}>
                      {formData.message.length}/2000
                    </span>
                    <button
                      type="button"
                      onClick={handleFixGrammar}
                      disabled={fixingGrammar || !formData.message.trim()}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '4px 12px', borderRadius: '8px',
                        border: '1px solid #2563eb', background: fixingGrammar ? '#eff6ff' : '#fff',
                        color: '#2563eb', fontSize: '12px', fontWeight: '600',
                        cursor: fixingGrammar || !formData.message.trim() ? 'not-allowed' : 'pointer',
                        opacity: !formData.message.trim() ? 0.5 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {fixingGrammar ? (
                        <><span style={{ width: '10px', height: '10px', border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Fixing…</>
                      ) : (
                        <><span>✦</span> Fix Grammar</>
                      )}
                    </button>
                  </div>
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={errors.message ? 'error-input' : ''}
                  rows="5"
                  placeholder="How can we help you? (Min 10 characters)"
                  maxLength={2000}
                ></textarea>
                {grammarError && (
                  <span className="error-msg" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} /> {grammarError}
                  </span>
                )}
                {errors.message && (
                  <span className="error-msg" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} /> {errors.message}
                  </span>
                )}
                {formData.message && !errors.message && formData.message.length >= 10 && (
                  <span style={{ color: '#16a34a', fontSize: '12px', marginTop: '6px', display: 'block' }}>✓ Valid message length</span>
                )}
              </div>

              {/* Privacy Checkbox */}
              <div className="checkbox-group" style={{ borderBottom: errors.privacy ? '2px solid #ef4444' : 'none', paddingBottom: errors.privacy ? '12px' : '0' }}>
                <input 
                  type="checkbox" 
                  id="privacy" 
                  name="privacy"
                  checked={formData.privacy}
                  onChange={handleChange}
                />
                <label htmlFor="privacy" style={{ color: errors.privacy ? '#ef4444' : '' }}>
                  I agree to the <Link to="/privacy-policy" style={{ color: '#2563eb', textDecoration: 'none' }}>privacy policy</Link> and consent to being contacted.
                </label>
              </div>
              {errors.privacy && (
                <span className="error-msg" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', marginBottom: '20px' }}>
                  <AlertTriangle size={12} /> {errors.privacy}
                </span>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={status === 'submitting' || status === 'success' || Object.keys(errors).length > 0}
                title={Object.keys(errors).length > 0 ? `Please fix ${Object.keys(errors).length} error(s)` : ""}
                style={{
                  opacity: (status === 'submitting' || status === 'success' || Object.keys(errors).length > 0) ? 0.7 : 1,
                  cursor: (status === 'submitting' || status === 'success' || Object.keys(errors).length > 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {status === 'submitting' ? (
                  <>
                    <div className="spinner"></div> Sending...
                  </>
                ) : status === 'success' ? (
                  'Message Sent'
                ) : Object.keys(errors).length > 0 ? (
                  <>
                    <AlertTriangle size={18} /> Fix {Object.keys(errors).length} Error(s)
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
};

export default Contact;
