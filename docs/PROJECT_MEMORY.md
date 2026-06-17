# Nirvana Yoga — Project Memory (AI Reference)

> **Purpose:** Structured architecture reference for future AI sessions.  
> **Last analyzed:** 2026-05-26 (program pages CMS + API auth hardening)  
> **Rule:** Read `AGENTS.md` and `node_modules/next/dist/docs/` before changing Next.js APIs — this project uses Next.js 16.x with conventions that may differ from training data.

---

# 1. Project Overview

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16.2.6** (App Router, `output: "standalone"`) |
| UI | **React 19.2.4**, **Tailwind CSS v4** (`@import "tailwindcss"` in `globals.css`) |
| Fonts | `next/font`: DM Sans (body), Cormorant Garamond (display) |
| Database | **PostgreSQL** via **Prisma 5.12** |
| Validation | **Zod 4.4** (`src/lib/validators.ts`) |
| Deployment | Docker Compose + Nginx + Certbot (`docker-compose.yml`, `DEPLOYMENT.md`) |

## Architectural style

- **Monolithic Next.js app** with three parallel data-access patterns:
  1. **Public site:** Server Components → `src/content/repositories/*` → Prisma (direct DB reads).
  2. **Admin CMS:** Client Components → REST `fetch` via `adminFetch` → `src/app/api/*` route handlers → Prisma.
  3. **Public forms:** Client → `/api/contact`, `/api/newsletter` (no admin auth).
- **Not** a headless CMS product — custom admin built in-repo.
- **No `services/` layer** exists; business logic lives in repositories, route handlers, and client managers.

## Runtime strategy

| Runtime | Where |
|---------|--------|
| **Node.js** | Server Components, admin `layout.tsx` auth (crypto), upload routes (`fs`), Prisma |
| **Edge** | `middleware.ts` (headers, rate limit, cookie *presence* only — no HMAC verify) |
| **Client** | All `*Manager.tsx`, `ImageUploadField`, `AdminLoginForm`, public forms |

## Design philosophy

- **Calm studio aesthetic:** CSS variables in `globals.css` — peach/off-white `#f7f4ef`, sage accent `#5c6b52`, serif display headings.
- **Pragmatic CMS:** Single admin secret, not user accounts for editors.
- **Resilience via fallbacks:** Large hardcoded fallback objects in `src/content/repositories/site.ts` and `gallery.ts` when DB empty.
- **Repository abstraction (partial):** `src/content/index.ts` exports types + repositories; comment says "swap for CMS clients later" but admin already uses separate API path.
- **Lightweight uploads:** Local disk under `public/uploads/{section}/`, no cloud storage.

## State management approach

- **No global client store** (no Redux/Zustand).
- Admin: **local `useState`** per manager component (`EventManager`, `BlogManager`, `ContentManager`).
- Public: **server-fetched props** + React `Suspense` streaming on homepage.
- Auth: **HTTP-only cookie** `nirvana_admin_token` — state lives in cookie, verified in `src/app/admin/layout.tsx`.

## Rendering strategy

- **Public pages:** Predominantly **async Server Components** fetching via `@/content` repositories.
- **Homepage (`src/app/page.tsx`):** Multiple `<Suspense>` boundaries per section (Hero, AboutPreview, Events, Philosophy, Testimonials).
- **Admin:** Server pages load initial data (Prisma) → pass to **client** managers for mutations.
- **Loading UI:** `loading.tsx` on `/events`, `/blog`, `/gallery` routes.

---

# 2. Folder Structure Analysis

```
yoga/
├── prisma/              # Schema, seed.js, cleanup.js
├── public/uploads/      # Runtime image storage (Docker volume mount)
├── middleware.ts        # Root-level (NOT under src/)
├── src/
│   ├── app/             # App Router: pages + API routes + one server action
│   ├── components/      # UI + admin + layout + content sections
│   ├── content/         # Types + repositories (public read layer)
│   └── lib/             # Shared utilities, auth, validators, upload
├── nginx/               # Production reverse proxy config
├── docs/                # ADMIN_NGROK.md, this file
└── docker-compose.yml
```

## `src/app/`

- **Pages:** Public marketing site + `/admin/*` dashboard.
- **API routes:** `src/app/api/**/route.ts` — JSON REST handlers.
- **Layouts:** Root `layout.tsx` wraps all public pages in `MainLayout`; `admin/layout.tsx` is separate auth gate (no `MainLayout`).
- **Server actions:** Only `src/app/actions/admin-login.ts` (`submitAdminLogin`) — **login UI uses API route instead** (`AdminLoginForm` → `/api/admin/login`).

## `src/components/`

| Subfolder | Role |
|-----------|------|
| `admin/` | CMS client UI: managers, shell, login, `ImageUploadField` |
| `content/` | Page section assemblies (`EventList`, `GallerySection`, etc.) |
| `home/` | Homepage-specific sections (`Hero`, `Testimonials`, …) |
| `layout/` | `Navbar`, `Footer`, `MainLayout`, `NewsletterForm` |
| `ui/` | Design system primitives (`Button`, `Card`, `Section`, …) |
| `contact/` | Public contact form |
| `page/` | `PageContent` wrapper |

## `src/content/repositories/` (not root `repositories/`)

