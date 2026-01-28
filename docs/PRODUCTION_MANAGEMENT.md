# Production Management Guide

## 🚀 **Production Management Scripts**

### 1. **`scripts/deploy-production-server.sh`** - Initial Deployment
**Use this script** when setting up production for the first time or after major changes.

**What it does:**
- ✅ Checks Node.js and PostgreSQL prerequisites
- ✅ Creates/updates production environment file
- ✅ Installs dependencies
- ✅ Generates Prisma client
- ✅ Builds the application
- ✅ Runs database migrations

**Usage:**
```bash
chmod +x scripts/deploy-production-server.sh
./scripts/deploy-production-server.sh
```

---

### 2. **`scripts/rebuild-production.sh`** - App Updates
**Use this script** whenever you need to rebuild the application (code changes, updates, etc.).

**What it does:**
- 🔨 Rebuilds the application
- 🔄 Runs database migrations
- ⏳ Verifies database connection
- 📊 Shows current status and next steps

**Usage:**
```bash
chmod +x scripts/rebuild-production.sh
./scripts/rebuild-production.sh
```

---

## 🔄 **Typical Workflow for Updates**

```bash
# 1. Pull latest code
git pull

# 2. Rebuild and restart
./scripts/rebuild-production.sh

# 3. Restart application (if using PM2)
pm2 restart rwanda-drone-platform

# Or restart systemd service
sudo systemctl restart rwanda-drone-platform
```

---

## 📋 **Current Production Status**

### Check if everything is running:

**With PM2:**
```bash
pm2 status
pm2 logs rwanda-drone-platform
```

**With systemd:**
```bash
sudo systemctl status rwanda-drone-platform
sudo journalctl -u rwanda-drone-platform -f
```

**Check database:**
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

---

## 🔒 **Security Features**

- ✅ **Environment Variables**: All secrets stored in `.env.production` (not in code)
- ✅ **Database Isolation**: PostgreSQL not exposed externally (bind to localhost)
- ✅ **Process Management**: Application runs as non-root user
- ✅ **Rate Limiting**: API endpoints protected (configured in application)
- ✅ **Security Headers**: XSS protection, CSRF prevention

---

## 🌐 **Access Points**

- **Main Application**: http://localhost:3000 (or your configured PORT)
- **Health Check**: http://localhost:3000/api/health
- **API Endpoints**: http://localhost:3000/api/*

**Note**: In production, use Nginx or another reverse proxy to serve on ports 80/443.

---

## 🚨 **Emergency Commands**

### Stop Application
```bash
# PM2
pm2 stop rwanda-drone-platform

# systemd
sudo systemctl stop rwanda-drone-platform
```

### Start Application
```bash
# PM2
pm2 start rwanda-drone-platform

# systemd
sudo systemctl start rwanda-drone-platform
```

### Restart Application
```bash
# PM2
pm2 restart rwanda-drone-platform

# systemd
sudo systemctl restart rwanda-drone-platform
```

---

## 📞 **Troubleshooting**

**App not responding:**
```bash
# Check status
pm2 status
# or
sudo systemctl status rwanda-drone-platform

# Check logs
pm2 logs rwanda-drone-platform --lines 100
# or
sudo journalctl -u rwanda-drone-platform -n 100

# Rebuild and restart
./scripts/rebuild-production.sh
pm2 restart rwanda-drone-platform
```

**Database issues:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check database logs
sudo journalctl -u postgresql -n 50
```

**Build issues:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
# or
npm install

# Regenerate Prisma client
npx prisma generate

# Rebuild
npm run build
```

---

## 🎯 **Remember**

- **Deploy script**: Use for initial setup and major changes
- **Rebuild script**: Use for all updates and code changes
- **Environment file**: Keep `.env.production` secure (chmod 600)
- **Process manager**: Use PM2 or systemd to manage the application
- **Database backups**: Regular backups are essential
- **Monitoring**: Monitor logs and application health regularly

---

## 📊 **Monitoring Recommendations**

### Application Monitoring
- Use PM2 monitoring: `pm2 monit`
- Set up log rotation
- Monitor memory and CPU usage
- Set up alerts for application crashes

### Database Monitoring
- Monitor database size and growth
- Check connection pool usage
- Monitor slow queries
- Regular VACUUM and ANALYZE

### System Monitoring
- Monitor disk space
- Monitor system resources (CPU, RAM)
- Set up uptime monitoring
- Monitor SSL certificate expiration

Your production environment is now clean and focused! 🎉
