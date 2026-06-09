"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { IconChevronLeft } from "./Icons";

export function Loading({ label }: { label?: string }) {
  return (
    <div className="empty-state">
      <div className="spinner" />
      {label && <p style={{ marginTop: 14 }}>{label}</p>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="alert error">{message}</div>;
}

export function BackLink({
  href,
  children = "Kembali",
}: {
  href: string;
  children?: ReactNode;
}) {
  return (
    <Link href={href} className="back">
      <IconChevronLeft size={15} />
      {children}
    </Link>
  );
}
