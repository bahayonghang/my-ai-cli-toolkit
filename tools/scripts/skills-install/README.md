# skills-install

Interactive installers for `npx skills` on two platforms:

- `skills-install.sh` for macOS / Linux
- `skills-install.ps1` for Windows

The preferred usage is to run them directly from GitHub, without cloning this repository first.

## What the scripts do

Both scripts follow the same flow:

1. Choose install scope: `project` or `global`
2. Detect already installed skills with `npx skills ls --json`
3. Choose install mode:
   - first-party skills from this repository's GitHub source
   - third-party skills from `content/skills/external-skills/`
4. Download candidate metadata from GitHub:
   - first-party skills from `content/skills/catalog.json`
   - third-party skills from `content/skills/external-skills/index.toml` and `categories/*.toml`
5. Show only candidates not already installed in the chosen scope
6. Install the selected skills with `npx skills add`

## Preferred remote usage

### macOS / Linux

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.sh)
```

### Windows PowerShell

```powershell
irm https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.ps1 | iex
```

If you need to pin another branch, tag, or commit, use that ref in the raw URL and set `SKILLS_INSTALL_REF` to the same value before running the script.

## Local convenience after cloning

If you already cloned the repository, `just` recipes remain available as local entrypoints:

```bash
just skills-install
just skills-install-sh
just skills-install-ps1
```

## Important behavior

- `project` scope uses the shell's current working directory.
- The scripts do not ask for target agents and do not pass `--agent`.
- External registry entries marked `project_only = true` are hidden in `global` mode.
- Multiple external selections from the same `package_ref` are grouped into one `npx skills add` command.
