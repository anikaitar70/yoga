#!/bin/sh
# Renew Let's Encrypt certificates and reload Nginx.
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

docker compose --profile tools run --rm certbot renew --webroot -w /var/www/certbot
docker compose exec -T nginx nginx -t
docker compose exec nginx nginx -s reload
echo "Certificate renewal check complete."
