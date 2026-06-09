import type { Fasilitas, Kamar, Kosan, KosSayaStat } from "@/types";
import { labelTipeKosan, phClass } from "./format";

// api memakai id_kosan atau id tergantung endpoint
export function resolveKosId(
  k: { id_kosan?: number; id?: number }
): number | null {
  const id = k.id_kosan ?? k.id;
  return typeof id === "number" && !isNaN(id) ? id : null;
}

export function resolveKamarId(k: Partial<Kamar>): number | null {
  const id = k.id_kamar ?? k.id;
  return typeof id === "number" && !isNaN(id) ? id : null;
}

export function fasId(f: Fasilitas): number | null {
  const id = f.id_fasilitas ?? f.id;
  return typeof id === "number" && !isNaN(id) ? id : null;
}
export function fasNama(f: Fasilitas): string {
  return f.nama_fasilitas ?? f.nama ?? "";
}

export function hargaMin(kos: Kosan): number | null {
  // harga_min bisa berupa string desimal dari API ("1200000.00")
  const apiMin = Number(kos.harga_min);
  if (!isNaN(apiMin) && apiMin > 0) return apiMin;
  const list = kos.kamar ?? [];
  const harga = list
    .map((k) => Number(k.harga_bulanan))
    .filter((n) => !isNaN(n) && n > 0);
  if (!harga.length) return null;
  return Math.min(...harga);
}

export function kosBadge(kos: Kosan): string {
  return labelTipeKosan(kos.tipe_kosan);
}

export function kosPh(kos: Kosan): string {
  return phClass(kos.id ?? kos.nama_kosan ?? 0);
}

export function kamarDapatDipesan(kamar: Kamar): boolean {
  return kamar.status === "aktif" && (kamar.ketersediaan ?? "tersedia") === "tersedia";
}

export function fotoUrls(kos?: Kosan | null): string[] {
  const list = kos?.foto ?? [];
  return list
    .map((f) => f.url_foto ?? f.url ?? f.path ?? "")
    .filter((u): u is string => !!u);
}

export function isFavorit(kos?: Kosan | null): boolean {
  return !!kos?.is_favorit;
}

export function isPemilik(kos: Kosan | null | undefined, user: { id?: number; id_pengguna?: number } | null): boolean {
  if (!kos || !user) return false;
  const uid = user.id_pengguna ?? user.id;
  const oid = kos.pengguna?.id_pengguna ?? kos.pengguna?.id ?? kos.id_pengguna;
  return uid != null && oid != null && Number(uid) === Number(oid);
}

export function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.data)) return d.data as T[];
    if (Array.isArray(d.items)) return d.items as T[];
  }
  return [];
}
