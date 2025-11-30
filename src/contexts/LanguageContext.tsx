import { createContext, useContext, useState, ReactNode } from 'react';
import type { Language } from '../types';
import { storageManager } from '../services/storage';
import { translations, type TranslationStrings } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationStrings;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Detect browser language
 * Returns 'ta' if browser language is Tamil, otherwise 'en'
 */
function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  // Check if browser language is Tamil
  if (browserLang && (browserLang.startsWith('ta') || browserLang === 'ta-IN')) {
    return 'ta';
  }

  return 'en';
}

/**
 * LanguageProvider component
 * Manages language state and provides translation functions
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  // Initialize language from Local Storage or browser detection
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = storageManager.getLanguagePreference();
    if (savedLanguage) {
      return savedLanguage;
    }
    return detectBrowserLanguage();
  });

  // Get translations for current language
  const t = translations[language];

  // Update language and persist to Local Storage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storageManager.saveLanguagePreference(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useLanguage hook
 * Provides access to language state and translation functions
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}
