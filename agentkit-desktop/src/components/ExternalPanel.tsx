/**
 * ExternalPanel Component - Install skills from external sources
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [activeSource, setActiveSource] = useState<SourceType>("npm");
  const [inputValue, setInputValue] = useState("");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [handlers, setHandlers] = useState<Record<string, boolean>>({});

  const { platforms } = usePlatformStore();
  const detectedPlatforms = platforms.filter((p) => p.detected);

  // Local form state: which detected platforms the user wants to install TO.
  // Intentionally NOT in the platform store — this is ephemeral form selection,
  // not global platform detection state.
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
      setError(t('external.enterPackage'));
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError(t('external.selectPlatform'));
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
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          {t('external.title')}
        </h3>
        <p className="text-sm text-slate-400">
          {t('external.subtitle')}
        </p>
      </div>

      {/* Source Type Selector */}
      <div className="flex flex-wrap gap-3">
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
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSource === config.type
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20 scale-105"
                  : !isAvailable
                    ? "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
                    : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
                }`}
              title={!isAvailable ? `${config.type} is not available (not installed)` : undefined}
            >
              <span className="text-lg">{config.icon}</span>
              <span>{config.label}</span>
              {!isAvailable && <span className="text-xs opacity-50">⚠️</span>}
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <div className="space-y-5 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
        <div>
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
            {activeConfig.label}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={activeConfig.placeholder}
            className="w-full px-5 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          <p className="mt-2 text-xs text-slate-500">
            {activeConfig.example}
          </p>
        </div>

        {/* Git branch input */}
        {activeSource === "git" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('external.branch')}
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
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider">
              {t('external.targetPlatforms')}
            </label>
            <button
              onClick={handleSelectAllDetected}
              className="text-xs text-primary-400 hover:text-primary-300 hover:underline transition-colors"
            >
              {t('external.selectAllDetected')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {detectedPlatforms.length > 0 ? (
              detectedPlatforms.map((p) => (
                <button
                  key={p.platform}
                  onClick={() => handleTogglePlatform(p.platform)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedPlatforms.includes(p.platform)
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-slate-200"
                    }`}
                >
                  {selectedPlatforms.includes(p.platform) && (
                    <span className="mr-1">✓</span>
                  )}
                  {p.platform}
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                {t('external.noPlatforms')}
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
            <span>{t('action.installing')}</span>
          </>
        ) : (
          <>
            <span>📥</span>
            <span>{t('external.installSkill')}</span>
          </>
        )}
      </button>

      {/* Info Section */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
          💡 {t('external.tips')}
        </h4>
        <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>{t('external.tipNpm')}</li>
          <li>{t('external.tipGit')}</li>
          <li>{t('external.tipVercel')}</li>
          <li>{t('external.tipPip')}</li>
        </ul>
      </div>
    </div>
  );
}
