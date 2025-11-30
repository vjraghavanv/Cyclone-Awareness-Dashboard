import { useMemo } from 'react';
import { useLanguage } from '../../contexts';
import { cacheManager } from '../../services/cache';

interface DataFreshnessIndicatorProps {
  cacheKey: string;
  fallbackTimestamp?: Date | null;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function DataFreshnessIndicator({
  cacheKey,
  fallbackTimestamp,
  size = 'medium',
  showIcon = true,
  showText = true,
  className = '',
}: DataFreshnessIndicatorProps) {
  const { language, t } = useLanguage();

  // Get data freshness
  const dataFreshness = useMemo(() => {
    const freshness = cacheManager.getFreshness(cacheKey);
    const cacheEntry = cacheManager.get(cacheKey);
    
    if (!cacheEntry) {
      return { 
        indicator: 'fresh', 
        timestamp: fallbackTimestamp || new Date(),
        ageMinutes: 0,
      };
    }

    const ageMinutes = Math.floor((Date.now() - cacheEntry.timestamp.getTime()) / (1000 * 60));
    
    return {
      indicator: freshness,
      timestamp: cacheEntry.timestamp,
      ageMinutes,
    };
  }, [cacheKey, fallbackTimestamp]);

  // Get freshness indicator color
  const getFreshnessColor = (indicator: string) => {
    switch (indicator) {
      case 'fresh':
        return 'text-green-600';
      case 'stale-yellow':
        return 'text-yellow-600';
      case 'stale-orange':
        return 'text-orange-600';
      case 'stale-red':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get freshness indicator background color
  const getFreshnessBackground = (indicator: string) => {
    switch (indicator) {
      case 'fresh':
        return 'bg-green-500';
      case 'stale-yellow':
        return 'bg-yellow-500';
      case 'stale-orange':
        return 'bg-orange-500';
      case 'stale-red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date | null) => {
    if (!timestamp) return '';
    
    const now = Date.now();
    const diff = now - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return language === 'en' ? 'Just now' : 'இப்போதே';
    } else if (minutes < 60) {
      return `${minutes} ${t.common.minutesAgo}`;
    } else if (hours < 24) {
      return `${hours} ${t.common.hoursAgo}`;
    } else {
      return `${days} ${language === 'en' ? 'days ago' : 'நாட்களுக்கு முன்பு'}`;
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          text: 'text-xs',
          dot: 'w-2 h-2',
          gap: 'gap-1',
        };
      case 'large':
        return {
          text: 'text-sm',
          dot: 'w-4 h-4',
          gap: 'gap-3',
        };
      default: // medium
        return {
          text: 'text-xs',
          dot: 'w-3 h-3',
          gap: 'gap-2',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (!dataFreshness.timestamp) {
    return null;
  }

  return (
    <div
      className={`flex items-center ${sizeClasses.gap} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`Data freshness: ${formatTimestamp(dataFreshness.timestamp)}`}
    >
      {/* Freshness indicator dot */}
      {showIcon && (
        <div
          className={`${sizeClasses.dot} rounded-full ${getFreshnessBackground(dataFreshness.indicator)}`}
          aria-hidden="true"
        />
      )}
      
      {/* Freshness text */}
      {showText && (
        <div className={`${sizeClasses.text} ${getFreshnessColor(dataFreshness.indicator)}`}>
          <span className="font-medium">
            {t.common.lastUpdated}: {formatTimestamp(dataFreshness.timestamp)}
          </span>
          
          {/* Stale data warning */}
          {dataFreshness.indicator !== 'fresh' && dataFreshness.ageMinutes > 60 && (
            <div className="text-orange-600 font-semibold mt-1">
              ⚠ {t.common.dataStale}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for headers and small spaces
 */
export function CompactDataFreshnessIndicator({
  cacheKey,
  fallbackTimestamp,
  className = '',
}: Pick<DataFreshnessIndicatorProps, 'cacheKey' | 'fallbackTimestamp' | 'className'>) {
  return (
    <DataFreshnessIndicator
      cacheKey={cacheKey}
      fallbackTimestamp={fallbackTimestamp}
      size="small"
      showIcon={true}
      showText={false}
      className={className}
    />
  );
}

/**
 * Detailed version for main content areas
 */
export function DetailedDataFreshnessIndicator({
  cacheKey,
  fallbackTimestamp,
  className = '',
}: Pick<DataFreshnessIndicatorProps, 'cacheKey' | 'fallbackTimestamp' | 'className'>) {
  return (
    <DataFreshnessIndicator
      cacheKey={cacheKey}
      fallbackTimestamp={fallbackTimestamp}
      size="medium"
      showIcon={true}
      showText={true}
      className={className}
    />
  );
}
