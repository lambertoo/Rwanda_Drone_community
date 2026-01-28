#!/bin/bash

# Server Setup Script
# Run this on the server after pulling code via git
# Usage: ./scripts/server-setup.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="rwanda-drone-platform"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Node.js version
check_nodejs() {
    print_status "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 20.20.0 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    
    print_status "Node.js version: $NODE_VERSION"
    
    if [ "$NODE_MAJOR" -lt 20 ]; then
        print_error "Node.js 20.20.0 or higher is required. Current: $NODE_VERSION"
        exit 1
    fi
    
    print_success "Node.js version check passed"
}

# Check package manager
check_package_manager() {
    print_status "Checking package manager..."
    
    if command -v pnpm &> /dev/null; then
        PACKAGE_MANAGER="pnpm"
        print_success "Using pnpm"
    elif command -v npm &> /dev/null; then
        PACKAGE_MANAGER="npm"
        print_success "Using npm"
    else
        print_error "Neither pnpm nor npm is installed"
        exit 1
    fi
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment file..."
    
    if [ ! -f .env.production ]; then
        if [ -f production.env.template ]; then
            print_status "Creating .env.production from template..."
            cp production.env.template .env.production
            print_warning "Please update .env.production with your actual values!"
            print_warning "Required variables:"
            echo "  - DATABASE_URL"
            echo "  - NEXTAUTH_SECRET (32+ characters)"
            echo "  - NEXTAUTH_URL"
            echo "  - CORS_ORIGIN"
        else
            print_warning "production.env.template not found. Please create .env.production manually."
        fi
    else
        print_success ".env.production already exists"
    fi
    
    # Secure the environment file
    if [ -f .env.production ]; then
        chmod 600 .env.production
        print_success "Environment file permissions set"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm install --production
    else
        npm install --production
    fi
    
    print_success "Dependencies installed"
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    
    npm run db:generate
    
    print_success "Prisma client generated"
}

# Build application
build_application() {
    print_status "Building application..."
    
    npm run build
    
    print_success "Application built successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    if [ ! -f .env.production ]; then
        print_warning "Skipping migrations: .env.production not found"
        return
    fi
    
    # Load environment variables
    set -a
    source .env.production
    set +a
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "Skipping migrations: DATABASE_URL not set"
        return
    fi
    
    # Test database connection
    if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
            npx prisma migrate deploy
            print_success "Database migrations completed"
        else
            print_warning "Cannot connect to database. Skipping migrations."
            print_warning "Run manually: npx prisma migrate deploy"
        fi
    else
        print_warning "psql not found. Skipping database connection test."
        npx prisma migrate deploy || print_warning "Migrations failed. Check DATABASE_URL."
    fi
}

# Setup PM2
setup_pm2() {
    print_status "Setting up PM2..."
    
    if ! command -v pm2 &> /dev/null; then
        print_status "Installing PM2 globally..."
        npm install -g pm2
    fi
    
    print_success "PM2 is available"
}

# Start/restart application with PM2
start_application() {
    print_status "Starting application with PM2..."
    
    # Stop existing process if running
    pm2 stop $APP_NAME 2>/dev/null || true
    pm2 delete $APP_NAME 2>/dev/null || true
    
    # Start application
    pm2 start npm --name "$APP_NAME" -- start
    
    # Save PM2 configuration
    pm2 save
    
    # Show status
    pm2 status
    
    print_success "Application started with PM2"
    
    # Setup PM2 to start on boot
    print_status "Setting up PM2 startup script..."
    pm2 startup | tail -1 | bash || print_warning "PM2 startup script setup failed (may need sudo)"
}

# Setup file permissions
setup_permissions() {
    print_status "Setting up file permissions..."
    
    # Create uploads directory if it doesn't exist
    mkdir -p public/uploads
    
    # Set appropriate permissions
    chmod 755 public/uploads
    
    print_success "File permissions set"
}

# Main function
main() {
    echo "=========================================="
    echo "Rwanda Drone Community Platform"
    echo "Server Setup Script"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_nodejs
    check_package_manager
    echo ""
    
    # Setup environment
    setup_environment
    echo ""
    
    # Install dependencies
    install_dependencies
    echo ""
    
    # Generate Prisma client
    generate_prisma
    echo ""
    
    # Build application
    build_application
    echo ""
    
    # Run migrations
    run_migrations
    echo ""
    
    # Setup permissions
    setup_permissions
    echo ""
    
    # Setup PM2
    setup_pm2
    echo ""
    
    # Ask about starting application
    read -p "Start application with PM2? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_application
        echo ""
        print_success "Setup completed! Application is running."
        echo ""
        echo "Useful commands:"
        echo "  View logs: pm2 logs $APP_NAME"
        echo "  Restart: pm2 restart $APP_NAME"
        echo "  Stop: pm2 stop $APP_NAME"
        echo "  Status: pm2 status"
    else
        print_warning "Application not started. Start manually with:"
        echo "  pm2 start npm --name \"$APP_NAME\" -- start"
    fi
    
    echo ""
    print_success "Server setup completed!"
}

# Run main function
main "$@"
