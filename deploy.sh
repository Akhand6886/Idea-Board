#!/usr/bin/env bash
set -e

echo "🌌 IdeaOS Deployment Script (Raspberry Pi / Home Server)"
echo "========================================================="

# Ensure docker and docker-compose are available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "📦 Pulling latest changes & rebuilding Docker containers..."
docker compose up -d --build --remove-orphans

echo "🚀 IdeaOS successfully deployed and running on port 3001!"
echo "👉 Access at http://localhost:3001 or http://ideaos.local"
