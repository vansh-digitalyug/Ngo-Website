import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import GoogleTranslate from "../GoogleTranslate.jsx"; // Adjust path if needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");

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
      if (!token || isAdmin) {
        setHasNgo(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/ngo-dashboard/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.status !== 'none') {
            setHasNgo(true);
            setNgoStatus(data.status);
          } else {
            setHasNgo(false);
          }
        }
      } catch (err) {
        console.error('Failed to check NGO status:', err);
      }
    };

    if (isLoggedIn && !isAdmin) {
      checkNgoStatus();
    }
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
    { name: "Add Your NGO", path: "/add-ngo" },
    { name: "Contact", path: "/contact" },
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
    { value: "pa", label: "Punjabi" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "bn", label: "Bengali" },
    { value: "gu", label: "Gujarati" },
    { value: "mr", label: "Marathi" },
    { value: "ml", label: "Malayalam" },
    { value: "kn", label: "Kannada" },
  ];

  const applyGoogleLanguage = (langCode) => {
    const select = document.querySelector("#google_translate_element .goog-te-combo");
    if (!select) return false;
    if (select.value !== langCode) {
      select.value = langCode;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    return true;
  };

  // On mount: wait for Google Translate select to be ready, then apply current language
  useEffect(() => {
    const id = setInterval(() => {
      const select = document.querySelector("#google_translate_element .goog-te-combo");
      if (select) {
        clearInterval(id);
        // Apply whatever language is currently selected (default "en")
        if (language !== select.value) {
          select.value = language;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    }, 300);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLanguageChange = (e) => {
    const next = e.target.value;
    setLanguage(next);          // update dropdown display immediately
    applyGoogleLanguage(next);  // trigger Google Translate
  };

  return (
    <>
      {/* Keep Google script loader mounted but hide its custom visual pill */}
      <div className="hidden" aria-hidden="true">
        <GoogleTranslate />
      </div>

      {/* --- DESKTOP NAVBAR --- */}
      {/* STRICT HEIGHT APPLIED HERE: h-14 (56px). Removed padding completely (py). */}
      <nav className="fixed top-0 left-0 w-full h-14 flex items-center justify-between px-4 lg:px-6 bg-white/90 backdrop-blur-md border-b border-gray-100 z-[10000] shadow-sm box-border">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-1 text-lg font-bold cursor-pointer transition-transform hover:scale-105" 
          onClick={() => navigate("/")}
        >
          <span className="text-[#ff5722] text-xl">{"\u2665"}</span>
          <span className="text-gray-900 tracking-tight">
            Seva<span className="text-[#ff5722]">India</span>
          </span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-4 m-0 p-0 list-none text-sm h-full">
          {navLinks.map((link) => (
            <li key={link.name} className="flex items-center h-full">
              <Link 
                to={link.path} 
                className="text-gray-700 font-medium hover:text-green-700 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-green-700 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-300 flex items-center h-full"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Auth & Translate */}
        <div className="hidden lg:flex items-center gap-3 h-full">
          <div className="relative notranslate" translate="no">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="h-8 rounded-md border border-green-200 bg-green-50 px-2.5 pr-7 text-xs font-semibold text-green-900 outline-none transition-colors hover:border-green-400 focus:border-green-600 notranslate"
              aria-label="Select language"
              translate="no"
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="notranslate" translate="no">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          
          {isLoggedIn ? (
            <div className="relative group cursor-pointer h-full flex items-center">
              {/* Profile Icon Trigger */}
              <div 
                className="w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center font-bold text-xs border border-green-100 transition-all duration-300 group-hover:bg-green-800 group-hover:shadow-md"
                title={user?.name || "User"}
              >
                {userInitial}
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-[48px] pt-2 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
                <ul className="bg-white border border-gray-100 rounded shadow-lg py-1 text-sm">
                  
                  {isAdmin ? (
                    <li>
                      <Link to="/admin" className="block px-4 py-1.5 text-gray-800 font-medium hover:bg-gray-50 hover:text-blue-700 transition-colors">
                        Admin Panel
                      </Link>
                    </li>
                  ) : hasNgo ? (
                    <li>
                      <Link 
                        to={ngoStatus === 'approved' ? "/ngo/dashboard" : "/ngo/pending"} 
                        className="flex items-center justify-between px-4 py-1.5 font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        <span>My NGO</span>
                        {ngoStatus === 'pending' && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wide">Pending</span>
                        )}
                      </Link>
                    </li>
                  ) : (
                    <li>
                      <Link to="/profile" className="block px-4 py-1.5 text-gray-800 font-medium hover:bg-gray-50 hover:text-green-700 transition-colors">
                        My Profile
                      </Link>
                    </li>
                  )}
                  
                  <li className="border-t border-gray-50 mt-1 pt-1">
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-1.5 text-red-600 font-medium hover:bg-red-50 transition-colors"
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
              className="bg-green-700 text-white px-3.5 py-1.5 rounded text-sm font-medium hover:bg-green-800 hover:shadow-sm transition-all duration-300"
            >
              Login
            </Link>
          )}
        </div>

        {/* Hamburger Icon (Mobile) */}
        <button
          className="lg:hidden text-xl text-gray-800 hover:text-green-700 p-1 rounded transition-colors focus:outline-none"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          {"\u2630"}
        </button>
      </nav>

      {/* --- MOBILE MENU --- */}
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[10001] transition-all duration-300 lg:hidden ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={closeMenu}
      />

      {/* Slide-out Menu - Ultra slim drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-[240px] bg-white shadow-2xl z-[10002] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-3 border-b border-gray-100">
          <span className="font-bold text-base text-gray-800">Menu</span>
          <button onClick={closeMenu} className="text-gray-400 hover:text-red-500 text-xl transition-colors">
            {"\u2715"}
          </button>
        </div>

        <div className="flex justify-center p-2 border-b border-gray-100 notranslate" translate="no">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full h-9 rounded-md border border-green-200 bg-green-50 px-3 text-sm font-medium text-green-900 outline-none notranslate"
            aria-label="Select language"
            translate="no"
          >
            {languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="notranslate" translate="no">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <ul className="flex-1 overflow-y-auto py-1 text-sm">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link 
                to={link.path} 
                onClick={closeMenu}
                className="block px-4 py-2 text-gray-700 font-medium hover:text-green-700 hover:bg-green-50 transition-colors"
              >
                {link.name}
              </Link>
            </li>
          ))}

          {/* Additional Mobile-specific Links */}
          <li className="mt-1 border-t border-gray-50 pt-1">
            <Link to="/services/medical/cancer" onClick={closeMenu} className="block px-4 py-2 text-gray-500 text-xs hover:text-green-700 hover:bg-green-50">
              ↳ Cancer Support
            </Link>
          </li>
          <li>
            <Link to="/services/medical/kidney" onClick={closeMenu} className="block px-4 py-2 text-gray-500 text-xs hover:text-green-700 hover:bg-green-50">
              ↳ Kidney Support
            </Link>
          </li>

          {isLoggedIn ? (
            <div className="mt-auto px-3 pb-4 pt-2">
              <div className="bg-gray-50 rounded p-2.5 border border-gray-100">
                {isAdmin ? (
                  <Link to="/admin" onClick={closeMenu} className="flex items-center gap-2 text-blue-700 text-sm font-bold mb-2">
                    Admin Panel
                  </Link>
                ) : hasNgo ? (
                  <Link 
                    to={ngoStatus === 'approved' ? "/ngo/dashboard" : "/ngo/pending"} 
                    onClick={closeMenu} 
                    className="flex items-center justify-between text-purple-700 text-sm font-bold mb-2"
                  >
                    <span>My NGO</span>
                    {ngoStatus === 'pending' && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase tracking-wide">Pending</span>
                    )}
                  </Link>
                ) : (
                  <Link to="/profile" onClick={closeMenu} className="flex items-center gap-2 text-gray-800 text-sm font-medium mb-2">
                    <div className="w-5 h-5 bg-green-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      {userInitial}
                    </div>
                    My Profile
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="w-full bg-red-50 text-red-600 border border-red-100 py-1.5 rounded text-sm font-semibold hover:bg-red-600 hover:text-white transition-colors mt-2"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <li className="p-3 mt-auto">
              <Link 
                to="/login" 
                onClick={closeMenu} 
                className="flex justify-center bg-green-700 text-white py-1.5 rounded text-sm font-semibold hover:bg-green-800 transition-colors"
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