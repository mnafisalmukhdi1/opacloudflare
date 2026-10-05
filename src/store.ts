import { Book, User, BorrowRecord } from './types';
import {
  API_URL, isApiAvailable,
  apiGetBooks, apiSearchBooks, apiGetBook, apiAddBook, apiUpdateBook, apiDeleteBook,
  apiLogin, apiRegister, apiGetUser, apiGetUsers,
  apiGetBorrows, apiGetBorrowsByUser, apiGetBorrowsByBook, apiBorrowBook, apiReturnBook,
} from './api';

const BOOKS_KEY = 'opac_books';
const USERS_KEY = 'opac_users';
const BORROWS_KEY = 'opac_borrows';
const SESSION_KEY = 'opac_session';

// ===== SAMPLE DATA (untuk fallback localStorage) =====
const sampleBooks: Book[] = [
  {
    id: '1', isbn: '9780061120084', title: 'To Kill a Mockingbird', authors: ['Harper Lee'],
    publisher: 'HarperCollins', publishYear: '1960', pages: 336,
    subjects: ['Fiction', 'Classic', 'American Literature'],
    description: 'A novel about racial injustice in the Deep South, seen through the eyes of young Scout Finch.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
    totalCopies: 5, availableCopies: 3, classification: '813.54', addedDate: '2024-01-15',
  },
  {
    id: '2', isbn: '9780451524935', title: '1984', authors: ['George Orwell'],
    publisher: 'Signet Classic', publishYear: '1949', pages: 328,
    subjects: ['Dystopian', 'Political Fiction', 'Science Fiction'],
    description: 'A dystopian novel set in a totalitarian society ruled by Big Brother.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
    totalCopies: 4, availableCopies: 2, classification: '823.912', addedDate: '2024-01-20',
  },
  {
    id: '3', isbn: '9780743273565', title: 'The Great Gatsby', authors: ['F. Scott Fitzgerald'],
    publisher: 'Scribner', publishYear: '1925', pages: 180,
    subjects: ['Fiction', 'Classic', 'American Literature', 'Jazz Age'],
    description: 'A story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
    totalCopies: 3, availableCopies: 3, classification: '813.52', addedDate: '2024-02-01',
  },
  {
    id: '4', isbn: '9780140283334', title: 'Pride and Prejudice', authors: ['Jane Austen'],
    publisher: 'Penguin Classics', publishYear: '1813', pages: 432,
    subjects: ['Romance', 'Classic', 'British Literature'],
    description: 'A romantic novel about the Bennet family and the relationship between Elizabeth Bennet and Mr. Darcy.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140283334-L.jpg',
    totalCopies: 6, availableCopies: 4, classification: '823.7', addedDate: '2024-02-10',
  },
  {
    id: '5', isbn: '9780451526538', title: 'The Adventures of Tom Sawyer', authors: ['Mark Twain'],
    publisher: 'Signet Classic', publishYear: '1876', pages: 216,
    subjects: ['Adventure', 'Classic', 'American Literature'],
    description: 'The story of a young boy growing up along the Mississippi River.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451526538-L.jpg',
    totalCopies: 3, availableCopies: 2, classification: '813.4', addedDate: '2024-02-15',
  },
  {
    id: '6', isbn: '9780141439518', title: 'Oliver Twist', authors: ['Charles Dickens'],
    publisher: 'Penguin Classics', publishYear: '1838', pages: 576,
    subjects: ['Fiction', 'Classic', 'British Literature', 'Social Commentary'],
    description: 'The story of an orphan boy in Victorian London who encounters a gang of pickpockets.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
    totalCopies: 2, availableCopies: 1, classification: '823.8', addedDate: '2024-03-01',
  },
];

const sampleUsers: User[] = [
  { id: 'admin1', name: 'Administrator', email: 'admin@perpustakaan.id', password: 'admin123', role: 'admin', memberSince: '2024-01-01', phone: '081234567890', address: 'Jl. Perpustakaan No. 1' },
  { id: 'user1', name: 'Budi Santoso', email: 'budi@email.com', password: 'budi123', role: 'member', memberSince: '2024-02-01', phone: '081234567891', address: 'Jl. Merdeka No. 10' },
];

