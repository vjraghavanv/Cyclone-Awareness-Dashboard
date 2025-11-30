import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HolidayPredictor } from '../../src/components/HolidayPredictor';
import { DataProvider } from '../../src/contexts/DataContext';
import { LanguageProvider } from '../../src/contexts/LanguageContext';
import type { HolidayPrediction } from '../../src/types';

// Mock the API client
vi.mock('../../src/services/api', () => ({
  apiClient: {
    getCurrentCyclone: vi.fn().mockResolvedValue(null),
    getDistrictRainfall: vi.fn().mockResolvedValue([]),
    getGovernmentAlerts: vi.fn().mockResolvedValue([]),
    getIMDBulletins: vi.fn().mockResolvedValue([]),
    getHolidayPrediction: vi.fn(),
    getRiskSummary: vi.fn().mockResolvedValue(null),
    healthCheck: vi.fn().mockResolvedValue(true),
  },
}));

const mockHolidayPrediction: HolidayPrediction = {
  date: new Date('2024-12-15'),
  probability: 'likely',
  confidence: 85,
  factors: {
    rainfallIntensity: 150,
    windSpeed: 95,
    alertLevel: 'Red Alert',
  },
};

describe('HolidayPredictor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders holiday prediction with all required information', async () => {
    const { apiClient } = await import('../../src/services/api');
    vi.mocked(apiClient.getHolidayPrediction).mockResolvedValue(mockHolidayPrediction);

    render(
      <LanguageProvider>
        <DataProvider autoRefresh={false}>
          <HolidayPredictor />
        </DataProvider>
      </LanguageProvider>
    );

    // Wait for data to load
    await screen.findByText(/School\/College Holiday Prediction/i);

    // Check prediction label is displayed
    expect(screen.getByText(/Likely/i)).toBeInTheDocument();

    // Check confidence level is displayed
    expect(screen.getByText(/85%/i)).toBeInTheDocument();

    // Check contributing factors are displayed
    expect(screen.getByText(/150 mm/i)).toBeInTheDocument();
    expect(screen.getByText(/95 km\/h/i)).toBeInTheDocument();
    expect(screen.getByText(/Red Alert/i)).toBeInTheDocument();
  });

  it('displays prediction label and confidence correctly', async () => {
    const { apiClient } = await import('../../src/services/api');
    vi.mocked(apiClient.getHolidayPrediction).mockResolvedValue(mockHolidayPrediction);

    render(
      <LanguageProvider>
        <DataProvider autoRefresh={false}>
          <HolidayPredictor />
        </DataProvider>
      </LanguageProvider>
    );

    // Wait for data to load and verify both prediction and confidence are displayed
    await screen.findByText(/Likely/i);
    expect(screen.getByText(/85%/i)).toBeInTheDocument();
    expect(screen.getByText(/School\/College Holiday Prediction/i)).toBeInTheDocument();
  });

  it('shows loading state when data is being fetched', async () => {
    const { apiClient } = await import('../../src/services/api');
    vi.mocked(apiClient.getHolidayPrediction).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <LanguageProvider>
        <DataProvider autoRefresh={false}>
          <HolidayPredictor />
        </DataProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });
});
