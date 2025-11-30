import { useState } from 'react';
import { useLanguage } from '../../contexts';
import { storageManager } from '../../services/storage';

export function Footer() {
  const { language, t } = useLanguage();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Handle clear all data
  const handleClearAllData = () => {
    if (
      window.confirm(
        language === 'en'
          ? 'Are you sure you want to clear all locally stored data? This will remove saved routes, checklist progress, and preferences.'
          : 'உள்ளூரில் சேமிக்கப்பட்ட அனைத்து தரவையும் அழிக்க விரும்புகிறீர்களா? இது சேமிக்கப்பட்ட வழிகள், சரிபார்ப்பு பட்டியல் முன்னேற்றம் மற்றும் விருப்பத்தேர்வுகளை அகற்றும்.'
      )
    ) {
      storageManager.clearAll();
      window.location.reload();
    }
  };

  // Get current year
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-12">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
          {/* Data Sources Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {language === 'en' ? 'Data Sources' : 'தரவு மூலங்கள்'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">
                  {language === 'en' ? 'Cyclone Data' : 'சூறாவளி தரவு'}
                </p>
                <p>
                  {language === 'en'
                    ? 'India Meteorological Department (IMD)'
                    : 'இந்திய வானிலை ஆய்வு மையம் (IMD)'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {language === 'en' ? 'District Information' : 'மாவட்ட தகவல்'}
                </p>
                <p>
                  {language === 'en'
                    ? 'Tamil Nadu State Disaster Management Authority'
                    : 'தமிழ்நாடு மாநில பேரிடர் மேலாண்மை ஆணையம்'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {language === 'en' ? 'Government Alerts' : 'அரசு எச்சரிக்கைகள்'}
                </p>
                <p>
                  {language === 'en'
                    ? 'Tamil Nadu Government & IMD'
                    : 'தமிழ்நாடு அரசு & IMD'}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Notice Section */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">
                🔒
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {t.footer.privacyNotice}
                </h3>
                <p className="text-xs text-gray-700 mb-3">
                  {language === 'en'
                    ? 'This dashboard stores data locally on your device only. No personal information is collected or transmitted to external servers. Stored data includes: saved routes, checklist progress, and language preferences.'
                    : 'இந்த டாஷ்போர்டு தரவை உங்கள் சாதனத்தில் மட்டுமே உள்ளூரில் சேமிக்கிறது. எந்த தனிப்பட்ட தகவலும் சேகரிக்கப்படவில்லை அல்லது வெளிப்புற சேவையகங்களுக்கு அனுப்பப்படவில்லை. சேமிக்கப்பட்ட தரவு: சேமிக்கப்பட்ட வழிகள், சரிபார்ப்பு பட்டியல் முன்னேற்றம் மற்றும் மொழி விருப்பத்தேர்வுகள்.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-xs text-blue-700 hover:text-blue-900 underline font-medium"
                  >
                    {language === 'en' ? 'View Privacy Policy' : 'தனியுரிமை கொள்கையைக் காண்க'}
                  </button>
                  <button
                    onClick={handleClearAllData}
                    className="text-xs text-red-600 hover:text-red-800 underline font-medium"
                  >
                    {t.footer.clearAllData}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mb-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-xs text-gray-700">
              <span className="font-semibold">
                {language === 'en' ? 'Disclaimer:' : 'மறுப்பு:'}
              </span>{' '}
              {language === 'en'
                ? 'This dashboard provides information for awareness purposes only. Always follow official government advisories and evacuation orders. In case of emergency, contact local authorities immediately.'
                : 'இந்த டாஷ்போர்டு விழிப்புணர்வு நோக்கங்களுக்காக மட்டுமே தகவல்களை வழங்குகிறது. எப்போதும் அதிகாரப்பூர்வ அரசாங்க ஆலோசனைகள் மற்றும் வெளியேற்ற உத்தரவுகளைப் பின்பற்றவும். அவசரநிலையில், உடனடியாக உள்ளூர் அதிகாரிகளைத் தொடர்பு கொள்ளவும்.'}
            </p>
          </div>

          {/* Emergency Contacts */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {language === 'en' ? 'Emergency Contacts' : 'அவசர தொடர்புகள்'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-semibold text-gray-900">
                  {language === 'en' ? 'Police' : 'காவல்துறை'}
                </p>
                <p className="text-blue-600 font-bold">100</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-semibold text-gray-900">
                  {language === 'en' ? 'Fire' : 'தீயணைப்பு'}
                </p>
                <p className="text-blue-600 font-bold">101</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-semibold text-gray-900">
                  {language === 'en' ? 'Ambulance' : 'ஆம்புலன்ஸ்'}
                </p>
                <p className="text-blue-600 font-bold">108</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-semibold text-gray-900">
                  {language === 'en' ? 'Disaster' : 'பேரிடர்'}
                </p>
                <p className="text-blue-600 font-bold">1070</p>
              </div>
            </div>
          </div>

          {/* Copyright and Links */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-600">
              <p>
                © {currentYear}{' '}
                {language === 'en'
                  ? 'Cyclone Awareness Dashboard. All rights reserved.'
                  : 'சூறாவளி விழிப்புணர்வு டாஷ்போர்டு. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'}
              </p>
              <div className="flex gap-4">
                <a
                  href="https://mausam.imd.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 underline"
                >
                  IMD
                </a>
                <a
                  href="https://www.tn.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 underline"
                >
                  {language === 'en' ? 'TN Govt' : 'TN அரசு'}
                </a>
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-blue-600 underline"
                >
                  {language === 'en' ? 'Privacy' : 'தனியுரிமை'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPrivacyModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 id="privacy-modal-title" className="text-xl font-bold text-gray-900">
                  {language === 'en' ? 'Privacy Policy' : 'தனியுரிமை கொள்கை'}
                </h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                  aria-label={language === 'en' ? 'Close' : 'மூடு'}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-700">
                <section>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {language === 'en' ? 'Data Collection' : 'தரவு சேகரிப்பு'}
                  </h3>
                  <p>
                    {language === 'en'
                      ? 'This dashboard does not collect any personally identifiable information (PII). All data is stored locally on your device using browser Local Storage.'
                      : 'இந்த டாஷ்போர்டு எந்த தனிப்பட்ட அடையாளம் காணக்கூடிய தகவலையும் (PII) சேகரிக்கவில்லை. அனைத்து தரவும் உலாவி உள்ளூர் சேமிப்பகத்தைப் பயன்படுத்தி உங்கள் சாதனத்தில் உள்ளூரில் சேமிக்கப்படுகிறது.'}
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {language === 'en' ? 'Stored Data' : 'சேமிக்கப்பட்ட தரவு'}
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{language === 'en' ? 'Saved travel routes' : 'சேமிக்கப்பட்ட பயண வழிகள்'}</li>
                    <li>
                      {language === 'en'
                        ? 'Preparation checklist progress'
                        : 'தயாரிப்பு சரிபார்ப்பு பட்டியல் முன்னேற்றம்'}
                    </li>
                    <li>{language === 'en' ? 'Language preference' : 'மொழி விருப்பத்தேர்வு'}</li>
                    <li>{language === 'en' ? 'Last viewed cyclone ID' : 'கடைசியாக பார்த்த சூறாவளி ID'}</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {language === 'en' ? 'Data Retention' : 'தரவு தக்கவைப்பு'}
                  </h3>
                  <p>
                    {language === 'en'
                      ? 'Data older than 30 days is automatically removed. You can manually clear all data at any time using the "Clear All Data" button.'
                      : '30 நாட்களுக்கு மேல் பழமையான தரவு தானாகவே அகற்றப்படும். "அனைத்து தரவையும் அழி" பொத்தானைப் பயன்படுத்தி எந்த நேரத்திலும் அனைத்து தரவையும் கைமுறையாக அழிக்கலாம்.'}
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {language === 'en' ? 'Third-Party Services' : 'மூன்றாம் தரப்பு சேவைகள்'}
                  </h3>
                  <p>
                    {language === 'en'
                      ? 'No data is transmitted to third-party servers. The dashboard fetches cyclone data from official government sources (IMD, Tamil Nadu Government) but does not send any user data.'
                      : 'மூன்றாம் தரப்பு சேவையகங்களுக்கு எந்த தரவும் அனுப்பப்படவில்லை. டாஷ்போர்டு அதிகாரப்பூர்வ அரசாங்க மூலங்களிலிருந்து (IMD, தமிழ்நாடு அரசு) சூறாவளி தரவைப் பெறுகிறது ஆனால் எந்த பயனர் தரவையும் அனுப்பவில்லை.'}
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {language === 'en' ? 'Your Rights' : 'உங்கள் உரிமைகள்'}
                  </h3>
                  <p>
                    {language === 'en'
                      ? 'You have full control over your data. You can view, modify, or delete all stored data at any time. Simply clear your browser data or use the "Clear All Data" button.'
                      : 'உங்கள் தரவின் மீது உங்களுக்கு முழு கட்டுப்பாடு உள்ளது. எந்த நேரத்திலும் சேமிக்கப்பட்ட அனைத்து தரவையும் பார்க்கலாம், மாற்றலாம் அல்லது நீக்கலாம். உங்கள் உலாவி தரவை அழிக்கவும் அல்லது "அனைத்து தரவையும் அழி" பொத்தானைப் பயன்படுத்தவும்.'}
                  </p>
                </section>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {language === 'en' ? 'Close' : 'மூடு'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
