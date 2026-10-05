/**
 * Cloudflare Worker API untuk OPAC
 * 
 * Deploy: npx wrangler deploy
 * Init DB: npx wrangler d1 execute opac-db --file=schema.sql
 * 
 * Routes:
 * GET  /api/books          - List semua buku
 * GET  /api/books/search   - Cari buku (?q=keyword)
 * GET  /api/books/:id      - Detail buku
 * POST /api/books          - Tambah buku (admin)
 * PUT  /api/books/:id      - Update buku (admin)
 * DELETE /api/books/:id    - Hapus buku (admin)
 * POST /api/auth/login     - Login
 * POST /api/auth/register  - Register
 * GET  /api/users/:id      - Detail user
 * GET  /api/borrows        - Semua peminjaman (admin)
 * GET  /api/borrows/user/:userId - Peminjaman user
 * POST /api/borrows        - Pinjam buku
 * PUT  /api/borrows/:id/return - Kembalikan buku
 */

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

interface BookRow {
  id: string;
  isbn: string;
  title: string;
  authors: string;
  publisher: string;
  publish_year: string;
  pages: number;
  subjects: string;
  description: string;
  cover_url: string;
  total_copies: number;
  available_copies: number;
  classification: string;
  added_date: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  address: string;
  member_since: string;
}

interface BorrowRow {
  id: string;
  book_id: string;
  user_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
}

function bookFromRow(row: BookRow) {
  return {
    id: row.id,
    isbn: row.isbn,
    title: row.title,
    authors: row.authors.split(',').map((a: string) => a.trim()),
    publisher: row.publisher || '',
    publishYear: row.publish_year || '',
    pages: row.pages || 0,
    subjects: row.subjects ? row.subjects.split(',').map((s: string) => s.trim()) : [],
    description: row.description || '',
    coverUrl: row.cover_url || '',
    totalCopies: row.total_copies,
    availableCopies: row.available_copies,
    classification: row.classification || '',
    addedDate: row.added_date,
  };
}

function userFromRow(row: UserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone || '',
    address: row.address || '',
    memberSince: row.member_since,
  };
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

