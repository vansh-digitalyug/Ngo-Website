import { AlertTriangle, Shield, Info, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Disclaimer() {
  const sections = [
    {
      icon: Info,
      color: "#2563eb",
      bg: "#eff6ff",
      title: "General Information Disclaimer",
      content: `The information provided on this platform is for general informational purposes only. While we strive to keep the information accurate and up to date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, services, or related graphics contained on the website for any purpose.`,
    },
    {
      icon: Shield,
      color: "#16a34a",
      bg: "#f0fdf4",
      title: "NGO & Donation Transparency",
      content: `All NGOs listed on this platform have undergone a verification process. However, Ngo Website does not guarantee the performance or outcomes of any specific NGO. Donations made through this platform are processed securely via Razorpay. Fund utilization data shown on our transparency dashboard is self-reported by NGOs and reviewed by our team. We are not responsible for any misuse of funds by individual NGOs beyond our oversight capacity.`,
    },
    {
      icon: AlertTriangle,
      color: "#d97706",
      bg: "#fffbeb",
      title: "Village Adoption & Impact Claims",
      content: `Village adoption milestones, coverage percentages, and impact metrics are reported by our NGO partners based on their on-ground activities. While we review these reports periodically, we cannot independently verify every claim in real-time. The data represents good-faith reporting by our partner organizations. Progress figures may not reflect the exact current ground situation.`,
    },
    {
      icon: Info,
      color: "#7c3aed",
      bg: "#faf5ff",
      title: "Community Problem Reports",
      content: `Problems submitted by community members on our platform represent individual user-reported issues. Ngo Website does not verify the accuracy of these reports independently. We forward verified issues to the concerned NGOs for action. Resolution timelines depend on the NGO's capacity and resources, and we do not make guarantees about resolution times.`,
    },
    {
      icon: Shield,
      color: "#0891b2",
      bg: "#f0f9ff",
      title: "Third-Party Links & Services",
      content: `This platform may contain links to third-party websites, payment gateways, or services. These third-party sites have separate and independent privacy policies. We have no responsibility or liability for the content and activities of these linked sites. We recommend reviewing the privacy policy of every site you visit.`,
    },
    {
      icon: AlertTriangle,
      color: "#dc2626",
      bg: "#fef2f2",
      title: "Limitation of Liability",
      content: `In no event shall Ngo Website, its directors, employees, partners, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of (or inability to access or use) the service; (ii) any conduct or content of any third party on the service; (iii) any content obtained from the service; or (iv) unauthorized access, use, or alteration of your transmissions or content.`,
    },
    {
      icon: Info,
      color: "#475569",
      bg: "#f8fafc",
      title: "Medical & Professional Advice",
      content: `The health-related services listed on this platform (medical camps, doctor outreach, etc.) are provided by licensed healthcare professionals volunteering with our NGO partners. The information provided is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider for any medical conditions.`,
    },
    {
      icon: Shield,
      color: "#166534",
      bg: "#f0fdf4",
      title: "Privacy & Data Usage",
      content: `We collect and use personal information as described in our Privacy Policy. By using this platform, you consent to the collection and use of information as outlined therein. We implement industry-standard security measures to protect your personal data, including KYC information, donation history, and community activity data.`,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#fff", padding: "60px 24px 48px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "20px", color: "#fbbf24" }}>
          <AlertTriangle size={14} /> Legal Disclaimer
        </div>
        <h1 style={{ margin: "0 0 16px", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: "900" }}>Disclaimer</h1>
        <p style={{ margin: "0 auto", maxWidth: "560px", color: "#94a3b8", fontSize: "16px", lineHeight: 1.7 }}>
          Please read this disclaimer carefully before using our platform. By accessing or using our services, you agree to the terms outlined below.
        </p>
        <p style={{ margin: "16px auto 0", fontSize: "13px", color: "#64748b" }}>
          Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "40px 16px 60px" }}>

        {/* Intro */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px" }}>
          <p style={{ margin: 0, color: "#374151", lineHeight: 1.8, fontSize: "15px" }}>
            <strong>Ngo Website</strong> is an independent platform that connects donors, volunteers, and communities with verified NGOs across India. We are committed to transparency, accountability, and social impact. This disclaimer governs the use of our platform, including our donation system, village adoption tracker, community problem reporting, and fund transparency features.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sections.map(({ icon: Icon, color, bg, title, content }, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color={color} />
                </div>
                <h3 style={{ margin: 0, fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>{title}</h3>
              </div>
              <p style={{ margin: 0, color: "#374151", lineHeight: 1.8, fontSize: "14px" }}>{content}</p>
            </div>
          ))}
        </div>

        {/* Changes notice */}
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "14px", padding: "18px 22px", marginTop: "20px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ margin: "0 0 6px", fontWeight: "700", color: "#92400e", fontSize: "14px" }}>Changes to This Disclaimer</p>
              <p style={{ margin: 0, color: "#92400e", fontSize: "13px", lineHeight: 1.6 }}>
                We reserve the right to update or modify this disclaimer at any time without prior notice. Your continued use of the platform after any changes constitutes your acceptance of the new disclaimer. We encourage you to review this page periodically.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px 24px", marginTop: "16px", textAlign: "center" }}>
          <Phone size={20} color="#2563eb" style={{ marginBottom: "8px" }} />
          <h4 style={{ margin: "0 0 8px", fontWeight: "700", color: "#0f172a" }}>Questions About This Disclaimer?</h4>
          <p style={{ margin: "0 0 14px", color: "#64748b", fontSize: "14px" }}>
            If you have any questions or concerns about this disclaimer, please reach out to our team.
          </p>
          <Link to="/contact" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 22px", background: "#2563eb", color: "#fff", borderRadius: "8px", fontWeight: "700", fontSize: "14px", textDecoration: "none" }}>
            Contact Us
          </Link>
        </div>

        {/* Related links */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px", flexWrap: "wrap" }}>
          {[
            { to: "/privacy-policy", label: "Privacy Policy" },
            { to: "/terms-of-service", label: "Terms of Service" },
            { to: "/transparency", label: "Transparency Dashboard" },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{ color: "#2563eb", fontSize: "13px", fontWeight: "600", textDecoration: "none", padding: "6px 14px", border: "1px solid #bfdbfe", borderRadius: "8px", background: "#eff6ff" }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
