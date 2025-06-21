// src/components/MainDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessId } from '../hooks/useBusinessId';
import { getBusinessById } from '../firebase/businesses';
import { useRoleContext } from '../contexts/RoleContext';
import { getPatients } from '../firebase/patients';
import { getTasks } from '../firebase/tasks';
import { getAppointments } from '../firebase/appointments';

const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const businessId = useBusinessId();
  const { role } = useRoleContext();
  const [business, setBusiness] = useState<any>(null);
  const [stats, setStats] = useState({ patients: 0, tasks: 0, appointments: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!businessId) return;
    getBusinessById(businessId).then(setBusiness);

    const fetchStats = async () => {
      const [patients, tasks, appointments] = await Promise.all([
        getPatients(businessId),
        getTasks(businessId),
        getAppointments(businessId),
      ]);
      setStats({
        patients: patients.length,
        tasks: tasks.length,
        appointments: appointments.length,
      });
    };

    fetchStats();
  }, [businessId]);

  const StatCard = ({ title, count, color }: { title: string; count: number; color: string }) => (
    <div className={`flex-1 p-4 rounded-lg shadow bg-${color}-100`}>
      <h4 className="text-md font-semibold text-[#3b2615]">{title}</h4>
      <p className="text-2xl font-bold text-[#3b2615]">{count}</p>
    </div>
  );

  const renderAdminDashboard = () => (
    <>
      <h2 className="mb-2 text-xl font-bold">Welcome Admin</h2>
      <input
        type="text"
        placeholder="Search tasks/patients..."
        className="w-full p-2 mb-4 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex gap-4 mb-6">
        <StatCard title="Patients" count={stats.patients} color="green" />
        <StatCard title="Tasks" count={stats.tasks} color="yellow" />
        <StatCard title="Appointments" count={stats.appointments} color="blue" />
      </div>
      <button
        onClick={() => navigate('/tasks')}
        className="px-4 py-2 text-white bg-[#3b2615] rounded"
      >
        View All Tasks
      </button>
    </>
  );

  const renderDoctorDashboard = () => (
    <>
      <h2 className="mb-2 text-xl font-bold">Welcome Doctor</h2>
      <input
        type="text"
        placeholder="Search patients..."
        className="w-full p-2 mb-4 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex gap-4 mb-6">
        <StatCard title="My Patients" count={stats.patients} color="green" />
        <StatCard title="Appointments" count={stats.appointments} color="blue" />
      </div>
      <button
        onClick={() => navigate('/appointments/calendar')}
        className="px-4 py-2 text-white bg-blue-500 rounded"
      >
        View Appointment Calendar
      </button>
    </>
  );

  const renderReceptionistDashboard = () => (
    <>
      <h2 className="mb-2 text-xl font-bold">Welcome Receptionist</h2>
      <input
        type="text"
        placeholder="Search patients..."
        className="w-full p-2 mb-4 border rounded"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex gap-4 mb-6">
        <StatCard title="Registered Patients" count={stats.patients} color="green" />
        <StatCard title="Upcoming Appointments" count={stats.appointments} color="yellow" />
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/patients')}
          className="px-4 py-2 text-white bg-green-600 rounded"
        >
          Manage Patients
        </button>
        <button
          onClick={() => navigate('/appointments')}
          className="px-4 py-2 text-white bg-yellow-500 rounded"
        >
          Appointments
        </button>
      </div>
    </>
  );

  const renderDashboardContent = () => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return renderAdminDashboard();
      case 'doctor':
        return renderDoctorDashboard();
      case 'receptionist':
        return renderReceptionistDashboard();
      default:
        return (
          <p className="text-red-600">
            No role selected. Please choose a role from the top dropdown.
          </p>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold text-[#3b2615] mb-4">
          {business?.name || 'Business Name'}
        </h1>
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default MainDashboard;
