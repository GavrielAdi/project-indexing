// file: frontend/src/components/UploadPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiUpload, FiLoader, FiFileText, FiRefreshCw, FiCheckCircle, FiTrash2, FiActivity } from 'react-icons/fi';
import { Document } from '../app/page'; // Impor tipe Document

// Definisikan tipe untuk props
interface UploadPageProps {
  onUploadSuccess: (newFileName: string) => void;
  onSwitchDocument: (docId: string) => void;
  isLoading: boolean;
  indexedFile: string;
  resetActiveFile: () => void;
  documents: Document[]; // Terima daftar dokumen dari parent
  fetchDocuments: () => void; // Terima fungsi refresh dari parent
}

export default function UploadPage({ onUploadSuccess, onSwitchDocument, isLoading, indexedFile, resetActiveFile, documents, fetchDocuments }: UploadPageProps) {
  // State lokal hanya untuk form upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

  // Handler upload sekarang memanggil fetchDocuments dari props
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
      const response = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      setUploadMessage(data.message || data.error);
      if (response.ok) {
        onUploadSuccess(selectedFile.name);
        fetchDocuments(); // Panggil fungsi refresh dari parent
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
      const response = await fetch(`${API_URL}/document/${doc.id}`, { method: 'DELETE' });
      const data = await response.json();
      alert(data.message || data.error);
      if (response.ok) {
        if (doc.filename === indexedFile) {
          resetActiveFile(); // Panggil fungsi reset dari parent
        }
        fetchDocuments(); // Panggil fungsi refresh dari parent
      }
    } catch (err) {
      console.error("Error saat menghapus dokumen:", err);
      alert("Terjadi kesalahan saat mencoba menghapus dokumen.");
    }
  };

  return (
    <div className="space-y-10">
      {/* Bagian Form Upload */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-white flex items-center gap-3"><FiUpload /> Upload Dokumen Baru</h1>
        <form onSubmit={handleFileUpload} className="space-y-6">
          <input type="file" onChange={handleFileChange} accept=".docx,.pdf,.xlsx,.txt" disabled={isUploading || isLoading} className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900/50 file:text-blue-300 hover:file:bg-blue-800/60 disabled:opacity-50" />
          <button type="submit" disabled={isUploading || isLoading} className="w-full flex justify-center items-center gap-3 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
            {isUploading ? <FiLoader className="animate-spin" /> : <FiUpload />}
            {isUploading ? 'Memproses...' : 'Upload dan Indeks'}
          </button>
        </form>
        {uploadMessage && <p className="text-sm mt-6 text-center text-gray-400">{uploadMessage}</p>}
      </div>

      {/* Bagian Riwayat Upload */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3"><FiFileText /> Riwayat Dokumen</h2>
          <button onClick={fetchDocuments} disabled={isLoading} className="p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50">
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-400">NAMA FILE</th>
                <th className="p-4 text-sm font-semibold text-gray-400">TANGGAL UPLOAD</th>
                <th className="p-4 text-sm font-semibold text-gray-400 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && documents.length === 0 ? (
                <tr><td colSpan={3} className="text-center p-8 text-gray-500"><FiLoader className="animate-spin inline-block mr-2" /> Memuat riwayat...</td></tr>
              ) : documents.length > 0 ? (
                documents.map((doc) => {
                  const isActive = doc.filename === indexedFile;
                  return (
                    <tr key={doc.id} className={`border-b border-gray-700/50 transition-colors ${isActive ? 'bg-blue-900/50' : 'hover:bg-gray-700/50'}`}>
                      <td className="p-4 font-medium text-white flex items-center gap-2">{doc.filename} {isActive && <FiActivity size={14} className="text-green-400" />}</td>
                      <td className="p-4 text-gray-400">{doc.upload_date}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          {isActive ? (<span className="flex items-center gap-2 bg-green-500/30 text-green-300 font-semibold py-1 px-3 rounded-md"><FiCheckCircle size={14} /><span>Aktif</span></span>) : (<button onClick={() => onSwitchDocument(doc.id)} disabled={isLoading} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-500"><FiCheckCircle size={14} /><span>Jadikan Aktif</span></button>)}
                          <button onClick={() => handleDeleteDocument(doc)} disabled={isLoading} className="flex items-center gap-2 bg-red-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-500"><FiTrash2 size={14} /><span>Hapus</span></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={3} className="text-center p-8 text-gray-500">Belum ada dokumen yang di-upload.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
