# MCS TUI Guide

The project now uses the Rust-based **MCS** TUI (`mcs/`) as the primary interactive installer.

## Quick Start

```bash
just mcs
```

Legacy command compatibility:

```bash
uv run python src/install_tui.py
```

`install_tui.py` now only forwards to MCS and is kept for migration compatibility.

## Screens

## 1. Platform Select

- `↑/↓`, `j/k`: move
- `Enter`: open selected platform
- `d`: open dashboard
- `q` or `Esc`: quit

## 2. Main Screen

- Sidebar + item list two-column layout
- Skills / Commands toggle in sidebar (`1` / `2`)
- Category filter, status filter, search, batch actions

### Main Keybindings

- `Tab`: switch focus between sidebar and item list
- `↑/↓`, `j/k`: navigate
- `Space`: toggle item selection
- `a`: select all / clear all (current filtered list)
- `i`: install selected items
- `Enter`: install focused item
- `u`: uninstall focused item
- `x`: batch uninstall selected items
- `U`: update all outdated items in current tab
- `d`: open detail popup
- `D`: open diff popup
- `/`: search
- `s`: cycle status filter (`All -> Installed -> Outdated -> Not Installed -> All`)
- `p`: prompt diff/update (Claude only)
- `P`: platform config popup
- `S`: multi-platform sync popup
- `Esc`: back to platform select
- `q`: quit

## 3. Dashboard

- `Esc`: back to platform select
- `q`: quit

## Popups

- Detail / Diff / Prompt popups support:
  - `j/k` or `↑/↓`: scroll
  - `PgUp/PgDn`: page scroll
  - `Esc`: close
- Multi-sync popup:
  - `↑/↓`: choose platform
  - `Space`: toggle platform selection
  - `Enter`: execute sync
  - `Esc`: cancel

## Behavior Notes

- Outdated detection for skills is directory-aware (recursive file signature + mtime check), not just directory mtime.
- Batch install/uninstall/multi-sync runs through a queued action pipeline with progress and notifications.
- Footer help and status messages are context-aware.

## UI Style System

- MCS uses a semantic style layer (`StyleRole`) instead of scattered hard-coded colors.
- The default and only built-in theme is Catppuccin Mocha, with extension hooks kept in `mcs/src/tui/theme.rs`.
- UI density is fixed to `Balanced` for now via `UiDensity`, and all key layout sizes come from `LayoutMetrics`.
- Status information is always dual-channel (symbol/text + color), not color-only.

### Semantic Roles

- `ScreenBg`, `PanelBg`, `PanelBorder`, `PanelBorderFocus`
- `TextPrimary`, `TextMuted`, `TextOnAccent`, `BadgeAccent`
- `StatusSuccess`, `StatusWarning`, `StatusError`, `SelectionBg`
- `HintKey`, `HintText`, `NotificationInfo`, `NotificationSuccess`, `NotificationWarning`, `NotificationError`

### ASCII Fallback

- Set `MCS_ASCII=1` to force ASCII icon rendering for terminals with poor Unicode width support.
- Example:

```bash
MCS_ASCII=1 just mcs
```

### Terminal Size

- Minimum supported terminal size: `80x24`
- Recommended terminal size: `100x30` or larger

## Troubleshooting

### `just mcs` fails with `cargo not found`

Install Rust toolchain first:

```bash
rustup --version
```

### Force clean rebuild

```bash
just mcs-rebuild
```
