# Install Dialog Redesign — Implementation Plan

::: warning Plan document
This is a design/implementation document maintained for the repository. It is not end-user documentation.
:::

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the bare `ConfirmDialog` install flow with a rich three-phase dialog (Confirm → Installing → Results) featuring a real per-item progress bar.

**Architecture:** A new standalone `InstallDialog.tsx` component encapsulates a `phase` state machine (`confirm | installing | completed`). Installation is performed by looping through selected items and calling the existing `installSkills` / `installCommands` API one item at a time, updating per-item status as each call resolves. `MainPage.tsx` swaps its `ConfirmDialog` (install branch) for `InstallDialog` and delegates the install logic into the dialog.

**Tech Stack:** React 19, TypeScript 5.8, Material-UI v7, Zustand 5, Vite (no new dependencies required)

---

## Context

### Relevant files

| File | Role |
|------|------|
| `mcs/mcs-web/ui/src/components/dialogs/InstallDialog.tsx` | **CREATE** — new three-phase dialog |
| `mcs/mcs-web/ui/src/pages/MainPage.tsx` | **MODIFY** — swap ConfirmDialog install → InstallDialog |
| `mcs/mcs-web/ui/src/api/client.ts` | Read-only reference — `installSkills`, `installCommands` |
| `mcs/mcs-web/ui/src/types/index.ts` | Read-only reference — `BatchResultDto`, `InstallResult`, `PlatformDisplay`, `ItemType` |
| `mcs/mcs-web/ui/src/theme.ts` | Read-only reference — primary `#8B5CF6`, borderRadius 12, glass-morphism |

### Key types (from `src/types/index.ts`)

```typescript
// Single install call returns this:
interface BatchResultDto {
  results: InstallResult[];   // one entry when called with [singleName]
  success_count: number;
  failure_count: number;
}

interface InstallResult {
  success: boolean;
  item_name: string;
  message: string;
  error: string | null;      // non-null on failure
}

interface PlatformDisplay { id: string; name: string; icon: string; base_dir: string; }
type ItemType = "skill" | "command";
```

### API functions (from `src/api/client.ts`)

```typescript
installSkills(platformId: string, names: string[]): Promise<BatchResultDto>
installCommands(platformId: string, names: string[]): Promise<BatchResultDto>
```

Calling these with a single-element `names` array gives per-item real-time progress.

---

## Task 1: Create `InstallDialog.tsx` — scaffold + Phase 1 (Confirm)

**Files:**
- Create: `mcs/mcs-web/ui/src/components/dialogs/InstallDialog.tsx`

**Step 1: Create the file with imports and type definitions**

```typescript
import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Typography, Box, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText,
  Chip, Collapse, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InstallDesktopIcon from "@mui/icons-material/InstallDesktop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { installSkills, installCommands } from "@/api/client";
import type { PlatformDisplay } from "@/types";

type Phase = "confirm" | "installing" | "completed";

type ItemResult = {
  name: string;
  category?: string | null;
  status: "pending" | "installing" | "success" | "error";
  errorMessage?: string;
};

interface Props {
  open: boolean;
  platformId: string;
  platform?: PlatformDisplay;
  itemNames: string[];
  itemCategories?: Record<string, string | null>;  // name -> category
  itemType: "skills" | "commands";
  onClose: () => void;
  onCompleted: (successCount: number, failureCount: number) => void;
}
```

**Step 2: Add component skeleton with Phase 1 (Confirm) view**

```typescript
export function InstallDialog({
  open,
  platformId,
  platform,
  itemNames,
  itemCategories = {},
  itemType,
  onClose,
  onCompleted,
}: Props) {
  const [phase, setPhase] = useState<Phase>("confirm");
  const [results, setResults] = useState<ItemResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  // Reset state when dialog opens
  const handleEnter = () => {
    setPhase("confirm");
    setResults(
      itemNames.map((name) => ({
        name,
        category: itemCategories[name] ?? null,
        status: "pending",
      }))
    );
    setCurrentIndex(0);
    setExpandedErrors(new Set());
  };

  const toggleError = (name: string) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const failureCount = results.filter((r) => r.status === "error").length;
  const progress = results.length > 0
    ? ((successCount + failureCount) / results.length) * 100
    : 0;

  return (
    <Dialog
      open={open}
      onClose={phase === "installing" ? undefined : onClose}  // block close during install
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      {/* Render phase-specific content */}
      {phase === "confirm" && (
        <ConfirmPhase
          platform={platform}
          results={results}
          itemType={itemType}
          onCancel={onClose}
          onInstall={handleInstall}
        />
      )}
      {phase === "installing" && (
        <InstallingPhase
          results={results}
          currentIndex={currentIndex}
          progress={progress}
          successCount={successCount}
          failureCount={failureCount}
        />
      )}
      {phase === "completed" && (
        <CompletedPhase
          results={results}
          successCount={successCount}
          failureCount={failureCount}
          progress={progress}
          expandedErrors={expandedErrors}
          onToggleError={toggleError}
          onClose={() => {
            onCompleted(successCount, failureCount);
            onClose();
          }}
        />
      )}
    </Dialog>
  );
}
```

