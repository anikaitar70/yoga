#!/bin/sh
# Restore PostgreSQL from a .sql.gz backup.
set -eu

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup.sql.gz>"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

set -a
# shellcheck disable=SC1091
. ./.env
set +a

echo "Restoring database from $1 ..."
gunzip -c "$1" | docker compose exec -T db psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-yoga}"
echo "Restore complete."
