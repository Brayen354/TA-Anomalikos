"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { asArray, hargaMin, resolveKamarId, fasId, fasNama, fotoUrls, isPemilik, kamarDapatDipesan, isFavorit } from "@/lib/kosan";
import { rupiah, labelTipeKosan } from "@/lib/format";
import { fasilitasIcon } from "@/lib/fasilitas";
import { useAuth } from "@/hooks/useAuth";
import { useFavorit } from "@/hooks/useFavorit";
import type { Kamar, Kosan, PemesananResult } from "@/types";
import Modal from "@/components/Modal";
import KosGallery from "@/components/KosGallery";
import { Loading, EmptyState, BackLink } from "@/components/ui";
import {
  IconBolt,
  IconCheck,
  IconChevronDown,
  IconHome,
  IconHeart,
  IconMapPin,
  IconPhone,
  IconRuler,
  IconBed,
  IconShieldCheck,
  IconUser,
} from "@/components/Icons";

const DURASI = [1, 3, 6, 12];

function kamarTag(k: Kamar) {
  if (k.status === "nonaktif") return <span className="tag nonaktif">NONAKTIF</span>;
  if ((k.ketersediaan ?? "tersedia") === "terisi")
    return <span className="tag terisi">TERISI</span>;
  return <span className="tag tersedia">TERSEDIA</span>;
}

