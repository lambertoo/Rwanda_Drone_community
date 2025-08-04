#!/bin/bash

echo "🚀 Deploying Rwanda Drone Community Platform to Production..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create production environment file if it doesn't exist
if [ ! -f .env.production ]; then
    echo "📝 Creating production environment file..."
    cat > .env.production << EOF
# Production Environment Variables
DATABASE_URL="postgresql://postgres:password@postgres:5432/rwanda_drone_community"
NODE_ENV=production
NEXTAUTH_SECRET=your-production-secret-key-here
NEXTAUTH_URL=https://your-domain.com
EOF
    echo "⚠️  Please update .env.production with your actual production values!"
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down -v 2>/dev/null || true

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start the containers
echo "🔨 Building and starting production containers..."
docker-compose --env-file .env.production up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 20

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Production deployment successful!"
    echo ""
    echo "🌐 Application URL: http://localhost:3000"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "🔧 Production Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop: docker-compose down"
    echo "   Restart: docker-compose restart"
    echo "   Update: ./deploy-production.sh"
    echo ""
    echo "📊 Monitor with: docker stats"
    echo "🎉 Your Rwanda Drone Community Platform is live!"
else
    echo "❌ Deployment failed. Check logs with: docker-compose logs"
    exit 1
fi 