import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CycloneData, DistrictRisk, Coordinate } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslations } from '../../i18n/translations';
import { DetailedDataFreshnessIndicator } from '../DataFreshnessIndicator';

// Fix Leaflet default icon issue with Vite
// Use CDN URLs for marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CycloneMapProps {
  cycloneData: CycloneData | null;
  districtRisks: DistrictRisk[];
  showLiveEmbed?: boolean;
  embedSource?: 'zoom-earth' | 'windy';
}

// Map Configuration
const MAP_CONFIG = {
  defaultCenter: { lat: 13.0827, lng: 80.2707 } as Coordinate, // Chennai
  defaultZoom: 8,
  minZoom: 6,
  maxZoom: 12,
};

/**
 * CycloneMap Component
 * Displays interactive map with cyclone pathway and district overlays
 * Integrates Leaflet.js for mapping and supports iframe embeds for live visualization
 * 
 * Requirements: 1.1, 1.2, 1.3, 8.5, 10.10
 */
export function CycloneMap({
  cycloneData,
  districtRisks,
  showLiveEmbed = false,
  embedSource = 'zoom-earth',
}: CycloneMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pathwayLayerRef = useRef<L.LayerGroup | null>(null);
  const districtLayerRef = useRef<L.LayerGroup | null>(null);
  const [showMap, setShowMap] = useState<boolean>(!showLiveEmbed);
  
  const { language } = useLanguage();
  const t = getTranslations(language);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || showLiveEmbed) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      center: [MAP_CONFIG.defaultCenter.lat, MAP_CONFIG.defaultCenter.lng],
      zoom: MAP_CONFIG.defaultZoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      zoomControl: true,
      touchZoom: true, // Touch-friendly zoom (Requirement 8.5)
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      dragging: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Initialize layer groups
    pathwayLayerRef.current = L.layerGroup().addTo(map);
    districtLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [showLiveEmbed]);

  // Update cyclone pathway visualization (Requirement 1.1)
  useEffect(() => {
    if (!mapInstanceRef.current || !pathwayLayerRef.current || !cycloneData) return;

    // Clear existing pathway
    pathwayLayerRef.current.clearLayers();

    // Draw cyclone pathway
    if (cycloneData.pathway && cycloneData.pathway.length > 0) {
      const pathwayCoords: [number, number][] = cycloneData.pathway.map(
        (coord) => [coord.lat, coord.lng]
      );

      // Draw pathway line
      const pathwayLine = L.polyline(pathwayCoords, {
        color: '#ff0000',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 5',
      });

      pathwayLine.bindPopup(`
        <div>
          <strong>${cycloneData.name}</strong><br/>
          ${t.map.cyclonePath}<br/>
          Wind Speed: ${cycloneData.windSpeed} km/h<br/>
          Category: ${cycloneData.category}
        </div>
      `);

      pathwayLine.addTo(pathwayLayerRef.current);

      // Add markers for pathway points
      cycloneData.pathway.forEach((coord, index) => {
        const marker = L.circleMarker([coord.lat, coord.lng], {
          radius: 5,
          fillColor: '#ff0000',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        });

        marker.bindPopup(`
          <div>
            <strong>Point ${index + 1}</strong><br/>
            Lat: ${coord.lat.toFixed(4)}<br/>
            Lng: ${coord.lng.toFixed(4)}
          </div>
        `);

        marker.addTo(pathwayLayerRef.current!);
      });

      // Add current position marker
      if (cycloneData.currentPosition) {
        const currentMarker = L.marker([
          cycloneData.currentPosition.lat,
          cycloneData.currentPosition.lng,
        ], {
          icon: L.divIcon({
            className: 'cyclone-current-marker',
            html: '<div style="background-color: #ff0000; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
        });

        currentMarker.bindPopup(`
          <div>
            <strong>${cycloneData.name} - Current Position</strong><br/>
            Wind Speed: ${cycloneData.windSpeed} km/h<br/>
            Pressure: ${cycloneData.pressure} hPa<br/>
            Category: ${cycloneData.category}
          </div>
        `);

        currentMarker.addTo(pathwayLayerRef.current);
      }

      // Fit map to pathway bounds
      const bounds = L.latLngBounds(pathwayCoords);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [cycloneData, t]);

  // Update district overlays with severity color coding (Requirements 1.2, 1.3)
  useEffect(() => {
    if (!mapInstanceRef.current || !districtLayerRef.current) return;

    // Clear existing districts
    districtLayerRef.current.clearLayers();

    // Add district overlays
    districtRisks.forEach((district) => {
      // Get severity color (Requirement 1.3)
      const severityColor = getSeverityColor(district.severityColor);
      
      // Create district marker (simplified - in production, use actual district boundaries)
      // For now, we'll use circle markers at approximate district centers
      const districtCenter = getDistrictCenter(district.districtName);
      
      if (districtCenter) {
        const circle = L.circle([districtCenter.lat, districtCenter.lng], {
          radius: 15000, // 15km radius
          fillColor: severityColor,
          color: severityColor,
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.4,
        });

        // Create popup with district information (Requirements 1.4, 1.5)
        const popupContent = `
          <div style="min-width: 200px;">
            <strong>${district.districtName}</strong><br/>
            <div style="margin-top: 8px;">
              <strong>Severity:</strong> 
              <span style="color: ${severityColor}; font-weight: bold;">
                ${t.severity[district.severityColor]}
              </span> (${district.severityScore.toFixed(1)}/10)<br/>
              <strong>Rainfall:</strong> ${district.rainfallEstimate} mm<br/>
              <strong>Wind Impact:</strong> ${t.risk[district.windImpact]}<br/>
              <strong>Flooding Risk:</strong> ${t.risk[district.floodingProbability]}<br/>
              <strong>Waterlogging Risk:</strong> ${t.risk[district.waterloggingRisk]}
            </div>
          </div>
        `;

        circle.bindPopup(popupContent);
        circle.addTo(districtLayerRef.current!);

        // Add district label
        const label = L.marker([districtCenter.lat, districtCenter.lng], {
          icon: L.divIcon({
            className: 'district-label',
            html: `<div style="background: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold; border: 1px solid ${severityColor}; white-space: nowrap;">${district.districtName}</div>`,
            iconSize: [100, 20],
            iconAnchor: [50, 10],
          }),
        });

        label.addTo(districtLayerRef.current!);
      }
    });
  }, [districtRisks, t, language]);

  // Helper function to get severity color
  const getSeverityColor = (severity: 'yellow' | 'orange' | 'red'): string => {
    switch (severity) {
      case 'yellow':
        return '#fbbf24'; // Yellow
      case 'orange':
        return '#f97316'; // Orange
      case 'red':
        return '#dc2626'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  // Helper function to get approximate district centers (simplified)
  // In production, this would use actual district boundary data
  const getDistrictCenter = (districtName: string): Coordinate | null => {
    const districtCenters: Record<string, Coordinate> = {
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Kanchipuram': { lat: 12.8342, lng: 79.7036 },
      'Tiruvallur': { lat: 13.1433, lng: 79.9091 },
      'Chengalpattu': { lat: 12.6819, lng: 79.9764 },
      'Villupuram': { lat: 11.9401, lng: 79.4861 },
      'Cuddalore': { lat: 11.7480, lng: 79.7714 },
      'Vellore': { lat: 12.9165, lng: 79.1325 },
      'Ranipet': { lat: 12.9222, lng: 79.3333 },
      'Tiruvannamalai': { lat: 12.2253, lng: 79.0747 },
    };

    return districtCenters[districtName] || null;
  };

  // Get embed URL (Requirement 10.10)
  const getEmbedUrl = (): string => {
    if (embedSource === 'zoom-earth') {
      return 'https://zoom.earth/#view=13.0827,80.2707,8z';
    } else {
      return 'https://embed.windy.com/embed2.html?lat=13.083&lon=80.271&detailLat=13.083&detailLon=80.271&width=650&height=450&zoom=8&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1';
    }
  };

  return (
    <div className="cyclone-map-container bg-white rounded-lg shadow-md p-6" role="region" aria-label={t.map.cyclonePath}>
      {/* Header with title and freshness indicator */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">
          {t.map.cyclonePath}
        </h2>
        <DetailedDataFreshnessIndicator cacheKey="cyclone" />
      </div>

      {/* Toggle between map and live embed */}
      {showLiveEmbed && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowMap(false)}
            className={`px-4 py-2 rounded ${!showMap ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            aria-pressed={!showMap}
          >
            Live View
          </button>
          <button
            onClick={() => setShowMap(true)}
            className={`px-4 py-2 rounded ${showMap ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            aria-pressed={showMap}
          >
            {t.map.districts}
          </button>
        </div>
      )}

      {/* Leaflet Map */}
      {(!showLiveEmbed || showMap) && (
        <div
          ref={mapRef}
          className="w-full h-[500px] rounded-lg shadow-lg border border-gray-300"
          role="img"
          aria-label={`${t.map.cyclonePath} showing ${districtRisks.length} ${t.map.districts}`}
        />
      )}

      {/* Live Embed (Requirement 10.10) */}
      {showLiveEmbed && !showMap && (
        <iframe
          src={getEmbedUrl()}
          className="w-full h-[500px] rounded-lg shadow-lg border border-gray-300"
          title={`Live ${embedSource === 'zoom-earth' ? 'Zoom Earth' : 'Windy'} visualization`}
          allowFullScreen
          loading="lazy"
        />
      )}

      {/* Map Legend */}
      <div className="mt-4 p-4 bg-white rounded-lg shadow border border-gray-200">
        <h3 className="font-bold mb-2">{t.severity.yellow.split(' ')[0]} Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
            <span className="text-sm">{t.severity.yellow}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
            <span className="text-sm">{t.severity.orange}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
            <span className="text-sm">{t.severity.red}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            <span className="text-sm">{t.map.cyclonePath}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
