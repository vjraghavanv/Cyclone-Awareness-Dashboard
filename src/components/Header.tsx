import { useLanguage } from '../contexts';
import { LanguageSelector } from './LanguageSelector';
import { SystemStatus } from './SystemStatus';

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title and subtitle */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {t.header.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {t.header.subtitle}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <SystemStatus />
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
