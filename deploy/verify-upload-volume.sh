#!/bin/sh
# Quick check: uploads volume writable in app and visible to nginx.
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STAMP="upload-volume-check-$(date +%s).txt"
APP_PATH="/app/public/uploads/gallery/$STAMP"
NGINX_PATH="/var/www/uploads/gallery/$STAMP"

echo "Writing test file via app container..."
docker compose exec -T app sh -c "echo ok > $APP_PATH"

echo "Checking nginx container can read it..."
if docker compose exec -T nginx sh -c "test -f $NGINX_PATH && cat $NGINX_PATH"; then
  echo "OK: app and nginx share the uploads volume."
else
  echo "FAIL: nginx cannot read file written by app."
  exit 1
fi

docker compose exec -T app rm -f "$APP_PATH"
echo "Done."
