import React, { useState } from 'react';
import { addAppointment } from '../firebase/appointments';
import { useBusinessId } from '../hooks/useBusinessId';
import { toast } from 'react-hot-toast';

const AppointmentForm: React.FC = () => {
  const businessId = useBusinessId();
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return toast.error('Select a business first');

    setSubmitting(true);
    try {
      await addAppointment({
        patientName,
        date,
        time,
        reason,
        businessId,
      });
      toast.success('Appointment booked!');
      setPatientName('');
      setDate('');
      setTime('');
      setReason('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-[#3b2615]">Book Appointment</h2>
      <input
        type="text"
        placeholder="Patient Name"
        value={patientName}
        onChange={(e) => setPatientName(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full p-2 border rounded"
        rows={2}
      />
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2 text-white bg-[#5c3a21] rounded hover:bg-[#3b2615] disabled:opacity-50"
      >
        {submitting ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
};

export default AppointmentForm;
