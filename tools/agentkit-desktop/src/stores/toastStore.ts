/**
 * Toast Store - Zustand state management for toast notifications
 *
 * Replaces the previous module-level mutable state pattern with a proper
 * Zustand store for React-idiomatic state management.
 */

import { create } from "zustand";
import type { ToastMessage, ToastType } from "@/components/Toast";

let nextToastId = 0;

interface ToastState {
  toasts: ToastMessage[];

  // Actions
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => string;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (type, title, message, duration) => {
    const id = `toast-${++nextToastId}`;
    const newToast: ToastMessage = { id, type, title, message, duration };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    return id;
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  success: (title, message) => {
    const id = `toast-${++nextToastId}`;
    const newToast: ToastMessage = { id, type: "success", title, message };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    return id;
  },

  error: (title, message) => {
    const id = `toast-${++nextToastId}`;
    const newToast: ToastMessage = { id, type: "error", title, message };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    return id;
  },

  warning: (title, message) => {
    const id = `toast-${++nextToastId}`;
    const newToast: ToastMessage = { id, type: "warning", title, message };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    return id;
  },

  info: (title, message) => {
    const id = `toast-${++nextToastId}`;
    const newToast: ToastMessage = { id, type: "info", title, message };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    return id;
  },
}));
