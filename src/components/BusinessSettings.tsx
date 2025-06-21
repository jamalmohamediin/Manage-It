// src/components/BusinessSettings.tsx
import React, { useEffect, useState } from 'react';
import { getBusinessById, updateBusiness } from '../firebase/businesses';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useLanguageContext } from '../contexts/LanguageContext';
import { toast } from 'react-hot-toast';
import { storage } from '../firebase/firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ImageCropperModal from './ImageCropperModal';
import { getTranslatedIndustries, SupportedLanguage } from '../utils/industryTranslations';

interface IndustryOption {
  value: string;
  label: string;
}

interface BusinessForm {
  name: string;
  industry: string;
  customIndustry: string;
  about: string;
  logoURL?: string;
  bannerURL?: string;
  brandColor: string;
  whatsapp?: string;
  contactEmail?: string;
  socialHandle?: string;
}

const BusinessSettings = () => {
  const { businessId } = useBusinessContext();
  const { language } = useLanguageContext();
  const translatedIndustries = getTranslatedIndustries(language as SupportedLanguage);

  const [form, setForm] = useState<BusinessForm>({
    name: '',
    industry: '',
    customIndustry: '',
    about: '',
    logoURL: undefined,
    bannerURL: undefined,
    brandColor: '#5c3a21',
    whatsapp: '',
    contactEmail: '',
    socialHandle: '',
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [croppingOpen, setCroppingOpen] = useState(false);
  const [imageForCropping, setImageForCropping] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (businessId) {
      getBusinessById(businessId).then((b) => {
        if (b) {
          setForm((prev) => ({
            ...prev,
            name: b.name || '',
            industry: b.industry || '',
            about: b.about || '',
            logoURL: b.logoURL || undefined,
            bannerURL: b.bannerURL || undefined,
            brandColor: b.brandColor || '#5c3a21',
            whatsapp: b.whatsapp || '',
            // Use safe property access with fallback
            contactEmail: (b as any).contactEmail || '',
            socialHandle: (b as any).socialHandle || '',
          }));
        }
      });
    }
  }, [businessId]);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageForCropping(reader.result as string);
      setCroppingOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const uploadToStorage = async (file: Blob, path: string): Promise<string | undefined> => {
    if (!businessId) return;
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSave = async () => {
    try {
      let logoURL = form.logoURL;
      let bannerURL = form.bannerURL;

      const selectedIndustry =
        form.industry === 'Other' ? form.customIndustry.trim() || 'Other' : form.industry;

      if (croppedBlob) {
        logoURL = await uploadToStorage(croppedBlob, `businesses/${businessId}/logo.jpg`);
      }

      if (bannerFile) {
        bannerURL = await uploadToStorage(bannerFile, `businesses/${businessId}/banner.jpg`);
      }

      const updatePayload = {
        name: form.name,
        industry: selectedIndustry,
        about: form.about,
        brandColor: form.brandColor || '#5c3a21',
        whatsapp: form.whatsapp,
        contactEmail: form.contactEmail,
        socialHandle: form.socialHandle,
        ...(logoURL ? { logoURL } : {}),
        ...(bannerURL ? { bannerURL } : {}),
      };

      await updateBusiness(businessId, updatePayload);
      toast.success('Business profile updated!');
    } catch (err: any) {
      console.error('[❌ ERROR] Business update failed:', err);
      toast.error('Update failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="max-w-xl p-6 mx-auto space-y-6 shadow-lg bg-white/60 backdrop-blur rounded-2xl">
      <h2 className="text-2xl font-bold text-[#3b2615] mb-2">Business Settings</h2>

      {/* Logo Upload */}
      <div className="flex items-center gap-4">
        {form.logoURL && (
          <img src={form.logoURL} alt="Logo" className="w-16 h-16 rounded-full shadow object-cover border border-[#c9b197]" />
        )}
        <input type="file" accept="image/*" onChange={handleLogoSelect} className="text-sm" />
      </div>

      {/* Banner Upload */}
      {form.bannerURL && (
        <div className="mt-4">
          <label className="block mb-1 text-sm font-medium">Current Banner</label>
          <img src={form.bannerURL} alt="Banner" className="object-cover w-full rounded shadow max-h-40" />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
        className="mt-2 text-sm"
      />

      {/* Brand Color Picker */}
      <div className="mt-4">
        <label className="block mb-1 text-sm font-medium text-[#3b2615]">
          Brand Color:
          <span className="inline-block w-4 h-4 ml-2 align-middle rounded-full" style={{ backgroundColor: form.brandColor }}></span>
        </label>
        <input
          type="color"
          value={form.brandColor}
          onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
          className="w-24 h-10 p-1 mt-1 border rounded"
        />
      </div>

      <input
        placeholder="Business Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full p-3 border rounded"
      />

      <select
        value={form.industry}
        onChange={(e) => setForm({ ...form, industry: e.target.value, customIndustry: '' })}
        className="w-full p-3 border rounded"
      >
        <option value="">Select Industry</option>
        {translatedIndustries.map((option: IndustryOption) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {form.industry === 'Other' && (
        <input
          placeholder="Type your industry"
          value={form.customIndustry}
          onChange={(e) => setForm({ ...form, customIndustry: e.target.value })}
          className="w-full p-3 mt-2 border rounded"
        />
      )}

      <textarea
        placeholder="About the business..."
        value={form.about}
        onChange={(e) => setForm({ ...form, about: e.target.value })}
        className="w-full h-32 p-3 border rounded"
      />

      {/* Contact Links Section */}
      <input
        placeholder="WhatsApp Number (e.g. +1234567890)"
        value={form.whatsapp}
        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
        className="w-full p-3 border rounded"
      />
      <input
        placeholder="Contact Email"
        type="email"
        value={form.contactEmail}
        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
        className="w-full p-3 border rounded"
      />
      <input
        placeholder="Social Media Handle (e.g. @mybusiness)"
        value={form.socialHandle}
        onChange={(e) => setForm({ ...form, socialHandle: e.target.value })}
        className="w-full p-3 border rounded"
      />

      <button
        onClick={handleSave}
        className="px-6 py-2 rounded bg-[#5c3a21] text-white hover:bg-[#3b2615]"
      >
        Save Changes
      </button>

      {croppingOpen && imageForCropping && (
        <ImageCropperModal
          imageSrc={imageForCropping}
          onCancel={() => setCroppingOpen(false)}
          onCropComplete={async (blob) => {
            setCroppedBlob(blob);
            setCroppingOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default BusinessSettings;