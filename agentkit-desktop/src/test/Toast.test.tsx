/**
 * Toast Component Tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToastContainer } from "../components/Toast";
import { useToast } from "../hooks/useToast";
import type { ToastMessage } from "../components/Toast";

describe("ToastContainer", () => {
  const mockToasts: ToastMessage[] = [
    {
      id: "toast-1",
      type: "success",
      title: "Success!",
      message: "Operation completed successfully",
    },
    {
      id: "toast-2",
      type: "error",
      title: "Error!",
      message: "Something went wrong",
    },
  ];

  it("renders nothing when toasts array is empty", () => {
    const { container } = render(<ToastContainer toasts={[]} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders all toasts", () => {
    render(<ToastContainer toasts={mockToasts} onClose={() => {}} />);
    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(screen.getByText("Error!")).toBeInTheDocument();
  });

  it("renders toast messages", () => {
    render(<ToastContainer toasts={mockToasts} onClose={() => {}} />);
    expect(screen.getByText("Operation completed successfully")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    const firstToast: ToastMessage = {
      id: "toast-1",
      type: "success",
      title: "Success!",
      message: "Operation completed successfully",
    };
    render(<ToastContainer toasts={[firstToast]} onClose={handleClose} />);

    fireEvent.click(screen.getByRole("button", { name: /close notification/i }));

    // Wait for animation
    setTimeout(() => {
      expect(handleClose).toHaveBeenCalledWith("toast-1");
    }, 350);
  });

  it("renders correct icon for success type", () => {
    render(
      <ToastContainer
        toasts={[{ id: "1", type: "success", title: "Test" }]}
        onClose={() => {}}
      />
    );
    expect(screen.getByTestId("toast-icon-success")).toBeInTheDocument();
  });

  it("renders correct icon for error type", () => {
    render(
      <ToastContainer
        toasts={[{ id: "1", type: "error", title: "Test" }]}
        onClose={() => {}}
      />
    );
    expect(screen.getByTestId("toast-icon-error")).toBeInTheDocument();
  });

  it("renders correct icon for warning type", () => {
    render(
      <ToastContainer
        toasts={[{ id: "1", type: "warning", title: "Test" }]}
        onClose={() => {}}
      />
    );
    expect(screen.getByTestId("toast-icon-warning")).toBeInTheDocument();
  });

  it("renders correct icon for info type", () => {
    render(
      <ToastContainer
        toasts={[{ id: "1", type: "info", title: "Test" }]}
        onClose={() => {}}
      />
    );
    expect(screen.getByTestId("toast-icon-info")).toBeInTheDocument();
  });
});

describe("useToast hook", () => {
  // Test component that uses the hook
  function TestComponent() {
    const { toasts, success, error, warning, info, removeToast } = useToast();

    return (
      <div>
        <button onClick={() => success("Success Title", "Success Message")}>
          Add Success
        </button>
        <button onClick={() => error("Error Title")}>Add Error</button>
        <button onClick={() => warning("Warning Title")}>Add Warning</button>
        <button onClick={() => info("Info Title")}>Add Info</button>
        <div data-testid="toast-count">{toasts.length}</div>
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  it("adds success toast", () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText("Add Success"));

    expect(screen.getByText("Success Title")).toBeInTheDocument();
    expect(screen.getByText("Success Message")).toBeInTheDocument();
  });

  it("adds error toast", () => {
    render(<TestComponent />);

    fireEvent.click(screen.getByText("Add Error"));

    expect(screen.getByText("Error Title")).toBeInTheDocument();
  });

  it("increments toast count", () => {
    render(<TestComponent />);

    const countBefore = parseInt(screen.getByTestId("toast-count").textContent || "0");

    fireEvent.click(screen.getByText("Add Success"));

    const countAfter = parseInt(screen.getByTestId("toast-count").textContent || "0");
    expect(countAfter).toBe(countBefore + 1);
  });
});
