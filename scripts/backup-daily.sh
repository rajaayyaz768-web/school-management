#!/usr/bin/env bash
# Daily backup script — run via cron at 02:00
# Crontab entry:  0 2 * * * /opt/college/scripts/backup-daily.sh
#
# Required env vars (set in /etc/environment or the systemd unit):
#   DATABASE_URL   — PostgreSQL connection string
#   BACKUP_DIR     — directory where archives are stored

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/college}"
STATUS_FILE="$BACKUP_DIR/last-status.json"
FILENAME="backup_$(date +%F_%H%M%S).sql.gz"
ARCHIVE="$BACKUP_DIR/$FILENAME"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

write_status() {
  local success="$1"
  local error="${2:-}"
  printf '{"timestamp":"%s","success":%s,"error":"%s"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$success" "$error" \
    > "$STATUS_FILE"
}

echo "[backup-daily] Starting: $FILENAME"

if pg_dump "$DATABASE_URL" | gzip -9 > "$ARCHIVE"; then
  echo "[backup-daily] Archive created: $ARCHIVE ($(du -sh "$ARCHIVE" | cut -f1))"
  write_status true ""
else
  write_status false "pg_dump failed"
  echo "[backup-daily] ERROR: pg_dump failed" >&2
  exit 1
fi

# Prune archives older than RETENTION_DAYS (keep monthly dir intact)
find "$BACKUP_DIR" -maxdepth 1 -name 'backup_*.sql.gz' \
  -mtime +"$RETENTION_DAYS" -delete

echo "[backup-daily] Done."
