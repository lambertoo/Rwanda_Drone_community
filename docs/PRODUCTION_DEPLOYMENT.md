# Production Deployment Guide

## Overview
This guide covers deploying the Rwanda Drone Community Platform to a production server without Docker.

## Prerequisites
- Server with Node.js 18+ installed
- PostgreSQL 15+ installed and running
- Domain name (optional but recommended)
- SSL certificate (optional but recommended for HTTPS)
- Process manager like PM2 or systemd (recommended)

## Files Required for Production
Copy these files to your production server:
- All source code files
- `package.json` and `pnpm-lock.yaml` (or `package-lock.json`)
- `prisma/schema.prisma` - Database schema
- `scripts/deploy-production-server.sh` - Production deployment script
- `scripts/rebuild-production.sh` - Production rebuild script
- `production.env.template` - Environment variables template

## Quick Start

### 1. Prepare Environment
```bash
# Copy environment template
cp production.env.template .env.production

# Edit with your values
nano .env.production
```

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://postgres:password@localhost:5432/rwanda_drone_community`)
- `NEXTAUTH_SECRET`: Random 32+ character string
- `NEXTAUTH_URL`: Your domain (e.g., https://yourdomain.com)
- `CORS_ORIGIN`: Your domain for CORS
- `NODE_ENV`: Set to `production`
- `PORT`: Port number (default: 3000)

### 2. Setup Database
```bash
# Create database (if not exists)
createdb rwanda_drone_community

# Or using psql
psql -U postgres -c "CREATE DATABASE rwanda_drone_community;"
```

### 3. Deploy
```bash
# Make script executable
chmod +x scripts/deploy-production-server.sh

# Run deployment
./scripts/deploy-production-server.sh
```

### 4. Start Application with Process Manager

#### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "rwanda-drone-platform" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### Using systemd
Create a service file at `/etc/systemd/system/rwanda-drone-platform.service`:
```ini
[Unit]
Description=Rwanda Drone Community Platform
After=network.target postgresql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/your/app
Environment=NODE_ENV=production
EnvironmentFile=/path/to/your/app/.env.production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable rwanda-drone-platform
sudo systemctl start rwanda-drone-platform
```

### 5. Verify Deployment
```bash
# Check application status (PM2)
pm2 status

# View logs (PM2)
pm2 logs rwanda-drone-platform

# Or check systemd status
sudo systemctl status rwanda-drone-platform

# Test health endpoint
curl http://localhost:3000/api/health
```

## Production Features

### Application
- Next.js production build
- Automatic restart on failure (with process manager)
- Upload directory persistence
- Environment-based configuration

### Database
- PostgreSQL with persistent storage
- Connection pooling (via Prisma)
- Automatic migrations on deployment

## Monitoring & Maintenance

### View Logs
```bash
# PM2
pm2 logs rwanda-drone-platform
pm2 logs rwanda-drone-platform --lines 100

# systemd
sudo journalctl -u rwanda-drone-platform -f
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild application
./scripts/rebuild-production.sh

# Restart application (PM2)
pm2 restart rwanda-drone-platform

# Or restart systemd service
sudo systemctl restart rwanda-drone-platform
```

### Database Backup
```bash
# Create backup
pg_dump -U postgres rwanda_drone_community > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U postgres rwanda_drone_community < backup.sql
```

### Database Migrations
```bash
# Run migrations manually if needed
npx prisma migrate deploy

# Or generate new migration
npx prisma migrate dev --name migration_name
```

## Reverse Proxy Setup (Nginx)

For production, it's recommended to use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS (if SSL configured)
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
    }
}
```

## Security Considerations

### Environment Variables
- Use strong, unique passwords
- Generate secure NEXTAUTH_SECRET
- Never commit .env.production to version control
- Restrict file permissions: `chmod 600 .env.production`

### Network Security
- Configure firewall to only allow necessary ports
- Use VPN for database access if needed
- Consider using environment variable management tools

### SSL/TLS
- Obtain SSL certificate (Let's Encrypt recommended)
- Update Nginx configuration for HTTPS
- Redirect HTTP to HTTPS
- Configure HSTS headers

### Process Security
- Run application as non-root user
- Use process manager for automatic restarts
- Monitor application logs for security events

## Troubleshooting

### Common Issues

**Build Fails:**
- Check Node.js version (18+ required)
- Verify all required files are present
- Check environment variable syntax
- Ensure sufficient disk space

**App Won't Start:**
- Check database connection
- Verify environment variables
- Check application logs
- Ensure port is not in use

**Database Connection Issues:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check DATABASE_URL format
- Ensure database exists and user has permissions
- Test connection: `psql $DATABASE_URL -c "SELECT 1;"`

### Debug Commands
```bash
# Check application status
pm2 status
# or
sudo systemctl status rwanda-drone-platform

# View detailed logs
pm2 logs rwanda-drone-platform --lines 200
# or
sudo journalctl -u rwanda-drone-platform -n 200

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check port usage
netstat -tulpn | grep :3000
# or
lsof -i :3000
```

## Performance Optimization

### Application
- Monitor memory usage
- Use PM2 cluster mode for multiple instances: `pm2 start npm --name "app" -i max -- start`
- Enable gzip compression in Nginx
- Use CDN for static assets

### Database
- Monitor query performance
- Add database indexes as needed
- Configure connection pooling in Prisma
- Regular database maintenance (VACUUM, ANALYZE)

## Support
For deployment issues, check:
1. Application logs
2. Environment variables
3. Database connectivity
4. Resource availability (CPU, RAM, disk)
5. Network connectivity
