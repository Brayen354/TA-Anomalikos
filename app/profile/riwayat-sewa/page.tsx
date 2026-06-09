"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { asArray, hargaMin, fotoUrls } from "@/lib/kosan";
import { rupiah, formatTanggal, phClass, labelTipeKosan } from "@/lib/format";
import type { Kosan, RiwayatPemesanan, StatusPemesanan } from "@/types";
import AuthGuard from "@/components/AuthGuard";
import Modal from "@/components/Modal";
import { Loading, EmptyState, BackLink } from "@/components/ui";
import { IconHistory, IconCalendar, IconMapPin, IconPhone, IconMail, IconEye, IconUser } from "@/components/Icons";

const STATUS_LABEL: Record<StatusPemesanan, string> = {
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  aktif: "Aktif",
  berhasil: "Aktif",
  ditolak: "Ditolak",
  dibatalkan: "Dibatalkan",
  selesai: "Selesai",
};

const STATUS_CLASS: Record<StatusPemesanan, string> = {
  menunggu_konfirmasi: "menunggu",
  aktif: "berhasil",
  berhasil: "berhasil",
  ditolak: "dibatalkan",
  dibatalkan: "dibatalkan",
  selesai: "menunggu",
};

const FILTERS: { key: "semua" | StatusPemesanan; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "menunggu_konfirmasi", label: "Menunggu" },
  { key: "aktif", label: "Aktif" },
  { key: "selesai", label: "Selesai" },
  { key: "ditolak", label: "Ditolak" },
  { key: "dibatalkan", label: "Dibatalkan" },
];

