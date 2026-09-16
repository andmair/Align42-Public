#!/bin/bash
set -e

echo "Building Align42 Docker image..."
docker build -t align42:latest .
echo "✓ Build complete: align42:latest"
