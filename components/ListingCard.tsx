"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowRight, IconHeart, IconMapPin } from "./Icons";
import { rupiah } from "@/lib/format";

export interface ListingCardProps {
  href: string;
  phClass: string;
  imageUrl?: string | null;
  badge?: string;
  title: string;
  location?: string;
  price?: number | null;
  priceLabel?: string;
  initialFav?: boolean;
  onToggleFav?: (next: boolean) => Promise<void> | void;
}

export default function ListingCard({
  href,
  phClass,
  imageUrl,
  badge,
  title,
  location,
  price,
  priceLabel = "MULAI DARI",
  initialFav = false,
  onToggleFav,
}: ListingCardProps) {
  const [fav, setFav] = useState(initialFav);
  const [busy, setBusy] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const next = !fav;
    setFav(next);
    if (onToggleFav) {
      try {
        setBusy(true);
        await onToggleFav(next);
      } catch {
        setFav(!next);
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <Link className="card" href={href}>
      <div className="thumb">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="ph"
            src={imageUrl}
            alt={title}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        ) : (
          <div className={`ph ${phClass}`} />
        )}
        {badge && <span className="badge">{badge}</span>}
        <button
          className={`fav${fav ? " on" : ""}`}
          onClick={toggle}
          aria-label="Favorit"
        >
          <IconHeart size={17} fill={fav ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="card-body">
        <h3>{title}</h3>
        {location && (
          <div className="loc">
            <IconMapPin size={13} />
            {location}
          </div>
        )}
        <div className="divider" />
        <div className="price-row">
          <div className="price">
            <div className="lbl">{priceLabel}</div>
            <div className="amt">
              {price ? (
                <>
                  {rupiah(price)}
                  <span>/bulan</span>
                </>
              ) : (
                "Hubungi pemilik"
              )}
            </div>
          </div>
          <span className="go">
            <IconArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
