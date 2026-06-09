"use client";

import { useState } from "react";
import { IconSend } from "./Icons";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const subscribe = () => {
    if (email.includes("@")) {
      setEmail("");
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    }
  };

  return (
    <footer className="site">
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <h3>Party Kost</h3>
          <p>
            Solusi properti modern untuk gaya hidup dinamis. Kami menghubungkan
            pemilik properti dengan penyewa berkualitas melalui teknologi.
          </p>
        </div>
        <div className="foot-col">
          <h4>Tautan Cepat</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Support Center</a>
          <a href="#">Careers</a>
          <a href="#">Contact Us</a>
        </div>
        <div className="foot-col">
          <h4>Langganan Berita Properti</h4>
          <div className="sub-form">
            <input
              type="email"
              placeholder={done ? "Terdaftar! ✓" : "Email Anda"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && subscribe()}
            />
            <button onClick={subscribe} aria-label="Langganan">
              <IconSend size={17} />
            </button>
          </div>
          <p className="copy">© 2024 Party Kosan. Premium Living Redefined.</p>
        </div>
      </div>
    </footer>
  );
}
