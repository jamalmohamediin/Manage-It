import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBusinessById, Business } from '../firebase/businesses';
import { useLanguageContext } from '../contexts/LanguageContext';
import { getTranslatedIndustries, SupportedLanguage } from '../utils/industryTranslations';

interface ExtendedBusiness extends Business {
  contactEmail?: string;
  socialHandle?: string;
}

const PublicLanding: React.FC = () => {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('id');
  const [business, setBusiness] = useState<ExtendedBusiness | null>(null);

  const { language, setLanguage } = useLanguageContext();
  const translatedIndustries = getTranslatedIndustries(language as SupportedLanguage);

  useEffect(() => {
    if (businessId) {
      getBusinessById(businessId).then(b => setBusiness(b as ExtendedBusiness));
    }
  }, [businessId]);

  const translatedIndustry =
    translatedIndustries.find(opt => opt.value === business?.industry)?.label ||
    'Unknown';

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 space-y-6 bg-white/70 backdrop-blur rounded-2xl shadow-xl text-[#3b2615]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-brown-700">About this Business</h1>
        <div className="flex gap-2">
          {['en', 'xh', 'zu', 'af', 'sw'].map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang as SupportedLanguage)}
              className={`px-3 py-1 rounded-full border text-sm font-semibold transition ${
                language === lang
                  ? 'bg-brown-700 text-white'
                  : 'bg-gray-50 text-brown-700 hover:bg-cream-100'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {business ? (
        <div className="space-y-6">
          {/* Banner */}
          {business.bannerURL && (
            <div className="w-full">
              <img
                src={business.bannerURL}
                alt="Business Banner"
                className="object-cover w-full shadow max-h-64 rounded-xl"
              />
            </div>
          )}

          {/* Logo */}
          {business.logoURL && (
            <div className="flex justify-center -mt-12">
              <img
                src={business.logoURL}
                alt="Business Logo"
                className="object-cover w-24 h-24 border-4 border-white rounded-full shadow-lg"
              />
            </div>
          )}

          {/* Name & Industry */}
          <h2 className="text-2xl font-semibold text-center text-brown-700">
            {business.name}
          </h2>
          <p className="text-center italic font-medium text-[#5c3a21]">
            {translatedIndustry}
          </p>

          {/* Description */}
          {business.about && (
            <div>
              <h3 className="mb-2 text-lg font-semibold text-brown-700">Description</h3>
              <p className="text-[#3b2615]/80">{business.about}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2 text-[#3b2615]/90">
            {business.contactEmail && (
              <p>
                📧 Email:{' '}
                <a
                  href={`mailto:${business.contactEmail}`}
                  className="underline text-[#5c3a21]"
                >
                  {business.contactEmail}
                </a>
              </p>
            )}
            {business.whatsapp && (
              <p>
                💬 WhatsApp:{' '}
                <a
                  href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 underline"
                >
                  Chat on WhatsApp
                </a>
              </p>
            )}
            {business.socialHandle && (
              <p>
                📱 Social:{' '}
                <a
                  href={`https://instagram.com/${business.socialHandle.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {business.socialHandle}
                </a>
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="italic text-center text-gray-500">
          Loading business information...
        </p>
      )}
    </div>
  );
};

export default PublicLanding;
