#!/bin/sh
# Restore uploads from a .tar.gz backup.
set -eu

if [ $# -lt 1 ]; then
  echo "Usage: $0 <uploads-backup.tar.gz>"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Restoring uploads from $1 ..."
docker compose exec -T app sh -c 'rm -rf /app/public/uploads/*'
cat "$1" | docker compose exec -T app tar xzf - -C /app/public/uploads
echo "Restore complete."