**Step 3: Add the `handleInstall` async function (inside component, before return)**

```typescript
const handleInstall = async () => {
  setPhase("installing");
  const fn = itemType === "skills" ? installSkills : installCommands;

  for (let i = 0; i < itemNames.length; i++) {
    const name = itemNames[i];
    setCurrentIndex(i);
    setResults((prev) =>
      prev.map((r) => r.name === name ? { ...r, status: "installing" } : r)
    );

    try {
      const result = await fn(platformId, [name]);
      const itemResult = result.results[0];
      setResults((prev) =>
        prev.map((r) =>
          r.name === name
            ? {
                ...r,
                status: itemResult?.success !== false ? "success" : "error",
                errorMessage: itemResult?.error ?? undefined,
              }
            : r
        )
      );
    } catch (e) {
      setResults((prev) =>
        prev.map((r) =>
          r.name === name
            ? { ...r, status: "error", errorMessage: (e as Error).message }
            : r
        )
      );
    }
  }

  setPhase("completed");
};
```

**Step 4: Verify the file compiles (no errors yet since sub-components are missing)**

Run from the frontend directory:
```bash
cd mcs/mcs-web/ui && npx tsc --noEmit 2>&1 | head -30
```
Expected: errors about missing `ConfirmPhase`, `InstallingPhase`, `CompletedPhase` — that's fine for now.

---

## Task 2: Add `ConfirmPhase` sub-component

**Files:**
- Modify: `mcs/mcs-web/ui/src/components/dialogs/InstallDialog.tsx` (append before export)

**Step 1: Add ConfirmPhase component**

Append to the bottom of `InstallDialog.tsx` (above the last closing brace, or as a separate function):

```typescript
// ── Sub-components ────────────────────────────────────────────────────────

interface ConfirmPhaseProps {
  platform?: PlatformDisplay;
  results: ItemResult[];
  itemType: "skills" | "commands";
  onCancel: () => void;
  onInstall: () => void;
}

function ConfirmPhase({ platform, results, itemType, onCancel, onInstall }: ConfirmPhaseProps) {
  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <InstallDesktopIcon color="primary" />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          Install Items
        </Typography>
        <IconButton size="small" onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Platform badge */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Platform:</Typography>
          <Chip
            label={platform ? `${platform.icon} ${platform.name}` : "Unknown"}
            color="primary"
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Item list */}
        <List dense disablePadding sx={{ maxHeight: 240, overflow: "auto" }}>
          {results.map((item) => (
            <ListItem key={item.name} disablePadding sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <RadioButtonUncheckedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2">{item.name}</Typography>
                    {item.category && (
                      <Chip
                        label={item.category}
                        size="small"
                        variant="outlined"
                        sx={{ height: 18, fontSize: "0.65rem", borderRadius: 1 }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
        <Typography variant="caption" color="text.secondary">
          {results.length} {itemType} will be installed
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            variant="contained"
            onClick={onInstall}
            startIcon={<InstallDesktopIcon />}
          >
            Install
          </Button>
        </Box>
      </DialogActions>
    </>
  );
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd mcs/mcs-web/ui && npx tsc --noEmit 2>&1 | head -30
```
Expected: errors still for `InstallingPhase` and `CompletedPhase`.

---

## Task 3: Add `InstallingPhase` sub-component

**Files:**
- Modify: `mcs/mcs-web/ui/src/components/dialogs/InstallDialog.tsx` (append)

**Step 1: Add InstallingPhase component**

