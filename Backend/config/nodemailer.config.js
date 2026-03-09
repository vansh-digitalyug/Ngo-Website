import nodemailer from "nodemailer";
import "./loadEnv.js";

// ── Email credentials from environment ────────────────────────────────────────
const getEmailConfig = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();

  if (!user || !pass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set in .env");
  }

  return { user, pass };
};

// ── Singleton nodemailer transporter ──────────────────────────────────────────
let _transporter = null;

export const getTransporter = () => {
  if (_transporter) return _transporter;

  const { user, pass } = getEmailConfig();

  _transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });

  return _transporter;
};

// ── Sender address helper ──────────────────────────────────────────────────────
export const getSenderAddress = () => {
  const { user } = getEmailConfig();
  return `"SevaIndia" <${user}>`;
};

// ── XSS-safe HTML escaping ─────────────────────────────────────────────────────
export const escapeHtml = (text) =>
  String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// ── Reusable HTML email wrapper ────────────────────────────────────────────────
export const emailLayout = ({ title, bodyHtml }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;">
  <div style="max-width:620px;margin:0 auto;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#ffffff;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2e7d32 0%,#1b5e20 100%);padding:28px 40px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:.5px;">SevaIndia</h1>
      <p style="margin:6px 0 0;color:#c8e6c9;font-size:13px;">Connecting Hearts, Transforming Lives</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      ${bodyHtml}
    </div>

    <!-- Footer -->
    <div style="background:#263238;padding:24px 40px;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;color:#90a4ae;">
        © ${new Date().getFullYear()} SevaIndia. All rights reserved.
      </p>
      <p style="margin:0;font-size:11px;color:#78909c;">
        This is an automated email — please do not reply directly.
      </p>
    </div>

  </div>
</body>
</html>
`;
