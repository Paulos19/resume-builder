"use client";

import { useState } from "react";

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setMessage("");
      setFileUrl("");
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    setUploading(true);
    setMessage("Uploading...");
    setFileUrl("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage("Upload successful!");
        setFileUrl(data.url);
        setSelectedFile(null); // Clear selected file after successful upload
      } else {
        const errorData = await response.json();
        setMessage(`Upload failed: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error during upload:", error);
      setMessage("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload File to Firebase</h2>
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>
      {message && <p className="mt-4 text-sm text-center">{message}</p>}
      {fileUrl && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">File URL:</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
            {fileUrl}
          </a>
        </div>
      )}
    </div>
  );
}
