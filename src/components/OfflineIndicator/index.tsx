import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts';

/**
 * OfflineIndicator component
 * Displays a banner when the user is offline
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { language } = useLanguage();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-orange-600 text-white py-3 px-4 shadow-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="container mx-auto flex items-center justify-center gap-3">
        <span className="text-xl" aria-hidden="true">
          📡
        </span>
        <p className="font-semibold text-sm sm:text-base">
          {language === 'en'
            ? '⚠ You are offline. Showing cached data.'
            : '⚠ நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். சேமிக்கப்பட்ட தரவு காட்டப்படுகிறது.'}
        </p>
      </div>
    </div>
  );
}
