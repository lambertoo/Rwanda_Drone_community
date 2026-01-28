# Security Vulnerabilities Mitigation

## Node.js Security Releases - January 2026

This document outlines the security vulnerabilities addressed in this codebase based on the [Node.js Security Releases](https://nodejs.org/en/blog/vulnerability/december-2025-security-releases) from January 13, 2026.

## Addressed Vulnerabilities

### ✅ CVE-2025-55130 (High) - Bypass File System Permissions using crafted symlinks

**Status:** **MITIGATED**

**Description:**  
A flaw in Node.js's Permissions model allows attackers to bypass `--allow-fs-read` and `--allow-fs-write` restrictions using crafted relative symlink paths.

**Mitigation Implemented:**
1. Created `lib/path-security.ts` with comprehensive path validation utilities
2. All file operations now use `validateAndResolvePath()` to resolve symlinks
3. Path components are sanitized using `sanitizePathComponent()` before use
4. All upload paths are validated using `buildSecureUploadPath()` which:
   - Validates path components against whitelist
   - Resolves symlinks using `realpath()`
   - Ensures paths stay within allowed directories
   - Prevents directory traversal attacks

**Files Updated:**
- `lib/path-security.ts` (new) - Security utilities
- `app/api/upload/route.ts` - Secure file upload handling
- `lib/file-utils.ts` - Secure file organization
- `lib/actions.ts` - Secure file movement operations

**Code Example:**
```typescript
// Before (vulnerable):
const uploadDir = path.join(process.cwd(), 'public', 'uploads', type, entityId, subfolder)

// After (secure):
const uploadDir = await buildSecureUploadPath(type, entityId, subfolder)
// This function validates all components and resolves symlinks
```

### ✅ CVE-2025-55131 (High) - Timeout-based race conditions with Buffer.alloc

**Status:** **NOT APPLICABLE**

**Description:**  
Buffer allocation race conditions in `vm` module with timeout option.

**Assessment:**  
This codebase does not use the `vm` module, so this vulnerability does not apply.

### ✅ CVE-2025-59465 (High) - HTTP/2 server crashes

**Status:** **NOT APPLICABLE**

**Description:**  
Malformed HTTP/2 HEADERS frame causes server crashes.

**Assessment:**  
This application uses Next.js which handles HTTP/2 internally. Next.js 15.2.4 includes security patches. No direct HTTP/2 server code exists in this codebase.

### ✅ CVE-2025-59466 (Medium) - Uncatchable stack overflow with async_hooks

**Status:** **NOT APPLICABLE**

**Description:**  
"Maximum call stack size exceeded" errors become uncatchable when `async_hooks.createHook()` is enabled.

**Assessment:**  
This codebase does not use `async_hooks` or `AsyncLocalStorage`, so this vulnerability does not apply.

### ✅ CVE-2025-59464 (Medium) - TLS certificate memory leak

**Status:** **NOT APPLICABLE**

**Description:**  
Memory leak when processing TLS client certificates.

**Assessment:**  
This application does not directly process TLS client certificates using `socket.getPeerCertificate(true)`. TLS is handled by Next.js and the reverse proxy (Nginx).

### ✅ CVE-2026-21636 (Medium) - Permission model bypass via UDS

**Status:** **NOT APPLICABLE**

**Description:**  
Unix Domain Socket connections bypass network restrictions.

**Assessment:**  
This application does not use the Node.js permission model (`--permission` flag), so this vulnerability does not apply.

### ✅ CVE-2026-21637 (Medium) - TLS PSK/ALPN callback exceptions

**Status:** **NOT APPLICABLE**

**Description:**  
TLS server crashes when PSK or ALPN callbacks throw exceptions.

**Assessment:**  
This application does not use PSK or ALPN callbacks in TLS configuration.

### ✅ CVE-2025-55132 (Low) - fs.futimes() bypasses read-only permission

**Status:** **NOT APPLICABLE**

**Description:**  
`fs.futimes()` bypasses read-only permission model.

**Assessment:**  
This codebase does not use `fs.futimes()` and does not use the Node.js permission model.

## Node.js Version Requirements

**Minimum Required Version:** Node.js 20.20.0 or higher

This version includes fixes for all applicable vulnerabilities. The `package.json` has been updated with engine requirements:

```json
"engines": {
  "node": ">=20.20.0",
  "npm": ">=10.0.0"
}
```

## Deployment Recommendations

### 1. Update Node.js Before Deployment

```bash
# Check current Node.js version
node --version

# Update to Node.js 20.20.0 or higher
# Using nvm:
nvm install 20.20.0
nvm use 20.20.0

# Or download from https://nodejs.org/
```

### 2. Verify Security Fixes

After deployment, verify that:
- File uploads are restricted to allowed directories
- Path traversal attempts are blocked
- Symlink attacks are prevented

### 3. Security Testing

Test the following scenarios:
```bash
# Attempt path traversal in entityId
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.jpg" \
  -F "entityId=../../../etc/passwd"

# Attempt symlink attack (should be blocked)
# Create a symlink and try to access it via upload

# All should return 400 Bad Request with appropriate error messages
```

## Additional Security Measures

### Path Validation
- All user-provided path components are sanitized
- Paths are validated against whitelist
- Symlinks are resolved before file operations
- Directory traversal patterns are blocked

### File Upload Security
- File types are validated against whitelist
- File sizes are limited
- Filenames are sanitized
- Upload directories are restricted

### Error Handling
- Security-related errors don't expose internal details
- Path validation errors are logged but not exposed to clients
- Failed operations return generic error messages

## Monitoring

Monitor for:
- Failed file upload attempts with suspicious paths
- Path traversal attempts in logs
- Symlink-related errors
- Unusual file system access patterns

## References

- [Node.js Security Releases - January 13, 2026](https://nodejs.org/en/blog/vulnerability/december-2025-security-releases)
- [CVE-2025-55130 Details](https://nodejs.org/en/blog/vulnerability/december-2025-security-releases#bypass-file-system-permissions-using-crafted-symlinks-cve-2025-55130---high)
- [Node.js Security Policy](https://nodejs.org/en/security/)

## Last Updated

January 28, 2026
