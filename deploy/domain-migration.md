# Canonical domain: nirvanayoga.org

The production site uses **https://nirvanayoga.org** as the single canonical URL. All metadata, Open Graph links, sitemaps, and canonical tags are driven by `APP_URL` in `.env`.

## DNS

| Record | Value |
|--------|-------|
| `A` `nirvanayoga.org` | `51.79.251.45` |
| `A` `www.nirvanayoga.org` | `51.79.251.45` |

## Environment (VPS `.env`)

```bash
APP_URL=https://nirvanayoga.org
```

Optional legacy aliases (same value):

```bash
SITE_URL=https://nirvanayoga.org
NEXT_PUBLIC_SITE_URL=https://nirvanayoga.org
```

## After changing `APP_URL`

```bash
docker compose up -d --build app
docker compose restart nginx
```

## Verify

- `curl -I https://nirvanayoga.org`
- View page source — `og:url` and canonical URLs should use `nirvanayoga.org`
- Admin login at `https://nirvanayoga.org/admin`
- Sitemap: `https://nirvanayoga.org/sitemap.xml`

## GitHub OAuth callback

Update your GitHub OAuth app callback URL to:

`https://nirvanayoga.org/api/admin/auth/github/callback`
