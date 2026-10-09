"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { demoNebby, demoMembers } from "@/lib/demo-data";

export default function AboutMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([40.4406, -79.9959], 15);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const polygon = L.polygon(
      demoNebby.boundary as L.LatLngExpression[],
      {
        color: "#059669",
        fillColor: "#059669",
        fillOpacity: 0.15,
        weight: 2,
      },
    ).addTo(map);

    // Add approximate member pins (block-level, not exact address)
    const membersWithLocation = demoMembers.filter(
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

    map.fitBounds(polygon.getBounds().pad(0.1));

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return <div ref={mapRef} className="h-full w-full" />;
}
