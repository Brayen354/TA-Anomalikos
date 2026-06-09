"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import Markdown from "./Markdown";
import { IconBot, IconChat, IconSend, IconTrash, IconX } from "./Icons";

interface Msg {
  from: "bot" | "me";
  text: string;
  time: string;
}

function nowTime() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const INITIAL_TEXT = "Halo! Saya asisten Party Kosan. Ada yang bisa saya bantu untuk mencari kos impian Anda?";

export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState("");
  const [typing, setTyping]   = useState(false);
  const [clearing, setClearing] = useState(false);
  // time diisi setelah mount untuk menghindari hydration mismatch SSR vs client
  const [msgs, setMsgs]       = useState<Msg[]>([{ from: "bot", text: INITIAL_TEXT, time: "" }]);
  const bodyRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMsgs(([first, ...rest]) => [{ ...first, time: nowTime() }, ...rest]);
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setInput("");
    setMsgs((m) => [...m, { from: "me", text: q, time: nowTime() }]);
    setTyping(true);
    try {
      const res = await api.post<{ jawaban?: string }>("/chatbot", { pertanyaan: q });
      const jawaban =
        (res as unknown as { jawaban?: string }).jawaban ||
        (typeof res.data === "string" ? res.data : "") ||
        "Maaf, saya belum punya jawaban untuk itu.";
      setMsgs((m) => [...m, { from: "bot", text: jawaban, time: nowTime() }]);
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? "Silakan login terlebih dahulu untuk menggunakan asisten Party Kosan."
          : "Maaf, asisten sedang tidak dapat dihubungi. Coba lagi nanti.";
      setMsgs((m) => [...m, { from: "bot", text: message, time: nowTime() }]);
    } finally {
      setTyping(false);
    }
  };

  const clearHistory = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await api.del("/chatbot/clear");
      setMsgs([{ from: "bot", text: INITIAL_TEXT, time: nowTime() }]);
    } catch {
      // clear error diabaikan
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat"
      >
        {open ? <IconX size={22} /> : <IconChat size={22} />}
      </button>

      <div className={`chat-pop${open ? " show" : ""}`}>
        <div className="chat-top">
          <span className="bot">
            <IconBot size={18} />
          </span>
          <div>
            <div className="t1">Party Kosan AI Assistant</div>
            <div className="t2">Online</div>
          </div>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button
              className="x"
              onClick={clearHistory}
              disabled={clearing}
              title="Hapus riwayat chat"
              aria-label="Hapus riwayat"
            >
              <IconTrash size={14} />
            </button>
            <button className="x" onClick={() => setOpen(false)} aria-label="Tutup">
              <IconX size={16} />
            </button>
          </div>
        </div>

        <div className="chat-body" ref={bodyRef}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "contents" }}>
              <div className={`msg ${m.from}`} style={{ whiteSpace: "pre-wrap" }}>
                {m.from === "bot" ? <Markdown text={m.text} /> : m.text}
              </div>
              {m.time && (
                <div className={`msg-time${m.from === "me" ? " me" : ""}`}>
                  {m.time}
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="typing">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            ref={inputRef}
            type="text"
            placeholder="Tulis pesan..."
            value={input}
            maxLength={600}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <button onClick={() => send(input)} aria-label="Kirim" disabled={typing}>
            <IconSend size={17} />
          </button>
        </div>
      </div>
    </>
  );
}
