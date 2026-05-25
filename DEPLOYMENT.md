# Nirvana Yoga VPS Deployment Guide

## Goal
Prepare a single OVH VPS deployment using Docker, PostgreSQL persistence, Nginx reverse proxy, and SSL-ready certbot support.

## Files added
- `Dockerfile`
- `docker-compose.yml`
- `middleware.ts`
- `nginx/nginx.conf`
- `nginx/conf.d/default.conf`
- `.dockerignore`
- `.env.example`
- `DEPLOYMENT.md`

## Production setup
1. Copy `.env.example` to `.env` and update values.
2. Make sure `SITE_URL` matches your public domain.
3. Keep `DATABASE_URL` pointed at `db` for Docker Compose.

## Running the stack
```bash
docker compose up -d --build
```

After the app is up:
```bash
docker compose exec app npx prisma db push
# Optional seed if you need sample data
# docker compose exec app npm run db:seed
```

## SSL certificate issuance
1. Replace `YOUR_DOMAIN_HERE` in `nginx/conf.d/default.conf` with your real domain.
2. Obtain the initial certificate manually from the host:
```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d your-domain.com --email your-email@example.com --agree-tos --no-eff-email
```
3. Restart nginx:
```bash
docker compose restart nginx
```

## Backup strategy
- PostgreSQL backup:
  - `docker compose exec db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup-$(date +%F).sql`
- Uploads backup:
  - `tar czf uploads-backup-$(date +%F).tar.gz public/uploads`
- Store backups off the VPS to a different system or object storage.
- Schedule host-level cron jobs to run these exports regularly.

## Security and performance
- `middleware.ts` adds security headers for all API responses.
- Rate limiting is enabled for form endpoints: `/api/contact`, `/api/newsletter`, `/api/upload/event-image`.
- `Dockerfile` uses a multi-stage build and Next.js standalone output to minimize runtime image size.
- Image uploads persist in the mounted `public/uploads` folder.
- Nginx handles TLS termination and forwards requests to the internal app service.

## Notes
- Keep the `.env` file out of source control.
- For low-cost VPS usage, do not expose the PostgreSQL or app ports publicly.
- Use `docker compose logs -f nginx` and `docker compose logs -f app` for troubleshooting.
