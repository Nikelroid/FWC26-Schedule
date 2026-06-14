#!/usr/bin/env bash
# One-shot deploy of the World Cup 2026 schedule to a PRIVATE GitHub repo + GitHub Pages.
# Usage:  ./deploy.sh [repo-name]
# Requires: git, GitHub CLI (gh). One-time auth:  gh auth login
set -e

REPO="${1:-fwc2026-schedule}"

command -v gh >/dev/null || { echo "❌ GitHub CLI (gh) not found. Install: https://cli.github.com"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "🔑 Run 'gh auth login' first."; exit 1; }

echo "📦 Initializing repo: $REPO"
git init -q
git add -A
git commit -qm "World Cup 2026 schedule (Pacific Time)" || true
git branch -M main

echo "🚀 Creating PRIVATE repo and pushing…"
gh repo create "$REPO" --private --source=. --remote=origin --push

OWNER=$(gh api user -q .login)
echo "🌐 Enabling GitHub Pages…"
gh api -X POST "repos/$OWNER/$REPO/pages" \
  -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 \
  || echo "   (If this errored, enable Pages once in Settings → Pages → Branch: main /root)"

echo ""
echo "✅ Done!"
echo "   Repo:  https://github.com/$OWNER/$REPO  (private)"
echo "   Site:  https://$OWNER.github.io/$REPO/   (live in ~1 min)"
