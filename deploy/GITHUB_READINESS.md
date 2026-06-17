# GitHub readiness report

## Secrets and credentials

| Check | Status |
|-------|--------|
| `.env` in `.gitignore` | Yes |
| `.env.example` has placeholders only | Yes |
| Hardcoded API keys in source | None found |
| `ADMIN_SECRET` in repo | No |
| `DATABASE_URL` in repo | No |

**Action:** Rotate `ADMIN_SECRET` and `POSTGRES_PASSWORD` if `.env` was ever committed.

## Tracked files that should not be in git

| Path | Status | Action |
|------|--------|--------|
| `public/uploads/**` (images) | **6 event PNGs tracked** | Run `git rm -r --cached public/uploads` then commit |
| `.next/` | Ignored | OK |
| `node_modules/` | Ignored | OK |
| `certbot/` | Ignored | OK |
| `backups/` | Ignored | OK |

## `.gitignore` improvements (applied)

- `public/uploads/**` with `.gitkeep` exception
- `certbot/`, `backups/`
- Explicit `.env` variants
- Editor/OS junk files

## Generated files

- `.next/` — ignored
- `next-env.d.ts` — ignored (regenerated)
- Prisma client — generated at install, not committed

## Logs

- `*.log`, `logs/` — ignored

## Pre-push checklist

```bash
git status
git check-ignore -v public/uploads/events/*.png   # should show .gitignore rule
grep -r "ADMIN_SECRET\|postgresql://" --include='*.ts' --include='*.tsx' src/  # should be empty
```

## Repository

Remote: `https://github.com/anikaitar70/yoga.git`

Ensure GitHub repo has:
- Branch protection on `main` (optional)
- No secrets in Actions variables
- `.env` never committed
