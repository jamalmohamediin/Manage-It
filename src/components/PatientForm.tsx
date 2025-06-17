import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from './firebase-config';
import { toast } from 'react-hot-toast';

type PatientFormType = {
  title: string;
  fullName: string;
  gender: string;
  idNumber: string;
  dob: string;
  age: string;
  religion: string;
  comorbidities: string[];
  allergies: {
    medication: string[];
    food: string[];
    latex: boolean;
    otherMedication: string;
    otherFood: string;
  };
  medicalAidName: string;
  medicalAidNumber: string;
  medicalAidMainMember: string;
  emergencyContact1: { name: string; phone: string };
  emergencyContact2: { name: string; phone: string };
  address: string;
};

const initialState: PatientFormType = {
  title: '',
  fullName: '',
  gender: '',
  idNumber: '',
  dob: '',
  age: '',
  religion: '',
  comorbidities: [],
  allergies: {
    medication: [],
    food: [],
    latex: false,
    otherMedication: '',
    otherFood: '',
  },
  medicalAidName: '',
  medicalAidNumber: '',
  medicalAidMainMember: '',
  emergencyContact1: { name: '', phone: '' },
  emergencyContact2: { name: '', phone: '' },
  address: '',
};

const PatientForm: React.FC = () => {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    localforage.getItem<PatientFormType>('patientForm').then((saved) => {
      if (saved) setForm(saved);
    });
  }, []);

  useEffect(() => {
    localforage.setItem('patientForm', form);
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'patients'), {
        ...form,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      toast.success('Patient registered!');
      setForm(initialState);
      await localforage.removeItem('patientForm');
    } catch (error) {
      toast.error('Registration failed!');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-[#3b2615]">Patient Registration</h2>

      <div className="grid grid-cols-3 gap-4">
        <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="p-2 border rounded" />
        <input placeholder="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="p-2 border rounded" />
        <input placeholder="ID/Passport" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} className="p-2 border rounded" />
        <input placeholder="Date of Birth" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="p-2 border rounded" />
        <input placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="p-2 border rounded" />
        <input placeholder="Religion" value={form.religion} onChange={(e) => setForm({ ...form, religion: e.target.value })} className="p-2 border rounded" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <input placeholder="Medical Aid Name" value={form.medicalAidName} onChange={(e) => setForm({ ...form, medicalAidName: e.target.value })} className="p-2 border rounded" />
        <input placeholder="Medical Aid Number" value={form.medicalAidNumber} onChange={(e) => setForm({ ...form, medicalAidNumber: e.target.value })} className="p-2 border rounded" />
        <input placeholder="Main Member" value={form.medicalAidMainMember} onChange={(e) => setForm({ ...form, medicalAidMainMember: e.target.value })} className="p-2 border rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Emergency Contact 1 Name" value={form.emergencyContact1.name} onChange={(e) => setForm({ ...form, emergencyContact1: { ...form.emergencyContact1, name: e.target.value } })} className="p-2 border rounded" />
        <input placeholder="Emergency Contact 1 Number" value={form.emergencyContact1.phone} onChange={(e) => setForm({ ...form, emergencyContact1: { ...form.emergencyContact1, phone: e.target.value } })} className="p-2 border rounded" />
        <input placeholder="Emergency Contact 2 Name" value={form.emergencyContact2.name} onChange={(e) => setForm({ ...form, emergencyContact2: { ...form.emergencyContact2, name: e.target.value } })} className="p-2 border rounded" />
        <input placeholder="Emergency Contact 2 Number" value={form.emergencyContact2.phone} onChange={(e) => setForm({ ...form, emergencyContact2: { ...form.emergencyContact2, phone: e.target.value } })} className="p-2 border rounded" />
      </div>

      <textarea placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full p-2 border rounded" />

      <button type="submit" className="px-6 py-2 text-white bg-[#5c3a21] rounded hover:bg-[#3b2615]">
        Register
      </button>
    </form>
  );
};

export default PatientForm;
