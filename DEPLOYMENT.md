# Nirvana Yoga — OVH VPS Deployment Guide

Target VPS: `51.79.251.45` (`vps-44b11e8f.vps.ovh.ca`) · Ubuntu 26.04  
Initial domain: `yoga.anikait.page` · Future: `nirvanayoga.org`

## Architecture

```
Internet → Nginx (:80/:443) → Next.js app (:3000)
                ↓                    ↓
         /uploads (volume)     PostgreSQL (db:5432)
```

See [deploy/](../deploy/) for SSL, backups, database, and domain migration.

## 1. VPS preparation

```bash
ssh ubuntu@51.79.251.45

sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw

# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# Log out and back in

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 2. DNS

Create an `A` record:

| Host | Value |
|------|-------|
| `yoga.anikait.page` | `51.79.251.45` |

## 3. Clone repository

```bash
sudo mkdir -p /opt/yoga
sudo chown $USER:$USER /opt/yoga
git clone https://github.com/anikaitar70/yoga.git /opt/yoga
cd /opt/yoga
```

## 4. Environment

```bash
cp .env.example .env
nano .env
```

Required values:

| Variable | Example |
|----------|---------|
| `APP_URL` | `https://yoga.anikait.page` |
| `DATABASE_URL` | `postgresql://postgres:STRONG_PASS@db:5432/yoga?schema=public` |
| `POSTGRES_PASSWORD` | same password as in `DATABASE_URL` |
| `ADMIN_SECRET` | 32+ character random string |
| `NODE_ENV` | `production` |
| `UPLOAD_DIR` | `/app/public/uploads` |

Generate a secret:

```bash
openssl rand -hex 32
```

## 5. First deploy (HTTP)

Ensure only `nginx/conf.d/initial.conf` is active (not `production-ssl.conf`).

```bash
mkdir -p certbot/conf certbot/www
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

The app entrypoint waits for PostgreSQL and runs `prisma db push`.

Optional seed:

```bash
docker compose exec app node ./node_modules/prisma/build/index.js db seed
```

## 6. SSL

See [deploy/ssl-setup.md](./deploy/ssl-setup.md).

## 7. Backups (cron)

```bash
chmod +x deploy/*.sh

crontab -e
```

```
0 2 * * * /opt/yoga/deploy/backup-database.sh >> /var/log/yoga-db-backup.log 2>&1
30 2 * * * /opt/yoga/deploy/backup-uploads.sh >> /var/log/yoga-uploads-backup.log 2>&1
0 3 * * * /opt/yoga/deploy/certbot-renew.sh >> /var/log/yoga-certbot.log 2>&1
```

Copy backups off the VPS regularly (S3, another server, etc.).

## 8. Updates

### Push from your computer (Windows / Mac)

```bash
cd /path/to/yoga
git status
git add -A
git commit -m "Your message describing the change"
git push origin main
```

Do **not** commit `.env` — it stays only on the VPS and your local machine.

### Pull on the VPS

```bash
ssh ubuntu@51.79.251.45
cd /opt/yoga
git pull origin main
docker compose up -d --build
```

The app container runs `prisma migrate deploy` on startup, so new database migrations apply automatically during rebuild.

### Verify after deploy

```bash
docker compose ps
docker compose logs -f app --tail=80
curl -sS https://yoga.anikait.page/api/health
```

You should see `Applying database migrations...` in the app logs when schema changes were included in the pull.

### Quick one-liner (VPS)

```bash
cd /opt/yoga && git pull origin main && docker compose up -d --build && docker compose ps
```

## 9. Troubleshooting

| Issue | Command |
|-------|---------|
| App logs | `docker compose logs -f app` |
| Nginx test | `docker compose exec nginx nginx -t` |
| DB shell | `docker compose exec db psql -U postgres -d yoga` |
| Restart stack | `docker compose restart` |
| Health | `docker compose ps` |

## Related docs

- [Database init](./deploy/database-init.md)
- [SSL setup](./deploy/ssl-setup.md)
- [Domain migration](./deploy/domain-migration.md)
- [Deployment audit](./deploy/AUDIT_REPORT.md)
