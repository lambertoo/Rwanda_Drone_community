#!/bin/bash

# Quick Build Script - For development iterations
# This script does a fast rebuild without full validation

set -e

echo "⚡ Quick build starting..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Quick checks
echo -e "${BLUE}Checking basic requirements...${NC}"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if required files exist
if [[ ! -f "Dockerfile" ]] || [[ ! -f "docker-compose.prod.yml" ]]; then
    echo "❌ Required files not found. Please run from project root."
    exit 1
fi

echo -e "${GREEN}✓ Basic requirements met${NC}"

# Stop and remove existing containers
echo -e "${BLUE}Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build the image
echo -e "${BLUE}Building Docker image...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache app

# Start services
echo -e "${BLUE}Starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for app to be ready
echo -e "${BLUE}Waiting for app to be ready...${NC}"
timeout=60
counter=0
while [[ $counter -lt $timeout ]]; do
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Application is ready!${NC}"
        break
    fi
    sleep 2
    counter=$((counter + 2))
done

if [[ $counter -eq $timeout ]]; then
    echo "⚠️  Application may not be fully ready. Check logs with:"
    echo "   docker-compose -f docker-compose.prod.yml logs app"
fi

echo -e "${GREEN}🎉 Quick build completed!${NC}"
echo "🌐 App running at: http://localhost:3000"
echo "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f app" 