- **Public read layer** — direct Prisma access, maps DB → content types.
- `site.ts` is the **largest file** — hero, about, site config, page intros, yoga/healing blocks, fallbacks.
- `hero.ts` / `about.ts` are **re-export shims** → `site.ts`.
- **No write operations** in repositories.

## `services/`

**Does not exist.** Mutations go through API routes only.

## `src/lib/`

| File / area | Role |
|-------------|------|
| `prisma.ts` | Singleton Prisma client |
| `validators.ts` | Zod schemas for all API payloads |
| `admin-auth.ts` | Node crypto: session token create/verify |
| `admin-auth-shared.ts` | Edge-safe cookies, ngrok detection |
| `admin-auth-debug.ts` | Verbose auth logging |
| `admin-fetch.ts` | `adminFetch`, `parseAdminJsonResponse`, `adminJsonRequest` |
| `admin-types.ts` | Admin-facing TS interfaces (differ from public types) |
| `event-categories.ts` | Prisma enum constants + slug mappers |
| `page-section-types.ts` / `page-section-payloads.ts` | Program page section enums + Zod payload shapes |
| `require-admin-session.ts` | API route guard — verifies `nirvana_admin_token` (Node) |
| `upload-server.ts` / `upload-client.ts` / `upload-sections.ts` | Image pipeline |
| `api.ts` | `badRequest`, `jsonResponse`, etc. for some routes |
| `constants.ts` | Tailwind class tokens |
| `content.ts` | **Deprecated** re-export → `@/content` |
| `format.ts`, `utils.ts`, `site.ts` | Helpers |

## `prisma/`

- `schema.prisma` — single source of DB truth.
- `seed.js` — upserts fixed IDs (`hero`, `about`, `main`) + sample content.
- `cleanup.js` — one-off category migration helper.

## `middleware.ts` (project root)

- Matcher: `/api/:path*`, `/admin`, `/admin/:path*`.
- Security headers on all matched routes.
- In-memory rate limit for form/upload POSTs.
- **Does not block unauthenticated API access.**

## `public/uploads/`

- Sections: `events/`, `gallery/`, `blog/`, `homepage/`, `testimonials/`.
- Served as static files at `/uploads/{section}/{filename}`.
- Persisted via Docker volume `./public/uploads:/app/public/uploads`.

## `src/app/admin/`

- Protected by `admin/layout.tsx` (server-side session verify).
- Visual style: **slate** palette (differs from public site tokens).
- Pages: overview, events, blogs, content (CMS), subscribers, contact (read-only).

## Problematic organization

1. **Dual gallery APIs:** `/api/gallery` and `/api/cms/gallery` — admin uses CMS; public repo uses Prisma directly.
2. **Split auth modules:** `admin-auth.ts` vs `admin-auth-shared.ts` — required for Edge/Node split but easy to import wrong one.
3. **`lib/content.ts` deprecated** but may still be imported elsewhere.
4. **Admin types vs public types** for same entities (`EventCategory` UPPER_SNAKE in admin vs kebab on public).
5. **Hardcoded content in `site.ts`** mixed with DB-backed fields — unclear what's editable vs static.

---

# 3. Routing Architecture

## Public routes (Server Components unless noted)

| Route | File | Data source |
|-------|------|-------------|
| `/` | `app/page.tsx` | `@/content` + Suspense |
| `/about` | `app/about/page.tsx` | `fetchAboutPage` |
| `/yoga` | `app/yoga/page.tsx` | `fetchYogaOfferings`, `fetchPageIntro` |
| `/healing` | `app/healing/page.tsx` | `fetchHealingModalities` |
| `/just-art-life` | `app/just-art-life/page.tsx` | `fetchJustArtLifePage` (**hardcoded fallback only**) |
| `/events` | `app/events/page.tsx` | `fetchEvents` |
| `/events/[category]` | `app/events/[category]/page.tsx` | `fetchEventsByCategory` — categories: `yoga`, `healing`, `just-art-life`, `retreats-and-tours` |
| `/gallery` | `app/gallery/page.tsx` | `fetchGalleryItems` |
| `/blog` | `app/blog/page.tsx` | `fetchBlogPosts` |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | `fetchBlogPostBySlug` |
| `/contact` | `app/contact/page.tsx` | site config + `ContactForm` (client) |

## Admin routes (protected)

| Route | File | Notes |
|-------|------|-------|
| `/admin` | `admin/page.tsx` | Dashboard counts via Prisma |
| `/admin/events` | `admin/events/page.tsx` | → `EventManager` |
| `/admin/blogs` | `admin/blogs/page.tsx` | → `BlogManager` |
| `/admin/content` | `admin/content/page.tsx` | → `ContentManager` |
| `/admin/pages` | `admin/pages/page.tsx` | → `PageSectionsManager` (Yoga / Healing / Just Art Affair) |
| `/admin/subscribers` | `admin/subscribers/page.tsx` | Read-only |
| `/admin/contact` | `admin/contact/page.tsx` | Read-only |

**Auth gate:** `admin/layout.tsx` — if `getAdminAuthState().authorized` is false, renders `AdminLoginForm` instead of children.

## Protected routes (actual behavior)

