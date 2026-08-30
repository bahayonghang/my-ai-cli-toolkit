# Report contract

A rated review uses one validated JSON source and produces two deterministic
UTF-8 LF artifacts:

```text
<repo-root>/reports/skill-session-review/
├── .input/<name>.json
├── <name>.md
└── <name>.html
```

The input manager creates `.input/<name>.json` only after complete validation
and uses no-clobber by default. Both report writers reuse and independently
revalidate the same input. A failed report leaves the input and any successful
artifact in place for a targeted retry. The input manager removes the input only
after its current hash and the current Markdown and HTML hashes all match the
supplied proof while the input, Markdown, and HTML destination leases are held
in that fixed order. It binds removal to the proved input identity; lease
contention, proof drift, or a late input/artifact replacement fails closed and
preserves the unproved object. Replacements require
`--replace --expected-sha256` and a separate explicit confirmation of the exact
path, current hash, and effect.

Before any report-subtree write, removal, or browser open, preview the confirmed
repo root, canonical name, all three exact paths, and the complete effect
sequence: create input, create Markdown, create HTML, proof-gated remove input,
then open HTML. One explicit confirmation authorizes only that immutable named
package snapshot. Root, name, path, or effect drift invalidates it. A repo-root
`.gitignore` operation is previewed and confirmed separately under its general
governed-file contract.

## Review JSON schema

```json
{
  "schema_version": 1,
  "language": "zh",
  "skill_name": "",
  "skill_path": "",
  "scope": "global|cwd",
  "generated_at": "<ISO-8601>",
  "coverage": {
    "claude": { "status": "ok|missing-store", "invoked": 0, "loaded": 0, "available": 0 },
    "grok": {}, "codex": {}, "oh-my-pi": {}
  },
  "sessions": [
    {
      "id": "", "platform": "", "status": "invoked|loaded|available", "signal": "",
      "scores": {
        "execution_efficiency": {
          "label": "", "score": 0.0,
          "reason": {"sentences": [""], "locator": {"type": "session", "value": ""}}
        },
        "instruction_fit": {
          "label": "", "score": 0.0,
          "reason": {"sentences": [""], "locator": {"type": "session", "value": ""}}
        }
      }
    }
  ],
  "aggregate": {
    "execution_efficiency": 0.0,
    "instruction_fit": null,
    "overall": 0.0,
    "grade": "",
    "scored_sessions": 0,
    "failed_sessions": []
  },
  "findings": [
    { "id": "SSR-01", "verdict": "UPDATE SKILL|COMPLIANCE GAP|ONE-OFF|INCONCLUSIVE",
      "session_id": "", "platform": "", "evidence": "", "step_deviation": "",
      "user_correction": "", "gap": "", "suggestion": "" }
  ],
  "suggestions": [{ "finding_ids": ["SSR-01"], "clause": "", "why_filed": "" }],
  "not_filed": [{ "finding_id": "", "why_not": "" }],
  "unverified": [""],
  "reliable": [""]
}
```

`schema_version` is `1`. `language` is the required enum `zh` or `en` and is
chosen from the user's request language; renderers do not infer it. `scope` is
`global` or `cwd`. Coverage contains exactly `claude`, `grok`, `codex`, and
`oh-my-pi`; status is `ok` or `missing-store`, and counts are non-negative
integers. Session status is `invoked`, `loaded`, or `available`, but only invoked
sessions have scores. At least one invoked session is required. The canonical
`--name` and `skill_name` must match exactly.

Score labels, reason objects, aggregate computation, six-place Decimal
quantization, grade thresholds, and the zero-sample stop are defined by the
[review scorecard](review-scorecard.md). Finding fields, verdicts, promotion
rules, and exact suggestion/not-filed partition are defined by the
[finding contract](finding-contract.md). The input manager and each report
writer validate the complete schema, identity, cross-field rules, and secrets.

## Markdown layout

The Markdown report contains these registered sections in this order:

1. Header metadata: skill name/path, scope, generation time, and language.
2. Scorecard: raw means, curved values, `overall`, grade, scored-session count,
   and display-only invocation counts and ratio with the `available` caveat.
3. Coverage table for all four platforms.
4. Invocation list; invoked rows include both score labels, values, and reasons.
5. Findings.
6. Suggestions.
7. Not filed, including one reason for every finding not promoted.
8. Unverified.
9. Reliable.

## HTML layout

The HTML report contains the same header and eight registered sections. It is a
self-contained single file with inline CSS, no JavaScript, no external resource
references, no promotional content, and escaped interpolated values. Findings
use native `details` and `summary` elements. A `null` `instruction_fit` is shown
as insufficient evidence, never as `0.0`.

Section headings come from the shared language dictionary. Use the `language`
field to select Chinese or English headings. Keep field names stable.
