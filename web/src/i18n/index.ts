import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { ru } from './locales/ru';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, ru },
    supportedLngs: ['ru', 'en'],
    fallbackLng: 'en',
    load: 'languageOnly',
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'zepp-devices-language',
    },
  });

export default i18n;
