"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import {
  asArray,
  resolveKosId,
  resolveKamarId,
  fasId,
  fasNama,
  fotoUrls,
} from "@/lib/kosan";
import { fasilitasIcon } from "@/lib/fasilitas";
import { rupiah, formatTanggal } from "@/lib/format";
import FormField, { inpClass } from "@/components/FormField";
import type {
  Fasilitas,
  Kamar,
  Kosan,
  KosSayaStat,
  StatusKamar,
  PenyewaItem,
  Perawatan,
  StatusPemesanan,
  StatusPerawatan,
  PrioritasPerawatan,
} from "@/types";
import AuthGuard from "@/components/AuthGuard";
import Modal from "@/components/Modal";
import ModalFeedback from "@/components/ui/ModalFeedback";
import PhotoUploader from "@/components/PhotoUploader";
import { Loading, EmptyState, BackLink } from "@/components/ui";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconMapPin,
  IconHome,
  IconChevronDown,
  IconCheck,
  IconX,
  IconWrench,
} from "@/components/Icons";

interface KamarForm {
  no_kamar: string;
  harga_bulanan: string;
  status: StatusKamar;
  ukuran: string;
  jenis_kasur: string;
}
const EMPTY_KAMAR: KamarForm = {
  no_kamar: "",
  harga_bulanan: "",
  status: "aktif",
  ukuran: "",
  jenis_kasur: "",
};

const STATUS_SEWA: Record<StatusPemesanan, { label: string; cls: string }> = {
  menunggu_konfirmasi: { label: "Menunggu Konfirmasi", cls: "menunggu" },
  aktif: { label: "Aktif", cls: "berhasil" },
  berhasil: { label: "Aktif", cls: "berhasil" },
  ditolak: { label: "Ditolak", cls: "dibatalkan" },
  dibatalkan: { label: "Dibatalkan", cls: "dibatalkan" },
  selesai: { label: "Selesai", cls: "menunggu" },
};

const STATUS_RAWAT: Record<StatusPerawatan, string> = {
  tertunda: "Tertunda",
  diproses: "Diproses",
  selesai: "Selesai",
};

const KATEGORI_RAWAT = [
  "AC", "Listrik", "Kamar Mandi", "Kasur", "Pintu",
  "Jendela", "Internet", "Cat Dinding", "Lainnya",
];

const JENIS_KASUR = ["Single", "Twin", "Double", "Queen", "King", "Super King"];
const UKURAN_KAMAR = ["2x3", "3x3", "3x4", "4x4", "4x5", "Lainnya"];

function apiErrMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const first = err.errors && Object.values(err.errors)[0]?.[0];
    return first || err.message;
  }
  return fallback;
}

