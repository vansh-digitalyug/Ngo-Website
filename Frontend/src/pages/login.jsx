import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { User, Building2, AlertTriangle } from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

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

  // Get password strength (weak, fair, good, strong)
  getPasswordStrength: (password) => {
    if (!password || password.length < 6) return "weak";
    if (password.length >= 6 && password.length < 8) return "fair";
    if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)) return "strong";
    if (/[a-z]/.test(password) && /[0-9]/.test(password)) return "good";
    return "fair";
  },

  // Get password strength color
  getPasswordStrengthColor: (strength) => {
    switch (strength) {
      case "strong":
        return { bg: "#dcfce7", text: "#166534", label: "Strong" };
      case "good":
        return { bg: "#fef3c7", text: "#92400e", label: "Good" };
      case "fair":
        return { bg: "#fee2e2", text: "#991b1b", label: "Fair" };
      default:
        return { bg: "#f3f4f6", text: "#6b7280", label: "Weak" };
    }
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

  // Validate password (min 6 chars)
  isValidPassword: (password) => password && password.length >= 6,

  // Validate OTP (6 digits)
  isValidOtp: (otp) => /^[0-9]{6}$/.test(otp),
};

/* ===========================
   VALIDATION FUNCTIONS
   =========================== */

const validateLoginForm = (loginData) => {
  const errors = {};

  if (!loginData.email.trim()) {
    errors.email = "Email is required.";
  } else if (!VALIDATION.isValidEmail(loginData.email)) {
    errors.email = "⚠️ Please enter a valid email address.";
  }

  if (!loginData.password.trim()) {
    errors.password = "Password is required.";
  } else if (loginData.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
};

const validateRegisterForm = (registerData) => {
  const errors = {};

  if (!registerData.name.trim()) {
    errors.name = "Your name is required.";
  } else if (!VALIDATION.isValidName(registerData.name)) {
    errors.name = "⚠️ Name must be 2-100 characters, start with a letter, no numbers.";
  }

  if (!registerData.email.trim()) {
    errors.email = "Email is required.";
  } else if (!VALIDATION.isValidEmail(registerData.email)) {
    errors.email = "⚠️ Please enter a valid email address.";
  }

  if (!registerData.password.trim()) {
    errors.password = "Password is required.";
  } else if (registerData.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!registerData.confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (registerData.password !== registerData.confirmPassword) {
    errors.confirmPassword = "⚠️ Passwords do not match.";
  }

  return errors;
};

const validateResetPasswordForm = (resetPasswordData) => {
  const errors = {};

  if (!resetPasswordData.password.trim()) {
    errors.password = "Password is required.";
  } else if (resetPasswordData.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!resetPasswordData.confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
    errors.confirmPassword = "⚠️ Passwords do not match.";
  }

  return errors;
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Derive loginType from URL path
  const loginType = location.pathname === "/login/ngo" ? "ngo" : "user";

  const getRedirectPath = () => {
    const candidate = location.state?.redirectTo;
    if (typeof candidate === "string" && candidate.startsWith("/") && !candidate.startsWith("/login")) {
      return candidate;
    }
    return "/";
  };

  // Login state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Register state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // OTP step for registration
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [registerOtp, setRegisterOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [resetErrors, setResetErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState("weak");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetPasswordData, setResetPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  /* ======================
      HANDLERS
     ====================== */

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    if (loginErrors[name]) {
      setLoginErrors({ ...loginErrors, [name]: "" });
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "name") {
      processedValue = VALIDATION.onlyTextNoNumbers(value);
    }

    if (name === "password") {
      const strength = VALIDATION.getPasswordStrength(processedValue);
      setPasswordStrength(strength);
    }

    setRegisterData({ ...registerData, [name]: processedValue });
    if (registerErrors[name]) {
      setRegisterErrors({ ...registerErrors, [name]: "" });
    }
  };

  const toggleMode = () => {
    setError("");
    setGoogleError("");
    setIsLogin(!isLogin);
    setLoginData({ email: "", password: "" });
    setRegisterData({ name: "", email: "", password: "", confirmPassword: "" });
    setLoginErrors({});
    setRegisterErrors({});
    setPasswordStrength("weak");
    setOtpSent(false);
    setRegisterOtp("");
    setOtpCountdown(0);
  };

  // Start OTP countdown timer
  const startOtpCountdown = (seconds) => {
    setOtpCountdown(seconds);
    const interval = setInterval(() => {
      setOtpCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendRegisterOtp = async () => {
    setError("");
    const { name, email } = registerData;
    if (!name.trim()) { setError("Please enter your full name first."); return; }
    if (!email.trim()) { setError("Please enter your email address first."); return; }

    setOtpSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/send-register-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to send OTP");

      setOtpSent(true);
      setRegisterOtp("");
      startOtpCountdown(data.data?.resendCooldownSeconds || 60);
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpSending(false);
    }
  };

  const openForgotPassword = () => {
    setError("");
    setForgotEmail(loginData.email || "");
    setForgotError("");
    setForgotSuccess("");
    setShowForgotModal(true);
  };

  const closeForgotModal = () => {
    if (forgotLoading) return;
    setShowForgotModal(false);

    if (new URLSearchParams(location.search).get("forgot") === "1") {
      navigate(`/login/${loginType}`, { replace: true });
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail.trim()) {
      setForgotError("Email is required");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to send reset link");
      }

      const message =
        data.message || "If this email exists, a reset link has been sent.";
      setForgotSuccess(message);

      setTimeout(() => {
        setShowForgotModal(false);
        if (new URLSearchParams(location.search).get("forgot") === "1") {
          navigate(`/login/${loginType}`, { replace: true });
        }
      }, 1400);
    } catch (err) {
      setForgotError(err.message || "Unable to send reset link");
    } finally {
      setForgotLoading(false);
    }
  };

  useEffect(() => {
    const tokenFromQuery = new URLSearchParams(location.search).get("resetToken");
    if (!tokenFromQuery) return;

    if (!isLogin) {
      setIsLogin(true);
    }

    setResetToken(tokenFromQuery);
    setResetError("");
    setResetSuccess("");
    setShowResetModal(true);
  }, [location.search, isLogin]);

  useEffect(() => {
    const forgotFlag = new URLSearchParams(location.search).get("forgot");
    if (forgotFlag !== "1") return;

    if (!isLogin) {
      setIsLogin(true);
    }

    setForgotError("");
    setForgotSuccess("");
    setShowForgotModal(true);
  }, [location.search, isLogin]);

  const closeResetModal = () => {
    if (resetLoading) return;

    setShowResetModal(false);
    setResetToken("");
    setResetPasswordData({ password: "", confirmPassword: "" });
    setResetError("");
    setResetSuccess("");

    if (new URLSearchParams(location.search).get("resetToken")) {
      navigate(`/login/${loginType}`, { replace: true });
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (!resetToken) {
      setResetError("Invalid reset token");
      return;
    }

    const errors = validateResetPasswordForm(resetPasswordData);
    if (Object.keys(errors).length > 0) {
      setResetErrors(errors);
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/reset-password/${encodeURIComponent(resetToken)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: resetPasswordData.password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to reset password");
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      if (data?.data) {
        localStorage.setItem("user", JSON.stringify(data.data));
      }
      window.dispatchEvent(new Event("authChanged"));

      setResetSuccess("Password reset successful. Redirecting to home...");

      sessionStorage.setItem(
        "flash_message",
        JSON.stringify({ type: "success", message: "Password reset successful. Logged in automatically." })
      );

      setTimeout(() => {
        setShowResetModal(false);
        navigate("/", { replace: true });
      }, 1500);
    } catch (err) {
      setResetError(err.message || "Unable to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const credential = String(credentialResponse?.credential || "").trim();
    if (!credential) {
      setGoogleError("Google sign-in failed. Please try again.");
      return;
    }

    setError("");
    setGoogleError("");
    setGoogleLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Google sign-in failed");
      }

      sessionStorage.setItem(
        "flash_message",
        JSON.stringify({ type: "success", message: "Logged in successfully." })
      );

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      if (data?.data) {
        localStorage.setItem("user", JSON.stringify(data.data));
      }

      window.dispatchEvent(new Event("authChanged"));
      navigate(getRedirectPath(), { replace: true });
    } catch (err) {
      setGoogleError(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setGoogleError("Google sign-in was cancelled or failed.");
  };

  /* ======================
      SUBMIT LOGIC
     ====================== */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGoogleError("");

    const errors = validateLoginForm(loginData);
    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...loginData, loginType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      localStorage.setItem("user", JSON.stringify(data.data));
      window.dispatchEvent(new Event("authChanged"));

      if (loginType === "ngo") {
        sessionStorage.setItem(
          "flash_message",
          JSON.stringify({ type: "success", message: "Welcome to NGO Dashboard!" })
        );
        if (data.data.ngoStatus === "pending") {
          navigate("/ngo/pending", { replace: true });
        } else {
          navigate("/ngo", { replace: true });
        }
      } else if (data.data.role === "admin") {
        sessionStorage.setItem(
          "flash_message",
          JSON.stringify({ type: "success", message: "Welcome Admin!" })
        );
        navigate("/admin", { replace: true });
      } else {
        sessionStorage.setItem(
          "flash_message",
          JSON.stringify({ type: "success", message: "Logged in successfully." })
        );
        navigate(getRedirectPath(), { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGoogleError("");

    const errors = validateRegisterForm(registerData);
    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    if (!otpSent) {
      setError("Please verify your email with an OTP first.");
      return;
    }

    if (!registerOtp.trim()) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    if (!VALIDATION.isValidOtp(registerOtp)) {
      setError("⚠️ OTP must be exactly 6 digits.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          otp: registerOtp.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      sessionStorage.setItem(
        "flash_message",
        JSON.stringify({ type: "success", message: "Account created successfully. Welcome to SevaIndia!" })
      );

      const payload = data.data || {};
      const token = payload.token || data.token;
      if (token) localStorage.setItem("token", token);
      const userData = { ...payload };
      delete userData.token;
      localStorage.setItem("user", JSON.stringify(userData));
      window.dispatchEvent(new Event("authChanged"));
      navigate(getRedirectPath(), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Icons as components for cleaner JSX
  const EyeOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  return (
    <div className="min-h-[calc(100vh-60px)] w-full bg-[#f0f2f5] flex items-stretch justify-center">
      <div className="flex w-full min-h-[calc(100vh-60px)] max-w-[1440px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden">

        {/* LEFT SIDE - IMAGE */}
        <div
          className="hidden lg:flex flex-1 bg-cover bg-center relative flex-col justify-end p-[60px] text-white"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1600&auto=format&fit=crop')" }}
        >
          <div className="relative z-[2] bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.85)] p-10 rounded-[20px]">
            <h1 className="text-5xl font-extrabold mb-4 -tracking-tight [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">SevaIndia</h1>
            <p className="text-xl leading-relaxed opacity-95 mb-8 italic [text-shadow:0_1px_5px_rgba(0,0,0,0.5)]">
              "Service to others is the rent you pay for your room here on earth."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-[45px] h-[45px] rounded-full bg-[#F26522] flex items-center justify-center font-bold text-[0.9rem] text-white shadow-md shrink-0">
                MA
              </div>
              <div className="text-[0.95rem] [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                <p className="font-bold m-0">Muhammad Ali</p>
                <p className="opacity-90 text-[0.85rem] m-0">Inspiration</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="flex-1 flex items-center justify-center px-5 py-8 sm:px-10 sm:py-10 bg-white">
          <div className="w-full max-w-[400px]">

            {/* LOGIN TYPE TABS */}
            {isLogin && (
              <div className="flex gap-2 sm:gap-2.5 mb-6">
                <button
                  type="button"
                  onClick={() => navigate("/login/user")}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 rounded-[10px] border-2 font-[inherit] text-[0.82rem] sm:text-[0.95rem] cursor-pointer transition-all
                    ${loginType === "user"
                      ? "border-[#2e7d32] bg-[#f0fdf4] text-[#2e7d32] font-semibold"
                      : "border-[#e0e0e0] bg-white text-[#666] font-medium"}`}
                >
                  <User size={16} />
                  <span>User Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login/ngo")}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 rounded-[10px] border-2 font-[inherit] text-[0.82rem] sm:text-[0.95rem] cursor-pointer transition-all
                    ${loginType === "ngo"
                      ? "border-[#2e7d32] bg-[#f0fdf4] text-[#2e7d32] font-semibold"
                      : "border-[#e0e0e0] bg-white text-[#666] font-medium"}`}
                >
                  <Building2 size={16} />
                  <span>NGO Login</span>
                </button>
              </div>
            )}

            <div className="mb-6 sm:mb-8">
              <h2 className="text-[1.6rem] sm:text-[2rem] font-extrabold text-[#1a1a1a] mb-2.5">
                {isLogin
                  ? (loginType === "ngo" ? "NGO Dashboard Access" : "Welcome Back")
                  : "Join the Movement"}
              </h2>
              <p className="text-[#666] text-base leading-relaxed">
                {isLogin
                  ? (loginType === "ngo"
                      ? "Access your NGO dashboard."
                      : "Enter your details to access your account.")
                  : "Create an account to start volunteering today."}
              </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <div className="bg-[#fee2e2] text-[#b91c1c] p-3 rounded-lg text-[0.9rem] mb-5 flex items-center gap-2 border border-[#fecaca]">
                <span className="w-5 h-5 rounded-full bg-[#b91c1c] text-white flex items-center justify-center text-[0.75rem] font-bold shrink-0">!</span>
                {error}
              </div>
            )}

            {/* Show validation errors if login/register has errors */}
            {((isLogin && Object.keys(loginErrors).length > 0) || (!isLogin && Object.keys(registerErrors).length > 0)) && (
              <div className="bg-[#fee2e2] border border-[#fecaca] text-[#991b1b] p-3 rounded-lg text-[0.88rem] mb-4 flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Please fix the following errors:</p>
                  <ul className="list-disc list-inside mt-1 text-[0.82rem]">
                    {Object.values(isLogin ? loginErrors : registerErrors).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="flex flex-col gap-5" autoComplete="off">

              {/* Full Name (Register Only) */}
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label className="text-[0.9rem] font-semibold text-[#344054]">Full Name <span className="text-xs text-gray-400 font-normal">(Letters only)</span></label>
                  <input
                    type="text"
                    name="name"
                    className={`px-4 py-3.5 rounded-[10px] border text-base text-[#1a1a1a] outline-none transition-all w-full bg-[#fcfcfc] font-[inherit] ${
                      registerErrors.name ? "border-red-400 bg-red-50" : "border-[#d0d5dd]"
                    }`}
                    placeholder="John Doe"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    maxLength={100}
                    required
                    autoComplete="off"
                  />
                  {registerErrors.name && (
                    <p className="text-xs text-red-600 flex items-center gap-1.5">
                      <AlertTriangle size={14} className="shrink-0" />
                      {registerErrors.name}
                    </p>
                  )}
                  {registerData.name && !registerErrors.name && (
                    <p className="text-xs text-gray-400">💡 Numbers are not allowed in name</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[0.9rem] font-semibold text-[#344054]">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={`px-4 py-3.5 rounded-[10px] border text-base text-[#1a1a1a] outline-none transition-all w-full bg-[#fcfcfc] font-[inherit] ${
                    (isLogin ? loginErrors.email : registerErrors.email) ? "border-red-400 bg-red-50" : "border-[#d0d5dd]"
                  }`}
                  placeholder="name@example.com"
                  value={isLogin ? loginData.email : registerData.email}
                  onChange={isLogin ? handleLoginChange : handleRegisterChange}
                  required
                  autoComplete="off"
                />
                {(isLogin ? loginErrors.email : registerErrors.email) && (
                  <p className="text-xs text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="shrink-0" />
                    {isLogin ? loginErrors.email : registerErrors.email}
                  </p>
                )}
                {(isLogin ? loginData.email : registerData.email) && !((isLogin ? loginErrors.email : registerErrors.email)) && VALIDATION.isValidEmail(isLogin ? loginData.email : registerData.email) && (
                  <p className="text-xs text-green-600">✓ Valid email address</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-[0.9rem] font-semibold text-[#344054]">
                  Password
                  {!isLogin && registerData.password && <span className="ml-2 text-xs font-normal">Strength: {VALIDATION.getPasswordStrengthColor(passwordStrength).label}</span>}
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`px-4 py-3.5 rounded-[10px] border text-base text-[#1a1a1a] outline-none transition-all w-full bg-[#fcfcfc] font-[inherit] ${
                      (isLogin ? loginErrors.password : registerErrors.password) ? "border-red-400 bg-red-50" : "border-[#d0d5dd]"
                    }`}
                    placeholder="password"
                    value={isLogin ? loginData.password : registerData.password}
                    onChange={isLogin ? handleLoginChange : handleRegisterChange}
                    required
                    autoComplete="new-password"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[15px] cursor-pointer flex items-center justify-center bg-transparent opacity-70"
                    role="button"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
                  </span>
                </div>
                {(isLogin ? loginErrors.password : registerErrors.password) && (
                  <p className="text-xs text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="shrink-0" />
                    {isLogin ? loginErrors.password : registerErrors.password}
                  </p>
                )}
                {!isLogin && registerData.password && (
                  <div
                    className="mt-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor: VALIDATION.getPasswordStrengthColor(passwordStrength).bg,
                      color: VALIDATION.getPasswordStrengthColor(passwordStrength).text,
                    }}
                  >
                    💡 Tip: Mix uppercase, lowercase, and numbers for strong password
                  </div>
                )}
              </div>

              {/* Confirm Password (Register Only) */}
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label className="text-[0.9rem] font-semibold text-[#344054]">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`px-4 py-3.5 rounded-[10px] border text-base text-[#1a1a1a] outline-none transition-all w-full bg-[#fcfcfc] font-[inherit] ${
                      registerErrors.confirmPassword ? "border-red-400 bg-red-50" : "border-[#d0d5dd]"
                    }`}
                    placeholder="password"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    autoComplete="new-password"
                  />
                  {registerErrors.confirmPassword && (
                    <p className="text-xs text-red-600 flex items-center gap-1.5">
                      <AlertTriangle size={14} className="shrink-0" />
                      {registerErrors.confirmPassword}
                    </p>
                  )}
                  {registerData.confirmPassword &&
                    registerData.password === registerData.confirmPassword &&
                    !registerErrors.confirmPassword && (
                      <p className="text-xs text-green-600">✓ Passwords match</p>
                    )}
                </div>
              )}

              {/* Email OTP Verification (Register Only) */}
              {!isLogin && (
                <div className="flex flex-col gap-2">
                  <label className="text-[0.9rem] font-semibold text-[#344054]">Email Verification</label>
                  <div className="flex flex-col xs:flex-row gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className={`px-4 py-3.5 rounded-[10px] border border-[#d0d5dd] text-[1.1rem] outline-none transition-all flex-1 tracking-[6px] font-bold font-[inherit] ${otpSent ? 'bg-[#fcfcfc] text-[#1a1a1a]' : 'bg-[#f5f5f5] text-[#aaa]'}`}
                      placeholder="— — — — — —"
                      value={registerOtp}
                      onChange={e => setRegisterOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={!otpSent}
                    />
                    <button
                      type="button"
                      onClick={handleSendRegisterOtp}
                      disabled={otpSending || otpCountdown > 0}
                      className={`px-3.5 py-3 rounded-[10px] border-none text-white font-semibold text-[0.82rem] whitespace-nowrap w-full xs:w-auto xs:min-w-[90px] font-[inherit] transition-colors
                        ${(otpSending || otpCountdown > 0) ? 'bg-[#9e9e9e] cursor-not-allowed' : 'bg-[#1565c0] cursor-pointer'}`}
                    >
                      {otpSending
                        ? "Sending..."
                        : otpCountdown > 0
                          ? `Resend (${otpCountdown}s)`
                          : otpSent
                            ? "Resend OTP"
                            : "Send OTP"}
                    </button>
                  </div>
                  {otpSent && (
                    <p className="mt-1 text-[0.8rem] text-[#2e7d32]">
                      ✓ OTP sent to {registerData.email}. Check your inbox.
                    </p>
                  )}
                </div>
              )}

              {/* Forgot Password Link (Login Only) */}
              {isLogin && (
                <div className="text-right text-[0.9rem]">
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="border-none bg-transparent text-[#2e7d32] font-medium cursor-pointer p-0 text-[0.9rem] font-[inherit]"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || Object.keys(isLogin ? loginErrors : registerErrors).length > 0}
                className={`mt-2.5 px-4 py-4 text-white border-none rounded-[10px] text-[1.05rem] font-semibold w-full font-[inherit] transition-all flex items-center justify-center gap-2
                  ${(loading || Object.keys(isLogin ? loginErrors : registerErrors).length > 0) ? 'bg-[#9e9e9e] cursor-not-allowed' : 'bg-[#2e7d32] cursor-pointer shadow-[0_4px_12px_rgba(46,125,50,0.2)]'}`}
              >
                {loading
                  ? ("Processing...")
                  : Object.keys(isLogin ? loginErrors : registerErrors).length > 0
                    ? (
                      <>
                        <AlertTriangle size={18} />
                        Fix {Object.keys(isLogin ? loginErrors : registerErrors).length} Error(s)
                      </>
                    )
                    : isLogin
                      ? (loginType === "ngo" ? "Login as NGO" : "Sign In")
                      : "Create Account"}
              </button>
            </form>

            {isLogin && (
              <>
                <div className="flex items-center gap-2.5 mt-[18px]">
                  <span className="flex-1 h-px bg-[#e5e7eb]" />
                  <span className="text-[#6b7280] text-[0.85rem] font-medium">or continue with</span>
                  <span className="flex-1 h-px bg-[#e5e7eb]" />
                </div>

                {googleError && (
                  <div className="bg-[#fee2e2] text-[#b91c1c] p-3 rounded-lg text-[0.9rem] mt-3 flex items-center gap-2 border border-[#fecaca]">
                    {googleError}
                  </div>
                )}

                {GOOGLE_CLIENT_ID ? (
                  <div className="mt-3.5 flex justify-center">
                    {googleLoading ? (
                      <button
                        type="button"
                        className="mt-2.5 px-4 py-4 bg-[#9e9e9e] text-white border-none rounded-[10px] text-[1.05rem] font-semibold cursor-not-allowed w-full font-[inherit]"
                        disabled
                      >
                        Signing in with Google...
                      </button>
                    ) : (
                      <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginError}
                        useOneTap={false}
                        theme="outline"
                        text="signin_with"
                        shape="pill"
                      />
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-[#b45309] bg-[#fffbeb] border border-[#fde68a] rounded-lg px-3 py-2.5 text-[0.85rem] leading-[1.45]">
                    Google sign-in is not configured. Add <strong>VITE_GOOGLE_CLIENT_ID</strong> in your frontend env.
                  </p>
                )}
              </>
            )}

            <p className="mt-8 text-center text-[0.95rem] text-[#666]">
              {isLogin ? (
                loginType === "ngo" ? (
                  <>
                    Don't have an NGO registered?{" "}
                    <span onClick={() => navigate("/add-ngo")} className="text-[#2e7d32] font-bold cursor-pointer ml-1.5">
                      Register NGO
                    </span>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <span onClick={toggleMode} className="text-[#2e7d32] font-bold cursor-pointer ml-1.5">
                      Sign up
                    </span>
                  </>
                )
              ) : (
                <>
                  Already have an account?{" "}
                  <span onClick={toggleMode} className="text-[#2e7d32] font-bold cursor-pointer ml-1.5">
                    Log in
                  </span>
                </>
              )}
            </p>

          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div
          className="fixed inset-0 bg-[rgba(15,23,42,0.6)] flex items-center justify-center z-[2000] p-4"
          onClick={closeForgotModal}
        >
          <div
            className="w-full max-w-[420px] bg-white rounded-[14px] shadow-[0_20px_45px_rgba(15,23,42,0.25)] p-5 sm:p-[22px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="m-0 mb-2 text-[#111827] text-[1.25rem] font-bold">Forgot Password</h3>
            <p className="m-0 mb-3.5 text-[#6b7280] text-[0.92rem] leading-[1.5]">
              Enter your email to receive a password reset link.
            </p>

            {forgotError && (
              <div className="mb-2.5 bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] rounded-lg px-[11px] py-[9px] text-[0.86rem]">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="mb-2.5 bg-[#dcfce7] text-[#166534] border border-[#bbf7d0] rounded-lg px-[11px] py-[9px] text-[0.86rem]">
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@example.com"
                className="px-3.5 py-3 border border-[#d1d5db] rounded-[10px] text-[0.96rem] outline-none w-full font-[inherit]"
                required
              />
              <div className="flex justify-end gap-2.5 mt-1">
                <button
                  type="button"
                  onClick={closeForgotModal}
                  disabled={forgotLoading}
                  className="border border-[#d1d5db] bg-white text-[#374151] rounded-[10px] px-3 py-[9px] cursor-pointer font-semibold font-[inherit]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="border-none bg-[#2e7d32] text-white rounded-[10px] px-3 py-[9px] cursor-pointer font-semibold font-[inherit]"
                >
                  {forgotLoading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div
          className="fixed inset-0 bg-[rgba(15,23,42,0.6)] flex items-center justify-center z-[2000] p-4"
          onClick={closeResetModal}
        >
          <div
            className="w-full max-w-[420px] bg-white rounded-[14px] shadow-[0_20px_45px_rgba(15,23,42,0.25)] p-5 sm:p-[22px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="m-0 mb-2 text-[#111827] text-[1.25rem] font-bold">Reset Password</h3>
            <p className="m-0 mb-3.5 text-[#6b7280] text-[0.92rem] leading-[1.5]">
              Enter your new password to continue.
            </p>

            {resetError && (
              <div className="mb-2.5 bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] rounded-lg px-[11px] py-[9px] text-[0.86rem]">
                {resetError}
              </div>
            )}
            {resetSuccess && (
              <div className="mb-2.5 bg-[#dcfce7] text-[#166534] border border-[#bbf7d0] rounded-lg px-[11px] py-[9px] text-[0.86rem]">
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <input
                  type="password"
                  value={resetPasswordData.password}
                  onChange={(e) => {
                    setResetPasswordData((prev) => ({ ...prev, password: e.target.value }));
                    if (resetErrors.password) {
                      setResetErrors({ ...resetErrors, password: "" });
                    }
                  }}
                  placeholder="New password (min 6 chars)"
                  className={`px-3.5 py-3 border rounded-[10px] text-[0.96rem] outline-none w-full font-[inherit] ${
                    resetErrors.password ? "border-red-400 bg-red-50" : "border-[#d1d5db]"
                  }`}
                  required
                />
                {resetErrors.password && (
                  <p className="text-xs text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="shrink-0" />
                    {resetErrors.password}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="password"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => {
                    setResetPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                    if (resetErrors.confirmPassword) {
                      setResetErrors({ ...resetErrors, confirmPassword: "" });
                    }
                  }}
                  placeholder="Confirm new password"
                  className={`px-3.5 py-3 border rounded-[10px] text-[0.96rem] outline-none w-full font-[inherit] ${
                    resetErrors.confirmPassword ? "border-red-400 bg-red-50" : "border-[#d1d5db]"
                  }`}
                  required
                />
                {resetErrors.confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="shrink-0" />
                    {resetErrors.confirmPassword}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2.5 mt-1.5">
                <button
                  type="button"
                  onClick={closeResetModal}
                  disabled={resetLoading || Object.keys(resetErrors).length > 0}
                  className="border border-[#d1d5db] bg-white text-[#374151] rounded-[10px] px-3 py-[9px] cursor-pointer font-semibold font-[inherit] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading || Object.keys(resetErrors).length > 0}
                  className="border-none bg-[#2e7d32] text-white rounded-[10px] px-3 py-[9px] cursor-pointer font-semibold font-[inherit] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  title={Object.keys(resetErrors).length > 0 ? `Please fix ${Object.keys(resetErrors).length} error(s)` : ""}
                >
                  {resetLoading ? "Updating..." : Object.keys(resetErrors).length > 0 ? `Fix ${Object.keys(resetErrors).length} Error(s)` : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
