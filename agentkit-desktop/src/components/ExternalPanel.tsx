/**
 * ExternalPanel Component - Install skills from external sources
 */

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Platform, SyncResult } from "@/types";
import { usePlatformStore } from "@/stores";

type SourceType = "npm" | "pip" | "git" | "vercel";

interface SourceConfig {
  type: SourceType;
  icon: string;
  label: string;
  placeholder: string;
  example: string;
}

const SOURCE_CONFIGS: SourceConfig[] = [
  {
    type: "npm",
    icon: "📦",
    label: "npm Package",
    placeholder: "package-name or @scope/package",
    example: "e.g., @anthropic/claude-skills",
  },
  {
    type: "pip",
    icon: "🐍",
    label: "pip Package",
    placeholder: "package-name",
    example: "e.g., claude-code-skills",
  },
  {
    type: "git",
    icon: "🔗",
    label: "Git Repository",
    placeholder: "https://github.com/user/repo.git",
    example: "e.g., https://github.com/anthropics/skills.git",
  },
  {
    type: "vercel",
    icon: "▲",
    label: "Vercel Registry",
    placeholder: "skill-name",
    example: "e.g., code-review",
  },
];

export function ExternalPanel() {
  const [activeSource, setActiveSource] = useState<SourceType>("npm");
  const [inputValue, setInputValue] = useState("");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [handlers, setHandlers] = useState<Record<string, boolean>>({});

  const { platforms } = usePlatformStore();
  const detectedPlatforms = platforms.filter((p) => p.detected);

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);

  const activeConfig = SOURCE_CONFIGS.find((c) => c.type === activeSource)!;

  // Check available handlers on mount
  useEffect(() => {
    invoke<[string, boolean][]>("check_external_handlers")
      .then((result) => {
        const handlerMap: Record<string, boolean> = {};
        result.forEach(([name, available]) => {
          handlerMap[name] = available;
        });
        setHandlers(handlerMap);
      })
      .catch(console.error);
  }, []);

  const handleTogglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSelectAllDetected = () => {
    setSelectedPlatforms(detectedPlatforms.map((p) => p.platform));
  };

  const handleInstall = async () => {
    if (!inputValue.trim()) {
      setError("Please enter a package/repository name");
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const results = await invoke<SyncResult[]>("install_external_skill", {
        sourceType: activeSource,
        source: inputValue,
        branch: activeSource === "git" ? branch : null,
        platforms: selectedPlatforms,
      });

      const successCount = results.filter((r) => r.success).length;
      const failedResults = results.filter((r) => !r.success);

      if (successCount > 0) {
        setSuccess(
          `Successfully installed "${inputValue}" to ${successCount} platform(s)`
        );
        setInputValue("");
      }

      if (failedResults.length > 0) {
        const errors = failedResults
          .map((r) => `${r.platform}: ${r.error}`)
          .join("; ");
        if (successCount === 0) {
          setError(`Installation failed: ${errors}`);
        } else {
          setError(`Some platforms failed: ${errors}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Install External Skills
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Install skills from npm, pip, git repositories, or the Vercel skill
          registry.
        </p>
      </div>

      {/* Source Type Selector */}
      <div className="flex flex-wrap gap-2">
        {SOURCE_CONFIGS.map((config) => {
          const isAvailable = handlers[config.type] !== false;
          return (
            <button
              key={config.type}
              onClick={() => {
                setActiveSource(config.type);
                setInputValue("");
                setError(null);
                setSuccess(null);
              }}
              disabled={!isAvailable}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeSource === config.type
                  ? "bg-primary-500 text-white"
                  : !isAvailable
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              title={!isAvailable ? `${config.type} is not available (not installed)` : undefined}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              {!isAvailable && <span className="text-xs">⚠️</span>}
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {activeConfig.label}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={activeConfig.placeholder}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {activeConfig.example}
          </p>
        </div>

        {/* Git branch input */}
        {activeSource === "git" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {/* Platform Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Platforms
            </label>
            <button
              onClick={handleSelectAllDetected}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Select all detected
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {detectedPlatforms.length > 0 ? (
              detectedPlatforms.map((p) => (
                <button
                  key={p.platform}
                  onClick={() => handleTogglePlatform(p.platform)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedPlatforms.includes(p.platform)
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {selectedPlatforms.includes(p.platform) && (
                    <span className="mr-1">✓</span>
                  )}
                  {p.platform}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No platforms detected. Please check your installation.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Install Button */}
      <button
        onClick={handleInstall}
        disabled={loading || !inputValue.trim() || selectedPlatforms.length === 0}
        className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Installing...</span>
          </>
        ) : (
          <>
            <span>📥</span>
            <span>Install Skill</span>
          </>
        )}
      </button>

      {/* Info Section */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
          💡 Tips
        </h4>
        <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>npm packages should export a SKILL.md file</li>
          <li>Git repos should have skills in the root or skills/ directory</li>
          <li>Vercel registry skills are curated and verified</li>
          <li>pip packages follow the same structure as npm</li>
        </ul>
      </div>
    </div>
  );
}
