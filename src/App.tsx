// src/App.tsx
import React, { useState } from 'react';
import PatientForm from './PatientForm';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import RoleForm from './components/RoleForm';
import RoleList from './components/RoleList';
import BusinessForm from './components/BusinessForm';
import BusinessList from './components/BusinessList';
import { useUserRole } from './hooks/useUserRole';

function App() {
  const [tab, setTab] = useState('Patients');
  const { role, loading } = useUserRole('user_001'); // Replace with actual user ID logic

  if (loading) return <p>Loading user role...</p>;

  const tabs: { [key: string]: React.ReactElement } = {
    Patients: <PatientForm />,
    Tasks: (
      <div>
        <TaskForm />
        <TaskList />
      </div>
    ),
    Roles: (
      <div>
        <RoleForm />
        <RoleList />
      </div>
    ),
    Businesses: (
      <div>
        <BusinessForm />
        <BusinessList />
      </div>
    ),
  };

  // Show tabs based on role
  const visibleTabs = {
    admin: ['Patients', 'Tasks', 'Roles', 'Businesses'],
    receptionist: ['Patients'],
    doctor: ['Tasks'],
    'shop clerk': ['Tasks'],
  }[role?.toLowerCase() || ''] || [];

  return (
    <div className="max-w-screen-xl p-6 mx-auto">
      <h1 className="text-3xl font-bold text-[#3b2615] mb-6">Manage It</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {visibleTabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${
              tab === t ? 'bg-[#5c3a21] text-white' : 'bg-white border'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 rounded shadow bg-white/80">{tabs[tab]}</div>
    </div>
  );
}

export default App;
