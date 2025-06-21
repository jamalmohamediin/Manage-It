// src/utils/industryTranslations.ts
import { industryTranslations, SupportedLanguage } from '../components/TranslatedIndustries';

export const getTranslatedIndustries = (lang: SupportedLanguage) => {
  return Object.entries(industryTranslations).map(([key, translations]) => ({
    value: key,
    label: translations[lang] || translations.en || key
  }));
};

export type { SupportedLanguage };
export { industryTranslations };