function OwnerKosContent() {
  const { id } = useParams<{ id: string }>();
  const kosId = Number(id);

  const [kos, setKos] = useState<Kosan | null>(null);
  const [stat, setStat] = useState<KosSayaStat | null>(null);
  const [penyewa, setPenyewa] = useState<PenyewaItem[]>([]);
  const [perawatan, setPerawatan] = useState<Perawatan[]>([]);
  const [fasilitasList, setFasilitasList] = useState<Fasilitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    try {
      const [kosRes, statRes, penyewaRes, rawatRes, fasRes] = await Promise.all([
        // Gunakan endpoint pemilik agar ownership diverifikasi di backend (IDOR fix)
        api.get<Kosan>(`/pemilik/kosan/${kosId}`),
        api.get<KosSayaStat[]>("/pemilik/kos-saya").catch(() => ({ data: [] })),
        api.get<PenyewaItem[]>("/pemilik/pemesanan").catch(() => ({ data: [] })),
        api.get<Perawatan[]>("/pemilik/perawatan").catch(() => ({ data: [] })),
        api.get<Fasilitas[]>("/fasilitas", false).catch(() => ({ data: [] })),
      ]);
      if (!kosRes.data) setNotFound(true);
      setKos((kosRes.data as Kosan) ?? null);
      const stats = asArray<KosSayaStat>(statRes.data);
      setStat(stats.find((s) => resolveKosId(s) === kosId) ?? null);
      setPenyewa(
        asArray<PenyewaItem>(penyewaRes.data).filter(
          (p) => p.kosan?.id_kosan === kosId
        )
      );
      setPerawatan(
        asArray<Perawatan>(rawatRes.data).filter(
          (p) => p.kamar?.id_kosan === kosId
        )
      );
      setFasilitasList(asArray<Fasilitas>(fasRes.data));
    } catch (err) {
      // 403 = bukan milik user ini; 404 = tidak ada; keduanya → notFound
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
        setNotFound(true);
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }, [kosId]);

  useEffect(() => {
    load();
  }, [load]);

  const kamarList = useMemo(() => asArray<Kamar>(kos?.kamar ?? []), [kos]);
  const statusKosan = kos?.status_kosan ?? kos?.status ?? "aktif";
  const photos = fotoUrls(kos);

  const toggleAktif = async () => {
    setWorking(true);
    try {
      if (statusKosan === "nonaktif") await api.put(`/kosan/${kosId}/aktifkan`);
      else await api.put(`/kosan/${kosId}/nonaktifkan`);
      await load();
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className="wrap section">
        <Loading label="Memuat properti..." />
      </div>
    );
  }
  if (notFound || !kos) {
    return (
      <div className="wrap section">
        <EmptyState icon={<IconHome size={40} />} title="Properti tidak ditemukan">
          Properti ini tidak ada atau bukan milik Anda.
        </EmptyState>
      </div>
    );
  }

  const occ = Math.round(stat?.persentase_hunian || 0);

  return (
    <div className="wrap">
      <BackLink href="/kos-saya" />

      <div className="prop-hero">
        {photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="ph" src={photos[0]} alt={kos.nama_kosan} />
        ) : (
          <div className="ph img-building" />
        )}
        <div className="inner">
          <div>
            <span className="pill-status">{occ}% Terisi</span>
            <h1>{kos.nama_kosan}</h1>
            <div className="loc">
              <IconMapPin size={14} />
              {kos.alamat}
            </div>
          </div>
          <div className="hero-btns">
            <EditKosButton kos={kos} fasilitasList={fasilitasList} onSaved={load} />
            <button
              className={statusKosan === "nonaktif" ? "btn btn-light" : "btn btn-danger"}
              onClick={toggleAktif}
              disabled={working}
            >
              {statusKosan === "nonaktif" ? "Aktifkan Kos" : "Nonaktifkan Kos"}
            </button>
          </div>
        </div>
      </div>

      {photos.length > 1 && (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 12,
          }}
        >
          {photos.slice(1).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`${kos.nama_kosan} ${i + 2}`}
              style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: 12, display: "block" }}
            />
          ))}
        </div>
      )}

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginTop: 22 }}>
        <div className="stat">
          <div>
            <div className="lbl">Total Kamar</div>
            <div className="big">{stat?.total_kamar ?? kamarList.length}</div>
          </div>
        </div>
        <div className="stat">
          <div style={{ width: "100%" }}>
            <div className="lbl">Terisi</div>
            <div className="big">{stat?.kamar_terisi ?? 0}</div>
            <div className="progress">
              <i style={{ width: `${occ}%` }} />
            </div>
          </div>
        </div>
        <div className="stat">
          <div>
            <div className="lbl">Pendapatan Bulanan</div>
            <div className="big" style={{ fontSize: 22 }}>
              {rupiah(stat?.pendapatan_bulanan ?? 0)}
            </div>
          </div>
        </div>
        <div className="stat">
          <div>
            <div className="lbl">Perawatan</div>
            <div className="big" style={{ color: "var(--danger)" }}>
              {stat?.perawatan_tertunda ?? 0}{" "}
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                Tertunda
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="prop-cols"
        style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24, marginTop: 26 }}
      >
        <div>
          <ManajemenKamar kosId={kosId} kamarList={kamarList} onChanged={load} />
          <div style={{ height: 24 }} />
          <ManajemenPenyewa penyewa={penyewa} onChanged={load} />
        </div>

        <div>
          <div className="panel">
            <div className="panel-head">
              <h2>Fasilitas</h2>
            </div>
            {kos.fasilitas && kos.fasilitas.length > 0 ? (
              <div className="fac-grid">
                {kos.fasilitas.map((f, i) => {
                  const Icon = fasilitasIcon(fasNama(f));
                  return (
                    <div className="fac" key={fasId(f) ?? i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={16} />
                      {fasNama(f)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>
                Belum ada fasilitas terdaftar.
              </p>
            )}
          </div>

          <div style={{ height: 24 }} />
          <ManajemenPerawatan
            kamarList={kamarList}
            perawatan={perawatan}
            onChanged={load}
          />
        </div>
      </div>
      <div style={{ height: 50 }} />
    </div>
  );
}

function EditKosButton({
  kos,
  fasilitasList,
  onSaved,
}: {
  kos: Kosan;
  fasilitasList: Fasilitas[];
  onSaved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<null | { type: "success" | "error"; message?: string }>(null);

  const [form, setForm] = useState({
    nama_kosan: kos.nama_kosan ?? "",
    alamat: kos.alamat ?? "",
    landmark: kos.landmark ?? "",
    tipe_kosan: kos.tipe_kosan ?? "campur",
    deskripsi: kos.deskripsi ?? "",
  });
  const [sel, setSel] = useState<number[]>(
    (kos.fasilitas ?? []).map((f) => fasId(f)).filter((x): x is number => x !== null)
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [hapus, setHapus] = useState<number[]>([]);
  const [errs, setErrs] = useState<Record<string, string>>({});

  const existing = kos.foto ?? [];

  const openModal = () => {
    setForm({
      nama_kosan: kos.nama_kosan ?? "",
      alamat: kos.alamat ?? "",
      landmark: kos.landmark ?? "",
      tipe_kosan: kos.tipe_kosan ?? "campur",
      deskripsi: kos.deskripsi ?? "",
    });
    setSel((kos.fasilitas ?? []).map((f) => fasId(f)).filter((x): x is number => x !== null));
    setNewFiles([]);
    setHapus([]);
    setErrs({});
    setOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nama_kosan.trim()) e.nama_kosan = "Nama kosan wajib diisi.";
    if (!form.alamat.trim()) e.alamat = "Alamat wajib diisi.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setWorking(true);
    try {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("nama_kosan", form.nama_kosan);
      fd.append("alamat", form.alamat);
      fd.append("landmark", form.landmark);
      fd.append("tipe_kosan", form.tipe_kosan);
      fd.append("deskripsi", form.deskripsi);
      sel.forEach((idf) => fd.append("fasilitas[]", String(idf)));
      hapus.forEach((idf) => fd.append("hapus_foto[]", String(idf)));
      newFiles.forEach((f) => fd.append("foto[]", f));
      await api.post(`/pemilik/kosan/${resolveKosId(kos) ?? kos.id}`, fd);
      setOpen(false);
      await onSaved();
      setResult({ type: "success" });
    } catch (err) {
      setResult({ type: "error", message: apiErrMessage(err, "Gagal menyimpan perubahan.") });
    } finally {
      setWorking(false);
    }
  };

  const toggleFas = (idf: number) =>
    setSel((p) => (p.includes(idf) ? p.filter((x) => x !== idf) : [...p, idf]));
  const toggleHapus = (idf: number) =>
    setHapus((p) => (p.includes(idf) ? p.filter((x) => x !== idf) : [...p, idf]));

  return (
    <>
      <button className="btn btn-light" onClick={openModal}>
        <IconEdit size={15} />
        Edit Kos
      </button>

      <Modal open={open} onClose={() => setOpen(false)} wide>
        <h2 className="modal-title">Edit Kos</h2>
        <form onSubmit={submit} noValidate>
          <FormField label="Nama Kosan" error={errs.nama_kosan}>
            <div className={inpClass(errs.nama_kosan)}>
              <input
                value={form.nama_kosan}
                onChange={(e) => setForm({ ...form, nama_kosan: e.target.value })}
                onBlur={() => setErrs((p) => ({ ...p, nama_kosan: form.nama_kosan.trim() ? "" : "Nama kosan wajib diisi." }))}
                placeholder="Nama properti Anda"
              />
            </div>
          </FormField>

          <FormField label="Alamat" error={errs.alamat}>
            <div className={inpClass(errs.alamat)}>
              <textarea
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                onBlur={() => setErrs((p) => ({ ...p, alamat: form.alamat.trim() ? "" : "Alamat wajib diisi." }))}
                placeholder="Alamat lengkap kos"
              />
            </div>
          </FormField>

          <div className="row2">
            <FormField label="Landmark">
              <div className="inp">
                <input
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  placeholder="Dekat kampus, mall, dll."
                />
              </div>
            </FormField>
            <FormField label="Tipe Kos">
              <div className="inp">
                <select
                  value={form.tipe_kosan}
                  onChange={(e) => setForm({ ...form, tipe_kosan: e.target.value })}
                >
                  <option value="campur">Campur</option>
                  <option value="putra">Khusus Pria</option>
                  <option value="putri">Khusus Wanita</option>
                </select>
                <IconChevronDown size={14} />
              </div>
            </FormField>
          </div>

          <FormField label="Deskripsi">
            <div className="inp">
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Ceritakan keunggulan kos Anda"
              />
            </div>
          </FormField>

          <FormField label="Fasilitas">
            <div className="check-grid">
              {fasilitasList.map((f, i) => {
                const idf = fasId(f);
                if (idf === null) return null;
                return (
                  <label className="check" key={idf ?? i}>
                    <input type="checkbox" checked={sel.includes(idf)} onChange={() => toggleFas(idf)} />
                    <span>{fasNama(f)}</span>
                  </label>
                );
              })}
            </div>
          </FormField>

          {existing.length > 0 && (
            <div className="field">
              <label className="field-label">Foto Saat Ini (centang untuk hapus)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {existing.map((f) => {
                  const fid = f.id_foto ?? f.id ?? 0;
                  const marked = hapus.includes(fid);
                  return (
                    <div key={fid} style={{ position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.url_foto ?? f.url ?? ""}
                        alt="foto"
                        style={{
                          width: 84, height: 64, objectFit: "cover", borderRadius: 8,
                          opacity: marked ? 0.4 : 1, border: marked ? "2px solid var(--danger)" : "1px solid var(--line)",
                        }}
                      />
                      <button
                        type="button"
                        className="icon-btn del"
                        onClick={() => toggleHapus(fid)}
                        style={{ position: "absolute", top: -8, right: -8 }}
                        aria-label="Hapus foto"
                      >
                        {marked ? <IconCheck size={12} /> : <IconX size={12} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="field-label" style={{ marginTop: 8 }}>Tambah Foto Baru</div>
          <PhotoUploader files={newFiles} onChange={setNewFiles} />
          {existing.length - hapus.length + newFiles.length < 3 && (
            <small className="muted" style={{ fontSize: 12 }}>
              Disarankan minimal 3 foto agar properti tampil menarik.
            </small>
          )}

          <button type="submit" className="btn btn-green btn-block" style={{ marginTop: 18, padding: 13 }} disabled={working}>
            {working && <span className="btn-spinner" />}
            {working ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </Modal>

      <ModalFeedback
        open={result !== null}
        type={result?.type ?? "success"}
        title={result?.type === "error" ? "Gagal Menyimpan" : "Kos Berhasil Diperbarui"}
        description={result?.type === "error" ? result?.message : "Perubahan data kos telah disimpan."}
        actions={[{ label: result?.type === "error" ? "Coba Lagi" : "Selesai", variant: "green", onClick: () => setResult(null) }]}
        onClose={() => setResult(null)}
      />
    </>
  );
}

function ManajemenKamar({
  kosId,
  kamarList,
  onChanged,
}: {
  kosId: number;
  kamarList: Kamar[];
  onChanged: () => Promise<void>;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Kamar | null>(null);
  const [form, setForm] = useState<KamarForm>(EMPTY_KAMAR);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [working, setWorking] = useState(false);
  const [delKamar, setDelKamar] = useState<Kamar | null>(null);
  const [result, setResult] = useState<null | { type: "success" | "error"; message?: string; editing: boolean }>(null);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_KAMAR);
    setErrs({});
    setFormOpen(true);
  };
  const openEdit = (k: Kamar) => {
    setEditing(k);
    setForm({
      no_kamar: k.no_kamar ?? "",
      harga_bulanan: String(k.harga_bulanan ?? ""),
      status: (k.status as StatusKamar) ?? "aktif",
      ukuran: k.ukuran ?? "",
      jenis_kasur: k.jenis_kasur ?? "",
    });
    setErrs({});
    setFormOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.no_kamar.trim()) e.no_kamar = "No. kamar wajib diisi.";
    if (!form.harga_bulanan) {
      e.harga_bulanan = "Harga per bulan wajib diisi.";
    } else {
      const harga = Number(form.harga_bulanan);
      if (isNaN(harga) || harga <= 0) e.harga_bulanan = "Harga harus berupa angka lebih dari 0.";
      else if (harga < 100000) e.harga_bulanan = "Harga minimal Rp 100.000.";
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setWorking(true);
    const body = {
      id_kosan: kosId,
      no_kamar: form.no_kamar,
      harga_bulanan: Number(form.harga_bulanan) || 0,
      status: form.status,
      ukuran: form.ukuran,
      jenis_kasur: form.jenis_kasur,
    };
    const wasEditing = !!editing;
    try {
      if (editing) await api.put(`/pemilik/kamar/${resolveKamarId(editing)}`, body);
      else await api.post("/pemilik/kamar", body);
      setFormOpen(false);
      await onChanged();
      setResult({ type: "success", editing: wasEditing });
    } catch (err) {
      setFormOpen(false);
      setResult({ type: "error", editing: wasEditing, message: apiErrMessage(err, "Gagal menyimpan kamar.") });
    } finally {
      setWorking(false);
    }
  };

  const confirmDelete = async () => {
    if (!delKamar) return;
    const kid = resolveKamarId(delKamar);
    if (kid === null) return setDelKamar(null);
    setWorking(true);
    try {
      await api.del(`/pemilik/kamar/${kid}`);
      setDelKamar(null);
      await onChanged();
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Manajemen Kamar</h2>
          <div className="sub">Status ketersediaan dihitung otomatis dari penyewaan</div>
        </div>
        <button className="btn btn-dark" onClick={openAdd}>
          <IconPlus size={15} />
          Tambah Kamar
        </button>
      </div>
      {kamarList.length === 0 ? (
        <p className="muted" style={{ fontSize: 13.5, padding: "10px 0" }}>
          Belum ada kamar. Tambahkan kamar pertama Anda.
        </p>
      ) : (
        <table className="rooms">
          <thead>
            <tr>
              <th>No. Kamar</th>
              <th>Harga</th>
              <th>Status</th>
              <th>Ketersediaan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kamarList.map((k, i) => (
              <tr key={resolveKamarId(k) ?? i}>
                <td>{k.no_kamar}</td>
                <td>{rupiah(k.harga_bulanan)}</td>
                <td>
                  <span className={`tag ${k.status === "nonaktif" ? "nonaktif" : "tersedia"}`}>
                    {k.status === "nonaktif" ? "NONAKTIF" : "AKTIF"}
                  </span>
                </td>
                <td>
                  <span className={`tag ${(k.ketersediaan ?? "tersedia") === "terisi" ? "terisi" : "tersedia"}`}>
                    {(k.ketersediaan ?? "tersedia") === "terisi" ? "TERISI" : "TERSEDIA"}
                  </span>
                </td>
                <td>
                  <div className="actcell">
                    <button className="icon-btn" aria-label="Edit" onClick={() => openEdit(k)}>
                      <IconEdit size={14} />
                    </button>
                    <button className="icon-btn del" aria-label="Hapus" onClick={() => setDelKamar(k)}>
                      <IconTrash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)}>
        <h2 className="modal-title">{editing ? "Edit Kamar" : "Tambah Kamar Baru"}</h2>
        <form onSubmit={submit} noValidate>
          <div className="row2">
            <FormField label="No. Kamar" error={errs.no_kamar}>
              <div className={inpClass(errs.no_kamar)}>
                <input
                  value={form.no_kamar}
                  onChange={(e) => setForm({ ...form, no_kamar: e.target.value })}
                  onBlur={() => setErrs((p) => ({ ...p, no_kamar: form.no_kamar.trim() ? "" : "No. kamar wajib diisi." }))}
                  placeholder="A-101"
                />
              </div>
            </FormField>
            <FormField label="Harga / Bulan" error={errs.harga_bulanan}>
              <div className={inpClass(errs.harga_bulanan)}>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>Rp</span>
                <input
                  value={form.harga_bulanan}
                  onChange={(e) => setForm({ ...form, harga_bulanan: e.target.value.replace(/\D/g, "") })}
                  onBlur={() => {
                    const h = Number(form.harga_bulanan);
                    setErrs((p) => ({ ...p, harga_bulanan: !form.harga_bulanan || isNaN(h) || h < 100000 ? "Harga minimal Rp 100.000." : "" }));
                  }}
                  placeholder="1500000"
                />
              </div>
            </FormField>
          </div>
          <div className="row2">
            <FormField label="Ukuran Kamar">
              <div className="inp">
                <select value={form.ukuran} onChange={(e) => setForm({ ...form, ukuran: e.target.value })}>
                  <option value="">Pilih ukuran</option>
                  {UKURAN_KAMAR.map((u) => <option key={u} value={u}>{u}</option>)}
                  {form.ukuran && !UKURAN_KAMAR.includes(form.ukuran) && (
                    <option value={form.ukuran}>{form.ukuran}</option>
                  )}
                </select>
                <IconChevronDown size={14} />
              </div>
            </FormField>
            <FormField label="Jenis Kasur">
              <div className="inp">
                <select value={form.jenis_kasur} onChange={(e) => setForm({ ...form, jenis_kasur: e.target.value })}>
                  <option value="">Pilih jenis kasur</option>
                  {JENIS_KASUR.map((k) => <option key={k} value={k}>{k}</option>)}
                  {form.jenis_kasur && !JENIS_KASUR.includes(form.jenis_kasur) && (
                    <option value={form.jenis_kasur}>{form.jenis_kasur}</option>
                  )}
                </select>
                <IconChevronDown size={14} />
              </div>
            </FormField>
          </div>
          <FormField
            label="Status Kamar"
            hint='Status "Terisi/Tersedia" dihitung otomatis dari data penyewaan.'
          >
            <div className="inp">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusKamar })}>
                <option value="aktif">Aktif — dapat disewakan & tampil di pencarian</option>
                <option value="nonaktif">Nonaktif — tidak dapat disewakan</option>
              </select>
              <IconChevronDown size={14} />
            </div>
          </FormField>

          <button type="submit" className="btn btn-green btn-block" style={{ marginTop: 20, padding: 13 }} disabled={working}>
            {working && <span className="btn-spinner" />}
            {working ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Kamar"}
          </button>
        </form>
      </Modal>

      <ModalFeedback
        open={result !== null}
        type={result?.type ?? "success"}
        title={
          result?.type === "error"
            ? "Gagal Menyimpan Kamar"
            : result?.editing
            ? "Kamar Berhasil Diperbarui"
            : "Kamar Berhasil Ditambahkan"
        }
        description={result?.type === "error" ? result?.message : "Data kamar telah disimpan."}
        actions={[{ label: result?.type === "error" ? "Coba Lagi" : "Selesai", variant: "green", onClick: () => { const r = result; setResult(null); if (r?.type === "error") setFormOpen(true); } }]}
        onClose={() => setResult(null)}
      />

      <Modal open={!!delKamar} onClose={() => setDelKamar(null)}>
        <h2 className="modal-title">Hapus Kamar?</h2>
        <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>
          Kamar <b>{delKamar?.no_kamar}</b> akan dihapus permanen.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button className="btn btn-outline btn-block" onClick={() => setDelKamar(null)}>Batal</button>
          <button className="btn btn-danger btn-block" onClick={confirmDelete} disabled={working}>
            {working ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function ManajemenPenyewa({
  penyewa,
  onChanged,
}: {
  penyewa: PenyewaItem[];
  onChanged: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<"semua" | StatusPemesanan>("semua");
  const [working, setWorking] = useState(false);
  const [action, setAction] = useState<
    null | { item: PenyewaItem; type: "tolak" | "batalkan" }
  >(null);
  const [alasan, setAlasan] = useState("");

  const FILTERS: { key: "semua" | StatusPemesanan; label: string }[] = [
    { key: "semua", label: "Semua" },
    { key: "menunggu_konfirmasi", label: "Menunggu" },
    { key: "aktif", label: "Aktif" },
    { key: "selesai", label: "Selesai" },
    { key: "ditolak", label: "Ditolak" },
    { key: "dibatalkan", label: "Dibatalkan" },
  ];

  const list =
    filter === "semua"
      ? penyewa
      : penyewa.filter((p) =>
          filter === "aktif"
            ? p.status === "aktif" || p.status === "berhasil"
            : p.status === filter
        );

  const act = async (id: number, path: string, body?: unknown) => {
    setWorking(true);
    try {
      await api.put(`/pemilik/pemesanan/${id}/${path}`, body);
      await onChanged();
    } catch (err) {
      alert(apiErrMessage(err, "Aksi gagal."));
    } finally {
      setWorking(false);
    }
  };

  const submitAlasan = async () => {
    if (!action) return;
    await act(action.item.id_pemesanan, action.type, { alasan_pembatalan: alasan });
    setAction(null);
    setAlasan("");
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Manajemen Penyewa</h2>
          <div className="sub">Kelola pengajuan & penyewa aktif properti ini</div>
        </div>
      </div>

      <div className="filter-pills" style={{ marginBottom: 14 }}>
        {FILTERS.map((f) => (
          <button key={f.key} className={`fpill${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="muted" style={{ fontSize: 13.5, padding: "8px 0" }}>
          Tidak ada data penyewa pada kategori ini.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {list.map((p) => {
            const s = STATUS_SEWA[p.status] ?? STATUS_SEWA.menunggu_konfirmasi;
            return (
              <div key={p.id_pemesanan} className="tenant-card" style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div>
                    <b style={{ fontSize: 14.5 }}>{p.penyewa?.nama ?? "Penyewa"}</b>
                    <div className="muted" style={{ fontSize: 12.5 }}>
                      Kamar {p.kamar?.no_kamar} · {rupiah(p.kamar?.harga_bulanan ?? 0)}/bln
                    </div>
                  </div>
                  <span className={`status-pill ${s.cls}`}>{s.label}</span>
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>
                  {p.penyewa?.no_telp && <span>📞 {p.penyewa.no_telp} </span>}
                  {p.penyewa?.email && <span>· ✉ {p.penyewa.email}</span>}
                </div>
                {(p.tanggal_mulai || p.durasi_bulan) && (
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                    {p.tanggal_mulai ? `${formatTanggal(p.tanggal_mulai)} – ${formatTanggal(p.tanggal_selesai)}` : ""}
                    {p.durasi_bulan ? ` · ${p.durasi_bulan} bulan` : ""}
                  </div>
                )}
                {p.alasan_pembatalan && (p.status === "ditolak" || p.status === "dibatalkan") && (
                  <div className="alert error" style={{ marginTop: 8 }}>
                    Alasan: {p.alasan_pembatalan}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {p.status === "menunggu_konfirmasi" && (
                    <>
                      <button className="btn btn-green" disabled={working} onClick={() => act(p.id_pemesanan, "konfirmasi")}>
                        <IconCheck size={14} /> Konfirmasi
                      </button>
                      <button className="btn btn-danger" disabled={working} onClick={() => { setAction({ item: p, type: "tolak" }); setAlasan(""); }}>
                        <IconX size={14} /> Tolak
                      </button>
                    </>
                  )}
                  {(p.status === "aktif" || p.status === "berhasil") && (
                    <>
                      <button className="btn btn-dark" disabled={working} onClick={() => act(p.id_pemesanan, "akhiri")}>
                        Akhiri Sewa
                      </button>
                      <button className="btn btn-danger" disabled={working} onClick={() => { setAction({ item: p, type: "batalkan" }); setAlasan(""); }}>
                        Batalkan
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!action} onClose={() => setAction(null)}>
        <h2 className="modal-title">{action?.type === "tolak" ? "Tolak Pengajuan" : "Batalkan Sewa"}</h2>
        <FormField label="Alasan">
          <div className="inp" style={{ marginTop: 2 }}>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Contoh: Kamar sudah tidak tersedia."
            />
          </div>
        </FormField>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button className="btn btn-outline btn-block" onClick={() => setAction(null)}>Batal</button>
          <button className="btn btn-danger btn-block" disabled={working} onClick={submitAlasan}>
            {working ? "Memproses..." : "Kirim"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

interface RawatForm {
  id_kamar: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  prioritas: PrioritasPerawatan;
  status: StatusPerawatan;
  tanggal_laporan: string;
  tanggal_selesai: string;
}
const EMPTY_RAWAT: RawatForm = {
  id_kamar: "",
  judul: "",
  deskripsi: "",
  kategori: "AC",
  prioritas: "medium",
  status: "tertunda",
  tanggal_laporan: "",
  tanggal_selesai: "",
};

function ManajemenPerawatan({
  kamarList,
  perawatan,
  onChanged,
}: {
  kamarList: Kamar[];
  perawatan: Perawatan[];
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Perawatan | null>(null);
  const [form, setForm] = useState<RawatForm>(EMPTY_RAWAT);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [working, setWorking] = useState(false);
  const [del, setDel] = useState<Perawatan | null>(null);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_RAWAT, id_kamar: String(resolveKamarId(kamarList[0] ?? {}) ?? "") });
    setErrs({});
    setOpen(true);
  };
  const openEdit = (p: Perawatan) => {
    setEditing(p);
    setForm({
      id_kamar: String(p.id_kamar ?? ""),
      judul: p.judul ?? "",
      deskripsi: p.deskripsi ?? "",
      kategori: p.kategori ?? "AC",
      prioritas: p.prioritas ?? "medium",
      status: p.status ?? "tertunda",
      tanggal_laporan: p.tanggal_laporan ? String(p.tanggal_laporan).slice(0, 10) : "",
      tanggal_selesai: p.tanggal_selesai ? String(p.tanggal_selesai).slice(0, 10) : "",
    });
    setErrs({});
    setOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.id_kamar) e.id_kamar = "Pilih kamar.";
    if (!form.judul.trim()) e.judul = "Judul perawatan wajib diisi.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setWorking(true);
    try {
      const body: Record<string, unknown> = {
        judul: form.judul,
        deskripsi: form.deskripsi,
        kategori: form.kategori,
        prioritas: form.prioritas,
        status: form.status,
      };
      if (form.tanggal_selesai) body.tanggal_selesai = form.tanggal_selesai;
      if (editing) {
        await api.put(`/pemilik/perawatan/${editing.id_perawatan}`, body);
      } else {
        body.id_kamar = Number(form.id_kamar);
        if (form.tanggal_laporan) body.tanggal_laporan = form.tanggal_laporan;
        await api.post("/pemilik/perawatan", body);
      }
      setOpen(false);
      await onChanged();
    } catch (err) {
      setErrs({ _global: apiErrMessage(err, "Gagal menyimpan perawatan.") });
    } finally {
      setWorking(false);
    }
  };

  const confirmDelete = async () => {
    if (!del) return;
    setWorking(true);
    try {
      await api.del(`/pemilik/perawatan/${del.id_perawatan}`);
      setDel(null);
      await onChanged();
    } finally {
      setWorking(false);
    }
  };

  const kamarLabel = (idKamar?: number) =>
    kamarList.find((k) => resolveKamarId(k) === idKamar)?.no_kamar ?? `#${idKamar}`;

  return (
    <div className="panel">
      <div className="panel-head">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconWrench size={18} />
          <h2>Perawatan</h2>
        </div>
        <button className="btn btn-dark" onClick={openAdd} disabled={kamarList.length === 0}>
          <IconPlus size={15} />
          Tambah
        </button>
      </div>

      {perawatan.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>Belum ada laporan perawatan.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {perawatan.map((p) => (
            <div key={p.id_perawatan} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <b style={{ fontSize: 13.5 }}>{p.judul}</b>
                <span className={`tag ${p.status === "selesai" ? "tersedia" : p.status === "diproses" ? "terisi" : "perawatan"}`}>
                  {STATUS_RAWAT[p.status]}
                </span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                Kamar {kamarLabel(p.id_kamar)} · {p.kategori} · {p.prioritas?.toUpperCase()}
              </div>
              {p.deskripsi && <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>{p.deskripsi}</p>}
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button className="icon-btn" aria-label="Edit" onClick={() => openEdit(p)}><IconEdit size={13} /></button>
                <button className="icon-btn del" aria-label="Hapus" onClick={() => setDel(p)}><IconTrash size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="modal-title">{editing ? "Edit Perawatan" : "Tambah Perawatan"}</h2>
        <form onSubmit={submit} noValidate>
          {!editing && (
            <FormField label="Kamar" error={errs.id_kamar}>
              <div className={inpClass(errs.id_kamar)}>
                <select value={form.id_kamar} onChange={(e) => setForm({ ...form, id_kamar: e.target.value })}>
                  <option value="">Pilih kamar</option>
                  {kamarList.map((k) => (
                    <option key={resolveKamarId(k)} value={String(resolveKamarId(k))}>{k.no_kamar}</option>
                  ))}
                </select>
                <IconChevronDown size={14} />
              </div>
            </FormField>
          )}
          <FormField label="Judul Perawatan" error={errs.judul}>
            <div className={inpClass(errs.judul)}>
              <input
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                onBlur={() => setErrs((p) => ({ ...p, judul: form.judul.trim() ? "" : "Judul perawatan wajib diisi." }))}
                placeholder="Contoh: AC tidak dingin"
              />
            </div>
          </FormField>
          <FormField label="Deskripsi">
            <div className="inp">
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Jelaskan masalah secara singkat"
              />
            </div>
          </FormField>
          <div className="row2">
            <FormField label="Kategori">
              <div className="inp">
                <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
                  {KATEGORI_RAWAT.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <IconChevronDown size={14} />
              </div>
            </FormField>
            <FormField label="Prioritas">
              <div className="inp">
                <select value={form.prioritas} onChange={(e) => setForm({ ...form, prioritas: e.target.value as PrioritasPerawatan })}>
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
                <IconChevronDown size={14} />
              </div>
            </FormField>
          </div>
          <div className="row2">
            <FormField label="Status">
              <div className="inp">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusPerawatan })}>
                  <option value="tertunda">Tertunda</option>
                  <option value="diproses">Diproses</option>
                  <option value="selesai">Selesai</option>
                </select>
                <IconChevronDown size={14} />
              </div>
            </FormField>
            <FormField label="Tanggal Selesai">
              <div className="inp">
                <input type="date" value={form.tanggal_selesai} onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })} />
              </div>
            </FormField>
          </div>

          {errs._global && <div className="alert error">{errs._global}</div>}

          <button type="submit" className="btn btn-green btn-block" style={{ marginTop: 16, padding: 13 }} disabled={working}>
            {working && <span className="btn-spinner" />}
            {working ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Perawatan"}
          </button>
        </form>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)}>
        <h2 className="modal-title">Hapus Perawatan?</h2>
        <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>
          Laporan <b>{del?.judul}</b> akan dihapus permanen.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button className="btn btn-outline btn-block" onClick={() => setDel(null)}>Batal</button>
          <button className="btn btn-danger btn-block" onClick={confirmDelete} disabled={working}>
            {working ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function OwnerKosPage() {
  return (
    <AuthGuard>
      <OwnerKosContent />
    </AuthGuard>
  );
}
