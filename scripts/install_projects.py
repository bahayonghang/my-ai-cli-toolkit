#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence

import yaml

from check import CANONICAL_CATEGORY_SLUGS

EXIT_OK = 0
EXIT_FAIL = 1
EXIT_USAGE = 2

CATEGORY_LABELS_ZH = {
    "academic-research-tools": "学术研究工具",
    "developer-tools-integrations": "开发者工具集成",
    "development-workflows": "开发工作流",
    "docs-writing-publishing": "文档写作与发布",
    "git-github-collaboration": "Git / GitHub 协作",
    "research-learning-knowledge": "研究、学习与知识",
}

ALWAYS_DEST = Path(".agents") / "skills"

# agent key -> (detect root relative to project, dest relative to project)
DETECT_AGENTS: dict[str, tuple[Path, Path]] = {
    "claude-code": (Path(".claude"), Path(".claude") / "skills"),
    "kiro": (Path(".kiro"), Path(".kiro") / "skills"),
    "trae": (Path(".trae"), Path(".trae") / "skills"),
    "opencode": (Path(".opencode"), Path(".opencode") / "skills"),
    "gemini": (Path(".gemini"), Path(".gemini") / "skills"),
    "grok": (Path(".grok"), Path(".grok") / "skills"),
    "cursor": (Path(".cursor"), Path(".cursor") / "skills"),
    "codex": (Path(".codex"), Path(".codex") / "skills"),
    "kimi-code": (Path(".kimi-code"), Path(".kimi-code") / "skills"),
    "omp": (Path(".omp"), Path(".omp") / "skills"),
}

KNOWN_AGENT_KEYS = frozenset({"universal", *DETECT_AGENTS})


class InstallError(Exception):
    """Expected validation or policy failure."""


@dataclass(frozen=True)
class Skill:
    name: str
    category: str
    slug: str
    source_dir: Path
    description: str = ""


def catalog_root() -> Path:
    return Path(__file__).resolve().parents[1]


def is_interactive() -> bool:
    return sys.stdin.isatty() and sys.stdout.isatty()


def parse_frontmatter(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return {}
    data = yaml.safe_load(match.group(1))
    return data if isinstance(data, dict) else {}


def discover_skills(root: Path | None = None) -> list[Skill]:
    skills_dir = (root or catalog_root()) / "skills"
    if not skills_dir.is_dir():
        raise InstallError(f"Skills catalog not found: {skills_dir}")
    skills: list[Skill] = []
    for category in sorted(CANONICAL_CATEGORY_SLUGS):
        category_dir = skills_dir / category
        if not category_dir.is_dir():
            continue
        for child in sorted(category_dir.iterdir(), key=lambda path: path.name.lower()):
            skill_md = child / "SKILL.md"
            if not child.is_dir() or not skill_md.is_file():
                continue
            meta = parse_frontmatter(skill_md)
            name = meta.get("name")
            skill_name = name.strip() if isinstance(name, str) and name.strip() else child.name
            skills.append(
                Skill(
                    name=skill_name,
                    category=category,
                    slug=child.name,
                    source_dir=child.resolve(),
                    description=(
                        desc.strip()
                        if isinstance(desc := meta.get("description"), str)
                        else ""
                    ),
                )
            )
    return skills


def group_skills(skills: Sequence[Skill]) -> dict[str, list[Skill]]:
    grouped: dict[str, list[Skill]] = {}
    for skill in skills:
        grouped.setdefault(skill.category, []).append(skill)
    return grouped


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="python scripts/install_projects.py",
        description=(
            "Live-link first-party skills from this repository into a project "
            "for local testing. Invoke with python, not python3."
        ),
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List catalog categories and skills without installing.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print catalog as JSON (implies --list).",
    )
    parser.add_argument(
        "--category",
        action="append",
        default=[],
        metavar="SLUG",
        help="Install every skill in a canonical category. Repeatable.",
    )
    parser.add_argument(
        "--skill",
        action="append",
        default=[],
        metavar="NAME",
        help="Install one skill by frontmatter name or directory slug. Repeatable.",
    )
    parser.add_argument(
        "--project",
        metavar="DIR",
        help="Project root to receive links. Default: process working directory (not the user home).",
    )
    parser.add_argument(
        "--agent",
        action="append",
        default=[],
        metavar="KEY",
        help=(
            "Also link this agent dest even if its root does not exist. "
            f"Known keys: {', '.join(sorted(KNOWN_AGENT_KEYS))}."
        ),
    )
    return parser.parse_args(argv)


