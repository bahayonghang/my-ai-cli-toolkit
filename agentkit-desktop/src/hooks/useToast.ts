/**
 * useToast Hook - Backward-compatible wrapper around toastStore
 *
 * Components can continue using `useToast()` as before.
 * State is now managed by a proper Zustand store instead of module-level variables.
 */

import { useToastStore } from "@/stores/toastStore";

export function useToast() {
  const { toasts, addToast, removeToast, success, error, warning, info } =
    useToastStore();

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
