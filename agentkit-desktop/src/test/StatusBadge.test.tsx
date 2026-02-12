/**
 * StatusBadge Component Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../components/StatusBadge";

describe("StatusBadge", () => {
  it("renders synced status correctly", () => {
    render(<StatusBadge status="synced" />);
    expect(screen.getByText("Synced")).toBeInTheDocument();
  });

  it("renders not_installed status correctly", () => {
    render(<StatusBadge status="not_installed" />);
    expect(screen.getByText("Not Installed")).toBeInTheDocument();
  });

  it("renders outdated status correctly", () => {
    render(<StatusBadge status="outdated" />);
    expect(screen.getByText("Outdated")).toBeInTheDocument();
  });

  it("renders conflict status correctly", () => {
    render(<StatusBadge status="conflict" />);
    expect(screen.getByText("Conflict")).toBeInTheDocument();
  });

  it("renders with count", () => {
    render(<StatusBadge status="synced" count={5} />);
    expect(screen.getByText("Synced")).toBeInTheDocument();
    // Count is rendered as "(5)" split across elements, so check the container
    expect(screen.getByText(/\(\s*5\s*\)/)).toBeInTheDocument();
  });

  it("applies correct styling for synced status", () => {
    const { container } = render(<StatusBadge status="synced" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-green-500/20");
  });

  it("applies correct styling for outdated status", () => {
    const { container } = render(<StatusBadge status="outdated" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-yellow-500/20");
  });
});
