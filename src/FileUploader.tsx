// src/FileUploader.tsx
import { useState } from "react";
import { storage } from "./firebase-config";
import { ref, uploadBytesResumable } from "firebase/storage";

const FileUploader = ({ patientId }: { patientId: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    console.log("Starting upload for:", file.name);

    const storageRef = ref(storage, `patients/${patientId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Progress:", prog);
        setProgress(prog);
      },
      (error) => {
        console.error("Upload error:", error);
        alert("Upload failed: " + error.message);
        setUploading(false);
      },
      () => {
        alert("Upload successful!");
        setUploading(false);
        setProgress(0);
        setFile(null);
      }
    );
  };

  return (
    <div className="border p-4 rounded max-w-md mx-auto mt-4">
      <h3 className="font-bold mb-2">Upload Patient Image/Document</h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-2"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {uploading ? `Uploading... ${Math.round(progress)}%` : "Upload"}
      </button>
    </div>
  );
};

export default FileUploader;