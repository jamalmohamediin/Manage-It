import React, { useEffect, useState, useRef } from 'react';
import { getPatients } from '../firebase/patients';
import { getAppointments } from '../firebase/appointments';
import { useBusinessId } from '../hooks/useBusinessId';
import { Patient, Appointment } from '../types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PatientWithAppointment extends Patient {
  appointmentDate?: string;
  appointmentReason?: string;
  appointmentId?: string;
}

const UpcomingSlates: React.FC = () => {
  const businessId = useBusinessId();
  const [patients, setPatients] = useState<PatientWithAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWard, setActiveWard] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!businessId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsData, appointmentsData] = await Promise.all([
          getPatients(businessId),
          getAppointments(businessId)
        ]);

        // Filter appointments to only show upcoming ones (today and future)
        const today = new Date().toISOString().split('T')[0];
        const upcomingAppointments = appointmentsData.filter(
          apt => apt.date >= today
        );

        // Merge patients with their upcoming appointments
        const patientsWithAppointments: PatientWithAppointment[] = [];
        
        upcomingAppointments.forEach(appointment => {
          const patient = patientsData.find(p => p.id === appointment.patientId);
          if (patient) {
            patientsWithAppointments.push({
              ...patient,
              appointmentDate: appointment.date,
              appointmentReason: appointment.reason,
              appointmentId: appointment.id
            });
          }
        });

        // Sort by appointment date
        patientsWithAppointments.sort((a, b) => {
          if (!a.appointmentDate || !b.appointmentDate) return 0;
          return a.appointmentDate.localeCompare(b.appointmentDate);
        });

        setPatients(patientsWithAppointments);
        
        // Set up wards
        const wards = Array.from(new Set(patientsWithAppointments.map(p => p.ward || 'Unassigned')));
        if (wards.length > 0) {
          setActiveWard(wards[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId]);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupedWards = Array.from(new Set(patients.map(p => p.ward || 'Unassigned')));

  const filteredPatients = patients
    .filter(p => (p.ward || 'Unassigned') === activeWard)
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.fullName?.toLowerCase().includes(term) ||
        p.idNumber?.toLowerCase().includes(term) ||
        (p.triageStatus || '').toLowerCase().includes(term) ||
        (p.ward || '').toLowerCase().includes(term) ||
        (p.medicalAidName || '').toLowerCase().includes(term) ||
        (p.appointmentReason || '').toLowerCase().includes(term)
      );
    });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredPatients.map(p => ({
        'Full Name': p.fullName,
        'Age': p.age,
        'Gender': p.gender,
        'DOB': p.dob,
        'ID/Passport': p.idNumber,
        'Address': p.address,
        'Medical Aid': p.medicalAidName || '—',
        'Ward': p.ward || 'Unassigned',
        'Triage': p.triageStatus || '—',
        'Appointment Date': p.appointmentDate || '—',
        'Appointment Reason': p.appointmentReason || '—',
        'Special Instructions': p.specialInstructions || '—',
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeWard);
    const date = new Date().toISOString().split('T')[0];
    const filename = `Upcoming_Cases_${activeWard}_${date}.xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), filename);
  };

  const exportToPDF = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    const date = new Date().toISOString().split('T')[0];
    const filename = `Upcoming_Cases_${activeWard}_${date}.pdf`;
    pdf.save(filename);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-white rounded-2xl shadow-xl text-[#3b2615]">
        <h1 className="text-3xl font-bold text-brown-700">🗓️ Upcoming Cases/Slates</h1>
        <p className="text-sm text-muted">Loading upcoming cases...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white rounded-2xl shadow-xl text-[#3b2615]">
      <h1 className="text-3xl font-bold text-brown-700">🗓️ Upcoming Cases/Slates</h1>
      <p className="text-sm text-muted">
        List of patients with upcoming appointments. Includes full details, medical aid, and special instructions.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {groupedWards.length > 0 ? (
            groupedWards.map((ward) => (
              <button
                key={ward}
                onClick={() => setActiveWard(ward)}
                className={`px-4 py-1 rounded-full text-sm font-medium border transition ${
                  activeWard === ward
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : 'bg-gray-50 text-muted border-gray-300 hover:bg-yellow-50'
                }`}
              >
                {ward}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500">No wards available</p>
          )}
        </div>

        <input
          type="text"
          placeholder="Search patient, ID, triage, reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm sm:w-80 focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
      </div>

      {patients.length > 0 && (
        <div className="flex flex-wrap justify-end gap-4">
          <button onClick={exportToPDF} className="btn-cream">Export to PDF</button>
          <button onClick={exportToExcel} className="btn-cream">Export to Excel</button>
        </div>
      )}

      {patients.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-lg text-gray-500">No upcoming appointments found</p>
          <p className="text-sm text-gray-400">Schedule appointments to see them here</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <p className="italic text-muted">No matching cases in this ward.</p>
      ) : (
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full text-sm bg-white border shadow-md border-luxe-border rounded-xl">
            <thead className="text-left text-brown-700 bg-gray-50">
              <tr>
                <th className="p-2">Full Name</th>
                <th className="p-2">Age</th>
                <th className="p-2">Gender</th>
                <th className="p-2">DOB</th>
                <th className="p-2">ID/Passport</th>
                <th className="p-2">Address</th>
                <th className="p-2">Medical Aid</th>
                <th className="p-2">Ward</th>
                <th className="p-2">Triage</th>
                <th className="p-2">Appointment Date</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Special Instructions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr key={`${p.id}-${p.appointmentId}`} className="border-t border-luxe-border hover:bg-yellow-50">
                  <td className="p-2">{p.fullName}</td>
                  <td className="p-2">{p.age}</td>
                  <td className="p-2">{p.gender}</td>
                  <td className="p-2">{p.dob}</td>
                  <td className="p-2">{p.idNumber}</td>
                  <td className="p-2">{p.address}</td>
                  <td className="p-2">{p.medicalAidName || '—'}</td>
                  <td className="p-2">{p.ward || '—'}</td>
                  <td className="p-2">{getTriageBadge(p.triageStatus)}</td>
                  <td className="p-2">{formatDate(p.appointmentDate)}</td>
                  <td className="p-2">{p.appointmentReason || '—'}</td>
                  <td className="p-2">{p.specialInstructions || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UpcomingSlates;