# Production Deployment Guide

## Overview
This guide covers deploying the Rwanda Drone Community Platform to a production server using Docker.

## Prerequisites
- Server with Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (optional but recommended for HTTPS)

## Files Required for Production
Copy these files to your production server:
- `docker-compose.prod.yml` - Production Docker Compose configuration
- `Dockerfile.prod` - Production Docker image definition
- `nginx/nginx.conf` - Nginx reverse proxy configuration
- `deploy-production-server.sh` - Production deployment script
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
- `DB_PASSWORD`: Secure database password
- `NEXTAUTH_SECRET`: Random 32+ character string
- `NEXTAUTH_URL`: Your domain (e.g., https://yourdomain.com)
- `CORS_ORIGIN`: Your domain for CORS

### 2. Deploy
```bash
# Make script executable
chmod +x deploy-production-server.sh

# Run deployment
./deploy-production-server.sh
```

### 3. Verify Deployment
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Test health endpoint
curl http://localhost/health
```

## Production Features

### Nginx Reverse Proxy
- Serves on ports 80 (HTTP) and 443 (HTTPS)
- Rate limiting for API endpoints
- Gzip compression
- Security headers
- Static file serving for uploads

### Database
- PostgreSQL 15 with persistent storage
- Health checks
- Automatic restart on failure

### Application
- Next.js production build
- Health checks
- Automatic restart on failure
- Upload directory persistence

## Monitoring & Maintenance

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f app
```

### Update Application
```bash
# Pull latest code and rebuild
git pull
docker-compose -f docker-compose.prod.yml up --build -d
```

### Database Backup
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres rwanda_drone_community > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres rwanda_drone_community < backup.sql
```

### Scale Services
```bash
# Scale app instances
docker-compose -f docker-compose.prod.yml up -d --scale app=3
```

## Security Considerations

### Environment Variables
- Use strong, unique passwords
- Generate secure NEXTAUTH_SECRET
- Never commit .env.production to version control

### Network Security
- Configure firewall to only allow necessary ports
- Use VPN for database access if needed
- Consider using Docker secrets for sensitive data

### SSL/TLS
- Obtain SSL certificate (Let's Encrypt recommended)
- Update nginx configuration for HTTPS
- Redirect HTTP to HTTPS

## Troubleshooting

### Common Issues

**Build Fails:**
- Check Docker has enough memory/disk space
- Verify all required files are present
- Check environment variable syntax

**App Won't Start:**
- Check database connection
- Verify environment variables
- Check container logs

**Database Connection Issues:**
- Verify database container is running
- Check DATABASE_URL format
- Ensure database is healthy

### Debug Commands
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# View detailed logs
docker-compose -f docker-compose.prod.yml logs app

# Access container shell
docker-compose -f docker-compose.prod.yml exec app sh

# Check resource usage
docker stats
```

## Performance Optimization

### Nginx
- Enable gzip compression
- Configure caching headers
- Use rate limiting appropriately

### Database
- Monitor query performance
- Add database indexes as needed
- Consider connection pooling

### Application
- Monitor memory usage
- Scale horizontally if needed
- Use CDN for static assets

## Support
For deployment issues, check:
1. Container logs
2. Environment variables
3. Network connectivity
4. Resource availability 