#!/usr/bin/env bash
# Regression baseline runner for compose_commit_message.py (task 07-13).
# Usage: bash run_baseline.sh <output-dir>
# Runs a fixed set of no-new-flag invocations and stores stdout/stderr
# byte-exact, so before/after directories can be compared with `diff -r`.
set -euo pipefail

OUT="$1"
mkdir -p "$OUT"
PY_SCRIPT="skills/git-github-collaboration/git-commit/scripts/compose_commit_message.py"

run() {
  local name="$1"
  shift
  PYTHONUTF8=1 python "$PY_SCRIPT" "$@" >"$OUT/$name.out" 2>"$OUT/$name.err"
}

# 1) one minimal call per built-in type
for t in feat fix docs style refactor perf test build ci chore revert; do
  run "type-$t" --type "$t" --summary "touch $t path"
done

# 2) one full-trailer call (breaking header, all trailer families, agent mode)
run "full-trailers" \
  --type fix --scope payment --summary "修复回调重复写入账本" \
  --why "回调被网关重试导致重复 ledger 行" \
  --body-line "同一订单加幂等键" \
  --breaking "旧回调端点移除" --breaking-header \
  --footer-line "Jira: PROJ-456" \
  --closes 128 --refs "#130" \
  --confidence high --scope-risk narrow --tested "just ci" \
  --ai --agent-task PROJ-456 --agent-model claude-opus-4-8 \
  --agent-prompt-ref prompt-2026-05-14-abc123 --generated-by-agent

# 3) one Chinese + emoji header call
run "cjk-emoji" --type feat --scope auth --summary "添加短信兜底登录"

echo "baseline written to $OUT"
