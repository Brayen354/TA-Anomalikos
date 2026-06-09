"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { mapApiErrors } from "@/lib/errorMapper";
import Modal from "./Modal";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconUser,
  IconPhone,
  IconArrowRight,
} from "./Icons";

type Mode = "login" | "register" | null;

interface AuthModalContextValue {
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
}

const Ctx = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthModal harus dipakai di dalam <AuthModalProvider>");
  return ctx;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(null);
  const openLogin = useCallback(() => setMode("login"), []);
  const openRegister = useCallback(() => setMode("register"), []);
  const close = useCallback(() => setMode(null), []);

  return (
    <Ctx.Provider value={{ openLogin, openRegister, close }}>
      {children}
      <Modal open={mode !== null} onClose={close}>
        <div className="auth-modal">
          {mode === "login" && (
            <LoginForm onSwitch={openRegister} onDone={close} />
          )}
          {mode === "register" && (
            <RegisterForm onSwitch={openLogin} onDone={close} />
          )}
        </div>
      </Modal>
    </Ctx.Provider>
  );
}

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_RE = /^(\+62|08)[0-9]{7,13}$/;

function LoginForm({
  onSwitch,
  onDone,
}: {
  onSwitch: () => void;
  onDone: () => void;
}) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errs, setErrs] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fe: typeof errs = {};
    if (!email.trim()) fe.email = "Email wajib diisi.";
    else if (!EMAIL_RE.test(email)) fe.email = "Format email tidak valid.";
    if (!password) fe.password = "Password wajib diisi.";
    setErrs(fe);
    if (Object.keys(fe).length) return;

    setLoading(true);
    try {
      await login(email, password);
      onDone();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const mapped = mapApiErrors(err.errors);
          setErrs((p) => ({ ...p, ...mapped }));
        } else {
          setErrs((p) => ({ ...p, password: err.message }));
        }
      } else {
        setErrs((p) => ({ ...p, password: "Gagal masuk. Coba lagi." }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div style={{ textAlign: "center" }}>
        <div className="eyebrow">Party Kosan</div>
        <h2>Welcome Back</h2>
        <p className="sub-txt">Log in to manage your premium bookings.</p>
      </div>
      <div className="field">
        <label>Email</label>
        <div className={`input${errs.email ? " invalid" : ""}`}>
          <IconMail size={16} />
          <input
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => {
              if (!email.trim()) setErrs((p) => ({ ...p, email: "Email wajib diisi." }));
              else if (!EMAIL_RE.test(email)) setErrs((p) => ({ ...p, email: "Format email tidak valid." }));
              else setErrs((p) => ({ ...p, email: undefined }));
            }}
          />
        </div>
        {errs.email && <small className="field-err">{errs.email}</small>}
      </div>
      <div className="field">
        <label>Password</label>
        <div className={`input${errs.password ? " invalid" : ""}`}>
          <IconLock size={16} />
          <input
            type={show ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setErrs((p) => ({ ...p, password: password ? undefined : "Password wajib diisi." }))}
          />
          <button
            type="button"
            className="eye"
            onClick={() => setShow((v) => !v)}
            aria-label="Lihat password"
            style={show ? { color: "var(--accent)" } : undefined}
          >
            {show ? <IconEyeOff size={17} /> : <IconEye size={17} />}
          </button>
        </div>
        {errs.password && <small className="field-err">{errs.password}</small>}
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? "Memproses..." : "Masuk"}
      </button>
      <p className="switch">
        Belum punya akun?{" "}
        <a onClick={onSwitch}>Buat Akun</a>
      </p>
    </form>
  );
}

