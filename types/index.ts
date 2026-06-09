export interface ApiResponse<T = unknown> {
  status: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  // chatbot memakai field tambahan di luar "data"
  jawaban?: string;
  suggestions?: string[];
  pilihan_kosan?: { id: number; nama: string }[];
}

export type JenisKelamin = "L" | "P";

export interface Pengguna {
  // API Laravel memakai id_pengguna; sebagian endpoint memakai id.
  id?: number;
  id_pengguna?: number;
  nama: string;
  email: string;
  no_telp?: string | null;
  alamat?: string | null;
  jenis_kelamin?: JenisKelamin | null;
  foto_profil?: string | null;
}

export interface TokenData {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

export interface LoginData {
  user?: Pengguna;
  token: TokenData;
}

export interface Fasilitas {
  // API memakai id_fasilitas/nama_fasilitas; sebagian endpoint memakai id/nama.
  id?: number;
  id_fasilitas?: number;
  nama?: string;
  nama_fasilitas?: string;
}

// status kamar kini hanya aktif|nonaktif (dapat disewakan / tidak).
export type StatusKamar = "aktif" | "nonaktif";
// ketersediaan dihitung otomatis dari penyewaan aktif.
export type Ketersediaan = "tersedia" | "terisi";

export interface Kamar {
  // API memakai id_kamar; sebagian endpoint memakai id.
  id?: number;
  id_kamar?: number;
  id_kosan?: number;
  no_kamar: string;
  tipe?: string | null;
  harga_bulanan: number;
  status: StatusKamar;
  // dikirim backend (accessor), read-only di frontend
  ketersediaan?: Ketersediaan;
  ukuran?: string | null;
  jenis_kasur?: string | null;
}

export type StatusKosan = "aktif" | "nonaktif";
export type TipeKosan = "putra" | "putri" | "campur" | string;

export interface KosanFoto {
  id?: number;
  id_foto?: number;
  url?: string;
  path?: string;
  url_foto?: string;
  is_thumbnail?: boolean;
}

export interface Kosan {
  id: number;
  nama_kosan: string;
  alamat: string;
  landmark?: string | null;
  tipe_kosan: TipeKosan;
  deskripsi?: string | null;
  status?: StatusKosan;
  status_kosan?: StatusKosan;
  id_pengguna?: number;
  pengguna?: Pengguna;
  fasilitas?: Fasilitas[];
  foto?: KosanFoto[];
  kamar?: Kamar[];
  total_kamar?: number;
  kamar_tersedia?: number;
  // harga termurah turunan (kadang dikirim API, kalau tidak dihitung di FE)
  harga_min?: number;
  // ditandai backend untuk pengguna yang login
  is_favorit?: boolean | number | null;
}

export type StatusPemesanan =
  | "menunggu_konfirmasi"
  | "aktif"
  | "ditolak"
  | "dibatalkan"
  | "selesai"
  // status lama, dipertahankan untuk kompatibilitas
  | "berhasil";

export interface PemesananResult {
  id_pemesanan: number;
  status: StatusPemesanan;
  nama_pemilik: string;
  no_telp: string;
  link_whatsapp: string;
  durasi_bulan?: number;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  total_harga?: number;
}

export interface RiwayatPemesanan {
  id?: number;
  id_pemesanan?: number;
  id_kosan?: number | null;
  nama_kosan: string;
  nama_kamar: string;
  tipe_kosan?: string | null;
  foto?: string | null;
  harga_bulanan?: number | null;
  tanggal_pengajuan: string;
  tanggal_mulai?: string | null;
  tanggal_selesai?: string | null;
  status: StatusPemesanan;
  total_harga?: number | null;
  durasi_bulan?: number | null;
  alamat?: string | null;
  alasan_pembatalan?: string | null;
  catatan_pemilik?: string | null;
  nama_pemilik?: string | null;
  no_telp_pemilik?: string | null;
  email_pemilik?: string | null;
  link_whatsapp?: string | null;
}

export interface PenyewaItem {
  id_pemesanan: number;
  penyewa: { id_pengguna?: number; nama?: string; no_telp?: string; email?: string };
  kamar: { id_kamar?: number; no_kamar?: string; harga_bulanan?: number };
  kosan: { id_kosan?: number; nama_kosan?: string };
  tanggal_pengajuan?: string;
  tanggal_mulai?: string | null;
  tanggal_selesai?: string | null;
  durasi_bulan?: number | null;
  total_harga?: number | null;
  catatan_pemilik?: string | null;
  alasan_pembatalan?: string | null;
  status: StatusPemesanan;
}

export type StatusPerawatan = "tertunda" | "diproses" | "selesai";
export type PrioritasPerawatan = "low" | "medium" | "high";

export interface Perawatan {
  id_perawatan?: number;
  id_kamar: number;
  judul: string;
  deskripsi?: string | null;
  kategori: string;
  prioritas: PrioritasPerawatan;
  status: StatusPerawatan;
  tanggal_laporan?: string | null;
  tanggal_selesai?: string | null;
  kamar?: Kamar & { kosan?: Kosan };
}

export interface PengaturanPrivasi {
  informasi_umum: boolean;
  informasi_data_diri: boolean;
  riwayat_aktivitas: boolean;
  riwayat_pencarian_kos: boolean;
}

export interface ProfilData {
  user?: Pengguna;
  pengaturan_privasi?: PengaturanPrivasi;
  // beberapa API mengembalikan field langsung
  [key: string]: unknown;
}

export interface DashboardData {
  total_kosan: number;
  total_kamar: number;
  kamar_tersedia: number;
  kamar_terisi: number;
  total_pemesanan?: number;
  perawatan_mendesak?: PerawatanMendesak[];
}

export interface PerawatanMendesak {
  nama_kos: string;
  no_kamar: string;
  kategori: string;
  judul: string;
}

export interface KosSayaStat {
  // API mengembalikan `id_kosan`; sebagian endpoint memakai `id`.
  id?: number;
  id_kosan?: number;
  nama_kosan: string;
  alamat?: string;
  tipe_kosan?: string;
  foto?: string | null;
  total_kamar: number;
  kamar_terisi: number;
  kamar_tersedia: number;
  pendapatan_bulanan: number;
  persentase_hunian: number;
  perawatan_tertunda: number;
  perawatan_mendesak: number;
  status_kosan?: StatusKosan;
}

