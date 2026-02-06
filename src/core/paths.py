"""Unified path constants for the project.

Single source of truth for all path-related constants used across
CLI and TUI modules. Eliminates redundant Path(__file__) calculations.
"""

from pathlib import Path

# Project root directory (the repo root, NOT src/)
PROJECT_ROOT = Path(__file__).parent.parent.parent.absolute()

# Source asset directories
SKILLS_SRC_DIR = PROJECT_ROOT / "skills"
COMMANDS_SRC_DIR = PROJECT_ROOT / "commands"
PROMPTS_SRC_DIR = PROJECT_ROOT / "prompts"

# User home directory
HOME_DIR = Path.home()
