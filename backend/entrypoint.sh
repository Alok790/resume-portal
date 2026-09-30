#!/bin/sh
# Convert Railway's postgresql://user:pass@host:port/db  →  jdbc:postgresql://host:port/db
# and pass username/password as separate Spring Boot args.
# This handles both DATABASE_URL and DATABASE_PRIVATE_URL formats.

DB_URL="${DATABASE_URL:-$DATABASE_PRIVATE_URL}"

if [ -z "$DB_URL" ]; then
  echo "ERROR: Neither DATABASE_URL nor DATABASE_PRIVATE_URL is set."
  exit 1
fi

# Strip the scheme prefix (postgresql:// or postgres://)
STRIPPED=$(echo "$DB_URL" | sed 's|^postgres[a-z]*://||')

# Extract user:pass  →  everything before the last @
USERINFO=$(echo "$STRIPPED" | sed 's|@[^@]*$||')
DB_USER=$(echo "$USERINFO" | cut -d: -f1)
DB_PASS=$(echo "$USERINFO" | cut -d: -f2-)

# Extract host:port/db  →  everything after the last @
HOSTPART=$(echo "$STRIPPED" | sed 's|^.*@||')

JDBC_URL="jdbc:postgresql://${HOSTPART}?sslmode=require"

echo "Starting with JDBC_URL=$JDBC_URL user=$DB_USER"

exec java -jar app.jar \
  --spring.datasource.url="$JDBC_URL" \
  --spring.datasource.username="$DB_USER" \
  --spring.datasource.password="$DB_PASS"
