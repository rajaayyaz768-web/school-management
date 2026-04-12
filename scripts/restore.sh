#!/usr/bin/env bash
# One-shot restore from a pg_dump .sql.gz archive.
# Usage:  ./restore.sh /var/backups/college/backup_2026-04-09_020001.sql.gz
#
# WARNING: This drops and recreates the target database. Back up first if needed.

set -euo pipefail

ARCHIVE="${1:-}"

if [[ -z "$ARCHIVE" ]]; then
  echo "Usage: $0 <path-to-backup.sql.gz>" >&2
  exit 1
fi

if [[ ! -f "$ARCHIVE" ]]; then
  echo "ERROR: File not found: $ARCHIVE" >&2
  exit 1
fi

# Parse database name from DATABASE_URL (postgres://user:pass@host:port/dbname)
DB_NAME=$(echo "${DATABASE_URL}" | sed 's|.*\/||' | sed 's|?.*||')

if [[ -z "$DB_NAME" ]]; then
  echo "ERROR: Could not determine database name from DATABASE_URL." >&2
  exit 1
fi

echo "[restore] Target database : $DB_NAME"
echo "[restore] Restoring from  : $ARCHIVE"
read -rp "[restore] This will DROP and recreate $DB_NAME. Continue? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

echo "[restore] Dropping existing database..."
psql "$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" postgres
dropdb --if-exists "$DB_NAME"
createdb "$DB_NAME"

echo "[restore] Restoring data..."
gunzip -c "$ARCHIVE" | psql "$DATABASE_URL"

echo "[restore] Done. Database $DB_NAME restored from $ARCHIVE."