def render_list(skills: Sequence[Skill]) -> str:
    grouped = group_skills(skills)
    lines: list[str] = []
    for category in sorted(grouped):
        label = CATEGORY_LABELS_ZH.get(category, category)
        entries = grouped[category]
        lines.append(f"{category}  {label}  ({len(entries)})")
        for skill in entries:
            extra = f"  [{skill.slug}]" if skill.slug != skill.name else ""
            lines.append(f"  {skill.name}{extra}")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def render_json(skills: Sequence[Skill]) -> str:
    grouped = group_skills(skills)
    payload = []
    for category in sorted(grouped):
        payload.append(
            {
                "category": category,
                "label_zh": CATEGORY_LABELS_ZH.get(category, category),
                "skills": [
                    {
                        "name": skill.name,
                        "slug": skill.slug,
                        "dir": str(skill.source_dir).replace("\\", "/"),
                    }
                    for skill in grouped[category]
                ],
            }
        )
    return json.dumps(payload, ensure_ascii=False, indent=2) + "\n"


def _index_skills(skills: Sequence[Skill]) -> dict[str, list[Skill]]:
    index: dict[str, list[Skill]] = {}
    for skill in skills:
        index.setdefault(skill.name, []).append(skill)
        if skill.slug != skill.name:
            index.setdefault(skill.slug, []).append(skill)
    return index


def select_skills(
    skills: Sequence[Skill],
    categories: Iterable[str],
    names: Iterable[str],
) -> list[Skill]:
    grouped = group_skills(skills)
    index = _index_skills(skills)
    selected: dict[str, Skill] = {}

    for slug in categories:
        if slug not in CANONICAL_CATEGORY_SLUGS:
            raise InstallError(
                f"Unknown category {slug!r}. Expected one of: "
                + ", ".join(sorted(CANONICAL_CATEGORY_SLUGS))
            )
        if slug not in grouped:
            raise InstallError(f"Category {slug!r} has no skills on disk.")
        for skill in grouped[slug]:
            selected[skill.name] = skill

    for name in names:
        matches = index.get(name, [])
        if not matches:
            raise InstallError(f"Unknown skill {name!r}.")
        if len(matches) > 1:
            raise InstallError(
                f"Skill {name!r} matches multiple packages: "
                + ", ".join(f"{item.category}/{item.slug}" for item in matches)
            )
        skill = matches[0]
        selected[skill.name] = skill

    return list(selected.values())


@dataclass
class SelectRow:
    kind: str
    label: str
    category: str | None = None
    skill: Skill | None = None


