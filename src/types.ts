export interface Book {
  id: string;
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  publishYear: string;
  pages: number;
  subjects: string[];
  description: string;
  coverUrl: string;
  totalCopies: number;
  availableCopies: number;
  classification: string;
  addedDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
  memberSince: string;
  phone?: string;
  address?: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}
