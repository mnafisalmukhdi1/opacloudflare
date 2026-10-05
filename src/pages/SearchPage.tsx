import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchBooks, searchBooksAsync, getBooks, refreshBooksCache } from '../store';
import { Book } from '../types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Book[]>([]);
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'year'>('title');
  const navigate = useNavigate();

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    const loadResults = async () => {
      if (q) {
        const data = await searchBooksAsync(q);
        setResults(data);
      } else {
        const data = await refreshBooksCache();
        setResults(data);
      }
    };
    loadResults();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'author') return a.authors[0].localeCompare(b.authors[0]);
    return b.publishYear.localeCompare(a.publishYear);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <span className="material-icons absolute left-4 top-3.5 text-gray-400">search</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari judul, penulis, ISBN, atau subjek..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <span className="material-icons">search</span>
              Cari
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {searchParams.get('q') ? `Hasil pencarian: "${searchParams.get('q')}"` : 'Semua Koleksi'}
            </h1>
            <p className="text-gray-500 mt-1">{sortedResults.length} buku ditemukan</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'title' | 'author' | 'year')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="title">Judul</option>
              <option value="author">Penulis</option>
              <option value="year">Tahun</option>
            </select>
          </div>
        </div>

        {/* Results list */}
        {sortedResults.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-icons text-6xl text-gray-300">search_off</span>
            <h2 className="text-xl font-semibold text-gray-600 mt-4">Tidak ada hasil</h2>
            <p className="text-gray-500 mt-2">Coba kata kunci lain atau periksa ejaan Anda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedResults.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 flex gap-4 cursor-pointer group border border-gray-100"
              >
                <div className="w-20 h-28 md:w-24 md:h-32 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`material-icons text-3xl text-indigo-300 ${book.coverUrl ? 'hidden' : ''}`}>
                    menu_book
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    <span className="material-icons text-sm align-middle mr-1">person</span>
                    {book.authors.join(', ')}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    <span className="material-icons text-sm align-middle mr-1">business</span>
                    {book.publisher} • {book.publishYear}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {book.subjects.slice(0, 3).map((s) => (
                      <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="material-icons text-xs">tag</span>
                      ISBN: {book.isbn}
                    </span>
                    <span className={`text-xs font-medium flex items-center gap-1 ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="material-icons text-xs">{book.availableCopies > 0 ? 'check_circle' : 'cancel'}</span>
                      {book.availableCopies > 0 ? `${book.availableCopies}/${book.totalCopies} tersedia` : 'Tidak tersedia'}
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex items-center">
                  <span className="material-icons text-gray-300 group-hover:text-indigo-400 transition">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
