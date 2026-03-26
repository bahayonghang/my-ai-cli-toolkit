# Install Dialog Redesign — Design Document

::: warning Plan document
This is a design/implementation document maintained for the repository. It is not end-user documentation.
:::

**Date:** 2026-02-22
**Status:** Approved
**Scope:** `mcs/mcs-web/ui/src/`

---

## Problem Statement

The current "Install Items" flow uses a generic `ConfirmDialog` — just a title, a message string, and two buttons. There is no progress feedback during installation and no per-item result visibility. Users must wait blindly until a snackbar appears.

---

## Goals

1. Replace the bare confirmation dialog with a rich, three-phase install experience.
2. Show real per-item progress (not simulated) via sequential single-item API calls.
3. Display per-item success/failure results after completion.
4. Match the existing glass-morphism + violet theme.

---

## Non-Goals

- Backend changes (no new endpoints, no SSE/WebSocket).
- Uninstall dialog redesign (out of scope for now).
- MultiSyncDialog changes.

---

## Design: Three-Phase State Machine

```
idle ──[open]──▶ confirm ──[click Install]──▶ installing ──[all done]──▶ completed
                    │                               │
                 [Cancel]                    (not closeable)
                    │
                 onCancel()
```

### Phase 1 — Confirm

- Dialog: `maxWidth="sm"`, `fullWidth`
- Header: `InstallDesktopIcon` + `"Install Items"` title + `×` close button
- Platform badge: platform icon + name as `Chip` (primary color)
- Scrollable item list: `max-height: 240px`, each row = skill name + category chip
- Footer: `"{N} items will be installed"` + `[Cancel]` + `[Install →]` buttons

```
┌─────────────────────────────────────────┐
│ 📦 Install Items                      ✕ │
│ ─────────────────────────────────────── │
│ Platform: [🤖 Claude]                   │
│                                         │
│  • react-expert          [development]  │
│  • vue-expert            [development]  │
│  • frontend-engineer     [development]  │
│  • typescript-pro        [development]  │
│  • rust-engineer         [development]  │
│                                         │
│ 5 items will be installed               │
│ ─────────────────────────────────────── │
│                 [Cancel]  [Install →]   │
└─────────────────────────────────────────┘
```

### Phase 2 — Installing

- Header: `"Installing..."` + small spinning `CircularProgress` — **no close button**
- `LinearProgress` (rounded, primary color) showing `(completedCount / total) * 100`
- Progress label: `"X / Y"` counter
- Current item name displayed below the bar
- Live item list with status icons:
  - `○` Pending — `RadioButtonUnchecked` (grey)
  - `⟳` Installing — `CircularProgress` 16px indeterminate
  - `✓` Success — `CheckCircle` (green)
  - `✗` Error — `Cancel` (red)

```
┌─────────────────────────────────────────┐
│ ⟳ Installing...            3 / 5        │
│ ─────────────────────────────────────── │
│ ████████████████░░░░░░  60%             │
│ ▶ frontend-engineer                     │
│ ─────────────────────────────────────── │
│ ✓ react-expert                          │
│ ✓ vue-expert                            │
│ ⟳ frontend-engineer                     │
│ ○ typescript-pro                        │
│ ○ rust-engineer                         │
└─────────────────────────────────────────┘
```

### Phase 3 — Completed

- Header: `"✅ Installation Complete"` (all success) or `"⚠️ Completed with errors"` (partial failure)
- Progress bar at 100%: green (success) or orange (`warning` color) if failures
- Summary chips: `"✓ N installed"` + `"✗ M failed"` (failure chip only shown when M > 0)
- Failed items are expandable (MUI `Collapse`) to show error message
- Footer: `[Close]` button (right-aligned)

```
┌─────────────────────────────────────────┐
│ ✅ Installation Complete                 │
│ ─────────────────────────────────────── │
│ ████████████████████████  100%          │
│ [✓ 4 installed]  [✗ 1 failed]          │
│ ─────────────────────────────────────── │
│ ✓ react-expert                          │
│ ✓ vue-expert                            │
│ ✓ frontend-engineer                     │
│ ✓ typescript-pro                        │
│ ✗ rust-engineer  ▼ (expand error)       │
│                                         │
│                             [Close]     │
└─────────────────────────────────────────┘
```

---

## Technical Specification

### New Component: `InstallDialog.tsx`

```typescript
type Phase = "confirm" | "installing" | "completed";

type ItemResult = {
  name: string;
  category?: string;
  status: "pending" | "installing" | "success" | "error";
  message?: string;
};

interface Props {
  open: boolean;
  platformId: string;
  platform?: PlatformDisplay;
  itemNames: string[];
  itemType: "skills" | "commands";
  onClose: () => void;
  onCompleted: (successCount: number, failureCount: number) => void;
}
```

### Install Logic (per-item sequential)

```typescript
const handleInstall = async () => {
  setPhase("installing");
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < names.length; i++) {
    // Mark current as "installing"
    setResults(prev =>
      prev.map(r => r.name === names[i] ? { ...r, status: "installing" } : r)
    );
    setCurrentIndex(i);

    try {
      const fn = itemType === "skills" ? installSkills : installCommands;
      await fn(platformId, [names[i]]);
      successCount++;
      setResults(prev =>
        prev.map(r => r.name === names[i] ? { ...r, status: "success" } : r)
      );
    } catch (e) {
      failureCount++;
      setResults(prev =>
        prev.map(r =>
          r.name === names[i]
            ? { ...r, status: "error", message: (e as Error).message }
            : r
        )
      );
    }
  }

  setPhase("completed");
  onCompleted(successCount, failureCount);
};
```

### LinearProgress Styling

```typescript
<LinearProgress
  variant="determinate"
  value={progress}
  sx={{
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    "& .MuiLinearProgress-bar": {
      borderRadius: 4,
      backgroundColor: hasErrors ? "warning.main" : "primary.main",
    },
  }}
/>
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/dialogs/InstallDialog.tsx` | **NEW** — three-phase install dialog |
| `src/pages/MainPage.tsx` | Replace `ConfirmDialog` (install) with `InstallDialog`; move `handleInstall` logic into dialog |

### MainPage.tsx Changes

- Remove: `confirmAction === "install"` branch from `ConfirmDialog`
- Remove: `handleInstall` async function
- Add: `<InstallDialog>` with `onCompleted` callback that calls `showNotification` + `clearSelection` + `refresh`
- Keep: `ConfirmDialog` for **uninstall** (unchanged)

---

## Success Criteria

1. Clicking "Install" opens the new dialog showing item list and platform.
2. Clicking "Install →" begins sequential per-item installation.
3. Progress bar updates in real time as each item completes.
4. Current installing item is visually highlighted.
5. Completed items show green ✓ / red ✗ icons.
6. After all items finish, results phase is shown with summary.
7. Failed items can be expanded to show error message.
8. Closing the dialog (from results) triggers page refresh.
9. Dialog cannot be closed during installation phase.
10. Uninstall flow is unchanged.
