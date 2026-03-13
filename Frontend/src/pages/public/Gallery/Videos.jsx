import React, { useState, useEffect } from "react";
import { Video, X, Play, Filter, Calendar, Tag, Film } from "lucide-react";

// Make sure to adjust this to your actual production URL when deploying
const API_BASE_URL = "http://localhost:5000";

const CATEGORIES = [
  "All",
  "Food Distribution",
  "Medical Camps",
  "Education Programs",
  "Elder Care",
  "Women Empowerment",
  "Events",
  "Volunteer Activities",
];

const GalleryVideos = () => {
  // --- State ---
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [category, setCategory] = useState("All");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);

  // --- Effects ---
  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const fetchVideos = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== "All") params.set("category", category);
      params.set("page", page);
      params.set("limit", 12);

      const res = await fetch(`${API_BASE_URL}/api/gallery/videos?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setVideos(data.videos);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Modal & Video Logic ---
  const openVideoModal = (video) => {
    setSelectedVideo(video);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedVideo) return;
      if (e.key === "Escape") closeVideoModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedVideo]);

  // Extract embed URLs
  const getYouTubeEmbedUrl = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
    }
    return url;
  };

  const getVimeoEmbedUrl = (url) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
    return url;
  };

  const getEmbedUrl = (url) => {
    if (url.includes("youtube") || url.includes("youtu.be")) return getYouTubeEmbedUrl(url);
    if (url.includes("vimeo")) return getVimeoEmbedUrl(url);
    return url;
  };

  // Helpers
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return "https://via.placeholder.com/640x360?text=Video+Thumbnail";
    if (thumbnail.startsWith("http")) return thumbnail;
    return `${API_BASE_URL}${thumbnail}`;
  };

  // --- UI Components ---
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* Dynamic Style Block - Teal theme */}
      <style>{`
        .video-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .video-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.25);
        }
        .video-card img {
          transition: transform 0.5s ease;
        }
        .video-card:hover img {
          transform: scale(1.08);
        }
        .play-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .video-card:hover .play-button {
          transform: translate(-50%, -50%) scale(1.15);
          background-color: #0d9488 !important; /* Teal 600 */
        }
        .loader {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #0d9488;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #134e4a 0%, #115e59 50%, #0d9488 100%)", 
        padding: "80px 20px", 
        textAlign: "center", 
        color: "white" 
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", padding: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", marginBottom: "20px" }}>
            <Video size={40} color="#5eead4" />
          </div>
          <h1 style={{ fontSize: "48px", fontWeight: "800", margin: "0 0 16px 0", letterSpacing: "-0.5px" }}>
            Our Video Gallery
          </h1>
          <p style={{ fontSize: "18px", color: "#99f6e4", lineHeight: "1.6", margin: 0, maxWidth: "600px", marginInline: "auto" }}>
            Watch inspiring stories of hope, transformation, and meaningful community impact happening on the ground.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 20px" }}>
        
        {/* Filters */}
        <div style={{ marginBottom: "40px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontWeight: "600" }}>
            <Filter size={20} />
            <span>Filter by Initiative</span>
          </div>
          
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setPagination({ ...pagination, page: 1 }); // Reset page on filter
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "999px",
                  border: category === cat ? "none" : "1px solid #cbd5e1",
                  background: category === cat ? "#0d9488" : "white",
                  color: category === cat ? "white" : "#475569",
                  fontWeight: "500",
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: category === cat ? "0 4px 12px rgba(13, 148, 136, 0.3)" : "none"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        {!loading && videos.length > 0 && (
          <div style={{ color: "#64748b", marginBottom: "24px", fontWeight: "500", fontSize: "15px" }}>
            Showing {videos.length} of {pagination.total} videos for "{category}"
          </div>
        )}

        {/* Video Grid */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <div className="loader"></div>
            <p style={{ color: "#64748b", marginTop: "16px", fontWeight: "500" }}>Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
            <Film size={64} color="#cbd5e1" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "24px", color: "#0f172a", margin: "0 0 8px 0" }}>No Videos Found</h3>
            <p style={{ color: "#64748b", margin: 0 }}>We haven't uploaded any videos for this category yet.</p>
          </div>
        ) : (
          <>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
              gap: "28px" 
            }}>
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="video-card"
                  onClick={() => openVideoModal(video)}
                  onMouseEnter={() => setHoveredCard(video._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    position: "relative",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                    aspectRatio: "16/9",
                    background: "#1e293b"
                  }}
                >
                  <img
                    src={getThumbnailUrl(video.thumbnail)}
                    alt={video.title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: hoveredCard === video._id ? 0.7 : 0.9, transition: "opacity 0.3s, transform 0.5s" }}
                  />
                  
                  {/* Centered Play Button */}
                  <div 
                    className="play-button" 
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "rgba(15, 23, 42, 0.75)",
                      backdropFilter: "blur(4px)",
                      padding: "16px", 
                      borderRadius: "50%",
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
                      zIndex: 2
                    }}
                  >
                    <Play size={32} color="white" fill="white" style={{ marginLeft: "4px" }} />
                  </div>

                  {/* Card Overlay */}
                  <div style={{
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    padding: "40px 20px 20px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    opacity: hoveredCard === video._id ? 1 : 0.85,
                    transform: hoveredCard === video._id ? "translateY(0)" : "translateY(5px)",
                    transition: "all 0.3s ease",
                    zIndex: 1
                  }}>
                    <span style={{ 
                      display: "inline-block", 
                      background: "#0d9488", 
                      color: "white", 
                      padding: "4px 10px", 
                      borderRadius: "6px", 
                      fontSize: "12px", 
                      fontWeight: "700",
                      marginBottom: "8px",
                      width: "fit-content",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
                    }}>
                      {video.category}
                    </span>
                    <h4 style={{ margin: 0, color: "white", fontSize: "18px", fontWeight: "600", textShadow: "0 2px 4px rgba(0,0,0,0.5)", lineHeight: "1.3" }}>
                      {video.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "48px" }}>
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchVideos(pagination.page - 1)}
                  style={pagination.page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
                >
                  Previous
                </button>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#334155" }}>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchVideos(pagination.page + 1)}
                  style={pagination.page >= pagination.pages ? styles.pageBtnDisabled : styles.pageBtn}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cinematic Video Modal - Fixed for Proper Spacing */}
      {selectedVideo && (
        <div 
          onClick={closeVideoModal}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(8px)",
            zIndex: 9999, 
            overflowY: "auto", // Allows scrolling if content is taller than screen
            display: "flex",
            padding: "60px 20px" // Adds solid top and bottom spacing
          }}
        >
          {/* Close Button - Stays fixed in the top right corner */}
          <button 
            onClick={closeVideoModal} 
            style={{ 
              position: "fixed", top: "24px", right: "24px", 
              background: "rgba(255,255,255,0.1)", border: "none", color: "white", 
              padding: "12px", borderRadius: "50%", cursor: "pointer", 
              transition: "background 0.2s", zIndex: 10000 
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >
            <X size={24} />
          </button>

          {/* Modal Content - Automatically centers itself vertically & horizontally */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              margin: "auto", // Magic centering trick combined with the flex overlay
              width: "100%", maxWidth: "1000px", 
              display: "flex", flexDirection: "column", gap: "24px" 
            }}
          >
            {/* 16:9 Responsive Iframe Container */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "black", borderRadius: "12px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
              <iframe
                src={getEmbedUrl(selectedVideo.url)}
                title={selectedVideo.title}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            {/* Video Info Box */}
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "32px", color: "white" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "28px", fontWeight: "600" }}>{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p style={{ margin: "0 0 24px 0", color: "#cbd5e1", lineHeight: "1.7", fontSize: "16px" }}>{selectedVideo.description}</p>
              )}
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", color: "#94a3b8", fontSize: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(13, 148, 136, 0.2)", color: "#5eead4", padding: "6px 12px", borderRadius: "8px" }}>
                  <Tag size={16} /> {selectedVideo.category}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={16} /> {formatDate(selectedVideo.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Reusable Static Styles ---
const styles = {
  pageBtn: {
    padding: "10px 24px", background: "#0d9488", color: "white", 
    border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "15px",
    boxShadow: "0 4px 6px rgba(13, 148, 136, 0.2)", transition: "background 0.2s"
  },
  pageBtnDisabled: {
    padding: "10px 24px", background: "#f1f5f9", color: "#94a3b8", 
    border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "not-allowed", fontWeight: "600", fontSize: "15px"
  }
};

export default GalleryVideos;