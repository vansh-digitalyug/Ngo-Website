import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { User, Building2 } from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Derive loginType from URL path
  const loginType = location.pathname === "/login/ngo"
    ? "ngo"
    : location.pathname === "/login/admin"
      ? "admin"
      : "user";

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
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setError("");
    setGoogleError("");
    setIsLogin(!isLogin);
    setLoginData({ email: "", password: "" });
    setRegisterData({ name: "", email: "", password: "", confirmPassword: "" });
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
  }, [location.search]);

  useEffect(() => {
    const forgotFlag = new URLSearchParams(location.search).get("forgot");
    if (forgotFlag !== "1") return;

    if (!isLogin) {
      setIsLogin(true);
    }

    setForgotError("");
    setForgotSuccess("");
    setShowForgotModal(true);
  }, [location.search]);

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

    if (resetPasswordData.password.length < 6) {
      setResetError("Password must be at least 6 characters long");
      return;
    }

    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      setResetError("Passwords do not match");
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

      // Handle redirect based on login type and user role
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

    if (!otpSent) {
      setError("Please verify your email with an OTP first.");
      return;
    }

    if (!registerOtp.trim()) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
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
    <div style={styles.container}>
      <div style={styles.splitLayout}>

        {/* LEFT SIDE - SMILING CHILDREN IMAGE */}
        <div style={styles.imageSection}>
          <div style={styles.imageOverlay}>
            <h1 style={styles.brandTitle}>SevaIndia</h1>
            <p style={styles.brandQuote}>
              "Service to others is the rent you pay for your room here on earth."
            </p>
            <div style={styles.testimonial}>
              <div style={styles.avatar}>MA</div>
              <div style={styles.testimonialText}>
                <p style={styles.testimonialName}>Muhammad Ali</p>
                <p style={styles.testimonialRole}>Inspiration</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div style={styles.formSection}>
          <div style={styles.formContainer}>
            {/* LOGIN TYPE TABS */}
            {isLogin && loginType !== "admin" && (
              <div style={styles.loginTypeTabs}>
                <button
                  type="button"
                  onClick={() => navigate("/login/user")}
                  style={loginType === "user" ? styles.activeTab : styles.inactiveTab}
                >
                  <User size={18} />
                  <span>User Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login/ngo")}
                  style={loginType === "ngo" ? styles.activeTab : styles.inactiveTab}
                >
                  <Building2 size={18} />
                  <span>NGO Login</span>
                </button>
              </div>
            )}

            <div style={styles.header}>
              <h2 style={styles.title}>
                {isLogin
                  ? loginType === "admin"
                    ? "Admin Access"
                    : loginType === "ngo"
                      ? "NGO Dashboard Access"
                      : "Welcome Back"
                  : "Join the Movement"
                }
              </h2>
              <p style={styles.subtitle}>
                {isLogin
                  ? loginType === "admin"
                    ? "Sign in with your admin credentials."
                    : loginType === "ngo"
                      ? "Access your NGO dashboard."
                      : "Enter your details to access your account."
                  : "Create an account to start volunteering today."}
              </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>!</span> {error}
              </div>
            )}

            <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} style={styles.form} autoComplete="off">

              {/* Full Name (Register Only) */}
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    style={styles.input}
                    placeholder="name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                    autoComplete="off"
                  />
                </div>
              )}

              {/* Email */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  style={styles.input}
                  placeholder="name@example.com"
                  value={isLogin ? loginData.email : registerData.email}
                  onChange={isLogin ? handleLoginChange : handleRegisterChange}
                  required
                  autoComplete="off"
                />
              </div>

              {/* Password */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    style={styles.input}
                    placeholder="password"
                    value={isLogin ? loginData.password : registerData.password}
                    onChange={isLogin ? handleLoginChange : handleRegisterChange}
                    required
                    autoComplete="new-password"
                  />
                  <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon} role="button">
                    {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
                  </span>
                </div>
              </div>

              {/* Confirm Password (Register Only) */}
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    style={styles.input}
                    placeholder="password"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}

              {/* Email OTP Verification (Register Only) */}
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Verification</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      style={{
                        ...styles.input,
                        letterSpacing: "6px",
                        fontWeight: "700",
                        fontSize: "1.1rem",
                        flex: 1,
                        backgroundColor: otpSent ? "#fcfcfc" : "#f5f5f5",
                        color: otpSent ? "#1a1a1a" : "#aaa",
                      }}
                      placeholder="— — — — — —"
                      value={registerOtp}
                      onChange={e => setRegisterOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={!otpSent}
                    />
                    <button
                      type="button"
                      onClick={handleSendRegisterOtp}
                      disabled={otpSending || otpCountdown > 0}
                      style={{
                        padding: "0 14px",
                        borderRadius: "10px",
                        border: "none",
                        background: (otpSending || otpCountdown > 0) ? "#9e9e9e" : "#1565c0",
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: "0.82rem",
                        cursor: (otpSending || otpCountdown > 0) ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        minWidth: "90px",
                        fontFamily: "inherit",
                      }}
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
                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#2e7d32" }}>
                      ✓ OTP sent to {registerData.email}. Check your inbox.
                    </p>
                  )}
                </div>
              )}

              {/* Forgot Password Link (Login Only) */}
              {isLogin && (
                <div style={styles.forgotPass}>
                  <button type="button" onClick={openForgotPassword} style={styles.linkButton}>
                    Forgot password?
                  </button>
                </div>
              )}

              <button type="submit" style={loading ? styles.disabledBtn : styles.submitBtn} disabled={loading}>
                {loading
                  ? "Processing..."
                  : isLogin
                    ? loginType === "admin"
                      ? "Sign In as Admin"
                      : loginType === "ngo"
                        ? "Login as NGO"
                        : "Sign In"
                    : "Create Account"}
              </button>
            </form>

            {isLogin && loginType === "user" && (
              <>
                <div style={styles.authDivider}>
                  <span style={styles.authDividerLine} />
                  <span style={styles.authDividerText}>or continue with</span>
                  <span style={styles.authDividerLine} />
                </div>

                {googleError && (
                  <div style={styles.errorBox}>{googleError}</div>
                )}

                {GOOGLE_CLIENT_ID ? (
                  <div style={styles.googleSection}>
                    {googleLoading ? (
                      <button type="button" style={styles.disabledBtn} disabled>
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
                  <p style={styles.googleHint}>
                    Google sign-in is not configured. Add <strong>VITE_GOOGLE_CLIENT_ID</strong> in your frontend env.
                  </p>
                )}
              </>
            )}

            {loginType !== "admin" && (
              <p style={styles.toggleText}>
                {isLogin ? (
                  loginType === "ngo" ? (
                    <>
                      Don't have an NGO registered?{" "}
                      <span onClick={() => navigate("/add-ngo")} style={styles.toggleLink}>
                        Register NGO
                      </span>
                    </>
                  ) : (
                    <>
                      Don't have an account?{" "}
                      <span onClick={toggleMode} style={styles.toggleLink}>
                        Sign up
                      </span>
                    </>
                  )
                ) : (
                  <>
                    Already have an account?{" "}
                    <span onClick={toggleMode} style={styles.toggleLink}>
                      Log in
                    </span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {showForgotModal && (
        <div style={styles.modalOverlay} onClick={closeForgotModal}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Forgot Password</h3>
            <p style={styles.modalSubtitle}>
              Enter your email to receive a password reset link.
            </p>

            {forgotError && <div style={styles.modalError}>{forgotError}</div>}
            {forgotSuccess && <div style={styles.modalSuccess}>{forgotSuccess}</div>}

            <form onSubmit={handleForgotPasswordSubmit} style={styles.modalForm}>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@example.com"
                style={styles.modalInput}
                required
              />

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeForgotModal}
                  style={styles.modalCancelBtn}
                  disabled={forgotLoading}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.modalSubmitBtn} disabled={forgotLoading}>
                  {forgotLoading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetModal && (
        <div style={styles.modalOverlay} onClick={closeResetModal}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Reset Password</h3>
            <p style={styles.modalSubtitle}>
              Enter your new password to continue.
            </p>

            {resetError && <div style={styles.modalError}>{resetError}</div>}
            {resetSuccess && <div style={styles.modalSuccess}>{resetSuccess}</div>}

            <form onSubmit={handleResetPasswordSubmit} style={styles.modalForm}>
              <input
                type="password"
                value={resetPasswordData.password}
                onChange={(e) =>
                  setResetPasswordData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="New password (min 6 chars)"
                style={styles.modalInput}
                required
              />
              <input
                type="password"
                value={resetPasswordData.confirmPassword}
                onChange={(e) =>
                  setResetPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="Confirm new password"
                style={styles.modalInput}
                required
              />

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeResetModal}
                  style={styles.modalCancelBtn}
                  disabled={resetLoading}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.modalSubmitBtn} disabled={resetLoading}>
                  {resetLoading ? "Updating..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================
   PROFESSIONAL STYLES
   ====================== */

const styles = {


  container: {
    height: "100vh",
    width: "100%",
    backgroundColor: "#f0f2f5",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  splitLayout: {
    display: "flex",
    width: "100%",
    height: "100%",
    maxWidth: "1440px",
    backgroundColor: "white",
    boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },

  // LEFT SIDE (UPDATED IMAGE)
  imageSection: {
    flex: "1",
    // Matches the vibe of your upload: Group of smiling Asian/Indian children
    backgroundImage: "url('https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1600&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "60px",
    color: "white",
    // Hide image on mobile
    "@media (max-width: 768px)": {
      display: "none",
    },
  },
  imageOverlay: {
    position: "relative",
    zIndex: 2,
    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)",
    padding: "40px",
    borderRadius: "20px",
    backdropFilter: "blur(0px)",
  },
  brandTitle: {
    fontSize: "3rem",
    fontWeight: "800",
    marginBottom: "15px",
    letterSpacing: "-1px",
    textShadow: "0 2px 10px rgba(0,0,0,0.5)",
  },
  brandQuote: {
    fontSize: "1.2rem",
    lineHeight: "1.6",
    opacity: "0.95",
    marginBottom: "30px",
    fontStyle: "italic",
    textShadow: "0 1px 5px rgba(0,0,0,0.5)",
  },
  testimonial: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    backgroundColor: "#F26522",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "0.9rem",
    color: "white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },
  testimonialText: {
    fontSize: "0.95rem",
    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
  },
  testimonialName: {
    fontWeight: "700",
    margin: 0,
  },
  testimonialRole: {
    opacity: "0.9",
    fontSize: "0.85rem",
    margin: 0,
  },

  // RIGHT SIDE (FORM)
  formSection: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    backgroundColor: "#fff",
  },
  formContainer: {
    width: "100%",
    maxWidth: "400px",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#666",
    fontSize: "1rem",
    lineHeight: "1.5",
  },

  // FORM ELEMENTS
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#344054",
  },
  input: {
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #d0d5dd",
    fontSize: "1rem",
    color: "#1a1a1a",
    outline: "none",
    transition: "all 0.2s",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#fcfcfc",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    opacity: "0.7",
  },
  forgotPass: {
    textAlign: "right",
    fontSize: "0.9rem",
  },
  submitBtn: {
    marginTop: "10px",
    padding: "16px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "1.05rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.3s, transform 0.1s",
    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
  },
  disabledBtn: {
    marginTop: "10px",
    padding: "16px",
    backgroundColor: "#9e9e9e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "1.05rem",
    fontWeight: "600",
    cursor: "not-allowed",
  },

  // UTILS
  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #fecaca",
  },
  errorIcon: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#b91c1c",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: "bold",
    flexShrink: 0,
  },
  // LOGIN TYPE TABS
  loginTypeTabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    padding: "4px",
    backgroundColor: "#f3f4f6",
    borderRadius: "12px",
  },
  loginTypeTab: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "transparent",
    color: "#6b7280",
    fontSize: "0.95rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  loginTypeTabActive: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#fff",
    color: "#2e7d32",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    fontFamily: "inherit",
  },
  link: {
    color: "#2e7d32",
    textDecoration: "none",
    fontWeight: "500",
  },
  linkButton: {
    border: "none",
    background: "transparent",
    color: "#2e7d32",
    textDecoration: "none",
    fontWeight: "500",
    cursor: "pointer",
    padding: 0,
    fontSize: "0.9rem",
    fontFamily: "inherit",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "16px",
  },
  modalCard: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#fff",
    borderRadius: "14px",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.25)",
    padding: "22px",
  },
  modalTitle: {
    margin: "0 0 8px",
    color: "#111827",
    fontSize: "1.25rem",
  },
  modalSubtitle: {
    margin: "0 0 14px",
    color: "#6b7280",
    fontSize: "0.92rem",
    lineHeight: 1.5,
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  modalInput: {
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "0.96rem",
    outline: "none",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "4px",
  },
  modalCancelBtn: {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    borderRadius: "10px",
    padding: "9px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },
  modalSubmitBtn: {
    border: "none",
    background: "#2e7d32",
    color: "#fff",
    borderRadius: "10px",
    padding: "9px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },
  modalError: {
    marginBottom: "10px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "9px 11px",
    fontSize: "0.86rem",
  },
  modalSuccess: {
    marginBottom: "10px",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "9px 11px",
    fontSize: "0.86rem",
  },
  authDivider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "18px",
  },
  authDividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e5e7eb",
  },
  authDividerText: {
    color: "#6b7280",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  googleSection: {
    marginTop: "14px",
    display: "flex",
    justifyContent: "center",
  },
  googleHint: {
    marginTop: "12px",
    color: "#b45309",
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "0.85rem",
    lineHeight: 1.45,
  },
  toggleText: {
    marginTop: "30px",
    textAlign: "center",
    fontSize: "0.95rem",
    color: "#666",
  },
  toggleLink: {
    color: "#2e7d32",
    fontWeight: "700",
    cursor: "pointer",
    marginLeft: "5px",
  },
  activeTab: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #2e7d32",
    backgroundColor: "#f0fdf4",
    color: "#2e7d32",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  inactiveTab: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #e0e0e0",
    backgroundColor: "#fff",
    color: "#666",
    fontWeight: "500",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },

};

export default Login;
