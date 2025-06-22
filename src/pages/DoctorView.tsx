import React from 'react';

const DoctorView: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-xl p-6 text-[#3b2615]">
      <h1 className="mb-4 text-2xl font-bold">Doctor's View</h1>
      <p className="text-base">Welcome to the Doctor’s View dashboard. Here you can view patient summaries, appointments, and tasks relevant to the doctor.</p>
    </div>
  );
};

export default DoctorView;

