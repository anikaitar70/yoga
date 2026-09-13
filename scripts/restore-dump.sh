#!/bin/bash
# restore-dump.sh — properly restore a pg_dump taken via deploy/backup-database.sh
# Usage: bash scripts/restore-dump.sh /tmp/live.sql.gz
set -eu

DUMP="${1:-}"
if [ -z "$DUMP" ]; then echo "Usage: $0 <dump.sql.gz>"; exit 1; fi
if [ ! -f "$DUMP" ]; then echo "Not found: $DUMP"; exit 1; fi

# find docker
DOCKER="docker"
if command -v /snap/bin/docker >/dev/null 2>&1; then DOCKER="/snap/bin/docker"; fi
if ! command -v "$DOCKER" >/dev/null 2>&1; then DOCKER="docker"; fi

echo "[restore] Using docker: $DOCKER"
echo "[restore] Dropping local schema public (clears all tables)..."
# need sudo if docker requires it — try without, then with sudo inherit
if ! $DOCKER compose exec -T db psql -U postgres -d yoga -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>&1; then
  echo "[restore] retry with sudo..."
  sudo $DOCKER compose exec -T db psql -U postgres -d yoga -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
fi

echo "[restore] Restoring $DUMP ..."
if ! gunzip -c "$DUMP" | $DOCKER compose exec -T db psql -U postgres -d yoga 2>&1; then
  echo "[restore] retry with sudo..."
  gunzip -c "$DUMP" | sudo $DOCKER compose exec -T db psql -U postgres -d yoga
fi

echo "[restore] Done. Verifying..."
if ! $DOCKER compose exec -T db psql -U postgres -d yoga -c "SELECT 'PageSection' as tbl, count(*) FROM \"PageSection\" UNION ALL SELECT 'GalleryImage', count(*) FROM \"GalleryImage\" UNION ALL SELECT 'GalleryCollection', count(*) FROM \"GalleryCollection\";" 2>&1; then
  sudo $DOCKER compose exec -T db psql -U postgres -d yoga -c "SELECT 'PageSection' as tbl, count(*) FROM \"PageSection\" UNION ALL SELECT 'GalleryImage', count(*) FROM \"GalleryImage\" UNION ALL SELECT 'GalleryCollection', count(*) FROM \"GalleryCollection\";"
fi

# also via node pg for double-check
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/yoga node -e "
const {Client}=require('pg');
(async()=>{
  const c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();
  for(const t of ['SiteConfig','PageSection','HeroSection','AboutPage','GalleryImage','GalleryCollection','GalleryCollage','Event','BlogPost']){
    const r=await c.query('SELECT count(*)::int c FROM \"'+t+'\"');
    console.log(t, r.rows[0].c);
  }
  await c.end();
})();
"

echo "[restore] Now rsync uploads if needed and run: npm start"
