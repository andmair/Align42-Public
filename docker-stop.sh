#!/bin/bash
set -e

echo "Stopping Align42 container..."
docker compose down
echo "✓ Container stopped"
