"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { asArray, hargaMin, kosBadge, kosPh, resolveKosId, fasId, fasNama, fotoUrls, isFavorit } from "@/lib/kosan";
import { useFavorit } from "@/hooks/useFavorit";
import type { Fasilitas, Kosan } from "@/types";
import ListingCard from "@/components/ListingCard";
import { EmptyState } from "@/components/ui";
import { SkeletonGrid } from "@/components/Skeleton";
import { IconSearch, IconChevronDown, IconHome } from "@/components/Icons";

function CariContent() {
  const params = useSearchParams();
  const { toggle: toggleFav } = useFavorit();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [tipe, setTipe] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [fasilitasList, setFasilitasList] = useState<Fasilitas[]>([]);
  const [selFasilitas, setSelFasilitas] = useState<number[]>([]);
  const [kos, setKos] = useState<Kosan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Fasilitas[]>("/fasilitas", false);
        setFasilitasList(asArray<Fasilitas>(res.data));
      } catch {}
    })();
  }, []);

  // q dibaca via ref agar typing tidak trigger refetch otomatis
  const qRef = useRef(q);
  qRef.current = q;

  const fetchKos = useCallback(async () => {
    const sp = new URLSearchParams();
    if (qRef.current.trim()) sp.set("q", qRef.current.trim());
    if (tipe) sp.set("tipe_kosan", tipe);
    if (priceMin) sp.set("harga_min", priceMin);
    if (priceMax) sp.set("harga_max", priceMax);
    selFasilitas.forEach((id) => sp.append("fasilitas[]", String(id)));
    const qs = sp.toString();
    try {
      const res = await api.get<Kosan[]>(`/kosan${qs ? `?${qs}` : ""}`, true);
      setKos(asArray<Kosan>(res.data));
      setError(false);
    } catch {
      setKos([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [tipe, priceMin, priceMax, selFasilitas]);

  useEffect(() => {
    fetchKos();
  }, [fetchKos]);

  const search = useCallback(() => {
    setLoading(true);
    setError(false);
    fetchKos();
  }, [fetchKos]);

  const toggleFasilitas = (id: number) => {
    setLoading(true);
    setSelFasilitas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setLoading(true);
    setTipe("");
    setPriceMin("");
    setPriceMax("");
    setSelFasilitas([]);
    setQ("");
  };

  return (
    <div className="wrap" style={{ paddingTop: 28 }}>
      <div className="search-bar">
        <div className="search" style={{ margin: 0, boxShadow: "none", maxWidth: "none" }}>
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
        <div className="filter-chips">
          <span className="chip">
            <select
              value={tipe}
              onChange={(e) => {
                setLoading(true);
                setTipe(e.target.value);
              }}
            >
              <option value="">Semua Gender</option>
              <option value="putra">Khusus Pria</option>
              <option value="putri">Khusus Wanita</option>
              <option value="campur">Campur</option>
            </select>
            <IconChevronDown size={13} />
          </span>
          <div className="price-range">
            <span>Price Range:</span>
            <input
              className="pin"
              placeholder="Rp 0"
              value={priceMin ? `Rp ${Number(priceMin).toLocaleString("id-ID")}` : ""}
              onChange={(e) => setPriceMin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <span className="dash">—</span>
            <input
              className="pin"
              placeholder="Rp 15.000.000"
              value={priceMax ? `Rp ${Number(priceMax).toLocaleString("id-ID")}` : ""}
              onChange={(e) => setPriceMax(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <button className="btn btn-mint" style={{ padding: "8px 16px" }} onClick={search}>
              SET
            </button>
          </div>
        </div>
      </div>

      <div className="layout" style={{ marginTop: 30 }}>
        <aside className="filters">
          <h3>Filter Lanjutan</h3>
          <button className="clear" onClick={clearFilters}>
            Bersihkan
          </button>
          <h4>Fasilitas</h4>
          {fasilitasList.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Tidak ada data fasilitas.
            </p>
          ) : (
            fasilitasList.map((f, i) => {
              const id = fasId(f);
              if (id === null) return null;
              return (
                <label className="check" key={id ?? i}>
                  <input
                    type="checkbox"
                    checked={selFasilitas.includes(id)}
                    onChange={() => toggleFasilitas(id)}
                  />
                  <span>{fasNama(f)}</span>
                </label>
              );
            })
          )}
        </aside>

        <section>
          <div className="page-head" style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 24 }}>Kamar yang tersedia</h1>
            <div className="sub">
              {loading ? "Memuat..." : `Menampilkan ${kos.length} kos sesuai filter kamu`}
            </div>
          </div>

          {loading ? (
            <SkeletonGrid count={6} />
          ) : error ? (
            <EmptyState icon={<IconHome size={40} />} title="Tidak dapat memuat data">
              Gagal memuat daftar kos. Pastikan server backend berjalan.
              <br />
              <button className="btn btn-dark" onClick={search}>
                Coba Lagi
              </button>
            </EmptyState>
          ) : kos.length === 0 ? (
            <EmptyState icon={<IconHome size={40} />} title="Tidak ada hasil">
              Coba ubah kata kunci atau filter pencarianmu.
            </EmptyState>
          ) : (
            <div className="grid grid-3">
              {kos.map((k) => {
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
      </div>
      <div style={{ height: 50 }} />
    </div>
  );
}

export default function CariPage() {
  return (
    <Suspense fallback={<div className="wrap" style={{ paddingTop: 28 }}><SkeletonGrid count={6} /></div>}>
      <CariContent />
    </Suspense>
  );
}