function RiwayatContent() {
  const [items, setItems] = useState<RiwayatPemesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"semua" | StatusPemesanan>("semua");

  const [detail, setDetail] = useState<RiwayatPemesanan | null>(null);
  const [detailKos, setDetailKos] = useState<Kosan | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<RiwayatPemesanan[]>("/riwayat-pemesanan");
        setItems(asArray<RiwayatPemesanan>(res.data));
      } catch {
        // error handled by empty state (loading = false via finally)
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openDetail = useCallback(async (it: RiwayatPemesanan) => {
    setDetail(it);
    setDetailKos(null);
    if (it.id_kosan == null) return;
    setDetailLoading(true);
    try {
      const res = await api.get<Kosan>(`/kosan/${it.id_kosan}`, false);
      setDetailKos((res.data as Kosan) ?? null);
    } catch {
      setDetailKos(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const filtered =
    filter === "semua" ? items : items.filter((i) => i.status === filter);

  return (
    <div className="wrap section" style={{ maxWidth: 820 }}>
      <BackLink href="/profile" />
      <div className="page-head" style={{ marginTop: 8 }}>
        <h1>Riwayat Sewa</h1>
        <div className="sub">
          Kelola dan pantau seluruh transaksi penyewaan kamar Anda di satu tempat.
        </div>
      </div>

      <div className="filter-pills" style={{ marginTop: 20 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`fpill${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<IconHistory size={40} />} title="Belum ada riwayat sewa">
          Pemesanan kamar yang Anda buat akan muncul di sini.
        </EmptyState>
      ) : (
        filtered.map((it, idx) => {
          const st = (it.status as StatusPemesanan) ?? "menunggu_konfirmasi";
          return (
            <div className="history-card" key={it.id ?? it.id_pemesanan ?? idx}>
              {it.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="thumb"
                  src={it.foto}
                  alt={it.nama_kosan}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className={`thumb ph ${phClass(it.nama_kosan ?? idx)}`} />
              )}
              <div className="hc-body">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <h3>{it.nama_kosan}</h3>
                  <span className={`status-pill ${STATUS_CLASS[st]}`}>
                    {STATUS_LABEL[st]}
                  </span>
                </div>
                <div className="history-meta">
                  <IconCalendar size={14} />
                  {it.tanggal_mulai
                    ? `${formatTanggal(it.tanggal_mulai)} – ${formatTanggal(
                        it.tanggal_selesai
                      )}`
                    : `Diajukan: ${formatTanggal(it.tanggal_pengajuan)}`}
                </div>
                <div className="history-meta">
                  <IconMapPin size={14} />
                  Kamar {it.nama_kamar}
                </div>

                {st === "menunggu_konfirmasi" && (
                  <div className="alert info" style={{ marginTop: 10 }}>
                    Menunggu konfirmasi pemilik. Silakan hubungi pemilik kos untuk
                    melanjutkan proses pemesanan.
                  </div>
                )}
                {(st === "dibatalkan" || st === "ditolak") && it.alasan_pembatalan && (
                  <div className="alert error" style={{ marginTop: 10 }}>
                    <b>Alasan:</b> {it.alasan_pembatalan}
                  </div>
                )}

                {(it.nama_pemilik || it.no_telp_pemilik || it.email_pemilik) && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                      Pemilik: <b style={{ color: "var(--green-deep)" }}>{it.nama_pemilik ?? "-"}</b>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {it.link_whatsapp && (
                        <a
                          className="btn btn-green"
                          href={it.link_whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: "8px 14px" }}
                        >
                          <IconPhone size={14} /> Kontak Pemilik
                        </a>
                      )}
                      {it.email_pemilik && (
                        <a className="btn btn-outline" href={`mailto:${it.email_pemilik}`} style={{ padding: "8px 14px" }}>
                          <IconMail size={14} /> {it.email_pemilik}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {it.total_harga ? (
                  <div className="history-total">
                    <div className="l">Total Pembayaran</div>
                    <div className="v">{rupiah(it.total_harga)}</div>
                  </div>
                ) : null}

                <button
                  className="btn btn-outline"
                  style={{ marginTop: 12, padding: "8px 14px" }}
                  onClick={() => openDetail(it)}
                >
                  <IconEye size={14} /> Lihat Detail
                </button>
              </div>
            </div>
          );
        })
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} wide>
        {detail && (
          <>
            <h2 className="modal-title">Detail Kos</h2>
            {(() => {
              const fotos = fotoUrls(detailKos);
              const foto = fotos[0] ?? detail.foto ?? null;
              const st = (detail.status as StatusPemesanan) ?? "menunggu_konfirmasi";
              const harga =
                (detailKos ? hargaMin(detailKos) : null) ?? detail.harga_bulanan ?? null;
              const alamat = detailKos?.alamat ?? detail.alamat ?? "-";
              const tipe = detailKos?.tipe_kosan ?? detail.tipe_kosan ?? undefined;
              const pemilik = detailKos?.pengguna;
              return (
                <div>
                  {foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={foto}
                      alt={detail.nama_kosan}
                      style={{ width: "100%", aspectRatio: "16 / 7", objectFit: "cover", borderRadius: 14, display: "block" }}
                    />
                  ) : (
                    <div className={`ph ${phClass(detail.nama_kosan)}`} style={{ width: "100%", aspectRatio: "16 / 7", borderRadius: 14 }} />
                  )}

                  <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 14 }}>{detail.nama_kosan}</h3>
                  <div className="history-meta" style={{ marginTop: 6 }}>
                    <IconMapPin size={14} /> {alamat}
                  </div>

                  <div className="fb-details" style={{ marginTop: 14 }}>
                    <div className="fb-row"><span className="l">Tipe Kos</span><span className="v">{labelTipeKosan(tipe)}</span></div>
                    <div className="fb-row"><span className="l">Kamar</span><span className="v">{detail.nama_kamar}</span></div>
                    <div className="fb-row"><span className="l">Harga</span><span className="v">{harga ? `${rupiah(harga)} / bln` : "Hubungi pemilik"}</span></div>
                    <div className="fb-row">
                      <span className="l">Status Sewa</span>
                      <span className="v"><span className={`status-pill ${STATUS_CLASS[st]}`}>{STATUS_LABEL[st]}</span></span>
                    </div>
                    {(detail.tanggal_mulai || detail.tanggal_selesai) && (
                      <div className="fb-row">
                        <span className="l">Periode</span>
                        <span className="v">{formatTanggal(detail.tanggal_mulai)} – {formatTanggal(detail.tanggal_selesai)}</span>
                      </div>
                    )}
                    <div className="fb-row"><span className="l">Pemilik</span><span className="v">{pemilik?.nama ?? detail.nama_pemilik ?? "-"}</span></div>
                    <div className="fb-row"><span className="l">Kontak</span><span className="v">{pemilik?.no_telp ?? detail.no_telp_pemilik ?? "-"}</span></div>
                  </div>

                  {detailLoading && <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Memuat data terbaru...</p>}

                  <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                    {detail.link_whatsapp && (
                      <a className="btn btn-green btn-block" href={detail.link_whatsapp} target="_blank" rel="noopener noreferrer">
                        <IconPhone size={15} /> Hubungi Pemilik
                      </a>
                    )}
                    {detail.id_kosan != null && (
                      <a className="btn btn-outline btn-block" href={`/kos/${detail.id_kosan}`}>
                        <IconUser size={15} /> Buka Halaman Kos
                      </a>
                    )}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </Modal>

      <div style={{ height: 50 }} />
    </div>
  );
}

export default function RiwayatSewaPage() {
  return (
    <AuthGuard>
      <RiwayatContent />
    </AuthGuard>
  );
}
