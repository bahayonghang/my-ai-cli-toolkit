# `platforms/codex/` Code Map

Use this map for `platforms/codex/**` navigation. Behavioral rules and local commands live in `platforms/codex/AGENTS.md` and the root `AGENTS.md`.

## Subtree Responsibility
Codex platform source assets: native subagent templates plus distributable rule guidance.

## Internal Routing
- `agents/` — Codex native subagent TOML templates and local README/eval notes.
- `agents/README.md` — handoff model, role boundaries, and verification guidance.
- `agents/*.toml` — reusable agent definitions.
- `rules/` — distributable Codex rule artifacts.
- `rules/AGENTS.md` — exported rule/persona guidance; source artifact in this repo, active guidance only after downstream installation.

## Key Files
- `agents/orchestrator.toml` — read-only planning/decomposition agent.
- `agents/coder.toml` — scoped implementation agent.
- `agents/frontend_ui.toml` — UI implementation agent.
- `rules/AGENTS.md` — Nekomata engineer output-style/rule artifact.

## Upstream and Downstream Boundaries
- Upstream: root `AGENTS.md`, root `code_map.md`, and `justfile` provide repository-wide commands and safety boundaries.
- Downstream: runtime tools or users may copy/link these files into project/user Codex locations.
- Docs: `docs/scripts/sync_docs_catalog.py` discovers platform assets for generated command/platform pages.

## Local Search Anchors
- `sandbox_mode` — agent execution boundary in TOML templates.
- `model_reasoning_effort` — role reasoning effort; prefer this over hardcoded model pins.
- `nickname_candidates` — alternate names for native subagent discovery.
- `Most Important:Always respond in Chinese-simplified` — exported rule-language anchor in `rules/AGENTS.md`.

## Generated or Ignored Local Paths
- No generated files are expected directly under `platforms/codex/`.
- Project-local activation state normally lives under ignored `.codex/agents/`, outside this source subtree.
