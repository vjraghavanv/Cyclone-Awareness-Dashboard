import { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts';
import type { TravelRouteAnalysis, SavedRoute } from '../../types';
import { apiClient } from '../../services/api';
import { storageManager } from '../../services/storage';
import { DetailedDataFreshnessIndicator } from '../DataFreshnessIndicator';

export function TravelRouteChecker() {
  const { language, t } = useLanguage();

  // Form state
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  
  // Analysis state
  const [analysis, setAnalysis] = useState<TravelRouteAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Saved routes state
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>(() => 
    storageManager.getSavedRoutes()
  );

  // Validation
  const isFormValid = useMemo(() => {
    return source.trim().length > 0 && destination.trim().length > 0;
  }, [source, destination]);

  // Handle route analysis
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.analyzeTravelRoute(source.trim(), destination.trim());
      setAnalysis(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze route';
      setError(message);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle save route
  const handleSaveRoute = () => {
    if (!source || !destination) return;

    const newRoute: SavedRoute = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: source.trim(),
      destination: destination.trim(),
      savedAt: new Date(),
    };

    storageManager.saveRoute(newRoute);
    setSavedRoutes(storageManager.getSavedRoutes());
  };

  // Handle load saved route
  const handleLoadRoute = (route: SavedRoute) => {
    setSource(route.source);
    setDestination(route.destination);
    setAnalysis(null);
    setError(null);
  };

  // Handle delete saved route
  const handleDeleteRoute = (routeId: string) => {
    storageManager.deleteRoute(routeId);
    setSavedRoutes(storageManager.getSavedRoutes());
  };

  // Get recommendation styling
  const getRecommendationStyle = (recommendation: string) => {
    switch (recommendation) {
      case 'safe':
        return {
          bg: 'bg-green-100',
          border: 'border-green-400',
          text: 'text-green-800',
          icon: '✓',
        };
      case 'caution':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-400',
          text: 'text-yellow-800',
          icon: '⚠',
        };
      case 'avoid-travel':
        return {
          bg: 'bg-red-100',
          border: 'border-red-400',
          text: 'text-red-800',
          icon: '⛔',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-400',
          text: 'text-gray-800',
          icon: '?',
        };
    }
  };

  // Get recommendation text
  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'safe':
        return t.travel.safe;
      case 'caution':
        return t.travel.caution;
      case 'avoid-travel':
        return t.travel.avoidTravel;
      default:
        return recommendation;
    }
  };

  // Format time window
  const formatTimeWindow = (date: Date) => {
    return new Date(date).toLocaleString(
      language === 'en' ? 'en-IN' : 'ta-IN',
      {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  return (
    <section
      className="bg-white rounded-lg shadow-md p-6"
      aria-label="Travel route safety checker"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {t.travel.title}
          </h2>
          {analysis && (
            <DetailedDataFreshnessIndicator
              cacheKey="travel"
              fallbackTimestamp={new Date()}
            />
          )}
        </div>
        <p className="text-sm text-gray-600">
          {language === 'en'
            ? 'Check if your planned route is safe during the cyclone'
            : 'சூறாவளியின் போது உங்கள் திட்டமிட்ட வழி பாதுகாப்பானதா என சரிபார்க்கவும்'}
        </p>
      </div>

      {/* Route Input Form */}
      <form onSubmit={handleAnalyze} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source input */}
          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.travel.source}
            </label>
            <input
              id="source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={language === 'en' ? 'e.g., Chennai' : 'எ.கா., சென்னை'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-required="true"
              disabled={loading}
            />
          </div>

          {/* Destination input */}
          <div>
            <label
              htmlFor="destination"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.travel.destination}
            </label>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={language === 'en' ? 'e.g., Pondicherry' : 'எ.கா., புதுச்சேரி'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-required="true"
              disabled={loading}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label={t.travel.analyze}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                {language === 'en' ? 'Analyzing...' : 'பகுப்பாய்வு செய்கிறது...'}
              </span>
            ) : (
              t.travel.analyze
            )}
          </button>

          {analysis && (
            <button
              type="button"
              onClick={handleSaveRoute}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              aria-label={language === 'en' ? 'Save route' : 'வழியை சேமி'}
            >
              {language === 'en' ? '💾 Save' : '💾 சேமி'}
            </button>
          )}
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div
          className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded"
          role="alert"
        >
          <p className="text-red-800 font-semibold">{t.common.error}</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 mb-6">
          {/* Safety Recommendation */}
          <div
            className={`p-6 rounded-lg border-2 ${
              getRecommendationStyle(analysis.recommendation).bg
            } ${getRecommendationStyle(analysis.recommendation).border}`}
            role="status"
            aria-label={`Safety recommendation: ${getRecommendationText(analysis.recommendation)}`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`text-4xl ${getRecommendationStyle(analysis.recommendation).text}`}
                aria-hidden="true"
              >
                {getRecommendationStyle(analysis.recommendation).icon}
              </span>
              <div className="flex-1">
                <div
                  className={`text-2xl font-bold ${
                    getRecommendationStyle(analysis.recommendation).text
                  }`}
                >
                  {getRecommendationText(analysis.recommendation)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {language === 'en'
                    ? `Route from ${analysis.source} to ${analysis.destination}`
                    : `${analysis.source} இலிருந்து ${analysis.destination} வரை வழி`}
                </div>
              </div>
            </div>
          </div>

          {/* Affected Districts */}
          {analysis.affectedDistricts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {language === 'en'
                  ? 'Affected Districts Along Route'
                  : 'வழியில் பாதிக்கப்பட்ட மாவட்டங்கள்'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {analysis.riskSegments.map((segment, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      segment.riskLevel === 'high'
                        ? 'bg-red-50 border-red-400'
                        : segment.riskLevel === 'moderate'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-green-50 border-green-400'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">
                      {segment.districtName}
                    </div>
                    <div
                      className={`text-sm font-medium mt-1 ${
                        segment.riskLevel === 'high'
                          ? 'text-red-700'
                          : segment.riskLevel === 'moderate'
                          ? 'text-yellow-700'
                          : 'text-green-700'
                      }`}
                    >
                      {t.risk[segment.riskLevel]} {language === 'en' ? 'Risk' : 'ஆபத்து'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maximum Rainfall */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">
              {language === 'en' ? 'Maximum Rainfall Along Route' : 'வழியில் அதிகபட்ச மழை'}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {analysis.maxRainfall} mm
            </div>
          </div>

          {/* Disruption Time Windows */}
          {analysis.disruptionWindows.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {language === 'en'
                  ? 'Expected Disruption Periods'
                  : 'எதிர்பார்க்கப்படும் இடையூறு காலங்கள்'}
              </h3>
              <div className="space-y-2">
                {analysis.disruptionWindows.map((window, index) => (
                  <div
                    key={index}
                    className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {formatTimeWindow(window.start)} - {formatTimeWindow(window.end)}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          window.severity === 'high'
                            ? 'bg-red-200 text-red-800'
                            : window.severity === 'moderate'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-green-200 text-green-800'
                        }`}
                      >
                        {t.risk[window.severity]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saved Routes */}
      {savedRoutes.length > 0 && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {language === 'en' ? 'Saved Routes' : 'சேமிக்கப்பட்ட வழிகள்'}
          </h3>
          <div className="space-y-2">
            {savedRoutes.map((route) => (
              <div
                key={route.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <button
                  onClick={() => handleLoadRoute(route)}
                  className="flex-1 text-left"
                  aria-label={`Load route from ${route.source} to ${route.destination}`}
                >
                  <div className="font-medium text-gray-900">
                    {route.source} → {route.destination}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {language === 'en' ? 'Saved' : 'சேமிக்கப்பட்டது'}:{' '}
                    {new Date(route.savedAt).toLocaleDateString(
                      language === 'en' ? 'en-IN' : 'ta-IN'
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleDeleteRoute(route.id)}
                  className="ml-3 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  aria-label={`Delete route from ${route.source} to ${route.destination}`}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
