import { useCallback, useEffect, useMemo, useState } from "react";
import {
  resolveInstallTarget,
} from "@/api/client";
import { useI18n } from "@/i18n";
import { useUiStore } from "@/stores/uiStore";
import type { InstallTarget, ResolvedInstallTarget } from "@/types";

const INSTALL_TARGET_STORAGE_KEY = "mcs-install-target-by-platform";
const INSTALL_TARGET_RECENT_STORAGE_KEY = "mcs-install-target-recents-by-platform";
const INSTALL_TARGET_RESOLVED_STORAGE_KEY = "mcs-install-target-resolved-by-platform";
const MAX_RECENT_PROJECTS = 8;

type InstallTargetMap = Record<string, InstallTarget>;
type RecentProjectMap = Record<string, string[]>;
type ResolvedTargetMap = Record<string, ResolvedInstallTarget>;

const GLOBAL_INSTALL_TARGET: InstallTarget = { scope: "global" };

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeInstallTarget(target: InstallTarget): InstallTarget {
  if (target.scope === "project") {
    return {
      scope: "project",
      project_path: target.project_path?.trim() ?? "",
    };
  }
  return { scope: "global" };
}

function loadStoredTarget(platformId: string): InstallTarget {
  const all = readJson<InstallTargetMap>(INSTALL_TARGET_STORAGE_KEY, {});
  const stored = all[platformId];
  if (!stored) {
    return GLOBAL_INSTALL_TARGET;
  }
  return normalizeInstallTarget(stored);
}

function saveStoredTarget(platformId: string, target: InstallTarget) {
  const all = readJson<InstallTargetMap>(INSTALL_TARGET_STORAGE_KEY, {});
  all[platformId] = normalizeInstallTarget(target);
  writeJson(INSTALL_TARGET_STORAGE_KEY, all);
}

function loadStoredResolvedTarget(platformId: string): ResolvedInstallTarget | null {
  const all = readJson<ResolvedTargetMap>(INSTALL_TARGET_RESOLVED_STORAGE_KEY, {});
  return all[platformId] ?? null;
}

function saveStoredResolvedTarget(
  platformId: string,
  resolvedTarget: ResolvedInstallTarget
) {
  const all = readJson<ResolvedTargetMap>(INSTALL_TARGET_RESOLVED_STORAGE_KEY, {});
  all[platformId] = resolvedTarget;
  writeJson(INSTALL_TARGET_RESOLVED_STORAGE_KEY, all);
}

function loadRecentProjects(platformId: string): string[] {
  const all = readJson<RecentProjectMap>(INSTALL_TARGET_RECENT_STORAGE_KEY, {});
  return all[platformId] ?? [];
}

function saveRecentProjects(platformId: string, projects: string[]) {
  const all = readJson<RecentProjectMap>(INSTALL_TARGET_RECENT_STORAGE_KEY, {});
  all[platformId] = projects.slice(0, MAX_RECENT_PROJECTS);
  writeJson(INSTALL_TARGET_RECENT_STORAGE_KEY, all);
}

function addRecentProject(platformId: string, projectPath: string): string[] {
  const normalized = projectPath.trim();
  if (!normalized) {
    return loadRecentProjects(platformId);
  }
  const merged = [
    normalized,
    ...loadRecentProjects(platformId).filter((item) => item !== normalized),
  ].slice(0, MAX_RECENT_PROJECTS);
  saveRecentProjects(platformId, merged);
  return merged;
}

interface UseInstallTargetResult {
  loading: boolean;
  dialogOpen: boolean;
  target: InstallTarget;
  resolvedTarget: ResolvedInstallTarget | null;
  recentProjects: string[];
  openDialog: () => void;
  closeDialog: () => void;
  applyTarget: (target: InstallTarget) => Promise<boolean>;
}

export function useInstallTarget(platformId?: string): UseInstallTargetResult {
  const { t } = useI18n();
  const showNotification = useUiStore((s) => s.showNotification);

  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [target, setTarget] = useState<InstallTarget>(GLOBAL_INSTALL_TARGET);
  const [resolvedTarget, setResolvedTarget] = useState<ResolvedInstallTarget | null>(null);
  const [recentProjects, setRecentProjects] = useState<string[]>([]);

  const applyTarget = useCallback(
    async (nextTarget: InstallTarget): Promise<boolean> => {
      if (!platformId) {
        return false;
      }
      const normalized = normalizeInstallTarget(nextTarget);
      if (normalized.scope === "project" && !normalized.project_path) {
        showNotification(t("dialogs.projectPathRequired"), "error");
        return false;
      }

      setLoading(true);
      try {
        const resolved = await resolveInstallTarget(
          platformId,
          normalized,
        );
        setTarget(normalized);
        setResolvedTarget(resolved);
        saveStoredTarget(platformId, normalized);
        saveStoredResolvedTarget(platformId, resolved);
        if (normalized.scope === "project" && normalized.project_path) {
          setRecentProjects(addRecentProject(platformId, normalized.project_path));
        }
        return true;
      } catch (e) {
        showNotification((e as Error).message, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [platformId, showNotification, t]
  );

  useEffect(() => {
    if (!platformId) {
      setTarget(GLOBAL_INSTALL_TARGET);
      setResolvedTarget(null);
      setRecentProjects([]);
      setLoading(false);
      return;
    }

    const stored = loadStoredTarget(platformId);
    setTarget(stored);
    setResolvedTarget(loadStoredResolvedTarget(platformId));
    setRecentProjects(loadRecentProjects(platformId));

    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const resolved = await resolveInstallTarget(
          platformId,
          stored,
          controller.signal
        );
        if (cancelled) {
          return;
        }
        setResolvedTarget(resolved);
        saveStoredResolvedTarget(platformId, resolved);
      } catch (e) {
        if (cancelled) {
          return;
        }
        if (stored.scope === "project") {
          try {
            const fallback = await resolveInstallTarget(
              platformId,
              GLOBAL_INSTALL_TARGET,
              controller.signal
            );
            if (cancelled) {
              return;
            }
            setTarget(GLOBAL_INSTALL_TARGET);
            setResolvedTarget(fallback);
            saveStoredTarget(platformId, GLOBAL_INSTALL_TARGET);
            saveStoredResolvedTarget(platformId, fallback);
            showNotification(t("installed.installTargetFallbackWarning"), "warning");
          } catch {
            setResolvedTarget(null);
          }
        } else {
          setResolvedTarget(null);
          showNotification((e as Error).message, "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [platformId, showNotification, t]);

  const value = useMemo<UseInstallTargetResult>(
    () => ({
      loading,
      dialogOpen,
      target,
      resolvedTarget,
      recentProjects,
      openDialog: () => setDialogOpen(true),
      closeDialog: () => setDialogOpen(false),
      applyTarget,
    }),
    [applyTarget, dialogOpen, loading, recentProjects, resolvedTarget, target]
  );

  return value;
}
