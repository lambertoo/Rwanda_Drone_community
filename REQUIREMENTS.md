# Rwanda Drone Community Platform - Requirements Checklist

## 🐳 Docker Requirements

### Prerequisites
- [ ] Docker Desktop installed and running
- [ ] Docker Compose available
- [ ] At least 4GB RAM available for Docker
- [ ] At least 10GB free disk space

### Docker Commands
```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Check Docker daemon status
docker info
```

## 📦 Node.js Requirements

### Prerequisites
- [ ] Node.js 18.x or higher installed
- [ ] pnpm package manager available
- [ ] npm available as fallback

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

## 🔧 Build Requirements

### Required Files
- [ ] `package.json` - Node.js dependencies
- [ ] `pnpm-lock.yaml` - Locked dependency versions
- [ ] `Dockerfile` - Container build instructions
- [ ] `docker-compose.prod.yml` - Service orchestration
- [ ] `prisma/schema.prisma` - Database schema
- [ ] `next.config.mjs` - Next.js configuration
- [ ] `tsconfig.json` - TypeScript configuration

### Environment Variables
- [ ] `JWT_SECRET` - 32+ character secret for JWT tokens
- [ ] `SESSION_SECRET` - 32+ character secret for sessions
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NODE_ENV` - Set to "production"

## 🗄️ Database Requirements

### PostgreSQL
- [ ] PostgreSQL 15.x or higher
- [ ] Database: `rwanda_drone_community`
- [ ] User: `postgres` (or custom user)
- [ ] Password: `password` (or custom password)
- [ ] Port: `5432` (internal), `5433` (external)

### Prisma
- [ ] Schema file exists and is valid
- [ ] Client can be generated
- [ ] Migrations can be applied
- [ ] Seed script is functional

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
1. [ ] Docker Desktop is running
2. [ ] All required files are present
3. [ ] Node.js dependencies are installed
4. [ ] Prisma schema is valid
5. [ ] Environment variables are set
6. [ ] Ports 3000 and 5433 are available

### Build Process
1. [ ] Prerequisites check passes
2. [ ] Docker image builds successfully
3. [ ] Services start without errors
4. [ ] Database becomes healthy
5. [ ] Application becomes ready
6. [ ] Health checks pass
7. [ ] Database seeding completes

## 🧪 Post-Build Verification

### Health Checks
- [ ] Database connectivity test passes
- [ ] Application health endpoint responds
- [ ] Login endpoint is functional
- [ ] All services show "Up" status

### Functionality Tests
- [ ] Can access homepage
- [ ] Can navigate between pages
- [ ] Database contains seeded data
- [ ] Authentication system works
- [ ] File uploads function (if applicable)

## 🚨 Common Issues & Solutions

### Build Failures
- **Missing dependencies**: Run `pnpm install` or `npm install`
- **Prisma errors**: Run `npx prisma generate` and `npx prisma validate`
- **Port conflicts**: Stop other services using ports 3000 or 5433
- **Docker issues**: Restart Docker Desktop and clear Docker cache

### Runtime Issues
- **Database connection**: Check PostgreSQL is running and accessible
- **Environment variables**: Ensure all required vars are set in docker-compose
- **Permission issues**: Check file permissions and Docker user settings
- **Memory issues**: Increase Docker memory allocation

## 📚 Additional Resources

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Support
- Check application logs: `docker-compose -f docker-compose.prod.yml logs -f`
- Check container status: `docker-compose -f docker-compose.prod.yml ps`
- Restart services: `docker-compose -f docker-compose.prod.yml restart`
- Full rebuild: Run `./build-and-deploy.sh` script 