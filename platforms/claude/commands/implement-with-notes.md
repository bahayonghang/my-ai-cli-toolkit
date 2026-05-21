---
description: Implement a spec while maintaining a running implementation-notes.html log of design decisions, deviations, tradeoffs, and open questions
allowed-tools: Read(**), Write(**), Edit(**), Glob(**), Grep(**), Bash(*)
argument-hint: <SPEC_PATH_OR_DESCRIPTION>
---

## Usage

`/implement-with-notes <SPEC_PATH_OR_DESCRIPTION>`

`$ARGUMENTS` may be a path to a spec file, an issue reference, or an inline description.

## Objective

Implement the spec given in `$ARGUMENTS`. Throughout the work, maintain a running `implementation-notes.html` file at the project root that captures anything the user should know about how the implementation diverges from or interprets the spec.

The notes file is a deliverable, not a side artifact. It must stay in sync with the code at every checkpoint.

## What to Capture

Record only items the user could not derive by reading the diff. Four categories:

- **Design decisions** — choices made where the spec was ambiguous. State the question the spec left open and the answer chosen.
- **Deviations** — places where the implementation intentionally departed from the spec. Explain why.
- **Tradeoffs** — alternatives considered and the reason for the chosen path.
- **Open questions** — anything that needs user confirmation or revision before merge.

Do not record: routine implementation steps, restatements of the spec, log of files touched, or cosmetic refactors. Those belong in the diff or the commit message.

## Execution Rules

1. Resolve `$ARGUMENTS`:
   - If it is a path that exists, read the file as the spec.
   - Otherwise treat the argument as an inline spec description.
   - If the argument is empty, stop and ask the user to provide a spec.
2. Before writing code, scan the repository to understand the context the spec lands in. Identify the files that will change.
3. Create `implementation-notes.html` at the project root if it does not exist. Use the template in **Notes File Structure** below.
4. Implement the spec in small slices. After each slice that produces a non-obvious choice, append an entry to the relevant section of `implementation-notes.html` before moving on.
5. When a later slice invalidates an earlier note (e.g., an open question gets resolved, a deviation gets reverted), update the entry in place rather than appending a contradiction. Mark resolved open questions with `(resolved)` and a one-line outcome.
6. Treat `implementation-notes.html` as part of the change set. It must be saved before the task is reported complete.

## Notes File Structure

When creating the file for the first time, write this template verbatim and fill in the header fields:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Implementation Notes</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }
  h1 { border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
  h2 { margin-top: 2.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.3rem; }
  .entry { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-left: 3px solid #ccc; }
  .entry.decision { border-color: #4a90e2; }
  .entry.deviation { border-color: #e2884a; }
  .entry.tradeoff { border-color: #9b59b6; }
  .entry.question { border-color: #e74c3c; }
  .entry.resolved { border-color: #2ecc71; opacity: 0.7; }
  .meta { font-size: 0.85rem; color: #666; margin-bottom: 0.4rem; }
  code { background: #eee; padding: 0.1rem 0.3rem; border-radius: 3px; }
</style>
</head>
<body>
<h1>Implementation Notes</h1>
<p class="meta">Spec: <code>{{SPEC_REFERENCE}}</code> &middot; Started: {{START_TIMESTAMP}}</p>

<h2>Design Decisions</h2>
<!-- entries here -->

<h2>Deviations</h2>
<!-- entries here -->

<h2>Tradeoffs</h2>
<!-- entries here -->

<h2>Open Questions</h2>
<!-- entries here -->
</body>
</html>
```

Each entry takes this shape:

```html
<div class="entry decision">
  <div class="meta">{{TIMESTAMP}} &middot; <code>{{FILE_OR_SPEC_SECTION}}</code></div>
  <strong>{{ONE_LINE_TITLE}}</strong>
  <p>{{BODY — what was ambiguous/different/considered, and the resolution}}</p>
</div>
```

Replace the class with `deviation`, `tradeoff`, or `question` as appropriate. Add `resolved` alongside `question` once an open question is answered, and append a `<p><em>Resolved:</em> ...</p>` line.

Timestamps use `YYYY-MM-DD HH:MM` local time. `FILE_OR_SPEC_SECTION` is either a repo-relative path (e.g., `src/auth/session.ts`) or a spec section reference (e.g., `spec §3.2`).

## Output Requirements

On success, print:

- A short summary of what was implemented.
- The path `implementation-notes.html` and a count of entries by category (e.g., `2 decisions, 1 deviation, 0 tradeoffs, 3 open questions`).
- A bulleted list of any open questions still unresolved — these need user attention.

On failure or blocker, print:

- What was completed.
- What blocked further progress.
- The same path and entry counts so the user can review the notes already captured.
