# Integration fragments: auto-routing

For the parent task to merge into `SKILL.md` and `evals/evals.json`. This
subtask did not edit those files.

## 1. SKILL.md commands table: rows to add

Insert after the `show` row:

```markdown
| Read project signals (read-only JSON)                            | `python "<skill-dir>/scripts/design_catalog.py" signals --root "<project-root>"`             |
| Pick entries for a request (top 3, deterministic)                | `python "<skill-dir>/scripts/design_catalog.py" route --prompt "<request>" --root "<project-root>"` |
| Next three / filter / JSON                                       | `... route --reroll 1` / `--kind theme` / `--include-brands` / `--format json`              |
```

Replace the exit-code sentence under the table with:

```markdown
Entry ids are `brand:<slug>`, `style:<slug>`, `theme:<slug>`, or `scene:<slug>`. A bare slug works when it is unique; `claude` and `editorial` need the prefix. Exit codes: 0 success, 1 no search result or nothing routable, 2 bad input, 3 refused overwrite.
```

## 2. SKILL.md workflow step 3: replacement

Replace the whole step 3 block with:

```markdown
3. **Select an entry.**
   - The user names a brand, style, theme, or scene → `show` it.
   - The user names a scene and also a brand or style → list those candidates and wait for a choice. Do not merge two entry bodies into one `DESIGN.md`.
   - The user asks to compare or for a few options → `route --n 3`, give one reason each, and wait.
   - Otherwise (a mood, audience, industry, or no hint) → run `signals` and `route` with the user's words, **take #1 without waiting**, then put the Picks block (chosen entry and one-line reason, 2 alternates, how to switch) at the top of the reply and continue. On `confidence: low` still take #1, say the match is weak, and list the signals used. Headless runs take #1 and do not ask. Rules and template: `references/routing.md`.
   - For a list request, print the grouped `list` output (or a filtered part) and stop.
```

## 3. SKILL.md references table: row to add

```markdown
| `references/routing.md`            | no DESIGN.md and nothing named: auto-pick, Picks block, switching, compare requests |
```

## 4. evals/evals.json: cases to add

Ids are placeholders; renumber after the anti-slop cases land.

```json
{
  "id": 101,
  "prompt": "帮我给精酿啤酒厂做个官网，项目里还没有 DESIGN.md",
  "expected_output": "Skill confirms no DESIGN.md exists, runs signals and route with the user's words, takes the first pick without asking the user to choose, writes DESIGN.md with apply, shows a Picks block with the chosen entry, a one-line reason, two alternates and how to switch, then continues to implementation.",
  "files": [],
  "assertions": [
    "Runs design_catalog.py route through the skill-dir path with the user's request as --prompt",
    "Does not stop to ask the user to choose between candidates",
    "Outputs a Picks block naming the chosen entry with a reason, two alternates, and how to switch",
    "Writes DESIGN.md with the apply command for the first pick",
    "Continues to implementation after writing DESIGN.md"
  ]
},
{
  "id": 102,
  "prompt": "Build a landing page for our open-source CLI tool. No design system yet.",
  "expected_output": "Skill runs signals on the project root and route with the request, takes the top entry (for example theme:cobalt or theme:terminal) without waiting, writes DESIGN.md with apply, shows the Picks block with two alternates and the switch instruction, and continues to build the page.",
  "files": [],
  "assertions": [
    "Runs signals and route through the skill-dir path before choosing",
    "Does not wait for the user to pick an entry",
    "Outputs a Picks block with the chosen entry, one reason, two alternates, and how to switch",
    "Writes DESIGN.md with apply, not by hand-copying an entry file",
    "Mentions low confidence and the signals used when route reports confidence low"
  ]
},
{
  "id": 103,
  "prompt": "我在做一个儿童编程夏令营的报名页，给我推荐三个主题比较一下，我自己选",
  "expected_output": "Skill runs route with n 3, presents three entries with one reason each, and waits for the user's choice without writing DESIGN.md or editing code.",
  "files": [],
  "assertions": [
    "Runs design_catalog.py route with --n 3 or the default three picks",
    "Presents three entries with one reason each",
    "Waits for the user's choice",
    "Does not run apply or write DESIGN.md before the user chooses"
  ]
}
```

Existing eval 2 ("帮我挑一个合适的设计风格" … "waits for the user's choice") conflicts
with the new default. Update its `expected_output` and the assertion
"Offers 2-3 entries with one reason each and waits for a choice" to: runs
`route`, takes #1, shows the Picks block, writes DESIGN.md with `apply`.
