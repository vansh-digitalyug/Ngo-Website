import React, { useState } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock, FaPaperPlane, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
    privacy: false
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
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

      setTimeout(() => {
        setStatus('idle');
        setSubmitMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setSubmitMessage(error.message || "Failed to send message. Please try again.");
    }
  };

  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      title: "Office Location",
      lines: ["Sector 63, Noida", "Uttar Pradesh, India"]
    },
    {
      icon: FaEnvelope,
      title: "Email Address",
      lines: ["support@sevaindia.org", "partnerships@sevaindia.org"]
    },
    {
      icon: FaPhone,
      title: "Phone Number",
      lines: ["+91 (120) 123-4567", "+91 98765 43210"]
    },
    {
      icon: FaClock,
      title: "Working Hours",
      lines: ["Mon - Fri: 9am - 6pm", "Sat: 10am - 2pm"]
    }
  ];

  return (
    <div className="contact-page">
      <style>{`
        .contact-page {
          font-family: var(--font-sans);
          background: var(--color-cream);
          color: var(--color-text-dark);
          min-height: 100vh;
        }

        /* Hero Section */
        .contact-hero {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
          padding: 100px 24px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .contact-hero::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
        }

        .contact-hero::after {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin: 0 auto;
        }

        .hero-tag {
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--color-white);
          padding: 6px 18px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .hero-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          color: var(--color-white);
          margin: 0 0 16px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.7;
          margin: 0;
        }

        /* Main Content */
        .contact-container {
          max-width: 1200px;
          margin: -40px auto 0;
          padding: 0 24px 80px;
          position: relative;
          z-index: 2;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 32px;
          background: var(--color-white);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--color-border-light);
        }

        /* Info Column */
        .info-column {
          background: linear-gradient(180deg, var(--color-primary) 0%, #15352a 100%);
          padding: 48px 40px;
          color: var(--color-white);
          position: relative;
          overflow: hidden;
        }

        .info-column::before {
          content: '';
          position: absolute;
          top: -60px;
          right: -60px;
          width: 180px;
          height: 180px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
        }

        .info-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 8px;
          color: var(--color-white);
        }

        .info-subtitle {
          font-size: 0.95rem;
          color: var(--color-primary-soft);
          margin: 0 0 40px;
          line-height: 1.6;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 28px;
          margin-bottom: 40px;
        }

        .info-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .info-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent-light);
          font-size: 1.1rem;
        }

        .info-text h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 6px;
          color: var(--color-white);
        }

        .info-text p {
          font-size: 0.9rem;
          color: var(--color-primary-soft);
          margin: 0;
          line-height: 1.6;
        }

        /* Map */
        .map-container {
          margin-top: auto;
          border-radius: var(--radius-lg);
          overflow: hidden;
          height: 180px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .map-container iframe {
          width: 100%;
          height: 100%;
          border: 0;
          opacity: 0.85;
        }

        /* Form Column */
        .form-column {
          padding: 48px 40px;
          background: var(--color-white);
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary);
          margin: 0 0 8px;
        }

        .form-subtitle {
          font-size: 0.95rem;
          color: var(--color-text-muted);
          margin: 0 0 32px;
        }

        /* Form Styles */
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-dark);
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-family: inherit;
          background: var(--color-white);
          color: var(--color-text-dark);
          transition: all var(--transition-fast);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: var(--color-text-muted);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px var(--color-primary-bg);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 140px;
        }

        .error-input {
          border-color: var(--color-error) !important;
          background: var(--color-error-bg) !important;
        }

        .error-msg {
          color: var(--color-error);
          font-size: 0.8rem;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Checkbox */
        .checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 28px;
        }

        .checkbox-group input[type="checkbox"] {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          accent-color: var(--color-primary);
          cursor: pointer;
        }

        .checkbox-group label {
          font-size: 0.9rem;
          color: var(--color-text-body);
          line-height: 1.5;
          cursor: pointer;
        }

        .checkbox-group label a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 500;
        }

        .checkbox-group label a:hover {
          text-decoration: underline;
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          background: var(--color-accent);
          color: var(--color-white);
          border: none;
          padding: 16px 24px;
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 16px rgba(196, 92, 46, 0.2);
        }

        .submit-btn:hover {
          background: var(--color-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(196, 92, 46, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        /* Status Messages */
        .success-box {
          background: var(--color-success-bg);
          border: 1px solid #86efac;
          color: #166534;
          padding: 20px 24px;
          border-radius: var(--radius-lg);
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          animation: slideIn 0.4s ease;
        }

        .success-box .icon {
          color: var(--color-success);
          font-size: 1.4rem;
          flex-shrink: 0;
        }

        .error-box {
          background: var(--color-error-bg);
          border: 1px solid #fca5a5;
          color: #991b1b;
          padding: 20px 24px;
          border-radius: var(--radius-lg);
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          animation: slideIn 0.4s ease;
        }

        .error-box .icon {
          color: var(--color-error);
          font-size: 1.4rem;
          flex-shrink: 0;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Spinner */
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: var(--color-white);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }

          .info-column {
            padding: 40px 32px;
          }

          .info-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }

          .map-container {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .contact-hero {
            padding: 80px 20px 60px;
          }

          .contact-container {
            margin-top: -30px;
            padding: 0 16px 60px;
          }

          .info-column,
          .form-column {
            padding: 32px 24px;
          }

          .info-list {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 1.75rem;
          }

          .info-column,
          .form-column {
            padding: 28px 20px;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <span className="hero-tag">Contact Us</span>
          <h1 className="hero-title">Get In Touch With Us</h1>
          <p className="hero-subtitle">
            Have a question, want to partner with us, or need support? 
            We would love to hear from you. Our team is here to help.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="contact-container">
        <div className="contact-grid">
          
          {/* Left: Contact Information */}
          <div className="info-column">
            <h2 className="info-title">Contact Information</h2>
            <p className="info-subtitle">
              Reach out through any of these channels and we will respond within 24 hours.
            </p>

            <div className="info-list">
              {contactInfo.map((item, index) => (
                <div key={index} className="info-item">
                  <div className="info-icon">
                    <item.icon />
                  </div>
                  <div className="info-text">
                    <h4>{item.title}</h4>
                    {item.lines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.8!2d77.3726!3d28.6189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5f5f5f5f5f5%3A0x0!2sSector%2063%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1730000000000"
                allowFullScreen=""
                loading="lazy"
                title="Office Location Map"
              />
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="form-column">
            <h2 className="form-title">Send Us a Message</h2>
            <p className="form-subtitle">
              Fill out the form below and we will get back to you as soon as possible.
            </p>

            {status === 'success' && (
              <div className="success-box">
                <FaCheckCircle className="icon" />
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Message Sent Successfully!</strong>
                  <span>{submitMessage}</span>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="error-box">
                <FaExclamationTriangle className="icon" />
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Failed to Send Message</strong>
                  <span>{submitMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
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

                <div className="form-group">
                  <label>Email Address *</label>
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
                  <option>NGO Registration Help</option>
                  <option>Donation Query</option>
                  <option>Volunteer Information</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={errors.message ? 'error-input' : ''}
                  placeholder="How can we help you today?"
                />
                {errors.message && <span className="error-msg">{errors.message}</span>}
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  checked={formData.privacy}
                  onChange={handleChange}
                />
                <label htmlFor="privacy" style={{ color: errors.privacy ? 'var(--color-error)' : '' }}>
                  I agree to the <a href="/privacy">privacy policy</a> and consent to being contacted regarding my inquiry.
                </label>
              </div>
              {errors.privacy && <span className="error-msg" style={{ marginTop: '-20px', marginBottom: '20px', display: 'block' }}>{errors.privacy}</span>}

              <button
                type="submit"
                className="submit-btn"
                disabled={status === 'submitting' || status === 'success'}
              >
                {status === 'submitting' ? (
                  <>
                    <div className="spinner" /> Sending...
                  </>
                ) : status === 'success' ? (
                  <>
                    <FaCheckCircle /> Message Sent
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
