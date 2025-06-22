// src/components/BusinessForm.tsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { storage } from '../firebase/firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addBusiness } from '../firebase/businesses';
import ImageCropperModal from './ImageCropperModal';

const BusinessForm = () => {
  const [form, setForm] = useState({ name: '', industry: '', about: '', logoURL: '', bannerURL: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [croppingOpen, setCroppingOpen] = useState(false);
  const [imageForCropping, setImageForCropping] = useState<string | null>(null);

  const handleBannerPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBannerFile(file);
  };

  const onLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageForCropping(reader.result as string);
        setCroppingOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async (file: Blob, path: string) => {
    const imageRef = ref(storage, path);
    const snapshot = await uploadBytes(imageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let logoURL = '';
      let bannerURL = '';

      if (logoFile) {
        logoURL = await uploadImageToStorage(logoFile, `businesses/logos/logo_${Date.now()}.jpg`);
      }
      if (bannerFile) {
        bannerURL = await uploadImageToStorage(bannerFile, `businesses/banners/banner_${Date.now()}_${bannerFile.name}`);
      }

      await addBusiness({
        name: form.name,
        industry: form.industry || '',
        about: form.about || '',
        ...(logoURL && { logoURL }),
        ...(bannerURL && { bannerURL }),
      });

      toast.success('Business created!');
      setForm({ name: '', industry: '', about: '', logoURL: '', bannerURL: '' });
      setLogoFile(null);
      setBannerFile(null);
    } catch (err) {
      toast.error('Failed to create business');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl p-6 mx-auto space-y-5 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold text-brown-700">Create New Business</h2>

      <input
        placeholder="Business Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full px-3 py-2 border rounded bg-gray-50"
        required
      />

      <input
        placeholder="Industry (Optional)"
        value={form.industry}
        onChange={(e) => setForm({ ...form, industry: e.target.value })}
        className="w-full px-3 py-2 border rounded bg-gray-50"
      />

      <textarea
        placeholder="About the business..."
        value={form.about}
        onChange={(e) => setForm({ ...form, about: e.target.value })}
        className="w-full px-3 py-2 border rounded bg-gray-50 h-28"
      />

      <label className="block text-sm font-medium text-brown-700">Upload Logo (Crop will open)</label>
      <input type="file" accept="image/*" onChange={onLogoSelected} className="w-full px-3 py-2 border rounded bg-gray-50" />

      <label className="block mt-4 text-sm font-medium text-brown-700">Upload Banner</label>
      <input type="file" accept="image/*" onChange={handleBannerPreview} className="w-full px-3 py-2 border rounded bg-gray-50" />

      {bannerFile && (
        <img src={URL.createObjectURL(bannerFile)} className="object-cover mt-2 rounded shadow max-h-48" alt="Banner Preview" />
      )}

      <button
        type="submit"
        disabled={uploading}
        className="w-full px-4 py-2 font-semibold text-white transition bg-yellow-700 rounded-lg hover:bg-yellow-800 disabled:opacity-60"
      >
        {uploading ? 'Creating...' : 'Create Business'}
      </button>

      {croppingOpen && imageForCropping && (
        <ImageCropperModal
          imageSrc={imageForCropping}
          onCancel={() => setCroppingOpen(false)}
          onCropComplete={(blob) => {
            const newFile = new File([blob], `cropped-logo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setLogoFile(newFile);
            setCroppingOpen(false);
          }}
        />
      )}
    </form>
  );
};

export default BusinessForm;
