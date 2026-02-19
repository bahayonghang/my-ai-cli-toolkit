/**
 * useBatchOperations - Parallel batch install/uninstall with Promise.allSettled
 */

import { useState, useCallback } from "react";
import type { Platform } from "@/types";

interface UseBatchOperationsProps {
  installResource: (id: string, platforms: Platform[]) => Promise<unknown>;
  uninstallResource: (id: string, platforms: Platform[]) => Promise<unknown>;
  onSuccess?: (title: string, message: string) => void;
  onError?: (title: string, message: string) => void;
}

export function useBatchOperations({
  installResource, uninstallResource, onSuccess, onError,
}: UseBatchOperationsProps) {
  const [batchMode, setBatchMode] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    action: "install" | "uninstall";
    platforms: Platform[];
  } | null>(null);

  const toggleCheck = useCallback((id: string, checked: boolean) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => setCheckedIds(new Set(ids)), []);
  const deselectAll = useCallback(() => setCheckedIds(new Set()), []);

  const exitBatchMode = useCallback(() => {
    setBatchMode(false);
    setCheckedIds(new Set());
  }, []);

  const batchInstall = useCallback(async (platforms: Platform[]) => {
    if (checkedIds.size === 0 || platforms.length === 0) return;

    const results = await Promise.allSettled(
      Array.from(checkedIds).map(id => installResource(id, platforms))
    );
    const ok = results.filter(r => r.status === "fulfilled").length;
    const fail = results.filter(r => r.status === "rejected").length;

    if (ok > 0) onSuccess?.("Batch Install Complete", `Installed ${ok} resource(s)`);
    if (fail > 0) onError?.("Some Installations Failed", `${fail} resource(s) failed to install`);
    exitBatchMode();
  }, [checkedIds, installResource, onSuccess, onError, exitBatchMode]);

  const batchUninstall = useCallback(async (platforms: Platform[]) => {
    if (checkedIds.size === 0 || platforms.length === 0) return;

    const results = await Promise.allSettled(
      Array.from(checkedIds).map(id => uninstallResource(id, platforms))
    );
    const ok = results.filter(r => r.status === "fulfilled").length;
    const fail = results.filter(r => r.status === "rejected").length;

    if (ok > 0) onSuccess?.("Batch Uninstall Complete", `Uninstalled ${ok} resource(s)`);
    if (fail > 0) onError?.("Some Uninstalls Failed", `${fail} resource(s) failed to uninstall`);
    exitBatchMode();
  }, [checkedIds, uninstallResource, onSuccess, onError, exitBatchMode]);

  const requestBatchInstall = useCallback((platforms: Platform[]) => {
    if (checkedIds.size === 0 || platforms.length === 0) return;
    setConfirmDialog({ action: "install", platforms });
  }, [checkedIds]);

  const requestBatchUninstall = useCallback((platforms: Platform[]) => {
    if (checkedIds.size === 0 || platforms.length === 0) return;
    setConfirmDialog({ action: "uninstall", platforms });
  }, [checkedIds]);

  const confirmBatchAction = useCallback(async () => {
    if (!confirmDialog) return;
    if (confirmDialog.action === "install") {
      await batchInstall(confirmDialog.platforms);
    } else {
      await batchUninstall(confirmDialog.platforms);
    }
    setConfirmDialog(null);
  }, [confirmDialog, batchInstall, batchUninstall]);

  const cancelBatchAction = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  return {
    batchMode, setBatchMode, checkedIds,
    toggleCheck, selectAll, deselectAll, exitBatchMode,
    batchInstall, batchUninstall,
    requestBatchInstall, requestBatchUninstall,
    confirmDialog, confirmBatchAction, cancelBatchAction,
  };
}
