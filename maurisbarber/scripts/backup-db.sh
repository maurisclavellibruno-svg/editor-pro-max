#!/usr/bin/env bash
# Dumps the PostgreSQL database to a timestamped, gzip-compressed file.
# Usage: ./scripts/backup-db.sh [output-dir]
#
# For automated daily backups, add a line like this to the host's crontab
# (adjust the path):
#   0 3 * * * cd /path/to/maurisbarber && ./scripts/backup-db.sh ./backups >> ./backups/backup.log 2>&1
#
# Restore with:
#   gunzip -c backups/maurisbarber-2026-07-30T03-00-00.sql.gz | docker compose exec -T postgres psql -U maurisbarber -d maurisbarber

set -euo pipefail

OUTPUT_DIR="${1:-./backups}"
mkdir -p "$OUTPUT_DIR"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S")
FILE="$OUTPUT_DIR/maurisbarber-$TIMESTAMP.sql.gz"

docker compose exec -T postgres pg_dump -U maurisbarber maurisbarber | gzip > "$FILE"

echo "Backup written to $FILE"

# Keep the last 30 backups, delete older ones.
ls -1t "$OUTPUT_DIR"/maurisbarber-*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm --
