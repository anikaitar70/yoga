# Inactive Nginx configs

Files here are **not** mounted into the `yoga-nginx-1` container. Only `nginx/conf.d/*.conf` is loaded.

| File | Purpose |
|------|---------|
| `initial.conf` | First-deploy HTTP-only bootstrap. Copy to `conf.d/` before certs exist; archive/remove after SSL. |
| `production-ssl.conf.template` | Copy of production SSL config for reference (live file: `../conf.d/production-ssl.conf`). |

After SSL is enabled, `conf.d/` must contain **only** `production-ssl.conf` for the yoga app. Run `deploy/fix-nginx-conflicts.sh` on the VPS if duplicates appear.

`repolens.conf` for `rl.anikait.page` lives under `/opt/repolens` — do not add it here.
