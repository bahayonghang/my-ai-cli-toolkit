/**
 * ResourceCard Component Tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResourceCard } from "../components/ResourceCard";
import type { ResourceItem } from "../types";

const mockResource: ResourceItem = {
  id: "test-skill-1",
  name: "Test Skill",
  resourceType: "skill",
  description: "A test skill for testing purposes",
  source: { type: "local", path: "/path/to/skill" },
  categories: ["testing"],
  tags: ["test", "mock", "example"],
  platformStatus: {
    claude: "synced",
    codex: "not_installed",
    gemini: "not_installed",
    cursor: "not_installed",
    windsurf: "not_installed",
    antigravity: "not_installed",
    qwen: "not_installed",
    amp: "not_installed",
    cline: "not_installed",
    kiro: "not_installed",
    trae: "not_installed",
    opencode: "not_installed",
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("ResourceCard", () => {
  it("renders resource name", () => {
    render(<ResourceCard resource={mockResource} />);
    expect(screen.getByText("Test Skill")).toBeInTheDocument();
  });

  it("renders resource description", () => {
    render(<ResourceCard resource={mockResource} />);
    expect(screen.getByText("A test skill for testing purposes")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<ResourceCard resource={mockResource} />);
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByText("mock")).toBeInTheDocument();
    expect(screen.getByText("example")).toBeInTheDocument();
  });

  it("renders skill icon for skill type", () => {
    render(<ResourceCard resource={mockResource} />);
    expect(screen.getByTestId("resource-type-icon-skill")).toBeInTheDocument();
  });

  it("renders command icon for command type", () => {
    const commandResource = { ...mockResource, resourceType: "command" as const };
    render(<ResourceCard resource={commandResource} />);
    expect(screen.getByTestId("resource-type-icon-command")).toBeInTheDocument();
  });

  it("renders agent icon for agent type", () => {
    const agentResource = { ...mockResource, resourceType: "agent" as const };
    render(<ResourceCard resource={agentResource} />);
    expect(screen.getByTestId("resource-type-icon-agent")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<ResourceCard resource={mockResource} onClick={handleClick} />);

    fireEvent.click(screen.getByText("Test Skill").closest("div")!);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies selected styling when selected", () => {
    const { container } = render(<ResourceCard resource={mockResource} selected />);
    const card = container.firstChild;
    expect(card).toHaveClass("border-primary-500/50");
  });

  it("shows checkbox when showCheckbox is true", () => {
    render(<ResourceCard resource={mockResource} showCheckbox />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("checkbox is checked when checked prop is true", () => {
    render(<ResourceCard resource={mockResource} showCheckbox checked />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onCheckChange when checkbox is toggled", () => {
    const handleCheckChange = vi.fn();
    render(
      <ResourceCard
        resource={mockResource}
        showCheckbox
        checked={false}
        onCheckChange={handleCheckChange}
      />
    );

    fireEvent.click(screen.getByRole("checkbox"));
    expect(handleCheckChange).toHaveBeenCalledWith(true);
  });

  it("renders status badges", () => {
    render(<ResourceCard resource={mockResource} />);
    // Should show synced badge for claude
    expect(screen.getByText("Synced")).toBeInTheDocument();
  });
});
