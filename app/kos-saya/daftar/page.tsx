"use client";

import AuthGuard from "@/components/AuthGuard";
import DaftarkanKostForm from "@/components/DaftarkanKostForm";
import { BackLink } from "@/components/ui";

export default function DaftarKostPage() {
  return (
    <AuthGuard>
      <div className="wrap">
        <BackLink href="/kos-saya" />
        <DaftarkanKostForm />
        <div style={{ height: 50 }} />
      </div>
    </AuthGuard>
  );
}