class SkillPicker:
    """npx-skills-style grouped checkbox state. Pure; no terminal I/O."""

    def __init__(
        self, skills: Sequence[Skill], project_root: Path | None = None
    ) -> None:
        self.skills = list(skills)
        self.project_root = project_root
        self.selected: set[str] = set()
        self.cursor = 0
        self.installed = {
            skill.name: skill_install_dirs(project_root, skill.name)
            for skill in self.skills
        }
        self.rows = self._build_rows()

    def _build_rows(self) -> list[SelectRow]:
        rows = [SelectRow("all", "Select All")]
        grouped = group_skills(self.skills)
        for category in sorted(grouped):
            label = CATEGORY_LABELS_ZH.get(category, category)
            count = len(grouped[category])
            rows.append(
                SelectRow(
                    "group",
                    f"{label}  {category}  ({count})",
                    category=category,
                )
            )
            for skill in grouped[category]:
                rows.append(SelectRow("skill", skill.name, category=category, skill=skill))
        return rows

    def move(self, delta: int) -> None:
        if not self.rows:
            return
        self.cursor = max(0, min(len(self.rows) - 1, self.cursor + delta))

    def names_in_category(self, category: str) -> set[str]:
        return {skill.name for skill in self.skills if skill.category == category}

    def all_state(self) -> str:
        if not self.selected:
            return "none"
        if len(self.selected) == len(self.skills):
            return "all"
        return "partial"

    def group_state(self, category: str) -> str:
        names = self.names_in_category(category)
        if not names:
            return "none"
        hit = names & self.selected
        if not hit:
            return "none"
        if hit == names:
            return "all"
        return "partial"

    def toggle(self) -> None:
        row = self.rows[self.cursor]
        if row.kind == "all":
            if self.all_state() == "all":
                self.selected.clear()
            else:
                self.selected = {skill.name for skill in self.skills}
            return
        if row.kind == "group" and row.category:
            names = self.names_in_category(row.category)
            if names <= self.selected:
                self.selected -= names
            else:
                self.selected |= names
            return
        if row.kind == "skill" and row.skill is not None:
            name = row.skill.name
            if name in self.selected:
                self.selected.discard(name)
            else:
                self.selected.add(name)

    def selected_skills(self) -> list[Skill]:
        chosen = self.selected
        return [skill for skill in self.skills if skill.name in chosen]

    def detail(self) -> str:
        row = self.rows[self.cursor]
        total = len(self.skills)
        if row.kind == "all":
            return f"Select or clear all {total} skills."
        if row.kind == "group" and row.category:
            return f"Toggle every skill in {row.category}."
        if row.skill is not None:
            text = re.sub(r"\s+", " ", row.skill.description).strip()
            places = self.installed.get(row.skill.name, ())
            if places:
                where = f"Installed: {', '.join(places)}."
                return f"{where} {text}".strip() if text else where
            return text or row.skill.name
        return ""


DETAIL_LINES = 2
PICKER_CHROME = 9  # title, project, bar, more, bar, Description, 2 details, hint
_DIM = "\x1b[2m"
_GREEN = "\x1b[32m"
_RESET = "\x1b[0m"


def _cell_width(char: str) -> int:
    code = ord(char)
    if code < 0x7F:
        return 1
    if (
        0x1100 <= code <= 0x115F
        or 0x2E80 <= code <= 0xA4CF
        or 0xAC00 <= code <= 0xD7A3
        or 0xF900 <= code <= 0xFAFF
        or 0xFF00 <= code <= 0xFF60
        or 0xFFE0 <= code <= 0xFFE6
    ):
        return 2
    return 1


def _text_width(text: str) -> int:
    return sum(_cell_width(char) for char in text)


def _truncate_cells(text: str, width: int) -> str:
    if width <= 0:
        return ""
    out: list[str] = []
    used = 0
    for char in text:
        size = _cell_width(char)
        if used + size > width:
            break
        out.append(char)
        used += size
    return "".join(out)


def format_detail_lines(detail: str, width: int, max_lines: int = DETAIL_LINES) -> list[str]:
    """Fixed-height wrapped pane. Always returns max_lines rows."""
    safe_width = max(1, width)
    normalized = re.sub(r"\s+", " ", detail).strip()
    lines: list[str] = []
    remaining = normalized
    while remaining and len(lines) < max_lines:
        if _text_width(remaining) <= safe_width:
            lines.append(remaining)
            remaining = ""
            break
        candidate = _truncate_cells(remaining, safe_width)
        break_at = candidate.rfind(" ")
        if break_at > 0:
            piece = candidate[:break_at].rstrip()
            consumed = len(piece) + 1
            lines.append(piece)
            remaining = remaining[consumed:].lstrip()
        else:
            lines.append(candidate)
            remaining = remaining[len(candidate) :].lstrip()
    if remaining and lines:
        last = _truncate_cells(lines[-1], max(1, safe_width - 1)).rstrip()
        lines[-1] = last + "…"
    while len(lines) < max_lines:
        lines.append("")
    return lines[:max_lines]


def _mark(state: str) -> str:
    if state == "all":
        return f"{_GREEN}●{_RESET}"
    if state == "partial":
        return f"{_GREEN}◐{_RESET}"
    return f"{_DIM}○{_RESET}"


