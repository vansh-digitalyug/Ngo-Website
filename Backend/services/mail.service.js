import { getTransporter, getSenderAddress, escapeHtml, emailLayout } from "../config/nodemailer.config.js";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Reset Password Email
// ─────────────────────────────────────────────────────────────────────────────
export const sendResetPasswordEmail = async ({ name, email, resetUrl, expiryMinutes = 15 }) => {
  const mailer = getTransporter();
  const safeName = escapeHtml(name || "User");
  const safeResetUrl = escapeHtml(resetUrl);

  const html = emailLayout({
    title: "Reset Your Password",
    bodyHtml: `
      <h2 style="margin:0 0 12px;color:#2e7d32;">Reset Your Password</h2>
      <p style="margin:0 0 10px;color:#333;">Hi <strong>${safeName}</strong>,</p>
      <p style="margin:0 0 18px;color:#555;">We received a request to reset your SevaIndia password. Click the button below to set a new one.</p>
      <p style="margin:0 0 20px;">
        <a href="${safeResetUrl}" style="display:inline-block;background:#2e7d32;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
          Reset Password
        </a>
      </p>
      <p style="margin:0 0 6px;font-size:13px;color:#888;">This link expires in <strong>${expiryMinutes} minutes</strong>.</p>
      <p style="margin:0;font-size:13px;color:#888;">If you did not request this, you can safely ignore this email.</p>
    `
  });

  await mailer.sendMail({
    from: getSenderAddress(),
    to: email,
    subject: "Reset your SevaIndia password",
    text: `Hi ${name || "User"},\n\nReset your password: ${resetUrl}\n\nThis link expires in ${expiryMinutes} minutes.`,
    html
  });

  console.log(`[mail] Password reset email → ${email}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Email Verification OTP
// ─────────────────────────────────────────────────────────────────────────────
export const sendEmailVerificationOtpEmail = async ({ name, email, otp, expiryMinutes = 10 }) => {
  const mailer = getTransporter();
  const safeName = escapeHtml(name || "User");
  const safeOtp = escapeHtml(otp);

  const html = emailLayout({
    title: "Verify Your Email",
    bodyHtml: `
      <h2 style="margin:0 0 12px;color:#2e7d32;">Verify Your Email</h2>
      <p style="margin:0 0 10px;color:#333;">Hi <strong>${safeName}</strong>,</p>
      <p style="margin:0 0 18px;color:#555;">Use the OTP below to verify your SevaIndia email address.</p>
      <div style="margin:0 0 20px;padding:16px 24px;background:#ecfdf3;border:1px solid #bbf7d0;border-radius:12px;display:inline-block;">
        <span style="font-size:34px;letter-spacing:8px;font-weight:800;color:#166534;">${safeOtp}</span>
      </div>
      <p style="margin:0 0 6px;font-size:13px;color:#888;">OTP expires in <strong>${expiryMinutes} minutes</strong>.</p>
      <p style="margin:0;font-size:13px;color:#888;">If you did not request this, please ignore this email.</p>
    `
  });

  await mailer.sendMail({
    from: getSenderAddress(),
    to: email,
    subject: "Your SevaIndia email verification OTP",
    text: `Hi ${name || "User"},\n\nYour OTP is: ${otp}\n\nIt expires in ${expiryMinutes} minutes.`,
    html
  });

  console.log(`[mail] Email verification OTP → ${email}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Admin Reply to Contact Message
// ─────────────────────────────────────────────────────────────────────────────
export const sendAdminReplyEmail = async ({
  name,
  email,
  originalSubject,
  originalMessage,
  adminReply,
  adminName = "SevaIndia Support Team"
}) => {
  const mailer = getTransporter();
  const safeName = escapeHtml(name || "User");
  const safeSubject = escapeHtml(originalSubject);
  const safeOriginalMessage = escapeHtml(originalMessage);
  const safeAdminReply = escapeHtml(adminReply).replace(/\n/g, "<br>");
  const safeAdminName = escapeHtml(adminName);

  const html = emailLayout({
    title: `Re: ${originalSubject}`,
    bodyHtml: `
      <p style="margin:0 0 18px;font-size:16px;color:#333;">
        Dear <strong style="color:#2e7d32;">${safeName}</strong>,
      </p>
      <p style="margin:0 0 22px;font-size:15px;color:#555;line-height:1.7;">
        Thank you for reaching out to SevaIndia. Our team has reviewed your inquiry and responded below.
      </p>
      <div style="margin:0 0 22px;background:#f8f9fa;border-left:4px solid #90a4ae;border-radius:0 8px 8px 0;padding:18px;">
        <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#78909c;font-weight:600;">Your Original Message</p>
        <p style="margin:0 0 8px;font-size:14px;color:#37474f;font-weight:600;">Subject: ${safeSubject}</p>
        <p style="margin:0;font-size:14px;color:#546e7a;line-height:1.6;font-style:italic;">"${safeOriginalMessage}"</p>
      </div>
      <div style="margin:0 0 28px;background:linear-gradient(135deg,#e8f5e9 0%,#c8e6c9 100%);border-left:4px solid #2e7d32;border-radius:0 8px 8px 0;padding:22px;">
        <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#2e7d32;font-weight:600;">Our Response</p>
        <div style="font-size:15px;color:#1b5e20;line-height:1.8;">${safeAdminReply}</div>
        <p style="margin:18px 0 0;font-size:13px;color:#388e3c;font-weight:500;">— ${safeAdminName}</p>
      </div>
      <p style="margin:0;font-size:13px;color:#888;">Have more questions? Contact us again through our website.</p>
    `
  });

  const result = await mailer.sendMail({
    from: getSenderAddress(),
    to: email,
    subject: `Re: ${originalSubject} — SevaIndia Support`,
    text: `Dear ${name || "User"},\n\nThank you for contacting SevaIndia.\n\nYour message: ${originalMessage}\n\nOur response:\n${adminReply}\n\n— ${adminName}`,
    html,
    replyTo: process.env.EMAIL_USER
  });

  console.log(`[mail] Admin reply → ${email} (msgId: ${result.messageId})`);
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Welcome / Registration Confirmation
// ─────────────────────────────────────────────────────────────────────────────
export const sendWelcomeEmail = async ({ name, email }) => {
  const mailer = getTransporter();
  const safeName = escapeHtml(name || "User");

  const html = emailLayout({
    title: "Welcome to SevaIndia!",
    bodyHtml: `
      <h2 style="margin:0 0 12px;color:#2e7d32;">Welcome to SevaIndia! 🎉</h2>
      <p style="margin:0 0 10px;color:#333;">Hi <strong>${safeName}</strong>,</p>
      <p style="margin:0 0 16px;color:#555;line-height:1.7;">
        Thank you for registering with <strong>SevaIndia</strong>. Your account has been created successfully.
        We're glad to have you as part of our community dedicated to making a difference.
      </p>
      <div style="margin:0 0 22px;background:#ecfdf3;border:1px solid #bbf7d0;border-radius:10px;padding:18px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#166534;">What you can do on SevaIndia:</p>
        <ul style="margin:0;padding-left:20px;color:#166534;font-size:14px;line-height:2;">
          <li>Browse and support NGOs across India</li>
          <li>Donate to causes you care about</li>
          <li>Volunteer your time and skills</li>
          <li>Register your own NGO for visibility</li>
        </ul>
      </div>
      <p style="margin:0 0 20px;">
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" style="display:inline-block;background:#2e7d32;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
          Explore SevaIndia
        </a>
      </p>
      <p style="margin:0;font-size:13px;color:#888;">
        Please verify your email address to unlock all features.
      </p>
    `
  });

  await mailer.sendMail({
    from: getSenderAddress(),
    to: email,
    subject: "Welcome to SevaIndia — Account Created Successfully",
    text: `Hi ${name || "User"},\n\nWelcome to SevaIndia! Your account has been created.\n\nStart exploring: ${process.env.FRONTEND_URL || "http://localhost:5173"}`,
    html
  });

  console.log(`[mail] Welcome email → ${email}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Login Notification
// ─────────────────────────────────────────────────────────────────────────────
export const sendLoginNotificationEmail = async ({ name, email, loginTime }) => {
  const mailer = getTransporter();
  const safeName = escapeHtml(name || "User");
  const safeTime = escapeHtml(loginTime || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));

  const html = emailLayout({
    title: "New Login to Your Account",
    bodyHtml: `
      <h2 style="margin:0 0 12px;color:#2e7d32;">New Login Detected</h2>
      <p style="margin:0 0 10px;color:#333;">Hi <strong>${safeName}</strong>,</p>
      <p style="margin:0 0 18px;color:#555;line-height:1.7;">
        We noticed a new login to your SevaIndia account.
      </p>
      <div style="margin:0 0 22px;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:10px;padding:18px;">
        <p style="margin:0 0 6px;font-size:13px;color:#888;">Login Time</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#333;">${safeTime} (IST)</p>
      </div>
      <p style="margin:0 0 18px;color:#555;font-size:14px;">
        If this was you, no action is needed. If you did not log in, please
        <strong>change your password immediately</strong> to secure your account.
      </p>
      <p style="margin:0;">
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login" style="display:inline-block;background:#d32f2f;color:#fff;text-decoration:none;padding:10px 22px;border-radius:8px;font-weight:600;font-size:14px;">
          Secure My Account
        </a>
      </p>
    `
  });

  await mailer.sendMail({
    from: getSenderAddress(),
    to: email,
    subject: "New login to your SevaIndia account",
    text: `Hi ${name || "User"},\n\nA new login was detected on your SevaIndia account at ${safeTime} (IST).\n\nIf this wasn't you, change your password immediately.`,
    html
  });

  console.log(`[mail] Login notification → ${email}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. NGO Submission Confirmation (waiting for approval)
// ─────────────────────────────────────────────────────────────────────────────
export const sendNgoSubmissionEmail = async ({ ngoName, contactName, email }) => {
  const mailer = getTransporter();
  const safeName = escapeHtml(contactName || "there");
  const safeNgoName = escapeHtml(ngoName);

  const html = emailLayout({
    title: "NGO Registration Received",
    bodyHtml: `
      <h2 style="margin:0 0 12px;color:#2e7d32;">NGO Registration Received</h2>
      <p style="margin:0 0 10px;color:#333;">Hi <strong>${safeName}</strong>,</p>
      <p style="margin:0 0 16px;color:#555;line-height:1.7;">
        Thank you for registering <strong>${safeNgoName}</strong> on SevaIndia.
        Your application has been received and is currently <strong>under review</strong> by our admin team.
      </p>
      <div style="margin:0 0 22px;background:#fff8e1;border:1px solid #ffe082;border-radius:10px;padding:18px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#f57f17;">⏳ What happens next?</p>
        <ul style="margin:0;padding-left:20px;color:#5d4037;font-size:14px;line-height:2;">
          <li>Our team will verify the details and documents you provided.</li>
          <li>You will receive an email once your NGO is approved or if more information is needed.</li>
          <li>Approval typically takes <strong>2–5 business days</strong>.</li>
        </ul>
      </div>
      <p style="margin:0;font-size:13px;color:#888;">
        If you have any questions, please contact us through our website.
      </p>
    `
  });

  await mailer.sendMail({
    from: getSenderAddress(),
    to: email,
    subject: `NGO Registration Received — ${ngoName}`,
    text: `Hi ${contactName || "there"},\n\nYour NGO "${ngoName}" has been registered on SevaIndia and is under review.\n\nWe will notify you once it is approved (usually 2–5 business days).`,
    html
  });

  console.log(`[mail] NGO submission confirmation → ${email}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. NGO Approval / Rejection by Admin
// ─────────────────────────────────────────────────────────────────────────────
export const sendNgoStatusEmail = async ({ ngoName, contactName, email, isApproved }) => {
  const mailer = getTransporter();
  const safeName = escapeHtml(contactName || "there");
  const safeNgoName = escapeHtml(ngoName);

  const approved = Boolean(isApproved);
  const subject = approved
    ? `🎉 Your NGO "${ngoName}" has been approved — SevaIndia`
    : `NGO Application Update — "${ngoName}"`;

  const html = emailLayout({
    title: approved ? "NGO Approved!" : "NGO Application Update",
    bodyHtml: approved
      ? `
        <h2 style="margin:0 0 12px;color:#2e7d32;">Congratulations! Your NGO is Approved 🎉</h2>
        <p style="margin:0 0 10px;color:#333;">Hi <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 16px;color:#555;line-height:1.7;">
          We are delighted to inform you that <strong>${safeNgoName}</strong> has been
          <strong style="color:#2e7d32;">approved</strong> on SevaIndia!
          Your NGO is now live and visible to donors and volunteers across India.
        </p>
        <div style="margin:0 0 22px;background:#ecfdf3;border:1px solid #bbf7d0;border-radius:10px;padding:18px;">
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#166534;">You can now:</p>
          <ul style="margin:0;padding-left:20px;color:#166534;font-size:14px;line-height:2;">
            <li>Access your NGO Dashboard to manage your profile</li>
            <li>Upload gallery images and videos</li>
            <li>View and manage volunteers</li>
            <li>Submit fund requests</li>
          </ul>
        </div>
        <p style="margin:0 0 20px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/ngo/dashboard" style="display:inline-block;background:#2e7d32;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
            Go to NGO Dashboard
          </a>
        </p>
      `
      : `
        <h2 style="margin:0 0 12px;color:#c62828;">NGO Application Not Approved</h2>
        <p style="margin:0 0 10px;color:#333;">Hi <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 16px;color:#555;line-height:1.7;">
          After review, we were unable to approve the application for <strong>${safeNgoName}</strong> at this time.
          This could be due to incomplete information or document verification issues.
        </p>
        <div style="margin:0 0 22px;background:#fce4ec;border:1px solid #f48fb1;border-radius:10px;padding:18px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#b71c1c;">What you can do:</p>
          <ul style="margin:0;padding-left:20px;color:#5d0000;font-size:14px;line-height:2;">
            <li>Review the information and documents you submitted.</li>
            <li>Contact our support team for clarification.</li>
            <li>Re-apply with updated and accurate information.</li>
          </ul>
        </div>
        <p style="margin:0;font-size:13px;color:#888;">
          We appreciate your effort and hope to have you on SevaIndia soon.
        </p>
      `
  });

  await mailer.sendMail({
    from: getSenderAddress(),
    to: email,
    subject,
    text: approved
      ? `Hi ${contactName || "there"},\n\nCongratulations! "${ngoName}" has been approved on SevaIndia.\n\nLog in to access your NGO Dashboard: ${process.env.FRONTEND_URL || "http://localhost:5173"}/ngo/dashboard`
      : `Hi ${contactName || "there"},\n\nWe're sorry, but the application for "${ngoName}" could not be approved at this time.\n\nPlease contact us for more information.`,
    html
  });

  console.log(`[mail] NGO status (${approved ? "approved" : "rejected"}) → ${email}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Volunteer Application Confirmation
// ─────────────────────────────────────────────────────────────────────────────
export const sendVolunteerApplicationEmail = async ({ fullName, email }) => {
  const mailer = getTransporter();
  const safeName = escapeHtml(fullName || "there");

  const html = emailLayout({
    title: "Volunteer Application Received",
    bodyHtml: `
      <h2 style="margin:0 0 12px;color:#2e7d32;">Volunteer Application Received!</h2>
      <p style="margin:0 0 10px;color:#333;">Hi <strong>${safeName}</strong>,</p>
      <p style="margin:0 0 16px;color:#555;line-height:1.7;">
        Thank you for applying to volunteer with <strong>SevaIndia</strong>!
        Your application has been submitted and is now <strong>under review</strong>.
      </p>
      <div style="margin:0 0 22px;background:#fff8e1;border:1px solid #ffe082;border-radius:10px;padding:18px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#f57f17;">⏳ What happens next?</p>
        <ul style="margin:0;padding-left:20px;color:#5d4037;font-size:14px;line-height:2;">
          <li>Our team will review your application details.</li>
          <li>You will receive an email once a decision is made.</li>
          <li>Review typically takes <strong>3–7 business days</strong>.</li>
        </ul>
      </div>
      <p style="margin:0;font-size:13px;color:#888;">
        Thank you for your willingness to serve. Together, we can make a real difference!
      </p>
    `
  });

  await mailer.sendMail({
    from: getSenderAddress(),
    to: email,
    subject: "Volunteer Application Received — SevaIndia",
    text: `Hi ${fullName || "there"},\n\nThank you for applying to volunteer with SevaIndia! Your application is under review.\n\nWe will notify you once a decision is made (typically 3–7 business days).`,
    html
  });

  console.log(`[mail] Volunteer application confirmation → ${email}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Volunteer Approval / Rejection by Admin
// ─────────────────────────────────────────────────────────────────────────────
export const sendVolunteerStatusEmail = async ({ fullName, email, status }) => {
  const mailer = getTransporter();
  const safeName = escapeHtml(fullName || "there");
  const isApproved = status === "Approved";

  const subject = isApproved
    ? "🎉 Your Volunteer Application is Approved — SevaIndia"
    : "Volunteer Application Update — SevaIndia";

  const html = emailLayout({
    title: isApproved ? "Volunteer Approved!" : "Volunteer Application Update",
    bodyHtml: isApproved
      ? `
        <h2 style="margin:0 0 12px;color:#2e7d32;">You're Approved as a Volunteer! 🎉</h2>
        <p style="margin:0 0 10px;color:#333;">Hi <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 16px;color:#555;line-height:1.7;">
          We are excited to let you know that your volunteer application has been
          <strong style="color:#2e7d32;">approved</strong>!
          Welcome to the SevaIndia volunteer family. Your commitment to service means a lot to us.
        </p>
        <div style="margin:0 0 22px;background:#ecfdf3;border:1px solid #bbf7d0;border-radius:10px;padding:18px;">
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#166534;">As a volunteer you can:</p>
          <ul style="margin:0;padding-left:20px;color:#166534;font-size:14px;line-height:2;">
            <li>Participate in upcoming events and drives</li>
            <li>Collaborate with NGOs listed on SevaIndia</li>
            <li>Make a tangible difference in your community</li>
          </ul>
        </div>
        <p style="margin:0 0 20px;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/volunteer" style="display:inline-block;background:#2e7d32;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
            View Volunteer Page
          </a>
        </p>
      `
      : `
        <h2 style="margin:0 0 12px;color:#c62828;">Volunteer Application Update</h2>
        <p style="margin:0 0 10px;color:#333;">Hi <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 16px;color:#555;line-height:1.7;">
          Thank you for your interest in volunteering with SevaIndia. After careful review,
          we are unable to approve your application at this time.
        </p>
        <div style="margin:0 0 22px;background:#fce4ec;border:1px solid #f48fb1;border-radius:10px;padding:18px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#b71c1c;">What you can do:</p>
          <ul style="margin:0;padding-left:20px;color:#5d0000;font-size:14px;line-height:2;">
            <li>Contact our support team for feedback on your application.</li>
            <li>Ensure your ID verification is complete and accurate.</li>
            <li>You may re-apply after addressing any issues.</li>
          </ul>
        </div>
        <p style="margin:0;font-size:13px;color:#888;">
          We appreciate your dedication and hope to see you again.
        </p>
      `
  });

  await mailer.sendMail({
    from: getSenderAddress(),
    to: email,
    subject,
    text: isApproved
      ? `Hi ${fullName || "there"},\n\nCongratulations! Your volunteer application has been approved on SevaIndia.\n\nWelcome to the family!`
      : `Hi ${fullName || "there"},\n\nThank you for applying. Unfortunately, your volunteer application could not be approved at this time.\n\nPlease contact us for more details.`,
    html
  });

  console.log(`[mail] Volunteer status (${status}) → ${email}`);
};
