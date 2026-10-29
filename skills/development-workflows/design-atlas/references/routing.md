# Routing: picking an entry when the user did not name one

Use this when the project has no `DESIGN.md` and the user did not name a brand,
style, theme, or scene. Replace `<skill-dir>` with the skill directory path
announced when the skill loads.

## Commands

```bash
python "<skill-dir>/scripts/design_catalog.py" signals --root <project-root>
python "<skill-dir>/scripts/design_catalog.py" route --prompt "<the user's request>" --root <project-root>
```

- `signals` is read-only. It reads `package.json` (name, description, keywords,
  dependencies), `pyproject.toml`, `Cargo.toml`, the first 4 KB of the README,
  CSS token blocks (`:root`, `@theme`, `[data-theme]`), Tailwind config, and
  whether `DESIGN.md` exists. Anything missing or unreadable is listed in
  `notes`.
- `route` prints the top 3 with a score breakdown
  (`kw`, `genre`, `scene`, `palette`, `deps`), the matched keywords, and
  `confidence: high|low`. Options: `--n N`, `--reroll K` (skip the entries
  from the first K rounds), `--kind style|theme|scene` (repeatable),
  `--include-brands`, `--format json`.
- The result is deterministic: same prompt, same project root, same reroll →
  same output. Exit 0 with picks; 1 only when nothing is routable (for example
  a `--reroll` past the end); 2 for bad arguments.
- Brands are not routed by default. A named brand goes through `show` /
  `apply` and the brand boundary, not through `route`.

Pass the user's own words as `--prompt`, in the language they wrote. Chinese
keywords match as substrings; English keywords match on stemmed words. Project
text counts at half weight, so the user's words win.

## Decision rules

| Situation | Action |
| --- | --- |
| No DESIGN.md, nothing named (default) | Run `route`, take #1, run `apply`, show the Picks block, continue implementing. Do not wait. |
| `confidence: low` | Still take #1 and continue. Say the match is weak in the Picks block and list the signals used. |
| User asks to compare, or "recommend a few" / "给我几个选择" | Show the top 3 from `route --n 3` with one reason each, then wait for a choice. |
| User names a scene and also a brand or style | Do not route. List the candidates and wait (existing rule). |
| User names one brand, style, theme, or scene | Do not route. `show` / `apply` that entry. |
| Headless or batch run (no one to answer) | Take #1. Do not ask. |
| DESIGN.md already exists | Do not route. Implement from it unless the user asked to change it. |

## Picks block

Put this at the top of the reply, before the implementation work:

```text
Picks
- Chosen: theme:hedgerow (Hedgerow) — brewery and 精酿 match; dark leaf-green paper suits a distillery.
- Alternates: 2. theme:vellum (Vellum) · 3. theme:solstice (Solstice)
- Switch: say "换成 2" / "switch to 2", or name any entry. DESIGN.md is replaced with --force.
```

- The reason is one line. Use the `fits:` keywords from `route` plus one
  phrase about the material.
- Alternates are #2 and #3 from the same `route` run. They come from
  different clusters, so they are real alternatives.
- When `confidence` is `low`, add one line:
  `- Match: weak (signals: <signals_used or "prompt only">). Confirm or name another entry.`
  In Chinese: `- 匹配度：低（依据：…），建议确认，或直接点名其他条目。`

## Switching

- "换成 2" / "switch to 2": `apply <id of #2> --root <project-root> --force`.
  The old file is kept as `DESIGN.md.bak-<timestamp>`.
- "show me others" / "再换一批": `route ... --reroll 1` (then 2, …), and present
  the new three.
- Any named entry: `show` it, then `apply ... --force`.

## How scores are built

- `kw`: sum of matched keywords. A keyword rare across routable entries is
  worth more (document frequency ≤ 2 → 3, ≤ 4 → 2, else 1). Matches only in
  project text count half.
- `genre`: +2 when the entry's genre matches the inferred genre, −1 otherwise.
  Genre comes from words such as SaaS / API / 后台 (modern-minimal), AI /
  video / 语音 (atmospheric), kids / game / 儿童 (playful); editorial is the
  default when nothing fires.
- `scene`: +4 for a scene entry with `kw ≥ 3`.
- `palette`: +1 when the project's existing paper token is in the same
  lightness band (light / mid / dark) as the entry.
- `deps`: +1 when dependency hints (charts → dashboard, docs frameworks →
  docs, commerce SDKs → buy) overlap the entry's keywords.
- Ties break on a hash of prompt, project folder name, and entry id.
- Picks: #1 is the top score; #2 prefers a different paper band within 2
  points; every pick has a different cluster.

Routing metadata lives in `assets/catalog/overlays/routing.json`. Theme genre,
axes, and English keywords come from the hallmark index; the overlay adds
Chinese keywords and clusters.
