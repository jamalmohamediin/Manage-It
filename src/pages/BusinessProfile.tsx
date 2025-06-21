// src/pages/BusinessProfile.tsx
import React, { useEffect, useState } from 'react';
import { useBusinessId } from '../hooks/useBusinessId';
import { getBusinessById } from '../firebase/businesses';
import { useLanguageContext } from '../contexts/LanguageContext';
import { getTranslatedIndustries } from '../utils/industryTranslations';
import { useNavigate } from 'react-router-dom';

const BusinessProfile: React.FC = () => {
  const businessId = useBusinessId();
  const { language } = useLanguageContext();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      getBusinessById(businessId).then((b) => {
        setBusiness(b);
        setLoading(false);
      });
    }
  }, [businessId]);

  if (loading) return <div className="p-4 text-center text-gray-600">Loading profile...</div>;
  if (!business) return <div className="p-4 text-center text-gray-500">No business found</div>;

  const translatedIndustry =
    getTranslatedIndustries(language).find((i) => i.value === business?.industry)?.label ||
    business?.industry ||
    '—';

  const brandColor = business?.brandColor || '#5c3a21';

  return (
    <div className="max-w-3xl p-6 mx-auto space-y-6 shadow-lg bg-white/60 backdrop-blur rounded-2xl">
      {/* Banner */}
      {business.bannerURL && (
        <img
          src={business.bannerURL}
          alt="Banner"
          className="object-cover w-full h-40 rounded-xl shadow border border-[#d7c5b5]"
        />
      )}

      {/* Logo and Name */}
      <div className="flex items-center gap-4 mt-4">
        {business.logoURL && (
          <img
            src={business.logoURL}
            alt="Logo"
            className="object-cover w-20 h-20 rounded-full shadow border border-[#c9b197]"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-[#3b2615]">{business.name}</h1>
          <p className="text-sm italic text-[#5c3a21]">{translatedIndustry}</p>
        </div>
      </div>

      {/* About */}
      <div>
        <h2 className="text-lg font-semibold text-[#3b2615] mb-1">About</h2>
        <p className="text-sm text-[#4a3b2a] whitespace-pre-wrap">{business.about || 'No description provided.'}</p>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-[#3b2615] mb-1">Contact & Links</h2>
        {business.whatsapp && (
          <a
            href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-green-700 hover:underline"
          >
            💬 WhatsApp: {business.whatsapp}
          </a>
        )}
        {business.contactEmail && (
          <a
            href={`mailto:${business.contactEmail}`}
            className="block text-[#5c3a21] hover:underline"
          >
            📧 Email: {business.contactEmail}
          </a>
        )}
        {business.socialHandle && (
          <span className="block text-[#3b2615]">🔗 Social: {business.socialHandle}</span>
        )}
      </div>

      {/* Edit Button */}
      <div className="text-right">
        <button
          onClick={() => navigate('/settings/business')}
          className="px-4 py-2 text-sm font-medium rounded bg-[#5c3a21] text-white hover:bg-[#3b2615]"
        >
          ✏️ Edit Business Info
        </button>
      </div>
    </div>
  );
};

export default BusinessProfile;
