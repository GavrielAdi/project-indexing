// file: frontend/src/components/EditModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiTag, FiSave, FiX, FiLoader } from 'react-icons/fi';
import { Document } from '../app/page';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSave: () => void; // Fungsi untuk me-refresh data setelah menyimpan
}

export default function EditModal({ isOpen, onClose, document, onSave }: EditModalProps) {
  const [uploadedBy, setUploadedBy] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  const apiHeaders = { 
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  };

  // Mengisi form dengan data dokumen saat modal dibuka
  useEffect(() => {
    if (document) {
      setUploadedBy(document.uploaded_by);
      setTags(document.tags.join(', ')); // Ubah array menjadi string agar bisa diedit
      setMessage(''); // Reset pesan setiap kali modal dibuka
    }
  }, [document]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/document/${document.id}`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({
          uploaded_by: uploadedBy,
          tags: tags,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Data berhasil diperbarui!');
        onSave(); // Panggil fungsi onSave untuk refresh riwayat
        setTimeout(() => {
          onClose(); // Tutup modal setelah 1.5 detik
        }, 1500);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Gagal menyimpan perubahan:", err);
      setMessage('Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    // Latar belakang overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      {/* Konten Modal */}
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg m-4 p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Edit Dokumen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>
        
        <p className="text-sm text-gray-400 mb-6">Anda sedang mengedit: <strong className="text-white">{document?.filename}</strong></p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="edit-uploader" className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-1"><FiUser /> Nama/Inisial Pengunggah</label>
            <input 
              id="edit-uploader" 
              type="text" 
              value={uploadedBy} 
              onChange={(e) => setUploadedBy(e.target.value)} 
              required 
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label htmlFor="edit-tags" className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-1"><FiTag /> Tags (pisahkan dengan koma)</label>
            <input 
              id="edit-tags" 
              type="text" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
              placeholder="Contoh: kasus-2024, internal, penting" 
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500"
            >
              {isLoading ? <FiLoader className="animate-spin" /> : <FiSave />}
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
        {message && <p className="text-sm mt-4 text-center text-gray-400">{message}</p>}
      </div>
    </div>
  );
}
