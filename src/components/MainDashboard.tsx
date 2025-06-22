// src/pages/MainDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessId } from '../hooks/useBusinessId';
import { Task, Patient } from '../types';
import { getTasks, updateTask } from '../firebase/tasks';
import { getPatients } from '../firebase/patients';
import { toast } from 'react-hot-toast';
import { useUserContext } from '../contexts/UserContext';

const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  const businessId = useBusinessId();
  const { user } = useUserContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const getGreeting = () => 'Good afternoon, Doctor!';

  useEffect(() => {
    if (!businessId) return;

    const loadTasks = async () => {
      setLoadingTasks(true);
      const data = await getTasks(businessId);
      setTasks(data);
      setLoadingTasks(false);
    };

    const loadPatients = async () => {
      setLoadingPatients(true);
      const data = await getPatients(businessId);
      setPatients(data.slice(0, 5));
      setLoadingPatients(false);
    };

    loadTasks();
    loadPatients();
  }, [businessId]);

  const getStatusStyles = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-200 text-gray-800 border-gray-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTriageBadge = (status?: string) => {
    const base = 'px-2 py-1 rounded-full text-xs font-bold';
    switch ((status || '').toLowerCase()) {
      case 'critical':
      case 'red':
        return <span className={`${base} bg-red-100 text-red-800`}>Critical</span>;
      case 'yellow':
      case 'moderate':
        return <span className={`${base} bg-yellow-100 text-yellow-800`}>Moderate</span>;
      case 'green':
      case 'stable':
        return <span className={`${base} bg-green-100 text-green-800`}>Stable</span>;
      default:
        return <span className={`${base} bg-gray-200 text-gray-700`}>{status || '—'}</span>;
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    if (!businessId) return;
    try {
      await updateTask(taskId, { status }, businessId);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-10 bg-gray-50">
      {/* Welcome Card */}
      <div className="px-6 py-8 bg-white shadow rounded-xl">
        <h1 className="mb-2 text-2xl font-bold text-brown-700">
          {getGreeting()}
        </h1>
        <p className="text-sm text-gray-600">Your central hub for managing healthcare operations.</p>

        <div className="flex flex-wrap gap-4 mt-6">
          <button onClick={() => navigate('/doctor')} className="px-4 py-2 border border-gray-300 rounded-md text-brown-700 bg-gray-50 hover:bg-white">Doctor's View</button>
          <button onClick={() => navigate('/dashboard/profile')} className="px-4 py-2 border border-gray-300 rounded-md text-brown-700 bg-gray-50 hover:bg-white">Hospital Dashboard</button>
          <button onClick={() => navigate('/patients')} className="px-4 py-2 border border-gray-300 rounded-md text-brown-700 bg-gray-50 hover:bg-white">Search Patients</button>
          <button onClick={() => navigate('/patients')} className="px-4 py-2 border border-gray-300 rounded-md text-brown-700 bg-gray-50 hover:bg-white">Add Patients</button>
          <button onClick={() => navigate('/slates')} className="px-4 py-2 border border-gray-300 rounded-md text-brown-700 bg-gray-50 hover:bg-white">Upcoming Cases/Slates</button>
        </div>
      </div>

      {/* Upcoming Cases */}
      <div className="px-6 py-8 bg-white shadow rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-brown-700">🗂️ Upcoming Cases/Slates</h2>
          <button onClick={() => navigate('/slates')} className="text-sm underline text-brown-700 hover:text-yellow-600">
            View All →
          </button>
        </div>
        {loadingPatients ? (
          <p>Loading cases...</p>
        ) : patients.length === 0 ? (
          <p className="italic text-gray-500">No upcoming cases found.</p>
        ) : (
          <ul className="space-y-3">
            {patients.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-2 text-sm bg-white border border-gray-300 rounded shadow-sm">
                <div>
                  <strong>{p.fullName}</strong> — Age: {p.age}, Gender: {p.gender}, Ward: {p.ward || '—'}
                </div>
                <div className="ml-4">
                  {getTriageBadge(p.triageStatus)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tasks */}
      <div className="px-6 py-8 bg-white shadow rounded-xl">
        <h2 className="mb-2 text-xl font-bold text-brown-700">📋 Tasks Overview</h2>
        <p className="mb-4 text-sm text-gray-600">
          Summary of tasks assigned to you. Status can be changed directly.
        </p>

        {loadingTasks ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm italic text-gray-500">No tasks available</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-4 bg-white border border-gray-300 rounded shadow-sm"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{task.title}</p>
                  {task.assignedTo && (
                    <p className="text-sm text-gray-600">Assigned To: {task.assignedTo}</p>
                  )}
                  {task.notes && (
                    <p className="text-sm italic text-gray-500">Note: {task.notes}</p>
                  )}
                </div>

                <div className="flex-shrink-0 ml-4">
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task.id!, e.target.value as Task['status'])
                    }
                    className={`px-4 py-2 rounded-full text-sm font-semibold border border-gray-300 cursor-pointer appearance-none min-w-[120px] text-center ${getStatusStyles(task.status)} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                      backgroundPosition: 'right 8px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px',
                      paddingRight: '32px',
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainDashboard;
