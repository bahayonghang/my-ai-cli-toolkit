/**
 * Toast Component - Notification system for user feedback
 */

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { IconButton } from "./ui/IconButton";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string | undefined;
  duration?: number | undefined;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const { t } = useTranslation();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 300);
  };

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5" aria-hidden="true" />,
    error: <XCircle className="h-5 w-5" aria-hidden="true" />,
    warning: <AlertTriangle className="h-5 w-5" aria-hidden="true" />,
    info: <Info className="h-5 w-5" aria-hidden="true" />,
  };

  const colors: Record<ToastType, string> = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  };

  const textColors: Record<ToastType, string> = {
    success: "text-green-800 dark:text-green-200",
    error: "text-red-800 dark:text-red-200",
    warning: "text-yellow-800 dark:text-yellow-200",
    info: "text-blue-800 dark:text-blue-200",
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ${
        colors[toast.type]
      } ${isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}
    >
      <span
        className={`shrink-0 ${textColors[toast.type]}`}
        data-testid={`toast-icon-${toast.type}`}
      >
        {icons[toast.type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${textColors[toast.type]}`}>{toast.title}</p>
        {toast.message && (
          <p className={`text-sm mt-1 ${textColors[toast.type]} opacity-80`}>
            {toast.message}
          </p>
        )}
      </div>
      <IconButton
        onClick={handleClose}
        ariaLabel={t("a11y.closeToast")}
        icon={<X className="h-4 w-4" />}
        size="sm"
        className={textColors[toast.type]}
      />
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

