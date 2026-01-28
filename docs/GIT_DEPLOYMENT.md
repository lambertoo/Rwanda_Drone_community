# Git-Based Deployment Guide

This guide covers deploying the Rwanda Drone Community Platform using Git (push/pull workflow).

## Prerequisites

- Git repository set up (local and remote)
- SSH access to server: `deploy@172.239.238.32`
- Node.js 20.20.0+ installed on server
- PostgreSQL installed and running on server

## Deployment Workflow

### 1. Local Development

```bash
# Make your changes locally
git add .
git commit -m "Your commit message"
git push origin main  # or your branch name
```

### 2. Server Setup (First Time Only)

SSH into your server:

```bash
ssh deploy@172.239.238.32
```

On the server:

```bash
# Navigate to your application directory
cd /var/www/rwanda-drone-platform  # or your app directory

# Clone the repository (if not already cloned)
git clone <your-repository-url> .

# Or if already cloned, just pull
git pull origin main
```

### 3. Run Server Setup Script

After pulling the latest code, run the setup script:

```bash
# Make script executable (if not already)
chmod +x scripts/server-setup.sh

# Run the setup script
./scripts/server-setup.sh
```

The script will:
- ✅ Check Node.js version
- ✅ Install dependencies
- ✅ Generate Prisma client
- ✅ Build the application
- ✅ Run database migrations
- ✅ Setup PM2 process manager
- ✅ Start the application

### 4. Regular Updates (After Initial Setup)

For subsequent deployments:

```bash
# SSH into server
ssh deploy@172.239.238.32

# Navigate to app directory
cd /var/www/rwanda-drone-platform

# Pull latest changes
git pull origin main

# Run rebuild script
./scripts/rebuild-production.sh

# Restart application
pm2 restart rwanda-drone-platform
```

## Quick Update Script

You can also create a simple update script on the server:

```bash
# Create update script
cat > /var/www/rwanda-drone-platform/update.sh << 'EOF'
#!/bin/bash
set -e
cd /var/www/rwanda-drone-platform
git pull origin main
./scripts/rebuild-production.sh
pm2 restart rwanda-drone-platform
echo "Update completed!"
EOF

chmod +x /var/www/rwanda-drone-platform/update.sh
```

Then for future updates, just run:

```bash
ssh deploy@172.239.238.32 './update.sh'
```

## Environment Configuration

### First Time Setup

1. **Create `.env.production` on server:**

```bash
# On server
cd /var/www/rwanda-drone-platform
cp production.env.template .env.production
nano .env.production  # Edit with your values
chmod 600 .env.production
```

2. **Required Environment Variables:**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rwanda_drone_community
NEXTAUTH_SECRET=your_very_long_random_secret_key_here_minimum_32_characters
NEXTAUTH_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
NODE_ENV=production
PORT=3000
```

### Generate NEXTAUTH_SECRET

```bash
# On server or locally
openssl rand -base64 32
```

## Database Setup

### Create Database (if not exists)

```bash
# On server
sudo -u postgres psql

# In PostgreSQL:
CREATE DATABASE rwanda_drone_community;
CREATE USER your_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE rwanda_drone_community TO your_user;
\q
```

### Run Migrations

```bash
# On server
cd /var/www/rwanda-drone-platform
export $(cat .env.production | grep -v '^#' | xargs)
npx prisma migrate deploy
```

## Process Management with PM2

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs rwanda-drone-platform

# Restart
pm2 restart rwanda-drone-platform

# Stop
pm2 stop rwanda-drone-platform

# Start
pm2 start rwanda-drone-platform

# Monitor
pm2 monit
```

### Setup PM2 to Start on Boot

```bash
# Generate startup script
pm2 startup

# Follow the instructions shown (usually requires sudo)
# Then save current PM2 processes
pm2 save
```

## Troubleshooting

### Git Pull Fails

```bash
# If you have local changes, stash them first
git stash
git pull origin main
git stash pop
```

### Build Fails

```bash
# Clear node_modules and rebuild
rm -rf node_modules .next
npm install
npm run build
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check PostgreSQL is running
sudo systemctl status postgresql

# Check .env.production has correct DATABASE_URL
cat .env.production | grep DATABASE_URL
```

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs rwanda-drone-platform --lines 100

# Check if port is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart rwanda-drone-platform
```

## Security Checklist

Before deploying, ensure:

- [x] `.env.production` has restricted permissions (600)
- [x] Strong passwords and secrets are used
- [x] Database user has minimal required permissions
- [x] Application runs as non-root user (recommended)
- [x] Firewall is configured
- [x] SSL/TLS certificates are set up
- [x] Security vulnerabilities are addressed (see SECURITY_VULNERABILITIES.md)

## Automated Deployment (Optional)

You can set up a Git hook for automatic deployment:

### Server-Side Git Hook

```bash
# On server, create post-receive hook
mkdir -p /var/www/rwanda-drone-platform.git/hooks
cat > /var/www/rwanda-drone-platform.git/hooks/post-receive << 'EOF'
#!/bin/bash
cd /var/www/rwanda-drone-platform
git --git-dir=/var/www/rwanda-drone-platform.git --work-tree=/var/www/rwanda-drone-platform checkout -f
./scripts/rebuild-production.sh
pm2 restart rwanda-drone-platform
EOF

chmod +x /var/www/rwanda-drone-platform.git/hooks/post-receive
```

### Local Git Remote

```bash
# Add server as remote
git remote add production deploy@172.239.238.32:/var/www/rwanda-drone-platform.git

# Push to production
git push production main
```

## File Structure on Server

```
/var/www/rwanda-drone-platform/
├── .env.production          # Environment variables (chmod 600)
├── .git/                   # Git repository
├── app/                    # Application code
├── components/             # React components
├── lib/                    # Utilities and libraries
├── public/                 # Static files
│   └── uploads/           # User uploads
├── scripts/                # Deployment scripts
├── node_modules/          # Dependencies
├── .next/                 # Next.js build output
└── package.json           # Dependencies
```

## Monitoring

### Check Application Health

```bash
# Health endpoint
curl http://localhost:3000/api/health

# Or from remote
curl http://172.239.238.32:3000/api/health
```

### Monitor Resources

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
df -h  # Disk space
```

## Backup Strategy

### Database Backup

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/rwanda-drone"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cd /var/www/rwanda-drone-platform
export $(cat .env.production | grep -v '^#' | xargs)
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

## Quick Reference

```bash
# Full deployment workflow
git add . && git commit -m "Update" && git push origin main
ssh deploy@172.239.238.32 "cd /var/www/rwanda-drone-platform && git pull && ./scripts/rebuild-production.sh && pm2 restart rwanda-drone-platform"

# Quick update (if update.sh exists)
ssh deploy@172.239.238.32 './update.sh'

# Check status
ssh deploy@172.239.238.32 "pm2 status && pm2 logs rwanda-drone-platform --lines 20"
```

---

**Last Updated:** January 28, 2026
