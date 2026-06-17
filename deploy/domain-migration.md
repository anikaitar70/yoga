# Domain migration: yoga.anikait.page → nirvanayoga.org

No code changes are required. Update environment and DNS only.

## 1. DNS

| Record | Value |
|--------|-------|
| `A` `nirvanayoga.org` | `51.79.251.45` |
| `A` `www.nirvanayoga.org` | `51.79.251.45` |

Keep `yoga.anikait.page` pointing at the VPS during transition if you want both domains live.

## 2. SSL for new domain

Follow [ssl-setup.md](./ssl-setup.md) section 5 to issue certificates for `nirvanayoga.org`.

## 3. Update `.env` on the VPS

```bash
APP_URL=https://nirvanayoga.org
```

Optional legacy aliases (same value):

```bash
SITE_URL=https://nirvanayoga.org
NEXT_PUBLIC_SITE_URL=https://nirvanayoga.org
```

## 4. Restart application

```bash
docker compose up -d --build app
```

Metadata, Open Graph URLs, and absolute links use `APP_URL` at runtime.

## 5. Redirect old domain (optional)

Add to `nginx/conf.d/production-ssl.conf` inside the `yoga.anikait.page` server block:

```nginx
return 301 https://nirvanayoga.org$request_uri;
```

Then reload: `docker compose exec nginx nginx -s reload`

## 6. Verify

- `curl -I https://nirvanayoga.org`
- View page source — `og:url` and canonical URLs should use `nirvanayoga.org`
- Admin login at `https://nirvanayoga.org/admin`
