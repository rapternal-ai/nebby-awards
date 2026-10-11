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
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Wait one tick so the container is fully in the DOM
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !mapInstanceRef.current) return;
    setSearching(true);
    setSearchError("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=1`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        setSearchError("Address not found. Try a different search.");
        return;
      }
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      const boundingbox = result.boundingbox;
      const map = mapInstanceRef.current;
      if (boundingbox && boundingbox.length === 4) {
        const southWest = L.latLng(
          parseFloat(boundingbox[0]),
          parseFloat(boundingbox[2]),
        );
        const northEast = L.latLng(
          parseFloat(boundingbox[1]),
          parseFloat(boundingbox[3]),
        );
        map.fitBounds(L.latLngBounds(southWest, northEast), { maxZoom: 16 });
      } else {
        map.flyTo([lat, lon], 16);
      }
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

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

  return (
    <div className="relative h-full w-full">
      <form
        onSubmit={handleSearch}
        className="absolute top-3 left-3 right-3 z-[1000] flex gap-2 rounded-lg bg-white/95 p-2 shadow-md backdrop-blur-sm"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search an address or neighborhood..."
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {searching ? "..." : "Search"}
        </button>
      </form>
      {searchError && (
        <div className="absolute top-16 left-3 right-3 z-[1000] rounded-lg bg-red-50 p-2 text-sm text-red-600 shadow-sm">
          {searchError}
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
