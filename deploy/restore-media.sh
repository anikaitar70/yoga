#!/bin/sh
# Restore uploaded media archive into the app uploads volume.
set -eu

if [ $# -lt 1 ]; then
  echo "Usage: $0 <uploads-backup.tar.gz>"
  exit 1
fi

ARCHIVE="$1"
if [ ! -f "$ARCHIVE" ]; then
  echo "Archive not found: $ARCHIVE"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Ensuring app container is running..."
docker compose up -d app >/dev/null

echo "Restoring media from $ARCHIVE ..."
docker compose exec -T app sh -c 'mkdir -p /app/public/uploads && rm -rf /app/public/uploads/*'
cat "$ARCHIVE" | docker compose exec -T app tar xzf - -C /app/public/uploads

RESTORED_COUNT="$(
  docker compose exec -T app sh -c "find /app/public/uploads -type f ! -name '.gitkeep' | wc -l" \
    | tr -d '[:space:]'
)"

echo "Media restore complete."
echo "Restored files: $RESTORED_COUNT"
