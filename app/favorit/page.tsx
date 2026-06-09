"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { asArray, hargaMin, kosBadge, kosPh, resolveKosId, fotoUrls } from "@/lib/kosan";
import { mapToCardItem, type CardItem } from "@/lib/items";
import type { Kosan } from "@/types";
import AuthGuard from "@/components/AuthGuard";
import ListingCard from "@/components/ListingCard";
import { Loading, EmptyState } from "@/components/ui";
import { IconHeart } from "@/components/Icons";

type Tab = "fav" | "seen";

function FavoritContent() {
  const [tab, setTab] = useState<Tab>("fav");
  const [favKos, setFavKos] = useState<Kosan[]>([]);
  const [seenItems, setSeenItems] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(false);

  const load = useCallback(async () => {
    setLoadErr(false);
    try {
      const [favRes, seenRes] = await Promise.all([
        api.get<Kosan[]>("/favorit"),
        api.get("/riwayat-dilihat").catch(() => ({ data: [] })),
      ]);
      setFavKos(asArray<Kosan>(favRes.data));
      setSeenItems(
        asArray(seenRes.data)
          .map(mapToCardItem)
          .filter((x): x is CardItem => x !== null)
      );
    } catch {
      setLoadErr(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeFav = async (idKosan: number) => {
    await api.del(`/favorit/${idKosan}`);
    setFavKos((prev) => prev.filter((k) => resolveKosId(k) !== idKosan));
  };

  const toggleFavFromSeen = async (idKosan: number, next: boolean) => {
    if (next) await api.post("/favorit", { id_kosan: idKosan });
    else await api.del(`/favorit/${idKosan}`);
    setLoading(true);
    await load();
  };

  const favIds = new Set(favKos.map((k) => resolveKosId(k)));

  return (
    <div className="wrap" style={{ paddingTop: 36 }}>
      <div className="page-head">
        <h1>{tab === "fav" ? "Kos Tersimpan" : "Kos yang terakhir dilihat"}</h1>
      </div>
      <div className="tabs">
        <button className={tab === "fav" ? "active" : ""} onClick={() => setTab("fav")}>
          Favorited
        </button>
        <button className={tab === "seen" ? "active" : ""} onClick={() => setTab("seen")}>
          Terakhir Dilihat
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : loadErr ? (
        <EmptyState icon={<IconHeart size={40} />} title="Gagal memuat data">
          Tidak dapat memuat favorit. Coba lagi.
          <br />
          <button className="btn btn-dark" style={{ marginTop: 16 }} onClick={() => { setLoading(true); load(); }}>
            Coba Lagi
          </button>
        </EmptyState>
      ) : tab === "fav" ? (
        favKos.length === 0 ? (
          <EmptyState icon={<IconHeart size={40} />} title="Belum ada favorit">
            Simpan kos favoritmu dengan menekan ikon hati pada kartu kos.
          </EmptyState>
        ) : (
          <div className="grid grid-3">
            {favKos.map((k) => {
              const kid = resolveKosId(k);
              return (
                <ListingCard
                  key={`fav-${kid}`}
                  href={kid != null ? `/kos/${kid}` : "#"}
                  phClass={kosPh(k)}
                  imageUrl={fotoUrls(k)[0] ?? null}
                  badge={kosBadge(k)}
                  title={k.nama_kosan}
                  location={k.alamat}
                  price={hargaMin(k)}
                  initialFav
                  onToggleFav={kid != null ? () => removeFav(kid) : undefined}
                />
              );
            })}
          </div>
        )
      ) : seenItems.length === 0 ? (
        <EmptyState icon={<IconHeart size={40} />} title="Belum ada riwayat">
          Kos yang kamu lihat akan muncul di sini.
        </EmptyState>
      ) : (
        <div className="grid grid-3">
          {seenItems.map((it) => (
            <ListingCard
              key={`seen-${it.idKamar}`}
              href={it.idKosan ? `/kos/${it.idKosan}` : "#"}
              phClass={it.phClass}
              imageUrl={it.imageUrl ?? null}
              badge={it.badge}
              title={it.title}
              location={it.location}
              price={it.price}
              initialFav={it.idKosan != null && favIds.has(it.idKosan)}
              onToggleFav={
                it.idKosan != null
                  ? (next) => toggleFavFromSeen(it.idKosan as number, next)
                  : undefined
              }
            />
          ))}
        </div>
      )}
      <div style={{ height: 50 }} />
    </div>
  );
}

export default function FavoritPage() {
  return (
    <AuthGuard>
      <FavoritContent />
    </AuthGuard>
  );
}
