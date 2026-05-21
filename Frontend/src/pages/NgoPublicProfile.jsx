import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaMapMarkerAlt, FaShareAlt, FaCheckCircle, FaChevronDown,
  FaArrowLeft, FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin,
  FaGlobe, FaRegClock, FaFileAlt, FaBriefcase, FaGraduationCap, FaCalendarAlt, FaMapPin, FaClock
} from "react-icons/fa";
import { RiShieldCheckFill } from "react-icons/ri";

// Single Original Theme Color
const THEME_COLOR = "#E44950";
const THEME_LIGHT = "#FDF3F1"; // Very light version of the theme color for backgrounds

export default function NgoPublicProfile() {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Animation & Interaction States
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("what-we-do");
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(0);
  
  // Data States
  const [fundUtilizations, setFundUtilizations] = useState([]);
  const [fundUtilLoading, setFundUtilLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState({});
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [surveysLoading, setSurveysLoading] = useState(true);
  const [showMoreSurveys, setShowMoreSurveys] = useState(false);
  const [allSurveys, setAllSurveys] = useState([]);
  const [employment, setEmployment] = useState([]);
  const [employmentLoading, setEmploymentLoading] = useState(true);
  const [employmentCount, setEmploymentCount] = useState(0);
  const [showMoreEmployment, setShowMoreEmployment] = useState(false);
  const [expandedFundAccordions, setExpandedFundAccordions] = useState({});
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    fullName: "",
    age: "",
    email: "",
    phone: "",
    education: "",
    experience: "",
    coverMessage: ""
  });
  const [submittingApplication, setSubmittingApplication] = useState(false);
  
  // Events States
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [showMoreUpcomingEvents, setShowMoreUpcomingEvents] = useState(false);
  const [showMorePastEvents, setShowMorePastEvents] = useState(false);
  const [activeEventTab, setActiveEventTab] = useState("upcoming");

  const API = String(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

  // Fetch all data from database
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. Fetch NGO data
        const ngoRes = await fetch(`${API}/api/ngo/${id}`);
        const ngoData = await ngoRes.json();
        console.log("NGO Data:", ngoData);
        if (ngoData.data) {
          setNgo(ngoData.data);
          setTimeout(() => setIsMounted(true), 100);
        }

        // 2. Fetch Gallery data - THIS ENDPOINT IS NGO-SPECIFIC
        try {
          const galleryRes = await fetch(`${API}/api/ngo/${id}/gallery?limit=50`);
          if (!galleryRes.ok) throw new Error(`Gallery fetch failed: ${galleryRes.status}`);
          const galleryRawData = await galleryRes.json();
          console.log("Gallery Response Full:", galleryRawData);
          console.log("Gallery Response Data:", galleryRawData?.data);
          console.log("Gallery Items Array:", galleryRawData?.data?.items);
          
          let galleryItems = [];
          // Handle ApiResponse format: { success, message, data: { items, pagination } }
          if (galleryRawData.data?.items && Array.isArray(galleryRawData.data.items)) {
            galleryItems = galleryRawData.data.items;
            console.log("Using data.items format, found:", galleryItems.length, "items");
            console.log("First item:", galleryItems[0]);
          } 
          // Handle direct items array
          else if (Array.isArray(galleryRawData.data)) {
            galleryItems = galleryRawData.data;
            console.log("Using direct data array format, found:", galleryItems.length, "items");
          } 
          // Handle raw array
          else if (Array.isArray(galleryRawData)) {
            galleryItems = galleryRawData;
            console.log("Using raw array format, found:", galleryItems.length, "items");
          }
          
          console.log(`Setting ${galleryItems.length} gallery items`);
          if (galleryItems.length > 0) {
            setGallery(galleryItems);
            console.log("Gallery state set successfully");
          } else {
            console.warn("No gallery items found in response");
            setGallery([]);
          }
        } catch (error) {
          console.error("Error fetching gallery:", error);
          setGallery([]);
        } finally {
          setGalleryLoading(false);
        }

        // 3. Fetch Fund Utilization data
        try {
          const fundRes = await fetch(`${API}/api/fund-utilization/public/${id}`);
          const fundRawData = await fundRes.json();
          console.log("Fund Utilization Response:", fundRawData);
          if (fundRawData.data) {
            setFundUtilizations(fundRawData.data);
            
            // Keep all accordions closed by default - users can click to expand
            const allClosed = {};
            fundRawData.data.forEach((_, idx) => {
              allClosed[idx] = false;
            });
            setExpandedFundAccordions(allClosed);
            
            // Fetch all image URLs for fund utilization
            const urls = {};
            for (const item of fundRawData.data) {
              if (item.imageKey) {
                try {
                  const imageRes = await fetch(`${API}/api/s3/get-url?key=${encodeURIComponent(item.imageKey)}`);
                  const imageData = await imageRes.json();
                  if (imageData.data && imageData.data.Url) {
                    urls[item.imageKey] = imageData.data.Url;
                  }
                } catch (error) {
                  console.error("Error fetching fund utilization image URL:", error);
                }
              }
            }
            setImageUrls(urls);
          }
        } catch (error) {
          console.error("Error fetching fund utilizations:", error);
        } finally {
          setFundUtilLoading(false);
        }

        // 4. Fetch Surveys data - PUBLIC ENDPOINT
        try {
          const surveysRes = await fetch(`${API}/api/surveys/public?limit=100`);
          if (!surveysRes.ok) throw new Error(`Surveys fetch failed: ${surveysRes.status}`);
          const surveysRawData = await surveysRes.json();
          console.log("Surveys Response:", surveysRawData);
          
          let surveysList = [];
          // Handle response: { success, message, data: { surveys, pagination } }
          if (surveysRawData.data?.surveys && Array.isArray(surveysRawData.data.surveys)) {
            surveysList = surveysRawData.data.surveys;
          } 
          // Handle direct array
          else if (Array.isArray(surveysRawData.data)) {
            surveysList = surveysRawData.data;
          } 
          // Handle raw array
          else if (Array.isArray(surveysRawData)) {
            surveysList = surveysRawData;
          }
          
          if (Array.isArray(surveysList) && surveysList.length > 0) {
            // Filter surveys by ngoId using string comparison
            const ngoSurveys = surveysList.filter(s => {
              const surveyNgoId = String(s.ngoId?._id || s.ngoId || "");
              const targetId = String(id || "");
              const match = surveyNgoId === targetId;
              if (!match && surveysList.length < 5) {
                console.log(`Survey ngoId: "${surveyNgoId}", Target ID: "${targetId}", Match: ${match}`);
              }
              return match;
            });
            console.log(`Found ${ngoSurveys.length} surveys for NGO ${id} out of ${surveysList.length} total`);
            console.log("Survey objects:", ngoSurveys);
            setAllSurveys(ngoSurveys);
            setSurveys(ngoSurveys.slice(0, 3));
            setShowMoreSurveys(ngoSurveys.length > 3);
          } else {
            console.log("No surveys found in response");
            setSurveys([]);
            setShowMoreSurveys(false);
          }
        } catch (error) {
          console.error("Error fetching surveys:", error);
          setSurveys([]);
          setShowMoreSurveys(false);
        } finally {
          setSurveysLoading(false);
        }

        // 5. Fetch Employment data - PUBLIC ENDPOINT
        try {
          const empRes = await fetch(`${API}/api/employment?limit=100&status=all`);
          if (!empRes.ok) throw new Error(`Employment fetch failed: ${empRes.status}`);
          const empRawData = await empRes.json();
          console.log("Employment Response:", empRawData);
          
          let jobsList = [];
          // Handle different response structures
          if (empRawData.data?.jobs && Array.isArray(empRawData.data.jobs)) {
            jobsList = empRawData.data.jobs;
          } else if (empRawData.data?.pagination?.total) {
            jobsList = empRawData.data.jobs || [];
          } else if (Array.isArray(empRawData.data)) {
            jobsList = empRawData.data;
          } else if (Array.isArray(empRawData)) {
            jobsList = empRawData;
          }
          
          if (Array.isArray(jobsList) && jobsList.length > 0) {
            // Filter employment by ngoId and status=open
            const ngoEmployment = jobsList.filter(e => {
              const empNgoId = String(e.ngoId?._id || e.ngoId || "");
              const targetId = String(id || "");
              return (empNgoId === targetId) && (e.status === "open" || !e.status);
            });
            
            console.log(`Found ${ngoEmployment.length} open jobs for NGO ${id} out of ${jobsList.length} total`);
            
            // Show first 3, rest available via load more
            setEmployment(ngoEmployment.slice(0, 3));
            setEmploymentCount(ngoEmployment.length);
            setShowMoreEmployment(ngoEmployment.length > 3);
          } else {
            console.log("No employment found in response");
            setEmployment([]);
            setEmploymentCount(0);
            setShowMoreEmployment(false);
          }
        } catch (error) {
          console.error("Error fetching employment:", error);
          setEmployment([]);
          setEmploymentCount(0);
          setShowMoreEmployment(false);
        } finally {
          setEmploymentLoading(false);
        }

        // 6. Fetch Events data - PUBLIC ENDPOINT
        try {
          const eventsRes = await fetch(`${API}/api/events`);
          if (!eventsRes.ok) throw new Error(`Events fetch failed: ${eventsRes.status}`);
          const eventsData = await eventsRes.json();
          console.log("Events Response:", eventsData);
          
          let eventsList = Array.isArray(eventsData.data) ? eventsData.data : [];
          
          // Filter events by ngoId
          const ngoEventsList = eventsList.filter(e => {
            const eventNgoId = String(e.ngoId?._id || e.ngoId || "");
            const targetId = String(id || "");
            return eventNgoId === targetId && e.isPublished;
          });
          
          // Separate upcoming and past events
          const now = new Date();
          const upcoming = ngoEventsList.filter(e => new Date(e.date) >= now && (e.status === "upcoming" || e.status === "ongoing"));
          const past = ngoEventsList.filter(e => new Date(e.date) < now || e.status === "completed" || e.status === "past");
          
          const sortedUpcoming = upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
          const sortedPast = past.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          // Show first 3, rest available via load more
          setUpcomingEvents(sortedUpcoming.slice(0, 3));
          setPastEvents(sortedPast.slice(0, 3));
          setShowMoreUpcomingEvents(sortedUpcoming.length > 3);
          setShowMorePastEvents(sortedPast.length > 3);
          setEvents(ngoEventsList);
          
          console.log(`Found ${ngoEventsList.length} events for NGO ${id}`);
        } catch (error) {
          console.error("Error fetching events:", error);
          setUpcomingEvents([]);
          setPastEvents([]);
          setShowMoreUpcomingEvents(false);
          setShowMorePastEvents(false);
          setEvents([]);
        } finally {
          setEventsLoading(false);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching NGO data:", error);
        setLoading(false);
      }
    };

    if (id) {
      fetchAllData();
    }
  }, [id]);

  // Smooth Scroll Navigation Logic
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      // Offset by 130px to account for the sticky header
      const y = element.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Load more employment handler
  const handleLoadMoreEmployment = async () => {
    try {
      const empRes = await fetch(`${API}/api/employment?limit=100&status=all`);
      if (!empRes.ok) return;
      
      const empRawData = await empRes.json();
      let jobsList = [];
      if (empRawData.data?.jobs) jobsList = empRawData.data.jobs;
      else if (Array.isArray(empRawData.data)) jobsList = empRawData.data;
      else if (Array.isArray(empRawData)) jobsList = empRawData;
      
      const ngoEmployment = jobsList.filter(e => {
        const empNgoId = String(e.ngoId?._id || e.ngoId || "");
        const targetId = String(id || "");
        return (empNgoId === targetId) && (e.status === "open" || !e.status);
      });
      
      setEmployment(ngoEmployment);
      setShowMoreEmployment(false);
    } catch (error) {
      console.error("Error loading more employment:", error);
    }
  };

  // Load more events handlers
  const handleLoadMoreUpcomingEvents = () => {
    setShowMoreUpcomingEvents(false);
    const fullList = events.filter(e => {
      const eventNgoId = String(e.ngoId?._id || e.ngoId || "");
      const targetId = String(id || "");
      return eventNgoId === targetId && e.isPublished;
    });
    const now = new Date();
    const upcoming = fullList.filter(e => new Date(e.date) >= now && (e.status === "upcoming" || e.status === "ongoing"));
    const sorted = upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    setUpcomingEvents(sorted);
  };

  const handleLoadMorePastEvents = () => {
    setShowMorePastEvents(false);
    const fullList = events.filter(e => {
      const eventNgoId = String(e.ngoId?._id || e.ngoId || "");
      const targetId = String(id || "");
      return eventNgoId === targetId && e.isPublished;
    });
    const now = new Date();
    const past = fullList.filter(e => new Date(e.date) < now || e.status === "completed" || e.status === "past");
    const sorted = past.sort((a, b) => new Date(b.date) - new Date(a.date));
    setPastEvents(sorted);
  };

  const handleLoadMoreSurveys = () => {
    setShowMoreSurveys(false);
    setSurveys(allSurveys);
  };

  // Handle Employment Application Modal
  const handleApplyNow = (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleApplicationFormChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!applicationForm.fullName || !applicationForm.email || !applicationForm.phone) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmittingApplication(true);
      
      const payload = {
        employmentId: selectedJob._id,
        ngoId: id,
        applicantName: applicationForm.fullName,
        applicantAge: applicationForm.age,
        applicantEmail: applicationForm.email,
        applicantPhone: applicationForm.phone,
        education: applicationForm.education,
        experience: applicationForm.experience,
        coverMessage: applicationForm.coverMessage,
        status: "pending"
      };

      const response = await fetch(`${API}/api/employment-application/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.ok) {
        alert("Application submitted successfully!");
        setApplicationForm({
          fullName: "",
          age: "",
          email: "",
          phone: "",
          education: "",
          experience: "",
          coverMessage: ""
        });
        setShowApplicationModal(false);
        setSelectedJob(null);
      } else {
        alert(result.message || "Error submitting application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application. Please try again.");
    } finally {
      setSubmittingApplication(false);
    }
  };

  // Helper functions
  const formatEventDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatEventTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    if (isNaN(h)) return time;
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "pm" : "am"}`;
  };

  const getOrganizerName = (event) => {
    if (event.createdByRole === "admin") return "Seva India";
    if (event.createdByRole === "ngo" && event.ngoId?.ngoName) return event.ngoId.ngoName;
    if (event.createdByRole === "ngo" && typeof event.ngoId === "string") return event.ngoName || "NGO";
    return event.ngoName || "Seva India";
  };

  // Setup Intersection Observer to update active tab on manual scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["what-we-do", "events", "surveys", "fund-utilization", "employment-rojgar", "gallery"];
      let current = "";
      
      for (let section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            current = section;
          }
        }
      }
      if (current && current !== activeTab) {
        setActiveTab(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-12 h-12 rounded-full border-4 border-gray-100 animate-spin" style={{ borderTopColor: THEME_COLOR }} />
    </div>
  );

  const TABS = [
    { label: "What we do", id: "what-we-do" },
    { label: "Events", id: "events" },
    { label: "Surveys", id: "surveys" },
    { label: "Fund Utilization", id: "fund-utilization" },
    { label: "Employment & Rojgar", id: "employment-rojgar" },
    { label: "Gallery", id: "gallery" }
  ];

  return (
    <div className={`font-sans min-h-screen text-gray-800 bg-white transition-opacity duration-700 ${isMounted ? "opacity-100" : "opacity-0"}`}>
      
      {/* ── HEADER SECTION ── */}
      <div style={{ backgroundColor: "#FAF6F5" }} className="pt-8 pb-0 border-b border-gray-200">
        <div className={`max-w-[1000px] mx-auto px-4 sm:px-6 transition-all duration-700 transform ${isMounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          
          <Link to="/find-ngos" className="inline-flex items-center gap-2 text-xs text-gray-500 no-underline hover:text-gray-900 transition-colors mb-6 font-medium group">
            <FaArrowLeft className="transform transition-transform group-hover:-translate-x-1" /> Back to search
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8">
            {/* NGO Info */}
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden group">
                {ngo?.logo ? (
                  <img 
                    src={ngo.logo} 
                    alt="NGO Logo" 
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center rounded-xl font-bold text-2xl sm:text-3xl text-white"
                    style={{ backgroundColor: THEME_COLOR }}
                  >
                    {ngo?.ngoName 
                      ? ngo.ngoName.split(" ").slice(0, 2).map(word => word[0]).join("").toUpperCase() 
                      : "NGO"}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold m-0 text-gray-900">
                    {ngo?.ngoName || "NGO Name Not Available"}
                  </h1>
                  {ngo?.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-white border px-2 py-0.5 rounded w-max" style={{ color: THEME_COLOR, borderColor: THEME_COLOR }}>
                      <FaCheckCircle /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: THEME_COLOR }}>
                  <FaMapMarkerAlt className="text-xs" />
                  <span>
                    {ngo?.city || "City Not Available"}{ngo?.state ? `, ${ngo.state}` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm w-full md:w-auto">
              <div className="text-center px-4 border-r border-gray-100">
                <p className="text-xs text-gray-500 font-semibold mb-0.5">Tax Benefit</p>
                <p className="text-sm font-bold m-0" style={{ color: THEME_COLOR }}>
                  {ngo?.taxBenefit || "N/A"}
                </p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs text-gray-500 font-semibold mb-0.5">Est. Since</p>
                <p className="text-sm font-bold text-gray-800 m-0">
                  {ngo?.estYear || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── STICKY TABS BAR ── */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-x-auto no-scrollbar gap-4 sm:gap-0 pt-4">
              <div className="flex gap-6 sm:gap-8 min-w-max relative">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => scrollToSection(tab.id)}
                      className={`pb-4 text-sm font-semibold transition-all duration-300 relative whitespace-nowrap ${
                        isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                      }`}
                      style={{ color: isActive ? THEME_COLOR : undefined }}
                    >
                      {tab.label}
                      {isActive && (
                        <span 
                          className="absolute bottom-0 left-0 w-full h-0.5 rounded-t-md transition-all duration-300" 
                          style={{ backgroundColor: THEME_COLOR }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── EXPANDED MAIN CONTENT ── */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-12">
        <div className={`transition-all duration-700 delay-100 transform ${isMounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          
          {/* SECTION 1: What We Do */}
          <section id="what-we-do" className="scroll-mt-32 mb-20">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">What we do</h2>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-5 text-sm text-gray-500 font-medium mb-6 bg-gray-50 w-max px-4 py-2 rounded-lg">
                <span className="flex items-center gap-2">
                  <RiShieldCheckFill className="text-lg" style={{ color: THEME_COLOR }} /> 
                  {ngo?.services?.length || 0} Services
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="flex items-center gap-2">
                  <FaRegClock className="text-lg" style={{ color: THEME_COLOR }} /> 
                  Est. {ngo?.estYear || "N/A"}
                </span>
              </div>
              
              <div className="relative mb-8">
                <p className={`text-base leading-relaxed transition-all duration-500 ease-in-out overflow-hidden text-gray-600 ${isDescExpanded ? 'max-h-[1000px]' : 'max-h-[72px] line-clamp-3'}`}>
                  {ngo?.description || "No description available yet"}
                </p>
                {ngo?.description && ngo.description.length > 200 && (
                  <button 
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-sm font-bold bg-transparent border-none cursor-pointer p-0 hover:underline transition-all mt-2"
                    style={{ color: THEME_COLOR }}
                  >
                    {isDescExpanded ? "Read less" : "Read more about our mission"}
                  </button>
                )}
              </div>

              {/* Important Links Grid */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Important Links</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: FaGlobe, label: "Website", url: ngo?.website },
                    { icon: FaFacebook, label: "Facebook", url: ngo?.social?.facebook },
                    { icon: FaYoutube, label: "Youtube", url: ngo?.social?.youtube },
                    { icon: FaInstagram, label: "Instagram", url: ngo?.social?.instagram },
                  ].map((link, i) => (
                    <a 
                      key={i} 
                      href={link.url || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`group flex justify-between items-center text-sm text-gray-700 font-medium no-underline transition-all bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 ${link.url ? 'hover:bg-white hover:shadow-sm' : 'opacity-50 cursor-not-allowed'}`} 
                      style={{ hoverBorderColor: THEME_COLOR }}
                    >
                      <span className="flex items-center gap-3">
                        <link.icon className="text-gray-400 text-lg group-hover:scale-110 transition-all" style={{ color: 'inherit' }} /> 
                        <span className="group-hover:text-gray-900 transition-colors">{link.label}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Events */}
          <section id="events" className="scroll-mt-32 mb-20">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Events</h2>
            
            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full border-4 border-gray-100 animate-spin" style={{ borderTopColor: THEME_COLOR }} />
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm text-center py-12">
                <p className="text-gray-500 text-lg">No events organized yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                
                {/* Professional Text Toggle */}
                <div className="flex gap-8 mb-8 pb-6 border-b border-gray-200">
                  <button
                    onClick={() => setActiveEventTab("upcoming")}
                    className={`text-lg font-bold transition-all duration-300 cursor-pointer relative pb-2 ${
                      activeEventTab === "upcoming"
                        ? "text-gray-900"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Upcoming Events
                    {activeEventTab === "upcoming" && (
                      <span 
                        className="absolute bottom-0 left-0 w-full h-0.5"
                        style={{ backgroundColor: THEME_COLOR }}
                      />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveEventTab("past")}
                    className={`text-lg font-bold transition-all duration-300 cursor-pointer relative pb-2 ${
                      activeEventTab === "past"
                        ? "text-gray-900"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    Past Events
                    {activeEventTab === "past" && (
                      <span 
                        className="absolute bottom-0 left-0 w-full h-0.5"
                        style={{ backgroundColor: THEME_COLOR }}
                      />
                    )}
                  </button>
                </div>

                {/* Upcoming Events Tab */}
                {activeEventTab === "upcoming" && (
                  <div className="animate-fadeIn">
                    {upcomingEvents.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 text-base">No upcoming events at this time</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {upcomingEvents.map((event, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col bg-white group">
                              {/* Event Image */}
                              <div className="h-40 bg-gray-100 overflow-hidden flex items-center justify-center">
                                {event.imageUrl ? (
                                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                  <FaCalendarAlt className="text-3xl text-gray-300" />
                                )}
                              </div>
                              
                              {/* Event Info */}
                              <div className="p-4 flex flex-col flex-1">
                                <span className="text-xs font-bold text-amber-700 bg-amber-50 w-max px-2 py-1 rounded mb-2">{getOrganizerName(event)}</span>
                                <h4 className="font-bold text-base text-gray-900 mb-2 line-clamp-2">{event.title}</h4>
                                
                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <FaCalendarAlt size={14} className="text-gray-400 flex-shrink-0" />
                                    <span>{formatEventDate(event.date)}</span>
                                  </div>
                                  {event.startTime && (
                                    <div className="flex items-center gap-2">
                                      <FaClock size={14} className="text-gray-400 flex-shrink-0" />
                                      <span>{formatEventTime(event.startTime)}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <FaMapPin size={14} className="text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{event.location || "TBA"}</span>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => window.location.href = `/events/upcoming/${encodeURIComponent(event.title)}`}
                                  className="w-full px-4 py-2 rounded-lg text-sm font-bold text-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 mt-auto"
                                  style={{ backgroundColor: THEME_COLOR }}
                                >
                                  Register Now
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {showMoreUpcomingEvents && (
                          <div className="flex justify-center mt-12">
                            <button
                              onClick={handleLoadMoreUpcomingEvents}
                              className="flex flex-col items-center gap-1 py-0 px-0 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                              <span className="text-sm sm:text-sm font-black tracking-wider" style={{ color: THEME_COLOR }}>
                                Load More
                              </span>
                              <div className="flex flex-col items-center gap-0">
                                <FaChevronDown size={12} style={{ color: THEME_COLOR }} className="animate-bounce" />
                              </div>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {/* Past Events Tab */}
                {activeEventTab === "past" && (
                  <div className="animate-fadeIn">
                    {pastEvents.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 text-base">No past events yet</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {pastEvents.map((event, i) => (
                            <div 
                              key={i} 
                              onClick={() => window.location.href = `/events/past/${encodeURIComponent(event.title)}`}
                              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col bg-white group cursor-pointer"
                            >
                              {/* Event Image */}
                              <div className="h-40 bg-gray-100 overflow-hidden flex items-center justify-center">
                                {event.imageUrl ? (
                                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                  <FaCalendarAlt className="text-3xl text-gray-300" />
                                )}
                              </div>
                              
                              {/* Event Info */}
                              <div className="p-4 flex flex-col flex-1">
                                <span className="text-xs font-bold text-amber-700 bg-amber-50 w-max px-2 py-1 rounded mb-2">{getOrganizerName(event)}</span>
                                <h4 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-800 transition-colors">{event.title}</h4>
                                
                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <FaCalendarAlt size={14} className="text-gray-400 flex-shrink-0" />
                                    <span>{formatEventDate(event.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FaMapPin size={14} className="text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{event.location || "TBA"}</span>
                                  </div>
                                </div>
                                
                                <div className="px-3 py-2 rounded-lg text-sm font-bold text-center text-gray-600 bg-gray-100 mt-auto group-hover:bg-gray-200 transition-colors">
                                  View Details
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {showMorePastEvents && (
                          <div className="flex justify-center mt-12">
                            <button
                              onClick={handleLoadMorePastEvents}
                              className="flex flex-col items-center gap-1 py-0 px-0 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                              <span className="text-sm sm:text-sm font-black tracking-wider" style={{ color: THEME_COLOR }}>
                                Load More
                              </span>
                              <div className="flex flex-col items-center gap-0">
                                <FaChevronDown size={12} style={{ color: THEME_COLOR }} className="animate-bounce" />
                              </div>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* SECTION 3: Surveys */}
          <section id="surveys" className="scroll-mt-32 mb-20">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Impact Surveys</h2>
            
            {surveysLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full border-4 border-gray-100 animate-spin" style={{ borderTopColor: THEME_COLOR }} />
              </div>
            ) : surveys.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm text-center py-12">
                <p className="text-gray-500 text-lg">No surveys available yet</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {surveys.map((survey, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: THEME_LIGHT, color: THEME_COLOR }}>
                        <FaFileAlt className="text-lg sm:text-xl" />
                      </div>
                      <span className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                        {new Date(survey.createdAt).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                      <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-800 leading-tight group-hover:text-black transition-colors line-clamp-2">
                        {survey.title || "Untitled Survey"}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mb-4 flex-1 line-clamp-2">
                        {survey.description || "No description available"}
                      </p>
                      <div className="pt-4 border-t border-gray-100 flex-1 flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold" style={{ color: THEME_COLOR }}>
                            {survey.responseCount || 0} Responses
                          </span>
                          <span className="text-xs font-medium text-gray-500">
                            {survey.status === 'active' ? '🟢 Active' : '🔴 Closed'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const token = survey.shareToken || survey._id;
                            console.log("Survey Share Token:", token);
                            console.log("Using token to access survey");
                            if (!token) {
                              alert("Survey token is not available");
                              return;
                            }
                            window.location.href = `/survey/${token}`;
                          }}
                          className="w-full px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 text-center"
                          style={{ backgroundColor: THEME_COLOR }}
                        >
                          Participate in Survey
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {showMoreSurveys && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={handleLoadMoreSurveys}
                      className="flex flex-col items-center gap-1 py-0 px-0 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <span className="text-sm sm:text-sm font-black tracking-wider" style={{ color: THEME_COLOR }}>
                        Load More
                      </span>
                      <div className="flex flex-col items-center gap-0">
                        <FaChevronDown size={12} style={{ color: THEME_COLOR }} className="animate-bounce" />
                      </div>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* SECTION 4: Fund Utilization */}
          <section id="fund-utilization" className="scroll-mt-32 mb-20">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Fund Utilization</h2>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              {fundUtilLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-4 border-gray-100 animate-spin" style={{ borderTopColor: THEME_COLOR }} />
                </div>
              ) : fundUtilizations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No fund utilization data available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Accordion */}
                  <div className="flex flex-col gap-2">
                    {fundUtilizations.map((item, idx) => {
                      const isOpen = expandedFundAccordions[idx];
                      return (
                        <div
                          key={idx}
                          className="border border-gray-100 rounded-xl overflow-hidden transition-all duration-300"
                          style={{ backgroundColor: isOpen ? "#FAFAFA" : "#FFFFFF" }}
                        >
                          <div
                            className="flex justify-between items-center p-5 cursor-pointer group"
                            onClick={() => setExpandedFundAccordions(prev => ({
                              ...prev,
                              [idx]: !prev[idx]
                            }))}
                          >
                            <div
                              className="font-bold text-base transition-colors flex items-center gap-3 flex-1"
                              style={{ color: isOpen ? THEME_COLOR : "#1f2937" }}
                            >
                              {item.title}
                            </div>
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-gray-100 flex-shrink-0"
                              style={{ backgroundColor: isOpen ? THEME_LIGHT : "#f3f4f6" }}
                            >
                              <FaChevronDown
                                className={`text-sm transition-transform duration-300 ${
                                  isOpen ? "rotate-180" : "text-gray-500"
                                }`}
                                style={{ color: isOpen ? THEME_COLOR : undefined }}
                              />
                            </div>
                          </div>
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isOpen
                                ? "max-h-none opacity-100 pb-5 px-5"
                                : "max-h-0 opacity-0 px-5"
                            }`}
                          >
                            {item.imageKey && imageUrls[item.imageKey] && (
                              <div className="mb-4">
                                <img
                                  src={imageUrls[item.imageKey]}
                                  alt={item.title}
                                  className="w-full max-w-xs h-auto rounded-lg border border-gray-200"
                                />
                              </div>
                            )}
                            <p
                              className="text-sm text-gray-600 leading-relaxed border-l-2 pl-4 whitespace-pre-wrap"
                              style={{ borderLeftColor: `${THEME_COLOR}50` }}
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 5: Employment & Rojgar */}
          <section id="employment-rojgar" className="scroll-mt-32 mb-20">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Employment & Rojgar</h2>
            
            {employmentLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full border-4 border-gray-100 animate-spin" style={{ borderTopColor: THEME_COLOR }} />
              </div>
            ) : employment.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm text-center py-12">
                <p className="text-gray-500 text-lg">No employment opportunities available yet</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {employment.map((job, i) => {
                    const isOpen = job.status === "open" || !job.status;
                    const isClosed = job.status === "closed";
                    const buttonText = isClosed ? "Closed" : "Apply Now";
                    const buttonDisabled = isClosed;
                    
                    return (
                      <div key={i} className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center mb-3 sm:mb-4" style={{ backgroundColor: THEME_LIGHT }}>
                          <FaBriefcase className="text-base sm:text-lg" style={{ color: THEME_COLOR }} />
                        </div>
                        <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-800 group-hover:text-black transition-colors line-clamp-2">
                          {job.title || "Untitled Job"}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-3 flex-1 line-clamp-2">
                          {job.description || "No description available"}
                        </p>
                        <div className="pt-3 border-t border-gray-100 flex-1 flex flex-col justify-between">
                          <div className="mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase">
                              {job.category || "General"}
                            </span>
                          </div>
                          <button
                            disabled={buttonDisabled}
                            onClick={() => !buttonDisabled && handleApplyNow(job)}
                            className={`w-full px-3 py-2 rounded text-xs font-bold text-white transition-all duration-300 ${
                              buttonDisabled
                                ? 'bg-gray-300 cursor-not-allowed opacity-60'
                                : 'hover:shadow-md hover:-translate-y-0.5 active:scale-95'
                            }`}
                            style={{ backgroundColor: buttonDisabled ? '#d1d5db' : THEME_COLOR }}
                          >
                            {buttonText}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {showMoreEmployment && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={handleLoadMoreEmployment}
                      className="flex flex-col items-center gap-1 py-0 px-0 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <span className="text-sm sm:text-sm font-black tracking-wider" style={{ color: THEME_COLOR }}>
                        Load More
                      </span>
                      <div className="flex flex-col items-center gap-0">
                        <FaChevronDown size={12} style={{ color: THEME_COLOR }} className="animate-bounce" />
                      </div>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* SECTION 6: Gallery */}
          <section id="gallery" className="scroll-mt-32 mb-20">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Gallery</h2>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <p className="text-gray-600 mb-8 leading-relaxed">
                A visual journey of our work. From rescue missions to recovery stories, witness the impact we create every day.
              </p>

              {galleryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-4 border-gray-100 animate-spin" style={{ borderTopColor: THEME_COLOR }} />
                </div>
              ) : gallery.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No gallery items available yet</p>
                </div>
              ) : (
                /* Gallery Grid - Responsive for all devices */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {gallery.map((item, i) => {
                    const imageUrl = item.url || item.fileUrl || item.s3Key;
                    
                    return (
                      <div key={i} className="group relative rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer aspect-square bg-gray-200 flex items-center justify-center">
                        {imageUrl ? (
                          <>
                            <img 
                              src={imageUrl}
                              alt={item.title || "Gallery item"} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 block"
                              loading="lazy"
                              onError={(e) => {
                                console.error(`Image failed to load: ${imageUrl}`);
                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-xs">Image unavailable</div>';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
                              <p className="text-white font-semibold text-xs sm:text-sm line-clamp-2">{item.title || "Gallery item"}</p>
                            </div>
                          </>
                        ) : (
                          <div className="text-center text-gray-500 text-xs px-2">
                            <p>No image URL</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>

      {/* ── EMPLOYMENT APPLICATION MODAL ── */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest" style={{ color: THEME_COLOR }}>
                  {selectedJob?.category || "EMPLOYMENT"}
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedJob?.title}
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  {ngo?.ngoName} • {ngo?.city || "Location"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  setSelectedJob(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="p-6 space-y-6">
              {/* Full Name & Age */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={applicationForm.fullName}
                    onChange={handleApplicationFormChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={applicationForm.age}
                    onChange={handleApplicationFormChange}
                    placeholder="18-65"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={applicationForm.email}
                    onChange={handleApplicationFormChange}
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={applicationForm.phone}
                    onChange={handleApplicationFormChange}
                    placeholder="10-digit number"
                    maxLength="10"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                    required
                  />
                </div>
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Education
                </label>
                <select
                  name="education"
                  value={applicationForm.education}
                  onChange={handleApplicationFormChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="">Select Education Level</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Senior Secondary">Senior Secondary</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post-Graduate">Post-Graduate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience <span className="text-xs text-gray-500">(Letters only)</span>
                </label>
                <textarea
                  name="experience"
                  value={applicationForm.experience}
                  onChange={handleApplicationFormChange}
                  placeholder="Skills, training, or work experience (letters only)..."
                  maxLength="500"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                  rows="4"
                />
                <p className="text-xs text-gray-500 mt-1">{applicationForm.experience.length}/500</p>
              </div>

              {/* Cover Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Message <span className="text-xs text-gray-500">(Letters only)</span>
                </label>
                <textarea
                  name="coverMessage"
                  value={applicationForm.coverMessage}
                  onChange={handleApplicationFormChange}
                  placeholder="Why are you interested in this (letters only)?"
                  maxLength="500"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                  rows="4"
                />
                <p className="text-xs text-gray-500 mt-1">{applicationForm.coverMessage.length}/500</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedJob(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApplication}
                  className="flex-1 px-4 py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: THEME_COLOR }}
                >
                  {submittingApplication ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}