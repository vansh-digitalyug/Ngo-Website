import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// --- CONSTANTS ---
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Lakshadweep", "Puducherry"
];

const INTEREST_AREAS = [
  "Orphanage Support", "Elderly Care", "Digital Literacy", "Fundraising",
  "Field Work", "Content / Social Media"
];

const PROFESSION_OPTIONS = [
  'Doctor',
  'Nurse / Healthcare Worker',
  'Teacher / Educator',
  'Engineer',
  'Lawyer / Legal Professional',
  'Social Worker',
  'Student',
  'Business Owner / Entrepreneur',
  'IT Professional',
  'Accountant / CA',
  'Farmer',
  'Government Employee',
  'NGO Worker',
  'Retired',
  'Homemaker',
  'Other'
];

const INITIAL_FORM_DATA = {
  fullName: "", email: "", phone: "", dob: "", gender: "", city: "", state: "",
  interests: [], mode: "", availability: "", duration: "",
  profession: "", education: "", occupation: "", skills: "", experience: "",
  idType: "", idNumber: "", emergencyName: "", emergencyPhone: "", bgCheck: false,
  motivation: "", declaration: false
};

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

// --- STYLES OBJECT ---
const styles = {
  container: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#333",
    lineHeight: "1.6",
    backgroundColor: "#fff",
  },
  // HERO
  hero: {
    position: "relative",
    height: "90vh",
    backgroundImage: "url('https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1600&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "white",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%)",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "900px",
    padding: "20px",
  },
  badge: {
    backgroundColor: "#ff9800",
    color: "#000",
    padding: "5px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: "0.85rem",
    marginBottom: "15px",
    display: "inline-block",
  },
  heroTitle: {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontWeight: "800",
    margin: "10px 0 20px 0",
    lineHeight: "1.2",
  },
  heroSubtitle: {
    fontSize: "1.25rem",
    maxWidth: "700px",
    margin: "0 auto 30px auto",
    opacity: "0.9",
  },
  btnGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    backgroundColor: "#2e7d32",
    color: "white",
    padding: "15px 35px",
    fontSize: "1.1rem",
    border: "none",
    borderRadius: "50px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(46, 125, 50, 0.4)",
    transition: "transform 0.2s",
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    color: "white",
    border: "2px solid white",
    padding: "15px 35px",
    fontSize: "1.1rem",
    borderRadius: "50px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  // COMMON SECTIONS
  section: {
    padding: "80px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  textCenter: {
    textAlign: "center",
    maxWidth: "800px",
    margin: "0 auto 50px auto",
  },
  sectionTitle: {
    fontSize: "2.2rem",
    color: "#1a1a1a",
    marginBottom: "15px",
    fontWeight: "700",
  },
  sectionText: {
    fontSize: "1.1rem",
    color: "#666",
  },
  separator: {
    width: "80px",
    height: "4px",
    backgroundColor: "#2e7d32",
    margin: "15px auto",
    borderRadius: "2px",
  },
  processGrid: {
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    flexWrap: "wrap",
    gap: "30px",
    marginTop: "40px",
  },
  featureCard: {
    flex: "1 1 220px",
    textAlign: "center",
    padding: "30px",
    backgroundColor: "#fff",
    borderRadius: "15px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
  },
  featureIcon: {
    fontSize: "2.5rem",
    marginBottom: "20px",
    display: "inline-block",
  },
  // OPPORTUNITY SECTION
  oppSection: {
    padding: "80px 20px",
    backgroundColor: "#f9f9f9", // Slight grey contrast
    // Using a container max-width directly in the grid style below
  },
  oppTitle: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#0B1C33",
    marginBottom: "10px",
  },
  underline: {
    width: "60px",
    height: "4px",
    background: "linear-gradient(90deg, #F26522, #4CAF50)",
    margin: "0 auto 15px auto",
    borderRadius: "2px",
  },
  oppSubtitle: {
    color: "#777",
    fontSize: "1.1rem",
  },
  oppGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
    maxWidth: "1300px",
    margin: "0 auto",
  },
  oppCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "30px 25px",
    borderLeft: "5px solid #F26522",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "280px",
    position: "relative",
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#0B1C33",
    marginBottom: "15px",
  },
  cardDesc: {
    color: "#555",
    fontSize: "0.95rem",
    marginBottom: "25px",
    lineHeight: "1.6",
    flexGrow: 1,
  },
  cardMeta: {
    borderTop: "1px solid #eee",
    paddingTop: "15px",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
  },
  pinIcon: { color: "#E91E63", fontSize: "1rem" },
  clockIcon: { color: "#555", fontSize: "1rem" },
  metaText: { fontSize: "0.9rem", color: "#666" },
  // FORM STYLING
  formSection: {
    backgroundImage: "linear-gradient(rgba(20, 80, 40, 0.85), rgba(10, 50, 20, 0.9)), url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80')",
    backgroundSize: "cover",
    backgroundAttachment: "fixed",
    backgroundPosition: "center",
    padding: "100px 20px",
    display: "flex",
    justifyContent: "center",
  },
  formWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(10px)",
    maxWidth: "850px",
    width: "100%",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  formHeader: {
    backgroundColor: "#f1f8e9",
    padding: "40px 30px",
    textAlign: "center",
    borderBottom: "1px solid #e0e0e0",
  },
  form: {
    padding: "40px",
  },
  fieldSet: {
    borderBottom: "1px solid #eee",
    paddingBottom: "30px",
    marginBottom: "30px",
  },
  sectionHeader: {
    color: "#2e7d32",
    fontSize: "1.3rem",
    marginBottom: "20px",
    borderLeft: "4px solid #ff9800",
    paddingLeft: "15px",
    fontWeight: "700",
  },
  row: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "15px",
  },
  inputGroup: {
    flex: "1 1 300px",
    display: "flex",
    flexDirection: "column",
    marginBottom: "10px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#333",
    display: "block",
  },
  input: {
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    backgroundColor: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  select: {
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    backgroundColor: "#fff",
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    backgroundColor: "#fff",
    minHeight: "100px",
    resize: "vertical",
    width: "100%",
    boxSizing: "border-box",
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginTop: "10px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "0.95rem",
    cursor: "pointer",
    color: "#444",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    marginRight: "10px",
    cursor: "pointer",
    accentColor: "#2e7d32",
  },
  errorMsg: {
    color: "#d32f2f",
    fontSize: "0.8rem",
    marginTop: "5px",
    fontWeight: "500",
  },
  submitBtn: {
    width: "100%",
    padding: "18px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
    boxShadow: "0 4px 6px rgba(46, 125, 50, 0.2)",
    transition: "background 0.3s, transform 0.2s",
  },
  submitBtnDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  successMsg: {
    color: "#166534",
    fontSize: "0.92rem",
    marginTop: "10px",
    textAlign: "center",
    fontWeight: "600",
  },
  faqTitle: {
    textAlign: "center",
    fontSize: "2rem",
    marginBottom: "50px",
    fontWeight: "700",
    color: "#1a1a1a",
  },
  faqGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
  },
  faqItem: {
    backgroundColor: "#fafafa",
    padding: "30px",
    borderRadius: "12px",
    borderLeft: "5px solid #2e7d32",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }
};

