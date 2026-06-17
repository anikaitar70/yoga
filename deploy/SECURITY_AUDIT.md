# Security audit — production deployment

## Authentication

| Surface | Mechanism | Finding |
|---------|-----------|---------|
| `/admin/*` pages | Server layout verifies HMAC cookie | OK |
| `/api/admin/login` | `ADMIN_SECRET` comparison (timing-safe) | OK — use 32+ char secret |
| `/api/cms/*` | `requireAdminSession()` | OK (after fix) |
| `/api/upload*` | `requireAdminSession()` | OK |
| `/api/events` POST/PUT/DELETE | `requireAdminSession()` | OK |
| `/api/blogs` write | Was open — **fixed** | OK |
| `/api/users` | Was open — **fixed** | OK |
| `/api/cms/site` PUT | Was open — **fixed** | OK |
| `/api/newsletter` GET | Was open — **fixed** | OK |
| `/api/gallery` POST | Was open — **fixed** | OK |

## Public APIs (intentional)

| Endpoint | Risk | Mitigation |
|----------|------|------------|
| `POST /api/contact` | Spam | Rate limit 8/min/IP |
| `POST /api/newsletter` | Spam | Rate limit 8/min/IP |
| `POST /api/testimonials` | Spam | No rate limit — consider adding |
| `GET /api/events` | Low | Published only unless `?admin=1` + session |
| `GET /api/gallery` | Low | Published images only |
| `GET /api/blogs` | Low | Published only unless `?admin=1` + session |

## Upload security

- Admin session required
- MIME type + size validation (5 MB)
- Path traversal guarded in `deleteUploadByUrl`
- Nginx `client_max_body_size 10M`
- Files stored outside git (volume)

## Headers

- Nginx: HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy
- Middleware: CSP, COOP, COEP, CORP on API routes
- **Note:** `Cross-Origin-Embedder-Policy: require-corp` may block some third-party widgets

## Environment exposure

- `DATABASE_URL` — server-only, not in client bundle
- `ADMIN_SECRET` — server-only
- `APP_URL` — server-side metadata (no `NEXT_PUBLIC_` prefix required)
- `/api/admin/debug-auth` — disabled in production (404)

## Prisma exposure

- No raw SQL in public routes
- `ensure-db-schema.js` uses `$executeRawUnsafe` — dev/ops script only

## Deployment risks

| Risk | Severity | Recommendation |
|------|----------|------------------|
| Default Postgres password | High | Strong password in `.env` |
| Postgres port not exposed | Good | Keep internal to Docker network |
| In-memory rate limits | Medium | Acceptable for single instance |
| No WAF | Low | Consider Cloudflare if attacked |
| Admin secret brute force | Medium | Rate limit login endpoint (future) |
| Uploaded malware as images | Low | MIME check only — consider magic-byte validation |

## Secrets in git history

Run before first public push:

```bash
git rm -r --cached public/uploads
# Review: git log -p -- .env  (should be empty)
```

## Post-deploy verification

```bash
# Should return 401
curl -X PUT https://yoga.anikait.page/api/cms/site -H 'Content-Type: application/json' -d '{}'

# Should return 401
curl https://yoga.anikait.page/api/newsletter

# Should work
curl https://yoga.anikait.page/api/events
```
