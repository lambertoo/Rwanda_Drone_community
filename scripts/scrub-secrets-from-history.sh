#!/usr/bin/env bash
# Purge leaked credential files from ALL git history.
# The files are already public — rotate the admin password and JWT_SECRET FIRST,
# then run this, then force-push. Requires git-filter-repo (brew install git-filter-repo).
set -euo pipefail

command -v git-filter-repo >/dev/null 2>&1 || { echo "Install git-filter-repo first: brew install git-filter-repo"; exit 1; }

git filter-repo --invert-paths \
  --path cookies.txt \
  --path docs/USER_CREDENTIALS.md \
  --path docs/ADMIN_SYSTEM_ACCESS.md \
  --path prisma/neon-seed-test-data.sql

echo "History rewritten. Now:"
echo "  1. git remote add origin <your-repo-url>   # filter-repo drops the remote"
echo "  2. git push --force --all && git push --force --tags"
echo "  3. Confirm the admin password and JWT_SECRET were already rotated."
