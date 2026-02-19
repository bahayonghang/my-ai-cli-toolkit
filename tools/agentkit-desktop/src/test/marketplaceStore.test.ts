import { beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { useMarketplaceStore } from "@/stores/marketplaceStore";
import type { MarketplaceSkill } from "@/types";

const mockInvoke = vi.mocked(invoke);

const sampleSkill: MarketplaceSkill = {
  id: "owner/repo/skill-name",
  name: "skill-name",
  owner: "owner",
  repo: "repo",
  skill: "skill-name",
  stars: 10,
  downloads: 20,
  categories: [],
  platforms: [],
  source: "owner/repo",
  installed: false,
};

function resetMarketplaceStore() {
  useMarketplaceStore.setState({
    skills: [],
    categories: [],
    cacheStats: null,
    loading: false,
    _loadingCount: 0,
    installing: null,
    error: null,
    sortBy: "hot",
    searchQuery: "",
    filters: {},
    nodejsAvailable: null,
    nodejsVersion: null,
  });
}

describe("marketplaceStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMarketplaceStore();
  });

  it("does not call search command when keyword length < 2", async () => {
    await useMarketplaceStore.getState().searchSkills("a");

    expect(mockInvoke).not.toHaveBeenCalled();
  });

  it("installSkill invokes backend with owner/repo/skill", async () => {
    useMarketplaceStore.setState({ skills: [sampleSkill] });
    mockInvoke.mockResolvedValueOnce({
      success: true,
      skillId: "owner/repo/skill-name",
    });

    await useMarketplaceStore
      .getState()
      .installSkill("owner", "repo", "skill-name");

    expect(mockInvoke).toHaveBeenCalledWith("install_marketplace_skill", {
      owner: "owner",
      repo: "repo",
      skill: "skill-name",
    });

    const updated = useMarketplaceStore
      .getState()
      .skills.find(skill => skill.id === "owner/repo/skill-name");
    expect(updated?.installed).toBe(true);
  });
});
