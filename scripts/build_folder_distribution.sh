#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_ROOT="$ROOT_DIR/dist/files"
DIST_DIR="$DIST_ROOT/Align42"
ALLOW_DEPRECATED_DISTRIBUTIONS="${ALLOW_DEPRECATED_DISTRIBUTIONS:-0}"

if [[ "$ALLOW_DEPRECATED_DISTRIBUTIONS" != "1" ]]; then
  cat >&2 <<'EOF'
Folder-based distribution builds are currently deprecated and retained only for future use.
No distribution files were rebuilt.

If you explicitly need to rebuild them again, rerun with:
  ALLOW_DEPRECATED_DISTRIBUTIONS=1 ./scripts/build_folder_distribution.sh
EOF
  exit 0
fi

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Copy app files only (clean distribution; no test/dev/build/user-data artifacts).
rsync -a \
  --exclude ".git" \
  --exclude ".DS_Store" \
  --exclude "dist" \
  --exclude "scripts" \
  --exclude "tools" \
  --exclude "tests" \
  --exclude "__pycache__" \
  --exclude "*.pyc" \
  --exclude "tests.html" \
  --exclude "tests.js" \
  --exclude "*.py" \
  --exclude "iso42001.db" \
  "$ROOT_DIR/" "$DIST_DIR/"

if [[ ! -f "$DIST_DIR/Align42.html" ]]; then
  echo "Missing required app entry file: Align42.html" >&2
  exit 1
fi

# Stamp package id for clean local-storage scope isolation.
INSTALL_ID="pkg_$(date +%Y%m%d%H%M%S)_$RANDOM"
perl -0777 -pe "s/__ALIGN42_INSTALL_ID__/${INSTALL_ID}/g; s/__ALIGN42_INSTALL_COUNTRY__//g" "$DIST_DIR/app.js" > "$DIST_DIR/.app.js.tmp"
mv "$DIST_DIR/.app.js.tmp" "$DIST_DIR/app.js"

cat > "$DIST_DIR/README-Distribution.txt" <<'EOF'
Align42 Folder Distribution

1) Copy the full Align42 folder to the target device.
2) Open Align42.html in a browser.
3) Optional (recommended for AI provider reliability): serve via localhost and open http://localhost/.../Align42.html

This distribution is a clean package and does not include user profile data, AI settings, or assessment history.
EOF

echo "Created folder distribution:"
echo "  $DIST_DIR"
