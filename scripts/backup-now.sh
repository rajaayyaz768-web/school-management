#!/usr/bin/env bash
# On-demand backup script — triggered from the dashboard "Create Backup Now" button.
# The backend executes this script and captures stdout for the resulting filename.
#
# Required env vars (inherited from the backend process):
#   DATABASE_URL   — PostgreSQL connection string
#   BACKUP_DIR     — directory where archives are stored

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/college}"
STATUS_FILE="$BACKUP_DIR/last-status.json"
FILENAME="backup_$(date +%F_%H%M%S).sql.gz"
ARCHIVE="$BACKUP_DIR/$FILENAME"

mkdir -p "$BACKUP_DIR"

write_status() {
  local success="$1"
  local error="${2:-}"
  printf '{"timestamp":"%s","success":%s,"error":"%s"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$success" "$error" \
    > "$STATUS_FILE"
}

if pg_dump "$DATABASE_URL" | gzip -9 > "$ARCHIVE"; then
  write_status true ""
  # Print filename on last line — the backend captures this
  echo "$FILENAME"
else
  write_status false "pg_dump failed"
  echo "[backup-now] ERROR: pg_dump failed" >&2
  exit 1
fi