```typescript
interface InstallingPhaseProps {
  results: ItemResult[];
  currentIndex: number;
  progress: number;
  successCount: number;
  failureCount: number;
}

function InstallingPhase({ results, currentIndex, progress, successCount, failureCount }: InstallingPhaseProps) {
  const total = results.length;
  const done = successCount + failureCount;
  const currentItem = results[currentIndex];

  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CircularProgress size={20} thickness={4} />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          Installing...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {done} / {total}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Progress bar */}
        <Box sx={{ mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(139, 92, 246, 0.15)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Current item */}
        {currentItem && (
          <Typography variant="caption" color="primary" sx={{ display: "block", mb: 2 }}>
            ▶ {currentItem.name}
          </Typography>
        )}

        {/* Item status list */}
        <List dense disablePadding sx={{ maxHeight: 260, overflow: "auto" }}>
          {results.map((item) => (
            <ListItem key={item.name} disablePadding sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                {item.status === "success" && (
                  <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                )}
                {item.status === "error" && (
                  <CancelIcon sx={{ fontSize: 16, color: "error.main" }} />
                )}
                {item.status === "installing" && (
                  <CircularProgress size={14} thickness={4} />
                )}
                {item.status === "pending" && (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    color={
                      item.status === "success" ? "success.main"
                      : item.status === "error" ? "error.main"
                      : item.status === "installing" ? "primary.main"
                      : "text.secondary"
                    }
                  >
                    {item.name}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      {/* No actions — dialog cannot be dismissed during install */}
    </>
  );
}
```

**Step 2: Verify TypeScript**

```bash
cd mcs/mcs-web/ui && npx tsc --noEmit 2>&1 | head -30
```
Expected: only `CompletedPhase` error remaining.

---

## Task 4: Add `CompletedPhase` sub-component

**Files:**
- Modify: `mcs/mcs-web/ui/src/components/dialogs/InstallDialog.tsx` (append)

**Step 1: Add CompletedPhase component**

```typescript
interface CompletedPhaseProps {
  results: ItemResult[];
  successCount: number;
  failureCount: number;
  progress: number;
  expandedErrors: Set<string>;
  onToggleError: (name: string) => void;
  onClose: () => void;
}

function CompletedPhase({
  results, successCount, failureCount, progress,
  expandedErrors, onToggleError, onClose,
}: CompletedPhaseProps) {
  const hasErrors = failureCount > 0;

  return (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {hasErrors
          ? <WarningAmberIcon color="warning" />
          : <CheckCircleOutlineIcon color="success" />
        }
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          {hasErrors ? "Completed with errors" : "Installation Complete"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Final progress bar */}
        <Box sx={{ mb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={100}
            color={hasErrors ? "warning" : "success"}
            sx={{
              height: 8,
              borderRadius: 4,
              "& .MuiLinearProgress-bar": { borderRadius: 4 },
            }}
          />
        </Box>

        {/* Summary chips */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={`${successCount} installed`}
            color="success"
            size="small"
            variant="outlined"
          />
          {hasErrors && (
            <Chip
              icon={<CancelIcon />}
              label={`${failureCount} failed`}
              color="error"
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Result list */}
        <List dense disablePadding sx={{ maxHeight: 260, overflow: "auto" }}>
          {results.map((item) => (
            <Box key={item.name}>
              <ListItem
                disablePadding
                sx={{ py: 0.25, cursor: item.status === "error" ? "pointer" : "default" }}
                onClick={() => item.status === "error" && onToggleError(item.name)}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {item.status === "success"
                    ? <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                    : <CancelIcon sx={{ fontSize: 16, color: "error.main" }} />
                  }
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      color={item.status === "success" ? "success.main" : "error.main"}
                    >
                      {item.name}
                    </Typography>
                  }
                />
                {item.status === "error" && (
                  expandedErrors.has(item.name)
                    ? <ExpandLessIcon fontSize="small" color="action" />
                    : <ExpandMoreIcon fontSize="small" color="action" />
                )}
              </ListItem>

              {/* Expandable error message */}
              {item.status === "error" && item.errorMessage && (
                <Collapse in={expandedErrors.has(item.name)}>
                  <Box
                    sx={{
                      ml: 4, mb: 1, p: 1,
                      borderRadius: 1,
                      backgroundColor: "error.main",
                      opacity: 0.12,
                    }}
                  >
                    <Typography variant="caption" color="error.main" sx={{ opacity: 1 }}>
                      {item.errorMessage}
                    </Typography>
                  </Box>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );
}
```

**Step 2: Verify entire file compiles clean**

```bash
cd mcs/mcs-web/ui && npx tsc --noEmit 2>&1
```
Expected: **zero errors**.

---

## Task 5: Update `MainPage.tsx` to use `InstallDialog`

**Files:**
- Modify: `mcs/mcs-web/ui/src/pages/MainPage.tsx`

**Step 1: Add import for InstallDialog, remove ConfirmDialog import if only used for install**

