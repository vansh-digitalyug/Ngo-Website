import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to process your request");
      }

      setSuccessMessage(
        data.message || "If an account with that email exists, a reset link has been sent."
      );
      setEmail("");
    } catch (err) {
      setError(err.message || "Unable to process your request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Forgot Password</h1>
        <p style={styles.subtitle}>
          Enter your account email. We will send a reset link if the account exists.
        </p>

        {error ? <div style={styles.errorBox}>{error}</div> : null}
        {successMessage ? <div style={styles.successBox}>{successMessage}</div> : null}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            style={styles.input}
            required
          />

          <button type="submit" style={loading ? styles.btnDisabled : styles.btnPrimary} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link to="/login" style={styles.backLink}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 160px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "#f8fafc",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    backgroundColor: "#fff",
    borderRadius: "14px",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.09)",
    padding: "28px",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "1.6rem",
    color: "#1f2937",
  },
  subtitle: {
    margin: "0 0 20px",
    color: "#64748b",
    lineHeight: 1.5,
    fontSize: "0.95rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  label: {
    fontWeight: 600,
    color: "#334155",
    fontSize: "0.9rem",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "1rem",
  },
  btnPrimary: {
    marginTop: "6px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2e7d32",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDisabled: {
    marginTop: "6px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#9ca3af",
    color: "#fff",
    fontWeight: 600,
    cursor: "not-allowed",
  },
  errorBox: {
    marginBottom: "12px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "0.9rem",
  },
  successBox: {
    marginBottom: "12px",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "0.9rem",
  },
  backLink: {
    display: "inline-block",
    marginTop: "14px",
    color: "#2e7d32",
    textDecoration: "none",
    fontWeight: 600,
  },
};

export default ForgotPassword;
