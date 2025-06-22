// src/pages/BusinessProfile.tsx
import React, { useEffect, useState } from 'react';
import { useBusinessId } from '../hooks/useBusinessId';
import { getBusinessById } from '../firebase/businesses';
import { getTasks } from '../firebase/tasks';
import { getAppointments } from '../firebase/appointments';
import { getPatients } from '../firebase/patients';
import { getBusinessDocuments } from '../firebase/storage';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, ClipboardList, Users, FileText } from 'lucide-react';

const BusinessProfile = () => {
  const businessId = useBusinessId();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    if (!businessId) return;

    getBusinessById(businessId).then(setBusiness);
    getTasks(businessId).then(setTasks);
    getAppointments(businessId).then(setAppointments);
    getPatients(businessId).then(setPatients);
    getBusinessDocuments(businessId).then(setFiles);
  }, [businessId]);

  const appointmentsToday = appointments.filter((appt) => {
    const apptDate = new Date(appt.date?.seconds * 1000);
    const today = new Date();
    return (
      apptDate.getDate() === today.getDate() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-[#3b2615] mb-4">
        Welcome to {business?.name || 'Your Dashboard'}
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <StatCard icon={<Users className="text-[#5c3a21]" />} label="Clients" value={patients.length} />
        <StatCard icon={<ClipboardList className="text-[#5c3a21]" />} label="Tasks" value={tasks.length} />
        <StatCard icon={<CalendarClock className="text-[#5c3a21]" />} label="Appointments Today" value={appointmentsToday.length} />
        <StatCard icon={<FileText className="text-[#5c3a21]" />} label="Files" value={files.length} />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#3b2615] mb-2">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton label="Create Task" onClick={() => navigate('/tasks')} />
          <ActionButton label="Add Client" onClick={() => navigate('/patients')} />
          <ActionButton label="New Appointment" onClick={() => navigate('/appointments')} />
          <ActionButton label="System Settings" onClick={() => navigate('/settings/business')} />
        </div>
      </div>

      {/* Task Overview */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#3b2615] mb-2">Tasks Overview</h2>
        <div className="space-y-2">
          {tasks.slice(0, 2).map((task) => (
            <div key={task.id} className="p-4 bg-white border rounded shadow">
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-gray-600">Assigned To: {task.assignedTo}</p>
              <p className="text-xs italic text-gray-500">{task.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-xl font-semibold text-[#3b2615] mb-2">Upcoming Appointments</h2>
        <div className="space-y-2">
          {appointments.slice(0, 2).map((appt) => (
            <div key={appt.id} className="p-4 bg-white border rounded shadow">
              <p className="font-medium">{appt.title || 'Appointment'}</p>
              <p className="text-sm text-gray-600">With: {appt.clientName || 'Client'}</p>
              <p className="text-xs text-gray-500">
                {new Date(appt.date?.seconds * 1000).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ✅ Fixed JSX typing
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded shadow">
    <div className="w-10 h-10 flex items-center justify-center bg-[#f2e8de] rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-lg font-semibold text-[#3b2615]">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const ActionButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-[#dbc8b7] text-[#3b2615] rounded font-medium hover:bg-[#cbb8a8]"
  >
    {label}
  </button>
);

export default BusinessProfile;
