#!/bin/bash

echo "🧪 Testing Production Build Locally..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build production image
echo "🔨 Building production Docker image..."
docker build -f Dockerfile.prod -t rwanda-drone-prod .

if [ $? -eq 0 ]; then
    echo "✅ Production build successful!"
    echo ""
    echo "📋 Production image details:"
    docker images rwanda-drone-prod
    
    echo ""
    echo "🚀 To deploy to production server:"
    echo "   1. Copy these files to your server:"
    echo "      - docker-compose.prod.yml"
    echo "      - Dockerfile.prod"
    echo "      - nginx/nginx.conf"
    echo "      - deploy-production-server.sh"
    echo "      - .env.production (with your values)"
    echo ""
    echo "   2. Run on server: ./deploy-production-server.sh"
    echo ""
    echo "🌐 Or test locally with: docker-compose -f docker-compose.prod.yml up -d"
else
    echo "❌ Production build failed!"
    exit 1
fi 