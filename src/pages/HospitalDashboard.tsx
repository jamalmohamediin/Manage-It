import React from 'react';

const HospitalDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold text-primary">🏥 Hospital Dashboard</h1>
      <p className="text-brown-700">
        This is where you'll see upcoming surgery slates, ward activity, and team planning tools.
      </p>

      <div className="mt-6 p-4 border rounded shadow bg-[#fffaf5] text-sm text-gray-600">
        📅 <strong>Upcoming Cases/Slates</strong> feature placeholder.<br />
        You can customize this view later to include scheduled patients, surgeon lists, operating room allocations, etc.
      </div>
    </div>
  );
};

export default HospitalDashboard;
