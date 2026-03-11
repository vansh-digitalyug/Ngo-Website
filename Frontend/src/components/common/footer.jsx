import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import "./footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1: About */}
          <div className="footer-column">
            <h3 className="footer-logo">
              <span className="footer-logo-icon">{"\u2665"}</span>
              Seva<span>India</span>
            </h3>
            <p className="footer-about">
              Empowering communities through transparency and technology.
              We bridge the gap between donors and verified NGOs to create
              lasting impact in Orphanage Care, Elderly Support, Women Empowerment,
              and Digital Literacy across India.
            </p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Our Services</Link></li>
              <li><Link to="/find-ngos">Find NGOs</Link></li>
              <li><Link to="/volunteer">Volunteer With Us</Link></li>
              <li><Link to="/donate">Donate Now</Link></li>
            </ul>
          </div>

          {/* Column 3: Our Focus */}
          <div className="footer-column">
            <h4>Our Focus</h4>
            <ul>
              <li><Link to="/services">Orphanage Support</Link></li>
              <li><Link to="/services">Elderly Care</Link></li>
              <li><Link to="/services">Women Empowerment</Link></li>
              <li><Link to="/services">Medical Assistance</Link></li>
              <li><Link to="/add-ngo">Register Your NGO</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="footer-column">
            <h4>Get In Touch</h4>
            <p>
              <span className="contact-icon">{"\uD83D\uDCCD"}</span>
              <span>Sector 63, Noida<br />Uttar Pradesh, India</span>
            </p>
            <p>
              <span className="contact-icon">{"\uD83D\uDCE7"}</span>
              <span>support@sevaindia.org</span>
            </p>
            <p>
              <span className="contact-icon">{"\uD83D\uDCDE"}</span>
              <span>+91 98765 43210</span>
            </p>
            
            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <FaShieldAlt className="trust-badge-icon" />
                <span>80G Certified</span>
              </div>
              <div className="trust-badge">
                <FaCheckCircle className="trust-badge-icon" />
                <span>Verified NGOs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p>{"\u00A9"} {new Date().getFullYear()} SevaIndia. Built with {"\u2665"} for a better India.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
