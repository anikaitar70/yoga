#!/bin/sh
set -eu

echo "Waiting for PostgreSQL..."
until pg_isready -h db -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-yoga}" >/dev/null 2>&1; do
  sleep 2
done

echo "Applying database migrations..."
if [ -d prisma/migrations ] && [ -n "$(ls -A prisma/migrations 2>/dev/null | grep -v migration_lock.toml)" ]; then
  node ./node_modules/prisma/build/index.js migrate deploy
else
  echo "No migrations found — falling back to db push."
  node ./node_modules/prisma/build/index.js db push --skip-generate
fi

echo "Consolidating SiteConfig singleton..."
sh scripts/consolidate-site-config.sh

UPLOAD_ROOT="${UPLOAD_DIR:-/app/public/uploads}"
mkdir -p "$UPLOAD_ROOT"

echo "Starting Next.js..."
exec node server.js
