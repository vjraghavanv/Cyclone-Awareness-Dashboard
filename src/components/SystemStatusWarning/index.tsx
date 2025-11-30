import { useData } from '../../contexts';
import { useLanguage } from '../../contexts';

/**
 * SystemStatusWarning component
 * Displays warnings when multiple API endpoints fail
 */
export function SystemStatusWarning() {
  const { healthStatus } = useData();
  const { language } = useLanguage();

  // Calculate failed endpoints
  const endpoints = Object.entries(healthStatus);
  const failedEndpoints = endpoints.filter(([_, healthy]) => !healthy);
  const failureCount = failedEndpoints.length;
  const totalCount = endpoints.length;

  // Only show warning if multiple endpoints are failing
  if (failureCount < 2 || totalCount === 0) {
    return null;
  }

  const messages = {
    en: {
      title: 'Service Degradation',
      description: `${failureCount} of ${totalCount} data services are currently unavailable. Some information may be outdated.`,
      failedServices: 'Unavailable services:',
      impact: 'You may experience:',
      impactList: [
        'Delayed or missing updates',
        'Stale data being displayed',
        'Some features may not work',
      ],
    },
    ta: {
      title: 'சேவை குறைபாடு',
      description: `${totalCount} தரவு சேவைகளில் ${failureCount} தற்போது கிடைக்கவில்லை. சில தகவல்கள் காலாவதியானதாக இருக்கலாம்.`,
      failedServices: 'கிடைக்காத சேவைகள்:',
      impact: 'நீங்கள் அனுபவிக்கலாம்:',
      impactList: [
        'தாமதமான அல்லது காணாமல் போன புதுப்பிப்புகள்',
        'பழைய தரவு காட்டப்படுகிறது',
        'சில அம்சங்கள் வேலை செய்யாமல் இருக்கலாம்',
      ],
    },
  };

  const content = messages[language];

  // Map endpoint names to user-friendly labels
  const endpointLabels: Record<string, { en: string; ta: string }> = {
    '/cyclone/current': { en: 'Cyclone Data', ta: 'சூறாவளி தரவு' },
    '/rainfall/districts': { en: 'Rainfall Data', ta: 'மழை தரவு' },
    '/alerts/govt': { en: 'Government Alerts', ta: 'அரசு எச்சரிக்கைகள்' },
    '/bulletins/imd': { en: 'IMD Bulletins', ta: 'IMD அறிவிப்புகள்' },
    '/holiday/prediction': { en: 'Holiday Prediction', ta: 'விடுமுறை கணிப்பு' },
    '/risk/summary': { en: 'Risk Summary', ta: 'ஆபத்து சுருக்கம்' },
  };

  return (
    <div
      className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md mb-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          🚨
        </span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            {content.title}
          </h3>
          <p className="text-sm text-red-800 mb-3">
            {content.description}
          </p>

          <div className="mb-3">
            <p className="text-sm font-semibold text-red-900 mb-1">
              {content.failedServices}
            </p>
            <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
              {failedEndpoints.map(([endpoint]) => (
                <li key={endpoint}>
                  {endpointLabels[endpoint]?.[language] || endpoint}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 border-t border-red-200">
            <p className="text-sm font-semibold text-red-900 mb-1">
              {content.impact}
            </p>
            <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
              {content.impactList.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
