import { useState, useEffect, useCallback, useMemo } from "react";
import { Camera, X, ChevronLeft, ChevronRight, Filter, Calendar, Tag, Image as ImageIcon, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGalleryImages,
  fetchGalleryCategories,
  selectGalleryImages,
  selectGalleryCategories,
  selectGalleryImagesStatus,
} from "../../store/slices/gallerySlice";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
};

const PAGE_SIZE = 24;

const GalleryImages = () => {
  const dispatch = useDispatch();
  const allImages = useSelector(selectGalleryImages);
  const allCategories = useSelector(selectGalleryCategories);
  const imagesStatus = useSelector(selectGalleryImagesStatus);

  const [category, setCategory]       = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError]             = useState("");
  const [page, setPage]               = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [hoveredCard, setHoveredCard]     = useState(null);

  // Dispatch Redux thunks if idle
  useEffect(() => {
    if (imagesStatus === "idle") dispatch(fetchGalleryImages());
    dispatch(fetchGalleryCategories());
  }, [imagesStatus, dispatch]);

  // Build category list from Redux data
  const categoryNames = useMemo(() => {
    const names = allCategories
      .map(c => (typeof c === "string" ? c : c?.name))
      .filter(Boolean);
    return ["All", ...names];
  }, [allCategories]);

  // Client-side filtering on Redux images data (when not searching)
  const filteredImages = useMemo(() => {
    if (searchResults !== null) return searchResults;
    if (category === "All") return allImages;
    return allImages.filter(img => img.category === category);
  }, [allImages, category, searchResults]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filteredImages.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const images = filteredImages.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const loading = imagesStatus === "loading" || imagesStatus === "idle";

  // Search via direct API call (ephemeral, not cached in Redux)
  const runSearch = useCallback(async (q) => {
    if (!q.trim()) { setSearchResults(null); return; }
    setSearchLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ q: q.trim(), type: "image" });
      const res = await fetch(`${API_BASE_URL}/api/gallery/search?${params}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Search failed");
      setSearchResults(data.items ?? data.images ?? []);
    } catch (err) {
      setError(err.message || "Search failed");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setSearchQuery("");
    setSearchInput("");
    setSearchResults(null);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCategory("All");
    setSearchQuery(searchInput);
    setPage(1);
    runSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setSearchResults(null);
    setPage(1);
  };

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [category, searchQuery]);

  // Lightbox
  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  };

  const goToPrevious = (e) => {
    if (e) e.stopPropagation();
    const idx = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(idx);
    setSelectedImage(images[idx]);
  };

  const goToNext = (e) => {
    if (e) e.stopPropagation();
    const idx = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(idx);
    setSelectedImage(images[idx]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === "Escape")      closeLightbox();
      if (e.key === "ArrowLeft")   goToPrevious();
      if (e.key === "ArrowRight")  goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, currentIndex, images]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const isLoading = loading || searchLoading;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        .gallery-image-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .gallery-image-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -10px rgba(0,0,0,0.15); }
        .gallery-image-card img { transition: transform 0.5s ease; }
        .gallery-image-card:hover img { transform: scale(1.08); }
        .gallery-search-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
        .loader { border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "80px 20px", textAlign: "center", color: "white" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", padding: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", marginBottom: "20px" }}>
            <Camera size={40} color="#60a5fa" />
          </div>
          <h1 style={{ fontSize: "48px", fontWeight: "800", margin: "0 0 16px 0", letterSpacing: "-0.5px" }}>
            Our Impact in Pictures
          </h1>
          <p style={{ fontSize: "18px", color: "#94a3b8", lineHeight: "1.6", margin: "0 auto", maxWidth: "600px" }}>
            Explore moments of compassion, community service, and meaningful impact.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ marginTop: "32px", display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "480px", display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                <input
                  className="gallery-search-input"
                  type="text"
                  placeholder="Search images..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "12px 40px 12px 42px",
                    borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.1)", color: "white",
                    fontSize: "15px", backdropFilter: "blur(8px)",
                  }}
                />
                {searchInput && (
                  <button type="button" onClick={clearSearch} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0 }}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <button type="submit" style={{ padding: "12px 20px", borderRadius: "12px", background: "#3b82f6", border: "none", color: "white", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 20px" }}>

        {/* Category Filters */}
        <div style={{ marginBottom: "40px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontWeight: "600" }}>
            <Filter size={20} />
            <span>Filter by Initiative</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  padding: "10px 20px", borderRadius: "999px",
                  border: category === cat && !searchQuery ? "none" : "1px solid #cbd5e1",
                  background: category === cat && !searchQuery ? "#3b82f6" : "white",
                  color: category === cat && !searchQuery ? "white" : "#475569",
                  fontWeight: "500", fontSize: "15px", cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: category === cat && !searchQuery ? "0 4px 12px rgba(59,130,246,0.3)" : "none",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Active search badge */}
        {searchQuery && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <span style={{ color: "#475569", fontWeight: "500" }}>
              Search results for <strong>"{searchQuery}"</strong>
            </span>
            <button onClick={clearSearch} style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fee2e2", border: "none", color: "#b91c1c", borderRadius: "6px", padding: "4px 10px", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>
              <X size={13} /> Clear
            </button>
          </div>
        )}

        {/* Stats */}
        {!isLoading && images.length > 0 && (
          <div style={{ color: "#64748b", marginBottom: "24px", fontWeight: "500", fontSize: "15px" }}>
            {searchQuery
              ? `Found ${filteredImages.length} result${filteredImages.length !== 1 ? "s" : ""} for "${searchQuery}"`
              : `Showing ${images.length} of ${filteredImages.length} images${category !== "All" ? ` in "${category}"` : ""}`}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: "center", padding: "40px", background: "#fee2e2", borderRadius: "12px", color: "#b91c1c", marginBottom: "24px" }}>
            {error}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <div className="loader" />
            <p style={{ color: "#64748b", marginTop: "16px", fontWeight: "500" }}>Loading gallery...</p>
          </div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
            <ImageIcon size={64} color="#cbd5e1" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "24px", color: "#0f172a", margin: "0 0 8px 0" }}>
              {searchQuery ? "No results found" : "No Images Found"}
            </h3>
            <p style={{ color: "#64748b", margin: 0 }}>
              {searchQuery ? `No images matched "${searchQuery}".` : "No photos uploaded for this category yet."}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
              {images.map((image, index) => (
                <div
                  key={image._id}
                  className="gallery-image-card"
                  onClick={() => openLightbox(image, index)}
                  onMouseEnter={() => setHoveredCard(image._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ position: "relative", borderRadius: "16px", overflow: "hidden", cursor: "pointer", aspectRatio: "4/3", background: "#e2e8f0" }}
                >
                  <img
                    src={resolveUrl(image.url)}
                    alt={image.title}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "24px 20px 20px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
                    display: "flex", flexDirection: "column", justifyContent: "flex-end",
                    opacity: hoveredCard === image._id ? 1 : 0.8,
                    transform: hoveredCard === image._id ? "translateY(0)" : "translateY(5px)",
                    transition: "all 0.3s ease",
                  }}>
                    <span style={{ display: "inline-block", background: "#3b82f6", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", marginBottom: "8px", width: "fit-content" }}>
                      {image.category}
                    </span>
                    <h4 style={{ margin: 0, color: "white", fontSize: "18px", fontWeight: "600", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                      {image.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "48px" }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setPage(p => p - 1)}
                  style={currentPage <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#334155" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={currentPage >= totalPages ? styles.pageBtnDisabled : styles.pageBtn}
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          onClick={closeLightbox}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.95)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
        >
          <button
            onClick={closeLightbox}
            style={{ position: "absolute", top: "24px", right: "24px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "12px", borderRadius: "50%", cursor: "pointer" }}
          >
            <X size={24} />
          </button>

          <div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: "1200px", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
            <button onClick={goToPrevious} style={styles.navBtn}><ChevronLeft size={32} /></button>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", maxWidth: "80%" }}>
              <img
                src={resolveUrl(selectedImage.url)}
                alt={selectedImage.title}
                style={{ maxHeight: "70vh", maxWidth: "100%", borderRadius: "8px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", objectFit: "contain" }}
              />
              <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "20px", color: "white", width: "100%" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "22px", fontWeight: "600" }}>{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p style={{ margin: "0 0 16px 0", color: "#cbd5e1", lineHeight: "1.5" }}>{selectedImage.description}</p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", color: "#94a3b8", fontSize: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Tag size={16} /> {selectedImage.category}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={16} /> {formatDate(selectedImage.createdAt)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto", background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "20px" }}>
                    <ImageIcon size={16} /> {currentIndex + 1} / {images.length}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={goToNext} style={styles.navBtn}><ChevronRight size={32} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageBtn: {
    display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px",
    background: "white", color: "#0f172a", border: "1px solid #cbd5e1",
    borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "15px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  pageBtnDisabled: {
    display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px",
    background: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0",
    borderRadius: "8px", cursor: "not-allowed", fontWeight: "600", fontSize: "15px",
  },
  navBtn: {
    background: "rgba(255,255,255,0.1)", border: "none", color: "white",
    padding: "16px", borderRadius: "50%", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 20px",
  },
};

export default GalleryImages;
