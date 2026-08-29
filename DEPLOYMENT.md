# Nirvana Yoga — OVH VPS Deployment Guide

Target VPS: `51.79.251.45` (`vps-44b11e8f.vps.ovh.ca`) · Ubuntu 26.04  
Production domain: `nirvanayoga.org`

## Architecture

```
Internet → Nginx (:80/:443) → Next.js app (:3000)
                ↓                    ↓
         /uploads (volume)     PostgreSQL (db:5432)
```

See [deploy/](../deploy/) for SSL, backups, database, and domain migration.

## 0. Local Development (reference — this is how local should match VPS)

```bash
git clone https://github.com/anikaitar70/yoga.git
cd yoga
cp .env.example .env
# Edit .env: set DATABASE_URL (local postgres), ADMIN_SECRET, GITHUB_* , GEMINI_API_KEY (for translation), etc.
# For local admin without GitHub OAuth, set in .env.local:
# LOCAL_ADMIN_USERNAME=admin
# LOCAL_ADMIN_PASSWORD=your-local-password
# ALLOW_LOCAL_ADMIN_LOGIN=true  (only on localhost, never in production)

npm install          # postinstall runs prisma generate
npx prisma db push   # or: npm run db:push
npm run db:seed      # optional seed for hero/about
npm run dev          # http://localhost:3000  admin at /admin
```

**Test before push:**
```bash
npm run lint
npm run build   # must be 40+/41 pages, no TypeScript errors
# Manual: open / , /about, /yoga, /healing, /just-art-life, /events, /testimonials and /ja/*, check /admin login, image upload, translation
```

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
| `nirvanayoga.org` | `51.79.251.45` |
| `www.nirvanayoga.org` | `51.79.251.45` |

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

| Variable | Example | Required |
|----------|---------|----------|
| `APP_URL` | `https://nirvanayoga.org` | Yes |
| `DATABASE_URL` | `postgresql://postgres:STRONG_PASS@db:5432/yoga?schema=public` | Yes |
| `POSTGRES_PASSWORD` | same password as in `DATABASE_URL` | Yes |
| `ADMIN_SECRET` | 32+ character random string (session signing — server only) | Yes |
| `GITHUB_CLIENT_ID` | From GitHub OAuth app | Yes |
| `GITHUB_CLIENT_SECRET` | From GitHub OAuth app | Yes |
| `ADMIN_ALLOWED_EMAILS` | `anikaitar@gmail.com,nirvanayogaorg@gmail.com` | Yes |
| `GEMINI_API_KEY` | `AIza...` from Google AI Studio (https://aistudio.google.com/app/apikey) — server-side only, for EN→JA translation | Yes for translation (admin Translate buttons fail with clear error if missing) |
| `TRANSLATE_MODEL` | `gemini-3.7-flash` (default if omitted) | No |
| `NODE_ENV` | `production` | Yes |
| `UPLOAD_DIR` | `/app/public/uploads` | Yes |

> **Never commit `.env`**: it is gitignored. Copy `.env.example` and fill values locally and on VPS. `GEMINI_API_KEY` is server-side only — never exposed to browser, never in `NEXT_PUBLIC_`.

### GitHub OAuth app (admin login)

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers).
2. Create an OAuth app with callback URL: `{APP_URL}/api/admin/auth/github/callback`
3. Copy **Client ID** and **Client secret** into `.env`.
4. Only emails listed in `ADMIN_ALLOWED_EMAILS` can access `/admin` after signing in with GitHub.

Generate a secret:

```bash
openssl rand -hex 32
```

## 5. First deploy (HTTP)

For a brand-new VPS before certificates exist, copy the bootstrap config into `conf.d/` (do **not** leave it there after SSL):

```bash
cp nginx/inactive/initial.conf nginx/conf.d/initial.conf
```

Ensure `production-ssl.conf` is **not** in `conf.d/` yet (git tracks it for production; remove locally on first bootstrap if needed).