export default function KosDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { toggle: toggleFav } = useFavorit();

  const [kos, setKos] = useState<Kosan | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fav, setFav] = useState(false);

  const [pickOpen, setPickOpen] = useState(false);
  const [chosen, setChosen] = useState<Kamar | null>(null);
  const [durasi, setDurasi] = useState(1);

  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");
  const [success, setSuccess] = useState<PemesananResult | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Kosan>(`/kosan/${id}`, true);
        const data = (res.data as Kosan) ?? null;
        setKos(data);
        setFav(isFavorit(data));
        if (!res.data) setNotFound(true);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const kamarList = useMemo(() => asArray<Kamar>(kos?.kamar ?? []), [kos]);
  const startPrice = chosen?.harga_bulanan ?? (kos ? hargaMin(kos) : null);
  const total = chosen ? chosen.harga_bulanan * durasi : null;
  const pemilikSendiri = isPemilik(kos, user);
  const photos = fotoUrls(kos);

  // validasi gender: putra→L, putri→P, campur→bebas
  const tipeKos = (kos?.tipe_kosan ?? "campur").toLowerCase();
  const genderCocok =
    tipeKos === "campur" ||
    (tipeKos === "putra" && user?.jenis_kelamin === "L") ||
    (tipeKos === "putri" && user?.jenis_kelamin === "P");
  const genderTidakCocok = isAuthenticated && !pemilikSendiri && !genderCocok;
  const bisaSewa = !pemilikSendiri && !genderTidakCocok;

  const onToggleFav = async () => {
    const kosId = kos ? (kos.id ?? Number(id)) : Number(id);
    const next = !fav;
    setFav(next);
    try {
      await toggleFav(kosId, next);
    } catch {
      setFav(!next);
    }
  };

  const pickRoom = (k: Kamar) => {
    if (!kamarDapatDipesan(k)) return;
    setChosen(k);
    setPickOpen(false);
    setBookError("");
    const kamarId = resolveKamarId(k);
    if (isAuthenticated && kamarId !== null) {
      api.post("/riwayat-dilihat", { id_kamar: kamarId }).catch(() => {});
    }
  };

  const pesan = async () => {
    if (!chosen) return;
    const kamarId = resolveKamarId(chosen);
    if (kamarId === null) {
      setBookError("Kamar tidak valid. Silakan pilih ulang kamar.");
      return;
    }
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/kos/${id}`)}`);
      return;
    }
    setBooking(true);
    setBookError("");
    try {
      const res = await api.post<PemesananResult>("/pemesanan", {
        id_kamar: kamarId,
        durasi_bulan: durasi,
      });
      setSuccess(res.data as PemesananResult);
    } catch (err) {
      setBookError(
        err instanceof ApiError ? err.message : "Gagal membuat pemesanan."
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="wrap section">
        <Loading label="Memuat detail kos..." />
      </div>
    );
  }

  if (notFound || !kos) {
    return (
      <div className="wrap section">
        <EmptyState icon={<IconHome size={40} />} title="Kos tidak ditemukan">
          Kos yang Anda cari tidak tersedia atau sudah dinonaktifkan.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="wrap">
      <BackLink href="/cari" />

      <KosGallery
        photos={photos}
        alt={kos.nama_kosan}
        overlay={
          <button
            className={`fav${fav ? " on" : ""}`}
            onClick={onToggleFav}
            aria-label="Favorit"
            style={{ position: "absolute", top: 14, right: 14, zIndex: 4 }}
          >
            <IconHeart size={18} fill={fav ? "currentColor" : "none"} />
          </button>
        }
      />

      <div
        className="detail-cols"
        style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 34, marginTop: 34 }}
      >
        <section>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>
            {kos.nama_kosan}
          </h1>
          <div className="loc" style={{ marginTop: 8 }}>
            <IconMapPin size={14} />
            {kos.alamat}
            <span
              className="tag"
              style={{ marginLeft: 8, background: "var(--green-deep)", color: "var(--mint)" }}
            >
              {labelTipeKosan(kos.tipe_kosan)}
            </span>
          </div>

          <div className="spec-row">
            <div className="spec">
              <IconRuler size={20} style={{ display: "block", margin: "0 auto" }}/>
              <div className="l">Tipe Kos</div>
              <div className="v">{labelTipeKosan(kos.tipe_kosan)}</div>
            </div>
            <div className="spec">
              <IconBed size={20} style={{ display: "block", margin: "0 auto" }}/>
              <div className="l">Total Kamar</div>
              <div className="v">{kos.total_kamar ?? kamarList.length}</div>
            </div>
            <div className="spec">
              <IconCheck size={20} style={{ display: "block", margin: "0 auto" }}/>
              <div className="l">Tersedia</div>
              <div className="v">
                {kos.kamar_tersedia ??
                  kamarList.filter((k) => kamarDapatDipesan(k)).length}
              </div>
            </div>
            <div className="spec">
              <IconHome size={20} style={{ display: "block", margin: "0 auto" }}/>
              <div className="l">Landmark</div>
              <div className="v">{kos.landmark || "-"}</div>
            </div>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "30px 0 10px" }}>
            Deskripsi
          </h2>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.75 }}>
            {kos.deskripsi || "Belum ada deskripsi untuk kos ini."}
          </p>

          {kos.fasilitas && kos.fasilitas.length > 0 && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "30px 0 16px" }}>
                Fasilitas
              </h2>
              <div className="facs">
                {kos.fasilitas.map((f, i) => {
                  const Icon = fasilitasIcon(fasNama(f));
                  return (
                    <div className="f" key={fasId(f) ?? i}>
                      <Icon size={17} />
                      {fasNama(f)}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              margin: "30px 0 14px",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Lokasi</h2>
            {kos.landmark && (
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--green)" }}>
                {kos.landmark}
              </span>
            )}
          </div>
          <div
            className="map-ph"
            style={{ height: 280, borderRadius: 16, display: "grid", placeItems: "center" }}
          >
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "var(--green)",
                  color: "#fff",
                  boxShadow: "0 8px 20px rgba(0,0,0,.3)",
                }}
              >
                <IconMapPin size={20} />
              </span>
              <div
                style={{
                  marginTop: 8,
                  background: "#fff",
                  borderRadius: 8,
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(0,0,0,.15)",
                }}
              >
                {kos.alamat}
              </div>
            </div>
          </div>
        </section>

        <aside>
          <div className="book-card">
            <div className="from">Mulai dari</div>
            <div className="price">
              {startPrice ? (
                <>
                  {rupiah(startPrice)} <span>/ bulan</span>
                </>
              ) : (
                "Hubungi pemilik"
              )}
            </div>

            {pemilikSendiri && (
              <div className="alert info" style={{ marginBottom: 12 }}>
                Anda tidak dapat menyewa properti milik sendiri.
              </div>
            )}
            {genderTidakCocok && (
              <div className="alert error" style={{ marginBottom: 12 }}>
                Anda tidak memenuhi ketentuan gender untuk kos ini.
              </div>
            )}

            {bisaSewa && (
              <button
                className={`pick-room${chosen ? " chosen" : ""}`}
                onClick={() => setPickOpen(true)}
              >
                {chosen ? (
                  <span>
                    Kamar {chosen.no_kamar} — {rupiah(chosen.harga_bulanan)}/bln
                  </span>
                ) : (
                  <span className="ph-room">Pilih Kamar</span>
                )}
                <IconChevronDown size={16} />
              </button>
            )}

            {bisaSewa && chosen && (
              <div className="field" style={{ marginTop: 0, marginBottom: 14 }}>
                <label className="field-label">Durasi Sewa</label>
                <div className="inp">
                  <select
                    value={durasi}
                    onChange={(e) => setDurasi(Number(e.target.value))}
                  >
                    {DURASI.map((d) => (
                      <option key={d} value={d}>
                        {d} Bulan
                      </option>
                    ))}
                  </select>
                  <IconChevronDown size={14} />
                </div>
                {total !== null && (
                  <p className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
                    Total: <b style={{ color: "var(--green-deep)" }}>{rupiah(total)}</b>{" "}
                    untuk {durasi} bulan
                  </p>
                )}
              </div>
            )}

            {bookError && <div className="alert error">{bookError}</div>}

            {bisaSewa && (
              <button
                className="btn btn-green btn-block"
                style={{ margin: "6px 0 10px", padding: 13 }}
                onClick={pesan}
                disabled={!chosen || booking}
              >
                <IconBolt size={16} />
                {booking ? "Memproses..." : "Pesan Sekarang"}
              </button>
            )}

            <div className="secure">
              <span className="ico">
                <IconShieldCheck size={18} />
              </span>
              <div>
                <b>Pembayaran Aman</b>
                <span>Transaksimu dilindungi oleh Party Kosan</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <div style={{ height: 50 }} />

      <Modal open={pickOpen} onClose={() => setPickOpen(false)} wide>
        <h2 className="modal-title">Pilih Kamar</h2>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 6 }}>
          Pilih kamar yang tersedia untuk melanjutkan pemesanan.
        </p>
        {kamarList.length === 0 ? (
          <p className="muted" style={{ fontSize: 13, padding: "20px 0" }}>
            Belum ada data kamar untuk kos ini.
          </p>
        ) : (
          <table className="room-table">
            <thead>
              <tr>
                <th>No. Kamar</th>
                <th>Harga Bulanan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {kamarList.map((k, i) => {
                const available = kamarDapatDipesan(k);
                const kid = resolveKamarId(k);
                return (
                  <tr
                    key={kid ?? i}
                    className={`${available ? "selectable" : "disabled"}${
                      chosen && resolveKamarId(chosen) === kid ? " active" : ""
                    }`}
                    onClick={() => available && pickRoom(k)}
                  >
                    <td>{k.no_kamar}</td>
                    <td>{rupiah(k.harga_bulanan)}</td>
                    <td>{kamarTag(k)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Modal>

      <Modal
        open={!!success}
        onClose={() => setSuccess(null)}
        showClose={false}
      >
        {success && (
          <div className="modal-success">
            <div className="check-ico">
              <IconCheck size={28} />
            </div>
            <h2>Kamar Berhasil Dipesan!</h2>
            <p className="sub">
              Silakan hubungi nomor di bawah untuk melanjutkan proses pemesanan
              kamar dengan pemilik kos.
            </p>
            <div className="owner-box">
              <div className="owner-line">
                <span className="ico dark">
                  <IconUser size={18} />
                </span>
                <div>
                  <div className="l">Nama Pemilik</div>
                  <div className="v">{success.nama_pemilik}</div>
                </div>
              </div>
              <div className="owner-line">
                <span className="ico green">
                  <IconPhone size={18} />
                </span>
                <div>
                  <div className="l">Nomor Telepon</div>
                  <div className="v">{success.no_telp}</div>
                </div>
              </div>
            </div>
            <a
              className="btn btn-green btn-block"
              href={success.link_whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginBottom: 10, padding: 13 }}
            >
              <IconPhone size={16} />
              Hubungi via WhatsApp
            </a>
            <button
              className="btn btn-outline btn-block"
              onClick={() => setSuccess(null)}
            >
              Tutup
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
