import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { User } from '../types';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(email, password);
    if (user) {
      navigate(user.role === 'admin' ? '/admin/borrows' : '/profile');
    } else {
      setError('Email atau password salah.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Nama, email, dan password wajib diisi.');
      return;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      role: 'member',
      memberSince: new Date().toISOString().split('T')[0],
      phone,
      address,
    };

    register(newUser);
    setSuccess('Pendaftaran berhasil! Silakan login.');
    setIsLogin(true);
    setName('');
    setPhone('');
    setAddress('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-900 text-white p-8 text-center">
            <span className="material-icons text-5xl text-amber-400 mb-2">
              {isLogin ? 'login' : 'person_add'}
            </span>
            <h1 className="text-2xl font-bold">
              {isLogin ? 'Masuk ke Akun Anda' : 'Daftar Anggota Baru'}
            </h1>
            <p className="text-indigo-300 mt-1">
              {isLogin ? 'Masukkan kredensial Anda' : 'Buat akun untuk meminjam buku'}
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <span className="material-icons text-lg">error</span>
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <span className="material-icons text-lg">check_circle</span>
                {success}
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-3 text-gray-400">email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-3 text-gray-400">lock</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <span className="material-icons">login</span>
                  Masuk
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-3 text-gray-400">person</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Nama lengkap"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-3 text-gray-400">email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-3 text-gray-400">lock</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Minimal 6 karakter"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-3 text-gray-400">phone</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-3 text-gray-400">home</span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Alamat lengkap"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <span className="material-icons">person_add</span>
                  Daftar
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
                <button
                  onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
                </button>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-2">Akun Demo:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p><span className="font-medium">Admin:</span> admin@perpustakaan.id / admin123</p>
                <p><span className="font-medium">Anggota:</span> budi@email.com / budi123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
