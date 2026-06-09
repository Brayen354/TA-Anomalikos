// peta nama field backend → label bahasa indonesia
const FIELD_LABELS: Record<string, string> = {
  nama: "Nama lengkap",
  email: "Email",
  no_telp: "Nomor telepon",
  password: "Password",
  password_lama: "Password lama",
  password_baru: "Password baru",
  password_baru_confirmation: "Konfirmasi password",
  alamat: "Alamat",
  nama_kosan: "Nama kosan",
  nama_pemilik: "Nama pemilik",
  whatsapp: "Nomor WhatsApp",
  harga: "Harga",
  harga_bulanan: "Harga per bulan",
  no_kamar: "Nomor kamar",
  judul: "Judul",
  deskripsi: "Deskripsi",
  id_kamar: "Kamar",
  id_kosan: "Kosan",
  foto: "Foto",
  jenis_kelamin: "Jenis kelamin",
};

const ERROR_PATTERNS: Array<[RegExp, (field: string, match: RegExpMatchArray) => string]> = [
  [/required/i,                  (f) => `${f} wajib diisi.`],
  [/must be a valid email/i,     ()  => "Format email tidak valid. Contoh: user@gmail.com"],
  [/format is invalid/i,         (f) => `Format ${f.toLowerCase()} tidak valid.`],
  [/has already been taken/i,    (f) => `${f} sudah digunakan.`],
  [/must be at least (\d+)/i,   (f, m) => `${f} minimal ${m[1]} karakter.`],
  [/may not be greater than/i,   (f) => `${f} terlalu panjang.`],
  [/must be a number/i,          (f) => `${f} harus berupa angka.`],
  [/must be at least (\d+) characters/i, (f, m) => `${f} minimal ${m[1]} karakter.`],
  [/confirmation does not match/i, () => "Konfirmasi password tidak sama."],
  [/incorrect/i,                 (f) => `${f} tidak sesuai.`],
];

function translateMessage(field: string, message: string): string {
  const label = FIELD_LABELS[field] ?? capitalize(field.replace(/_/g, " "));
  for (const [pattern, translator] of ERROR_PATTERNS) {
    const match = message.match(pattern);
    if (match) return translator(label, match);
  }
  return message;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function mapApiErrors(
  errors: Record<string, string[]> | undefined
): Record<string, string> {
  if (!errors) return {};
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      translateMessage(field, messages[0] ?? ""),
    ])
  );
}

export function firstApiError(
  errors: Record<string, string[]> | undefined,
  fallback = "Terjadi kesalahan. Coba lagi."
): string {
  if (!errors) return fallback;
  const first = Object.values(errors)[0]?.[0];
  return first ? translateMessage(Object.keys(errors)[0], first) : fallback;
}
