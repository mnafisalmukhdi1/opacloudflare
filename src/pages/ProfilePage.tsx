import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getBorrowsByUserAsync, getBookByIdAsync, returnBookAsync } from '../store';
import { Book, BorrowRecord } from '../types';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [books, setBooks] = useState<Map<string, Book>>(new Map());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const loadData = async () => {
      const userBorrows = await getBorrowsByUserAsync(user.id);
      setBorrows(userBorrows);

      const bookMap = new Map<string, Book>();
      for (const b of userBorrows) {
        const book = await getBookByIdAsync(b.bookId);
        if (book) bookMap.set(b.bookId, book);
      }
      setBooks(bookMap);
    };
    loadData();
  }, [user]);

  const handleReturn = async (borrowId: string) => {
    await returnBookAsync(borrowId);
    // Refresh
    if (user) {
      const userBorrows = await getBorrowsByUserAsync(user.id);
      setBorrows(userBorrows);
      const bookMap = new Map<string, Book>();
      for (const b of userBorrows) {
        const book = await getBookByIdAsync(b.bookId);
        if (book) bookMap.set(b.bookId, book);
      }
      setBooks(bookMap);
    }
  };

  if (!user) return null;

  const activeBorrows = borrows.filter((b) => b.status === 'borrowed');
  const returnedBorrows = borrows.filter((b) => b.status === 'returned');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="material-icons text-4xl text-white">person</span>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-indigo-200">
                  {user.role === 'admin' ? 'Administrator' : 'Anggota Perpustakaan'}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-600">
                <span className="material-icons text-indigo-500">email</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <span className="material-icons text-indigo-500">phone</span>
                <span>{user.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <span className="material-icons text-indigo-500">home</span>
                <span>{user.address || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <span className="material-icons text-indigo-500">calendar_today</span>
                <span>Bergabung sejak: {user.memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Borrows */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <span className="material-icons text-blue-600">library_books</span>
            Buku Sedang Dipinjam
            {activeBorrows.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-sm px-2 py-0.5 rounded-full">
                {activeBorrows.length}
              </span>
            )}
          </h2>

          {activeBorrows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="material-icons text-4xl text-gray-300">check_circle</span>
              <p className="mt-2">Tidak ada buku yang sedang dipinjam.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBorrows.map((borrow) => {
                const book = books.get(borrow.bookId);
                const isOverdue = new Date(borrow.dueDate) < new Date();
                return (
                  <div
                    key={borrow.id}
                    className={`border rounded-xl p-4 flex items-center gap-4 ${
                      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="w-12 h-16 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-indigo-400">menu_book</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 truncate"
                        onClick={() => navigate(`/book/${borrow.bookId}`)}
                      >
                        {book?.title || 'Buku'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Dipinjam: {borrow.borrowDate} • Jatuh tempo: {borrow.dueDate}
                      </p>
                      {isOverdue && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                          <span className="material-icons text-xs">warning</span>
                          Terlambat! Segera kembalikan.
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleReturn(borrow.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1"
                    >
                      <span className="material-icons text-sm">assignment_return</span>
                      Kembalikan
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Borrow History */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <span className="material-icons text-gray-600">history</span>
            Riwayat Peminjaman
          </h2>

          {returnedBorrows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="material-icons text-4xl text-gray-300">history</span>
              <p className="mt-2">Belum ada riwayat peminjaman.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {returnedBorrows.map((borrow) => {
                const book = books.get(borrow.bookId);
                return (
                  <div
                    key={borrow.id}
                    className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 bg-gray-50"
                  >
                    <div className="w-12 h-16 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="material-icons text-green-500">check_circle</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 truncate"
                        onClick={() => navigate(`/book/${borrow.bookId}`)}
                      >
                        {book?.title || 'Buku'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Dipinjam: {borrow.borrowDate} • Dikembalikan: {borrow.returnDate || '-'}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Dikembalikan
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
