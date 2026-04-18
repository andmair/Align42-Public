#!/usr/bin/env bash
set -euo pipefail
command -v docker >/dev/null 2>&1 || { echo "Docker is not installed or not on PATH." >&2; exit 1; }
docker --version
if docker info >/dev/null 2>&1; then
  echo "Docker daemon is available."
else
  echo "Docker daemon is not reachable." >&2
  exit 1
fi
