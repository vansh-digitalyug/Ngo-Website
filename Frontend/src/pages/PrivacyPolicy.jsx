import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt, FaUserLock, FaDatabase, FaShareAlt,
  FaCookieBite, FaChild, FaEnvelope, FaCalendarAlt,
  FaCheckCircle, FaLock, FaTrashAlt, FaEdit
} from "react-icons/fa";
import "./privacy.css";

const LAST_UPDATED = "11 March 2026";

const sections = [
  {
    id: "overview",
    Icon: FaShieldAlt,
    title: "Overview",
    content: (
      <>
        <p>
          SevaIndia ("we", "us", "our") is a registered NGO aggregation and donation platform
          operating in India. We are deeply committed to protecting your personal data and
          respecting your privacy. This Privacy Policy explains how we collect, use, share,
          and protect information when you visit our website, make a donation, apply as a
          volunteer, register an NGO, or otherwise interact with our services.
        </p>
        <p>
          By using SevaIndia, you agree to the practices described in this Policy. If you
          disagree with any part, please discontinue using our services and contact us at{" "}
          <a href="mailto:privacy@sevaindia.org">privacy@sevaindia.org</a>.
        </p>
        <div className="pp-highlight-box">
          <FaCheckCircle className="pp-highlight-icon" />
          <div>
            <strong>Plain-language summary:</strong> We collect only what we need to run the
            platform, protect it with industry-standard security, never sell your data, and
            give you full control over your information.
          </div>
        </div>
      </>
    )
  },
  {
    id: "information-we-collect",
    Icon: FaDatabase,
    title: "Information We Collect",
    content: (
      <>
        <p>We collect information in three ways:</p>

        <h4>1. Information you provide directly</h4>
        <ul>
          <li><strong>Account registration:</strong> Name, email address, mobile number, city, state, and password.</li>
          <li><strong>Donations:</strong> Donor name, email, mobile number, address, PAN (for 80G certificates), donation amount, and payment details (processed securely by Razorpay — we never store raw card numbers).</li>
          <li><strong>Volunteer applications:</strong> Full name, date of birth, occupation, education, skills, areas of interest, government ID type and number (Aadhaar/PAN), emergency contact details, and motivation statement.</li>
          <li><strong>NGO registration:</strong> Organisation name, registration number, legal documents, trustee details, contact information, address, and bank details for fund disbursement.</li>
          <li><strong>Kanya Daan Yojana applications:</strong> Applicant and beneficiary details as required for welfare processing.</li>
          <li><strong>Contact forms:</strong> Name, email, subject, and message content.</li>
        </ul>

        <h4>2. Information collected automatically</h4>
        <ul>
          <li>IP address, browser type and version, operating system, referring URLs, and pages visited.</li>
          <li>Device identifiers and approximate geographic location (city/state level).</li>
          <li>Interaction data such as pages clicked, time spent, and buttons used — collected via cookies and analytics tools.</li>
        </ul>

        <h4>3. Information from third parties</h4>
        <ul>
          <li><strong>Google Sign-In:</strong> If you authenticate with Google, we receive your name, email address, and profile picture as shared by Google. We do not receive your Google password.</li>
          <li><strong>Razorpay:</strong> We receive payment status, transaction IDs, and masked card information from our payment gateway.</li>
          <li><strong>Aadhaar/PAN verification:</strong> KYC verification results (verified/not verified) from authorised verification services. We do not store your raw biometric data.</li>
        </ul>
      </>
    )
  },
  {
    id: "how-we-use",
    Icon: FaUserLock,
    title: "How We Use Your Information",
    content: (
      <>
        <p>We use collected information strictly for the following purposes:</p>
        <div className="pp-use-grid">
          {[
            { title: "Service delivery", desc: "Processing donations, issuing receipts, generating 80G tax certificates, and managing volunteer and NGO profiles." },
            { title: "KYC & fraud prevention", desc: "Verifying the identity of volunteers and donors to prevent fraudulent transactions and ensure platform integrity." },
            { title: "Communications", desc: "Sending donation confirmations, OTP codes, application status updates, task assignments, and platform announcements." },
            { title: "Platform improvement", desc: "Analysing usage patterns to improve features, fix issues, and personalise your experience." },
            { title: "Legal compliance", desc: "Meeting obligations under the Income Tax Act, FCRA, and other applicable Indian laws." },
            { title: "NGO fund management", desc: "Matching donations to NGOs, processing fund disbursements, and maintaining audit trails." },
          ].map((item, i) => (
            <div key={i} className="pp-use-card">
              <FaCheckCircle className="pp-use-icon" />
              <div>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: "16px" }}>
          We do <strong>not</strong> use your data for targeted advertising, do not sell it to
          third parties, and do not use it for any purpose beyond what is described above.
        </p>
      </>
    )
  },
  {
    id: "data-sharing",
    Icon: FaShareAlt,
    title: "Data Sharing & Disclosure",
    content: (
      <>
        <p>
          We do <strong>not sell, rent, or trade</strong> your personal information. We share
          data only in the following limited circumstances:
        </p>
        <ul>
          <li>
            <strong>With NGOs you donate to:</strong> Your name and donation amount are shared
            with the relevant NGO for fund-utilisation reporting. If you choose to donate
            anonymously, only the amount is shared — your identity is withheld.
          </li>
          <li>
            <strong>With payment processors (Razorpay):</strong> Necessary payment details are
            shared with Razorpay to process transactions. Razorpay is PCI-DSS compliant. Their
            privacy policy governs their handling of your data.
          </li>
          <li>
            <strong>With KYC verification services:</strong> ID numbers are transmitted to
            authorised verification APIs (UIDAI/NSDL) solely to confirm identity. We receive
            only a pass/fail result.
          </li>
          <li>
            <strong>With government or regulatory authorities:</strong> When required by law,
            court order, or to prevent fraud or harm — for example, under the Information
            Technology Act 2000 or Income Tax Act 1961.
          </li>
          <li>
            <strong>With cloud and infrastructure providers:</strong> We use trusted services
            (AWS S3 for file storage, MongoDB Atlas for databases) under strict data-processing
            agreements that prohibit them from using your data for their own purposes.
          </li>
        </ul>
        <div className="pp-highlight-box warning">
          <FaShieldAlt className="pp-highlight-icon" />
          <div>
            We never share your Aadhaar number, PAN number, or payment card details with NGOs
            or any third party beyond the mandatory verification services described above.
          </div>
        </div>
      </>
    )
  },
  {
    id: "cookies",
    Icon: FaCookieBite,
    title: "Cookies & Tracking",
    content: (
      <>
        <p>
          We use cookies and similar technologies to keep you logged in, remember your
          preferences, and understand how the platform is used.
        </p>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Cookie Type</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Essential</strong></td>
              <td>Authentication tokens, session management, CSRF protection</td>
              <td>Session / 7 days</td>
            </tr>
            <tr>
              <td><strong>Functional</strong></td>
              <td>Language preferences, form auto-fill, UI settings</td>
              <td>30 days</td>
            </tr>
            <tr>
              <td><strong>Analytics</strong></td>
              <td>Aggregated usage statistics to improve the platform (no individual tracking)</td>
              <td>90 days</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: "14px" }}>
          You can disable cookies through your browser settings. Note that disabling essential
          cookies will prevent login and donation functionality from working correctly.
        </p>
      </>
    )
  },
  {
    id: "data-security",
    Icon: FaLock,
    title: "Data Security",
    content: (
      <>
        <p>We implement multiple layers of security to protect your personal data:</p>
        <ul>
          <li><strong>Encryption in transit:</strong> All data transmitted between your browser and our servers is encrypted using TLS 1.2 or higher (HTTPS).</li>
          <li><strong>Encryption at rest:</strong> Sensitive fields such as passwords (bcrypt-hashed), OTPs (hashed), and documents stored in AWS S3 are encrypted at rest.</li>
          <li><strong>Access controls:</strong> Only authorised personnel can access personal data, and access is restricted by role. Admin accounts require strong passwords and session-based authentication.</li>
          <li><strong>Payment security:</strong> We never store raw card numbers, CVVs, or full bank account details. All payment processing is delegated to Razorpay, which holds PCI-DSS Level 1 certification.</li>
          <li><strong>OTP-based verification:</strong> Account creation, password resets, and KYC verification require OTP confirmation to prevent unauthorised access.</li>
          <li><strong>Regular security reviews:</strong> We conduct periodic code reviews and vulnerability assessments to identify and remediate security risks.</li>
        </ul>
        <div className="pp-highlight-box">
          <FaLock className="pp-highlight-icon" />
          <div>
            Despite our best efforts, no system is 100% secure. If you suspect your account
            has been compromised, please contact us immediately at{" "}
            <a href="mailto:security@sevaindia.org">security@sevaindia.org</a>.
          </div>
        </div>
      </>
    )
  },
  {
    id: "data-retention",
    Icon: FaCalendarAlt,
    title: "Data Retention",
    content: (
      <>
        <p>We retain your data only for as long as necessary for the purpose it was collected:</p>
        <table className="pp-table">
          <thead>
            <tr>
              <th>Data Type</th>
              <th>Retention Period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Account profile information</td>
              <td>Until account deletion + 30 days</td>
            </tr>
            <tr>
              <td>Donation records &amp; 80G certificates</td>
              <td>8 years (as required by Income Tax Act)</td>
            </tr>
            <tr>
              <td>KYC verification records</td>
              <td>5 years from verification date</td>
            </tr>
            <tr>
              <td>Volunteer application data</td>
              <td>2 years from last activity</td>
            </tr>
            <tr>
              <td>Contact form submissions</td>
              <td>2 years</td>
            </tr>
            <tr>
              <td>Server logs and analytics</td>
              <td>90 days</td>
            </tr>
            <tr>
              <td>Payment transaction records</td>
              <td>8 years (as required by RBI guidelines)</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: "14px" }}>
          After the retention period, data is securely deleted or anonymised so that it can no
          longer be linked to any individual.
        </p>
      </>
    )
  },
  {
    id: "your-rights",
    Icon: FaEdit,
    title: "Your Rights",
    content: (
      <>
        <p>
          Under applicable Indian data protection law and as a matter of good practice, you
          have the following rights regarding your personal data:
        </p>
        <div className="pp-rights-grid">
          {[
            { Icon: FaUserLock, right: "Access", desc: "Request a copy of the personal data we hold about you." },
            { Icon: FaEdit,     right: "Correction", desc: "Update or correct inaccurate personal information via your profile settings or by contacting us." },
            { Icon: FaTrashAlt, right: "Deletion", desc: "Request deletion of your account and associated data (subject to legal retention requirements for donations)." },
            { Icon: FaLock,     right: "Withdraw consent", desc: "Withdraw consent for optional processing at any time (e.g., marketing emails). This will not affect lawful processing based on consent before withdrawal." },
            { Icon: FaDatabase, right: "Portability", desc: "Request your donation history and profile data in a machine-readable format (CSV/JSON)." },
            { Icon: FaEnvelope, right: "Grievance", desc: "Lodge a complaint with our Grievance Officer if you believe we have mishandled your data." },
          ].map((item, i) => (
            <div key={i} className="pp-right-card">
              <div className="pp-right-icon-wrap"><item.Icon /></div>
              <div>
                <strong>{item.right}</strong>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: "16px" }}>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:privacy@sevaindia.org">privacy@sevaindia.org</a> with your registered
          email address and the nature of your request. We will respond within 30 days.
        </p>
      </>
    )
  },
  {
    id: "children",
    Icon: FaChild,
    title: "Children's Privacy",
    content: (
      <>
        <p>
          SevaIndia is not directed at children under the age of 18. We do not knowingly
          collect personal information from minors. If you are a parent or guardian and believe
          your child has provided us with personal data, please contact us at{" "}
          <a href="mailto:privacy@sevaindia.org">privacy@sevaindia.org</a> and we will promptly
          delete it.
        </p>
        <p>
          Donations on behalf of a minor must be made by a parent or legal guardian who accepts
          these terms on their behalf.
        </p>
      </>
    )
  },
  {
    id: "contact",
    Icon: FaEnvelope,
    title: "Contact & Grievance Officer",
    content: (
      <>
        <p>
          For privacy-related questions, data requests, or complaints, please reach out to our
          designated Grievance Officer:
        </p>
        <div className="pp-contact-card">
          <div className="pp-contact-row"><strong>Name:</strong> Grievance Officer, SevaIndia</div>
          <div className="pp-contact-row"><strong>Email:</strong> <a href="mailto:privacy@sevaindia.org">privacy@sevaindia.org</a></div>
          <div className="pp-contact-row"><strong>Phone:</strong> +91-XXXXX-XXXXX (Mon–Fri, 10 AM–6 PM IST)</div>
          <div className="pp-contact-row"><strong>Address:</strong> SevaIndia Foundation, [Registered Office Address], India</div>
          <div className="pp-contact-row"><strong>Response time:</strong> Within 30 working days</div>
        </div>
        <p style={{ marginTop: "16px" }}>
          If you are not satisfied with our response, you may escalate your complaint to the
          relevant data protection authority under applicable Indian law.
        </p>
      </>
    )
  }
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const onScroll = () => {
      const offsets = sections.map(s => {
        const el = document.getElementById(`pp-${s.id}`);
        if (!el) return { id: s.id, top: Infinity };
        return { id: s.id, top: Math.abs(el.getBoundingClientRect().top - 120) };
      });
      const nearest = offsets.reduce((a, b) => a.top < b.top ? a : b);
      setActiveSection(nearest.id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(`pp-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="pp-root">

      {/* ── Hero ── */}
      <div className="pp-hero">
        <div className="pp-hero-inner">
          <div className="pp-hero-icon"><FaShieldAlt /></div>
          <h1>Privacy Policy</h1>
          <p>
            How SevaIndia collects, uses, and protects your personal information — written in
            clear, plain language.
          </p>
          <div className="pp-hero-meta">
            <span><FaCalendarAlt /> Last updated: {LAST_UPDATED}</span>
            <span><FaCheckCircle /> Applies to: sevaindia.org and all related services</span>
          </div>
        </div>
      </div>

      <div className="pp-body">

        {/* ── Sidebar TOC ── */}
        <nav className="pp-sidebar">
          <p className="pp-sidebar-label">Table of Contents</p>
          <ul>
            {sections.map(s => (
              <li key={s.id}>
                <button
                  className={`pp-toc-btn${activeSection === s.id ? " active" : ""}`}
                  onClick={() => scrollTo(s.id)}
                >
                  <s.Icon className="pp-toc-icon" />
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Main content ── */}
        <main className="pp-main">
          {sections.map((s, i) => (
            <section key={s.id} id={`pp-${s.id}`} className="pp-section">
              <div className="pp-section-header">
                <div className="pp-section-icon-wrap"><s.Icon /></div>
                <h2>{s.title}</h2>
              </div>
              <div className="pp-section-body">{s.content}</div>
            </section>
          ))}

          {/* ── Footer note ── */}
          <div className="pp-footer-note">
            <FaEdit />
            <div>
              <strong>Policy updates:</strong> We may update this Privacy Policy from time to
              time. The "Last updated" date at the top of this page will reflect any changes.
              Continued use of SevaIndia after changes are posted constitutes your acceptance
              of the revised policy. For significant changes we will notify you by email.
            </div>
          </div>

          <div className="pp-back-links">
            <Link to="/" className="pp-back-btn">← Back to Home</Link>
            <Link to="/contact" className="pp-back-btn outline">Contact Us</Link>
          </div>
        </main>

      </div>
    </div>
  );
}
