import { useLanguage } from '../../contexts';

interface APIErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
}

/**
 * APIErrorDisplay component
 * Shows user-friendly error messages for API failures
 */
export function APIErrorDisplay({ error, onRetry }: APIErrorDisplayProps) {
  const { language } = useLanguage();

  if (!error) {
    return null;
  }

  const errorMessages = {
    en: {
      title: 'Unable to Load Data',
      description: 'We encountered an issue while fetching the latest cyclone information. You may be seeing cached data.',
      retry: 'Try Again',
      suggestions: 'What you can do:',
      suggestionsList: [
        'Check your internet connection',
        'Wait a moment and try refreshing',
        'The service may be temporarily unavailable',
      ],
    },
    ta: {
      title: 'தரவை ஏற்ற முடியவில்லை',
      description: 'சமீபத்திய சூறாவளி தகவலைப் பெறுவதில் சிக்கல் ஏற்பட்டது. நீங்கள் சேமிக்கப்பட்ட தரவைப் பார்க்கலாம்.',
      retry: 'மீண்டும் முயற்சிக்கவும்',
      suggestions: 'நீங்கள் செய்யக்கூடியவை:',
      suggestionsList: [
        'உங்கள் இணைய இணைப்பைச் சரிபார்க்கவும்',
        'சிறிது நேரம் காத்திருந்து புதுப்பிக்கவும்',
        'சேவை தற்காலிகமாக கிடைக்காமல் இருக்கலாம்',
      ],
    },
  };

  const messages = errorMessages[language];

  return (
    <div
      className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-md mb-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          ⚠️
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            {messages.title}
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            {messages.description}
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors text-sm mb-3"
            >
              {messages.retry}
            </button>
          )}

          <div className="mt-3 pt-3 border-t border-yellow-200">
            <p className="text-sm font-semibold text-yellow-900 mb-2">
              {messages.suggestions}
            </p>
            <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
              {messages.suggestionsList.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
