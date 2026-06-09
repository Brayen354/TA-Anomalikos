"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { asArray, resolveKosId, fasId, fasNama } from "@/lib/kosan";
import { useAuth } from "@/hooks/useAuth";
import { mapApiErrors } from "@/lib/errorMapper";
import ModalFeedback from "@/components/ui/ModalFeedback";
import PhotoUploader from "@/components/PhotoUploader";
import FormField, { inpClass } from "@/components/FormField";
import type { Fasilitas, Kosan } from "@/types";
import {
  IconChevronDown,
  IconShieldCheck,
  IconBuilding,
  IconUsers,
  IconUser,
  IconPhone,
  IconMail,
  IconPlus,
} from "@/components/Icons";

export default function DaftarkanKostForm({ showHero = true }: { showHero?: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const [fasilitasList, setFasilitasList] = useState<Fasilitas[]>([]);
  const [form, setForm] = useState({
    nama_pemilik: "",
    whatsapp: "",
    email: "",
    nama_kosan: "",
    alamat: "",
    landmark: "",
    tipe_kosan: "campur",
    harga: "",
  });
  const [selFasilitas, setSelFasilitas] = useState<number[]>([]);
  const [extra, setExtra] = useState("");
  const [extraTags, setExtraTags] = useState<string[]>([]);
  const [fotoFiles, setFotoFiles] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    null | { type: "success" | "error"; message?: string; nama?: string; id?: number }
  >(null);

  const MIN_FOTO = 3;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Fasilitas[]>("/fasilitas", false);
        setFasilitasList(asArray<Fasilitas>(res.data));
      } catch {
      }
    })();
  }, []);

  const prefilledRef = useRef(false);
  useEffect(() => {
    if (user && !prefilledRef.current) {
      prefilledRef.current = true;
      setForm((f) => ({
        ...f,
        nama_pemilik: f.nama_pemilik || user.nama || "",
        email: f.email || user.email || "",
        whatsapp: f.whatsapp || user.no_telp || "",
      }));
    }
  }, [user]);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleFasilitas = (id: number) =>
    setSelFasilitas((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const addExtra = () => {
    const v = extra.trim();
    if (!v) return;
    setExtraTags((t) => [...t, v]);
    setExtra("");
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nama_pemilik.trim()) errs.nama_pemilik = "Nama lengkap wajib diisi.";
    if (!form.whatsapp.trim()) {
      errs.whatsapp = "Nomor WhatsApp wajib diisi.";
    } else if (!/^(\+62|08)[0-9]{7,13}$/.test(form.whatsapp)) {
      errs.whatsapp = "Nomor harus diawali 08 atau +62.";
    }
    if (!form.email.trim()) {
      errs.email = "Email wajib diisi.";
    } else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      errs.email = "Format email tidak valid. Contoh: user@gmail.com";
    }
    if (!form.nama_kosan.trim()) errs.nama_kosan = "Nama properti wajib diisi.";
    if (!form.alamat.trim()) errs.alamat = "Alamat lengkap wajib diisi.";
    if (!form.harga) {
      errs.harga = "Harga per bulan wajib diisi.";
    } else if (isNaN(Number(form.harga)) || Number(form.harga) <= 0) {
      errs.harga = "Harga per bulan harus berupa angka lebih dari 0.";
    } else if (Number(form.harga) < 100000) {
      errs.harga = "Harga minimal Rp 100.000.";
    }
    if (fotoFiles.length < MIN_FOTO)
      errs.foto = `Minimal ${MIN_FOTO} foto properti wajib diunggah.`;
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const setFoto = (files: File[]) => {
    setFotoFiles(files);
    setFieldErrors((e) => ({ ...e, foto: "" }));
  };

  // hard navigation agar list kos dimuat ulang setelah submit
  const goList = () => {
    if (typeof window !== "undefined") window.location.assign("/kos-saya");
    else router.push("/kos-saya");
  };

  const goDetail = (kosId?: number) => {
    if (typeof window !== "undefined")
      window.location.assign(kosId ? `/kos-saya/${kosId}` : "/kos-saya");
    else router.push(kosId ? `/kos-saya/${kosId}` : "/kos-saya");
  };

  const addAgain = () => {
    setResult(null);
    setForm((f) => ({
      ...f,
      nama_kosan: "",
      alamat: "",
      landmark: "",
      tipe_kosan: "campur",
      harga: "",
    }));
    setSelFasilitas([]);
    setExtraTags([]);
    setFotoFiles([]);
    setFieldErrors({});
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("nama_kosan", form.nama_kosan);
      fd.append("alamat", form.alamat);
      fd.append("landmark", form.landmark);
      fd.append("tipe_kosan", form.tipe_kosan);
      fd.append(
        "deskripsi",
        extraTags.length ? `Fasilitas tambahan: ${extraTags.join(", ")}` : ""
      );
      selFasilitas.forEach((idf) => fd.append("fasilitas[]", String(idf)));
      fotoFiles.forEach((f) => fd.append("foto[]", f));

      const res = await api.post<Kosan>("/pemilik/kosan", fd);
      const newId = resolveKosId((res.data ?? {}) as never);
      if (newId && form.harga) {
        await api
          .post("/pemilik/kamar", {
            id_kosan: newId,
            no_kamar: "Kamar 1",
            harga_bulanan: Number(form.harga) || 0,
            status: "aktif",
          })
          .catch(() => {});
      }
      setResult({ type: "success", nama: form.nama_kosan, id: newId ?? undefined });
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const mapped = mapApiErrors(err.errors);
        setFieldErrors((prev) => ({ ...prev, ...mapped }));
        const first = Object.values(mapped)[0] ?? err.message;
        setResult({ type: "error", message: first });
      } else {
        const message = err instanceof ApiError ? err.message : "Gagal menambahkan properti. Silakan coba lagi.";
        setResult({ type: "error", message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showHero && (
        <>
          <section
            className="reg-hero"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              gap: 34,
              alignItems: "center",
              padding: "14px 0 34px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "clamp(28px,4vw,40px)",
                  fontWeight: 800,
                  letterSpacing: "-.03em",
                  lineHeight: 1.08,
                  color: "var(--green-deep)",
                }}
              >
                Daftarkan Properti Anda &amp; Temukan Penyewa Berkualitas
              </h1>
              <p
                className="muted"
                style={{ marginTop: 16, fontSize: 14.5, lineHeight: 1.7, maxWidth: 440 }}
              >
                Ubah kos-kosan atau apartemen Anda menjadi bisnis pasif yang
                menguntungkan dengan sistem manajemen modern dan jaringan penyewa
                terverifikasi kami.
              </p>
            </div>
            <div
              className="ph img-living"
              style={{ borderRadius: 18, aspectRatio: "4/3", boxShadow: "var(--shadow-soft)" }}
            />
          </section>

          <section
            style={{ background: "#f1f1fb", borderRadius: 24, padding: "38px 30px", margin: "8px 0" }}
          >
            <h2
              style={{
                textAlign: "center",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-.02em",
                marginBottom: 26,
              }}
            >
              Mengapa Pilih Party Kosan?
            </h2>
            <div className="grid grid-3">
              <div className="why">
                <div className="ico">
                  <IconShieldCheck size={22} />
                </div>
                <h3>Penyewa Terverifikasi</h3>
                <p>
                  Sistem vetting ketat untuk memastikan penyewa Anda memiliki track
                  record yang baik dan aman.
                </p>
              </div>
              <div className="why">
                <div className="ico">
                  <IconUsers size={22} />
                </div>
                <h3>Pembayaran Aman</h3>
                <p>
                  Sistem yang menjamin transparansi dan ketepatan waktu penerimaan
                  dana sewa Anda.
                </p>
              </div>
              <div className="why">
                <div className="ico">
                  <IconBuilding size={22} />
                </div>
                <h3>Manajemen Profesional</h3>
                <p>
                  Dashboard intuitif untuk memantau okupansi, laporan keuangan, dan
                  perawatan dalam satu tempat.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      <form className="form-card" onSubmit={submit} noValidate>
          <div className="step">
          <span className="num">1</span>
          <h3>Data Pemilik Kost</h3>
        </div>

        <FormField label="Nama Lengkap" error={fieldErrors.nama_pemilik}>
          <div className={inpClass(fieldErrors.nama_pemilik)}>
            <IconUser size={16} />
            <input
              type="text"
              placeholder="Contoh: Budi Santoso"
              value={form.nama_pemilik}
              onChange={(e) => { set("nama_pemilik", e.target.value); setFieldErrors((p) => ({ ...p, nama_pemilik: "" })); }}
              onBlur={() => { if (!form.nama_pemilik.trim()) setFieldErrors((p) => ({ ...p, nama_pemilik: "Nama lengkap wajib diisi." })); }}
            />
          </div>
        </FormField>

        <div className="row2">
          <FormField label="WhatsApp" error={fieldErrors.whatsapp} hint={!fieldErrors.whatsapp ? "Format: 08... atau +62..." : undefined}>
            <div className={inpClass(fieldErrors.whatsapp)}>
              <IconPhone size={16} />
              <input
                type="tel"
                placeholder="08123456789"
                value={form.whatsapp}
                onChange={(e) => { set("whatsapp", e.target.value); setFieldErrors((p) => ({ ...p, whatsapp: "" })); }}
                onBlur={() => {
                  const re = /^(\+62|08)[0-9]{7,13}$/;
                  if (!form.whatsapp.trim()) setFieldErrors((p) => ({ ...p, whatsapp: "Nomor WhatsApp wajib diisi." }));
                  else if (!re.test(form.whatsapp)) setFieldErrors((p) => ({ ...p, whatsapp: "Nomor tidak valid. Gunakan 08... atau +62..." }));
                  else setFieldErrors((p) => ({ ...p, whatsapp: "" }));
                }}
              />
            </div>
          </FormField>
          <FormField label="Email" error={fieldErrors.email}>
            <div className={inpClass(fieldErrors.email)}>
              <IconMail size={16} />
              <input
                type="email"
                placeholder="budi@example.com"
                value={form.email}
                onChange={(e) => { set("email", e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
                onBlur={() => {
                  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
                  if (!form.email.trim()) setFieldErrors((p) => ({ ...p, email: "Email wajib diisi." }));
                  else if (!re.test(form.email)) setFieldErrors((p) => ({ ...p, email: "Format email tidak valid. Contoh: user@gmail.com" }));
                  else setFieldErrors((p) => ({ ...p, email: "" }));
                }}
              />
            </div>
          </FormField>
        </div>

        <div className="step">
          <span className="num">2</span>
          <h3>Informasi Kost</h3>
        </div>

        <FormField label="Nama Properti" error={fieldErrors.nama_kosan}>
          <div className={inpClass(fieldErrors.nama_kosan)}>
            <input
              type="text"
              placeholder="Contoh: Kos Emerald Premium"
              value={form.nama_kosan}
              onChange={(e) => { set("nama_kosan", e.target.value); setFieldErrors((p) => ({ ...p, nama_kosan: "" })); }}
              onBlur={() => { if (!form.nama_kosan.trim()) setFieldErrors((p) => ({ ...p, nama_kosan: "Nama properti wajib diisi." })); }}
            />
          </div>
        </FormField>

        <FormField label="Alamat Lengkap" error={fieldErrors.alamat}>
          <div className={inpClass(fieldErrors.alamat)}>
            <textarea
              placeholder="Jl. Anggrek No. 123, Kebayoran Baru, Jakarta Selatan"
              value={form.alamat}
              onChange={(e) => { set("alamat", e.target.value); setFieldErrors((p) => ({ ...p, alamat: "" })); }}
              onBlur={() => { if (!form.alamat.trim()) setFieldErrors((p) => ({ ...p, alamat: "Alamat lengkap wajib diisi." })); }}
            />
          </div>
        </FormField>

        <FormField label="Landmark Terdekat">
          <div className="inp">
            <input
              type="text"
              placeholder="Contoh: 5 menit dari Stasiun MRT Haji Nawi"
              value={form.landmark}
              onChange={(e) => set("landmark", e.target.value)}
            />
          </div>
        </FormField>

        <div className="step">
          <span className="num">3</span>
          <h3>Detail Kamar &amp; Fasilitas</h3>
        </div>
        <div className="row2">
          <FormField label="Tipe Kost">
            <div className="inp">
              <select
                value={form.tipe_kosan}
                onChange={(e) => set("tipe_kosan", e.target.value)}
              >
                <option value="campur">Campur</option>
                <option value="putra">Khusus Pria</option>
                <option value="putri">Khusus Wanita</option>
              </select>
              <IconChevronDown size={14} />
            </div>
          </FormField>
          <FormField label="Harga per Bulan" error={fieldErrors.harga}>
            <div className={inpClass(fieldErrors.harga)}>
              <span style={{ fontSize: 14, color: "var(--muted)" }}>Rp</span>
              <input
                type="text"
                placeholder="1.500.000"
                value={form.harga ? Number(form.harga).toLocaleString("id-ID") : ""}
                onChange={(e) => { set("harga", e.target.value.replace(/\D/g, "")); setFieldErrors((p) => ({ ...p, harga: "" })); }}
                onBlur={() => {
                  if (!form.harga) setFieldErrors((p) => ({ ...p, harga: "Harga per bulan wajib diisi." }));
                  else if (Number(form.harga) <= 0) setFieldErrors((p) => ({ ...p, harga: "Harga harus lebih dari 0." }));
                  else if (Number(form.harga) < 100000) setFieldErrors((p) => ({ ...p, harga: "Harga minimal Rp 100.000." }));
                  else setFieldErrors((p) => ({ ...p, harga: "" }));
                }}
              />
            </div>
          </FormField>
        </div>
        <FormField label="Fasilitas Tersedia">
          {fasilitasList.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Tidak ada data fasilitas.
            </p>
          ) : (
            <div className="check-grid">
              {fasilitasList.map((f, i) => {
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
              })}
            </div>
          )}
        </FormField>
        <FormField label="Fasilitas Tambahan">
          <div className="add-row">
            <div className="inp">
              <input
                type="text"
                placeholder="Tambah fasilitas lain (misal: Balkon, Water Heater)"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addExtra();
                  }
                }}
              />
            </div>
            <button type="button" className="btn btn-green" onClick={addExtra}>
              <IconPlus size={14} />
              Tambah
            </button>
          </div>
          {extraTags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {extraTags.map((t, i) => (
                <span
                  key={i}
                  className="chip"
                  style={{ background: "var(--mint-bg)", borderColor: "transparent", color: "var(--green)" }}
                  onClick={() => setExtraTags((tags) => tags.filter((_, j) => j !== i))}
                >
                  {t} ✕
                </span>
              ))}
            </div>
          )}
        </FormField>

        <div className="step">
          <span className="num">4</span>
          <h3>Foto Properti</h3>
        </div>
        <PhotoUploader
          files={fotoFiles}
          onChange={setFoto}
          min={MIN_FOTO}
          error={fieldErrors.foto}
        />

        <button
          type="submit"
          className="btn btn-green btn-block"
          style={{ marginTop: 24, padding: 14 }}
          disabled={loading || fotoFiles.length < MIN_FOTO}
        >
          {loading && <span className="btn-spinner" />}
          {loading
            ? "Menyimpan..."
            : fotoFiles.length < MIN_FOTO
            ? `Tambahkan minimal ${MIN_FOTO} foto`
            : "Submit Properti"}
        </button>
      </form>

      <ModalFeedback
        open={result !== null}
        type={result?.type ?? "success"}
        title={
          result?.type === "error"
            ? "Gagal Menambahkan Properti"
            : "Properti Berhasil Ditambahkan"
        }
        description={
          result?.type === "error"
            ? result?.message
            : "Properti Anda berhasil dibuat dan sekarang sudah tersedia di dashboard Kos Saya."
        }
        details={
          result?.type === "success"
            ? [
                { label: "Nama Properti", value: result?.nama || "-" },
                { label: "Status", value: "Aktif" },
              ]
            : undefined
        }
        actions={
          result?.type === "error"
            ? [{ label: "Coba Lagi", variant: "green", onClick: () => setResult(null) }]
            : [
                { label: "Lihat Kos Saya", variant: "green", onClick: goList },
                { label: "Buka Detail Properti", variant: "outline", onClick: () => goDetail(result?.id) },
              ]
        }
        onClose={result?.type === "success" ? goList : () => setResult(null)}
      />
    </>
  );
}
