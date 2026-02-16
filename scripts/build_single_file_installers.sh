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

(cd "$TMP_DIR/payload" && zip -qr "$TMP_DIR/align42_payload.zip" .)
PAYLOAD_B64="$(base64 < "$TMP_DIR/align42_payload.zip")"

MAC_INSTALLER="$DIST_DIR/Align42-Installer-macOS.command"
WIN_ZIP_INSTALLER="$DIST_DIR/Align42-Installer-Windows.zip"
WIN_EXE_INSTALLER="$DIST_DIR/Align42-Installer-Windows.exe"

cat > "$MAC_INSTALLER" <<EOF
#!/usr/bin/env bash
set -euo pipefail

APP_NAME="Align42"
WORK_DIR="\$(mktemp -d)"
trap 'rm -rf "\$WORK_DIR"' EXIT

country_from_region_code() {
  case "\${1^^}" in
    AU) printf '%s\n' "Australia" ;;
    CA) printf '%s\n' "Canada" ;;
    FR) printf '%s\n' "France" ;;
    DE) printf '%s\n' "Germany" ;;
    IN) printf '%s\n' "India" ;;
    IE) printf '%s\n' "Ireland" ;;
    JP) printf '%s\n' "Japan" ;;
    NL) printf '%s\n' "Netherlands" ;;
    NZ) printf '%s\n' "New Zealand" ;;
    SG) printf '%s\n' "Singapore" ;;
    ZA) printf '%s\n' "South Africa" ;;
    ES) printf '%s\n' "Spain" ;;
    SE) printf '%s\n' "Sweden" ;;
    CH) printf '%s\n' "Switzerland" ;;
    AE) printf '%s\n' "United Arab Emirates" ;;
    GB|UK) printf '%s\n' "United Kingdom" ;;
    US) printf '%s\n' "United States" ;;
    *) printf '%s\n' "" ;;
  esac
}

detect_install_country() {
  local locale code
  locale="\$(defaults read -g AppleLocale 2>/dev/null || true)"
  if [[ "\$locale" =~ [_-]([A-Za-z]{2})([_@].*)?$ ]]; then
    code="\${BASH_REMATCH[1]}"
  else
    locale="\${LANG:-}"
    if [[ "\$locale" =~ [_-]([A-Za-z]{2})(\..*)?$ ]]; then
      code="\${BASH_REMATCH[1]}"
    fi
  fi
  country_from_region_code "\$code"
}

pick_install_base() {
  local selected
  if command -v osascript >/dev/null 2>&1; then
    selected="\$(osascript <<'__OSA__' 2>/dev/null || true
set chosenFolder to choose folder with prompt "Choose install location for Align42 (an Align42 folder will be created there):"
POSIX path of chosenFolder
__OSA__
)"
    if [[ -n "\$selected" ]]; then
      printf '%s\n' "\${selected%/}"
      return 0
    fi
  fi

  printf 'Enter install location path (Align42 folder will be created there): '
  read -r selected
  selected="\${selected:-\$HOME/Applications}"
  printf '%s\n' "\${selected%/}"
}

BASE_DIR="\$(pick_install_base)"
TARGET_DIR="\$BASE_DIR/\$APP_NAME"

mkdir -p "\$TARGET_DIR"

PAYLOAD_B64="\$WORK_DIR/payload.b64"
PAYLOAD_ZIP="\$WORK_DIR/payload.zip"

cat > "\$PAYLOAD_B64" <<'__PAYLOAD_B64__'
$PAYLOAD_B64
__PAYLOAD_B64__

if base64 --help 2>&1 | grep -q -- "-D"; then
  base64 -D < "\$PAYLOAD_B64" > "\$PAYLOAD_ZIP"
else
  base64 -d < "\$PAYLOAD_B64" > "\$PAYLOAD_ZIP"
fi

unzip -oq "\$PAYLOAD_ZIP" -d "\$TARGET_DIR"

# Stamp app with installation-specific storage scope for clean first run.
INSTALL_COUNTRY="\$(detect_install_country)"
INSTALL_ID="inst_\$(date +%Y%m%d%H%M%S)_\$RANDOM"
perl -0777 -pe "s/__ALIGN42_INSTALL_ID__/\${INSTALL_ID}/g; s/__ALIGN42_INSTALL_COUNTRY__/\${INSTALL_COUNTRY}/g" "\$TARGET_DIR/app.js" > "\$TARGET_DIR/.app.js.tmp"
mv "\$TARGET_DIR/.app.js.tmp" "\$TARGET_DIR/app.js"

# Verify required app files exist before creating launcher/opening app.
required_files=(
  "Align42.html"
  "app.js"
  "styles.css"
  "logo-align42.svg"
  "standards.html"
)
for rel in "\${required_files[@]}"; do
  if [[ ! -f "\$TARGET_DIR/\$rel" ]]; then
    echo "Installation verification failed: missing \$rel" >&2
    exit 1
  fi
done

cat > "\$TARGET_DIR/Launch Align42.command" <<'__LAUNCHER__'
#!/usr/bin/env bash
set -euo pipefail
DIR="\$(cd "\$(dirname "\$0")" && pwd)"
open "\$DIR/Align42.html"
__LAUNCHER__
chmod +x "\$TARGET_DIR/Launch Align42.command"

echo "Align42 installed to: \$TARGET_DIR"
echo "Use: \$TARGET_DIR/Launch Align42.command"

open "\$TARGET_DIR/Align42.html" >/dev/null 2>&1 || true
EOF
chmod +x "$MAC_INSTALLER"

WIN_STAGE="$TMP_DIR/windows_installer/Align42"
mkdir -p "$WIN_STAGE"
rsync -a "$TMP_DIR/payload/" "$WIN_STAGE/"

# Stamp with package-level installation scope for clean local storage isolation.
WIN_INSTALL_ID="pkg_$(date +%Y%m%d%H%M%S)_$RANDOM"
perl -0777 -pe "s/__ALIGN42_INSTALL_ID__/${WIN_INSTALL_ID}/g; s/__ALIGN42_INSTALL_COUNTRY__//g" "$WIN_STAGE/app.js" > "$WIN_STAGE/.app.js.tmp"
mv "$WIN_STAGE/.app.js.tmp" "$WIN_STAGE/app.js"

cat > "$WIN_STAGE/Launch Align42.cmd" <<'EOF'
@echo off
start "" "%~dp0Align42.html"
EOF

# Convenience launcher at extraction root (one click after unzip).
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

cat > "$TMP_DIR/windows_installer/README-Windows-Install.txt" <<'EOF'
1) Extract this zip to your target directory.
2) Open "Open Align42 Home.cmd" to launch the app home page.
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

# Build Windows SFX (.exe) installer as a second distribution option.
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

# Remove legacy Windows bat installer artifact if present.
rm -f "$DIST_DIR/Align42-Installer-Windows.bat"

# Generate checksum manifest for distribution integrity verification.
CHECKSUM_FILE="$DIST_DIR/SHA256SUMS.txt"
(
  cd "$DIST_DIR"
  shasum -a 256 \
    "Align42-Installer-macOS.command" \
    "Align42-Installer-Windows.zip" \
    "Align42-Installer-Windows.exe" > "$CHECKSUM_FILE"
)

echo "Created installers:"
echo "  $MAC_INSTALLER"
echo "  $WIN_ZIP_INSTALLER"
echo "  $WIN_EXE_INSTALLER"
echo "  $CHECKSUM_FILE"
