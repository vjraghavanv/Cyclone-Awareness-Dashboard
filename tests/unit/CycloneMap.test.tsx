import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CycloneMap } from '../../src/components/CycloneMap';
import { LanguageProvider } from '../../src/contexts/LanguageContext';
import type { CycloneData, DistrictRisk } from '../../src/types';

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({
      setView: vi.fn(),
      remove: vi.fn(),
      fitBounds: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    layerGroup: vi.fn(() => ({
      addTo: vi.fn(),
      clearLayers: vi.fn(),
    })),
    polyline: vi.fn(() => ({
      addTo: vi.fn(),
      bindPopup: vi.fn(),
    })),
    circleMarker: vi.fn(() => ({
      addTo: vi.fn(),
      bindPopup: vi.fn(),
    })),
    marker: vi.fn(() => ({
      addTo: vi.fn(),
      bindPopup: vi.fn(),
    })),
    circle: vi.fn(() => ({
      addTo: vi.fn(),
      bindPopup: vi.fn(),
    })),
    divIcon: vi.fn(() => ({})),
    icon: vi.fn(() => ({})),
    latLngBounds: vi.fn(() => ({})),
    Marker: {
      prototype: {
        options: {},
      },
    },
  },
}));

describe('CycloneMap', () => {
  const mockCycloneData: CycloneData = {
    id: 'test-cyclone-1',
    name: 'Test Cyclone',
    pathway: [
      { lat: 13.0, lng: 80.0 },
      { lat: 13.1, lng: 80.1 },
    ],
    currentPosition: { lat: 13.1, lng: 80.1 },
    windSpeed: 100,
    pressure: 990,
    category: 'cyclone',
    lastUpdated: new Date(),
  };

  const mockDistrictRisks: DistrictRisk[] = [
    {
      districtId: 'chennai',
      districtName: 'Chennai',
      rainfallEstimate: 150,
      floodingProbability: 'high',
      waterloggingRisk: 'high',
      windImpact: 'moderate',
      severityScore: 7.5,
      severityColor: 'red',
    },
  ];

  it('renders the map container', () => {
    render(
      <LanguageProvider>
        <CycloneMap cycloneData={mockCycloneData} districtRisks={mockDistrictRisks} />
      </LanguageProvider>
    );

    // Check if the map legend is rendered
    expect(screen.getByText(/Legend/i)).toBeInTheDocument();
  });

  it('renders severity legend with correct colors', () => {
    render(
      <LanguageProvider>
        <CycloneMap cycloneData={mockCycloneData} districtRisks={mockDistrictRisks} />
      </LanguageProvider>
    );

    // Check if severity levels are displayed
    expect(screen.getByText(/Moderate Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Severe Risk/i)).toBeInTheDocument();
  });

  it('renders without cyclone data', () => {
    render(
      <LanguageProvider>
        <CycloneMap cycloneData={null} districtRisks={[]} />
      </LanguageProvider>
    );

    // Should still render the map container
    expect(screen.getByText(/Legend/i)).toBeInTheDocument();
  });

  it('shows toggle buttons when showLiveEmbed is true', () => {
    render(
      <LanguageProvider>
        <CycloneMap 
          cycloneData={mockCycloneData} 
          districtRisks={mockDistrictRisks}
          showLiveEmbed={true}
        />
      </LanguageProvider>
    );

    // Check for toggle buttons
    expect(screen.getByText('Live View')).toBeInTheDocument();
    expect(screen.getByText('Districts')).toBeInTheDocument();
  });
});
