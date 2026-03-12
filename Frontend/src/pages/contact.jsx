import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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

  // 2. Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
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
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // 3. Validation Logic
  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) newErrors.message = 'Message cannot be empty';
    if (!formData.privacy) newErrors.privacy = 'You must agree to the privacy policy';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                {/* Name */}
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error-input' : ''}
                    placeholder="John Doe" 
                  />
                  {errors.name && <span className="error-msg">{errors.name}</span>}
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
                  {errors.email && <span className="error-msg">{errors.email}</span>}
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
                <label>Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={errors.message ? 'error-input' : ''}
                  rows="5" 
                  placeholder="How can we help you?"
                ></textarea>
                {errors.message && <span className="error-msg">{errors.message}</span>}
              </div>

              {/* Privacy Checkbox */}
              <div className="checkbox-group">
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
              {errors.privacy && <span className="error-msg" style={{ marginTop: '-15px', marginBottom: '20px' }}>{errors.privacy}</span>}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={status === 'submitting' || status === 'success'}
              >
                {status === 'submitting' ? (
                  <>
                    <div className="spinner"></div> Sending...
                  </>
                ) : status === 'success' ? (
                  'Message Sent'
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
