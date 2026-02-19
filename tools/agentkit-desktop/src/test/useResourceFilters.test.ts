/**
 * useResourceFilters Hook Tests
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResourceFilters } from "../hooks/useResourceFilters";
import type { ResourceItem } from "../types";

// Minimal resource factory
function makeResource(overrides: Partial<ResourceItem> & { id: string; name: string }): ResourceItem {
  return {
    resourceType: "skill",
    description: "",
    source: { type: "local", path: "/test" },
    categories: [],
    tags: [],
    platformStatus: {} as ResourceItem["platformStatus"],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

const sampleResources: ResourceItem[] = [
  makeResource({ id: "1", name: "Alpha", resourceType: "skill", categories: ["ai"], tags: ["python", "ml"] }),
  makeResource({ id: "2", name: "Beta", resourceType: "skill", categories: ["ai", "web"], tags: ["typescript"] }),
  makeResource({ id: "3", name: "Gamma", resourceType: "command", categories: ["dev"], tags: ["rust"] }),
  makeResource({ id: "4", name: "Delta", resourceType: "agent", categories: ["web"], tags: ["typescript", "react"] }),
  makeResource({ id: "5", name: "Epsilon", resourceType: "skill", description: "A unique tool", categories: [], tags: [] }),
];

describe("useResourceFilters", () => {
  it("returns all resources when no filters active", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    expect(result.current.filtered).toHaveLength(5);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("filters by resource type", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, "skill"));

    expect(result.current.resourcesByType).toHaveLength(3);
    expect(result.current.filtered).toHaveLength(3);
    expect(result.current.filtered.every((r) => r.resourceType === "skill")).toBe(true);
  });

  it("filters by search query (name match)", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    act(() => {
      result.current.setSearchQuery("alpha");
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]?.name).toBe("Alpha");
  });

  it("filters by search query (description match)", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    act(() => {
      result.current.setSearchQuery("unique tool");
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]?.name).toBe("Epsilon");
  });

  it("filters by search query (tag match)", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    act(() => {
      result.current.setSearchQuery("react");
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]?.name).toBe("Delta");
  });

  it("search is case-insensitive", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    act(() => {
      result.current.setSearchQuery("BETA");
    });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]?.name).toBe("Beta");
  });

  it("filters by selected categories", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    act(() => {
      result.current.setSelectedCategories(new Set(["web"]));
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.filtered).toHaveLength(2); // Beta (ai,web) and Delta (web)
  });

  it("filters by selected tags", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    act(() => {
      result.current.setSelectedTags(new Set(["typescript"]));
    });

    expect(result.current.filtered).toHaveLength(2); // Beta and Delta
  });

  it("combines search + category + tag filters", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    act(() => {
      result.current.setSelectedCategories(new Set(["ai"]));
      result.current.setSelectedTags(new Set(["typescript"]));
    });

    // Only Beta has both category "ai" and tag "typescript"
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]?.name).toBe("Beta");
  });

  it("counts resources by type", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    expect(result.current.counts).toEqual({
      skill: 3,
      command: 1,
      agent: 1,
    });
  });

  it("computes availableCategories from type-filtered resources", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, "skill"));

    // Skills have categories: ai, web (from Alpha and Beta)
    expect(result.current.availableCategories).toEqual(["ai", "web"]);
  });

  it("computes availableTags from type-filtered resources", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, "command"));

    // Only Gamma (command) has tag "rust"
    expect(result.current.availableTags).toEqual(["rust"]);
  });

  it("clearFilters resets categories and tags but not search", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    act(() => {
      result.current.setSearchQuery("alpha");
      result.current.setSelectedCategories(new Set(["ai"]));
      result.current.setSelectedTags(new Set(["python"]));
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.selectedCategories.size).toBe(0);
    expect(result.current.selectedTags.size).toBe(0);
    expect(result.current.searchQuery).toBe("alpha"); // search preserved
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("clearAll resets everything", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    act(() => {
      result.current.setSearchQuery("alpha");
      result.current.setSelectedCategories(new Set(["ai"]));
      result.current.setSelectedTags(new Set(["python"]));
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.selectedCategories.size).toBe(0);
    expect(result.current.selectedTags.size).toBe(0);
    expect(result.current.searchQuery).toBe("");
    expect(result.current.filtered).toHaveLength(5);
  });

  it("returns empty when search matches nothing", () => {
    const { result } = renderHook(() => useResourceFilters(sampleResources, null));

    act(() => {
      result.current.setSearchQuery("zzzznonexistent");
    });

    expect(result.current.filtered).toHaveLength(0);
  });
});
