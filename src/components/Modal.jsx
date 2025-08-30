// Modal.jsx (no Tailwind)
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="sp-modal-root" role="dialog" aria-modal="true" aria-label={title}>
      <div className="sp-modal-backdrop" onClick={onClose} />
      <div className="sp-modal">
        <div className="sp-modal__header">
          <div className="sp-modal__title">{title}</div>
          <button className="sp-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="sp-modal__body">{children}</div>
      </div>
    </div>,
    document.getElementById("theeditor")
  );
}
