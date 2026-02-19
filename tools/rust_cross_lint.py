#!/usr/bin/env python3
"""Cross-platform Rust lint checker.

Detects ungated `use` statements for platform-sensitive crates where all usages
are inside #[cfg] blocks. cargo clippy only checks the current platform's #[cfg]
paths, so this catches 'unused import' errors that would appear on other platforms.
"""

import io
import re
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")


def _build_cfg_scope_map(lines: list[str]) -> list[bool]:
    """Build a per-line map: True if the line is inside a #[cfg]-gated scope."""
    result = [False] * len(lines)
    # Stack of (brace_depth_at_entry, is_cfg_gated)
    cfg_pending = False
    brace_depth = 0
    cfg_depth_stack: list[int] = []  # brace depths where #[cfg] scopes start

    for i, line in enumerate(lines):
        stripped = line.strip()
        # Detect #[cfg(...)] attribute (not #[cfg_attr])
        if re.match(r"#\[cfg\(", stripped):
            cfg_pending = True

        # Count braces (simple: ignores strings/comments, good enough for this)
        opens = line.count("{")
        closes = line.count("}")

        if opens > 0 and cfg_pending:
            cfg_depth_stack.append(brace_depth)
            cfg_pending = False

        brace_depth += opens

        # Mark line as inside cfg if we have active cfg scopes
        if cfg_depth_stack:
            result[i] = True

        brace_depth -= closes

        # Pop cfg scopes that have closed
        while cfg_depth_stack and brace_depth <= cfg_depth_stack[-1]:
            cfg_depth_stack.pop()

    return result


def check_cross_platform_imports(rust_dir: Path) -> list[str]:
    errors = []
    if not rust_dir.exists():
        return errors
    for rs_file in rust_dir.rglob("*.rs"):
        lines = rs_file.read_text(encoding="utf-8").splitlines()
        cfg_map = _build_cfg_scope_map(lines)
        for i, line in enumerate(lines):
            stripped = line.strip()
            # Skip if already cfg-gated (check previous line or inside cfg scope)
            if (i > 0 and "#[cfg(" in lines[i - 1]) or cfg_map[i]:
                continue
            # Detect ungated use statements for common platform-sensitive crates
            if stripped.startswith("use ") and any(
                mod in stripped for mod in ["tracing::", "log::", "windows::", "cocoa::", "gtk::"]
            ):
                match = re.search(r"\{(.+?)}", stripped)
                if not match:
                    continue
                imports = [name.strip() for name in match.group(1).split(",")]
                for imp in imports:
                    if not imp or imp == "self":
                        continue
                    usage_pattern = re.compile(rf"\b{re.escape(imp)}\b")
                    usages = [j for j, line in enumerate(lines) if j != i and usage_pattern.search(line)]
                    if not usages:
                        continue
                    # Check if ALL usages are inside #[cfg] scopes
                    if all(cfg_map[j] for j in usages):
                        rel = rs_file.relative_to(Path("."))
                        errors.append(
                            f"  {rel}:{i + 1}: `{imp}` from `{stripped}` "
                            f"is only used in #[cfg] blocks — add #[cfg] to the import"
                        )
    return errors


def main() -> int:
    errors = check_cross_platform_imports(Path("tools/agentkit-desktop/src-tauri/src"))
    if errors:
        print("⚠️  Cross-platform lint issues found:")
        for e in errors:
            print(e)
        print("\nThese imports may cause 'unused import' errors on other platforms.")
        print('Fix: add matching #[cfg(target_os = "...")] to the use statement.')
        return 1
    print("✅ No cross-platform import issues found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
