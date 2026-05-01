import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaMapMarkerAlt, FaShareAlt, FaCheckCircle, FaChevronDown,
  FaArrowLeft, FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin,
  FaGlobe, FaRegClock, FaEllipsisH
} from "react-icons/fa";
import { RiShieldCheckFill } from "react-icons/ri";

const API = String(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// Theme Colors matching the provided Give.do image
const C = {
  primary:     "#E44950",      // Give.do Red
  bgTop:       "#FAF6F5",      // Light beige/pink header background
  bgMain:      "#FFFFFF",      // White background for content
  bgBottom:    "#F6F6F6",      // Light gray for bottom section
  textDark:    "#222222",      // Almost black for main text
  textMuted:   "#777777",      // Gray for secondary text
  border:      "#EAEAEA",      // Light borders
  bannerBg:    "#FDF3F1",      // Very light red for banners
  green:       "#10B981"       // Success green
};

export default function NgoPublicProfile() {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Animation & Interaction States
  const [isMounted, setIsMounted] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(0);

  // Fetch NGO Data & Trigger Animations
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/ngo/${id}`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "NGO not found");
        setNgo(json.data);
      } catch (e) {
        // Fallback mock data if API fails to maintain design showcase
        setNgo({
          ngoName: "IAF India Animal Foundation",
          city: "New Delhi",
          state: "Delhi",
          description: "We are an animal welfare non-profit based in New Delhi taking in stray animals that are sick, abandoned, or injured. Our mission is to provide medical care, love, and a safe haven for these voiceless creatures. We conduct regular rescue missions, sterilization drives, and vaccination camps across the city to ensure public health and animal safety. Join us in making the streets safer and kinder for our furry friends.",
          verified: true
        });
      } finally {
        setLoading(false);
        // Trigger mount animations slightly after load
        setTimeout(() => setIsMounted(true), 100);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[70vh] font-sans bg-white">
      <div className="w-10 h-10 rounded-full border-4 border-red-100 border-t-red-500 animate-spin transition-all" />
    </div>
  );

  return (
    <div className={`font-sans min-h-screen text-gray-800 transition-opacity duration-700 ${isMounted ? "opacity-100" : "opacity-0"}`} style={{ backgroundColor: C.bgMain }}>
      
      {/* ── HEADER SECTION ── */}
      <div style={{ backgroundColor: C.bgTop }} className="pt-8 pb-0">
        <div className={`max-w-[1100px] mx-auto px-6 transition-all duration-700 transform ${isMounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          
          <Link to="/find-ngos" className="inline-flex items-center gap-2 text-xs text-gray-500 no-underline hover:text-gray-900 transition-colors mb-6 font-medium group">
            <FaArrowLeft className="transform transition-transform group-hover:-translate-x-1" /> Back to search
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden group hover:shadow-md transition-all duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1548509925-0e620f4eb80e?q=80&w=200&auto=format&fit=crop" 
                  alt="NGO Logo" 
                  className="w-16 h-16 object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold m-0 mb-1" style={{ color: C.textDark }}>
                  {ngo?.ngoName || "IAF India Animal Foundation"}
                </h1>
                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#3A70D9' }}>
                  <FaMapMarkerAlt className="text-xs" />
                  <span>{ngo?.city || "New Delhi"}, {ngo?.state || "Delhi"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-white px-5 py-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <RiShieldCheckFill className="text-green-500 text-base animate-pulse" /> Tax benefits
                </span>
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">80G, 50%</span>
              </div>
              <div className="w-full h-px bg-gray-100 my-0.5"></div>
              <div className="flex items-center justify-between gap-6">
                <span className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <FaCheckCircle className="text-red-500 text-sm" /> Status
                </span>
                <span className="text-xs font-bold text-gray-800">Verified</span>
              </div>
            </div>
          </div>

          {/* Animated Tabs */}
          <div className="flex items-center justify-between border-b relative" style={{ borderColor: C.border }}>
            <div className="flex gap-8 relative">
              {["Overview", "Fundraisers (2)", "How we utilise funds", "Updates (15)"].map((tab, i) => {
                const tabKey = tab.toLowerCase().split(' ')[0];
                const isActive = activeTab === tabKey;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tabKey)}
                    className={`pb-4 text-sm font-semibold transition-all duration-300 relative ${
                      isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <span 
                        className="absolute bottom-0 left-0 w-full h-0.5 rounded-t-md transition-all duration-300" 
                        style={{ backgroundColor: C.primary }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-2 pb-3">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-semibold hover:bg-gray-50 hover:shadow-sm active:scale-95 transition-all bg-white shadow-sm" style={{ borderColor: C.border, color: C.textDark }}>
                <FaShareAlt className="text-gray-500" /> Share
              </button>
              <button className="flex items-center justify-center w-9 h-9 border rounded-full hover:bg-gray-50 hover:shadow-sm active:scale-95 transition-all bg-white shadow-sm" style={{ borderColor: C.border, color: C.textDark }}>
                <FaEllipsisH className="text-gray-500 text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="flex gap-10">
          
          {/* LEFT COLUMN */}
          <div className={`flex-1 max-w-[700px] transition-all duration-700 delay-100 transform ${isMounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            
            {/* What We Do */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4" style={{ color: C.textDark }}>What we do</h2>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-4">
                <span className="flex items-center gap-1"><RiShieldCheckFill className="text-gray-400" /> 12 Active Campaigns</span>
                <span className="flex items-center gap-1"><FaRegClock className="text-gray-400" /> Est. 2021</span>
              </div>
              <div className="relative">
                <p className={`text-sm leading-relaxed mb-2 transition-all duration-500 ease-in-out overflow-hidden ${isDescExpanded ? 'max-h-[500px]' : 'max-h-[42px] line-clamp-2'}`} style={{ color: C.textMuted }}>
                  {ngo?.description}
                </p>
                <button 
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-sm font-semibold bg-transparent border-none cursor-pointer p-0 hover:underline transition-all" 
                  style={{ color: C.primary }}
                >
                  {isDescExpanded ? "Read less" : "Read more"}
                </button>
              </div>
            </section>

            {/* Banner 1 */}
            <div className="rounded-xl p-5 flex flex-wrap gap-4 items-center justify-between mb-10 hover:shadow-md transition-shadow duration-300" style={{ backgroundColor: C.bannerBg }}>
              <div>
                <h3 className="font-bold text-base m-0 mb-1" style={{ color: C.textDark }}>Help them achieve their goals</h3>
                <p className="text-xs m-0" style={{ color: C.textMuted }}>100% of your donation goes directly to the NGO to support their cause</p>
              </div>
              <button className="px-6 py-2.5 rounded-md text-sm font-bold text-white border-none cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 whitespace-nowrap" style={{ backgroundColor: C.primary }}>
                Donate Now
              </button>
            </div>

            {/* Our Fundraisers */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold m-0" style={{ color: C.textDark }}>Our Fundraisers</h2>
                <button className="text-sm font-bold bg-transparent border-none cursor-pointer hover:underline transition-all" style={{ color: C.primary }}>
                  View All (2)
                </button>
              </div>

              {/* Fundraiser Card */}
              <div className="w-[280px] border rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 bg-white group cursor-pointer" style={{ borderColor: C.border }}>
                <div className="relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?q=80&w=500&auto=format&fit=crop" alt="Dogs in shelter" className="w-full h-[150px] object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded text-orange-600 flex items-center gap-1 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Tax benefit Available
                  </div>
                </div>
                <div className="p-4 bg-white relative z-10">
                  <h4 className="font-bold text-sm mb-1 leading-snug line-clamp-2 group-hover:text-red-500 transition-colors" style={{ color: C.textDark }}>Help IAF Rescue and treat 50+ stray animals monthly</h4>
                  <p className="text-xs text-gray-500 mb-4">by IAF India Animal Foundation</p>
                  
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mb-2 overflow-hidden">
                    <div className="bg-red-500 h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: isMounted ? '45%' : '0%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-gray-900">₹85,000</span> <span className="text-gray-500">raised</span>
                    </div>
                    <div className="text-gray-500 flex items-center gap-1 font-medium">
                      <FaRegClock className="text-gray-400" /> 12 days left
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How we utilise funds (Animated Accordion) */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-5" style={{ color: C.textDark }}>How we utilise funds</h2>
              <div className="flex flex-col gap-3">
                {[
                  { title: "Infrastructure", desc: "Strengthening base of shelters & rescue vans across Delhi to accommodate and treat more injured animals effectively." },
                  { title: "Medical supplies", desc: "For medicines, life-saving surgeries, vaccines, and daily treatments for sick strays." },
                  { title: "Staff Support", desc: "Salaries for highly trained paravets, expert rescuers, and dedicated ambulance drivers." }
                ].map((item, idx) => {
                  const isOpen = openAccordion === idx;
                  return (
                    <div key={idx} className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300" style={{ borderColor: isOpen ? C.primary : C.border }}>
                      <div 
                        className="flex justify-between items-center p-4 cursor-pointer"
                        onClick={() => setOpenAccordion(isOpen ? -1 : idx)}
                      >
                        <div className="font-bold text-sm transition-colors" style={{ color: isOpen ? C.primary : C.textDark }}>
                          <span className="text-red-500 mr-2">•</span> {item.title}
                        </div>
                        <FaChevronDown className={`text-red-500 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                      </div>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                        <div className="px-4 ml-4 border-l-2 border-red-100 pl-3">
                          <p className="text-xs text-gray-600 mb-2 leading-relaxed">{item.desc}</p>
                          <span className="text-xs font-bold cursor-pointer hover:underline transition-all" style={{ color: C.primary }}>Read More</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button className="text-sm font-bold mt-2 text-left hover:underline transition-all w-max" style={{ color: C.primary }}>
                  View All Recent Updates
                </button>
              </div>
            </section>

            {/* Banner 2 */}
            <div className="rounded-xl p-5 flex flex-wrap gap-4 items-center justify-between mb-10 hover:shadow-md transition-shadow duration-300" style={{ backgroundColor: C.bannerBg }}>
              <div>
                <h3 className="font-bold text-base m-0 mb-1" style={{ color: C.textDark }}>Inspired by the work that they do?</h3>
                <p className="text-xs m-0" style={{ color: C.textMuted }}>Make a direct impact. Ensure your donation reaches the right hands.</p>
              </div>
              <button className="px-6 py-2.5 rounded-md text-sm font-bold text-white border-none cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 whitespace-nowrap" style={{ backgroundColor: C.primary }}>
                Donate Now
              </button>
            </div>

            {/* Important Links */}
            <section className="mb-10">
              <h2 className="text-lg font-bold mb-5" style={{ color: C.textDark }}>Important links</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-8">
                {[
                  { icon: FaGlobe, color: "text-gray-400", label: "Website", url: "#" },
                  { icon: FaFacebook, color: "text-blue-600", label: "Facebook", url: "#" },
                  { icon: FaTwitter, color: "text-blue-400", label: "Twitter", url: "#" },
                  { icon: FaYoutube, color: "text-red-600", label: "Youtube", url: "#" },
                  { icon: FaInstagram, color: "text-pink-600", label: "Instagram", url: "#" },
                  { icon: FaLinkedin, color: "text-blue-700", label: "Linkedin", url: "#" },
                ].map((link, i) => (
                  <a key={i} href={link.url} className="group flex justify-between items-center text-sm text-gray-700 font-medium no-underline hover:text-red-500 transition-colors bg-gray-50 px-3 py-2 rounded-lg hover:bg-red-50">
                    <span className="flex items-center gap-2">
                      <link.icon className={`${link.color} group-hover:scale-110 transition-transform`} /> {link.label}
                    </span>
                    <span className="text-red-500 transform transition-transform group-hover:translate-x-1">›</span>
                  </a>
                ))}
              </div>
            </section>

          </div>
          
          {/* RIGHT COLUMN HAS BEEN PURPOSELY OMITTED AS PER YOUR REQUEST */}
          <div className="hidden lg:block w-[350px]"></div>

        </div>
      </div>

      {/* ── BOTTOM SIMILAR CAUSES SECTION ── */}
      <div style={{ backgroundColor: C.bgBottom }} className="py-16 mt-10 border-t border-gray-200">
        <div className={`max-w-[1100px] mx-auto px-6 transition-all duration-1000 transform delay-300 ${isMounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <h2 className="text-2xl font-bold mb-8" style={{ color: C.textDark }}>Explore fundraisers for similar cause</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Array of Similar Causes for cleaner code */}
            {[
              {
                img: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=600&auto=format&fit=crop",
                title: "Help ISKCON Govardhan Eco Village in caring for cows",
                by: "ISKCON Wada/Govardhan Eco Village",
                raised: "₹90,12,320",
                days: "22 days left",
                progress: "65%"
              },
              {
                img: "https://images.unsplash.com/photo-1564758564527-b97d79cb27c1?q=80&w=600&auto=format&fit=crop",
                title: "Help feed and rescue injured monkeys left to suffer in agony",
                by: "RAKSHA DESH SEVA SANSTHAN",
                raised: "₹7,47,106",
                days: "27 days left",
                progress: "40%"
              },
              {
                img: "https://images.unsplash.com/photo-1549473889-14f410d83298?q=80&w=600&auto=format&fit=crop",
                title: "Support rescue, veterinary care, and dignity for overworked animals",
                by: "People for Animals (PFA) Agra",
                raised: "₹2,44,880",
                days: "45 days left",
                progress: "15%"
              }
            ].map((cause, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col group cursor-pointer">
                <div className="relative overflow-hidden">
                  <img src={cause.img} alt="Cause" className="w-full h-[180px] object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-sm text-orange-600 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Tax benefit Available
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col relative z-10 bg-white">
                  <h4 className="font-bold text-sm mb-1 leading-snug group-hover:text-red-500 transition-colors" style={{ color: C.textDark }}>{cause.title}</h4>
                  <p className="text-xs text-gray-500 mb-5 line-clamp-1">by {cause.by}</p>
                  
                  <div className="mt-auto">
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mb-2 overflow-hidden">
                      <div className="bg-red-500 h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: isMounted ? cause.progress : '0%' }}></div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div><span className="font-bold text-gray-900">{cause.raised}</span> <span className="text-gray-500">raised</span></div>
                      <div className="text-gray-500 font-medium flex items-center gap-1">
                        <FaRegClock className="text-gray-400" /> {cause.days}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

    </div>
  );
}