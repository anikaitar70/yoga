<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — Nirvana Yoga Website

Practical context for AI coding agents working in this repository. Everything here is based on the actual code; anything not verifiable is marked **uncertain**.

---

## 1. Project Overview

- **What it is:** The production website + custom CMS for **Nirvana Yoga** (`nirvanayoga.org`), a yoga / healing / art studio community based in Japan.
- **What it does:** Serves a bilingual (English / Japanese) public marketing site (programs, events, gallery, blog, testimonials, contact, newsletter) plus an in-repo admin CMS at `/admin` for editing all of that content.
- **Stack:** Next.js **16.2.6** App Router (React 19, `output: "standalone"`), TypeScript strict, Tailwind CSS v4, Prisma 5 + PostgreSQL, deployed via Docker Compose (app + postgres + nginx + certbot) on a VPS.
- **Who uses it:** Public visitors (EN + JA) and studio admins who manage content through `/admin` (GitHub OAuth login gated by an email allowlist).

This is **not** a generic starter or headless-CMS SaaS — it is one monolithic app where the CMS and public site share the same codebase and database.

## 2. Architecture

```
Browser
  └─ nginx (:80/:443) ── serves /uploads/* statically from a shared Docker volume
       └─ Next.js standalone server (:3000)
            ├─ src/proxy.ts        (Edge "proxy" — Next 16's renamed middleware; see §13)
            ├─ src/app/(public)/*  Server Components → src/content/repositories → Prisma → PostgreSQL
            ├─ src/app/admin/*     Client Components → REST API routes (/src/app/api/...) → Prisma
            └─ src/app/api/*       Route handlers (public forms, admin CRUD, uploads, OCR, analytics)
```

Key architectural facts:

- **Three data-access patterns:**
  1. Public pages are React **Server Components** that call repository functions from `@/content` (which wrap Prisma with caching + fallbacks).
  2. Admin screens are **Client Components** that talk to REST route handlers under `src/app/api/`.
  3. Public forms (contact, newsletter, testimonial submission) POST to `/api/contact`, `/api/newsletter`, `/api/testimonials`.
- **Content layer:** `src/content/` is a deliberate seam ("swap repository implementations for CMS clients later" — `src/content/index.ts`). Repositories read Prisma but fall back to static copy in `src/content/nirvana-copy.ts` when the DB row is missing/empty. Do not add a separate `services/` layer on top of this.
- **Single Prisma client:** always import `{ prisma }` from `@/lib/prisma`. It is a lazy Proxy that detects stale generated clients after schema changes during dev hot reload (requires `serverExternalPackages` in `next.config.ts` — do not remove it).
- **Caching/revalidation:** repositories use `unstable_cache` with tags (e.g. `"events"`); admin mutations call helpers like `revalidateEvents()` (`src/lib/revalidate-events.ts`) which invalidate tags *and* every affected path in **both locales**.

## 3. Repository Structure

