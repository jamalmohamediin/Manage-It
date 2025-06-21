// src/components/TranslatedIndustries.tsx
export type SupportedLanguage = 'en' | 'xh' | 'zu' | 'af' | 'sw';

export interface IndustryTranslations {
  en: string;
  xh: string;
  zu: string;
  af: string;
  sw: string;
}

export const industryTranslations: Record<string, IndustryTranslations> = {
  "Agriculture": { 
    en: "Agriculture",
    xh: "Ezolimo", 
    zu: "Ezolimo", 
    af: "Landbou", 
    sw: "Kilimo" 
  },
  "Beauty & Personal Care (Salon, Barber, Nails)": { 
    en: "Beauty & Personal Care (Salon, Barber, Nails)",
    xh: "Ubuhle & Inkathalo", 
    zu: "Ubuhle & Inakekelo", 
    af: "Skoonheid & Sorg", 
    sw: "Urembo & Huduma" 
  },
  "Retail (Shop, Spaza, Tuckshop, Market Stall)": { 
    en: "Retail (Shop, Spaza, Tuckshop, Market Stall)",
    xh: "Ivenkile", 
    zu: "Isitolo", 
    af: "Kleinhandel", 
    sw: "Uuzaji wa Rejareja" 
  },
  "Food & Beverage": {
    en: "Food & Beverage",
    xh: "Ukutya & Isiselo",
    zu: "Ukudla & Iziphuzo",
    af: "Kos & Drank",
    sw: "Chakula & Vinywaji"
  },
  "Construction": {
    en: "Construction",
    xh: "Ukwakha",
    zu: "Ukwakha",
    af: "Konstruksie",
    sw: "Ujenzi"
  },
  "Technology": {
    en: "Technology",
    xh: "Iteknoloji",
    zu: "Ubuchwepheshe",
    af: "Tegnologie",
    sw: "Teknolojia"
  },
  "Healthcare": {
    en: "Healthcare",
    xh: "Ukhathalelo lwempilo",
    zu: "Ukunakekelwa kwezempilo",
    af: "Gesondheidsorg",
    sw: "Huduma za Afya"
  },
  "Education": {
    en: "Education",
    xh: "Imfundo",
    zu: "Imfundo",
    af: "Onderwys",
    sw: "Elimu"
  },
  "Transportation": {
    en: "Transportation",
    xh: "Ezothutho",
    zu: "Ezokuthutha",
    af: "Vervoer",
    sw: "Usafiri"
  },
  "Other": { 
    en: "Other",
    xh: "Okunye", 
    zu: "Okunye", 
    af: "Ander", 
    sw: "Nyingine" 
  }
};

export const getTranslatedIndustries = (lang: SupportedLanguage) => {
  return Object.entries(industryTranslations).map(([key, translations]) => ({
    value: key,
    label: translations[lang] || translations.en || key
  }));
};