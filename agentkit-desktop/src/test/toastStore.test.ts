/**
 * Toast Store Tests - Zustand store for toast notifications
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useToastStore } from "../stores/toastStore";

describe("toastStore", () => {
  beforeEach(() => {
    // Reset store state between tests
    useToastStore.setState({ toasts: [] });
  });

  it("starts with empty toasts", () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it("addToast adds a toast with correct type and title", () => {
    const id = useToastStore.getState().addToast("success", "Done", "All good");
    const { toasts } = useToastStore.getState();

    expect(id).toBeDefined();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      id,
      type: "success",
      title: "Done",
      message: "All good",
    });
  });

  it("addToast generates unique IDs", () => {
    const id1 = useToastStore.getState().addToast("info", "A");
    const id2 = useToastStore.getState().addToast("info", "B");

    expect(id1).not.toBe(id2);
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });

  it("removeToast removes the correct toast", () => {
    const id1 = useToastStore.getState().addToast("info", "Keep");
    const id2 = useToastStore.getState().addToast("error", "Remove");

    useToastStore.getState().removeToast(id2);

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.id).toBe(id1);
  });

  it("removeToast with non-existent ID is a no-op", () => {
    useToastStore.getState().addToast("info", "Stay");
    useToastStore.getState().removeToast("nonexistent");

    expect(useToastStore.getState().toasts).toHaveLength(1);
  });

  it("success() shorthand creates a success toast", () => {
    const id = useToastStore.getState().success("Saved", "File saved");
    const toast = useToastStore.getState().toasts.find((t) => t.id === id);

    expect(toast).toBeDefined();
    expect(toast?.type).toBe("success");
    expect(toast?.title).toBe("Saved");
    expect(toast?.message).toBe("File saved");
  });

  it("error() shorthand creates an error toast", () => {
    const id = useToastStore.getState().error("Failed");
    const toast = useToastStore.getState().toasts.find((t) => t.id === id);

    expect(toast?.type).toBe("error");
    expect(toast?.title).toBe("Failed");
  });

  it("warning() shorthand creates a warning toast", () => {
    const id = useToastStore.getState().warning("Careful");
    const toast = useToastStore.getState().toasts.find((t) => t.id === id);

    expect(toast?.type).toBe("warning");
  });

  it("info() shorthand creates an info toast", () => {
    const id = useToastStore.getState().info("FYI");
    const toast = useToastStore.getState().toasts.find((t) => t.id === id);

    expect(toast?.type).toBe("info");
  });

  it("supports adding many toasts without overwriting", () => {
    for (let i = 0; i < 10; i++) {
      useToastStore.getState().addToast("info", `Toast ${i}`);
    }

    expect(useToastStore.getState().toasts).toHaveLength(10);
  });
});
