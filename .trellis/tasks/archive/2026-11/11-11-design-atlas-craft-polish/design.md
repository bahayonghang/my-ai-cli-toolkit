# Technical design

## Boundary and architecture

Enhance the existing skill rather than creating a sibling skill, catalog style, detector engine or required dependency. `DESIGN.md` remains the project design authority; existing Floor/House/Reflex/Finish ownership remains unchanged.

Flow: existing build/restyle/audit route → existing design source → applicability selection → existing tokens/components → runtime state checks → existing anti-slop review → evidence report. Audit remains read-only. A polish request is not permission to alter business logic.

## Resource ownership

- `SKILL.md`: one short integration hook in implementation/verification plus a reference-map entry. No embedded recipe encyclopedia or new routing surface by default.
- New `references/craft-polish.md`: sole owner of the applicability sheet, mechanism recipes and output-evidence checklist. Load only for relevant build/restyle polish or audit findings.
- `references/design-system-core.md`: retain foundations and add only links or missing invariants, particularly existing component API/semantics preservation.
- `references/implementation.md`: integrate role-based motion, interruption, state verification and reference dispatch. Keep transform/opacity restriction; shadow/material transitions use opacity layers when appropriate.
- `references/restyle.md`: link the polish pass after diagnosis; preserve Keep list and fewest-highest-impact changes.
- `references/anti-slop.md` / `references/review-prompt.md`: link judged evidence if necessary, without new gate ids or changed detector semantics. DA4/DA5/DA6/DA8 retain ownership.
- `README.md` and existing `agents/interface.yaml`: update only when the externally described behavior needs alignment. Avoid frontmatter expansion unless needed for accurate routing; versioning follows actual shipped change.
- `evals/evals.json`: append behavior cases using the repository assertions schema.
- `tests/test_craft_contract.py` (proposed): small deterministic resource connectivity/boundary checks; no assertion that textual keyword presence proves visual quality.
- Task `research/`: source decisions, qiaomu IR/trigger/output reports and limitations. Do not add a package manifest solely to satisfy external tooling.

## Applicability and recipe contract

For each selected mechanism record: observed problem and selector/state; why it fits DESIGN.md; existing component/variant/token to extend; trigger and end state; allowed animated properties and role token; interruption/cancel behavior; focus/touch/reduced-motion behavior; unsupported-feature fallback; verification evidence. Unselected mechanisms receive a short n/a reason, not forced implementation.

Core mechanisms: mixed-language readability, numeric/streaming stability, semantic overlay selection, role-based state motion, component-system conservation. Optional adapters: surface layering, tactile press feedback, pointer safe zone, drag feedback, subtle continuous curvature. Source-specific decoration remains deferred.

Preserve distinction between transition continuity and animation: functional continuity may be achieved with immediate changes when reduced motion is requested. Keep focus rings immediate. Do not translate overshoot into a mandatory token or waive gate 12 automatically.

Tooltip contains noninteractive supplemental text and works on focus. Actions require a suitable interactive popover. Dialog/drawer choice follows task length, context and focus management. Existing permission and undo semantics are not altered by the style layer. Pointer-safe menu behavior must not delay keyboard operation.

## Evaluation design

Five unrelated fixture scenarios: dense BI with changing numbers; mixed CJK/Latin documentation with long titles; streaming chat with scroll-away behavior; existing flat/terminal app; a glass-style settings surface. Include positive, counterexample and explicit non-applicable mechanisms. Add near-neighbor negatives for standalone SVG asset generation and backend search/URL repair, preserving existing report/mockup routing negatives.

Compare baseline 0.5.0 and candidate under the same prompt, assets, viewport, state and runtime. Record commands, environment and model/provider only if actually used. Functional checks: keyboard/touch access, semantic overlay content, immediate focus, interruption, reduced motion, fallback readability and no unintended scroll jumps. Screenshot comparison alone cannot establish dynamic correctness.

Aesthetic rubric: preserved design identity; feedback clarity; type/spacing legibility; restrained surface depth; continuity without distraction. Use anonymized A/B artifacts with separate answer key and reviewer decisions if human review is available. No fabricated winner or combined score from pending cases. Deterministic tests and replay fixtures remain recorded_fixture evidence only.

## Compatibility and rollback

No catalog content, palette algorithm, public CLI, exit code or dependency changes. CSS improvements are progressive enhancements with baseline fallbacks, verified against official docs before retaining version claims. Rollback is a scoped revert of references/evals/tests and generated docs from this task; no runtime state migration.

## Qiaomu-specific gate mapping

Production-level package improvement, adapted to repository conventions. Use domain-specific trigger concepts if testing the description; do not reuse skill-authoring concepts. Export IR as evidence without filling null metadata by hand. Record manifest/README validator convention mismatches where applicable; repository checks remain authoritative. No publication workflow, naming/ownership replacement or remote action is authorized.
