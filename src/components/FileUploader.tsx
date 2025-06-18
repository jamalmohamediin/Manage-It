// src/components/FileUploader.tsx
import React, { useState } from 'react';
import { uploadFileForUserRole } from '../firebase/storage';
import { toast } from 'react-hot-toast';

type Props = {
  userId: string;
  role: string;
  businessId: string;
  context?: string;
};

const FileUploader: React.FC<Props> = ({ userId, role, businessId, context = 'general' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');

    setUploading(true);
    try {
      await uploadFileForUserRole({ file, userId, role, businessId, context });
      toast.success('Upload successful');
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-3 py-1 text-white bg-[#3b2615] rounded hover:bg-[#5c3a21]"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default FileUploader;
