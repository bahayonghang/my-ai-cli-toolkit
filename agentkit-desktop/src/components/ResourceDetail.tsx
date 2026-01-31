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
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{typeIcon}</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {resource.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {resource.resourceType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {resource.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {resource.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Installation Status */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Installation Status
          </h3>
          {Object.keys(resource.platformStatus).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(resource.platformStatus).map(([platform, status]) => (
                <div
                  key={platform}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-gray-600 dark:text-gray-400">
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
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
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
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
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
