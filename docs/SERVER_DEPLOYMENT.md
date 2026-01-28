# Simple Server Deployment Guide

This guide provides step-by-step instructions for deploying the Rwanda Drone Community Platform to a production server without Docker.

## Prerequisites

Before starting, ensure your server has:
- **Node.js 18+** installed
- **PostgreSQL 15+** installed and running
- **Git** installed
- **Nginx** (optional, for reverse proxy)
- **PM2** (recommended for process management)

## Step 1: Server Setup

### Install Node.js (if not installed)
```bash
# Using NodeSource repository (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Install PostgreSQL (if not installed)
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE rwanda_drone_community;
CREATE USER your_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE rwanda_drone_community TO your_user;
\q
```

### Install pnpm (optional)
```bash
npm install -g pnpm
```

## Step 2: Clone and Setup Application

```bash
# Clone repository
cd /var/www  # or your preferred directory
git clone <your-repository-url> rwanda-drone-platform
cd rwanda-drone-platform

# Install dependencies
pnpm install
# or
npm install
```

## Step 3: Configure Environment

```bash
# Copy production environment template
cp production.env.template .env.production

# Edit environment file
nano .env.production
```

**Required variables to update:**
```env
DATABASE_URL=postgresql://your_user:your_secure_password@localhost:5432/rwanda_drone_community
NEXTAUTH_SECRET=your_very_long_random_secret_key_here_minimum_32_characters
NEXTAUTH_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
NODE_ENV=production
PORT=3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Secure the environment file:**
```bash
chmod 600 .env.production
```

## Step 4: Build and Deploy

```bash
# Make deployment script executable
chmod +x scripts/deploy-production-server.sh

# Run deployment
./scripts/deploy-production-server.sh
```

This script will:
- Check prerequisites
- Install dependencies
- Generate Prisma client
- Build the application
- Run database migrations

## Step 5: Setup Process Manager (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "rwanda-drone-platform" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions shown
```

**PM2 Useful Commands:**
```bash
# View status
pm2 status

# View logs
pm2 logs rwanda-drone-platform

# Restart
pm2 restart rwanda-drone-platform

# Stop
pm2 stop rwanda-drone-platform

# Monitor
pm2 monit
```

## Step 6: Setup Nginx Reverse Proxy (Optional but Recommended)

### Install Nginx
```bash
sudo apt-get install nginx
```

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/rwanda-drone-platform
```

**Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long-running requests
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Increase client body size for file uploads
    client_max_body_size 10M;
}
```

### Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/rwanda-drone-platform /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 7: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will automatically update your Nginx configuration
```

## Step 8: Verify Deployment

```bash
# Check application is running
curl http://localhost:3000/api/health

# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Test from browser
# Visit: https://your-domain.com
```

## Updating the Application

When you need to update the application:

```bash
# 1. Pull latest code
git pull

# 2. Rebuild
./scripts/rebuild-production.sh

# 3. Restart application
pm2 restart rwanda-drone-platform
```

## Database Backups

### Create Backup Script
```bash
nano /usr/local/bin/backup-database.sh
```

**Script content:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/rwanda-drone-platform"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Load environment variables
source /var/www/rwanda-drone-platform/.env.production

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup created: backup_$DATE.sql"
```

```bash
# Make executable
chmod +x /usr/local/bin/backup-database.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-database.sh
```

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs rwanda-drone-platform

# Check environment variables
cat .env.production

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Database connection issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo journalctl -u postgresql -n 50

# Test connection
psql -U your_user -d rwanda_drone_community -c "SELECT 1;"
```

### Port already in use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

### Nginx issues
```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

## Security Checklist

- [ ] Environment file has restricted permissions (600)
- [ ] Application runs as non-root user
- [ ] Firewall configured (only allow ports 80, 443, 22)
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Database user has minimal required permissions
- [ ] Regular backups configured
- [ ] PM2 process manager configured
- [ ] Nginx security headers configured
- [ ] Strong passwords used for all services

## Maintenance

### Regular Tasks
- Monitor application logs: `pm2 logs rwanda-drone-platform`
- Check disk space: `df -h`
- Monitor system resources: `htop` or `top`
- Review database size: `psql $DATABASE_URL -c "\l+"`

### Updates
- Keep Node.js updated
- Keep dependencies updated: `pnpm update` or `npm update`
- Keep PostgreSQL updated
- Monitor security advisories

## Support

For issues or questions:
1. Check application logs
2. Review this deployment guide
3. Check [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for detailed information
4. Review [PRODUCTION_MANAGEMENT.md](./PRODUCTION_MANAGEMENT.md) for management commands

---

**Your application is now deployed and running! 🎉**
