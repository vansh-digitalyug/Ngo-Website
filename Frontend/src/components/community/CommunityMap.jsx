import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

// India bounding box
const INDIA_BOUNDS = [[6.5546079, 68.1766451], [35.6745457, 97.395561]];
const INDIA_CENTER = [20.5937, 78.9629];

const AREA_COLORS = {
  village:  '#16a34a',
  town:     '#2563eb',
  city:     '#7c3aed',
  district: '#dc2626',
  state:    '#ea580c',
};

const AREA_LABEL = {
  village: 'Village', town: 'Town', city: 'City',
  district: 'District', state: 'State',
};

const CommunityMap = ({ communities = [] }) => {
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const navigate  = useNavigate();

  const withCoords = communities.filter(c => {
    const coords = c.location?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return false;
    const [lng, lat] = coords;
    return Number.isFinite(lat) && Number.isFinite(lng) &&
           lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  });

  useEffect(() => {
    // Dynamically import Leaflet so Vite doesn't SSR-break it
    let L;
    let mounted = true;

    import('leaflet').then(mod => {
      if (!mounted || !mapRef.current) return;
      L = mod.default;

      // Load Leaflet CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id   = 'leaflet-css';
        link.rel  = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Fix default icon path (Vite breaks Leaflet's auto-detection)
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Destroy previous instance if re-rendered
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }

      // Create map locked to India
      const map = L.map(mapRef.current, {
        center:             INDIA_CENTER,
        zoom:               5,
        minZoom:            4,
        maxZoom:            16,
        maxBounds:          INDIA_BOUNDS,
        maxBoundsViscosity: 1.0,
      });
      mapObj.current = map;

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Custom pin icon
      const makeIcon = (color) => L.divIcon({
        className: '',
        html: `<div style="
          width:28px;height:28px;
          border-radius:50% 50% 50% 0;
          background:${color};
          border:3px solid #fff;
          transform:rotate(-45deg);
          box-shadow:0 2px 8px rgba(0,0,0,.4);
        "></div>`,
        iconSize:    [28, 28],
        iconAnchor:  [14, 28],
        popupAnchor: [0, -32],
      });

      // Add markers
      withCoords.forEach(community => {
        const [lng, lat] = community.location.coordinates.map(Number);
        const color      = AREA_COLORS[community.areaType] || '#6b7280';
        const label      = AREA_LABEL[community.areaType]  || community.areaType;
        const city       = [community.location?.city, community.location?.state]
                             .filter(Boolean).join(', ');
        const isVerified = community.verificationStatus === 'verified';

        const popup = `
          <div style="font-family:system-ui,sans-serif;min-width:210px;padding:4px 0">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
              <div style="font-weight:700;font-size:14px;color:#111827;flex:1;margin-right:6px;line-height:1.3">
                ${community.name}
              </div>
              <span style="
                background:${isVerified ? '#dcfce7' : '#fef3c7'};
                color:${isVerified ? '#166534' : '#92400e'};
                padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700;
                white-space:nowrap;flex-shrink:0
              ">${isVerified ? '✓ Verified' : 'Pending'}</span>
            </div>

            <span style="
              background:${color}18;color:${color};border:1px solid ${color}40;
              padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;
              display:inline-block;margin-bottom:8px
            ">${label}</span>

            ${city ? `
              <div style="display:flex;align-items:center;gap:4px;color:#6b7280;font-size:12px;margin-bottom:6px">
                📍 ${city}
              </div>` : ''}

            <div style="display:flex;gap:12px;margin-bottom:10px;font-size:12px;color:#374151">
              <span>👥 ${community.stats?.totalMembers ?? 0} members</span>
              <span>✅ ${community.stats?.completedActivities ?? 0} activities</span>
            </div>

            ${community.currentLeaderName ? `
              <div style="font-size:12px;color:#6b7280;margin-bottom:10px">
                Leader: <strong style="color:#374151">${community.currentLeaderName}</strong>
              </div>` : ''}

            <a
              href="/community/${community._id}"
              style="
                display:block;text-align:center;
                background:#2563eb;color:#fff;
                padding:7px 0;border-radius:8px;
                font-size:13px;font-weight:600;
                text-decoration:none
              "
              onclick="event.preventDefault();window.__navigateTo('/community/${community._id}')"
            >View Community →</a>
          </div>`;

        L.marker([lat, lng], { icon: makeIcon(color) })
          .bindPopup(popup, { maxWidth: 260 })
          .addTo(map);
      });

      // Fit bounds to markers if any, else show all of India
      if (withCoords.length > 0) {
        const points = withCoords.map(c => [
          Number(c.location.coordinates[1]),
          Number(c.location.coordinates[0]),
        ]);
        map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 14 });
      } else {
        map.fitBounds(INDIA_BOUNDS, { padding: [20, 20] });
      }
    });

    return () => {
      mounted = false;
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communities]);

  // Expose navigate for popup link clicks
  useEffect(() => {
    window.__navigateTo = (path) => navigate(path);
    return () => { delete window.__navigateTo; };
  }, [navigate]);

  return (
    <div style={{ position: 'relative', height: 560, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.1)', border: '1px solid #e5e7eb' }}>
      {/* Map container */}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* Legend */}
      <div style={{
        position: 'absolute', zIndex: 1000, bottom: 32, right: 16,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)',
        borderRadius: 12, padding: '10px 14px',
        boxShadow: '0 2px 12px rgba(0,0,0,.15)',
        fontSize: 12, lineHeight: '1.9', pointerEvents: 'none',
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4, color: '#374151' }}>Area Type</div>
        {Object.entries(AREA_COLORS).map(([k, color]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4b5563' }}>
            <span style={{ width: 11, height: 11, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            {AREA_LABEL[k]}
          </div>
        ))}
      </div>

      {/* Count badge */}
      <div style={{
        position: 'absolute', zIndex: 1000, top: 14, left: 14,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(6px)',
        borderRadius: 12, padding: '7px 13px',
        boxShadow: '0 2px 12px rgba(0,0,0,.15)',
        fontSize: 13, fontWeight: 600, color: '#1e40af',
        display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none',
      }}>
        <MapPin size={14} />
        {withCoords.length} {withCoords.length === 1 ? 'community' : 'communities'} on map
        {communities.length - withCoords.length > 0 && (
          <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: 11 }}>
            ({communities.length - withCoords.length} without GPS)
          </span>
        )}
      </div>
    </div>
  );
};

export default CommunityMap;
