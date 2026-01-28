#!/bin/bash

# Deployment script using scp (no rsync required)
# Deploys to: deploy@172.239.238.32

set -e

SERVER_USER="deploy"
SERVER_HOST="172.239.238.32"
SERVER_PATH="/var/www/rwanda-drone-platform"
APP_NAME="rwanda-drone-platform"

echo "🚀 Deploying to ${SERVER_USER}@${SERVER_HOST}..."

# Step 1: Create a temporary archive
echo "📦 Creating deployment archive..."
TEMP_ARCHIVE="/tmp/rwanda-drone-deploy-$(date +%s).tar.gz"

# Create archive excluding unnecessary files
tar -czf "$TEMP_ARCHIVE" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.env*' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='.git' \
    --exclude='.gitignore' \
    --exclude='dev.db' \
    --exclude='prisma/dev.db' \
    .

echo "✅ Archive created: $TEMP_ARCHIVE"

# Step 2: Transfer archive to server
echo "📤 Transferring files to server..."
scp "$TEMP_ARCHIVE" ${SERVER_USER}@${SERVER_HOST}:/tmp/

# Step 3: Extract and setup on server
echo "🔧 Setting up on server..."
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    set -e
    cd /var/www
    
    # Create directory if it doesn't exist
    mkdir -p ${SERVER_PATH}
    cd ${SERVER_PATH}
    
    # Backup existing .env.production if it exists
    if [ -f .env.production ]; then
        echo "Backing up existing .env.production..."
        cp .env.production .env.production.backup.$(date +%s)
    fi
    
    # Extract archive
    echo "Extracting files..."
    tar -xzf /tmp/$(basename $TEMP_ARCHIVE) -C ${SERVER_PATH}/
    
    # Clean up archive
    rm -f /tmp/$(basename $TEMP_ARCHIVE)
    
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
    
    # Build application
    echo "Building application..."
    npm run build
    
    # Run migrations if .env.production exists
    if [ -f .env.production ]; then
        echo "Running database migrations..."
        export \$(cat .env.production | grep -v '^#' | xargs)
        npx prisma migrate deploy || echo "⚠️  Migration warning (may need manual intervention)"
    else
        echo "⚠️  WARNING: .env.production not found!"
        echo "   Please create it from production.env.template"
    fi
    
    # Restart with PM2
    if command -v pm2 &> /dev/null; then
        echo "Managing application with PM2..."
        pm2 stop ${APP_NAME} 2>/dev/null || true
        pm2 delete ${APP_NAME} 2>/dev/null || true
        pm2 start npm --name "${APP_NAME}" -- start
        pm2 save
        echo ""
        pm2 status
    else
        echo "⚠️  PM2 not found. Install with: npm install -g pm2"
        echo "   Or start manually with: npm start"
    fi
    
    echo "✅ Server setup completed"
ENDSSH

# Clean up local archive
rm -f "$TEMP_ARCHIVE"

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "   SSH: ssh ${SERVER_USER}@${SERVER_HOST}"
echo "   Check status: pm2 status"
echo "   View logs: pm2 logs ${APP_NAME}"
echo "   Test: curl http://${SERVER_HOST}:3000/api/health"
