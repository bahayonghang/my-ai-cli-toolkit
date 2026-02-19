/**
 * ConfirmDialog - Modal confirmation dialog for destructive actions
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Handle Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  if (!open) return null;

  const variantStyles = {
    danger: {
      button: "bg-red-500 hover:bg-red-600 text-white",
      border: "border-red-500/20",
    },
    warning: {
      button: "bg-amber-500 hover:bg-amber-600 text-white",
      border: "border-amber-500/20",
    },
    info: {
      button: "bg-primary-500 hover:bg-primary-600 text-white",
      border: "border-primary-500/20",
    },
  };

  const styles = variantStyles[variant];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="relative bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient border effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl opacity-20 blur ${styles.border}`}></div>

        <div className="relative bg-slate-900 rounded-xl p-6">
          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-3">{title}</h3>

          {/* Message */}
          <p className="text-slate-300 text-sm mb-6">{message}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${styles.button}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
