#!/bin/bash
set -e

TIMEOUT=60
COUNTER=0

echo "Waiting for PostgreSQL to be ready..."

while ! pg_isready -h "$POSTGRES_HOST" -p "${POSTGRES_PORT:-5432}" -U "$POSTGRES_USER" > /dev/null 2>&1; do
  sleep 1
  COUNTER=$((COUNTER + 1))
  if [ $COUNTER -ge $TIMEOUT ]; then
    echo "Error: Timed out waiting for PostgreSQL to be ready."
    exit 1
  fi
  echo -n "."
done

echo
echo "PostgreSQL is ready!"