| Surface | Protected? | Mechanism |
|---------|------------|-----------|
| `/admin/*` pages | **Yes** | `admin/layout.tsx` verifies signed cookie |
| `/api/cms/page-sections/*` | **Yes** | `requireAdminSession()` on all methods |
| `/api/upload`, `/api/upload/event-image` | **Yes** | `requireAdminSession()` on POST |
| `/api/cms/*` (hero, about, site, gallery, testimonials) | **No** | Still open — protect next |
| `/api/events`, `/api/blogs` | **No** | CRUD open |
| `/api/admin/login` | Public | Intentionally open |

## API routes

### Auth
- `POST /api/admin/login` — JSON or form; sets cookie via `applyAdminSessionCookie`
- `POST|GET /api/admin/logout`
- `GET /api/admin/debug-auth` — dev diagnostics

### Content CRUD
- `/api/events`, `/api/events/[id]`
- `/api/blogs`, `/api/blogs/[id]`
- `/api/cms/hero`, `/api/cms/about`, `/api/cms/site`
- `/api/cms/gallery`, `/api/cms/gallery/[id]`
- `/api/cms/testimonials`, `/api/cms/testimonials/[id]`
- `/api/cms/page-sections` — GET (by `pageType`), POST
- `/api/cms/page-sections/[id]` — PUT, DELETE
- `/api/cms/page-sections/reorder` — PATCH `{ pageType, orderedIds }`

### Public / mixed
- `POST /api/contact`, `POST /api/newsletter`, `GET /api/newsletter`
- `GET|POST /api/gallery` (duplicate of CMS gallery)
- `POST /api/testimonials` (public submission — verify usage)
- `GET|POST /api/users` (likely unused by UI)

### Upload
- `POST /api/upload` — primary (requires `section` form field; **admin session required**)
- `POST /api/upload/event-image` — **deprecated** shim → events only (**admin session required**)

## Server actions

- `src/app/actions/admin-login.ts` — `submitAdminLogin` (form action path exists; **UI uses API route**).

## Middleware usage

- File: **`middleware.ts`** at repo root (not `src/middleware.ts`).
- Applies CSP, HSTS, COOP/COEP/CORP (skipped for admin auth APIs).
- Rate limits: 8 POSTs/min/IP on contact, newsletter, upload paths.
- **Does not enforce admin auth on APIs.**

## Layout hierarchy

```
app/layout.tsx (root)
  └── MainLayout (Navbar + Footer) — site from fetchSite()
        └── public pages

app/admin/layout.tsx (separate branch)
  └── AdminShell (sidebar) OR AdminLoginForm
        └── admin pages
```

---

# 4. Database Architecture

## Models

| Model | Purpose | CMS editable? |
|-------|---------|---------------|
| `User` | Author FK on events/blogs | No admin UI |
| `Event` | Studio events | Yes — `EventManager` |
| `BlogPost` | Blog articles | Yes — `BlogManager` |
| `NewsletterSubscriber` | Email list | Read-only admin |
| `GalleryImage` | Gallery photos | Yes — `ContentManager` |
| `ContactMessage` | Contact form inbox | Read-only admin |
| `SiteConfig` | Name, tagline, contact, social JSON | Partial — `ContentManager` |
| `HeroSection` | Homepage hero | Yes — `ContentManager` |
| `AboutPage` | About page copy + image | Yes — `ContentManager` |
| `Testimonial` | Quotes | Yes — `ContentManager` |
| `PageSection` | Yoga / Healing / Just Art Affair page blocks | Yes — `PageSectionsManager` (`/admin/pages`) |

## Enums

```prisma
EventCategory: YOGA | HEALING | JUST_ART_LIFE | RETREATS_AND_TOURS
TestimonialStatus: PENDING | APPROVED | REJECTED
PageType: YOGA | HEALING | JUST_ART_LIFE
PageSectionType: HERO | IMAGE_TEXT | GALLERY | TESTIMONIALS | EVENTS | CONTACT | CUSTOM_TEXT
PreferredContactMethod: WHATSAPP | CALL | SMS | EMAIL | LINE | TELEGRAM | OTHER
```

## Relationships

- `Event.authorId` → `User` (optional, unused in admin)
- `BlogPost.authorId` → `User` (optional, unused in admin)
- No foreign keys between CMS section tables — each is independent.

## CMS content strategy

### Structured (DB tables, admin UI)
- Events, blogs, hero, about, site config, gallery, testimonials.

### Structured in DB but NOT admin-editable
- Navigation links — **always from code fallback** in `fetchSite()` even when `SiteConfig` exists.

### Program pages (Yoga, Healing, Just Art Affair) — `PageSection` model
- **DB-driven** when published sections exist (`fetchPageSections` → `DynamicProgramPage` → `PageSectionRenderer`).
- **Legacy fallback** when zero published sections (original static layouts preserved).
- Page **header** (`PageHeader` + `pageIntros`) remains code-defined; **body** is section-driven.
- Section-specific data in `payload` JSON (gallery images, testimonial items, event filters, contact form options).

### Hardcoded in code (not in DB)
- `pageIntros` — per-page headers (yoga, healing, events, blog, gallery, contact).
- `fetchAboutPreview`, `fetchPhilosophy`, `fetchYogaOfferings`, `fetchHealingModalities` — used only when **no** `PageSection` rows (legacy yoga/healing).
- `fetchJustArtLifePage` — legacy Just Art Affair body when no sections.
- Homepage About preview section — **always fallback**, ignores DB.

