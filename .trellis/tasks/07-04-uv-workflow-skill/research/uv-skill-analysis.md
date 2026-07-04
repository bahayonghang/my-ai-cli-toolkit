# Research: uv skill analysis

## Source material from user prompt

The prompt provided two source skill bodies:

- `python-via-uv`: use `uv` for every Python command; avoid direct `python` / `python3`; set `UV_CACHE_DIR` to a writable temp directory when sandboxed; allow `python` only inside `uv run ...`.
- `uv-script-workflow`: for standalone scripts, initialize with `uv init --script`, manage dependencies with `uv add --script` / `uv remove --script`, run with `uv run`, and avoid hand-editing PEP 723 metadata.

The prompt asks for one uv skill under this repository's `skills/` directory and asks to create a Trellis task first.

## Repository evidence

- `code_map.md` says first-party skills live at `skills/<category>/<skill-name>/`.
- `skills/code_map.md` says `developer-tools-integrations/` owns repository, agent, Codex, Claude, and architecture tooling skills.
- `skills/developer-tools-integrations/AGENTS.md` says new skills in this category need top-level `name`, `description`, `category`, `tags`, and `version`; optional `agents/interface.yaml` must be neutral and not platform-named.
- `scripts/check.py` validates the frontmatter keys, requires valid category values, rejects angle brackets in `description`, and enforces `description <= 1024`.

## Local uv evidence

- `uv --version` returned `uv 0.11.26`.
- `uv help init` confirms `--script` creates a standalone PEP 723 script.
- `uv help add` confirms `--script <SCRIPT>` adds dependencies to a script.
- `uv help remove` confirms `--script <SCRIPT>` removes dependencies from a script.
- `uv help run` confirms `.py` files can be treated as scripts, `--with` adds ad hoc packages, and `UV_CACHE_DIR` is a supported cache environment variable.

## Skill engineering evidence

- `$yao-meta-skill` was loaded and its main `SKILL.md` says to route by frontmatter `description`, keep `SKILL.md` lean, use the lightest reliable process, and only create a skill when there is repeated use plus a reusable output contract.
- The local `yao-meta-skill` installation does not include the referenced `references/` files, so planning uses the main skill file rather than unavailable playbooks.

## Conclusion

Use one combined skill package named `uv-workflow` under `skills/developer-tools-integrations/`. This keeps the source article's most important trigger in the description/body while folding the standalone script workflow into the same uv execution policy and honoring the user's request to avoid `python` / `via` in the skill name.
