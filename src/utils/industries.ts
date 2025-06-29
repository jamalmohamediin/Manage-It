import { Language } from '../contexts/LanguageContext';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'xh', name: 'isiXhosa' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'sw', name: 'Swahili' },
];

const INDUSTRY_DATA: Record<Language, string[]> = {
  en: [
    'Healthcare',
    'Education',
    'Retail',
    'Construction',
    'Finance',
    'Agriculture',
    'Manufacturing',
    'Tourism',
    'Logistics',
    'Food Services',
    'Cleaning Services',
    'Self-Employed',
    'Beauty & Wellness',
    'Other',
  ],
  xh: [
    'Ezempilo',
    'Imfundo',
    'Urhwebo',
    'Ukwakhiwa',
    'Ezezimali',
    'Ezolimo',
    'Ukwenziwa kwezinto',
    'Uhambo',
    'Ezokuhanjiswa',
    'Iinkonzo zokutya',
    'Ucoceko',
    'Ozenzele umsebenzi',
    'Ubuhle & Nokuphila',
    'Okunye',
  ],
  zu: [
    'Ezempilo',
    'Imfundo',
    'Ezokudayisa',
    'Ukwakhiwa',
    'Ezezimali',
    'Ezolimo',
    'Ukukhiqiza',
    'Ezokuvakasha',
    'Ezokuthutha',
    'Izinsiza zokudla',
    'Izinsiza zokuhlanza',
    'Ozisebenzelayo',
    'Ubuhle & Nokunakekelwa',
    'Okunye',
  ],
  af: [
    'Gesondheid',
    'Onderwys',
    'Kleinhandel',
    'Konstruksie',
    'Finansies',
    'Landbou',
    'Vervaardiging',
    'Toerisme',
    'Logistiek',
    'Voedseldienste',
    'Skoonmaakdienste',
    'Selfstandig',
    'Skoonheid & Welstand',
    'Ander',
  ],
  sw: [
    'Afya',
    'Elimu',
    'Rejareja',
    'Ujenzi',
    'Fedha',
    'Kilimo',
    'Utengenezaji',
    'Utalii',
    'Usafirishaji',
    'Huduma za Chakula',
    'Huduma za Usafi',
    'Mwenye Kazi Binafsi',
    'Urembo & Afya',
    'Nyingine',
  ],
};

export const getTranslatedIndustries = (lang: Language): string[] =>
  INDUSTRY_DATA[lang] ?? INDUSTRY_DATA.en;

