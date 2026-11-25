# First-screen version comparison

We loaded the two exported skill directories in six new Codex CLI 0.172.0 sessions with gpt-6.2-astra and medium reasoning. Each run started in its own project and received two initial captures plus one [fixture request](../../../../../skills/development-workflows/design-atlas/tests/fixtures/task-aware/first-screen/README.md). The paired request text, project file hashes and first-screen PNG bytes matched. We used Windows Edge 158.0.4370.33, light theme, zoom 100%, 1× scale, empty query or closed booking panel, and initial document scrollTop 0. We checked the same local HTTP route in both project copies at 1280 × 800, 390 × 844 and 1440 × 900. The [session and measurement record](measurements.json) includes the two full commit IDs, absolute skill paths, source and result hashes, session IDs, rendered styles and interactions.

| Task | 0.7.0 baseline | Four-slice candidate | What the rendered comparison establishes |
| --- | --- | --- | --- |
| Index audit | [Actual answer](baseline-index.md) accepted 44b and the existing search. It scored 58 as pass using all 59 visible words. | [Actual answer](candidate-index.md) accepted 44b and F4 at #query and correctly marked 58 inapplicable on this wholly non-promotional page. | Both audits left the complete project byte-identical. Typing awl left just the piercing instructions and clearing restored the three original entries. Neither version proposed adding a CTA. [Filtered index](index-search.png) |
| Workshop restyle | [Actual answer](baseline-restyle.md) and [edit](baseline-restyle.patch) | [Actual answer](candidate-restyle.md) and [edit](candidate-restyle.patch) | 44b failed with #reserve at y=876.1 in the 800px desktop viewport. Both moved it to y=231.6 and kept a single real primary. Clicking opened the local preview, focused #seats and preserved the 1–4 limits and disclosure. The resulting desktop captures were pixel-identical. [Before](workshop-before.png) · [Both after](both-workshop-after.png) |
| Build tools.html with the project's DESIGN.md | [Actual answer](baseline-build.md) and [new page](baseline-build.patch) | [Actual answer](candidate-build.md) and [new page](candidate-build.patch) | Each added only tools.html. The contract and existing sources stayed byte-identical. Both built an ivory, ink and Georgia reading column. At 390 × 844 an awl search showed the pairing with the piercing technique. Clearing it restored the bone folder. The matched filtered captures are pixel-identical. [Both builds](both-tools-search.png) |

The finding on 58 concerns what the audit counted. Both versions already delivered usable navigation and preserved the notebook's design. The colour and directory runs exercise other gate subjects separately. The local booking fixture ends after quantity selection. No real reservation or payment was sent.

**Eval 40, original candidate response: partial.** The builder reported the visible button, keyboard and pointer activation, focused quantity field and 1–4 limits at two widths. Its [answer](candidate-restyle.md) omitted the gate ID 44b, the `fixed` result and any disclosure check. It claimed a passing independent visual review. The retained session events contain no identifiable reviewer verdict for that claim. The operator's [rendered replay](measurements.json) verified the fix and the disclosure, and the three separately recorded [operator review rounds](reviews.md) each returned `fix`.

The [first repair rerun](../review-calls.json) used the same uncoached request and original fixture. The builder again moved the real button and exercised the booking form at both widths, but its final reply again omitted 44b, `fixed` and the disclosure observation. Its report also scores **partial**.

The [final rerun and operator replay](../review-calls.json) retained the original prompt and input. The reply named 44b, `#reserve`, `fixed`, both before/after positions, focus, the quantity limits and the disclosure. Its claimed independent review has no identifiable verdict, so this run is scored as a self-check. All seven operator captures at the three viewport sizes matched the original paired candidate's first edit byte for byte.

## Reproduction

From the repository root, create the archives with the line endings used in the Windows runs:

```powershell
git -c core.autocrlf=true archive --format=zip --output="$env:TEMP/atlas68-baseline.zip" 493a1a3aaf7e6da98dc9cc34629b5a13affb5c86 skills/development-workflows/design-atlas
git -c core.autocrlf=true archive --format=zip --output="$env:TEMP/atlas68-candidate.zip" ed99d785da44b9fd3af67fa33439497f91bfe63e skills/development-workflows/design-atlas
```

Extract each archive separately. For each pair copy just the named fixture files **from the candidate archive** into two empty projects, then use the same request from the run record. The CRLF export reproduced every input hash in `measurements.json`. In each new session read the corresponding absolute SKILL.md first. Render the initial viewport before activating any control, exercise the task, and compare the entire project inventory and SHA-256 values. The paired outputs above are from the initial calls. Follow-up review edits are recorded separately.

## Independent review

The built tool index received `ship`. The workshop preview received `fix` in three rounds. The follow-ups clarified that the button opens a preview and surfaced invalid seat counts. The final reviewer still requested a clearer date and plainer workshop copy. These were sample-page findings. The original matched-pair changes, screenshots and results above precede the follow-ups. [Verbatim verdicts, retest and remaining findings](reviews.md)
