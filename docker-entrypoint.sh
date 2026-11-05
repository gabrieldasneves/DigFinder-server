#!/bin/sh
set -eu

echo "Generating Prisma client..."
npx prisma generate

echo "Applying migrations..."
npx prisma migrate deploy

echo "Seeding categories..."
npx prisma db seed

exec "$@"
