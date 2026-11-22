# Touying 0.8.0 Graded Examples

Open the tier closest to your task before authoring or refactoring a `.typ` deck:

| Tier | Path | Features Demonstrated | Verify Command |
| --- | --- | --- | --- |
| Tier 1 | [01-minimal.typ](01-minimal.typ) | Minimal `simple-theme`, `config-info`, `#pause`, mixed grid topology, `#speaker-note` | `python scripts/touying_check.py compile examples/01-minimal.typ` |
| Tier 2 | [02-multi-file/main.typ](02-multi-file/main.typ) | `globals.typ` + `main.typ` + `content.typ`, `metropolis-theme`, `#outline-slide`, `config-info(contact:, extra:)`, `#show: appendix` | `python scripts/touying_check.py compile examples/02-multi-file/main.typ` |
| Tier 3 | [03-animations-waypoints-math.typ](03-animations-waypoints-math.typ) | `#jump`, `#item-by-item-fn("current-highlight")`, `#touying-raw`, hierarchical `#waypoint` (`<phase:a>`, `<phase:b>`), `#animate` / `#animate-hidden` + `swap(..., stretch: true)`, `#touying-render`, `#touying-recall(subslides: ...)`, native `$ frac(...) $` / `$ mat(...) $`, `alpha-changing-cover` & `color-changing-cover` | `python scripts/touying_check.py compile examples/03-animations-waypoints-math.typ` |
| Tier 4 | [04-multi-mode-article.typ](04-multi-mode-article.typ) | Single source compiled to `presentation`, `handout`, and `article` via `--input export-mode=...`, `themes.article.article-theme`, `config-article`, mode wrappers & `<touying:...>` labels, `handout-subslides: -1` | `python scripts/touying_check.py compile examples/04-multi-mode-article.typ --modes presentation,handout,article` |
| Tier 5a | [05-theme-notes.typ](05-theme-notes.typ) | Custom theme with `touying-slide(setting: ...)`, `touying-fn-wrapper-raw`, `<touying:hidden>`, `utils.page-args-from-aspect-ratio`, custom `notes-fn` on `touying-notes`, second-screen via `utils.get-input(key: "notes-pos")` | `python scripts/touying_check.py compile examples/05-theme-notes.typ` |
| Tier 5b | [06-bundle-pdfpc.typ](06-bundle-pdfpc.typ) | Top-level `#pdfpc.bundle-assets()` outside `#document("deck.pdf", [...])`, `pdfpc.config(...)`, `#speaker-note` bundle emission | `python scripts/touying_check.py compile examples/06-bundle-pdfpc.typ --bundle` |

Run full deterministic static audit across all examples:

```bash
python scripts/touying_check.py audit examples --strict-warnings
```
