import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useNavigate } from "react-router-dom";

const ACTIVE_STATES = new Set([
  "Rajasthan", "Gujarat", "Maharashtra", "Karnataka", "Kerala",
  "Uttar Pradesh", "Delhi", "Punjab", "Haryana", "Uttaranchal",
  "Assam", "West Bengal", "Jharkhand", "Andhra Pradesh",
  "Telangana", "Tamil Nadu", "Chhattisgarh", "Madhya Pradesh",
]);

const NGO_HUBS = [
  { name: "Mumbai",    coordinates: [72.8777, 19.076],  path: "/find-ngos?city=Mumbai"    },
  { name: "Delhi",     coordinates: [77.1025, 28.7041], path: "/find-ngos?city=Delhi"     },
  { name: "Bangalore", coordinates: [77.5946, 12.9716], path: "/find-ngos?city=Bangalore" },
  { name: "Chennai",   coordinates: [80.2707, 13.0827], path: "/find-ngos?city=Chennai"   },
  { name: "Kolkata",   coordinates: [88.3639, 22.5726], path: "/find-ngos?city=Kolkata"   },
  { name: "Hyderabad", coordinates: [78.4867, 17.385],  path: "/find-ngos?city=Hyderabad" },
  { name: "Jaipur",    coordinates: [75.7873, 26.9124], path: "/find-ngos?city=Jaipur"    },
  { name: "Ahmedabad", coordinates: [72.5714, 23.0225], path: "/find-ngos?city=Ahmedabad" },
];

// Teardrop pin matching reference image — filled shape with circle hole
function PinIcon({ hovered }) {
  return (
    <g transform="translate(-11, -28)" style={{ cursor: "pointer" }}>
      {/* Outer teardrop */}
      <path
        d="M11 0C6.925 0 3.667 3.258 3.667 7.333c0 6.417 7.333 16.667 7.333 16.667s7.333-10.25 7.333-16.667C18.333 3.258 15.075 0 11 0z"
        fill={hovered ? "#155e75" : "#1e3a5f"}
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      {/* Inner circle */}
      <circle
        cx="11"
        cy="7.5"
        r="3"
        fill="#ffffff"
        opacity="0.9"
      />
    </g>
  );
}

export default function IndiaMap() {
  const [hoveredCity, setHoveredCity] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [cleanedGeoData, setCleanedGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch GeoJSON from assets/ — latest updated data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/india_states.geojson");
        const data = await response.json();
        
        // Validate basic structure
        if (!data || !data.features || !Array.isArray(data.features)) {
          throw new Error("Invalid GeoJSON structure");
        }
        
        setGeoData(data);
      } catch (err) {
        console.error("[IndiaMap] Fetch error:", err);
        setError(err.message);
      }
    };

    loadData();
  }, []);

  // Clean GeoJSON data
  useEffect(() => {
    if (!geoData) {
      setLoading(true);
      return;
    }

    try {
      const validFeatures = geoData.features.filter(feature => {
        // Strict validation
        if (!feature || feature.type !== "Feature") return false;
        if (!feature.properties || !feature.properties.st_nm) return false;
        if (!feature.geometry) return false;
        if (feature.geometry.type !== "Polygon") return false;
        if (!Array.isArray(feature.geometry.coordinates) || feature.geometry.coordinates.length === 0) return false;
        if (!Array.isArray(feature.geometry.coordinates[0]) || feature.geometry.coordinates[0].length === 0) return false;
        
        return true;
      });

      if (validFeatures.length === 0) {
        setError("No valid features in GeoJSON");
        setLoading(false);
        return;
      }

      setCleanedGeoData({
        type: "FeatureCollection",
        features: validFeatures,
      });

      console.log(`[IndiaMap] Cleaned: ${validFeatures.length}/${geoData.features.length} features`);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("[IndiaMap] Cleaning error:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [geoData]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center" style={{ minHeight: 320 }}>
        <div style={{ width: 40, height: 40, border: "4px solid #e5e7eb", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error || !cleanedGeoData) {
    return (
      <div className="w-full">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-900 font-bold text-lg mb-4">🗺️ Find NGOs By City</p>
          <p className="text-blue-700 text-sm mb-6">Select a city to explore local NGO partnerships</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {NGO_HUBS.map((hub) => (
              <button
                key={hub.name}
                onClick={() => navigate(hub.path)}
                className="bg-white hover:bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-900 text-sm font-semibold transition"
              >
                {hub.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative w-full">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [82.5, 22], scale: 1400 }}
          width={1000}
          height={1100}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={cleanedGeoData}>
            {({ geographies }) => {
              if (!geographies || !Array.isArray(geographies)) return null;
              
              return geographies.map((geo, idx) => {
                try {
                  if (!geo || !geo.properties) return null;
                  
                  const stateName = geo.properties.st_nm || `State-${idx}`;
                  const isActive = ACTIVE_STATES.has(stateName);
                  const isHovered = hoveredState === stateName;

                  return (
                    <Geography
                      key={`${stateName}-${idx}`}
                      geography={geo}
                      onMouseEnter={() => setHoveredState(stateName)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => isActive && navigate(`/find-ngos?state=${encodeURIComponent(stateName)}`)}
                      style={{
                        default: { outline: "none", cursor: isActive ? "pointer" : "default" },
                        hover:   { outline: "none", cursor: isActive ? "pointer" : "default" },
                        pressed: { outline: "none" },
                      }}
                      fill={
                        isHovered
                          ? (isActive ? "#2E7D32" : "#9E9E9E")
                          : (isActive ? "#4CAF50" : "#C8C8C8")
                      }
                      stroke="#FFFFFF"
                      strokeWidth={0.9}
                    />
                  );
                } catch (err) {
                  console.warn(`[IndiaMap] Error rendering geo ${idx}:`, err);
                  return null;
                }
              });
            }}
          </Geographies>

          {/* City pin markers */}
          {NGO_HUBS.map((city) => (
            <Marker
              key={city.name}
              coordinates={city.coordinates}
              onMouseEnter={() => setHoveredCity(city.name)}
              onMouseLeave={() => setHoveredCity(null)}
              onClick={() => navigate(city.path)}
              style={{ cursor: "pointer" }}
            >
              <PinIcon hovered={hoveredCity === city.name} />

              {/* City label pill on hover */}
              {hoveredCity === city.name && (
                <g transform="translate(-36, -62)">
                  <rect width={72} height={24} rx={12} fill="#1e3a5f" opacity={0.95} />
                  <text
                    x={36} y={16} textAnchor="middle"
                    style={{ fontSize: 12, fill: "#ffffff", fontWeight: 700, fontFamily: "Inter, sans-serif", pointerEvents: "none", letterSpacing: "0.3px" }}
                  >
                    {city.name}
                  </text>
                </g>
              )}
            </Marker>
          ))}
        </ComposableMap>

        {/* Hovered state tooltip */}
        {hoveredState && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-md rounded-full px-5 py-1.5 text-xs font-bold text-[#1e3a5f] pointer-events-none whitespace-nowrap">
            {hoveredState}{ACTIVE_STATES.has(hoveredState) ? " — Click to view NGOs" : ""}
          </div>
        )}
      </div>
    </div>
  );
}