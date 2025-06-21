import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBusinessById } from '../firebase/businesses';
import { getTranslatedIndustries } from '../utils/industryTranslations';
import { useLanguageContext } from '../contexts/LanguageContext';
import { SupportedLanguage } from '../utils/industryTranslations';

const ClientView = () => {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('id');
  const [business, setBusiness] = useState<any>(null);
  const { language } = useLanguageContext();
  const translatedIndustries = getTranslatedIndustries(language as SupportedLanguage);

  useEffect(() => {
    if (businessId) {
      getBusinessById(businessId).then(setBusiness);
    }
  }, [businessId]);

  const translatedIndustry =
    translatedIndustries.find((i) => i.value === business?.industry)?.label || '—';

  if (!business) {
    return <div className="p-6 text-center text-[#5c3a21]">Loading business info...</div>;
  }

  return (
    <div className="max-w-xl p-6 mx-auto mt-8 space-y-6 shadow-xl bg-white/70 backdrop-blur rounded-2xl text-[#3b2615]">
      {/* Logo */}
      {business.logoURL && (
        <div className="flex justify-center">
          <img
            src={business.logoURL}
            alt="Logo"
            className="w-24 h-24 border-4 border-white rounded-full shadow-lg"
          />
        </div>
      )}

      {/* Business Name */}
      <h1 className="text-2xl font-bold text-center">{business.name}</h1>
      <p className="text-center italic text-[#5c3a21]">{translatedIndustry}</p>

      {/* WhatsApp + Contact */}
      <div className="space-y-2 text-center">
        {business.whatsapp && (
          <a
            href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-green-700 hover:underline"
          >
            💬 Chat on WhatsApp
          </a>
        )}
        {business.contactEmail && (
          <a
            href={`mailto:${business.contactEmail}`}
            className="block text-[#5c3a21] hover:underline"
          >
            📧 {business.contactEmail}
          </a>
        )}
      </div>

      {/* Social */}
      {business.socialHandle && (
        <p className="text-center text-[#5c3a21]">🔗 {business.socialHandle}</p>
      )}

      {/* Share Buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `Check out ${business.name} on Manage It: ${window.location.href}`
          )}`}
          target="_blank"
          className="px-4 py-2 text-sm text-white bg-green-600 rounded-full hover:bg-green-700"
        >
          Share on WhatsApp
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            window.location.href
          )}`}
          target="_blank"
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700"
        >
          Share on Facebook
        </a>
      </div>
    </div>
  );
};

export default ClientView;
