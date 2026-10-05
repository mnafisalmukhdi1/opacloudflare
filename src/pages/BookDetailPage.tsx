import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById, borrowBook, getBorrowsByBook, getBorrowsByUser } from '../store';
import { Book, BorrowRecord } from '../types';
import { useAuth } from '../AuthContext';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [borrowSuccess, setBorrowSuccess] = useState('');
  const [borrowError, setBorrowError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const b = getBookById(id);
      if (b) {
        setBook(b);
        setBorrows(getBorrowsByBook(id));
      }
    }
  }, [id]);

  const handleBorrow = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!book) return;

    // Check if user already borrowing this book
    const userBorrows = getBorrowsByUser(user.id);
    const alreadyBorrowed = userBorrows.some(
      (b) => b.bookId === book.id && b.status === 'borrowed'
    );

    if (alreadyBorrowed) {
      setBorrowError('Anda sudah meminjam buku ini.');
      return;
    }

    if (book.availableCopies <= 0) {
      setBorrowError('Maaf, buku ini tidak tersedia saat ini.');
      return;
    }

    borrowBook(book.id, user.id);
    setBorrowSuccess('Buku berhasil dipinjam! Silakan ambil di perpustakaan.');
    setBorrowError('');

    // Refresh book data
    const updated = getBookById(book.id);
    if (updated) setBook(updated);
    setBorrows(getBorrowsByBook(book.id));
  };

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons text-6xl text-gray-300">book</span>
          <h2 className="text-xl font-semibold text-gray-600 mt-4">Buku tidak ditemukan</h2>
          <button onClick={() => navigate('/search')} className="mt-4 text-indigo-600 hover:text-indigo-800">
            Kembali ke katalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-indigo-600">Beranda</button>
          <span className="material-icons text-xs">chevron_right</span>
          <button onClick={() => navigate('/search')} className="hover:text-indigo-600">Katalog</button>
          <span className="material-icons text-xs">chevron_right</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{book.title}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Cover */}
            <div className="md:w-1/3 bg-gradient-to-br from-indigo-100 to-purple-100 p-8 flex items-center justify-center min-h-[300px]">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="max-h-80 w-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={`material-icons text-8xl text-indigo-300 ${book.coverUrl ? 'hidden' : ''}`}>
                menu_book
              </span>
            </div>

            {/* Details */}
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-gray-800">{book.title}</h1>
              <p className="text-lg text-gray-600 mt-2 flex items-center gap-2">
                <span className="material-icons">person</span>
                {book.authors.join(', ')}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="material-icons text-indigo-500">business</span>
                  <span><strong>Penerbit:</strong> {book.publisher}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="material-icons text-indigo-500">calendar_today</span>
                  <span><strong>Tahun:</strong> {book.publishYear}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="material-icons text-indigo-500">pages</span>
                  <span><strong>Halaman:</strong> {book.pages}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="material-icons text-indigo-500">tag</span>
                  <span><strong>ISBN:</strong> {book.isbn}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="material-icons text-indigo-500">category</span>
                  <span><strong>Klasifikasi:</strong> {book.classification}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`material-icons ${book.availableCopies > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {book.availableCopies > 0 ? 'check_circle' : 'cancel'}
                  </span>
                  <span className={`font-medium ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {book.availableCopies} dari {book.totalCopies} tersedia
                  </span>
                </div>
              </div>

              {/* Subjects */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Subjek:</h3>
                <div className="flex flex-wrap gap-2">
                  {book.subjects.map((s) => (
                    <span key={s} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Deskripsi:</h3>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                {borrowSuccess && (
                  <div className="w-full bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-icons">check_circle</span>
                    {borrowSuccess}
                  </div>
                )}
                {borrowError && (
                  <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-icons">error</span>
                    {borrowError}
                  </div>
                )}

                <button
                  onClick={handleBorrow}
                  disabled={book.availableCopies <= 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
                    book.availableCopies > 0
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="material-icons">library_add</span>
                  {book.availableCopies > 0 ? 'Pinjam Buku' : 'Tidak Tersedia'}
                </button>

                <button
                  onClick={() => navigate('/search')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition"
                >
                  <span className="material-icons">arrow_back</span>
                  Kembali
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Borrow History for this book */}
        {borrows.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <span className="material-icons text-indigo-600">history</span>
              Riwayat Peminjaman
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Peminjam</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Tgl Pinjam</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Jatuh Tempo</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {borrows.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">Anggota #{b.userId.slice(-4)}</td>
                      <td className="py-3 px-2">{b.borrowDate}</td>
                      <td className="py-3 px-2">{b.dueDate}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          b.status === 'returned' ? 'bg-green-100 text-green-700' :
                          b.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {b.status === 'returned' ? 'Dikembalikan' : b.status === 'overdue' ? 'Terlambat' : 'Dipinjam'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
