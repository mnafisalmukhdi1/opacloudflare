import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, refreshBooksCache } from '../store';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState(() => getBooks());
  const navigate = useNavigate();

  React.useEffect(() => {
    refreshBooksCache().then(setBooks);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const recentBooks = books.slice(-6).reverse();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <span className="material-icons text-7xl text-amber-400">auto_stories</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              Perpustakaan Digital
            </h1>
            <p className="text-xl md:text-2xl text-indigo-200 mb-8">
              Jelajahi koleksi buku kami secara online. Temukan, pinjam, dan baca kapan saja.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-full shadow-2xl overflow-hidden">
                <span className="material-icons text-gray-400 ml-4">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari judul, penulis, ISBN, atau subjek..."
                  className="flex-1 px-4 py-4 text-gray-800 text-lg focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-indigo-900 font-bold px-8 py-4 transition"
                >
                  Cari
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['Fiction', 'Classic', 'American Literature', 'British Literature', 'Dystopian'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  className="px-3 py-1 bg-indigo-700/50 hover:bg-indigo-700 rounded-full text-sm transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-indigo-900">{books.length}</div>
              <div className="text-gray-500 flex items-center justify-center gap-1">
                <span className="material-icons text-lg">menu_book</span>
                Total Buku
              </div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-indigo-900">{books.reduce((a, b) => a + b.totalCopies, 0)}</div>
              <div className="text-gray-500 flex items-center justify-center gap-1">
                <span className="material-icons text-lg">library_books</span>
                Total Eksemplar
              </div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-indigo-900">{books.reduce((a, b) => a + b.availableCopies, 0)}</div>
              <div className="text-gray-500 flex items-center justify-center gap-1">
                <span className="material-icons text-lg">check_circle</span>
                Tersedia
              </div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-indigo-900">{new Set(books.flatMap(b => b.authors)).size}</div>
              <div className="text-gray-500 flex items-center justify-center gap-1">
                <span className="material-icons text-lg">people</span>
                Penulis
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Books */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span className="material-icons text-indigo-600">new_releases</span>
              Buku Terbaru
            </h2>
            <button
              onClick={() => navigate('/search')}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              Lihat Semua
              <span className="material-icons">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              >
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`material-icons text-6xl text-indigo-300 ${book.coverUrl ? 'hidden' : ''}`}>
                    menu_book
                  </span>
                  {book.availableCopies === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Habis
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{book.authors.join(', ')}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      {book.classification}
                    </span>
                    <span className={`text-xs font-medium ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {book.availableCopies > 0 ? `${book.availableCopies} tersedia` : 'Tidak tersedia'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Layanan Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <span className="material-icons text-5xl text-indigo-600 mb-4">search</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Katalog Online</h3>
              <p className="text-gray-600">Cari dan temukan buku dari koleksi perpustakaan kami secara online.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <span className="material-icons text-5xl text-green-600 mb-4">swap_horiz</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Peminjaman Mudah</h3>
              <p className="text-gray-600">Pinjam buku dengan mudah melalui sistem peminjaman online kami.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50">
              <span className="material-icons text-5xl text-amber-600 mb-4">notifications_active</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Notifikasi</h3>
              <p className="text-gray-600">Dapatkan pengingat saat batas waktu peminjaman hampir habis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-indigo-300">© 2024 Perpustakaan Digital. Powered by Cloudflare.</p>
        </div>
      </footer>
    </div>
  );
}
