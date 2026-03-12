import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1: About */}
          <div className="footer-column">
            <h3 className="footer-logo">Seva<span>India</span></h3>
            <p className="footer-about">
              Empowering communities through transparency and technology.
              We bridge the gap between donors and verified NGOs to create
              lasting impact in Orphanage Care, Elderly Support, and Digital Literacy.
            </p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">FB</a>
              <a href="#" aria-label="Twitter">TW</a>
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="LinkedIn">LI</a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/find-ngos">Find NGOs</Link></li>
              <li><Link to="/volunteer">Volunteer</Link></li>
              <li><Link to="/donate">Help Now</Link></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="footer-column">
            <h4>Our Focus</h4>
            <ul>
              <li><Link to="/services">Orphanage Support</Link></li>
              <li><Link to="/services">Elderly Care</Link></li>
              <li><Link to="/services">Digital India</Link></li>
              <li><Link to="/add-ngo">Register NGO</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="footer-column">
            <h4>Contact Us</h4>
            <p>📍 New Delhi, India</p>
            <p>📧 support@sevaindia.org</p>
            <p>📞 +91 98765 43210</p>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SevaIndia. Built with ❤ for a better India.</p>
          <div className="footer-legal">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;