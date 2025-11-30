import { useLanguage } from '../contexts';
import type { Language } from '../types';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('ta')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'ta'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Switch to Tamil"
        aria-pressed={language === 'ta'}
      >
        தமிழ்
      </button>
    </div>
  );
}
