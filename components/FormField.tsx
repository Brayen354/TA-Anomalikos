import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  hint?: string;
}

export default function FormField({ label, error, children, hint }: FormFieldProps) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
      {hint && !error && (
        <small className="muted" style={{ fontSize: 12, marginTop: 5, display: "block" }}>
          {hint}
        </small>
      )}
      {error && <small className="field-err">{error}</small>}
    </div>
  );
}

export function inpClass(hasError?: boolean | string): string {
  return `inp${hasError ? " invalid" : ""}`;
}
