import React, { useEffect, useState } from 'react';
import { uploadFileWithMetadata, getUploadsForItem } from '../firebase/storage';

interface Props {
  itemId: string;
  businessId: string;
  context: 'tasks' | 'roles' | 'patients';
  open: boolean;
  onClose: () => void;
  userId: string;
  uploaderName: string;
  role?: string;
}

const FileUploaderModal: React.FC<Props> = ({
  itemId,
  businessId,
  context,
  open,
  onClose,
  userId,
  uploaderName,
  role = 'unknown',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    if (!open) return;
    getUploadsForItem(context, itemId).then(setFileList);
  }, [open, context, itemId, refreshFlag]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadFileWithMetadata(
        file,
        itemId,
        businessId,
        role,
        context,
        userId,
        uploaderName
      );
      setFile(null);
      setRefreshFlag((f) => f + 1);
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const renderFilePreview = (fileURL: string, fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return <img src={fileURL} alt={fileName} className="object-cover w-16 h-16 rounded" />;
    } else if (ext === 'pdf') {
      return <span className="text-xl">📄</span>;
    } else if (['docx', 'doc'].includes(ext || '')) {
      return <span className="text-xl">📑</span>;
    } else if (['xls', 'xlsx'].includes(ext || '')) {
      return <span className="text-xl">📊</span>;
    } else if (ext === 'csv') {
      return <span className="text-xl">📈</span>;
    } else {
      return <span className="text-xl">📎</span>;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <button onClick={onClose} className="absolute text-xl top-2 right-2">&times;</button>
        <h3 className="mb-4 text-lg font-bold capitalize">{context.slice(0, -1)} Files</h3>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full mb-2"
          disabled={uploading}
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full px-4 py-2 bg-[#5c3a21] text-white rounded hover:bg-[#3b2615] disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        <hr className="my-4" />
        <h4 className="mb-2 font-semibold">Uploaded Files:</h4>
        <ul className="space-y-2 overflow-y-auto max-h-36">
          {fileList.length === 0 ? (
            <li className="text-sm text-gray-400">No files uploaded yet.</li>
          ) : (
            fileList.map((f) => (
              <li key={f.id || f.fileName} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {renderFilePreview(f.fileURL, f.fileName)}
                  <a
                    href={f.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {f.fileName}
                  </a>
                </div>
                <span className="text-xs text-gray-500">
                  Uploaded by: {f.uploaderName || f.uploadedBy || '—'} |{' '}
                  {f.uploadedAt?.toDate
                    ? new Date(f.uploadedAt.seconds * 1000).toLocaleString()
                    : ''}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default FileUploaderModal;
