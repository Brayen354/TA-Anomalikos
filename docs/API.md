# Party Kosan — API Documentation

Platform perantara pencarian & penyewaan kos. Aplikasi **tidak** menangani
pembayaran (dilakukan langsung antara penyewa dan pemilik di luar aplikasi,
via WhatsApp). Satu akun (`pengguna`) dapat sekaligus menjadi penyewa maupun
pemilik kos.

- **Stack:** Laravel 13 · MySQL · JWT (`tymon/jwt-auth`) · OpenAI (chatbot)
- **Arsitektur:** sederhana — Route → Controller → Model → Database (tanpa
  Service / Repository / Form Request). Validasi & business logic di Controller.
- **Format:** JSON

---

## Base URL

```
http://127.0.0.1:8000/api
```

---

## Format Response

**Sukses**

```json
{ "status": true, "message": "Pesan deskriptif.", "data": { } }
```

**Gagal**

```json
{ "status": false, "message": "Pesan kesalahan.", "errors": { "field": ["..."] } }
```

| Kode | Arti |
|------|------|
| 200 | OK |
| 201 | Resource dibuat |
| 401 | Belum login / token tidak valid |
| 403 | Tidak punya akses |
| 404 | Data tidak ditemukan |
| 422 | Validasi gagal |

---

## JWT Authentication Flow

```
POST /register atau POST /login  →  menerima access_token
   ↓
Sertakan di setiap request:  Authorization: Bearer <access_token>
   ↓
POST /refresh  →  tukar token baru     POST /logout  →  invalidasi token
```

- Token berlaku 60 menit. Semua endpoint kecuali `/register` & `/login`
  membutuhkan header `Authorization: Bearer <token>`.
- Jika belum login saat `POST /pemesanan`:
  ```json
  { "status": false, "message": "Silakan login terlebih dahulu untuk melakukan pemesanan kamar." }
  ```

---

## Daftar Endpoint

### Authentication
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST | `/register` | daftar (+ buat pengaturan privasi otomatis) |
| POST | `/login` | login → token |
| GET | `/me` | data pengguna login |
| POST | `/refresh` | refresh token |
| POST | `/logout` | logout |

### Kosan & Kamar (browsing)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/kosan` | list + filter `q`, `tipe_kosan`, `harga_min`, `harga_max`, `fasilitas[]` |
| GET | `/kosan/{id}` | detail + fasilitas, foto, kamar, `total_kamar`, `kamar_tersedia` |
| GET | `/kamar/{id}` | detail kamar |
| GET | `/fasilitas` | daftar fasilitas |

### Favorit & Riwayat Dilihat
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/favorit` | daftar favorit |
| POST | `/favorit` | tambah — `{ "id_kamar": 1 }` |
| DELETE | `/favorit/{id_kamar}` | hapus favorit |
| GET | `/riwayat-dilihat` | daftar riwayat dilihat |
| POST | `/riwayat-dilihat` | catat — `{ "id_kamar": 1 }` |

### Pemesanan (penyewa)

**POST /pemesanan** — wajib login. Status awal `menunggu_konfirmasi`. Status
kamar tidak diubah. Mengembalikan kontak WhatsApp pemilik.

Request:
```json
{ "id_kamar": 1 }
```
Response 201:
```json
{
  "status": true,
  "message": "Pemesanan berhasil dibuat",
  "data": {
    "id_pemesanan": 1,
    "status": "menunggu_konfirmasi",
    "nama_pemilik": "Anton Morger",
    "no_telp": "081234567890",
    "link_whatsapp": "https://wa.me/6281234567890"
  }
}
```

**GET /riwayat-pemesanan** — riwayat pemesanan penyewa. Tiap item: `nama_kosan`,
`nama_kamar`, `tanggal_pengajuan`, `tanggal_mulai`, `tanggal_selesai`, `status`,
`alasan_pembatalan` (null bila kosong).

### Profil & Pengaturan Privasi
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/profil` | profil + pengaturan privasi |
| PUT | `/profil` | update `nama,email,alamat,no_telp,jenis_kelamin,foto_profil` |
| GET | `/pengaturan-privasi` | get pengaturan privasi |
| PUT | `/pengaturan-privasi` | update 4 field boolean |

