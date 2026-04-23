import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import GoogleTranslate from "../GoogleTranslate.jsx"; // Adjust path if needed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [scrolled, setScrolled] = useState(false);

  // Mobile accordion state
  const [mobileOpen, setMobileOpen] = useState({ about: false, getInvolved: false, media: false, gallery: false, donate: false });

  const toggleMobile = (key) =>
    setMobileOpen((prev) => ({ ...prev, [key]: !prev[key] }));

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

  // Scroll Listener for dynamic styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      } catch (err) { console.error('Failed to check NGO status:', err); }
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
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch { /* Ignore */ } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("authChanged"));
      setMenuOpen(false);
      sessionStorage.setItem("flash_message", JSON.stringify({ type: "success", message: "Logout successfully." }));
      navigate("/");
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileOpen({ about: false, getInvolved: false, media: false, gallery: false, donate: false });
  };

  // Nav data
  const aboutLinks = [
    { name: "Our Story", path: "/about/our-story" },
    { name: "Strategy 2045", path: "/about/strategy-2045" },
    { name: "Our Board", path: "/about/our-board" },
    { name: "Founders", path: "/about/founders" },
    { name: "Our Impact", path: "/about/our-impact" },
  ];

  const getInvolvedLinks = [
    { name: "Volunteer With Us", path: "/volunteer" },
    { name: "Rojgar Yojana",     path: "/rojgar"    },
    { name: "Work With Us",      path: "/add-ngo"   },
    { name: "Give Feedback",     path: "/feedback"  },
  ];

  const mediaLinks = [
    { 
      name: "Gallery", 
      submenu: [
        { name: "Image Gallery", path: "/gallery/images" },
        { name: "Video Gallery", path: "/gallery/videos" },
      ]
    },
    { 
      name: "Events",
      submenu: [
        { name: "Upcoming Events", path: "/events/upcoming" },
        { name: "Past Events", path: "/events/past" },
      ]
    },
    { name: "Blog", path: "/blog" },
  ];

  const donateCauses = [
    {
      name: "Orphan", path: "/services/orphan",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="3" />
          <path d="M5.5 21c0-4 2.9-7 6.5-7s6.5 3 6.5 7" />
          <path d="M9 13.5c-1.5.5-3 1.5-3.5 3" />
          <path d="M15 13.5c1.5.5 3 1.5 3.5 3" />
        </svg>
      ),
    },
    {
      name: "Health", path: "/services/medical-support",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      name: "Elderly", path: "/services/elder",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="3" />
          <path d="M8 21v-6a4 4 0 0 1 8 0v6" />
          <line x1="12" y1="15" x2="14" y2="21" />
          <line x1="14" y1="21" x2="16" y2="18" />
        </svg>
      ),
    },
    {
      name: "More", path: "/services",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      ),
    },
  ];

  const donateAreas = [
    { name: "Mumbai", path: "/find-ngos?city=Mumbai" },
    { name: "Bangalore", path: "/find-ngos?city=Bangalore" },
    { name: "Delhi", path: "/find-ngos?city=Delhi" },
    { name: "PAN India", path: "/find-ngos" },
  ];

  const languageOptions = [
    { value: "en", label: "English" }, { value: "hi", label: "Hindi" },
    { value: "pa", label: "Punjabi" }, { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" }, { value: "bn", label: "Bengali" },
    { value: "gu", label: "Gujarati" }, { value: "mr", label: "Marathi" },
    { value: "ml", label: "Malayalam" }, { value: "kn", label: "Kannada" },
  ];

  const applyGoogleLanguage = (langCode) => {
    const select = document.querySelector("#google_translate_element .goog-te-combo");
    if (!select) {
      console.warn("Google Translate select element not found. Retrying...");
      return false;
    }
    try {
      if (select.value !== langCode) {
        select.value = langCode;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        console.log(`Language changed to: ${langCode}`);
      }
      return true;
    } catch (err) {
      console.error("Error applying language:", err);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const id = setInterval(() => {
      if (!isMounted) return;
      
      const select = document.querySelector("#google_translate_element .goog-te-combo");
      if (select) {
        try {
          if (language !== select.value) {
            select.value = language;
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
          clearInterval(id); // Stop polling once we've synced
        } catch (err) {
          console.warn("Error syncing language:", err);
        }
      }
    }, 300);
    
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [language]);

  const handleLanguageChange = (val) => {
    setLanguage(val);
    
    // Try to apply immediately
    const applied = applyGoogleLanguage(val);
    
    // If not applied, retry with exponential backoff
    if (!applied) {
      let retries = 0;
      const maxRetries = 10;
      const retryTimeout = setInterval(() => {
        if (applyGoogleLanguage(val) || retries >= maxRetries) {
          clearInterval(retryTimeout);
        }
        retries++;
      }, 500);
    }
  };

  const currentLanguageLabel = languageOptions.find(opt => opt.value === language)?.label || "English";

  // ==========================================
  // STYLING VARIABLES
  // ==========================================
  const navBtnFull = "flex h-full w-full items-center px-5 text-[15px] font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50/80 hover:text-[#ff5722] cursor-pointer whitespace-nowrap group focus:outline-none";
  const dropdownBase = "absolute top-full left-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-2 group-hover:translate-y-0 bg-white border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-b-xl border-t-2 border-t-[#ff5722] z-50 py-2";
  const dropLinkClass = "block px-6 py-3 text-[14px] font-medium text-gray-600 transition-all duration-200 border-l-[3px] border-transparent hover:border-[#ff5722] hover:bg-orange-50/50 hover:text-[#ff5722] hover:pl-7 cursor-pointer";

  return (
    <>
      <div style={{ position: "fixed", top: "-9999px", left: "-9999px", width: "1px", height: "1px", visibility: "hidden", pointerEvents: "none" }}>
        <GoogleTranslate />
      </div>

      <nav className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 lg:px-10 bg-white z-[10000] box-border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? "h-[68px] shadow-md border-b border-gray-100" : "h-20 border-b border-gray-200/60"}`}>

        {/* Logo */}
        <div
          className="flex items-center gap-1.5 text-lg font-extrabold cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-95 shrink-0"
          onClick={() => navigate("/")}
        >
          <span className="text-[#ff5722] text-[28px] leading-none drop-shadow-sm">♥</span>
          <span className="text-gray-900 tracking-tight text-[22px]">
            Seva<span className="text-[#ff5722]">India</span>
          </span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center m-0 p-0 list-none h-full">
          <li className="h-full">
            <Link to="/" className={navBtnFull}>Home</Link>
          </li>

          {/* About Us */}
          <li className="relative group h-full">
            <button type="button" className={navBtnFull}>
              About Us <span className="ml-1.5 text-[10px] text-gray-400 transition-transform duration-300 group-hover:-rotate-180 group-hover:text-[#ff5722]">▼</span>
            </button>
            <div className={`w-[240px] ${dropdownBase}`}>
              <ul className="flex flex-col">
                {aboutLinks.map((item) => (
                  <li key={item.name}><Link to={item.path} className={dropLinkClass}>{item.name}</Link></li>
                ))}
              </ul>
            </div>
          </li>

          {/* Get Involved */}
          <li className="relative group h-full">
            <button type="button" className={navBtnFull}>
              Get Involved <span className="ml-1.5 text-[10px] text-gray-400 transition-transform duration-300 group-hover:-rotate-180 group-hover:text-[#ff5722]">▼</span>
            </button>
            <div className={`w-[240px] ${dropdownBase}`}>
              <ul className="flex flex-col">
                {getInvolvedLinks.map((item) => (
                  <li key={item.name}><Link to={item.path} className={dropLinkClass}>{item.name}</Link></li>
                ))}
              </ul>
            </div>
          </li>

          {/* Media */}
          <li className="relative group h-full">
            <button type="button" className={navBtnFull}>
              Media <span className="ml-1.5 text-[10px] text-gray-400 transition-transform duration-300 group-hover:-rotate-180 group-hover:text-[#ff5722]">▼</span>
            </button>
            <div className={`w-[240px] ${dropdownBase}`}>
              <ul className="flex flex-col relative">
                {mediaLinks.map((item) => (
                  <li key={item.name} className={item.submenu ? "relative group/sub" : ""}>
                    {item.submenu ? (
                      <>
                        <button type="button" className={`${dropLinkClass} w-full flex justify-between items-center pr-6`}>
                          {item.name}
                          <span className="text-[10px] text-gray-400 transition-transform duration-300 group-hover/sub:translate-x-1 group-hover/sub:text-[#ff5722]">▶</span>
                        </button>
                        <div className="absolute top-0 left-full ml-0 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] -translate-x-2 group-hover/sub:translate-x-0 w-[220px] bg-white border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-r-xl rounded-bl-xl border-t-2 border-t-[#ff5722] z-[51] py-2">
                          <ul>
                            {item.submenu.map((subitem) => (
                              <li key={subitem.name}><Link to={subitem.path} className={dropLinkClass}>{subitem.name}</Link></li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <Link to={item.path} className={dropLinkClass}>{item.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </li>

          <li className="h-full"><Link to="/community" className={navBtnFull}>Communities</Link></li>
          <li className="h-full"><Link to="/surveys" className={navBtnFull}>Surveys</Link></li>

          {/* Donate Mega Menu */}
          <li className="relative group h-full">
            <button type="button" className={navBtnFull}>
              Donate <span className="ml-1.5 text-[10px] text-gray-400 transition-transform duration-300 group-hover:-rotate-180 group-hover:text-[#ff5722]">▼</span>
            </button>
            <div className={`w-[600px] left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] absolute top-full mt-0 translate-y-2 group-hover:translate-y-0 bg-white border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] rounded-b-xl border-t-2 border-t-[#ff5722] z-50 overflow-hidden`}>
              <div className="flex w-full">
                {/* Causes */}
                <div className="flex-1 p-6 bg-white">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">Donate to a Cause</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {donateCauses.map((c) => (
                      <Link key={c.name} to={c.path} className="flex items-center gap-4 px-3 py-3 rounded-lg group/item hover:bg-orange-50/80 cursor-pointer transition-all duration-200">
                        {/* ICON CONTAINER: Fixed hover effect so SVGs are always perfectly visible */}
                        <div className="w-10 h-10 flex items-center justify-center bg-orange-100/50 text-[#ff5722] rounded-full group-hover/item:bg-white group-hover/item:shadow-sm transition-all duration-300">
                          {c.icon}
                        </div>
                        <span className="text-[15px] font-semibold text-gray-700 group-hover/item:text-[#ff5722] transition-colors">{c.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                {/* Areas */}
                <div className="flex-1 p-6 bg-gray-50/80 border-l border-gray-100">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-200">Find NGOs by City</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {donateAreas.map((a) => (
                      <Link key={a.name} to={a.path} className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-white border border-transparent shadow-sm hover:border-[#10b981]/30 hover:shadow-md hover:translate-x-1 cursor-pointer transition-all duration-200">
                        <span className="text-xl opacity-80">🏛️</span> 
                        <span className="text-[14px] font-semibold text-gray-700">{a.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </li>

          <li className="h-full"><Link to="/contact" className={navBtnFull}>Contact Us</Link></li>
        </ul>

        {/* Desktop Right Side Actions */}
        <div className="hidden lg:flex items-center gap-5 h-full shrink-0">
          
          {/* CUSTOM LANGUAGE SELECTOR WITH BLINKING DOT */}
          <div className="relative group h-full flex items-center cursor-pointer notranslate" translate="no">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 group-hover:border-[#ff5722] transition-colors">
              {/* Continuous Professional Blinking Dot */}
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5722] animate-pulse shadow-[0_0_5px_rgba(255,87,34,0.5)]"></span>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#ff5722] transition-colors">{currentLanguageLabel}</span>
              <span className="text-[10px] text-gray-400 group-hover:text-[#ff5722] transition-colors">▼</span>
            </div>
            
            {/* Custom Dropdown (replaces native select) */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-2 group-hover:translate-y-0 w-36 bg-white border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-b-xl border-t-2 border-t-[#ff5722] z-50 py-2`}>
              <ul className="flex flex-col max-h-[300px] overflow-y-auto hide-scrollbar">
                {languageOptions.map((opt) => (
                  <li key={opt.value}>
                    <button 
                      type="button"
                      onClick={() => handleLanguageChange(opt.value)}
                      className={`w-full text-left px-5 py-2.5 text-[14px] font-medium cursor-pointer transition-colors ${language === opt.value ? 'text-[#ff5722] bg-orange-50' : 'text-gray-600 hover:bg-gray-50 hover:text-[#ff5722]'}`}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link to="/donate" className="bg-[#ff5722] hover:bg-[#e64a19] text-white px-6 py-2.5 rounded-full text-[15px] font-bold shadow-[0_4px_12px_rgba(255,87,34,0.25)] hover:shadow-[0_6px_16px_rgba(255,87,34,0.35)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 active:translate-y-0 cursor-pointer">
            Donate Now
          </Link>

          {/* Login Dropdown */}
          {isLoggedIn ? (
            <div className="relative group h-full flex items-center cursor-pointer">
              <button
                type="button"
                className="w-10 h-10 bg-[#10b981] hover:bg-[#059669] text-white rounded-full flex items-center justify-center font-bold text-base shadow-[0_4px_10px_rgba(16,185,129,0.25)] transition-all duration-300 group-hover:scale-[1.05] active:scale-95 cursor-pointer overflow-hidden"
                title={user?.name || "User"}
                onClick={() => {
                  if (isAdmin) navigate("/admin");
                  else if (hasNgo) navigate(ngoStatus === "approved" ? "/ngo/dashboard" : "/ngo/pending");
                  else navigate("/profile");
                }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span
                  className="w-10 h-10 flex items-center justify-center"
                  style={{ display: user?.avatar ? 'none' : 'flex' }}
                >
                  {userInitial}
                </span>
              </button>
              
              <div className="absolute top-full right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-2 group-hover:translate-y-0 w-60 bg-white border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-b-xl border-t-2 border-t-[#10b981] z-50 py-2">
                <div className="px-6 py-3 border-b border-gray-100 mb-2 bg-gray-50/50">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Signed in as</p>
                  <p className="text-[15px] font-bold text-gray-800 truncate mt-0.5">{user?.name || "User"}</p>
                </div>
                <ul className="flex flex-col">
                  {isAdmin ? (
                    <li><Link to="/admin" className={dropLinkClass.replace('#ff5722', '#10b981').replace('orange', 'green')}>Admin Panel</Link></li>
                  ) : hasNgo ? (
                    <li>
                      <Link to={ngoStatus === 'approved' ? "/ngo/dashboard" : "/ngo/pending"} className={`${dropLinkClass.replace('#ff5722', '#10b981').replace('orange', 'green')} flex justify-between items-center`}>
                        <span>My NGO</span>
                        {ngoStatus === 'pending' && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Pending</span>}
                      </Link>
                    </li>
                  ) : (
                    <li><Link to="/profile" className={dropLinkClass.replace('#ff5722', '#10b981').replace('orange', 'green')}>My Profile</Link></li>
                  )}
                  <div className="h-px bg-gray-100 my-1 mx-4"></div>
                  <li>
                    <button onClick={handleLogout} className="w-full text-left px-6 py-3 text-[14px] font-bold text-red-500 hover:bg-red-50 hover:pl-7 transition-all duration-200 cursor-pointer">
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-[#10b981] border-2 border-[#10b981] px-6 py-2 rounded-full text-[15px] font-bold hover:bg-[#10b981] hover:text-white transition-all duration-300 active:scale-95 cursor-pointer">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none z-[10003] hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`block w-5 h-[2px] bg-gray-800 rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[8px]' : ''}`}></span>
          <span className={`block w-5 h-[2px] bg-gray-800 rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}></span>
          <span className={`block w-5 h-[2px] bg-gray-800 rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[8px]' : ''}`}></span>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[10001] transition-all duration-500 lg:hidden ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={closeMenu}
      />

      <div className={`fixed top-0 right-0 h-full w-[300px] bg-white shadow-2xl z-[10002] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden flex flex-col ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <span className="font-extrabold text-xl text-gray-900 tracking-tight">Navigation</span>
        </div>

        {/* Mobile Custom Language Selector */}
        <div className="px-6 py-4 border-b border-gray-100 notranslate" translate="no">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full h-11 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 px-4 text-sm font-semibold outline-none focus:border-[#ff5722] transition-all cursor-pointer shadow-sm appearance-none"
            style={{ color: '#111827', backgroundColor: '#ffffff' }} // Force light colors for mobile OS
            translate="no"
          >
            {languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-gray-900 bg-white">{opt.label}</option>
            ))}
          </select>
        </div>

        <ul className="flex-1 overflow-y-auto py-3 text-[15px] hide-scrollbar">
          <li>
            <Link to="/" onClick={closeMenu} className="block px-6 py-3.5 text-gray-800 font-bold hover:text-[#ff5722] hover:bg-orange-50 transition-colors cursor-pointer">Home</Link>
          </li>

          <li>
            <button type="button" onClick={() => toggleMobile("about")} className="w-full flex justify-between items-center px-6 py-3.5 text-gray-800 font-bold hover:text-[#ff5722] hover:bg-orange-50 transition-colors cursor-pointer">
              About Us <span className={`text-xs text-gray-400 transition-transform duration-400 ${mobileOpen.about ? '-rotate-180 text-[#ff5722]' : ''}`}>▼</span>
            </button>
            <div className={`grid transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen.about ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <ul className="overflow-hidden bg-gray-50/50">
                {aboutLinks.map((item) => (
                  <li key={item.name}><Link to={item.path} onClick={closeMenu} className="block px-10 py-3 text-sm text-gray-600 font-medium hover:text-[#ff5722] hover:pl-12 transition-all duration-300 cursor-pointer">{item.name}</Link></li>
                ))}
              </ul>
            </div>
          </li>

          <li>
            <button type="button" onClick={() => toggleMobile("getInvolved")} className="w-full flex justify-between items-center px-6 py-3.5 text-gray-800 font-bold hover:text-[#ff5722] hover:bg-orange-50 transition-colors cursor-pointer">
              Get Involved <span className={`text-xs text-gray-400 transition-transform duration-400 ${mobileOpen.getInvolved ? '-rotate-180 text-[#ff5722]' : ''}`}>▼</span>
            </button>
            <div className={`grid transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen.getInvolved ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <ul className="overflow-hidden bg-gray-50/50">
                {getInvolvedLinks.map((item) => (
                  <li key={item.name}><Link to={item.path} onClick={closeMenu} className="block px-10 py-3 text-sm text-gray-600 font-medium hover:text-[#ff5722] hover:pl-12 transition-all duration-300 cursor-pointer">{item.name}</Link></li>
                ))}
              </ul>
            </div>
          </li>

          <li>
            <button type="button" onClick={() => toggleMobile("media")} className="w-full flex justify-between items-center px-6 py-3.5 text-gray-800 font-bold hover:text-[#ff5722] hover:bg-orange-50 transition-colors cursor-pointer">
              Media <span className={`text-xs text-gray-400 transition-transform duration-400 ${mobileOpen.media ? '-rotate-180 text-[#ff5722]' : ''}`}>▼</span>
            </button>
            <div className={`grid transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen.media ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <ul className="overflow-hidden bg-gray-50/50">
                {mediaLinks.map((item) => (
                  <li key={item.name}>
                    {item.submenu ? (
                      <>
                        <button type="button" onClick={() => toggleMobile("gallery")} className="w-full flex justify-between items-center px-10 py-3 text-gray-600 font-medium hover:text-[#ff5722] text-sm transition-colors cursor-pointer">
                          {item.name}
                          <span className={`text-[10px] text-gray-400 transition-transform duration-400 ${mobileOpen.gallery ? '-rotate-180 text-[#ff5722]' : ''}`}>▼</span>
                        </button>
                        <div className={`grid transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen.gallery ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                          <ul className="overflow-hidden bg-gray-100/50">
                            {item.submenu.map((subitem) => (
                              <li key={subitem.name}>
                                <Link to={subitem.path} onClick={closeMenu} className="block px-14 py-2.5 text-gray-500 hover:text-[#ff5722] hover:pl-16 transition-all duration-300 text-[13px] font-medium cursor-pointer">
                                  {subitem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <Link to={item.path} onClick={closeMenu} className="block px-10 py-3 text-sm text-gray-600 font-medium hover:text-[#ff5722] hover:pl-12 transition-all duration-300 cursor-pointer">{item.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </li>

          <li>
            <Link to="/community" onClick={closeMenu} className="block px-6 py-3.5 text-gray-800 font-bold hover:text-[#ff5722] hover:bg-orange-50 transition-colors cursor-pointer">Communities</Link>
          </li>

          <li>
            <Link to="/surveys" onClick={closeMenu} className="block px-6 py-3.5 text-gray-800 font-bold hover:text-[#ff5722] hover:bg-orange-50 transition-colors cursor-pointer">Surveys</Link>
          </li>

          <li>
            <button type="button" onClick={() => toggleMobile("donate")} className="w-full flex justify-between items-center px-6 py-3.5 text-gray-800 font-bold hover:text-[#ff5722] hover:bg-orange-50 transition-colors cursor-pointer">
              Donate <span className={`text-xs text-gray-400 transition-transform duration-400 ${mobileOpen.donate ? '-rotate-180 text-[#ff5722]' : ''}`}>▼</span>
            </button>
            <div className={`grid transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen.donate ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden bg-gray-50/50 px-6 py-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-1">To a Cause</p>
                <ul className="mb-5 space-y-1">
                  {donateCauses.map((c) => (
                    <li key={c.name}><Link to={c.path} onClick={closeMenu} className="flex items-center gap-3 px-4 py-2.5 text-gray-600 font-medium hover:text-[#ff5722] hover:bg-white hover:shadow-sm rounded-xl transition-all duration-300 cursor-pointer"><span className="w-6">{c.icon}</span> {c.name}</Link></li>
                  ))}
                </ul>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">To NGOs in Your Area</p>
                <ul className="space-y-1 pb-2">
                  {donateAreas.map((a) => (
                    <li key={a.name}><Link to={a.path} onClick={closeMenu} className="flex items-center gap-3 px-4 py-2.5 text-gray-600 font-medium hover:text-[#10b981] hover:bg-white hover:shadow-sm rounded-xl transition-all duration-300 cursor-pointer"><span className="text-lg">🏛️</span> {a.name}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          </li>

          <li>
            <Link to="/contact" onClick={closeMenu} className="block px-6 py-3.5 text-gray-800 font-bold hover:text-[#ff5722] hover:bg-orange-50 transition-colors cursor-pointer">Contact Us</Link>
          </li>
        </ul>

        {/* Mobile Bottom Section */}
        <div className="border-t border-gray-100 p-6 space-y-4 bg-gray-50/50">
          <Link to="/donate" onClick={closeMenu} className="flex justify-center bg-[#ff5722] text-white py-3.5 rounded-xl text-[15px] font-bold shadow-md hover:bg-[#e64a19] transition-all cursor-pointer">
            Donate Now
          </Link>

          {isLoggedIn ? (
            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              {isAdmin ? (
                <Link to="/admin" onClick={closeMenu} className="flex items-center justify-center gap-2 text-blue-700 text-sm font-bold mb-2 bg-blue-50 hover:bg-blue-100 py-3 rounded-lg transition-colors cursor-pointer">Admin Panel</Link>
              ) : hasNgo ? (
                <Link to={ngoStatus === 'approved' ? "/ngo/dashboard" : "/ngo/pending"} onClick={closeMenu} className="flex items-center justify-between text-purple-700 text-sm font-bold mb-2 bg-purple-50 hover:bg-purple-100 py-3 px-4 rounded-lg transition-colors cursor-pointer">
                  <span>My NGO</span>
                  {ngoStatus === 'pending' && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded uppercase tracking-wide">Pending</span>}
                </Link>
              ) : (
                <Link to="/profile" onClick={closeMenu} className="flex items-center justify-center gap-2 text-gray-800 text-sm font-bold mb-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 py-3 rounded-lg transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-[#10b981] text-white rounded-full flex items-center justify-center text-[11px] font-bold overflow-hidden flex-shrink-0">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name || "User"}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.textContent = userInitial;
                        }}
                      />
                    ) : (
                      userInitial
                    )}
                  </div>
                  My Profile
                </Link>
              )}
              <button onClick={handleLogout} className="w-full text-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white py-3 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={closeMenu} className="flex justify-center bg-white text-[#10b981] border-2 border-[#10b981] py-3 rounded-xl text-[15px] font-bold hover:bg-[#10b981] hover:text-white transition-all shadow-sm cursor-pointer">
              Login
            </Link>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  );
}

export default Navbar;