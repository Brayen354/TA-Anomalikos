"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { mapApiErrors } from "@/lib/errorMapper";
import type { PengaturanPrivasi, Pengguna, ProfilData } from "@/types";
import AuthGuard from "@/components/AuthGuard";
import { Loading, BackLink } from "@/components/ui";
import FormField, { inpClass } from "@/components/FormField";
import {
  IconShield,
  IconUser,
  IconLock,
  IconLogout,
  IconChevronDown,
  IconChevronUp,
} from "@/components/Icons";

const PRIVASI_FIELDS: {
  key: keyof PengaturanPrivasi;
  title: string;
  desc: string;
}[] = [
  {
    key: "informasi_umum",
    title: "Informasi umum (Data wajib)",
    desc: "Nama, status perkawinan, jenis kelamin, pekerjaan, lama bergabung, kelengkapan akun.",
  },
  {
    key: "informasi_data_diri",
    title: "Informasi data diri",
    desc: "Berisi informasi lanjutan seperti asal daerah dan no. HP yang disensor.",
  },
  {
    key: "riwayat_aktivitas",
    title: "Riwayat aktivitas",
    desc: "Berisi riwayat jumlah chat, jumlah pembayaran, rentang harga kos, serta lama sewa yang tercatat di platform.",
  },
  {
    key: "riwayat_pencarian_kos",
    title: "Riwayat pencarian kos",
    desc: "Riwayat jenis kos, rentang harga dan fasilitas yang dicari dan kata kunci.",
  },
];

const DEFAULT_PRIVASI: PengaturanPrivasi = {
  informasi_umum: true,
  informasi_data_diri: true,
  riwayat_aktivitas: true,
  riwayat_pencarian_kos: true,
};