### Single-row pattern
- `HeroSection`, `AboutPage`, `SiteConfig` — APIs use `findFirst()` / upsert on first record; seed uses fixed IDs `hero`, `about`, `main`.

## Weak schema areas

1. **`SiteConfig.social` as `Json`** — no schema validation at DB level.
2. **`Event.imageUrl` / `BlogPost.coverImageUrl`** — string URLs, no asset FK.
3. **No ordering field** on gallery/testimonials (uses `createdAt`).
4. **`GalleryImage.aspectClass`** in Zod but not stored in Prisma — lost on save.
5. **`Testimonial` has no image** — upload section exists but unused.
6. **`User` model** disconnected from admin auth (secret-based, not user login).

## Migration risks

- Changing `EventCategory` enum requires DB migration + updates in:
  - `prisma/schema.prisma`
  - `src/lib/event-categories.ts`
  - `src/lib/validators.ts`
  - `src/content/repositories/events.ts` (categoryMap)
  - `src/app/events/[category]/page.tsx` (categoryMetadata keys)
- `HeroSection`/`AboutPage` seed IDs (`hero`, `about`) — changing to UUID-only breaks seed upsert unless seed updated.
- `prisma db push` used (not migrations folder) — production may lack migration history.

---

# 5. CMS Architecture

## How editable content works

```
Admin browser
  → Client component (*Manager / ContentManager)
  → adminFetch("/api/...") with credentials + ngrok header
  → Route handler validates with Zod (validators.ts)
  → Prisma write
  → JSON response
  → Client updates local state
```

Public site **does not read from API** — uses repositories with direct Prisma on server.

## Homepage sections

| Section | Component | Data |
|---------|-----------|------|
| Hero | `components/home/Hero.tsx` | `fetchHero()` → `HeroSection` table |
| About preview | `components/home/AboutPreview.tsx` | **Hardcoded** `fetchAboutPreview()` |
| Events preview | `components/home/EventsPreview.tsx` | `fetchFeaturedEvents()` |
| Philosophy | `components/home/PhilosophySection.tsx` | **Hardcoded** |
| Testimonials | `components/home/Testimonials.tsx` | `fetchTestimonials()` (APPROVED only) |
| Newsletter | `components/home/NewsletterSection.tsx` | Static + `NewsletterForm` |

## How forms save data

| Form | Component | Endpoint | Method |
|------|-----------|----------|--------|
| Events | `EventManager.tsx` | `/api/events`, `/api/events/[id]` | POST/PUT |
| Blogs | `BlogManager.tsx` | `/api/blogs`, `/api/blogs/[id]` | POST/PUT |
| Hero | `ContentManager.tsx` | `/api/cms/hero` | PUT |
| About | `ContentManager.tsx` | `/api/cms/about` | PUT |
| Site/footer | `ContentManager.tsx` | `/api/cms/site` | PUT |
| Testimonials | `ContentManager.tsx` | `/api/cms/testimonials/*` | POST/PUT |
| Gallery | `ContentManager.tsx` | `/api/cms/gallery/*` | POST/PUT |

Images upload **first** via `POST /api/upload`, then URL saved in entity JSON on form submit.

### Program pages admin (`/admin/pages`)

| UI | Component | API |
|----|-----------|-----|
| Page tabs (Yoga / Healing / Just Art Affair) | `PageSectionsManager.tsx` | `GET/POST /api/cms/page-sections` |
| Reorder ↑↓ | same | `PATCH /api/cms/page-sections/reorder` |
| Edit / delete | same | `PUT/DELETE /api/cms/page-sections/[id]` |

**Auth:** All page-sections and upload routes call `requireAdminSession()` (`src/lib/require-admin-session.ts`) — reads `nirvana_admin_token` via `cookies()` and `getAdminAuthState()` / `verifySessionToken()`.

**Starter data:** `npm run db:seed-pages` → `prisma/seed-page-sections.js` (skips pages that already have sections).

## Admin ↔ DB communication

- **No Server Actions for CMS mutations** (except unused login action).
- **No React Query/SWR** — manual fetch + `useState`.
- `adminJsonRequest` throws on error; `EventManager` uses `parseAdminJsonResponse` for finer control.

## Reusable CMS patterns

1. **`ImageUploadField`** — upload-on-select, preview, replace, remove (`src/components/admin/ImageUploadField.tsx`).
2. **`uploadAdminImage`** — client wrapper (`src/lib/upload-client.ts`).
3. **`imageUrlSchema`** — accepts `https://` or `/uploads/{section}/{file}` (`validators.ts`).
4. **`*Manager` template** — list + toggle form + `adminFetch` CRUD.
5. **Server page loads initial data** → passes to client manager as `initial*` props.

## Duplicated logic

- Event category mapping: `events.ts` repository + formerly API (now Prisma enum direct in admin).
- Gallery: `/api/gallery` vs `/api/cms/gallery`.
- Testimonial status mapping: API `statusMap` (lowercase keys) vs Zod (UPPERCASE) — **broken for admin saves**.
- Cookie setting: `applyAdminSessionCookie` (API) vs `cookies().set` (server action).
- Upload: `/api/upload` vs `/api/upload/event-image`.

