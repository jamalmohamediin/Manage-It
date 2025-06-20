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

  // Load patients
  useEffect(() => {
    if (!businessId) return;
    getPatients(businessId).then(setPatients);
  }, [businessId]);

  // Load form state from local cache
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
    <form onSubmit={handleSubmit} className="max-w-lg p-6 mx-auto space-y-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-[#3b2615]">Book Appointment</h2>
      <div>
        <label className="block mb-1">Patient</label>
        <select
          value={form.patientId}
          onChange={e => handleInput('patientId', e.target.value)}
          className="w-full p-2 border rounded"
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
        <label className="block mb-1">Date & Time</label>
        <input
          type="datetime-local"
          value={form.date}
          onChange={e => handleInput('date', e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block mb-1">Reason</label>
        <input
          type="text"
          value={form.reason}
          onChange={e => handleInput('reason', e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Consultation, Check-up, etc."
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full p-3 font-semibold text-white transition rounded-lg bg-brown-800 hover:bg-brown-900 disabled:opacity-60"
      >
        {isSubmitting ? "Booking..." : "Book Appointment"}
      </button>
    </form>
  );
};

export default AppointmentForm;
