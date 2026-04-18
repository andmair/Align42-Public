#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
docker rm -f align42 >/dev/null 2>&1 || true
docker run -d --name align42 -p 3000:3000 align42
printf 'Align42 is running at http://localhost:3000/Align42.html
'
