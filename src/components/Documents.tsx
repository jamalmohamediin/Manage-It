// src/components/Documents.tsx
import React, { useEffect, useState } from 'react';
import {
  uploadBusinessDocument,
  getBusinessDocuments,
  deleteBusinessDocument,
  toggleDocumentVisibility
} from '../firebase/storage';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useUserContext } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';
import Modal from 'react-modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

Modal.setAppElement('#root');

const Documents: React.FC = () => {
  const { businessId } = useBusinessContext();
  const { user } = useUserContext();
  const [file, setFile] = useState<File | null>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'public' | 'private'>('all');
  const [sortKey, setSortKey] = useState<'fileName' | 'uploadedAt'>('uploadedAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterUploader, setFilterUploader] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const docsPerPage = 5;

  const loadDocs = async () => {
    if (!businessId) return;
    const data = await getBusinessDocuments(businessId);
    setDocs(data);
  };

  useEffect(() => {
    loadDocs();
  }, [businessId]);

  const handleUpload = async () => {
    if (!file || !user || !businessId) return;
    try {
      await uploadBusinessDocument(file, businessId, user.id, user.name || 'Unknown');
      toast.success('File uploaded');
      setFile(null);
      await loadDocs();
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!businessId) return;
    try {
      await deleteBusinessDocument(businessId, docId);
      toast.success('File deleted');
      await loadDocs();
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  };

  const handleToggleVisibility = async (docId: string, currentStatus: boolean) => {
    if (!businessId) return;
    try {
      await toggleDocumentVisibility(businessId, docId, !currentStatus);
      toast.success(`Marked as ${!currentStatus ? 'public' : 'private'}`);
      await loadDocs();
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle visibility');
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredDocs.map((d) => [
      d.fileName,
      d.uploaderName,
      d.uploadedAt?.toDate?.().toLocaleDateString() || '',
      d.visibility || 'private',
    ]);

    autoTable(doc, {
      head: [['Filename', 'Uploader', 'Date', 'Visibility']],
      body: tableData,
    });

    doc.save('documents.pdf');
  };

  const exportCSV = () => {
    const headers = ['Filename,Uploader,Date,Visibility'];
    const rows = filteredDocs.map(d => {
      const date = d.uploadedAt?.toDate?.().toLocaleDateString() || '';
      return `"${d.fileName}","${d.uploaderName}","${date}","${d.visibility || 'private'}"`;
    });
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documents.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isAdmin = user?.role === 'admin';

  const filteredDocs = docs
    .filter((doc) => {
      if (tab === 'public') return doc.visibility === 'public';
      if (tab === 'private') return doc.visibility !== 'public';
      return true;
    })
    .filter((doc) => {
      if (!startDate && !endDate) return true;
      const docDate = doc.uploadedAt?.toDate?.();
      if (!docDate) return true;
      if (startDate && docDate < startDate) return false;
      if (endDate && docDate > endDate) return false;
      return true;
    })
    .filter((doc) => doc.fileName?.toLowerCase().includes(searchText.toLowerCase()))
    .filter((doc) => filterUploader === 'all' || doc.uploaderName === filterUploader)
    .sort((a, b) => {
      const valA = sortKey === 'uploadedAt' ? a[sortKey]?.toDate?.()?.getTime?.() : a[sortKey]?.toLowerCase?.();
      const valB = sortKey === 'uploadedAt' ? b[sortKey]?.toDate?.()?.getTime?.() : b[sortKey]?.toLowerCase?.();
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

  const uploaderOptions = [...new Set(docs.map(doc => doc.uploaderName || ''))];
  const totalPages = Math.ceil(filteredDocs.length / docsPerPage);
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * docsPerPage, currentPage * docsPerPage);

  const changeSort = (key: 'fileName' | 'uploadedAt') => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) return '🖼️';
    return '📁';
  };

  return (
    <div className="max-w-6xl p-6 mx-auto space-y-6 shadow bg-white/60 rounded-2xl">
      <h2 className="text-xl font-bold text-[#3b2615]">Company Documents</h2>

      {isAdmin && (
        <div className="space-y-2">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
          <button
            onClick={handleUpload}
            disabled={!file}
            className="px-4 py-2 text-white bg-[#5c3a21] rounded hover:bg-[#3b2615]"
          >
            Upload
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => setTab('all')} className={`px-3 py-1 rounded ${tab === 'all' ? 'bg-[#5c3a21] text-white' : 'bg-gray-100'}`}>All</button>
          <button onClick={() => setTab('public')} className={`px-3 py-1 rounded ${tab === 'public' ? 'bg-[#5c3a21] text-white' : 'bg-gray-100'}`}>🌍 Public</button>
          <button onClick={() => setTab('private')} className={`px-3 py-1 rounded ${tab === 'private' ? 'bg-[#5c3a21] text-white' : 'bg-gray-100'}`}>🔒 Private</button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search filename..."
            className="px-2 py-1 text-sm border rounded"
          />
          <select value={filterUploader} onChange={e => setFilterUploader(e.target.value)} className="px-2 py-1 text-sm border rounded">
            <option value="all">All Uploaders</option>
            {uploaderOptions.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Start date" className="px-2 py-1 text-sm border rounded" />
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="End date" className="px-2 py-1 text-sm border rounded" />
          <button onClick={exportPDF} className="px-3 py-1 text-white bg-[#3b2615] rounded text-sm">Export PDF</button>
          <button onClick={exportCSV} className="px-3 py-1 text-white bg-[#5c3a21] rounded text-sm">Export CSV</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full mt-4 text-sm border border-gray-300 rounded">
          <thead className="text-left bg-gray-100">
            <tr>
              <th onClick={() => changeSort('fileName')} className="px-3 py-2 border-b cursor-pointer">Filename {sortKey === 'fileName' && (sortAsc ? '▲' : '▼')}</th>
              <th className="px-3 py-2 border-b">Uploader</th>
              <th onClick={() => changeSort('uploadedAt')} className="px-3 py-2 border-b cursor-pointer">Date {sortKey === 'uploadedAt' && (sortAsc ? '▲' : '▼')}</th>
              <th className="px-3 py-2 border-b">Visibility</th>
              <th className="px-3 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDocs.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="px-3 py-2 text-[#5c3a21] hover:underline cursor-pointer" onClick={() => setPreviewUrl(doc.fileURL)}>
                  {getFileIcon(doc.fileName)} {doc.fileName}
                </td>
                <td className="px-3 py-2">{doc.uploaderName}</td>
                <td className="px-3 py-2">{doc.uploadedAt?.toDate?.().toLocaleDateString?.()}</td>
                <td className="px-3 py-2">{doc.visibility === 'public' ? '🌍 Public' : '🔒 Private'}</td>
                <td className="px-3 py-2 space-x-2">
                  {isAdmin && (
                    <>
                      <button onClick={() => handleToggleVisibility(doc.id, doc.visibility === 'public')} className="text-xs text-blue-600 hover:underline">Toggle</button>
                      <button onClick={() => handleDelete(doc.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span>Page {currentPage} of {totalPages}</span>
        <div className="space-x-2">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50">Prev</button>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50">Next</button>
        </div>
      </div>

      <Modal
        isOpen={!!previewUrl}
        onRequestClose={() => setPreviewUrl(null)}
        contentLabel="Preview Document"
        className="max-w-2xl p-4 mx-auto mt-20 bg-white rounded-lg shadow outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="flex flex-col gap-4">
          <button className="ml-auto text-sm text-gray-600 hover:text-black" onClick={() => setPreviewUrl(null)}>Close ✖</button>
          {previewUrl && (
            <iframe src={previewUrl} title="Document Preview" className="w-full h-[400px] rounded border" />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Documents;
