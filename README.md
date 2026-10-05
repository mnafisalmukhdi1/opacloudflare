# OPAC - Open Public Access Catalog

Website katalog perpustakaan digital berbasis **Cloudflare Pages** (frontend) + **Cloudflare Workers** (backend) + **Cloudflare D1** (database).

## Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                    CLOUDFLARE                        │
│                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌────────┐ │
│  │   Pages      │    │   Workers    │    │   D1   │ │
│  │  (Frontend)  │───▶│   (API)      │───▶│  (DB)  │ │
│  │  React+Vite  │    │  REST API    │    │SQLite  │ │
│  └──────────────┘    └──────────────┘    └────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Struktur Project

```
├── src/                    # Frontend (Cloudflare Pages)
│   ├── api.ts             # API client ke Worker
│   ├── store.ts           # Hybrid store (API + localStorage fallback)
│   ├── pages/             # Halaman-halaman
│   └── components/        # Komponen UI
├── worker/                 # Backend (Cloudflare Workers)
│   ├── src/index.ts       # API routes
│   ├── schema.sql         # D1 database schema
│   └── wrangler.toml      # Worker config
└── dist/                   # Build output (deploy ke Pages)
```

## Deployment

### Prasyarat

1. Akun Cloudflare (gratis)
2. Node.js 18+
3. Wrangler CLI: `npm install -g wrangler`
4. Login: `wrangler login`

### 1. Setup Database D1

```bash
# Masuk ke folder worker
cd worker

# Install dependencies
npm install

# Buat database D1
npx wrangler d1 create opac-db

# Catat database_id dari output, lalu update wrangler.toml
# [[d1_databases]]
# binding = "DB"
# database_name = "opac-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Jalankan schema untuk membuat tabel & seed data
npx wrangler d1 execute opac-db --file=schema.sql
```

### 2. Deploy Worker (Backend API)

```bash
cd worker

# Test lokal (opsional)
npm run dev

# Deploy ke Cloudflare
npm run deploy
```

Catat URL Worker Anda, contoh: `https://opac-api.xxx.workers.dev`

### 3. Deploy Frontend ke Pages

```bash
# Kembali ke root project
cd ..

# Set environment variable API URL
export VITE_API_URL="https://opac-api.xxx.workers.dev"

# Build frontend
npm run build

# Deploy ke Cloudflare Pages
npx wrangler pages deploy dist --project-name=opac-frontend
```

**Atau** gunakan Cloudflare Pages dashboard:
1. Connect GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variable: `VITE_API_URL` = URL Worker Anda

### 4. Konfigurasi CORS (jika perlu)

Jika frontend dan Worker di domain berbeda, pastikan Worker sudah handle CORS (sudah di-set di kode).

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/books` | List semua buku |
| GET | `/api/books/search?q=keyword` | Cari buku |
| GET | `/api/books/:id` | Detail buku |
| POST | `/api/books` | Tambah buku (admin) |
| PUT | `/api/books/:id` | Update buku (admin) |
| DELETE | `/api/books/:id` | Hapus buku (admin) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/users/:id` | Detail user |
| GET | `/api/users` | List users (admin) |
| GET | `/api/borrows` | Semua peminjaman (admin) |
| GET | `/api/borrows/user/:userId` | Peminjaman user |
| POST | `/api/borrows` | Pinjam buku |
| PUT | `/api/borrows/:id/return` | Kembalikan buku |

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@perpustakaan.id | admin123 |
| Anggota | budi@email.com | budi123 |

## Fitur

- ✅ Pencarian buku (judul, penulis, ISBN, subjek)
- ✅ Detail buku dengan cover dari OpenLibrary
- ✅ Peminjaman & pengembalian buku
- ✅ Auto-fill data buku dari OpenLibrary API (via ISBN)
- ✅ Dashboard admin (kelola buku & peminjaman)
- ✅ Profil anggota dengan riwayat peminjaman
- ✅ Responsive design (mobile-friendly)
- ✅ Integrasi Cloudflare (Pages + Workers + D1)

## Mode Fallback

Jika `VITE_API_URL` tidak di-set, aplikasi akan berjalan dalam mode **localStorage** (data hanya tersimpan di browser masing-masing). Cocok untuk demo/preview tanpa backend.

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS 4, Material Icons
- **Backend**: Cloudflare Workers (TypeScript)
- **Database**: Cloudflare D1 (SQLite)
- **CDN**: Cloudflare Pages

## Lisensi

MIT
