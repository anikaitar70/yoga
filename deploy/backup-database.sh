#!/bin/sh
# Daily PostgreSQL backup — run via cron on the VPS host.
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups/db}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date +%Y-%m-%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

set -a
# shellcheck disable=SC1091
. ./.env
set +a

FILE="$BACKUP_DIR/yoga_${STAMP}.sql.gz"
docker compose exec -T db pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-yoga}" | gzip > "$FILE"

find "$BACKUP_DIR" -name 'yoga_*.sql.gz' -mtime +"$RETENTION_DAYS" -delete
echo "Database backup written to $FILE"
