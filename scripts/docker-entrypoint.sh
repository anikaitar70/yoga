#!/bin/sh
set -eu

echo "Waiting for PostgreSQL..."
until pg_isready -h db -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-yoga}" >/dev/null 2>&1; do
  sleep 2
done

echo "Applying database migrations (migration-driven, never db push in production)..."
if [ -d prisma/migrations ] && [ -n "$(ls -A prisma/migrations 2>/dev/null | grep -v migration_lock.toml)" ]; then
  # 1. Apply all committed migrations (this is the ONLY way prod schema should change)
  if ! node ./node_modules/prisma/build/index.js migrate deploy; then
    echo "ERROR: migrate deploy failed — check prisma/migrations and DATABASE_URL" >&2
    echo "If you edited prisma/schema.prisma without creating a migration, run locally:" >&2
    echo "  npx prisma migrate dev --name describe_the_change" >&2
    echo "And commit the new files in prisma/migrations/" >&2
    exit 1
  fi
  # 2. Post-deploy drift check — catches the dev db push masking bug (P2022)
  echo "Checking for schema drift (DB vs schema.prisma)..."
  if ! node ./node_modules/prisma/build/index.js migrate status 2>&1 | tee /tmp/migrate-status.log; then
    echo "WARNING: migrate status reported pending/failed migrations" >&2
  fi
  # Detailed diff (empty = no drift). Uses DATABASE_URL from env.
  if command -v node >/dev/null 2>&1 && [ -f scripts/check-migration-drift.js ]; then
    if ! node scripts/check-migration-drift.js 2>&1 | tee /tmp/drift.log; then
      echo "WARNING: Drift detected post-deploy — DB does not match schema. See /tmp/drift.log" >&2
      echo "Fix: create a migration locally (prisma migrate dev) and redeploy — never rely on db push in prod." >&2
      # Do not exit 1 here — the new heroImage columns use IF NOT EXISTS, so the site will still start,
      # but the warning ensures you don't ship another drift.
    fi
  fi
else
  echo "No migrations found — falling back to db push (dev/ephemeral only, never use in production)."
  echo "For production, always commit migrations: npx prisma migrate dev --name ..." >&2
  node ./node_modules/prisma/build/index.js db push --skip-generate
fi

echo "Consolidating SiteConfig singleton..."
sh scripts/consolidate-site-config.sh

UPLOAD_ROOT="${UPLOAD_DIR:-/app/public/uploads}"
mkdir -p \
  "$UPLOAD_ROOT/gallery" \
  "$UPLOAD_ROOT/branding" \
  "$UPLOAD_ROOT/blog" \
  "$UPLOAD_ROOT/events" \
  "$UPLOAD_ROOT/homepage" \
  "$UPLOAD_ROOT/pages" \
  "$UPLOAD_ROOT/testimonials"
mkdir -p "${TESSERACT_CACHE_DIR:-/app/.tesseract-cache}"
chmod -R u+rwX "$UPLOAD_ROOT" 2>/dev/null || true
chmod -R u+rwX "${TESSERACT_CACHE_DIR:-/app/.tesseract-cache}" 2>/dev/null || true

echo "Starting Next.js..."
exec node server.js
