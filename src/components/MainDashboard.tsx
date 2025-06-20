// src/components/MainDashboard.tsx

import React, { useEffect, useState } from "react";
import { useRoleContext } from "../contexts/RoleContext";
import { useBusinessId } from "../hooks/useBusinessId";
import { getPatients } from "../firebase/patients";
import { getAppointments } from "../firebase/appointments";
import { fetchAllRoles } from "../firebase/roles";
import dayjs from "dayjs";

const MainDashboard: React.FC = () => {
  const { role } = useRoleContext();
  const businessId = useBusinessId();

  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);

    // Fetch everything in parallel for speed
    Promise.all([
      getPatients(businessId),
      getAppointments(businessId),
      fetchAllRoles(businessId),
    ]).then(([pat, apps, roles]) => {
      setPatients(pat);
      setAppointments(apps);
      setRoles(roles);
    }).finally(() => setLoading(false));
  }, [businessId]);

  // Helper: Appointments today
  const todayStr = dayjs().format("YYYY-MM-DD");
  const todaysAppointments = appointments.filter((a: any) =>
    a.date && a.date.startsWith(todayStr)
  );

  // Helper: Expiring roles (within 7 days)
  const expiringRoles = roles.filter((r: any) =>
    r.expiresAt && dayjs(r.expiresAt).diff(dayjs(), "day") <= 7
  );

  if (loading) return (
    <div className="p-4 text-center text-gray-600">Loading dashboard...</div>
  );

  // ROLE-BASED DASHBOARDS
  if (role === "Receptionist") {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <StatCard label="Total Patients" value={patients.length} />
        <StatCard label="Today's Appointments" value={todaysAppointments.length} />
        <StatCard label="All Appointments" value={appointments.length} />
        <StatCard label="Your Role" value={role} />
      </div>
    );
  }

  if (role === "Doctor") {
    // Show only appointments assigned to this doctor (expand if you use userId logic)
    return (
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <StatCard label="Today's Appointments" value={todaysAppointments.length} />
        <StatCard label="All Appointments" value={appointments.length} />
        <StatCard label="Total Patients" value={patients.length} />
        <StatCard label="Your Role" value={role} />
      </div>
    );
  }

  if (role === "Admin") {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <StatCard label="Total Patients" value={patients.length} />
        <StatCard label="Total Appointments" value={appointments.length} />
        <StatCard label="Expiring Roles" value={expiringRoles.length} />
        <StatCard label="Your Role" value={role} />
      </div>
    );
  }

  // Fallback for users without a role
  return (
    <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
      <StatCard label="Total Patients" value={patients.length} />
      <StatCard label="All Appointments" value={appointments.length} />
      <StatCard label="Your Role" value={role || "Not Selected"} />
    </div>
  );
};

// Helper Card Component
const StatCard = ({ label, value }: { label: string; value: any }) => (
  <div className="p-4 bg-[#eedccb] rounded-lg shadow text-center">
    <div className="text-sm text-[#3b2615]">{label}</div>
    <div className="text-2xl font-bold text-[#5c3a21]">{value}</div>
  </div>
);

export default MainDashboard;
