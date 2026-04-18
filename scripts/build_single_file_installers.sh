#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist/installers"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
SEVENZIP_DIR="$ROOT_DIR/tools/7zip"
SEVENZIP_BIN="$SEVENZIP_DIR/mac/7zz"
SEVENZIP_WIN_PACKAGE="$SEVENZIP_DIR/7zip-win-x64.exe"
SEVENZIP_WIN_SFX="$SEVENZIP_DIR/win/7z.sfx"
BUILD_WINDOWS_EXE="${BUILD_WINDOWS_EXE:-0}"
ALLOW_DEPRECATED_DISTRIBUTIONS="${ALLOW_DEPRECATED_DISTRIBUTIONS:-0}"

if [[ "$ALLOW_DEPRECATED_DISTRIBUTIONS" != "1" ]]; then
  cat >&2 <<'EOF'
Installer distribution builds are currently deprecated and retained only for future use.
No installer artifacts were rebuilt.

If you explicitly need to rebuild them again, rerun with:
  ALLOW_DEPRECATED_DISTRIBUTIONS=1 ./scripts/build_single_file_installers.sh
EOF
  exit 0
fi

ensure_7zip_tools() {
  if [[ ! -x "$SEVENZIP_BIN" ]]; then
    mkdir -p "$SEVENZIP_DIR/mac"
    local mac_pkg="$SEVENZIP_DIR/7zip-mac.tar.xz"
    if [[ ! -f "$mac_pkg" ]]; then
      command -v curl >/dev/null 2>&1 || { echo "curl is required to download 7-Zip tools." >&2; exit 1; }
      curl -fL -o "$mac_pkg" "https://www.7-zip.org/a/7z2409-mac.tar.xz"
    fi
    bsdtar -xf "$mac_pkg" -C "$SEVENZIP_DIR/mac"
    chmod +x "$SEVENZIP_BIN"
  fi

  if [[ ! -f "$SEVENZIP_WIN_SFX" ]]; then
    mkdir -p "$SEVENZIP_DIR/win"
    if [[ ! -f "$SEVENZIP_WIN_PACKAGE" ]]; then
      command -v curl >/dev/null 2>&1 || { echo "curl is required to download 7-Zip tools." >&2; exit 1; }
      curl -fL -o "$SEVENZIP_WIN_PACKAGE" "https://www.7-zip.org/a/7z2409-x64.exe"
    fi
    "$SEVENZIP_BIN" x -y "$SEVENZIP_WIN_PACKAGE" "7z.sfx" -o"$SEVENZIP_DIR/win" >/dev/null
  fi
}

mkdir -p "$DIST_DIR" "$TMP_DIR/payload"
# Package full app content while excluding tests/dev/build artifacts.
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
  "$ROOT_DIR/" "$TMP_DIR/payload/"

if [[ ! -f "$TMP_DIR/payload/Align42.html" ]]; then
  echo "Missing required app entry file: Align42.html" >&2
  exit 1
fi

MAC_ZIP_INSTALLER="$DIST_DIR/Align42-Installer-macOS.zip"
WIN_ZIP_INSTALLER="$DIST_DIR/Align42-Installer-Windows.zip"
WIN_EXE_INSTALLER="$DIST_DIR/Align42-Installer-Windows.exe"

MAC_STAGE="$TMP_DIR/macos_installer/Align42"
mkdir -p "$MAC_STAGE"
rsync -a "$TMP_DIR/payload/" "$MAC_STAGE/"

# Stamp with package-level installation scope for clean local storage isolation.
MAC_INSTALL_ID="pkg_$(date +%Y%m%d%H%M%S)_$RANDOM"
perl -0777 -pe "s/__ALIGN42_INSTALL_ID__/${MAC_INSTALL_ID}/g; s/__ALIGN42_INSTALL_COUNTRY__//g" "$MAC_STAGE/app.js" > "$MAC_STAGE/.app.js.tmp"
mv "$MAC_STAGE/.app.js.tmp" "$MAC_STAGE/app.js"

cat > "$TMP_DIR/macos_installer/README-Mac-Install.txt" <<'EOF'
1) Extract this zip to your target directory.
2) Open Align42/Align42.html in your browser.
EOF

rm -f "$MAC_ZIP_INSTALLER"
python3 - "$TMP_DIR/macos_installer/Align42" "$MAC_ZIP_INSTALLER" <<'PY'
import os
import pathlib
import sys
import time
import zipfile

src = pathlib.Path(sys.argv[1]).resolve()
dst = pathlib.Path(sys.argv[2]).resolve()
dst.parent.mkdir(parents=True, exist_ok=True)

def normalize_arcname(path: pathlib.Path) -> str:
    return f"Align42/{str(path.relative_to(src)).replace(os.sep, '/')}"

