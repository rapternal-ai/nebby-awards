"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

interface BoundaryMapProps {
  onBoundaryChange?: (coords: [number, number][]) => void;
}

export default function BoundaryMap({ onBoundaryChange }: BoundaryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mounted, setMounted] = useState(false);

  // Wait one tick so the container is fully in the DOM
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    // Prevent double-init (React strict mode)
    if (mapInstanceRef.current) return;

    // Guard: container must have dimensions
    const container = mapRef.current;
    if (container.clientWidth === 0 || container.clientHeight === 0) return;

    const map = L.map(container).setView([40.4406, -79.9959], 15);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // Feature group to hold drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Draw controls
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          shapeOptions: {
            color: "#059669",
            fillColor: "#059669",
            fillOpacity: 0.15,
            weight: 2,
          },
          allowIntersection: false,
          showArea: true,
        },
        polyline: false,
        rectangle: {
          shapeOptions: {
            color: "#059669",
            fillColor: "#059669",
            fillOpacity: 0.15,
            weight: 2,
          },
        },
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: {
        featureGroup: drawnItems,
      },
    });
    map.addControl(drawControl);

    function extractCoords(layer: L.Layer) {
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs()[0] as L.LatLng[];
        return latlngs.map((ll): [number, number] => [ll.lat, ll.lng]);
      }
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on(L.Draw.Event.CREATED, (e: any) => {
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);
      const coords = extractCoords(e.layer);
      if (coords.length > 0) onBoundaryChange?.(coords);
    });

    map.on(L.Draw.Event.EDITED, () => {
      const layers = drawnItems.getLayers();
      if (layers.length > 0) {
        const coords = extractCoords(layers[0]);
        if (coords.length > 0) onBoundaryChange?.(coords);
      }
    });

    map.on(L.Draw.Event.DELETED, () => {
      onBoundaryChange?.([]);
    });

    return () => {
      try {
        map.remove();
      } catch {
        // Leaflet can throw if container already detached
      }
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  return <div ref={mapRef} className="h-full w-full" />;
}