## Hardcoded content areas

See §4 — `site.ts` fallbacks, `pageIntros`, Just Art Affair page, yoga/healing blocks, about preview, navigation.

---

# 6. Authentication System

## Login flow

1. User visits `/admin` → `admin/layout.tsx` runs `getAdminAuthState(token, ADMIN_SECRET)`.
2. If unauthorized → `AdminLoginForm` (client).
3. Submit → `POST /api/admin/login` with `{ secret }` JSON.
4. `verifyAdminSecret` (timing-safe) against `process.env.ADMIN_SECRET`.
5. On success → `createSessionToken` = `{nonce}.{hmac-sha256(nonce, secret)}`.
6. Cookie `nirvana_admin_token` set via `applyAdminSessionCookie`.
7. Client `window.location.assign("/admin")` — full page reload.

**Alternate path:** `submitAdminLogin` server action exists but is **not wired** to current login form.

## Cookie / session strategy

- **Custom HMAC session** — not JWT, not database sessions.
- Cookie: `httpOnly`, `path=/`, `sameSite=lax` (or `none` on ngrok — see `admin-auth-shared.ts`).
- `Secure` flag when HTTPS/ngrok/production.
- Legacy path clearing for `/admin` cookie path migration.

## Middleware behavior

- Logs cookie presence on admin routes (debug).
- **Does not reject** invalid sessions.
- Rate limits login-adjacent POST endpoints only indirectly (login itself not rate-limited).

## Server-side verification

- **Authoritative:** `src/app/admin/layout.tsx` → `verifySessionToken` in `admin-auth.ts` (Node crypto).
- **API routes (partial):** `src/lib/require-admin-session.ts` → `requireAdminSession()` on `/api/upload*` and `/api/cms/page-sections/*`.
- Middleware: `hasAdminSessionCookie` — format check only (dot in token).

## Edge runtime considerations

- **Never import `admin-auth.ts` in middleware** — use `admin-auth-shared.ts` only.
- `logAuthTrace` can run on edge when `ADMIN_AUTH_DEBUG=true`.

## Security weaknesses

1. **Most CMS mutation APIs still unauthenticated** — `/api/events`, `/api/blogs`, `/api/cms/hero`, etc. remain open if URLs are known.
2. **Upload + page-sections now require admin session** — `requireAdminSession()` on `POST /api/upload`, `POST /api/upload/event-image`, and all `/api/cms/page-sections/*` handlers (2026-05-26).
3. **Single shared secret** — no per-user audit trail.
4. **In-memory rate limit** — resets on server restart; ineffective multi-instance without shared store.
5. **`GET /api/admin/debug-auth`** — information disclosure in dev.
6. **`GET /api/newsletter`** — subscriber emails exposed if unprotected.
7. **COEP `require-corp`** on APIs may break some cross-origin integrations.

---

# 7. Upload / Image System

## Upload flow

```
ImageUploadField (client) — must be logged into /admin (session cookie)
  → uploadAdminImage(file, section, replaceUrl?)
  → POST /api/upload (multipart: file, section, replaceUrl?)
  → requireAdminSession() — 401 if cookie invalid/missing
  → validateImageFile (MIME + 5MB)
  → optional deleteUploadByUrl(replaceUrl)
  → save to public/uploads/{section}/{slug}-{timestamp}-{hex}.{ext}
  → { url: "/uploads/{section}/{filename}" }
  → onChange(url) updates parent form state
  → On form save, URL persisted to DB via entity API
```

## Storage location

- **Disk:** `public/uploads/{section}/`
- **Sections:** `events`, `gallery`, `blog`, `homepage`, `testimonials`, `pages` (`upload-sections.ts`)
- **Docker:** host volume mount required for persistence.

## Image URL generation

- `getPublicUploadUrl(section, filename)` → `/uploads/{section}/{filename}`
- Also accepts external `https://` URLs in validators (legacy seed data uses Unsplash).

## Replacement handling

- Client sends `replaceUrl` when current value starts with `/uploads/`.
- Server `deleteUploadByUrl` — path traversal guarded; only deletes two-segment paths.

## Preview handling

- `ImageUploadField` uses `next/image` with `unoptimized` for local `/uploads/` paths.
- `next.config.ts` `remotePatterns` — only Unsplash + anytimefitness; local paths don't need remote pattern.

## Weak / error-prone areas

1. **Remove button** clears DB-bound URL in form state but **does not delete file** from disk.
2. **MIME trust** — uses `file.type` from client, not magic-byte sniffing.
3. **No image processing** — originals stored as-is.
4. **`Event.imageUrl` not shown** on public `EventCard` — uploaded event images invisible on site.
5. **Orphan files** on entity delete (no cascade cleanup).
6. **Upload requires admin session** — unauthenticated clients get 401 (middleware rate limit still applies).
7. **`testimonials` upload folder** exists; page-section testimonials use `payload.items`, not `Testimonial` model.

---

# 8. Frontend Architecture

## Reusable UI components (`src/components/ui/`)

`Button`, `Card`, `Container`, `Section`, `SectionHeading`, `Eyebrow`, `PageHeader`, `FormField`, `Prose`, `EmptyState`, `ContentSkeleton`, `MediaImage`, `EventCard`, `BlogCard`, `TestimonialCard`, `ContentCard`.

