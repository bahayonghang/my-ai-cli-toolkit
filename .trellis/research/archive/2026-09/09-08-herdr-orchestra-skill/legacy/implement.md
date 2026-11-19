# Implementation plan: herdr-orchestra

1. After the final parent plan is approved, start this child and read its JSONL context, PRD, design and parent shared protocol. Dispatch `trellis-implement`; exclusive write ownership is this new source directory. Other workers may be present; do not revert their work.
2. Write the description first, then the lean workflow and `references/delegation.md`. Preserve the user-selected name and category. Use the reference audit to replace historical broken patterns semantically, not copy a 405-line prompt.
3. Add neutral interface, patterns/recovery and provenance with dated official URLs. Do not install the official herdr skill or modify a user's global copy.
4. Author trigger cases and H01–H12 output cases, including all relevant variants. Run qiaomu `trigger_eval.py` with an absolute cases path; inspect false positives semantically, do not tune away a real boundary error by adding phrase-specific vetoes. Record output review with actual candidate actions and verdicts; fixtures are not live tests.
5. Run qiaomu `validate_skill.py` and `export_skill_ir.py` from the installed meta package. Record actual README/manifest schema deviations under the repo convention; fix other task-caused issues. Keep initial root concise and all links resolvable.
6. Run `rtk proxy just skills-check`. Dispatch `trellis-check` to verify this child and the delegation contract. Do not add tests that only look for the implementation's own words.
7. Hand the checked delegation contract to the review child. Parent runs docs-sync and final CI after both packages are integrated; if this child is finished independently, run its required docs/CI gates before closeout.
8. Report live/runtime/installation tests as missing unless actually executed under scope. Do not start real model work merely to make a report green. Parent owns cross-child synthesis and final authorized delivery.

Commands from qiaomu use its resolved installed path and the absolute target package path, not project-relative `scripts/`. Command results must distinguish pass, actual failure, deliberate repo schema deviation and unrun evidence.
