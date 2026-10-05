import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { refreshBooksCache, deleteBook } from '../store';
import { Book } from '../types';

export default function AdminBooksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    refreshBooksCache().then(setBooks);
  }, [user]);

  const handleDelete = async (id: string) => {
    await deleteBook(id);
    const updated = await refreshBooksCache();
    setBooks(updated);
    setDeleteConfirm(null);
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.authors.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.isbn.includes(searchTerm)
  );

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span className="material-icons text-indigo-600">library_books</span>
              Kelola Buku
            </h1>
            <p className="text-gray-500 mt-1">Total: {books.length} buku dalam koleksi</p>
          </div>
          <button
            onClick={() => navigate('/admin/books/add')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
          >
            <span className="material-icons">add</span>
            Tambah Buku
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <span className="material-icons absolute left-3 top-3 text-gray-400">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari buku berdasarkan judul, penulis, atau ISBN..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Buku</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 hidden md:table-cell">ISBN</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Penerbit</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Stok</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                          <span className="material-icons text-indigo-400 text-lg">menu_book</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-[200px]">{book.title}</p>
                          <p className="text-sm text-gray-500 truncate">{book.authors.join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">{book.isbn}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 hidden lg:table-cell">{book.publisher}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {book.availableCopies}/{book.totalCopies}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/book/${book.id}`)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Lihat Detail"
                        >
                          <span className="material-icons text-lg">visibility</span>
                        </button>
                        {deleteConfirm === book.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(book.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Konfirmasi Hapus"
                            >
                              <span className="material-icons text-lg">check</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                              title="Batal"
                            >
                              <span className="material-icons text-lg">close</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(book.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <span className="material-icons text-lg">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <span className="material-icons text-4xl text-gray-300">search_off</span>
              <p className="mt-2">Tidak ada buku yang cocok.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
