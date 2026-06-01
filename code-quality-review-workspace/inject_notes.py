"""Inject analyst-pass observations into iteration-1/benchmark.json notes."""

import json
from pathlib import Path

BJ = Path(
    r"D:\Documents\Code\Agents\my-claude-code-settings\code-quality-review-workspace\iteration-1\benchmark.json"
)
data = json.loads(BJ.read_text(encoding="utf-8"))

notes = [
    "eval-4 (needs-scope) is the sharpest discriminator: new_skill returns NEEDS SCOPE and refuses to treat incidental working-tree edits as the target (3/3); old_skill produces a full COMMENT ONLY review of those edits (1/3).",
    "Stable CQ-001 IDs are a consistent new_skill win across evals 2, 3, and 6; old_skill uses plain '1.'/'2.' numbering, which is not referenceable.",
    "Non-discriminating (both pass): the planted fixture issues (non-atomic charge/update, any-typed boundary, duplicated formatMoney, mode branching, thin findOrder wrapper) are caught by BOTH configs. They validate the fixture but do not measure the skill's edge — the model is strong enough to find them regardless.",
    "Shared gap (actionable): in eval-6 NEITHER config recommended git-ignoring code_review/ (0 mentions). The new skill's prose instruction did not translate into behavior; tighten the instruction or treat it as a soft expectation in future iterations.",
    "Time: new_skill is ~14s faster on average (110s vs 124s); the explicit scope ladder appears to reduce wandering. Token usage is essentially equal.",
    "Methodology note: iteration-1 used 1 run per config, so the reported pass-rate stddev reflects spread ACROSS evals, not run-to-run variance. Bump to 3 runs/config in the final confirmation iteration.",
]

existing = data.get("notes", [])
data["notes"] = notes + [n for n in existing if n not in notes]
BJ.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print("Injected", len(notes), "analyst notes. Total notes:", len(data["notes"]))
print("Configs in run_summary:", list(data.get("run_summary", {}).keys()))
