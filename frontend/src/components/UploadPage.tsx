// file: frontend/src/components/UploadPage.tsx
'use client';

import { useState, useMemo } from 'react';
import { FiUpload, FiLoader, FiFileText, FiRefreshCw, FiCheckCircle, FiTrash2, FiActivity, FiEdit2, FiUser, FiTag, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Document } from '../app/page';
import EditModal from './EditModal';

interface UploadPageProps {
  onUploadSuccess: (newFileName: string) => void;
  onSwitchDocument: (docId: string) => void;
  isLoading: boolean;
  indexedFile: string;
  resetActiveFile: () => void;
  documents: Document[];
  fetchDocuments: () => void;
}

// Komponen baru untuk kontrol paginasi
const PaginationControls = ({ currentPage, totalPages, onPageChange }: any) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-4">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FiChevronLeft />
            </button>
            <span className="text-gray-400">
                Halaman {currentPage} dari {totalPages}
            </span>
            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="p-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FiChevronRight />
            </button>
        </div>
    );
};


export default function UploadPage({ onUploadSuccess, onSwitchDocument, isLoading, indexedFile, resetActiveFile, documents, fetchDocuments }: UploadPageProps) {
  // State untuk form upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedBy, setUploadedBy] = useState('');
  const [tags, setTags] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // State untuk modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);

  // State untuk filter dan sortir
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // --- State baru untuk paginasi ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Tampilkan 10 dokumen per halaman

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  const apiHeaders = { 'ngrok-skip-browser-warning': 'true' };

  const handleOpenEditModal = (doc: Document) => {
    setDocumentToEdit(doc);
    setIsEditModalOpen(true);
  };

  // Logika untuk memfilter dan menyortir dokumen
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents;
    if (searchTerm) {
        filtered = documents.filter(doc => {
            const term = searchTerm.toLowerCase();
            switch (searchField) {
                case 'filename': return doc.filename.toLowerCase().includes(term);
                case 'uploaded_by': return doc.uploaded_by.toLowerCase().includes(term);
                case 'tags': return doc.tags.some(tag => tag.toLowerCase().includes(term));
                default:
                    return doc.filename.toLowerCase().includes(term) ||
                           doc.uploaded_by.toLowerCase().includes(term) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(term));
            }
        });
    }
    switch (sortBy) {
        case 'oldest': return [...filtered].sort((a, b) => new Date(a.upload_date).getTime() - new Date(b.upload_date).getTime());
        case 'az': return [...filtered].sort((a, b) => a.filename.localeCompare(b.filename));
        case 'za': return [...filtered].sort((a, b) => b.filename.localeCompare(a.filename));
        default: return [...filtered].sort((a, b) => new Date(b.last_modified_date).getTime() - new Date(a.last_modified_date).getTime());
    }
  }, [documents, searchTerm, sortBy, searchField]);

  // --- Logika baru untuk paginasi ---
  const totalPages = Math.ceil(filteredAndSortedDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredAndSortedDocuments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
      }
  };


  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadedBy.trim()) {
      setUploadMessage('File dan Nama Pengunggah harus diisi!');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('uploaded_by', uploadedBy);
    formData.append('tags', tags);
    setIsUploading(true);
    setUploadMessage('Mengunggah dan mengindeks...');
    try {
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
        setSelectedFile(null);
        setUploadedBy('');
        setTags('');
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
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
      const response = await fetch(`${API_URL}/document/${doc.id}`, { method: 'DELETE', headers: apiHeaders });
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
    <>
      <EditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        document={documentToEdit}
        onSave={fetchDocuments}
      />

      <div className="space-y-6 md:space-y-10">
        {/* Bagian Form Upload */}
        <div className="bg-gray-800 p-4 md:p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white flex items-center gap-3"><FiUpload /> Upload Dokumen</h1>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <input id="file-input" type="file" onChange={handleFileChange} accept=".docx,.pdf,.xlsx,.txt" disabled={isUploading || isLoading} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900/50 file:text-blue-300 hover:file:bg-blue-800/60 disabled:opacity-50" />
            <div>
              <label htmlFor="uploader" className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-1"><FiUser /> Nama/Inisial Pengunggah</label>
              <input id="uploader" type="text" value={uploadedBy} onChange={(e) => setUploadedBy(e.target.value)} placeholder="Contoh: Budi S." required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="tags" className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-1"><FiTag /> Tags (pisahkan dengan koma)</label>
              <input id="tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Contoh: kasus-2024, internal" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
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
              <FiFileText /> Riwayat Dokumen
            </h2>
            <button onClick={fetchDocuments} disabled={isLoading} className="p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50">
              <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-4">
              <select value={searchField} onChange={(e) => setSearchField(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">Cari di Semua</option>
                <option value="filename">Nama File</option>
                <option value="uploaded_by">Pengunggah</option>
                <option value="tags">Tag</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="az">Nama File (A-Z)</option>
                <option value="za">Nama File (Z-A)</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="w-2/5 p-2 md:p-4 font-semibold text-gray-400">NAMA FILE & TAGS</th>
                  <th className="hidden sm:table-cell w-1/5 p-2 md:p-4 font-semibold text-gray-400">INFO</th>
                  <th className="w-2/5 p-2 md:p-4 font-semibold text-gray-400 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && documents.length === 0 ? (
                  <tr><td colSpan={3} className="text-center p-8 text-gray-500"><FiLoader className="animate-spin inline-block mr-2" /> Memuat...</td></tr>
                ) : paginatedDocuments.length > 0 ? (
                  paginatedDocuments.map((doc) => {
                    const isActive = doc.filename === indexedFile;
                    return (
                      <tr key={doc.id} className={`border-b border-gray-700/50 transition-colors ${isActive ? 'bg-blue-900/50' : 'hover:bg-gray-700/50'}`}>
                        <td className="p-2 md:p-4 font-medium text-white">
                          <span className="break-words">{doc.filename}</span>
                          {isActive && <FiActivity size={14} className="text-green-400 inline-block ml-2 flex-shrink-0" />}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map(tag => (
                              <span key={tag} className="bg-gray-700 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell p-2 md:p-4 text-gray-400">
                            <div><span className="font-semibold text-white">{doc.uploaded_by}</span></div>
                            <div className="text-xs mt-1">
                                <div>Dibuat: {doc.upload_date}</div>
                                <div>Diubah: {doc.last_modified_date}</div>
                            </div>
                        </td>
                        <td className="p-2 md:p-4">
                          <div className="flex flex-col xl:flex-row justify-center items-center gap-2">
                            {isActive ? (<span className="flex items-center gap-2 bg-green-500/30 text-green-300 font-semibold py-1 px-3 rounded-md w-full justify-center text-center"><FiCheckCircle size={14} /><span>Aktif</span></span>) : (<button onClick={() => onSwitchDocument(doc.id)} disabled={isLoading} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-500 w-full justify-center"><FiCheckCircle size={14} /><span>Jadikan Aktif</span></button>)}
                            <button onClick={() => handleOpenEditModal(doc)} disabled={isLoading} className="flex items-center gap-2 bg-yellow-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-yellow-700 transition-colors disabled:bg-gray-500 w-full justify-center"><FiEdit2 size={14} /><span>Edit</span></button>
                            <button onClick={() => handleDeleteDocument(doc)} disabled={isLoading} className="flex items-center gap-2 bg-red-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-500 w-full justify-center"><FiTrash2 size={14} /><span>Hapus</span></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={3} className="text-center p-8 text-gray-500">
                    {searchTerm ? 'Tidak ada dokumen yang cocok.' : 'Belum ada dokumen.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* --- KONTROL PAGINASI BARU --- */}
          {totalPages > 1 && (
            <PaginationControls 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </>
  );
}
