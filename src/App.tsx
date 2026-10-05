import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import BookDetailPage from './pages/BookDetailPage';
import AddBookPage from './pages/AddBookPage';
import ProfilePage from './pages/ProfilePage';
import AdminBooksPage from './pages/AdminBooksPage';
import AdminBorrowsPage from './pages/AdminBorrowsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/admin/books" element={<AdminBooksPage />} />
            <Route path="/admin/books/add" element={<AddBookPage />} />
            <Route path="/admin/borrows" element={<AdminBorrowsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
