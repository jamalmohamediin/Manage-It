// src/components/FileUploader.tsx
import React, { useState } from 'react';
import { uploadFile } from '../firebase/storage';

type Props = {
  userId: string;
  role: 'Admin' | 'Doctor' | 'Receptionist';
  businessId: string;
  context: string;
};

const FileUploader: React.FC<Props> = ({ userId, role, businessId, context }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      await uploadFile(file, userId, businessId, role, context);
      alert('Upload successful');
      setFile(null); // Clear the file after successful upload
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm"
        disabled={uploading}
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="px-3 py-1 bg-[#5c3a21] text-white rounded hover:bg-[#3b2615] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default FileUploader;