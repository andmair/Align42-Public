#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist/installers"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$DIST_DIR" "$TMP_DIR/payload"
# Package full app content while excluding tests/dev/build artifacts.
rsync -a \
  --exclude ".git" \
  --exclude ".DS_Store" \
  --exclude "dist" \
  --exclude "scripts" \
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
WIN_INSTALLER="$DIST_DIR/Align42-Installer-Windows.bat"

cat > "$MAC_INSTALLER" <<EOF
#!/usr/bin/env bash
set -euo pipefail

APP_NAME="Align42"
WORK_DIR="\$(mktemp -d)"
trap 'rm -rf "\$WORK_DIR"' EXIT

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

cat > "$WIN_INSTALLER" <<'EOF'
@echo off
setlocal

set "APP_NAME=Align42"
set "WORK_DIR=%TEMP%\\align42_install_%RANDOM%%RANDOM%"
set "ZIP_FILE=%WORK_DIR%\\payload.zip"
set "SELF_FILE=%~f0"
set "BASE_DIR="
set "TARGET_DIR="

if not exist "%WORK_DIR%" mkdir "%WORK_DIR%"

for /f "usebackq delims=" %%I in (`powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference = 'Stop';" ^
  "Add-Type -AssemblyName System.Windows.Forms;" ^
  "$dialog = New-Object System.Windows.Forms.FolderBrowserDialog;" ^
  "$dialog.Description = 'Choose install location for Align42 (an Align42 folder will be created there):';" ^
  "$dialog.ShowNewFolderButton = $true;" ^
  "if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::Write($dialog.SelectedPath) }"`) do set "BASE_DIR=%%I"

if "%BASE_DIR%"=="" (
  set /p BASE_DIR=Enter install location path (Align42 folder will be created there): 
)
if "%BASE_DIR%"=="" set "BASE_DIR=%LOCALAPPDATA%"

set "TARGET_DIR=%BASE_DIR%\\%APP_NAME%"
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference = 'Stop';" ^
  "$raw = Get-Content -LiteralPath '%SELF_FILE%' -Raw;" ^
  "$start = '__PAYLOAD_B64_BEGIN__';" ^
  "$end = '__PAYLOAD_B64_END__';" ^
  "$s = $raw.IndexOf($start);" ^
  "$e = $raw.IndexOf($end);" ^
  "if ($s -lt 0 -or $e -lt 0) { throw 'Installer payload markers not found.' };" ^
  "$b64 = $raw.Substring($s + $start.Length, $e - ($s + $start.Length)).Trim();" ^
  "[IO.File]::WriteAllBytes('%ZIP_FILE%', [Convert]::FromBase64String($b64));" ^
  "Expand-Archive -LiteralPath '%ZIP_FILE%' -DestinationPath '%TARGET_DIR%' -Force;"
if errorlevel 1 (
  echo Installation failed while extracting payload.
  exit /b 1
)

for %%F in ("Align42.html" "app.js" "styles.css" "logo-align42.svg" "standards.html") do (
  if not exist "%TARGET_DIR%\\%%~F" (
    echo Installation verification failed: missing %%~F
    exit /b 1
  )
)

> "%TARGET_DIR%\\Launch Align42.cmd" (
  echo @echo off
  echo start "" "%%~dp0Align42.html"
)

echo Align42 installed to: %TARGET_DIR%
echo Use: %TARGET_DIR%\\Launch Align42.cmd
start "" "%TARGET_DIR%\\Align42.html"

rmdir /s /q "%WORK_DIR%" >nul 2>nul
goto :eof

__PAYLOAD_B64_BEGIN__
EOF

printf '%s\n' "$PAYLOAD_B64" >> "$WIN_INSTALLER"
printf '%s\n' "__PAYLOAD_B64_END__" >> "$WIN_INSTALLER"

echo "Created installers:"
echo "  $MAC_INSTALLER"
echo "  $WIN_INSTALLER"
