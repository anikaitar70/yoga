#!/bin/sh
# Daily uploads backup — run via cron on the VPS host.
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups/uploads}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date +%Y-%m-%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

FILE="$BACKUP_DIR/uploads_${STAMP}.tar.gz"
docker compose exec -T app tar czf - -C /app/public/uploads . > "$FILE"

find "$BACKUP_DIR" -name 'uploads_*.tar.gz' -mtime +"$RETENTION_DAYS" -delete
echo "Uploads backup written to $FILE"
