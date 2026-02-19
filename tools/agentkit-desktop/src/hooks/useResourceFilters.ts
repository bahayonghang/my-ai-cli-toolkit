/**
 * useResourceFilters - Search, category, and tag filtering logic
 */

import { useMemo, useState, useCallback } from "react";
import type { ResourceItem, ResourceType } from "@/types";

export function useResourceFilters(resources: ResourceItem[], activeType: ResourceType | null) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const resourcesByType = useMemo(() =>
    activeType ? resources.filter(r => r.resourceType === activeType) : resources,
    [resources, activeType]
  );

  // Single reduce pass for all counts
  const counts = useMemo(() =>
    resources.reduce((acc, r) => {
      acc[r.resourceType] = (acc[r.resourceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    [resources]
  );

  const filtered = useMemo(() => resourcesByType.filter(r => {
    const q = searchQuery.toLowerCase();
    const searchMatch = !searchQuery ||
      r.name.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q));
    const catMatch = selectedCategories.size === 0 || r.categories.some(c => selectedCategories.has(c));
    const tagMatch = selectedTags.size === 0 || r.tags.some(t => selectedTags.has(t));
    return searchMatch && catMatch && tagMatch;
  }), [resourcesByType, searchQuery, selectedCategories, selectedTags]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    resourcesByType.forEach(r => r.categories.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [resourcesByType]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    resourcesByType.forEach(r => r.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [resourcesByType]);

  const hasActiveFilters = selectedCategories.size > 0 || selectedTags.size > 0;

  const clearFilters = useCallback(() => {
    setSelectedCategories(new Set());
    setSelectedTags(new Set());
  }, []);

  const clearAll = useCallback(() => {
    clearFilters();
    setSearchQuery("");
  }, [clearFilters]);

  return {
    filtered, counts, resourcesByType,
    searchQuery, setSearchQuery,
    selectedCategories, setSelectedCategories,
    selectedTags, setSelectedTags,
    availableCategories, availableTags,
    hasActiveFilters, clearFilters, clearAll,
  };
}
