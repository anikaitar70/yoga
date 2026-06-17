#!/bin/sh
# Export local uploaded media for first VPS deployment.
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SOURCE_DIR="${SOURCE_DIR:-$ROOT/public/uploads}"
EXPORT_DIR="${EXPORT_DIR:-$ROOT/backups/uploads}"
STAMP="$(date +%Y-%m-%d_%H%M%S)"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Source directory not found: $SOURCE_DIR"
  exit 1
fi

mkdir -p "$EXPORT_DIR"

ARCHIVE="$EXPORT_DIR/uploads_${STAMP}.tar.gz"
MANIFEST="$EXPORT_DIR/uploads_${STAMP}.manifest.txt"

FILE_COUNT="$(find "$SOURCE_DIR" -type f ! -name '.gitkeep' | wc -l | tr -d ' ')"
TOTAL_BYTES="$(find "$SOURCE_DIR" -type f ! -name '.gitkeep' -exec wc -c {} + | awk '{sum+=$1} END {print sum+0}')"

tar czf "$ARCHIVE" -C "$SOURCE_DIR" .

{
  echo "created_at=$STAMP"
  echo "source_dir=$SOURCE_DIR"
  echo "archive=$ARCHIVE"
  echo "file_count=$FILE_COUNT"
  echo "total_bytes=$TOTAL_BYTES"
} > "$MANIFEST"

echo "Media export complete."
echo "Archive : $ARCHIVE"
echo "Manifest: $MANIFEST"
echo "Files   : $FILE_COUNT"
echo "Bytes   : $TOTAL_BYTES"
