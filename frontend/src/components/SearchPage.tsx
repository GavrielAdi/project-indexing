// file: frontend/src/components/SearchPage.tsx
'use client';

import { useState } from 'react';
import { FiSearch, FiFileText, FiLoader, FiChevronDown } from 'react-icons/fi';
import { Document } from '../app/page';

interface SearchPageProps {
  indexedFile: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  documents: Document[];
  activeDocumentId: string | null;
  onSwitchDocument: (docId: string) => void;
}

interface SearchResults {
  count: number;
  snippets: string[];
}

export default function SearchPage({ indexedFile, isLoading, setIsLoading, documents, activeDocumentId, onSwitchDocument }: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ count: 0, snippets: [] });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  const apiHeaders = { 'ngrok-skip-browser-warning': 'true' };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    let searchQuery = query;
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      searchQuery = suggestions[activeIndex];
      setQuery(searchQuery);
    }
    if (!searchQuery) return;
    
    setHasSearched(true);
    setIsLoading(true);
    setSuggestions([]);
    setActiveIndex(-1);
    setResults({ count: 0, snippets: [] });
    try {
      const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(searchQuery)}`, { headers: apiHeaders });
      const data = await response.json();
      setResults(data);
    } catch (err) { console.error("Gagal melakukan pencarian:", err); }
    finally { setIsLoading(false); }
  };

  const handleQueryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setActiveIndex(-1);
    if (newQuery.length > 1) {
      try {
        const response = await fetch(`${API_URL}/autocomplete?prefix=${encodeURIComponent(newQuery)}`, { headers: apiHeaders });
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6">
        <div>
          <label htmlFor="doc-select" className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-2">
            <FiFileText /> 1. Pilih Dokumen Aktif
          </label>
          <div className="relative">
            <select
              id="doc-select"
              value={activeDocumentId || ''}
              onChange={(e) => onSwitchDocument(e.target.value)}
              disabled={isLoading || documents.length === 0}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {documents.length > 0 ? (
                documents.map(doc => (
                  <option key={doc.id} value={doc.id} className="bg-gray-800 text-white">
                    {doc.filename}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {isLoading ? 'Memuat...' : 'Tidak ada dokumen tersedia'}
                </option>
              )}
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="relative">
          <label htmlFor="search-input" className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-2">
            <FiSearch /> 2. Masukkan Frasa Pencarian
          </label>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input id="search-input" type="text" value={query} onChange={handleQueryChange} onKeyDown={handleKeyDown} placeholder="Ketik di sini..." disabled={isLoading || !activeDocumentId} className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
            <button type="submit" disabled={isLoading || !activeDocumentId} className="flex-shrink-0 flex justify-center items-center bg-blue-600 text-white font-bold p-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500">
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

      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Hasil Pencarian</h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            <FiLoader className="animate-spin inline-block mr-2" /> Mencari...
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-8 text-gray-500">
            Hasil akan ditampilkan di sini setelah Anda melakukan pencarian.
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-400 mb-4">{results.count} hasil ditemukan untuk kueri Anda.</p>
            {results.count > 0 ? (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {results.snippets.map((snippet, index) => (
                  <div key={index} dangerouslySetInnerHTML={{ __html: snippet.replace(/<strong>/g, '<strong class="bg-yellow-400 text-gray-900 font-bold px-1 rounded">') }} className="text-gray-300 border-l-4 border-blue-500 pl-4 py-2 text-justify leading-relaxed" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Tidak ada hasil yang cocok ditemukan.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
