# Review scorecard

Score only sessions whose scanner status is `invoked`. The two dimensions use
closed, dimension-specific label sets; a label always maps to exactly one score.

## `execution_efficiency`

| label | score | description |
| --- | ---: | --- |
| `highly_efficient` | 1.0 | Reached the requested result directly, with timely validation and no material rework. |
| `mostly_efficient` | 0.8 | Reached the result with limited avoidable repetition, correction, or late validation. |
| `mostly_inefficient` | 0.4 | Required material rework, repeated correction or search, serial work that should have been batched, or validation that came too late. |
| `highly_inefficient` | 0.2 | Repeatedly retried in place, missed decisive corrections or checks, or failed to reach the result efficiently. |

`insufficient_evidence` is not valid for this dimension.

## `instruction_fit`

| label | score | description |
| --- | ---: | --- |
| `fit` | 1.0 | The skill text covered the judgments the session needed without forcing an inappropriate path. |
| `misfit` | 0.2 | At least one judgment that the skill should have supplied was missing, wrong, or too rigid, so the session had to discover it or the user had to correct it. |
| `insufficient_evidence` | 0.5 | The session does not show enough evidence to determine whether the skill instructions fit. |

Only `instruction_fit=insufficient_evidence` is excluded from a dimension mean;
it is not treated as zero. If every scored session has this label, the
`instruction_fit` mean is `null` and the report explains that limitation under
`unverified`.

## Session reasons and failures

Each score has a structured reason:

```json
{
  "sentences": ["One concrete reason.", "One causal or repairable mechanism."],
  "locator": {"type": "session", "value": "<current-session-id>"}
}
```

- `sentences` contains one to three non-empty single-line strings. Array items,
  rather than punctuation, define sentence count.
- `locator.type` is `session` or `excerpt`. A session locator must equal the
  current session id exactly. An excerpt is a redacted string of 1–200 Unicode
  characters and follows the excerpt rules in [finding contract](finding-contract.md).
- The writer enforces structure and locator identity. Manual review separately
  checks that the locator supports the stated behavior, that the reason does not
  merely repeat the label or score, and that it identifies both a causal
  mechanism and a repairable instruction, workflow, tool, or validation lever.

`failed_sessions` contains every invoked session with at least one countable raw
dimension score below `0.5`. `instruction_fit=insufficient_evidence` is not a
failure.

## Aggregate and grade

The aggregate has two dimensions and no third scoring item:

```text
curve(s) = 0.5 + 0.5 * s

overall = (0.5  * curve(execution_efficiency_mean)
         + 0.35 * curve(instruction_fit_mean)) / 0.85
```

When `instruction_fit_mean` is `null`, aggregation substitutes the raw value
`0.5` and the report records the limitation under `unverified`. Invocation
counts and `invoked/(invoked+loaded+available)` are display-only diagnostics and
never enter `overall`. `available` includes Codex sessions in which the complete
skills catalog was injected, so the ratio is not a quality metric and must not
be compared across skills.

| minimum overall | grade | minimum overall | grade | minimum overall | grade |
| ---: | --- | ---: | --- | ---: | --- |
| 0.97 | A+ | 0.87 | B+ | 0.77 | C+ |
| 0.93 | A | 0.83 | B | 0.73 | C |
| 0.90 | A- | 0.80 | B- | 0.70 | C- |
| 0.60 | D | 0.0 | F | | |

Because `curve` maps the raw score range `[0.2, 1.0]` to `[0.6, 1.0]`, the
reachable `overall` range is `[0.6, 1.0]`; reachable grades are `D` through
`A+`, and `F` is unreachable. A `D` therefore does not mean a score near full
marks.

## Validation and bounded stop

The input manager and each report writer receive a validated canonical `--name`
and require `review.skill_name` to match it exactly. They reject zero invoked
sessions, `scored_sessions == 0`, a zero invocation-ratio denominator, invalid
dimension labels, label/score mismatches, or an inconsistent declared
`aggregate`.

JSON floating-point values are parsed with `Decimal`. The canonical computation
quantizes the dimension mean, then each `curve`, then `overall` to six decimal
places using `ROUND_HALF_UP`; the grade is selected from the quantized
`overall`. Reports always display six decimal places. Agent-supplied numeric
values are declarations checked under the same quantization rules, not an
alternative score source.

At least one `invoked` session is required before scoring, constructing review
JSON, writing reports, or opening a browser. When every session store is
missing, stop with `unrated: no-session-stores`; otherwise, zero invoked sessions
stop with `unrated: no-invoked-sessions`. Neither branch computes a mean,
`overall`, grade, or ratio, and neither creates an input or report.
