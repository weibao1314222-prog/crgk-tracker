#!/usr/bin/env bash
# enable_pages.sh —— 一键为你的 GitHub 仓库开启 Pages 并打印公网网址
# 用法： ./enable_pages.sh <你的GitHub经典PAT>
# 仓库信息从 git remote 自动读取（需已 clone 本仓库并设置了带 token 的 remote，或手动改下方）
set -e

TOKEN="${1:-$GITHUB_TOKEN}"
if [ -z "$TOKEN" ]; then
  echo "用法: ./enable_pages.sh <你的GitHub经典PAT>" >&2
  echo "或: GITHUB_TOKEN=<token> ./enable_pages.sh" >&2
  exit 1
fi

# 从 git remote 读出 owner/repo
REMOTE=$(git remote get-url origin 2>/dev/null || true)
REPO=$(echo "$REMOTE" | sed -E 's#.*github.com[:/]##; s#\.git$##')
if [ -z "$REPO" ]; then
  echo "无法从 git remote 读取仓库信息，请先 clone 本仓库。" >&2
  exit 1
fi

echo "仓库: $REPO"
API="https://api.github.com/repos/$REPO/pages"
AUTH="Authorization: token $TOKEN"
ACCEPT="Accept: application/vnd.github+json"

# 开启 Pages（main 分支根目录）；若已开启会返回错误，可忽略
HTTP=$(curl -s -o /tmp/pages_resp.json -w "%{http_code}" -X POST "$API" \
  -H "$AUTH" -H "$ACCEPT" \
  -d '{"source":{"branch":"main","path":"/"}}' || true)
echo "开启 Pages 响应: $HTTP"

# 读取最终网址
sleep 2
URL=$(curl -s -H "$AUTH" -H "$ACCEPT" "$API" | grep -o '"html_url":"[^"]*"' | head -1 | sed 's/"html_url":"//; s/"//' || true)
if [ -z "$URL" ]; then
  USER=$(echo "$REPO" | cut -d/ -f1)
  NAME=$(echo "$REPO" | cut -d/ -f2)
  URL="https://$USER.github.io/$NAME/"
  echo "（未能从 API 读到网址，通常仍会是）"
fi
echo "=========================================="
echo "你的固定公网网址："
echo "  $URL"
echo "约 1 分钟后可访问（首次构建稍慢）"
echo "=========================================="
