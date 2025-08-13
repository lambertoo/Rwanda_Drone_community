# Production Management Guide

## 🚀 **Two Scripts for Production Management**

### 1. **`install-production.sh`** - Initial Setup
**Use this script ONCE** when setting up production for the first time.

**What it does:**
- ✅ Installs Docker and Docker Compose
- ✅ Creates production environment
- ✅ Sets up database and admin user
- ✅ Deploys application for the first time
- ✅ Generates secure credentials

**Usage:**
```bash
./install-production.sh
```

---

### 2. **`rebuild-production.sh`** - App Updates
**Use this script** whenever you need to rebuild the application (code changes, updates, etc.).

**What it does:**
- 🔨 Rebuilds the application container
- 🔄 Restarts all services
- ⏳ Waits for services to be ready
- 📊 Shows current status

**Usage:**
```bash
./rebuild-production.sh
```

---

## 🔄 **Typical Workflow for Updates**

```bash
# 1. Pull latest code
git pull

# 2. Rebuild and restart
./rebuild-production.sh
```

---

## 📋 **Current Production Status**

Check if everything is running:
```bash
docker-compose -f docker-compose.prod.yml ps
```

View logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🔒 **Security Features**

- ✅ **No Direct Access**: App only accessible through Nginx (ports 80/443)
- ✅ **Database Isolation**: PostgreSQL not exposed externally
- ✅ **Admin User**: Automatically created during setup
- ✅ **Rate Limiting**: API endpoints protected
- ✅ **Security Headers**: XSS protection, CSRF prevention

---

## 🌐 **Access Points**

- **Main Application**: http://localhost (via Nginx)
- **Health Check**: http://localhost/health
- **API Endpoints**: http://localhost/api/*

---

## 🚨 **Emergency Commands**

Stop all services:
```bash
docker-compose -f docker-compose.prod.yml down
```

Start services:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

---

## 📞 **Troubleshooting**

**App not responding:**
```bash
./rebuild-production.sh
```

**Database issues:**
```bash
docker-compose -f docker-compose.prod.yml logs db
```

**Nginx issues:**
```bash
docker-compose -f docker-compose.prod.yml logs nginx
```

---

## 🎯 **Remember**

- **Install script**: Use once for initial setup
- **Rebuild script**: Use for all updates and changes
- **Environment file**: Keep `.env.production` secure
- **Admin credentials**: Change default password after first login

Your production environment is now clean and focused! 🎉 