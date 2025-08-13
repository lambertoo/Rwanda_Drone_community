#!/bin/bash

# Rwanda Drone Community Platform - Complete Production Installation Script
# This script automatically sets up the entire production environment on a server

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate random string
generate_random_string() {
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
}

# Function to get user input with default
get_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\${input:-$default}"
    else
        read -p "$prompt: " input
        eval "$var_name=\$input"
    fi
}

# Function to check system requirements
check_system_requirements() {
    print_status "Checking system requirements..."
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_success "OS: Linux detected"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_success "OS: macOS detected"
    else
        print_warning "OS: $OSTYPE detected (may not be fully supported)"
    fi
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root - this is not recommended for production"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Please run as a non-root user with sudo privileges"
            exit 1
        fi
    fi
    
    # Check available memory
    local mem_total=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    if [ "$mem_total" -lt 2 ]; then
        print_warning "Low memory detected: ${mem_total}GB (recommended: 2GB+)"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Insufficient memory for production deployment"
            exit 1
        fi
    else
        print_success "Memory: ${mem_total}GB available"
    fi
    
    # Check available disk space
    local disk_free=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
    if [ "$disk_free" -lt 10 ]; then
        print_warning "Low disk space detected: ${disk_free}GB (recommended: 10GB+)"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Insufficient disk space for production deployment"
            exit 1
        fi
    else
        print_success "Disk space: ${disk_free}GB available"
    fi
}

# Function to install Docker
install_docker() {
    print_status "Installing Docker..."
    
    if command_exists docker; then
        print_success "Docker is already installed"
        docker --version
        return 0
    fi
    
    print_status "Installing Docker..."
    
    # Install Docker based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux installation
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        
        print_success "Docker installed successfully"
        print_warning "You may need to log out and back in for group changes to take effect"
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS installation
        if command_exists brew; then
            brew install --cask docker
        else
            print_error "Homebrew not found. Please install Docker Desktop manually from https://www.docker.com/products/docker-desktop"
            exit 1
        fi
    else
        print_error "Unsupported OS for automatic Docker installation"
        print_status "Please install Docker manually from https://www.docker.com/get-started"
        exit 1
    fi
}

# Function to install Docker Compose
install_docker_compose() {
    print_status "Installing Docker Compose..."
    
    if command_exists docker-compose; then
        print_success "Docker Compose is already installed"
        docker-compose --version
        return 0
    fi
    
    print_status "Installing Docker Compose..."
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose installed successfully"
}

# Function to create project directory
create_project_directory() {
    print_status "Setting up project directory..."
    
    # Get project directory
    get_input "Enter project directory path" "/opt/rwanda-drone-platform" "PROJECT_DIR"
    
    # Create directory
    sudo mkdir -p "$PROJECT_DIR"
    sudo chown $USER:$USER "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    
    print_success "Project directory created: $PROJECT_DIR"
}

# Function to download project files
download_project_files() {
    print_status "Downloading project files..."
    
    # Create necessary directories
    mkdir -p nginx
    
    # Create Dockerfile.prod
    cat > Dockerfile.prod << 'EOF'
# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Install build dependencies and essential packages
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    libc6-compat \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm globally and verify installation
RUN npm install -g pnpm && \
    pnpm --version

# Install all dependencies
RUN pnpm install --frozen-lockfile --prefer-offline

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p public/uploads

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
EOF

    # Create docker-compose.prod.yml
    cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: rwanda_drone_app_prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/rwanda_drone_community
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - app_uploads:/app/public/uploads
      - app_data:/app/data
    networks:
      - drone_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:15-alpine
    container_name: rwanda_drone_db_prod
    restart: unless-stopped
    environment:
      - POSTGRES_DB=rwanda_drone_community
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - drone_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d rwanda_drone_community"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    container_name: rwanda_drone_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - app_uploads:/var/www/uploads:ro
    depends_on:
      - app
    networks:
      - drone_network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local
  app_uploads:
    driver: local
  app_data:
    driver: local

networks:
  drone_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

    # Create nginx configuration
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=2r/s;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Upstream for Next.js app
    upstream app {
        server app:3000;
    }

    # Main server block
    server {
        listen 80;
        server_name _;
        root /var/www/html;
        index index.html;

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Upload files
        location /uploads/ {
            alias /var/www/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
            
            # Rate limiting for uploads
            limit_req zone=upload burst=5 nodelay;
        }

        # API endpoints with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }

        # Next.js app
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }

        # Error pages
        error_page 404 /404.html;
        error_page 500 502 503 504 /50x.html;
    }
}
EOF

    print_success "Project files created successfully"
}

