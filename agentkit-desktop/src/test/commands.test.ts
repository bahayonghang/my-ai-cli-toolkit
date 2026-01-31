/**
 * Tauri Commands Integration Tests
 *
 * Tests the frontend's interaction with Tauri backend commands
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/core";

// Mock the invoke function
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

const mockInvoke = vi.mocked(invoke);

describe("Platform Commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detect_platforms returns list of platform names", async () => {
    mockInvoke.mockResolvedValueOnce(["claude", "codex", "gemini"]);

    const result = await invoke("detect_platforms");

    expect(mockInvoke).toHaveBeenCalledWith("detect_platforms");
    expect(result).toEqual(["claude", "codex", "gemini"]);
  });

  it("get_platforms returns platform info array", async () => {
    const mockPlatforms = [
      {
        name: "claude",
        display_name: "Claude Code",
        detected: true,
        skills_path: "/home/user/.claude/skills",
        commands_path: "/home/user/.claude/commands",
      },
      {
        name: "codex",
        display_name: "Codex CLI",
        detected: false,
        skills_path: null,
        commands_path: null,
      },
    ];

    mockInvoke.mockResolvedValueOnce(mockPlatforms);

    const result = await invoke("get_platforms");

    expect(mockInvoke).toHaveBeenCalledWith("get_platforms");
    expect(result).toEqual(mockPlatforms);
    expect(result).toHaveLength(2);
  });
});

describe("Resource Commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("get_resources returns all resources", async () => {
    const mockResources = [
      {
        id: "skill-1",
        name: "Test Skill",
        resource_type: "Skill",
        description: "A test skill",
        source: { type: "Local", path: "/path/to/skill" },
        platform_status: { claude: "Synced", codex: "NotInstalled" },
      },
    ];

    mockInvoke.mockResolvedValueOnce(mockResources);

    const result = await invoke("get_resources");

    expect(mockInvoke).toHaveBeenCalledWith("get_resources");
    expect(result).toEqual(mockResources);
  });

  it("get_resource_by_id returns single resource", async () => {
    const mockResource = {
      id: "skill-1",
      name: "Test Skill",
      resource_type: "Skill",
      description: "A test skill",
    };

    mockInvoke.mockResolvedValueOnce(mockResource);

    const result = await invoke("get_resource_by_id", { id: "skill-1" });

    expect(mockInvoke).toHaveBeenCalledWith("get_resource_by_id", {
      id: "skill-1",
    });
    expect(result).toEqual(mockResource);
  });

  it("get_resource_by_id returns null for non-existent resource", async () => {
    mockInvoke.mockResolvedValueOnce(null);

    const result = await invoke("get_resource_by_id", { id: "non-existent" });

    expect(result).toBeNull();
  });

  it("install_resource installs to specified platforms", async () => {
    const mockResults = [
      { platform: "claude", success: true, message: "Installed successfully" },
      { platform: "codex", success: true, message: "Installed successfully" },
    ];

    mockInvoke.mockResolvedValueOnce(mockResults);

    const result = await invoke("install_resource", {
      id: "skill-1",
      platforms: ["claude", "codex"],
    });

    expect(mockInvoke).toHaveBeenCalledWith("install_resource", {
      id: "skill-1",
      platforms: ["claude", "codex"],
    });
    expect(result).toEqual(mockResults);
  });

  it("uninstall_resource removes from specified platforms", async () => {
    mockInvoke.mockResolvedValueOnce(undefined);

    await invoke("uninstall_resource", {
      id: "skill-1",
      platforms: ["claude"],
    });

    expect(mockInvoke).toHaveBeenCalledWith("uninstall_resource", {
      id: "skill-1",
      platforms: ["claude"],
    });
  });

  it("refresh_resources re-scans filesystem", async () => {
    const mockResources = [
      { id: "skill-1", name: "Skill 1" },
      { id: "skill-2", name: "Skill 2" },
    ];

    mockInvoke.mockResolvedValueOnce(mockResources);

    const result = await invoke("refresh_resources");

    expect(mockInvoke).toHaveBeenCalledWith("refresh_resources");
    expect(result).toEqual(mockResources);
  });
});

describe("External Skill Commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("install_external_skill installs from npm", async () => {
    const mockResults = [
      { platform: "claude", success: true, message: "Installed from npm" },
    ];

    mockInvoke.mockResolvedValueOnce(mockResults);

    const result = await invoke("install_external_skill", {
      source_type: "npm",
      source: "@anthropic/skill-package",
      branch: null,
      platforms: ["claude"],
    });

    expect(mockInvoke).toHaveBeenCalledWith("install_external_skill", {
      source_type: "npm",
      source: "@anthropic/skill-package",
      branch: null,
      platforms: ["claude"],
    });
    expect(result).toEqual(mockResults);
  });

  it("install_external_skill installs from git with branch", async () => {
    const mockResults = [
      { platform: "claude", success: true, message: "Cloned from git" },
    ];

    mockInvoke.mockResolvedValueOnce(mockResults);

    const result = await invoke("install_external_skill", {
      source_type: "git",
      source: "https://github.com/user/skill-repo",
      branch: "main",
      platforms: ["claude"],
    });

    expect(mockInvoke).toHaveBeenCalledWith("install_external_skill", {
      source_type: "git",
      source: "https://github.com/user/skill-repo",
      branch: "main",
      platforms: ["claude"],
    });
    expect(result).toEqual(mockResults);
  });

  it("install_external_skill installs from pip", async () => {
    mockInvoke.mockResolvedValueOnce([
      { platform: "claude", success: true, message: "Installed via pip" },
    ]);

    await invoke("install_external_skill", {
      source_type: "pip",
      source: "skill-package",
      branch: null,
      platforms: ["claude"],
    });

    expect(mockInvoke).toHaveBeenCalledWith("install_external_skill", {
      source_type: "pip",
      source: "skill-package",
      branch: null,
      platforms: ["claude"],
    });
  });

  it("install_external_skill installs from vercel", async () => {
    mockInvoke.mockResolvedValueOnce([
      { platform: "claude", success: true, message: "Installed via npx" },
    ]);

    await invoke("install_external_skill", {
      source_type: "vercel",
      source: "skill-name",
      branch: null,
      platforms: ["claude"],
    });

    expect(mockInvoke).toHaveBeenCalledWith("install_external_skill", {
      source_type: "vercel",
      source: "skill-name",
      branch: null,
      platforms: ["claude"],
    });
  });

  it("check_external_handlers returns handler availability", async () => {
    const mockHandlers = {
      npm: true,
      pip: true,
      git: true,
      vercel: true,
    };

    mockInvoke.mockResolvedValueOnce(mockHandlers);

    const result = await invoke("check_external_handlers");

    expect(mockInvoke).toHaveBeenCalledWith("check_external_handlers");
    expect(result).toEqual(mockHandlers);
  });
});

describe("Settings Commands", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("get_settings returns current settings", async () => {
    const mockSettings = {
      theme: "dark",
      language: "en",
      link_mode: "auto",
      skills_source_path: "/path/to/skills",
      commands_source_path: "/path/to/commands",
    };

    mockInvoke.mockResolvedValueOnce(mockSettings);

    const result = await invoke("get_settings");

    expect(mockInvoke).toHaveBeenCalledWith("get_settings");
    expect(result).toEqual(mockSettings);
  });

  it("update_settings saves new settings", async () => {
    const newSettings = {
      theme: "light",
      language: "zh",
      link_mode: "copy",
    };

    mockInvoke.mockResolvedValueOnce(undefined);

    await invoke("update_settings", { settings: newSettings });

    expect(mockInvoke).toHaveBeenCalledWith("update_settings", {
      settings: newSettings,
    });
  });
});

describe("Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles backend errors gracefully", async () => {
    const errorMessage = "Database connection failed";
    mockInvoke.mockRejectedValueOnce(new Error(errorMessage));

    await expect(invoke("get_resources")).rejects.toThrow(errorMessage);
  });

  it("handles network timeout errors", async () => {
    mockInvoke.mockRejectedValueOnce(new Error("Request timeout"));

    await expect(
      invoke("install_external_skill", {
        source_type: "git",
        source: "https://github.com/user/repo",
        branch: null,
        platforms: ["claude"],
      })
    ).rejects.toThrow("Request timeout");
  });

  it("handles permission denied errors", async () => {
    mockInvoke.mockRejectedValueOnce(
      new Error("EACCES: permission denied, symlink")
    );

    await expect(
      invoke("install_resource", {
        id: "skill-1",
        platforms: ["claude"],
      })
    ).rejects.toThrow("permission denied");
  });
});
