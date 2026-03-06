import React, { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaCheckCircle, FaLock } from "react-icons/fa";
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
  const [tipPercentage, setTipPercentage] = useState(8);
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

  // Calculate amounts
  const donationAmount = customAmount ? parseInt(customAmount) : (selectedAmount || 3000);
  const tipAmount = Math.floor((donationAmount * tipPercentage) / 100);
  const totalAmount = donationAmount + tipAmount;

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    // Allow empty or any numeric input while typing (validate min amount on submit)
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
      // Clear preset selection when typing custom amount
      if (value) setSelectedAmount(null);
    }
  };
// Razorpay script loader
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

  // validation
  if (customAmount && parseInt(customAmount) < 300) {
    alert("Minimum donation amount is ₹300");
    return;
  }

  if (!citizenConfirmed) {
    alert("Please confirm you are an Indian citizen");
    return;
  }

  // 1️⃣ CREATE ORDER
  let orderData;

  try {
    const res = await fetch(`${API_BASE_URL}/api/payment/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  // 2️⃣ OPEN RAZORPAY
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

        // 3️⃣ VERIFY PAYMENT
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

        alert("Payment successful 🎉");

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
    theme: { color: "#ff4757" },
  };

  if (window.Razorpay) {
    const rzp = new window.Razorpay(options);
    rzp.open();
  } else {
    alert("Razorpay SDK not loaded");
  }
};

  return (
    <div className="donate-page">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .donate-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          background: #f8f8f8;
          min-height: 100vh;
          padding: 40px 20px;
        }

        .donate-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
          align-items: start;
        }

        /* LEFT COLUMN - FORM */
        .donation-form {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .form-section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 20px 0;
        }

        .amount-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .amount-btn {
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          transition: all 0.2s;
          position: relative;
        }

        .amount-btn:hover {
          border-color: #ff4757;
        }

        .amount-btn.selected {
          border-color: #ff4757;
          background: #fff5f5;
          color: #ff4757;
        }

        .popular-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #ff4757;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .custom-amount-box {
          margin-bottom: 24px;
        }

        .custom-amount-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
          outline: none;
          transition: border 0.2s;
        }

        .custom-amount-input:focus {
          border-color: #ff4757;
        }

        .custom-amount-label {
          display: block;
          font-size: 13px;
          color: #888;
          margin-top: 6px;
        }

        .tip-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 16px;
        }

        .tip-row-label {
          font-size: 15px;
          color: #666;
        }

        .tip-dropdown {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tip-select {
          padding: 6px 10px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          outline: none;
          background: white;
        }

        .tip-amount {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          min-width: 40px;
          text-align: right;
        }

        .gift-card-link {
          font-size: 14px;
          color: #ff4757;
          cursor: pointer;
          margin-bottom: 20px;
          text-decoration: underline;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding: 12px 0;
        }

        .checkbox-group input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #ff4757;
        }

        .checkbox-group label {
          font-size: 15px;
          color: #333;
          cursor: pointer;
          margin: 0;
        }

        .details-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #f0f0f0;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d0d0d0;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border 0.2s;
        }

        .form-group input:focus {
          border-color: #ff4757;
        }

        .phone-input-group {
          display: flex;
          gap: 8px;
        }

        .phone-code {
          display: flex;
          align-items: center;
          padding: 10px 12px;
          border: 1px solid #d0d0d0;
          border-radius: 6px;
          background: #f9f9f9;
          font-size: 14px;
          color: #666;
          min-width: 50px;
        }

        .phone-input-group input {
          flex: 1;
        }

        .form-group-inline {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* RIGHT COLUMN - NGO CARD */
        .ngo-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .ngo-image {
          width: 100%;
          height: 280px;
          object-fit: cover;
          background: #f5f5f5;
        }

        .ngo-details {
          padding: 24px;
        }

        .ngo-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .donation-summary {
          background: #f9f9f9;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 15px;
        }

        .summary-row:last-child {
          margin-bottom: 0;
        }

        .summary-row.total {
          border-top: 1px solid #e0e0e0;
          padding-top: 12px;
          margin-top: 12px;
          font-weight: 600;
          font-size: 16px;
          color: #1a1a1a;
        }

        .summary-label {
          color: #666;
        }

        .summary-value {
          font-weight: 600;
          color: #333;
        }

        .tax-certificate-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .tax-certificate-checkbox input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #ff4757;
        }

        .tax-certificate-checkbox label {
          font-size: 14px;
          color: #666;
          cursor: pointer;
          margin: 0;
        }

        .proceed-btn {
          width: 100%;
          padding: 14px;
          background: #ff4757;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .proceed-btn:hover {
          background: #ff3838;
        }

        .secure-badge {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          font-size: 13px;
          color: #888;
        }

        @media (max-width: 1024px) {
          .donate-wrapper {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .donation-form {
            padding: 24px;
          }

          .amount-grid {
            grid-template-columns: 1fr 1fr;
          }

          .form-group-inline {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="donate-wrapper">
        {/* LEFT - DONATION FORM */}
        <form className="donation-form" onSubmit={handleProceedPayment}>
          <h2 className="form-section-title">Donation amount</h2>

          {/* Amount Preset Buttons */}
          <div className="amount-grid">
            <button
              type="button"
              className={`amount-btn ${selectedAmount === 5000 && !customAmount ? "selected" : ""}`}
              onClick={() => handleAmountClick(5000)}
            >
              ₹5,000
            </button>
            <button
              type="button"
              className={`amount-btn ${selectedAmount === 3000 && !customAmount ? "selected" : ""}`}
              onClick={() => handleAmountClick(3000)}
            >
              <span className="popular-badge">Popular</span>
              ₹3,000
            </button>
            <button
              type="button"
              className={`amount-btn ${selectedAmount === 1500 && !customAmount ? "selected" : ""}`}
              onClick={() => handleAmountClick(1500)}
            >
              ₹1,500
            </button>
          </div>

          {/* Custom Amount */}
          <div className="custom-amount-box">
            <input
              type="number"
              className="custom-amount-input"
              placeholder="Other amount - ₹300 or more"
              value={customAmount}
              onChange={handleCustomAmountChange}
            />
          </div>

          {/* Tip Section */}
          <div className="tip-section">
            <label className="tip-row-label">Give Tip:</label>
            <div className="tip-dropdown">
              <select
                className="tip-select"
                value={tipPercentage}
                onChange={(e) => setTipPercentage(parseInt(e.target.value))}
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={8}>8%</option>
                <option value={10}>10%</option>
                <option value={15}>15%</option>
              </select>
              <div className="tip-amount">₹{tipAmount}</div>
            </div>
          </div>

          {/* Gift Card Link */}
          <div className="gift-card-link">Have a gift card?</div>

          {/* Indian Citizen Checkbox */}
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="citizen-confirm"
              checked={citizenConfirmed}
              onChange={(e) => setCitizenConfirmed(e.target.checked)}
            />
            <label htmlFor="citizen-confirm">I confirm that I am an Indian citizen</label>
          </div>

          {/* Your Details Section */}
          <div className="details-section">
            <h3 className="form-section-title">Your Details</h3>

            {/* Full Name */}
            <div className="form-group">
              <label>Full Name*</label>
              <input
                type="text"
                placeholder="eg. Raghu Kumar"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
            </div>

            {/* Anonymity Checkbox */}
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <label htmlFor="anonymous">Make my donation anonymous</label>
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label>Mobile Number*</label>
              <div className="phone-input-group">
                <div className="phone-code">🇮🇳 +91</div>
                <input
                  type="tel"
                  placeholder="10 digits"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.slice(0, 10))}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email*</label>
              <input
                type="email"
                placeholder="eg. raghukumar@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Billing Address & Pincode */}
            <div className="form-group">
              <label>Billing Address*</label>
              <input
                type="text"
                placeholder="eg. 24, Ganesha Layout, Bengaluru"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group-inline">
              <div className="form-group">
                <label>Pincode*</label>
                <input
                  type="text"
                  placeholder="eg. 560001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.slice(0, 6))}
                />
              </div>
              <div className="form-group">
                <label>PAN Number</label>
                <input
                  type="text"
                  placeholder="eg. ABCTY1234D"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                />
              </div>
            </div>

            <p style={{ fontSize: "12px", color: "#888", margin: "8px 0 16px" }}>
              Govt. mandates donor address collection
            </p>
            {panNumber && <p style={{ fontSize: "12px", color: "#888", margin: "0 0 16px" }}>
              Required to claim tax exemption
            </p>}

            {/* Notification Checkbox */}
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="notification"
                checked={wantsNotification}
                onChange={(e) => setWantsNotification(e.target.checked)}
              />
              <label htmlFor="notification">Send me updates and notifications via WhatsApp/SMS</label>
            </div>
          </div>

          {/* Button at bottom of form */}
          <button type="submit" className="proceed-btn">
            Proceed to pay ₹{totalAmount.toLocaleString('en-IN')} →
          </button>

          <div className="secure-badge">
            <FaLock size={10} /> All payments go through a secure gateway
          </div>
        </form>

        {/* RIGHT - NGO CARD */}
        <div className="ngo-card">
          <img src={serviceImage} alt="Service" className="ngo-image" />

          <div className="ngo-details">
            <h3 className="ngo-title">{serviceTitle}</h3>

            <div className="donation-summary">
              <div className="summary-row">
                <span className="summary-label">Donation Amount</span>
                <span className="summary-value">₹{donationAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Give Tip: {tipPercentage} %</span>
                <span className="summary-value">₹{tipAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row total">
                <span>Total Donation</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="tax-certificate-checkbox">
              <input
                type="checkbox"
                id="tax-certificate"
                checked={wantsTaxCertificate}
                onChange={(e) => setWantsTaxCertificate(e.target.checked)}
              />
              <label htmlFor="tax-certificate">Get Indian tax certificate for your donation</label>
            </div>

            <button type="submit" className="proceed-btn" onClick={handleProceedPayment}>
              Proceed to pay ₹{totalAmount.toLocaleString('en-IN')} →
            </button>

            <div className="secure-badge">
              <FaLock size={10} /> All payments go through a secure gateway
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
