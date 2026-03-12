import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFileContract, FaUserCheck, FaShieldAlt, FaHandHoldingHeart,
  FaBuilding, FaUsers, FaBan, FaCopyright, FaExclamationTriangle,
  FaBalanceScale, FaGlobe, FaEnvelope, FaCalendarAlt, FaCheckCircle,
  FaInfoCircle, FaEdit
} from "react-icons/fa";
import "./terms.css";

const LAST_UPDATED = "11 March 2026";
const EFFECTIVE_DATE = "11 March 2026";

const sections = [
  {
    id: "acceptance",
    Icon: FaFileContract,
    title: "Acceptance of Terms",
    content: (
      <>
        <p>
          These Terms of Service ("Terms") constitute a legally binding agreement between you
          ("User", "you", "your") and <strong>SevaIndia Foundation</strong> ("SevaIndia", "we",
          "us", "our"), the operator of the SevaIndia platform available at sevaindia.org and
          its associated mobile applications (collectively, the "Platform").
        </p>
        <p>
          By accessing or using the Platform — whether as a donor, volunteer, registered NGO,
          or general visitor — you confirm that you have read, understood, and agree to be
          bound by these Terms in their entirety, together with our{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>, which is incorporated herein by
          reference.
        </p>
        <div className="ts-alert info">
          <FaInfoCircle className="ts-alert-icon" />
          <div>
            If you do not agree with any provision of these Terms, you must immediately stop
            using the Platform and close your account if you have one. Continued use after any
            update to these Terms constitutes acceptance of the revised Terms.
          </div>
        </div>
        <p>
          These Terms are governed by the laws of India. Any dispute arising from or related
          to your use of the Platform shall be subject to the exclusive jurisdiction of the
          courts in Noida, Uttar Pradesh, India.
        </p>
      </>
    )
  },
  {
    id: "eligibility",
    Icon: FaUserCheck,
    title: "Who Can Use SevaIndia",
    content: (
      <>
        <p>
          You may use the Platform if you meet all of the following requirements:
        </p>
        <ul className="ts-allowed-list">
          <li>You are at least 18 years of age. Persons under 18 may use the Platform only with verified consent from a parent or legal guardian who accepts these Terms on their behalf.</li>
          <li>You have the legal capacity to enter into binding contracts under applicable Indian law.</li>
          <li>You are not prohibited from receiving services under any applicable law of India or your country of residence.</li>
          <li>Your account has not been previously suspended or terminated by SevaIndia for a violation of these Terms.</li>
          <li>You will use the Platform for lawful purposes only, in accordance with these Terms and all applicable laws and regulations.</li>
        </ul>
        <p>
          SevaIndia reserves the right to refuse access, terminate accounts, or cancel
          transactions at its sole discretion if it reasonably believes that a user does not
          meet these eligibility requirements or is misusing the Platform.
        </p>
      </>
    )
  },
  {
    id: "accounts",
    Icon: FaShieldAlt,
    title: "User Accounts & Security",
    content: (
      <>
        <h4>Creating an account</h4>
        <p>
          To access certain features — such as volunteering, tracking donations, or managing
          an NGO profile — you must register for an account. You agree to provide accurate,
          current, and complete information during registration and to keep it up to date.
        </p>

        <h4>Account security</h4>
        <p>
          You are solely responsible for maintaining the confidentiality of your login
          credentials. You must not share your password with anyone. SevaIndia will never ask
          for your password via email, phone, or chat. You agree to:
        </p>
        <ul>
          <li>Choose a strong, unique password and never reuse passwords from other services.</li>
          <li>Log out from shared or public devices after each session.</li>
          <li>Immediately notify us at <a href="mailto:support@sevaindia.org">support@sevaindia.org</a> if you suspect unauthorised access to your account.</li>
        </ul>

        <h4>Account suspension & termination</h4>
        <p>
          SevaIndia may suspend or permanently terminate your account without prior notice if
          we have reasonable grounds to believe that you have violated these Terms, provided
          false information, engaged in fraudulent activity, or posed a risk to the Platform
          or other users. You may request account deletion at any time by contacting us —
          subject to our data retention obligations described in the{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>.
        </p>

        <div className="ts-alert warning">
          <FaExclamationTriangle className="ts-alert-icon" />
          <div>
            SevaIndia is not liable for any loss or damage arising from your failure to
            protect your account credentials. Any activity carried out through your account
            is your responsibility.
          </div>
        </div>
      </>
    )
  },
  {
    id: "donations",
    Icon: FaHandHoldingHeart,
    title: "Donations & Payments",
    content: (
      <>
        <h4>How donations work</h4>
        <p>
          SevaIndia facilitates donations from donors to verified NGOs. When you make a
          donation, you authorise SevaIndia to process the payment via Razorpay, our
          PCI-DSS compliant payment partner, and to transfer the funds (net of platform
          processing fees, if any) to the designated NGO.
        </p>

        <h4>Payment processing</h4>
        <p>
          All payments are processed in Indian Rupees (INR). SevaIndia does not store your
          card numbers, CVV, or net banking credentials. These are handled exclusively by
          Razorpay under their own Terms of Service and Privacy Policy.
        </p>

        <h4>Refund policy</h4>
        <p>
          Donations are generally non-refundable once a payment is confirmed, as funds are
          committed to the NGO's programme. Refunds may be considered only in the following
          circumstances:
        </p>
        <ul>
          <li>Duplicate payments caused by a technical error on our Platform.</li>
          <li>A payment was processed after you cancelled the transaction but before confirmation.</li>
          <li>The NGO you donated to was subsequently delisted from the Platform due to fraud.</li>
        </ul>
        <p>
          To request a refund, email <a href="mailto:support@sevaindia.org">support@sevaindia.org</a>{" "}
          within 7 days of the transaction with your payment receipt. We will review requests
          within 10 working days. Approved refunds will be credited to the original payment
          method within 5–7 banking days.
        </p>

        <h4>80G tax certificates</h4>
        <p>
          SevaIndia will issue 80G tax exemption certificates for eligible donations made to
          registered NGOs. Certificates are generated within 30 days of donation. Eligibility
          depends on the NGO's current 80G registration status, which may change. SevaIndia is
          not liable if a certificate cannot be issued due to a change in the NGO's tax status
          after your donation.
        </p>

        <div className="ts-alert info">
          <FaInfoCircle className="ts-alert-icon" />
          <div>
            SevaIndia displays a real-time donation feed on the home page. If you choose to
            donate anonymously, your name will appear as "Anonymous" in all public-facing
            displays. Your email and contact details are never shown publicly.
          </div>
        </div>
      </>
    )
  },
  {
    id: "ngo-registration",
    Icon: FaBuilding,
    title: "NGO Registration & Conduct",
    content: (
      <>
        <h4>Eligibility to register</h4>
        <p>
          Only legally registered non-governmental organisations, trusts, societies, or
          Section 8 companies operating in India may register as NGOs on the Platform. The
          authorised representative submitting the registration confirms that:
        </p>
        <ul>
          <li>The organisation is registered under applicable Indian law (Societies Registration Act, Indian Trusts Act, Companies Act, or equivalent state legislation).</li>
          <li>All documents submitted for verification are genuine, current, and not altered in any way.</li>
          <li>The representative has the authority to bind the organisation to these Terms.</li>
          <li>The organisation does not engage in activities that are illegal, communally divisive, or contrary to public policy.</li>
        </ul>

        <h4>Verification process</h4>
        <p>
          Registered NGOs undergo a KYC and document verification process by the SevaIndia
          admin team before being listed publicly. Verification does not constitute an
          endorsement by SevaIndia of the NGO's work, financial management, or mission.
          Donors are encouraged to conduct their own due diligence.
        </p>

        <h4>NGO obligations</h4>
        <ul>
          <li>Maintain accurate, up-to-date information on your profile at all times.</li>
          <li>Use disbursed funds solely for the stated purpose of the associated service or programme.</li>
          <li>Submit utilisation reports when requested by SevaIndia or by donors.</li>
          <li>Notify SevaIndia promptly if the organisation loses its registration, 80G status, or faces any legal proceedings.</li>
          <li>Refrain from making false or misleading statements about your work, beneficiaries, or fund utilisation.</li>
        </ul>

        <div className="ts-alert danger">
          <FaExclamationTriangle className="ts-alert-icon" />
          <div>
            NGOs found to have submitted fraudulent documents, misused funds, or provided
            false information will be immediately delisted, reported to the relevant
            authorities, and may face civil and criminal liability. Outstanding donor funds
            will be withheld pending investigation.
          </div>
        </div>
      </>
    )
  },
  {
    id: "volunteer",
    Icon: FaUsers,
    title: "Volunteer Terms",
    content: (
      <>
        <p>
          By submitting a volunteer application on SevaIndia, you agree to the following:
        </p>
        <div className="ts-feature-grid">
          {[
            { title: "Accuracy of information", desc: "All personal information, ID details, and documents you submit are genuine and belong to you." },
            { title: "Fitness for service", desc: "You are physically and legally fit to perform the volunteer activities you apply for." },
            { title: "No remuneration", desc: "Volunteering through SevaIndia is unpaid. No employment, contractor, or agency relationship is created." },
            { title: "Conduct standards", desc: "You agree to behave respectfully towards beneficiaries, NGO staff, and other volunteers at all times." },
            { title: "Background verification", desc: "You consent to background and identity checks as required by the NGO you are assigned to." },
            { title: "Photo & media consent", desc: "You consent to photographs or videos of your volunteer activity being used for SevaIndia's reporting and promotion, unless you opt out in writing." },
          ].map((item, i) => (
            <div key={i} className="ts-feature-card">
              <FaCheckCircle className="ts-feature-icon" />
              <div>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p>
          SevaIndia acts as an intermediary connecting volunteers and NGOs. We are not
          responsible for any injury, loss, or damage sustained during volunteer activities.
          Volunteers participate at their own risk and are advised to arrange appropriate
          personal insurance if required.
        </p>
      </>
    )
  },
  {
    id: "prohibited",
    Icon: FaBan,
    title: "Platform Rules & Prohibited Use",
    content: (
      <>
        <p>
          You agree to use the Platform only for its intended purpose. The following actions
          are strictly prohibited:
        </p>
        <ul className="ts-prohibited-list">
          <li>Submitting false, misleading, or plagiarised information in any registration, application, or form.</li>
          <li>Impersonating any person, organisation, or government body.</li>
          <li>Attempting to access accounts, systems, or data that do not belong to you.</li>
          <li>Using automated tools, bots, scrapers, or scripts to extract data from the Platform without prior written permission.</li>
          <li>Uploading or transmitting malware, viruses, or any other harmful code.</li>
          <li>Making fraudulent donations, reversals, or chargebacks to manipulate Platform statistics.</li>
          <li>Harassing, threatening, or abusing other users, NGO staff, volunteers, or SevaIndia personnel.</li>
          <li>Using the Platform to raise funds for organisations or causes not listed or approved on SevaIndia.</li>
          <li>Circumventing, disabling, or tampering with any security feature of the Platform.</li>
          <li>Reproducing, distributing, or commercially exploiting any content from the Platform without prior written consent.</li>
        </ul>
        <p>
          Violation of these rules may result in immediate account termination, legal action,
          and reporting to appropriate law enforcement agencies.
        </p>
      </>
    )
  },
  {
    id: "intellectual-property",
    Icon: FaCopyright,
    title: "Intellectual Property",
    content: (
      <>
        <h4>SevaIndia's content</h4>
        <p>
          All content on the Platform — including but not limited to the SevaIndia name and
          logo, website design, text, graphics, icons, images, data compilations, and software
          — is the property of SevaIndia Foundation or its licensors and is protected by
          Indian copyright, trademark, and related laws. Nothing in these Terms grants you
          any right to use SevaIndia's intellectual property except as expressly permitted.
        </p>

        <h4>NGO and user content</h4>
        <p>
          By uploading content to the Platform — such as NGO profiles, gallery images,
          service descriptions, or volunteer testimonials — you grant SevaIndia a
          non-exclusive, royalty-free, worldwide licence to use, display, reproduce, and
          distribute that content for the purpose of operating and promoting the Platform.
          You confirm that you own or have the necessary rights to the content you upload
          and that it does not infringe any third party's rights.
        </p>

        <h4>Feedback</h4>
        <p>
          If you submit feedback, suggestions, or ideas to SevaIndia, you grant us a
          perpetual, irrevocable, royalty-free licence to use them for any purpose without
          obligation to compensate you.
        </p>
      </>
    )
  },
  {
    id: "disclaimers",
    Icon: FaExclamationTriangle,
    title: "Disclaimers & Warranties",
    content: (
      <>
        <p>
          The Platform and its content are provided <strong>"as is"</strong> and{" "}
          <strong>"as available"</strong> without any warranties of any kind, express or
          implied, to the maximum extent permitted by applicable law. Specifically:
        </p>
        <ul>
          <li>SevaIndia does not warrant that the Platform will be uninterrupted, error-free, secure, or free from viruses.</li>
          <li>SevaIndia does not endorse, verify, or guarantee the accuracy of information provided by NGOs, volunteers, or donors.</li>
          <li>Listing on SevaIndia does not imply that an NGO is financially sound, operationally effective, or free from legal issues beyond what our verification process covers at the time of listing.</li>
          <li>Third-party links or services accessed through the Platform are governed by their own terms and SevaIndia accepts no responsibility for them.</li>
        </ul>
        <div className="ts-alert warning">
          <FaExclamationTriangle className="ts-alert-icon" />
          <div>
            Donors are encouraged to independently verify NGOs before making large donations.
            SevaIndia provides transparency tools — utilisation reports, verified badges, and
            contact information — to assist due diligence, but cannot substitute for it.
          </div>
        </div>
      </>
    )
  },
  {
    id: "liability",
    Icon: FaBalanceScale,
    title: "Limitation of Liability",
    content: (
      <>
        <p>
          To the fullest extent permitted by applicable law, SevaIndia Foundation, its
          directors, officers, employees, partners, and agents shall not be liable for any:
        </p>
        <table className="ts-table">
          <thead>
            <tr>
              <th>Type of loss</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Indirect or consequential loss</strong></td>
              <td>Loss of opportunity, reputation, or goodwill arising from use of the Platform</td>
            </tr>
            <tr>
              <td><strong>Financial loss</strong></td>
              <td>Losses resulting from fraudulent NGOs or payment failures beyond our reasonable control</td>
            </tr>
            <tr>
              <td><strong>Data loss</strong></td>
              <td>Loss of data caused by system failures, cyberattacks, or events outside our control</td>
            </tr>
            <tr>
              <td><strong>Third-party actions</strong></td>
              <td>Conduct of NGOs, volunteers, or other users on or off the Platform</td>
            </tr>
            <tr>
              <td><strong>Force majeure</strong></td>
              <td>Disruptions caused by natural disasters, pandemics, government orders, or internet outages</td>
            </tr>
          </tbody>
        </table>
        <p>
          In any case, SevaIndia's total aggregate liability to you for any claim arising
          under these Terms shall not exceed the greater of (a) the total amount you donated
          through the Platform in the 3 months preceding the claim, or (b) ₹1,000.
        </p>
      </>
    )
  },
  {
    id: "governing-law",
    Icon: FaGlobe,
    title: "Governing Law & Disputes",
    content: (
      <>
        <p>
          These Terms are governed by and construed in accordance with the laws of India,
          without regard to its conflict-of-law principles. The following dispute resolution
          process applies:
        </p>
        <ol>
          <li>
            <strong>Informal resolution:</strong> Before initiating any formal proceedings,
            you agree to first contact SevaIndia at{" "}
            <a href="mailto:legal@sevaindia.org">legal@sevaindia.org</a> and allow 30 days
            for us to attempt to resolve the dispute informally.
          </li>
          <li>
            <strong>Arbitration:</strong> If informal resolution fails, disputes shall be
            referred to binding arbitration under the Arbitration and Conciliation Act, 1996.
            The arbitration shall be conducted in Hindi or English, in Noida, Uttar Pradesh.
          </li>
          <li>
            <strong>Courts:</strong> For matters not subject to arbitration (such as
            injunctive relief), the courts in Noida, Uttar Pradesh shall have exclusive
            jurisdiction.
          </li>
        </ol>
        <p>
          Nothing in this section prevents either party from seeking urgent interim relief
          from a competent court to prevent irreparable harm.
        </p>
      </>
    )
  },
  {
    id: "changes",
    Icon: FaEdit,
    title: "Changes to These Terms",
    content: (
      <>
        <p>
          SevaIndia reserves the right to modify these Terms at any time. When we make
          material changes, we will:
        </p>
        <ul>
          <li>Update the "Last updated" date at the top of this page.</li>
          <li>Send an email notification to all registered users (where possible) at least 14 days before the changes take effect.</li>
          <li>Display a prominent notice on the Platform for at least 14 days after the changes go live.</li>
        </ul>
        <p>
          Your continued use of the Platform after changes take effect constitutes your
          acceptance of the updated Terms. If you do not agree with the revised Terms, you
          must stop using the Platform and may close your account.
        </p>
        <div className="ts-alert info">
          <FaInfoCircle className="ts-alert-icon" />
          <div>
            We recommend bookmarking this page and reviewing the Terms periodically. Past
            versions of the Terms are available on request by emailing{" "}
            <a href="mailto:legal@sevaindia.org">legal@sevaindia.org</a>.
          </div>
        </div>
      </>
    )
  },
  {
    id: "contact",
    Icon: FaEnvelope,
    title: "Contact Us",
    content: (
      <>
        <p>
          For questions, concerns, or notices related to these Terms of Service, please
          contact us through any of the following channels:
        </p>
        <div className="ts-contact-card">
          <div className="ts-contact-row"><strong>Organisation:</strong> SevaIndia Foundation</div>
          <div className="ts-contact-row"><strong>General support:</strong> <a href="mailto:support@sevaindia.org">support@sevaindia.org</a></div>
          <div className="ts-contact-row"><strong>Legal matters:</strong> <a href="mailto:legal@sevaindia.org">legal@sevaindia.org</a></div>
          <div className="ts-contact-row"><strong>Phone:</strong> +91-120-123-4567 (Mon–Fri, 10 AM–6 PM IST)</div>
          <div className="ts-contact-row"><strong>Address:</strong> Sector 63, Noida, Uttar Pradesh – 201301, India</div>
          <div className="ts-contact-row"><strong>Response time:</strong> Within 5 working days for general queries; 30 days for legal notices</div>
        </div>
        <p style={{ marginTop: "16px" }}>
          For privacy-specific requests, please refer to our{" "}
          <Link to="/privacy-policy">Privacy Policy</Link> and contact our Grievance Officer
          at <a href="mailto:privacy@sevaindia.org">privacy@sevaindia.org</a>.
        </p>
      </>
    )
  }
];

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState("acceptance");

  useEffect(() => {
    const onScroll = () => {
      const offsets = sections.map(s => {
        const el = document.getElementById(`ts-${s.id}`);
        if (!el) return { id: s.id, top: Infinity };
        return { id: s.id, top: Math.abs(el.getBoundingClientRect().top - 120) };
      });
      const nearest = offsets.reduce((a, b) => (a.top < b.top ? a : b));
      setActiveSection(nearest.id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(`ts-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="ts-root">

      {/* ── Hero ── */}
      <div className="ts-hero">
        <div className="ts-hero-inner">
          <div className="ts-hero-icon"><FaFileContract /></div>
          <h1>Terms of Service</h1>
          <p>
            Please read these terms carefully before using SevaIndia. They explain what
            you can expect from us — and what we expect from you.
          </p>
          <div className="ts-hero-meta">
            <span><FaCalendarAlt /> Effective: {EFFECTIVE_DATE}</span>
            <span><FaCalendarAlt /> Last updated: {LAST_UPDATED}</span>
            <span><FaCheckCircle /> Applies to all users of sevaindia.org</span>
          </div>
        </div>
      </div>

      <div className="ts-body">

        {/* ── Sidebar TOC ── */}
        <nav className="ts-sidebar">
          <p className="ts-sidebar-label">Table of Contents</p>
          <ul>
            {sections.map((s, i) => (
              <li key={s.id}>
                <button
                  className={`ts-toc-btn${activeSection === s.id ? " active" : ""}`}
                  onClick={() => scrollTo(s.id)}
                >
                  <span className="ts-toc-num">{i + 1}</span>
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Main content ── */}
        <main className="ts-main">

          {/* Quick-read intro */}
          <div className="ts-intro-card">
            <FaInfoCircle className="ts-intro-icon" />
            <div>
              <strong>Quick summary:</strong> SevaIndia connects donors with verified NGOs.
              You must be 18+ to use the Platform. Donations are non-refundable except in
              specific circumstances. NGOs must be legally registered and agree not to misuse
              funds. Disputes are resolved under Indian law in Noida. We may update these
              Terms with 14 days' notice.
            </div>
          </div>

          {sections.map((s, i) => (
            <section key={s.id} id={`ts-${s.id}`} className="ts-section">
              <div className="ts-section-header">
                <div className="ts-section-icon-wrap"><s.Icon /></div>
                <h2>{s.title}</h2>
                <span className="ts-section-num">§ {i + 1}</span>
              </div>
              <div className="ts-section-body">{s.content}</div>
            </section>
          ))}

          {/* ── Footer note ── */}
          <div className="ts-footer-note">
            <FaCheckCircle className="ts-footer-note-icon" />
            <div>
              <strong>Thank you for reading.</strong> These Terms are designed to create a
              fair, transparent environment for donors, NGOs, and volunteers. We update them
              only when necessary and always give advance notice. If anything is unclear,
              please reach out — we are happy to explain.
            </div>
          </div>

          <div className="ts-back-links">
            <Link to="/" className="ts-back-btn">← Back to Home</Link>
            <Link to="/privacy-policy" className="ts-back-btn outline">Privacy Policy</Link>
            <Link to="/contact" className="ts-back-btn green">Contact Us</Link>
          </div>
        </main>

      </div>
    </div>
  );
}
