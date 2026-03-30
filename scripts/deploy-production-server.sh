#!/bin/bash

echo "🚀 Deploying Rwanda UAS Community Platform to Production Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first."
    echo "   Install pnpm: curl -fsSL https://get.pnpm.io/install.sh | sh -"
    exit 1
fi
PACKAGE_MANAGER="pnpm"
echo "✅ Using pnpm $(pnpm --version)"

# Check if production environment file exists
if [ ! -f .env.production ]; then
    echo "📝 Creating production environment file..."
    cat > .env.production << EOF
# Production Environment Variables
DB_PASSWORD=your_secure_database_password_here
DATABASE_URL=postgresql://postgres:your_secure_database_password_here@localhost:5432/rwanda_drone_community
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
    echo "   - Update DATABASE_URL with your PostgreSQL connection string"
    echo "   - Update NEXTAUTH_SECRET with a random 32+ character string"
    echo "   - Update NEXTAUTH_URL with your actual domain"
    echo "   - Update CORS_ORIGIN with your actual domain"
    echo ""
    echo "Press Enter when you've updated the values..."
    read
fi

# Check if PostgreSQL is accessible
echo "🔍 Checking database connection..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql not found. Please ensure PostgreSQL is installed and accessible."
    echo "   You can test the connection manually with: psql \$DATABASE_URL"
else
    # Try to connect to database
    if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Database connection successful"
    else
        echo "⚠️  Could not connect to database. Please check your DATABASE_URL in .env.production"
        echo "   Continuing with deployment, but database migrations may fail..."
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
$PACKAGE_MANAGER install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
$PACKAGE_MANAGER run db:generate

# Build the application
echo "🔨 Building application..."
$PACKAGE_MANAGER run build

# Run database migrations
echo "🗄️  Running database migrations..."
if command -v psql &> /dev/null && psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    pnpm exec prisma migrate deploy
    echo "✅ Database migrations completed"
else
    echo "⚠️  Skipping database migrations. Please run manually: pnpm exec prisma migrate deploy"
fi

# Check if build was successful
if [ -d ".next" ]; then
    echo "✅ Production deployment successful!"
    echo ""
    echo "🌐 To start the application, run:"
    echo "   $PACKAGE_MANAGER run start"
    echo ""
    echo "🔧 Production Commands:"
    echo "   Start: $PACKAGE_MANAGER run start"
    echo "   View logs: Check your process manager logs (PM2, systemd, etc.)"
    echo "   Restart: Restart your process manager service"
    echo "   Update: ./scripts/deploy-production-server.sh"
    echo ""
    echo "💡 Recommended: Use PM2 or systemd to manage the application process"
    echo "   PM2: pm2 start pnpm --name 'rwanda-drone-platform' -- start"
    echo "   Or use: pm2 start ecosystem.config.js (if configured)"
    echo ""
    echo "🎉 Your Rwanda UAS Community Platform is ready for production!"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
