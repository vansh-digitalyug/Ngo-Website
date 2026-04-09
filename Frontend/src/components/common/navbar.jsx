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

  // Scroll Listener for dynamic shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
    } catch { /* Ignore logout endpoint errors */ } finally {
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
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#ff5722]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#ff5722]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    // {
    //   name: "Animals", path: "/services/animal",
    //   icon: (
    //     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#ff5722]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    //       <circle cx="11" cy="4" r="2" />
    //       <circle cx="18" cy="4" r="2" />
    //       <circle cx="7" cy="9" r="2" />
    //       <circle cx="17" cy="11" r="2" />
    //       <path d="M13 20c0-3.5-2.5-6-5.5-6S2 16.5 2 20h11z" />
    //       <path d="M20 20c0-2-1.3-4-3-4.5" />
    //     </svg>
    //   ),
    // },
    {
      name: "Elderly", path: "/services/elder",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#ff5722]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#ff5722]" viewBox="0 0 24 24" fill="currentColor">
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
    if (!select) return false;
    if (select.value !== langCode) {
      select.value = langCode;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    return true;
  };

  useEffect(() => {
    const id = setInterval(() => {
      const select = document.querySelector("#google_translate_element .goog-te-combo");
      if (select) {
        clearInterval(id);
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
    setLanguage(next);
    applyGoogleLanguage(next);
  };

  // Reusable Tailwind classes
  const dropLink = "block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-green-50 hover:text-green-800 transition-colors duration-200";
  const navBtn = "flex items-center gap-1 text-gray-700 font-medium px-3 py-2 rounded-md hover:text-green-800 hover:bg-green-50 transition-colors duration-300 text-sm whitespace-nowrap";
  // The animation magic for desktop dropdowns
  const dropdownAnimation = "absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100 origin-top z-50";
  // Right-anchored variant — for the user avatar dropdown (avoids left-0 clipping)
  const dropdownAnimationRight = "absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100 origin-top-right z-50";

  return (
    <>
      {/* Hidden Google Translate */}
      <div className="hidden" aria-hidden="true">
        <GoogleTranslate />
      </div>

      {/* ── DESKTOP NAVBAR ── */}
      <nav className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 lg:px-8 bg-white/95 backdrop-blur-md border-b border-gray-100 z-[10000] box-border transition-all duration-300 ${scrolled ? "h-14 shadow-md" : "h-16 shadow-sm"}`}>

        {/* Logo */}
        <div
          className="flex items-center gap-1 text-lg font-bold cursor-pointer transition-transform hover:scale-105 shrink-0"
          onClick={() => navigate("/")}
        >
          <span className="text-[#ff5722] text-xl">♥</span>
          <span className="text-gray-900 tracking-tight text-xl">
            Seva<span className="text-[#ff5722]">India</span>
          </span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden lg:flex items-center gap-2 m-0 p-0 list-none h-full">
          <li className="flex items-center h-full">
            <Link to="/" className={navBtn}>Home</Link>
          </li>

          {/* About Us */}
          <li className="relative group flex items-center h-full">
            <button type="button" className={navBtn} aria-label="About Us menu">
              About Us <span className="text-[10px] opacity-70 transition-transform group-hover:rotate-180 duration-300">▼</span>
            </button>
            <div className={`w-48 ${dropdownAnimation}`}>
              <ul className="bg-white border border-gray-100 rounded-xl shadow-xl py-2 overflow-hidden">
                {aboutLinks.map((item) => (
                  <li key={item.name}><Link to={item.path} className={dropLink}>{item.name}</Link></li>
                ))}
              </ul>
            </div>
          </li>

          {/* Get Involved */}
          <li className="relative group flex items-center h-full">
            <button type="button" className={navBtn} aria-label="Get Involved menu">
              Get Involved <span className="text-[10px] opacity-70 transition-transform group-hover:rotate-180 duration-300">▼</span>
            </button>
            <div className={`w-48 ${dropdownAnimation}`}>
              <ul className="bg-white border border-gray-100 rounded-xl shadow-xl py-2 overflow-hidden">
                {getInvolvedLinks.map((item) => (
                  <li key={item.name}><Link to={item.path} className={dropLink}>{item.name}</Link></li>
                ))}
              </ul>
            </div>
          </li>

          {/* Media */}
          <li className="relative group flex items-center h-full">
            <button type="button" className={navBtn} aria-label="Media menu">
              Media <span className="text-[10px] opacity-70 transition-transform group-hover:rotate-180 duration-300">▼</span>
            </button>
            <div className={`w-48 ${dropdownAnimation}`}>
              <ul className="bg-white border border-gray-100 rounded-xl shadow-xl py-2 overflow-visible">
                {mediaLinks.map((item) => (
                  <li key={item.name} className={item.submenu ? "relative group/gallery" : ""}>
                    {item.submenu ? (
                      <>
                        <button type="button" className={`${dropLink} w-full flex justify-between items-center group/gallery-btn`}>
                          {item.name}
                          <span className="text-[8px] opacity-60 transition-transform group-hover/gallery:translate-x-1 duration-200">▶</span>
                        </button>
                        <div className="absolute left-full top-0 mt-0 ml-0 pt-0 opacity-0 invisible group-hover/gallery:opacity-100 group-hover/gallery:visible transition-all duration-200 ease-in-out translate-x-0 group-hover/gallery:translate-x-0 scale-95 group-hover/gallery:scale-100 origin-left z-[9999]">
                          <ul className="bg-white border border-gray-100 rounded-lg shadow-2xl py-2 overflow-hidden w-44 ml-1">
                            {item.submenu.map((subitem) => (
                              <li key={subitem.name}>
                                <Link to={subitem.path} className={dropLink}>
                                  {subitem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <Link to={item.path} className={dropLink}>{item.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </li>

          {/* Communities */}
          <li className="flex items-center h-full">
            <Link to="/community" className={navBtn}>Communities</Link>
          </li>

          {/* Surveys */}
          <li className="flex items-center h-full">
            <Link to="/surveys" className={navBtn}>Surveys</Link>
          </li>

          {/* Donate (mega dropdown) */}
          <li className="relative group flex items-center h-full">
            <button type="button" className={navBtn} aria-label="Donate menu">
              Donate <span className="text-[10px] opacity-70 transition-transform group-hover:rotate-180 duration-300">▼</span>
            </button>
            <div className={`w-[440px] ${dropdownAnimation}`}>
              <div className="bg-white border border-gray-100 rounded-xl shadow-2xl p-5 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">To a Cause</p>
                  <ul className="space-y-1">
                    {donateCauses.map((c) => (
                      <li key={c.name}>
                        <Link to={c.path} className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-gray-700 font-medium hover:bg-orange-50 hover:text-[#e64a19] transition-colors">
                          <span className="w-6 h-6 flex items-center justify-center shrink-0 bg-orange-100 rounded-full">{c.icon}</span>
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">To NGOs in Your Area</p>
                  <ul className="space-y-1">
                    {donateAreas.map((a) => (
                      <li key={a.name}>
                        <Link to={a.path} className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-gray-700 font-medium hover:bg-green-50 hover:text-green-800 transition-colors">
                          <span className="text-lg">🏛️</span> {a.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </li>

          {/* Contact Us */}
          <li className="flex items-center h-full">
            <Link to="/contact" className={navBtn}>Contact Us</Link>
          </li>
        </ul>

        {/* Desktop Right Side */}
        <div className="hidden lg:flex items-center gap-4 h-full shrink-0">
          <div className="relative notranslate" translate="no">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="h-9 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 px-3 pr-8 text-xs font-semibold text-gray-700 outline-none transition-all cursor-pointer notranslate"
              translate="no"
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="notranslate" translate="no">{opt.label}</option>
              ))}
            </select>
          </div>

<Link to="/donate" className="bg-[#ff5722] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#e64a19] shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
            Donate Now
          </Link>

          {/* Login / Avatar */}
          {isLoggedIn ? (
            <div className="relative group cursor-pointer h-full flex items-center">
              <div
                className="w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all group-hover:bg-green-700 group-hover:scale-105"
                title={user?.name || "User"}
                onClick={() => {
                  if (isAdmin) navigate("/admin");
                  else if (hasNgo) navigate(ngoStatus === "approved" ? "/ngo/dashboard" : "/ngo/pending");
                  else navigate("/profile");
                }}
              >
                {userInitial}
              </div>
              <div className={`w-52 ${dropdownAnimationRight}`}>
                <ul className="bg-white border border-gray-100 rounded-xl shadow-xl py-2 text-sm overflow-hidden">
                  {isAdmin ? (
                    <li><Link to="/admin" className={dropLink}>Admin Panel</Link></li>
                  ) : hasNgo ? (
                    <li>
                      <Link to={ngoStatus === 'approved' ? "/ngo/dashboard" : "/ngo/pending"} className={`${dropLink} flex justify-between`}>
                        <span>My NGO</span>
                        {ngoStatus === 'pending' && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wide">Pending</span>}
                      </Link>
                    </li>
                  ) : (
                    <li><Link to="/profile" className={dropLink}>My Profile</Link></li>
                  )}
                  <div className="h-px bg-gray-100 my-1"></div>
                  <li>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 font-medium hover:bg-red-50 transition-colors">Logout</button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-green-700 border border-green-700 px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-green-700 hover:text-white transition-all duration-300">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none z-[10003]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-gray-800 transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-800 transition-opacity duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-800 transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[10001] transition-opacity duration-400 ease-in-out lg:hidden ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={closeMenu}
      />

      <div className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[10002] transform transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden flex flex-col ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50">
          <span className="font-bold text-lg text-gray-800">Menu</span>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 notranslate" translate="no">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none notranslate focus:border-green-500"
            translate="no"
          >
            {languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="notranslate" translate="no">{opt.label}</option>
            ))}
          </select>
        </div>

        <ul className="flex-1 overflow-y-auto py-2 text-sm">
          <li>
            <Link to="/" onClick={closeMenu} className="block px-5 py-3 text-gray-800 font-semibold hover:text-green-700 hover:bg-green-50 transition-colors">Home</Link>
          </li>

          {/* About Us Accordion */}
          <li>
            <button type="button" onClick={() => toggleMobile("about")} className="w-full flex justify-between items-center px-5 py-3 text-gray-800 font-semibold hover:text-green-700 hover:bg-green-50 transition-colors">
              About Us <span className={`text-xs transition-transform duration-300 ${mobileOpen.about ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${mobileOpen.about ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <ul className="overflow-hidden bg-gray-50">
                {aboutLinks.map((item) => (
                  <li key={item.name}><Link to={item.path} onClick={closeMenu} className="block px-8 py-2.5 text-gray-600 hover:text-green-700 transition-colors border-l-2 border-transparent hover:border-green-600">{item.name}</Link></li>
                ))}
              </ul>
            </div>
          </li>

          {/* Get Involved Accordion */}
          <li>
            <button type="button" onClick={() => toggleMobile("getInvolved")} className="w-full flex justify-between items-center px-5 py-3 text-gray-800 font-semibold hover:text-green-700 hover:bg-green-50 transition-colors">
              Get Involved <span className={`text-xs transition-transform duration-300 ${mobileOpen.getInvolved ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${mobileOpen.getInvolved ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <ul className="overflow-hidden bg-gray-50">
                {getInvolvedLinks.map((item) => (
                  <li key={item.name}><Link to={item.path} onClick={closeMenu} className="block px-8 py-2.5 text-gray-600 hover:text-green-700 transition-colors border-l-2 border-transparent hover:border-green-600">{item.name}</Link></li>
                ))}
              </ul>
            </div>
          </li>

          {/* Media Accordion */}
          <li>
            <button type="button" onClick={() => toggleMobile("media")} className="w-full flex justify-between items-center px-5 py-3 text-gray-800 font-semibold hover:text-green-700 hover:bg-green-50 transition-colors">
              Media <span className={`text-xs transition-transform duration-300 ${mobileOpen.media ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${mobileOpen.media ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <ul className="overflow-hidden bg-gray-50">
                {mediaLinks.map((item) => (
                  <li key={item.name}>
                    {item.submenu ? (
                      <>
                        <button type="button" onClick={() => toggleMobile("gallery")} className="w-full flex justify-between items-center px-8 py-2.5 text-gray-600 hover:text-green-700 transition-colors border-l-2 border-transparent hover:border-green-600 text-sm font-medium">
                          {item.name}
                          <span className={`text-xs transition-transform duration-300 ${mobileOpen.gallery ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${mobileOpen.gallery ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                          <ul className="overflow-hidden">
                            {item.submenu.map((subitem) => (
                              <li key={subitem.name}>
                                <Link to={subitem.path} onClick={closeMenu} className="block px-12 py-2 text-gray-500 hover:text-green-700 transition-colors border-l-2 border-transparent hover:border-green-600 text-xs">
                                  {subitem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <Link to={item.path} onClick={closeMenu} className="block px-8 py-2.5 text-gray-600 hover:text-green-700 transition-colors border-l-2 border-transparent hover:border-green-600">{item.name}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </li>

          {/* Communities */}
          <li>
            <Link to="/community" onClick={closeMenu} className="block px-5 py-3 text-gray-800 font-semibold hover:text-green-700 hover:bg-green-50 transition-colors">Communities</Link>
          </li>

          {/* Surveys */}
          <li>
            <Link to="/surveys" onClick={closeMenu} className="block px-5 py-3 text-gray-800 font-semibold hover:text-green-700 hover:bg-green-50 transition-colors">Surveys</Link>
          </li>

          {/* Donate Accordion */}
          <li>
            <button type="button" onClick={() => toggleMobile("donate")} className="w-full flex justify-between items-center px-5 py-3 text-gray-800 font-semibold hover:text-green-700 hover:bg-green-50 transition-colors">
              Donate <span className={`text-xs transition-transform duration-300 ${mobileOpen.donate ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${mobileOpen.donate ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden bg-gray-50 px-5 py-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-2">To a Cause</p>
                <ul className="mb-4 space-y-1">
                  {donateCauses.map((c) => (
                    <li key={c.name}><Link to={c.path} onClick={closeMenu} className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-[#e64a19] hover:bg-orange-50 rounded-lg transition-colors"><span className="w-5">{c.icon}</span> {c.name}</Link></li>
                  ))}
                </ul>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">To NGOs in Your Area</p>
                <ul className="space-y-1 pb-2">
                  {donateAreas.map((a) => (
                    <li key={a.name}><Link to={a.path} onClick={closeMenu} className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors">🏛️ {a.name}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          </li>

          <li>
            <Link to="/contact" onClick={closeMenu} className="block px-5 py-3 text-gray-800 font-semibold hover:text-green-700 hover:bg-green-50 transition-colors">Contact Us</Link>
          </li>
        </ul>

        {/* Mobile Bottom Section */}
        <div className="border-t border-gray-100 p-4 space-y-3 bg-white">

          <Link to="/donate" onClick={closeMenu} className="flex justify-center bg-[#ff5722] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#e64a19] shadow-md transition-colors">
            Donate Now
          </Link>

          {isLoggedIn ? (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              {isAdmin ? (
                <Link to="/admin" onClick={closeMenu} className="flex items-center justify-center gap-2 text-blue-700 text-sm font-bold mb-3 bg-blue-50 py-2 rounded-md">Admin Panel</Link>
              ) : hasNgo ? (
                <Link to={ngoStatus === 'approved' ? "/ngo/dashboard" : "/ngo/pending"} onClick={closeMenu} className="flex items-center justify-between text-purple-700 text-sm font-bold mb-3 bg-purple-50 py-2 px-3 rounded-md">
                  <span>My NGO</span>
                  {ngoStatus === 'pending' && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase tracking-wide">Pending</span>}
                </Link>
              ) : (
                <Link to="/profile" onClick={closeMenu} className="flex items-center justify-center gap-2 text-gray-800 text-sm font-medium mb-3 bg-white border border-gray-200 py-2 rounded-md shadow-sm">
                  <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">{userInitial}</div>
                  My Profile
                </Link>
              )}
              <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 border border-red-100 py-2 rounded-md text-sm font-semibold hover:bg-red-600 hover:text-white transition-all">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={closeMenu} className="flex justify-center bg-white text-green-700 border-2 border-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-50 transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;