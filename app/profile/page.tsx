"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/format";
import AuthGuard from "@/components/AuthGuard";
import {
  IconMail,
  IconHistory,
  IconSettings,
  IconChevronRight,
  IconLogout,
} from "@/components/Icons";

function ProfileContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="wrap section" style={{ maxWidth: 760 }}>
      <div className="profile-card">
        <div className="pic">{initials(user?.nama)}</div>
        <div>
          <h2>{user?.nama ?? "Pengguna"}</h2>
          <div className="email">
            <IconMail size={15} />
            {user?.email ?? "-"}
          </div>
        </div>
      </div>

      <div className="settings-card">
        <div className="head">Account Settings</div>
        <Link href="/profile/riwayat-sewa" className="settings-row">
          <span className="ico">
            <IconHistory size={18} />
          </span>
          <div>
            <b>Riwayat Sewa</b>
            <span>Lihat riwayat pemesanan dan penyewaan kamar Anda</span>
          </div>
          <span className="arr">
            <IconChevronRight size={18} />
          </span>
        </Link>
        <Link href="/profile/pengaturan" className="settings-row">
          <span className="ico">
            <IconSettings size={18} />
          </span>
          <div>
            <b>Pengaturan</b>
            <span>Data akun, privasi, dan preferensi aplikasi</span>
          </div>
          <span className="arr">
            <IconChevronRight size={18} />
          </span>
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
        <button className="btn btn-outline" style={{ color: "var(--danger)", borderColor: "var(--danger-bg)" }} onClick={onLogout}>
          <IconLogout size={16} />
          Logout Account
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