```bash
mkdir -p certbot/conf certbot/www
docker compose up -d --build
docker compose restart nginx
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

## 8. Updates — Git-based deployment (this is the ONLY supported workflow)

### 8a. Work locally and push to GitHub (Windows / Mac)

```bash
cd /path/to/yoga
git status                          # must show only intended files; .env must NOT appear (gitignored)
git diff --stat                     # review
npm run lint
npm run build                       # must be 41/41 pages, no TS errors — do not push if build fails
git add -A                          # or git add src/... prisma/... DEPLOYMENT.md etc. — never add .env
git commit -m "feat: describe change"
git push origin main
```

**What must NEVER be committed:** `.env`, `.env.local`, `GEMINI_API_KEY` or any secret, `node_modules/`, `.next/`, `public/uploads/**` (except `.gitkeep`), `*.log`, `Thumbs.db`, OS junk, `certbot/` runtime. Check `.gitignore` — `.env` and `.env.*.local` are ignored, `/.next/` is ignored.

### 8b. Pull and deploy on VPS (Docker)

```bash
ssh ubuntu@51.79.251.45
cd /opt/yoga

# 1. Pull
git fetch origin
git status                          # should be clean; stash or commit VPS-local changes if any
git pull origin main

# 2. Dependencies (only if package.json changed)
docker compose up -d --build
# This rebuilds Next.js (output: standalone) and runs on startup:
# - wait for db (pg_isready)
# - prisma migrate deploy (falls back to db push if no migrations)
# - consolidate SiteConfig singleton
# - mkdir -p public/uploads tessdata cache
# - node server.js

# 3. Database migrations are automatic via entrypoint (prisma migrate deploy).
#    If you see `column does not exist` in logs, the migration did not apply — check `prisma/migrations/` and rebuild.

# 4. Nginx (always after app rebuild — it caches app container IP)
docker compose restart nginx
docker compose ps                    # app, db, nginx should be Up
```

### 8c. Verify after deploy

```bash
docker compose ps
docker compose logs -f app --tail=80   # expect "Applying database migrations..." if schema changed
curl -sS https://nirvanayoga.org/api/health   # {"ok":true}
curl -sS https://nirvanayoga.org/testimonials | head   # should contain Testimonials / お客様の声
curl -sS https://nirvanayoga.org/ja/testimonials | head # should contain Japanese
# In browser: open /, /testimonials, /ja/testimonials, /events/special/<slug> and /ja/events/special/<slug>, check Just Art Affaire nav not wrapping, TOC spacing, Button CTA, Image+Text sticky, language switch
```

### 8d. Just Art Affaire nav — local vs VPS divergence

- **Local reference:** `Just Art Affaire` is longest primary nav label (16 chars). Fixed by `SiteHeader` `whitespace-nowrap` on links + `flex-nowrap` on nav (prevents wrap). Local looks correct at `lg` (1024) with `headerGapPx 8`.
- **VPS cause:** Stale build / old CSS bundle, or `montserrat` Google Font not loaded, or cached nginx. Not a redesign issue.
- **Fix:** `docker compose up -d --build` on VPS pulls latest `SiteHeader` CSS and font handling; hard-refresh browser (`Ctrl+F5`). If still wrapped, check `SiteConfig.designSettings.headerLayout.headerGapPx` (DB) — should be `8` as local. No nginx change needed.

### 8e. Quick one-liner (VPS)

```bash
cd /opt/yoga && git pull origin main && docker compose up -d --build && docker compose restart nginx && docker compose ps && curl -sS https://nirvanayoga.org/api/health
```

### 8f. Rollback if deploy fails

```bash
cd /opt/yoga
git log --oneline -10          # find previous good commit
git reset --hard <good-commit> # or git revert <bad-commit>
docker compose up -d --build
docker compose restart nginx
docker compose logs -f app --tail=100
# DB rollback: restore from deploy/backup-database.sh cron file in /opt/yoga/backups or S3 copy
# Uploads: restore from deploy/backup-uploads.sh
```

Check logs: `docker compose logs -f app`, `docker compose exec nginx nginx -t`, `docker compose ps`.

### 8g. Where .env belongs and Gemini key

- **Local:** `yoga/.env` (and `.env.local` for `LOCAL_ADMIN_*`, never commit). `GEMINI_API_KEY` from `https://aistudio.google.com/app/apikey`, `TRANSLATE_MODEL=gemini-3.7-flash` (default). Translation is server-side (`src/lib/translate-server.ts` → `https://generativelanguage.googleapis.com/v1beta/models/...:generateContent`), never exposed to browser. Admin `Translate` buttons call `POST /api/translate` (requires `requireAdminSession`). If key missing/invalid, API returns `500 {error: "GEMINI_API_KEY not configured..."}` — admin sees clear error, not silent `[JA]` mock.
- **VPS:** `/opt/yoga/.env` (same keys, `APP_URL=https://nirvanayoga.org`, `DATABASE_URL=postgresql://...@db:5432/yoga`, `ADMIN_SECRET`, `GITHUB_*`, `ADMIN_ALLOWED_EMAILS`, `GEMINI_API_KEY`, `UPLOAD_DIR=/app/public/uploads`). Do not commit, do not log key.

### 8h. What this deploy does for recent features

- `testimonialsPageSettings` `SiteConfig` JSON (layout `grid`/`list`, `cardGap` `compact`/`normal`/`relaxed`/`custom`, `sectionSpacing`, `contentWidth`, header `title`/`subtitle` EN/JA) — admin at `/admin/testimonials` (now in hamburger `Testimonials`), public `/testimonials` respects `layout`/`gap`/`spacing` and no longer has giant `PageHeader` `pageHero` blank area (now `Section` `default` spacing via settings).
- `Image + Text` unified (`IMAGE_TEXT` + legacy `DYNAMIC_IMAGE_TEXT` both render via `DynamicImageTextSection`, admin shows one `Image + Text` editor with `items[]`, `image left/right`, `sticky`, `height`/`fit`, EN/JA rich HTML, `Translate` via Gemini, reorder, `BUTTON` (`ButtonSectionPayload` via `PageSectionRenderer`) available as page section with `href` validation (`/^\/[^ ]*$/` or `https://`), `variant`/`size`/`alignment`.
- `TOC` (`SpecialEventTableOfContents`) now respects `SpecialEventTocDesign` `fontFamily`/`weight`/`size`/`color`/`italic`/`underline`/`highlight`/`align`/`lineHeight`/`letterSpacing`/`itemSpacing` `compact`/`normal`/`relaxed`/`custom` (gap between entries, not container padding) for both `AUTOMATIC` and `CUSTOM`.
- Existing `Event`/`Testimonial`/`PageSection` content preserved — `DYNAMIC_IMAGE_TEXT` still in enum, legacy `content`+`imageUrl` normalized to synthetic single item via `normalizeImageTextPayloadForRender` (no DB delete).


## 9. Troubleshooting

| Issue | Command |
|-------|---------|
| `column does not exist` (Prisma) | Local: `npx prisma migrate deploy` then restart dev server. VPS: rebuild app container (migrations run on startup). |
| CSP blocks inline scripts / blank page | Rebuild after latest `middleware.ts` (public pages need `script-src 'unsafe-inline'` for Next.js). Hard refresh. |
| 502 Bad Gateway after deploy | `docker compose restart nginx` — nginx caches the old app container IP when only `app` is recreated. |
| App logs | `docker compose logs -f app` |
| Nginx test | `docker compose exec nginx nginx -t` |
| Duplicate server_name warnings | `chmod +x deploy/fix-nginx-conflicts.sh && ./deploy/fix-nginx-conflicts.sh` |
| `git pull` blocked by untracked `production-ssl.conf` | `mkdir -p nginx/inactive/pre-pull-backup && mv nginx/conf.d/production-ssl.conf nginx/inactive/pre-pull-backup/ && git pull origin main` then run `fix-nginx-conflicts.sh` |
| DB shell | `docker compose exec db psql -U postgres -d yoga` |
| Restart stack | `docker compose restart` |
| Health | `docker compose ps` |

## Related docs

- [Database init](./deploy/database-init.md)
- [SSL setup](./deploy/ssl-setup.md)
- [Domain migration](./deploy/domain-migration.md)
- [Deployment audit](./deploy/AUDIT_REPORT.md)
