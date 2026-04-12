#!/usr/bin/env bash
# Monthly archive — run via cron on the 1st of each month at 02:30
# Crontab entry:  30 2 1 * * /opt/college/scripts/backup-monthly.sh
#
# Copies the most recent daily backup into a "monthly" sub-directory
# and prunes monthly archives older than 12 months.

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/college}"
MONTHLY_DIR="$BACKUP_DIR/monthly"
RETENTION_MONTHS=12

mkdir -p "$MONTHLY_DIR"

# Find the most recently modified archive in BACKUP_DIR
LATEST=$(find "$BACKUP_DIR" -maxdepth 1 -name 'backup_*.sql.gz' \
  -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)

if [[ -z "$LATEST" ]]; then
  echo "[backup-monthly] No archive found in $BACKUP_DIR — skipping." >&2
  exit 1
fi

DEST="$MONTHLY_DIR/$(date +%Y-%m).sql.gz"
cp "$LATEST" "$DEST"
echo "[backup-monthly] Saved monthly archive: $DEST ($(du -sh "$DEST" | cut -f1))"

# Prune monthly archives older than RETENTION_MONTHS
find "$MONTHLY_DIR" -name '*.sql.gz' \
  -mtime +"$((RETENTION_MONTHS * 30))" -delete

echo "[backup-monthly] Done."
