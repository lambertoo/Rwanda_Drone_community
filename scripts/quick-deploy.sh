#!/bin/bash

# Quick deployment script (non-interactive)
# Usage: ./scripts/quick-deploy.sh

set -e

SERVER_USER="deploy"
SERVER_HOST="172.239.238.32"
SERVER_PATH="/var/www/rwanda-drone-platform"
APP_NAME="rwanda-drone-platform"

echo "🚀 Deploying to ${SERVER_USER}@${SERVER_HOST}..."

# Step 1: Sync files
echo "📦 Syncing files..."
rsync -avz \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.env*' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='.git' \
    --exclude='.deployignore' \
    ./ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# Step 2: Setup on server
echo "🔧 Setting up on server..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
    set -e
    cd /var/www/rwanda-drone-platform
    
    # Install dependencies
    echo "Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install --production
    else
        npm install --production
    fi
    
    # Generate Prisma client
    echo "Generating Prisma client..."
    npm run db:generate
    
    # Build
    echo "Building application..."
    npm run build
    
    # Migrations (if .env.production exists)
    if [ -f .env.production ]; then
        echo "Running migrations..."
        export $(cat .env.production | grep -v '^#' | xargs)
        npx prisma migrate deploy || echo "Migration warning (may need manual intervention)"
    fi
    
    # Restart with PM2
    if command -v pm2 &> /dev/null; then
        echo "Restarting with PM2..."
        pm2 stop ${APP_NAME} 2>/dev/null || true
        pm2 delete ${APP_NAME} 2>/dev/null || true
        pm2 start npm --name "${APP_NAME}" -- start
        pm2 save
        pm2 status
    else
        echo "PM2 not found. Install with: npm install -g pm2"
    fi
ENDSSH

echo "✅ Deployment completed!"
echo ""
echo "Check status: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 status'"
echo "View logs: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs ${APP_NAME}'"
