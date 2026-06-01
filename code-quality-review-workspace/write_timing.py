"""Write timing.json for each iteration-1 run from the captured task-notification data.

Data captured from the 12 subagent completion notifications (total_tokens, duration_ms).
This is the only place this data is persisted.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ITER = ROOT / "iteration-1"

# (eval_id, config, total_tokens, duration_ms)
DATA = [
    (1, "new_skill", 63782, 177312),
    (1, "old_skill", 63540, 135038),
    (2, "new_skill", 53314, 83563),
    (2, "old_skill", 52474, 111233),
    (3, "new_skill", 53936, 92767),
    (3, "old_skill", 52302, 99253),
    (4, "new_skill", 51164, 93491),
    (4, "old_skill", 60544, 150686),
    (5, "new_skill", 54924, 88200),
    (5, "old_skill", 52008, 105678),
    (6, "new_skill", 56550, 125346),
    (6, "old_skill", 55550, 140948),
]

for eid, config, tokens, dur_ms in DATA:
    run_dir = ITER / f"eval-{eid}" / config / "run-1"
    payload = {
        "total_tokens": tokens,
        "duration_ms": dur_ms,
        "total_duration_seconds": round(dur_ms / 1000.0, 1),
    }
    (run_dir / "timing.json").write_text(
        json.dumps(payload, indent=2), encoding="utf-8"
    )
    print(f"eval-{eid}/{config}: {tokens} tok, {payload['total_duration_seconds']}s")

print("timing.json written for", len(DATA), "runs")
