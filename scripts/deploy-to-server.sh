#!/bin/bash

# Deployment script for Rwanda Drone Community Platform
# Deploys to: deploy@172.239.238.32

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="deploy"
SERVER_HOST="172.239.238.32"
SERVER_PATH="/var/www/rwanda-drone-platform"
APP_NAME="rwanda-drone-platform"

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if rsync is available
    if ! command -v rsync &> /dev/null; then
        print_error "rsync is not installed. Please install it first."
        exit 1
    fi
    
    # Check if SSH key is set up
    if ! ssh -o BatchMode=yes -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} echo "SSH connection test" &> /dev/null; then
        print_warning "SSH key authentication may not be set up. You may be prompted for a password."
    else
        print_success "SSH connection verified"
    fi
    
    # Check if .env.production exists locally (optional)
    if [ ! -f .env.production ]; then
        print_warning ".env.production not found locally. Make sure to set it up on the server."
    fi
}

# Build the application locally
build_locally() {
    print_status "Building application locally..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed locally"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        print_warning "Local Node.js version is less than 20. Building may fail."
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        pnpm install
    fi
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    pnpm run db:generate || print_warning "Prisma client generation failed (will run on server)"
    
    # Build application
    print_status "Building Next.js application..."
    pnpm run build || print_warning "Build failed locally (will build on server)"
    
    print_success "Local build completed"
}

# Deploy files to server
deploy_files() {
    print_status "Deploying files to ${SERVER_USER}@${SERVER_HOST}..."
    
    # Create .deployignore if it doesn't exist
    if [ ! -f .deployignore ]; then
        cat > .deployignore << EOF
node_modules
.next
.env*
*.log
.DS_Store
.git
.vscode
.idea
*.swp
*.swo
*~
EOF
        print_status "Created .deployignore file"
    fi
    
    # Use rsync to sync files
    print_status "Syncing files..."
    rsync -avz \
        --exclude-from=.deployignore \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.env*' \
        --exclude='*.log' \
        --exclude='.DS_Store' \
        ./ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
    
    print_success "Files deployed successfully"
}

# Setup server environment
setup_server() {
    print_status "Setting up server environment..."
    
    ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
        set -e
        cd /var/www/rwanda-drone-platform
        
        # Check Node.js version
        echo "Checking Node.js version..."
        if ! command -v node &> /dev/null; then
            echo "ERROR: Node.js is not installed on the server"
            echo "Please install Node.js 20.20.0 or higher first"
            exit 1
        fi
        
        NODE_VERSION=$(node -v)
        echo "Node.js version: $NODE_VERSION"
        
        # Check if .env.production exists
        if [ ! -f .env.production ]; then
            echo "WARNING: .env.production not found"
            echo "Please create it from production.env.template"
        fi
        
        # Install dependencies
        echo "Installing dependencies..."
        pnpm install
        
        # Generate Prisma client
        echo "Generating Prisma client..."
        pnpm run db:generate
        
        # Build application
        echo "Building application..."
        pnpm run build
        
        # Run database migrations
        echo "Running database migrations..."
        if [ -f .env.production ]; then
            export $(cat .env.production | grep -v '^#' | xargs)
            pnpm exec prisma migrate deploy || echo "WARNING: Database migrations failed"
        else
            echo "WARNING: Skipping migrations (no .env.production)"
        fi
        
        echo "Server setup completed"
ENDSSH
    
    print_success "Server setup completed"
}

# Start/restart application
start_application() {
    print_status "Starting application on server..."
    
    ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
        set -e
        cd /var/www/rwanda-drone-platform
        
        # Check if PM2 is installed
        if command -v pm2 &> /dev/null; then
            echo "Using PM2 to manage application..."
            
            # Stop existing process if running
            pm2 stop ${APP_NAME} 2>/dev/null || true
            pm2 delete ${APP_NAME} 2>/dev/null || true
            
            # Start application
            pm2 start pnpm --name "${APP_NAME}" -- start
            pm2 save
            
            echo "Application started with PM2"
            pm2 status
        else
            echo "WARNING: PM2 is not installed"
            echo "Install PM2 with: npm install -g pm2"
            echo "Or use systemd to manage the application"
            echo ""
            echo "To start manually, run: npm start"
        fi
ENDSSH
    
    print_success "Application management completed"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if application is responding
    sleep 3  # Wait a bit for app to start
    
    if curl -f http://${SERVER_HOST}:3000/api/health &> /dev/null; then
        print_success "Application is responding on port 3000"
    else
        print_warning "Application health check failed. Check logs on server."
    fi
    
    # Check PM2 status
    ssh ${SERVER_USER}@${SERVER_HOST} "pm2 status" 2>/dev/null || print_warning "PM2 status check failed"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "Rwanda Drone Community Platform"
    echo "Deployment to ${SERVER_USER}@${SERVER_HOST}"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_prerequisites
    echo ""
    
    # Ask for confirmation
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    echo ""
    
    # Build locally (optional, can skip)
    read -p "Build application locally first? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_locally
        echo ""
    fi
    
    # Deploy files
    deploy_files
    echo ""
    
    # Setup server
    setup_server
    echo ""
    
    # Start application
    read -p "Start/restart application? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_application
        echo ""
        
        # Verify
        verify_deployment
    fi
    
    echo ""
    print_success "Deployment process completed!"
    echo ""
    echo "Next steps:"
    echo "1. SSH into server: ssh ${SERVER_USER}@${SERVER_HOST}"
    echo "2. Check application logs: pm2 logs ${APP_NAME}"
    echo "3. Verify .env.production is configured correctly"
    echo "4. Test the application: curl http://${SERVER_HOST}:3000/api/health"
    echo ""
}

# Run main function
main "$@"
