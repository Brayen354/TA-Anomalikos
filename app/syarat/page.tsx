"use client";

import { useState } from "react";
import {
  IconChevronRight,
  IconShield,
  IconHome,
  IconSearch,
  IconCheck,
  IconBot,
} from "@/components/Icons";

type Tab = "info" | "privasi" | "syarat" | "keamanan" | "bantuan";

const NAV: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "info",      label: "Info Umum",            icon: <IconSearch size={17} /> },
  { key: "privasi",   label: "Kebijakan Privasi",    icon: <IconShield size={17} /> },
  { key: "syarat",    label: "Syarat dan Ketentuan", icon: <IconHome size={17} /> },
  { key: "keamanan",  label: "Panduan Keamanan",     icon: <IconCheck size={17} /> },
  { key: "bantuan",   label: "Pusat Bantuan",        icon: <IconBot size={17} /> },
];

function BantuanTab() {
  return (
    <div className="content-card cc-pad">
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-.02em",
          color: "var(--green-deep)",
        }}
      >
        Pusat Bantuan
      </h1>
      <div
        style={{
          width: 64,
          height: 3,
          background: "var(--accent)",
          borderRadius: 3,
          margin: "10px 0 22px",
        }}
      />

      <p className="muted" style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>
        Punya pertanyaan seputar kos, kamar, harga, atau proses penyewaan? Gunakan
        <b> Party Kosan AI Assistant</b> yang selalu siap membantu 24/7.
      </p>

      <div
        style={{
          background: "var(--field)",
          borderRadius: 14,
          padding: "18px 22px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span
            style={{
              width: 36,
              height: 36,
              background: "var(--mint-bg)",
              color: "var(--green)",
              borderRadius: 10,
              display: "grid",
              placeItems: "center",
            }}
          >
            <IconBot size={20} />
          </span>
          <b style={{ fontSize: 15 }}>Party Kosan AI Assistant</b>
        </div>
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
          Asisten AI kami dapat menjawab pertanyaan tentang ketersediaan kamar,
          harga, fasilitas, alur pemesanan, dan informasi lainnya secara real-time
          berdasarkan data aplikasi Party Kosan.
        </p>
        <p
          className="muted"
          style={{ fontSize: 13, marginTop: 10, fontStyle: "italic" }}
        >
          Klik ikon chat di pojok kanan bawah halaman untuk memulai percakapan.
        </p>
      </div>

      {[
        {
          q: "Bagaimana cara menyewa kos?",
          a: "Pilih kamar yang tersedia, klik tombol Pesan Sekarang, dan ikuti langkah pengajuan. Setelah pengajuan dibuat, pemilik akan meninjau dan mengkonfirmasi. Pantau statusnya di menu Riwayat Sewa.",
        },
        {
          q: "Apakah pembayaran dilakukan melalui aplikasi?",
          a: "Tidak. Party Kosan mengelola proses pemesanan dan persetujuan di dalam aplikasi. Pembayaran sewa dilakukan langsung antara penyewa dan pemilik kos di luar aplikasi.",
        },
        {
          q: "Bagaimana cara mendaftarkan kos saya?",
          a: "Masuk ke akun Anda, buka menu Kos Saya, lalu isi formulir Daftarkan Properti. Tambahkan foto, fasilitas, dan kamar untuk melengkapi listing Anda.",
        },
        {
          q: "Apa arti status kamar tersedia/terisi?",
          a: "Tersedia berarti kamar masih kosong dan dapat dipesan. Terisi berarti kamar sudah ditempati atau pemesanannya telah dikonfirmasi pemilik.",
        },
      ].map((item, i) => (
        <AccordionItem key={i} pertanyaan={item.q} jawaban={item.a} />
      ))}
    </div>
  );
}

