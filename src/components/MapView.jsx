import React from "react";

// Lightweight map using an OpenStreetMap embed so we avoid Leaflet's
// "Map container is already initialized" issues in React strict/dev mode.

export function MapView({ center = [48.8566, 2.3522], markers = [], height = 360 }) {
  const [lat, lng] = center;

  const delta = 0.05;
  const minLat = lat - delta;
  const minLng = lng - delta;
  const maxLat = lat + delta;
  const maxLng = lng + delta;

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
      <iframe
        title="map"
        src={src}
        style={{ width: "100%", height }}
        loading="lazy"
      />
      {markers?.length ? (
        <div className="px-3 py-2 text-xs text-white/70 bg-black/40 border-t border-white/10">
          Showing map near {markers[0].title ?? "selected location"}.
        </div>
      ) : null}
    </div>
  );
}

