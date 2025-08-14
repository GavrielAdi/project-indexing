// file: frontend/src/components/UploadPage.tsx
'use client';

import { useState } from 'react';
import { FiUpload, FiLoader, FiFileText, FiRefreshCw, FiCheckCircle, FiTrash2, FiActivity } from 'react-icons/fi';
import { Document } from '../app/page';

interface UploadPageProps {
  onUploadSuccess: (newFileName: string) => void;
  onSwitchDocument: (docId: string) => void;
  isLoading: boolean;
  indexedFile: string;
  resetActiveFile: () => void;
  documents: Document[];
  fetchDocuments: () => void;
}

export default function UploadPage({ onUploadSuccess, onSwitchDocument, isLoading, indexedFile, resetActiveFile, documents, fetchDocuments }: UploadPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  // --- PERBAIKAN DI SINI: Definisikan header di satu tempat ---
  const apiHeaders = { 'ngrok-skip-browser-warning': 'true' };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadMessage('Pilih file terlebih dahulu!');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    setIsUploading(true);
    setUploadMessage('Mengunggah dan mengindeks...');
    try {
      // Menambahkan header ke fetch (catatan: untuk FormData, jangan set Content-Type)
      const response = await fetch(`${API_URL}/upload`, { 
        method: 'POST', 
        body: formData,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await response.json();
      setUploadMessage(data.message || data.error);
      if (response.ok) {
        onUploadSuccess(selectedFile.name);
        fetchDocuments();
      }
    } catch (err) {
      console.error("Gagal upload:", err);
      setUploadMessage('Terjadi kesalahan saat mengunggah file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus file "${doc.filename}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    try {
      // Menambahkan header ke fetch
      const response = await fetch(`${API_URL}/document/${doc.id}`, { 
        method: 'DELETE',
        headers: apiHeaders
      });
      const data = await response.json();
      alert(data.message || data.error);
      if (response.ok) {
        if (doc.filename === indexedFile) {
          resetActiveFile();
        }
        fetchDocuments();
      }
    } catch (err) {
      console.error("Error saat menghapus dokumen:", err);
      alert("Terjadi kesalahan saat mencoba menghapus dokumen.");
    }
  };

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Bagian Form Upload */}
      <div className="bg-gray-800 p-4 md:p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white flex items-center gap-3">
          <FiUpload /> Upload Dokumen
        </h1>
        <form onSubmit={handleFileUpload} className="space-y-4">
          <input type="file" onChange={handleFileChange} accept=".docx,.pdf,.xlsx,.txt" disabled={isUploading || isLoading} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900/50 file:text-blue-300 hover:file:bg-blue-800/60 disabled:opacity-50" />
          <button type="submit" disabled={isUploading || isLoading} className="w-full flex justify-center items-center gap-3 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
            {isUploading ? <FiLoader className="animate-spin" /> : <FiUpload />}
            {isUploading ? 'Memproses...' : 'Upload & Indeks'}
          </button>
        </form>
        {uploadMessage && <p className="text-sm mt-4 text-center text-gray-400">{uploadMessage}</p>}
      </div>

      {/* Bagian Riwayat Upload */}
      <div className="bg-gray-800 p-4 md:p-8 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <FiFileText /> Riwayat
          </h2>
          <button onClick={fetchDocuments} disabled={isLoading} className="p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50">
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="w-2/5 p-2 md:p-4 font-semibold text-gray-400">NAMA FILE</th>
                <th className="hidden sm:table-cell w-1/5 p-2 md:p-4 font-semibold text-gray-400">TANGGAL</th>
                <th className="w-2/5 p-2 md:p-4 font-semibold text-gray-400 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && documents.length === 0 ? (
                <tr><td colSpan={3} className="text-center p-8 text-gray-500"><FiLoader className="animate-spin inline-block mr-2" /> Memuat...</td></tr>
              ) : documents.length > 0 ? (
                documents.map((doc) => {
                  const isActive = doc.filename === indexedFile;
                  return (
                    <tr key={doc.id} className={`border-b border-gray-700/50 transition-colors ${isActive ? 'bg-blue-900/50' : 'hover:bg-gray-700/50'}`}>
                      <td className="p-2 md:p-4 font-medium text-white">
                        <span className="break-words">{doc.filename}</span>
                        {isActive && <FiActivity size={14} className="text-green-400 inline-block ml-2 flex-shrink-0" />}
                      </td>
                      <td className="hidden sm:table-cell p-2 md:p-4 text-gray-400">{doc.upload_date}</td>
                      <td className="p-2 md:p-4">
                        <div className="flex flex-col xl:flex-row justify-center items-center gap-2">
                          {isActive ? (
                            <span className="flex items-center gap-2 bg-green-500/30 text-green-300 font-semibold py-1 px-3 rounded-md w-full justify-center text-center">
                              <FiCheckCircle size={14} /><span>Aktif</span>
                            </span>
                          ) : (
                            <button onClick={() => onSwitchDocument(doc.id)} disabled={isLoading} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-500 w-full justify-center">
                              <FiCheckCircle size={14} /><span>Jadikan Aktif</span>
                            </button>
                          )}
                          <button onClick={() => handleDeleteDocument(doc)} disabled={isLoading} className="flex items-center gap-2 bg-red-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-500 w-full justify-center">
                            <FiTrash2 size={14} /><span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={3} className="text-center p-8 text-gray-500">Belum ada dokumen.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
