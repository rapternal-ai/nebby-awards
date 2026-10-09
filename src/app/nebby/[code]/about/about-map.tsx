"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNebbys } from "@/lib/nebby-context";

export default function AboutMap() {
  const { activeNebby, activeMembers } = useNebbys();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const boundary = activeNebby?.boundary ?? [];
  const nebbyName = activeNebby?.name ?? "Neighborhood";

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const center: L.LatLngExpression = boundary.length > 0
      ? [
          boundary.reduce((s, b) => s + b[0], 0) / boundary.length,
          boundary.reduce((s, b) => s + b[1], 0) / boundary.length,
        ]
      : [40.4406, -79.9959];

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView(center, 15);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    if (boundary.length >= 3) {
      const polygon = L.polygon(
        boundary as L.LatLngExpression[],
        {
          color: "#059669",
          fillColor: "#059669",
          fillOpacity: 0.15,
          weight: 2,
        },
      ).addTo(map);

      map.fitBounds(polygon.getBounds().pad(0.1));
    }

    // Add approximate member pins (block-level, not exact address)
    const membersWithLocation = activeMembers.filter(
      (m) => m.status === "approved" && m.approxLocation,
    );

    membersWithLocation.forEach((member) => {
      if (!member.approxLocation) return;
      L.circleMarker([member.approxLocation.lat, member.approxLocation.lng], {
        radius: 8,
        fillColor: "#059669",
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .addTo(map)
        .bindPopup(
          `<div style="text-align:center;font-size:13px;">` +
            `<strong>${member.username}</strong><br/>` +
            `<span style="color:#71717a;font-size:11px;">Approximate location</span>` +
            `</div>`,
          { closeButton: false, offset: L.point(0, -4) },
        );
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNebby?.shortCode]);

  return <div ref={mapRef} className="h-full w-full" />;
}
