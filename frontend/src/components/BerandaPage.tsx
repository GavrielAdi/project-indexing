// file: frontend/src/components/BerandaPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiFileText, FiTag, FiClock, FiLoader, FiSearch, FiUpload } from 'react-icons/fi';
import { Document } from '../app/page'; // Impor tipe Document

interface Stats {
    total_documents: number;
    total_tags: number;
    latest_upload: {
        filename: string;
        upload_date: string;
    } | null;
}

interface BerandaPageProps {
    documents: Document[];
    setActivePage: (page: string) => void;
}

const StatCard = ({ icon, title, value, isLoading }: any) => (
    <div className="bg-gray-800 p-6 rounded-2xl flex items-center gap-6">
        <div className="bg-gray-700 p-4 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            {isLoading ? (
                <div className="h-8 w-24 bg-gray-700 rounded animate-pulse mt-1"></div>
            ) : (
                <p className="text-2xl md:text-3xl font-bold text-white truncate" title={String(value)}>{String(value)}</p>
            )}
        </div>
    </div>
);


export default function BerandaPage({ documents, setActivePage }: BerandaPageProps) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const apiHeaders = { 'ngrok-skip-browser-warning': 'true' };

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            try {
                const response = await fetch(`${API_URL}/stats`, { headers: apiHeaders });
                const data = await response.json();
                if (response.ok) {
                    setStats(data);
                }
            } catch (err) {
                console.error("Gagal mengambil statistik:", err);
            } finally {
                setIsLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    // Ambil 5 dokumen pertama dari props untuk ditampilkan sebagai aktivitas terbaru
    const recentDocuments = documents.slice(0, 5);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Beranda</h1>
                <p className="text-gray-400 mt-2">Ringkasan data dan aktivitas terbaru dari sistem Anda.</p>
            </div>
            
            {/* Kartu Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    icon={<FiFileText size={24} className="text-blue-400" />}
                    title="Total Dokumen"
                    value={stats?.total_documents ?? 0}
                    isLoading={isLoadingStats}
                />
                <StatCard 
                    icon={<FiTag size={24} className="text-green-400" />}
                    title="Total Tag Unik"
                    value={stats?.total_tags ?? 0}
                    isLoading={isLoadingStats}
                />
                <StatCard 
                    icon={<FiClock size={24} className="text-yellow-400" />}
                    title="Upload Terakhir"
                    value={stats?.latest_upload?.filename ?? 'N/A'}
                    isLoading={isLoadingStats}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom Aktivitas Terbaru */}
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Aktivitas Terbaru</h2>
                    <div className="space-y-4">
                        {documents.length > 0 ? recentDocuments.map(doc => (
                            <div key={doc.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold text-white truncate">{doc.filename}</p>
                                    <p className="text-xs text-gray-400">Diubah oleh {doc.uploaded_by} pada {doc.last_modified_date}</p>
                                </div>
                                <div className="flex flex-wrap gap-1 justify-end">
                                    {doc.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="bg-gray-600 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-center py-4">Belum ada aktivitas.</p>
                        )}
                    </div>
                </div>

                {/* Kolom Akses Cepat */}
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-2xl flex flex-col gap-4 justify-center">
                     <h2 className="text-2xl font-bold text-white mb-2">Akses Cepat</h2>
                     <button onClick={() => setActivePage('pencarian')} className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        <FiSearch />
                        <span>Mulai Pencarian</span>
                     </button>
                     <button onClick={() => setActivePage('upload')} className="w-full flex items-center justify-center gap-3 bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                        <FiUpload />
                        <span>Upload Dokumen</span>
                     </button>
                </div>
            </div>
        </div>
    );
}
