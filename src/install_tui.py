#!/usr/bin/env python3
import sys


def main() -> int:
    """Run the TUI application.

    Returns:
        Exit code (0 for normal exit)
    """
    from tui.app import SkillInstallerApp

    app = SkillInstallerApp()
    app.run()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nAborted by user.")
        sys.exit(0)