| Path | Purpose |
|---|---|
| `src/proxy.ts` | Edge proxy (locale rewrite/header injection, security headers, rate limiting, visitor cookie + page-view analytics). **There is no `middleware.ts`** — Next 16 renamed the convention to `proxy`. |
| `src/app/(public)/` | All public pages: home, `/about`, `/yoga`, `/healing`, `/just-art-life`, `/events` (+ `[category]`, `special/[slug]`), `/gallery`, `/blog` (+ `[slug]`), `/contact`. Group layout sets branding/design/locale providers and is `force-dynamic`. |
| `src/app/admin/` | Admin dashboard pages (dashboard, events, special-events, blogs, pages, content, design, gallery managers under `content`, subscribers, contact, analytics, sessions, diagnostics). Layout performs real auth verification. |
| `src/app/actions/admin-login.ts` | Server action for legacy login — returns HTTP 410 (secret-key login disabled). |
| `src/app/api/` | Route handlers. Notable groups: `api/admin/auth/*` (GitHub OAuth + local dev login), `api/cms/*` (admin CRUD for hero, site config, page sections, gallery, collages, testimonials, SEO), `api/events/*` (+ nested `page-sections`, `special-event-toc`), `api/upload`, `api/analytics/record`, `api/health`. |
| `src/components/` | UI organized by domain: `home/`, `program/`, `content/` (+ `sections/`, `timeline/`), `admin/` (+ `preview/` studios), `design/`, `i18n/`, `layout/`, `seo/`, `testimonials/`, `ui/`. |
| `src/content/` | Content seam: `repositories/` (DB readers), `types/`, `nirvana-copy.ts` (static English fallback copy). |
| `src/lib/` | Large flat library layer: i18n (`lib/i18n/`, translations in `lib/i18n/translations/ja*.ts`), SEO (`lib/seo/`), auth (`admin-auth*`, `github-oauth`, `local-admin-auth`, `require-admin-session`), uploads (`upload-*`, `image-variants`), OCR (`testimonial-ocr*`), design settings, homepage layout, revalidation helpers, `prisma.ts`, `env.ts`. |
| `prisma/` | `schema.prisma`, `migrations/`, `seed.js`, plus ~20 one-off seed/backfill/migration scripts wired to npm scripts (`db:*`). |
| `scripts/` | Ops/dev scripts: `docker-entrypoint.sh`, `dev-clean.js`, `stop-dev.ps1`, `ensure-db-schema.js`, `optimize-gallery-images.js`, `consolidate-site-config.sh`. |
| `nginx/`, `deploy/` | Production nginx config (`conf.d/production-ssl.conf` serves `/uploads/` from the volume) and VPS ops docs/scripts (SSL, backups, restore). |
| `docs/` | Local (gitignored) AI/operator docs: `LLM_PROJECT_DOCUMENTATION.md` (primary handoff), `ARCHITECTURE_DIAGRAM.md` (mermaid diagrams), `PROJECT_MEMORY.md` (**deprecated**), client handbook. Read the first two before deep changes. |
| Root media folders | `art/`, `YogaNidra teachers training/`, `indian embassy at japan/` are raw source photos (WhatsApp exports) used to seed/import content — **not application code**. `eng.traineddata` at root is Tesseract data; code only reads `tessdata/`, so this root copy is effectively unused (see §12). |
| Generated / don't edit | `.next/`, `node_modules/` (incl. `.prisma/client`), `next-env.d.ts`, `tsconfig.tsbuildinfo`, `public/uploads/**`, `backups/`, `.tesseract-cache/`, `install-check.txt` (a dependency check artifact). |

## 4. Execution Flow

**Public request (e.g. `GET /ja/events`):**

1. nginx terminates TLS, proxies to the Next standalone server; `/uploads/*` is served directly from the volume (never hits Next).
2. `src/proxy.ts` runs (matcher covers everything except `_next/static`, `_next/image`, favicon, brand assets, `uploads/`):
   - Detects `/ja` prefix → **rewrites** to the unprefixed path and sets request header `x-nirvana-locale: ja` (plus `nirvana_locale` cookie). For EN paths it injects `x-nirvana-locale: en`.
   - Applies security headers (CSP differs between dev/prod; COOP/COEP/CORP are deliberately skipped for public+admin routes because they break chunk loading).
   - Enforces in-memory rate limits on form/login POSTs (8/min forms, 5/min admin logins per IP+path → 429).
   - For trackable GET page views: ensures an httpOnly visitor cookie and records a page view asynchronously (`event.waitUntil`) by calling `/api/analytics/record` with the internal secret header.
3. Route renders. Server Components call `getLocale()` (`src/lib/i18n/server.ts`), which reads the injected `x-nirvana-locale` **request header** (not the response header, not the DB).
4. Pages fetch content through `@/content` repositories (cached, DB-first with static fallbacks) and render section components wrapped in `Suspense`.
5. `(public)/layout.tsx` is `export const dynamic = "force-dynamic"` because the DB isn't available at Docker image build time — pages must render at runtime.

**Admin flow:**

1. `GET /api/admin/auth/github` → GitHub OAuth (state cookie `nirvana_oauth_state`, 10 min) → callback verifies state, requires primary verified email ∈ `ADMIN_ALLOWED_EMAILS` → creates `AdminSession` DB row → sets signed HttpOnly cookie `nirvana_admin_token` (HMAC via `ADMIN_SECRET`, 24h expiry).
2. `/admin/*` pages: proxy only checks cookie *presence/format* (logs only); the real HMAC verification happens in `src/app/admin/layout.tsx` (`force-dynamic`), which renders `<AdminLoginForm>` when unauthorized.
3. Every mutating API route calls `requireAdminSession()` (`src/lib/require-admin-session.ts`) — HMAC verify **plus** DB lookup so revoked sessions are rejected, then touches `lastSeenAt`.
4. Mutations write via Prisma and call `revalidate*()` helpers so both locales' public pages refresh.

