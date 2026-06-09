"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";

const BARE_ROUTES = ["/login", "/register"];

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (bare) return <>{children}</>;

  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
