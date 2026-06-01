#!/usr/bin/env python3
"""Create an AI-agent dynamic workflow artifact directory."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path


PACKET_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$")


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug[:64].strip("-") or "workflow"


def parse_packet(value: str) -> dict[str, str]:
    if ":" not in value:
        raise argparse.ArgumentTypeError("packet must use the form id:title")
    raw_id, raw_title = value.split(":", 1)
    packet_id = raw_id.strip()
    title = raw_title.strip()
    if not packet_id or not title:
        raise argparse.ArgumentTypeError("packet id and title must both be non-empty")
    if not PACKET_ID_RE.fullmatch(packet_id):
        raise argparse.ArgumentTypeError(
            "packet id must start with a letter or digit and contain only letters, digits, dot, underscore, or hyphen"
        )
    return {"id": packet_id, "title": title, "status": "pending", "path": f"packets/{packet_id}.md"}


def write_new(path: Path, content: str) -> None:
    if path.exists():
        return
    path.write_text(content, encoding="utf-8")


def packet_template(packet: dict[str, str], workflow_title: str) -> str:
    return f"""# Packet {packet['id']}: {packet['title']}

Workflow: {workflow_title}

## Objective

## Context

## Files / Sources

## Ownership

## Do

## Do Not

## Expected Output

## Verification
"""


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("title", help="Workflow title or task summary")
    parser.add_argument(
        "--root",
        default=".workflow",
        help="Directory where workflow runs are stored (default: .workflow)",
    )
    parser.add_argument("--slug", help="Optional explicit workflow slug")
    parser.add_argument(
        "--packet",
        action="append",
        default=[],
        type=parse_packet,
        metavar="ID:TITLE",
        help="Add a packet template, for example --packet \"01-research:Provider research\". May be repeated.",
    )
    parser.add_argument(
        "--windows-notes",
        action="store_true",
        help="Kept for explicitness; Windows-safe command notes are included in every scaffold by default.",
    )
    args = parser.parse_args()

    slug = slugify(args.slug or args.title)
    run_dir = Path(args.root) / slug
    packets_dir = run_dir / "packets"
    results_dir = run_dir / "results"
    packets_dir.mkdir(parents=True, exist_ok=True)
    results_dir.mkdir(parents=True, exist_ok=True)

    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    state = {
        "title": args.title,
        "slug": slug,
        "created_at": now,
        "status": "planned",
        "approval": {"required": None, "granted": None, "notes": ""},
        "artifact_policy": {
            "root": str(Path(args.root)),
            "pollution_guard": "Prefer existing ignored planning paths; use .workflow only when durable artifacts are appropriate.",
        },
        "runner_capabilities": {
            "subagent_runner": "unknown",
            "goal_mode": "explicit_request_only",
            "simulation_allowed": True,
        },
        "platform_notes": [
            "Use quoted paths when a directory may contain spaces.",
            "Prefer python on PATH; on Windows use py -3 as a fallback.",
            "Avoid POSIX-only commands such as nohup, open, cp -r, rm -rf, and shell globs.",
        ],
        "packets": args.packet,
        "verification": {"status": "not_started", "checks": []},
    }

    packet_lines = "\n".join(f"- `{packet['id']}`: {packet['title']}" for packet in args.packet)
    if not packet_lines:
        packet_lines = "- No packets scaffolded yet."
    prompt_lines = "\n".join(f"- See `packets/{packet['id']}.md` for {packet['title']}." for packet in args.packet)
    if not prompt_lines:
        prompt_lines = "- Add packet prompts only when orchestration is justified."

    write_new(
        run_dir / "plan.md",
        f"""# {args.title}

## Goal

## Success Criteria

## Current Context

## Constraints

## Risks

## Approval Required

## Artifact Policy

- Confirm this run directory is appropriate for the repository before committing it.
- Prefer existing ignored planning paths when available.

## Runner Capabilities

- Subagent runner: unknown until the current agent environment confirms it.
- Goal mode: explicit user request only.
- No runner: simulate packets locally and do not claim a swarm ran.

## Platform Notes

- Quote paths that may contain spaces.
- Use `python` or Windows fallback `py -3`.
- Avoid POSIX-only commands such as `nohup`, `open`, `cp -r`, `rm -rf`, and shell globs.

## Work Packets

{packet_lines}

## Integration Policy

## Verification

## Reusable Artifacts
""",
    )
    write_new(
        run_dir / "orchestration.md",
        f"""# Orchestration: {args.title}

## Execution Rules

- First decide whether dynamic workflow orchestration is truly needed.
- Keep the original objective intact.
- Ask for approval before risky, expensive, external, or destructive actions.
- Keep immediate blocking work local.
- Delegate only bounded, disjoint, materially useful packets when a runner exists and the user authorized delegation.
- If no runner exists, simulate packets with isolated local passes and separate notes.
- Integrate packet results before final verification.

## Windows-Safe Command Notes

- Quote paths with spaces: `python "<skill-dir>/scripts/verify_workflow.py" "<workflow-dir>"`.
- Windows fallback: `py -3 .\\skills\\development-workflows\\codex-dynamic-workflows\\scripts\\verify_workflow.py .workflow\\{slug} --level structure`.
- Avoid `nohup`, `open`, `cp -r`, `rm -rf`, and shell-expanded globs in portable instructions.

## Branching Rules

## Packet Prompts

{prompt_lines}

## Completion Audit
""",
    )
    write_new(run_dir / "state.json", json.dumps(state, indent=2) + "\n")
    write_new(
        run_dir / "final-report.md",
        f"""# Final Report: {args.title}

## Outcome

## Accepted Results

## Rejected Results

## Conflicts Resolved

## Verification Evidence

## Remaining Risks

## Reusable Follow-up
""",
    )

    for packet in args.packet:
        write_new(packets_dir / f"{packet['id']}.md", packet_template(packet, args.title))

    print(run_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
