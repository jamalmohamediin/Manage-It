// src/components/Documents.tsx
import React, { useEffect, useState } from 'react';
import {
  uploadBusinessDocument,
  getBusinessDocuments,
  deleteBusinessDocument,
  toggleDocumentVisibility,
  uploadFileWithMetadata,
  uploadFileForPatient,
} from '../firebase/storage';
import { useBusinessContext } from '../contexts/BusinessContext';
import { useUserContext } from '../contexts/UserContext';
import { useSelectedPatient } from '../contexts/SelectedPatientContext';
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
  const { patient, pendingAction, setPendingAction } = useSelectedPatient();

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const docsPerPage = 5;

  const loadDocs = async () => {
    if (!businessId) return;
    const data = await getBusinessDocuments(businessId);
    setDocs(data);
  };

  useEffect(() => {
    loadDocs();
  }, [businessId]);

  useEffect(() => {
    if (patient && pendingAction === 'uploadDocs') {
      setIsUploadModalOpen(true);
      setPendingAction(null);
    }
  }, [patient, pendingAction]);

  const handleUpload = async () => {
    if (!file || !user) return;

    try {
      if (patient) {
        await uploadFileForPatient(
          file,
          patient.id,
          user.id,
          user.name || 'Unknown'
        );
        toast.success(`File uploaded for patient: ${patient.name}`);
      } else if (businessId) {
        await uploadBusinessDocument(file, businessId, user.id, user.name || 'Unknown');
        toast.success('Business file uploaded');
        await loadDocs();
      }

      setFile(null);
      setIsUploadModalOpen(false);
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
      <h2 className="text-xl font-bold text-[#3b2615]">Documents</h2>

      <div className="flex items-center justify-between">
        <div>
          {isAdmin && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 text-white bg-[#5c3a21] rounded hover:bg-[#3b2615] mb-2"
            >
              Upload New File
            </button>
          )}
        </div>
        {patient && (
          <div className="text-sm font-semibold text-brown-700">
            Uploading for patient: <span className="underline">{patient.name}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">{/* Filter + Sort + Export UI */}</div>

      {/* Table UI... (Unchanged from your version) */}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onRequestClose={() => setIsUploadModalOpen(false)}
        contentLabel="Upload File"
        className="max-w-xl p-4 mx-auto mt-20 bg-white rounded-lg shadow outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-[#3b2615]">
            Upload {patient ? `for patient: ${patient.name}` : 'Company File'}
          </h3>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button
            onClick={handleUpload}
            disabled={!file}
            className="bg-[#5c3a21] text-white px-4 py-2 rounded hover:bg-[#3b2615]"
          >
            Upload
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Documents;
