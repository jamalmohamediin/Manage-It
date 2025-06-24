import React, { useEffect, useState, useRef } from 'react';
import { getPatients } from '../firebase/patients';
import { getAppointments } from '../firebase/appointments';
import { useBusinessId } from '../hooks/useBusinessId';
import { Patient } from '../types'; // Removed unused Appointment import
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
  const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | null>(null);
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
          (apt: any) => apt.date >= today
        );

        // Merge patients with their upcoming appointments
        const patientsWithAppointments: PatientWithAppointment[] = [];
        
        upcomingAppointments.forEach((appointment: any) => {
          const patient = patientsData.find((p: Patient) => p.id === appointment.patientId);
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

  const getTriageBadge = (status?: string): React.ReactElement => {
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

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
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

  const exportToExcel = async () => {
    try {
      setExportLoading('excel');
      const worksheet = XLSX.utils.json_to_sheet(
        filteredPatients.map(p => ({
          'Full Name': p.fullName || '',
          'Age': p.age || '',
          'Gender': p.gender || '',
          'DOB': p.dob || '',
          'ID/Passport': p.idNumber || '',
          'Address': p.address || '',
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
      const filename = `Upcoming_Cases_${activeWard.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.xlsx`;
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, filename);
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Failed to export Excel file. Please try again.');
    } finally {
      setExportLoading(null);
    }
  };

  const exportToPDF = async () => {
    if (!tableRef.current) {
      alert('Table not found. Please try again.');
      return;
    }

    try {
      setExportLoading('pdf');
      const canvas = await html2canvas(tableRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);
      
      const ratio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      
      // Center the image
      const x = (pageWidth - imgWidth) / 2;
      const y = margin;
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `Upcoming_Cases_${activeWard.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExportLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-white rounded-2xl shadow-xl text-[#3b2615]">
        <h1 className="text-3xl font-bold text-brown-700">🗓️ Upcoming Cases/Slates</h1>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-yellow-400 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-sm text-muted">Loading upcoming cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white rounded-2xl shadow-xl text-[#3b2615]">
      <div>
        <h1 className="text-3xl font-bold text-brown-700">🗓️ Upcoming Cases/Slates</h1>
        <p className="mt-2 text-sm text-muted">
          List of patients with upcoming appointments. Includes full details, medical aid, and special instructions.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {groupedWards.length > 0 ? (
            groupedWards.map((ward) => (
              <button
                key={ward}
                onClick={() => setActiveWard(ward)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  activeWard === ward
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300 shadow-sm'
                    : 'bg-gray-50 text-muted border-gray-300 hover:bg-yellow-50 hover:border-yellow-200'
                }`}
              >
                {ward} ({patients.filter(p => (p.ward || 'Unassigned') === ward).length})
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
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm sm:w-80 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300"
        />
      </div>

      {patients.length > 0 && (
        <div className="flex flex-wrap justify-end gap-3">
          <button 
            onClick={exportToPDF} 
            disabled={exportLoading === 'pdf'}
            className="flex items-center space-x-2 btn-cream disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading === 'pdf' ? (
              <>
                <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <span>📄 Export to PDF</span>
            )}
          </button>
          <button 
            onClick={exportToExcel} 
            disabled={exportLoading === 'excel'}
            className="flex items-center space-x-2 btn-cream disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading === 'excel' ? (
              <>
                <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <span>📊 Export to Excel</span>
            )}
          </button>
        </div>
      )}

      {patients.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">📅</div>
          <p className="mb-2 text-lg text-gray-500">No upcoming appointments found</p>
          <p className="text-sm text-gray-400">Schedule appointments to see them here</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-lg text-gray-500">No matching cases in "{activeWard}" ward</p>
          <p className="text-sm text-gray-400">Try adjusting your search or select a different ward</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredPatients.length} case{filteredPatients.length !== 1 ? 's' : ''} in {activeWard}
            </p>
          </div>
          
          <div className="overflow-x-auto border shadow-sm rounded-xl" ref={tableRef}>
            <table className="w-full text-sm bg-white">
              <thead className="text-left border-b text-brown-700 bg-gray-50">
                <tr>
                  <th className="p-3 font-semibold">Full Name</th>
                  <th className="p-3 font-semibold">Age</th>
                  <th className="p-3 font-semibold">Gender</th>
                  <th className="p-3 font-semibold">DOB</th>
                  <th className="p-3 font-semibold">ID/Passport</th>
                  <th className="p-3 font-semibold">Address</th>
                  <th className="p-3 font-semibold">Medical Aid</th>
                  <th className="p-3 font-semibold">Ward</th>
                  <th className="p-3 font-semibold">Triage</th>
                  <th className="p-3 font-semibold">Appointment Date</th>
                  <th className="p-3 font-semibold">Reason</th>
                  <th className="p-3 font-semibold">Special Instructions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr 
                    key={`${p.id}-${p.appointmentId}`} 
                    className="transition-colors duration-150 border-b border-gray-100 hover:bg-yellow-50"
                  >
                    <td className="p-3 font-medium">{p.fullName || '—'}</td>
                    <td className="p-3">{p.age || '—'}</td>
                    <td className="p-3">{p.gender || '—'}</td>
                    <td className="p-3">{p.dob || '—'}</td>
                    <td className="p-3">{p.idNumber || '—'}</td>
                    <td className="max-w-xs p-3 truncate" title={p.address}>{p.address || '—'}</td>
                    <td className="p-3">{p.medicalAidName || '—'}</td>
                    <td className="p-3">{p.ward || 'Unassigned'}</td>
                    <td className="p-3">{getTriageBadge(p.triageStatus)}</td>
                    <td className="p-3 whitespace-nowrap">{formatDate(p.appointmentDate)}</td>
                    <td className="max-w-xs p-3 truncate" title={p.appointmentReason}>{p.appointmentReason || '—'}</td>
                    <td className="max-w-xs p-3 truncate" title={p.specialInstructions}>{p.specialInstructions || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSlates;