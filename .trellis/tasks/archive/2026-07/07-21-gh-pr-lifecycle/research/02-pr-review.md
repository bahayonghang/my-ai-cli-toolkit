# Research: PR Review Best Practices (Google eng-practices, Conventional Comments, approval semantics)

- **Query**: How to do a code review, what to look for, review speed, approve/request-changes/comment semantics, Conventional Comments
- **Scope**: external
- **Date**: 2026-07-21

## Findings

### The Standard of Code Review (the governing principle)

Google eng-practices (google.github.io/eng-practices/review/reviewer/standard.html):

- **Primary purpose:** ensure the overall code health of the codebase **improves over time**.
- **Approve once the CL definitely improves code health, even if it isn't perfect.** There is no "perfect" code, only better code. Seek continuous improvement, not perfection. Do not block a CL for days over non-important polish.
- **Nit prefix:** reviewers should prefix non-important polish comments with `Nit:` (or otherwise mark them non-mandatory) so the author knows they can choose to ignore them.
- **Style:** the style guide is the absolute authority; anything not in the style guide is personal preference and should match existing code.
- **Conflict resolution:** first seek consensus between author and reviewer; escalate (tech lead / maintainer / eng manager / team discussion) only if consensus fails. Don't let a CL sit because of an impasse.

### What Reviewers Look For (checklist)

Google eng-practices "What to look for" (google.github.io/eng-practices/review/reviewer/looking-for.html and /review/index.md):

| Dimension         | Question                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design**        | Most important. Do the pieces interact sensibly? Does the change belong here (vs. a library)? Does it integrate well? Is now the right time?                              |
| **Functionality** | Does it do what the author intended, and is that good for users (end-users and future developers)? Think about edge cases, concurrency problems, bugs visible by reading. |
| **Complexity**    | Could it be simpler? "Too complex" = can't be understood quickly, or invites bugs when others modify it. Watch for over-engineering / speculative generality (YAGNI).     |
| **Tests**         | Are there appropriate unit/integration/e2e tests, added in the same CL? Are the tests correct, sensible, useful? Will they actually fail when code breaks?                |
| **Naming**        | Clear names for variables, classes, methods?                                                                                                                              |
| **Comments**      | Clear and useful? Comments should explain _why_, not restate what the code does.                                                                                          |
| **Style**         | Follows the style guide?                                                                                                                                                  |
| **Documentation** | Did the author update relevant docs (READMEs, reference docs)?                                                                                                            |

### How to Navigate a Review (order of operations)

(google.github.io/eng-practices/review/reviewer/navigate.html)

1. Read the CL description — does the change even make sense? If it shouldn't exist, respond immediately with why (and suggest what to do instead) before reviewing code.
2. Look at the **main file(s)** (largest logical change) first — gives context and can surface major design problems early.
3. **Send major design comments immediately**, even before reviewing the rest — if the design is wrong, much of the other code will disappear anyway.
4. Then review remaining files in a logical sequence; reading tests first can clarify intent.

### Speed of Code Reviews

(google.github.io/eng-practices/review/reviewer/speed.html)

- Optimize for **team velocity**, not individual velocity. Slow reviews degrade code health and morale.
- **Respond within one business day** — if you can't do a full review, at least respond quickly. A typical CL should get multiple rounds of review within a single day. The concern is _response time_, not total time-to-merge.
- Always aim to **unblock the developer** — if a CL is too big to review quickly, ask the author to split it, or at minimum comment on the overall design and send it back.

### Approve vs. Request Changes vs. Comment (GitHub review states)

- **Approve** — you're satisfied the change improves code health and can be merged (possibly with unaddressed nits). Prefer approving with minor nits over blocking; trust the author to address them.
- **Request changes** — there are blocking issues that must be resolved before merge. On protected branches this can gate merge.
- **Comment** — general feedback without explicit approval or blocking (e.g. questions, drive-by observations, partial review).

### How to Write Review Comments

(google.github.io/eng-practices/review/reviewer/comments.md)

- Be kind. Explain your reasoning (the _why_ / best practice / how it improves code health).
- Balance giving explicit directions vs. just pointing out the problem and letting the developer decide — the latter helps them learn and often yields a better solution since they're closer to the code.
- **It's the developer's responsibility to fix the CL, not the reviewer's** — you're not required to write the solution.
- If you don't understand code, ask the author to explain — the right outcome is usually them _rewriting it more clearly_, not just explaining to you in the thread.
- Educational/non-critical comments should be prefixed `Nit:` or marked optional.

### Conventional Comments (making comment intent explicit)

(conventionalcomments.org)

Format: `<label> [decorations]: <subject>` followed by optional `[discussion]` (context/reasoning/next steps).

**Labels:**

| Label        | Meaning                                                                            | Blocks merge? |
| ------------ | ---------------------------------------------------------------------------------- | ------------- |
| `praise`     | Highlight something positive (leave ≥1 sincere praise per review; no false praise) | No            |
| `nitpick`    | Trivial, preference-based; non-blocking by nature                                  | No            |
| `suggestion` | Propose an improvement — be explicit about what and why                            | Usually no    |
| `issue`      | A specific problem; strongly recommended to pair with a `suggestion`               | Usually yes   |
| `question`   | Potential concern you're unsure about; ask for clarification                       | No            |
| `thought`    | An idea / reflection, non-committal                                                | No            |
| `chore`      | Request a minor non-code task (docs, deps, formatting)                             | No            |

**Decorations (in parentheses, comma-separated):**

- `(non-blocking)` — should NOT prevent acceptance (useful when the org treats comments as blocking by default).
- `(blocking)` — SHOULD prevent acceptance until resolved (useful when the org treats comments as non-blocking by default).
- `(if-minor)` — resolve only if the change turns out minor/trivial.
- Custom decorations seen in the wild: `(security)`, `(test)`.

Value: labeling forces the reviewer to clarify intent and level of concern; the author gets clear priority signals. Comments are also machine-parseable.

## Caveats / Not Found

- GitHub's review states (Approve/Request changes/Comment) semantics are standard product behavior; the exact merge-gating depends on branch protection config (see 03-pr-merge.md).
- Conventional Comments labels are a convention, not enforced by GitHub; some teams use a subset. Extended label sets (`bug`, `security`, `breaking`, `todo`, `note`) appear in community adaptations (orchestkit, pullpo).