## 5. Core Components

- **`src/lib/prisma.ts`** — lazy Prisma Proxy singleton; detects stale generated clients (checks delegates like `pageSection`, `galleryCollage`). Import pattern: `import { prisma } from "@/lib/prisma"`.
- **Repositories (`src/content/repositories/*.ts`)** — `fetchSite`, `fetchHero`, `fetchPageSections`, `fetchEvents*`, `fetchSpecialEventBySlug`, `fetchBlogPostBySlug`, `fetchGalleryItems/Collections/Collage`, `fetchTestimonials`, etc. Each maps Prisma rows into typed content models (`src/content/types/`) and falls back to static defaults from `nirvana-copy.ts` when data is absent.
- **i18n system (`src/lib/i18n/`)** — locales `en`/`ja`; `/ja` URL prefix handled purely by the proxy rewrite (no `[locale]` route segment). Japanese copy comes from three sources: hardcoded translation tables (`translations/ja*.ts`), per-entity `jaLocale` JSON columns (Event, BlogPost, Testimonial, EventPageSection, SiteConfig.localeContent), and merge/resolvers (`resolve.ts`, `homepage-merge.ts`). `TranslationReviewStatus` (`MACHINE` vs `HUMAN_REVIEWED`) tracks review state; a public disclaimer banner marks machine-translated content (`TranslationDisclaimer` component).
- **Admin auth (`src/lib/admin-auth*.ts`)** — token = `nonce.issuedAt[.sessionId].hmac_sha256_hex` signed with `ADMIN_SECRET`; DB-backed revocation via `AdminSession`; GitHub OAuth allowlist (`ADMIN_ALLOWED_EMAILS`); local username/password login exists but is hard-gated to localhost + non-production + explicit env vars. Legacy secret login (`/api/admin/login`) returns **410 Gone**.
- **Uploads (`src/lib/upload-server.ts` + `/api/upload`)** — multipart `file` + `section` field (events/gallery/blog/homepage/pages/testimonials/branding); max 15 MB; JPEG/PNG/WebP/GIF/SVG; written to `UPLOAD_DIR` as `/uploads/<section>/...<timestamp>...<ext>`; gallery images additionally get sharp-generated WebP variants (`-thumb/-medium/-full`, sequential to avoid overloading the small VPS). Optional `replaceUrl` deletes the previous file.
- **Testimonial OCR (`src/lib/testimonial-ocr*.ts` + `/api/cms/testimonials/ocr`)** — tesseract.js worker (singleton, serialized queue, 45s timeout, eng only) over sharp-preprocessed images; heuristically parses name/role/city/country + quote; result is human-reviewed in `OCRReviewPanel` and stored in `Testimonial.extractedText`.
- **Section/page rendering engine** — `PageSectionRenderer` + `LayoutAware*` components render DB-driven page sections (`PageSection`, `EventPageSection`) with per-page/per-section design settings (fonts, timeline styles, layouts) resolved through `DesignSettingsProvider` and `lib/design-settings.ts`. Special events get dedicated pages at `/events/special/[slug]` with automatic or custom TOC anchors (`anchorSlug` is stable even if titles change).
- **SEO (`src/lib/seo/`, `components/seo/`)** — metadata builders, JSON-LD, sitemap.ts, robots.ts, per-page `PageSeo` rows and per-event/blog overrides.

## 6. Data Flow

- **In:** admin edits (REST APIs), public form submissions (contact/newsletter/testimonials), image files (uploads), OCR results, raw photos in the root media folders (imported via prisma scripts).
- **Stored:** PostgreSQL (`DATABASE_URL`). Main models: `Event` (+`EventPageSection`), `BlogPost`, `PageSection` (per PageType: YOGA/HEALING/JUST_ART_LIFE/ABOUT), `SiteConfig` (singleton row holding branding/navigation/homepage layout/design settings/locale content), `GalleryCollection/Image/Collage`, `Testimonial`, `HeroSection`, `AboutPage`, `NewsletterSubscriber`, `ContactMessage`, `User`, `PageView` (analytics), `AppDiagnosticEvent`, `AdminSession`. See `prisma/schema.prisma`.
- **Files:** uploads go to `UPLOAD_DIR` (Docker: `/app/public/uploads`, a named volume also mounted read-only into nginx at `/var/www/uploads`).
- **Out:** rendered EN/JA pages, `/uploads/...` image URLs (with WebP variants for gallery), JSON APIs, sitemap/robots/JSON-LD.

