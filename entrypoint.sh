#!/bin/sh

# Exit on error
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node server.js
