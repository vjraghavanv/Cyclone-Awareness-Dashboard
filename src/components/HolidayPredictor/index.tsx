import { useData, useLanguage } from '../../contexts';
import type { HolidayProbability } from '../../types';
import { DetailedDataFreshnessIndicator } from '../DataFreshnessIndicator';

export function HolidayPredictor() {
  const { holidayPrediction, loading, error } = useData();
  const { language, t } = useLanguage();

  // Get prediction label styling
  const getPredictionStyle = (probability: HolidayProbability) => {
    switch (probability) {
      case 'low-risk':
        return {
          bg: 'bg-green-100',
          border: 'border-green-400',
          text: 'text-green-800',
          icon: '✓',
        };
      case 'possible':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-400',
          text: 'text-yellow-800',
          icon: '⚠',
        };
      case 'likely':
        return {
          bg: 'bg-red-100',
          border: 'border-red-400',
          text: 'text-red-800',
          icon: '⚠',
        };
    }
  };

  // Get prediction label text
  const getPredictionLabel = (probability: HolidayProbability) => {
    return t.holiday[probability === 'low-risk' ? 'lowRisk' : probability];
  };

  if (loading && !holidayPrediction) {
    return (
      <section
        className="bg-white rounded-lg shadow-md p-6"
        aria-label="Holiday prediction"
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

  if (error && !holidayPrediction) {
    return (
      <section
        className="bg-white rounded-lg shadow-md p-6"
        aria-label="Holiday prediction"
      >
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">{t.common.error}</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </section>
    );
  }

  if (!holidayPrediction) {
    return (
      <section
        className="bg-white rounded-lg shadow-md p-6"
        aria-label="Holiday prediction"
      >
        <div className="text-center py-12 text-gray-600">
          {language === 'en'
            ? 'No holiday prediction data available'
            : 'விடுமுறை கணிப்பு தரவு இல்லை'}
        </div>
      </section>
    );
  }

  const predictionStyle = getPredictionStyle(holidayPrediction.probability);
  const predictionLabel = getPredictionLabel(holidayPrediction.probability);

  return (
    <section
      className="bg-white rounded-lg shadow-md p-6"
      aria-label="Holiday prediction"
    >
      {/* Header with title and data freshness */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {t.holiday.title}
          </h2>
          
          {/* Data freshness indicator */}
          <DetailedDataFreshnessIndicator cacheKey="holiday" />
        </div>
      </div>

      {/* Prediction display */}
      <div className="space-y-6">
        {/* Main prediction label */}
        <div
          className={`flex items-center justify-between p-6 rounded-lg border-2 ${predictionStyle.bg} ${predictionStyle.border}`}
          role="status"
          aria-label={`Holiday prediction: ${predictionLabel}`}
        >
          <div className="flex items-center gap-4">
            <span
              className={`text-4xl ${predictionStyle.text}`}
              aria-hidden="true"
            >
              {predictionStyle.icon}
            </span>
            <div>
              <div className={`text-2xl font-bold ${predictionStyle.text}`}>
                {predictionLabel}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {language === 'en'
                  ? 'School/College Holiday Likelihood'
                  : 'பள்ளி/கல்லூரி விடுமுறை வாய்ப்பு'}
              </div>
            </div>
          </div>

          {/* Confidence level */}
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">
              {t.holiday.confidence}
            </div>
            <div className={`text-3xl font-bold ${predictionStyle.text}`}>
              {holidayPrediction.confidence}%
            </div>
          </div>
        </div>

        {/* Contributing factors */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'en' ? 'Contributing Factors' : 'பங்களிக்கும் காரணிகள்'}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Rainfall intensity */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">
                {language === 'en' ? 'Rainfall Intensity' : 'மழை தீவிரம்'}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {holidayPrediction.factors.rainfallIntensity} mm
              </div>
            </div>

            {/* Wind speed */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">
                {language === 'en' ? 'Wind Speed' : 'காற்றின் வேகம்'}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {holidayPrediction.factors.windSpeed} km/h
              </div>
            </div>

            {/* Alert level */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">
                {language === 'en' ? 'Alert Level' : 'எச்சரிக்கை நிலை'}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {holidayPrediction.factors.alertLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Prediction date */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {language === 'en' ? 'Prediction for:' : 'கணிப்பு தேதி:'}
            </span>{' '}
            {new Date(holidayPrediction.date).toLocaleDateString(
              language === 'en' ? 'en-IN' : 'ta-IN',
              {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