## 7. CLI / Commands

All verified from `package.json`:

```bash
npm run dev          # next dev
npm run dev:clean    # Windows-friendly clean start: kills node processes, clears .next,
                     #   prisma db push + ensure-db-schema, regenerates Prisma client (retries on EPERM),
                     #   then starts next dev
npm run dev:stop     # PowerShell script that stops dev node processes
npm run build        # next build (also type-checks)
npm run lint         # eslint (flat config)
npm start            # next start
npm run prisma:generate

# Database (Prisma + helper scripts)
npm run db:push                  # prisma db push
npm run db:seed                  # prisma db seed -> prisma/seed.js
npm run db:ensure                # scripts/ensure-db-schema.js (idempotent schema checks)
npm run db:seed-events           # featured events
npm run db:seed-pages            # page sections
npm run db:sync-events           # pull events from production API (EVENTS_SYNC_SOURCE_URL)
npm run db:ocr-testimonials      # batch OCR
npm run db:import-gallery / db:backfill-gallery / db:optimize-gallery
# ... plus more one-off backfills/migrations (see package.json "scripts")
```

Production ops (from `DEPLOYMENT.md` / `docker-compose.yml`): `docker compose up -d --build`; entrypoint waits for Postgres, runs `prisma migrate deploy` (falls back to `db push` if no migrations dir), consolidates the `SiteConfig` singleton, creates upload/tessdata-cache dirs, then starts `node server.js`.

## 8. Configuration

- **`.env.example`** documents every production variable; copy to `.env`:
  - `APP_URL` (canonical site URL; drives metadata/links — domain changes require no code edits), legacy aliases `SITE_URL` / `NEXT_PUBLIC_SITE_URL`.
  - `DATABASE_URL`, `POSTGRES_USER/PASSWORD/DB`.
  - `ADMIN_SECRET` (32+ chars, signs session cookies — server-side only).
  - `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`, `ADMIN_ALLOWED_EMAILS` (comma-separated allowlist).
  - `UPLOAD_DIR` (default `${cwd}/public/uploads` — see `src/lib/env.ts`).
  - Dev-only: `NGROK_DEV_ORIGIN` (enables `allowedDevOrigins` in next.config), `ALLOW_LOCAL_ADMIN_LOGIN`, `LOCAL_ADMIN_USERNAME/PASSWORD` (store in `.env.local`), `ADMIN_AUTH_DEBUG`, `ADMIN_FORCE_SECURE_COOKIE`, `EVENTS_SYNC_SOURCE_URL`, `TESSERACT_CACHE_DIR`.
  - `NEXT_PUBLIC_SITE_BACKGROUND`: aurora | mandala | horizon | ripple (public scroll background).
- **`next.config.ts`**: `reactStrictMode`, `output: "standalone"`, `devIndicators: false`, `serverExternalPackages: ["@prisma/client","prisma","sharp","tesseract.js","tesseract.js-core"]` (required — keeps Prisma/sharp/tesseract out of bundler chunks; removing it breaks `src/lib/prisma.ts`), remote image patterns for Unsplash etc.
- **TypeScript:** strict; path alias `@/*` → `./src/*`.
- **Never commit** `.env` / `.env.local` (gitignored).

## 9. Dependencies and External Systems

