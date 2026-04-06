import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNgosFiltered,
  selectFilteredNgos,
  selectFilteredNgosStatus,
} from "../../../store/slices/ngosSlice";
import elderCare from "../../../assets/images/elderly/elder.png";
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaFilter, 
  FaHeart, 
  FaCheckCircle, 
  FaStar, 
  FaArrowRight,
  FaGlobeAsia
} from "react-icons/fa";

const FindNGO = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Redux state
  const filteredNGOs = useSelector(selectFilteredNgos);
  const fetchStatus  = useSelector(selectFilteredNgosStatus);
  const loading = fetchStatus === "idle" || fetchStatus === "loading";
  const error   = fetchStatus === "failed" ? "Failed to fetch NGO data" : null;

  // Local filter state
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "All");
  const [selectedState, setSelectedState] = useState(searchParams.get("state") || "");
  const [page, setPage] = useState(1);

  // Category and city options
  const categories = ["All", "Medical", "Education", "Elderly Care", "Orphanage", "Environment", "Community Welfare", "Infrastructure"];
  const cities = ["All", "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Jaipur", "Ahmedabad", "Lucknow", "Kochi"];

  // Dispatch Redux fetch on filter / page change
  useEffect(() => {
    dispatch(fetchNgosFiltered({
      page,
      limit: 12,
      category: selectedCategory,
      city:     selectedCity,
      state:    selectedState,
      search:   searchTerm,
    }));
  }, [page, selectedCategory, selectedCity, selectedState, dispatch]);

  // --- SEARCH FUNCTIONALITY ---
  const handleSearch = () => {
    setPage(1);
    dispatch(fetchNgosFiltered({
      page: 1,
      limit: 12,
      category: selectedCategory,
      city:     selectedCity,
      state:    selectedState,
      search:   searchTerm,
    }));
  };

  const handleSearchChange  = (e) => { setSearchTerm(e.target.value); };
  const handleCategoryChange = (e) => { setSelectedCategory(e.target.value); setPage(1); };
  const handleCityChange     = (e) => { setSelectedCity(e.target.value); setPage(1); };


  return (
    <div className="find-ngo-page">
      {/* --- INJECTED CSS --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          --primary: #FF6B6B; /* Soft Red/Orange for Seva/Charity */
          --primary-dark: #E04F4F;
          --secondary: #4ECDC4; /* Teal for trust */
          --bg-color: #F8F9FA;
          --text-main: #2D3436;
          --text-light: #636E72;
          --card-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        body { margin: 0; font-family: 'Inter', sans-serif; background-color: var(--bg-color); }

        .find-ngo-page {
          min-height: 100vh;
          padding-bottom: 60px;
        }

        /* HERO SECTION */
        .hero-section {
          background: linear-gradient(135deg, #2D3436 0%, #000000 100%);
          color: white;
          padding: 80px 20px 100px 20px;
          text-align: center;
          position: relative;
        }
        .hero-title { font-size: 3rem; margin-bottom: 10px; font-weight: 800; }
        .hero-subtitle { font-size: 1.1rem; opacity: 0.8; max-width: 600px; margin: 0 auto 30px auto; }
        
        /* SEARCH BAR FLOATING */
        .search-container {
          background: white;
          max-width: 900px;
          margin: -40px auto 40px auto;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.1);
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
          position: relative;
          z-index: 10;
        }

        .input-group {
          flex: 1;
          display: flex;
          align-items: center;
          background: #F1F3F5;
          border-radius: 8px;
          padding: 0 15px;
          min-width: 200px;
        }
        .input-group input, .input-group select {
          width: 100%;
          padding: 14px 10px;
          border: none;
          background: transparent;
          outline: none;
          font-size: 1rem;
          color: var(--text-main);
          font-family: inherit;
        }
        .search-icon { color: var(--text-light); }

        .search-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 14px 30px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }
        .search-btn:hover { background: var(--primary-dark); }

        /* CONTENT GRID */
        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          color: var(--text-light);
          font-weight: 500;
        }
        .results-count span { color: var(--text-main); font-weight: 700; }

        .ngo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 30px;
        }

        /* CARD DESIGN */
        .ngo-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
          border: 1px solid #eee;
          display: flex;
          flex-direction: column;
        }
        .ngo-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 30px rgba(0,0,0,0.08);
        }

        .card-img-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
        .ngo-card:hover .card-img { transform: scale(1.05); }

        .verified-badge {
          position: absolute;
          top: 15px; right: 15px;
          background: white;
          color: #059669; /* Green */
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .category-tag {
          position: absolute;
          bottom: 15px; left: 15px;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }

        .card-body {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .ngo-name { font-size: 1.25rem; font-weight: 700; margin: 0; color: var(--text-main); }
        .rating-box {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          color: #F59E0B; /* Star color */
          font-size: 0.9rem;
        }

        .ngo-location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-light);
          font-size: 0.9rem;
          margin-bottom: 12px;
        }

        .ngo-desc {
          color: var(--text-light);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          margin-top: auto;
          border-top: 1px solid #f1f1f1;
          padding-top: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .supporter-count {
          font-size: 0.85rem;
          color: var(--text-light);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .view-btn {
          color: var(--primary);
          font-weight: 700;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.95rem;
          transition: gap 0.2s;
          cursor: pointer;
        }
        .view-btn:hover { gap: 10px; }

        /* EMPTY STATE */
        .empty-state {
          text-align: center;
          padding: 60px;
          grid-column: 1 / -1;
          color: var(--text-light);
        }
        .empty-icon { font-size: 3rem; margin-bottom: 15px; opacity: 0.3; }

        @media (max-width: 768px) {
          .hero-title { font-size: 2rem; }
          .search-container { flex-direction: column; gap: 10px; margin-top: -20px; padding: 20px; }
          .input-group { width: 100%; }
          .search-btn { width: 100%; }
        }
      `}</style>

      {/* --- HERO HEADER --- */}
      <div className="hero-section">
        <h1 className="hero-title">Discover Change Makers</h1>
        <p className="hero-subtitle">Connect with over 5,000+ verified NGOs across India and be a part of the change.</p>
        <div style={{ height: '30px' }}></div> {/* Spacer for overlapping search bar */}
      </div>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="search-container">
        {/* Search Input */}
        <div className="input-group">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by NGO name..." 
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Category Dropdown */}
        <div className="input-group">
          <FaFilter className="search-icon" />
          <select 
            value={selectedCategory} 
            onChange={handleCategoryChange}
          >
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* City Dropdown */}
        <div className="input-group">
          <FaMapMarkerAlt className="search-icon" />
          <select 
            value={selectedCity} 
            onChange={handleCityChange}
          >
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>

        <button className="search-btn" onClick={handleSearch}>Find</button>
      </div>

      {/* --- ACTIVE STATE FILTER BADGE --- */}
      {selectedState && (
        <div style={{ maxWidth: 900, margin: "-20px auto 20px auto", padding: "0 20px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FFF3E0", border: "1px solid #FFB74D", borderRadius: 8, padding: "8px 14px", fontSize: "0.9rem", color: "#E65100", fontWeight: 600 }}>
            <FaMapMarkerAlt size={13} />
            Showing NGOs in: <strong>{selectedState}</strong>
            <button
              onClick={() => { setSelectedState(""); setPage(1); }}
              style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: "#E65100", fontSize: "1rem", lineHeight: 1, padding: 0 }}
              title="Clear state filter"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* --- RESULTS GRID --- */}
      <div className="content-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
            <h3>Loading verified NGOs...</h3>
            <p style={{ color: '#636E72' }}>Finding the best organizations for you</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#E74C3C' }}>
            <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⚠️</div>
            <h3>Error loading NGOs</h3>
            <p>{error}</p>
            <button 
              onClick={() => {setSearchTerm(""); setSelectedCategory("All"); setSelectedCity("All"); setPage(1); fetchNGOs();}}
              style={{ marginTop: '15px', padding: '10px 20px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', borderRadius: '5px' }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="results-header">
              <div className="results-count">Showing <span>{filteredNGOs.length}</span> trusted organizations</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                 Sort by: Recommended
              </div>
            </div>

            <div className="ngo-grid">
              {filteredNGOs.length > 0 ? (
                filteredNGOs.map((ngo, index) => (
                  <div className="ngo-card" key={ngo._id || ngo.id}>
                    {/* Image & Badges */}
                    <div className="card-img-wrapper">
                      <img
                        src={index % 3 === 0 ? elderCare : (index % 3 === 1 ? "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800" : "https://images.pexels.com/photos/1181216/pexels-photo-1181216.jpeg?auto=compress&cs=tinysrgb&w=1600")}
                        alt={ngo.ngoName || ngo.name}
                        className="card-img"
                      />
                      {ngo.verified !== false && (
                        <div className="verified-badge">
                          <FaCheckCircle /> Verified
                        </div>
                      )}
                      <div className="category-tag">{ngo.services?.[0] || ngo.category || 'General Welfare'}</div>
                    </div>

                    {/* Content */}
                    <div className="card-body">
                      <div className="card-header">
                        <h3 className="ngo-name">{ngo.ngoName || ngo.name}</h3>
                        <div className="rating-box">
                          <FaStar /> {ngo.rating || 4.8}
                        </div>
                      </div>
                      
                      <div className="ngo-location">
                        <FaMapMarkerAlt size={12} /> {ngo.city || 'India'}, {ngo.state || 'India'}
                      </div>

                      <p className="ngo-desc">{ngo.description || 'Making a difference in communities across India'}</p>

                      <div className="card-footer">
                        <div className="supporter-count">
                          <FaHeart color="#FF6B6B" /> {ngo.supporters || '10K+'} Supporters
                        </div>
                        <Link to={`/ngo-profile/${ngo._id || ngo.id}`} className="view-btn">
                          View Profile <FaArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FaGlobeAsia className="empty-icon" />
                  <h3>No NGOs found matching your criteria.</h3>
                  <p>Try adjusting your filters or search for a broader category.</p>
                  <button 
                    onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setSelectedCity("All"); setPage(1); dispatch(fetchNgosFiltered({ page: 1, limit: 12 })); }}
                    style={{ marginTop: '15px', padding: '10px 20px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', borderRadius: '5px' }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FindNGO;