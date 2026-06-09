import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthModalProvider } from "@/components/AuthModal";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Party Kosan — Cari kost ternyaman kamu",
  description:
    "Platform pencarian & penyewaan kos modern. Temukan hunian terbaik atau kelola properti kos Anda bersama Party Kosan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
        <AuthProvider>
          <AuthModalProvider>
            <SiteChrome>{children}</SiteChrome>
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
