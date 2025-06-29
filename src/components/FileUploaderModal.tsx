import React, { useState } from 'react';
import { uploadFileForPatient } from '../firebase/storage'; // ✅ fixed import path
import { toast } from 'react-toastify';
import { X, UploadCloud, FileCheck2 } from 'lucide-react';

interface FileUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

const FileUploaderModal: React.FC<FileUploaderModalProps> = ({
  isOpen,
  onClose,
  patientId,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      toast.error('Please select at least one file.');
      return;
    }

    setIsUploading(true);

    try {
      await Promise.all(
        selectedFiles.map((file) =>
          uploadFileForPatient(file, patientId, 'current-user', 'Healthcare Provider')
        )
      );
      toast.success('All files uploaded successfully!');
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Upload Documents</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full p-2 text-sm border border-gray-300 rounded-md"
        />

        <div className="mt-4 space-y-2 overflow-y-auto max-h-32">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-3 py-2 text-sm bg-gray-100 rounded-md"
            >
              <span className="truncate">{file.name}</span>
              <FileCheck2 className="w-4 h-4 text-green-600" />
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploaderModal;
