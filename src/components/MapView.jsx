import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export function MapView({ center = [48.8566, 2.3522], markers = [], height = 360 }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <MapContainer center={center} zoom={12} style={{ height, width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.key ?? `${m.lat},${m.lng}`} position={[m.lat, m.lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{m.title}</div>
                {m.subtitle ? <div className="opacity-80">{m.subtitle}</div> : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

