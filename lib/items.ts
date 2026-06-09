import { labelTipeKosan, phClass } from "./format";

export interface CardItem {
  idKamar: number;
  idKosan: number | null;
  title: string;
  location: string;
  price: number | null;
  badge: string;
  phClass: string;
  imageUrl: string | null;
}

function num(v: unknown): number | null {
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export function mapToCardItem(raw: unknown): CardItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const kamar = (r.kamar && typeof r.kamar === "object"
    ? (r.kamar as Record<string, unknown>)
    : r) as Record<string, unknown>;

  const kosan = (kamar.kosan && typeof kamar.kosan === "object"
    ? (kamar.kosan as Record<string, unknown>)
    : r.kosan && typeof r.kosan === "object"
    ? (r.kosan as Record<string, unknown>)
    : {}) as Record<string, unknown>;

  const idKamar =
    num(r.id_kamar) ?? num(kamar.id_kamar) ?? num(kamar.id) ?? num(r.id);
  if (idKamar === null) return null;

  const idKosan =
    num(kosan.id) ?? num(kamar.id_kosan) ?? num(r.id_kosan) ?? null;

  const title =
    (kosan.nama_kosan as string) ||
    (kamar.nama_kosan as string) ||
    (r.nama_kosan as string) ||
    (kamar.no_kamar ? `Kamar ${kamar.no_kamar}` : "Kamar") ;

  const location =
    (kosan.alamat as string) ||
    (r.alamat as string) ||
    (kamar.no_kamar ? `Kamar ${kamar.no_kamar}` : "");

  const tipe =
    (kosan.tipe_kosan as string) || (r.tipe_kosan as string) || undefined;

  let imageUrl: string | null = null;
  const fotoArr = (kosan.foto ?? r.foto) as unknown;
  if (Array.isArray(fotoArr) && fotoArr.length) {
    const f0 = fotoArr[0] as Record<string, unknown>;
    imageUrl = (f0.url_foto as string) || (f0.url as string) || null;
  }

  return {
    idKamar,
    idKosan,
    title,
    location,
    price: num(kamar.harga_bulanan) ?? num(r.harga_bulanan),
    badge: labelTipeKosan(tipe),
    phClass: phClass(idKosan ?? idKamar),
    imageUrl,
  };
}
