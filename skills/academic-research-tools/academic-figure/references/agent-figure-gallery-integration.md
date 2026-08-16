# AgentFigureGallery Integration

**AgentFigureGallery** is an optional external tool. It holds a local library of
scientific figure references, serves them in a browser, records the human
like / reject / select decision, and exports a reference bundle. The bundle then
guides the plotting code. **Call the CLI, never vendor the library.**

Every command, flag, and path below is transcribed from a local clone of
`Dsadd4/AgentFigureGallery` (MIT): `agentfiguregallery/cli.py`,
`skills/agent-figure-gallery/SKILL.md`, and `docs/HUMAN_PREFERENCE_LOOP.md`.

## Detection

Take this path only when **both** hold:

1. The CLI is available — `agentfiguregallery` is on `PATH`, or
   `python -m agentfiguregallery.cli` runs. Confirm with `agentfiguregallery doctor`.
2. The knowledge base root resolves — `AGENT_FIGURE_GALLERY_ROOT` or
   `DRAWING_KB_ROOT` points at the clone (`cli.py:145-150`). Without one of these,
   the CLI falls back to the package parent directory, which holds no assets.

**If either condition fails, continue with the normal modes.** The tool is not a
prerequisite. Do not install it, and do not block the figure on it. Report that
the reference workflow was skipped, then draw from `journal-specs.md` and a
library recipe.

## Six-step workflow

```bash
export AGENT_FIGURE_GALLERY_ROOT=/path/to/AgentFigureGallery   # step 1

agentfiguregallery query --task "Nature-style embedding map for cell atlas"   # step 2

agentfiguregallery gallery --plot-type embedding_plot \
  --task "Nature-style embedding map for cell atlas" --limit 50 --serve       # step 3
```

3. `gallery` creates a reference session, prints the session id, and serves the
   browser interface at `http://127.0.0.1:8765/` (`--host` / `--port` change it).
4. **The human marks the candidates in the browser.** This step needs a person.
5. Record the decision, then export the bundle:

```bash
agentfiguregallery prefer --session <session_id> --like E01 E02 --reject E04 --select E03
agentfiguregallery bundle --session <session_id> --copy-scripts
```

6. Read the bundle before you write or revise any plotting code:
   `outputs/reference_sessions/<session_id>/export_bundle/reference_bundle.json`.

`--session` accepts a bare session id or a path below the knowledge base root
(`server.py`, `resolve_session`). `prefer` also accepts `--clear`,
`--global-like`, `--global-reject`, and `--global-clear`. Each flag takes one or
more IDs.

## Preference semantics

| Value           | Meaning                                   | Scope                 |
| --------------- | ----------------------------------------- | --------------------- |
| `like`          | Useful for this task or plot type         | The session plot type |
| `reject`        | Not useful for this task or plot type     | The session plot type |
| `select`        | Use this candidate for the current action | This session only     |
| `global_like`   | Generally valuable, keep it visible       | All future sessions   |
| `global_reject` | Hide the candidate from later sessions    | All future sessions   |

A local reject keeps the plot type. A candidate that a person rejects for
`bar_chart` still appears under `multi_panel_figure`.

## Candidate IDs

A candidate has a **stable ID** with a family prefix, such as `BAR-…`, `HEAT-…`,
`BOX-…`, or `SCAT-…`. The browser also shows a short **session ID** such as `B01`
or `H03`.

**Record the stable ID in notes, captions, and commit messages.** The short ID is
valid inside one session only, so it does not identify the reference later.

## Bundle fields

The bundle carries the fields below (`docs/HUMAN_PREFERENCE_LOOP.md`, "Bundle
Contract"). Use the same list as a checklist when a person supplies reference
material by hand and no bundle exists.

- Selected candidate IDs
- Preview image paths
- Source repository metadata
- Source script paths, or the copied scripts from `--copy-scripts`
- Recommended template
- Recommended palette
- Plot-type self-check
- Upstream-agent prompt

## Rules that apply with or without the tool

1. **Get a reference before you write the final plotting code.** Do not draw
   first and search for a model afterward.
2. **Read the source script and the template. Do not infer from the screenshot
   alone.** A preview image does not show the rcParams, the tick direction, or
   the export settings. `docs/HUMAN_PREFERENCE_LOOP.md` states this rule for the
   upstream agent.
3. **When no candidate fits, ask the person to reject the poor ones and to
   generate a second gallery.** Do not force a bad reference.

The same two rules apply to the built-in references of this skill. See
`modes/from-image.md` for the reference-first rule, and
`modes/from-data.md#template-reuse-ladder` for how much of a template you may
keep.

## Limits

- **An unattended session cannot finish step 4.** The like / reject / select step
  needs a person at a browser. In an unattended run, stop after `gallery --serve`,
  give the person the URL and the session id, and hand the choice back. Do not
  invent a selection.
- The browser interface needs a local HTTP server, by default on
  `127.0.0.1:8765`. A blocked port stops the workflow.
- The minimal asset pack holds 284 candidates across 10 plot types. The full
  public pack holds 16,341 candidates and needs `setup --pack full-public`, which
  downloads from an external host.
- `install-skill --target claude-code` copies a wrapper skill into
  `~/.claude/skills/agent-figure-gallery` or `.claude/skills/`. That location is
  outside this repository. Do not run it as part of a repository task.

---

Source: `Dsadd4/AgentFigureGallery` (https://github.com/Dsadd4/AgentFigureGallery),
MIT License, commit `62f6094`. Reviewed 2026-08-16. This file describes the CLI
and the workflow; it copies no candidate assets, index data, or scripts. The
candidate records keep their own upstream provenance fields; check the upstream
license of a candidate before you reuse its code. See `attribution.md`.
