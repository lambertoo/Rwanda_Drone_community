#!/bin/bash

echo "🐳 Starting Rwanda Drone Community Platform with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon is not running."
    echo "   Please start Docker Desktop or Docker daemon and try again."
    echo ""
    echo "   On macOS: Open Docker Desktop application"
    echo "   On Linux: Run 'sudo systemctl start docker'"
    echo "   On Windows: Start Docker Desktop"
    exit 1
fi

echo "✅ Docker is running!"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

echo "✅ docker-compose is available!"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down -v 2>/dev/null || true

# Build and start the containers
echo "🔨 Building and starting containers..."
docker-compose up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

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
    echo ""
    echo "🎉 Your Rwanda Drone Community Platform is ready!"
else
    echo "❌ Failed to start containers. Check logs with: docker-compose logs"
    exit 1
fi 