with zipfile.ZipFile(dst, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for path in sorted(src.rglob("*")):
        if path.is_dir():
            continue
        if path.name.startswith("._"):
            continue
        arc = normalize_arcname(path)
        info = zipfile.ZipInfo(arc)
        info.compress_type = zipfile.ZIP_DEFLATED
        mtime = max(path.stat().st_mtime, 315532800)  # ZIP minimum date is 1980-01-01
        info.date_time = time.localtime(mtime)[:6]
        info.create_system = 0
        info.external_attr = 0
        with path.open("rb") as f:
            zf.writestr(info, f.read())
PY

WIN_STAGE="$TMP_DIR/windows_installer/Align42"
mkdir -p "$WIN_STAGE"
rsync -a "$TMP_DIR/payload/" "$WIN_STAGE/"

# Stamp with package-level installation scope for clean local storage isolation.
WIN_INSTALL_ID="pkg_$(date +%Y%m%d%H%M%S)_$RANDOM"
perl -0777 -pe "s/__ALIGN42_INSTALL_ID__/${WIN_INSTALL_ID}/g; s/__ALIGN42_INSTALL_COUNTRY__//g" "$WIN_STAGE/app.js" > "$WIN_STAGE/.app.js.tmp"
mv "$WIN_STAGE/.app.js.tmp" "$WIN_STAGE/app.js"

cat > "$TMP_DIR/windows_installer/README-Windows-Install.txt" <<'EOF'
1) Extract this zip to your target directory.
2) Open Align42/Align42.html in your browser.
EOF

rm -f "$WIN_ZIP_INSTALLER"
python3 - "$TMP_DIR/windows_installer" "$WIN_ZIP_INSTALLER" <<'PY'
import os
import pathlib
import sys
import time
import zipfile

src = pathlib.Path(sys.argv[1]).resolve()
dst = pathlib.Path(sys.argv[2]).resolve()
dst.parent.mkdir(parents=True, exist_ok=True)

def normalize_arcname(path: pathlib.Path) -> str:
    return str(path.relative_to(src)).replace(os.sep, "/")

with zipfile.ZipFile(dst, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for path in sorted(src.rglob("*")):
        if path.is_dir():
            continue
        if path.name.startswith("._"):
            continue
        arc = normalize_arcname(path)
        info = zipfile.ZipInfo(arc)
        info.compress_type = zipfile.ZIP_DEFLATED
        mtime = max(path.stat().st_mtime, 315532800)  # ZIP minimum date is 1980-01-01
        info.date_time = time.localtime(mtime)[:6]
        # Force DOS/Windows metadata for max extractor compatibility.
        info.create_system = 0
        info.external_attr = 0
        with path.open("rb") as f:
            zf.writestr(info, f.read())
PY

# Build Windows SFX (.exe) installer only when explicitly requested.
if [[ "$BUILD_WINDOWS_EXE" == "1" ]]; then
  cat > "$TMP_DIR/windows_installer/Open Align42 Home.cmd" <<'EOF'
@echo off
set "APP_HTML=%~dp0Align42\Align42.html"
if not exist "%APP_HTML%" (
  echo Align42.html was not found in "%~dp0Align42".
  echo Ensure the zip was fully extracted before launching.
  pause
  exit /b 1
)
start "" "%APP_HTML%"
EOF
  ensure_7zip_tools
  WIN_PAYLOAD_7Z="$TMP_DIR/windows_payload.7z"
  WIN_SFX_CONFIG="$TMP_DIR/windows_sfx_config.txt"

  (cd "$TMP_DIR/windows_installer" && "$SEVENZIP_BIN" a -t7z -mx=9 "$WIN_PAYLOAD_7Z" "Align42" "Open Align42 Home.cmd" "README-Windows-Install.txt" >/dev/null)

  cat > "$WIN_SFX_CONFIG" <<'EOF'
;!@Install@!UTF-8!
Title="Align42 Installer"
BeginPrompt="Align42 will be extracted into this folder and the home page will open."
ExtractDialogText="Extracting Align42..."
InstallPath="%S\\"
RunProgram="Open Align42 Home.cmd"
;!@InstallEnd@!
EOF

  cat "$SEVENZIP_WIN_SFX" "$WIN_SFX_CONFIG" "$WIN_PAYLOAD_7Z" > "$WIN_EXE_INSTALLER"
fi

# Remove legacy Windows bat installer artifact if present.
rm -f "$DIST_DIR/Align42-Installer-Windows.bat"

# Generate checksum manifest for distribution integrity verification.
CHECKSUM_FILE="$DIST_DIR/SHA256SUMS.txt"
(
  cd "$DIST_DIR"
  if [[ "$BUILD_WINDOWS_EXE" == "1" ]]; then
    shasum -a 256 \
      "Align42-Installer-macOS.zip" \
      "Align42-Installer-Windows.zip" \
      "Align42-Installer-Windows.exe" > "$CHECKSUM_FILE"
  else
    shasum -a 256 \
      "Align42-Installer-macOS.zip" \
      "Align42-Installer-Windows.zip" > "$CHECKSUM_FILE"
  fi
)

echo "Created installers:"
echo "  $MAC_ZIP_INSTALLER"
echo "  $WIN_ZIP_INSTALLER"
if [[ "$BUILD_WINDOWS_EXE" == "1" ]]; then
  echo "  $WIN_EXE_INSTALLER"
else
  echo "  $WIN_EXE_INSTALLER (deprecated, not rebuilt; set BUILD_WINDOWS_EXE=1 to build)"
fi
echo "  $CHECKSUM_FILE"
