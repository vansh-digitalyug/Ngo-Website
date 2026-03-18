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
  const navigate = useNavigate();

  // Fetch GeoJSON from public/ — never bundled, browser-cached after first load
  useEffect(() => {
    fetch("/india-states.json")
      .then((r) => r.json())
      .then(setGeoData);
  }, []);

  if (!geoData) {
    return (
      <section className="py-12 md:py-16 bg-[#faf9f7]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 flex items-center justify-center" style={{ minHeight: 400 }}>
            <div style={{ width: 40, height: 40, border: "4px solid #e5e7eb", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-[#faf9f7]">
      <div className="max-w-3xl mx-auto px-4">

        {/* White card — matches reference image */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden px-4 pt-8 pb-4 md:px-10 md:pt-10 md:pb-6 relative">

          {/* Decorative green square — top right corner (matches reference) */}
          <div className="absolute top-5 right-5 w-4 h-4 rounded-sm bg-[#4CAF50] opacity-90" />

          {/* Header */}
          <div className="flex flex-col items-center mb-2">
            {/* Teal gradient circle with location pin */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#56c8dc] to-[#2a9db5] flex items-center justify-center shadow-md mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 4.5z"/>
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-widest text-[#1e3a5f] uppercase">
              Pan-India Presence
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              28 States &nbsp;|&nbsp; 8 Union Territories
            </p>
          </div>

          {/* Map — full width, no max-w constraint */}
          <div className="relative w-full mx-auto">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [82.5, 22], scale: 980 }}
              width={700}
              height={760}
              style={{ width: "100%", height: "auto" }}
            >
              <Geographies geography={geoData}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateName = geo.properties.NAME_1;
                    const isActive  = ACTIVE_STATES.has(stateName);
                    const isHovered = hoveredState === stateName;

                    return (
                      <Geography
                        key={geo.rsmKey}
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
                  })
                }
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
                      <rect
                        width={72}
                        height={24}
                        rx={12}
                        fill="#1e3a5f"
                        opacity={0.95}
                      />
                      <text
                        x={36}
                        y={16}
                        textAnchor="middle"
                        style={{
                          fontSize: 12,
                          fill: "#ffffff",
                          fontWeight: 700,
                          fontFamily: "Inter, sans-serif",
                          pointerEvents: "none",
                          letterSpacing: "0.3px",
                        }}
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
                {hoveredState}
                {ACTIVE_STATES.has(hoveredState) ? " — Click to view NGOs" : ""}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-1 pb-2 flex-wrap">
            <span className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#4CAF50] inline-block" />
              Active states
            </span>
            <span className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#C8C8C8] inline-block" />
              Other regions
            </span>
            <span className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-4 text-[#1e3a5f]" viewBox="0 0 22 28" fill="currentColor">
                <path d="M11 0C6.925 0 3.667 3.258 3.667 7.333c0 6.417 7.333 18.667 7.333 18.667S18.333 13.75 18.333 7.333C18.333 3.258 15.075 0 11 0z"/>
              </svg>
              NGO hub city
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
