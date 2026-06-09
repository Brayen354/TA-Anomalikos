"use client";

import { useEffect, type ReactNode } from "react";
import { IconX } from "./Icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  showClose?: boolean;
}

export default function Modal({
  open,
  onClose,
  children,
  wide = false,
  showClose = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay show" onClick={onClose}>
      <div
        className={`modal${wide ? " wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {showClose && (
          <button className="close" onClick={onClose} aria-label="Tutup">
            <IconX size={16} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
