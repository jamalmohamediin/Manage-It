// src/FileUploader.tsx
import { useState } from "react";
import { storage } from "./firebase/firebase-config";
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
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center text-gray-800">Upload Patient Image/Document</h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full bg-gray-100 border-gray-300 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full bg-green-600 text-white p-3 rounded-full font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        {uploading ? `Uploading... ${Math.round(progress)}%` : "Upload"}
      </button>
    </div>
  );
};

export default FileUploader;