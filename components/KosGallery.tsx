import type { CSSProperties, ReactNode } from "react";

const wrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  position: "relative",
};
const heroStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 7",
  objectFit: "cover",
  borderRadius: 16,
  display: "block",
  background: "var(--field)",
};
const thumbsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: 12,
};
const thumbStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "4 / 3",
  objectFit: "cover",
  borderRadius: 12,
  display: "block",
};

export default function KosGallery({
  photos,
  alt,
  fallback,
  overlay,
}: {
  photos: string[];
  alt: string;
  fallback?: ReactNode;
  overlay?: ReactNode;
}) {
  if (photos.length === 0) {
    return (
      <div style={wrapStyle}>
        {fallback ?? <div className="ph img-building" style={heroStyle} />}
        {overlay}
      </div>
    );
  }

  const [hero, ...rest] = photos;
  return (
    <div style={wrapStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img style={heroStyle} src={hero} alt={alt} />
      {rest.length > 0 && (
        <div style={thumbsStyle}>
          {rest.slice(0, 8).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} style={thumbStyle} src={src} alt={`${alt} ${i + 2}`} />
          ))}
        </div>
      )}
      {overlay}
    </div>
  );
}
