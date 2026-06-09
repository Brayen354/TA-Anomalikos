# Party Kos

Platform pencarian dan manajemen kos berbasis web, menghubungkan pemilik properti dengan calon penyewa.

## Stack

| Layer    | Teknologi                  |
|----------|----------------------------|
| Backend  | Laravel, PostgreSQL         |
| Frontend | Next.js 15, React 19, TypeScript |
| AI       | OpenAI (chatbot asisten)   |

## Fitur

- **Authentication** — login, register, JWT token
- **Kelola Kos** — daftar, edit, aktifkan/nonaktifkan properti
- **Kelola Kamar** — tambah, edit, hapus kamar per properti
- **Kelola Fasilitas** — pilih & tambah fasilitas kustom
- **Upload Foto** — upload multi-foto properti
- **Favorit** — simpan & lihat kos favorit, riwayat terakhir dilihat
- **AI Chatbot** — asisten berbasis OpenAI untuk tanya-jawab kos
- **Pengaturan Profil** — ubah data akun, password, preferensi privasi

## Setup Backend (Laravel)

```bash
# install dependencies
composer install

# salin & isi environment variable
cp .env.example .env
php artisan key:generate

# migrasi & seed database
php artisan migrate --seed

# jalankan server
php artisan serve
```

Backend berjalan di `http://127.0.0.1:8000`.

## Setup Frontend (Next.js)

```bash
# install dependencies
npm install

# jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Build produksi:

```bash
npm run build && npm run start
```

## Environment Variables

### Backend (`.env`)

```env
APP_NAME="Party Kos"
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=party_kos
DB_USERNAME=postgres
DB_PASSWORD=

JWT_SECRET=         # generate: php artisan jwt:secret
OPENAI_API_KEY=     # key OpenAI untuk chatbot
```

### Frontend (`.env.local`)

Tidak diperlukan — frontend menggunakan rewrite Next.js untuk proxy ke backend. Jika backend berjalan di port berbeda, ubah `next.config.ts`:

```ts
destination: "http://127.0.0.1:8000/api/:path*"
```

## Struktur Folder (Frontend)

```
app/
  layout.tsx                  # root layout: AuthProvider + SiteChrome
  page.tsx                    # beranda: hero, kos unggulan, CTA
  login/                      # halaman login
  register/                   # halaman register
  cari/                       # pencarian + filter kos
  kos/[id]/                   # detail kos publik + pemesanan
  favorit/                    # kos favorit & riwayat dilihat
  kos-saya/                   # dashboard pemilik
  kos-saya/daftar/            # daftarkan properti baru
  kos-saya/[id]/              # kelola properti: kamar, fasilitas, foto
  profile/                    # halaman profil
  profile/riwayat-sewa/       # riwayat pemesanan
  profile/pengaturan/         # pengaturan akun & privasi
  syarat/                     # syarat, kebijakan, panduan, bantuan

components/
  Header.tsx                  # navigasi & auth state
  Footer.tsx
  SiteChrome.tsx              # wrapper header + footer + chatbot
  AuthModal.tsx               # modal login/register
  AuthGuard.tsx               # proteksi halaman
  ChatWidget.tsx              # floating AI chatbot
  DaftarkanKostForm.tsx       # form multi-step daftar kos
  PhotoUploader.tsx           # upload foto dengan drag & drop
  FormField.tsx               # wrapper field dengan validasi
  ListingCard.tsx             # kartu kos
  Modal.tsx / ModalFeedback.tsx
  Skeleton.tsx                # loading skeleton

hooks/
  useAuth.tsx                 # context auth (login/register/logout)
  useFavorit.tsx              # aksi favorit kos
  useFormValidation.ts        # validasi form dengan touched state

lib/
  api.ts                      # fetch wrapper dengan JWT
  errorMapper.ts              # mapping error Laravel → Indonesia
  format.ts                   # format rupiah, tanggal, dll.
  kosan.ts                    # helper data kosan
  items.ts                    # mapping item riwayat dilihat

types/
  index.ts                    # tipe response API
```

## API Endpoints

Semua request melalui prefix `/api` yang di-rewrite ke Laravel.

### Auth
| Method | Endpoint    | Deskripsi            |
|--------|-------------|----------------------|
| POST   | `/login`    | Login, dapat token   |
| POST   | `/register` | Daftar akun baru     |
| GET    | `/me`       | Data user aktif      |
| POST   | `/logout`   | Logout, hapus token  |

### Kos Publik
| Method | Endpoint         | Deskripsi                    |
|--------|------------------|------------------------------|
| GET    | `/kosan`         | Daftar semua kos             |
| GET    | `/kosan/{id}`    | Detail kos + kamar           |
| GET    | `/fasilitas`     | Daftar fasilitas tersedia    |

### Favorit & Riwayat
| Method | Endpoint                 | Deskripsi              |
|--------|--------------------------|------------------------|
| GET    | `/favorit`               | Daftar kos favorit     |
| POST   | `/favorit`               | Tambah favorit         |
| DELETE | `/favorit/{id_kosan}`    | Hapus favorit          |
| GET    | `/riwayat-dilihat`       | Riwayat terakhir dilihat |

### Pemesanan
| Method | Endpoint              | Deskripsi            |
|--------|-----------------------|----------------------|
| POST   | `/pemesanan`          | Buat pemesanan       |
| GET    | `/riwayat-pemesanan`  | Riwayat pemesanan    |

### Profil
| Method | Endpoint                  | Deskripsi              |
|--------|---------------------------|------------------------|
| GET    | `/profil`                 | Data profil user       |
| PUT    | `/profil`                 | Update profil          |
| POST   | `/ganti-password`         | Ganti password         |
| GET    | `/pengaturan-privasi`     | Pengaturan privasi     |
| PUT    | `/pengaturan-privasi`     | Update privasi         |

### Chatbot
| Method | Endpoint          | Deskripsi              |
|--------|-------------------|------------------------|
| POST   | `/chatbot`        | Kirim pertanyaan ke AI |
| DELETE | `/chatbot/clear`  | Hapus riwayat chat     |

### Pemilik
| Method | Endpoint                        | Deskripsi               |
|--------|---------------------------------|-------------------------|
| GET    | `/pemilik/kos-saya`             | Daftar properti milik   |
| POST   | `/pemilik/kosan`                | Daftarkan kos baru      |
| PUT    | `/pemilik/kosan/{id}`           | Edit kos                |
| POST   | `/kosan/{id}/aktifkan`          | Aktifkan kos            |
| POST   | `/kosan/{id}/nonaktifkan`       | Nonaktifkan kos         |
| POST   | `/pemilik/kamar`                | Tambah kamar            |
| PUT    | `/pemilik/kamar/{id}`           | Edit kamar              |
| DELETE | `/pemilik/kamar/{id}`           | Hapus kamar             |
