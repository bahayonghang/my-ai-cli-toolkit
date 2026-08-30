---
name: skill-session-review
description: >
  Analyze how an existing agent skill was used in past Claude Code, Grok, Codex,
  and Oh My Pi conversations. Use when the user asks to 分析某 skill 的使用情况,
  这个 skill 用着有什么问题, 根据历史对话反馈改进 this skill, review skill sessions,
  or write a session-review report. Writes reports/skill-session-review and a
  copyable qiaomu-meta handoff prompt. Do not use for skill usage counts,
  unused-skill cleanup, resuming a session, optimizing CLAUDE.md, creating a
  new skill, or applying qiaomu-meta edits.
version: 0.2.0
category: developer-tools-integrations
tags:
  - skills
  - session-review
  - claude-code
  - grok
  - codex
  - oh-my-pi
  - feedback
argument-hint: "[skill-name-or-path]"
allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py *), Bash(git rev-parse *), Bash(git check-ignore *)
metadata:
  owner: lyh
  review_cadence: quarterly
---

# Skill Session Review

In the commands below, `<skill-dir>` is this skill's base directory, announced when the skill loads. Substitute the literal path. On Windows, `py -3` may replace `python`.

Review how a **named existing skill** was followed in real sessions. Persist a
validated Markdown and self-contained HTML report package. Do not edit the
target skill. Do not call qiaomu-meta to apply changes.

## Hard gates

- Do not write inside the target skill directory.
- Do not emit `diff.patch` or edit `SKILL.md` of the target.
- Do not run qiaomu-meta as part of this skill.
- The only permitted side-effect types are two report artifacts, the repo-root
  `.gitignore` exact line through its independent helper, the governed
  `.input/<name>.json` through its input manager, and opening the generated HTML
  through `open_report.py`. The report-subtree helpers never modify `.gitignore`.
- Permitted side-effect types are not authorization. Before any one is used,
  follow the exact preview and confirmation gates below. The named report
  package, each replacement, and `.gitignore` are separate confirmations.
- The HTML report must be self-contained, with no external resource references
  or vendor promotion.
- Do not print full private chats in the conversation. The report uses short excerpts only.

## Workflow

1. Resolve the target. Path → that instance. Name → if more than one `SKILL.md`, list paths and stop.
2. Resolve the current repo root: `git rev-parse --show-toplevel` or an explicit root the user gave.
3. Scan sessions:

```text
python "<skill-dir>/scripts/scan_invocations.py" --skill-name <name> [--skill-path <abs>] --scope global --repo-root <abs>
```

Use `--scope cwd` only when the user asked to limit to this repository. Read [invocation signals](references/invocation-signals.md). Treat `loaded` and `available` as coverage, not as required-change evidence.

4. Apply the zero-sample gate before reading private session slices. When all
   four stores are `missing-store`, output `unrated: no-session-stores` plus the
   four-platform coverage/counts and stop. When stores are available but no
   session is `invoked`, output `unrated: no-invoked-sessions` plus the same
   bounded counts and stop. Do not read slices, construct review JSON, call a
   helper, write a file, calculate a mean/ratio/overall/grade, or open a browser
   on either branch.
5. With at least one invoked session, read the target `SKILL.md` (read-only) and
   invoked session slices. Score every invoked session with the
   [review scorecard](references/review-scorecard.md), and fill findings per the
   [finding contract](references/finding-contract.md). Set `language` from the
   user's request language and set `skill_name` to the same canonical basename
   later passed as `--name`. Fill the declared `aggregate`, including `overall`
   and `grade`; helpers revalidate and recompute it with Decimal.
6. Prepare authorization before running a side-effect helper:

   - If `reports/skill-session-review/` is not ignored, independently preview
     the complete candidate repo-root `.gitignore`, exact path, and create or
     replace effect. Obtain explicit confirmation before running
     `ensure_report_ignore.py`. Replacement also requires the current SHA-256.

     ```text
     python "<skill-dir>/scripts/ensure_report_ignore.py" --repo-root <abs> [--replace --expected-sha256 <gitignore-sha256>]
     ```

     Pass the complete candidate `.gitignore` through raw stdin. If the exact
     ignore line is already effective, the helper returns `unchanged` without a
     write or an authorization expansion.
   - Display the confirmed repo root, canonical name, exact
     `.input/<name>.json`, `<name>.md`, and `<name>.html` paths, plus exactly this
     effect sequence: create input → create Markdown → create HTML →
     proof-gated remove input → open HTML. Use `AskUserQuestion` or an equivalent
     explicit interaction to obtain one confirmation for this named report
     package. Freeze the authorization snapshot; any root, name, path, or effect
     drift invalidates it and requires a new preview and confirmation.
   - The package confirmation authorizes no-clobber creation, proof-gated input
     removal, and one open only. If any input or report target already exists,
     stop and separately show its exact path, current SHA-256, and replacement
     effect. Obtain a separate explicit confirmation for each replacement.

7. After confirmation, persist the validated JSON, render one artifact per
   writer call, prove both artifacts before removing the input, then open HTML:

```text
python "<skill-dir>/scripts/manage_review_input.py" create --repo-root <abs> --name <name>
python "<skill-dir>/scripts/write_session_review.py" --repo-root <abs> --name <name> --format markdown --review-json <abs-input-json>
python "<skill-dir>/scripts/write_session_review.py" --repo-root <abs> --name <name> --format html --review-json <abs-input-json>
python "<skill-dir>/scripts/manage_review_input.py" remove --repo-root <abs> --name <name> --expected-sha256 <input-sha256> --artifact-sha256 markdown=<md-sha256> --artifact-sha256 html=<html-sha256>
python "<skill-dir>/scripts/open_report.py" --repo-root <abs> --name <name>
```

   Pass the complete review JSON to input-manager `create` through raw stdin;
   only input-manager `create` and `replace` accept that payload. The report
   writer accepts neither report stdin nor the former `--input` path. The input
   manager, report writer, and opener use only canonical `--name`; the scanner
   in step 3 intentionally keeps `--skill-name`. Template and lifecycle:
   [report contract](references/report-template.md). Do not `git add`.

   Input and report creation is no-clobber. A confirmed replacement uses
   `replace --expected-sha256` for the input manager or
   `--replace --expected-sha256` for a report writer. Both report calls reuse and
   revalidate the same JSON. If either fails, retain the input and successful
   artifact, then retry only the failed format. If the target exists, repeat its
   separate replacement preview and confirmation. Remove the input only after
   both report hashes and the current input hash form complete proof. The remove
   helper acquires input, Markdown, and HTML destination leases in that order,
   revalidates every proof while all three are held, and binds deletion to the
   proved input identity. Lease contention or a late input/artifact replacement
   fails closed and preserves the unproved object; never bypass that result with
   a manual path deletion. Open HTML only after both reports succeed and input
   cleanup succeeds.

8. Chat output: one conclusion line, both report paths, the HTML `file://` URI,
   and one `text` fence with a filled [handoff prompt](references/handoff-prompt.md).
   If `open_report.py` returns `"opened": false`, say that the browser could not
   be opened automatically and tell the user to open the `file://` URI manually.
   Do not paste the SSR table. Do not write 见上一条消息.

## Routing

- Usage counts or unused-skill deletion: not this skill.
- Resume a previous chat: `resume-claude` / `resume-codex` / `resume-cursor`.
- Optimize CLAUDE.md or AGENTS.md: `claude-context-improver` / `agents-md-improver`.
- Create or rewrite a skill from materials: qiaomu-meta, in a later turn using the handoff prompt.
