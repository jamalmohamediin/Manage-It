import React, { useEffect, useState } from 'react';
import { addAppointment } from '../firebase/appointments';
import { getPatients } from '../firebase/patients';
import { useBusinessId } from '../hooks/useBusinessId';
import localforage from 'localforage';
import { toast } from 'react-hot-toast';
import { Appointment, Patient } from '../types';

const LOCAL_KEY = 'appointmentForm';

const AppointmentForm: React.FC = () => {
  const businessId = useBusinessId();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<Omit<Appointment, 'id'>>({
    patientId: '',
    businessId: businessId,
    date: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    getPatients(businessId).then(setPatients);
  }, [businessId]);

  useEffect(() => {
    localforage.getItem<Omit<Appointment, 'id'>>(LOCAL_KEY).then((cached) => {
      if (cached) setForm({ ...cached, businessId });
    });
  }, [businessId]);

  useEffect(() => {
    localforage.setItem(LOCAL_KEY, form);
  }, [form]);

  const handleInput = (field: keyof Omit<Appointment, 'id'>, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.date || !form.reason) {
      toast.error("All fields are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await addAppointment(form);
      toast.success("Appointment booked!");
      setForm({ patientId: '', businessId, date: '', reason: '' });
      await localforage.removeItem(LOCAL_KEY);
    } catch (err) {
      console.error(err);
      toast.error("Failed to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl p-6 mx-auto space-y-4 bg-white rounded-xl shadow-md text-[#3b2615]">
      <h2 className="text-2xl font-bold text-brown-700">📅 Book Appointment</h2>

      <div>
        <label className="block mb-1 font-semibold">Patient</label>
        <select
          value={form.patientId}
          onChange={e => handleInput('patientId', e.target.value)}
          className="w-full p-2 border rounded border-brown-300 focus:ring focus:ring-yellow-200"
          required
        >
          <option value="">Select Patient</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>
              {p.fullName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Date & Time</label>
        <input
          type="datetime-local"
          value={form.date}
          onChange={e => handleInput('date', e.target.value)}
          className="w-full p-2 border rounded border-brown-300 focus:ring focus:ring-yellow-200"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Reason</label>
        <input
          type="text"
          value={form.reason}
          onChange={e => handleInput('reason', e.target.value)}
          className="w-full p-2 border rounded border-brown-300 focus:ring focus:ring-yellow-200"
          placeholder="Consultation, Check-up, etc."
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 font-semibold text-white rounded-lg bg-brown-700 hover:bg-brown-800 disabled:opacity-50"
      >
        {isSubmitting ? "Booking..." : "Book Appointment"}
      </button>
    </form>
  );
};

export default AppointmentForm;
