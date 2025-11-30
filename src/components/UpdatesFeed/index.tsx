import { useMemo, useEffect, useRef } from 'react';
import { useData, useLanguage } from '../../contexts';
import type { Update, UpdateType } from '../../types';
import { DetailedDataFreshnessIndicator } from '../DataFreshnessIndicator';

interface UpdateItemProps {
  update: Update;
  language: 'en' | 'ta';
  translations: any;
}

function UpdateItem({ update, language, translations }: UpdateItemProps) {
  // Get update type badge styling
  const getTypeBadge = (type: UpdateType) => {
    switch (type) {
      case 'imd-bulletin':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: translations.updates.imdBulletin,
        };
      case 'rainfall-alert':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          label: translations.updates.rainfallAlert,
        };
      case 'govt-announcement':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          label: translations.updates.govtAnnouncement,
        };
      case 'service-advisory':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: translations.updates.serviceAdvisory,
        };
    }
  };

  const badge = getTypeBadge(update.type);

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString(language === 'en' ? 'en-IN' : 'ta-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <article
      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
      aria-label={`Update: ${update.title}`}
    >
      {/* Header with type badge and timestamp */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
        >
          {badge.label}
        </span>
        <time
          className="text-xs text-gray-500 whitespace-nowrap"
          dateTime={new Date(update.timestamp).toISOString()}
        >
          {formatTimestamp(update.timestamp)}
        </time>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {update.title}
      </h3>

      {/* Content */}
      <p className="text-gray-700 text-sm mb-3 whitespace-pre-line">
        {update.content}
      </p>

      {/* Source attribution */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-600">
          <span className="font-medium">
            {language === 'en' ? 'Source:' : 'மூலம்:'}
          </span>{' '}
          {update.source}
        </p>
      </div>
    </article>
  );
}

export function UpdatesFeed() {
  const { updates, loading, error, refreshData } = useData();
  const { language, t } = useLanguage();
  const autoRefreshIntervalRef = useRef<number | null>(null);

  // Sort updates in chronological order (newest first)
  const sortedUpdates = useMemo(() => {
    return [...updates].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [updates]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    autoRefreshIntervalRef.current = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [refreshData]);

  // Handle manual refresh
  const handleRefresh = () => {
    refreshData();
  };

  if (loading && updates.length === 0) {
    return (
      <section
        className="bg-white rounded-lg shadow-md p-6"
        aria-label="Updates feed"
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

  if (error && updates.length === 0) {
    return (
      <section
        className="bg-white rounded-lg shadow-md p-6"
        aria-label="Updates feed"
      >
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">{t.common.error}</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.common.retry}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-white rounded-lg shadow-md p-6"
      aria-label="Updates feed"
      aria-live="polite"
    >
      {/* Header with title and refresh button */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            {t.updates.title}
          </h2>
          
          <div className="flex items-center gap-3">
            {/* Data freshness indicator */}
            <DetailedDataFreshnessIndicator cacheKey="updates" />

            {/* Manual refresh button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              aria-label={t.common.refresh}
            >
              {loading ? '⟳' : '🔄'} {t.common.refresh}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          {language === 'en'
            ? 'Official bulletins, alerts, and announcements'
            : 'அதிகாரப்பூர்வ அறிவிப்புகள், எச்சரிக்கைகள் மற்றும் அறிவிப்புகள்'}
        </p>
      </div>

      {/* Updates list */}
      {sortedUpdates.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          {language === 'en'
            ? 'No updates available at this time'
            : 'இந்த நேரத்தில் புதுப்பிப்புகள் இல்லை'}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedUpdates.map((update) => (
            <UpdateItem
              key={update.id}
              update={update}
              language={language}
              translations={t}
            />
          ))}
        </div>
      )}

      {/* Auto-refresh notice */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {language === 'en'
            ? 'Updates are automatically refreshed every 5 minutes'
            : 'புதுப்பிப்புகள் ஒவ்வொரு 5 நிமிடங்களுக்கும் தானாக புதுப்பிக்கப்படும்'}
        </p>
      </div>
    </section>
  );
}
