"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export function useFavorit() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const toggle = useCallback(
    async (idKosan: number, next: boolean) => {
      if (!isAuthenticated) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        throw new Error("Belum login");
      }
      if (next) {
        await api.post("/favorit", { id_kosan: idKosan });
      } else {
        await api.del(`/favorit/${idKosan}`);
      }
    },
    [isAuthenticated, router]
  );

  return { toggle, isAuthenticated };
}