## Server vs client

| Server | Client |
|--------|--------|
| Almost all `app/**/page.tsx` | All `components/admin/**` |
| `layout.tsx`, `MainLayout` usage | `ContactForm`, `NewsletterForm` |
| Repository reads | `ImageUploadField`, `AdminLoginForm` |

## Form architecture

- Native `<form onSubmit>` in managers.
- Controlled inputs via `useState`.
- No `react-hook-form`.
- Error display: string or list from API `details`.

## Data fetching patterns

| Context | Pattern |
|---------|---------|
| Public | Server Component `await fetchX()` from `@/content` |
| Admin list pages | Server Component `prisma.*` → map to admin types → props |
| Admin mutations | Client `adminFetch` / `adminJsonRequest` |
| Homepage | Suspense streaming per section |

## Styling system

- Tailwind v4 with `@theme inline` mapping CSS variables.
- Public tokens: `background`, `foreground`, `muted`, `accent`, `card`, `border`.
- Admin uses **hardcoded slate** classes — intentional visual separation.
- Shared tokens in `lib/constants.ts` (`sectionSpacing`, `inputClassName`, etc.).

## Responsive strategy

- Mobile-first Tailwind breakpoints (`sm:`, `md:`, `lg:`).
- `Container` + grid layouts; admin forms use `md:grid-cols-2`.

---

# 9. Current Technical Debt

## Duplicated code

- Gallery API duplication (`/api/gallery` vs `/api/cms/gallery`).
- Upload endpoints (`/api/upload` vs `/api/upload/event-image`).
- Event category maps (repository + `event-categories.ts` + category page metadata).
- Auth cookie logic (API route vs server action).

## Bad abstractions

- `site.ts` god-file mixing DB fetches, fallbacks, and static content.
- Fake admin IDs (`id: "hero"`) in `admin/content/page.tsx` that don't match DB UUIDs.
- `lib/content.ts` shim adds confusion.

## Type inconsistencies

| Area | Admin | Public API |
|------|-------|------------|
| Event category | `YOGA`… (Prisma) | `yoga`… (kebab) |
| Testimonial status | `pending`… | `approved`… |
| Gallery | `src`/`alt` in admin types | `url`/`altText` in Prisma |

- **Build error:** `admin/content/page.tsx` — `MediaPage.subtitle` optional vs `AdminAboutPage.subtitle` required.

## Risky patterns

- Unprotected CRUD APIs (events, blogs, legacy CMS routes).
- `as any` for Prisma enums in several routes.
- `findFirst()` without ordering for singleton CMS tables.
- In-memory rate limiting in middleware.

## Hydration risks

- Low overall (server-first). Admin login uses `useSearchParams` inside Suspense — OK.
- ngrok HMR WebSocket errors — dev-only, documented.

## Scaling risks

- Local disk uploads — not multi-instance safe without shared storage.
- Rate limit Map not shared across instances.
- No connection pooling config beyond Prisma defaults.

## Likely future bugs

1. Testimonial admin save 422 (status case mismatch).
2. Saving hero/about with empty image after remove.
3. `datetime-local` → ISO conversion edge cases for events.
4. Gallery `aspectClass` silently dropped.
5. Category slug 404 if new enum added without updating `[category]/page.tsx`.

---

# 10. Important Business Logic

## Event categories

| Prisma (`EventCategory`) | Public slug | Admin dropdown |
|--------------------------|-------------|----------------|
| `YOGA` | `yoga` | Yoga |
| `HEALING` | `healing` | Healing |
| `JUST_ART_LIFE` | `just-art-life` | Just Art Affair |
| `RETREATS_AND_TOURS` | `retreats-and-tours` | Retreats and Tours |

**Source of truth for admin/API:** `src/lib/event-categories.ts` + `validators.ts`.  
**Public normalization:** `normalizeEventCategory()` in `content/repositories/events.ts`.

## Enum mappings (testimonials)

- DB/Prisma: `PENDING`, `APPROVED`, `REJECTED`.
- Public repo: lowercase `pending`, `approved`, `rejected`.
- Admin form sends **lowercase** but Zod expects **UPPERCASE** — validation failure.

## Filtering logic

- Public events: `published: true`.
- Featured: `isFeatured: true` + limit.
- Category pages: `category` enum match on slug map.
- Testimonials public: `status: "APPROVED"`.
- Gallery public API route: `isPublished: true`; repository fetch has no publish filter.

## CMS section keys

- Upload sections: `events`, `gallery`, `blog`, `homepage`, `testimonials`, `pages`.
- Page types: `YOGA`, `HEALING`, `JUST_ART_LIFE`.
- Page section types: `HERO`, `IMAGE_TEXT`, `GALLERY`, `TESTIMONIALS`, `EVENTS`, `CONTACT`, `CUSTOM_TEXT`.
- Events section `payload.eventKind`: `all` | `sessions` | `retreats` (retreats → `RETREATS_AND_TOURS`; sessions exclude that category).
- Seed IDs: `hero`, `about`, `main` (SiteConfig).
- Program page seed: `npm run db:seed-pages`.

## Validation rules (`validators.ts`)