const sampleBorrows: BorrowRecord[] = [
  { id: 'borrow1', bookId: '1', userId: 'user1', borrowDate: '2024-03-01', dueDate: '2024-03-15', status: 'returned', returnDate: '2024-03-14' },
  { id: 'borrow2', bookId: '2', userId: 'user1', borrowDate: '2024-03-10', dueDate: '2024-03-24', status: 'borrowed' },
];

// ===== LOCAL STORAGE HELPERS =====
function initLocalData() {
  if (!localStorage.getItem(BOOKS_KEY)) localStorage.setItem(BOOKS_KEY, JSON.stringify(sampleBooks));
  if (!localStorage.getItem(USERS_KEY)) localStorage.setItem(USERS_KEY, JSON.stringify(sampleUsers));
  if (!localStorage.getItem(BORROWS_KEY)) localStorage.setItem(BORROWS_KEY, JSON.stringify(sampleBorrows));
}

function localGetBooks(): Book[] { return JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]'); }
function localGetBookById(id: string): Book | undefined { return localGetBooks().find(b => b.id === id); }
function localSearchBooks(query: string): Book[] {
  const q = query.toLowerCase().trim();
  if (!q) return localGetBooks();
  return localGetBooks().filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.authors.some(a => a.toLowerCase().includes(q)) ||
    b.isbn.includes(q) ||
    b.subjects.some(s => s.toLowerCase().includes(q)) ||
    b.publisher.toLowerCase().includes(q) ||
    b.classification.includes(q)
  );
}
function localAddBook(book: Book) {
  const books = localGetBooks(); books.push(book);
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}
function localUpdateBook(book: Book) {
  const books = localGetBooks(); const idx = books.findIndex(b => b.id === book.id);
  if (idx >= 0) { books[idx] = book; localStorage.setItem(BOOKS_KEY, JSON.stringify(books)); }
}
function localDeleteBook(id: string) {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(localGetBooks().filter(b => b.id !== id)));
}
function localGetUsers(): User[] { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
function localGetUserById(id: string): User | undefined { return localGetUsers().find(u => u.id === id); }
function localGetUserByEmail(email: string): User | undefined { return localGetUsers().find(u => u.email === email); }
function localRegisterUser(user: User) {
  const users = localGetUsers(); users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function localLogin(email: string, password: string): User | null {
  const user = localGetUserByEmail(email);
  if (user && user.password === password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}
function localGetBorrows(): BorrowRecord[] { return JSON.parse(localStorage.getItem(BORROWS_KEY) || '[]'); }
function localGetBorrowsByUser(userId: string): BorrowRecord[] { return localGetBorrows().filter(b => b.userId === userId); }
function localGetBorrowsByBook(bookId: string): BorrowRecord[] { return localGetBorrows().filter(b => b.bookId === bookId); }
function localBorrowBook(bookId: string, userId: string): BorrowRecord {
  const borrow: BorrowRecord = {
    id: `borrow_${Date.now()}`, bookId, userId,
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'borrowed',
  };
  const borrows = localGetBorrows(); borrows.push(borrow);
  localStorage.setItem(BORROWS_KEY, JSON.stringify(borrows));
  const book = localGetBookById(bookId);
  if (book && book.availableCopies > 0) { book.availableCopies -= 1; localUpdateBook(book); }
  return borrow;
}
function localReturnBook(borrowId: string) {
  const borrows = localGetBorrows(); const idx = borrows.findIndex(b => b.id === borrowId);
  if (idx >= 0) {
    borrows[idx].status = 'returned';
    borrows[idx].returnDate = new Date().toISOString().split('T')[0];
    localStorage.setItem(BORROWS_KEY, JSON.stringify(borrows));
    const book = localGetBookById(borrows[idx].bookId);
    if (book) { book.availableCopies += 1; localUpdateBook(book); }
  }
}

// ===== HYBRID STORE (API + LocalStorage fallback) =====

export function initializeData() {
  initLocalData();
}

export function getApiMode(): 'api' | 'local' {
  return isApiAvailable() ? 'api' : 'local';
}

export { isApiAvailable };

// Books - sync wrapper (uses localStorage cache, API calls are async)
let booksCache: Book[] | null = null;

export function getBooks(): Book[] {
  if (booksCache) return booksCache;
  booksCache = localGetBooks();
  return booksCache;
}

export async function refreshBooksCache(): Promise<Book[]> {
  if (isApiAvailable()) {
    try {
      booksCache = await apiGetBooks();
      return booksCache;
    } catch {}
  }
  booksCache = localGetBooks();
  return booksCache;
}

export function getBookById(id: string): Book | undefined {
  return getBooks().find(b => b.id === id);
}

export async function getBookByIdAsync(id: string): Promise<Book | undefined> {
  if (isApiAvailable()) {
    try { return await apiGetBook(id); } catch {}
  }
  return localGetBookById(id);
}

export function searchBooks(query: string): Book[] {
  return localSearchBooks(query);
}

export async function searchBooksAsync(query: string): Promise<Book[]> {
  if (isApiAvailable()) {
    try { return await apiSearchBooks(query); } catch {}
  }
  return localSearchBooks(query);
}

export async function addBook(book: Book): Promise<void> {
  if (isApiAvailable()) {
    await apiAddBook(book);
    await refreshBooksCache();
  } else {
    localAddBook(book);
    booksCache = null;
  }
}

export async function updateBook(book: Book): Promise<void> {
  if (isApiAvailable()) {
    await apiUpdateBook(book.id, book);
    await refreshBooksCache();
  } else {
    localUpdateBook(book);
    booksCache = null;
  }
}

export async function deleteBook(id: string): Promise<void> {
  if (isApiAvailable()) {
    await apiDeleteBook(id);
    await refreshBooksCache();
  } else {
    localDeleteBook(id);
    booksCache = null;
  }
}

// Users
export function getUsers(): User[] {
  return localGetUsers();
}

export async function getUsersAsync(): Promise<User[]> {
  if (isApiAvailable()) {
    try { return await apiGetUsers(); } catch {}
  }
  return localGetUsers();
}

export function getUserById(id: string): User | undefined {
  return localGetUserById(id);
}

export async function getUserByIdAsync(id: string): Promise<User | undefined> {
  if (isApiAvailable()) {
    try { return await apiGetUser(id); } catch {}
  }
  return localGetUserById(id);
}

export function getUserByEmail(email: string): User | undefined {
  return localGetUserByEmail(email);
}

export function registerUser(user: User) {
  localRegisterUser(user);
}

export async function registerUserAsync(data: { name: string; email: string; password: string; phone?: string; address?: string }): Promise<{ id: string }> {
  if (isApiAvailable()) {
    return await apiRegister(data);
  }
  const user: User = {
    id: `user_${Date.now()}`, ...data, role: 'member',
    memberSince: new Date().toISOString().split('T')[0],
  };
  localRegisterUser(user);
  return { id: user.id };
}

export function loginUser(email: string, password: string): User | null {
  return localLogin(email, password);
}

export async function loginUserAsync(email: string, password: string): Promise<User | null> {
  if (isApiAvailable()) {
    try {
      const user = await apiLogin(email, password);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch { return null; }
  }
  return localLogin(email, password);
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

// Borrows
export function getBorrows(): BorrowRecord[] {
  return localGetBorrows();
}

export async function getBorrowsAsync(): Promise<BorrowRecord[]> {
  if (isApiAvailable()) {
    try { return await apiGetBorrows(); } catch {}
  }
  return localGetBorrows();
}

export function getBorrowsByUser(userId: string): BorrowRecord[] {
  return localGetBorrowsByUser(userId);
}

export async function getBorrowsByUserAsync(userId: string): Promise<BorrowRecord[]> {
  if (isApiAvailable()) {
    try { return await apiGetBorrowsByUser(userId); } catch {}
  }
  return localGetBorrowsByUser(userId);
}

export function getBorrowsByBook(bookId: string): BorrowRecord[] {
  return localGetBorrowsByBook(bookId);
}

export async function getBorrowsByBookAsync(bookId: string): Promise<BorrowRecord[]> {
  if (isApiAvailable()) {
    try { return await apiGetBorrowsByBook(bookId); } catch {}
  }
  return localGetBorrowsByBook(bookId);
}

export function borrowBook(bookId: string, userId: string): BorrowRecord {
  return localBorrowBook(bookId, userId);
}

export async function borrowBookAsync(bookId: string): Promise<BorrowRecord> {
  if (isApiAvailable()) {
    return await apiBorrowBook(bookId);
  }
  const user = getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  return localBorrowBook(bookId, user.id);
}

export function returnBook(borrowId: string) {
  localReturnBook(borrowId);
}

export async function returnBookAsync(borrowId: string): Promise<void> {
  if (isApiAvailable()) {
    await apiReturnBook(borrowId);
  } else {
    localReturnBook(borrowId);
  }
}
