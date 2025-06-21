// src/components/AppointmentCalendar.tsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getAppointments } from "../firebase/appointments";
import { useBusinessId } from "../hooks/useBusinessId";
import { Appointment, Patient } from "../types";
import { getPatients } from "../firebase/patients";
import localforage from "localforage";

const LOCAL_KEY_PREFIX = "appointments_cache_";

const AppointmentCalendar: React.FC = () => {
  const businessId = useBusinessId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!businessId) return;
    const key = LOCAL_KEY_PREFIX + businessId;
    localforage.getItem<Appointment[]>(key).then((cached) => {
      if (cached && Array.isArray(cached)) setAppointments(cached);
    });
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    getAppointments(businessId).then((apps) => {
      setAppointments(apps);
      const key = LOCAL_KEY_PREFIX + businessId;
      localforage.setItem(key, apps);
    });
    getPatients(businessId).then(setPatients);
  }, [businessId]);

  const selectedDayAppointments = selectedDate
    ? appointments.filter((a) =>
        a.date &&
        new Date(a.date).toDateString() === selectedDate.toDateString()
      )
    : [];

  const getPatientName = (id?: string) =>
    patients.find((p) => p.id === id)?.fullName || "Unknown";

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;
    const hasAppointment = appointments.some(
      (a) => a.date && new Date(a.date).toDateString() === date.toDateString()
    );
    if (hasAppointment) {
      return (
        <div className="w-2 h-2 mx-auto mt-1 rounded-full bg-[#a77e47]" />
      );
    }
    return null;
  };

  return (
    <div className="max-w-2xl p-6 mx-auto bg-white shadow rounded-xl">
      <h2 className="text-xl font-bold text-[#3b2615] mb-4">
        Appointment Calendar
      </h2>
      <Calendar
        onClickDay={setSelectedDate}
        value={selectedDate}
        tileContent={tileContent}
        className="mx-auto border-none"
      />

      {selectedDate && (
        <div className="mt-6">
          <h3 className="mb-2 font-semibold">
            Appointments for {selectedDate.toLocaleDateString()}
          </h3>
          {selectedDayAppointments.length === 0 ? (
            <p className="text-gray-500">No appointments.</p>
          ) : (
            <ul>
              {selectedDayAppointments.map((a) => (
                <li key={a.id} className="py-2 border-b last:border-b-0">
                  <div>
                    <span className="font-bold text-brown-900">
                      {a.date ? new Date(a.date).toLocaleTimeString() : ""}
                    </span>{" "}
                    — {getPatientName(a.patientId)}
                  </div>
                  <div className="text-sm text-gray-700">{a.reason}</div>
                  {a.doctorId && (
                    <div className="text-xs text-gray-400">
                      Doctor: {a.doctorId}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;

// Notification-related code is assumed to be in NotificationBell.tsx, NotificationList.tsx, and firebase/notifications.ts
// If you'd like me to also post those full code files, let me know!
