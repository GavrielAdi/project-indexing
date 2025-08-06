// file: frontend/src/components/SearchPage.tsx
'use client';

import { useState } from 'react';
import { FiSearch, FiFileText, FiLoader, FiChevronDown } from 'react-icons/fi';
import { Document } from '../app/page'; // Impor tipe Document

// Definisikan tipe untuk props yang diterima dari parent
interface SearchPageProps {
  indexedFile: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  documents: Document[]; // Terima daftar dokumen
  activeDocumentId: string | null; // Terima ID yang aktif
  onSwitchDocument: (docId: string) => void; // Terima fungsi switch
}

// Definisikan tipe untuk hasil pencarian
interface SearchResults {
  count: number;
  snippets: string[];
}

export default function SearchPage({ indexedFile, isLoading, setIsLoading, documents, activeDocumentId, onSwitchDocument }: SearchPageProps) {
  // State khusus untuk halaman pencarian
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ count: 0, snippets: [] });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const API_URL = 'http://127.0.0.1:5000';

  // Handler pencarian tidak berubah
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    let searchQuery = query;
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      searchQuery = suggestions[activeIndex];
      setQuery(searchQuery);
    }
    if (!searchQuery) return;
    setIsLoading(true);
    setSuggestions([]);
    setActiveIndex(-1);
    setResults({ count: 0, snippets: [] });
    try {
      const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data);
    } catch (err) { console.error("Gagal melakukan pencarian:", err); }
    finally { setIsLoading(false); }
  };

  // Handler lain juga tidak berubah
  const handleQueryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setActiveIndex(-1);
    if (newQuery.length > 1) {
      try {
        const response = await fetch(`${API_URL}/autocomplete?prefix=${newQuery}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Autocomplete fetch failed:", err);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prevIndex => (prevIndex + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prevIndex => (prevIndex - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  };

  return (
    <div className="space-y-8">
      {/* --- BAGIAN INI BERUBAH MENJADI DROPDOWN --- */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center gap-4">
        <FiFileText className="text-2xl text-blue-400 flex-shrink-0" />
        <div className="flex-grow">
          <label htmlFor="doc-select" className="text-sm text-gray-400">File Aktif Untuk Pencarian</label>
          <div className="relative">
            <select
              id="doc-select"
              value={activeDocumentId || ''}
              onChange={(e) => onSwitchDocument(e.target.value)}
              disabled={isLoading || documents.length === 0}
              className="w-full bg-transparent font-semibold text-white appearance-none focus:outline-none pr-8"
            >
              {documents.length > 0 ? (
                documents.map(doc => (
                  <option key={doc.id} value={doc.id} className="bg-gray-800 text-white">
                    {doc.filename}
                  </option>
                ))
              ) : (
                <option value="" disabled>Tidak ada dokumen tersedia</option>
              )}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Kolom Kiri: Input Pencarian */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white"><FiSearch /> Cari Frasa</h2>
            <div className="relative">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input type="text" value={query} onChange={handleQueryChange} onKeyDown={handleKeyDown} placeholder="Masukkan frasa..." disabled={isLoading || !activeDocumentId} className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600" />
                <button type="submit" disabled={isLoading || !activeDocumentId} className="flex justify-center items-center bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500">
                  {isLoading ? <FiLoader className="animate-spin" /> : <FiSearch />}
                </button>
              </form>
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded-lg shadow-xl border border-gray-600 max-h-60 overflow-y-auto">
                  <ul>{suggestions.map((word, index) => (<li key={index} onClick={() => { setQuery(word); setSuggestions([]); }} className={`px-4 py-2 cursor-pointer transition-colors ${index === activeIndex ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>{word}</li>))}</ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Hasil Pencarian */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md h-full">
            <h3 className="text-2xl font-semibold mb-4 text-white">Hasil Pencarian</h3>
            <p className="text-sm text-gray-400 mb-4">{results.count} hasil ditemukan</p>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {results.snippets.map((snippet, index) => (<div key={index} dangerouslySetInnerHTML={{ __html: snippet.replace(/<strong>/g, '<strong class="bg-yellow-400 text-gray-900 font-bold px-1 rounded">') }} className="text-gray-300 border-l-4 border-blue-500 pl-4 py-2 text-justify" />))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
