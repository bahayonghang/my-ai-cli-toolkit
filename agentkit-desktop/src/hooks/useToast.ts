/**
 * useToast Hook - Toast notification state management
 */

import { useEffect, useState } from "react";
import type { ToastMessage, ToastType } from "../components/Toast";

// Toast store
let toastId = 0;
const listeners: Set<(toasts: ToastMessage[]) => void> = new Set();
let toasts: ToastMessage[] = [];

function notifyListeners() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function useToast() {
  const [localToasts, setLocalToasts] = useState<ToastMessage[]>(toasts);

  useEffect(() => {
    listeners.add(setLocalToasts);
    return () => {
      listeners.delete(setLocalToasts);
    };
  }, []);

  const addToast = (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = `toast-${++toastId}`;
    const newToast: ToastMessage = { id, type, title, message, duration };
    toasts = [...toasts, newToast];
    notifyListeners();
    return id;
  };

  const removeToast = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  };

  const success = (title: string, message?: string) =>
    addToast("success", title, message);
  const error = (title: string, message?: string) =>
    addToast("error", title, message);
  const warning = (title: string, message?: string) =>
    addToast("warning", title, message);
  const info = (title: string, message?: string) =>
    addToast("info", title, message);

  return {
    toasts: localToasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
