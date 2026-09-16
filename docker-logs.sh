#!/bin/bash
docker compose logs -f align42 2>/dev/null || docker compose logs -f align42-dev
