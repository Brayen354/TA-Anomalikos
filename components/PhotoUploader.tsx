"use client";

import { useEffect, useRef, useState } from "react";
import { IconUpload, IconX } from "./Icons";

const MAX_MB = 5;
const TIPE_OK = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  min?: number;
  error?: string;
}

export default function PhotoUploader({ files, onChange, min = 0, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [localErr, setLocalErr] = useState("");

  // object URL dikelola lewat ref agar tidak perlu state terpisah
  const filesRef = useRef<File[]>([]);
  const previewsRef = useRef<string[]>([]);
  if (filesRef.current !== files) {
    previewsRef.current.forEach(URL.revokeObjectURL);
    previewsRef.current = files.map((f) => URL.createObjectURL(f));
    filesRef.current = files;
  }
  const previews = previewsRef.current;

  useEffect(() => {
    return () => previewsRef.current.forEach(URL.revokeObjectURL);
  }, []);

  const terima = (masuk: FileList | File[] | null) => {
    if (!masuk) return;
    const arr = Array.from(masuk);
    const valid: File[] = [];
    const errs: string[] = [];
    for (const f of arr) {
      const tipeOk = TIPE_OK.includes(f.type) || f.type.startsWith("image/");
      if (!tipeOk) {
        errs.push(`${f.name}: format tidak didukung`);
        continue;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        errs.push(`${f.name}: ukuran maksimal ${MAX_MB}MB`);
        continue;
      }
      valid.push(f);
    }
    setLocalErr(errs.join(" · "));
    if (valid.length) onChange([...files, ...valid]);
  };

  const hapus = (i: number) => onChange(files.filter((_, j) => j !== i));

  return (
    <>
      <div
        className={`dropzone${error ? " invalid" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDrag(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          terima(e.dataTransfer.files);
        }}
        style={{
          cursor: "pointer",
          ...(drag
            ? { borderColor: "var(--green)", background: "var(--mint-bg)" }
            : {}),
        }}
      >
        <IconUpload size={32} />
        <div className="t1">
          {files.length > 0
            ? `${files.length} foto dipilih`
            : "Klik atau seret foto ke sini"}
        </div>
        <div className="t2">
          {min > 0 ? `Minimal ${min} foto. ` : ""}JPG/PNG/WebP, maks. {MAX_MB}MB
          per foto.
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={(e) => {
            terima(e.target.files);
            e.target.value = ""; // izinkan memilih file yang sama lagi
          }}
        />
      </div>

      {(error || localErr) && (
        <small className="field-err">{error || localErr}</small>
      )}

      {previews.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          {previews.map((src, i) => (
            <div key={i} style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={files[i]?.name ?? `foto ${i + 1}`}
                style={{
                  width: 90,
                  height: 68,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                }}
              />
              <button
                type="button"
                className="icon-btn del"
                onClick={(e) => {
                  e.stopPropagation();
                  hapus(i);
                }}
                style={{ position: "absolute", top: -8, right: -8 }}
                aria-label="Hapus foto"
              >
                <IconX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
