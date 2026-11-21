#!/usr/bin/env bash
# Runs on the droplet after the pipeline copies this folder to /srv/home-astro/app.
# Usage: deploy.sh <prod|dev> <image tag>
set -euo pipefail

env="${1:?usage: deploy.sh <prod|dev> <image tag>}"
tag="${2:?usage: deploy.sh <prod|dev> <image tag>}"
case "$env" in prod|dev) ;; *) echo "unknown environment: $env" >&2; exit 1 ;; esac

cd "$(dirname "$0")"
chmod 600 "$env.env"

# Record the tag so later `docker compose` commands keep running this image.
var="${env^^}_TAG"
touch .env
{ grep -v "^$var=" .env || true; echo "$var=$tag"; } > .env.tmp
mv .env.tmp .env

docker compose pull "site-$env"
docker compose up -d "site-$env" caddy
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile

# Remove images unused for a week, so old releases don't fill the disk.
docker image prune -af --filter "until=168h"
