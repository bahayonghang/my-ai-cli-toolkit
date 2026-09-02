#!/usr/bin/env python3
"""Read-only storage scanner (macOS + Windows)."""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

from paths import is_link, require_absolute

HOME = os.path.expanduser("~")


def human(kb: float | int) -> str:
    n = float(kb) * 1024
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if n < 1024 or unit == "TB":
            return f"{n:.1f} {unit}" if unit not in ("B", "KB") else f"{int(n)} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def run(cmd: list[str], timeout: int = 180) -> str:
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout).stdout
    except Exception:
        return ""


def du_children(path: str, min_kb: int = 51200, limit: int = 40, denied: list[str] | None = None) -> list[dict]:
    if not os.path.isdir(path) or is_link(path):
        return []
    results: list[dict] = []
    try:
        entries = sorted(os.listdir(path))
    except PermissionError:
        if denied is not None:
            denied.append(path)
        return [{"name": "(permission denied)", "path": path, "size_kb": 0, "size_h": "?", "denied": True}]
    for name in entries:
        if name in (".", ".."):
            continue
        child = os.path.join(path, name)
        if is_link(child):
            continue
        out = run(["du", "-sk", child], timeout=120)
        match = re.match(r"\s*(\d+)", out)
        if not match:
            continue
        kb = int(match.group(1))
        if kb < min_kb:
            continue
        results.append({"name": name, "path": child, "size_kb": kb, "size_h": human(kb)})
    results.sort(key=lambda row: row["size_kb"], reverse=True)
    return results[:limit]


MAC_TARGETS = [
    ("home", HOME, 102400),
    ("library", os.path.join(HOME, "Library"), 51200),
    ("caches", os.path.join(HOME, "Library/Caches"), 51200),
    ("containers", os.path.join(HOME, "Library/Containers"), 51200),
    ("group_containers", os.path.join(HOME, "Library/Group Containers"), 51200),
    ("app_support", os.path.join(HOME, "Library/Application Support"), 51200),
    ("applications", "/Applications", 102400),
    ("downloads", os.path.join(HOME, "Downloads"), 51200),
    ("dev_caches", None, 51200),
]

MAC_DEV_CACHE_PATHS = [
    "~/Library/Caches/pip",
    "~/Library/Caches/uv",
    "~/.cache",
    "~/.cargo",
    "~/.npm",
    "~/.pnpm-store",
    "~/.gradle",
    "~/.m2",
    "~/Library/Developer/Xcode/DerivedData",
    "~/Library/Developer/CoreSimulator",
    "~/Library/Developer/Xcode/iOS DeviceSupport",
    "~/Library/pnpm",
    "~/go/pkg",
    "~/.docker",
]


def dev_caches_macos(min_kb: int) -> list[dict]:
    results: list[dict] = []
    for raw in MAC_DEV_CACHE_PATHS:
        path = os.path.expanduser(raw)
        if not os.path.isdir(path) or is_link(path):
            continue
        out = run(["du", "-sk", path], timeout=180)
        match = re.match(r"\s*(\d+)", out)
        if not match:
            continue
        kb = int(match.group(1))
        if kb < min_kb:
            continue
        results.append(
            {
                "name": os.path.basename(path.rstrip("/")) or path,
                "path": path,
                "size_kb": kb,
                "size_h": human(kb),
            }
        )
    results.sort(key=lambda row: row["size_kb"], reverse=True)
    return results


