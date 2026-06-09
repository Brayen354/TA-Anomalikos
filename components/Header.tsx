"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "./AuthModal";
import { initials } from "@/lib/format";
import { IconMenu, IconUser, IconLogout, IconChevronDown } from "./Icons";

const LINKS = [
  { href: "/", label: "Beranda", protected: false },
  { href: "/favorit", label: "Favorit", protected: true },
  { href: "/kos-saya", label: "Kos Saya", protected: true },
  { href: "/syarat", label: "Syarat & Ketentuan", protected: false },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { openLogin, openRegister } = useAuthModal();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // reset saat render, bukan di effect
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setProfileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleNav = (e: React.MouseEvent, link: (typeof LINKS)[number]) => {
    if (link.protected && !isAuthenticated) {
      e.preventDefault();
      setMenuOpen(false);
      openLogin();
    }
  };

  return (
    <header className={`site${scrolled ? " scrolled" : ""}`}>
      <div className="wrap nav">
        <Link href="/" className="brand">
          <span className="dot" />
          Party Kosan
        </Link>

        <nav className={`nav-links${menuOpen ? " open" : ""}`}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(pathname, l.href) ? "active" : ""}
              onClick={(e) => handleNav(e, l)}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {isAuthenticated ? (
            <>
              <div className="profile" ref={profileRef}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 11 }}
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <span className="pname">{user?.nama ?? "Akun"}</span>
                  <span className="avatar">{initials(user?.nama)}</span>
                  <IconChevronDown size={14} className="muted" />
                </div>
                <div className={`profile-menu${profileOpen ? " show" : ""}`}>
                  <Link href="/profile">
                    <IconUser size={16} />
                    Profil
                  </Link>
                  <div className="sep" />
                  <button className="danger" onClick={onLogout}>
                    <IconLogout size={16} />
                    Keluar
                  </button>
                </div>
              </div>
              <button
                className="burger"
                aria-label="Menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <IconMenu size={20} />
              </button>
            </>
          ) : (
            <>
              <button className="link-btn" onClick={openRegister}>
                Buat Akun
              </button>
              <button className="btn btn-dark" onClick={openLogin}>
                Masuk
              </button>
              <button
                className="burger"
                aria-label="Menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <IconMenu size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
