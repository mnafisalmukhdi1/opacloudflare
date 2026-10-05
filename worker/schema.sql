-- Cloudflare D1 Schema untuk OPAC
-- Jalankan: npx wrangler d1 execute opac-db --file=schema.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  phone TEXT,
  address TEXT,
  member_since TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  isbn TEXT NOT NULL,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  publisher TEXT,
  publish_year TEXT,
  pages INTEGER DEFAULT 0,
  subjects TEXT,
  description TEXT,
  cover_url TEXT,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  classification TEXT,
  added_date TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS borrows (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  borrow_date TEXT NOT NULL DEFAULT (date('now')),
  due_date TEXT NOT NULL,
  return_date TEXT,
  status TEXT NOT NULL DEFAULT 'borrowed',
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed data
INSERT OR IGNORE INTO users (id, name, email, password, role, phone, address, member_since) VALUES
  ('admin1', 'Administrator', 'admin@perpustakaan.id', 'admin123', 'admin', '081234567890', 'Jl. Perpustakaan No. 1', '2024-01-01'),
  ('user1', 'Budi Santoso', 'budi@email.com', 'budi123', 'member', '081234567891', 'Jl. Merdeka No. 10', '2024-02-01');

INSERT OR IGNORE INTO books (id, isbn, title, authors, publisher, publish_year, pages, subjects, description, cover_url, total_copies, available_copies, classification, added_date) VALUES
  ('1', '9780061120084', 'To Kill a Mockingbird', 'Harper Lee', 'HarperCollins', '1960', 336, 'Fiction,Classic,American Literature', 'A novel about racial injustice in the Deep South.', 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg', 5, 3, '813.54', '2024-01-15'),
  ('2', '9780451524935', '1984', 'George Orwell', 'Signet Classic', '1949', 328, 'Dystopian,Political Fiction,Science Fiction', 'A dystopian novel set in a totalitarian society.', 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', 4, 2, '823.912', '2024-01-20'),
  ('3', '9780743273565', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', '1925', 180, 'Fiction,Classic,American Literature', 'A story of the mysteriously wealthy Jay Gatsby.', 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg', 3, 3, '813.52', '2024-02-01'),
  ('4', '9780140283334', 'Pride and Prejudice', 'Jane Austen', 'Penguin Classics', '1813', 432, 'Romance,Classic,British Literature', 'A romantic novel about Elizabeth Bennet and Mr. Darcy.', 'https://covers.openlibrary.org/b/isbn/9780140283334-L.jpg', 6, 4, '823.7', '2024-02-10'),
  ('5', '9780451526538', 'The Adventures of Tom Sawyer', 'Mark Twain', 'Signet Classic', '1876', 216, 'Adventure,Classic,American Literature', 'The story of a young boy along the Mississippi River.', 'https://covers.openlibrary.org/b/isbn/9780451526538-L.jpg', 3, 2, '813.4', '2024-02-15'),
  ('6', '9780141439518', 'Oliver Twist', 'Charles Dickens', 'Penguin Classics', '1838', 576, 'Fiction,Classic,British Literature', 'The story of an orphan boy in Victorian London.', 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg', 2, 1, '823.8', '2024-03-01');

INSERT OR IGNORE INTO borrows (id, book_id, user_id, borrow_date, due_date, return_date, status) VALUES
  ('borrow1', '1', 'user1', '2024-03-01', '2024-03-15', '2024-03-14', 'returned'),
  ('borrow2', '2', 'user1', '2024-03-10', '2024-03-24', NULL, 'borrowed');