def system_info_macos() -> dict:
    info: dict = {}
    info["os"] = "macOS " + run(["sw_vers", "-productVersion"]).strip()
    info["build"] = run(["sw_vers", "-buildVersion"]).strip()
    arch = run(["uname", "-m"]).strip()
    brand = run(["sysctl", "-n", "machdep.cpu.brand_string"]).strip()
    info["arch"] = (
        f"Apple Silicon (arm64){' / ' + brand if brand else ''}"
        if arch == "arm64"
        else f"{arch}{' / ' + brand if brand else ''}"
    )
    info["user"] = os.environ.get("USER", "") or run(["whoami"]).strip()
    info["home"] = HOME
    total_h = used_h = free_h = "?"
    total_b = used_b = free_b = 0
    try:
        total_b, used_b, free_b = shutil.disk_usage("/")
        total_h, used_h, free_h = human(total_b // 1024), human(used_b // 1024), human(free_b // 1024)
    except Exception:
        pass
    info["disk_total"], info["disk_used"], info["disk_free"] = total_h, used_h, free_h
    info["disk_total_bytes"], info["disk_used_bytes"], info["disk_free_bytes"] = total_b, used_b, free_b
    dinfo = run(["diskutil", "info", "/"])
    fs = re.search(r"File System Personality:\s*(.+)", dinfo)
    info["filesystem"] = fs.group(1).strip() if fs else "APFS"
    pm = re.search(r"Purgeable Space:\s*([\d.,]+ \w+)", dinfo)
    info["purgeable"] = pm.group(1).strip() if pm else ""
    info["disk_name"] = "Macintosh HD"
    info["disks"] = [{"name": "Macintosh HD", "total": total_h, "used": used_h, "free": free_h}]
    return info


def scan_macos(min_kb: int) -> tuple[dict, dict, list[str]]:
    system = system_info_macos()
    groups: dict = {}
    denied: list[str] = []
    for key, path, floor in MAC_TARGETS:
        groups[key] = (
            dev_caches_macos(min(min_kb, 51200))
            if key == "dev_caches"
            else du_children(path, min_kb=max(min_kb, floor) if min_kb >= 51200 else min_kb, denied=denied)
        )
    return system, groups, denied


def dir_size_bytes(path: str) -> int:
    total = 0
    try:
        with os.scandir(path) as it:
            for entry in it:
                try:
                    if entry.is_symlink() or is_link(entry.path):
                        continue
                    if entry.is_file(follow_symlinks=False):
                        total += entry.stat(follow_symlinks=False).st_size
                    elif entry.is_dir(follow_symlinks=False):
                        total += dir_size_bytes(entry.path)
                except (PermissionError, OSError):
                    continue
    except (PermissionError, OSError):
        pass
    return total


def scandir_children(
    path: str, min_kb: int = 51200, limit: int = 40, denied: list[str] | None = None
) -> list[dict]:
    if not path or not os.path.isdir(path) or is_link(path):
        return []
    results: list[dict] = []
    try:
        entries = sorted(os.listdir(path))
    except PermissionError:
        if denied is not None:
            denied.append(path)
        return [{"name": "(permission denied)", "path": path, "size_kb": 0, "size_h": "?", "denied": True}]
    for name in entries:
        child = os.path.join(path, name)
        if is_link(child):
            continue
        try:
            kb = (os.path.getsize(child) if os.path.isfile(child) else dir_size_bytes(child)) // 1024
        except (PermissionError, OSError):
            continue
        if kb < min_kb:
            continue
        results.append({"name": name, "path": child, "size_kb": kb, "size_h": human(kb)})
    results.sort(key=lambda row: row["size_kb"], reverse=True)
    return results[:limit]


def list_drives_windows() -> list[dict]:
    import ctypes
    import string

    bitmask = ctypes.windll.kernel32.GetLogicalDrives()
    drives: list[dict] = []
    for index, letter in enumerate(string.ascii_uppercase):
        if not bitmask & (1 << index):
            continue
        root = f"{letter}:\\"
        try:
            total_b, used_b, free_b = shutil.disk_usage(root)
            drives.append(
                {
                    "name": root,
                    "total": human(total_b // 1024),
                    "used": human(used_b // 1024),
                    "free": human(free_b // 1024),
                }
            )
        except Exception:
            continue
    return drives


def windows_filesystem(root: str) -> str:
    try:
        import ctypes

        drive = os.path.splitdrive(root)[0] or os.environ.get("SystemDrive", "C:")
        volroot = drive + "\\"
        buf = ctypes.create_unicode_buffer(32)
        ok = ctypes.windll.kernel32.GetVolumeInformationW(
            volroot, None, 0, None, None, None, buf, len(buf)
        )
        if ok:
            return buf.value or "unknown"
    except Exception:
        pass
    return "unknown"


def system_info_windows() -> dict:
    import platform

    info: dict = {}
    info["os"] = platform.system() + " " + platform.release()
    info["build"] = platform.version()
    info["arch"] = os.environ.get("PROCESSOR_ARCHITECTURE", platform.machine())
    info["user"] = os.environ.get("USERNAME", "")
    profile = os.environ.get("USERPROFILE", HOME)
    info["home"] = profile
    sysdrive = os.environ.get("SystemDrive", "C:") + "\\"
    total_h = used_h = free_h = "?"
    total_b = used_b = free_b = 0
    try:
        total_b, used_b, free_b = shutil.disk_usage(sysdrive)
        total_h, used_h, free_h = human(total_b // 1024), human(used_b // 1024), human(free_b // 1024)
    except Exception:
        pass
    info["disk_total"], info["disk_used"], info["disk_free"] = total_h, used_h, free_h
    info["disk_total_bytes"], info["disk_used_bytes"], info["disk_free_bytes"] = total_b, used_b, free_b
    info["filesystem"] = windows_filesystem(sysdrive)
    info["purgeable"] = ""
    info["disk_name"] = sysdrive
    info["disks"] = list_drives_windows()
    return info


def windows_dev_cache_paths(profile: str, local: str) -> list[str]:
    return [
        os.path.join(profile, ".cache"),
        os.path.join(profile, ".npm"),
        os.path.join(profile, ".pnpm-store"),
        os.path.join(profile, ".gradle"),
        os.path.join(profile, ".m2"),
        os.path.join(profile, ".nuget", "packages"),
        os.path.join(profile, ".cargo"),
        os.path.join(profile, ".rustup"),
        os.path.join(profile, ".bun"),
        os.path.join(local, "pip", "Cache"),
        os.path.join(local, "uv", "cache"),
        os.path.join(local, "Yarn"),
        os.path.join(local, "npm-cache"),
        os.path.join(local, "pnpm"),
        os.path.join(local, "ms-playwright"),
        os.path.join(local, "go-build"),
        os.path.join(local, "NuGet"),
        os.path.join(os.environ.get("APPDATA", os.path.join(profile, "AppData", "Roaming")), "npm-cache"),
    ]


def scan_windows(
    min_kb: int,
    include_system_apps: bool,
    program_files: str | None = None,
    program_files_x86: str | None = None,
) -> tuple[dict, dict, list[str]]:
    profile = os.environ.get("USERPROFILE", HOME)
    local = os.environ.get("LOCALAPPDATA", os.path.join(profile, "AppData", "Local"))
    roaming = os.environ.get("APPDATA", os.path.join(profile, "AppData", "Roaming"))
    targets = [
        ("appdata_local", local, min_kb),
        ("appdata_roaming", roaming, min_kb),
        ("temp", os.environ.get("TEMP", os.path.join(local, "Temp")), min_kb),
        ("downloads", os.path.join(profile, "Downloads"), min_kb),
    ]
    if include_system_apps:
        targets.extend(
            [
                (
                    "program_files",
                    program_files
                    or os.environ.get("ProgramFiles")
                    or os.environ.get("PROGRAMFILES")
                    or r"C:\Program Files",
                    max(min_kb, 102400) if min_kb >= 51200 else min_kb,
                ),
                (
                    "program_files_x86",
                    program_files_x86
                    or os.environ.get("ProgramFiles(x86)")
                    or os.environ.get("PROGRAMFILES(X86)")
                    or r"C:\Program Files (x86)",
                    max(min_kb, 102400) if min_kb >= 51200 else min_kb,
                ),
            ]
        )
    denied: list[str] = []
    groups: dict = {}
    for key, path, floor in targets:
        groups[key] = scandir_children(path, min_kb=floor, denied=denied)

    dev: list[dict] = []
    for path in windows_dev_cache_paths(profile, local):
        if not os.path.isdir(path) or is_link(path):
            continue
        try:
            kb = dir_size_bytes(path) // 1024
        except (PermissionError, OSError):
            continue
        if kb < min_kb:
            continue
        dev.append(
            {
                "name": os.path.basename(path.rstrip("\\/")) or path,
                "path": path,
                "size_kb": kb,
                "size_h": human(kb),
            }
        )
    dev.sort(key=lambda row: row["size_kb"], reverse=True)
    groups["dev_caches"] = dev
    return system_info_windows(), groups, denied


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Read-only disk hotspot scanner")
    parser.add_argument("--output", help="Absolute UTF-8 JSON output path")
    parser.add_argument("--min-kb", type=int, default=51200)
    parser.add_argument("--include-system-apps", action="store_true")
    parser.add_argument("--program-files", help="Override Program Files root (absolute)")
    parser.add_argument("--program-files-x86", help="Override Program Files (x86) root (absolute)")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if args.min_kb < 0:
        print("--min-kb must be >= 0", file=sys.stderr)
        return 2
    output_path = None
    if args.output:
        try:
            output_path = require_absolute(args.output, "--output")
        except ValueError as exc:
            print(str(exc), file=sys.stderr)
            return 2
    started = time.time()
    if sys.platform == "darwin":
        system, groups, denied = scan_macos(args.min_kb)
    elif sys.platform.startswith("win"):
        pf = None
        pfx86 = None
        if args.program_files:
            try:
                pf = str(require_absolute(args.program_files, "--program-files"))
            except ValueError as exc:
                print(str(exc), file=sys.stderr)
                return 2
        if args.program_files_x86:
            try:
                pfx86 = str(require_absolute(args.program_files_x86, "--program-files-x86"))
            except ValueError as exc:
                print(str(exc), file=sys.stderr)
                return 2
        system, groups, denied = scan_windows(
            args.min_kb, args.include_system_apps, program_files=pf, program_files_x86=pfx86
        )
    else:
        print(
            json.dumps(
                {
                    "error": "unsupported_platform",
                    "platform": sys.platform,
                    "message": "scan.py supports macOS and Windows only.",
                },
                ensure_ascii=False,
            )
        )
        return 2
    data = {
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "system": system,
        "groups": groups,
        "denied": denied,
        "scan_seconds": round(time.time() - started, 1),
    }
    text = json.dumps(data, ensure_ascii=False)
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(text + "\n", encoding="utf-8", newline="\n")
        print(str(output_path))
    else:
        print(text)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SystemExit:
        raise
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1)
