#!/bin/bash
# Chuẩn bị môi trường khi chạy Claude Code trên web (cloud).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm install --no-audit --no-fund

# Dùng Chromium có sẵn trong container thay vì tải Chrome Headless Shell.
HEADLESS_SHELL=$(find /opt/pw-browsers -type f -name headless_shell 2>/dev/null | head -n 1 || true)
if [ -n "$HEADLESS_SHELL" ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export REMOTION_BROWSER_EXECUTABLE=$HEADLESS_SHELL" >> "$CLAUDE_ENV_FILE"
fi
