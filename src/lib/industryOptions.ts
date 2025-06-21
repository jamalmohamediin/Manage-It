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
  "Other": { 
    en: "Other",
    xh: "Okunye", 
    zu: "Okunye", 
    af: "Ander", 
    sw: "Nyingine" 
  },
  // Add more industries as needed...
};

export const getTranslatedIndustries = (lang: SupportedLanguage) => {
  return Object.entries(industryTranslations).map(([key, translations]) => ({
    value: key,
    label: translations[lang] || translations.en || key
  }));
};