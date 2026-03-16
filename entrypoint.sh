#!/bin/sh

set -e

if [ "${RUN_DATABASE_MIGRATIONS:-false}" = "true" ]; then
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL is required when RUN_DATABASE_MIGRATIONS=true"
    exit 1
  fi

  echo "Running Prisma migrations..."
  prisma migrate deploy
fi

echo "Starting server..."
exec "$@"
