# Final production-readiness audit

**Date:** 2026-06-17  
**VPS:** OVH 2 vCPU / 4 GB RAM / Ubuntu 26.04  
**Build verified:** `npm run build` passes  
**Docker dry-run:** Not executed locally (Docker unavailable on audit machine); config reviewed statically

---

## Scores

| Category | Score | Notes |
|----------|-------|-------|
| **Production readiness** | **84/100** | Solid stack; ops steps remain |
| **Security** | **81/100** | APIs secured; single-factor admin auth |
| **Deployment** | **83/100** | Compose/Docker/nginx ready; first deploy is manual |

---

## Phase 1 — API route audit

| Route | Methods | Auth | Access | Risk |
|-------|---------|------|--------|------|
| `/api/admin/login` | POST | Public (secret) | Admin login | **Medium** — rate limited (5/min) |
| `/api/admin/logout` | GET, POST | Public | Clears session | Low |
| `/api/admin/debug-auth` | GET | Disabled in prod | 404 | Low |
| `/api/cms/*` | * | **Admin session** | CMS | Low |
| `/api/upload` | POST | **Admin session** | Upload | Low |
| `/api/upload/event-image` | POST | **Admin session** | Upload (deprecated) | Low |
| `/api/blogs` | GET | Public (published only); `?admin=1` + session | Read | Low |
| `/api/blogs` | POST | **Admin session** | Write | Low |
| `/api/blogs/[id]` | GET | Public (published); `?admin=1` + session | Read | Low |
| `/api/blogs/[id]` | PUT, DELETE | **Admin session** | Write | Low |
| `/api/events` | GET | Public (published); `?admin=1` + session | Read | Low |
| `/api/events` | POST | **Admin session** | Write | Low |
| `/api/events/[id]` | GET | Public (published only) | Read | Low |
| `/api/events/[id]` | PUT, DELETE | **Admin session** | Write | Low |
| `/api/gallery` | GET | Public (published) | Read | Low |
| `/api/gallery` | POST | **Admin session** | Write | Low |
| `/api/users` | GET, POST | **Admin session** | Admin | Low |
| `/api/contact` | POST | Public | Form submit | Low — rate limited |
| `/api/newsletter` | POST | Public | Subscribe | Low — rate limited |
| `/api/newsletter` | GET | **Admin session** | Admin | Low |
| `/api/testimonials` | POST | Public | User submission | **Medium** — rate limited (added) |

**No unauthenticated write endpoints remain** except intentional public forms.

---

## Phase 2 — Prisma recommendation

### Finding

- Previously: `db push` on every container start
- Now: **baseline migration** `20250617000000_init` + entrypoint uses `migrate deploy`

### Recommendation

| Approach | Verdict |
|----------|---------|
| `db push` in production | **Reject** after first deploy |
| `migrate deploy` | **Adopt** — implemented |

### Workflow going forward

1. Local: `npx prisma migrate dev --name change_description`
2. Commit migration SQL
3. Deploy: container entrypoint runs `migrate deploy`

### Schema drift risk

- **Before fix:** High (`db push` could apply unintended changes)
- **After fix:** Low (versioned migrations)

---

## Phase 3 — Admin authentication

### Flow

```
AdminLoginForm → POST /api/admin/login (or server action)
  → verifyAdminSecret(input, ADMIN_SECRET)  [timing-safe]
  → createSessionToken() → HMAC(nonce.issuedAt)
  → Set-Cookie: nirvana_admin_token (HttpOnly, Secure in prod, SameSite=Lax, 24h)
```

### Session strategy

| Property | Value |
|----------|-------|
| Token format | `nonce.issuedAt.hmac` (upgraded this audit) |
| Server-side expiry | **24 hours** (issuedAt verified) |
| Cookie expiry | 24 hours (`ADMIN_SESSION_MAX_AGE_SEC`) |
| Revocation | Logout clears cookie only |
| Provider | None — `ADMIN_SECRET` only |

### Assessment

- **Not** NextAuth/OAuth — single shared secret
- **Adequate** for single-operator CMS on private admin URL
- **Weakness:** No MFA, no per-user accounts, secret brute-force (mitigated: 5 login attempts/min/IP)

### Logout

`POST/GET /api/admin/logout` → clears cookie on all paths

---

## Phase 4 — Upload persistence

```
Admin upload → saveUploadedImage() → UPLOAD_DIR/{section}/file
                                    ↓
                         Docker volume: uploads_data
                                    ↓
              App mount: /app/public/uploads  (read/write)
              Nginx mount: /var/www/uploads   (read-only)
                                    ↓
              URL: /uploads/{section}/file → nginx alias (bypasses Node)
```

| Scenario | Persists? |
|----------|-----------|
| Container restart | **Yes** |
| `docker compose down` / `up` | **Yes** (named volume) |
| `docker compose up --build` | **Yes** |
| `docker compose down -v` | **No** — destructive |

**Note:** First volume mount hides image-baked `public/uploads` files — expected; uploads are runtime data.

---

