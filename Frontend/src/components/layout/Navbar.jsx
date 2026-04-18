import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import GoogleTranslate from "../GoogleTranslate.jsx"; // Adjust path if needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const readUser = () => {
    const raw = localStorage.getItem("user");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("token")));
  const [user, setUser] = useState(readUser());
  const [hasNgo, setHasNgo] = useState(false);
  const [ngoStatus, setNgoStatus] = useState(null);
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const isAdmin = user?.role === "admin";

  // Check if user has an NGO
  useEffect(() => {
    const checkNgoStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token || isAdmin) { setHasNgo(false); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status !== 'none') { setHasNgo(true); setNgoStatus(data.status); }
          else setHasNgo(false);
        }
      } catch (err) {
        console.error('Failed to check NGO status:', err);
      }
    };

    if (isLoggedIn && !isAdmin) checkNgoStatus();
  }, [isLoggedIn, isAdmin]);

  // Sync Auth State
  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("token")));
      setUser(readUser());
    };

    window.addEventListener("authChanged", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("authChanged", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Ignore logout endpoint errors
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("authChanged"));
      setMenuOpen(false);
      sessionStorage.setItem(
        "flash_message",
        JSON.stringify({ type: "success", message: "Logout successfully." })
      );
      navigate("/");
    }
  };

  // Close mobile menu if clicked outside or on a link
  const closeMenu = () => setMenuOpen(false);

  // Common Nav Links Array to prevent repetition
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Find NGOs", path: "/find-ngos" },
    { name: "Donate", path: "/donate" },
    { name: "Volunteer", path: "/volunteer" },
    { name: "Surveys", path: "/surveys" },
    { name: "Add Your NGO", path: "/add-ngo" },
    { name: "Contact", path: "/contact" },
  ];


  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 z-[10000] shadow-sm">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 text-xl font-bold cursor-pointer transition-transform hover:scale-105" 
          onClick={() => navigate("/")}
        >
          <span className="text-[#ff5722] text-2xl">{"\u2665"}</span>
          <span className="text-gray-900">
            Seva<span className="text-[#ff5722]">India</span>
          </span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-3 xl:gap-5 m-0 p-0 list-none">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className="text-gray-800 text-sm font-medium hover:text-green-700 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-green-700 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-300 whitespace-nowrap"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Auth & Translate */}
        <div className="hidden lg:flex items-center gap-3">
          <GoogleTranslate />

          {/* Report Problem Button */}
          <Link
            to="/report-problem"
            className="flex items-center gap-1.5 bg-orange-500 text-white px-3 py-2 rounded-md font-medium hover:bg-orange-600 hover:shadow-md transition-all duration-300 text-sm whitespace-nowrap"
          >
            <span className="text-base leading-none">⚠</span> Report
          </Link>

          {isLoggedIn ? (
            <div className="relative group cursor-pointer">
              {/* Profile Icon Trigger */}
              <div 
                className="w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center font-bold text-lg border-2 border-green-50 transition-all duration-300 group-hover:bg-green-800 group-hover:scale-105"
                title={user?.name || "User"}
              >
                {userInitial}
              </div>

              {/* Dropdown Menu (Uses group-hover for pure CSS dropdown) */}
              <div className="absolute right-0 top-full pt-3 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                <ul className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 overflow-hidden">
                  
                  {isAdmin ? (
                    <li>
                      <Link to="/admin" className="block px-4 py-2.5 text-gray-800 font-semibold hover:bg-gray-50 hover:text-blue-700 hover:pl-6 transition-all duration-200">
                        Admin Panel
                      </Link>
                    </li>
                  ) : hasNgo ? (
                    <li>
                      <Link 
                        to={ngoStatus === 'approved' ? "/ngo/dashboard" : "/ngo/pending"} 
                        className="flex items-center justify-between px-4 py-2.5 font-semibold text-purple-700 hover:bg-purple-50 hover:pl-6 transition-all duration-200"
                      >
                        <span>My NGO</span>
                        {ngoStatus === 'pending' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Pending</span>
                        )}
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link to="/profile" className="block px-4 py-2.5 text-gray-800 font-medium hover:bg-gray-50 hover:text-green-700 hover:pl-6 transition-all duration-200">
                        My Profile
                      </Link>
                    </li>
                  )}
                  
                  <li>
                    <Link to="/community" className="block px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-50 hover:text-green-700 hover:pl-6 transition-all duration-200">
                      Community
                    </Link>
                  </li>

                  <li className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-red-600 font-medium hover:bg-red-50 hover:pl-6 transition-all duration-200"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-green-700 text-white px-5 py-2 rounded-md font-medium hover:bg-green-800 hover:shadow-md transition-all duration-300"
            >
              Login
            </Link>
          )}
        </div>

        {/* Hamburger Icon (Mobile) */}
        <button
          className="lg:hidden text-2xl text-gray-800 hover:text-green-700 p-2 rounded transition-colors focus:outline-none"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          {"\u2630"}
        </button>
      </nav>

      {/* --- MOBILE MENU --- */}
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[10001] transition-opacity duration-300 lg:hidden ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={closeMenu}
      />

      {/* Slide-out Menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[10002] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <span className="font-bold text-lg text-gray-800">Menu</span>
          <button onClick={closeMenu} className="text-gray-500 hover:text-red-500 text-2xl transition-colors">
            {"\u2715"}
          </button>
        </div>

        <div className="flex justify-center p-4 border-b border-gray-100">
          <GoogleTranslate />
        </div>

        <ul className="flex-1 overflow-y-auto py-2">
          {navLinks.map((link) => (
            <li key={link.name} className="border-b border-gray-50">
              <Link 
                to={link.path} 
                onClick={closeMenu}
                className="block px-6 py-3 text-gray-700 font-medium hover:text-green-700 hover:bg-green-50 transition-colors"
              >
                {link.name}
              </Link>
            </li>
          ))}

          {/* Surveys */}
          <li className="border-b border-gray-50 bg-purple-50">
            <Link
              to="/ngo/surveys"
              onClick={closeMenu}
              className="flex items-center gap-2 px-6 py-3 text-purple-700 font-semibold hover:bg-purple-100 transition-colors"
            >
              <span>📋</span> Surveys
            </Link>
          </li>

          {/* Report Problem */}
          <li className="border-b border-gray-50">
            <Link
              to="/report-problem"
              onClick={closeMenu}
              className="flex items-center gap-2 px-6 py-3 text-orange-600 font-semibold hover:bg-orange-50 transition-colors"
            >
              <span>⚠</span> Report Problem
            </Link>
          </li>

          {/* Additional Mobile-specific Links (from your original code) */}
          <li className="border-b border-gray-50">
            <Link to="/services/medical/cancer" onClick={closeMenu} className="block px-6 py-3 text-gray-600 text-sm hover:text-green-700 hover:bg-green-50">
              ↳ Cancer Support
            </Link>
          </li>
          <li className="border-b border-gray-50">
            <Link to="/services/medical/kidney" onClick={closeMenu} className="block px-6 py-3 text-gray-600 text-sm hover:text-green-700 hover:bg-green-50">
              ↳ Kidney Support
            </Link>
          </li>

          {isLoggedIn ? (
            <div className="mt-4 px-6 pb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {userInitial}
                  </div>
                </div>
                {isAdmin ? (
                  <Link to="/admin" onClick={closeMenu} className="flex items-center gap-3 text-blue-700 font-bold mb-3">
                  </Link>
                ) : hasNgo ? (
                  <Link 
                    to={ngoStatus === 'approved' ? "/ngo/dashboard" : "/ngo/pending"} 
                    onClick={closeMenu} 
                    className="flex items-center justify-between text-purple-700 font-bold mb-3"
                  >
                    <span>My NGO</span>
                    {ngoStatus === 'pending' && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded">Pending</span>
                    )}
                  </Link>
                ) : (
                  <Link to="/profile" onClick={closeMenu} className="flex items-center gap-3 text-gray-800 font-medium mb-3">
                    My Profile
                  </Link>
                )}
                <Link
                  to="/community"
                  onClick={closeMenu}
                  className="flex items-center gap-2 text-gray-700 font-medium mb-3 hover:text-green-700"
                >
                  💬 Community
                </Link>
                <Link
                  to="/ngo/surveys"
                  onClick={closeMenu}
                  className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-2 rounded-md font-semibold mb-3 hover:bg-purple-200 transition-all"
                >
                  <span>📋</span> Surveys
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <li className="p-6">
              <Link 
                to="/login" 
                onClick={closeMenu} 
                className="flex justify-center bg-green-700 text-white py-2.5 rounded-md font-semibold hover:bg-green-800 transition-colors"
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}

export default Navbar;