"""Read-only diagnostic for the audited linter; prints observations, not acceptance."""
import importlib.util
import json
from pathlib import Path
import re
import sys

sys.dont_write_bytecode = True
repo = Path(__file__).resolve().parents[4]
root = repo / 'skills/developer-tools-integrations/goal-meta-skill'
spec = importlib.util.spec_from_file_location('goal_lint_probe', root / 'scripts/lint_goal_command.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
tests = (root / 'tests/lint-goal-command.test.mjs').read_text(encoding='utf-8')
base = re.search(r'const baseGoalOnly = `([\s\S]*?)`;', tests).group(1)
weak = '/goal Fix the dashboard filter state loss with the smallest authorized implementation change.'
borrowed = weak + '\n\nExplanation only; not in copied command:\n' + base.split('\n', 2)[2]
for name, payload in [('base', base), ('borrowed_explanation', borrowed), ('second_incomplete_goal', base + '\n' + weak)]:
    print(json.dumps({'probe': name, 'errors': module.lint_text(payload, name, platform='codex')}, ensure_ascii=False))
for name, payload in [('raw_4000', '/goal ' + 'a' * 4000), ('fenced_4000', '```text\n/goal ' + 'a' * 4000 + '\n```')]:
    print(json.dumps({'probe': name, 'errors': module.lint_goal_block_length(payload, name, platform='codex')}, ensure_ascii=False))
