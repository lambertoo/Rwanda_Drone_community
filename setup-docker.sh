#!/bin/bash

echo "🚀 Setting up Rwanda Drone Community Platform with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down -v 2>/dev/null || true

# Build and start the containers
echo "🔨 Building and starting containers..."
docker-compose up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Containers are running successfully!"
    echo ""
    echo "🌐 Application URL: http://localhost:3000"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "📋 Demo Credentials:"
    echo "   Admin: admin@drone.com / admin123"
    echo "   Pilot: pilot@drone.com / pilot123"
    echo "   Hobbyist: hobbyist@drone.com / hobbyist123"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop: docker-compose down"
    echo "   Restart: docker-compose restart"
else
    echo "❌ Failed to start containers. Check logs with: docker-compose logs"
    exit 1
fi 