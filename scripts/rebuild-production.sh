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

# Function to check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    print_success "Node.js $(node -v) is installed"
}

# Function to check if package manager is available
check_package_manager() {
    if command -v pnpm &> /dev/null; then
        PACKAGE_MANAGER="pnpm"
    elif command -v npm &> /dev/null; then
        PACKAGE_MANAGER="npm"
        print_warning "pnpm not found, using npm instead"
    else
        print_error "Neither pnpm nor npm is installed. Please install one of them."
        exit 1
    fi
    print_success "Using $PACKAGE_MANAGER as package manager"
}

# Function to check if environment file exists
check_environment() {
    if [ ! -f .env.production ]; then
        print_error ".env.production file not found!"
        print_status "Please create .env.production with your production environment variables."
        exit 1
    fi
    print_success "Environment file found"
}

# Function to check database connection
check_database() {
    if command -v psql &> /dev/null; then
        # Load environment variables
        set -a
        source .env.production
        set +a
        
        if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
            print_success "Database connection successful"
        else
            print_warning "Could not connect to database. Please check your DATABASE_URL"
        fi
    else
        print_warning "psql not found. Skipping database connection check."
    fi
}

# Function to rebuild application
rebuild_app() {
    print_status "Rebuilding production application..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    $PACKAGE_MANAGER install
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    $PACKAGE_MANAGER run db:generate
    
    # Build application
    print_status "Building application..."
    $PACKAGE_MANAGER run build
    
    print_success "Application rebuild completed!"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Load environment variables
    set -a
    source .env.production
    set +a
    
    if command -v psql &> /dev/null && psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        npx prisma migrate deploy
        print_success "Database migrations completed"
    else
        print_warning "Skipping database migrations. Please run manually: npx prisma migrate deploy"
    fi
}

# Function to display status
display_status() {
    print_success "🎉 Production rebuild completed successfully!"
    echo
    echo "📋 Next Steps:"
    echo "   1. Ensure your process manager (PM2, systemd, etc.) is configured"
    echo "   2. Restart your application service"
    echo
    echo "🌐 Access Points:"
    echo "   Main App: http://localhost:${PORT:-3000}"
    echo "   API: http://localhost:${PORT:-3000}/api"
    echo
    echo "🔧 Management Commands:"
    if command -v pm2 &> /dev/null; then
        echo "   View logs: pm2 logs rwanda-drone-platform"
        echo "   Restart: pm2 restart rwanda-drone-platform"
        echo "   Stop: pm2 stop rwanda-drone-platform"
        echo "   Start: pm2 start npm --name 'rwanda-drone-platform' -- start"
    else
        echo "   Install PM2: npm install -g pm2"
        echo "   Start with PM2: pm2 start npm --name 'rwanda-drone-platform' -- start"
        echo "   Or use systemd/service manager to manage the process"
    fi
    echo
    print_success "Your application is ready! 🚀"
}

# Main function
main() {
    echo "🔨 Rwanda Drone Community Platform - Production Rebuild"
    echo "====================================================="
    echo
    
    # Check prerequisites
    check_nodejs
    check_package_manager
    check_environment
    check_database
    
    # Rebuild application
    rebuild_app
    
    # Run migrations
    run_migrations
    
    # Display status
    display_status
}

# Run main function
main "$@"
