import os
import re
import shutil
import subprocess
import sys


def _read_cargo_version(mcs_dir: str) -> str:
    """Read version from mcs/Cargo.toml."""
    cargo_toml = os.path.join(mcs_dir, "Cargo.toml")
    with open(cargo_toml, encoding="utf-8") as f:
        m = re.search(r'^version\s*=\s*"([^"]+)"', f.read(), re.MULTILINE)
    return m.group(1) if m else "0.0.0"


def _read_exe_version(exe_path: str) -> str | None:
    """Read version from existing mcs binary via --version."""
    try:
        out = subprocess.check_output([exe_path, "--version"], text=True, timeout=5)
        # Output format: "mcs 0.1.0"
        parts = out.strip().split()
        return parts[1] if len(parts) >= 2 else None
    except Exception:
        return None


def _build_and_copy(mcs_dir: str, exe_path: str, exe_name: str) -> None:
    """Build release binary and copy to project root."""
    print(f"🔨 Building {exe_name} release...")
    subprocess.check_call(["cargo", "build", "--release"], cwd=mcs_dir)
    build_path = os.path.join(mcs_dir, "target", "release", exe_name)
    if not os.path.exists(build_path):
        print(f"❌ Error: Build artifact not found at {build_path}")
        sys.exit(1)
    # On Windows, the exe may be locked by a previous run; rename it out first
    if sys.platform == "win32" and os.path.exists(exe_path):
        old = exe_path + ".old"
        try:
            if os.path.exists(old):
                os.remove(old)
            os.rename(exe_path, old)
        except OSError:
            pass
    shutil.copy2(build_path, exe_path)
    print(f"✅ Built and copied to {exe_path}")


def main():
    exe_name = "mcs.exe" if sys.platform == "win32" else "mcs"
    root_dir = os.getcwd()
    exe_path = os.path.join(root_dir, exe_name)
    mcs_dir = os.path.join(root_dir, "mcs")

    force = "--rebuild" in sys.argv
    cargo_ver = _read_cargo_version(mcs_dir)

    if force or not os.path.exists(exe_path):
        _build_and_copy(mcs_dir, exe_path, exe_name)
    else:
        exe_ver = _read_exe_version(exe_path)
        if exe_ver != cargo_ver:
            print(f"🔄 Version mismatch: exe={exe_ver}, Cargo.toml={cargo_ver}")
            _build_and_copy(mcs_dir, exe_path, exe_name)

    # Run
    print(f"🚀 Launching {exe_name}...")
    try:
        subprocess.check_call([exe_path])
    except KeyboardInterrupt:
        pass
    except subprocess.CalledProcessError as e:
        sys.exit(e.returncode)


if __name__ == "__main__":
    main()
