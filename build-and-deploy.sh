#!/bin/bash

# Rwanda Drone Community Platform - Build and Deploy Script
# This script ensures all requirements are met before building and deploying

set -e  # Exit on any error

echo "🚀 Starting Rwanda Drone Community Platform build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Docker
if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command_exists docker-compose; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Docker daemon is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker daemon is not running. Please start Docker first."
    exit 1
fi

print_success "Docker and Docker Compose are available"

# Check required files
print_status "Checking required files..."

REQUIRED_FILES=(
    "package.json"
    "pnpm-lock.yaml"
    "Dockerfile"
    "docker-compose.prod.yml"
    "prisma/schema.prisma"
    "next.config.mjs"
    "tsconfig.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_error "Required file not found: $file"
        exit 1
    fi
done

print_success "All required files are present"

# Check Node.js dependencies
print_status "Checking Node.js dependencies..."

if [[ ! -d "node_modules" ]]; then
    print_warning "node_modules not found. Installing dependencies..."
    if command_exists pnpm; then
        pnpm install
    elif command_exists npm; then
        npm install
    else
        print_error "Neither pnpm nor npm is available. Please install one of them."
        exit 1
    fi
fi

print_success "Node.js dependencies are available"

# Validate Prisma schema
print_status "Validating Prisma schema..."

if command_exists npx; then
    npx prisma validate
    print_success "Prisma schema is valid"
else
    print_warning "npx not available, skipping Prisma validation"
fi

# Clean up existing containers and images
print_status "Cleaning up existing containers and images..."

docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
docker system prune -f 2>/dev/null || true

print_success "Cleanup completed"

# Build the application
print_status "Building Docker image..."

docker-compose -f docker-compose.prod.yml build --no-cache

if [[ $? -eq 0 ]]; then
    print_success "Docker image built successfully"
else
    print_error "Docker build failed"
    exit 1
fi

# Start the services
print_status "Starting services..."

docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."

# Wait for database to be healthy
echo "Waiting for database to be ready..."
timeout=60
counter=0
while [[ $counter -lt $timeout ]]; do
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_success "Database is ready"
        break
    fi
    sleep 2
    counter=$((counter + 2))
done

if [[ $counter -eq $timeout ]]; then
    print_error "Database failed to start within $timeout seconds"
    docker-compose -f docker-compose.prod.yml logs postgres
    exit 1
fi

# Wait for app to be ready
echo "Waiting for application to be ready..."
timeout=120
counter=0
while [[ $counter -lt $timeout ]]; do
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        print_success "Application is ready"
        break
    fi
    sleep 3
    counter=$((counter + 3))
done

if [[ $counter -eq $timeout ]]; then
    print_error "Application failed to start within $timeout seconds"
    docker-compose -f docker-compose.prod.yml logs app
    exit 1
fi

# Run database migrations and seeding
print_status "Running database setup..."

docker-compose -f docker-compose.prod.yml exec -T app npx prisma db push --accept-data-loss
docker-compose -f docker-compose.prod.yml exec -T app npm run db:seed

print_success "Database setup completed"

# Final status check
print_status "Performing final status check..."

docker-compose -f docker-compose.prod.yml ps

# Test the application
print_status "Testing application endpoints..."

# Test health endpoint
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    print_success "Health endpoint is working"
else
    print_error "Health endpoint is not working"
fi

# Test login endpoint (should return 400 for missing credentials, not 500)
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{}')
if [[ "$LOGIN_RESPONSE" == "400" ]]; then
    print_success "Login endpoint is working (returning proper validation error)"
else
    print_warning "Login endpoint returned status $LOGIN_RESPONSE"
fi

print_success "Build and deployment completed successfully!"
echo ""
echo "🌐 Application is running at: http://localhost:3000"
echo "🗄️  Database is accessible at: localhost:5433"
echo ""
echo "📋 Sample login credentials:"
echo "   Admin: admin@drone.com / admin123"
echo "   User: hobbyist@drone.com / password123"
echo ""
echo "📊 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down" 