"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { asArray, hargaMin, kosBadge, kosPh, resolveKosId, fotoUrls, isFavorit } from "@/lib/kosan";
import { useFavorit } from "@/hooks/useFavorit";
import type { Kosan } from "@/types";
import ListingCard from "@/components/ListingCard";
import { EmptyState } from "@/components/ui";
import { SkeletonGrid } from "@/components/Skeleton";
import { IconArrowRight, IconSearch, IconHome } from "@/components/Icons";

export default function HomePage() {
  const router = useRouter();
  const { toggle: toggleFav } = useFavorit();
  const [q, setQ] = useState("");
  const [kos, setKos] = useState<Kosan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<Kosan[]>("/kosan", true);
      setKos(asArray<Kosan>(res.data));
    } catch {
      setError("Gagal memuat daftar kos. Pastikan server backend berjalan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const search = () => {
    router.push(q.trim() ? `/cari?q=${encodeURIComponent(q.trim())}` : "/cari");
  };

  const featured = kos.slice(0, 6);

  return (
    <>
      <section className="hero wrap">
        <h1 className="reveal" style={{ animationDelay: ".05s" }}>
          Cari kost <em>ternyaman</em> kamu.
        </h1>
        <p className="reveal" style={{ animationDelay: ".16s" }}>
          Hunian modern di lokasi strategis, dirancang untuk kamu yang ingin
          tinggal lebih praktis, produktif, dan penuh kenyamanan.
        </p>
        <div className="search reveal" style={{ animationDelay: ".28s" }}>
          <IconSearch size={18} />
          <input
            type="text"
            placeholder="Mau cari kost di mana?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button className="btn btn-dark" onClick={search}>
            Cari
          </button>
        </div>
      </section>

      <section className="wrap section">
        <div className="sec-head">
          <div>
            <h2>Kost Unggulan</h2>
            <div className="sub">
              Pilihan premium yang sesuai dengan gaya hidupmu
            </div>
          </div>
          <Link href="/cari" className="see-all">
            Lihat Semua <IconArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid count={3} />
        ) : error ? (
          <EmptyState icon={<IconHome size={40} />} title="Tidak dapat memuat data">
            {error}
            <br />
            <button className="btn btn-dark" onClick={load}>
              Coba Lagi
            </button>
          </EmptyState>
        ) : featured.length === 0 ? (
          <EmptyState icon={<IconHome size={40} />} title="Belum ada kos">
            Belum ada kos yang tersedia saat ini.
          </EmptyState>
        ) : (
          <div className="grid grid-3">
            {featured.map((k) => {
              const kid = resolveKosId(k) ?? k.id;
              return (
                <ListingCard
                  key={kid}
                  href={`/kos/${kid}`}
                  phClass={kosPh(k)}
                  imageUrl={fotoUrls(k)[0] ?? null}
                  badge={kosBadge(k)}
                  title={k.nama_kosan}
                  location={k.alamat}
                  price={hargaMin(k)}
                  initialFav={isFavorit(k)}
                  onToggleFav={kid != null ? (next) => toggleFav(kid, next) : undefined}
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="wrap section">
        <div className="cta">
          <h2>Punya Kost Sendiri?</h2>
          <p>
            Bergabung bersama Party Kosan dan jangkau lebih banyak calon penyewa
            berkualitas. Kami membantu kamu mengelola properti dengan dashboard
            premium dan sistem listing yang terverifikasi.
          </p>
          <Link className="btn btn-mint" href="/kos-saya/daftar">
            Daftarkan Kost
          </Link>
        </div>
      </section>
    </>
  );
}
