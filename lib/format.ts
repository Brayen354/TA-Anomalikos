export function rupiah(value?: number | null): string {
  if (value === null || value === undefined || isNaN(Number(value))) return "Rp 0";
  return "Rp " + Number(value).toLocaleString("id-ID");
}

export function initials(name?: string | null): string {
  if (!name) return "PK";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "PK";
}

export function formatTanggal(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function labelTipeKosan(tipe?: string): string {
  if (!tipe) return "CAMPUR";
  const t = tipe.toLowerCase();
  if (t === "putra") return "PUTRA ONLY";
  if (t === "putri") return "PUTRI ONLY";
  return "CAMPUR";
}

export function labelStatusKamar(status?: string): string {
  if (!status) return "";
  return status.toUpperCase();
}

const PH_POOL = [
  "img-bed-warm",
  "img-bed-green",
  "img-study",
  "img-bath",
  "img-loft",
  "img-living",
  "img-building",
  "img-bed-grey",
  "img-balcony",
  "img-building-warm",
];

export function phClass(seed: number | string): string {
  const n =
    typeof seed === "number"
      ? seed
      : seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return PH_POOL[Math.abs(n) % PH_POOL.length];
}
