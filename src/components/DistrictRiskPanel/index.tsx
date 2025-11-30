import { useMemo } from 'react';
import { useData, useLanguage } from '../../contexts';
import type { DistrictRisk } from '../../types';
import { DetailedDataFreshnessIndicator } from '../DataFreshnessIndicator';

interface DistrictRiskItemProps {
  district: DistrictRisk;
  language: 'en' | 'ta';
  translations: any;
}

function DistrictRiskItem({ district, language, translations }: DistrictRiskItemProps) {
  const isHighRisk = district.severityScore >= 7;

  // Get severity color class
  const severityColorClass = {
    yellow: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    orange: 'bg-orange-100 border-orange-400 text-orange-800',
    red: 'bg-red-100 border-red-400 text-red-800',
  }[district.severityColor];

  // Get risk level text
  const getRiskLevelText = (level: string) => {
    return translations.risk[level] || level;
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isHighRisk
          ? 'border-red-500 bg-red-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      role="article"
      aria-label={`${district.districtName} risk information`}
    >
      {/* District name and severity indicator */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {district.districtName}
        </h3>
        
        {/* Severity indicator with color and score */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 ${severityColorClass}`}
          role="status"
          aria-label={`Severity level: ${translations.severity[district.severityColor]}, score ${district.severityScore.toFixed(1)}`}
        >
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: district.severityColor }}
            aria-hidden="true"
          />
          <span className="font-semibold text-sm">
            {district.severityScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Risk information grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {/* Rainfall estimate */}
        <div className="flex flex-col">
          <span className="text-gray-600 font-medium">
            {language === 'en' ? 'Rainfall' : 'மழை'}
          </span>
          <span className="text-gray-900 font-semibold">
            {district.rainfallEstimate} mm
          </span>
        </div>

        {/* Flooding probability */}
        <div className="flex flex-col">
          <span className="text-gray-600 font-medium">
            {language === 'en' ? 'Flooding' : 'வெள்ளம்'}
          </span>
          <span
            className={`font-semibold ${
              district.floodingProbability === 'high'
                ? 'text-red-600'
                : district.floodingProbability === 'moderate'
                ? 'text-orange-600'
                : 'text-green-600'
            }`}
          >
            {getRiskLevelText(district.floodingProbability)}
          </span>
        </div>

        {/* Waterlogging risk */}
        <div className="flex flex-col">
          <span className="text-gray-600 font-medium">
            {language === 'en' ? 'Waterlogging' : 'நீர் தேங்குதல்'}
          </span>
          <span
            className={`font-semibold ${
              district.waterloggingRisk === 'high'
                ? 'text-red-600'
                : district.waterloggingRisk === 'moderate'
                ? 'text-orange-600'
                : 'text-green-600'
            }`}
          >
            {getRiskLevelText(district.waterloggingRisk)}
          </span>
        </div>

        {/* Wind impact */}
        <div className="flex flex-col">
          <span className="text-gray-600 font-medium">
            {language === 'en' ? 'Wind Impact' : 'காற்று தாக்கம்'}
          </span>
          <span
            className={`font-semibold ${
              district.windImpact === 'high'
                ? 'text-red-600'
                : district.windImpact === 'moderate'
                ? 'text-orange-600'
                : 'text-green-600'
            }`}
          >
            {getRiskLevelText(district.windImpact)}
          </span>
        </div>
      </div>

      {/* Additional Hazards Section */}
      {(district.stormSurge || district.landslideRisk) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            {language === 'en' ? 'Additional Hazards' : 'கூடுதல் அபாயங்கள்'}
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {/* Storm Surge */}
            {district.stormSurge && district.isCoastal && (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">🌊</span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {language === 'en' ? 'Storm Surge' : 'புயல் அலை'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {language === 'en' 
                        ? `Water level rise: ${district.stormSurge.waterLevelRise}m`
                        : `நீர் மட்ட உயர்வு: ${district.stormSurge.waterLevelRise}m`}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    district.stormSurge.risk === 'high'
                      ? 'bg-red-100 text-red-800'
                      : district.stormSurge.risk === 'moderate'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {getRiskLevelText(district.stormSurge.risk)}
                </span>
              </div>
            )}

            {/* Landslide Risk */}
            {district.landslideRisk && district.isHilly && (
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded border border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">⛰️</span>
                  <div className="font-medium text-gray-900">
                    {language === 'en' ? 'Landslide Risk' : 'நிலச்சரிவு ஆபத்து'}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    district.landslideRisk === 'high'
                      ? 'bg-red-100 text-red-800'
                      : district.landslideRisk === 'moderate'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {getRiskLevelText(district.landslideRisk)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Severity level text label (for accessibility) */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <span className="text-xs font-medium text-gray-700">
          {translations.severity[district.severityColor]}
        </span>
      </div>
    </div>
  );
}

export function DistrictRiskPanel() {
  const { districts, loading, error } = useData();
  const { language, t } = useLanguage();

  // Sort districts by severity score (highest first)
  const sortedDistricts = useMemo(() => {
    return [...districts].sort((a, b) => b.severityScore - a.severityScore);
  }, [districts]);

  if (loading && districts.length === 0) {
    return (
      <section
        className="bg-white rounded-lg shadow-md p-6"
        aria-label="District risk information"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">{t.common.loading}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && districts.length === 0) {
    return (
      <section
        className="bg-white rounded-lg shadow-md p-6"
        aria-label="District risk information"
      >
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">{t.common.error}</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-white rounded-lg shadow-md p-6"
      aria-label="District risk information"
    >
      {/* Header with title and data provenance */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {language === 'en' ? 'District Risk Assessment' : 'மாவட்ட ஆபத்து மதிப்பீடு'}
          </h2>
          
          {/* Data freshness indicator */}
          <DetailedDataFreshnessIndicator cacheKey="districts" />
        </div>

        {/* Source attribution */}
        <p className="text-sm text-gray-600">
          <span className="font-medium">{t.footer.dataSource}:</span>{' '}
          {language === 'en'
            ? 'India Meteorological Department (IMD) & Tamil Nadu Government'
            : 'இந்திய வானிலை ஆய்வு மையம் (IMD) & தமிழ்நாடு அரசு'}
        </p>
      </div>

      {/* Districts list */}
      {sortedDistricts.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          {language === 'en'
            ? 'No district risk data available'
            : 'மாவட்ட ஆபத்து தரவு இல்லை'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedDistricts.map((district) => (
            <DistrictRiskItem
              key={district.districtId}
              district={district}
              language={language}
              translations={t}
            />
          ))}
        </div>
      )}

      {/* High risk districts summary */}
      {sortedDistricts.some((d) => d.severityScore >= 7) && (
        <div
          className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded"
          role="alert"
          aria-live="assertive"
        >
          <p className="font-semibold text-red-800">
            {language === 'en'
              ? `⚠ ${sortedDistricts.filter((d) => d.severityScore >= 7).length} district(s) at high risk`
              : `⚠ ${sortedDistricts.filter((d) => d.severityScore >= 7).length} மாவட்டங்கள் அதிக ஆபத்தில்`}
          </p>
        </div>
      )}
    </section>
  );
}
