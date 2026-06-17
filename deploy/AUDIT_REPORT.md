# Deployment Audit Report — Nirvana Yoga

**Date:** 2026-06-17  
**Scope:** Full codebase inspection for OVH VPS production deployment  
**Deploy:** Not performed (audit + preparation only)

---

## Executive summary

The project has a **working Next.js 16 production build**, existing **Docker/Nginx/Certbot scaffolding**, and **PostgreSQL via Prisma**. It was **not fully production-ready** due to unauthenticated write APIs, env var inconsistencies, tracked upload binaries in git, and Prisma `db push` (no migration history). Changes in this pass address the critical blockers.

---

## 1. Current deployment assumptions

| Assumption | Finding |
|------------|---------|
| Single VPS, Docker Compose | `docker-compose.yml` defines `app`, `db`, `nginx`, `certbot` |
| Next.js standalone output | `next.config.ts` → `output: "standalone"` |
| PostgreSQL on same host | `db` service, `DATABASE_URL` host `db` |
| Local disk uploads | `public/uploads/{section}/` served at `/uploads/` |
| Nginx TLS termination | Nginx proxies to `app:3000` |
| Admin auth via shared secret | `ADMIN_SECRET` + HMAC session cookie (not NextAuth) |
| Schema sync via `db push` | No `prisma/migrations/` directory |
| Prisma seed for initial data | `prisma/seed.js` + many one-off scripts |

---

## 2. Environment variables

### Before audit

| Variable | Used | Notes |
|----------|------|-------|
| `DATABASE_URL` | Yes | Prisma |
| `ADMIN_SECRET` | Yes | Admin login |
| `SITE_URL` | Docker only | Not read by app code |
| `NEXT_PUBLIC_SITE_URL` | Yes | `lib/site.ts` metadata |
| `NODE_ENV` | Yes | Cookie security, Prisma singleton |
| `PORT` | Yes | Default 3000 |
| `POSTGRES_*` | Yes | Docker db service |
| `NGROK_DEV_ORIGIN` | Dev only | ngrok HMR |
| `ADMIN_FORCE_SECURE_COOKIE` | Optional | Tunnel cookie fix |
| `CONTENT_FETCH_DELAY_MS` | Dev | Artificial delay |

### Missing (requested)

| Variable | Status after fix |
|----------|------------------|
| `APP_URL` | Added — canonical public URL |
| `UPLOAD_DIR` | Added — configurable upload root |
| `NEXTAUTH_URL` | N/A — custom admin auth, no NextAuth |

---

## 3. Prisma requirements

- **Provider:** PostgreSQL 16
- **Client:** `@prisma/client` ^5.12.0, generated on `postinstall`
- **Deploy method:** `prisma db push` (no versioned migrations)
- **Risk:** Schema drift without migration history; `ensure-db-schema.js` patches columns ad hoc
- **Docker fix:** Entrypoint runs `db push` on container start

---

## 4. Upload storage paths

- **Code path:** `getUploadRootDir()` → `UPLOAD_DIR` or `{cwd}/public/uploads`
- **URL pattern:** `/uploads/{section}/{file}` or `/uploads/gallery/{collection}/{file}`
- **Max size:** 5 MB, images only (JPEG/PNG/WebP/GIF)
- **Docker:** Named volume `uploads_data` mounted at `/app/public/uploads`
- **Nginx:** Serves `/uploads/` directly from shared volume (no app hop)

---

## 5. Static asset paths

- **Build assets:** `/_next/static/` (proxied via Nginx with long cache)
- **Public folder:** `/bookmark_icon.jpeg`, favicons, etc. in `public/`
- **Uploads:** `/uploads/**` (runtime, not in build)

---

## 6. Hardcoded URLs

| Location | URL | Risk |
|----------|-----|------|
| `lib/site.ts` | `nirvanayoga.example` fallback | Low — replaced with `nirvanayoga.org` + `APP_URL` |
| `next.config.ts` | unsplash.com, anytimefitness.co.in | OK — remote image allowlist |
| Seed/scripts | `/uploads/...` paths | OK — relative paths |
| `content/repositories/site.ts` | `hello@nirvanayoga.studio` | Fallback content only |

