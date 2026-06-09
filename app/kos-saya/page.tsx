"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { asArray, resolveKosId } from "@/lib/kosan";
import { rupiah, phClass } from "@/lib/format";
import type { DashboardData, KosSayaStat } from "@/types";
import AuthGuard from "@/components/AuthGuard";
import DaftarkanKostForm from "@/components/DaftarkanKostForm";
import Modal from "@/components/Modal";
import ModalFeedback from "@/components/ui/ModalFeedback";
import { Loading, EmptyState } from "@/components/ui";
import { BackLink } from "@/components/ui";
import {
  IconPlus,
  IconHome,
  IconUsers,
  IconEdit,
  IconTrash,
  IconMapPin,
} from "@/components/Icons";

function KosSayaContent() {
  const [kosList, setKosList] = useState<KosSayaStat[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(false);
  const [delTarget, setDelTarget] = useState<KosSayaStat | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [delResult, setDelResult] = useState<
    null | { type: "success" | "error"; message?: string }
  >(null);

  const load = useCallback(async () => {
    setLoadErr(false);
    try {
      const [kosRes, dashRes] = await Promise.all([
        api.get<KosSayaStat[]>("/pemilik/kos-saya"),
        api.get<DashboardData>("/dashboard").catch(() => ({ data: undefined })),
      ]);
      setKosList(asArray<KosSayaStat>(kosRes.data));
      setDashboard((dashRes.data as DashboardData) ?? null);
    } catch {
      setLoadErr(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    if (!delTarget) return;
    const kid = resolveKosId(delTarget);
    if (kid === null) return;
    setDeleting(true);
    try {
      await api.del(`/pemilik/kosan/${kid}`);
      setDelTarget(null);
      setLoading(true);
      await load();
      setDelResult({ type: "success" });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Gagal menghapus properti. Silakan coba lagi.";
      setDelTarget(null);
      setDelResult({ type: "error", message });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="wrap section">
        <Loading label="Memuat properti Anda..." />
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="wrap section">
        <EmptyState icon={<IconHome size={40} />} title="Gagal memuat data">
          Tidak dapat memuat properti. Pastikan Anda sudah login dan server berjalan.
          <br />
          <button className="btn btn-dark" style={{ marginTop: 16 }} onClick={() => { setLoading(true); load(); }}>
            Coba Lagi
          </button>
        </EmptyState>
      </div>
    );
  }

  if (kosList.length === 0) {
    return (
      <div className="wrap">
        <BackLink href="/" />
        <DaftarkanKostForm />
        <div style={{ height: 50 }} />
      </div>
    );
  }

  const totalProperti = dashboard?.total_kosan ?? kosList.length;
  const totalKamar = kosList.reduce((a, k) => a + (k.total_kamar || 0), 0);
  const totalTerisi = kosList.reduce((a, k) => a + (k.kamar_terisi || 0), 0);
  const hunian = totalKamar ? Math.round((totalTerisi / totalKamar) * 100) : 0;

  return (
    <div className="wrap">
      <BackLink href="/" />

      <div className="sec-head" style={{ alignItems: "center" }}>
        <div className="page-head">
          <h1>Kelola Properti Saya</h1>
          <div className="sub">
            Berikut ringkasan aktivitas propertimu hari ini.
          </div>
        </div>
        <Link className="btn btn-dark" href="/kos-saya/daftar">
          <IconPlus size={16} />
          Tambah Properti Baru
        </Link>
      </div>

      <div
        className="stat-grid grid-2"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: 6 }}
      >
        <div className="stat">
          <div>
            <div className="lbl">Total Properti</div>
            <div className="big">{String(totalProperti).padStart(2, "0")}</div>
          </div>
          <div className="ico">
            <IconHome size={20} />
          </div>
        </div>
        <div className="stat">
          <div>
            <div className="lbl">Hunian Aktif</div>
            <div className="big green">{hunian}%</div>
          </div>
          <div className="ico">
            <IconUsers size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginTop: 24 }}>
        {kosList.map((k, idx) => {
          const occ = Math.round(k.persentase_hunian || 0);
          const kid = resolveKosId(k);
          const detailHref = kid !== null ? `/kos-saya/${kid}` : "#";
          return (
            <div className="mp-card" key={kid ?? idx}>
              <div className="thumb">
                {k.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={k.foto}
                    alt={k.nama_kosan}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div className={`ph ${phClass(kid ?? k.nama_kosan)}`} />
                )}
                {k.status_kosan === "nonaktif" && (
                  <span className="badge review">Nonaktif</span>
                )}
              </div>
              <div className="mp-body">
                <div className="mp-top">
                  <h3>{k.nama_kosan}</h3>
                  <span className="mp-occ">{occ}% Terisi</span>
                </div>
                {k.alamat && (
                  <div className="loc">
                    <IconMapPin size={13} />
                    {k.alamat}
                  </div>
                )}
                <div className="progress">
                  <i style={{ width: `${occ}%` }} />
                </div>
                <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                  Pendapatan: <b>{rupiah(k.pendapatan_bulanan)}</b>/bln
                </p>
                <div className="mp-actions">
                  <Link className="icon-btn" href={detailHref} aria-label="Kelola">
                    <IconEdit size={16} />
                  </Link>
                  <button
                    className="icon-btn del"
                    aria-label="Hapus"
                    onClick={() => setDelTarget(k)}
                  >
                    <IconTrash size={16} />
                  </button>
                  <Link className="btn btn-light" href={detailHref}>
                    Lihat Detail
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 50 }} />

      <Modal open={!!delTarget} onClose={() => setDelTarget(null)}>
        <h2 className="modal-title">Hapus Properti?</h2>
        <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>
          Properti <b>{delTarget?.nama_kosan}</b> dan seluruh kamarnya akan dihapus
          permanen. Tindakan ini tidak dapat dibatalkan.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button
            className="btn btn-outline btn-block"
            onClick={() => setDelTarget(null)}
          >
            Batal
          </button>
          <button
            className="btn btn-danger btn-block"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting && <span className="btn-spinner" />}
            {deleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </Modal>

      <ModalFeedback
        open={delResult !== null}
        type={delResult?.type ?? "success"}
        title={
          delResult?.type === "error"
            ? "Gagal Menghapus Properti"
            : "Properti Berhasil Dihapus"
        }
        description={
          delResult?.type === "error"
            ? delResult?.message
            : "Properti telah berhasil dihapus dari daftar Kos Saya."
        }
        actions={
          delResult?.type === "error"
            ? [{ label: "Coba Lagi", variant: "green", onClick: () => setDelResult(null) }]
            : [{ label: "Tutup", variant: "green", onClick: () => setDelResult(null) }]
        }
        onClose={() => setDelResult(null)}
      />
    </div>
  );
}

export default function KosSayaPage() {
  return (
    <AuthGuard>
      <KosSayaContent />
    </AuthGuard>
  );
}
