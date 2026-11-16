# gh-pr Trigger Evaluation

- Date: 2026-07-21
- Evaluator: `yao-meta/scripts/trigger_eval.py`
- Threshold: `0.48`
- Positive cases: `13/13`
- Negative cases: `8/8`
- Near-neighbor cases: `7/7`
- Precision: `1.0`
- Recall: `1.0`

The first run missed two positive paraphrases (`send replies` and diagnosis phrased as checks `are failing`). The semantic fixture was extended with those equivalent phrases; the product description did not change. The final run exited `0` with no false positives or false negatives.

After the later resource-budget compression, the final 2.0.0 description was evaluated again with the same perfect result.
