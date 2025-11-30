import type { Language } from '../types';

export interface TranslationStrings {
  header: {
    title: string;
    subtitle: string;
  };
  map: {
    cyclonePath: string;
    impactZone: string;
    districts: string;
  };
  risk: {
    low: string;
    moderate: string;
    high: string;
  };
  severity: {
    yellow: string;
    orange: string;
    red: string;
  };
  holiday: {
    title: string;
    lowRisk: string;
    possible: string;
    likely: string;
    confidence: string;
  };
  travel: {
    title: string;
    source: string;
    destination: string;
    analyze: string;
    safe: string;
    caution: string;
    avoidTravel: string;
  };
  updates: {
    title: string;
    imdBulletin: string;
    rainfallAlert: string;
    govtAnnouncement: string;
    serviceAdvisory: string;
  };
  checklist: {
    title: string;
    water: string;
    power: string;
    emergency: string;
    supplies: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    refresh: string;
    lastUpdated: string;
    minutesAgo: string;
    hoursAgo: string;
    dataStale: string;
    offline: string;
    clearData: string;
  };
  footer: {
    dataSource: string;
    privacyNotice: string;
    clearAllData: string;
  };
}

export const translations: Record<Language, TranslationStrings> = {
  en: {
    header: {
      title: 'Cyclone Awareness Dashboard',
      subtitle: 'Real-time cyclone risk information for Chennai and surrounding districts',
    },
    map: {
      cyclonePath: 'Cyclone Pathway',
      impactZone: 'Impact Zone',
      districts: 'Districts',
    },
    risk: {
      low: 'Low',
      moderate: 'Moderate',
      high: 'High',
    },
    severity: {
      yellow: 'Moderate Risk',
      orange: 'High Risk',
      red: 'Severe Risk',
    },
    holiday: {
      title: 'School/College Holiday Prediction',
      lowRisk: 'Low Risk',
      possible: 'Possible',
      likely: 'Likely',
      confidence: 'Confidence',
    },
    travel: {
      title: 'Travel Route Safety Checker',
      source: 'Source Location',
      destination: 'Destination',
      analyze: 'Analyze Route',
      safe: 'Safe',
      caution: 'Caution',
      avoidTravel: 'Avoid Travel',
    },
    updates: {
      title: 'Latest Updates',
      imdBulletin: 'IMD Bulletin',
      rainfallAlert: 'Rainfall Alert',
      govtAnnouncement: 'Government Announcement',
      serviceAdvisory: 'Service Advisory',
    },
    checklist: {
      title: 'Preparation Checklist',
      water: 'Water Storage',
      power: 'Power Backup',
      emergency: 'Emergency Contacts',
      supplies: 'Essential Supplies',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      refresh: 'Refresh',
      lastUpdated: 'Last updated',
      minutesAgo: 'minutes ago',
      hoursAgo: 'hours ago',
      dataStale: 'Data may be outdated',
      offline: 'Offline - Showing cached data',
      clearData: 'Clear Data',
    },
    footer: {
      dataSource: 'Data Source',
      privacyNotice: 'Privacy Notice: All data is stored locally on your device',
      clearAllData: 'Clear All Data',
    },
  },
  ta: {
    header: {
      title: 'சூறாவளி விழிப்புணர்வு டாஷ்போர்டு',
      subtitle: 'சென்னை மற்றும் சுற்றியுள்ள மாவட்டங்களுக்கான நேரடி சூறாவளி அபாய தகவல்',
    },
    map: {
      cyclonePath: 'சூறாவளி பாதை',
      impactZone: 'தாக்க பகுதி',
      districts: 'மாவட்டங்கள்',
    },
    risk: {
      low: 'குறைவு',
      moderate: 'மிதமான',
      high: 'அதிக',
    },
    severity: {
      yellow: 'மிதமான ஆபத்து',
      orange: 'அதிக ஆபத்து',
      red: 'கடுமையான ஆபத்து',
    },
    holiday: {
      title: 'பள்ளி/கல்லூரி விடுமுறை கணிப்பு',
      lowRisk: 'குறைந்த ஆபத்து',
      possible: 'சாத்தியம்',
      likely: 'வாய்ப்புள்ளது',
      confidence: 'நம்பிக்கை',
    },
    travel: {
      title: 'பயண வழி பாதுகாப்பு சரிபார்ப்பு',
      source: 'தொடக்க இடம்',
      destination: 'இலக்கு',
      analyze: 'வழியை பகுப்பாய்வு செய்',
      safe: 'பாதுகாப்பானது',
      caution: 'எச்சரிக்கை',
      avoidTravel: 'பயணத்தை தவிர்க்கவும்',
    },
    updates: {
      title: 'சமீபத்திய புதுப்பிப்புகள்',
      imdBulletin: 'IMD அறிவிப்பு',
      rainfallAlert: 'மழை எச்சரிக்கை',
      govtAnnouncement: 'அரசு அறிவிப்பு',
      serviceAdvisory: 'சேவை ஆலோசனை',
    },
    checklist: {
      title: 'தயாரிப்பு சரிபார்ப்பு பட்டியல்',
      water: 'நீர் சேமிப்பு',
      power: 'மின் காப்பு',
      emergency: 'அவசர தொடர்புகள்',
      supplies: 'அத்தியாவசிய பொருட்கள்',
    },
    common: {
      loading: 'ஏற்றுகிறது...',
      error: 'பிழை',
      retry: 'மீண்டும் முயற்சிக்கவும்',
      refresh: 'புதுப்பிக்கவும்',
      lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
      minutesAgo: 'நிமிடங்களுக்கு முன்',
      hoursAgo: 'மணிநேரங்களுக்கு முன்',
      dataStale: 'தரவு காலாவதியானதாக இருக்கலாம்',
      offline: 'ஆஃப்லைன் - சேமிக்கப்பட்ட தரவு காட்டப்படுகிறது',
      clearData: 'தரவை அழி',
    },
    footer: {
      dataSource: 'தரவு மூலம்',
      privacyNotice: 'தனியுரிமை அறிவிப்பு: அனைத்து தரவும் உங்கள் சாதனத்தில் உள்ளூரில் சேமிக்கப்படுகிறது',
      clearAllData: 'அனைத்து தரவையும் அழி',
    },
  },
};

export function getTranslations(language: Language): TranslationStrings {
  return translations[language];
}
