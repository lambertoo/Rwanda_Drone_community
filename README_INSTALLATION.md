# One-Click Production Installation

## 🚀 Quick Start

**For Server Installation (Linux/macOS):**

```bash
# Download the installation script
curl -fsSL https://raw.githubusercontent.com/yourusername/rwanda_drone_community_platform/main/install-production.sh -o install-production.sh

# Make it executable
chmod +x install-production.sh

# Run the installation
./install-production.sh
```

**Or if you have the files locally:**

```bash
# Make executable and run
chmod +x install-production.sh
./install-production.sh
```

## 📋 What the Script Does Automatically

1. **System Check** - Verifies OS, memory, disk space
2. **Docker Installation** - Installs Docker and Docker Compose
3. **Project Setup** - Creates project directory and downloads configuration files
4. **Environment Configuration** - Sets up secure environment variables
5. **Source Code Check** - Uses existing code or downloads from Git repository
6. **Build & Deploy** - Builds Docker images and starts services
7. **Health Monitoring** - Waits for all services to be ready
8. **Database Setup** - Runs migrations and initializes database

## 🔧 Prerequisites

- **Server**: Linux (Ubuntu/CentOS) or macOS
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Disk**: Minimum 10GB free space
- **Network**: Internet access for downloads
- **User**: Non-root user with sudo privileges
- **Code**: Your application code (already pulled or will be downloaded)

## 📝 During Installation

The script will ask you for:
- **Project Directory**: Where to install (default: `/opt/rwanda-drone-platform`)
- **Domain**: Your domain name or localhost
- **Git Repository**: Only if you don't have existing code (can skip if code is present)

## 🎯 After Installation

Your application will be available at:
- **Web App**: `http://your-domain` or `http://localhost`
- **API**: `http://your-domain/api`
- **Health Check**: `http://your-domain/health`

## 🔑 Generated Credentials

The script automatically generates:
- **Database Password**: Secure random password
- **NEXTAUTH_SECRET**: Secure authentication secret

**⚠️ Save these credentials securely!**

## 🛠️ Management Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update application
git pull && docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔍 Troubleshooting

### Common Issues

**Permission Denied:**
```bash
chmod +x install-production.sh
```

**Docker Not Found:**
```bash
# The script will install Docker automatically
# If it fails, install manually:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

**Port Already in Use:**
```bash
# Check what's using the port
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3000
```

### View Logs
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs app

# Database logs
docker-compose -f docker-compose.prod.yml logs db

# Nginx logs
docker-compose -f docker-compose.prod.yml logs nginx
```

## 🔒 Security Notes

- The script generates secure random passwords
- Services run in isolated Docker containers
- Nginx includes security headers and rate limiting
- Database is not exposed to external connections by default

## 📞 Support

If installation fails:
1. Check the error messages
2. Verify system requirements
3. Check Docker and Docker Compose installation
4. Review the logs for specific errors

## 🎉 Success!

Once installation completes, you'll see:
- ✅ All services running
- 🔑 Secure credentials displayed
- 📋 Management commands listed
- 🌐 Your application accessible

Your Rwanda Drone Community Platform is now live in production! 🚀 