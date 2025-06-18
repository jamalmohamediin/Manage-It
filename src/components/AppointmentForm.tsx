// src/components/AppointmentForm.tsx
import React, { useState } from 'react';
import { addAppointment } from '../firebase/appointments';
import { useBusinessId } from '../hooks/useBusinessId';
import { toast } from 'react-hot-toast';

const AppointmentForm: React.FC = () => {
  const businessId = useBusinessId();
  const [date, setDate] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAppointment({ date }, businessId);
      toast.success('Appointment booked');
      setDate('');
    } catch {
      toast.error('Booking failed');
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button type="submit">Book</button>
    </form>
  );
};
export default AppointmentForm;
