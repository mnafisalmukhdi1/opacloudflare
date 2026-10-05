import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBook as addBookStore } from '../store';
import { Book } from '../types';
import { useAuth } from '../AuthContext';

export default function AddBookPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [apiError, setApiError] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishYear, setPublishYear] = useState('');
  const [pages, setPages] = useState('');
  const [subjects, setSubjects] = useState('');
  const [description, setDescription] = useState('');
  const [classification, setClassification] = useState('');
  const [totalCopies, setTotalCopies] = useState('1');
  const [coverUrl, setCoverUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons text-6xl text-red-300">block</span>
          <h2 className="text-xl font-semibold text-gray-600 mt-4">Akses Ditolak</h2>
          <p className="text-gray-500 mt-2">Halaman ini hanya untuk administrator.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 hover:text-indigo-800">
            Kembali ke beranda
          </button>
        </div>
      </div>
    );
  }

  const fetchFromOpenLibrary = async () => {
    if (!isbn.trim()) {
      setApiError('Masukkan ISBN terlebih dahulu.');
      return;
    }

    setLoading(true);
    setApiError('');
    setApiResult(null);

    try {
      const response = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn.trim()}&format=json&jscmd=data`
      );
      const data = await response.json();
      const key = `ISBN:${isbn.trim()}`;

      if (data[key]) {
        const bookData = data[key];
        setApiResult(bookData);

        // Auto-fill form
        setTitle(bookData.title || '');
        setAuthors(bookData.authors?.map((a: any) => a.name).join(', ') || '');
        setPublisher(bookData.publishers?.[0]?.name || '');
        setPublishYear(bookData.publish_date || '');
        setPages(bookData.number_of_pages?.toString() || '');
        setSubjects(bookData.subjects?.map((s: any) => s.name).join(', ') || '');
        setClassification(bookData.classifications?.dewey_decimal_class?.[0] || '');

        // Try to get cover
        const coverUrl = bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small || '';
        setCoverUrl(coverUrl);

        setSuccessMsg('Data berhasil diambil dari OpenLibrary! Silakan lengkapi informasi lainnya.');
      } else {
        setApiError('Buku dengan ISBN tersebut tidak ditemukan di OpenLibrary.');
      }
    } catch (err) {
      setApiError('Gagal mengambil data dari OpenLibrary. Periksa koneksi internet Anda.');
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !isbn) {
      setApiError('Judul dan ISBN wajib diisi.');
      return;
    }

    const newBook: Book = {
      id: `book_${Date.now()}`,
      isbn: isbn.trim(),
      title: title.trim(),
      authors: authors.split(',').map((a) => a.trim()).filter(Boolean),
      publisher: publisher.trim(),
      publishYear: publishYear.trim(),
      pages: parseInt(pages) || 0,
      subjects: subjects.split(',').map((s) => s.trim()).filter(Boolean),
      description: description.trim(),
      coverUrl: coverUrl.trim(),
      totalCopies: parseInt(totalCopies) || 1,
      availableCopies: parseInt(totalCopies) || 1,
      classification: classification.trim(),
      addedDate: new Date().toISOString().split('T')[0],
    };

    await addBookStore(newBook);
    setSuccessMsg('Buku berhasil ditambahkan ke katalog!');
    setApiError('');

    // Reset form
    setIsbn('');
    setTitle('');
    setAuthors('');
    setPublisher('');
    setPublishYear('');
    setPages('');
    setSubjects('');
    setDescription('');
    setClassification('');
    setTotalCopies('1');
    setCoverUrl('');
    setApiResult(null);

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-icons text-3xl text-indigo-600">add_circle</span>
          <h1 className="text-3xl font-bold text-gray-800">Tambah Buku Baru</h1>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="material-icons">check_circle</span>
            {successMsg}
          </div>
        )}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="material-icons">error</span>
            {apiError}
          </div>
        )}

        {/* OpenLibrary API Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <span className="material-icons text-indigo-500">cloud_download</span>
            Ambil Data dari OpenLibrary
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Masukkan ISBN buku untuk otomatis mengisi data dari OpenLibrary API.
          </p>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="material-icons absolute left-3 top-3 text-gray-400">barcode_reader</span>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Masukkan ISBN (contoh: 0451526538)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchFromOpenLibrary}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="material-icons animate-spin">autorenew</span>
                  Memuat...
                </>
              ) : (
                <>
                  <span className="material-icons">cloud_download</span>
                  Ambil Data
                </>
              )}
            </button>
          </div>

          {apiResult && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-sm text-indigo-700 font-medium">Data ditemukan:</p>
              <p className="text-indigo-900 font-semibold mt-1">{apiResult.title}</p>
              <p className="text-indigo-600 text-sm">
                {apiResult.authors?.map((a: any) => a.name).join(', ')} • {apiResult.publish_date}
              </p>
            </div>
          )}
        </div>

        {/* Book Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
            <span className="material-icons text-indigo-500">edit_note</span>
            Detail Buku
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penulis (pisahkan dengan koma)</label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Contoh: John Doe, Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penerbit</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Terbit</label>
              <input
                type="text"
                value={publishYear}
                onChange={(e) => setPublishYear(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Halaman</label>
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Klasifikasi (DDC)</label>
              <input
                type="text"
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Contoh: 813.54"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Eksemplar</label>
              <input
                type="number"
                value={totalCopies}
                onChange={(e) => setTotalCopies(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Cover</label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subjek (pisahkan dengan koma)</label>
              <input
                type="text"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Contoh: Fiction, Classic, American Literature"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Sinopsis atau deskripsi buku..."
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <span className="material-icons">save</span>
              Simpan Buku
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/books')}
              className="border border-gray-300 hover:bg-gray-50 px-8 py-3 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <span className="material-icons">cancel</span>
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
