"use client";

import Modal from "@/components/Modal";
import { IconCheck, IconX } from "@/components/Icons";

export type FeedbackType = "success" | "error";

export interface FeedbackAction {
  label: string;
  onClick: () => void;
  variant?: "green" | "dark" | "outline" | "danger";
}

export interface ModalFeedbackProps {
  open: boolean;
  type: FeedbackType;
  title: string;
  description?: string;
  details?: { label: string; value: string }[];
  actions: FeedbackAction[];
  onClose: () => void;
}

const VARIANT_CLASS: Record<NonNullable<FeedbackAction["variant"]>, string> = {
  green: "btn btn-green btn-block",
  dark: "btn btn-dark btn-block",
  outline: "btn btn-outline btn-block",
  danger: "btn btn-danger btn-block",
};

export default function ModalFeedback({
  open,
  type,
  title,
  description,
  details,
  actions,
  onClose,
}: ModalFeedbackProps) {
  return (
    <Modal open={open} onClose={onClose} showClose>
      <div className="feedback">
        <div className={`fb-ico ${type}`}>
          {type === "success" ? <IconCheck size={30} /> : <IconX size={30} />}
        </div>
        <h2>{title}</h2>
        {description && <p className="fb-desc">{description}</p>}

        {details && details.length > 0 && (
          <div className="fb-details">
            {details.map((d, i) => (
              <div className="fb-row" key={i}>
                <span className="l">{d.label}</span>
                <span className="v">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="fb-actions">
          {actions.map((a, i) => (
            <button
              key={i}
              className={VARIANT_CLASS[a.variant ?? (i === 0 ? "green" : "outline")]}
              onClick={a.onClick}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
