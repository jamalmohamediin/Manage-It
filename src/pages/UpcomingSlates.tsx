import React, { useEffect, useState, useRef } from 'react';
import { getPatients } from '../firebase/patients';
import { useBusinessId } from '../hooks/useBusinessId';
import { Patient } from '../types';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const UpcomingSlates: React.FC = () => {
  const businessId = useBusinessId();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWard, setActiveWard] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!businessId) return;
    const fetch = async () => {
      const data = await getPatients(businessId);
      setPatients(data);
      const wards = Array.from(new Set(data.map(p => p.ward || 'Unassigned')));
      setActiveWard(wards[0]);
      setLoading(false);
    };
    fetch();
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
        (p.medicalAidName || '').toLowerCase().includes(term)
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
        'Special Instructions': p.specialInstructions || '—',
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeWard);
    const date = new Date().toISOString().split('T')[0];
    const filename = `Slates_${activeWard}_${date}.xlsx`;
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
    const filename = `Slates_${activeWard}_${date}.pdf`;
    pdf.save(filename);
  };

  return (
    <div className="p-6 space-y-6 bg-white rounded-2xl shadow-xl text-[#3b2615]">
      <h1 className="text-3xl font-bold text-brown-700">🗓️ Upcoming Cases/Slates</h1>
      <p className="text-sm text-muted">
        List of patients scheduled for upcoming cases. Includes full details, medical aid, and special instructions.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {groupedWards.map((ward) => (
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
          ))}
        </div>

        <input
          type="text"
          placeholder="Search patient, ID, triage..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm sm:w-80 focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
      </div>

      <div className="flex flex-wrap justify-end gap-4">
        <button onClick={exportToPDF} className="btn-cream">Export to PDF</button>
        <button onClick={exportToExcel} className="btn-cream">Export to Excel</button>
      </div>

      {loading ? (
        <p>Loading...</p>
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
                <th className="p-2">Special Instructions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr key={p.id} className="border-t border-luxe-border hover:bg-yellow-50">
                  <td className="p-2">{p.fullName}</td>
                  <td className="p-2">{p.age}</td>
                  <td className="p-2">{p.gender}</td>
                  <td className="p-2">{p.dob}</td>
                  <td className="p-2">{p.idNumber}</td>
                  <td className="p-2">{p.address}</td>
                  <td className="p-2">{p.medicalAidName || '—'}</td>
                  <td className="p-2">{p.ward || '—'}</td>
                  <td className="p-2">{getTriageBadge(p.triageStatus)}</td>
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
