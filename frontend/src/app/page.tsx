// file: frontend/src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import SearchPage from '../components/SearchPage';
import UploadPage from '../components/UploadPage';
import SettingsPage from '../components/SettingsPage';

export interface Document {
  id: string;
  filename: string;
  upload_date: string;
}

const LOCAL_STORAGE_KEY = 'lastActiveDocumentId';

export default function HomePage() {
  const [activePage, setActivePage] = useState('pencarian');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [indexedFile, setIndexedFile] = useState('Memuat...');
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = 'http://127.0.0.1:5000';

  const fetchDocuments = async () => {
    try {
      // --- PERBAIKAN DI SINI: Tambahkan { cache: 'no-store' } ---
      const response = await fetch(`${API_URL}/documents`, { cache: 'no-store' });
      const data = await response.json();
      if (response.ok) {
        setDocuments(data);
      } else {
        console.error("Gagal mengambil riwayat:", data.error);
        setDocuments([]); // Set ke array kosong jika gagal
      }
    } catch (err) { 
      console.error("Error saat fetch riwayat:", err);
      setDocuments([]); // Set ke array kosong jika ada error koneksi
    }
  };

  const handleSwitchDocument = async (docId: string) => {
    if (!docId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/switch_document/${docId}`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setIndexedFile(data.filename);
        setActiveDocumentId(docId);
        localStorage.setItem(LOCAL_STORAGE_KEY, docId);
      } else {
        console.error("Gagal switch dokumen:", data.error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (err) { console.error("Error saat switch dokumen:", err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      await fetchDocuments();
      
      const lastActiveId = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (lastActiveId) {
        await handleSwitchDocument(lastActiveId);
      } else {
        try {
          const latestDocResponse = await fetch(`${API_URL}/document/latest`);
          const latestDocData = await latestDocResponse.json();
          if (latestDocResponse.ok && latestDocData.id) {
            await handleSwitchDocument(latestDocData.id);
          } else {
            setIndexedFile("Tidak ada dokumen di database.");
          }
        } catch (err) {
          console.error("Gagal memuat data awal:", err);
          setIndexedFile("Gagal terhubung ke backend.");
        }
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const activeDoc = documents.find(doc => doc.filename === indexedFile);
    if (activeDoc) setActiveDocumentId(activeDoc.id);
    else setActiveDocumentId(null);
  }, [indexedFile, documents]);

  const handleUploadSuccess = (newFileName: string) => {
    fetchDocuments();
  };

  const resetActiveFile = () => {
    setIndexedFile("Tidak ada dokumen yang dipilih.");
    setActiveDocumentId(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <div className="dark">
      <div className="flex min-h-screen bg-gray-900 text-white">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main className="flex-1 p-8 overflow-y-auto">
          {activePage === 'pencarian' && (
            <SearchPage
              indexedFile={indexedFile}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              documents={documents}
              activeDocumentId={activeDocumentId}
              onSwitchDocument={handleSwitchDocument}
            />
          )}
          {activePage === 'upload' && (
            <UploadPage
              onUploadSuccess={handleUploadSuccess}
              onSwitchDocument={handleSwitchDocument}
              isLoading={isLoading}
              indexedFile={indexedFile}
              resetActiveFile={resetActiveFile}
              documents={documents}
              fetchDocuments={fetchDocuments}
            />
          )}
          {activePage === 'pengaturan' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
