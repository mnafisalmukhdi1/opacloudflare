import { Book, User, BorrowRecord } from './types';

const BOOKS_KEY = 'opac_books';
const USERS_KEY = 'opac_users';
const BORROWS_KEY = 'opac_borrows';
const SESSION_KEY = 'opac_session';

// Sample data
const sampleBooks: Book[] = [
  {
    id: '1',
    isbn: '9780061120084',
    title: 'To Kill a Mockingbird',
    authors: ['Harper Lee'],
    publisher: 'HarperCollins',
    publishYear: '1960',
    pages: 336,
    subjects: ['Fiction', 'Classic', 'American Literature'],
    description: 'A novel about racial injustice in the Deep South, seen through the eyes of young Scout Finch.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
    totalCopies: 5,
    availableCopies: 3,
    classification: '813.54',
    addedDate: '2024-01-15',
  },
  {
    id: '2',
    isbn: '9780451524935',
    title: '1984',
    authors: ['George Orwell'],
    publisher: 'Signet Classic',
    publishYear: '1949',
    pages: 328,
    subjects: ['Dystopian', 'Political Fiction', 'Science Fiction'],
    description: 'A dystopian novel set in a totalitarian society ruled by Big Brother.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
    totalCopies: 4,
    availableCopies: 2,
    classification: '823.912',
    addedDate: '2024-01-20',
  },
  {
    id: '3',
    isbn: '9780743273565',
    title: 'The Great Gatsby',
    authors: ['F. Scott Fitzgerald'],
    publisher: 'Scribner',
    publishYear: '1925',
    pages: 180,
    subjects: ['Fiction', 'Classic', 'American Literature', 'Jazz Age'],
    description: 'A story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
    totalCopies: 3,
    availableCopies: 3,
    classification: '813.52',
    addedDate: '2024-02-01',
  },
  {
    id: '4',
    isbn: '9780140283334',
    title: 'Pride and Prejudice',
    authors: ['Jane Austen'],
    publisher: 'Penguin Classics',
    publishYear: '1813',
    pages: 432,
    subjects: ['Romance', 'Classic', 'British Literature'],
    description: 'A romantic novel about the Bennet family and the relationship between Elizabeth Bennet and Mr. Darcy.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140283334-L.jpg',
    totalCopies: 6,
    availableCopies: 4,
    classification: '823.7',
    addedDate: '2024-02-10',
  },
  {
    id: '5',
    isbn: '9780451526538',
    title: 'The Adventures of Tom Sawyer',
    authors: ['Mark Twain'],
    publisher: 'Signet Classic',
    publishYear: '1876',
    pages: 216,
    subjects: ['Adventure', 'Classic', 'American Literature'],
    description: 'The story of a young boy growing up along the Mississippi River.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451526538-L.jpg',
    totalCopies: 3,
    availableCopies: 2,
    classification: '813.4',
    addedDate: '2024-02-15',
  },
  {
    id: '6',
    isbn: '9780141439518',
    title: 'Oliver Twist',
    authors: ['Charles Dickens'],
    publisher: 'Penguin Classics',
    publishYear: '1838',
    pages: 576,
    subjects: ['Fiction', 'Classic', 'British Literature', 'Social Commentary'],
    description: 'The story of an orphan boy in Victorian London who encounters a gang of pickpockets.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
    totalCopies: 2,
    availableCopies: 1,
    classification: '823.8',
    addedDate: '2024-03-01',
  },
];

const sampleUsers: User[] = [
  {
    id: 'admin1',
    name: 'Administrator',
    email: 'admin@perpustakaan.id',
    password: 'admin123',
    role: 'admin',
    memberSince: '2024-01-01',
    phone: '081234567890',
    address: 'Jl. Perpustakaan No. 1',
  },
  {
    id: 'user1',
    name: 'Budi Santoso',
    email: 'budi@email.com',
    password: 'budi123',
    role: 'member',
    memberSince: '2024-02-01',
    phone: '081234567891',
    address: 'Jl. Merdeka No. 10',
  },
];

const sampleBorrows: BorrowRecord[] = [
  {
    id: 'borrow1',
    bookId: '1',
    userId: 'user1',
    borrowDate: '2024-03-01',
    dueDate: '2024-03-15',
    status: 'returned',
    returnDate: '2024-03-14',
  },
  {
    id: 'borrow2',
    bookId: '2',
    userId: 'user1',
    borrowDate: '2024-03-10',
    dueDate: '2024-03-24',
    status: 'borrowed',
  },
];

export function initializeData() {
  if (!localStorage.getItem(BOOKS_KEY)) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(sampleBooks));
  }
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(sampleUsers));
  }
  if (!localStorage.getItem(BORROWS_KEY)) {
    localStorage.setItem(BORROWS_KEY, JSON.stringify(sampleBorrows));
  }
}

// Books
export function getBooks(): Book[] {
  const data = localStorage.getItem(BOOKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getBookById(id: string): Book | undefined {
  return getBooks().find((b) => b.id === id);
}

export function searchBooks(query: string): Book[] {
  const q = query.toLowerCase().trim();
  if (!q) return getBooks();
  return getBooks().filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.authors.some((a) => a.toLowerCase().includes(q)) ||
      b.isbn.includes(q) ||
      b.subjects.some((s) => s.toLowerCase().includes(q)) ||
      b.publisher.toLowerCase().includes(q) ||
      b.classification.includes(q)
  );
}

export function addBook(book: Book) {
  const books = getBooks();
  books.push(book);
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function updateBook(book: Book) {
  const books = getBooks();
  const idx = books.findIndex((b) => b.id === book.id);
  if (idx >= 0) {
    books[idx] = book;
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  }
}

export function deleteBook(id: string) {
  const books = getBooks().filter((b) => b.id !== id);
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

// Users
export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email);
}

export function registerUser(user: User) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loginUser(email: string, password: string): User | null {
  const user = getUserByEmail(email);
  if (user && user.password === password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }
  return null;
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
  const data = localStorage.getItem(BORROWS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getBorrowsByUser(userId: string): BorrowRecord[] {
  return getBorrows().filter((b) => b.userId === userId);
}

export function getBorrowsByBook(bookId: string): BorrowRecord[] {
  return getBorrows().filter((b) => b.bookId === bookId);
}

export function borrowBook(bookId: string, userId: string): BorrowRecord {
  const borrow: BorrowRecord = {
    id: `borrow_${Date.now()}`,
    bookId,
    userId,
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'borrowed',
  };
  const borrows = getBorrows();
  borrows.push(borrow);
  localStorage.setItem(BORROWS_KEY, JSON.stringify(borrows));

  // Update available copies
  const book = getBookById(bookId);
  if (book && book.availableCopies > 0) {
    book.availableCopies -= 1;
    updateBook(book);
  }

  return borrow;
}

export function returnBook(borrowId: string) {
  const borrows = getBorrows();
  const idx = borrows.findIndex((b) => b.id === borrowId);
  if (idx >= 0) {
    borrows[idx].status = 'returned';
    borrows[idx].returnDate = new Date().toISOString().split('T')[0];
    localStorage.setItem(BORROWS_KEY, JSON.stringify(borrows));

    // Update available copies
    const book = getBookById(borrows[idx].bookId);
    if (book) {
      book.availableCopies += 1;
      updateBook(book);
    }
  }
}
