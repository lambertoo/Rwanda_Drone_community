#!/bin/bash

# Rwanda Drone Community Platform - Production Rebuild Script
# This script rebuilds and restarts the production application

set -e  # Exit on any error

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if environment file exists
check_environment() {
    if [ ! -f .env.production ]; then
        print_error ".env.production file not found!"
        print_status "Please run the installation script first or create .env.production manually."
        exit 1
    fi
}

# Function to rebuild application
rebuild_app() {
    print_status "Rebuilding production application..."
    
    # Stop containers
    print_status "Stopping containers..."
    docker-compose -f docker-compose.prod.yml down
    
    # Rebuild and start
    print_status "Building and starting containers..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production up --build -d
    
    print_success "Application rebuild completed!"
}

# Function to wait for services
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    local db_ready=false
    local attempts=0
    while [ "$db_ready" = false ] && [ $attempts -lt 30 ]; do
        if docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U postgres -d rwanda_drone_community >/dev/null 2>&1; then
            db_ready=true
            print_success "Database is ready"
        else
            attempts=$((attempts + 1))
            print_status "Waiting for database... (attempt $attempts/30)"
            sleep 2
        fi
    done
    
    if [ "$db_ready" = false ]; then
        print_error "Database failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for app
    print_status "Waiting for application..."
    local app_ready=false
    local attempts=0
    while [ "$app_ready" = false ] && [ $attempts -lt 30 ]; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            app_ready=true
            print_success "Application is ready"
        else
            attempts=$((attempts + 1))
            print_status "Waiting for application... (attempt $attempts/30)"
            sleep 2
        fi
    done
    
    if [ "$app_ready" = false ]; then
        print_error "Application failed to start within 60 seconds"
        exit 1
    fi
}

# Function to display status
display_status() {
    print_success "🎉 Production rebuild completed successfully!"
    echo
    echo "📋 Service Status:"
    docker-compose -f docker-compose.prod.yml ps
    echo
    echo "🌐 Access Points:"
    echo "   Main App: http://localhost"
    echo "   Health: http://localhost/health"
    echo "   API: http://localhost/api"
    echo
    echo "🔧 Management Commands:"
    echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   Stop: docker-compose -f docker-compose.prod.yml down"
    echo "   Start: docker-compose -f docker-compose.prod.yml --env-file .env.production up -d"
    echo
    print_success "Your application is ready! 🚀"
}

# Main function
main() {
    echo "🔨 Rwanda Drone Community Platform - Production Rebuild"
    echo "====================================================="
    echo
    
    # Check prerequisites
    check_docker
    check_environment
    
    # Rebuild application
    rebuild_app
    
    # Wait for services
    wait_for_services
    
    # Display status
    display_status
}

# Run main function
main "$@" 