import { useState, useCallback, useRef } from "react";

type Rules<T> = Partial<Record<keyof T, (val: string, form: T) => string>>;

export function useFormValidation<T extends Record<string, string>>(
  form: T,
  rules: Rules<T>
) {
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [overrides, setOverrides] = useState<Partial<Record<string, string>>>({});
  const formRef = useRef(form);
  formRef.current = form;

  const runRule = useCallback(
    (field: keyof T): string => {
      const fn = rules[field];
      return fn ? fn(formRef.current[field] ?? "", formRef.current) : "";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const errs = Object.fromEntries(
    Object.keys(rules).map((k) => {
      if (overrides[k]) return [k, overrides[k]];
      return [k, touched[k as keyof T] ? runRule(k as keyof T) : ""];
    })
  ) as Record<keyof T, string>;

  const touch = (field: keyof T) => {
    setOverrides((p) => { const n = { ...p }; delete n[field as string]; return n; });
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const setFieldError = (field: keyof T | string, message: string) => {
    setOverrides((p) => ({ ...p, [field as string]: message }));
    setTouched((prev) => ({ ...prev, [field as keyof T]: true }));
  };

  const validate = (): boolean => {
    const allTouched = Object.fromEntries(
      Object.keys(rules).map((k) => [k, true])
    ) as Record<keyof T, boolean>;
    setTouched(allTouched);
    return Object.keys(rules).every((k) => !runRule(k as keyof T));
  };

  const reset = () => { setTouched({}); setOverrides({}); };

  return { errs, touch, validate, reset, setFieldError };
}

export const PHONE_REGEX = /^(\+62|08)[0-9]{7,13}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export const validatePhone = (v: string) =>
  v && !PHONE_REGEX.test(v) ? "Nomor tidak valid. Gunakan format 08... atau +62..." : "";

export const validateEmail = (v: string) => {
  if (!v.trim()) return "Email wajib diisi.";
  if (!EMAIL_REGEX.test(v)) return "Format email tidak valid. Contoh: user@gmail.com";
  return "";
};
