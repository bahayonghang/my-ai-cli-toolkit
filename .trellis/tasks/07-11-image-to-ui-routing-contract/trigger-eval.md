# Trigger Evaluation: image-to-ui-skill

## Method

- Subject: the 199-character frontmatter description in `SKILL.md`.
- Method: manual static routing review against the package description and `evals/evals.json`.
- Limitation: the installed yao-meta package has no `trigger_eval.py`; automated trigger execution is `missing evidence`.

## Matrix

| ID | Input summary | Expected route | Manual result | Conclusion |
| --- | --- | --- | --- | --- |
| 1 | UI screenshot to clickable ecommerce demo | image-to-ui-skill | Matches UI screenshot + clickable demo | PASS |
| 2 | Three iOS references to connected prototype | image-to-ui-skill | Matches app/iOS prototype | PASS |
| 3 | Design reference with generated hero texture | image-to-ui-skill | Matches faithful reference recreation | PASS |
| 4 | English UI screenshot-to-code request | image-to-ui-skill | Matches screenshot-to-code | PASS |
| 5 | Museum app references with navigation flow | image-to-ui-skill | Matches clickable app recreation | PASS |
| 6 | image2-backed shopping app reference | image-to-ui-skill | Matches image-to-UI and bitmap boundary | PASS |
| 7 | Standalone imagegen poster | imagegen/image workflow | Excluded by image-only generation | PASS |
| 8 | React admin page without a reference | normal frontend workflow | Excluded by reference-free UI work | PASS |
| 9 | Static PNG event poster | visual/image design | Excluded by image-only generation | PASS |
| 10 | Existing UI polish without reference | frontend polish/design review | Excluded by reference-free UI polish | PASS |
| 11 | CSV chart and analysis | visualization workflow | No screenshot-to-code or UI reference trigger | PASS |
| 12 | Reference-free landing page, no images | normal frontend workflow | Excluded by reference-free UI work | PASS |

## Result

Manual matrix: 12/12 expected routes matched. This is review evidence, not a substitute for the unavailable automated trigger evaluator.