No production domain hardcoded in runtime logic.

---

## 7. Hardcoded localhost references

- **README.md**, **docs/** — dev documentation only
- **No localhost in production code paths**
- Admin cookie logic correctly uses `X-Forwarded-Proto` behind Nginx

---

## 8. Development-only code

| Item | Production behavior |
|------|---------------------|
| `AdminLoginTracePanel` | Returns null when `NODE_ENV=production` |
| `AdminTunnelNotice` | Returns null in production |
| `/api/admin/debug-auth` | 404 unless `ADMIN_AUTH_DEBUG=true` |
| `NGROK_DEV_ORIGIN` | Ignored unless set |
| `CONTENT_FETCH_DELAY_MS` | Defaults to 0 |
| `middleware.ts` console.error on login | Still logs in production (minor) |

---

## 9. Existing Docker configuration

**Present:** Multi-stage `Dockerfile`, `docker-compose.yml`, `.dockerignore`

**Gaps found (fixed):**

- No health checks → added
- No DB wait / schema apply → entrypoint added
- Prisma CLI missing in runtime image → copied from builder
- Certbot reload hook broken inside certbot container → host cron script
- Host bind mount for uploads → named volume
- `SITE_URL` in compose but unused by app → `APP_URL`

---

## 10. Existing Nginx configuration

**Present:** `nginx/nginx.conf`, `nginx/conf.d/`

**Gaps found (fixed):**

- Placeholder `YOUR_DOMAIN_HERE` → domain-specific configs
- SSL config would break nginx before certs exist → split `initial.conf` / `production-ssl.conf.disabled`
- Uploads proxied through app → direct volume serve
- Missing `client_max_body_size` → 10M
- `server_tokens off` added

---

## 11. Existing build scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Production build — **passes** |
| `npm start` | `next start` (Docker uses `node server.js`) |
| `db:push` / `db:ensure` | Schema management |
| Many `db:*` scripts | One-off data backfills |

---

## 12. Existing backup assumptions

**Before:** Brief notes in old `DEPLOYMENT.md` only

**After:** `deploy/backup-database.sh`, `deploy/backup-uploads.sh`, restore scripts, cron examples

---

## Risks

| Severity | Risk |
|----------|------|
| **High** | Unauthenticated CMS write APIs (blogs, users, site config, newsletter list) — **fixed** |
| **High** | Event images in git (`public/uploads/events/*.png`) — **.gitignore updated** |
| **Medium** | `db push` without migrations — document; acceptable for single VPS |
| **Medium** | In-memory rate limiting resets on restart / doesn't scale multi-instance |
| **Medium** | `Cross-Origin-Embedder-Policy: require-corp` may break some third-party embeds |
| **Low** | Blog GET exposed unpublished posts — **fixed** with `?admin=1` gate |
| **Low** | Weak default Postgres password in old `.env.example` — **strengthened** |

---

## Blockers (resolved)

1. Unprotected admin API routes → `requireAdminSession()` added
2. `APP_URL` / `UPLOAD_DIR` not configurable → `src/lib/env.ts`
3. Docker image couldn't run Prisma → entrypoint + prisma copy
4. Nginx SSL bootstrap chicken-and-egg → `initial.conf` vs `production-ssl.conf.disabled`
5. Uploads not in `.gitignore` → fixed

---

## Required changes (completed)

- [x] Centralize `APP_URL` and `UPLOAD_DIR`
- [x] Secure unauthenticated write/read admin APIs
- [x] Docker health checks, volumes, entrypoint
- [x] Production Nginx for both domains
- [x] Backup/restore scripts
- [x] SSL renewal via host cron
- [x] `.gitignore` hardening
- [x] `.env.example` alignment
- [x] VPS deployment guide

---

## Not changed (intentional)

- No NextAuth (`NEXTAUTH_URL` not applicable)
- No `prisma migrate` adoption (documented path for future)
- No deployment executed to VPS
- Uploaded images already in git history remain until `git rm --cached`