# Function to setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Get domain
    get_input "Enter your domain (or press Enter for localhost)" "localhost" "DOMAIN"
    
    # Generate secure password
    DB_PASSWORD=$(generate_random_string)
    
    # Generate secure secret
    NEXTAUTH_SECRET=$(generate_random_string)
    
    # Create .env.production
    cat > .env.production << EOF
# Production Environment Variables
DB_PASSWORD=$DB_PASSWORD
DATABASE_URL=postgresql://postgres:$DB_PASSWORD@db:5432/rwanda_drone_community
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=http://$DOMAIN
NODE_ENV=production
PORT=3000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=public/uploads
CORS_ORIGIN=http://$DOMAIN
EOF

    print_success "Environment variables configured"
    print_warning "Database password: $DB_PASSWORD"
    print_warning "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
    print_warning "Please save these credentials securely!"
}

# Function to download application source
download_application_source() {
    print_status "Checking application source code..."
    
    # Check if we're already in a git repository
    if [ -d ".git" ]; then
        print_success "Git repository already exists - using existing code"
        
        # Check if we need to pull latest changes
        read -p "Pull latest changes from remote? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Pulling latest changes..."
            git pull
        else
            print_status "Using existing code without pulling"
        fi
        
        return 0
    fi
    
    # Only ask for repository URL if no git repo exists
    get_input "Enter your Git repository URL (or press Enter to skip if code is already present)" "" "REPO_URL"
    
    if [ -n "$REPO_URL" ]; then
        print_status "Cloning repository..."
        git clone "$REPO_URL" .
    else
        print_status "Skipping repository clone - using existing code"
    fi
    
    print_success "Application source code ready"
}

# Function to build and deploy
build_and_deploy() {
    print_status "Building and deploying application..."
    
    # Stop any existing containers
    docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
    
    # Build and start containers
    docker-compose -f docker-compose.prod.yml --env-file .env.production up --build -d
    
    print_success "Application deployed successfully"
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
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
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
    
    # Wait for nginx
    print_status "Waiting for nginx..."
    local nginx_ready=false
    local attempts=0
    while [ "$nginx_ready" = false ] && [ $attempts -lt 30 ]; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            nginx_ready=true
            print_success "Nginx is ready"
        else
            attempts=$((attempts + 1))
            print_status "Waiting for nginx... (attempt $attempts/30)"
            sleep 2
        fi
    done
    
    if [ "$nginx_ready" = false ]; then
        print_error "Nginx failed to start within 60 seconds"
        exit 1
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait a bit more for app to be fully ready
    sleep 10
    
    # Run migrations
    if docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy; then
        print_success "Database migrations completed"
    else
        print_warning "Database migrations failed - this may be normal for new installations"
    fi
}

# Function to display final information
display_final_info() {
    print_success "🎉 Installation completed successfully!"
    echo
    echo "📋 Service Information:"
    echo "   🌐 Application URL: http://$DOMAIN"
    echo "   🌐 Nginx URL: http://localhost"
    echo "   🗄️  Database: localhost:5432"
    echo "   📁 Project Directory: $PROJECT_DIR"
    echo
    echo "🔑 Credentials (save these securely!):"
    echo "   Database Password: $DB_PASSWORD"
    echo "   NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
    echo
    echo "🔧 Management Commands:"
    echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   Stop services: docker-compose -f docker-compose.prod.yml down"
    echo "   Start services: docker-compose -f docker-compose.prod.yml up -d"
    echo "   Restart services: docker-compose -f docker-compose.prod.yml restart"
    echo "   Update application: git pull && docker-compose -f docker-compose.prod.yml up --build -d"
    echo
    echo "📊 Monitoring:"
    echo "   Container status: docker-compose -f docker-compose.prod.yml ps"
    echo "   Resource usage: docker stats"
    echo "   Health check: curl http://localhost/health"
    echo
    echo "⚠️  Next Steps:"
    echo "   1. Configure your domain DNS to point to this server"
    echo "   2. Set up SSL certificate (recommended)"
    echo "   3. Configure firewall rules"
    echo "   4. Set up monitoring and backups"
    echo
    print_success "Your Rwanda Drone Community Platform is now live! 🚀"
}

# Main installation function
main() {
    echo "🚀 Rwanda Drone Community Platform - Production Installation"
    echo "=========================================================="
    echo
    echo "This script will set up your production environment."
    echo "If you already have the app code, it will use your existing files."
    echo
    
    # Check system requirements
    check_system_requirements
    
    # Install Docker
    install_docker
    
    # Install Docker Compose
    install_docker_compose
    
    # Create project directory
    create_project_directory
    
    # Download project files
    download_project_files
    
    # Setup environment variables
    setup_environment
    
    # Check application source
    download_application_source
    
    # Build and deploy
    build_and_deploy
    
    # Wait for services
    wait_for_services
    
    # Run migrations
    run_migrations
    
    # Display final information
    display_final_info
}

# Run main function
main "$@" 