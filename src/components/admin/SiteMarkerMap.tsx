import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  id: string;
  name: string;
  type?: string;
  latitude: number;
  longitude: number;
}

/** Inline SVG pin so we never depend on Leaflet's bundled image assets. */
const pinIcon = (active: boolean) =>
  L.divIcon({
    className: "",
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.8 0 0 5.8 0 13c0 9.2 13 21 13 21s13-11.8 13-21C26 5.8 20.2 0 13 0z"
        fill="${active ? "hsl(24 95% 53%)" : "hsl(215 16% 47%)"}" stroke="white" stroke-width="2"/>
      <circle cx="13" cy="13" r="4.5" fill="white"/>
    </svg>`,
  });

const ClickCapture = ({ onPick }: { onPick?: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onPick?.(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
};

const Recenter = ({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
};

interface Props {
  markers: MapMarker[];
  /** Marker highlighted in accent colour (the site currently being edited). */
  activeId?: string;
  center?: { lat: number; lng: number } | null;
  zoom?: number;
  height?: string;
  /** When provided, clicking or dragging places the coordinates. */
  onPick?: (lat: number, lng: number) => void;
  onMarkerClick?: (id: string) => void;
}

/** Interactive OpenStreetMap canvas used by admins to place and review site pins. */
const SiteMarkerMap = ({ markers, activeId, center, zoom = 12, height = "320px", onPick, onMarkerClick }: Props) => {
  const fallback = useMemo(() => {
    if (center?.lat && center?.lng) return { lat: center.lat, lng: center.lng };
    const first = markers[0];
    if (first) return { lat: first.latitude, lng: first.longitude };
    return { lat: 22.9734, lng: 78.6569 }; // geographic centre of India
  }, [center, markers]);

  return (
    <div className="rounded-xl overflow-hidden shadow-card border border-border" style={{ height }}>
      <MapContainer
        center={[fallback.lat, fallback.lng]}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter lat={fallback.lat} lng={fallback.lng} zoom={zoom} />
        <ClickCapture onPick={onPick} />
        {markers.map(m => (
          <Marker
            key={m.id}
            position={[m.latitude, m.longitude]}
            icon={pinIcon(m.id === activeId)}
            draggable={!!onPick && m.id === activeId}
            eventHandlers={{
              click: () => onMarkerClick?.(m.id),
              dragend: (e: any) => {
                const p = e.target.getLatLng();
                onPick?.(Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6)));
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -30]}>
              {m.name}
              {m.type ? ` · ${m.type}` : ""}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SiteMarkerMap;
