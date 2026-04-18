#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
./scripts/docker_doctor.sh
./scripts/docker_build.sh
./scripts/docker_run.sh
printf 'Open http://localhost:3000/Align42.html in your browser.
'
