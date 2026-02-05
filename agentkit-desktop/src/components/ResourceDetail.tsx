/**
 * ResourceDetail Component - Shows detailed info and actions for a resource
 */

import { useState } from "react";
import type { ResourceItem, Platform, PlatformInfo } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { PlatformSelector } from "./PlatformSelector";
import { PLATFORM_DISPLAY_NAMES } from "@/types";

interface ResourceDetailProps {
  resource: ResourceItem;
  platforms: PlatformInfo[];
  onInstall: (platforms: Platform[]) => Promise<void>;
  onUninstall: (platforms: Platform[]) => Promise<void>;
  onUpdate: () => Promise<void>;
  onClose: () => void;
}

export function ResourceDetail({
  resource,
  platforms,
  onInstall,
  onUninstall,
  onUpdate,
  onClose,
}: ResourceDetailProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);

  const typeIcon = getTypeIcon(resource.resourceType);

  const handleTogglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSelectAllDetected = () => {
    const detected = platforms.filter((p) => p.detected).map((p) => p.platform);
    setSelectedPlatforms(detected);
  };

  const handleInstall = async () => {
    if (selectedPlatforms.length === 0) return;
    setLoading(true);
    try {
      await onInstall(selectedPlatforms);
      setSelectedPlatforms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async () => {
    if (selectedPlatforms.length === 0) return;
    setLoading(true);
    try {
      await onUninstall(selectedPlatforms);
      setSelectedPlatforms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await onUpdate();
    } finally {
      setLoading(false);
    }
  };

  // Get installed platforms
  const installedPlatforms = Object.entries(resource.platformStatus)
    .filter(([_, status]) => status === "synced")
    .map(([platform]) => platform as Platform);

  return (
    <div className="h-full flex flex-col frosted-glass-heavy border-l border-white/10 shadow-2xl z-40">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl filter drop-shadow-md">{typeIcon}</span>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {resource.name}
              </h2>
              <p className="text-sm text-slate-400 capitalize font-medium">
                {resource.resourceType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Description */}
        {resource.description && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-slate-300 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/5">
              {resource.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-sm bg-white/5 text-slate-300 border border-white/10 rounded-md backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Installation Status */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Installation Status
          </h3>
          {Object.keys(resource.platformStatus).length > 0 ? (
            <div className="space-y-2 bg-white/5 p-4 rounded-lg border border-white/5">
              {Object.entries(resource.platformStatus).map(([platform, status]) => (
                <div
                  key={platform}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-slate-300 font-medium">
                    {PLATFORM_DISPLAY_NAMES[platform as Platform] || platform}
                  </span>
                  <StatusBadge status={status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Not installed on any platform
            </p>
          )}
        </div>

        {/* Platform Selection */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select Platforms
          </h3>
          <PlatformSelector
            platforms={platforms}
            selected={selectedPlatforms}
            onToggle={handleTogglePlatform}
            onSelectAll={handleSelectAllDetected}
            onClear={() => setSelectedPlatforms([])}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-md mt-auto space-y-3">
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            disabled={loading || selectedPlatforms.length === 0}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Installing..." : "Install"}
          </button>
          <button
            onClick={handleUninstall}
            disabled={loading || selectedPlatforms.length === 0}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Removing..." : "Uninstall"}
          </button>
        </div>
        {installedPlatforms.length > 0 && (
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full px-4 py-3 bg-white/5 text-slate-300 rounded-lg font-medium hover:bg-white/10 hover:text-white border border-white/5 transition-all disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update All Installed"}
          </button>
        )}
      </div>
    </div>
  );
}

function getTypeIcon(type: string): string {
  switch (type) {
    case "skill":
      return "📦";
    case "command":
      return "⚡";
    case "agent":
      return "🤖";
    default:
      return "📄";
  }
}