| Dependency | Used for |
|---|---|
| `next` 16.2.6 / `react` 19 | App Router framework. **Breaking-change territory — see warning at top.** |
| `@prisma/client` + `prisma` 5.x | PostgreSQL ORM; generated client in `node_modules/.prisma` (postinstall regenerates). |
| `zod` 4 | Request-body validation in API routes (`src/lib/validators.ts` and inline schemas). |
| `sharp` 0.35 | Upload preprocessing + WebP variant generation; OCR image prep. |
| `tesseract.js` 5 | Testimonial OCR (eng). Lang data fetched to `tessdata/` (Docker) or CDN cache `.tesseract-cache/` (dev). |
| `framer-motion` 11 | Animations (ScrollReveal, MotionReveal, carousels). |
| `tailwindcss` v4 + `@tailwindcss/postcss` | Styling; tokens/theme in `src/app/globals.css`; Google Fonts via `site-fonts-loader`. |
| PostgreSQL 16 (Docker) | Only datastore. |
| GitHub OAuth API | Admin identity (user + emails endpoints). |
| External CDNs | Tesseract traineddata (jsDelivr at Docker build), Unsplash images (fallback imagery + remotePatterns). |
| No browser automation / CDP anywhere in this project. |

## 10. Testing

- **There is no automated test suite.** No test runner, no `test` script, no `__tests__` directories (verified).
- Validation means:
  ```bash
  npm run lint     # eslint incl. typescript rules
  npm run build    # full type-check + production build
  ```
- Manual verification checklist for meaningful changes: public home page, `/yoga`, `/healing`, `/just-art-life`, `/events`, `/ja/*` equivalents, `/admin` login + relevant editor, upload flow, and after content mutations confirm revalidation picked up changes in **both locales**.

## 11. Development Workflow

1. Copy `.env.example` → `.env`; set `DATABASE_URL` to a local Postgres; set dev admin vars if needed.
2. `npm install` (postinstall runs `prisma generate`).
3. `npm run db:push && npm run db:seed` (or just use `npm run dev:clean` which pushes schema and starts dev).
4. `npm run dev` → http://localhost:3000 ; admin at `/admin`.
   - Local admin login (localhost only): set `LOCAL_ADMIN_USERNAME`/`LOCAL_ADMIN_PASSWORD` in `.env.local`.
   - ngrok tunneling: set `NGROK_DEV_ORIGIN`; admin cookies switch to `SameSite=None; Secure` on ngrok hosts automatically.
5. Windows-specific pain point: `prisma generate` can fail with EPERM while `next dev` holds engine file locks — `scripts/dev-clean.js` handles killing processes and retrying; `npm run dev:stop` cleans up stragglers.
6. Debugging aids: `ADMIN_AUTH_DEBUG=true` enables auth trace logging (`logAuthTrace`, secrets masked); `/admin/diagnostics` + `AppDiagnosticEvent` table record upload/login/CMS-save/image failures; `/api/health` is a liveness probe (no DB access).

## 12. Outputs and Artifacts

- `.next/` — build output (standalone bundle used by Docker). Regenerated; never edit.
- `public/uploads/<section>/...` — user uploads + sharp WebP variants. Volume-mounted in production; gitignored except `.gitkeep`. Deleting DB rows does not delete files unless the API's `replaceUrl` path handled it → orphan files are a known issue.
- `tessdata/eng.traineddata.gz` — created during Docker build for OCR. In dev, tesseract downloads to `.tesseract-cache/`. Note: `eng.traineddata` sitting at the **repo root is not referenced by any code** (code checks only `cwd/tessdata/`); treat it as inert.
- `backups/uploads/` — local backup artifacts; gitignored.
- `tsconfig.tsbuildinfo`, `next-env.d.ts`, `node_modules/.prisma/**` — tooling-generated.
- `install-check.txt` — leftover dependency-verification artifact; safe to ignore.

## 13. Important Constraints and Gotchas

