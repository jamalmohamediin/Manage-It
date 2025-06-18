// src/components/AppointmentForm.tsx
import React, { useState, useEffect } from 'react';
import { addAppointment } from '../firebase/appointments';
import { getPatients, Patient } from '../firebase/patients'; // assumes patient logic is in its own file
import { toast } from 'react-hot-toast';

const AppointmentForm: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState({
    patientId: '',
    businessId: '', // fill with dropdown/context later
    reason: '',
    date: '',
    time: '',
  });

  useEffect(() => {
    const loadPatients = async () => {
      const data = await getPatients();
      setPatients(data);
    };
    loadPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAppointment(form);
      toast.success('Appointment booked!');
      setForm({ patientId: '', businessId: '', reason: '', date: '', time: '' });
    } catch (err) {
      toast.error('Booking failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold text-[#3b2615]">Book Appointment</h3>

      <select
        value={form.patientId}
        onChange={(e) => setForm({ ...form, patientId: e.target.value })}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Patient</option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>{p.fullName}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Business ID"
        value={form.businessId}
        onChange={(e) => setForm({ ...form, businessId: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Reason"
        value={form.reason}
        onChange={(e) => setForm({ ...form, reason: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <input
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <input
        type="time"
        value={form.time}
        onChange={(e) => setForm({ ...form, time: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <button type="submit" className="px-4 py-2 bg-[#3b2615] text-white rounded">
        Book
      </button>
    </form>
  );
};

export default AppointmentForm;
