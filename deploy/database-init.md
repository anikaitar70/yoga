# Database initialization

## First deploy

The app container entrypoint runs **`prisma migrate deploy`** when migrations exist.

Initial migration: `prisma/migrations/20250617000000_init/`

Manual apply:

```bash
docker compose exec app node ./node_modules/prisma/build/index.js migrate deploy
```

## Seed sample data (optional)

```bash
docker compose exec app node ./node_modules/prisma/build/index.js db seed
```

## Migrations workflow (production)

| Action | Command |
|--------|---------|
| After schema change locally | `npx prisma migrate dev --name describe_change` |
| Commit | `prisma/migrations/*` + `schema.prisma` |
| Deploy | Restart app container (entrypoint runs `migrate deploy`) |

**Do not use `db push` in production** after the initial migration baseline.

Fallback: entrypoint uses `db push` only when no migration folders exist.

## Inspect database

```bash
docker compose exec db psql -U postgres -d yoga -c '\dt'
docker compose exec app node ./node_modules/prisma/build/index.js migrate status
```

## Connection string

```
postgresql://postgres:PASSWORD@db:5432/yoga?schema=public
```

Host `db` is the Docker Compose service name.

## Destructive reset

```bash
docker compose down -v   # deletes db_data and uploads_data
```
