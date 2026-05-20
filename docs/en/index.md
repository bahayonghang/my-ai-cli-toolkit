---
layout: home

hero:
  name: My Claude Code Settings
  text: Cross-platform AI content repository
  tagline: Installable skills, platform commands / prompts / agents / rules, and runtime hooks.
  actions:
    - theme: brand
      text: Browse Skills
      link: /en/skills
    - theme: alt
      text: View Hooks
      link: /en/hooks

features:
  - title: Content stays in content/
    details: Runtime assets remain under content/; docs/ only documents and navigates the repository.
  - title: Platform-aware layout
    details: Antigravity and Claude use commands, while Codex currently uses prompts, agents, and rules.
  - title: Locally verifiable
    details: just ci validates skill metadata, Python scripts, Node tests, and whitespace checks.
---

## First release scope

This documentation site covers the repository's three core areas:

- `content/hooks/`: Claude Code hook configuration and scripts.
- `content/platforms/`: platform-specific commands, prompts, agents, and rules.
- `content/skills/`: the first-party skill catalog organized by category.

## Run locally

```bash
npm --prefix docs install
just docs
```

`docs/` is an isolated VitePress project. The repository root intentionally does not need a `package.json`.

## Validation entrypoints

```bash
just skills-check
just python-check
just node-test
just ci
```
