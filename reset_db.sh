#!/usr/bin/env bash

# Deletes all numbered migration files, wipes any db.sqlite3 under the project,
# then recreates and reapplies migrations.

# SHOULD BE RUN FROM THE PROJECT ROOT, NOT FROM INSIDE src/!

set -euo pipefail

# ── 0) Jump into the dir where this script lives ─────────────────────────────
#    (so that ./manage.py and ./db.sqlite3 are always visible)
cd "$(dirname "${BASH_SOURCE[0]}")"

# ── 1) Remove all Django migration .py/.pyc under any app’s migrations/,
#     but skip venv/, node_modules/, __pycache__, etc.
find . \
  \( -path ./venv -o -path ./.venv -o -path ./env -o -path ./node_modules -o -path "*/__pycache__" \) -prune \
  -o -type f -path "*/migrations/[0-9]*_*.py"  ! -name "__init__.py" -exec rm -f {} + \
  -o -type f -path "*/migrations/[0-9]*_*.pyc" -exec rm -f {} +

find . \
  \( -path ./venv -o -path ./.venv -o -path ./env -o -path ./node_modules \) -prune \
  -o -type d -path "*/migrations/__pycache__" -exec rm -rf {} +

# ── 2) Delete every SQLite DB under the project tree ───────────────────────────
echo "Removing **all** db.sqlite3 files…"
find . -type f -name "db.sqlite3" -exec rm -v {} +
find . -type f -name "db.sqlite3-shm" -exec rm -v {} +
find . -type f -name "db.sqlite3-wal" -exec rm -v {} +

# ── 3) Recreate your migrations and apply them ────────────────────────────────
echo "Making new migrations…"
python src/manage.py makemigrations

echo "Applying migrations…"
python src/manage.py migrate

echo "✅ Done."