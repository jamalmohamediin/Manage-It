// src/PatientForm.tsx
import React, { useState } from "react";
import { db } from "./firebase-config";
import { collection, addDoc } from "firebase/firestore";

const PatientForm = () => {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    age: "",
    gender: "",
    address: "",
    medicalAidName: "",
    medicalAidNumber: "",
    emergencyContact: "",
    allergies: "",
    comorbidities: "",
    email: "",
    idNumber: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName) {
      alert("Full name is required.");
      return;
    }

    try {
      await addDoc(collection(db, "patients"), form);
      alert("Patient registered!");
      setForm({
        fullName: "",
        phoneNumber: "",
        age: "",
        gender: "",
        address: "",
        medicalAidName: "",
        medicalAidNumber: "",
        emergencyContact: "",
        allergies: "",
        comorbidities: "",
        email: "",
        idNumber: ""
      });
    } catch (error) {
      alert("Error saving patient: " + error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Patient Registration</h2>

      <input type="text" name="fullName" placeholder="Full Name *" value={form.fullName} onChange={handleChange} className="w-full border p-2 rounded" required />
      <input type="text" name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} className="w-full border p-2 rounded" />
      <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} className="w-full border p-2 rounded" />

      <select name="gender" value={form.gender} onChange={handleChange} className="w-full border p-2 rounded">
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <input type="text" name="address" placeholder="Home Address" value={form.address} onChange={handleChange} className="w-full border p-2 rounded" />
      <input type="text" name="medicalAidName" placeholder="Medical Aid Name" value={form.medicalAidName} onChange={handleChange} className="w-full border p-2 rounded" />
      <input type="text" name="medicalAidNumber" placeholder="Medical Aid Number" value={form.medicalAidNumber} onChange={handleChange} className="w-full border p-2 rounded" />
      <input type="text" name="emergencyContact" placeholder="Emergency Contact" value={form.emergencyContact} onChange={handleChange} className="w-full border p-2 rounded" />
      <input type="text" name="allergies" placeholder="Allergies" value={form.allergies} onChange={handleChange} className="w-full border p-2 rounded" />
      <input type="text" name="comorbidities" placeholder="Comorbidities" value={form.comorbidities} onChange={handleChange} className="w-full border p-2 rounded" />
      <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" />
      <input type="text" name="idNumber" placeholder="ID or Passport Number" value={form.idNumber} onChange={handleChange} className="w-full border p-2 rounded" />

      <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700">
        Register Patient
      </button>
    </form>
  );
};

export default PatientForm;