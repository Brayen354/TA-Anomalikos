"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "./AuthModal";
import { Loading, EmptyState } from "./ui";
import { IconLock } from "./Icons";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const { openLogin } = useAuthModal();
  const prompted = useRef(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && !prompted.current) {
      prompted.current = true;
      openLogin();
    }
    if (isAuthenticated) prompted.current = false;
  }, [loading, isAuthenticated, openLogin]);

  if (loading) {
    return (
      <div className="wrap section">
        <Loading label="Memuat..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="wrap section">
        <EmptyState icon={<IconLock size={40} />} title="Perlu masuk dulu">
          Silakan masuk ke akun Anda untuk mengakses halaman ini.
          <br />
          <button
            className="btn btn-dark"
            style={{ marginTop: 18 }}
            onClick={openLogin}
          >
            Masuk
          </button>
        </EmptyState>
      </div>
    );
  }

  return <>{children}</>;
}
