#!/bin/bash
set -e

PORT=${1:-8000}

echo "Starting Align42 in development mode with hot reload on port $PORT..."
docker compose --profile dev up align42-dev
