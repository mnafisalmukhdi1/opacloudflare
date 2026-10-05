import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getBorrowsAsync, getBookByIdAsync, getUserByIdAsync, returnBookAsync, getUsersAsync, refreshBooksCache, borrowBookAsync } from '../store';
import { Book, BorrowRecord, User } from '../types';

export default function AdminBorrowsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [books, setBooks] = useState<Map<string, Book>>(new Map());
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [filter, setFilter] = useState<'all' | 'borrowed' | 'returned' | 'overdue'>('all');
  const [manualBorrowBookId, setManualBorrowBookId] = useState('');
  const [manualBorrowUserId, setManualBorrowUserId] = useState('');
  const [showManualBorrow, setShowManualBorrow] = useState(false);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    refreshData();
  }, [user]);

  const refreshData = async () => {
    const allBorrows = await getBorrowsAsync();
    setBorrows(allBorrows);

    const bookMap = new Map<string, Book>();
    const userMap = new Map<string, User>();

    for (const b of allBorrows) {
      const book = await getBookByIdAsync(b.bookId);
      if (book) bookMap.set(b.bookId, book);
      const u = await getUserByIdAsync(b.userId);
      if (u) userMap.set(b.userId, u);
    }

    setBooks(bookMap);
    setUsers(userMap);
    const allBooksList = await refreshBooksCache();
    setAllBooks(allBooksList.filter((b: Book) => b.availableCopies > 0));
    const allUsersList = await getUsersAsync();
    setAllUsers(allUsersList.filter((u: User) => u.role === 'member'));
  };

  const handleReturn = async (borrowId: string) => {
    await returnBookAsync(borrowId);
    refreshData();
  };

  const handleManualBorrow = async () => {
    if (!manualBorrowBookId || !manualBorrowUserId) return;
    await borrowBookAsync(manualBorrowBookId);
    setShowManualBorrow(false);
    setManualBorrowBookId('');
    setManualBorrowUserId('');
    refreshData();
  };

  const filteredBorrows = borrows.filter((b) => {
    if (filter === 'borrowed') return b.status === 'borrowed';
    if (filter === 'returned') return b.status === 'returned';
    if (filter === 'overdue') {
      return b.status === 'borrowed' && new Date(b.dueDate) < new Date();
    }
    return true;
  });

  const stats = {
    total: borrows.length,
    borrowed: borrows.filter((b) => b.status === 'borrowed').length,
    returned: borrows.filter((b) => b.status === 'returned').length,
    overdue: borrows.filter((b) => b.status === 'borrowed' && new Date(b.dueDate) < new Date()).length,
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span className="material-icons text-indigo-600">assignment</span>
              Manajemen Peminjaman
            </h1>
            <p className="text-gray-500 mt-1">Kelola semua peminjaman buku</p>
          </div>
          <button
            onClick={() => setShowManualBorrow(!showManualBorrow)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
          >
            <span className="material-icons">{showManualBorrow ? 'close' : 'add'}</span>
            {showManualBorrow ? 'Tutup' : 'Peminjaman Manual'}
          </button>
        </div>

        {/* Manual Borrow Form */}
        {showManualBorrow && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <span className="material-icons text-indigo-500">swap_horiz</span>
              Catat Peminjaman Manual
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Buku</label>
                <select
                  value={manualBorrowBookId}
                  onChange={(e) => setManualBorrowBookId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Buku --</option>
                  {allBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.availableCopies} tersedia)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Peminjam</label>
                <select
                  value={manualBorrowUserId}
                  onChange={(e) => setManualBorrowUserId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleManualBorrow}
                  disabled={!manualBorrowBookId || !manualBorrowUserId}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-icons">check</span>
                  Catat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <span className="material-icons text-sm">assignment</span>
              Total
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.borrowed}</div>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <span className="material-icons text-sm">library_books</span>
              Dipinjam
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.returned}</div>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <span className="material-icons text-sm">assignment_return</span>
              Dikembalikan
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <span className="material-icons text-sm">warning</span>
              Terlambat
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Semua', icon: 'list' },
              { key: 'borrowed', label: 'Dipinjam', icon: 'library_books' },
              { key: 'returned', label: 'Dikembalikan', icon: 'assignment_return' },
              { key: 'overdue', label: 'Terlambat', icon: 'warning' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === f.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="material-icons text-sm">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Borrows Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Buku</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Peminjam</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 hidden md:table-cell">Tgl Pinjam</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 hidden md:table-cell">Jatuh Tempo</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBorrows.map((borrow) => {
                  const book = books.get(borrow.bookId);
                  const borrower = users.get(borrow.userId);
                  const isOverdue = borrow.status === 'borrowed' && new Date(borrow.dueDate) < new Date();

                  return (
                    <tr key={borrow.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800 truncate max-w-[200px]">
                          {book?.title || 'Buku'}
                        </p>
                        <p className="text-xs text-gray-500">{book?.isbn}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-800">{borrower?.name || 'Anggota'}</p>
                        <p className="text-xs text-gray-500">{borrower?.email}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">{borrow.borrowDate}</td>
                      <td className={`py-3 px-4 text-sm hidden md:table-cell ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {borrow.dueDate}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          borrow.status === 'returned'
                            ? 'bg-green-100 text-green-700'
                            : isOverdue
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {borrow.status === 'returned' ? 'Dikembalikan' : isOverdue ? 'Terlambat' : 'Dipinjam'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {borrow.status === 'borrowed' && (
                          <button
                            onClick={() => handleReturn(borrow.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 mx-auto"
                          >
                            <span className="material-icons text-xs">assignment_return</span>
                            Kembali
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredBorrows.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <span className="material-icons text-4xl text-gray-300">assignment</span>
              <p className="mt-2">Tidak ada data peminjaman.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
