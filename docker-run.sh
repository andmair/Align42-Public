#!/bin/bash
set -e

PORT=${1:-8000}

echo "Starting Align42 container on port $PORT..."
docker compose --profile prod up -d align42
echo "✓ Container started"
echo "→ Open http://localhost:$PORT/Align42.html"
