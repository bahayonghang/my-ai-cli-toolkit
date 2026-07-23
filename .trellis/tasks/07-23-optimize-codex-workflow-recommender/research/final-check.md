# Final Trellis check

Checked: 2026-07-23

## Findings fixed

- Replaced broad `Bash(codex *)` and `Bash(git *)` grants with explicit
  read-only Codex inventory/help probes and read-only repository probes.
- Reworked six output-eval cases so each assertion combines short semantic
  anchors and each case forbids a material unsafe or incorrect behavior.
- Added contract guards against broad command families, one-anchor assertions,
  long required phrases, and cases with no forbidden behavior.
- Regenerated the affected scorecard, deterministic execution, Skill IR,
  compiler, conformance, trust, package, and generated-doc evidence.

## Verification

- Current Codex manual and local `codex-cli 0.145.0` confirm the dated roots,
  custom-agent schema, plugin-list semantics, and local/web scope split.
- Yao resource boundary: `999/1000`, no failure or warning.
- Target contract test: 7/7 pass.
- Output eval: 6 file-backed cases, baseline 0%, with-skill 100%.
- Deterministic command runner: 12/12 runs pass; it is not provider evidence.
- Declared conformance: OpenAI, Claude, and generic pass independently.
- Archive-only package verification: pass; disposable zip removed afterward.
- `just ci`: pass.

## Residual evidence

Provider/model execution, human blind adjudication, telemetry/adoption, registry
license readiness, installer permission-policy readiness, and the aggregate
five-target Review Studio mismatch remain explicit `missing evidence` or blocked
external/tool-scope conditions. No evidence or permission policy was fabricated.
