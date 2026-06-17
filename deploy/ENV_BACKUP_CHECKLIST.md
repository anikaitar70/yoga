# Environment backup checklist

Back up these items before major changes or VPS migration.

## Required

- [ ] `.env` file (store in password manager or encrypted vault — **never git**)
- [ ] `ADMIN_SECRET` — losing it requires setting a new one in `.env`
- [ ] `POSTGRES_PASSWORD` / `DATABASE_URL`
- [ ] `APP_URL` (current public domain)

## Docker volumes

- [ ] `db_data` — PostgreSQL (`deploy/backup-database.sh`)
- [ ] `uploads_data` — user uploads (`deploy/backup-uploads.sh`)

## SSL

- [ ] `certbot/conf/` directory (Let's Encrypt certificates)
- [ ] Certificate expiry dates (`certbot certificates`)

## Nginx

- [ ] Active config: `nginx/conf.d/initial.conf` or `production-ssl.conf`
- [ ] Custom snippet changes

## Optional

- [ ] Crontab entries for backups and cert renewal
- [ ] DNS records (A records for domains)
- [ ] Git commit hash deployed: `git rev-parse HEAD`

## Restore order

1. Restore `.env`
2. `docker compose up -d`
3. Restore database (`deploy/restore-database.sh`)
4. Restore uploads (`deploy/restore-uploads.sh`)
5. Restore or re-issue SSL certs
6. Verify `APP_URL` matches live domain