### Chatbot AI (Party Kosan Assistant)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/faq` | daftar FAQ |
| POST | `/chatbot` | tanya assistant |

**POST /chatbot** — cari di FAQ dulu; jika tidak ada baru panggil OpenAI.
Riwayat disimpan ke `chatbot_history`.

Request:
```json
{ "pertanyaan": "Bagaimana cara menyewa kos?" }
```
Response:
```json
{
  "status": true,
  "jawaban": "Pilih kamar yang tersedia kemudian tekan tombol Pesan Sekarang. Setelah itu hubungi pemilik kos melalui nomor WhatsApp yang tersedia."
}
```

### Dashboard Pemilik
**GET /dashboard** — `total_kosan`, `total_kamar`, `kamar_tersedia`,
`kamar_terisi`, `total_pemesanan` (hanya kos milik pengguna login).

### CRUD Kosan (Pemilik) — hanya milik sendiri (selain itu 404)
| Method | Endpoint |
|--------|----------|
| GET | `/pemilik/kosan` |
| POST | `/pemilik/kosan` |
| PUT | `/pemilik/kosan/{id}` |
| DELETE | `/pemilik/kosan/{id}` |

Body POST/PUT: `nama_kosan, alamat, landmark, tipe_kosan, deskripsi, status, fasilitas[]`.

### CRUD Kamar (Pemilik)
| Method | Endpoint |
|--------|----------|
| GET | `/pemilik/kamar` |
| POST | `/pemilik/kamar` |
| PUT | `/pemilik/kamar/{id}` |
| DELETE | `/pemilik/kamar/{id}` |

Body: `id_kosan, no_kamar, tipe, harga_bulanan, status(tersedia|terisi|perawatan), ukuran, jenis_kasur`.

### Permintaan Pemesanan (Pemilik)

**GET /pemilik/pemesanan** — daftar permintaan pada kos milik pemilik
(data penyewa, kamar, kosan, tanggal pengajuan, status).

**PUT /pemilik/pemesanan/{id}/konfirmasi** → status `berhasil`, kamar `terisi`.
```json
{ "tanggal_mulai": "2026-07-01", "tanggal_selesai": "2027-07-01", "catatan_pemilik": "Pembayaran telah diterima" }
```
`tanggal_mulai` & `tanggal_selesai` wajib, `catatan_pemilik` opsional.

**PUT /pemilik/pemesanan/{id}/tolak** → status `dibatalkan`, kamar `tersedia`.
```json
{ "alasan_pembatalan": "Kamar sudah terisi" }
```
`alasan_pembatalan` opsional.

---

## Ringkasan Status

**Status Kamar:** `tersedia` · `terisi` · `perawatan`
**Status Pemesanan:** `menunggu_konfirmasi` · `berhasil` · `dibatalkan`

| Aksi | Status Pemesanan | Status Kamar |
|------|------------------|--------------|
| Pemesanan dibuat | `menunggu_konfirmasi` | tetap `tersedia` |
| Pemilik konfirmasi | `berhasil` | `terisi` |
| Pemilik tolak | `dibatalkan` | `tersedia` |

---

## Akun Dummy (setelah `migrate --seed`)

Password semua akun: **`password`**

| Nama | Email | Peran |
|------|-------|-------|
| Anton Morger | `anton@partykosan.test` | pemilik Pavilion Menteng |
| Amba Tukam | `amba@partykosan.test` | pemilik Kost Mas Amba |
| Sarah Wijaya | `sarah@partykosan.test` | pemilik Kost Elit Senayan |
| Budi Santoso | `budi@partykosan.test` | penyewa (favorit, pemesanan) |

> Konfigurasi OpenAI: isi `OPENAI_API_KEY` di `.env` (opsional `OPENAI_MODEL`,
> default `gpt-4o-mini`). Tanpa key, `/chatbot` tetap melayani jawaban FAQ dan
> memberi pesan fallback yang sopan untuk pertanyaan di luar FAQ.

---

# REVISI LANJUTAN