def _enable_windows_vt() -> None:
    if sys.platform != "win32":
        return
    try:
        import ctypes

        handle = ctypes.windll.kernel32.GetStdHandle(-11)
        mode = ctypes.c_uint()
        if ctypes.windll.kernel32.GetConsoleMode(handle, ctypes.byref(mode)):
            ctypes.windll.kernel32.SetConsoleMode(handle, mode.value | 0x0004)
    except Exception:
        return


def _terminal_size() -> tuple[int, int]:
    try:
        size = os.get_terminal_size()
        return max(40, size.columns), max(16, size.lines)
    except OSError:
        return 80, 24


def _project_root_line(project_root: Path | None) -> str:
    if project_root is None:
        return f"{_DIM}│{_RESET}"
    return f"{_DIM}{project_root.resolve()}{_RESET}"


def render_picker(picker: SkillPicker, window: int, cols: int = 80) -> list[str]:
    total = len(picker.skills)
    selected_n = len(picker.selected)
    start = 0
    if len(picker.rows) > window:
        start = max(0, min(picker.cursor - window // 3, len(picker.rows) - window))
    visible = picker.rows[start : start + window]
    lines = [
        f"{_GREEN}◆{_RESET} Select skills to install (space to toggle)",
        _project_root_line(picker.project_root),
        f"{_DIM}│{_RESET}",
    ]
    for offset in range(window):
        if offset >= len(visible):
            lines.append(f"{_DIM}│{_RESET}")
            continue
        row = visible[offset]
        index = start + offset
        pointer = f"{_GREEN}❯{_RESET}" if index == picker.cursor else " "
        if row.kind == "all":
            body = f"{_mark(picker.all_state())} Select All ({selected_n}/{total})"
        elif row.kind == "group" and row.category:
            zh = CATEGORY_LABELS_ZH.get(row.category, row.category)
            count = len(picker.names_in_category(row.category))
            body = (
                f"{_DIM}▼{_RESET} {_mark(picker.group_state(row.category))} "
                f"{zh}  {_DIM}{row.category} ({count}){_RESET}"
            )
        else:
            name = row.skill.name if row.skill else row.label
            selected = bool(row.skill and row.skill.name in picker.selected)
            places = picker.installed.get(name, ()) if row.skill else ()
            suffix = f"  {_DIM}({', '.join(places)}){_RESET}" if places else ""
            body = f"  {_mark('all' if selected else 'none')} {name}{suffix}"
        lines.append(f"{pointer} {body}")
    hidden = max(0, len(picker.rows) - (start + window))
    if hidden:
        lines.append(f"{_DIM}↓ {hidden} more{_RESET}")
    else:
        lines.append(f"{_DIM}│{_RESET}")
    lines.append(f"{_DIM}│{_RESET}")
    lines.append(f"{_DIM}Description{_RESET}")
    for piece in format_detail_lines(picker.detail(), max(20, cols - 4), DETAIL_LINES):
        lines.append(f"  {piece}" if piece else f"{_DIM}│{_RESET}")
    lines.append(f"{_DIM}│  ↑/↓ move   space toggle   enter install   q quit{_RESET}")
    return lines


def _read_key_windows() -> str:
    import msvcrt

    ch = msvcrt.getwch()
    if ch in ("\x00", "\xe0"):
        code = msvcrt.getwch()
        return {"H": "up", "P": "down", "K": "left", "M": "right"}.get(code, "other")
    if ch in ("\r", "\n"):
        return "enter"
    if ch == " ":
        return "space"
    if ch in ("q", "Q", "\x1b"):
        return "quit"
    if ch == "\x03":
        raise KeyboardInterrupt
    return "other"


def _read_key_posix() -> str:
    ch = sys.stdin.read(1)
    if ch == "\x03":
        raise KeyboardInterrupt
    if ch in ("\r", "\n"):
        return "enter"
    if ch == " ":
        return "space"
    if ch in ("q", "Q"):
        return "quit"
    if ch == "\x1b":
        nxt = sys.stdin.read(1)
        if nxt != "[":
            return "quit"
        arrow = sys.stdin.read(1)
        return {"A": "up", "B": "down", "C": "right", "D": "left"}.get(arrow, "other")
    return "other"


def read_picker_key() -> str:
    if sys.platform == "win32":
        return _read_key_windows()
    return _read_key_posix()

def _paint_picker(frame: Sequence[str]) -> None:
    sys.stdout.write("\x1b[H\x1b[2J")
    sys.stdout.write("\r" + "\n".join(frame))
    sys.stdout.flush()



@contextmanager
def _raw_alt_screen() -> Any:
    _enable_windows_vt()
    posix_fd = None
    posix_old = None
    if sys.platform != "win32":
        import termios
        import tty

        posix_fd = sys.stdin.fileno()
        posix_old = termios.tcgetattr(posix_fd)
        tty.setraw(posix_fd)
    sys.stdout.write("\x1b[?1049h\x1b[?25l")
    sys.stdout.flush()
    try:
        yield
    finally:
        sys.stdout.write("\x1b[?25h\x1b[?1049l")
        sys.stdout.flush()
        if posix_fd is not None and posix_old is not None:
            import termios

            termios.tcsetattr(posix_fd, termios.TCSADRAIN, posix_old)


def prompt_selection(
    skills: Sequence[Skill], project_root: Path | None = None
) -> list[Skill]:
    if not skills:
        raise InstallError("No skills found in the catalog.")
    picker = SkillPicker(skills, project_root)
    cols, rows = _terminal_size()
    window = max(8, min(len(picker.rows), rows - PICKER_CHROME))
    with _raw_alt_screen():
        while True:
            _paint_picker(render_picker(picker, window, cols))
            key = read_picker_key()
            if key == "up":
                picker.move(-1)
            elif key == "down":
                picker.move(1)
            elif key == "space":
                picker.toggle()
            elif key == "enter":
                chosen = picker.selected_skills()
                if chosen:
                    return chosen
            elif key == "quit":
                raise InstallError("Cancelled.")




def skill_install_dirs(project_root: Path | None, skill_name: str) -> tuple[str, ...]:
    if project_root is None:
        return ()
    found: list[str] = []
    seen: set[str] = set()
    for key in ordered_agent_keys():
        rel = agent_rel_path(key)
        if not lexists(project_root / rel / skill_name):
            continue
        label = rel.parts[0]
        if label in seen:
            continue
        seen.add(label)
        found.append(label)
    return tuple(found)

def ordered_agent_keys() -> list[str]:
    return ["universal", *sorted(DETECT_AGENTS)]


def auto_agent_keys(project_root: Path) -> set[str]:
    keys = {"universal"}
    for key, (detect_root, _dest) in DETECT_AGENTS.items():
        if (project_root / detect_root).is_dir():
            keys.add(key)
    return keys


def agent_rel_path(key: str) -> Path:
    if key == "universal":
        return ALWAYS_DEST
    return DETECT_AGENTS[key][1]


class AgentPicker:
    """Flat checkbox list of agents. Default: dests already present in the project."""

    def __init__(self, project_root: Path) -> None:
        self.keys = ordered_agent_keys()
        self.project_root = project_root
        self.selected = set(auto_agent_keys(project_root))
        self.cursor = 0

    def move(self, delta: int) -> None:
        last = len(self.keys)
        self.cursor = max(0, min(last, self.cursor + delta))

    def all_state(self) -> str:
        if not self.selected:
            return "none"
        if self.selected == set(self.keys):
            return "all"
        return "partial"

    def toggle(self) -> None:
        if self.cursor == 0:
            if self.all_state() == "all":
                self.selected.clear()
            else:
                self.selected = set(self.keys)
            return
        key = self.keys[self.cursor - 1]
        if key in self.selected:
            self.selected.discard(key)
        else:
            self.selected.add(key)

    def selected_keys(self) -> list[str]:
        return [key for key in self.keys if key in self.selected]

    def detail(self) -> str:
        if self.cursor == 0:
            return "Select or clear every agent destination."
        key = self.keys[self.cursor - 1]
        dest = agent_rel_path(key).as_posix()
        detected = key in auto_agent_keys(self.project_root)
        status = "detected in this project" if detected else "will be created"
        return f"Live-link into {dest} ({status})."


def render_agent_picker(picker: AgentPicker, window: int, cols: int = 80) -> list[str]:
    total = len(picker.keys)
    selected_n = len(picker.selected)
    rows = [("all", "Select All")] + [
        (key, f"{key}  {agent_rel_path(key).as_posix()}") for key in picker.keys
    ]
    start = 0
    if len(rows) > window:
        start = max(0, min(picker.cursor - window // 3, len(rows) - window))
    visible = rows[start : start + window]
    lines = [
        f"{_GREEN}◆{_RESET} Select agents (space to toggle)",
        _project_root_line(picker.project_root),
        f"{_DIM}│{_RESET}",
    ]
    for offset in range(window):
        if offset >= len(visible):
            lines.append(f"{_DIM}│{_RESET}")
            continue
        index = start + offset
        kind, label = visible[offset]
        pointer = f"{_GREEN}❯{_RESET}" if index == picker.cursor else " "
        if kind == "all":
            body = f"{_mark(picker.all_state())} Select All ({selected_n}/{total})"
        else:
            state = "all" if kind in picker.selected else "none"
            extra = ""
            if kind in auto_agent_keys(picker.project_root):
                extra = f"  {_DIM}detected{_RESET}"
            body = f"  {_mark(state)} {label}{extra}"
        lines.append(f"{pointer} {body}")
    hidden = max(0, len(rows) - (start + window))
    lines.append(f"{_DIM}↓ {hidden} more{_RESET}" if hidden else f"{_DIM}│{_RESET}")
    lines.append(f"{_DIM}│{_RESET}")
    lines.append(f"{_DIM}Description{_RESET}")
    for piece in format_detail_lines(picker.detail(), max(20, cols - 4), DETAIL_LINES):
        lines.append(f"  {piece}" if piece else f"{_DIM}│{_RESET}")
    lines.append(f"{_DIM}│  ↑/↓ move   space toggle   enter install   q quit{_RESET}")
    return lines


def prompt_agents(project_root: Path) -> list[str]:
    picker = AgentPicker(project_root)
    cols, rows = _terminal_size()
    window = max(8, min(len(picker.keys) + 1, rows - PICKER_CHROME))
    with _raw_alt_screen():
        while True:
            _paint_picker(render_agent_picker(picker, window, cols))
            key = read_picker_key()
            if key == "up":
                picker.move(-1)
            elif key == "down":
                picker.move(1)
            elif key == "space":
                picker.toggle()
            elif key == "enter":
                chosen = picker.selected_keys()
                if chosen:
                    return chosen
            elif key == "quit":
                raise InstallError("Cancelled.")


def _relative_denied(path: Path, project_root: Path) -> bool:
    try:
        relative = path.resolve().relative_to(project_root.resolve())
    except ValueError:
        return True
    return relative.parts[:1] == (".agent",)


def dests_from_keys(project_root: Path, keys: Sequence[str]) -> list[Path]:
    unknown = [key for key in keys if key not in KNOWN_AGENT_KEYS]
    if unknown:
        raise InstallError(
            "Unknown --agent "
            + ", ".join(repr(key) for key in unknown)
            + ". Known: "
            + ", ".join(sorted(KNOWN_AGENT_KEYS))
        )
    ordered = [key for key in ordered_agent_keys() if key in set(keys)]
    if not ordered:
        raise InstallError("Select at least one agent.")
    dests: list[Path] = []
    seen: set[str] = set()
    for key in ordered:
        dest = project_root / agent_rel_path(key)
        if _relative_denied(dest, project_root):
            raise InstallError("Refusing to install under .agent/")
        marker = str(dest).replace("\\", "/").lower()
        if marker in seen:
            continue
        seen.add(marker)
        dests.append(dest)
    return dests


def resolve_dest_dirs(project_root: Path, agent_keys: Sequence[str]) -> list[Path]:
    unknown = [key for key in agent_keys if key not in KNOWN_AGENT_KEYS]
    if unknown:
        raise InstallError(
            "Unknown --agent "
            + ", ".join(repr(key) for key in unknown)
            + ". Known: "
            + ", ".join(sorted(KNOWN_AGENT_KEYS))
        )
    return dests_from_keys(project_root, auto_agent_keys(project_root) | set(agent_keys))


def lexists(path: Path) -> bool:
    try:
        path.lstat()
        return True
    except FileNotFoundError:
        return False
    except OSError:
        return True


def is_dir_link(path: Path) -> bool:
    if path.is_symlink():
        return True
    is_junction = getattr(path, "is_junction", None)
    return bool(callable(is_junction) and is_junction())


def same_source(link: Path, source: Path) -> bool:
    try:
        return link.resolve() == source.resolve()
    except OSError:
        return False


def remove_link(path: Path) -> None:
    if not lexists(path):
        return
    if sys.platform == "win32":
        os.unlink(path)
        return
    path.unlink()


def create_dir_link(source: Path, dest: Path) -> str:
    source = source.resolve()
    dest.parent.mkdir(parents=True, exist_ok=True)
    if lexists(dest):
        if is_dir_link(dest) and same_source(dest, source):
            return "reused"
        raise InstallError(
            f"Refusing to replace existing path: {dest}"
        )
    if sys.platform == "win32":
        result = subprocess.run(
            ["cmd", "/c", "mklink", "/J", str(dest), str(source)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            shell=False,
            check=False,
        )
        if result.returncode != 0 or not lexists(dest):
            detail = (result.stderr or result.stdout or "").strip()
            raise InstallError(
                f"Failed to create junction {dest} -> {source}"
                + (f": {detail}" if detail else "")
            )
        return "created"
    os.symlink(source, dest, target_is_directory=True)
    return "created"


def install_links(skills: Sequence[Skill], dest_dirs: Sequence[Path]) -> list[str]:
    created: list[Path] = []
    lines: list[str] = []
    try:
        for skill in skills:
            for dest_dir in dest_dirs:
                dest = dest_dir / skill.name
                status = create_dir_link(skill.source_dir, dest)
                if status == "created":
                    created.append(dest)
                lines.append(f"{status}: {dest} -> {skill.source_dir}")
    except Exception:
        for path in reversed(created):
            try:
                remove_link(path)
            except OSError as cleanup_exc:
                print(f"rollback failed for {path}: {cleanup_exc}", file=sys.stderr)
        raise
    return lines


def is_home_directory(path: Path) -> bool:
    try:
        return os.path.normcase(str(path.resolve())) == os.path.normcase(
            str(Path.home().resolve())
        )
    except OSError:
        return False


def resolve_project_root(raw: str | None) -> Path:
    path = Path.cwd() if raw is None else Path(raw)
    if not path.is_dir():
        raise InstallError(f"Project directory does not exist: {path}")
    resolved = path.resolve()
    if is_home_directory(resolved):
        raise InstallError(
            "Refusing to install into the home directory: "
            f"{resolved}. Run from a project, or pass --project <dir>. "
            "Destinations are project-level (./.agents/skills), "
            "not user-global folders such as ~/.trae/skills."
        )
    return resolved


def run(argv: Sequence[str] | None = None) -> int:
    try:
        args = parse_args(argv)
    except SystemExit as exc:
        code = exc.code
        if code is None:
            return EXIT_OK
        return int(code) if isinstance(code, int) else EXIT_USAGE

    try:
        skills = discover_skills()
        if not skills:
            raise InstallError("No skills found in the catalog.")

        if args.list or args.json:
            sys.stdout.write(render_json(skills) if args.json else render_list(skills))
            return EXIT_OK

        project_root = resolve_project_root(args.project)
        if args.category or args.skill:
            selected = select_skills(skills, args.category, args.skill)
            dest_dirs = resolve_dest_dirs(project_root, args.agent)
        elif is_interactive():
            try:
                selected = prompt_selection(skills, project_root)
                dest_dirs = dests_from_keys(project_root, prompt_agents(project_root))
            except KeyboardInterrupt as exc:
                raise InstallError("Cancelled.") from exc
        else:
            raise InstallError(
                "Non-interactive install requires --category and/or --skill. "
                "Use --list to print the catalog."
            )

        for line in install_links(selected, dest_dirs):
            print(line)
        return EXIT_OK
    except InstallError as exc:
        print(str(exc), file=sys.stderr)
        return EXIT_FAIL


def main(argv: Sequence[str] | None = None) -> int:
    return run(argv)


if __name__ == "__main__":
    raise SystemExit(main())
