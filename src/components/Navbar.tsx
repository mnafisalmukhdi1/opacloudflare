import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { User } from '../types';
import { isApiAvailable } from '../store';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const apiMode = isApiAvailable();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="material-icons text-3xl text-amber-400">local_library</span>
            <span className="text-xl font-bold">Perpustakaan Digital</span>
            <span className={`hidden sm:inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
              apiMode ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
            }`}>
              {apiMode ? '☁ Cloud' : '💾 Local'}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-indigo-800 transition">
              <span className="material-icons text-lg">home</span>
              <span>Beranda</span>
            </Link>
            <Link to="/search" className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-indigo-800 transition">
              <span className="material-icons text-lg">search</span>
              <span>Katalog</span>
            </Link>

            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/books" className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-indigo-800 transition">
                      <span className="material-icons text-lg">library_books</span>
                      <span>Kelola Buku</span>
                    </Link>
                    <Link to="/admin/borrows" className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-indigo-800 transition">
                      <span className="material-icons text-lg">assignment</span>
                      <span>Peminjaman</span>
                    </Link>
                  </>
                )}
                <Link to="/profile" className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-indigo-800 transition">
                  <span className="material-icons text-lg">person</span>
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition"
                >
                  <span className="material-icons text-lg">logout</span>
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-indigo-900 font-semibold transition"
              >
                <span className="material-icons text-lg">login</span>
                <span>Masuk</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <MobileMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </nav>
  );
}

function MobileMenu({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-indigo-800">
        <span className="material-icons">{open ? 'close' : 'menu'}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-indigo-800 rounded-lg shadow-xl py-2">
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center space-x-2 px-4 py-2 hover:bg-indigo-700">
            <span className="material-icons text-lg">home</span>
            <span>Beranda</span>
          </Link>
          <Link to="/search" onClick={() => setOpen(false)} className="flex items-center space-x-2 px-4 py-2 hover:bg-indigo-700">
            <span className="material-icons text-lg">search</span>
            <span>Katalog</span>
          </Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/books" onClick={() => setOpen(false)} className="flex items-center space-x-2 px-4 py-2 hover:bg-indigo-700">
                    <span className="material-icons text-lg">library_books</span>
                    <span>Kelola Buku</span>
                  </Link>
                  <Link to="/admin/borrows" onClick={() => setOpen(false)} className="flex items-center space-x-2 px-4 py-2 hover:bg-indigo-700">
                    <span className="material-icons text-lg">assignment</span>
                    <span>Peminjaman</span>
                  </Link>
                </>
              )}
              <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center space-x-2 px-4 py-2 hover:bg-indigo-700">
                <span className="material-icons text-lg">person</span>
                <span>Profil</span>
              </Link>
              <button onClick={() => { onLogout(); setOpen(false); }} className="flex items-center space-x-2 px-4 py-2 hover:bg-indigo-700 w-full text-left text-red-300">
                <span className="material-icons text-lg">logout</span>
                <span>Keluar</span>
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="flex items-center space-x-2 px-4 py-2 hover:bg-indigo-700">
              <span className="material-icons text-lg">login</span>
              <span>Masuk / Daftar</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
