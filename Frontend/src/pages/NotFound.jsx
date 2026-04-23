import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Number */}
        <div className="mb-8">
          <div className="text-9xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            404
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-lg text-slate-600 mb-3">
          Sorry, the page you're looking for doesn't exist.
        </p>

        {/* URL Info */}
        <div className="bg-slate-100 rounded-lg p-3 mb-8 break-all">
          <p className="text-xs text-slate-500 font-mono">
            Requested: <span className="text-slate-700 font-bold">{location.pathname}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <FaArrowLeft size={16} />
            Go Back
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <FaHome size={16} />
            Home
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-600 mb-4">Need help? Try these:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="text-amber-600 hover:text-amber-700 font-semibold text-sm">
              Home
            </Link>
            <Link to="/find-ngos" className="text-amber-600 hover:text-amber-700 font-semibold text-sm">
              Find NGOs
            </Link>
            <Link to="/contact" className="text-amber-600 hover:text-amber-700 font-semibold text-sm">
              Contact Us
            </Link>
            <Link to="/blog" className="text-amber-600 hover:text-amber-700 font-semibold text-sm">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
