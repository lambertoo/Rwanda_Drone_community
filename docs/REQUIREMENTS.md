# Rwanda Drone Community Platform - Requirements Checklist

## 📦 Node.js Requirements

### Prerequisites
- [ ] Node.js 18.x or higher installed
- [ ] pnpm package manager available (npm as fallback)
- [ ] At least 4GB RAM available
- [ ] At least 10GB free disk space

### Node.js Commands
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check pnpm version
pnpm --version

# Install pnpm if not available
npm install -g pnpm
```

## 🗄️ Database Requirements

### PostgreSQL
- [ ] PostgreSQL 15.x or higher installed and running
- [ ] Database: `rwanda_drone_community` created
- [ ] User: `postgres` (or custom user) with proper permissions
- [ ] Password: Secure password configured
- [ ] Port: `5432` (default PostgreSQL port)
- [ ] Database accessible from application server

### Prisma
- [ ] Schema file exists and is valid
- [ ] Client can be generated
- [ ] Migrations can be applied
- [ ] Seed script is functional

### Database Setup Commands
```bash
# Create database (if not exists)
createdb rwanda_drone_community

# Or using psql
psql -U postgres -c "CREATE DATABASE rwanda_drone_community;"

# Test connection
psql -U postgres -d rwanda_drone_community -c "SELECT 1;"
```

## 🔧 Build Requirements

### Required Files
- [ ] `package.json` - Node.js dependencies
- [ ] `pnpm-lock.yaml` or `package-lock.json` - Locked dependency versions
- [ ] `prisma/schema.prisma` - Database schema
- [ ] `next.config.mjs` - Next.js configuration
- [ ] `tsconfig.json` - TypeScript configuration

### Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/rwanda_drone_community`)
- [ ] `NEXTAUTH_SECRET` - 32+ character secret for NextAuth sessions
- [ ] `NEXTAUTH_URL` - Your application URL (e.g., `https://yourdomain.com`)
- [ ] `NODE_ENV` - Set to "production" for production deployments
- [ ] `PORT` - Port number (default: 3000)
- [ ] `CORS_ORIGIN` - Allowed CORS origin (your domain)

## 🚀 Application Requirements

### Next.js
- [ ] Version 15.x or higher
- [ ] Production build succeeds
- [ ] Static assets are generated
- [ ] API routes are functional

### Dependencies
- [ ] All required packages installed
- [ ] No version conflicts
- [ ] TypeScript compilation succeeds
- [ ] Build process completes without errors

## 📋 Pre-Build Checklist

### Before Running Build Script
1. [ ] Node.js 18+ is installed
2. [ ] PostgreSQL is installed and running
3. [ ] Database is created and accessible
4. [ ] All required files are present
5. [ ] Node.js dependencies are installed
6. [ ] Prisma schema is valid
7. [ ] Environment variables are set in `.env.production`
8. [ ] Port 3000 (or configured PORT) is available

### Build Process
1. [ ] Prerequisites check passes
2. [ ] Dependencies install successfully
3. [ ] Prisma client generates successfully
4. [ ] Application builds without errors
5. [ ] Database migrations apply successfully
6. [ ] Application starts and responds to requests

## 🧪 Post-Build Verification

### Health Checks
- [ ] Database connectivity test passes
- [ ] Application health endpoint responds
- [ ] Login endpoint is functional
- [ ] Application process is running

### Functionality Tests
- [ ] Can access homepage
- [ ] Can navigate between pages
- [ ] Database contains seeded data (if seeded)
- [ ] Authentication system works
- [ ] File uploads function (if applicable)

## 🚨 Common Issues & Solutions

### Build Failures
- **Missing dependencies**: Run `pnpm install` or `npm install`
- **Prisma errors**: Run `npx prisma generate` and `npx prisma validate`
- **Port conflicts**: Stop other services using port 3000 or change PORT in .env
- **Database connection**: Ensure PostgreSQL is running and DATABASE_URL is correct

### Runtime Issues
- **Database connection**: Check PostgreSQL is running and accessible
- **Environment variables**: Ensure all required vars are set in .env.production
- **Permission issues**: Check file permissions for uploads directory
- **Memory issues**: Ensure server has sufficient RAM (4GB+ recommended)

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PM2 Process Manager](https://pm2.keymetrics.io/docs/)

### Support
- Check application logs: Check your process manager logs (PM2, systemd, etc.)
- Check application status: `pm2 status` (if using PM2)
- Restart application: Restart your process manager service
- Full rebuild: Run `./scripts/rebuild-production.sh` script
