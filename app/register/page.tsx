"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { mapApiErrors } from "@/lib/errorMapper";
import { useFormValidation, validateEmail, validatePhone } from "@/hooks/useFormValidation";
import FormField, { inpClass } from "@/components/FormField";
import { IconChevronDown, IconMail, IconPhone, IconShield, IconUser } from "@/components/Icons";

type RegisterForm = {
  nama: string;
  email: string;
  password: string;
  no_telp: string;
  jenis_kelamin: string;
};

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({
    nama: "",
    email: "",
    password: "",
    no_telp: "",
    jenis_kelamin: "L",
  });
  const [loading, setLoading] = useState(false);

  const { errs, touch, validate, setFieldError } = useFormValidation(form, {
    nama: (v) => (!v.trim() ? "Nama lengkap wajib diisi." : ""),
    email: validateEmail,
    no_telp: (v) => !v.trim() ? "No. WhatsApp wajib diisi." : validatePhone(v),
    password: (v) => {
      if (!v) return "Password wajib diisi.";
      if (v.length < 6) return "Password minimal 6 karakter.";
      return "";
    },
  });

  const set = (k: keyof RegisterForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ ...form, jenis_kelamin: form.jenis_kelamin as "L" | "P" });
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const mapped = mapApiErrors(err.errors);
          Object.entries(mapped).forEach(([f, msg]) => setFieldError(f as keyof RegisterForm, msg));
        } else {
          setFieldError("email", err.message);
        }
      } else {
        setFieldError("email", "Gagal mendaftar. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="brand">
          <span className="dot" />
          Party Kosan
        </Link>
        <h1>Buat akun baru</h1>
        <p className="sub">Gratis dan hanya butuh satu menit.</p>

        <form onSubmit={submit} noValidate>
          <FormField label="Nama Lengkap" error={errs.nama}>
            <div className={inpClass(errs.nama)}>
              <IconUser size={16} />
              <input
                type="text"
                placeholder="Budi Santoso"
                value={form.nama}
                onChange={(e) => set("nama", e.target.value)}
                onBlur={() => touch("nama")}
              />
            </div>
          </FormField>

          <FormField label="Email" error={errs.email}>
            <div className={inpClass(errs.email)}>
              <IconMail size={16} />
              <input
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={() => touch("email")}
              />
            </div>
          </FormField>

          <div className="row2">
            <FormField
              label="No. WhatsApp"
              error={errs.no_telp}
              hint={!errs.no_telp ? "Format: 08... atau +62..." : undefined}
            >
              <div className={inpClass(errs.no_telp)}>
                <IconPhone size={16} />
                <input
                  type="tel"
                  placeholder="08123456789"
                  value={form.no_telp}
                  onChange={(e) => set("no_telp", e.target.value)}
                  onBlur={() => touch("no_telp")}
                />
              </div>
            </FormField>

            <FormField label="Jenis Kelamin">
              <div className="inp">
                <select
                  value={form.jenis_kelamin}
                  onChange={(e) => set("jenis_kelamin", e.target.value)}
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
                <IconChevronDown size={14} />
              </div>
            </FormField>
          </div>

          <FormField label="Password" error={errs.password}>
            <div className={inpClass(errs.password)}>
              <IconShield size={16} />
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                onBlur={() => touch("password")}
              />
            </div>
          </FormField>

          <button
            type="submit"
            className="btn btn-green btn-block"
            style={{ marginTop: 20, padding: 13 }}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="auth-foot">
          Sudah punya akun? <Link href="/login">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
