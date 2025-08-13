#!/bin/bash

echo "🚀 Deploying Rwanda Drone Community Platform to Production Server..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if production environment file exists
if [ ! -f .env.production ]; then
    echo "📝 Creating production environment file..."
    cat > .env.production << EOF
# Production Environment Variables
DB_PASSWORD=your_secure_database_password_here
DATABASE_URL=postgresql://postgres:your_secure_database_password_here@db:5432/rwanda_drone_community
NEXTAUTH_SECRET=your_very_long_random_secret_key_here_minimum_32_characters
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
PORT=3000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=public/uploads
CORS_ORIGIN=https://your-domain.com
EOF
    echo "⚠️  Please update .env.production with your actual production values!"
    echo "   - Update DB_PASSWORD with a secure password"
    echo "   - Update NEXTAUTH_SECRET with a random 32+ character string"
    echo "   - Update NEXTAUTH_URL with your actual domain"
    echo "   - Update CORS_ORIGIN with your actual domain"
    echo ""
    echo "Press Enter when you've updated the values..."
    read
fi

# Stop any existing production containers
echo "🛑 Stopping existing production containers..."
docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start the production containers
echo "🔨 Building and starting production containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Check if containers are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Production deployment successful!"
    echo ""
    echo "🌐 Application URL: http://localhost:3000"
    echo "🌐 Nginx URL: http://localhost:80"
    echo "🗄️  Database: localhost:5432"
    echo ""
    echo "🔧 Production Commands:"
    echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   Stop: docker-compose -f docker-compose.prod.yml down"
    echo "   Restart: docker-compose -f docker-compose.prod.yml restart"
    echo "   Update: ./deploy-production-server.sh"
    echo ""
    echo "📊 Monitor with: docker stats"
    echo "🎉 Your Rwanda Drone Community Platform is live in production mode!"
else
    echo "❌ Deployment failed. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi 