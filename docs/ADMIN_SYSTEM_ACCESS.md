# Admin System Management Access

## Hidden Admin URL

The system backup and restore functionality is accessible through a hidden URL that is not discoverable through normal navigation. This provides an additional layer of security.

### Access URL
```
/admin/sys-9x7k2m8n4p
```

### Security Features
- **Hidden Route**: Not linked anywhere in the application UI
- **Admin Only**: Requires admin role authentication
- **JWT Protected**: Uses existing JWT authentication system
- **Non-Guessable**: Random URL pattern prevents unauthorized access attempts

### How to Access
1. Ensure you are logged in as an admin user
2. Type the URL directly in your browser: `/admin/sys-9x7k2m8n4p`
3. The system will verify your admin status before allowing access

### Available Operations
- **Database Backup**: Create complete database backups (.sql files)
- **Database Restore**: Restore database from backup files
- **System Status**: View current system status and access level

### Security Notes
- Access is logged and monitored
- Only users with admin role can access this interface
- The URL is intentionally non-discoverable
- All operations require proper authentication

### Alternative Access
If you need to change the URL pattern, update the `hiddenAdminRoutes` array in `middleware.ts` and rename the corresponding page file.

## Backup and Restore API Endpoints

The hidden interface uses the existing API endpoints:
- `POST /api/admin/backup` - Create database backup
- `POST /api/admin/restore` - Restore database from backup

These endpoints are already protected with admin authentication middleware.