function AccordionItem({ pertanyaan, jawaban }: { pertanyaan: string; jawaban: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--line-2)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          width: "100%",
          textAlign: "left",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "16px 0",
          fontSize: 14.5,
          fontWeight: 700,
          color: "var(--ink)",
        }}
      >
        {pertanyaan}
        <span
          style={{
            transform: open ? "rotate(90deg)" : "none",
            transition: "transform .2s",
            color: "var(--accent)",
            flexShrink: 0,
          }}
        >
          <IconChevronRight size={16} />
        </span>
      </button>
      {open && (
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.7, padding: "0 0 16px" }}>
          {jawaban}
        </p>
      )}
    </div>
  );
}

export default function SyaratPage() {
  const [tab, setTab] = useState<Tab>("info");

  return (
    <div className="wrap" style={{ paddingTop: 28 }}>
      <div className="terms-layout">
        <aside className="side-nav">
          {NAV.map((n) => (
            <button
              key={n.key}
              className={tab === n.key ? "active" : ""}
              onClick={() => setTab(n.key)}
            >
              {n.icon}
              {n.label}
              <span className="arr">
                <IconChevronRight size={14} />
              </span>
            </button>
          ))}
        </aside>

        <div>
          {tab === "info" && (
            <section className="tab-page">
              <div className="page-head" style={{ marginBottom: 6 }}>
                <h1>Informasi Umum</h1>
                <div className="sub" style={{ maxWidth: 560 }}>
                  Temukan hunian impian Anda dengan lebih mudah, aman, dan transparan
                  bersama Party Kosan.
                </div>
              </div>
              <div className="grid grid-2" style={{ marginTop: 22 }}>
                <div className="content-card cc-pad">
                  <h2 style={{ fontSize: 19, fontWeight: 700, margin: "6px 0 14px" }}>
                    Cara Mencari Kos
                  </h2>
                  <ul className="steps-num">
                    <li>
                      <span className="n">01</span>
                      <p>
                        Gunakan fitur filter untuk menentukan lokasi, rentang harga,
                        dan fasilitas yang Anda inginkan.
                      </p>
                    </li>
                    <li>
                      <span className="n">02</span>
                      <p>
                        Lihat detail properti yang sudah terverifikasi beserta daftar
                        kamar dan fasilitasnya.
                      </p>
                    </li>
                    <li>
                      <span className="n">03</span>
                      <p>
                        Simpan kos favorit Anda dan bandingkan sebelum memutuskan.
                      </p>
                    </li>
                  </ul>
                </div>
                <div className="content-card cc-pad">
                  <h2 style={{ fontSize: 19, fontWeight: 700, margin: "6px 0 14px" }}>
                    Cara Menyewa Kos
                  </h2>
                  <ul className="steps-num">
                    <li>
                      <span className="n">01</span>
                      <p>
                        Pilih kamar yang tersedia lalu tekan tombol{" "}
                        <b>Pesan Sekarang</b>.
                      </p>
                    </li>
                    <li>
                      <span className="n">02</span>
                      <p>
                        Setelah pemesanan dibuat, pemilik meninjau dan mengkonfirmasi
                        pengajuan. Pantau status di menu Riwayat Sewa.
                      </p>
                    </li>
                    <li>
                      <span className="n">03</span>
                      <p>
                        Pembayaran dilakukan langsung antara penyewa dan pemilik di
                        luar aplikasi.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {tab === "privasi" && (
            <section className="tab-page">
              <div className="content-card">
                <div className="banner">
                  <div className="ph img-building" />
                  <h1>Kebijakan Privasi</h1>
                  <p>Terakhir diperbarui: 24 Mei 2024</p>
                </div>
                <div className="cc-pad">
                  <p className="muted" style={{ fontSize: 14, lineHeight: 1.75 }}>
                    Di Party Kosan, kami menghargai privasi Anda dan berkomitmen untuk
                    melindungi data pribadi Anda. Kebijakan ini menjelaskan bagaimana
                    kami mengumpulkan, menggunakan, dan menjaga informasi Anda.
                  </p>
                  <div className="heading-ico">
                    <span className="ico">
                      <IconShield size={20} />
                    </span>
                    <h2>Perlindungan Data Pribadi</h2>
                  </div>
                  <div className="two-box">
                    <div className="box">
                      <b>Informasi yang Kami Kumpulkan</b>
                      <p>
                        Data identitas seperti nama, email, nomor telepon, dan
                        preferensi hunian untuk memberikan rekomendasi yang akurat.
                      </p>
                    </div>
                    <div className="box">
                      <b>Keamanan Akun</b>
                      <p>
                        Kami menjaga keamanan data akun Anda dengan autentikasi token
                        (JWT) dan praktik keamanan terbaik.
                      </p>
                    </div>
                  </div>
                  <div className="dark-note">
                    <h3>Transparansi Data</h3>
                    <p>
                      Kami tidak pernah menjual data pribadi Anda kepada pihak ketiga.
                      Penggunaan data hanya untuk verifikasi pemilik kos dan penyewa.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {tab === "syarat" && (
            <section className="tab-page">
              <div className="content-card cc-pad">
                <h1
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    letterSpacing: "-.02em",
                    color: "var(--green-deep)",
                  }}
                >
                  Syarat dan Ketentuan
                </h1>
                <div
                  style={{
                    width: 64,
                    height: 3,
                    background: "var(--accent)",
                    borderRadius: 3,
                    margin: "10px 0 22px",
                  }}
                />
                <div className="heading-ico">
                  <span className="ico">
                    <IconHome size={20} />
                  </span>
                  <h2>Pemilik</h2>
                </div>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.75 }}>
                  Sebagai mitra pemilik, Anda setuju memberikan informasi properti yang
                  akurat, termasuk fasilitas dan harga yang berlaku.
                </p>
                <ul className="bullets" style={{ margin: "6px 0 4px" }}>
                  <li>Verifikasi identitas dan kepemilikan aset bersifat wajib.</li>
                  <li>Respon cepat terhadap calon penyewa meningkatkan reputasi Anda.</li>
                </ul>
                <div className="hr" />
                <div className="heading-ico">
                  <span className="ico">
                    <IconCheck size={20} />
                  </span>
                  <h2>Penyewa</h2>
                </div>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.75 }}>
                  Penyewa diwajibkan menjaga ketertiban dan merawat properti yang
                  disewa dengan penuh tanggung jawab. Pembayaran dilakukan langsung
                  dengan pemilik di luar aplikasi.
                </p>
                <div className="quote">
                  &quot;Kepercayaan adalah pondasi utama dalam komunitas Party Kosan.
                  Mari saling menghargai hak dan kewajiban masing-masing pihak.&quot;
                </div>
              </div>
            </section>
          )}

          {tab === "keamanan" && (
            <section className="tab-page">
              <div
                className="content-card banner"
                style={{ borderRadius: 18, marginBottom: 22 }}
              >
                <div className="ph img-bed-green" />
                <h1>Komitmen Keamanan Kami</h1>
                <p>
                  Membangun ekosistem pencarian hunian yang aman, transparan, dan
                  terpercaya untuk seluruh komunitas Party Kosan.
                </p>
              </div>
              <div className="grid grid-2">
                <div className="content-card cc-pad">
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: "6px 0 10px" }}>
                    Sistem Verifikasi Berlapis
                  </h2>
                  <ul className="checklist" style={{ marginTop: 14 }}>
                    <li>
                      <IconCheck size={17} />
                      Verifikasi identitas untuk pemilik kos
                    </li>
                    <li>
                      <IconCheck size={17} />
                      Validasi kepemilikan properti
                    </li>
                    <li>
                      <IconCheck size={17} />
                      Pemeriksaan ulasan komunitas berkala
                    </li>
                  </ul>
                </div>
                <div className="content-card cc-pad">
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: "6px 0 10px" }}>
                    Tips Aman Bertransaksi
                  </h2>
                  <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                    Selalu lakukan survei unit sebelum membayar, dan simpan seluruh
                    riwayat komunikasi dengan pemilik kos sebagai bukti.
                  </p>
                </div>
              </div>
            </section>
          )}

          {tab === "bantuan" && (
            <section className="tab-page">
              <BantuanTab />
            </section>
          )}
        </div>
      </div>
      <div style={{ height: 50 }} />
    </div>
  );
}
