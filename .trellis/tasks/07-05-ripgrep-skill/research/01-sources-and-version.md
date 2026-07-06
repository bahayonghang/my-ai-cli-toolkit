# Research: ripgrep sources and current version

- **Query**: Current stable ripgrep version, release date, install/verify commands per platform
- **Scope**: external
- **Date**: 2026-07-05

## Findings

### Current stable version (verified, not assumed)

- **Latest stable: `15.1.0`**, published **2025-10-22** (release `15.0.0` was 2025-10-15).
  - Verified live via GitHub API: `GET https://api.github.com/repos/BurntSushi/ripgrep/releases/latest` → `"tag_name": "15.1.0"`, `"prerelease": false`, `"published_at": "2025-10-22T13:00:26Z"`.
- Previous major line was `14.x` (last: `14.1.1`, 2024-09-08). **Do not assume 14.x — 15.x is current.**
- Binary name is `rg`. Dual-licensed **MIT OR Unlicense**.
- **MSRV: Rust 1.85.0** (relevant only for `cargo install` / source builds).

### Verify install

```
rg --version      # prints version, revision hash, and enabled features (e.g. +PCRE2, +SIMD)
```

If `rg` runs something else, run `which rg` (an alias or another tool named `rg` may shadow it — see FAQ "rg-other-cmd"). NOTE: in this repo's sandbox, `rg` currently resolves to GNU grep 3.0, so local `rg --version` is not authoritative here.

### Install commands per platform (from README)

| Platform             | Command                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Windows (winget)     | `winget install BurntSushi.ripgrep.MSVC`                                                        |
| Windows (Chocolatey) | `choco install ripgrep`                                                                         |
| Windows (Scoop)      | `scoop install ripgrep`                                                                         |
| macOS / Linuxbrew    | `brew install ripgrep`                                                                          |
| macOS (MacPorts)     | `sudo port install ripgrep`                                                                     |
| Arch                 | `sudo pacman -S ripgrep`                                                                        |
| Fedora               | `sudo dnf install ripgrep`                                                                      |
| openSUSE             | `sudo zypper install ripgrep`                                                                   |
| Debian / Ubuntu      | `sudo apt-get install ripgrep` (or install the `.deb` from the Releases page for a newer build) |
| Gentoo               | `sudo emerge sys-apps/ripgrep`                                                                  |
| Void                 | `sudo xbps-install -Syv ripgrep`                                                                |
| Nix                  | `nix-env --install ripgrep`                                                                     |
| FreeBSD              | `sudo pkg install ripgrep`                                                                      |
| Rust (crates.io)     | `cargo install ripgrep`                                                                         |
| Rust (prebuilt)      | `cargo binstall ripgrep`                                                                        |
| Build w/ PCRE2       | `cargo build --release --features 'pcre2'`                                                      |

Precompiled static binaries for Windows/macOS/Linux (incl. man page and shell completions) are attached to every release: https://github.com/BurntSushi/ripgrep/releases

### PCRE2 availability

Most official GitHub release binaries ship **with PCRE2 enabled** (needed for `-P/--pcre2`). Distro packages may not — if `-P` errors with "PCRE2 is not available in this build of ripgrep", the package was built without it.

## Caveats / Not Found

- The README's Debian `.deb` install example still hard-codes the URL `ripgrep_14.1.1-1_amd64.deb`. That is a **stale doc example**, NOT the current version. Current release is `15.1.0`; adjust the version in any copied `curl` command.
- `apt`/distro versions frequently lag the GitHub release. For the newest build on Debian/Ubuntu, prefer the `.deb` from the Releases page.

### Source URLs

- README: https://github.com/BurntSushi/ripgrep/blob/master/README.md
- Releases: https://github.com/BurntSushi/ripgrep/releases
- 15.1.0 tag: https://github.com/BurntSushi/ripgrep/releases/tag/15.1.0
- Latest-release API (used to verify version): https://api.github.com/repos/BurntSushi/ripgrep/releases/latest
- CHANGELOG: https://github.com/BurntSushi/ripgrep/blob/master/CHANGELOG.md
