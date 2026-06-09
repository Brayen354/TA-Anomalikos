"use client";

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-3">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skel" key={i}>
          <div className="skel-thumb" />
          <div className="skel-body">
            <div className="skel-line lg" />
            <div className="skel-line sm" />
            <div className="skel-line" style={{ width: "40%", marginTop: 18 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
