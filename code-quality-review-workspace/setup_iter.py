"""Build the iteration-1 skeleton for the code-quality-review eval loop.

Reads evals.json and creates, per eval:
  iteration-1/eval-<id>/eval_metadata.json
  iteration-1/eval-<id>/new_skill/run-1/outputs/
  iteration-1/eval-<id>/old_skill/run-1/outputs/
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
EVALS = (
    ROOT.parent / "skills/development-workflows/code-quality-review/evals/evals.json"
)
ITER = ROOT / "iteration-1"

NAMES = {
    1: "scope-inference-git",
    2: "chinese-maintainability",
    3: "structured-findings-on-fixture",
    4: "needs-scope",
    5: "read-only",
    6: "artifact-mode",
}

data = json.loads(EVALS.read_text(encoding="utf-8"))
for ev in data["evals"]:
    eid = ev["id"]
    eval_dir = ITER / f"eval-{eid}"
    for config in ("new_skill", "old_skill"):
        (eval_dir / config / "run-1" / "outputs").mkdir(parents=True, exist_ok=True)
    meta = {
        "eval_id": eid,
        "eval_name": NAMES.get(eid, f"eval-{eid}"),
        "prompt": ev["prompt"],
        "assertions": ev.get("expectations", []),
    }
    (eval_dir / "eval_metadata.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"eval-{eid} ({meta['eval_name']}): {len(meta['assertions'])} assertions")

print("skeleton ready at", ITER)
