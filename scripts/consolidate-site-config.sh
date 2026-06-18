#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "consolidate-site-config: DATABASE_URL not set, skipping"
  exit 0
fi

eval "$(node -e "
const url = new URL(process.env.DATABASE_URL);
const database = url.pathname.replace(/^\\//, '').split('?')[0];
console.log('export PGHOST=' + JSON.stringify(url.hostname));
console.log('export PGPORT=' + JSON.stringify(url.port || '5432'));
console.log('export PGUSER=' + JSON.stringify(decodeURIComponent(url.username)));
console.log('export PGPASSWORD=' + JSON.stringify(decodeURIComponent(url.password)));
console.log('export PGDATABASE=' + JSON.stringify(database));
")"

psql -v ON_ERROR_STOP=1 <<'EOSQL'
DO $$
DECLARE
  row_count integer;
  source_id text;
BEGIN
  SELECT COUNT(*) INTO row_count FROM "SiteConfig";

  IF row_count = 0 THEN
    RAISE NOTICE 'consolidate-site-config: no SiteConfig rows';
    RETURN;
  END IF;

  IF row_count = 1 THEN
    SELECT id INTO source_id FROM "SiteConfig" LIMIT 1;
    IF source_id = 'main' THEN
      RAISE NOTICE 'consolidate-site-config: already canonical';
      RETURN;
    END IF;
  END IF;

  SELECT id INTO source_id
  FROM "SiteConfig"
  ORDER BY
    CASE WHEN branding::text LIKE '%/uploads/%' THEN 0 ELSE 1 END,
    "updatedAt" DESC
  LIMIT 1;

  INSERT INTO "SiteConfig" (
    id,
    name,
    tagline,
    "contactEmail",
    "contactPhone",
    "contactAddress",
    social,
    branding,
    navigation,
    "homepageLayout",
    "homepageSections",
    "timelineStyleDefaults",
    "timelineStyleByPage",
    "createdAt",
    "updatedAt"
  )
  SELECT
    'main',
    name,
    tagline,
    "contactEmail",
    "contactPhone",
    "contactAddress",
    social,
    branding,
    navigation,
    "homepageLayout",
    "homepageSections",
    "timelineStyleDefaults",
    "timelineStyleByPage",
    NOW(),
    NOW()
  FROM "SiteConfig"
  WHERE id = source_id
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    "contactEmail" = EXCLUDED."contactEmail",
    "contactPhone" = EXCLUDED."contactPhone",
    "contactAddress" = EXCLUDED."contactAddress",
    social = EXCLUDED.social,
    branding = EXCLUDED.branding,
    navigation = EXCLUDED.navigation,
    "homepageLayout" = EXCLUDED."homepageLayout",
    "homepageSections" = EXCLUDED."homepageSections",
    "timelineStyleDefaults" = EXCLUDED."timelineStyleDefaults",
    "timelineStyleByPage" = EXCLUDED."timelineStyleByPage",
    "updatedAt" = NOW();

  DELETE FROM "SiteConfig" WHERE id <> 'main';

  RAISE NOTICE 'consolidate-site-config: merged into main';
END $$;
EOSQL
