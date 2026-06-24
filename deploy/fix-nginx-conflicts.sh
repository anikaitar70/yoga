#!/bin/sh
# Archive duplicate nginx conf.d files on the VPS so only production-ssl.conf stays active.
# Does not touch repolens.conf (separate app at /opt/repolens).
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CONF_D="nginx/conf.d"
INACTIVE="nginx/inactive"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
ARCHIVE="$INACTIVE/archived-from-conf.d-$STAMP"

mkdir -p "$INACTIVE" "$ARCHIVE"

echo "=== Before ==="
ls -la "$CONF_D" || true

keep_file() {
  case "$1" in
    production-ssl.conf|repolens.conf)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

for f in "$CONF_D"/*; do
  [ -e "$f" ] || continue
  name="$(basename "$f")"
  if keep_file "$name"; then
    echo "KEEP: $name"
    continue
  fi
  echo "ARCHIVE: $name -> $ARCHIVE/"
  mv "$f" "$ARCHIVE/"
done

if [ ! -f "$CONF_D/production-ssl.conf" ]; then
  if [ -f "$INACTIVE/production-ssl.conf.template" ]; then
    echo "Restoring production-ssl.conf from inactive template"
    cp "$INACTIVE/production-ssl.conf.template" "$CONF_D/production-ssl.conf"
  elif [ -f "$ARCHIVE/production-ssl.conf" ]; then
    echo "Restoring production-ssl.conf from archive"
    cp "$ARCHIVE/production-ssl.conf" "$CONF_D/production-ssl.conf"
  elif [ -f "$ARCHIVE/production-ssl.conf.disabled" ]; then
    echo "Restoring production-ssl.conf from archived .disabled copy"
    cp "$ARCHIVE/production-ssl.conf.disabled" "$CONF_D/production-ssl.conf"
  else
    echo "ERROR: production-ssl.conf missing and no template found." >&2
    exit 1
  fi
fi

echo "=== After ==="
ls -la "$CONF_D"

echo "=== nginx -t ==="
docker compose exec -T nginx nginx -t

echo "=== reload ==="
docker compose exec -T nginx nginx -s reload

echo "Done. Archived extras in: $ARCHIVE"
