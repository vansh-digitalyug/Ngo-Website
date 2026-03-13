import React, { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaCheckCircle, FaLock } from "react-icons/fa";
import cowImage from "../../../assets/images/elderly/elder.png";
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const Donate = () => {
  const location = useLocation();
  const serviceImage = location.state?.serviceImage || cowImage;
  const serviceTitle = location.state?.serviceTitle || "General Donation";
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

  // Pre-fill from logged-in user profile
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;
      if (user.name)    setDonorName(user.name);
      if (user.email)   setEmail(user.email);
      if (user.phone)   setMobile(user.phone.replace(/^\+91/, "").replace(/\D/g, "").slice(0, 10));
      if (user.address) setAddress(user.address);
    } catch {}
  }, []);

  // Calculate amounts
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

    if (customAmount && parseInt(customAmount) < 1000) {
      alert("Minimum donation amount is ₹1,000");
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
    <div className="min-h-screen bg-gray-100 py-10 px-5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT - DONATION FORM (spans 2 columns on lg) */}
        <form className="lg:col-span-2 bg-white p-8 md:p-10 rounded-xl shadow-lg" onSubmit={handleProceedPayment}>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Donation amount</h2>

          {/* Amount Preset Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              className={`py-4 px-3 border-2 rounded-lg font-bold transition-all cursor-pointer ${
                selectedAmount === 5000 && !customAmount
                  ? 'border-red-500 bg-red-50 text-red-500'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-red-500'
              }`}
              onClick={() => handleAmountClick(5000)}
            >
              ₹5,000
            </button>
            <button
              type="button"
              className={`py-4 px-3 border-2 rounded-lg font-bold transition-all cursor-pointer relative ${
                selectedAmount === 3000 && !customAmount
                  ? 'border-red-500 bg-red-50 text-red-500'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-red-500'
              }`}
              onClick={() => handleAmountClick(3000)}
            >
              {selectedAmount === 3000 && !customAmount && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  Popular
                </span>
              )}
              ₹3,000
            </button>
            <button
              type="button"
              className={`py-4 px-3 border-2 rounded-lg font-bold transition-all cursor-pointer ${
                selectedAmount === 1500 && !customAmount
                  ? 'border-red-500 bg-red-50 text-red-500'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-red-500'
              }`}
              onClick={() => handleAmountClick(1500)}
            >
              ₹1,500
            </button>
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <input
              type="number"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-red-500 focus:outline-none transition-colors"
              placeholder="Other amount - ₹1,000 or more"
              value={customAmount}
              onChange={handleCustomAmountChange}
            />
          </div>

          {/* Indian Citizen Checkbox */}
          <div className="flex items-center gap-3 mb-6 py-3">
            <input
              type="checkbox"
              id="citizen-confirm"
              className="w-5 h-5 cursor-pointer accent-red-500 rounded"
              checked={citizenConfirmed}
              onChange={(e) => setCitizenConfirmed(e.target.checked)}
            />
            <label htmlFor="citizen-confirm" className="text-sm text-gray-700 cursor-pointer">
              I confirm that I am an Indian citizen
            </label>
          </div>

          {/* Your Details Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Details</h3>

            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name*</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-red-500 focus:outline-none transition-colors"
                placeholder="eg. Raghu Kumar"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
            </div>

            {/* Anonymity Checkbox */}
            <div className="flex items-center gap-3 mb-6 py-3">
              <input
                type="checkbox"
                id="anonymous"
                className="w-5 h-5 cursor-pointer accent-red-500 rounded"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700 cursor-pointer">
                Make my donation anonymous
              </label>
            </div>

            {/* Mobile Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number*</label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-600 whitespace-nowrap">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="10 digits"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.slice(0, 10))}
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
              <input
                type="email"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-red-500 focus:outline-none transition-colors"
                placeholder="eg. raghukumar@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Billing Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address*</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-red-500 focus:outline-none transition-colors"
                placeholder="eg. 24, Ganesha Layout, Bengaluru"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Pincode & PAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode*</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="eg. 560001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.slice(0, 6))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="eg. ABCTY1234D"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Govt. mandates donor address collection
            </p>
            {panNumber && (
              <p className="text-xs text-gray-500 mb-4">
                Required to claim tax exemption
              </p>
            )}

            {/* Notification Checkbox */}
            <div className="flex items-center gap-3 mb-6 py-3">
              <input
                type="checkbox"
                id="notification"
                className="w-5 h-5 cursor-pointer accent-red-500 rounded"
                checked={wantsNotification}
                onChange={(e) => setWantsNotification(e.target.checked)}
              />
              <label htmlFor="notification" className="text-sm text-gray-700 cursor-pointer">
                Send me updates and notifications via WhatsApp/SMS
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-red-500 text-white rounded-md text-sm font-semibold cursor-pointer transition-colors hover:bg-red-600 active:bg-red-700"
          >
            Proceed to pay ₹{totalAmount.toLocaleString('en-IN')} →
          </button>

          <div className="flex justify-center items-center gap-2 mt-3 text-xs text-gray-500">
            <FaLock size={11} /> All payments go through a secure gateway
          </div>
        </form>

        {/* RIGHT - NGO CARD */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <img src={serviceImage} alt="Service" className="w-full h-72 object-cover bg-gray-200" />

          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 leading-snug">{serviceTitle}</h3>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-3 text-sm">
                <span className="text-gray-600">Donation Amount</span>
                <span className="font-semibold text-gray-800">₹{donationAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-300 pt-3 font-bold text-base text-gray-900">
                <span>Total Donation</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md mb-4">
              <input
                type="checkbox"
                id="tax-certificate"
                className="w-4 h-4 cursor-pointer accent-red-500 rounded"
                checked={wantsTaxCertificate}
                onChange={(e) => setWantsTaxCertificate(e.target.checked)}
              />
              <label htmlFor="tax-certificate" className="text-sm text-gray-600 cursor-pointer">
                Get Indian tax certificate for your donation
              </label>
            </div>

            <button
              type="button"
              className="w-full py-3.5 bg-red-500 text-white rounded-md text-sm font-semibold cursor-pointer transition-colors hover:bg-red-600 active:bg-red-700"
              onClick={handleProceedPayment}
            >
              Proceed to pay ₹{totalAmount.toLocaleString('en-IN')} →
            </button>

            <div className="flex justify-center items-center gap-2 mt-3 text-xs text-gray-500">
              <FaLock size={11} /> All payments go through a secure gateway
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