In `MainPage.tsx`, line 51:
```typescript
// BEFORE (keep ConfirmDialog — still used for Uninstall):
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

// ADD below line 53:
import { InstallDialog } from "@/components/dialogs/InstallDialog";
```

**Step 2: Remove `handleInstall` from MainPage (its logic moves into InstallDialog)**

Remove the entire `handleInstall` function (lines 123–140 in original):
```typescript
// DELETE this block:
const handleInstall = async () => {
  if (!platformId || selectedNames.size === 0) return;
  setConfirmAction(null);
  ...
};
```

**Step 3: Change `confirmAction` state — keep only for uninstall**

Change the type annotation:
```typescript
// BEFORE:
const [confirmAction, setConfirmAction] = useState<"install" | "uninstall" | null>(null);

// AFTER:
const [confirmAction, setConfirmAction] = useState<"uninstall" | null>(null);
```

**Step 4: Add `installOpen` state**

After the `confirmAction` state line, add:
```typescript
const [installOpen, setInstallOpen] = useState(false);
```

**Step 5: Change Install button handler**

In the toolbar section (around line 309):
```typescript
// BEFORE:
onClick={() => setConfirmAction("install")}

// AFTER:
onClick={() => setInstallOpen(true)}
```

**Step 6: Replace install ConfirmDialog with InstallDialog**

Find and replace the install `ConfirmDialog` block (around lines 452–460):
```typescript
// REMOVE:
<ConfirmDialog
  open={confirmAction === "install"}
  title="Install Items"
  message={`Install ${selectedNames.size} ${activeTab} to ${platform?.name ?? platformId}?`}
  confirmLabel="Install"
  onConfirm={handleInstall}
  onCancel={() => setConfirmAction(null)}
/>

// ADD (after the Uninstall ConfirmDialog or wherever appropriate):
{platformId && (
  <InstallDialog
    open={installOpen}
    platformId={platformId}
    platform={platform}
    itemNames={Array.from(selectedNames)}
    itemCategories={Object.fromEntries(
      items
        .filter((item) => selectedNames.has(item.name))
        .map((item) => [item.name, item.category])
    )}
    itemType={activeTab}
    onClose={() => setInstallOpen(false)}
    onCompleted={(successCount, failureCount) => {
      showNotification(
        `Installed ${successCount} items${failureCount > 0 ? `, ${failureCount} failed` : ""}`,
        failureCount > 0 ? "warning" : "success"
      );
      clearSelection();
      refresh(platformId);
    }}
  />
)}
```

**Step 7: Verify full TypeScript compilation**

```bash
cd mcs/mcs-web/ui && npx tsc --noEmit 2>&1
```
Expected: **zero errors**.

---

## Task 6: Manual visual verification

**Step 1: Start dev server**

```bash
cd mcs/mcs-web && cargo run &
cd mcs/mcs-web/ui && npm run dev
```

**Step 2: Verify Phase 1 — Confirm**

1. Open browser at `http://localhost:5173`
2. Navigate to any platform
3. Select 2–3 skills with checkboxes
4. Click **Install** button in toolbar
5. ✅ Dialog opens showing item list with platform badge
6. ✅ Cancel button closes dialog without installing

**Step 3: Verify Phase 2 — Installing**

1. Select skills and open Install dialog
2. Click **Install**
3. ✅ Dialog title shows "Installing..." with spinner
4. ✅ Progress bar fills incrementally
5. ✅ Current item name updates
6. ✅ Completed items show green ✓
7. ✅ Dialog cannot be closed by clicking backdrop

**Step 4: Verify Phase 3 — Completed**

1. Let installation finish
2. ✅ Header shows "Installation Complete" (or "Completed with errors")
3. ✅ Progress bar is 100% green (or orange if errors)
4. ✅ Summary chips visible
5. ✅ All items show final ✓/✗ status
6. ✅ Failed items show expand arrow; click reveals error message
7. ✅ Close button triggers page refresh and notification snackbar

**Step 5: Verify Uninstall unchanged**

1. Select skills → click **Uninstall**
2. ✅ Original simple ConfirmDialog still appears (no regression)

---

## Summary of File Changes

```
mcs/mcs-web/ui/src/
├── components/dialogs/
│   └── InstallDialog.tsx          ← CREATE (Tasks 1–4)
└── pages/
    └── MainPage.tsx               ← MODIFY (Task 5)
        - Remove handleInstall()
        - Remove install ConfirmDialog
        - Add installOpen state
        - Add <InstallDialog> component
```

No backend changes. No new npm dependencies.