function PengaturanContent() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [privasi, setPrivasi] = useState<PengaturanPrivasi>(DEFAULT_PRIVASI);
  const [privasiOpen, setPrivasiOpen] = useState(true);

  const [profil, setProfil] = useState({
    nama: "",
    email: "",
    alamat: "",
    no_telp: "",
    jenis_kelamin: "L" as "L" | "P",
  });
  const [savingProfil, setSavingProfil] = useState(false);
  const [profilMsg, setProfilMsg] = useState("");
  const [profilFieldErrs, setProfilFieldErrs] = useState<Record<string, string>>({});

  const [pw, setPw] = useState({ lama: "", baru: "", konfirmasi: "" });
  const [pwErrs, setPwErrs] = useState<Record<string, string>>({});
  const [pwMsg, setPwMsg] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [profilRes, privRes] = await Promise.all([
          api.get<ProfilData>("/profil").catch(() => ({ data: undefined })),
          api
            .get<PengaturanPrivasi>("/pengaturan-privasi")
            .catch(() => ({ data: undefined })),
        ]);
        const pd = profilRes.data as ProfilData | undefined;
        const u = (pd?.user as Pengguna) ?? (pd as unknown as Pengguna) ?? user;
        if (u) {
          setProfil({
            nama: u.nama ?? "",
            email: u.email ?? "",
            alamat: u.alamat ?? "",
            no_telp: u.no_telp ?? "",
            jenis_kelamin: (u.jenis_kelamin as "L" | "P") ?? "L",
          });
        }
        const priv =
          (privRes.data as PengaturanPrivasi) ??
          (pd?.pengaturan_privasi as PengaturanPrivasi) ??
          DEFAULT_PRIVASI;
        setPrivasi({ ...DEFAULT_PRIVASI, ...priv });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async (key: keyof PengaturanPrivasi) => {
    if (key === "informasi_umum") return; // field wajib, tidak bisa dimatikan
    const next = { ...privasi, [key]: !privasi[key] };
    setPrivasi(next);
    try {
      await api.put("/pengaturan-privasi", next);
    } catch {
      setPrivasi(privasi); // rollback
    }
  };

  const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  const PHONE_RE = /^(\+62|08)[0-9]{7,13}$/;

  const saveProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfilMsg("");

    const fe: Record<string, string> = {};
    if (!profil.nama.trim()) fe.nama = "Nama lengkap wajib diisi.";
    if (!profil.email.trim()) fe.email = "Email wajib diisi.";
    else if (!EMAIL_RE.test(profil.email)) fe.email = "Format email tidak valid. Contoh: user@gmail.com";
    if (profil.no_telp && !PHONE_RE.test(profil.no_telp))
      fe.no_telp = "Nomor telepon tidak valid. Gunakan format 08... atau +62...";
    setProfilFieldErrs(fe);
    if (Object.keys(fe).length) return;

    setSavingProfil(true);
    try {
      const res = await api.put<Pengguna | { user: Pengguna }>("/profil", profil);
      const data = res.data as Pengguna & { user?: Pengguna };
      const u = data?.user ?? (data as Pengguna);
      if (u && u.nama) setUser(u);
      setProfilFieldErrs({});
      setProfilMsg("Profil berhasil diperbarui.");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          setProfilFieldErrs(mapApiErrors(err.errors));
        } else {
          setProfilFieldErrs({ _global: err.message });
        }
      } else {
        setProfilFieldErrs({ _global: "Gagal memperbarui profil." });
      }
    } finally {
      setSavingProfil(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    const errs: Record<string, string> = {};
    if (!pw.lama) errs.lama = "Password lama wajib diisi.";
    if (!pw.baru) errs.baru = "Password baru wajib diisi.";
    else if (pw.baru.length < 8) errs.baru = "Password baru minimal 8 karakter.";
    if (pw.konfirmasi !== pw.baru) errs.konfirmasi = "Konfirmasi password tidak sama.";
    setPwErrs(errs);
    if (Object.keys(errs).length) return;

    setSavingPw(true);
    try {
      await api.post("/ganti-password", {
        password_lama: pw.lama,
        password_baru: pw.baru,
        password_baru_confirmation: pw.konfirmasi,
      });
      setPw({ lama: "", baru: "", konfirmasi: "" });
      setPwErrs({});
      setPwMsg("Password berhasil diubah.");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const map: Record<string, string> = {};
          if (err.errors.password_lama) map.lama = err.errors.password_lama[0];
          if (err.errors.password_baru) map.baru = err.errors.password_baru[0];
          setPwErrs(map);
        } else {
          setPwErrs({ lama: err.message });
        }
      } else setPwErrs({ lama: "Gagal mengubah password." });
    } finally {
      setSavingPw(false);
    }
  };

  const onLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="wrap section">
        <Loading label="Memuat pengaturan..." />
      </div>
    );
  }

  return (
    <div className="wrap section" style={{ maxWidth: 760 }}>
      <BackLink href="/profile" />
      <div className="page-head" style={{ margin: "8px 0 20px" }}>
        <h1>Pengaturan</h1>
      </div>

      <div className="panel">
        <div
          className="panel-head"
          style={{ marginBottom: privasiOpen ? 14 : 0, cursor: "pointer" }}
          onClick={() => setPrivasiOpen((v) => !v)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="ico" style={{ width: 34, height: 34, borderRadius: 10, background: "var(--field)", color: "var(--green)", display: "grid", placeItems: "center" }}>
              <IconShield size={18} />
            </span>
            <h2>Privasi</h2>
          </div>
          {privasiOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        </div>
        {privasiOpen && (
          <>
            <p className="muted" style={{ fontSize: 13, marginBottom: 6 }}>
              Dengan menampilkan data, pemilik properti dapat memberimu respons yang
              lebih lancar. Data hanya diperlihatkan di platform Party Kosan.
            </p>
            {PRIVASI_FIELDS.map((f) => (
              <div className="privacy-row" key={f.key}>
                <div>
                  <b>{f.title}</b>
                  <p>{f.desc}</p>
                </div>
                <div
                  className={`toggle${privasi[f.key] ? " on" : ""}`}
                  onClick={() => toggle(f.key)}
                  role="switch"
                  aria-checked={privasi[f.key]}
                />
              </div>
            ))}
          </>
        )}
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <div className="panel-head" style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="ico" style={{ width: 34, height: 34, borderRadius: 10, background: "var(--field)", color: "var(--green)", display: "grid", placeItems: "center" }}>
              <IconUser size={18} />
            </span>
            <h2>Data Akun</h2>
          </div>
        </div>
        <form onSubmit={saveProfil} noValidate>
          <div className="row2">
            <FormField label="Nama Lengkap" error={profilFieldErrs.nama}>
              <div className={inpClass(profilFieldErrs.nama)}>
                <input
                  value={profil.nama}
                  onChange={(e) => setProfil({ ...profil, nama: e.target.value })}
                  onBlur={() => {
                    if (!profil.nama.trim())
                      setProfilFieldErrs((p) => ({ ...p, nama: "Nama lengkap wajib diisi." }));
                    else
                      setProfilFieldErrs((p) => ({ ...p, nama: "" }));
                  }}
                  placeholder="Nama lengkap Anda"
                />
              </div>
            </FormField>
            <FormField label="Email" error={profilFieldErrs.email}>
              <div className={inpClass(profilFieldErrs.email)}>
                <input
                  type="email"
                  value={profil.email}
                  onChange={(e) => setProfil({ ...profil, email: e.target.value })}
                  onBlur={() => {
                    const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
                    if (!profil.email.trim())
                      setProfilFieldErrs((p) => ({ ...p, email: "Email wajib diisi." }));
                    else if (!re.test(profil.email))
                      setProfilFieldErrs((p) => ({ ...p, email: "Format email tidak valid. Contoh: user@gmail.com" }));
                    else
                      setProfilFieldErrs((p) => ({ ...p, email: "" }));
                  }}
                  placeholder="nama@email.com"
                />
              </div>
            </FormField>
          </div>
          <div className="row2">
            <FormField label="No. Telepon" error={profilFieldErrs.no_telp} hint={!profilFieldErrs.no_telp ? "Format: 08... atau +62..." : undefined}>
              <div className={inpClass(profilFieldErrs.no_telp)}>
                <input
                  type="tel"
                  placeholder="08123456789"
                  value={profil.no_telp}
                  onChange={(e) => setProfil({ ...profil, no_telp: e.target.value })}
                  onBlur={() => {
                    const re = /^(\+62|08)[0-9]{7,13}$/;
                    if (profil.no_telp && !re.test(profil.no_telp))
                      setProfilFieldErrs((p) => ({ ...p, no_telp: "Nomor tidak valid. Gunakan format 08... atau +62..." }));
                    else
                      setProfilFieldErrs((p) => ({ ...p, no_telp: "" }));
                  }}
                />
              </div>
            </FormField>
            <FormField label="Jenis Kelamin">
              <div className="inp">
                <select
                  value={profil.jenis_kelamin}
                  onChange={(e) =>
                    setProfil({ ...profil, jenis_kelamin: e.target.value as "L" | "P" })
                  }
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
                <IconChevronDown size={14} />
              </div>
            </FormField>
          </div>
          <FormField label="Alamat" error={profilFieldErrs.alamat}>
            <div className={inpClass(profilFieldErrs.alamat)}>
              <textarea
                value={profil.alamat}
                onChange={(e) => setProfil({ ...profil, alamat: e.target.value })}
                placeholder="Alamat tempat tinggal"
              />
            </div>
          </FormField>

          {profilFieldErrs._global && <div className="alert error">{profilFieldErrs._global}</div>}
          {profilMsg && <div className="alert info">{profilMsg}</div>}

          <button
            type="submit"
            className="btn btn-green"
            style={{ marginTop: 18 }}
            disabled={savingProfil}
          >
            {savingProfil ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <div className="panel-head" style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="ico" style={{ width: 34, height: 34, borderRadius: 10, background: "var(--field)", color: "var(--green)", display: "grid", placeItems: "center" }}>
              <IconLock size={18} />
            </span>
            <h2>Ganti Password</h2>
          </div>
        </div>
        <form onSubmit={savePassword} noValidate>
          <FormField label="Password Lama" error={pwErrs.lama}>
            <div className={inpClass(pwErrs.lama)}>
              <IconLock size={16} />
              <input
                type="password"
                value={pw.lama}
                onChange={(e) => setPw({ ...pw, lama: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </FormField>
          <div className="row2">
            <FormField label="Password Baru" error={pwErrs.baru}>
              <div className={inpClass(pwErrs.baru)}>
                <IconLock size={16} />
                <input
                  type="password"
                  value={pw.baru}
                  onChange={(e) => setPw({ ...pw, baru: e.target.value })}
                  placeholder="Minimal 8 karakter"
                />
              </div>
            </FormField>
            <FormField label="Konfirmasi Password Baru" error={pwErrs.konfirmasi}>
              <div className={inpClass(pwErrs.konfirmasi)}>
                <IconLock size={16} />
                <input
                  type="password"
                  value={pw.konfirmasi}
                  onChange={(e) => setPw({ ...pw, konfirmasi: e.target.value })}
                  placeholder="Ulangi password baru"
                />
              </div>
            </FormField>
          </div>

          {pwMsg && <div className="alert info">{pwMsg}</div>}

          <button type="submit" className="btn btn-green" style={{ marginTop: 18 }} disabled={savingPw}>
            {savingPw ? "Menyimpan..." : "Ubah Password"}
          </button>
        </form>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
        <button
          className="btn btn-outline"
          style={{ color: "var(--danger)", borderColor: "var(--danger-bg)" }}
          onClick={onLogout}
        >
          <IconLogout size={16} />
          Logout Akun
        </button>
      </div>
      <div style={{ height: 40 }} />
    </div>
  );
}

export default function PengaturanPage() {
  return (
    <AuthGuard>
      <PengaturanContent />
    </AuthGuard>
  );
}