async function getAuthUser(request: Request, env: Env): Promise<UserRow | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  const userId = authHeader.substring(7);
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<UserRow>();
  return user;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // ===== BOOKS =====
      
      // GET /api/books - List all books
      if (path === '/api/books' && method === 'GET') {
        const results = await env.DB.prepare('SELECT * FROM books ORDER BY added_date DESC').all<BookRow>();
        return json(results.results.map(bookFromRow));
      }

      // GET /api/books/search?q=keyword
      if (path === '/api/books/search' && method === 'GET') {
        const q = url.searchParams.get('q') || '';
        if (!q.trim()) {
          const results = await env.DB.prepare('SELECT * FROM books ORDER BY added_date DESC').all<BookRow>();
          return json(results.results.map(bookFromRow));
        }
        const like = `%${q}%`;
        const results = await env.DB.prepare(
          `SELECT * FROM books WHERE 
           title LIKE ?1 OR authors LIKE ?1 OR isbn LIKE ?1 OR 
           subjects LIKE ?1 OR publisher LIKE ?1 OR classification LIKE ?1
           ORDER BY title`
        ).bind(like).all<BookRow>();
        return json(results.results.map(bookFromRow));
      }

      // GET /api/books/:id
      if (path.match(/^\/api\/books\/[^/]+$/) && method === 'GET') {
        const id = path.split('/').pop()!;
        const row = await env.DB.prepare('SELECT * FROM books WHERE id = ?').bind(id).first<BookRow>();
        if (!row) return json({ error: 'Buku tidak ditemukan' }, 404);
        return json(bookFromRow(row));
      }

      // POST /api/books - Add book (admin only)
      if (path === '/api/books' && method === 'POST') {
        const authUser = await getAuthUser(request, env);
        if (!authUser || authUser.role !== 'admin') return json({ error: 'Unauthorized' }, 401);
        
        const body = await request.json() as any;
        const id = generateId('book');
        
        await env.DB.prepare(
          `INSERT INTO books (id, isbn, title, authors, publisher, publish_year, pages, subjects, description, cover_url, total_copies, available_copies, classification, added_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          body.isbn,
          body.title,
          (body.authors || []).join(', '),
          body.publisher || '',
          body.publishYear || '',
          body.pages || 0,
          (body.subjects || []).join(','),
          body.description || '',
          body.coverUrl || '',
          body.totalCopies || 1,
          body.totalCopies || 1,
          body.classification || '',
          new Date().toISOString().split('T')[0]
        ).run();

        return json({ id, message: 'Buku berhasil ditambahkan' }, 201);
      }

      // PUT /api/books/:id - Update book (admin only)
      if (path.match(/^\/api\/books\/[^/]+$/) && method === 'PUT') {
        const authUser = await getAuthUser(request, env);
        if (!authUser || authUser.role !== 'admin') return json({ error: 'Unauthorized' }, 401);
        
        const id = path.split('/').pop()!;
        const body = await request.json() as any;
        
        await env.DB.prepare(
          `UPDATE books SET isbn=?, title=?, authors=?, publisher=?, publish_year=?, pages=?, subjects=?, description=?, cover_url=?, total_copies=?, available_copies=?, classification=? WHERE id=?`
        ).bind(
          body.isbn,
          body.title,
          (body.authors || []).join(', '),
          body.publisher || '',
          body.publishYear || '',
          body.pages || 0,
          (body.subjects || []).join(','),
          body.description || '',
          body.coverUrl || '',
          body.totalCopies || 1,
          body.availableCopies || 0,
          body.classification || '',
          id
        ).run();

        return json({ message: 'Buku berhasil diperbarui' });
      }

      // DELETE /api/books/:id - Delete book (admin only)
      if (path.match(/^\/api\/books\/[^/]+$/) && method === 'DELETE') {
        const authUser = await getAuthUser(request, env);
        if (!authUser || authUser.role !== 'admin') return json({ error: 'Unauthorized' }, 401);
        
        const id = path.split('/').pop()!;
        await env.DB.prepare('DELETE FROM books WHERE id = ?').bind(id).run();
        return json({ message: 'Buku berhasil dihapus' });
      }

      // ===== AUTH =====

      // POST /api/auth/login
      if (path === '/api/auth/login' && method === 'POST') {
        const body = await request.json() as any;
        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND password = ?')
          .bind(body.email, body.password)
          .first<UserRow>();
        
        if (!user) return json({ error: 'Email atau password salah' }, 401);
        return json(userFromRow(user));
      }

      // POST /api/auth/register
      if (path === '/api/auth/register' && method === 'POST') {
        const body = await request.json() as any;
        const id = generateId('user');
        
        // Check if email exists
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
          .bind(body.email).first();
        if (existing) return json({ error: 'Email sudah terdaftar' }, 400);
        
        await env.DB.prepare(
          `INSERT INTO users (id, name, email, password, role, phone, address, member_since)
           VALUES (?, ?, ?, ?, 'member', ?, ?, ?)`
        ).bind(
          id,
          body.name,
          body.email,
          body.password,
          body.phone || '',
          body.address || '',
          new Date().toISOString().split('T')[0]
        ).run();

        return json({ id, message: 'Registrasi berhasil' }, 201);
      }

      // GET /api/users/:id
      if (path.match(/^\/api\/users\/[^/]+$/) && method === 'GET') {
        const id = path.split('/').pop()!;
        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>();
        if (!user) return json({ error: 'User tidak ditemukan' }, 404);
        return json(userFromRow(user));
      }

      // GET /api/users - List all users (admin)
      if (path === '/api/users' && method === 'GET') {
        const authUser = await getAuthUser(request, env);
        if (!authUser || authUser.role !== 'admin') return json({ error: 'Unauthorized' }, 401);
        
        const results = await env.DB.prepare('SELECT * FROM users ORDER BY member_since DESC').all<UserRow>();
        return json(results.results.map(userFromRow));
      }

      // ===== BORROWS =====

      // GET /api/borrows - All borrows (admin)
      if (path === '/api/borrows' && method === 'GET') {
        const authUser = await getAuthUser(request, env);
        if (!authUser || authUser.role !== 'admin') return json({ error: 'Unauthorized' }, 401);
        
        const results = await env.DB.prepare('SELECT * FROM borrows ORDER BY borrow_date DESC').all<BorrowRow>();
        return json(results.results.map(row => ({
          id: row.id,
          bookId: row.book_id,
          userId: row.user_id,
          borrowDate: row.borrow_date,
          dueDate: row.due_date,
          returnDate: row.return_date,
          status: row.status,
        })));
      }

      // GET /api/borrows/user/:userId
      if (path.match(/^\/api\/borrows\/user\/[^/]+$/) && method === 'GET') {
        const userId = path.split('/').pop()!;
        const results = await env.DB.prepare('SELECT * FROM borrows WHERE user_id = ? ORDER BY borrow_date DESC')
          .bind(userId).all<BorrowRow>();
        return json(results.results.map(row => ({
          id: row.id,
          bookId: row.book_id,
          userId: row.user_id,
          borrowDate: row.borrow_date,
          dueDate: row.due_date,
          returnDate: row.return_date,
          status: row.status,
        })));
      }

      // GET /api/borrows/book/:bookId
      if (path.match(/^\/api\/borrows\/book\/[^/]+$/) && method === 'GET') {
        const bookId = path.split('/').pop()!;
        const results = await env.DB.prepare('SELECT * FROM borrows WHERE book_id = ? ORDER BY borrow_date DESC')
          .bind(bookId).all<BorrowRow>();
        return json(results.results.map(row => ({
          id: row.id,
          bookId: row.book_id,
          userId: row.user_id,
          borrowDate: row.borrow_date,
          dueDate: row.due_date,
          returnDate: row.return_date,
          status: row.status,
        })));
      }

      // POST /api/borrows - Borrow a book
      if (path === '/api/borrows' && method === 'POST') {
        const authUser = await getAuthUser(request, env);
        if (!authUser) return json({ error: 'Unauthorized' }, 401);
        
        const body = await request.json() as any;
        const bookId = body.bookId;
        const userId = authUser.id;

        // Check book availability
        const book = await env.DB.prepare('SELECT * FROM books WHERE id = ?').bind(bookId).first<BookRow>();
        if (!book) return json({ error: 'Buku tidak ditemukan' }, 404);
        if (book.available_copies <= 0) return json({ error: 'Buku tidak tersedia' }, 400);

        // Check if user already borrowed this book
        const existing = await env.DB.prepare(
          'SELECT id FROM borrows WHERE book_id = ? AND user_id = ? AND status = ?'
        ).bind(bookId, userId, 'borrowed').first();
        if (existing) return json({ error: 'Anda sudah meminjam buku ini' }, 400);

        const id = generateId('borrow');
        const borrowDate = new Date().toISOString().split('T')[0];
        const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        await env.DB.prepare(
          'INSERT INTO borrows (id, book_id, user_id, borrow_date, due_date, status) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(id, bookId, userId, borrowDate, dueDate, 'borrowed').run();

        // Update available copies
        await env.DB.prepare(
          'UPDATE books SET available_copies = available_copies - 1 WHERE id = ?'
        ).bind(bookId).run();

        return json({ id, borrowDate, dueDate, message: 'Buku berhasil dipinjam' }, 201);
      }

      // PUT /api/borrows/:id/return - Return a book
      if (path.match(/^\/api\/borrows\/[^/]+\/return$/) && method === 'PUT') {
        const borrowId = path.split('/')[3];
        
        const borrow = await env.DB.prepare('SELECT * FROM borrows WHERE id = ?').bind(borrowId).first<BorrowRow>();
        if (!borrow) return json({ error: 'Peminjaman tidak ditemukan' }, 404);
        if (borrow.status === 'returned') return json({ error: 'Buku sudah dikembalikan' }, 400);

        const returnDate = new Date().toISOString().split('T')[0];

        await env.DB.prepare(
          'UPDATE borrows SET status = ?, return_date = ? WHERE id = ?'
        ).bind('returned', returnDate, borrowId).run();

        // Update available copies
        await env.DB.prepare(
          'UPDATE books SET available_copies = available_copies + 1 WHERE id = ?'
        ).bind(borrow.book_id).run();

        return json({ message: 'Buku berhasil dikembalikan' });
      }

      // ===== STATS =====
      if (path === '/api/stats' && method === 'GET') {
        const totalBooks = await env.DB.prepare('SELECT COUNT(*) as count FROM books').first<{ count: number }>();
        const totalCopies = await env.DB.prepare('SELECT SUM(total_copies) as sum FROM books').first<{ sum: number }>();
        const available = await env.DB.prepare('SELECT SUM(available_copies) as sum FROM books').first<{ sum: number }>();
        
        return json({
          totalBooks: totalBooks?.count || 0,
          totalCopies: totalCopies?.sum || 0,
          availableCopies: available?.sum || 0,
        });
      }

      return json({ error: 'Not found' }, 404);

    } catch (err: any) {
      return json({ error: err.message || 'Internal server error' }, 500);
    }
  },
};
