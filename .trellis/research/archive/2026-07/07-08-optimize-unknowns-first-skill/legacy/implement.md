# Implementation Plan: optimize-unknowns-first-skill

Design decisions are embedded in prd.md (R3 draft description in notes.md, R5 scale
shape); no separate design.md — this is skill-text restructuring plus metadata/eval
compliance, not system design.

Paths below are relative to repo root; `U/` = `skills/development-workflows/unknowns-first/`.
Run Python steps with a `PYTHONUTF8=1` prefix (Windows GBK guard).

## Ordered Checklist

### Step 1 — R1 + R2: frontmatter and interface file (P1)

- [ ] `U/SKILL.md`: add `category: development-workflows`, `tags` (4-6), `version: 0.1.0`
      (unquoted) to frontmatter; keep `allowed-tools` omitted.
- [ ] `git mv`-equivalent rename `U/agents/openai.yaml` → `U/agents/interface.yaml`
      (files are untracked, so a plain rename; content unchanged).
- Verify: `PYTHONUTF8=1 python scripts/check.py skills/development-workflows/unknowns-first --json`
  → `ok: true`, `warnings: []`; `ls U/agents/` shows only `interface.yaml`.

### Step 2 — R3: description rewrite (P1)

- [ ] Replace `U/SKILL.md` frontmatter `description` starting from the draft in
      notes.md: bounded triggers + Chinese trigger phrases + explicit non-triggers +
      spark / cold-shower / implementation-notes boundaries; drop "execution" catch-all,
      "start complex work", "improve a prompt".
- Verify: `PYTHONUTF8=1 python -c "import re,yaml;d=yaml.safe_load(re.match(r'^---\n(.*?)\n---',open('skills/development-workflows/unknowns-first/SKILL.md',encoding='utf-8').read(),re.S).group(1))['description'];print(len(d));assert len(d)<=1024 and '<' not in d and '>' not in d"`;
  manual read confirms non-triggers and the three boundaries are present.

### Step 3 — R5 + R8 + R6 + R7: SKILL.md body edits (P2/P3)

- [ ] Add a compact "Task Levels" definition (3-4 example levels + one judging question
      each) adjacent to the Expert Selection section; do not alter the existing
      hypothesis-stance text.
- [ ] Add a lite-mode output skeleton (or explicit no-template sentence) in Mode
      Selection / Output Shape.
- [ ] "During Execution": prefer the `implementation-notes` skill "if available",
      fallback to `references/implementation-notes-template.md`.
- [ ] "References, Prototypes, And HTML": mention `html-artifact` skill "if available",
      keep generic fallback and the "do not use HTML by default" rule.
- Verify: `grep -n "if available" U/SKILL.md` shows both routes;
  `grep -n "implementation-notes\|html-artifact" U/SKILL.md` non-empty; four-unknowns
  and step-10 stop text unchanged (`git diff` review once tracked / manual diff).

### Step 4 — R4: evals (P1)

- [ ] Create `U/evals/evals.json`: convert the 5 cases from
      `U/references/test-cases.md` (schema: `{skill_name, evals:[{id, prompt,
    expected_output, files, assertions[]}]}`; prompts natural language,
      expected_output/assertions English; fix test 1's "medium" → full/lite terms).
- [ ] Add ≥2 routing negatives (→ spark; → cold-shower).
- [ ] Delete `U/references/test-cases.md`.
- Verify: `PYTHONUTF8=1 python -c "import json;d=json.load(open('skills/development-workflows/unknowns-first/evals/evals.json',encoding='utf-8'));assert d['skill_name']=='unknowns-first' and len(d['evals'])>=7 and all(set(e)== {'id','prompt','expected_output','files','assertions'} for e in d['evals'])"`;
  `grep -ri "medium" U/` → nothing; `ls U/references/` no test-cases.md.

### Step 5 — R9: suite membership (P3)

- [ ] Add `unknowns-first` to the member list in
      `skills/development-workflows/AGENTS.md` (keep alphabetical position within the
      quoted list).
- Verify: `grep -n "unknowns-first" skills/development-workflows/AGENTS.md`.

### Step 6 — R9 + R10: docs sync, CI, commit (P1)

- [ ] Confirm clean tree apart from this task's changes (docs-sync reverts uncommitted
      docs/ hand-edits — see memory note).
- [ ] `just docs-sync`; confirm docs catalog now includes unknowns-first.
- [ ] `just ci` passes (docs-check, skills-check, python-check, node-test, diff --check).
- [ ] Commit per repo convention (Chinese Conventional Commits, `feat(skills):` for the
      skill + docs output; `[AI]` tag per git-commit skill).
- Verify: `git ls-files skills/development-workflows/unknowns-first` lists SKILL.md,
  agents/interface.yaml, evals/evals.json, references/implementation-notes-template.md,
  references/prompt-template.md; `just ci` exit 0.

## Rollback points

- Steps 1-5 touch only `U/**` plus one line in `skills/development-workflows/AGENTS.md`;
  files are untracked until Step 6, so rollback = restore from this task's audit
  baseline (notes.md documents original state; original openai.yaml content is quoted in
  the audit conversation and identical to interface.yaml target).
- If docs-sync produces unexpected churn, drop the docs changes and re-run on a clean
  tree before commit.

## Review gates

- After Step 2: routing-surface re-read against near-neighbor boundary map in notes.md.
- After Step 4: spot-check that each assertion is checkable from response text alone
  (no fabricated evidence).
- Before Step 6 commit: full `git diff` review — every changed line must trace to a PRD
  requirement (surgical-edit constraint).
