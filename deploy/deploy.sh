#!/usr/bin/env bash
set -euo pipefail

env="${1:?usage: deploy.sh <prod|dev> <image tag>}"
tag="${2:?usage: deploy.sh <prod|dev> <image tag>}"
case "$env" in prod|dev) ;; *) echo "unknown environment: $env" >&2; exit 1 ;; esac

cd "$(dirname "$0")"
chmod 600 "$env.env"

var="${env^^}_TAG"
touch .env
{ grep -v "^$var=" .env || true; echo "$var=$tag"; } > .env.tmp
mv .env.tmp .env

docker compose pull "site-$env"
docker compose up -d "site-$env" caddy
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile

docker image prune -af --filter "until=168h"
