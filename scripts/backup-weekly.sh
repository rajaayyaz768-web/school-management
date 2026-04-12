#!/usr/bin/env bash
# Weekly off-site upload — run via cron on Sunday at 02:15
# Crontab entry:  15 2 * * 0 /opt/college/scripts/backup-weekly.sh
#
# Requires rclone configured with a remote named "gdrive".
# See: https://rclone.org/drive/

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/college}"
RCLONE_REMOTE="${RCLONE_REMOTE:-gdrive:college-backups}"

# Find the most recently modified archive in BACKUP_DIR
LATEST=$(find "$BACKUP_DIR" -maxdepth 1 -name 'backup_*.sql.gz' \
  -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)

if [[ -z "$LATEST" ]]; then
  echo "[backup-weekly] No archive found in $BACKUP_DIR — skipping upload." >&2
  exit 1
fi

echo "[backup-weekly] Uploading $LATEST → $RCLONE_REMOTE/"
rclone copy "$LATEST" "$RCLONE_REMOTE/" --progress
echo "[backup-weekly] Upload complete."
