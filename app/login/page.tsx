"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { mapApiErrors } from "@/lib/errorMapper";
import { useFormValidation, validateEmail } from "@/hooks/useFormValidation";
import FormField, { inpClass } from "@/components/FormField";
import { IconMail, IconShield } from "@/components/Icons";

type LoginForm = { email: string; password: string };

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const { errs, touch, validate, setFieldError } = useFormValidation(form, {
    email: validateEmail,
    password: (v) => (!v ? "Password wajib diisi." : ""),
  });

  const set = (k: keyof LoginForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      const next = params.get("next");
      router.push(next ? decodeURIComponent(next) : "/");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const mapped = mapApiErrors(err.errors);
          Object.entries(mapped).forEach(([f, msg]) => setFieldError(f as keyof LoginForm, msg));
        } else {
          setFieldError("password", err.message);
        }
      } else {
        setFieldError("password", "Gagal masuk. Coba lagi.");
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
        <h1>Masuk ke akun Anda</h1>
        <p className="sub">Cari kos impian atau kelola properti Anda.</p>

        <form onSubmit={submit} noValidate>
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

          <FormField label="Password" error={errs.password}>
            <div className={inpClass(errs.password)}>
              <IconShield size={16} />
              <input
                type="password"
                placeholder="••••••••"
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
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="auth-foot">
          Belum punya akun? <Link href="/register">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
