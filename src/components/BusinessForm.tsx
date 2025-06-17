// src/components/BusinessForm.tsx
import React, { useState } from 'react';
import { addBusiness } from '../firebase/businesses';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const BusinessForm = () => {
  const [form, setForm] = useState({ name: '', industry: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBusiness({
      ...form,
      createdAt: Timestamp.now(),
    });
    toast.success('Business created!');
    setForm({ name: '', industry: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-[#3b2615]">Create New Business</h2>
      <input
        placeholder="Business Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full px-3 py-2 border rounded"
        required
      />
      <input
        placeholder="Industry (Optional)"
        value={form.industry}
        onChange={(e) => setForm({ ...form, industry: e.target.value })}
        className="w-full px-3 py-2 border rounded"
      />
      <button
        type="submit"
        className="bg-[#5c3a21] text-white px-6 py-2 rounded hover:bg-[#3b2615]"
      >
        Create Business
      </button>
    </form>
  );
};

export default BusinessForm;