## Status terbaru
- **Status Kamar:** `tersedia` · `terisi` · `nonaktif` (field `tipe` dihapus).
- **Status Kos (`status_kosan`):** `aktif` · `nonaktif` (default `aktif`). Kos
  `nonaktif` tidak muncul di `GET /kosan`, tetapi tetap muncul di riwayat
  pemesanan, dashboard, dan laporan pemilik.

## Aktif / Nonaktif Kos (pemilik)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| PUT | `/kosan/{id}/nonaktifkan` | sembunyikan kos dari pencarian |
| PUT | `/kosan/{id}/aktifkan` | tampilkan kembali |

## Pemesanan (revisi)
`POST /pemesanan` kini menerima **durasi** atau **tanggal**:
```json
{ "id_kamar": 1, "durasi_bulan": 6 }
```
atau
```json
{ "id_kamar": 1, "tanggal_mulai": "2026-07-01", "tanggal_selesai": "2027-01-01" }
```
`durasi_bulan` pilihan: 1 / 3 / 6 / 12. `total_harga = harga_bulanan × durasi`
(disimpan untuk informasi, pembayaran tetap di luar aplikasi). Response data
menambah `durasi_bulan`, `tanggal_mulai`, `tanggal_selesai`, `total_harga`.

## Perawatan Kamar (pemilik)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/pemilik/perawatan` | daftar (filter `?status=`, `?prioritas=`) |
| POST | `/pemilik/perawatan` | buat laporan perawatan |
| PUT | `/pemilik/perawatan/{id}` | perbarui (status `selesai` → tanggal_selesai otomatis) |
| DELETE | `/pemilik/perawatan/{id}` | hapus |

Body POST: `id_kamar, judul, deskripsi, kategori, prioritas(low|medium|high), status(tertunda|diproses|selesai), tanggal_laporan, tanggal_selesai`.
Kategori contoh: AC, Listrik, Kamar Mandi, Kasur, Pintu, Jendela, Internet, Cat Dinding, Lainnya.

## Dashboard (revisi)
- `GET /dashboard` → ringkasan + `perawatan_mendesak` (semua perawatan
  `prioritas=high` & `status=tertunda`: nama_kos, no_kamar, kategori, judul).
- `GET /pemilik/kos-saya` → statistik per kos: `total_kamar`, `kamar_terisi`,
  `kamar_tersedia`, `pendapatan_bulanan` (Σ harga kamar terisi),
  `persentase_hunian` ((terisi/total)×100), `perawatan_tertunda`,
  `perawatan_mendesak`.

## Chatbot AI (revisi) — membaca data database
`POST /chatbot` kini menjawab dari data aktual (kamar termurah, kos tersedia,
fasilitas, status kamar tertentu, harga per kos), lalu OpenAI untuk pertanyaan
bebas (dengan konteks data + riwayat chat). Response:
```json
{
  "status": true,
  "jawaban": "...",
  "suggestions": ["Berapa harga kamar termurah?", "Kos yang masih tersedia apa saja?", "Apakah ada kamar dengan AC?"]
}
```
Bila pertanyaan harga tidak menyebut kos, response menyertakan `pilihan_kosan`:
```json
{ "status": true, "jawaban": "Silakan pilih kos yang ingin Anda lihat.", "pilihan_kosan": [{ "id": 1, "nama": "Kost Mas Amba" }], "suggestions": [ ... ] }
```
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| DELETE | `/chatbot/clear` | hapus seluruh riwayat chatbot milik user |

---

# REVISI MENYELURUH (audit Kos Saya, Detail, Kamar, Penyewa, Favorit, Riwayat)

## Status (final)
- **Status kamar (`status`):** `aktif` · `nonaktif` — apakah kamar dapat
  disewakan & tampil di pencarian. **Tidak lagi** `tersedia/terisi`.
- **Ketersediaan kamar (`ketersediaan`):** dihitung **otomatis**, tidak disimpan.
  `terisi` bila ada pemesanan `aktif`, selain itu `tersedia`. Field read-only
  ikut pada setiap objek kamar.
- **Status pemesanan:** `menunggu_konfirmasi` · `aktif` · `ditolak` ·
  `dibatalkan` · `selesai`. (`berhasil` lama dipetakan ke `aktif`.)

