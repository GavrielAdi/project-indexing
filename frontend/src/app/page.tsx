// file: frontend/src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import SearchPage from '../components/SearchPage';
import UploadPage from '../components/UploadPage';
import SettingsPage from '../components/SettingsPage';
import BerandaPage from '../components/BerandaPage';
import { FiMenu } from 'react-icons/fi';

export interface Document {
  id: string;
  filename: string;
  upload_date: string;
  uploaded_by: string;
  tags: string[];
  last_modified_date: string;
}

const LOCAL_STORAGE_KEY = 'lastActiveDocumentId';

export default function HomePage() {
  const [activePage, setActivePage] = useState('beranda');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [indexedFile, setIndexedFile] = useState('Memuat...');
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  const apiHeaders = { 'ngrok-skip-browser-warning': 'true' };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/documents`, { cache: 'no-store', headers: apiHeaders });
      const data = await response.json();
      if (response.ok) setDocuments(data);
    } catch (err) { console.error("Error saat fetch riwayat:", err); }
  };

  const fetchAllTags = async () => {
    try {
        const response = await fetch(`${API_URL}/tags`, { headers: apiHeaders });
        const data = await response.json();
        if (response.ok) setAllTags(data);
    } catch (err) { console.error("Error saat fetch tags:", err); }
  };

  const handleSwitchDocument = async (docId: string) => {
    if (!docId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/switch_document/${docId}`, { method: 'POST', headers: apiHeaders });
      const data = await response.json();
      if (response.ok) {
        setIndexedFile(data.filename);
        setActiveDocumentId(docId);
        localStorage.setItem(LOCAL_STORAGE_KEY, docId);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (err) { console.error("Error saat switch dokumen:", err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      await fetchDocuments();
      await fetchAllTags();
      const lastActiveId = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (lastActiveId) {
        await handleSwitchDocument(lastActiveId);
      } else {
        try {
          const latestDocResponse = await fetch(`${API_URL}/document/latest`, { cache: 'no-store', headers: apiHeaders });
          const latestDocData = await latestDocResponse.json();
          if (latestDocResponse.ok && latestDocData.id) {
            await handleSwitchDocument(latestDocData.id);
          } else {
            setIndexedFile("Tidak ada dokumen di database.");
          }
        } catch (err) { setIndexedFile("Gagal terhubung ke backend."); }
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const activeDoc = documents.find(doc => doc.id === activeDocumentId);
    if (activeDoc) {
      setIndexedFile(activeDoc.filename);
    }
  }, [activeDocumentId, documents]);

  const handleUploadSuccess = (newFileName: string) => {
    fetchDocuments();
    fetchAllTags();
  };

  const resetActiveFile = () => {
    setIndexedFile("Tidak ada dokumen yang dipilih.");
    setActiveDocumentId(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <div className="dark">
      <div className="flex h-screen bg-gray-900 text-white">
        <div className="hidden md:flex flex-shrink-0">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
        </div>
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-70" onClick={() => setIsSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <Sidebar 
                activePage={activePage} 
                setActivePage={(page) => {
                  setActivePage(page);
                  setIsSidebarOpen(false);
                }}
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col w-full min-w-0">
          <header className="sticky top-0 z-40 flex items-center justify-between bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-700 md:hidden">
            <div className="flex items-center gap-4">
              <button className="p-1 text-gray-300 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
                <FiMenu size={24} />
              </button>
              <h1 className="text-xl font-bold text-white">DocuSearch</h1>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {activePage === 'beranda' && (
              <BerandaPage 
                documents={documents} 
                setActivePage={setActivePage} 
              />
            )}
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
    </div>
  );
}
