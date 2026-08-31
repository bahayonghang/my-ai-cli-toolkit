# Prior-Art Research

- Researched at: 2026-08-31
- Queries: `plan review handoff confirmation questions`; `AskUserQuestion plan revision`; `independent spec review do not fix`; `structured user question after review`
- Catalogs: SkillsMP ok (31 families); skills.sh `missing evidence` (Windows `npx` FileNotFoundError; runner used `--skip-skills-sh`)
- Rating evidence: unavailable
- Dual-catalog dedup: `missing evidence`
- Source JSON: `research/prior-art-candidates.json`

| Candidate | Relevance | skills.sh installs | SkillsMP repo stars | Quality/trust evidence | Adopt | Reject | License |
|---|---|---:|---:|---|---|---|---|
| anthropics/claude-code command-development | description names AskUserQuestion in generated commands | missing evidence | 143448 (parent repo) | first-party Claude Code docs; body is slash-command authoring | adapt: generated/handoff text is instructions TO the next agent and must name the tool | reject: command file format, plugin root, `$ARGUMENTS` | unknown / Anthropic product docs |
| pcvelz/superpowers specifying-gates | closest specialist: AskUserQuestion then write answers into task metadata | missing evidence | 1260 (parent repo) | source SKILL.md inspected 2026-08-31; skip when already concrete; cap 4–5; does not run verification | adapt: labeled options, write-back, skip-if-resolved, question cap | reject: one-question-at-a-time; metadata-only; verification-gate domain | unknown |
| obra/superpowers executing-plans | written plan executed in a later session; raise concerns before starting | missing evidence | 279573 (parent repo) | source SKILL.md inspected 2026-08-31 | adapt: review/repair stays separate from implementation start | reject: “raise concerns” as unstructured chat; then implement in the same skill | unknown |
| alirezarezvani/claude-skills interview | batch intake via AskUserQuestion | missing evidence | 25242 (parent repo) | description only | adapt: structured slots with options | reject: founder/product interview, not reviser start-front | unknown |
| brycewang-stanford humanize | mandatory AskUserQuestion every pass | missing evidence | 3592 (parent repo) | ceremonial checkpoints | none | reject: opposite of negative gate | unknown |
| local code-auditor | independent review, do not apply fixes | n/a | n/a | `SKILL.md` Independent Reviewer Stance | keep: reviewer does not edit the subject | reject: no handoff-repair contract | MIT (repo) |
| local spark | names `request_user_input` / `AskUserQuestion` / plain fallback | n/a | n/a | `skills/development-workflows/spark/SKILL.md:42` | adapt: host-actual tool name + no-tool fallback | reject: one blocking question at a time | MIT (repo) |
| local trellis-plan-review 0.4.0 | revise-only handoff, forbids start | n/a | n/a | current package | keep: reviewer read-only; one report + one handoff; no start | reject: leaving dump-and-wait unstated | MIT (repo) |
| local 08-31-goal-meta-ask-confirm | same screenshot failure in generated `/goal` | n/a | n/a | sibling planning task | keep: dump-forbidden + batch + negative exclusions; start lives in `/goal` | reject: editing goal-meta in this task; copying start-authorization into plan-review | MIT (repo) |
| openclaw auto-qa / ECC santa-method | keyword hits on independent review | missing evidence | parent-repo stars only | description-only; autonomous fix campaigns | none | reject: popularity collisions; opposite of “do not fix” | unknown |

Keyword collisions not shortlisted: OpenClaw release/plugin testers, React compiler `plan-update`, n8n intent-recognition, OpenDesign financial review, command-development mirrors.

## Keep / adapt / reject / invent

- **keep**: reviewer independence (code-auditor + current hard gates); one scope → one report → one handoff; `task.py start` forbidden in this skill; 08-31 owns start-in-`/goal`; negative question exclusions (repo-answerable facts, ordinary implementation details, ceremonial asks).
- **adapt**: Anthropics “name the tool in generated text” onto the handoff fence; specifying-gates write-back + skip-if-resolved + labeled options + cap 4; spark host-actual names (`AskUserQuestion` / OMP `ask` / Codex `request_user_input` or live equivalent) + one numbered fallback; executing-plans split between plan repair and later implementation.
- **reject**: one-question-at-a-time inside the reviser handoff; mandatory questions every pass; granting `AskUserQuestion` to the reviewer; reviewer rewriting the plan; auto-`start` from this skill; OpenClaw-style autonomous fix loops.
- **invent**: positive call duty on the **handoff reviser** (must invoke, must not dump-and-wait) so one revision session writes TPR fixes and user-owned answers, leaving an implementation-ready plan without a reminder chat turn.

## Original contribution

A copyable Trellis plan-review handoff that already knows *not to start* and *not to invent routes* must also know *to ask with the host tool* when user-owned confirmation options remain after (or while) applying TPR items.

## Created skill advantages (planned)

- Design advantage: dump-forbidden + one-batch write-back in the reviser prompt, while the reviewer stays read-only.
- Validated advantage: none yet; Node contract tests and `evals.json` fixtures are planned, not run.
- Hypothesis: revisers will stop waiting for “请使用 AskUserQuestion” reminders. Provider compliance remains `missing evidence`.

## Missing evidence

- skills.sh installs and dual-catalog merge
- provider-backed Claude/Codex/OMP runs of the new handoff
- human blind review, fresh-Agent handoff, reminder-rate telemetry
- licenses of inspected third-party skills beyond SKILL.md/description reads
