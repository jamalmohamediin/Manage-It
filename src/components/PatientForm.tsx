import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { toast } from 'react-hot-toast';
import { uploadFileWithMetadata } from '../firebase/storage';
import { useBusinessContext } from '../contexts/BusinessContext';

interface EmergencyContact {
  name: string;
  phone: string;
}

interface PatientFormType {
  fullName: string;
  gender: string;
  idNumber: string;
  dob: string;
  age: string;
  religion: string;
  medicalAidName: string;
  medicalAidNumber: string;
  medicalAidMainMember: string;
  emergencyContact1: EmergencyContact;
  emergencyContact2: EmergencyContact;
  address: string;
  file?: File;
}

const initialState: PatientFormType = {
  fullName: '',
  gender: '',
  idNumber: '',
  dob: '',
  age: '',
  religion: '',
  medicalAidName: '',
  medicalAidNumber: '',
  medicalAidMainMember: '',
  emergencyContact1: { name: '', phone: '' },
  emergencyContact2: { name: '', phone: '' },
  address: '',
  file: undefined,
};

const PatientForm: React.FC = () => {
  const { businessId } = useBusinessContext();
  const [form, setForm] = useState<PatientFormType>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Retrieve the user's details from local storage
  useEffect(() => {
    localforage.getItem<PatientFormType>('patientForm').then((saved) => {
      if (saved) setForm(saved);
    });
  }, []);

  // Save form data to local storage whenever form changes
  useEffect(() => {
    localforage.setItem('patientForm', form);
  }, [form]);

  const handleInput = (field: keyof PatientFormType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactInput = (
    contact: 'emergencyContact1' | 'emergencyContact2',
    field: keyof EmergencyContact,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [contact]: { ...prev[contact], [field]: value },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setForm((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { file, ...patientData } = form;
      const docRef = await addDoc(collection(db, 'patients'), {
        ...patientData,
        businessId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      if (file) {
        // Pass the uploader name here as the 7th argument (uploaderName)
        const uploader = "Admin";  // You can dynamically set this based on the user context
        await uploadFileWithMetadata(file, docRef.id, businessId, 'Receptionist', 'patients', 'Admin', uploader);  // added uploader as the last argument
        toast.success('File uploaded');
      }

      toast.success('Patient registered!');
      setForm(initialState);
      await localforage.removeItem('patientForm');
    } catch (err) {
      console.error(err);
      toast.error('Failed to register patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-[#3b2615]">Patient Registration</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <input placeholder="Full Name" value={form.fullName} onChange={(e) => handleInput('fullName', e.target.value)} className="p-2 border rounded" required />
        <select value={form.gender} onChange={(e) => handleInput('gender', e.target.value)} className="p-2 border rounded" required>
          <option value="">Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <input placeholder="ID/Passport" value={form.idNumber} onChange={(e) => handleInput('idNumber', e.target.value)} className="p-2 border rounded" required />
        <input type="date" value={form.dob} onChange={(e) => handleInput('dob', e.target.value)} className="p-2 border rounded" required />
        <input type="number" placeholder="Age" value={form.age} onChange={(e) => handleInput('age', e.target.value)} className="p-2 border rounded" />
        <input placeholder="Religion" value={form.religion} onChange={(e) => handleInput('religion', e.target.value)} className="p-2 border rounded" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <input placeholder="Medical Aid Name" value={form.medicalAidName} onChange={(e) => handleInput('medicalAidName', e.target.value)} className="p-2 border rounded" />
        <input placeholder="Medical Aid Number" value={form.medicalAidNumber} onChange={(e) => handleInput('medicalAidNumber', e.target.value)} className="p-2 border rounded" />
        <input placeholder="Main Member" value={form.medicalAidMainMember} onChange={(e) => handleInput('medicalAidMainMember', e.target.value)} className="p-2 border rounded" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input placeholder="Emergency 1 Name" value={form.emergencyContact1.name} onChange={(e) => handleContactInput('emergencyContact1', 'name', e.target.value)} className="p-2 border rounded" required />
        <input placeholder="Emergency 1 Phone" value={form.emergencyContact1.phone} onChange={(e) => handleContactInput('emergencyContact1', 'phone', e.target.value)} className="p-2 border rounded" required />
        <input placeholder="Emergency 2 Name" value={form.emergencyContact2.name} onChange={(e) => handleContactInput('emergencyContact2', 'name', e.target.value)} className="p-2 border rounded" />
        <input placeholder="Emergency 2 Phone" value={form.emergencyContact2.phone} onChange={(e) => handleContactInput('emergencyContact2', 'phone', e.target.value)} className="p-2 border rounded" />
      </div>

      <textarea placeholder="Address" value={form.address} onChange={(e) => handleInput('address', e.target.value)} className="w-full p-2 border rounded" rows={2} required />

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-600">Optional Upload</label>
        <input type="file" onChange={handleFileChange} className="w-full file:py-2 file:px-4 file:rounded file:bg-[#5c3a21] file:text-white file:font-semibold hover:file:bg-[#3b2615]" />
      </div>

      <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-white bg-[#5c3a21] rounded hover:bg-[#3b2615] disabled:opacity-50">
        {isSubmitting ? 'Registering...' : 'Register Patient'}
      </button>
    </form>
  );
};

export default PatientForm;
