// src/App.tsx
import React, { useState } from 'react';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import RoleForm from './components/RoleForm';
import RoleList from './components/RoleList';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import AppointmentForm from './components/AppointmentForm';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'patients' | 'roles' | 'tasks' | 'appointments'>('patients');
  const [currentRole, setCurrentRole] = useState<'Admin' | 'Doctor' | 'Receptionist'>('Admin');

  return (
    <div className="min-h-screen p-6 bg-[#f9f5f0] text-[#3b2615]">
      <Toaster position="top-center" />
      <h1 className="mb-4 text-3xl font-bold">Manage It</h1>

      {/* Role switcher */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Current Role:</label>
        <select
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value as 'Admin' | 'Doctor' | 'Receptionist')}
          className="p-2 border rounded"
        >
          <option value="Admin">Admin</option>
          <option value="Doctor">Doctor</option>
          <option value="Receptionist">Receptionist</option>
        </select>
      </div>

      {/* Navigation */}
      <div className="flex mb-6 space-x-4">
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-4 py-2 rounded ${
            activeTab === 'patients' ? 'bg-[#3b2615] text-white' : 'bg-white border'
          }`}
        >
          Patients
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded ${
            activeTab === 'roles' ? 'bg-[#3b2615] text-white' : 'bg-white border'
          }`}
        >
          Roles
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded ${
            activeTab === 'tasks' ? 'bg-[#3b2615] text-white' : 'bg-white border'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded ${
            activeTab === 'appointments' ? 'bg-[#3b2615] text-white' : 'bg-white border'
          }`}
        >
          Appointments
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'patients' && (
        <>
          {currentRole === 'Receptionist' && <PatientForm />}
<PatientList currentRole={currentRole} />
        </>
      )}

      {activeTab === 'roles' && currentRole === 'Admin' && (
        <>
          <RoleForm />
          <RoleList />
        </>
      )}

      {activeTab === 'tasks' && (
        <>
          {currentRole !== 'Receptionist' && <TaskForm />}
          <TaskList />
        </>
      )}

      {activeTab === 'appointments' && (
        <>
          {currentRole !== 'Admin' && <AppointmentForm />}
          {currentRole === 'Admin' && <p className="text-gray-600">Admins cannot book appointments.</p>}
        </>
      )}
    </div>
  );
};

export default App;