function RegisterForm({
  onSwitch,
  onDone,
}: {
  onSwitch: () => void;
  onDone: () => void;
}) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_telp: "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const [errs, setErrs] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fe: Record<string, string> = {};
    if (!form.nama.trim()) fe.nama = "Nama lengkap wajib diisi.";
    if (!form.email.trim()) fe.email = "Email wajib diisi.";
    else if (!EMAIL_RE.test(form.email)) fe.email = "Format email tidak valid.";
    if (!form.no_telp.trim()) fe.no_telp = "No. WhatsApp wajib diisi.";
    else if (!PHONE_RE.test(form.no_telp)) fe.no_telp = "Format nomor tidak valid. Gunakan 08... atau +62...";
    if (!form.password) fe.password = "Password wajib diisi.";
    else if (form.password.length < 6) fe.password = "Password minimal 6 karakter.";
    setErrs(fe);
    if (Object.keys(fe).length) return;

    setLoading(true);
    try {
      await register(form);
      onDone();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          setErrs((p) => ({ ...p, ...mapApiErrors(err.errors) }));
        } else {
          setErrs((p) => ({ ...p, email: err.message }));
        }
      } else {
        setErrs((p) => ({ ...p, email: "Gagal mendaftar. Coba lagi." }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="eyebrow">Party Kosan</div>
      <h2>Create Account</h2>
      <p className="sub-txt">Join our community of modern dwellers.</p>
      <div className="field">
        <label>Nama Lengkap</label>
        <div className={`input${errs.nama ? " invalid" : ""}`}>
          <IconUser size={16} />
          <input
            type="text"
            placeholder="Budi Santoso"
            value={form.nama}
            onChange={(e) => set("nama", e.target.value)}
            onBlur={() => setErrs((p) => ({ ...p, nama: form.nama.trim() ? "" : "Nama wajib diisi." }))}
          />
        </div>
        {errs.nama && <small className="field-err">{errs.nama}</small>}
      </div>
      <div className="field">
        <label>Email</label>
        <div className={`input${errs.email ? " invalid" : ""}`}>
          <IconMail size={16} />
          <input
            type="email"
            placeholder="nama@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => {
              if (!form.email.trim()) setErrs((p) => ({ ...p, email: "Email wajib diisi." }));
              else if (!EMAIL_RE.test(form.email)) setErrs((p) => ({ ...p, email: "Format email tidak valid." }));
              else setErrs((p) => ({ ...p, email: "" }));
            }}
          />
        </div>
        {errs.email && <small className="field-err">{errs.email}</small>}
      </div>
      <div className="row2">
        <div className="field">
          <label>No. WhatsApp</label>
          <div className={`input${errs.no_telp ? " invalid" : ""}`}>
            <IconPhone size={16} />
            <input
              type="tel"
              placeholder="08123456789"
              value={form.no_telp}
              onChange={(e) => set("no_telp", e.target.value)}
              onBlur={() => {
                if (!form.no_telp.trim()) setErrs((p) => ({ ...p, no_telp: "No. WhatsApp wajib diisi." }));
                else if (!PHONE_RE.test(form.no_telp)) setErrs((p) => ({ ...p, no_telp: "Format nomor tidak valid." }));
                else setErrs((p) => ({ ...p, no_telp: "" }));
              }}
            />
          </div>
          {errs.no_telp && <small className="field-err">{errs.no_telp}</small>}
        </div>
        <div className="field">
          <label>Password</label>
          <div className={`input${errs.password ? " invalid" : ""}`}>
            <IconLock size={16} />
            <input
              type={show ? "text" : "password"}
              placeholder="Min. 6 karakter"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              onBlur={() => setErrs((p) => ({ ...p, password: !form.password ? "Password wajib diisi." : form.password.length < 6 ? "Minimal 6 karakter." : "" }))}
            />
            <button
              type="button"
              className="eye"
              onClick={() => setShow((v) => !v)}
              aria-label="Lihat password"
              style={show ? { color: "var(--accent)" } : undefined}
            >
              {show ? <IconEyeOff size={17} /> : <IconEye size={17} />}
            </button>
          </div>
          {errs.password && <small className="field-err">{errs.password}</small>}
        </div>
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? "Memproses..." : "Buat Akun"}
        {!loading && <IconArrowRight size={16} />}
      </button>
      <p className="switch">
        Sudah punya akun? <a onClick={onSwitch}>Masuk</a>
      </p>
    </form>
  );
}