## Phase 5 — Git & secrets audit

| Check | Result |
|-------|--------|
| `.env` in git history | **Not found** |
| API keys in source | **None** |
| Tracked upload PNGs | **5 files** — `git rm --cached` applied (staged for removal) |
| PNGs in git history | **Still present** in past commits |

### Remediation

```bash
# Already run (staged):
git rm -r --cached public/uploads/events/*.png

# Before making repo public (optional history purge):
# git filter-repo --path public/uploads/ --invert-paths
```

---

## Phase 6 — Docker verification

| Check | Status |
|-------|--------|
| Multi-stage build | OK |
| Non-root not used | Acceptable for this stack |
| Health checks | app, db, nginx |
| `restart: unless-stopped` | All services |
| DB `depends_on: service_healthy` | OK |
| Nginx `depends_on: app healthy` | OK |
| Upload volume | `uploads_data` |
| DB volume | `db_data` |
| Entrypoint | wait → migrate deploy → start |

### Failure scenarios

| Failure | Recovery |
|---------|----------|
| DB not ready | Entrypoint waits on `pg_isready` |
| Migration fails | Container exits; fix SQL, redeploy |
| App unhealthy | nginx won't start (depends_on) |
| Volume full | Monitor disk; prune old backups |

---

## Phase 7 — Nginx verification

| Check | Status |
|-------|--------|
| Reverse proxy to `app:3000` | OK |
| SSL bootstrap | `initial.conf` first, then `production-ssl.conf` |
| Both domains in server_name | OK |
| Domain change | `APP_URL` env only |
| Security headers (SSL) | snippets/security-headers.conf |
| Gzip | Enabled |
| Upload static serve | Shared volume alias |
| Cache headers | uploads 30d, `/_next/static` 365d |

### First-deploy trap

**Do not enable `production-ssl.conf` before certificates exist** — nginx will fail to start.

---

## Phase 8 — VPS suitability (2 vCPU / 4 GB)

| Component | Estimated RAM |
|-----------|---------------|
| Next.js app | 400–800 MB |
| PostgreSQL | 256–512 MB |
| Nginx | < 50 MB |
| OS + Docker | ~500 MB |
| **Headroom** | ~2 GB |

**Verdict:** Suitable for low–moderate traffic studio site.

### Bottlenecks to watch

- Gallery image processing (sharp) on upload — CPU spike, acceptable at low volume
- OCR endpoint (`tesseract.js`) — heavy; admin-only
- In-memory rate limits — reset on restart
- Disk growth from uploads + DB backups

---

## Phase 9 — Deployment dry run

| Step | Result |
|------|--------|
| `npm run build` | **Pass** |
| `docker compose up --build` | **Not run** (no Docker on audit host) |
| Static config review | **Pass** |
| Migration SQL generated | **Pass** (10 KB init migration) |

### Would break first deployment if:

1. DNS not pointing to VPS
2. `.env` missing or weak/mismatched `DATABASE_URL`
3. `production-ssl.conf` enabled before certbot
4. Firewall blocks 80/443
5. `ADMIN_SECRET` not set

---

## Files modified (this audit)

- `src/lib/admin-auth.ts` — session tokens with issuedAt + expiry
- `src/lib/admin-auth-shared.ts` — `ADMIN_SESSION_MAX_AGE_SEC`, cookie format check
- `middleware.ts` — login + testimonial rate limits
- `scripts/docker-entrypoint.sh` — `migrate deploy`
- `prisma/migrations/20250617000000_init/migration.sql` — **new**
- `prisma/migrations/migration_lock.toml` — **new**
- `docker-compose.yml` — POSTGRES env on app service
- `nginx/conf.d/initial.conf` — `client_max_body_size`
- `deploy/database-init.md` — updated
- `public/uploads/events/*.png` — untracked from git (staged)

---

## Four critical questions

### 1. Can this be pushed to GitHub right now?

**Almost — with one commit first.**

- Untracked upload PNGs are staged for removal
- `.env` is not in history
- Upload PNGs **remain in git history** — acceptable while repo is private; run `git filter-repo` before going public

### 2. Can this be deployed to OVH VPS right now?

**Yes, after operational setup** (not code blockers):

- Configure `.env` on VPS
- Point DNS to `51.79.251.45`
- Use `initial.conf` only until SSL issued
- Run `docker compose up -d --build`

### 3. Highest-risk issue remaining?

**Single-factor `ADMIN_SECRET` authentication** — anyone who obtains the secret has full CMS access. Mitigate with a long random secret, HTTPS only, and optional IP allowlist at nginx (not implemented).

### 4. What must be fixed before real users?

| Must do | Status |
|---------|--------|
| Strong `ADMIN_SECRET` (32+ bytes random) | **Operator** |
| HTTPS enabled | **Operator** |
| Database seeded with real content | **Operator** |
| Backups scheduled | **Operator** |
| Remove tracked uploads from git commit | **Staged — commit required** |
| Verify site on production domain | **Operator** |

Code-level blockers: **none identified**.