- Images: `imageUrlSchema` = URL or `/uploads/{section}/{file}`.
- Events: `eventCreateSchema` / partial update.
- Hero/About: all fields required on PUT.
- Gallery: `url` required; `title` optional.
- Blog `coverImageUrl`: optional image schema.

## Hidden assumptions

- One hero row, one about row, one site config row in DB.
- Navigation always from code, not DB.
- `authorId` never set from admin.
- Event `price` stored as Float, displayed as string on public site.
- `resolveContent()` artificial delay when `CONTENT_FETCH_DELAY_MS` set.

---

# 11. Environment & Dev Notes

## Env vars

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `ADMIN_SECRET` | Admin login + session HMAC |
| `ADMIN_FORCE_SECURE_COOKIE` | Force Secure cookie in dev |
| `ADMIN_AUTH_DEBUG` | Verbose auth logging in prod |
| `NGROK_DEV_ORIGIN` | Next.js `allowedDevOrigins` for tunnel |
| `NEXT_PUBLIC_SITE_URL` | Metadata base (`lib/site.ts`) |
| `SITE_URL` | Docker/production site URL |
| `CONTENT_FETCH_DELAY_MS` | Artificial latency for testing |
| `POSTGRES_*` | Docker Compose DB |

## Local setup

```bash
npm install
cp .env.example .env   # if present
npm run db:push
npm run db:seed
npm run db:seed-pages   # optional — Yoga/Healing/Just Art Affair starter sections
npm run dev
# Admin: http://localhost:3000/admin — ADMIN_SECRET from .env
```

## Docker readiness

- `output: "standalone"` in `next.config.ts`.
- Multi-stage `Dockerfile`; uploads volume; nginx TLS.
- Run `prisma db push` after container start (per DEPLOYMENT.md).

## Dev-only warnings

- ngrok HMR WebSocket failures — see `docs/ADMIN_NGROK.md`.
- `AdminLoginTracePanel`, `AdminTunnelNotice` — hidden in production.
- `console.error` logging on login route/middleware.

## Expected non-critical errors

- ngrok `/_next/webpack-hmr` WebSocket when tunneling dev server.
- Auth debug traces when `ADMIN_AUTH_DEBUG=true`.

---

# 12. AI Collaboration Notes

## Do not modify casually

- `src/lib/admin-auth-shared.ts` — cookie/ngrok behavior; test on ngrok + localhost.
- `middleware.ts` — security headers affect entire API surface.
- `prisma/schema.prisma` — coordinate with seed, validators, repositories.
- `src/content/repositories/site.ts` — fallbacks affect every page if DB empty.
- `src/lib/validators.ts` — all APIs depend on schemas.

## Fragile areas

- Admin auth cookie settings (SameSite/Secure/tunnel).
- Testimonial status validation mismatch.
- Category enum alignment (3 representations).
- Singleton CMS `findFirst()` pattern.
- `admin/content/page.tsx` type mapping.

## Architectural rules

1. **Public reads:** repositories → Prisma (Server Components). Program pages use `fetchPageSections`, not the page-sections API.
2. **Admin writes:** client → API routes → Prisma (with `adminFetch` + credentials).
3. **Edge vs Node auth split** — respect the boundary; API auth uses `require-admin-session.ts` (Node), not middleware.
4. **Images:** upload to `/api/upload` first (admin session required), store URL in entity.
5. **Program pages:** add sections via `/admin/pages`; use `CUSTOM_TEXT` for future block types until a new `PageSectionType` is added.
6. Read `AGENTS.md` before Next.js API changes.

## Coding conventions

- Path alias `@/` → `src/`.
- Tailwind + CSS variables for public; slate admin UI.
- Zod + `formatZodErrors` for API validation.
- `adminFetch` for all admin API calls (includes ngrok header + credentials).

## Preserve

- Calm visual design (peach/sage/serif).
- Fallback content when DB empty.
- Lightweight local uploads (no cloud dependency unless requested).
- Separate admin layout (no public nav in admin).

## Avoid

- Importing `admin-auth.ts` in middleware.
- Adding manual image URL fields in admin without strong reason.
- Assuming middleware protects APIs.
- Using kebab-case categories in admin API payloads.
- Creating `services/` layer without project buy-in.

---

# 13. Immediate Priority Issues

| Priority | Issue | Impact |
|----------|-------|--------|
| P0 | Legacy CMS/event/blog APIs lack auth | Data breach / vandalism |
| P0 | Testimonial status case mismatch | Admin testimonial save fails |
| ~~P0~~ | ~~Upload / page-sections public~~ | **Fixed** — `requireAdminSession()` |
| P1 | Event images | **Fixed** — `EventCard` shows `imageUrl` + retreat badge |
| P2 | Navigation not editable | CMS expectation mismatch |
| P2 | Orphan upload files | Disk clutter |
| P2 | Gallery `aspectClass` not persisted | Layout inconsistency |
| P3 | Duplicate gallery/upload endpoints | Maintenance burden |

## Recommended stabilization order

1. Extend `requireAdminSession()` to remaining CMS routes (`/api/cms/hero`, gallery, events, blogs).
2. Fix testimonial status validation (accept lowercase or map in API before Zod).
3. Consolidate duplicate APIs; document navigation as code-owned.
4. Add upload cleanup on replace/remove/delete.
5. Add `generateStaticParams` guard or slug length limit for blog posts (Windows path limits on build).

