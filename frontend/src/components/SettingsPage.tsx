// file: frontend/src/components/SettingsPage.tsx
'use client';

import { FiInfo, FiHardDrive, FiTrash2 } from 'react-icons/fi';

// Kunci yang sama dengan yang ada di page.tsx
const LOCAL_STORAGE_KEY = 'lastActiveDocumentId';

export default function SettingsPage() {
  
  const handleClearCache = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus ingatan dokumen aktif terakhir? Anda harus memilihnya lagi secara manual setelah me-reload.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      alert("Cache pilihan dokumen aktif telah dihapus. Silakan refresh halaman.");
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">Pengaturan</h1>
        <p className="text-gray-400 mt-2">Kelola preferensi dan data aplikasi Anda.</p>
      </div>

      {/* Kartu Informasi Aplikasi */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
          <FiInfo /> Informasi Aplikasi
        </h2>
        <div className="space-y-2 text-gray-400">
          <div className="flex justify-between">
            <span>Versi Aplikasi:</span>
            <span className="font-mono text-gray-300">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Framework Frontend:</span>
            <span className="font-mono text-gray-300">Next.js</span>
          </div>
          <div className="flex justify-between">
            <span>Framework Backend:</span>
            <span className="font-mono text-gray-300">Flask</span>
          </div>
        </div>
      </div>

      {/* Kartu Tindakan / Zona Berbahaya */}
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-red-500/30">
        <h2 className="text-xl font-semibold mb-4 text-red-400 flex items-center gap-3">
          <FiTrash2 /> Zona Berbahaya
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">Hapus Cache Pilihan Dokumen</p>
            <p className="text-sm text-gray-400">Mereset dokumen aktif yang diingat oleh browser saat di-reload.</p>
          </div>
          <button
            onClick={handleClearCache}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Hapus Cache
          </button>
        </div>
      </div>
    </div>
  );
}
