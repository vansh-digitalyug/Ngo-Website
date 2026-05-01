import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-100 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-8">
          {/* Column 1: About */}
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl md:text-3xl font-bold">
              Seva<span className="text-orange-500">India</span>
            </h3>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Empowering communities through transparency and technology.
              We bridge the gap between donors and verified NGOs to create
              lasting impact in Orphanage Care, Elderly Support, and Digital Literacy.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-gray-700 hover:bg-orange-500 flex items-center justify-center text-sm font-semibold transition-colors">
                FB
              </a>
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-gray-700 hover:bg-orange-500 flex items-center justify-center text-sm font-semibold transition-colors">
                TW
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-gray-700 hover:bg-orange-500 flex items-center justify-center text-sm font-semibold transition-colors">
                IG
              </a>
              <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-gray-700 hover:bg-orange-500 flex items-center justify-center text-sm font-semibold transition-colors">
                LI
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-lg font-bold text-white">Quick Links</h4>
            <ul className="flex flex-col gap-2">
              <li><Link to="/" className="text-gray-300 hover:text-orange-500 transition-colors text-sm md:text-base">Home</Link></li>
              <li><Link to="/find-ngos" className="text-gray-300 hover:text-orange-500 transition-colors text-sm md:text-base">Find NGOs</Link></li>
              <li><Link to="/volunteer" className="text-gray-300 hover:text-orange-500 transition-colors text-sm md:text-base">Volunteer</Link></li>
              <li><Link to="/donate" className="text-gray-300 hover:text-orange-500 transition-colors text-sm md:text-base">Help Now</Link></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="flex flex-col gap-3">
            <h4 className="text-lg font-bold text-white">Our Focus</h4>
            <ul className="flex flex-col gap-2">
              <li><Link to="/services" className="text-gray-300 hover:text-orange-500 transition-colors text-sm md:text-base">Orphanage Support</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-orange-500 transition-colors text-sm md:text-base">Elderly Care</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-orange-500 transition-colors text-sm md:text-base">Digital India</Link></li>
              <li><Link to="/add-ngo" className="text-gray-300 hover:text-orange-500 transition-colors text-sm md:text-base">Register NGO</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="flex flex-col gap-3">
            <h4 className="text-lg font-bold text-white">Contact Us</h4>
            <p className="text-gray-300 text-sm md:text-base">📍 New Delhi, India</p>
            <p className="text-gray-300 text-sm md:text-base">📧 support@sevaindia.org</p>
            <p className="text-gray-300 text-sm md:text-base">📞 +91 98765 43210</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} SevaIndia. Built with ❤ for a better India.</p>
          <div className="flex gap-4 md:gap-6">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;