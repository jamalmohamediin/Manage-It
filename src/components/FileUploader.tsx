import React, { useState } from "react";  // Ensure you import useState and useEffect from React
import { storage } from "../firebase/firebase-config";
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

    const storageRef = ref(storage, `patients/${patientId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
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
    <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
      <h3 className="mb-4 text-xl font-bold text-center text-gray-800">
        Upload Patient Image/Document
      </h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full p-3 mb-4 bg-gray-100 border border-gray-300 rounded-lg"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full p-3 font-semibold text-white bg-green-600 rounded-full hover:bg-green-700"
      >
        {uploading ? `Uploading... ${Math.round(progress)}%` : "Upload"}
      </button>
    </div>
  );
};

export default FileUploader;
