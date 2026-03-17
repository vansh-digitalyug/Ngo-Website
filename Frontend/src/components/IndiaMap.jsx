import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import indiaGeo from "../assets/india-states.json";

const NGO_HUBS = [
  { name: "Mumbai",    coordinates: [72.8777, 19.076]  },
  { name: "Delhi",     coordinates: [77.1025, 28.7041] },
  { name: "Bangalore", coordinates: [77.5946, 12.9716] },
  { name: "Chennai",   coordinates: [80.2707, 13.0827] },
  { name: "Kolkata",   coordinates: [88.3639, 22.5726] },
  { name: "Hyderabad", coordinates: [78.4867, 17.385]  },
  { name: "Jaipur",    coordinates: [75.7873, 26.9124] },
  { name: "Ahmedabad", coordinates: [72.5714, 23.0225] },
  { name: "Lucknow",   coordinates: [80.9462, 26.8467] },
  { name: "Pune",      coordinates: [73.8567, 18.5204] },
  { name: "Bhopal",    coordinates: [77.4126, 23.2599] },
  { name: "Patna",     coordinates: [85.1376, 25.5941] },
];

export default function IndiaMap() {
  const [hoveredCity, setHoveredCity] = useState(null);

  return (
    <section className="py-16 bg-[#faf9f7]">
      <style>{`
        @keyframes map-ping {
          0%   { transform: scale(1);   opacity: 0.8; }
          60%  { transform: scale(2.6); opacity: 0;   }
          100% { transform: scale(1);   opacity: 0;   }
        }
        .map-ping {
          animation: map-ping 2s ease-out infinite;
          transform-origin: center;
          transform-box: fill-box;
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [82, 22], scale: 900 }}
          width={600}
          height={560}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={indiaGeo}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#DCFCE7"
                  stroke="#6EE7B7"
                  strokeWidth={0.6}
                  style={{
                    default: { outline: "none" },
                    hover:   { fill: "#BBF7D0", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {NGO_HUBS.map((city, i) => (
            <Marker
              key={city.name}
              coordinates={city.coordinates}
              onMouseEnter={() => setHoveredCity(city.name)}
              onMouseLeave={() => setHoveredCity(null)}
              style={{ cursor: "pointer" }}
            >
              <circle r={10} fill="#16a34a" opacity={0.25} className="map-ping"
                style={{ animationDelay: `${(i * 0.35) % 2}s` }} />
              <circle r={6} fill="#16a34a" opacity={0.2} className="map-ping"
                style={{ animationDelay: `${(i * 0.35 + 0.4) % 2}s` }} />
              <circle
                r={hoveredCity === city.name ? 6 : 4.5}
                fill={hoveredCity === city.name ? "#ff5722" : "#16a34a"}
                stroke="white"
                strokeWidth={1.5}
                style={{ transition: "all 0.2s ease" }}
              />
              {hoveredCity === city.name && (
                <text
                  textAnchor="middle"
                  y={-12}
                  style={{
                    fontSize: 9,
                    fill: "#1f2937",
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                    pointerEvents: "none",
                  }}
                >
                  {city.name}
                </text>
              )}
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </section>
  );
}
