# Integration fragments for SKILL.md and evals

Owner of SKILL.md / evals: merge these. Paths use `<skill-dir>` for the installed skill directory.

## SKILL.md: "Anti-slop Floor" summary (about 10 lines)

```markdown
## Anti-slop Floor

Every page this skill builds must pass `references/anti-slop.md`.

- Tiers: Floor (never waived), House and Reflex (fix, or waive in `DESIGN.md` with evidence and a reason about this page), Finish (judged, reported).
- Static check: `node "<skill-dir>/scripts/slop_check.mjs" <page-or-src-dir>`. Exit 0 = no open FAIL or REFLEX. Needs Node 20+.
- A `DESIGN.md` that declares a material (mono display, an eyebrow component, uppercase labels, its own gradient or Tailwind colour) turns the matching House/Reflex finding into WAIVED automatically.
- Waivers: one line per gate under `## Anti-slop Waivers` in `DESIGN.md`: `- waive <gate> · <evidence> · <reason>`.
- The script covers the mechanical gates only. Walk the judged checklist (`anti-slop.md` section 6) and run the fresh-context review (`references/review-prompt.md`) before reporting done.
- Never invent customers, metrics, quotes or people (`anti-slop.md` section 7).
```

## SKILL.md: workflow check step (insert after the runtime verification step)

```markdown
N. **Anti-slop check.** Follow `references/implementation.md` section 6: run
   `node "<skill-dir>/scripts/slop_check.mjs" <page-or-src-dir>` until it reports 0 FAIL; fix or waive every
   REFLEX in `DESIGN.md`; walk the judged checklist in `references/anti-slop.md` section 6; run the
   fresh-context review in `references/review-prompt.md` (mark `自检，非独立复核` when no subagent is available).
   Put the summary line, waivers and review verdict in the final report.
```

## SKILL.md: `audit <path>` branch (routing)

```markdown
### audit <path>

Report only; change no files.

1. Run `node "<skill-dir>/scripts/slop_check.mjs" <path> --json` (add `--scope component` for a component
   directory, `--scope app` for an app shell). Use `--design <file>` if `DESIGN.md` is not above `<path>`.
2. Walk the judged checklist in `references/anti-slop.md` section 6 against the source (and screenshots if a
   running page is available).
3. Report: the summary line; findings grouped by tier (Floor, House, Reflex) with file:line and the fix; judged
   items that fail; waivers in force and any rejected waiver NOTE lines. Do not edit code or `DESIGN.md`;
   offer the fixes as a list the user can approve.
```

Routing trigger words for audit: `audit`, `slop check`, `anti-slop`, `检查 AI 味`, `审查页面`, `去模板感检查`. Copy-only requests ("去 AI 味" on a paragraph of text, no page or path) are not design-atlas work; route to the `write` skill.

## evals/evals.json: audit case

```json
{
  "id": "audit-report-only",
  "prompt": "audit ./site — 看看这个落地页有没有 AI 模板味，先别改代码",
  "files": ["fixtures/audit-site/index.html", "fixtures/audit-site/DESIGN.md"],
  "expected_output": "Runs slop_check on ./site, reports findings by tier with file:line and fixes, walks the judged checklist, and changes no files.",
  "assertions": [
    "The agent runs `node \"<skill-dir>/scripts/slop_check.mjs\"` (or the installed path) on ./site",
    "The report lists Floor, House and Reflex findings with file:line",
    "The report mentions the judged checklist from references/anti-slop.md",
    "No file under ./site and no DESIGN.md is modified",
    "Fixes are offered as a list for approval, not applied"
  ]
}
```

A minimal `fixtures/audit-site/` can reuse `tests/fixtures/slop/slopped/` (index.html plus DESIGN.md).

## evals/evals.json: negative routing case

```json
{
  "id": "copy-deslop-routes-to-write",
  "prompt": "帮我把这段产品文案去 AI 味：『我们的平台无缝赋能每一个团队，释放无限潜能。』",
  "expected_output": "Not handled by design-atlas; routed to the write skill. No slop_check run, no DESIGN.md read or created.",
  "assertions": [
    "design-atlas does not run slop_check",
    "No DESIGN.md is created or edited",
    "The request is handed to (or answered as) the write skill"
  ]
}
```