| Aksi | Status Pemesanan | Ketersediaan Kamar |
|------|------------------|--------------------|
| Pengajuan dibuat | `menunggu_konfirmasi` | tetap `tersedia` |
| Pemilik konfirmasi | `aktif` | `terisi` (otomatis) |
| Pemilik tolak (pengajuan) | `ditolak` | `tersedia` |
| Pemilik/penyewa batalkan | `dibatalkan` | `tersedia` |
| Sewa diakhiri | `selesai` | `tersedia` |

## Kosan (browsing) — tambahan field
`GET /kosan` & `GET /kosan/{id}` kini mengembalikan:
- `harga_min` — harga termurah dari kamar dengan harga valid (`null` bila tak ada).
- `kamar_tersedia` — jumlah kamar `aktif` yang **belum** ditempati penyewa aktif.
- `is_favorit` — `1` bila kos difavoritkan pengguna login (kirim token; opsional).
- tiap `kamar[]` menyertakan `ketersediaan`.

## Foto Properti (multipart)
`POST /pemilik/kosan` dan `PUT /pemilik/kosan/{id}` menerima **multipart/form-data**:
- `foto[]` — file gambar (jpg/jpeg/png/webp, maks 5MB). **Minimal 3 foto** wajib
  saat membuat (`POST`). Foto disimpan di disk `public` (`storage:link`),
  `url_foto` berbentuk `/storage/kosan/...`.
- `hapus_foto[]` — (PUT) id foto yang ingin dihapus.
- Untuk `PUT` via FormData gunakan method spoofing `_method=PUT` pada `POST`.
- Upload bersifat **append** (foto lama tetap, foto baru ditambahkan).

## Pemesanan (revisi)
- `POST /pemesanan` menolak bila penyewa = pemilik kos:
  `"Anda tidak dapat menyewa properti milik sendiri."` (422). Juga menolak
  kamar `nonaktif`/kos `nonaktif`/kamar yang sudah terisi penyewa aktif.
- `GET /riwayat-pemesanan` menyertakan kontak pemilik: `nama_pemilik`,
  `no_telp_pemilik`, `email_pemilik`, `link_whatsapp`, serta `catatan_pemilik`
  dan `alasan_pembatalan`.

## Manajemen Penyewa (pemilik)
`GET /pemilik/pemesanan` (filter `?status=`) — tiap item memuat `penyewa`
(`nama,no_telp,email`), `kamar`, `kosan`, tanggal, `total_harga`, `status`,
`alasan_pembatalan`.

| Method | Endpoint | Hasil |
|--------|----------|-------|
| PUT | `/pemilik/pemesanan/{id}/konfirmasi` | status → `aktif` |
| PUT | `/pemilik/pemesanan/{id}/tolak` | status → `ditolak` (`alasan_pembatalan`) |
| PUT | `/pemilik/pemesanan/{id}/batalkan` | status → `dibatalkan` (`alasan_pembatalan`) |
| PUT | `/pemilik/pemesanan/{id}/akhiri` | status → `selesai` |

## Favorit (berbasis KOS)
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/favorit` | daftar **kos** favorit (bentuk objek kosan + `harga_min`) |
| POST | `/favorit` | tambah — `{ "id_kosan": 1 }` |
| DELETE | `/favorit/{id_kosan}` | hapus favorit |

## Ganti Password
**POST /ganti-password** (auth) — body:
`{ "password_lama", "password_baru", "password_baru_confirmation" }`.
Validasi: password lama harus benar, baru `min:8` & `confirmed`.

## Kamar (pemilik)
Body POST/PUT `/pemilik/kamar`: `id_kosan, no_kamar, harga_bulanan,
status(aktif|nonaktif), ukuran, jenis_kasur`. **Tidak ada** input
`tersedia/terisi` — ketersediaan dihitung otomatis dari penyewaan.

## Perawatan (pemilik) — sudah mendukung CRUD penuh
`GET/POST/PUT/DELETE /pemilik/perawatan` (edit judul, deskripsi, biaya/kategori,
prioritas, status, tanggal). Status `selesai` mengisi `tanggal_selesai` otomatis.
