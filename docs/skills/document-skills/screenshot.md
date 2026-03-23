# Screenshot

Cross-platform screenshot capture skill for desktop or system-level screenshots when tool-specific capture is unavailable or not appropriate.

## When to use it

- user explicitly asks for a desktop or system screenshot
- a full-screen, app window, active window, or pixel-region capture is needed
- browser- or app-specific capture tools are unavailable, insufficient, or not the right fit

## Workflow

1. decide the save location from the user's request or the default rules
2. prefer tool-specific capture features when they can access the target directly
3. otherwise run the bundled platform-specific screenshot helper
4. capture the full screen, app window, active window, or region as requested
5. return the saved path and inspect the image when needed

## Main assets

- `scripts/take_screenshot.py` for macOS and Linux
- `scripts/take_screenshot.ps1` for Windows
- `scripts/ensure_macos_permissions.sh` for macOS screen-recording preflight

## Notes

- On macOS, the skill includes permission preflight guidance to reduce repeated prompts.
- On Linux and Windows, capture behavior depends on the available OS tools.
- If the user provides a path, the screenshot should be saved there; otherwise the skill uses the default screenshot location or temp output for inspection runs.
