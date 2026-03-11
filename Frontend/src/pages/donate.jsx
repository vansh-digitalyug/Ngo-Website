import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaLock, FaShieldAlt, FaCheckCircle, FaHeart, FaReceipt, FaUsers } from "react-icons/fa";
import cowImage from "../assets/images/elderly/elder.png";
import { useLanguage } from "../utils/useLanguage.jsx";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const Donate = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const isHi = language === "hi";
  const serviceImage = location.state?.serviceImage || cowImage;
  const serviceTitle = location.state?.serviceTitle || "Help Guardian of Angels rescue and care for abandoned and injured cows";
  const ngoId = location.state?.ngoId || null;
  
  const [selectedAmount, setSelectedAmount] = useState(3000);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [wantsNotification, setWantsNotification] = useState(true);
  const [wantsTaxCertificate, setWantsTaxCertificate] = useState(true);
  const [citizenConfirmed, setCitizenConfirmed] = useState(false);

  const donationAmount = customAmount ? parseInt(customAmount) : (selectedAmount || 3000);
  const totalAmount = donationAmount;

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
      if (value) setSelectedAmount(null);
    }
  };

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleProceedPayment = async (e) => {
    e.preventDefault();

    if (customAmount && parseInt(customAmount) < 1000) {
      alert("Minimum donation amount is Rs.1,000");
      return;
    }

    if (!citizenConfirmed) {
      alert("Please confirm you are an Indian citizen");
      return;
    }

    let orderData;

    try {
      const _token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/payment/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          amount: totalAmount,
          currency: "INR",
          ngoId,
          serviceTitle,
          donorName: donorName || "Anonymous",
          isAnonymous,
          notes: {
            donorName: donorName || "Anonymous",
            isAnonymous,
            mobile,
            email,
            panNumber,
          },
          receipt: `donation_${Date.now()}`
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      orderData = data.data.order;

    } catch (err) {
      alert("Order creation failed: " + err.message);
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "SevaIndia",
      description: serviceTitle,
      image: serviceImage,
      order_id: orderData.id,

      handler: async (response) => {
        try {
          const verifyRes = await fetch(
            `${API_BASE_URL}/api/payment/verify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(response),
            }
          );

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) throw new Error(verifyData.message);

          alert("Payment successful! Thank you for your generous donation.");

        } catch (err) {
          alert("Verification failed: " + err.message);
        }
      },

      prefill: {
        name: donorName,
        email,
        contact: mobile,
      },

      notes: orderData.notes || {},
      theme: { color: "#1B4332" },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert("Razorpay SDK not loaded");
    }
  };

  const amountOptions = [
    { amount: 1500, label: "Rs.1,500", description: "Feed a child for 1 month" },
    { amount: 3000, label: "Rs.3,000", description: "School supplies for a year", popular: true },
    { amount: 5000, label: "Rs.5,000", description: "Medical care for seniors" },
    { amount: 10000, label: "Rs.10,000", description: "Support an entire family" },
  ];

  const trustBadges = [
    { icon: FaShieldAlt, text: "100% Secure" },
    { icon: FaReceipt, text: "80G Tax Benefits" },
    { icon: FaUsers, text: "3000+ Donors" },
  ];

  return (
    <div className="donate-page">
      <style>{`
        .donate-page {
          font-family: var(--font-sans);
          background: var(--color-cream);
          min-height: 100vh;
        }

        /* Hero Section */
        .donate-hero {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
          padding: 100px 24px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .donate-hero::before,
        .donate-hero::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
        }

        .donate-hero::before {
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
        }

        .donate-hero::after {
          bottom: -80px;
          left: -80px;
          width: 300px;
          height: 300px;
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

        /* Main Container */
        .donate-container {
          max-width: 1200px;
          margin: -40px auto 0;
          padding: 0 24px 80px;
          position: relative;
          z-index: 2;
        }

        .donate-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 32px;
          align-items: start;
        }

        /* Form Card */
        .donate-form-card {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          padding: 40px;
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--color-border-light);
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-primary);
          margin: 0 0 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title .icon {
          color: var(--color-accent);
        }

        /* Amount Selection */
        .amount-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .amount-btn {
          padding: 20px 16px;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          background: var(--color-white);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
          text-align: center;
        }

        .amount-btn:hover {
          border-color: var(--color-primary);
          background: var(--color-primary-bg);
        }

        .amount-btn.selected {
          border-color: var(--color-primary);
          background: var(--color-primary-bg);
          box-shadow: 0 0 0 3px var(--color-primary-bg);
        }

        .amount-btn .amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-dark);
          display: block;
          margin-bottom: 4px;
        }

        .amount-btn .description {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .amount-btn.selected .amount {
          color: var(--color-primary);
        }

        .popular-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-accent);
          color: var(--color-white);
          padding: 4px 14px;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(196, 92, 46, 0.3);
        }

        /* Custom Amount */
        .custom-amount-wrapper {
          margin-bottom: 28px;
        }

        .custom-amount-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-lg);
          font-size: 1.1rem;
          font-family: inherit;
          background: var(--color-white);
          transition: all var(--transition-fast);
        }

        .custom-amount-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px var(--color-primary-bg);
        }

        .custom-amount-input::placeholder {
          color: var(--color-text-muted);
        }

        .input-hint {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          margin-top: 8px;
        }

        /* Checkbox Styles */
        .checkbox-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid var(--color-border-light);
        }

        .checkbox-row:last-child {
          border-bottom: none;
        }

        .checkbox-row input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: var(--color-primary);
          cursor: pointer;
        }

        .checkbox-row label {
          font-size: 0.95rem;
          color: var(--color-text-body);
          cursor: pointer;
          flex: 1;
        }

        /* Form Section */
        .form-section {
          margin-top: 32px;
          padding-top: 28px;
          border-top: 1px solid var(--color-border-light);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-dark);
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-family: inherit;
          background: var(--color-white);
          transition: all var(--transition-fast);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px var(--color-primary-bg);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .phone-input-wrapper {
          display: flex;
          gap: 10px;
        }

        .phone-code {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          background: var(--color-warm-bg);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          color: var(--color-text-body);
          font-weight: 500;
        }

        .phone-input-wrapper input {
          flex: 1;
        }

        .hint-text {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: 6px;
        }

        /* Right Column - Summary Card */
        .summary-card {
          background: var(--color-white);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--color-border-light);
          position: sticky;
          top: 100px;
        }

        .summary-image {
          width: 100%;
          height: 220px;
          object-fit: cover;
          background: var(--color-warm-bg);
        }

        .summary-content {
          padding: 28px;
        }

        .summary-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text-dark);
          margin: 0 0 20px;
          line-height: 1.5;
        }

        .summary-box {
          background: var(--color-warm-bg);
          padding: 20px;
          border-radius: var(--radius-lg);
          margin-bottom: 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 0.95rem;
        }

        .summary-row:last-child {
          margin-bottom: 0;
        }

        .summary-row.total {
          border-top: 2px solid var(--color-border);
          padding-top: 12px;
          margin-top: 12px;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .summary-label {
          color: var(--color-text-muted);
        }

        .summary-value {
          font-weight: 600;
          color: var(--color-text-dark);
        }

        .summary-row.total .summary-value {
          color: var(--color-primary);
        }

        /* Tax Certificate Checkbox */
        .tax-checkbox {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--color-accent-bg);
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          border: 1px solid rgba(196, 92, 46, 0.15);
        }

        .tax-checkbox input {
          width: 18px;
          height: 18px;
          accent-color: var(--color-accent);
        }

        .tax-checkbox label {
          font-size: 0.9rem;
          color: var(--color-text-body);
          cursor: pointer;
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          padding: 18px 24px;
          background: var(--color-accent);
          color: var(--color-white);
          border: none;
          border-radius: var(--radius-md);
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 16px rgba(196, 92, 46, 0.25);
        }

        .submit-btn:hover {
          background: var(--color-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(196, 92, 46, 0.35);
        }

        .secure-badge {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .secure-badge svg {
          color: var(--color-primary-soft);
        }

        /* Trust Badges */
        .trust-badges {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--color-border-light);
        }

        .trust-badge {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 8px;
          background: var(--color-primary-bg);
          border-radius: var(--radius-md);
          text-align: center;
        }

        .trust-badge svg {
          color: var(--color-primary);
          font-size: 1.2rem;
        }

        .trust-badge span {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-body);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .donate-grid {
            grid-template-columns: 1fr;
          }

          .summary-card {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .donate-hero {
            padding: 80px 20px 60px;
          }

          .donate-container {
            margin-top: -30px;
            padding: 0 16px 60px;
          }

          .donate-form-card {
            padding: 28px 20px;
          }

          .amount-grid {
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

          .trust-badges {
            flex-wrap: wrap;
          }

          .trust-badge {
            min-width: calc(50% - 6px);
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="donate-hero">
        <div className="hero-content">
          <span className="hero-tag">Make a Difference</span>
          <h1 className="hero-title">Your Donation Changes Lives</h1>
          <p className="hero-subtitle">
            Every rupee you donate goes directly to verified NGOs working on the ground. 
            100% transparency, 80G tax benefits, and real impact you can track.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="donate-container">
        <div className="donate-grid">
          
          {/* Left Column - Donation Form */}
          <form className="donate-form-card" onSubmit={handleProceedPayment}>
            <h2 className="section-title">
              <FaHeart className="icon" /> Select Donation Amount
            </h2>

            {/* Amount Options */}
            <div className="amount-grid">
              {amountOptions.map((option) => (
                <button
                  key={option.amount}
                  type="button"
                  className={`amount-btn ${selectedAmount === option.amount && !customAmount ? 'selected' : ''}`}
                  onClick={() => handleAmountClick(option.amount)}
                >
                  {option.popular && <span className="popular-badge">Most Popular</span>}
                  <span className="amount">{option.label}</span>
                  <span className="description">{option.description}</span>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="custom-amount-wrapper">
              <input
                type="number"
                className="custom-amount-input"
                placeholder="Enter custom amount (Rs.1,000 or more)"
                value={customAmount}
                onChange={handleCustomAmountChange}
              />
              <p className="input-hint">Minimum donation: Rs.1,000</p>
            </div>

            {/* Citizen Confirmation */}
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="citizen-confirm"
                checked={citizenConfirmed}
                onChange={(e) => setCitizenConfirmed(e.target.checked)}
              />
              <label htmlFor="citizen-confirm">I confirm that I am an Indian citizen</label>
            </div>

            {/* Donor Details Section */}
            <div className="form-section">
              <h3 className="section-title">Your Details</h3>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Raghu Kumar"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </div>

              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anonymous">Make my donation anonymous</label>
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <div className="phone-input-wrapper">
                  <div className="phone-code">+91</div>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.slice(0, 10))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g., raghu@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Billing Address *</label>
                <input
                  type="text"
                  placeholder="e.g., 24, Ganesha Layout, Bengaluru"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    placeholder="e.g., 560001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.slice(0, 6))}
                  />
                </div>
                <div className="form-group">
                  <label>PAN Number (for 80G)</label>
                  <input
                    type="text"
                    placeholder="e.g., ABCTY1234D"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                  />
                  <p className="hint-text">Required to claim tax exemption</p>
                </div>
              </div>

              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="notification"
                  checked={wantsNotification}
                  onChange={(e) => setWantsNotification(e.target.checked)}
                />
                <label htmlFor="notification">Send me updates via WhatsApp/SMS</label>
              </div>
            </div>

            {/* Mobile Submit Button */}
            <button type="submit" className="submit-btn" style={{ marginTop: '24px', display: 'none' }}>
              Proceed to Pay Rs.{totalAmount.toLocaleString('en-IN')}
            </button>
          </form>

          {/* Right Column - Summary */}
          <div className="summary-card">
            <img src={serviceImage} alt="Cause" className="summary-image" />
            
            <div className="summary-content">
              <h3 className="summary-title">{serviceTitle}</h3>

              <div className="summary-box">
                <div className="summary-row">
                  <span className="summary-label">Donation Amount</span>
                  <span className="summary-value">Rs.{donationAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Donation</span>
                  <span className="summary-value">Rs.{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="tax-checkbox">
                <input
                  type="checkbox"
                  id="tax-certificate"
                  checked={wantsTaxCertificate}
                  onChange={(e) => setWantsTaxCertificate(e.target.checked)}
                />
                <label htmlFor="tax-certificate">Get 80G tax certificate for your donation</label>
              </div>

              <button type="button" className="submit-btn" onClick={handleProceedPayment}>
                Proceed to Pay Rs.{totalAmount.toLocaleString('en-IN')}
              </button>

              <div className="secure-badge">
                <FaLock /> Secured by Razorpay - Bank-grade encryption
              </div>

              <div className="trust-badges">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="trust-badge">
                    <badge.icon />
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