1. **Next.js 16 ≠ your training data.** `middleware.ts` is deprecated/renamed: this app uses `src/proxy.ts` exporting `function proxy(...)`. Check `node_modules/next/dist/docs/` before touching routing, caching (`unstable_cache`, `revalidateTag(path, profile)` signature here takes a cache profile), cookies, or metadata APIs.
2. **Runtime split:** `proxy.ts` runs on Edge — never import Node-only modules (`admin-auth.ts` uses `crypto`/Prisma indirectly, `server-only` files) into it. Cookie clearing must append multiple `Set-Cookie` headers because Next dedupes same-name cookies; redirects must be absolute URLs.
3. **Defense in depth for admin auth:** the proxy does NOT verify sessions (format check + logging only). Real checks: HMAC in `admin/layout.tsx` for pages; `requireAdminSession()` in every API route (adds DB revocation check). When adding admin APIs, you must call `requireAdminSession()`. Never assume middleware protects an endpoint.
4. **Locale plumbing:** locale travels via the injected request header `x-nirvana-locale`, rewritten from the `/ja` path prefix. Reading cookies directly in Server Components will give wrong answers. Any new public route must be added to revalidation lists in **both locales** (see `revalidate-events.ts` for the pattern).
5. **Local uploads bypass next/image:** `/_next/image` fails (400) for `/uploads/...` paths in production; images from uploads must render unoptimized (`isLocalUploadUrl()` in `src/lib/upload-url.ts`). Use the existing `MediaImage`/`LayoutAwareMediaImage` components rather than raw `next/image`.
6. **`force-dynamic` in `(public)/layout.tsx` is deliberate** — no DB at Docker build time. Don't "optimize" pages back to static generation without solving runtime DB access.
7. **Rate limiter and OCR queue are in-memory** (module-level `Map` / worker singleton): per-instance only, reset on restart. Fine for the single-container deployment; would break behind multiple replicas.
8. **Enum duplication:** `EventCategory`/`PageType`/etc. exist both in `schema.prisma` and TS libs (`event-categories.ts`, `page-section-types.ts`, `gallery-categories.ts`). Keep them aligned when adding values, including migrations for existing rows.
9. **`SiteConfig` is a singleton** (fixed ID, see `site-config-store.ts`); the entrypoint consolidates duplicates. Many features read nested JSON blobs off this row (branding, homepage layout, design settings, locale content) — parse via the helpers in `src/lib/site-*.ts` instead of ad-hoc casts.
10. **Analytics recording** from the proxy uses header `x-analytics-internal` with a shared secret (`analytics-shared.ts`) that has a known dev default — keep treating `/api/analytics/record` as internal-only.
11. **Stale docs:** `docs/PROJECT_MEMORY.md` is deprecated and partially wrong about auth/middleware. `README.md` lists core APIs but omits the whole `/api/cms/*` surface. Trust the code and `docs/LLM_PROJECT_DOCUMENTATION.md` over older docs.
12. **Design language:** calm peach/sage aesthetic, generous whitespace, handwritten accents (Caveat font). Preserve fallbacks (static copy, default logos/fonts) and the legacy-WebKit gradient fallbacks added in recent commits.

## 14. Guidance for AI Coding Agents

Before modifying code:

1. Read `docs/LLM_PROJECT_DOCUMENTATION.md` and `docs/ARCHITECTURE_DIAGRAM.md` (local, gitignored, current as of 2026‑08) for decision logs (D1–D12) and diagrams.
2. For anything Next.js-API-related, consult `node_modules/next/dist/docs/` first — assume your prior knowledge of middleware/caching conventions is outdated.
3. Follow the established seams: page data through `@/content` repositories; admin mutations through REST routes that validate with zod, gate with `requireAdminSession()`, and end with the appropriate `revalidate*()` call covering both locales.

Extra-care areas:

- `src/proxy.ts` (security headers, CSP, rate limits, analytics) — small changes have site-wide blast radius.
- `src/lib/prisma.ts` + `serverExternalPackages` — required pairing; don't "simplify" either.
- Admin auth chain (`admin-auth-shared.ts` → `require-admin-session.ts` → admin layout) — cookie semantics are subtle (SameSite/Secure switching, multi-path clearing, absolute redirect URLs).
- Upload/OCR pipeline — sequential processing and timeouts were tuned for a small VPS.
- `jaLocale` JSON shapes documented in `schema.prisma` comments — keep patches shape-compatible (`LocalePageSectionPatch` etc.).

Do not blindly:

- Add a `middleware.ts` file (conflicts with the proxy convention).
- Introduce static generation/ISR on DB-backed public pages without handling the no-DB-at-build case.
- Serve `/uploads/` URLs through optimized `next/image`.
- Assume the README's API list is complete, or that `PROJECT_MEMORY.md` reflects current auth.
- Edit generated files (`.next`, `node_modules/.prisma`, `next-env.d.ts`) or commit `.env*`.

How to validate changes:

```bash
npm run lint
npm run build
```

…then manually smoke-test the affected public pages in both `/` and `/ja/`, plus the related `/admin` editor. There is no test suite to run — careful manual verification is the only safety net.
