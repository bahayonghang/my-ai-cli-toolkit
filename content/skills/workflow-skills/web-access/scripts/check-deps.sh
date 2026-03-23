#!/usr/bin/env bash
# 环境检查 + 确保 CDP Proxy 就绪

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROXY_SCRIPT="$SCRIPT_DIR/cdp-proxy.mjs"
HEALTH_URL="${CDP_PROXY_URL:-http://127.0.0.1:3456/health}"
TMP_BASE="${TMPDIR:-/tmp}"
LOG_PATH="$TMP_BASE/cdp-proxy.log"

mkdir -p "$TMP_BASE"

# Node.js
if command -v node >/dev/null 2>&1; then
  NODE_VER="$(node --version 2>/dev/null)"
  NODE_MAJOR="$(echo "$NODE_VER" | sed 's/^v//' | cut -d. -f1)"
  if [ "$NODE_MAJOR" -ge 22 ] 2>/dev/null; then
    echo "node: ok ($NODE_VER)"
  else
    if node -e "import('ws').then(() => process.exit(0)).catch(() => process.exit(1))" >/dev/null 2>&1; then
      echo "node: ok ($NODE_VER, ws fallback available)"
    else
      echo "node: missing runtime support — 当前版本是 $NODE_VER"
      echo "请升级到 Node.js 22+，或让 Node 能解析模块 'ws' 后重试"
      exit 1
    fi
  fi
else
  echo "node: missing — 请安装 Node.js 22+，或安装可解析的 Node 运行环境"
  exit 1
fi

# curl
if command -v curl >/dev/null 2>&1; then
  echo "curl: ok"
else
  echo "curl: missing — 请安装 curl 后重试"
  exit 1
fi

health="$(curl -s --connect-timeout 2 "$HEALTH_URL" 2>/dev/null || true)"
if echo "$health" | grep -q '"connected":true'; then
  echo "chrome: ok (remote debugging connected)"
  echo "proxy: ready"
  exit 0
fi

if ! echo "$health" | grep -q '"ok"'; then
  echo "proxy: starting..."
  node "$PROXY_SCRIPT" >"$LOG_PATH" 2>&1 &
fi

for i in $(seq 1 15); do
  sleep 1
  health="$(curl -s --connect-timeout 2 "$HEALTH_URL" 2>/dev/null || true)"
  if echo "$health" | grep -q '"connected":true'; then
    echo "chrome: ok (remote debugging connected)"
    echo "proxy: ready"
    exit 0
  fi

  if [ "$i" -eq 3 ]; then
    echo "⚠️ 如果 Chrome 尚未允许远程调试，请打开 chrome://inspect/#remote-debugging 并允许当前浏览器实例。"
  fi
done

echo "chrome: not connected — 未检测到可用的 Chrome remote debugging session"
echo "请在 Chrome 中启用 chrome://inspect/#remote-debugging，或用 --remote-debugging-port 启动 Chrome 后重试。"
echo "如果 proxy 已启动但仍无法连接，请查看日志：$LOG_PATH"
exit 1
