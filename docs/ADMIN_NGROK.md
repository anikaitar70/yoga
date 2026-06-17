# Admin access over ngrok

## Quick setup

1. Start the app: `npm run dev`
2. Start ngrok: `ngrok http 3000`
3. Add your ngrok host to `.env` (stops HMR console noise):
   `NGROK_DEV_ORIGIN=your-subdomain.ngrok-free.dev`
4. Restart `npm run dev`
5. Open `https://<your-subdomain>.ngrok-free.dev/admin`
6. Sign in with `ADMIN_SECRET` from `.env`

If login still fails, add to `.env`:

```env
ADMIN_FORCE_SECURE_COOKIE=true
```

Restart the dev server after changing `.env`.

## How authentication works

- Login compares your secret to `ADMIN_SECRET` (timing-safe).
- On success, a signed session cookie (`nirvana_admin_token`) is set.
- The cookie is **httpOnly**, **path=/**, **sameSite=lax**, and **Secure** when served over HTTPS (ngrok or production).
- **Admin layout** (Node runtime) verifies the signed token on each request.
- **Middleware** (Edge) only applies security headers and optional cookie-presence logging — no crypto.

## ngrok-specific behavior

### Browser warning page

ngrok Free may return an HTML interstitial instead of JSON. All admin API calls send `ngrok-skip-browser-warning: 1` to bypass it.

### WebSocket / HMR errors (unrelated to login)

Console errors like:

```
WebSocket connection to 'wss://<ngrok-url>/_next/webpack-hmr' failed
```

are **expected** when using ngrok with `next dev`. Hot Module Replacement uses a WebSocket to `localhost`; the ngrok tunnel does not reliably proxy it.

- **Does not affect** admin login, cookies, or CMS API calls.
- **Safe to ignore** when testing admin over ngrok.
- Use `http://localhost:3000` when you need hot reload.

## Temporary debug tracing

While diagnosing ngrok login, the app logs every auth stage with prefixes:

| Prefix | Where |
|--------|--------|
| `[LOGIN]` | Browser login form (DevTools console) |
| `[FETCH]` | Browser + shared fetch helpers |
| `[AUTH API]` | Server terminal — `/api/admin/login` |
| `[COOKIE]` | Server terminal — cookie set/clear |
| `[MIDDLEWARE]` | Server terminal — `/admin` and admin API routes |
| `[LAYOUT]` | Server terminal — admin layout auth gate |

**Debug endpoint (dev only):** open `/api/admin/debug-auth` in the browser or curl it after a login attempt. Returns cookie names, auth state, HTTPS/ngrok detection, and cookie policy — no secrets.

To enable logs in production builds: `ADMIN_AUTH_DEBUG=true` in `.env`.

Remove these logs once ngrok login is stable.

## Development logs

In development, server logs show:

- Cookie secure/path decisions
- Whether a session token is present
- Layout and middleware auth checks (no secret values logged)

## Security notes

- Never commit `.env` or expose `ADMIN_SECRET`.
- Rotate `ADMIN_SECRET` if it may have been leaked.
- Production should always use HTTPS; cookies use `Secure` automatically.
