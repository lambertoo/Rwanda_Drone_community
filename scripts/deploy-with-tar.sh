#!/bin/bash

# Deployment using tar and scp (no rsync required)
set -e

SERVER_USER="deploy"
SERVER_HOST="172.239.238.32"
SERVER_PATH="/var/www/rwanda-drone-platform"
APP_NAME="rwanda-drone-platform"
TEMP_DIR="/tmp/rwanda-deploy-$$"

echo "🚀 Deploying to ${SERVER_USER}@${SERVER_HOST}..."

# Step 1: Create deployment package
echo "📦 Creating deployment package..."
mkdir -p "${TEMP_DIR}"

# Copy files excluding node_modules, .next, etc.
cd "/Users/lambertrulindana/Documents/my projects/rwanda_drone_community_platform/Rwanda_Drone_community"
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.env*' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='.git' \
    --exclude='.deployignore' \
    --exclude='dev.db' \
    -czf "${TEMP_DIR}/deploy.tar.gz" .

# Step 2: Transfer to server
echo "📤 Transferring files to server..."
scp "${TEMP_DIR}/deploy.tar.gz" ${SERVER_USER}@${SERVER_HOST}:/tmp/

# Step 3: Extract and setup on server
echo "🔧 Setting up on server..."
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    set -e
    cd /var/www
    
    # Create directory if it doesn't exist
    mkdir -p ${SERVER_PATH}
    cd ${SERVER_PATH}
    
    # Backup existing if it exists
    if [ -d ".next" ]; then
        echo "Backing up existing .next directory..."
        mv .next .next.backup.\$(date +%s) 2>/dev/null || true
    fi
    
    # Extract new files
    echo "Extracting deployment package..."
    tar -xzf /tmp/deploy.tar.gz -C ${SERVER_PATH}
    rm /tmp/deploy.tar.gz
    
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
    
    # Run migrations (if .env.production exists)
    if [ -f .env.production ]; then
        echo "Running database migrations..."
        export \$(cat .env.production | grep -v '^#' | xargs)
        npx prisma migrate deploy || echo "Migration warning (may need manual intervention)"
    else
        echo "⚠️  WARNING: .env.production not found. Please create it before starting the app."
    fi
    
    # Restart with PM2
    if command -v pm2 &> /dev/null; then
        echo "Restarting with PM2..."
        pm2 stop ${APP_NAME} 2>/dev/null || true
        pm2 delete ${APP_NAME} 2>/dev/null || true
        pm2 start npm --name "${APP_NAME}" -- start
        pm2 save
        echo ""
        echo "PM2 Status:"
        pm2 status
    else
        echo "⚠️  PM2 not found. Install with: npm install -g pm2"
        echo "Or start manually with: npm start"
    fi
    
    # Cleanup old backups (keep last 3)
    echo "Cleaning up old backups..."
    ls -dt .next.backup.* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true
ENDSSH

# Cleanup local temp
rm -rf "${TEMP_DIR}"

echo ""
echo "✅ Deployment completed!"
echo ""
echo "Next steps:"
echo "1. Check status: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 status'"
echo "2. View logs: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs ${APP_NAME}'"
echo "3. Test health: ssh ${SERVER_USER}@${SERVER_HOST} 'curl http://localhost:3000/api/health'"
echo "4. Ensure .env.production is configured on the server"
