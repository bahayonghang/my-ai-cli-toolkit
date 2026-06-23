#!/usr/bin/env python3
"""Generate UI bitmap assets with image2-first, OpenRouter ICU fallback.

This wrapper gives the image-to-ui skill a concrete, repeatable command:

1. Try a project/native image2 command when available.
2. If native image2 is unavailable or fails, call the installed
   openrouter-icu-image skill with model gpt-image-2.

The fallback is intentional for this user's Codex setup; it is not treated as
an unrelated substitute.
"""

from __future__ import annotations

import argparse
import os
import shlex
import shutil
import subprocess
import sys
from pathlib import Path


def _bool(value: str | bool | None) -> str | None:
    if value is None:
        return None
    if isinstance(value, bool):
        return "true" if value else "false"
    lowered = value.strip().lower()
    if lowered in {"1", "true", "yes", "on"}:
        return "true"
    if lowered in {"0", "false", "no", "off"}:
        return "false"
    raise argparse.ArgumentTypeError("expected true/false")


def _skill_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _fallback_cli() -> Path:
    configured = os.environ.get("OPENROUTER_ICU_IMAGE_CLI")
    if configured:
        return Path(configured)
    return _skill_root().parent / "openrouter-icu-image" / "scripts" / "openrouter_icu_image.py"


def _image2_base_command() -> list[str] | None:
    configured = os.environ.get("IMAGE2_COMMAND")
    if configured:
        return shlex.split(configured)
    executable = shutil.which("image2")
    if executable:
        return [executable]
    return None


def _native_command(args: argparse.Namespace) -> list[str] | None:
    base = _image2_base_command()
    if not base:
        return None

    # If IMAGE2_COMMAND contains placeholders, treat it as a full template.
    template = os.environ.get("IMAGE2_COMMAND")
    if template and any(token in template for token in ("{prompt}", "{output}", "{size}")):
        values = {
            "prompt": args.prompt,
            "output": str(args.output),
            "size": args.size,
            "quality": args.quality,
            "output_format": args.output_format,
        }
        return shlex.split(template.format(**values))

    command = [*base, args.action]
    if args.action == "edit":
        for image in args.image:
            command.extend(["--image", str(image)])
    command.extend(
        [
            "--prompt",
            args.prompt,
            "--output",
            str(args.output),
            "--size",
            args.size,
            "--quality",
            args.quality,
            "--output-format",
            args.output_format,
        ]
    )
    return command


def _fallback_command(args: argparse.Namespace) -> list[str]:
    cli = _fallback_cli()
    command = [
        sys.executable,
        str(cli),
        args.action,
    ]
    if args.action == "edit":
        for image in args.image:
            command.extend(["--image", str(image)])
    command.extend(
        [
            "--prompt",
            args.prompt,
            "--output",
            str(args.output),
            "--model",
            args.model,
            "--size",
            args.size,
            "--quality",
            args.quality,
            "--output-format",
            args.output_format,
            "--stream",
            args.stream,
            "--partial-images",
            str(args.partial_images),
        ]
    )
    if args.events_output:
        command.extend(["--events-output", str(args.events_output)])
    if args.save_partials:
        command.append("--save-partials")
    return command


def _run(command: list[str], dry_run: bool) -> int:
    printable = subprocess.list2cmdline(command)
    if dry_run:
        print(printable)
        return 0
    completed = subprocess.run(command)
    return completed.returncode


def _fallback_ready() -> tuple[bool, str]:
    cli = _fallback_cli()
    if not cli.exists():
        return False, f"OpenRouter ICU fallback CLI not found: {cli}"
    if not (os.environ.get("OPENROUTER_ICU_API_KEY") or os.environ.get("OPENAI_API_KEY")):
        return False, "OPENROUTER_ICU_API_KEY or OPENAI_API_KEY is required for fallback"
    return True, "ok"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate UI image assets with image2 first and OpenRouter ICU gpt-image-2 fallback."
    )
    subparsers = parser.add_subparsers(dest="action", required=True)

    def add_common(sub: argparse.ArgumentParser) -> None:
        sub.add_argument("--prompt", required=True)
        sub.add_argument("--output", required=True, type=Path)
        sub.add_argument("--size", default="1024x1024")
        sub.add_argument("--quality", default="medium", choices=["low", "medium", "high", "auto"])
        sub.add_argument("--output-format", "--output_format", dest="output_format", default="png", choices=["png", "jpeg", "webp"])
        sub.add_argument("--model", default="gpt-image-2")
        sub.add_argument("--stream", nargs="?", const="true", default="true", type=_bool)
        sub.add_argument("--partial-images", "--partial_images", dest="partial_images", default=2, type=int)
        sub.add_argument("--events-output", "--events_output", dest="events_output", type=Path)
        sub.add_argument("--save-partials", "--save_partials", dest="save_partials", action="store_true")
        sub.add_argument("--prefer", choices=["auto", "image2", "fallback"], default="auto")
        sub.add_argument("--dry-run", action="store_true")

    generate = subparsers.add_parser("generate", help="Generate an image from a text prompt.")
    add_common(generate)

    edit = subparsers.add_parser("edit", help="Edit images or use reference images.")
    edit.add_argument("--image", action="append", required=True, type=Path)
    add_common(edit)

    return parser.parse_args()


def main() -> int:
    args = parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)

    if args.prefer != "fallback":
        native = _native_command(args)
        if native:
            print("[image2-asset] trying native image2")
            native_code = _run(native, args.dry_run)
            if native_code == 0:
                print("[image2-asset] channel=native-image2")
                return 0
            print(f"[image2-asset] native image2 failed with exit code {native_code}; falling back")
        elif args.prefer == "image2":
            print("[image2-asset] native image2 requested but no image2 command is available")
            return 2
        else:
            print("[image2-asset] native image2 unavailable; using fallback")

    ready, reason = _fallback_ready()
    if not ready and not args.dry_run:
        print(f"[image2-asset] fallback unavailable: {reason}", file=sys.stderr)
        return 3

    fallback = _fallback_command(args)
    print("[image2-asset] channel=openrouter-icu-gpt-image-2")
    return _run(fallback, args.dry_run)


if __name__ == "__main__":
    raise SystemExit(main())
