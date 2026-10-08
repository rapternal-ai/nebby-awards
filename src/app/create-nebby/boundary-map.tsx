"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function BoundaryMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([40.4406, -79.9959], 15);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // Demo polygon
    const polygon = L.polygon(
      [
        [40.4396, -79.9979],
        [40.4416, -79.9979],
        [40.4416, -79.9939],
        [40.4396, -79.9939],
      ],
      {
        color: "#059669",
        fillColor: "#059669",
        fillOpacity: 0.15,
        weight: 2,
      },
    ).addTo(map);

    map.fitBounds(polygon.getBounds().pad(0.1));

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return <div ref={mapRef} className="h-full w-full" />;
}
