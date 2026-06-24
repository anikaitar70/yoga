# SSL / Let's Encrypt setup

## Prerequisites

- DNS `A` record for `yoga.anikait.page` → VPS IP (`51.79.251.45`)
- Stack running with **only** `nginx/inactive/initial.conf` copied into `conf.d/` for first HTTP bootstrap (see DEPLOYMENT.md §5)
- Ports 80 and 443 open on the VPS firewall

## 1. Issue certificate (initial domain)

```bash
cd /opt/yoga
mkdir -p certbot/conf certbot/www

docker compose --profile tools run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d yoga.anikait.page \
  --email YOUR_EMAIL@example.com \
  --agree-tos \
  --no-eff-email
```

## 2. Enable HTTPS Nginx config

```bash
chmod +x deploy/fix-nginx-conflicts.sh
./deploy/fix-nginx-conflicts.sh
```

This archives any extra files in `nginx/conf.d/` (e.g. `initial.conf`, `.bak` copies) into `nginx/inactive/archived-from-conf.d-*` and keeps only `production-ssl.conf` active. HTTP still serves `/.well-known/acme-challenge/` for renewal.

Manual equivalent:

```bash
mkdir -p nginx/inactive/archived-manual
mv nginx/conf.d/initial.conf nginx/inactive/archived-manual/ 2>/dev/null || true
# move any *.bak, *.hold, *.disabled out of conf.d/
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload
```

Verify: `curl -I https://yoga.anikait.page`

## 3. Automatic renewal (host cron)

```bash
chmod +x deploy/certbot-renew.sh
crontab -e
```

Add:

```
0 3 * * * /opt/yoga/deploy/certbot-renew.sh >> /var/log/yoga-certbot.log 2>&1
```

## 4. Renewal verification

```bash
docker compose --profile tools run --rm certbot renew --dry-run
./deploy/certbot-renew.sh
docker compose exec nginx nginx -t
```

## 5. Future domain (nirvanayoga.org)

When DNS is ready:

```bash
docker compose --profile tools run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d nirvanayoga.org -d www.nirvanayoga.org \
  --email YOUR_EMAIL@example.com \
  --agree-tos \
  --no-eff-email

docker compose restart nginx
```

The `production-ssl.conf` already includes server blocks for both domains.
