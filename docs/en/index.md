---
layout: home

hero:
  name: My Claude Code Settings
  text: Cross-platform AI content repository
  tagline: Installable skills, platform source assets, and Claude Code runtime hooks.
  actions:
    - theme: brand
      text: Browse Skills
      link: /en/skills
    - theme: alt
      text: View Hooks
      link: /en/hooks
    - theme: alt
      text: Harness facts
      link: /en/harnesses

features:
  - title: Root-level workspaces
    details: skills/ platforms/ scripts/ live directly at the repository root; docs/ only documents and navigates the repository.
  - title: Platform source layout
    details: Claude sources are agents/ and hooks/. Codex sources are agents/ only (no prompts/). Antigravity uses commands/. Static installer maps are not new-session discovery proof.
  - title: Locally verifiable
    details: just ci runs docs-check, skills-check, python-check, python-test, install-projects-test, node-test, then git diff --check.
---

## Five-harness capability bounds

Native instruction roots, skill discovery, hooks or extensions, delegation, permission, and verification bounds for Claude Code, Codex, Grok Build, Kimi Code CLI, and OMP are in the [harness fact table](/en/harnesses). That page labels official / repo contract / local probe / UNVERIFIED. Client load remains UNVERIFIED.

Kimi means current Kimi Code CLI, not old kimi-cli. OMP does not borrow Pi capability conclusions. Goal lifecycle lives in `skills/developer-tools-integrations/goal-meta-skill/references/platform-goal-facts.md`. Do not copy that table here.

## First release scope

This documentation site covers the repository's core areas:

- `platforms/claude/agents/` and `platforms/claude/hooks/`: Claude Code agent prompts plus hook configuration and scripts.
- `platforms/codex/agents/`: Codex agent templates. There is no `platforms/codex/prompts/`.
- `platforms/antigravity/commands/`: existing Antigravity command sources.
- `skills/`: the first-party skill catalog organized by category.

The third-party `npx skills add` CLI installs according to that CLI's targets. After clone, `just install-projects` is the local live-link installer. It writes to project `.agents/skills/` by default and links extra agent directories only when that agent root already exists. Destination maps in `scripts/install_projects.py` are not new-session discovery proof.

## Run locally

```bash
npm --prefix docs install
just docs
```

`docs/` is an isolated VitePress project. The repository root intentionally does not need a `package.json`.

## Validation entrypoints

Current `just ci` order:

```bash
just docs-check
just skills-check
just python-check
just python-test
just install-projects-test
just node-test
git diff --check
```