---

# Appendix A — Critical Files Map

| File | Why critical |
|------|----------------|
| `prisma/schema.prisma` | DB schema |
| `middleware.ts` | Security headers, rate limits |
| `src/app/admin/layout.tsx` | Admin auth gate |
| `src/lib/admin-auth.ts` | Session crypto (Node) |
| `src/lib/admin-auth-shared.ts` | Cookies (Edge-safe) |
| `src/lib/validators.ts` | API contracts |
| `src/lib/admin-fetch.ts` | All admin HTTP |
| `src/content/repositories/site.ts` | Site-wide content + fallbacks |
| `src/content/repositories/events.ts` | Events public API |
| `src/lib/upload-server.ts` | Upload pipeline |
| `src/app/api/upload/route.ts` | Upload entry |
| `src/components/admin/EventManager.tsx` | Events CMS |
| `src/components/admin/ContentManager.tsx` | Homepage CMS |
| `src/components/admin/ImageUploadField.tsx` | Shared upload UI |
| `src/lib/event-categories.ts` | Category enum SSOT (admin) |
| `src/lib/require-admin-session.ts` | API auth guard |
| `src/content/repositories/page-sections.ts` | Program page reads |
| `src/components/admin/PageSectionsManager.tsx` | Program pages admin |
| `src/components/content/DynamicProgramPage.tsx` | Legacy vs dynamic switch |
| `src/components/content/sections/PageSectionRenderer.tsx` | Section type → UI |
| `src/app/admin/pages/page.tsx` | Admin program pages |
| `prisma/seed-page-sections.js` | Starter sections seed |
| `docker-compose.yml` | Production topology |

---

# Appendix B — Safe Refactor Zones

- `src/components/ui/*` — presentational, low risk.
- `src/lib/format.ts`, `utils.ts`, `constants.ts`.
- `src/components/home/*` — if data interfaces unchanged.
- `docs/*`, `README.md`, `DEPLOYMENT.md`.
- Public `loading.tsx` skeletons.
- `EventCard` display enhancements (if types extended).

---

# Appendix C — High Risk Modification Zones

- `middleware.ts`
- `src/lib/admin-auth*.ts`
- `src/app/api/**` (all mutation routes)
- `prisma/schema.prisma` + `seed.js`
- `src/content/repositories/site.ts` (fallbacks)
- `src/lib/validators.ts`
- `next.config.ts` (images, standalone, ngrok)
- `docker-compose.yml` / `nginx/`

---

# Appendix D — Recommended Next Engineering Priorities

1. **Secure remaining mutation routes** — apply `requireAdminSession()` to `/api/events`, `/api/blogs`, `/api/cms/hero`, `/api/cms/about`, `/api/cms/site`, `/api/cms/gallery`, `/api/cms/testimonials`.
2. **Fix testimonial admin** — align `testimonialCreateSchema` with lowercase or map pre-validation.
3. **Unify gallery endpoints** — deprecate `/api/gallery` or redirect to CMS.
4. **Editable navigation** — store in `SiteConfig` or new model; stop overriding in `fetchSite`.
5. **Upload lifecycle** — delete files on remove/replace/entity delete.
6. **Prisma migrations** — replace `db push`-only workflow for production.

---

# 14. Program Pages CMS (addendum)

## Public routes

| Route | `pageType` | Legacy when empty |
|-------|------------|-------------------|
| `/yoga` | `YOGA` | `YogaOfferingsSection` + CTAs |
| `/healing` | `HEALING` | `HealingSection` + CTA |
| `/just-art-life` | `JUST_ART_LIFE` | `fetchJustArtLifePage` + `SplitMediaLayout` |

## Section renderers (`src/components/content/sections/`)

| Type | Component / behavior |
|------|----------------------|
| `HERO` | Centered intro + optional image |
| `IMAGE_TEXT` | `SplitMediaLayout` + prose |
| `GALLERY` | `GalleryList` or `GalleryCarousel` (`payload.carousel`) |
| `TESTIMONIALS` | `SectionTestimonialCard` — text only, image only, or both |
| `EVENTS` | `EventList` + `fetchEventsForSection(payload)` |
| `CONTACT` | `ProgramInquiryForm` + optional CTA (`ProgramContactSection`) |
| `CUSTOM_TEXT` | Prose paragraphs (`payload.paragraphs` or `content`) |

## Contact form

- `ProgramInquiryForm` — used on `/contact` and CONTACT sections; posts to `/api/contact` with `preferredContactMethod`.
- `ContactMessage.preferredContactMethod` in Prisma; displayed in `/admin/contact`.

## Extending with new section types

1. Add enum value to `PageSectionType` in `schema.prisma` + `page-section-types.ts`.
2. Add Zod payload schema in `page-section-payloads.ts` (if needed).
3. Add case in `PageSectionRenderer` + block component.
4. Add admin payload editor branch in `PageSectionsManager` `PayloadEditor`.
5. `db push` + document in this file.

Use `CUSTOM_TEXT` as a stopgap for booking/workshop/pricing blocks until a dedicated type is warranted.

---

*End of project memory document.*
