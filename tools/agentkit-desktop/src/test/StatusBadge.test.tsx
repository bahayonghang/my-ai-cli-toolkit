/**
 * StatusBadge Component Tests
 */

import { beforeEach, describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../components/StatusBadge";
import i18n from "../i18n";

describe("StatusBadge", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("renders translated status in English by default", async () => {
    await i18n.changeLanguage("en");
    render(<StatusBadge status="synced" />);
    expect(screen.getByText("Synced")).toBeInTheDocument();
  });

  it("renders translated status in Chinese", async () => {
    await i18n.changeLanguage("zh");
    render(<StatusBadge status="outdated" />);
    expect(screen.getByText("需更新")).toBeInTheDocument();
  });

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
    expect(badge).toHaveClass("bg-emerald-500/15");
  });

  it("applies correct styling for outdated status", () => {
    const { container } = render(<StatusBadge status="outdated" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-amber-500/15");
  });
});
