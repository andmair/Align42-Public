#!/bin/bash
echo "=== Docker Image ==="
docker images | grep align42 || echo "No align42 images found"

echo ""
echo "=== Running Containers ==="
docker compose ps || echo "No running containers"

echo ""
echo "=== Health Status ==="
if docker compose ps 2>/dev/null | grep -q align42; then
    docker exec align42 python3 -c "import urllib.request; resp = urllib.request.urlopen('http://localhost:8000/health', timeout=5); print('✓ Health check passed')" || echo "✗ Health check failed"
else
    echo "No running align42 container"
fi
