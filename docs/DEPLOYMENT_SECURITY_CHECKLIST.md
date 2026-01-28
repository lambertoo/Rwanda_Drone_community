# Deployment Security Checklist

## Pre-Deployment Security Verification

Before deploying to `root@172.239.238.32`, ensure all security measures are in place.

### ✅ Node.js Version Check

**Required:** Node.js 20.20.0 or higher (includes security fixes)

```bash
# On deployment server, verify Node.js version
node --version
# Should show: v20.20.0 or higher

# If not, update Node.js:
# Using nvm:
nvm install 20.20.0
nvm use 20.20.0

# Or download from https://nodejs.org/
```

### ✅ Security Vulnerabilities Addressed

All applicable Node.js security vulnerabilities have been mitigated:

- ✅ **CVE-2025-55130** (High) - Symlink bypass: **MITIGATED**
  - Path validation implemented
  - Symlink resolution in place
  - Directory traversal protection active

- ✅ Other CVEs: **NOT APPLICABLE** (codebase doesn't use affected features)

See [SECURITY_VULNERABILITIES.md](./SECURITY_VULNERABILITIES.md) for details.

### ✅ Code Security Features

- [x] Path traversal protection in file uploads
- [x] Symlink attack prevention
- [x] Filename sanitization
- [x] Path component validation
- [x] Secure file path building utilities
- [x] Error handling that doesn't expose internals

### ✅ Environment Security

Before deployment, ensure:

```bash
# 1. Environment file has restricted permissions
chmod 600 .env.production

# 2. Strong secrets are set
# - NEXTAUTH_SECRET: 32+ character random string
# - DATABASE_URL: Secure PostgreSQL connection
# - All passwords are strong and unique

# 3. Database user has minimal required permissions
# - Only access to rwanda_drone_community database
# - No superuser privileges
```

### ✅ File System Security

```bash
# 1. Upload directory permissions
chmod 755 public/uploads
chmod 700 public/uploads/*/  # Individual entity directories

# 2. Application runs as non-root user (recommended)
# Create dedicated user:
sudo useradd -r -s /bin/false rwanda-drone
sudo chown -R rwanda-drone:rwanda-drone /path/to/app
```

### ✅ Network Security

- [ ] Firewall configured (only allow ports 22, 80, 443)
- [ ] SSH key authentication enabled (disable password auth)
- [ ] Database not exposed externally (bind to localhost)
- [ ] SSL/TLS certificates configured
- [ ] Nginx reverse proxy configured with security headers

### ✅ Process Management

```bash
# Use PM2 or systemd to manage the application
# PM2 example:
pm2 start npm --name "rwanda-drone-platform" -- start
pm2 save
pm2 startup
```

## Deployment Steps

### 1. Pre-Deployment Verification

```bash
# On local machine, verify:
git status  # Check for uncommitted changes
npm run build  # Verify build succeeds
npm run lint  # Check for linting errors
```

### 2. Transfer Files Securely

```bash
# Use rsync with SSH
rsync -avz --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.env*' \
  ./ root@172.239.238.32:/var/www/rwanda-drone-platform/
```

### 3. Server Setup

```bash
# SSH into server
ssh root@172.239.238.32

# Navigate to application directory
cd /var/www/rwanda-drone-platform

# Install dependencies
npm install --production

# Generate Prisma client
npm run db:generate

# Build application
npm run build

# Run migrations
npx prisma migrate deploy
```

### 4. Environment Configuration

```bash
# Copy environment template
cp production.env.template .env.production

# Edit with secure values
nano .env.production

# Secure the file
chmod 600 .env.production
```

### 5. Start Application

```bash
# Using PM2
npm install -g pm2
pm2 start npm --name "rwanda-drone-platform" -- start
pm2 save
pm2 startup
```

### 6. Post-Deployment Verification

```bash
# Check application is running
curl http://localhost:3000/api/health

# Check PM2 status
pm2 status

# View logs
pm2 logs rwanda-drone-platform

# Test file upload security
# Attempt path traversal (should fail):
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.jpg" \
  -F "entityId=../../../etc/passwd"
# Should return 400 Bad Request
```

## Security Monitoring

After deployment, monitor:

1. **Application Logs**
   ```bash
   pm2 logs rwanda-drone-platform | grep -i "traversal\|symlink\|invalid"
   ```

2. **Failed Upload Attempts**
   - Monitor for suspicious path patterns
   - Check for repeated failed uploads

3. **System Resources**
   ```bash
   # Monitor memory usage
   pm2 monit
   
   # Check disk space
   df -h
   ```

4. **Database Access**
   - Monitor database connection logs
   - Check for unusual query patterns

## Incident Response

If security issues are detected:

1. **Immediate Actions:**
   - Review application logs
   - Check for unauthorized file access
   - Verify file system integrity
   - Review database access logs

2. **Containment:**
   - Temporarily disable file uploads if needed
   - Review and rotate secrets if compromised
   - Check for unauthorized changes

3. **Recovery:**
   - Restore from backup if needed
   - Update security measures
   - Review and strengthen access controls

## Maintenance

### Regular Security Updates

- [ ] Keep Node.js updated to latest LTS version
- [ ] Monitor Node.js security advisories
- [ ] Update dependencies regularly: `npm audit fix`
- [ ] Review and update security measures quarterly

### Backup Strategy

```bash
# Database backups (daily)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Application backups (weekly)
tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/rwanda-drone-platform
```

## References

- [SECURITY_VULNERABILITIES.md](./SECURITY_VULNERABILITIES.md) - Detailed vulnerability information
- [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) - General deployment guide
- [Node.js Security Releases](https://nodejs.org/en/blog/vulnerability/december-2025-security-releases)

---

**Last Updated:** January 28, 2026  
**Status:** ✅ Ready for Deployment
