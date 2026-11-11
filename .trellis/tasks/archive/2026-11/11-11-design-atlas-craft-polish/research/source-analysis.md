# Source analysis and adoption decisions

Date: 2026-11-11. Target baseline: design-atlas 0.5.0, repository HEAD 61ede6dc.

## Evidence boundary

Read https://x.com/jakevin/status/2120416309859021185 with ego-browser, task space 2. Extracted the rendered article body including sections 001–013, general principles, and seven Kaze mappings. This is Jakevin's secondary synthesis attributed to @Kubai087, not independent verification of Kubai's 168 posts, implementations, timings, browser versions, or claimed product behavior. The attached image was not visually inspected. No external code was downloaded or executed. Paraphrase ideas with attribution; do not vendor the article or assume a code license.

Exact values such as 220/1200/360ms menu delays, 10px × 0.7^n drag displacement, 42° page rotation, blur/saturation settings, Chromium version claims and texture-tool sliders are source examples, NOT validated universal defaults. Official compatibility checks and runtime evidence remain missing evidence.

## Existing owners inspected

- `skills/development-workflows/design-atlas/SKILL.md`: Workflow 6–8; Restyle/Audit branches; catalog is 202 entries, not a recipe library.
- `references/design-system-core.md` §§3–4,7: tokens, states, constant loading size, accessibility, icons.
- `references/implementation.md` §§1,4–6: existing token layer, motion specification, transform/opacity rule, runtime evidence.
- `references/restyle.md` §§3–8: eight dimensions, preservation, minimal changes, same-viewport verification.
- `references/anti-slop.md` §3 gates DA4–DA8,12,29,47a,47c,84 and §6: nested radii, progressive disclosure, icons, bounce/halo/mockup conflicts.
- `evals/evals.json`: repository behavior schema; validation is not model scoring.

## Keep / adapt / reject / invent

| Source mechanism | Current coverage / gap | Decision and destination |
| --- | --- | --- |
| Button tactile feedback and surface layers (#001) | States exist; no material-consistent recipe or interrupted-state guidance | Adapt as optional recipe: existing variants/tokens, stable box geometry, light/contact/ambient shadow roles. Flat themes need no bevel. Crossfade pre-rendered layers with opacity rather than animate shadows. |
| Safe submenu trajectory (#002) | No explicit pointer-intent guidance | Adapt in interaction reference; keyboard and touch alternatives mandatory. Timings are tunable examples, not golden constants. |
| ASCII / Dither (#003) | Existing texture reference | Defer detailed recipes; sliders are tool-specific. Only preserve principle that decorative texture stays subordinate to readable content. |
| Nested corners / continuous curvature (#004) | DA4 already owns radius relation | Keep DA4; no duplicate gate, no universal 4px grid or minimum radius. Optional feature detection; fallback radius remains usable. |
| Drag feedback (#005) | General motion spec only | Adapt insertion target, lift/drop/cancel feedback and keyboard equivalent. Defer exponential ripple choreography. |
| Book-card 3D (#006) | Repetitive hover effects discouraged; 3D asset work excluded | Defer; not a default polish step, no new 3D scope. |
| Mixed CJK/Latin typography (#007) | Wrapping and overflow partly covered | Adapt balance/pretty, tabular numbers, min-width:0, long-label and punctuation tests, language-scoped progressive enhancement. No mandatory BudouX dependency or universal keep-all. |
| Documentation scroll shell (#008) | Responsive rules exist | Defer specialized scroll persistence / outline algorithm; not general polish. |
| Floating UI / confirmation matrix (#009) | DA5 partial | Adapt Tooltip vs Popover vs Dialog/Drawer. Required information stays visible; reversible does not mean permission-free. No removal of consent/payment safeguards or invention of undo backend. |
| Six-layer liquid glass (#010) | Glass themes already exist | Optional low-cost surface recipe only; defer displacement maps, background sampling and blend-mode text. Never replace adaptive airy-glass palette or assert contrast over unknown backgrounds. |
| Role-based motion tokens (#011) | Duration/easing recorded but roles absent | Adapt entry/exit/reposition roles, interruption and reduced-motion behavior. Spring/overshoot stays optional, subject to gate 12 waiver; no blanket easing rewrite. |
| Chat grouping / stream stability (#012) | Loading size rule; streaming missing | Adapt stable input, scroll anchor and update behavior; meaningful content growth remains allowed. No hardcoded 4px/10px/200ms across themes. |
| AI Halo (#013) | Gate 29 flags halos; DA6 discourages idle decoration | Reject as default; defer special effect until explicit product need, contrast/performance evidence and allowed waiver. |
| Existing-library conservation | Token reuse present; API guarantee implicit | Keep and make explicit: variants/tokens first, API/props/semantics unchanged, no duplicate components or new dependency for polish. |
| Lightweight trigger → full panel | DA5 plus motion spec partially cover | Adapt continuity with trigger, intermediate/end state and dismissal; no hidden critical information. |
| Miniature browser SVG empty state | Conflicts with 47a/47c/84 and standalone SVG exclusion | Reject as universal recipe. Prefer truthful empty-state copy, real content or existing licensed asset; no fabricated product preview. |
| Day/night atmosphere and functional icons | Themes / DA8 partial | Adapt semantic surface and state roles; preserve readability, explicit icon meaning, no forced scenic illustrations. |
| Pinyin search, URL repair, Shift-click preview | Business functionality, not styling | Reject from this task. |

Original contribution (design advantage, not validated advantage): a style-preserving polish selection sheet and evidence ledger that selects only applicable mechanisms, links conflicts to existing gates, and compares baseline/candidate outcomes across unrelated UI types.

## Qiaomu-meta application

Use Production-level planning proportional to an existing public skill: lean entrypoint, earned references, trigger boundaries, output eval and honest handoff. Preserve repository identity, ownership, frontmatter and existing interface; do not rename to qiaomu-* or add unrelated copyright/manifest requirements.

Reference skill studied: installed `qiaomu-meta-skill` 2.8.1 (root, operating-modes, output-eval-method). Lesson: generalize behavior before promoting rules; separate source claims from verified behavior; distinguish static/schema tests from output quality. Existing `design-atlas` is the primary prior-art package; keep its routing, preservation and gate hierarchy. This is a bounded enhancement, not a new skill or substantial redesign, so catalog-wide prior-art discovery is not applicable to this planning turn. No skills.sh/SkillsMP candidate ranking, license audit or popularity-based quality claim is made. If implementation expands into a new engine/catalog/major redesign, perform qiaomu prior-art discovery first.

## Evidence to earn during implementation

- Official browser documentation and feature detection for any compatibility assertion actually retained.
- Original small fixtures, not copied source code: dense BI, mixed-language docs, streaming chat, flat/terminal UI, optional glass surface.
- Same inputs/viewports for baseline and candidate; keyboard, touch, reduced motion, interruption, long labels and fallbacks.
- Human aesthetic review remains missing evidence until recorded. Static reference tests cannot prove perceived quality or smoothness.