function Volunteer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [applicationLocked, setApplicationLocked] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [volunteerStatus, setVolunteerStatus] = useState(null);
  const [statusChecked, setStatusChecked] = useState(false);

  // Block access if already approved or pending
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setStatusChecked(true); return; }
    fetch(`${API_BASE_URL}/api/volunteer/status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.hasApplied) setVolunteerStatus(data.status);
      })
      .catch(() => {})
      .finally(() => setStatusChecked(true));
  }, []);

  // ✅ AUTO-FILL: Fetch logged-in user data and populate common fields
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // Not logged in, don't auto-fill

    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) {
          console.log("Could not fetch user profile for auto-fill");
          return;
        }

        const data = await res.json();
        if (data?.success && data?.data) {
          const user = data.data;
          
          // Auto-fill common fields from User profile
          setFormData(prev => ({
            ...prev,
            email: user.email || prev.email,
            phone: user.phone || prev.phone,
            city: user.city || prev.city,
            state: user.state || prev.state
          }));

          console.log("✅ Auto-filled common fields from user profile: email, phone, city, state");
        }
      } catch (err) {
        console.log("Auto-fill error (non-blocking):", err.message);
      }
    };

    fetchUserData();
  }, []);

  // --- KYC Verification State ---
  const [idVerified, setIdVerified] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycMessage, setKycMessage] = useState({ type: "", text: "" });
  // Aadhaar OTP flow
  const [aadhaarRefId, setAadhaarRefId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  // PAN extra fields
  const [panName, setPanName] = useState("");
  const [panDob, setPanDob] = useState("");

  // --- Phone OTP State ---
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpValue, setPhoneOtpValue] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState("");
  const [phoneOtpSuccess, setPhoneOtpSuccess] = useState("");
  const [phoneOtpCooldown, setPhoneOtpCooldown] = useState(0);

  const startPhoneCooldown = () => {
    setPhoneOtpCooldown(60);
    const timer = setInterval(() => {
      setPhoneOtpCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendPhoneOtp = async () => {
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: "Enter a valid 10-digit number before sending OTP" }));
      return;
    }
    setPhoneOtpLoading(true);
    setPhoneOtpError("");
    setPhoneOtpSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/otp/send-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setPhoneOtpSent(true);
      setPhoneOtpSuccess("OTP sent! Check your phone.");
      startPhoneCooldown();
    } catch (err) {
      setPhoneOtpError(err.message);
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtpValue || phoneOtpValue.length < 6) {
      setPhoneOtpError("Enter the 6-digit OTP");
      return;
    }
    setPhoneOtpLoading(true);
    setPhoneOtpError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/otp/verify-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, otp: phoneOtpValue }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Verification failed");
      setPhoneVerified(true);
      setPhoneOtpSent(false);
      setPhoneOtpSuccess("✓ Phone number verified!");
      setPhoneOtpError("");
    } catch (err) {
      setPhoneOtpError(err.message);
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const resetKycState = () => {
    setIdVerified(false);
    setKycLoading(false);
    setKycMessage({ type: "", text: "" });
    setAadhaarRefId("");
    setOtpSent(false);
    setOtpValue("");
    setPanName("");
    setPanDob("");
  };

  // --- Aadhaar: Request OTP ---
  const handleAadhaarSendOtp = async () => {
    const raw = formData.idNumber.replace(/\s/g, "");
    if (!/^[2-9]\d{11}$/.test(raw)) {
      setKycMessage({ type: "error", text: "Enter a valid 12-digit Aadhaar number first." });
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) { setKycMessage({ type: "error", text: "Please log in first." }); return; }

    setKycLoading(true);
    setKycMessage({ type: "", text: "" });
    try {
      const res = await fetch(`${API_BASE_URL}/api/kyc/aadhaar-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ aadhaarNumber: raw })
      });
      const data = await res.json();
      if (data.success) {
        setAadhaarRefId(data.data?.reference_id || "");
        setOtpSent(true);
        setKycMessage({ type: "success", text: "OTP sent to your Aadhaar-linked mobile number." });
      } else {
        setKycMessage({ type: "error", text: data.message || "Failed to send OTP." });
      }
    } catch {
      setKycMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setKycLoading(false);
    }
  };

  // --- Aadhaar: Verify OTP ---
  const handleAadhaarVerifyOtp = async () => {
    if (!otpValue || otpValue.length < 4) {
      setKycMessage({ type: "error", text: "Please enter the OTP." });
      return;
    }
    const token = localStorage.getItem("token");
    setKycLoading(true);
    setKycMessage({ type: "", text: "" });
    try {
      const res = await fetch(`${API_BASE_URL}/api/kyc/verify-aadhaar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ reference_id: aadhaarRefId, otp: otpValue })
      });
      const data = await res.json();
      if (data.success) {
        setIdVerified(true);
        setKycMessage({ type: "success", text: "Aadhaar verified successfully! ✅" });
      } else {
        setKycMessage({ type: "error", text: data.message || "OTP verification failed." });
      }
    } catch {
      setKycMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setKycLoading(false);
    }
  };

  // --- PAN: Verify ---
  const handlePanVerify = async () => {
    const pan = formData.idNumber.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      setKycMessage({ type: "error", text: "Enter a valid PAN number first." });
      return;
    }
    if (!panName.trim()) {
      setKycMessage({ type: "error", text: "Enter your name as per PAN card." });
      return;
    }
    if (!panDob) {
      setKycMessage({ type: "error", text: "Enter your date of birth as per PAN card." });
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) { setKycMessage({ type: "error", text: "Please log in first." }); return; }

    // Convert from YYYY-MM-DD to DD/MM/YYYY format expected by Sandbox API
    const [y, m, d] = panDob.split("-");
    const dobFormatted = `${d}/${m}/${y}`;

    setKycLoading(true);
    setKycMessage({ type: "", text: "" });
    try {
      const res = await fetch(`${API_BASE_URL}/api/kyc/verify-pan`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ pan, nameAsPerPan: panName.trim(), dateOfBirth: dobFormatted })
      });
      const data = await res.json();
      if (data.success) {
        setIdVerified(true);
        setKycMessage({ type: "success", text: "PAN verified successfully! ✅" });
      } else {
        setKycMessage({ type: "error", text: data.message || "PAN verification failed. Check your details." });
      }
    } catch {
      setKycMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setKycLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox" && name === "interests") {
      let updatedInterests = [...formData.interests];
      if (checked) {
        updatedInterests.push(value);
      } else {
        updatedInterests = updatedInterests.filter((item) => item !== value);
      }
      setFormData({ ...formData, interests: updatedInterests });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (name === "idType") {
      // Reset idNumber and KYC state when user changes ID type
      setFormData({ ...formData, idType: value, idNumber: "" });
      setErrors((prev) => ({ ...prev, idType: "", idNumber: "", submit: "" }));
      resetKycState();
      return;
    } else if (name === "idNumber") {
      // If user edits idNumber after verification, reset verification
      if (idVerified) resetKycState();
      // Format based on selected ID type
      let formatted = value;
      if (formData.idType === "Aadhaar") {
        // Allow only digits, max 12
        formatted = value.replace(/\D/g, "").slice(0, 12);
      } else if (formData.idType === "PAN") {
        // Uppercase alphanumeric, max 10, enforce ABCDE1234F pattern as user types
        formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
      }
      setFormData({ ...formData, [name]: formatted });
    } else if (name === "phone") {
      // Reset phone OTP if user changes the number
      if (phoneVerified || phoneOtpSent) {
        setPhoneVerified(false);
        setPhoneOtpSent(false);
        setPhoneOtpValue("");
        setPhoneOtpError("");
        setPhoneOtpSuccess("");
      }
      setFormData({ ...formData, [name]: value.replace(/\D/g, "").slice(0, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (successMessage) {
      setSuccessMessage("");
    }

    if (errors[name] || errors.submit) {
      setErrors({ ...errors, [name]: "", submit: "" });
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.match(/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/)) newErrors.email = "Invalid email address";
    if (!formData.phone.match(/^[0-9]{10}$/)) {
      newErrors.phone = "Enter a valid 10-digit number";
    } else if (!phoneVerified) {
      newErrors.phone = "Please verify your phone number with OTP";
    }
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (formData.interests.length === 0) newErrors.interests = "Select at least one area of interest";
    if (!formData.profession) newErrors.profession = "Profession is required";
    if (!formData.motivation.trim()) newErrors.motivation = "Please tell us why you want to join";
    if (!formData.idType) newErrors.idType = "ID Type is required";
    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "ID Number is required";
    } else if (formData.idType === "Aadhaar") {
      // Aadhaar: exactly 12 digits, must not start with 0 or 1
      if (!/^[2-9]\d{11}$/.test(formData.idNumber.trim())) {
        newErrors.idNumber = "Enter a valid 12-digit Aadhaar number (must not start with 0 or 1)";
      }
    } else if (formData.idType === "PAN") {
      // PAN: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.idNumber.trim())) {
        newErrors.idNumber = "Enter a valid PAN number (e.g., ABCDE1234F)";
      }
    }

    if (!idVerified) {
      newErrors.idVerify = "Please verify your ID before submitting";
    }

    if (!formData.declaration) newErrors.declaration = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildVolunteerPayload = () => {
    return {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      dob: formData.dob,
      city: formData.city.trim(),
      state: formData.state,
      interests: formData.interests,
      mode: formData.mode || "On-site",
      availability: formData.availability || "Flexible",
      profession: formData.profession,
      occupation: formData.occupation.trim(),
      education: formData.education || "",
      skills: formData.skills.trim(),
      idType: formData.idType,
      idNumber: formData.idNumber.trim(),
      emergencyName: formData.emergencyName.trim(),
      emergencyPhone: formData.emergencyPhone.trim(),
      bgCheck: Boolean(formData.bgCheck),
      motivation: formData.motivation.trim(),
      declaration: Boolean(formData.declaration)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    if (applicationLocked) {
      const message = "You have already submitted a volunteer application.";
      setErrors((prev) => ({ ...prev, submit: message }));
      document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!validateForm()) {
      document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      const message = "Please log in again to submit your volunteer application.";
      setErrors((prev) => ({ ...prev, submit: message }));
      return;
    }

    setSubmitLoading(true);
    setErrors((prev) => ({ ...prev, submit: "" }));

    try {
      const payload = buildVolunteerPayload();
      const res = await fetch(`${API_BASE_URL}/api/volunteer/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201 && data?.success) {
        setApplicationLocked(true);
        setSuccessMessage(data.message || "Volunteer application submitted successfully.");
        setFormData(INITIAL_FORM_DATA);
        setErrors({});
        resetKycState();
        document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      if (res.status === 409) {
        const message = data?.message || "You have already submitted a volunteer application.";
        setApplicationLocked(true);
        setErrors((prev) => ({ ...prev, submit: message }));
        document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      if (res.status === 401) {
        const message = data?.message || "Unauthorized. Please login first.";
        setErrors((prev) => ({ ...prev, submit: message }));
        return;
      }

      throw new Error(data?.message || "Unable to submit volunteer application right now.");
    } catch (error) {
      const message = error?.message || "Network error. Please try again.";
      setErrors((prev) => ({ ...prev, submit: message }));
      document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("apply-form").scrollIntoView({ behavior: "smooth" });
  };

  // Show nothing while checking status
  if (!statusChecked) return null;

  // Block access if already approved or pending
  if (volunteerStatus === "Approved" || volunteerStatus === "Pending") {
    const isApproved = volunteerStatus === "Approved";
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>{isApproved ? "🎉" : "⏳"}</div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a2d5a", marginBottom: "12px" }}>
            {isApproved ? "You're Already a Volunteer!" : "Application Under Review"}
          </h2>
          <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: "28px" }}>
            {isApproved
              ? "Your volunteer application has been approved. Thank you for being part of SevaIndia!"
              : "Your volunteer application has been submitted and is currently being reviewed. We'll notify you once it's approved."}
          </p>
          <Link to="/" style={{ display: "inline-block", background: "#1a2d5a", color: "#fff", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", fontWeight: 700 }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* --- CSS INJECTION FOR ANIMATIONS --- */}
      <style>{`
        /* Fade Up Entrance */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Pulse for Icons */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        /* --- FEATURE CARDS --- */
        .feature-card {
          animation: fadeInUp 0.8s ease-out forwards;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(46, 125, 50, 0.15) !important;
          border-color: #2e7d32 !important;
        }
        .feature-card:hover .feature-icon {
          animation: pulse 1s infinite;
        }

        /* --- OPPORTUNITY CARDS (Enhanced) --- */
        .opp-card {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0; /* Hidden initially */
          transition: all 0.4s ease;
        }
        
        /* Staggered Delays for 4 cards */
        .opp-card:nth-child(1) { animation-delay: 0.1s; }
        .opp-card:nth-child(2) { animation-delay: 0.3s; }
        .opp-card:nth-child(3) { animation-delay: 0.5s; }
        .opp-card:nth-child(4) { animation-delay: 0.7s; }

        .opp-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15) !important;
          border-left-color: #2e7d32 !important; /* Switch from Orange to Green on hover */
        }
        
        /* Button Hovers */
        .primary-btn:hover {
           background-color: #1b5e20 !important;
           transform: translateY(-2px);
           box-shadow: 0 8px 25px rgba(46, 125, 50, 0.5) !important;
        }
        .secondary-btn:hover {
           background-color: rgba(255,255,255,0.15) !important;
        }
      `}</style>

      {/* HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <span style={styles.badge}>Join the Movement</span>
          <h1 style={styles.heroTitle}>Your Time Can Rewrite Someone's Destiny</h1>
          <p style={styles.heroSubtitle}>
            We don't just need your money. We need your heart, your skills, and your voice.
            Join 5,000+ changemakers across India.
          </p>
          <div style={styles.btnGroup}>
            <button onClick={scrollToForm} style={styles.primaryBtn} className="primary-btn">
              Become a Volunteer
            </button>
            <button style={styles.secondaryBtn} className="secondary-btn">
              Watch Our Story ▷
            </button>
          </div>
        </div>
      </section>

      {/* WHY VOLUNTEER SECTION */}
      <section style={styles.section}>
        <div style={styles.textCenter}>
          <h2 style={styles.sectionTitle}>Why Volunteer With Us?</h2>
          <p style={styles.sectionText}>It’s not just about giving back; it’s about growing together.</p>
          <div style={styles.separator}></div>
        </div>

        <div style={styles.processGrid}>
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.featureIcon} className="feature-icon">❤️</div>
            <h3>Real Impact</h3>
            <p style={{marginTop: '10px', color: '#666'}}>See the direct result of your work in the smiles of the children.</p>
          </div>
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.featureIcon} className="feature-icon">🤝</div>
            <h3>Community</h3>
            <p style={{marginTop: '10px', color: '#666'}}>Network with a passionate family of over 5,000 like-minded changemakers.</p>
          </div>
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.featureIcon} className="feature-icon">🚀</div>
            <h3>Growth</h3>
            <p style={{marginTop: '10px', color: '#666'}}>Develop leadership, empathy, and professional management skills.</p>
          </div>
          <div style={styles.featureCard} className="feature-card">
            <div style={styles.featureIcon} className="feature-icon">📜</div>
            <h3>Recognition</h3>
            <p style={{marginTop: '10px', color: '#666'}}>Receive official certificates and letters of recommendation.</p>
          </div>
        </div>
      </section>

      {/* OPPORTUNITIES SECTION */}
      <section style={styles.oppSection}>
        <div style={styles.textCenter}>
          <h2 style={styles.oppTitle}>Volunteer Opportunities</h2>
          <div style={styles.underline}></div>
          <p style={styles.oppSubtitle}>Find the right fit for you</p>
        </div>

        <div style={styles.oppGrid}>
          {/* Card 1 */}
          <div style={styles.oppCard} className="opp-card">
            <div>
                <h3 style={styles.cardTitle}>Field Volunteers</h3>
                <p style={styles.cardDesc}>Work directly with communities in our project locations to drive change.</p>
            </div>
            <div style={styles.cardMeta}>
              <div style={styles.metaRow}><span style={styles.pinIcon}>📍</span> <span style={styles.metaText}>International</span></div>
              <div style={styles.metaRow}><span style={styles.clockIcon}>⏱️</span> <span style={styles.metaText}>2-12 weeks</span></div>
            </div>
          </div>
          {/* Card 2 */}
          <div style={styles.oppCard} className="opp-card">
            <div>
                <h3 style={styles.cardTitle}>Skills-Based</h3>
                <p style={styles.cardDesc}>Contribute your professional expertise (Tech, Legal, Medical) remotely.</p>
            </div>
            <div style={styles.cardMeta}>
              <div style={styles.metaRow}><span style={styles.pinIcon}>📍</span> <span style={styles.metaText}>Remote</span></div>
              <div style={styles.metaRow}><span style={styles.clockIcon}>⏱️</span> <span style={styles.metaText}>Flexible</span></div>
            </div>
          </div>
          {/* Card 3 */}
          <div style={styles.oppCard} className="opp-card">
            <div>
                <h3 style={styles.cardTitle}>Event Volunteers</h3>
                <p style={styles.cardDesc}>Help organize and manage large scale fundraising and awareness events.</p>
            </div>
            <div style={styles.cardMeta}>
              <div style={styles.metaRow}><span style={styles.pinIcon}>📍</span> <span style={styles.metaText}>Local</span></div>
              <div style={styles.metaRow}><span style={styles.clockIcon}>⏱️</span> <span style={styles.metaText}>Occasional</span></div>
            </div>
          </div>
          {/* Card 4 */}
          <div style={styles.oppCard} className="opp-card">
             <div>
                <h3 style={styles.cardTitle}>Campus Ambassador</h3>
                <p style={styles.cardDesc}>Represent HopeWorks at your school or university and build chapters.</p>
             </div>
            <div style={styles.cardMeta}>
              <div style={styles.metaRow}><span style={styles.pinIcon}>📍</span> <span style={styles.metaText}>Local</span></div>
              <div style={styles.metaRow}><span style={styles.clockIcon}>⏱️</span> <span style={styles.metaText}>5+ hours/month</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- APPLICATION FORM --- */}
      <section id="apply-form" style={styles.formSection}>
        <div style={styles.formWrapper}>
          <div style={styles.formHeader}>
            <h2 style={{margin: 0, color: '#2e7d32'}}>Volunteer Registration</h2>
            <p style={{margin: '10px 0 0', color: '#666'}}>Join the force of good. Please fill out the details below.</p>
          </div>

          <form style={styles.form} onSubmit={handleSubmit} noValidate>

              {/* SECTION 1: PERSONAL INFORMATION */}
              <div style={styles.fieldSet}>
                <h3 style={styles.sectionHeader}>1. Personal Information</h3>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Full Name *</label>
                    <input style={{ ...styles.input, borderColor: errors.fullName ? 'red' : '#ddd' }}
                      name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Rahul Sharma" />
                    {errors.fullName && <span style={styles.errorMsg}>{errors.fullName}</span>}
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Date of Birth *</label>
                    <input style={{ ...styles.input, borderColor: errors.dob ? 'red' : '#ddd' }}
                      type="date" name="dob" value={formData.dob} onChange={handleChange} />
                    {errors.dob && <span style={styles.errorMsg}>{errors.dob}</span>}
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email Address * <span style={{fontSize: '0.85rem', color: '#666'}}>(Linked to your account)</span></label>
                    <input 
                      style={{ ...styles.input, borderColor: '#ccc', backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      disabled
                      title="Email is linked to your account. Update it in your Profile if needed."
                    />
                    <small style={{color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>
                      💡 Tip: Update email in Profile → Personal Info if you need to change it
                    </small>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone Number * <span style={{fontSize: '0.85rem', color: '#666'}}>(Auto-filled)</span></label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <input
                        style={{ ...styles.input, borderColor: '#ccc', backgroundColor: '#f5f5f5', cursor: 'not-allowed', flex: 1 }}
                        type="tel" 
                        name="phone" 
                        value={formData.phone}
                        disabled
                        title="Phone is auto-filled from your profile. Update in Profile if needed."
                      />
                      {!phoneVerified && formData.phone && (
                        <button type="button" onClick={handleSendPhoneOtp}
                          disabled={phoneOtpLoading || phoneOtpCooldown > 0 || !formData.phone}
                          style={{ padding: "10px 14px", fontSize: "13px", whiteSpace: "nowrap", background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", cursor: phoneOtpLoading || phoneOtpCooldown > 0 || !formData.phone ? "not-allowed" : "pointer", opacity: phoneOtpLoading || phoneOtpCooldown > 0 || !formData.phone ? 0.6 : 1 }}>
                          {phoneOtpLoading ? "Sending..." : phoneOtpCooldown > 0 ? `Resend (${phoneOtpCooldown}s)` : phoneOtpSent ? "Resend OTP" : "Send OTP"}
                        </button>
                      )}
                      {phoneVerified && (
                        <span style={{ color: "#16a34a", fontWeight: 600, paddingTop: "10px", whiteSpace: "nowrap", fontSize: "14px" }}>✓ Verified</span>
                      )}
                    </div>

                    {/* OTP input row */}
                    {phoneOtpSent && !phoneVerified && (
                      <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
                        <input
                          type="text" value={phoneOtpValue} maxLength={6} placeholder="Enter 6-digit OTP"
                          onChange={e => { setPhoneOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6)); setPhoneOtpError(""); }}
                          style={{ ...styles.input, maxWidth: "160px" }}
                        />
                        <button type="button" onClick={handleVerifyPhoneOtp} disabled={phoneOtpLoading}
                          style={{ padding: "10px 14px", fontSize: "13px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", cursor: phoneOtpLoading ? "not-allowed" : "pointer" }}>
                          {phoneOtpLoading ? "Verifying..." : "Verify OTP"}
                        </button>
                      </div>
                    )}
                    {phoneOtpError && <span style={{ ...styles.errorMsg, display: "block", marginTop: "6px" }}>{phoneOtpError}</span>}
                    {phoneOtpSuccess && !phoneOtpError && <span style={{ color: "#16a34a", fontSize: "13px", display: "block", marginTop: "6px" }}>{phoneOtpSuccess}</span>}
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>City * <span style={{fontSize: '0.85rem', color: '#666'}}>(Auto-filled)</span></label>
                    <input 
                      style={{ ...styles.input, borderColor: '#ccc', backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                      name="city" 
                      value={formData.city} 
                      disabled
                      title="City is auto-filled from your profile. Update in Profile if needed."
                    />
                    <small style={{color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>
                      💡 Update in Profile → Personal Info if needed
                    </small>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>State * <span style={{fontSize: '0.85rem', color: '#666'}}>(Auto-filled)</span></label>
                    <select 
                      style={{ ...styles.select, borderColor: '#ccc', backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                      name="state" 
                      value={formData.state} 
                      disabled
                      title="State is auto-filled from your profile. Update in Profile if needed."
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                    <small style={{color: '#666', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>
                      💡 Update in Profile → Personal Info if needed
                    </small>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PREFERENCES */}
              <div style={styles.fieldSet}>
                <h3 style={styles.sectionHeader}>2. Volunteer Preferences</h3>
                <label style={styles.label}>Area of Interest (Select all that apply) *</label>
                <div style={styles.checkboxGrid}>
                  {INTEREST_AREAS.map((area) => (
                    <label key={area} style={styles.checkboxLabel}>
                      <input type="checkbox" name="interests" value={area}
                        checked={formData.interests.includes(area)} onChange={handleChange} style={styles.checkbox} />
                      {area}
                    </label>
                  ))}
                </div>
                {errors.interests && <span style={styles.errorMsg}>{errors.interests}</span>}
                <br />
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Preferred Mode</label>
                    <select style={styles.select} name="mode" value={formData.mode} onChange={handleChange}>
                      <option value="">Select Mode</option>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Availability</label>
                    <select style={styles.select} name="availability" value={formData.availability} onChange={handleChange}>
                      <option value="">Select Availability</option>
                      <option value="Weekdays">Weekdays</option>
                      <option value="Weekends">Weekends</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: SKILLS & EXPERIENCE */}
              <div style={styles.fieldSet}>
                <h3 style={styles.sectionHeader}>3. Skills & Experience</h3>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Profession *</label>
                    <select style={{...styles.select, borderColor: errors.profession ? 'red' : '#ddd'}} name="profession" value={formData.profession} onChange={handleChange}>
                      <option value="">Select Profession</option>
                      {PROFESSION_OPTIONS.map((prof) => <option key={prof} value={prof}>{prof}</option>)}
                    </select>
                    {errors.profession && <span style={styles.errorMsg}>{errors.profession}</span>}
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Highest Education</label>
                    <select style={styles.select} name="education" value={formData.education} onChange={handleChange}>
                      <option value="">Select Education</option>
                      <option value="High School">High School</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Current Occupation</label>
                    <input style={styles.input} name="occupation" value={formData.occupation} onChange={handleChange} placeholder="e.g. Senior Doctor at AIIMS" />
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Relevant Skills (comma separated)</label>
                  <input style={styles.input} name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. Photography, Teaching, Coding" />
                </div>
              </div>

              {/* SECTION 4: SAFETY & VERIFICATION */}
              <div style={styles.fieldSet}>
                <h3 style={styles.sectionHeader}>4. Safety & Verification</h3>
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>ID Type *</label>
                    <select style={{ ...styles.select, borderColor: errors.idType ? 'red' : '#ddd' }}
                      name="idType" value={formData.idType} onChange={handleChange} disabled={idVerified}>
                      <option value="">Select ID Type</option>
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="PAN">PAN Card</option>
                    </select>
                    {errors.idType && <span style={styles.errorMsg}>{errors.idType}</span>}
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      {formData.idType === "Aadhaar" ? "Aadhaar Number *" :
                       formData.idType === "PAN" ? "PAN Number *" :
                       "ID Number *"}
                    </label>
                    <input
                      style={{ ...styles.input, borderColor: errors.idNumber ? 'red' : '#ddd', letterSpacing: formData.idType === 'Aadhaar' ? '2px' : formData.idType === 'PAN' ? '1.5px' : 'normal' }}
                      name="idNumber"
                      value={formData.idType === "Aadhaar" && formData.idNumber.length > 0
                        ? formData.idNumber.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
                        : formData.idNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\s/g, "");
                        handleChange({ target: { name: "idNumber", value: raw, type: "text" } });
                      }}
                      placeholder={
                        formData.idType === "Aadhaar" ? "XXXX XXXX XXXX" :
                        formData.idType === "PAN" ? "ABCDE1234F" :
                        "Select ID type first"
                      }
                      maxLength={
                        formData.idType === "Aadhaar" ? 14 :
                        formData.idType === "PAN" ? 10 :
                        undefined
                      }
                      disabled={!formData.idType || idVerified}
                    />
                    {formData.idType === "Aadhaar" && !idVerified && (
                      <small style={{ color: '#666', marginTop: '4px', fontSize: '0.78rem' }}>12-digit Aadhaar number (must not start with 0 or 1)</small>
                    )}
                    {formData.idType === "PAN" && !idVerified && (
                      <small style={{ color: '#666', marginTop: '4px', fontSize: '0.78rem' }}>Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)</small>
                    )}
                    {errors.idNumber && <span style={styles.errorMsg}>{errors.idNumber}</span>}
                  </div>
                </div>

                {/* ─── Aadhaar OTP Verification Flow ─── */}
                {formData.idType === "Aadhaar" && !idVerified && (
                  <div style={{ padding: '16px', backgroundColor: '#f0f7ff', borderRadius: '10px', marginTop: '8px', border: '1px solid #bfdbfe' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: '600', color: '#1e40af', fontSize: '0.9rem' }}>
                      🔐 Aadhaar OTP Verification
                    </p>
                    {!otpSent ? (
                      <div>
                        <p style={{ margin: '0 0 10px', color: '#475569', fontSize: '0.84rem' }}>
                          An OTP will be sent to your Aadhaar-linked mobile number for verification.
                        </p>
                        <button
                          type="button"
                          onClick={handleAadhaarSendOtp}
                          disabled={kycLoading || formData.idNumber.length < 12}
                          style={{
                            padding: '10px 24px', backgroundColor: formData.idNumber.length < 12 ? '#94a3b8' : '#2563eb',
                            color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600',
                            cursor: formData.idNumber.length < 12 ? 'not-allowed' : 'pointer', fontSize: '0.88rem',
                            opacity: kycLoading ? 0.7 : 1
                          }}
                        >
                          {kycLoading ? "Sending OTP..." : "Send OTP"}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p style={{ margin: '0 0 10px', color: '#475569', fontSize: '0.84rem' }}>
                          Enter the OTP sent to your Aadhaar-linked mobile number.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="Enter OTP"
                            maxLength={6}
                            style={{
                              ...styles.input, width: '160px', letterSpacing: '4px', textAlign: 'center',
                              fontSize: '1.1rem', fontWeight: '600'
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAadhaarVerifyOtp}
                            disabled={kycLoading || otpValue.length < 4}
                            style={{
                              padding: '10px 24px', backgroundColor: otpValue.length < 4 ? '#94a3b8' : '#16a34a',
                              color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600',
                              cursor: otpValue.length < 4 ? 'not-allowed' : 'pointer', fontSize: '0.88rem',
                              opacity: kycLoading ? 0.7 : 1
                            }}
                          >
                            {kycLoading ? "Verifying..." : "Verify OTP"}
                          </button>
                          <button
                            type="button"
                            onClick={handleAadhaarSendOtp}
                            disabled={kycLoading}
                            style={{
                              padding: '10px 16px', backgroundColor: 'transparent', color: '#2563eb',
                              border: '1px solid #2563eb', borderRadius: '8px', fontWeight: '500',
                              cursor: 'pointer', fontSize: '0.82rem'
                            }}
                          >
                            Resend OTP
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── PAN Verification Flow ─── */}
                {formData.idType === "PAN" && !idVerified && (
                  <div style={{ padding: '16px', backgroundColor: '#fefce8', borderRadius: '10px', marginTop: '8px', border: '1px solid #fde68a' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: '600', color: '#854d0e', fontSize: '0.9rem' }}>
                      🔐 PAN Card Verification
                    </p>
                    <p style={{ margin: '0 0 12px', color: '#475569', fontSize: '0.84rem' }}>
                      Enter additional details to verify your PAN card.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ ...styles.label, fontSize: '0.82rem' }}>Name as per PAN *</label>
                        <input
                          type="text"
                          value={panName}
                          onChange={(e) => setPanName(e.target.value)}
                          placeholder="Full name on PAN card"
                          style={styles.input}
                          disabled={idVerified}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '180px' }}>
                        <label style={{ ...styles.label, fontSize: '0.82rem' }}>Date of Birth as per PAN *</label>
                        <input
                          type="date"
                          value={panDob}
                          onChange={(e) => setPanDob(e.target.value)}
                          style={styles.input}
                          disabled={idVerified}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handlePanVerify}
                      disabled={kycLoading || formData.idNumber.length < 10 || !panName.trim() || !panDob}
                      style={{
                        padding: '10px 24px',
                        backgroundColor: (formData.idNumber.length < 10 || !panName.trim() || !panDob) ? '#94a3b8' : '#ca8a04',
                        color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600',
                        cursor: (formData.idNumber.length < 10 || !panName.trim() || !panDob) ? 'not-allowed' : 'pointer',
                        fontSize: '0.88rem', opacity: kycLoading ? 0.7 : 1
                      }}
                    >
                      {kycLoading ? "Verifying PAN..." : "Verify PAN"}
                    </button>
                  </div>
                )}

                {/* ─── KYC Status Message ─── */}
                {kycMessage.text && (
                  <div style={{
                    padding: '10px 16px', borderRadius: '8px', marginTop: '8px',
                    backgroundColor: kycMessage.type === "success" ? '#dcfce7' : '#fee2e2',
                    color: kycMessage.type === "success" ? '#166534' : '#991b1b',
                    fontSize: '0.85rem', fontWeight: '500'
                  }}>
                    {kycMessage.text}
                  </div>
                )}

                {/* ─── Verified Badge ─── */}
                {idVerified && (
                  <div style={{
                    padding: '14px 18px', backgroundColor: '#dcfce7', borderRadius: '10px',
                    marginTop: '8px', border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>✅</span>
                    <div>
                      <strong style={{ color: '#166534', fontSize: '0.92rem' }}>
                        {formData.idType} Verified Successfully
                      </strong>
                      <p style={{ margin: '2px 0 0', color: '#15803d', fontSize: '0.8rem' }}>
                        Your identity has been confirmed. You can now submit the form.
                      </p>
                    </div>
                  </div>
                )}

                {errors.idVerify && (
                  <span style={{ ...styles.errorMsg, display: 'block', marginTop: '8px' }}>{errors.idVerify}</span>
                )}
                <div style={styles.row}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Emergency Contact Name</label>
                    <input style={styles.input} name="emergencyName" value={formData.emergencyName} onChange={handleChange} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Emergency Contact Phone</label>
                    <input style={styles.input} name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} />
                  </div>
                </div>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" name="bgCheck" checked={formData.bgCheck} onChange={handleChange} style={styles.checkbox} />
                  I am willing to undergo background verification.
                </label>
              </div>

              {/* SECTION 5: MOTIVATION */}
              <div style={{ ...styles.fieldSet, borderBottom: 'none' }}>
                <h3 style={styles.sectionHeader}>5. Motivation & Agreement</h3>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Why do you want to volunteer? *</label>
                  <textarea style={{ ...styles.textarea, borderColor: errors.motivation ? 'red' : '#ddd' }}
                    name="motivation" value={formData.motivation} onChange={handleChange} rows="3" placeholder="Tell us about your motivation..."></textarea>
                  {errors.motivation && <span style={styles.errorMsg}>{errors.motivation}</span>}
                </div>
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
                  <label style={{ ...styles.checkboxLabel, fontWeight: '600' }}>
                    <input type="checkbox" name="declaration" checked={formData.declaration} onChange={handleChange} style={styles.checkbox} />
                    I confirm that the information provided is true and I agree to follow the NGO guidelines. *
                  </label>
                  {errors.declaration && <span style={styles.errorMsg}>{errors.declaration}</span>}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  ...styles.submitBtn,
                  ...(submitLoading || applicationLocked ? styles.submitBtnDisabled : {}),
                }}
                className="primary-btn"
                disabled={submitLoading || applicationLocked}
              >
                {submitLoading ? "Submitting..." : applicationLocked ? "Application Already Submitted" : "Submit Application"}
              </button>
              {successMessage && <div style={styles.successMsg}>{successMessage}</div>}
              {errors.submit && <div style={{ ...styles.errorMsg, marginTop: "10px", textAlign: 'center' }}>{errors.submit}</div>}
            </form>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section style={styles.section}>
        <h3 style={styles.faqTitle}>Frequently Asked Questions</h3>
        <div style={styles.faqGrid}>
          <div style={styles.faqItem}>
            <h4>❓ Do I need prior experience?</h4>
            <p style={{marginTop:'5px', color:'#666'}}>No! We provide a simple orientation training for all new volunteers.</p>
          </div>
          <div style={styles.faqItem}>
            <h4>❓ Can I volunteer remotely?</h4>
            <p style={{marginTop:'5px', color:'#666'}}>Yes, the "Skills-Based" program is designed specifically for remote work.</p>
          </div>
          <div style={styles.faqItem}>
            <h4>❓ What is the minimum time commitment?</h4>
            <p style={{marginTop:'5px', color:'#666'}}>It depends on the role, ranging from occasional events to 2-12 weeks for field work.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Volunteer;

